import * as sut from '../waiter';
import { describe, it, expect } from 'vitest';
import chalk from 'chalk';

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
