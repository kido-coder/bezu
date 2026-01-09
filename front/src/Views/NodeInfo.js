import { useState, useEffect } from "react";
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
    const [lastLog, setLastLog] = useState([]);
    const [edited, setEdited] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [setting, setSetting] = useState([[3, 0, 0, 0],
    [0, 0, 0, 0],
    [33, 0, 0, 0],
    [9, 0, 0, 0],
    [128, 0, 0, 0],
    [255, 3, 0, 0],
    [17, 3, 0, 0],
    [1, 0, 0, 0],
    [31, 0, 0, 0]]);
    const action = 'fetch_last_log';

    const [btnState, setBtnState] = useState([
        [true, false],
        [true, false, false, false]
    ]);

    const beepSound = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";

    const playAlarm = () => {
        const audio = new Audio(beepSound);
        audio.play().catch(() => console.warn("Audio playback failed."));
    };

    const [showConfirm, setShowConfirm] = useState(false);

    const handleYes = () => {
        setShowConfirm(false);
        setIsActive(false);
    };

    const handleNo = () => {
        setShowConfirm(false);
    };


    const toggleBtn = (row, col) => {
        if (edited) {
            playAlarm();
            alert("Data logic check");
            setEdited(false);
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
        try {
            const responseLog = await fetch(`${process.env.REACT_APP_API_URL}/mid`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, id }),
            });

            const dataLog = await responseLog.json();
            if (JSON.stringify(lastLog) !== JSON.stringify(dataLog || [])) {
                setLastLog(dataLog || []);
            }
            // console.log(lastLog)
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 30000);
        return () => clearInterval(intervalId);
    });

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
            <div className="info">
                <table border="1" cellPadding="6">
                    <tbody>
                        {setting.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, colIndex) => (
                                    <td key={colIndex}>{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="setting">
                <div className="panel">
                    <p>Системийн тохиргоо</p>
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