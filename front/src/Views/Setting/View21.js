const View21 = ({ setting, handleInput, handleCheck, handleMode }) => (
    <div className="setting-body">
        <p className="setting-section">Автомат хаалтын тохиргоо</p>
        <div className="setting-block">
            <div style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>

                (TCV) нээх / хаах алхам :<br />
                <input
                    type="text"
                    id="w_tcv_t16"
                    value={setting[7][1] ?? ""}
                    onChange={(e) => handleInput(e, 7, 1)}
                />
                <p>[sec]</p>
            </div>
        </div>

        <p className="setting-section">Автомат хаалтын ажиллах горим</p>
        <div className="setting-block">
            <div style={{ justifyContent: "flex-start", width: "100%" }}>

                <div style={{ display: "flex" }}>
                    <input type="checkbox" id="w_tcv_c0" checked={Boolean(setting[7][0] & 2)} onChange={() => handleMode(7, 0, 1)}></input>
                    <p>Гар горим</p>
                </div>
                <div style={{ display: "flex", marginTop: "3px" }}>
                    <input type="checkbox" id="w_tcv_c1" checked={Boolean(setting[7][0] & 1)} onChange={() => handleMode(7, 0, 0)}></input>
                    <p>Горимын температур :</p>
                    <input
                        type="text"
                        value={setting[7][2] ?? ""}
                        onChange={(e) => handleInput(e, 7, 2)}
                        disabled={!Boolean(setting[7][0] & 1)}
                    />
                    <p>[℃]</p>
                </div>
            </div>
        </div>
    </div>
);

export default View21;