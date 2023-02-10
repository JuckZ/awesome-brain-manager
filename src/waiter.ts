import chalk from 'chalk';
import boxen from 'boxen';

const orderTitle =
    '\n' +
    '                                         _           \n' +
    '  _   _  ___  _   _ _ __    ___  _ __ __| | ___ _ __ \n' +
    " | | | |/ _ \\| | | | '__|  / _ \\| '__/ _` |/ _ \\ '__|\n" +
    ' | |_| | (_) | |_| | |    | (_) | | | (_| |  __/ |   \n' +
    '  \\__, |\\___/ \\__,_|_|     \\___/|_|  \\__,_|\\___|_|   \n' +
    '  |___/                                              \n';

export function placeOrder(food, drink) {
    const foodOrder = `${(chalk as any).green('You ordered the following food: ')} ${(chalk as any).blue.bold(
        food,
    )} \n`;
    const drinkOrder = `${(chalk as any).green('You ordered the following drink: ')} ${(chalk as any).blue.bold(
        drink,
    )}`;

    const order = `${orderTitle} ${boxen(foodOrder + drinkOrder, {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
    })}`;

    console.log(order);
}
