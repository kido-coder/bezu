import React from 'react';
import { useEffect, useState } from 'react';
import moment from "moment";
import { ExportToExcel } from '../Middleware/ExportToExcel';

const Log = () => {
    const [node, setNode] = useState([]);
    const [start, setStart] = useState([]);
    const [end, setEnd] = useState([]);
    const [log, setLog] = useState([]);
    const [authenticated, setauthenticated] = useState(null);
    var action = 'log';

    useEffect(() => {
        const loggedInUser = localStorage.getItem("authenticated");
        if (loggedInUser) {
            setauthenticated(loggedInUser);
        }
    }, []);

    const fetchData = async () => {
        try {
            const responseLog = await fetch('http://localhost:3001/mid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, node, start, end }),
            });

            const dataLog = await responseLog.json();
            if (JSON.stringify(log) !== JSON.stringify(dataLog.data || [])) {
                setLog(dataLog.data || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const handlePrint = async () => {
        let newDate = moment().format("YYYY-MM-DD")
        var check = moment(newDate, 'YYYY/MM/DD');
        var month = check.format('M');
        var day = check.format('D');
        var year = check.format('YYYY');
        setTimeout(() => {
            const contentToPrint = document.getElementById('content-to-print').innerHTML;
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`<html><head><title>${node}</title></head><style>
            table, th, td {
                border: 1px solid black;
                border-collapse: collapse;
                text-align: center;
                padding: 2px;
              }</style><body>`);
            printWindow.document.write(`<div style="justify-content: center; ">
            <img src="../Images/logo.png" style="height: 5%"/>
                <h3 style="text-align: center;">${node} зангилааны төлөвийн тайлан</h3>
                <p>Хамаарах огноо : ${start} - ${end}</p>
            </div>
            <div id="content-to-print">${contentToPrint}</div>
                <div>
                    <p style="margin-top: 1rem">Нийт бичлэгийн тоо: ${log.length}</p>
                    <p style="margin: 0">Хэвлэсэн огноо: ${year} оны ${month} сарын ${day}</p>
                </div>
        </body>
        
        </html>`)
            printWindow.document.close();
            printWindow.print();
            printWindow.close();
        }, 1000);
    };
    const handleClick = async () => {
        let newDate = moment().format("YYYY-MM-DD")
        if (start > end || end > newDate) {
            alert("Оруулсан хугацаа алдаатай байна")
        } else if (start.length === 0 || end.length === 0 || node.length === 0 || node.length < 5) {
            alert("Өгөгдлөө бүрэн оруулна уу?")
        } else {
            await fetchData();
        }
    }
    function formatDate(raw) {
        const formattedDate = new Date(raw);
        const options = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        };

        return formattedDate.toLocaleDateString('en-US', options);
    }
    if (!authenticated) {
    } else {
        return (
            <div className='table-container'>
                <div style={{ display: 'flex', justifyContent: 'space-around', margin: '2rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex' }}>
                        <p>Зангилаа:</p>
                        <input type='text'
                            id='log_node'
                            className='inp full'
                            style={{ margin: '0 0.5rem 0 0.5rem' }}
                            value={node}
                            onChange={(e) => setNode(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex' }}>
                        <p>Эхлэх:</p>
                        <input type='date'
                            id='start'
                            className='inp full'
                            style={{ margin: '0 0.5rem 0 0.5rem' }}
                            value={start}
                            onChange={(e) => setStart(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', textAlign: 'center' }}>
                        <p>Дуусах:</p>
                        <input type='date'
                            id='end'
                            className='inp full'
                            style={{ margin: '0 0.5rem 0 0.5rem' }}
                            value={end}
                            onChange={(e) => setEnd(e.target.value)} />

                        <button onClick={handleClick}>Шүүх</button>
                    </div>
                    <div style={{ display: 'flex', textAlign: 'center' }}>
                        <button onClick={() => ExportToExcel(log, node + start + end)} style={{marginRight: '0.5rem'}}>Excel татах</button>
                        <button onClick={handlePrint}>Тайлан хэвлэх</button>
                    </div>
                </div>
                <div id='content-to-print'>
                    <table className='logTable'>
                        <thead>
                            <tr>
                                <th>Огноо</th>
                                <th>T11</th>
                                <th>T12</th>
                                <th>T21</th>
                                <th>T22</th>
                                <th>T31</th>
                                <th>T41</th>
                                <th>T42</th>
                                <th>P11</th>
                                <th>P12</th>
                                <th>P21</th>
                                <th>P22</th>
                                <th>P32</th>
                                <th>P41</th>
                                <th>P42</th>
                                <th>P52</th>
                                <th>СТ</th>
                                <th>Н1</th>
                                <th>Н2</th>
                                <th>Н3</th>
                                <th>Х1</th>
                                <th>Х1-Н1</th>
                                <th>Х1-Н2</th>
                                <th>Х2</th>
                                <th>Х2-Н1</th>
                                <th>Х2-Н2</th>
                            </tr>
                        </thead>
                        {log.length > 0 && log.map((val, key) => {
                            return (
                                <tbody key={key}>
                                    <tr>
                                        <td>{formatDate(val.log_date)}</td>
                                        <td>{val.log_t11}</td>
                                        <td>{val.log_t12}</td>
                                        <td>{val.log_t21}</td>
                                        <td>{val.log_t22}</td>
                                        <td>{val.log_t31}</td>
                                        <td>{val.log_t41}</td>
                                        <td>{val.log_t42}</td>
                                        <td>{val.log_p11}</td>
                                        <td>{val.log_p12}</td>
                                        <td>{val.log_p21}</td>
                                        <td>{val.log_p22}</td>
                                        <td>{val.log_p32}</td>
                                        <td>{val.log_p41}</td>
                                        <td>{val.log_p42}</td>
                                        <td>{val.log_p52}</td>
                                        <td>{val.log_sys_state}</td>
                                        <td>{val.log_nasos1}</td>
                                        <td>{val.log_nasos2}</td>
                                        <td>{val.log_nasos3}</td>
                                        <td>{val.log_us_state}</td>
                                        <td>{val.log_us_nasos1}</td>
                                        <td>{val.log_us_nasos2}</td>
                                        <td>{val.log_hs_state}</td>
                                        <td>{val.log_hs_nasos1}</td>
                                        <td>{val.log_hs_nasos2}</td>
                                    </tr>
                                </tbody>
                            )
                        })}
                    </table>
                </div>
            </div >
        )
    }
}

export default Log