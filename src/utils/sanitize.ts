// https://github.com/Make-md/makemd/blob/main/src/utils/sanitize.ts
export const sanitizeTableName = (name: string) => {
    return name?.replace(/[^a-z0-9+]+/gi, '');
};
export const sanitizeColumnName = (name: string) => {
    return name?.replace(/'/g, "''").replace(/[^\w ]/g, '');
};

const illegalRe = /[\/\?<>\\:\*\|":]/g;
const controlRe = /[\x00-\x1f\x80-\x9f]/g;
const reservedRe = /^\.+$/;
const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;

export const sanitizeFileName = (name: string) => {
    const replacement = '';
    return name
        .replace(illegalRe, replacement)
        .replace(controlRe, replacement)
        .replace(reservedRe, replacement)
        .replace(windowsReservedRe, replacement);
};

export const sanitizeSQLStatement = (name: string) => {
    return name?.replace(/'/g, "''");
};
