import jsonfile from 'jsonfile';
import chalk from 'chalk';
import * as sut from './file-access';

describe('file access', () => {
    beforeAll(() => (console.log = jest.fn()));

    test('should log an error message if something went wrong', () => {
        const throwError = true;
        jsonfile.setup(throwError);

        sut.writeFile('../test', {});
        expect(chalk.red).toHaveBeenCalled();
    });

    test('should log a success message if everything went well', () => {
        jsonfile.setup(false);

        sut.writeFile('../test', {});
        expect(chalk.green).toHaveBeenCalledWith('Order successfully written to file');
    });
});
