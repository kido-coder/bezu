export var InsertCmd = function (cmd, user, id) {
    const action = "add_log"
    fetch('http://172.16.200.237:3001/mid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({action, cmd, user, id})
    })
}