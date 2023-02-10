//handles db ops

import { eventTypes } from 'types/types';

export const dispatchDatabaseFileChanged = (dbPath: string, tag?: string) => {
    const evt = new CustomEvent(eventTypes.mdbChange, { detail: { dbPath, tag } });
    window.dispatchEvent(evt);
};
