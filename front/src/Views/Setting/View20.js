const View20 = ({ setting, handleInput, handleCheck, handleMode }) => (
    <div className="setting-body">
        <p className="setting-section">Эргэлтийн насос</p>
        <div className="setting-block">
            <div>
                Насос #1 <br />
                <input type="checkbox" id="w_cp_c0" checked={Boolean(setting[6][0] & 16)} onChange={() => handleCheck(6, 0, 4)}></input>
            </div>
            <div>
                Насос #2 <br />
                <input type="checkbox" id="w_cp_c1" checked={Boolean(setting[6][0] & 8)} onChange={() => handleCheck(6, 0, 3)}></input>
            </div>
        </div>

        <p className="setting-section">Эргэлтийн насос асаалтын горим</p>
        <div className="setting-block">
            <div className="setting-grid">
                <div style={{ display: 'flex' }}>
                    <input type="checkbox" id="w_cp_c3" checked={Boolean(setting[6][0] & 4)} onChange={() => handleMode(6, 0, 2, 248)}></input>
                    <p>Давтамж хувиргагчаар</p>
                </div>

                <div style={{ display: 'flex' }}>
                    <input type="checkbox" id="w_cp_c5" checked={Boolean(setting[6][0] & 1)} onChange={() => handleMode(6, 0, 0, 248)}></input>
                    <p>Бүрэн чадлаар </p>
                </div>

                <div style={{ display: 'flex' }}>
                    <input type="checkbox" id="w_cp_c4" checked={Boolean(setting[6][0] & 2)} onChange={() => handleMode(6, 0, 1, 248)}></input>
                    <p>Заагдсан давтамжаар :</p>
                    <input
                        type="text"
                        id="w_cp_t29"
                        value={setting[6][1] ?? ""}
                        onChange={(e) => handleInput(e, 6, 1)}
                        disabled={!(setting[6][0] & 2)}
                        />
                    <p>[Hz]</p>
                </div>
            </div>
        </div>

        <p className="setting-section">Эргэлтийн насос сэлгэлт</p>
        <div className="setting-block">
            <p>Зэрэг ажиллах насосны тоо : </p>
            <input
                type="text"
                id="w_cp_t30"
                value={setting[6][2] ?? ""}
                onChange={(e) => handleInput(e, 6, 2)}
            />
            <p>Сэлгэх хугацаа : </p>
            <input
                type="text"
                id="w_cp_t31"
                value={setting[6][3] ?? ""}
                onChange={(e) => handleInput(e, 6, 3)}
            />
            <p>[Hr]</p>
        </div>
    </div>
);

export default View20;