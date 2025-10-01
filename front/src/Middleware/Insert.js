export var Insert = function (action, array) {
    fetch('http://localhost:3001/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({action, array})
    })
}