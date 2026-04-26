import { useState, useEffect } from "react";
import moment from "moment";
import { ExportToExcel } from '../Middleware/ExportToExcel';
import { apiPostJSON, getCurrentUser, getCurrentRole } from '../utils/api';

const CmdLog = () => {
    const currentUser = getCurrentUser();
    const role = getCurrentRole();

    const [log, setLog]       = useState([]);
    const [search, setSearch] = useState(currentUser);
    const [inp, setInp]       = useState('');
    const [message, setMessage] = useState('');

    async function fetchLog(searchVal) {
        const data = await apiPostJSON('/mid', { action: 'fetch_log', search: searchVal });
        if (data) setLog(Array.isArray(data) ? data : []);
    }

    useEffect(() => {
        fetchLog(search);
    }, [search]);

    const handleClick = () => {
        const val = inp.trim().toUpperCase();
        // Engineers can only search by node ID (≤5 chars); block user-ID searches
        if (role === 1 && val.length > 5) {
            setMessage("Зангилааны ID алдаатай байна");
            setTimeout(() => setMessage(''), 5000);
            return;
        }
        setSearch(val || currentUser);
    };

    const handlePrint = () => {
        const header = search.length > 6
            ? `${search} инженерийн илгээсэн командын тайлан`
            : `${search} зангилаа руу илгээсэн командын тайлан`;
        const today = moment().format("YYYY-MM-DD");
        const check = moment(today, 'YYYY-MM-DD');

        setTimeout(() => {
            const content = document.getElementById('content-to-print').innerHTML;
            const win = window.open('', '_blank');
            win.document.write(`
                <html><head><title>${header}</title>
                <style>table,th,td{border:1px solid black;border-collapse:collapse;text-align:center;padding:2px}</style>
                </head><body>
                <div><h3 style="text-align:center">${header}</h3></div>
                <div id="content-to-print">${content}</div>
                <div>
                    <p>Нийт бичлэгийн тоо: ${log.length}</p>
                    <p>Хэвлэсэн огноо: ${check.format('YYYY')} оны ${check.format('M')} сарын ${check.format('D')}</p>
                </div>
                </body></html>
            `);
            win.document.close();
            win.print();
            win.close();
        }, 500);
    };

    function formatDate(raw) {
        return new Date(raw).toLocaleDateString('en-US', {
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
        });
    }

    return (
        <div className="table-container">
            <div style={{ display: 'flex', justifyContent: 'end', margin: '2rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                {message && <div className="alert">{message}</div>}
                <input
                    type="text"
                    className="inp full"
                    style={{ margin: '0', width: '25%', minWidth: '120px' }}
                    value={inp}
                    onChange={e => setInp(e.target.value.toUpperCase())}
                    placeholder="Хайх утга"
                />
                <button onClick={handleClick}>Шүүх</button>
                <button onClick={() => ExportToExcel(log, search)}>Excel татах</button>
                <button onClick={handlePrint}>Тайлан хэвлэх</button>
            </div>
            <div id="content-to-print">
                <table>
                    <thead>
                        <tr>
                            <th>Огноо</th>
                            <th>Зангилааны ID</th>
                            <th>Зангилааны нэр</th>
                            <th>Илгээх үеийн төлөв</th>
                            <th>Илгээсэн ажилтан</th>
                            <th>Илгээсэн команд</th>
                        </tr>
                    </thead>
                    <tbody>
                        {log.map((val, key) => (
                            <tr key={key}>
                                <td>{formatDate(val.cmd_date)}</td>
                                <td className="link" onClick={() => window.location.pathname = `/nodeInfo/${val.node_id}`}>{val.node_id}</td>
                                <td>{val.node_name}</td>
                                <td>{val.state_name}</td>
                                <td>{val.cmd_ajiltan}</td>
                                <td><abbr title={val.command_info}>{val.command_name}</abbr></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CmdLog;
