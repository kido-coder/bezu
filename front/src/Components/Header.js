import React, { useState, useEffect } from 'react'
import '../Style/Header.css'

function Header() {
    const [data, setData] = useState([{ num: 0 }, { num: 0 }]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const responseNodes = await fetch(`${process.env.REACT_APP_API_URL}/header`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include', 
                    token: localStorage.getItem('authToken')
                });

                const dataNodes = await responseNodes.json();
                if (JSON.stringify(data) !== JSON.stringify(dataNodes.data || [])) {
                    setData(dataNodes.data || []);
                }
            } catch (error) {
                console.error('Aldaa garchilaa shdeee :', error);
            }
        };
        fetchData();
        const intervalId = setInterval(fetchData, 100000);
        return () => clearInterval(intervalId);
    }, [data]);

    return (
        <div id='header'>
            <div id='info'>
                {process.env.REACT_APP_T1 === localStorage.getItem("type") &&
                    <div id="headerNode">
                        <a href='/nodes'>Нийт зангилаа</a>
                        {data.length > 0 && (
                            <p>{data[0].num}</p>
                        )}
                    </div>
                }
                {process.env.REACT_APP_T2 === localStorage.getItem("type") &&
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