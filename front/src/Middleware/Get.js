export async function Get (action, setData) {
    try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/admin`, {
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
