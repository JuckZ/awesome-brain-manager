import chalk from 'chalk';
import * as sut from '../file-access';
import { describe, it, beforeAll, expect } from 'vitest';

describe('file access', () => {
    beforeAll(() => {
        console.log(chalk.yellow.bold('Hello world!'))
    });

    it('should log an error message if something went wrong', () => {
        sut.writeFile('../test', {});
    });

    it('should log a success message if everything went well', () => {
        sut.writeFile('../test', {});
        // expect(chalk.green).toHaveBeenCalledWith('Order successfully written to file');
    });
});
