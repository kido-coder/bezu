import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const UserInfo = () => {
    const { id } = useParams();
    const [info, setInfo] = useState([]);
    const [message, setMessage] = useState('');
    const action = "fetch_single_user"

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:3001/operator', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action, id }),
                });
                const data = await response.json();
                setInfo(data[0]);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [action, id]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setInfo((prevFormData) => ({ ...prevFormData, [name]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        fetch('http://localhost:3001/operator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: "update_user", info }),
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
                    </div>
                    <div style={{ paddingLeft: '1.5rem' }}>
                        <input type="text" id="ajiltan_id" name="ajiltan_id" value={info.ajiltan_id} onChange={handleChange} readOnly /><br />
                        <input type="text" id="ajiltan_ovog" name="ajiltan_ovog" value={info.ajiltan_ovog} onChange={handleChange} /><br />
                        <input type="text" id="ajiltan_ner" name="ajiltan_ner" value={info.ajiltan_ner} onChange={handleChange} /><br />
                        <input type="text" id="ajiltan_utas" name="ajiltan_utas" value={info.ajiltan_utas} onChange={handleChange} /><br />
                        <input type="email" id="ajiltan_email" name="ajiltan_email" value={info.ajiltan_email} onChange={handleChange} /><br />
                        <input type="text" id="turul_ner" name="email" value={info.turul_ner} onChange={handleChange} readOnly /><br />
                    </div>
                </div>
                {message && <div className="alert">{message}</div>}
                <input type="submit" className="button" />
            </form>
        </div>
    )
}

export default UserInfo;