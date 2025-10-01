import React, { useEffect } from 'react';
import { useState } from 'react';

import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

import { Get } from '../Middleware/Get';
import { Delete } from '../Middleware/Delete';
import { confirmAlert } from 'react-confirm-alert';
import Modal from '../Components/Modal';
import DictionaryForm from '../Components/DictionaryForm';

const Dictionary = () => {
    const [ajiltan, setAjiltan] = useState([]);
    const [state, setState] = useState([]);
    const [command, setCommand] = useState([]);
    const [visible, setVisible] = useState(false)
    const [clicked, setClicked] = useState([])
    const [form, setForm] = useState(false)
    const [type, setType] = useState([])

    useEffect(() => {
        async function fetchData() {
            await Get('getAjiltanLavlah', setAjiltan)
            await Get('getStateLavlah', setState)
            await Get('getCommandLavlah', setCommand)
        }
        fetchData()
    }, [])
    function handleState(act) {
        setForm(true)
        setType(act)
    }
    function menu(nodeID, act) {
        setVisible(true);
        setClicked(nodeID)
        setType(act)
    }

    function handleClose() {
        setVisible(false);
        setForm(false);
    }

    function clickedMenu(type) {
        switch (type) {
            case "edit":
                setForm(true)
                break;
            case "delete":
                confirmAlert({
                    title: 'Баталгаажуулалт',
                    message: 'Та уг бичлэгийг устгахдаа итгэлтэй байна уу?',
                    buttons: [
                        {
                            label: 'Тийм',
                            onClick: () => Delete(clicked, ),
                        },
                        {
                            label: 'Үгүй',
                            onClick: () => setVisible(false),
                        },
                    ],
                });
                break;
            default: break;
        }
    }
    return (
        <div className='table-container'>
            <div>
                <Modal show={visible} handleClose={handleClose} nodeID={clicked}>
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
                <DictionaryForm show={form} handleClose={handleClose} action={type}> </DictionaryForm>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3>Ажилтны төрөл</h3>
                    <button onClick={() => handleState('turul_add')} className="button add">Бичлэг нэмэх</button>
                </div>
                <table className='logTable'>
                    <thead>
                        <tr>
                            <th>Төрөл ID</th>
                            <th>Төрөл нэр</th>
                            <th>Төрөл хэлтэс</th>
                            <th></th>
                        </tr>
                    </thead>
                    {ajiltan.length > 0 && ajiltan.map((val, key) => {
                        return (
                            <tbody key={key}>
                                <tr>
                                    <td>{val.turul_id}</td>
                                    <td>{val.turul_ner}</td>
                                    <td>{val.turul_heltes}</td>
                                    <td onClick={() => menu(val.turul_id, 'turul_edit')} className='menuBtn'>{<FormatListBulletedIcon />}</td>
                                </tr>
                            </tbody>
                        )
                    })}
                </table>
            </div>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3>Командууд</h3>
                    <button onClick={() => handleState('command_add')} className="button add">Бичлэг нэмэх</button>
                </div>
                <table className='logTable'>
                    <thead>
                        <tr>
                            <th>Команд ID</th>
                            <th>Команд нэр</th>
                            <th>Команд тайлбар</th>
                            <th></th>
                        </tr>
                    </thead>
                    {command.length > 0 && command.map((val, key) => {
                        return (
                            <tbody key={key}>
                                <tr>
                                    <td>{val.command_id}</td>
                                    <td>{val.command_name}</td>
                                    <td>{val.command_info}</td>
                                    <td onClick={() => menu(val.command_id, 'command_edit')} className='menuBtn'>{<FormatListBulletedIcon />}</td>
                                </tr>
                            </tbody>
                        )
                    })}
                </table>
            </div>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3>Системийн ажиллагааны төлөв</h3>
                    <button onClick={() => handleState('state_add')} className="button add">Бичлэг нэмэх</button>
                </div>
                <table className='logTable'>
                    <thead>
                        <tr>
                            <th>Төлөв ID</th>
                            <th>Төлөв нэр</th>
                            <th>Төлөв левел</th>
                            <th>Төлөв тайлбар</th>
                            <th></th>
                        </tr>
                    </thead>
                    {state.length > 0 && state.map((val, key) => {
                        return (
                            <tbody key={key}>
                                <tr>
                                    <td>{val.state_id}</td>
                                    <td>{val.state_name}</td>
                                    <td>{val.state_lvl}</td>
                                    <td>{val.state_info}</td>
                                    <td onClick={() => menu(val.state_id, 'state_edit')} className='menuBtn'>{<FormatListBulletedIcon />}</td>
                                </tr>
                            </tbody>
                        )
                    })}
                </table>
            </div>
        </div>
    );
};

export default Dictionary;
