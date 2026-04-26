import '../Style/Modal.css';
import { useState } from 'react';
import { apiPostJSON } from '../utils/api';

const DictionaryForm = ({ show, handleClose, action }) => {
    const showHideClassName = show ? "modal display-block" : "modal display-none";
    const [message, setMessage] = useState('');
    const [info, setInfo] = useState({ id: '', ner: '', tailbar: '', lvl: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!info.id || !info.ner) {
            setMessage("Оруулсан өгөгдөл дутуу/алдаатай байна");
            setTimeout(() => setMessage(''), 5000);
            return;
        }
        const data = await apiPostJSON('/operator', { action, info });
        if (data) {
            setMessage(data.message);
            setTimeout(() => setMessage(''), 5000);
            if (data.message?.includes('!')) {
                setInfo({ id: '', ner: '', tailbar: '', lvl: '' });
                handleClose();
            }
        }
    };

    return (
        <div className={showHideClassName}>
            <section className="modal-main">
                <form onSubmit={handleSubmit} style={{ margin: '2rem' }}>
                    <label>Лавлах ID</label><br />
                    <input className="inp full" type="text" name="id" value={info.id} onChange={handleChange} placeholder="Утгаа оруулна уу" /><br />
                    <label>Лавлах утга</label><br />
                    <input className="inp full" type="text" name="ner" value={info.ner} onChange={handleChange} placeholder="Утгаа оруулна уу" /><br />
                    <label>Лавлах тайлбар</label><br />
                    <input className="inp full" type="text" name="tailbar" value={info.tailbar} onChange={handleChange} placeholder="Утгаа оруулна уу" /><br />
                    <label>Лавлах лвл</label><br />
                    <input className="inp full" type="text" name="lvl" value={info.lvl} onChange={handleChange} placeholder="Утгаа оруулна уу" /><br />
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

export default DictionaryForm;
