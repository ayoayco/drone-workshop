import dgram from 'node:dgram';

const ipAddress = '192.168.8.123';
const commandPort = '8889';
const statePort = '8890';

const server = dgram.createSocket('udp4');
const state = dgram.createSocket('udp4');

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


function delay(seconds) {
    console.log('waiting', seconds || 'default 7s');
    seconds = seconds || 7;
    const time = seconds * 1000;

    return new Promise(resolve => {
        setTimeout(() => {
            resolve('resolved');
        }, time);

    });
}

function command(task) {
    console.log(task);
    server.send(task, commandPort, ipAddress, (err) => {if (err) console.log(err)});
}


// process messages
state.on('error', (err) => {
    console.log('something went wrong', err);
});
state.bind(statePort, '0.0.0.0', () => {
    console.log('bound to state');
});
state.addListener('message', (msg) => {
    const message = msg.toString();
    const attributePairs = message.split(';')
    const rawState = {};
    const allowedKeys = ['mid','x','y','z'];
    
    attributePairs.map((attribute) => {
        const [key, value] = attribute.split(':');
        return { key, value }
    })
    .filter(s => allowedKeys.includes(s.key))
    .forEach(attribute => {
        rawState[attribute.key] = attribute.value;
    })

    console.log(rawState);
});

const start = async () => {
    command('command');
    await delay(1);
}

const main = async () => {
    start();

    command('takeoff');

    await delay();
    command('forward 100');

    await delay();
    command('left 100');

    await delay();
    command('back 100');

    await delay();
    command('right 100');

    await delay();
    command('land');
}


start();
// main();