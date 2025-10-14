export async function Get (action, setData) {
    try {
        const res = await fetch('http://172.16.200.237:3001/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action }),
        })
        const data = await res.json();
        setData(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};
