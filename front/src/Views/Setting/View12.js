const View12 = ({ setting, handleInput, handleCheck, handleMode}) => (
    <div className="setting-body">
        <p className="setting-section">1-р хэлхээ</p>
        <div className="setting-block">
            <div style={{ justifyContent: "flex-start", width: "100%" }}>
                <div style={{ display: "flex", marginTop: "10px"  }}>
                    <input type="checkbox" id="h_tcv_c0" checked={Boolean(setting[4][1] & 1)} onChange={() => handleMode(4, 1, 0, 0)}></input>
                    <p>Ирэх температур (T11)</p>
                </div>
                <div style={{ display: "flex", marginTop: "10px" }}>
                    <input type="checkbox" id="h_tcv_c1" checked={Boolean(setting[4][0] & 128)} onChange={() => handleMode(4, 0, 7, 0)}></input>
                    <p>Ирэх даралт (P11)</p>
                </div>
                <div style={{ display: "flex", marginTop: "10px"  }}>
                    <input type="checkbox" id="h_tcv_c0" checked={Boolean(setting[4][1] & 1)} onChange={() => handleMode(4, 1, 0, 0)}></input>
                    <p>Буцах температур (T12)</p>
                </div>
                <div style={{ display: "flex", marginTop: "10px" }}>
                    <input type="checkbox" id="h_tcv_c1" checked={Boolean(setting[4][0] & 128)} onChange={() => handleMode(4, 0, 7, 0)}></input>
                    <p>Буцах даралт (P12)</p>
                </div>
            </div>
        </div>
        <p className="setting-section">2-р хэлхээ</p>
        <div className="setting-block">
            <div style={{ justifyContent: "flex-start", width: "100%" }}>
                <div style={{ display: "flex", marginTop: "10px"  }}>
                    <input type="checkbox" id="h_tcv_c0" checked={Boolean(setting[4][1] & 1)} onChange={() => handleMode(4, 1, 0, 0)}></input>
                    <p>Ирэх температур (T21)</p>
                </div>
                <div style={{ display: "flex", marginTop: "10px" }}>
                    <input type="checkbox" id="h_tcv_c1" checked={Boolean(setting[4][0] & 128)} onChange={() => handleMode(4, 0, 7, 0)}></input>
                    <p>Ирэх даралт (P21)</p>
                </div>
                <div style={{ display: "flex", marginTop: "10px"  }}>
                    <input type="checkbox" id="h_tcv_c0" checked={Boolean(setting[4][1] & 1)} onChange={() => handleMode(4, 1, 0, 0)}></input>
                    <p>Буцах температур (T22)</p>
                </div>
                <div style={{ display: "flex", marginTop: "10px" }}>
                    <input type="checkbox" id="h_tcv_c1" checked={Boolean(setting[4][0] & 128)} onChange={() => handleMode(4, 0, 7, 0)}></input>
                    <p>Буцах даралт (P22)</p>
                </div>
            </div>
        </div>
        <p className="setting-section">Бусад</p>
        <div className="setting-block">
            <div style={{ justifyContent: "flex-start", width: "100%" }}>
                <div style={{ display: "flex", marginTop: "10px"  }}>
                    <input type="checkbox" id="h_tcv_c0" checked={Boolean(setting[4][1] & 1)} onChange={() => handleMode(4, 1, 0, 0)}></input>
                    <p>Ирэх температур (T31)</p>
                </div>
                <div style={{ display: "flex", marginTop: "10px" }}>
                    <input type="checkbox" id="h_tcv_c1" checked={Boolean(setting[4][0] & 128)} onChange={() => handleMode(4, 0, 7, 0)}></input>
                    <p>Ирэх даралт (P32)</p>
                </div>
            </div>
        </div>
    </div>
);

export default View12;