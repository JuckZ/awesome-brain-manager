import initSqlJs from 'sql.js';
// @ts-ignore
import sqlWasm from './sqljs/sql-wasm.wasm?url';

export const loadSQL = async () => {
    const sql = await initSqlJs({
        // wasmBinary: sqlWasm,
        locateFile: () => sqlWasm
    });
    return sql;
};
