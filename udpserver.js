const dgram = require('dgram');
const fs = require('fs');

const PORT = 8888;                                                                      // Port to listen for incoming UDP packets
const HOST = '0.0.0.0';                                                                 // Listen on all available IPs
const server = dgram.createSocket('udp4');

const [waiting, setWaiting] = useState([]);
var ipadd = [];

useEffect(() => {
    setWaiting(-1);

    // Handle incoming messages
    server.on('message', (msg, rinfo) => {
        console.log(waiting);
        if (msg.includes("SICTZ")) {
            var node = msg.subarray(6, msg.length)
            var obj = {
                name: node,
                address: rinfo.address,
                port: rinfo.port
            };

            const exists = ipadd.some(item => item.address === obj.address && item.port === obj.port);

            if (!exists) {
                ipadd.push(obj);
            }
        }

        if (rinfo.port == waiting) {
            const log = `Res: ${msg} from ${rinfo.address}:${rinfo.port}\n`;
            fs.appendFile('udp_data_log.txt', log, (err) => {
                if (err) {
                    console.error('Error writing to file:', err);
                }
            });
            console.log(log);
            setWaiting(-1);
        }

        // Send a reply back to the sender
        // const responseMessage = 'Bayarlalraa!';
        // server.send(responseMessage, rinfo.port, rinfo.address, (error) => {
        //     if (error) {
        //         console.error(`Error sending response: ${error}`);
        //     } else {
        //         console.log(`Sent response to ${rinfo.address}:${rinfo.port}`);
        //     }
        // });
        // console.log(ipadd)
    });

    // Cleanup if needed
    // return () => {
    //     server.off('message', yourHandlerFunction); // Replace with your actual handler
    // };
    function sendPacket() {
        const request = 'data ug';
        for (const obj of ipadd) {
            while (waiting != -1) { };
            server.send(request, obj.port, obj.address, (error) => {
                if (error) {
                    console.error(`Error sending response: ${error}`);
                } else {
                    console.log(`${obj.name} ruu Huselt ulgeesen`);
                }
            });
            setWaiting(`${obj.port}`);
        }
    }
    
    setInterval(sendPacket, 1000);
}, [waiting]);

// Handle incoming messages


server.on('error', (err) => {
    console.error(`Server error: ${err.stack}`);
    server.close();
});

// Start listening for UDP messages
server.bind(PORT, HOST, () => {
    console.log(`UDP server is listening on ${HOST}:${PORT}`);
});


