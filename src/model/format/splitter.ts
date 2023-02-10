export type Token = {
    symbol: string;
    text: string;
};

export class MySymbol {
    static ofChar(ch: string): MySymbol {
        return new MySymbol(ch, text => {
            return text === ch;
        });
    }

    static ofChars(ch: Array<string>): MySymbol {
        if (ch.length === 0) {
            throw 'empty symbol';
        }
        if (ch[0] == null) {
            throw "ch mustn't be null";
        }
        if (ch.length === 0) {
            return this.ofChar(ch[0]);
        }
        return new MySymbol(ch[0], text => {
            return ch.filter(c => text === c).length > 0;
        });
    }

    private constructor(public primary: string, private func: (text: string) => boolean) {}

    isMySymbol(text: string) {
        return this.func(text);
    }
}

export class Tokens {
    constructor(private tokens: Array<Token>) {}

    public setTokenText(
        symbol: MySymbol | string,
        text: string,
        keepSpace = false,
        create = false,
        separateMySymbolAndText = false,
        insertAt?: number,
    ): Token | null {
        let token = this.getToken(symbol);
        if (token === null) {
            if (!create) {
                return null;
            }
            // append new token
            if (symbol instanceof MySymbol) {
                token = { symbol: symbol.primary, text };
            } else {
                token = { symbol, text };
            }
            if (separateMySymbolAndText && token.symbol !== '' && !token.text.startsWith(' ')) {
                token.text = ' ' + token.text;
            }

            if (this.tokens.length > 0) {
                const lastToken = this.tokens[this.tokens.length - 1]!;
                if (!this.isTokenEndsWithSpace(lastToken)) {
                    // last token doesn't end with space.  Append space to last token.
                    lastToken.text += ' ';
                }
            }
            if (insertAt == null) {
                this.tokens.push(token);
            } else {
                let index = 0;
                let insertTokenIndex = -1;
                let tokenIndex = 0;
                for (const t of this.tokens) {
                    // first token is the title of the reminder.
                    // we shouldn't insert before the title.
                    const end = index + t.symbol.length + t.text.length;
                    if (tokenIndex > 0) {
                        if (end > insertAt) {
                            insertTokenIndex = tokenIndex;
                            break;
                        }
                    }
                    index = end;
                    tokenIndex++;
                }
                if (insertTokenIndex == -1) {
                    this.tokens.push(token);
                } else {
                    this.tokens.splice(insertTokenIndex, 0, token);
                    if (insertTokenIndex < this.tokens.length - 1) {
                        token.text = token.text + ' ';
                    }
                }
            }
            return token;
        }

        this.replaceTokenText(token, text, keepSpace);
        return token;
    }

    public length() {
        return this.tokens.length;
    }

    private replaceTokenText(token: Token, text: string, keepSpace = false) {
        if (!keepSpace) {
            token.text = text;
            return;
        }

        token.text = token.text.replace(/^(\s*).*?(\s*)$/, `$1${text}$2`);
    }

    private isTokenEndsWithSpace(token: Token) {
        return token.text.match(/^.*\s$/);
    }

    public getToken(symbol: MySymbol | string): Token | null {
        for (const token of this.tokens) {
            if (symbol instanceof MySymbol) {
                if (symbol.isMySymbol(token.symbol)) {
                    return token;
                }
            } else {
                if (symbol === token.symbol) {
                    return token;
                }
            }
        }
        return null;
    }

    public getTokenText(symbol: MySymbol | string, removeSpace = false): string | null {
        const token = this.getToken(symbol);
        if (token === null) {
            return null;
        }
        if (!removeSpace) {
            return token.text;
        }
        return token.text.replace(/^\s*(.*?)\s*$/, '$1');
    }

    public removeToken(symbol: MySymbol) {
        this.tokens = this.tokens.filter(token => !symbol.isMySymbol(token.symbol));
    }

    forEachTokens(consumer: (token: Token) => void) {
        this.tokens.forEach(consumer);
    }

    public rangeOfSymbol(symbol: MySymbol): { start: number; end: number } | undefined {
        let index = 0;
        for (const token of this.tokens) {
            const end = index + token.symbol.length + token.text.length;
            if (symbol.isMySymbol(token.symbol)) {
                return {
                    start: index,
                    end: end,
                };
            }
            index = end;
        }
        return;
    }

    public join(): string {
        return this.tokens.map(t => t.symbol + t.text).join('');
    }
}

export function splitBySymbol(line: string, symbols: Array<MySymbol>): Array<Token> {
    const chars = [...line];
    let text = '';
    let currentToken: Token | null = null;
    const splitted: Array<Token> = [];

    const fillPreviousToken = () => {
        if (currentToken === null) {
            // previous token
            splitted.push({ symbol: '', text });
        } else {
            // previous token
            currentToken.text = text;
        }
    };
    chars.forEach(c => {
        const isMySymbol = symbols.filter(s => s.isMySymbol(c)).length > 0;
        if (isMySymbol) {
            fillPreviousToken();

            // new token
            currentToken = { symbol: c, text: '' };
            splitted.push(currentToken);
            text = '';
        } else {
            text += c;
        }
    });
    if (text.length > 0) {
        fillPreviousToken();
    }
    return splitted;
}
