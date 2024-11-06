const dgram = require('dgram');
const fs = require('fs');

const PORT = 8888;                                                                      // Port to listen for incoming UDP packets
const HOST = '0.0.0.0';                                                                 // Listen on all available IPs
const server = dgram.createSocket('udp4');
var ipadd = [];

// Handle incoming messages
server.on('message', (msg, rinfo) => {
    if (msg.includes("SICTZ")) {
        var node = msg.subarray(5, msg.length)
        var obj = {
            key1: node,
            key2: rinfo.address,
            key3: rinfo.port
        };

        ipadd.push(obj)
    }

    console.log(`Received message: ${msg} from ${rinfo.address}:${rinfo.port}`);
    const log = `Received: ${msg} from ${rinfo.address}:${rinfo.port}\n`;
    fs.appendFile('udp_data_log.txt', log, (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        }
    });

    // Send a reply back to the sender
    const responseMessage = 'Bayarlalraa!';
    server.send(responseMessage, rinfo.port, rinfo.address, (error) => {
        if (error) {
            console.error(`Error sending response: ${error}`);
        } else {
            console.log(`Sent response to ${rinfo.address}:${rinfo.port}`);
        }
    });
});

// Handle server errors
server.on('error', (err) => {
    console.error(`Server error: ${err.stack}`);
    server.close();
});

// Start listening for UDP messages
server.bind(PORT, HOST, () => {
    console.log(`UDP server is listening on ${HOST}:${PORT}`);
});


function sendPacket() {
    for (i in ipadd) {
        server.send(data, ipadd.key2, ipadd.key3, (error) => {
            if (error) {
                console.error(`Error sending response: ${error}`);
            } else {
                console.log(`Sent response to ${ipadd.key2}:${ipadd.key3}`);
            }
        });
    }

}

setInterval(sendPacket, 100);