import React from 'react';
import '../Style/Sidebar.css'
import { SidebarData } from './SidebarData';
import { useEffect, useState } from "react";
import { AdminSidebarData } from './AdminSidebarData';

const Sidebar = ({ user, className }) => {
    const [role, setRole] = useState(null);

    useEffect(() => {
        const storedRole = localStorage.getItem("type");
        if (storedRole) setRole(Number(storedRole));
    }, []);

    const filteredSidebarData = React.useMemo(() => {
        if (role === 3) return AdminSidebarData;
        if (role === 1) return SidebarData.filter((item) => item.title !== 'Хэрэглэгч');
        return SidebarData;
    }, [role]);

    const handleLogout = async () => {
        await fetch(`${process.env.REACT_APP_API_URL}/logout`, { method: 'POST', credentials: 'include' });
        localStorage.clear();
        window.location.pathname = '/'
    };

    return (
        <div className={className}>
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