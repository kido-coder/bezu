import { useState, useEffect } from "react";
import { apiPostJSON, getCurrentUser } from '../utils/api';

const Profile = () => {
    const userId = getCurrentUser();   // "userDisplayName" set by Login.js
    const [userInfo, setUserInfo] = useState({});
    const [old, setOld]   = useState('');
    const [newP, setNewP] = useState('');
    const [new2, setNew2] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        async function fetchUser() {
            // server /mid getUser expects req.body.user
            const data = await apiPostJSON('/mid', { action: 'getUser', user: userId });
            if (data?.[0]) setUserInfo(data[0]);
        }
        fetchUser();
    }, [userId]);

    const flash = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 5000);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!old || !newP || !new2) return flash("Та нууц үгээ бүрэн оруулна уу?");
        if (new2 !== newP) return flash("Шинэ нууц үг зөрүүтэй байна!");

        // server /profile expects req.body.user (not userID)
        const data = await apiPostJSON('/profile', { user: userId, newP, old });
        if (data) flash(data.message);
    };

    return (
        <div className="table-container">
            <h3>Хувийн мэдээлэл</h3>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <div>
                        <p>Ажилтны код</p>
                        <p>Овог</p>
                        <p>Нэр</p>
                        <p>Гар утасны дугаар</p>
                        <p>Цахим шуудан</p>
                        <p>Албан тушаал</p>
                        <p>Хуучин нууц үг</p>
                        <p>Шинэ нууц үг</p>
                        <p>Шинэ нууц үг давтах</p>
                    </div>
                    <div>
                        <p>{userInfo.ajiltan_id}</p>
                        <p>{userInfo.ajiltan_ovog}</p>
                        <p>{userInfo.ajiltan_ner}</p>
                        <p>{userInfo.ajiltan_utas}</p>
                        <p>{userInfo.ajiltan_email}</p>
                        <p>{userInfo.turul_ner}</p>
                        <input type="password" style={{ margin: '2px 0' }} onChange={e => setOld(e.target.value)} /><br />
                        <input type="password" style={{ margin: '2px 0' }} onChange={e => setNewP(e.target.value)} /><br />
                        <input type="password" style={{ margin: '2px 0' }} onChange={e => setNew2(e.target.value)} /><br />
                    </div>
                </div>
                {message && <div className="alert">{message}</div>}
                <input type="submit" className="button" value="Хадгалах" />
            </form>
        </div>
    );
};

export default Profile;
