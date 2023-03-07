import { describe, expect, it } from 'vitest';
import chalk from 'chalk';
import * as sut from '../waiter';

describe('Waiter', () => {
    it('should print the food on the order', () => {
        const food = 'Pizza';
        const drink = 'Coke';
        sut.placeOrder(food, drink);
    });

    it('should print the drink to the order', () => {
        const food = 'Pizza11';
        const drink = 'Coke22';
        sut.placeOrder(food, drink);
    });
});
