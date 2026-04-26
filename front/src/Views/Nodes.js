import React from 'react';
import { useEffect, useState } from "react";
import 'react-confirm-alert/src/react-confirm-alert.css';
import { confirmAlert } from 'react-confirm-alert';

import StarOutlineIcon from '@mui/icons-material/StarOutline';
import StarIcon from '@mui/icons-material/Star';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

import Modal from '../Components/Modal';
import NodeForm from '../Components/NodeForm';
import { ModalData } from "../Components/ModalData";
import { InsertCmd } from '../Middleware/InsertCmd';
import { UpdateStar } from '../Middleware/UpdateStar';
import { ConfirmDelete } from '../Middleware/ConfirmDelete';
import UseAuth from '../Hooks/UseAuth';
import { apiPostJSON, getCurrentRole } from '../utils/api';

const Nodes = () => {
    const [node, setNode] = useState([]);
    const { user } = UseAuth();
    const role = getCurrentRole();
    const [state, setState] = useState(false);
    const [clicked, setClicked] = useState(null);
    const [form, setForm] = useState(false);
    const [formType, setFormType] = useState('edit_node');

    function addNode() { setForm(true); setFormType('add_node'); setClicked(null); }
    function menu(id) { setState(true); setClicked(id); }
    function handleClose() { setState(false); setForm(false); }

    function clickedMenu(type) {
        switch (type) {
            case "edit":
                setForm(true);
                setFormType('edit_node');
                break;
            case "delete":
                confirmAlert({
                    title: 'Баталгаажуулалт',
                    message: 'Та уг зангилааг устгахдаа итгэлтэй байна уу? Зангилааны логууд excel файлаар татагдана.',
                    buttons: [
                        { label: 'Тийм', onClick: () => ConfirmDelete(clicked, 'node') },
                        { label: 'Үгүй', onClick: () => setState(false) },
                    ],
                });
                break;
            default:
                confirmAlert({
                    title: 'Баталгаажуулалт',
                    message: 'Та уг командыг илгээхдээ итгэлтэй байна уу?',
                    buttons: [
                        { label: 'Тийм', onClick: () => InsertCmd(type, user, clicked) },
                        { label: 'Үгүй', onClick: () => setState(false) },
                    ],
                });
        }
    }

    // role 1 = Engineer: no edit/delete
    const filteredModalData = React.useMemo(() => {
        if (role === 1) {
            return ModalData.filter(item => item.cmd !== 'edit' && item.cmd !== 'delete');
        }
        return ModalData.filter(item => !['CW01', 'CH01', 'CH02'].includes(item.cmd));
    }, [role]);

    async function fetchData() {
        if (!user) return;
        const data = await apiPostJSON('/mid', { action: 'fetch_node', user });
        if (data?.data && JSON.stringify(node) !== JSON.stringify(data.data)) {
            setNode(data.data);
        }
    }

    useEffect(() => {
        fetchData();
        const id = setInterval(fetchData, 5000);
        return () => clearInterval(id);
    }, [user]); // re-run when user changes, not on every render

    function setFav(nodeID, starState) {
        UpdateStar(nodeID, user, starState == null);
        fetchData();
    }

    return (
        <div className="table-container">
            {role === 3 && (
                <div style={{ textAlign: 'end', marginRight: '2%' }}>
                    <button onClick={addNode} className="button add">Зангилаа нэмэх</button>
                </div>
            )}
            <Modal show={state} handleClose={handleClose} nodeID={clicked}>
                <ul style={{ margin: '0', padding: '0' }}>
                    {filteredModalData.map((val, key) => (
                        <li key={key} onClick={() => clickedMenu(val.cmd)} className="menuItem">
                            {val.title}
                        </li>
                    ))}
                </ul>
            </Modal>
            <NodeForm show={form} handleClose={handleClose} type={formType} nodeID={clicked} />
            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th>ID</th>
                        <th>Нэр</th>
                        <th>Халаалт - Эргэлт</th>
                        <th>Халаалт - Нэмэлт ус</th>
                        <th>Халуун ус - Эргэлт</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {node.map((val, key) => (
                        <tr key={key}>
                            <td onClick={() => setFav(val.node_id, val.star_node)} className="menuBtn">
                                {val.star_node == null ? <StarOutlineIcon /> : <StarIcon />}
                            </td>
                            <td className="link" onClick={() => window.location.pathname = `nodeInfo/${val.node_id}`}>{val.node_id}</td>
                            <td>{val.node_name}</td>
                            <td style={{ color: val.log_command_hw?.[0] === '1' ? 'green' : 'black' }}>
                                {val.log_command_hc?.[0] === '1' ? 'ON' : 'OFF'}
                            </td>
                            <td style={{ color: val.log_command_hw?.[0] === '1' ? 'green' : 'black' }}>
                                {val.log_command_hw?.[0] === '1' ? 'ON' : 'OFF'}
                            </td>
                            <td style={{ color: val.log_command_hw?.[0] === '1' ? 'green' : 'black' }}>
                                {val.log_command_wc?.[0] === '1' ? 'ON' : 'OFF'}
                            </td>
                            <td onClick={() => menu(val.node_id)} className="menuBtn"><FormatListBulletedIcon /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Nodes;
