import Logger from '../utils/logger';

interface MContent {
    content: string;
    posNum?: number;
}

//credit to chhoumann, original code from: https://github.com/chhoumann/quickadd
export async function insertAfterHandler(targetString: string, formatted: string, fileContent: string) {
    // const targetString: string = plugin.settings.InsertAfter;
    //eslint-disable-next-line
  const targetRegex = new RegExp(`\s*${await escapeRegExp(targetString)}\s*`);
    const fileContentLines: string[] = getLinesInString(fileContent);

    const targetPosition = fileContentLines.findIndex(line => targetRegex.test(line));
    const targetNotFound = targetPosition === -1;
    if (targetNotFound) {
        // if (this.choice.insertAfter?.createIfNotFound) {
        //     return await createInsertAfterIfNotFound(formatted);
        // }

        Logger.log('unable to find insert after line in file.');
    }

    const nextHeaderPositionAfterTargetPosition = fileContentLines
        .slice(targetPosition + 1)
        .findIndex(line => /^#+ |---/.test(line));
    const foundNextHeader = nextHeaderPositionAfterTargetPosition !== -1;

    if (foundNextHeader) {
        let endOfSectionIndex = -1;

        for (let i = nextHeaderPositionAfterTargetPosition + targetPosition; i > targetPosition; i--) {
            const lineIsNewline: boolean = /^[\s\n ]*$/.test(fileContentLines[i]);
            if (!lineIsNewline) {
                endOfSectionIndex = i;
                break;
            }
        }

        if (endOfSectionIndex == -1) endOfSectionIndex = targetPosition;

        return await insertTextAfterPositionInBody(formatted, fileContent, endOfSectionIndex, foundNextHeader);
    } else {
        return await insertTextAfterPositionInBody(
            formatted,
            fileContent,
            fileContentLines.length - 1,
            foundNextHeader,
        );
    }
    // return insertTextAfterPositionInBody(formatted, fileContent, targetPosition);
}

// https://stackoverflow.com/questions/3115150/how-to-escape-regular-expression-special-characters-using-javascript
export async function escapeRegExp(text: any) {
    return await text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

//credit to chhoumann, original code from: https://github.com/chhoumann/quickadd/blob/7536a120701a626ef010db567cea7cf3018e6c82/src/utility.ts#L130
export function getLinesInString(input: string) {
    const lines: string[] = [];
    let tempString = input;

    while (tempString.contains('\n')) {
        const lineEndIndex = tempString.indexOf('\n');
        lines.push(tempString.slice(0, lineEndIndex));
        tempString = tempString.slice(lineEndIndex + 1);
    }

    lines.push(tempString);

    return lines;
}

export async function insertTextAfterPositionInBody(
    text: string,
    body: string,
    pos: number,
    found?: boolean,
): Promise<MContent> {
    if (pos === -1) {
        return {
            content: `${body}\n${text}`,
            posNum: -1,
        };
    }

    const splitContent = body.split('\n');

    if (found) {
        const pre = splitContent.slice(0, pos + 1).join('\n');
        const post = splitContent.slice(pos + 1).join('\n');
        // return `${pre}\n${text}\n${post}`;
        return {
            content: `${pre}\n${text}\n${post}`,
            posNum: pos,
        };
    } else {
        const pre = splitContent.slice(0, pos + 1).join('\n');
        const post = splitContent.slice(pos + 1).join('\n');
        if (/[\s\S]*?/g.test(post)) {
            return {
                content: `${pre}\n${text}`,
                posNum: pos,
            };
        } else {
            return {
                content: `${pre}${text}\n${post}`,
                posNum: pos,
            };
        }
        // return `${pre}${text}\n${post}`;
    }
}

export async function setBanner(filepath, oldBanner, newBanner) {
    const fileContents = await app.vault.adapter.read(filepath);
    let originalLine = `banner: '${oldBanner}'`;
    if (!fileContents.contains(originalLine)) {
        originalLine = `banner: "${oldBanner}"`;
    }
    const newContent = fileContents.replace(originalLine, `banner: '${newBanner}'`);
    await app.vault.adapter.write(filepath, newContent);
    return true;
}
