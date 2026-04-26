import React from 'react';
import { useEffect, useState } from 'react';
import moment from "moment";
import { ExportToExcel } from '../Middleware/ExportToExcel';
import { apiPostJSON } from '../utils/api';

const Log = () => {
    const [node, setNode]   = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd]     = useState('');
    const [log, setLog]     = useState([]);

    const fetchData = async () => {
        const data = await apiPostJSON('/mid', { action: 'log', node, start, end });
        if (data?.data) setLog(data.data);
    };

    const handleClick = async () => {
        const today = moment().format("YYYY-MM-DD");
        if (start > end || end > today) {
            alert("Оруулсан хугацаа алдаатай байна");
        } else if (!start || !end || node.length < 5) {
            alert("Өгөгдлөө бүрэн оруулна уу?");
        } else {
            await fetchData();
        }
    };

    const handlePrint = () => {
        const today = moment().format("YYYY-MM-DD");
        const check = moment(today, 'YYYY-MM-DD');
        setTimeout(() => {
            const content = document.getElementById('content-to-print').innerHTML;
            const win = window.open('', '_blank');
            win.document.write(`
                <html><head><title>${node}</title>
                <style>table,th,td{border:1px solid black;border-collapse:collapse;text-align:center;padding:2px}</style>
                </head><body>
                <h3 style="text-align:center">${node} зангилааны төлөвийн тайлан</h3>
                <p>Хамаарах огноо : ${start} - ${end}</p>
                <div id="content-to-print">${content}</div>
                <p>Нийт бичлэгийн тоо: ${log.length}</p>
                <p>Хэвлэсэн огноо: ${check.format('YYYY')} оны ${check.format('M')} сарын ${check.format('D')}</p>
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
            <div style={{ display: 'flex', justifyContent: 'space-around', margin: '2rem', textAlign: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <p>Зангилаа:</p>
                    <input type="text" className="inp full" style={{ margin: '0 0.5rem' }}
                        value={node} onChange={e => setNode(e.target.value)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <p>Эхлэх:</p>
                    <input type="date" className="inp full" style={{ margin: '0 0.5rem' }}
                        value={start} onChange={e => setStart(e.target.value)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <p>Дуусах:</p>
                    <input type="date" className="inp full" style={{ margin: '0 0.5rem' }}
                        value={end} onChange={e => setEnd(e.target.value)} />
                    <button onClick={handleClick}>Шүүх</button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => ExportToExcel(log, node + start + end)}>Excel татах</button>
                    <button onClick={handlePrint}>Тайлан хэвлэх</button>
                </div>
            </div>
            <div id="content-to-print">
                <table>
                    <thead>
                        <tr>
                            <th>Огноо</th><th>T11</th><th>T12</th><th>T21</th><th>T22</th>
                            <th>T31</th><th>T41</th><th>T42</th><th>P11</th><th>P12</th>
                            <th>P21</th><th>P22</th><th>P32</th><th>P41</th><th>P42</th>
                            <th>P52</th><th>СТ</th><th>Н1</th><th>Н2</th><th>Н3</th>
                            <th>Х1</th><th>Х1-Н1</th><th>Х1-Н2</th><th>Х2</th><th>Х2-Н1</th><th>Х2-Н2</th>
                        </tr>
                    </thead>
                    <tbody>
                        {log.map((val, key) => (
                            <tr key={key}>
                                <td>{formatDate(val.log_date)}</td>
                                <td>{val.log_t11}</td><td>{val.log_t12}</td>
                                <td>{val.log_t21}</td><td>{val.log_t22}</td>
                                <td>{val.log_t31}</td><td>{val.log_t41}</td><td>{val.log_t42}</td>
                                <td>{val.log_p11}</td><td>{val.log_p12}</td>
                                <td>{val.log_p21}</td><td>{val.log_p22}</td><td>{val.log_p32}</td>
                                <td>{val.log_p41}</td><td>{val.log_p42}</td><td>{val.log_p52}</td>
                                <td>{val.log_sys_state}</td>
                                <td>{val.log_nasos1}</td><td>{val.log_nasos2}</td><td>{val.log_nasos3}</td>
                                <td>{val.log_us_state}</td><td>{val.log_us_nasos1}</td><td>{val.log_us_nasos2}</td>
                                <td>{val.log_hs_state}</td><td>{val.log_hs_nasos1}</td><td>{val.log_hs_nasos2}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Log;
