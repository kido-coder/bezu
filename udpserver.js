const dgram = require('dgram');
const fs = require('fs');

const PORT = 8888;
const HOST = '0.0.0.0';
const server = dgram.createSocket('udp4');

let pastReq = -1;  // Replace useState with a simple variable
let ipadd = [];

// Handle incoming messages
server.on('message', (msg, rinfo) => {
    if (msg.includes("SICTZ")) {
        const node = msg.subarray(6, msg.length);
        const obj = {
            name: node,
            address: rinfo.address,
            port: rinfo.port
        };

        const exists = ipadd.some(item => item.address === obj.address && item.port === obj.port);
        if (!exists) {
            ipadd.push(obj);
        }
    }

    
    if (rinfo.port == pastReq) {
        const log = `Res: ${msg} from ${rinfo.address}:${rinfo.port}\n`;
        fs.appendFile('udp_data_log.txt', log, (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            }
        });
        console.log(log);
        pastReq = -1;  // Update the variable directly
    }
    console.log(pastReq); // Now it references the simple variable correctly
});

// Error handling
server.on('error', (err) => {
    console.error(`Server error: ${err.stack}`);
    server.close();
});

// Start listening for UDP messages
server.bind(PORT, HOST, () => {
    console.log(`UDP server is listening on ${HOST}:${PORT}`);
});

function sendPacket() {
    const request = 'data ug';
    for (const obj of ipadd) {
        while (pastReq !== -1) {};  // Use the variable directly
        server.send(request, obj.port, obj.address, (error) => {
            if (error) {
                console.error(`Error sending response: ${error}`);
            } else {
                console.log(`${obj.name} ruu Huselt ulgeesen`);
            }
        });
        pastReq = obj.port;  // Update the variable directly
    }
}

setInterval(sendPacket, 1000);
