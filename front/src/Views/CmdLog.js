import { useState, useEffect } from "react";
import moment from "moment";
import { ExportToExcel } from '../Middleware/ExportToExcel';

const CmdLog = () => {
    const [log, setLog] = useState([]);
    const [userID, setUserID] = useState(localStorage.getItem("user"));
    const [authenticated, setauthenticated] = useState(null);
    const [search, setSearch] = useState(localStorage.getItem("user"));
    const [inp, setInp] = useState('');
    const [message, setMessage] = useState('');
    var action = 'fetch_log'

    useEffect(() => {
        const loggedInUser = localStorage.getItem("authenticated");
        if (loggedInUser) {
            setauthenticated(loggedInUser);
            setUserID(localStorage.getItem("user"))
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:3001/mid', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action, search }),
                });
                const data = await response.json();
                setLog(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [search, action]);
    const handlePrint = async () => {
        let newDate = moment().format("YYYY-MM-DD")
        var check = moment(newDate, 'YYYY/MM/DD');
        var month = check.format('M');
        var day = check.format('D');
        var year = check.format('YYYY');
        var header = ""
        if (search.length > 6)
            header = search + " инженерийн илгээсэн командын тайлан"
        else 
            header = search + " зангилаа руу илгээсэн командын тайлан"

        setTimeout(() => {
            const contentToPrint = document.getElementById('content-to-print').innerHTML;
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`<html><head><title>${header}</title></head><style>
            table, th, td {
                border: 1px solid black;
                border-collapse: collapse;
                text-align: center;
                padding: 2px;
              }</style><body>`);
            printWindow.document.write(`<div style="justify-content: center; ">
            <img src="../Images/logo.png" style="height: 5%"/>
                <h3 style="text-align: center;">${header}</h3>
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
    const handleClick = (event) => {
        setSearch(inp)
        if (userID.includes('EN') && search.length > 5) {
            setMessage("Зангилааны ID алдаатай байна")
            setTimeout(() => {
                setMessage('');
            }, 5000);
        }
        fetch('http://localhost:3001/mid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, search }),
        })
            .then((response) => response.json())
            .then((data) => {
                setLog(data)
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

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
    if (authenticated)
        return (
            <div className="table-container">
                <div style={{ display: 'flex', justifyContent: 'end', margin: '2rem' }}>
                    {message && <div className="alert">{message}</div>}
                    <input type='text'
                        id='log_node'
                        className='inp full'
                        style={{ margin: '0 0.5rem 0 0.5rem', width: '25%' }}
                        value={inp}
                        onChange={(e) => setInp(e.target.value.toUpperCase())} />
                    <button onClick={() => handleClick()} style={{marginRight: '0.5rem'}}>Шүүх</button>
                    <button onClick={() => ExportToExcel(log, search)} style={{marginRight: '0.5rem'}}>Excel татах</button>
                    <button onClick={handlePrint}>Тайлан хэвлэх</button>
                </div>
                <div id='content-to-print'>
                    <table className='logTable'>
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
                        {log.length > 0 && log.map((val, key) => {
                            return (
                                <tbody key={key}>
                                    <tr>
                                        <td>{formatDate(val.cmd_date)}</td>
                                        <td className='link'
                                            onClick={() => window.location.pathname = `/nodeInfo/${val.node_id}`}>{val.node_id}</td>
                                        <td>{val.node_name}</td>
                                        <td>{val.state_name}</td>
                                        <td>{val.cmd_ajiltan}</td>
                                        <td><abbr title={val.command_info}>{val.command_name}</abbr></td>
                                    </tr>
                                </tbody>
                            )
                        })}
                    </table>
                </div>

            </div>
        )
}

export default CmdLog;