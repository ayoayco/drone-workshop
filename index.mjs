import { start, command } from './commands.mjs';

const main = async () => {
    await start();

    await command('takeoff');

    await command('forward 100');

    await command('left 100');

    await command('back 100');

    await command('right 100');

    await command('land');
}

// main();
start();
