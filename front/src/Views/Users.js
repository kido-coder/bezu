import React from 'react'
import { useEffect, useState } from "react";

import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

import { ConfirmDelete } from '../Middleware/ConfirmDelete';
import { confirmAlert } from 'react-confirm-alert';
import Modal from '../Components/Modal'
import UserForm from '../Components/UserForm';

const Users = () => {
    const [authenticated, setauthenticated] = useState(null);
    const [userList, setUserList] = useState([])
    const [state, setState] = useState(false)
    const [clicked, setClicked] = useState([])
    const [form, setForm] = useState(false)
    var action = 'fetch_user';

    function menu(nodeID) {
        setState(true);
        setClicked(nodeID)
    }
    function handleClose() {
        setState(false);
        setForm(false);
    }
    function handleAdd() {
        setForm(true)
    }
    function clickedMenu(type) {
        switch (type) {
            case "edit":
                window.location.pathname = '/userInfo/' + clicked;
                break;
            case "delete":
                confirmAlert({
                    title: 'Баталгаажуулалт',
                    message: 'Та уг хэрэглэгчийг устгахдаа итгэлтэй байна уу?',
                    buttons: [
                        {
                            label: 'Тийм',
                            onClick: () => ConfirmDelete(clicked, 'user'),
                        },
                        {
                            label: 'Үгүй',
                            onClick: () => setState(false),
                        },
                    ],
                });
                break;
            default: break;
        }
    }
    useEffect(() => {
        const loggedInUser = localStorage.getItem("authenticated");
        if (loggedInUser) {
            setauthenticated(loggedInUser);
        }
    }, []);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:3001/operator', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action }),
                });
                const data = await response.json();
                setUserList(data);

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [action]);

    if (!authenticated) {
    } else
        return (
            <div className='table-container'>
                {localStorage.getItem("user").includes('AD') &&
                    <div style={{ textAlign: 'end', marginRight: '2%' }}><button onClick={handleAdd} className="button add">Хэрэглэгч нэмэх</button></div>
                }
                <Modal show={state} handleClose={handleClose} nodeID={clicked}>
                    <ul style={{ margin: '0', padding: '0' }}>
                        <li onClick={() => clickedMenu('edit')}
                            className='menuItem'>
                            Засах
                        </li>
                        <li onClick={() => clickedMenu('delete')}
                            className='menuItem'>
                            Устгах
                        </li>
                    </ul>
                </Modal>
                <UserForm show={form} handleClose={handleClose}> </UserForm>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Овог</th>
                            <th>Нэр</th>
                            <th>Төрөл</th>
                            <th>Утас</th>
                            <th>Цахим шуудан</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {userList.length > 0 && userList.map((val, key) => {
                            return (
                                <tr key={key}>
                                    <td className='link'
                                        onClick={() => window.location.pathname = `/userInfo/${val.ajiltan_id}`}>{val.ajiltan_id}</td>
                                    <td>{val.ajiltan_ovog}</td>
                                    <td>{val.ajiltan_ner}</td>
                                    <td>{val.turul_ner}</td>
                                    <td>{val.ajiltan_utas}</td>
                                    <td>{val.ajiltan_email}</td>
                                    <td onClick={() => menu(val.ajiltan_id)} className='menuBtn'>{<FormatListBulletedIcon />}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )
}

export default Users;