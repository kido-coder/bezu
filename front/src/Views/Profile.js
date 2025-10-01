import { useState, useEffect } from "react";

const Profile = () => {
    const userID = localStorage.getItem('user')
    const action = 'getUser';
    const [user, setUser] = useState([]);
    const [old, setOld] = useState([]);
    const [newP, setNewP] = useState([]);
    const [new2, setNew2] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:3001/mid', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action, userID }),
                });
                const data = await response.json();
                setUser(data[0]);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [action, userID]);
    const handleSubmit = (event) => {
        event.preventDefault();
        if (old.length === 0 || newP.length === 0 || new2.length === 0) {
            setMessage("Та нууц үгээ бүрэн оруулна уу?");
            setTimeout(() => {
                setMessage('');
            }, 5000);
        } else if (new2 !== newP) {
            setMessage("Шинэ нууц үг зөрүүтэй байна!");
            setTimeout(() => {
                setMessage('');
            }, 5000);
        } else {

            fetch('http://localhost:3001/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID, newP, old}),
            })
                .then((response) => response.json())
                .then((data) => {
                    setMessage(data.message);
                    setTimeout(() => {
                        setMessage('');
                    }, 5000);
                })
                .catch((error) => {
                    console.error('Error:', error);
                    setMessage('Aлдаа гарлаа. Та дахин оролдоно уу?.');
                });
        }
    };

    return (
        <div className="table-container">
            <h2>Нэг сайхан нартай өдөр css нэмж царайлаг болгохоо амлажийнаа</h2>
            <h3>Хувийн мэдээлэл</h3>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex' }}>
                    <div>
                        <p> Ажилтны код</p>
                        <p>Овог</p>
                        <p>Нэр</p>
                        <p>Гар утасны дугаар</p>
                        <p>Цахим шуудан</p>
                        <p>Албан тушаал</p>
                        <p>Хуучин нууц үг</p>
                        <p>Шинэ нууц үг</p>
                        <p>Шинэ нууц үг давтах</p>
                    </div>
                    <div style={{ paddingLeft: '1.5rem' }}>
                        <p>{user.ajiltan_id}</p>
                        <p>{user.ajiltan_ovog}</p>
                        <p>{user.ajiltan_ner}</p>
                        <p>{user.ajiltan_utas}</p>
                        <p>{user.ajiltan_email}</p>
                        <p>{user.turul_ner}</p>
                        <input type="password"
                            style={{ margin: '2px 0 2px 0' }}
                            onChange={(e) => setOld(e.target.value)} /><br />
                        <input type="password"
                            style={{ margin: '2px 0 2px 0' }}
                            onChange={(e) => setNewP(e.target.value)} /><br />
                        <input type="password"
                            style={{ margin: '2px 0 2px 0' }}
                            onChange={(e) => setNew2(e.target.value)} /><br />
                    </div>
                </div>
                {message && <div className="alert">{message}</div>}
                <input type="submit" className="button" />
            </form>
        </div>
    )
}

export default Profile;