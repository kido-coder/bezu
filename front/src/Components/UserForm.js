import '../Style/Modal.css'
import { useState } from 'react';

const UserForm = ({ show, handleClose, userID }) => {
    const showHideClassName = show ? "modal display-block" : "modal display-none";
    const [message, setMessage] = useState([]);
    const [info, setInfo] = useState({ajiltan_id: '', ajiltan_ner: '', ajiltan_utas: '', ajiltan_ovog: '', ajiltan_email:''})
    const handleChange = (event) => {
        const { name, value } = event.target;
        setInfo((prevFormData) => ({ ...prevFormData, [name]: value }));
        console.log(info)
    };
    const action = 'add_user';

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log(info.ajiltan_id.includes('A.EN'))
        if (info.ajiltan_id.length < 7 || info.ajiltan_ner.length === 0 || info.ajiltan_utas.length < 8 ) {
            setMessage("Оруулсан өгөгдөл дутуу/алдаатай байна");
            setTimeout(() => {
                setMessage('');
            }, 5000);
        } else {
            fetch('http://localhost:3001/operator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, info }),
            })
                .then((response) => response.json())
                .then((data) => {
                    setMessage(data.message);
                    setTimeout(() => {
                        setMessage('');
                    }, 5000);
                    if (data.message.includes('!')) {
                        setInfo({ajiltan_id: '', ajiltan_ner: '', ajiltan_utas: '', ajiltan_ovog: '', ajiltan_email:''})
                        handleClose();
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                    setMessage('Aлдаа гарлаа. Та дахин оролдоно уу?.');
                });
        }
    };

    return (
        <div className={showHideClassName}>
            <section className="modal-main">
                <form onSubmit={handleSubmit} style={{ margin: '2rem' }}>
                    <label >Хэрэглэгчийн ID</label><br />
                    <input className='inp full' type="text" id="ajlitan_id" name="ajiltan_id" onChange={handleChange} placeholder="Утгаа оруулна уу" /><br />
                    <label >Хэрэглэгчийн овог</label><br />
                    <input className='inp full' type="text" id="ajiltan_ovog" name="ajiltan_ovog" onChange={handleChange} placeholder="Утгаа оруулна уу" /><br />
                    <label >Хэрэглэгчийн нэр</label><br />
                    <input className='inp full' type="text" id="ajiltan_ner" name="ajiltan_ner" onChange={handleChange} placeholder="Утгаа оруулна уу" /><br />
                    <label >Хэрэглэгчийн утас</label><br />
                    <input className='inp full' type="text" id="ajiltan_utas" name="ajiltan_utas" onChange={handleChange} placeholder="Утгаа оруулна уу" /><br />
                    <label >Хэрэглэгчийн цахим шуудан</label><br />
                    <input className='inp full' type="email" id="ajiltan_email" name="ajiltan_email" onChange={handleChange} placeholder="Утгаа оруулна уу" /><br />
                    {message && <div className="alert">{message}</div>}
                    <div style={{ display: 'flex' }}>
                        <button type="submit" className='close'>
                            Хадгалах
                        </button>
                        <button type="button" className='close' onClick={handleClose}>
                            Хаах
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
};

export default UserForm;