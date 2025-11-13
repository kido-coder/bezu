import React from 'react';
import '../Style/Sidebar.css'
import { SidebarData } from './SidebarData';
import { useEffect, useState } from "react";
import { AdminSidebarData } from './AdminSidebarData';

function Sidebar() {
    const [userID, setUserID] = useState([]);

    useEffect(() => {
        const loggedInUser = localStorage.getItem("authenticated");
        if (loggedInUser) {
            setUserID(localStorage.getItem("user"))
        }
    }, []);
    
    const filteredSidebarData = React.useMemo(() => {
        if (userID.length > 0 && userID.includes('EN')) {
            return SidebarData.filter((item) => item.title !== 'Хэрэглэгч');
        } else if (userID.includes('AD')) {
            return AdminSidebarData;
        } else {
            return SidebarData;
        }
    }, [userID]);

    const handleLogout = async () => {
        await fetch(`${process.env.REACT_APP_API_URL}/logout`, { method: 'POST', credentials: 'include' });
        localStorage.clear();
        window.location.pathname = '/'
    };

    return (
        <div className='Sidebar'>
            <div id='userSection'>
                <img id="logo" src="/images/logo.png" alt="Logo" onClick={() => { window.location.pathname = '/home' }} />
            </div>
            <ul className='SidebarList'>
                {filteredSidebarData.map((val, key) => {
                    return (
                        <li key={key}
                            className='row'
                            id={window.location.pathname === val.link ? "active" : ""}
                            onClick={() => {
                                window.location.pathname = val.link;
                            }}>

                            <div id="icon">{val.icon}</div>
                            <div id='title'>{val.title}</div>
                        </li>
                    )
                })}
            </ul>
            <button onClick={handleLogout} className='logout'>Гарах</button>
        </div>
    )
}

export default Sidebar;