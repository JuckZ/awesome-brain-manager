import { inspect } from 'util';
import chalk from 'chalk';
import { ConstantReference, ReadOnlyReference } from 'model/ref';

chalk.level = 3;
let debugEnable: ReadOnlyReference<boolean> = new ConstantReference(false);

export const initLogger = (debugEnableVal: ReadOnlyReference<boolean>) => {
    debugEnable = debugEnableVal;
};

// TODO 单例模式
const printer = (args, chalkify) => {
    if (!debugEnable.value) {
        return;
    }
    if (args.length === 0) throw '::::::error::::: no argument supplied to logger';

    args.forEach(element => {
        if (typeof element === 'object') {
            // const {inspect} = require('util') // src: https://stackoverflow.com/a/6157569/10012446
            console.error(chalkify(inspect(element)));
        } else {
            console.error(chalkify(element));
        }
    });
};

class Logger {
    log(...args: any) {
        printer(args, chalk.bgCyanBright.blackBright.bold);
    }
    dir(...args: any) {
        printer(args, chalk.bgBlueBright.blackBright.bold);
    }
    info(...args: any) {
        printer(args, chalk.bgBlueBright.blackBright.bold);
    }
    warn(...args: any) {
        printer(args, chalk.bgYellowBright.blackBright.bold);
    }
    error(...args: any) {
        printer(args, chalk.bgRedBright.blackBright.bold);
    }
    debug(...args: any[]) {
        printer(args, chalk.bgRedBright.blackBright.bold);
    }
}

// TODO 合理优化
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const LoggerUtil = new Proxy(new Logger(), console);

export default LoggerUtil;
