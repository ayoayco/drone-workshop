import dgram from 'node:dgram';
import { listenState } from './telemetry.mjs';

const ipAddress = '192.168.8.193';
const commandPort = '8889';

const server = dgram.createSocket('udp4');
server.on('error', (err) => {
    console.log('Something went wrong:', err);
})
server.bind(commandPort, '0.0.0.0', () => {
    console.log('bound to command port');
})
server.addListener('message', (msg, rinfo) => {
    const message = msg.toString();
    console.log('received message', rinfo.address, message);
})

const delay = (seconds) => {
    console.log('waiting', seconds || 'default 7s');
    seconds = seconds || 7;
    const time = seconds * 1000;

    return new Promise(resolve => {
        setTimeout(() => {
            resolve('resolved');
        }, time);

    });
}

export const command = (task) => new Promise((resolve, reject) => {
    console.log(task);
    server.once('message', message => {
        console.log(message.toString());
        const state = await listenState();
        /ok/.test(message.toString())
            ? resolve(state)
            : reject(state);
    });
    server.send(task, commandPort, ipAddress, (err) => {if (err) console.log(err)});
});

export const move = async (to, speed = 80) => {
    const current = await listenState();
    const expectedResult = () => ({
        ...current,
        x: current.x + to.x,
        y: current.y + to.y,
        z: current.z + to.z,
    })();
    const result = await command(`go ${x} ${y} ${z} ${speed}`);
    
}

export const start = async () => command('command');
