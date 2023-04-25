import { DateTime } from 'luxon';
import { type STask } from 'obsidian-dataview';
import { Vault } from 'obsidian';
// export function getTaskByTags(tags: string[], taskList: STask[]): STask | undefined {
//     return taskList.find(task => {
//         const taskTags = task.tags.map(tag => tag.tag);
//         return tags.every(tag => taskTags.includes(tag));
//     });
// }

export const queryImportantTasks = `task
WHERE contains(tags, "#important") and !completed
SORT priority asc, date desc`;
export const listTasks = `task
WHERE contains(tags, "#important")
SORT priority asc, date desc`;
/**重要任务 */
export const importantTasks = `task
WHERE contains(tags, "#important") and !completed
SORT priority asc, date desc`;
/**聚焦任务 */
export const concentrateTasks = `task
WHERE !completed and (contains(tags, "#inprogress") or ((due and due <= date(today))) or (schedule and schedule <= date(today) or status = "open"))
sort priority, scheduled, due, heading desc`;
// export const listTasks = `LIST WHERE file.day
// SORT file.day DESC`;
// TODO
export const queryAll = `function overdue(t) {
    let dValidate = moment(t.text, 'YYYY-MM-DD', true);
    let d = moment(t.text, 'YYYY-MM-DD');
    let containsValidDate = dValidate._pf.unusedTokens.length==0 ;
    let isOverdue = d.diff(moment()) <= 0;
    return (containsValidDate && isOverdue);
  }
  
  dv.taskList(dv.pages("").file.tasks
      .where (t => overdue(t))
      .where (t => !t.completed))`;

/** Trim empty ending lines. */
function trimEndingLines(text: string): string {
    const parts = text.split(/\r?\n/u);
    let trim = parts.length - 1;
    while (trim > 0 && parts[trim].trim() == '') trim--;

    return parts.join('\n');
}

/** Sets or replaces the value of an inline field; if the value is 'undefined', deletes the key. */
export function setInlineField(source: string, key: string, value?: string): string {
    const existing = extractInlineFields(source);
    const existingKeys = existing.filter(f => f.key == key);

    // Don't do anything if there are duplicate keys OR the key already doesn't exist.
    if (existingKeys.length > 2 || (existingKeys.length == 0 && !value)) return source;
    const existingKey = existingKeys[0];

    const annotation = value ? `[${key}:: ${value}]` : '';
    if (existingKey) {
        const prefix = source.substring(0, existingKey.start);
        const suffix = source.substring(existingKey.end);

        if (annotation) return `${prefix}${annotation}${suffix}`;
        else return `${prefix}${suffix.trimStart()}`;
    } else if (annotation) {
        return `${source.trimEnd()} ${annotation}`;
    }

    return source;
}

export interface InlineField {
    /** The raw parsed key. */
    key: string;
    /** The raw value of the field. */
    value: string;
    /** The start column of the field. */
    start: number;
    /** The start column of the *value* for the field. */
    startValue: number;
    /** The end column of the field. */
    end: number;
    /** If this inline field was defined via a wrapping ('[' or '('), then the wrapping that was used. */
    wrapping?: string;
}

/** The wrapper characters that can be used to define an inline field. */
export const INLINE_FIELD_WRAPPERS: Readonly<Record<string, string>> = Object.freeze({
    '[': ']',
    '(': ')',
});

/** Find the '::' separator in an inline field. */
function findSeparator(line: string, start: number): { key: string; valueIndex: number } | undefined {
    const sep = line.indexOf('::', start);
    if (sep < 0) return undefined;

    return { key: line.substring(start, sep).trim(), valueIndex: sep + 2 };
}

/**
 * Find a matching closing bracket that occurs at or after `start`, respecting nesting and escapes. If found,
 * returns the value contained within and the string index after the end of the value.
 */
function findClosing(
    line: string,
    start: number,
    open: string,
    close: string,
): { value: string; endIndex: number } | undefined {
    let nesting = 0;
    let escaped = false;
    for (let index = start; index < line.length; index++) {
        const char = line.charAt(index);

        // Allows for double escapes like '\\' to be rendered normally.
        if (char == '\\') {
            escaped = !escaped;
            continue;
        }

        // If escaped, ignore the next character for computing nesting, regardless of what it is.
        if (escaped) {
            escaped = false;
            continue;
        }

        if (char == open) nesting++;
        else if (char == close) nesting--;

        // Only occurs if we are on a close character and trhere is no more nesting.
        if (nesting < 0) return { value: line.substring(start, index).trim(), endIndex: index + 1 };

        escaped = false;
    }

    return undefined;
}

/** Try to completely parse an inline field starting at the given position. Assuems `start` is on a wrapping character. */
function findSpecificInlineField(line: string, start: number): InlineField | undefined {
    const open = line.charAt(start);

    const key = findSeparator(line, start + 1);
    if (key === undefined) return undefined;

    // Fail the match if we find any separator characters (not allowed in keys).
    for (const sep of Object.keys(INLINE_FIELD_WRAPPERS).concat(Object.values(INLINE_FIELD_WRAPPERS))) {
        if (key.key.includes(sep)) return undefined;
    }

    const value = findClosing(line, key.valueIndex, open, INLINE_FIELD_WRAPPERS[open]);
    if (value === undefined) return undefined;

    return {
        key: key.key,
        value: value.value,
        start: start,
        startValue: key.valueIndex,
        end: value.endIndex,
        wrapping: open,
    };
}

export const CREATED_DATE_REGEX = /\u{2795}\s*(\d{4}-\d{2}-\d{2})/u;
export const DUE_DATE_REGEX = /(?:\u{1F4C5}|\u{1F4C6}|\u{1F5D3}\u{FE0F}?)\s*(\d{4}-\d{2}-\d{2})/u;
export const DONE_DATE_REGEX = /\u{2705}\s*(\d{4}-\d{2}-\d{2})/u;
export const SCHEDULED_DATE_REGEX = /[\u{23F3}\u{231B}]\s*(\d{4}-\d{2}-\d{2})/u;
export const START_DATE_REGEX = /\u{1F6EB}\s*(\d{4}-\d{2}-\d{2})/u;

export const EMOJI_REGEXES = [
    { regex: CREATED_DATE_REGEX, key: 'created' },
    { regex: START_DATE_REGEX, key: 'start' },
    { regex: SCHEDULED_DATE_REGEX, key: 'scheduled' },
    { regex: DUE_DATE_REGEX, key: 'due' },
    { regex: DONE_DATE_REGEX, key: 'completion' },
];

/** Parse special completed/due/done task fields which are marked via emoji. */
function extractSpecialTaskFields(line: string): InlineField[] {
    const results: InlineField[] = [];

    for (const { regex, key } of EMOJI_REGEXES) {
        const match = regex.exec(line);
        if (!match) continue;

        results.push({
            key,
            value: match[1],
            start: match.index,
            startValue: match.index + 1,
            end: match.index + match[0].length,
            wrapping: 'emoji-shorthand',
        });
    }

    return results;
}

/** Extracts inline fields of the form '[key:: value]' from a line of text. This is done in a relatively
 * "robust" way to avoid failing due to bad nesting or other interfering Markdown symbols:
 *
 * - Look for any wrappers ('[' and '(') in the line, trying to parse whatever comes after it as an inline key::.
 * - If successful, scan until you find a matching end bracket, and parse whatever remains as an inline value.
 */
export function extractInlineFields(line: string, includeTaskFields = false): InlineField[] {
    let fields: InlineField[] = [];
    for (const wrapper of Object.keys(INLINE_FIELD_WRAPPERS)) {
        let foundIndex = line.indexOf(wrapper);
        while (foundIndex >= 0) {
            const parsedField = findSpecificInlineField(line, foundIndex);
            if (!parsedField) {
                foundIndex = line.indexOf(wrapper, foundIndex + 1);
                continue;
            }

            fields.push(parsedField);
            foundIndex = line.indexOf(wrapper, parsedField.end);
        }
    }

    if (includeTaskFields) fields = fields.concat(extractSpecialTaskFields(line));

    fields.sort((a, b) => a.start - b.start);

    const filteredFields: InlineField[] = [];
    for (let i = 0; i < fields.length; i++) {
        if (i == 0 || filteredFields[filteredFields.length - 1].end < fields[i].start) {
            filteredFields.push(fields[i]);
        }
    }
    return filteredFields;
}

/** Set the task completion key on check. */
export function setTaskCompletion(
    originalText: string,
    useEmojiShorthand: boolean,
    completionKey: string,
    completionDateFormat: string,
    complete: boolean,
): string {
    const blockIdRegex = /\^[a-z0-9\\-]+/i;

    if (!complete && !useEmojiShorthand)
        return trimEndingLines(setInlineField(originalText.trimEnd(), completionKey)).trimEnd();

    const parts = originalText.split(/\r?\n/u);
    const matches = blockIdRegex.exec(parts[parts.length - 1]);
    console.debug('matchreg', matches);

    let processedPart = parts[parts.length - 1].split(blockIdRegex).join(''); // last part without block id
    if (useEmojiShorthand) {
        processedPart = setEmojiShorthandCompletionField(
            processedPart,
            complete ? DateTime.now().toFormat('yyyy-MM-dd') : '',
        );
    } else {
        processedPart = setInlineField(processedPart, completionKey, DateTime.now().toFormat(completionDateFormat));
    }
    processedPart = `${processedPart.trimEnd()}${matches?.length ? ' ' + matches[0].trim() : ''}`.trimEnd(); // add back block id
    parts[parts.length - 1] = processedPart;

    return parts.join('\n');
}

export function setEmojiShorthandCompletionField(source: string, value?: string): string {
    const existing = extractInlineFields(source, true);
    const existingKeys = existing.filter(f => f.key === 'completion' && f.wrapping === 'emoji-shorthand');

    // Don't do anything if there are duplicate keys OR the key already doesn't exist.
    if (existingKeys.length > 2 || (existingKeys.length == 0 && !value)) return source;

    /* No wrapper, add own spacing at start */
    const annotation = value ? ` ✅ ${value}` : '';
    const existingKey = existingKeys[0];
    if (existingKey) {
        const prefix = source.substring(0, existingKey.start);
        const suffix = source.substring(existingKey.end);
        return `${prefix.trimEnd()}${annotation}${suffix}`;
    } else {
        return `${source.trimEnd()}${annotation}`;
    }
}

// TODO: Consider using an actual parser in leiu of a more expensive regex.
export const LIST_ITEM_REGEX = /^[\s>]*(\d+\.|\d+\)|\*|-|\+)\s*(\[.{0,1}\])?\s*(.*)$/mu;

/** Rewrite a task with the given completion status and new text. */
export async function rewriteTask(vault: Vault, task: STask, desiredStatus: string, desiredText?: string) {
    if (desiredStatus == task.status && (desiredText == undefined || desiredText == task.text)) return;
    desiredStatus = desiredStatus == '' ? ' ' : desiredStatus;

    const rawFiletext = await vault.adapter.read(task.path);
    const hasRN = rawFiletext.contains('\r');
    const filetext = rawFiletext.split(/\r?\n/u);

    if (filetext.length < task.line) return;
    const match = LIST_ITEM_REGEX.exec(filetext[task.line]);
    if (!match || match[2].length == 0) return;

    const taskTextParts = task.text.split('\n');
    if (taskTextParts[0].trim() != match[3].trim()) return;

    // We have a positive match here at this point, so go ahead and do the rewrite of the status.
    const initialSpacing = /^[\s>]*/u.exec(filetext[task.line])![0];
    if (desiredText) {
        const desiredParts = desiredText.split('\n');

        const newTextLines: string[] = [`${initialSpacing}${task.symbol} [${desiredStatus}] ${desiredParts[0]}`].concat(
            desiredParts.slice(1).map(l => initialSpacing + '\t' + l),
        );

        filetext.splice(task.line, task.lineCount, ...newTextLines);
    } else {
        filetext[task.line] = `${initialSpacing}${task.symbol} [${desiredStatus}] ${taskTextParts[0].trim()}`;
    }

    const newText = filetext.join(hasRN ? '\r\n' : '\n');
    await vault.adapter.write(task.path, newText);
}
