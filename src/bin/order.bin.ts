#!/usr/bin/env node
import { Command } from 'commander';
import * as packgeJSON from '../../package.json';
import { writeFile } from '../file-access';
import { placeOrder } from '../waiter';

const program = new Command();

program
    .version(packgeJSON.version)
    .arguments('<food> <drink>')
    .option('-w --write <string>', 'Specifies the path of the file the order will be written to')
    .action(function (food, drink, options) {
        const fileName = options.write;
        placeOrder(food, drink);
        if (fileName) {
            writeFile(fileName, { food, drink });
        }
    })
    .parse(process.argv);
