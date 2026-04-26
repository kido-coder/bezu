import '../Style/Modal.css';
import { useState } from 'react';
import { apiPostJSON } from '../utils/api';

const UserForm = ({ show, handleClose }) => {
    const showHideClassName = show ? "modal display-block" : "modal display-none";
    const [message, setMessage] = useState('');
    const [info, setInfo] = useState({ ajiltan_id: '', ajiltan_ner: '', ajiltan_utas: '', ajiltan_ovog: '', ajiltan_email: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (info.ajiltan_id.length < 7 || !info.ajiltan_ner || info.ajiltan_utas.length < 8) {
            setMessage("Оруулсан өгөгдөл дутуу/алдаатай байна");
            setTimeout(() => setMessage(''), 5000);
            return;
        }
        const data = await apiPostJSON('/operator', { action: 'add_user', info });
        if (data) {
            setMessage(data.message);
            setTimeout(() => setMessage(''), 5000);
            if (data.message?.includes('!')) {
                setInfo({ ajiltan_id: '', ajiltan_ner: '', ajiltan_utas: '', ajiltan_ovog: '', ajiltan_email: '' });
                handleClose();
            }
        }
    };

    return (
        <div className={showHideClassName}>
            <section className="modal-main">
                <form onSubmit={handleSubmit} style={{ margin: '2rem' }}>
                    <label>Хэрэглэгчийн ID</label><br />
                    <input className="inp full" type="text" name="ajiltan_id" value={info.ajiltan_id} onChange={handleChange} placeholder="Утгаа оруулна уу" /><br />
                    <label>Хэрэглэгчийн овог</label><br />
                    <input className="inp full" type="text" name="ajiltan_ovog" value={info.ajiltan_ovog} onChange={handleChange} placeholder="Утгаа оруулна уу" /><br />
                    <label>Хэрэглэгчийн нэр</label><br />
                    <input className="inp full" type="text" name="ajiltan_ner" value={info.ajiltan_ner} onChange={handleChange} placeholder="Утгаа оруулна уу" /><br />
                    <label>Хэрэглэгчийн утас</label><br />
                    <input className="inp full" type="text" name="ajiltan_utas" value={info.ajiltan_utas} onChange={handleChange} placeholder="Утгаа оруулна уу" /><br />
                    <label>Хэрэглэгчийн цахим шуудан</label><br />
                    <input className="inp full" type="email" name="ajiltan_email" value={info.ajiltan_email} onChange={handleChange} placeholder="Утгаа оруулна уу" /><br />
                    {message && <div className="alert">{message}</div>}
                    <div style={{ display: 'flex' }}>
                        <button type="submit" className="close">Хадгалах</button>
                        <button type="button" className="close" onClick={handleClose}>Хаах</button>
                    </div>
                </form>
            </section>
        </div>
    );
};

export default UserForm;
