// Required external library: express (npm install express)
const dgram = require('dgram');
const express = require('express');

// --- Configuration ---
// IoT Communication Server Configuration
const UDP_LISTEN_IP = "0.0.0.0";   // Listen on all interfaces
const UDP_LISTEN_PORT = 12345;     // Port for nodes to send data to

// Internal API Server Configuration (Web App Backend)
const API_HOST = "127.0.0.1";
const API_PORT = 3001;

// Server-to-Node Communication Configuration
const NODE_POLLING_CYCLE_MINUTES = 10;
const NODE_COMMAND_INTERVAL_SECONDS = 5; 
const DEFAULT_NODE_PORT = 8888; 
const FAULT_THRESHOLD = 3; // Number of consecutive failed polls before alarm
const LAST_DATA_THRESHOLD_MINUTES = 15; // Node is faulty if no data in the last 15 minutes

// --- Mock Database / Shared State ---
// In a production environment, this would be a connection pool to your MySQL database.
// This object simulates the shared database tables: node, node_log, sensor_data, command_queue.
const MOCK_DB = {
    // 1. Node Registration Data (Simulates the 'node' table)
    // Key is node_id: { node_name: '...', mac_address: '...', node_address: 'IP', fault_count: 0 }
    nodes: {}, 
    
    // 2. Last received sensor data (Simulates the 'sensor_data' table / existing node_data)
    node_data: {}, 
    
    // 3. Commands queued by the API (Simulates the 'command_queue' table)
    pending_commands: {},
    
    // 4. Node activity logs (Simulates the 'node_log' table)
    node_logs: [] 
};

// --- 1. IoT Communication Server (The UDP Handler) ---

/**
 * Processes incoming UDP data from an IoT node, handling both registration and sensor data.
 * @param {Buffer} msg The incoming message buffer.
 * @param {dgram.RemoteInfo} rinfo Remote address information.
 */
function handleIncomingUdp(msg, rinfo) {
    const node_ip = rinfo.address; // Use IP address for communication
    const raw_payload = msg.toString('utf8').trim();
    const timestamp = new Date().toISOString();

    // --- Check for Registration Packet (First Unique Packet) ---
    // Expected format: REGISTER,NODE001,AA:BB:CC:DD:EE:FF,Field Sensor 1
    if (raw_payload.startsWith("REGISTER,")) {
        const parts = raw_payload.split(',');
        if (parts.length >= 4) {
            const [, nodeId, macAddress, name] = parts;

            if (!MOCK_DB.nodes[nodeId]) {
                // New Node Registration
                MOCK_DB.nodes[nodeId] = {
                    node_id: nodeId,
                    node_name: name,
                    mac_address: macAddress,
                    node_address: node_ip,
                    fault_count: 0
                };
                console.log(`[REGISTRATION] New node registered: ${nodeId} (${name}) at ${node_ip}`);
                
                // In production: EXECUTE SQL INSERT into 'node' table (node_id, node_name, mac_address)
            } else {
                // Update address if the IP changed (common with DHCP)
                MOCK_DB.nodes[nodeId].node_address = node_ip;
                console.log(`[REGISTRATION] Node ${nodeId} re-connected. IP updated to ${node_ip}`);
            }
        }
        return; // Stop processing further for registration packets
    } 
    
    // --- Handle Standard Sensor Data Packet (Existing Logic) ---
    // Data packet is assumed to contain a known Node ID or IP, and sensor values.
    
    // Attempt to identify node based on IP (since we don't have node_id in the payload)
    const identifiedNode = Object.values(MOCK_DB.nodes).find(n => n.node_address === node_ip);
    const nodeId = identifiedNode ? identifiedNode.node_id : `UNKNOWN_${node_ip}`;

    try {
        let temp = 0.0;
        
        // Example: Parsing a payload like "NODE-1,temp,25.5,humidity,45"
        if (raw_payload.toLowerCase().includes("temp")) {
            const parts = raw_payload.split(',');
            const tempIndex = parts.indexOf('temp');
            if (tempIndex !== -1 && tempIndex + 1 < parts.length) {
                temp = parseFloat(parts[tempIndex + 1]);
            }
            console.log(`[UDP RX] Data from ${nodeId} (${node_ip}): ${raw_payload}`);
        } else if (raw_payload === "HELLO_ACK") {
            // A response to a HELLO poll is received
            console.log(`[UDP RX] HELLO ACK received from ${nodeId}.`);
            
            // If the node was polled and is sending an ACK, reset its fault count immediately.
            if (identifiedNode) {
                 identifiedNode.fault_count = 0;
            }
            // We still need to update node_data to ensure the last check time is fresh
        }
        
        // --- Database Write Simulation (Sensor Data) ---
        MOCK_DB.node_data[nodeId] = {
            timestamp: timestamp,
            status: "online",
            temperature: temp, 
            raw_payload: raw_payload
        };
        // In production: EXECUTE SQL INSERT QUERY into 'sensor_data' table

    } catch (e) {
        console.error(`[UDP RX Error] Could not process data from ${nodeId}:`, e);
    }
}

function startUdpListener() {
    const server = dgram.createSocket('udp4');

    server.on('error', (err) => {
        console.error(`UDP Server error:\n${err.stack}`);
        server.close();
    });

    server.on('message', handleIncomingUdp);

    server.on('listening', () => {
        const address = server.address();
        console.log(`[${new Date().toISOString()}] IoT Server listening on UDP ${address.address}:${address.port}...`);
    });

    server.bind(UDP_LISTEN_PORT, UDP_LISTEN_IP);
}

/**
 * Handles API command queue processing. This runs every 5 seconds.
 */
function processPendingCommands(client) {
    const commandsToSend = { ...MOCK_DB.pending_commands };
    const nodesToClear = [];

    for (const node_id in commandsToSend) {
        try {
            const commandData = commandsToSend[node_id];
            const command = commandData.command || "NO_OP";
            
            const target_ip = node_id;
            const target_port = DEFAULT_NODE_PORT; 
            
            const message = Buffer.from(`CMD:${command}`);
            
            client.send(message, target_port, target_ip, (err) => {
                if (err) {
                    console.error(`[CMD TX Error] Failed to send API command to ${node_id}:`, err);
                } else {
                    console.log(`[CMD TX] Sent API command '${command}' to node ${node_id}.`);
                    nodesToClear.push(node_id);
                }
            });

        } catch (e) {
            console.error(`[CMD TX Fatal Error] Processing API command for ${node_id}:`, e);
        }
    }
    
    // Clear sent commands from the database queue (MOCK_DB)
    nodesToClear.forEach(node_id => {
        if (MOCK_DB.pending_commands[node_id]) {
            delete MOCK_DB.pending_commands[node_id];
        }
    });
}

/**
 * Performs scheduled health checks (polling) on all registered nodes.
 * This implements the 10-minute cycle / N nodes requirement.
 */
async function startHealthCheckLoop() {
    const client = dgram.createSocket('udp4');
    
    // Start the command queue processing separately
    setInterval(() => processPendingCommands(client), NODE_COMMAND_INTERVAL_SECONDS * 1000);

    const pollingLoop = async () => {
        const nodeIds = Object.keys(MOCK_DB.nodes);
        const totalNodes = nodeIds.length;
        const pollingCycleMs = NODE_POLLING_CYCLE_MINUTES * 60 * 1000;
        
        // Calculate the time slot per node for round-robin polling
        const timeSlotMs = totalNodes > 0 
            ? Math.max(5000, Math.floor(pollingCycleMs / totalNodes)) // Minimum 5s slot
            : 60000; // If no nodes, wait 1 minute

        console.log(`\n--- Starting Health Check Cycle (${totalNodes} nodes) ---`);

        for (const nodeId of nodeIds) {
            const node = MOCK_DB.nodes[nodeId];
            if (!node) continue;
            
            const startTime = Date.now();
            let isResponsive = false;

            // 1. Send HELLO message (Poll)
            // This relies on the node sending a HELLO_ACK back to the main UDP listener
            // which will reset the fault_count in the handleIncomingUdp function.
            client.send(Buffer.from("HELLO"), DEFAULT_NODE_PORT, node.node_address, (err) => {
                if (err) {
                    console.error(`[HELLO TX Error] Failed to send HELLO to ${nodeId}:`, err);
                }
            });
            
            // Wait 5 seconds to give the node time to respond
            await new Promise(resolve => setTimeout(resolve, 5000)); 
            
            // 2. Check for success/failure
            // Instead of waiting synchronously on UDP (which is complex in Node.js), 
            // we check the last time the node's sensor data arrived. If the HELLO_ACK was received
            // during the 5s wait, the fault_count would have been reset by handleIncomingUdp.

            const lastData = MOCK_DB.node_data[nodeId];
            let diffMinutes = LAST_DATA_THRESHOLD_MINUTES + 1; // Default to old/faulty
            
            if (lastData) {
                 diffMinutes = (Date.now() - new Date(lastData.timestamp).getTime()) / 60000;
                 if (diffMinutes < LAST_DATA_THRESHOLD_MINUTES) {
                     isResponsive = true;
                 }
            }

            // 3. Process Result & Update Fault Count
            if (isResponsive && node.fault_count === 0) { // If responsive AND fault count was reset by ACK
                // Fault count remains 0 or was reset by ACK. Log success.
                console.log(`[HEALTH CHECK] Node ${nodeId} responsive (Data: ${diffMinutes.toFixed(1)} mins ago).`);
                
                MOCK_DB.node_logs.push({
                    node_id: nodeId,
                    timestamp: new Date().toISOString(),
                    type: "HELLO_ACK",
                    message: "Node responsive."
                });
                
            } else {
                // Node is unresponsive (ACK not received or data too old)
                node.fault_count += 1;
                console.log(`[HEALTH CHECK] Node ${nodeId} unresponsive. Fault count: ${node.fault_count}`);
                
                // Log failure
                MOCK_DB.node_logs.push({
                    node_id: nodeId,
                    timestamp: new Date().toISOString(),
                    type: "HELLO_FAIL",
                    message: `Node unresponsive. Fault count: ${node.fault_count}`
                });
            }

            // 4. Check for Alarm Threshold
            if (node.fault_count === FAULT_THRESHOLD) {
                console.error(`\n======================================================`);
                console.error(`!!! ALARM !!! Node ${nodeId} (${node.node_name}) is DOWN after ${FAULT_THRESHOLD} consecutive faults!`);
                console.error(`======================================================\n`);
                // In production: Send email/SMS notification to user / EXECUTE SQL INSERT into 'alarm' table
                
                // Keep the fault count at 3+ until the node recovers
            }


            const endTime = Date.now();
            const elapsed = endTime - startTime;
            
            // Wait for the remainder of the time slot
            const waitTime = Math.max(0, timeSlotMs - elapsed);
            if (waitTime > 0) {
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        } // End of nodeIds loop

        // Wait 5 seconds before starting the next full cycle
        console.log(`\n[HEALTH CHECK] Cycle finished. Starting next cycle in 5 seconds.`);
        setTimeout(pollingLoop, 5000); 
    };

    // Start the health check loop
    pollingLoop();
}


// --- 2. Internal API Server (The Express Backend) ---

const app = express();
app.use(express.json());

// Simple CORS configuration for local development (adjust for production)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow React app access
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});


// GET /api/data: Retrieves the latest data readings from all IoT nodes, including status/faults.
app.get('/api/data', (req, res) => {
    const dataList = [];
    
    // Combine node registration data with latest sensor data for the web app display
    for (const nodeId in MOCK_DB.nodes) {
        const nodeInfo = MOCK_DB.nodes[nodeId];
        const sensorData = MOCK_DB.node_data[nodeId] || { timestamp: null, status: 'unknown', temperature: 0, raw_payload: '' };
        
        dataList.push({ 
            node_id: nodeInfo.node_id, 
            node_name: nodeInfo.node_name, 
            mac_address: nodeInfo.mac_address,
            node_address: nodeInfo.node_address,
            fault_count: nodeInfo.fault_count,
            ...sensorData
        });
    }

    res.json(dataList);
});

// POST /api/command: Queues a command to be sent to a specific node.
app.post('/api/command', (req, res) => {
    const { node_id, command } = req.body;
    
    if (!node_id || !command) {
        return res.status(400).json({ detail: "node_id and command are required." });
    }

    const upperCommand = command.toUpperCase();
    
    // Validate command
    const validCommands = ["ON", "OFF", "REBOOT", "PING", "GET_STATUS"];
    if (!validCommands.includes(upperCommand)) {
        return res.status(400).json({ detail: `Invalid command: ${command}. Must be one of: ${validCommands.join(', ')}` });
    }
    
    // Check if node exists before queuing command
    if (!MOCK_DB.nodes[node_id]) {
         return res.status(404).json({ detail: `Node ID ${node_id} not registered.` });
    }
    
    // --- Database Write/Queue Simulation ---
    MOCK_DB.pending_commands[node_id] = {
        command: upperCommand,
        timestamp: new Date().toISOString(),
        status: "PENDING"
    };
    // In production: EXECUTE SQL INSERT QUERY into a 'command_queue' table
    
    res.json({ message: `Command '${upperCommand}' successfully queued for node ${node_id}` });
});


// --- Main Application Runner ---

function runServers() {
    console.log("--- Starting IoT Communication Server Threads ---");
    startUdpListener();
    startHealthCheckLoop();

    console.log("\n--- Starting Internal API Server (Express) ---");
    app.listen(API_PORT, API_HOST, () => {
        console.log(`API Server listening on http://${API_HOST}:${API_PORT}`);
    });
}

// Execute the main function
runServers();