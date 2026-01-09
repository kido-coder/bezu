const imgSrc = ["/images/T000.png", "/images/T100.png", "/images/T125.png", "/images/T150.png", "/images/T175.png", "/images/T200.png", "/images/T225.png"]

const getImageIndex = (value) => {
  const bitToIndex = {
    32: 1, // 1.00
    16: 2, // 1.25
    8:  3, // 1.50
    4:  4, // 1.75
    2:  5, // 2.00
    1:  6  // 2.25
  };

  for (const bit in bitToIndex) {
    if (value & bit) return bitToIndex[bit];
  }

  return 0; // default T000
};

const View11 = ({ setting, handleInput, handleCheck, handleMode }) => (
    <div className="setting-body">
        <p className="setting-section">Автомат хаалтын тохиргоо</p>
        <div className="setting-block">
            <div style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>

                (TCV) нээх / хаах алхам :<br />
                <input
                    type="text"
                    value={setting[4][2] ?? ""}
                    onChange={(e) => handleInput(e, 4, 2)}
                />
                <p>[sec]</p>
            </div>
        </div>

        <p className="setting-section">Автомат хаалтын ажиллах горим</p>
        <div className="setting-block">
            <div style={{ justifyContent: "flex-start", width: "100%" }}>

                <div style={{ display: "flex" }}>
                    <input type="checkbox" id="h_tcv_c0" checked={Boolean(setting[4][1] & 1)} onChange={() => handleMode(4, 1, 0, 0)}></input>
                    <p>Гар горим</p>
                </div>
                <div style={{ display: "flex", marginTop: "3px" }}>
                    <input type="checkbox" id="h_tcv_c1" checked={Boolean(setting[4][0] & 128)} onChange={() => handleMode(4, 0, 7, 0)}></input>
                    <p>Горимын температур :</p>
                    <input
                        type="text"
                        value={setting[2][3] ?? ""}
                        onChange={(e) => handleInput(e, 2, 3)}
                    />
                    <p>[℃]</p>
                </div>
                <div style={{ display: "flex", marginTop: "3px" }}>
                    <input type="checkbox" id="h_tcv_c2" checked={Boolean(setting[4][0] & 64)} onChange={() => handleMode(4, 0, 6, 0)}></input>
                    <p>Температурын муруйн горим</p>
                </div>
            </div>
        </div>

        <div className="active-view-wrapper">
            <div style={{ textAlign: "center" }}>
                <img src={imgSrc[getImageIndex(setting[4][0])]} alt="tempGraph" style={{ width: "80%", padding: "10px 0" }}></img>
                <div style={{ display: "flex", justifyContent: "space-around" }}>
                    <div style={{ textAlign: "center" }}>
                        <input type="checkbox" id="h_tcv_c2" checked={Boolean(setting[4][0] & 32)} onChange={() => handleMode(4, 0, 5, 192)}></input>
                        <p>1.00</p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <input type="checkbox" id="h_tcv_c2" checked={Boolean(setting[4][0] & 16)} onChange={() => handleMode(4, 0, 4, 192)}></input>
                        <p>1.25</p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <input type="checkbox" id="h_tcv_c2" checked={Boolean(setting[4][0] & 8)} onChange={() => handleMode(4, 0, 3, 192)}></input>
                        <p>1.50</p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <input type="checkbox" id="h_tcv_c2" checked={Boolean(setting[4][0] & 4)} onChange={() => handleMode(4, 0, 2, 192)}></input>
                        <p>1.75</p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <input type="checkbox" id="h_tcv_c2" checked={Boolean(setting[4][0] & 2)} onChange={() => handleMode(4, 0, 1, 192)}></input>
                        <p>2.00</p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <input type="checkbox" id="h_tcv_c2" checked={Boolean(setting[4][0] & 1)} onChange={() => handleMode(4, 0, 0, 192)}></input>
                        <p>2.25</p>
                    </div>
                </div>
            </div>
            {!Boolean(setting[4][0] & 64) && (
                <div className="overlay" />
            )}
        </div>
    </div>
);

export default View11;