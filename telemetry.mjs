import dgram from 'node:dgram';

const statePort = '8890';
const state = dgram.createSocket('udp4');

// process messages
state.on('error', (err) => {
    console.log('something went wrong', err);
});
state.bind(statePort, '0.0.0.0', () => {
    console.log('bound to state');
});

export const listenState = () => new Promise(
(resolve, reject) => {
    state.once('message', (msg) => {
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

        if (message === 'error') {
            reject(message);
        }

        resolve(rawState);
    }
    );
});
