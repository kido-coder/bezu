export var Delete = function (id, type) {
    const action = "delete_" + type;
    fetch('http://localhost:3001/operator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id })
    })
}