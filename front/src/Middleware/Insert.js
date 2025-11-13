export var Insert = function (action, array) {
    fetch(`${process.env.REACT_APP_API_URL}/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({action, array})
    })
}