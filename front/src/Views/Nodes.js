import React from 'react';
import { useEffect, useState } from "react";
import 'react-confirm-alert/src/react-confirm-alert.css';
import { confirmAlert } from 'react-confirm-alert';

import StarOutlineIcon from '@mui/icons-material/StarOutline';
import StarIcon from '@mui/icons-material/Star';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

import Modal from '../Components/Modal'
import NodeForm from '../Components/NodeForm';
import { ModalData } from "../Components/ModalData";
import { InsertCmd } from '../Middleware/InsertCmd';
// import { DeleteNode } from '../Middleware/DeleteNode';
import { UpdateStar } from '../Middleware/UpdateStar';
import { ConfirmDelete } from '../Middleware/ConfirmDelete';

const Nodes = () => {
    const [node, setNode] = useState([]);
    const [userID, setUserID] = useState(localStorage.getItem("user"));
    const [authenticated, setauthenticated] = useState(null);
    const [state, setState] = useState(false)
    const [clicked, setClicked] = useState([])
    const [form, setForm] = useState(false)
    const [type, setType] = useState('edit_node')
    var action = 'fetch_node';

    function addNode() {
        setForm(true);
        setType('add_node')
        setClicked('blah')
    }

    function menu(nodeID) {
        setState(true);
        setClicked(nodeID)
    }

    function handleClose() {
        setState(false);
        setForm(false)
    }

    function clickedMenu(type) {
        switch (type) {
            case "edit":
                setForm(true)
                setType('edit_node')
                break;
            case "delete":
                confirmAlert({
                    title: 'Баталгаажуулалт',
                    message: 'Та уг зангилааг устгахдаа итгэлтэй байна уу? Зангилааны логууд excel файлаар татагдана.',
                    buttons: [
                        {
                            label: 'Тийм',
                            onClick: () => ConfirmDelete(clicked, 'node'),
                        },
                        {
                            label: 'Үгүй',
                            onClick: () => setState(false),
                        },
                    ],
                });
                break;
            default:
                confirmAlert({
                    title: 'Баталгаажуулалт',
                    message: 'Та уг командыг илгээхдээ итгэлтэй байна уу?',
                    buttons: [
                        {
                            label: 'Тийм',
                            onClick: () => InsertCmd(type, userID, clicked),
                        },
                        {
                            label: 'Үгүй',
                            onClick: () => setState(false),
                        },
                    ],
                });
        }
    }

    const filteredModalData = React.useMemo(() => {
        var filtered = [];
        if (userID.length > 0 && userID.includes('EN')) {
            filtered = ModalData.filter((item) => item.cmd !== 'edit');
            filtered = filtered.filter((item) => item.cmd !== 'delete');
            return filtered;
        } else {
            filtered = ModalData.filter((item) => item.cmd !== 'CW01');
            filtered = filtered.filter((item) => item.cmd !== 'CH01');
            filtered = filtered.filter((item) => item.cmd !== 'CH02');
            return filtered;
        }
    }, [userID]);

    useEffect(() => {
        const loggedInUser = localStorage.getItem("authenticated");
        if (loggedInUser) {
            setauthenticated(loggedInUser);
            setUserID(localStorage.getItem("user"));
        }
    }, []);

    async function fetchData () {
        try {
          const responseNodes = await fetch('http://localhost:3001/mid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, userID }),
          });

          const dataNodes = await responseNodes.json();
          if (JSON.stringify(node) !== JSON.stringify(dataNodes.data || [])) {
            setNode(dataNodes.data || []);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
    useEffect(() => {
        fetchData();
        console.log(node)
        const intervalId = setInterval(fetchData, 5000);
        return () => clearInterval(intervalId);
    });

    function setFav(nodeID, state) {
        var sta = false
        if (state == null)
            sta = true
        UpdateStar(nodeID, userID, sta)
        fetchData();
    }

    if (!authenticated) {
    } else {
        return (
            <div className="table-container">
                {userID.includes('DC') &&
                    <div style={{ textAlign: 'end', marginRight: '2%' }}><button onClick={() => addNode()} className="button add">Зангилаа нэмэх</button></div>
                }

                <Modal show={state} handleClose={handleClose} nodeID={clicked}>
                    <ul style={{ margin: '0', padding: '0' }}>
                        {filteredModalData.map((val, key) => {
                            return (
                                <li key={key}
                                    onClick={() => clickedMenu(val.cmd)}
                                    className='menuItem'>
                                    {val.title}
                                </li>
                            )
                        })}
                    </ul>
                </Modal>
                <NodeForm show={form} handleClose={handleClose} type={type} nodeID={clicked}> </NodeForm>
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>ID</th>
                            <th>Нэр</th>
                            <th>Системийн төлөв</th>
                            <th>1-р хэлхээ</th>
                            <th>2-р хэлхээ</th>
                            <th>Тайлбар</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {node.length > 0 && node.map((val, key) => {
                            return (
                                <tr key={key}>
                                    <td onClick={() => setFav(val.node_id, val.star_node)} className='menuBtn'>{val.star_node == null ? <StarOutlineIcon /> : <StarIcon />}</td>
                                    <td className='link'
                                        onClick={() => window.location.pathname = `nodeInfo/${val.node_id}`}>{val.node_id}</td>
                                    <td>{val.node_name}</td>
                                    <td>{val.state_name}</td>
                                    <td>{val.log_us_state}</td>
                                    <td>{val.log_hs_state}</td>
                                    <td>{val.log_state}</td>
                                    <td onClick={() => menu(val.node_id)} className='menuBtn'>{<FormatListBulletedIcon />}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        );
    }
};

export default Nodes;