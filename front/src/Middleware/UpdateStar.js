export var UpdateStar = function (node, user, state) {
    const action = "star"
    
    fetch(`${process.env.REACT_APP_API_URL}/mid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({action, node, user, state}),
        token: localStorage.getItem('authToken'),
        credentials: 'include'
    })
}