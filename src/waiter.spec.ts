import chalk from 'chalk';
import * as sut from './waiter';

describe('Waiter', () => {
    beforeAll(() => (console.log = jest.fn()));

    test('should print the food on the order', () => {
        const food = 'Pizza';
        const drink = 'Coke';
        sut.placeOrder(food, drink);

        expect(chalk.green).toHaveBeenCalledWith('You ordered the following food: ');
        expect(chalk.blue.bold).toHaveBeenCalledWith(food);
    });

    test('should print the drink to the order', () => {
        const food = 'Pizza';
        const drink = 'Coke';
        sut.placeOrder(food, drink);

        expect(chalk.green).toHaveBeenCalledWith('You ordered the following drink: ');
        expect(chalk.blue.bold).toHaveBeenCalledWith(drink);
    });
});
