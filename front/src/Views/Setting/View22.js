const View22 = ({ setting, handleInput, handleCheck, handleMode}) => (
    <div className="setting-body">
        <p className="setting-section">1-р хэлхээ</p>
        <div className="setting-block">
            <div style={{ justifyContent: "flex-start", width: "100%" }}>
                <div style={{ display: "flex", marginTop: "10px"  }}>
                    <input type="checkbox" id="w_s_c0" checked={Boolean(setting[8][0] & 16)} onChange={() => handleCheck(8, 0, 4)}></input>
                    <p>Ирэх температур (T41)</p>
                </div>
                <div style={{ display: "flex", marginTop: "10px" }}>
                    <input type="checkbox" id="w_s_c1" checked={Boolean(setting[8][0] & 8)} onChange={() => handleCheck(8, 0, 3)}></input>
                    <p>Ирэх даралт (P41)</p>
                </div>
                <div style={{ display: "flex", marginTop: "10px"  }}>
                    <input type="checkbox" id="w_s_c2" checked={Boolean(setting[8][0] & 4)} onChange={() => handleCheck(8, 0, 2)}></input>
                    <p>Буцах температур (T42)</p>
                </div>
                <div style={{ display: "flex", marginTop: "10px" }}>
                    <input type="checkbox" id="w_s_c3" checked={Boolean(setting[8][0] & 2)} onChange={() => handleCheck(8, 0, 1)}></input>
                    <p>Буцах даралт (P42)</p>
                </div>
                <div style={{ display: "flex", marginTop: "10px" }}>
                    <input type="checkbox" id="w_s_c4" checked={Boolean(setting[8][0] & 1)} onChange={() => handleCheck(8, 0, 0)}></input>
                    <p>Насосны даралт (P52)</p>
                </div>
            </div>
        </div>
    </div>
);

export default View22;