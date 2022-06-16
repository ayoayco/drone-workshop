import { start, command, lookForMissionPad } from './commands.mjs';

const main = async () => {
    await start();
    console.log('started');

    await command('takeoff');
    await lookForMissionPad('7', 'forward', 35);
    await command('up 20');
    await lookForMissionPad('1', 'right', 35);
    await lookForMissionPad('5', 'back', 35);
    await command('land');
}

main();
