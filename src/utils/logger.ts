import { inspect } from 'util';
import chalk from 'chalk';
import { ConstantReference } from '../model/ref';
import type { ReadOnlyReference } from '../model/ref';

class Logger {
    private debugEnable: ReadOnlyReference<boolean> = new ConstantReference(false);

    printer = (type, args, chalkify) => {
        if (!this.debugEnable.value) {
            return;
        }
        if (args.length === 0) throw '::::::error::::: no argument supplied to logger';

        args.forEach(element => {
            if (typeof element === 'object') {
                // const {inspect} = require('util') // src: https://stackoverflow.com/a/6157569/10012446
                type === 'error' ? console.error(chalkify(inspect(element))) : console.info(chalkify(inspect(element)));
            } else {
                type === 'error' ? console.error(chalkify(element)) : console.info(chalkify(element));
            }
        });
    };

    init(debugEnableVal: ReadOnlyReference<boolean>) {
        this.debugEnable = debugEnableVal;
        chalk.level = 3;
    }
    log(...args: any) {
        this.printer('log', args, chalk.bgCyanBright.blackBright.bold);
    }
    dir(...args: any) {
        this.printer('dir', args, chalk.bgBlueBright.blackBright.bold);
    }
    info(...args: any) {
        this.printer('info', args, chalk.bgBlueBright.blackBright.bold);
    }
    warn(...args: any) {
        this.printer('warn', args, chalk.bgYellowBright.blackBright.bold);
    }
    error(...args: any) {
        this.printer('error', args, chalk.bgRedBright.blackBright.bold);
    }
    debug(...args: any[]) {
        this.printer('debug', args, chalk.bgRedBright.blackBright.bold);
    }
}

// TODO εηδΌε
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const LoggerUtil = new Proxy(new Logger(), console);

export default LoggerUtil;

export { LoggerUtil };
