export var InsertCmd = function (cmd, user, id) {
    const action = "add_log"
    fetch('http://localhost:3001/mid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({action, cmd, user, id})
    })
}