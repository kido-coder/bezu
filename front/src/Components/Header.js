import React, { useState, useEffect } from 'react'
import '../Style/Header.css'

function Header() {
    const [data, setData] = useState([{ num: 0 }, { num: 0 }]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const responseNodes = await fetch('http://localhost:3001/header', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });

                const dataNodes = await responseNodes.json();
                console.log(dataNodes)
                if (JSON.stringify(data) !== JSON.stringify(dataNodes.data || [])) {
                    setData(dataNodes.data || []);
                }
            } catch (error) {
                console.error('Aldaa garchilaa shdeee :', error);
            }
        };
        fetchData();
        const intervalId = setInterval(fetchData, 5000);
        return () => clearInterval(intervalId);
    }, [data]);

    return (
        <div id='header'>
            <img id="logo" src="/images/logo.png" alt="Logo" onClick={() => {
                window.location.pathname = '/home';
            }} />
            <div id='info'>
                {!localStorage.getItem("user").includes('AD') &&
                    <div id="headerNode">
                        <a href='/nodes'>Нийт зангилаа</a>
                        {data.length > 0 && (
                            <p>{data[0].num}</p>
                        )}
                    </div>
                }
                {!localStorage.getItem("user").includes('EN')  &&
                    <div id="headerUser">
                        <a href='/users'>Нийт хэрэглэгч</a>
                        {data.length > 1 && (
                            <p>{data[1].num}</p>
                        )}
                    </div>
                }
            </div>
        </div>

    );
}

export default Header;