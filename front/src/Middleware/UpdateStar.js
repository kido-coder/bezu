export var UpdateStar = function (node, user, state) {
    const action = "star"
    fetch('http://localhost:3001/mid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({action, node, user, state})
    })
}