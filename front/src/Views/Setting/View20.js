const View10 = ({ setting, handleInput, handleCheck }) => (
    <div className="setting-body">
        <p className="setting-section">Эргэлтийн насос</p>
        <div className="setting-block">
            <div>
                Насос #1 <br />
                <input type="checkbox" id="h_cp_c0" checked={`${(setting[2][0] & 32) ? 'checked' : ''}`} onChange={() => handleCheck(2, 0, 5)}></input>
            </div>
            <div>
                Насос #2 <br />
                <input type="checkbox" id="h_cp_c1" checked={`${(setting[2][0] & 16) ? 'checked' : ''}`} onChange={() => handleCheck(2, 0, 4)}></input>
            </div>
            <div>
                Насос #3 <br />
                <input type="checkbox" id="h_cp_c2" checked={`${(setting[2][0] & 8) ? 'checked' : ''}`} onChange={() => handleCheck(2, 0, 3)}></input>
            </div>
        </div>

        <p className="setting-section">Эргэлтийн насос асаалтын горим</p>
        <div className="setting-block">
            <div className="setting-grid">
                <div style={{ display: 'flex' }}>

                    <input type="checkbox" id="h_cp_c3" checked={`${(setting[2][0] & 4) ? 'checked' : ''}`} onChange={() => handleCheck(2, 0, 2)}></input>
                    <p>Давтамж хувиргагчаар</p>
                </div>

                <div style={{ display: 'flex' }}>
                    <input type="checkbox" id="h_cp_c5" checked={`${(setting[2][0] & 1) ? 'checked' : ''}`} onChange={() => handleCheck(2, 0, 0)}></input>
                    <p>Бүрэн чадлаар </p>
                </div>

                <div style={{ display: 'flex' }}>
                    <input type="checkbox" id="h_cp_c4" checked={`${(setting[2][0] & 2) ? 'checked' : ''}`} onChange={() => handleCheck(2, 0, 1)}></input>
                    <p>Заагдсан давтамжаар :</p>
                    <input
                        type="text"
                        style={{ width: "2rem" , margin: "0 5px" }}
                        value={setting[2][1] ?? ""}
                        onChange={(e) => handleInput(e, 2, 1)}
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
                style={{ width: "2rem" }}
                value={setting[2][2] ?? ""}
                disabled
            />
            <p>Сэлгэх хугацаа : </p>
            <input
                type="text"
                style={{ width: "2rem" }}
                value={setting[2][3] ?? ""}
                onChange={(e) => handleInput(e, 2, 3)}
            />

            <p>[Hr]</p>
        </div>

        <p className="setting-section">Нэмэлт усны насос</p>
        <div className="setting-block">
            <div>
                Насос #1 <br />
                <input type="checkbox" id="h_cp_c6" checked={`${(setting[3][0] & 8) ? 'checked' : ''}`} onChange={() => handleCheck(3, 0, 3)}></input>
            </div>
            <div>
                Насос #2 <br />
                <input type="checkbox" id="h_cp_c7" checked={`${(setting[3][0] & 4) ? 'checked' : ''}`} onChange={() => handleCheck(3, 0, 2)}></input>
            </div>
        </div>

        <p className="setting-section">Нэмэлт усны насос асаалтын горим</p>
        <div className="setting-block">
            <input type="checkbox" id="h_cp_c8" checked={`${(setting[3][0] & 8) ? 'checked' : ''}`} onChange={() => handleCheck(3, 0, 1)}></input>
            <p>Давтамж хувиргагчаар </p>
            <input type="checkbox" id="h_cp_c9" checked={`${(setting[3][0] & 8) ? 'checked' : ''}`} onChange={() => handleCheck(3, 0, 0)}></input>
            <p>Бүрэн чадлаар </p>
        </div>

        <p className="setting-section">Нэмэлт усны насос ажиллах горим</p>
        <div className="setting-block">
            <div className="setting-grid">
                <div style={{ display: 'flex' }}>
                    <p>Барих даралт : </p>
                    <input
                        type="text"
                        style={{ width: "2rem", margin: "0 5px" }}
                        value={setting[3][1] ?? ""}
                        onChange={(e) => handleInput(e, 3, 1)}
                    />
                    <p>[bar]</p>
                </div>
                <div style={{ display: 'flex' }}>
                    <p>Шахах дээд даралт : </p>
                    <input
                        type="text"
                        style={{ width: "2rem", margin: "0 5px" }}
                        value={setting[3][2] ?? ""}
                        onChange={(e) => handleInput(e, 3, 2)}
                    />
                    <p>[bar]</p>
                </div>
                <div>

                </div>
                <div style={{ display: 'flex' }}>
                    <p>Шахах доод даралт :</p>
                    <input
                        type="text"
                        style={{ width: "2rem", margin: "0 5px" }}
                        value={setting[3][3] ?? ""}
                        onChange={(e) => handleInput(e, 3, 3)}
                    />
                    <p>[bar]</p>
                </div>
            </div>
        </div>
    </div>
);

export default View10;