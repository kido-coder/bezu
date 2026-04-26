import React, { useState, useEffect } from 'react';
import '../Style/Header.css';

function Header() {
    const [data, setData] = useState([{ num: 0 }, { num: 0 }]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/header`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',   // sends the httpOnly cookie automatically
                });
                if (!res.ok) return;
                const json = await res.json();
                setData(json.data || []);
            } catch (err) {
                console.error('Header fetch error:', err);
            }
        };

        fetchData();
        const id = setInterval(fetchData, 60_000);   // refresh every 60 s
        return () => clearInterval(id);
    }, []);   // ← empty array: run once on mount, never re-subscribe

    // Role is stored as the raw number (1 = Engineer, 2 = Dispatcher, 3 = Admin)
    const role = Number(localStorage.getItem('type'));

    return (
        <div id="header">
            <div id="info">
                {/* Admins see node count */}
                {role === 3 && (
                    <div id="headerNode">
                        <a href="/nodes">Нийт зангилаа</a>
                        <p>{data[0]?.num ?? 0}</p>
                    </div>
                )}
                {/* Admins see user count */}
                {role === 3 && (
                    <div id="headerUser">
                        <a href="/users">Нийт хэрэглэгч</a>
                        <p>{data[1]?.num ?? 0}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Header;
