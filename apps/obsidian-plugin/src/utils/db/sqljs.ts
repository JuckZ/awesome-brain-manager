import initSqlJs from 'sql.js';
import sqlWasm from 'sql.js/dist/sql-wasm.wasm?url';

export const loadSQL = async () => {
    const sql = await initSqlJs({
        // wasmBinary: sqlWasm,
        locateFile: () => sqlWasm,
    });
    return sql;
};
