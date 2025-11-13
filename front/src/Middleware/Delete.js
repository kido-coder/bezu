export var Delete = function (id, type) {
    const action = "delete_" + type;
    fetch(`${process.env.REACT_APP_API_URL}/operator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id })
    })
}