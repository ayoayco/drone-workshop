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

    server.once('message', async message => {
        console.log(message.toString());
        const state = await listenState();
        console.log(state);
        /ok/.test(message.toString())
            ? resolve(state)
            : reject(state);
    });
    server.send(task, commandPort, ipAddress, (err) => {if (err) console.log(err)});
});

const getExpected = (current, to) => ({
    ...current,
    x: current.x + to.x,
    y: current.y + to.y,
    z: current.z + to.z,
});

const getDivergence = (result, expected) => ({
    x: result.x - expected.x,
    y: result.y - expected.y,
    z: result.z - expected.z,
});

export const move = async (to, speed = 80) => {
    const current = await listenState();
    const expected = getExpected(current, to);
    const result = await command(`go ${x} ${y} ${z} ${speed}`);
    const divergence = () => getDivergence(result, expected);

    console.log(divergence);
    // await move(divergence);

    return {
        ...result,
        divergence,
    };
};

export const lookForMissionPad = async (goalMid, direction = 'forward', step = 20) => new Promise(async (resolve, reject) => {
    let state = await listenState();

    const { x, y, z, mid } = await new Promise(async (resolve, reject) => {
        while (state.mid !== goalMid) {
            state = await command(`${direction} ${step}`);
        }
        console.log(state);
        return resolve(state);
    });

    // console.log({x, y, z, mid });
    await delay(.1);
    // state = await command(`go 0 0 0 20 ${goalMid}`);

    resolve(state);
});

export const start = async () => {
    server.send('command', commandPort, ipAddress, (err) => {if (err) console.log(err)});
    return delay(1);
}
