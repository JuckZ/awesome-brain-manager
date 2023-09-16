// https://github.com/Make-md/makemd/blob/main/src/utils/db/db.ts
import { App, FileSystemAdapter, normalizePath } from 'obsidian';
import type { Database, QueryExecResult, SqlJsStatic } from 'sql.js';
import { pomodoroDB } from '@/utils/constants';
import { LoggerUtil } from '@/utils/logger';
import { treeUtil } from '@/utils/common';
import { sanitizeSQLStatement } from '@/utils/sanitize';
import { loadSQL } from '@/utils/db/sqljs';
import { eventTypes } from '@/types/types';
import type { DBTable, DBTables } from '@/types/mdb';
import { type Pomodoro, pomodoroSchema } from '@/schemas/spaces';
import type AwesomeBrainManagerPlugin from '@/main';

const { uniq } = treeUtil;

export class DBUtils {
    private plugin: AwesomeBrainManagerPlugin;
    private app: App;
    awesomeBrainDB: Database;
    awesomeBrainDBPath: string;
    initedCallback: any;

    async init(plugin: AwesomeBrainManagerPlugin, initedCallback) {
        this.plugin = plugin;
        this.app = plugin.app;
        this.initedCallback = initedCallback;

        const callback = () => {
            const tables = this.dbResultsToDBTables(
                this.awesomeBrainDB.exec(
                    "SELECT name FROM sqlite_schema WHERE type ='table' AND name NOT LIKE 'sqlite_%';",
                ),
            );
            if (tables.length == 0) {
                this.initiateDB(this.awesomeBrainDB);
            }
            this.initedCallback();
        };
        window.addEventListener(eventTypes.dbInited, callback);
        this.awesomeBrainDBPath = normalizePath(
            this.app.vault.configDir + '/plugins/awesome-brain-manager/ObsidianManager.mdb',
        );
        this.sqlJS().then(sqljs => {
            this.getDB(sqljs, this.awesomeBrainDBPath).then(db => {
                this.awesomeBrainDB = db;
                const eve = new CustomEvent(eventTypes.dbInited, {
                    detail: {
                        db: 'awesomeBrainDB',
                    },
                });
                window.dispatchEvent(eve);
            });
        });

        this.plugin.register(() => window.removeEventListener(eventTypes.dbInited, callback));
    }

    initiateDB(db: Database) {
        this.replaceDB(db, {
            pomodoro: pomodoroSchema,
        });
    }

    getDBFile = async (path: string) => {
        if (!(await this.app.vault.adapter.exists(normalizePath(path)))) {
            return null;
        }
        const file = await (this.app.vault.adapter as FileSystemAdapter).readBinary(normalizePath(path));
        return file;
    };

    async sqlJS() {
        // LoggerUtil.time("Loading SQlite");
        const sqljs = await loadSQL();
        // LoggerUtil.timeEnd("Loading SQlite");
        return sqljs;
    }

    getDB = async (sqlJS: SqlJsStatic, path: string) => {
        const buf = await this.getDBFile(path);
        if (buf) {
            return new sqlJS.Database(new Uint8Array(buf));
        }
        return new sqlJS.Database();
    };

    saveDBAndKeepAlive = (db: Database, path: string) => {
        const results = this.saveDBFile(path, db.export().buffer);
        return results;
    };

    saveAndCloseDB = async (db: Database, path: string) => {
        await this.saveDBFile(path, db.export().buffer);
        db.close();
    };

    saveDBFile = async (path: string, binary: ArrayBuffer) => {
        const file = (this.app.vault.adapter as FileSystemAdapter).writeBinary(normalizePath(path), binary);
        return file;
    };

    getAllTables = async (sqlJS: SqlJsStatic, path: string): Promise<string[]> => {
        const db = await this.getDB(sqlJS, path);
        let tables;
        try {
            tables = db.exec("SELECT name FROM sqlite_schema WHERE type ='table' AND name NOT LIKE 'sqlite_%';");
        } catch (e) {
            LoggerUtil.log(e);
            return [];
        }
        const tableNames: string[] = tables[0].values.map(a => a[0]) as string[];
        db.close();
        return tableNames;
    };

    dbResultsToDBTables = (res: QueryExecResult[]): DBTable[] => {
        return res.reduce(
            (p, c, i) => [
                ...p,
                {
                    cols: c.columns,
                    rows: c
                        ? c.values.map(r =>
                              c.columns.reduce((prev, curr, index) => ({ ...prev, [curr]: r[index] }), {}),
                          )
                        : [],
                },
            ],
            [],
        ) as DBTable[];
    };

    updateDBConditionally = (db: Database, tables: DBTables, condition: string) => {
        const sqlstr = Object.keys(tables)
            .map(t => {
                const tableFields = tables[t].cols;
                const rowsQuery = tables[t].rows.reduce((prev, curr) => {
                    // eslint-disable-next-line no-useless-escape
                    return `${prev}\ UPDATE "${t}" SET ${tableFields
                        .map(c => `${c}='${sanitizeSQLStatement(curr?.[c]) ?? ''}'`)
                        .join(', ')} WHERE ${condition};`;
                }, '');
                return rowsQuery;
            })
            .join('; ');
        // Run the query without returning anything
        try {
            db.exec(sqlstr);
        } catch (e) {
            LoggerUtil.log(e);
        }
    };

    selectDB = (db: Database, table: string, condition?: string, fields?: string): DBTable | null => {
        const fieldsStr = fields ?? '*';
        const sqlstr = condition
            ? `SELECT ${fieldsStr} FROM "${table}" WHERE ${condition};`
            : `SELECT ${fieldsStr} FROM ${table};`;
        let tables;
        try {
            tables = this.dbResultsToDBTables(db.exec(sqlstr)); // Run the query without returning anything
        } catch (e) {
            return null;
        }
        if (tables.length == 1) return tables[0];
        return null;
    };

    updateDB = (db: Database, tables: DBTables, updateCol: string, updateRef: string) => {
        const sqlstr = Object.keys(tables)
            .map(t => {
                const tableFields = tables[t].cols.filter(f => f != updateRef);
                const rowsQuery = tables[t].rows.reduce((prev, curr) => {
                    // eslint-disable-next-line no-useless-escape
                    return `${prev}\ UPDATE "${t}" SET ${tableFields
                        .map(c => `${c}='${sanitizeSQLStatement(curr?.[c]) ?? ''}'`)
                        .join(', ')} WHERE ${updateCol}='${sanitizeSQLStatement(curr?.[updateRef]) ?? ''}';`;
                }, '');
                return rowsQuery;
            })
            .join('; ');
        try {
            db.exec(sqlstr);
        } catch (e) {
            LoggerUtil.log(e);
        }
    };

    execQuery = (db: Database, sqlstr: string) => {
        //Fastest, but doesn't handle errors
        // Run the query without returning anything
        try {
            db.exec(sqlstr);
        } catch (e) {
            LoggerUtil.log(e);
        }
    };

    deleteFromDB = (db: Database, table: string, condition: string) => {
        const sqlstr = `DELETE FROM "${table}" WHERE ${condition};`;
        // Run the query without returning anything
        try {
            db.exec(sqlstr);
        } catch (e) {
            LoggerUtil.log(e);
        }
    };

    dropTable = (db: Database, table: string) => {
        const sqlstr = `DROP TABLE IF EXISTS "${table}";`;
        // Run the query without returning anything
        try {
            db.exec(sqlstr);
        } catch (e) {
            LoggerUtil.log(e);
        }
    };

    insertIntoDB = (db: Database, tables: DBTables) => {
        const sqlstr = Object.keys(tables)
            .map(t => {
                const tableFields = tables[t].cols;
                const rowsQuery = tables[t].rows.reduce((prev, curr) => {
                    // eslint-disable-next-line no-useless-escape
                    return `${prev}\ INSERT INTO "${t}" VALUES (${tableFields
                        .map(c => `'${sanitizeSQLStatement(curr?.[c]) ?? ''}'`)
                        .join(', ')});`;
                }, '');
                return rowsQuery;
            })
            .join('; ');
        try {
            db.exec(`BEGIN TRANSACTION; ${sqlstr} COMMIT;`);
        } catch (e) {
            LoggerUtil.log(e);
        }
    };

    replaceDB = (db: Database, tables: DBTables) => {
        //rewrite the entire table, useful for storing ranks and col order, not good for performance
        const sqlstr = Object.keys(tables)
            .map(t => {
                const tableFields = tables[t].cols;
                const fieldQuery = uniq(tableFields)
                    .map(f => `'${sanitizeSQLStatement(f)}' char`)
                    .join(', ');
                const rowsQuery = tables[t].rows.reduce((prev, curr) => {
                    // eslint-disable-next-line no-useless-escape
                    return `${prev}\ REPLACE INTO "${t}" VALUES (${tableFields
                        .map(c => `'${sanitizeSQLStatement(curr?.[c]) ?? ''}'`)
                        .join(', ')});`;
                }, '');
                const idxQuery = tables[t].uniques
                    .filter(f => f)
                    .reduce((p, c) => {
                        // eslint-disable-next-line no-useless-escape
                        return `${p}\ CREATE UNIQUE INDEX IF NOT EXISTS idx_${t}_${c.replace(
                            /,/g,
                            '_',
                        )} ON ${t}(${c});`;
                    }, '');
                const insertQuery = `CREATE TABLE IF NOT EXISTS "${t}" (${fieldQuery}); ${idxQuery} BEGIN TRANSACTION; ${rowsQuery} COMMIT;`;
                return `DROP TABLE IF EXISTS "${t}"; ${fieldQuery.length > 0 ? insertQuery : ''}`;
            })
            .join('; ');
        // Run the query without returning anything
        try {
            db.exec(sqlstr);
        } catch (e) {
            LoggerUtil.log(e);
        }
    };

    saveDBToPath = async (plugin: AwesomeBrainManagerPlugin, path: string, tables: DBTables): Promise<boolean> => {
        const sqlJS = await this.sqlJS();
        //rewrite the entire table, useful for storing ranks and col order, not good for performance
        const db = await this.getDB(sqlJS, path);
        this.replaceDB(db, tables);
        await this.saveDBFile(path, db.export().buffer);
        db.close();
        return true;
    };

    addPomodoro(pomodoro: Pomodoro) {
        this.insertIntoDB(this.awesomeBrainDB, {
            pomodoro: {
                uniques: pomodoroSchema.uniques,
                cols: pomodoroSchema.cols,
                rows: [pomodoro],
            },
        });
        this.saveDBAndKeepAlive(this.awesomeBrainDB, this.awesomeBrainDBPath);
    }

    deletePomodoro(pomodoro: Pomodoro) {
        this.deleteFromDB(this.awesomeBrainDB, pomodoroDB, `timestamp = ${pomodoro.timestamp}`);
        this.saveDBAndKeepAlive(this.awesomeBrainDB, this.awesomeBrainDBPath);
    }

    updatePomodoro(pomodoro: Pomodoro) {
        this.updateDBConditionally(
            this.awesomeBrainDB,
            {
                pomodoro: {
                    uniques: pomodoroSchema.uniques,
                    cols: pomodoroSchema.cols,
                    rows: [pomodoro],
                },
            },
            `timestamp = ${pomodoro.timestamp}`,
        );
        this.saveDBAndKeepAlive(this.awesomeBrainDB, this.awesomeBrainDBPath);
    }

    async loadPomodoroData() {
        const dbRows = (await this.selectDB(this.awesomeBrainDB, pomodoroDB)?.rows) || [];
        return dbRows as Pomodoro[];
    }
}

export const DBUtil = new DBUtils();
