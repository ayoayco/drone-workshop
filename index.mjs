import { start, command, lookForMissionPad } from './commands.mjs';

const main = async () => {
    await start();
    console.log('started');

    await command('takeoff');
    await lookForMissionPad(5);
}

main();
// start();S
