export var Insert = function (action, array) {
    fetch('http://172.16.200.237:3001/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({action, array})
    })
}