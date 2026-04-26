import '../Style/Modal.css'

const Modal = ({ handleClose, show, children, nodeID }) => {
    const showHideClassName = show ? "modal display-block" : "modal display-none";

    // Guard: nodeID can be null / undefined before a row is clicked
    const id = nodeID != null ? String(nodeID) : '';
    let label;
    if (id.length > 5)      label = "Ажилтан ID : " + id;
    else if (id.length > 2) label = "Зангилаа ID : " + id;
    else                     label = "Бичлэгийн ID : " + id;
    return (
        <div className={showHideClassName}>
            <section className="modal-main">
                <p style={{ margin: '1rem 0 1rem 1rem', fontWeight: 'bold' }}>{label}</p>
                {children}
                <button type="button" className='close' onClick={handleClose}>
                    Буцах
                </button>
            </section>
        </div>
    );
};

export default Modal;