import type { DBTable, DBTables, MDBField, MDBSchema, MDBTable } from 'types/mdb';

export const defaultFileDBSchema: MDBSchema = {
    id: 'files',
    name: 'Files',
    type: 'db',
    primary: 'true',
};

export const defaultFileListSchema: MDBSchema = {
    id: 'filesView',
    name: 'Files',
    type: 'list',
    def: 'files',
};

export const defaultFileTableSchema: MDBSchema = {
    id: 'filesView',
    name: 'Files',
    type: 'table',
    def: 'files',
};

export const defaultFolderSchema: DBTable = {
    uniques: ['id'],
    cols: ['id', 'name', 'type', 'def', 'predicate', 'primary'],
    rows: [defaultFileDBSchema, defaultFileListSchema] as MDBSchema[],
};

export const defaultTagSchema: DBTable = {
    uniques: ['id'],
    cols: ['id', 'name', 'type', 'def', 'predicate', 'primary'],
    rows: [defaultFileDBSchema, defaultFileTableSchema] as MDBSchema[],
};

export const fieldSchema = {
    uniques: ['name,schemaId'],
    cols: ['name', 'schemaId', 'type', 'value', 'attrs', 'hidden', 'unique', 'primary'],
};

export const defaultTagFields: DBTable = {
    ...fieldSchema,
    rows: [
        {
            name: '_id',
            schemaId: 'files',
            type: 'id',
            unique: 'true',
            hidden: 'true',
        },
        {
            name: '_source',
            schemaId: 'files',
            type: 'source',
            hidden: 'true',
        },
        {
            name: '_sourceId',
            schemaId: 'files',
            type: 'sourceid',
            hidden: 'true',
        },
        {
            name: 'File',
            schemaId: 'files',
            type: 'file',
            primary: 'true',
        },
    ],
};

export const defaultTagMDBTable: MDBTable = {
    schema: defaultFileDBSchema,
    cols: defaultTagFields.rows as MDBField[],
    rows: [],
};

export const fieldsToTable = (fields: MDBField[], schemas: MDBSchema[]): DBTables => {
    return fields
        .filter(s => schemas.find(g => g.id == s.schemaId && g.type == 'db'))
        .reduce<DBTables>((p, c) => {
            return {
                ...p,
                ...(p[c.schemaId]
                    ? {
                          [c.schemaId]: {
                              uniques: c.unique == 'true' ? [...p[c.schemaId].uniques, c.name] : p[c.schemaId].uniques,
                              cols: [...p[c.schemaId].cols, c.name],
                              rows: [],
                          },
                      }
                    : {
                          [c.schemaId]: {
                              uniques: c.unique == 'true' ? [c.name] : [],
                              cols: [c.name],
                              rows: [],
                          },
                      }),
            };
        }, {});
};

export const defaultTagTables = {
    m_schema: defaultTagSchema,
    m_fields: defaultTagFields,
    ...fieldsToTable(defaultTagFields.rows as MDBField[], defaultTagSchema.rows as MDBSchema[]),
};
