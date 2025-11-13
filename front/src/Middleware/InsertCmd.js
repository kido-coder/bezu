export var InsertCmd = function (cmd, user, id) {
    const action = "add_log"
    fetch(`${process.env.REACT_APP_API_URL}/mid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({action, cmd, user, id})
    })
}