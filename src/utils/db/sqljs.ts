import initSqlJs from 'sql.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import sqlWasm from './sqljs/sql-wasm.wasm?url';

export const loadSQL = async () => {
    const sql = await initSqlJs({
        // wasmBinary: sqlWasm,
        locateFile: () => sqlWasm,
    });
    return sql;
};
