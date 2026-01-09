const View11 = ({ setting, handleInput, handleCheck }) => (
    <div className="setting-body">
        <p className="setting-section">Эргэлтийн насос</p>
        <div className="setting-block">
            <div>
                Насос #1 <br />
                <input type="checkbox" id="h_cp_c0" checked={`${(setting[2][0] & 32) ? 'checked' : ''}`} onChange={() => handleCheck(2, 0, 5)}></input>
            </div>
        </div>

        <p className="setting-section">Эргэлтийн насос сэлгэлт</p>
        <div className="setting-block">
            <p>Зэрэг ажиллах насосны тоо : </p>
            <input type="text" style={{ width: "2rem" }}></input>
            <p>Сэлгэх хугацаа : </p>
            <input
                type="text"
                style={{ width: "2rem" }}
                value={setting[2][3] ?? ""}
                onChange={(e) => handleInput(e, 2, 3)}
            />

            <p>[Hr]</p>
        </div>
    </div>
);

export default View11;