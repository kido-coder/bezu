const View12 = ({ setting, handleInput, handleCheck, handleMode}) => (
    <div className="setting-body">
        <p className="setting-section">1-р хэлхээ</p>
        <div className="setting-block">
            <div style={{ justifyContent: "flex-start", width: "100%" }}>
                <div style={{ display: "flex", marginTop: "10px"  }}>
                    <input type="checkbox" id="h_s_c0" checked={Boolean(setting[5][1] & 2)} onChange={() => handleCheck(5, 1, 1)}></input>
                    <p>Ирэх температур (T11)</p>
                </div>
                <div style={{ display: "flex", marginTop: "10px" }}>
                    <input type="checkbox" id="h_s_c1" checked={Boolean(setting[5][1] & 1)} onChange={() => handleCheck(5, 1, 0)}></input>
                    <p>Ирэх даралт (P11)</p>
                </div>
                <div style={{ display: "flex", marginTop: "10px"  }}>
                    <input type="checkbox" id="h_s_c2" checked={Boolean(setting[5][0] & 128)} onChange={() => handleCheck(5, 0, 7)}></input>
                    <p>Буцах температур (T12)</p>
                </div>
                <div style={{ display: "flex", marginTop: "10px" }}>
                    <input type="checkbox" id="h_s_c3" checked={Boolean(setting[5][0] & 64)} onChange={() => handleCheck(5, 0, 6)}></input>
                    <p>Буцах даралт (P12)</p>
                </div>
            </div>
        </div>
        <p className="setting-section">2-р хэлхээ</p>
        <div className="setting-block">
            <div style={{ justifyContent: "flex-start", width: "100%" }}>
                <div style={{ display: "flex", marginTop: "10px"  }}>
                    <input type="checkbox" id="h_s_c4" checked={Boolean(setting[5][0] & 32)} onChange={() => handleCheck(5, 0, 5)}></input>
                    <p>Ирэх температур (T21)</p>
                </div>
                <div style={{ display: "flex", marginTop: "10px" }}>
                    <input type="checkbox" id="h_s_c5" checked={Boolean(setting[5][0] & 16)} onChange={() => handleCheck(5, 0, 4)}></input>
                    <p>Ирэх даралт (P21)</p>
                </div>
                <div style={{ display: "flex", marginTop: "10px"  }}>
                    <input type="checkbox" id="h_s_c6" checked={Boolean(setting[5][0] & 8)} onChange={() => handleCheck(5, 0, 3)}></input>
                    <p>Буцах температур (T22)</p>
                </div>
                <div style={{ display: "flex", marginTop: "10px" }}>
                    <input type="checkbox" id="h_s_c7" checked={Boolean(setting[5][0] & 4)} onChange={() => handleCheck(5, 0, 2)}></input>
                    <p>Буцах даралт (P22)</p>
                </div>
            </div>
        </div>
        <p className="setting-section">Бусад</p>
        <div className="setting-block">
            <div style={{ justifyContent: "flex-start", width: "100%" }}>
                <div style={{ display: "flex", marginTop: "10px"  }}>
                    <input type="checkbox" id="h_s_c8" checked={Boolean(setting[5][0] & 2)} onChange={() => handleCheck(5, 0, 1)}></input>
                    <p>Ирэх температур (T31)</p>
                </div>
                <div style={{ display: "flex", marginTop: "10px" }}>
                    <input type="checkbox" id="h_s_c9" checked={Boolean(setting[5][0] & 1)} onChange={() => handleCheck(5, 0, 0)}></input>
                    <p>Ирэх даралт (P32)</p>
                </div>
            </div>
        </div>
    </div>
);

export default View12;