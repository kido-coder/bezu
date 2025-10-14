export var UpdateStar = function (node, user, state) {
    const action = "star"
    fetch('http://172.16.200.237:3001/mid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({action, node, user, state})
    })
}