import chalk from 'chalk';
import { beforeAll, describe, expect, it } from 'vitest';
import * as sut from '@/file-access';

describe('file access', () => {
    beforeAll(() => {
        console.log(chalk.yellow.bold('Hello world!'));
    });

    it('should log an error message if something went wrong', () => {
        sut.writeFile('../test', {});
    });

    it('should log a success message if everything went well', () => {
        sut.writeFile('../test', {});
        // expect(chalk.green).toHaveBeenCalledWith('Order successfully written to file');
    });
});
