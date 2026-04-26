import { useState, useEffect } from "react";
import { apiPost, apiPostJSON } from '../utils/api';
import { useParams } from "react-router-dom";
import View10 from "./Setting/View10";
import View11 from "./Setting/View11";
import View12 from "./Setting/View12";
import View13 from "./Setting/View13";
import View20 from "./Setting/View20";
import View21 from "./Setting/View21";
import View22 from "./Setting/View22";
import View23 from "./Setting/View23";
import '../Style/Info.css'

const NodeInfo = () => {
    const { id } = useParams();
    const [lastLog, setLastLog] = useState([0, 0, 0]);
    const [edited, setEdited] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [pres, setPres] = useState([-1, -1, -1, -1, -1, -1, -1, -1]);
    const [temp, setTemp] = useState([-51, -51, -51, -51, -51, -51, -51]);
    const [setting, setSetting] = useState([[3, 0, 0, 0],
    [0, 0, 0, 0],
    [33, 0, 0, 0],
    [9, 0, 0, 0],
    [128, 0, 0, 0],
    [255, 3, 0, 0],
    [17, 3, 0, 0],
    [1, 2, 50, 0],
    [31, 0, 0, 0]]);
    const action = 'fetch_last_log';

    const [showConfirm, setShowConfirm] = useState(false);
    const [btnState, setBtnState] = useState([
        [true, false],
        [true, false, false, false]
    ]);

    const [now, setNow] = useState(new Date());
    const formatDateTime = (date) => {
        return date.toLocaleString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };


    const sendUDP = async (node_id, command) => {
        const data = await apiPostJSON('/send-udp', { node_id, command });
        if (data) alert(data.message ?? (data.status === 'ok' ? 'Амжилттай' : 'Алдаа гарлаа'));
    };

    const controlToggle = (btnCase) => {
        let command = "";
        let target;
        switch (btnCase) {
            case 0:
                target = lastLog[0] === 0 ? 1 : 0;
                command = `$#$1${target}2${lastLog[1]}3${lastLog[2]}!`;
                break;
            case 1:
                target = lastLog[1] === 0 ? 1 : 0;
                command = `$#$1${lastLog[0]}2${target}3${lastLog[2]}!`;
                break;
            case 2:
                target = lastLog[2] === 0 ? 1 : 0;
                command = `$#$1${lastLog[0]}2${lastLog[1]}3${target}!`;
                break;
            default: break;
        }
        return command;
    };

    const handleYes = () => {
        setShowConfirm(false);
        setIsActive(false);
        sendUDP(id, '$#$102030!');
    };

    const handleNo = () => {
        setShowConfirm(false);
    };

    function formatTemp(temp) {
        if (temp !== -51) {
            return `${temp}°C`;
        } else {
            return 'err';
        }
    }
    function formatPres(pres) {
        if (pres !== -1) {
            return `${pres}bar`;
        } else {
            return 'err';
        }
    }
    const checkRange = (value, min, max) => {
        if (value >= min && value <= max)
            return true;
        return false;
    }

    const toggleBtn = (row, col) => {
        if (edited) {
            let score = 2;
            //Davtamj
            if (checkRange(setting[2][1], 0, 50))
                score++;
            if (checkRange(setting[6][1], 0, 50))
                score++;
            //Daralt
            if (checkRange(setting[3][1], 0, 16))
                score++;
            if (checkRange(setting[3][2], 0, 16))
                score++;
            if (checkRange(setting[3][3], 0, 16))
                score++;
            //selgeh t
            if (checkRange(setting[2][3], 0, 72))
                score++;
            if (checkRange(setting[6][3], 0, 72))
                score++;
            //selgeh t
            if (checkRange(setting[2][2], 1, 3))
                score++;
            if (checkRange(setting[6][2], 1, 2))
                score++;
            //selgeh t
            if (checkRange(setting[4][3], 20, 99))
                score++;
            if (checkRange(setting[7][2], 20, 99))
                score++;

            if (score === 13)
                setEdited(false);
            else
                alert("Тохиргоо буруу байна шалгаад дахин оролдоно уу?");

        }
        setBtnState(prev => {
            const next = prev.map(r => [...r]);
            if (next[row][col]) return next;
            next[row][col] = true;

            for (let i = 0; i < next[row].length; i++) {
                if (i !== col) next[row][i] = false;
            }

            return next;
        });
    };

    async function fetchData() {
        const data = await apiPostJSON('/mid', { action, id });
        if (!data || !data.length) return;

        const row = data[0];
        const next = [
            parseInt(row.log_command_hc[0]),  // section 1 — heating circuit
            parseInt(row.log_command_hw[0]),  // section 2 — hot water
            parseInt(row.log_command_wc[0]),  // section 3 — water circuit
        ];
        setLastLog(prev =>
            JSON.stringify(prev) !== JSON.stringify(next) ? next : prev
        );

        const newPres = [];
        const newTemp = [];

        for (let i = 0; i < row.log_sensor.length; i += 3) {
            const chunk = row.log_sensor.slice(i, i + 3);
            const index = i / 3;

            if (index < 8) {
                newPres.push(chunk === 'EEE' ? -1 : parseInt(chunk, 10) / 10);
            } else if (index < 15) {
                newTemp.push(chunk === 'EEE' ? -51 : parseInt(chunk, 10));
            }
        }
        setTemp(prev =>
            JSON.stringify(prev) !== JSON.stringify(newTemp) ? newTemp : prev
        );
        setPres(prev =>
            JSON.stringify(prev) !== JSON.stringify(newPres) ? newPres : prev
        );
    };

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 30000);
        const timer = setInterval(() => setNow(new Date()), 1000);

        return () => {
            clearInterval(intervalId);
            clearInterval(timer);
        };
    }, [id]);

    const halaaltPic = (mode) => {
        const images = [];

        const k = `${setting[2][2]}-${setting[2][0]}-${setting[3][0]}-${setting[6][2]}-${setting[6][0]}`;

        if (mode) {
            images.push(
                <img key={`P1C_D-${k}`} src="/images/P1C_D.png" alt="case1" />
            );
            return images;
        }

        switch (setting[2][2]) {
            case 1:
                if (setting[2][0] & 32)
                    images.push(<img key={`P1C-${k}`} src="/images/P1C_D.png" alt="Halaalt case1" />);
                if (setting[2][0] & 16)
                    images.push(<img key={`P2C-${k}`} src="/images/P2C_D.png" alt="Halaalt case1" />);
                if (setting[2][0] & 8)
                    images.push(<img key={`P3C-${k}`} src="/images/P3C_D.png" alt="Halaalt case1" />);
                break;

            case 2:
                if (setting[2][0] & 32)
                    images.push(<img key={`P1L-${k}`} src="/images/P1L_D.png" alt="Halaalt case2" />);
                if (setting[2][0] & 16)
                    images.push(<img key={`P2C-${k}`} src="/images/P2C_D.png" alt="Halaalt case2" />);
                if (setting[2][0] & 8)
                    images.push(<img key={`P3C-${k}`} src="/images/P3C_D.png" alt="Halaalt case2" />);
                break;

            case 3:
                images.push(<img key={`P1L-${k}`} src="/images/P1L_D.png" alt="Halaalt case3" />);
                images.push(<img key={`P2L-${k}`} src="/images/P2L_D.png" alt="Halaalt case3" />);
                images.push(<img key={`P3C-${k}`} src="/images/P3C_D.png" alt="Halaalt case3" />);
                break;
            default: break;
        }

        if (setting[3][0] & 8)
            images.push(<img key={`W1-${k}`} src="/images/W1_D.png" alt="Halaalt nemelt 1" />);
        if (setting[3][0] & 4)
            images.push(<img key={`W2-${k}`} src="/images/W2_D.png" alt="Halaalt nemelt 2" />);

        switch (setting[6][2]) {
            case 1:
                if (setting[6][0] & 16)
                    images.push(<img key={`P6C-${k}`} src="/images/P6C_D.png" alt="Hus case 1" />);
                if (setting[6][0] & 8)
                    images.push(<img key={`P7L-${k}`} src="/images/P7L_D.png" alt="Hus case 1" />);
                break;

            case 2:
                images.push(<img key={`P6L-${k}`} src="/images/P6L_D.png" alt="Hus case 2" />);
                images.push(<img key={`P7L-${k}`} src="/images/P7L_D.png" alt="Hus case 2" />);
                break;
            default: break;
        }

        return images;
    };


    const handleCheck = (row, col, bit) => {
        let data = setting[row][col];
        let mask = setting[row][col] & Math.pow(2, bit)


        if (mask) {
            data = data - mask
        } else {
            mask = Math.pow(2, bit)
            data = data | mask
        }
        setEdited(true);
        setSetting(prev => {
            const copy = [...prev];
            if (row === 2 && col === 0) {
                if (bit >= 3) {
                    copy[2][2] = ((data & Math.pow(2, 5)) >> 5) + ((data & Math.pow(2, 4)) >> 4) + ((data & Math.pow(2, 3)) >> 3)
                }
            }
            if (row === 6 && col === 0) {
                if (bit >= 2) {
                    copy[6][2] = ((data & Math.pow(2, 4)) >> 4) + ((data & Math.pow(2, 3)) >> 3)
                }
            }
            copy[row][col] = data;
            return copy;
        });
    };

    const handleMode = (row, col, bit, mode) => {
        if (mode === 0) {
            let data, data1;
            if (col === 1) {
                data = setting[row][1] | 1;
                data1 = setting[row][0] & 63;
            } else {
                data = setting[row][1] & 0;
                data1 = setting[row][0] & 63;
                data1 = data1 | Math.pow(2, bit)
            }

            setEdited(true);
            setSetting(prev => {
                const copy = [...prev];
                copy[row][1] = data;
                copy[row][0] = data1;
                return copy;
            });
        }
        let data = setting[row][col] & mode;
        let mask = Math.pow(2, bit)
        data = data | mask

        setEdited(true);
        setSetting(prev => {
            const copy = [...prev];
            copy[row][col] = data;
            return copy;
        });
    };

    const handleInput = (event, row, col) => {
        const value = event.target.value;

        // allow empty + digits
        if (!/^\d*$/.test(value)) return;

        setEdited(true);
        setSetting(prev => {
            const copy = prev.map(r => [...r]);
            copy[row][col] = value;
            return copy;
        });
    };

    const views = [
        View10,
        View11,
        View12,
        View13,
        View20,
        View21,
        View22,
        View23
    ];

    const getActiveView = () => {
        const index = btnState[1].findIndex(v => v);
        if (index === -1) return null;

        return btnState[0][0]
            ? views[index]
            : views[4 + index];
    };
    const ActiveView = getActiveView();

    return (
        <div className="table-container node">

            {/* <table border="1" >
                <tbody>
                    {setting.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {[...row]
                                .map((_, i) => row.length - 1 - i)
                                .map(colIndex => (
                                    <td key={colIndex}>{Number(row[colIndex]).toString(2)}</td>
                                ))}
                        </tr>
                    ))}
                </tbody>
            </table> */}
            <div className="info">
                <div className="panel">
                    <div className="diagram-wrapper">
                        <div className="info-header">
                            <div>{formatDateTime(now)}</div>
                            <div>{temp[6]}°C</div>
                        </div>

                        <img src={lastLog[0] ? "/images/B1_E.png" : "/images/B1_D.png"} alt="system diagram" />
                        <img src={lastLog[1] ? "/images/B2L_E.png" : "/images/B2L_D.png"} alt="system diagram" />

                        <div className="sensor temp10">{formatTemp(temp[0])}</div>
                        <div className="sensor press10">{formatPres(pres[0])}</div>
                        <div className="sensor temp11">{formatTemp(temp[1])}</div>
                        <div className="sensor press11">{formatPres(pres[1])}</div>
                        <div className="sensor temp12">{formatTemp(temp[2])}</div>
                        <div className="sensor press12">{formatPres(pres[2])}</div>
                        <div className="sensor temp13">{formatTemp(temp[3])}</div>
                        <div className="sensor press13">{formatPres(pres[3])}</div>
                        <div className="sensor press14">{formatPres(pres[4])}</div>
                        <div className="sensor temp20">{formatTemp(temp[4])}</div>
                        <div className="sensor press20">{formatPres(pres[5])}</div>
                        <div className="sensor temp21">{formatTemp(temp[5])}</div>
                        <div className="sensor press21">{formatPres(pres[6])}</div>
                        <div className="sensor press22">{formatPres(pres[7])}</div>
                        {isActive ? (
                            <>
                                {halaaltPic(1)}
                            </>
                        ) : (
                            <>
                                <div className="sensor warning">
                                    Уг зураг нь төхөөрөмжийн одоогийн төлөв биш болно!
                                </div>
                                {halaaltPic(0)}
                            </>
                        )}

                    </div>

                    <div className="info-buttons">
                        <div>Халаалт</div>
                        <div></div>
                        <div>Халуун ус</div>
                        <div>Тохиргоо</div>
                        <button className={`btn-control ${lastLog[0] ? 'active' : ''}`} onClick={() => sendUDP(id, controlToggle(0))}>Эргэлт<br />{lastLog[0] ? 'УНТРААХ' : 'АСААХ'}</button>
                        <button className={`btn-control ${lastLog[1] ? 'active' : ''}`} onClick={() => sendUDP(id, controlToggle(1))}>Нэмэлт ус<br />{lastLog[1] ? 'УНТРААХ' : 'АСААХ'}</button>
                        <button className={`btn-control ${lastLog[2] ? 'active' : ''}`} onClick={() => sendUDP(id, controlToggle(2))}>Эргэлт<br />{lastLog[2] ? 'УНТРААХ' : 'АСААХ'}</button>
                        <button className={`btn-control`}>Тохиргоо<br />ИЛГЭЭХ</button>
                    </div>

                </div>
            </div>


            <div className="setting">
                <div className="panel">
                    <div className="btn-header">
                        <button className={`btn-upper ${btnState[0][0] ? 'active' : ''}`} onClick={() => toggleBtn(0, 0)}>Халаалт</button>
                        <button className={`btn-upper ${btnState[0][1] ? 'active' : ''}`} onClick={() => toggleBtn(0, 1)}>Хэрэглээний халуун ус</button>
                    </div>
                    <div className="btn-header">
                        <button className={`btn-lower ${btnState[1][0] ? 'active' : ''}`} onClick={() => toggleBtn(1, 0)}>Насос</button>
                        <button className={`btn-lower ${btnState[1][1] ? 'active' : ''}`} onClick={() => toggleBtn(1, 1)}>TCV</button>
                        <button className={`btn-lower ${btnState[1][2] ? 'active' : ''}`} onClick={() => toggleBtn(1, 2)}>Мэдрэгч</button>
                        <button className={`btn-lower ${btnState[1][3] ? 'active' : ''}`} onClick={() => toggleBtn(1, 3)}>Гар горим</button>
                    </div>
                    <div className="active-view-wrapper">
                        {ActiveView && (
                            <ActiveView
                                setting={setting}
                                handleInput={handleInput}
                                handleCheck={handleCheck}
                                handleMode={handleMode}
                            />
                        )}

                        {isActive && (
                            <div
                                className="overlay"
                                onClick={() => setShowConfirm(true)}
                            />
                        )}
                    </div>
                </div>
            </div>
            {showConfirm && (
                <div className="confirm-modal">
                    <div className="confirm-box">
                        <p>Төхөөрөмжийг асаалттай байх үед тохиргоог өөрчлөх хориотой! <br />Төхөөрөмжийг унтраах уу?</p>
                        <button className="button" onClick={handleYes}>Тийм</button>
                        <button className="button no" onClick={handleNo}>Үгүй</button>
                    </div>
                </div>
            )}

        </div>
    )
}

export default NodeInfo;