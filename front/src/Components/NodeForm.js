import '../Style/Modal.css';
import { useState, useEffect } from 'react';
import { apiPostJSON } from '../utils/api';

const NodeForm = ({ show, handleClose, type, nodeID }) => {
    const showHideClassName = show ? "modal display-block" : "modal display-none";
    const [info, setInfo] = useState({ node_id: "", node_name: "", node_address: "" });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInfo(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        if (!show) return;
        if (type === 'add_node') {
            setInfo({ node_id: "", node_name: "", node_address: "" });
            return;
        }
        async function fetchNode() {
            const data = await apiPostJSON('/operator', { action: 'fetch_single_node', nodeID });
            if (data?.[0]) setInfo(data[0]);
        }
        fetchNode();
    }, [show, type, nodeID]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!info.node_name?.trim() || !info.node_address?.trim()) {
            setMessage("Оруулсан өгөгдөл дутуу/алдаатай байна");
            setTimeout(() => setMessage(''), 5000);
            return;
        }
        const action = type === 'add_node' ? 'add_node' : 'edit_node';
        const data = await apiPostJSON('/operator', { action, info });
        if (data) {
            setMessage(data.message);
            setTimeout(() => setMessage(''), 5000);
        }
    };

    return (
        <div className={showHideClassName}>
            <section className="modal-main">
                <form onSubmit={handleSubmit} style={{ margin: '2rem' }}>
                    <label>Зангилааны ID</label><br />
                    <input className="inp full" type="text" name="node_id" value={info.node_id ?? ""} disabled /><br />
                    <label>Зангилааны нэр</label><br />
                    <input className="inp full" type="text" name="node_name" value={info.node_name ?? ""} onChange={handleChange} placeholder="Утгаа оруулна уу" /><br />
                    <label>Зангилааны хаяг</label><br />
                    <input className="inp full" type="text" name="node_address" value={info.node_address ?? ""} onChange={handleChange} placeholder="Утгаа оруулна уу" /><br />
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

export default NodeForm;
