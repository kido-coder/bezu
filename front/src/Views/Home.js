import { useEffect, useState } from "react";
import React from 'react';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { confirmAlert } from 'react-confirm-alert';

import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import StarIcon from '@mui/icons-material/Star';

import Modal from '../Components/Modal';
import { ModalData } from "../Components/ModalData";
import { InsertCmd } from '../Middleware/InsertCmd';
import { UpdateStar } from '../Middleware/UpdateStar';
import { ConfirmDelete } from "../Middleware/ConfirmDelete";
import UseAuth from '../Hooks/UseAuth';
import { apiPostJSON, getCurrentRole } from '../utils/api';

const Home = () => {
  const [node, setNode] = useState([]);
  const [state, setState] = useState(false);
  const [clicked, setClicked] = useState(null);
  const { user } = UseAuth();
  const role = getCurrentRole();

  function menu(nodeID)  { setState(true); setClicked(nodeID); }
  function handleClose() { setState(false); }

  function clickedMenu(type) {
    switch (type) {
      case "edit": break;
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

  // role 1 = Engineer: no edit/delete; roles 2/3 = Dispatcher/Admin: no command buttons
  const filteredModalData = React.useMemo(() => {
    if (role === 1) {
      return ModalData.filter(item => item.cmd !== 'edit' && item.cmd !== 'delete');
    }
    return ModalData.filter(item => !['CW01', 'CH01', 'CH02'].includes(item.cmd));
  }, [role]);

  async function fetchData() {
    const data = await apiPostJSON('/mid', { action: 'fav_node', user });
    if (data?.data && JSON.stringify(node) !== JSON.stringify(data.data)) {
      setNode(data.data);
    }
  }

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 5000);
    return () => clearInterval(id);
  }, [user]); // re-run when user changes, not on every render

  function setFav(nodeID) {
    UpdateStar(nodeID, user, false);
    fetchData();
  }

  return (
    <div className="table-container">
      <h3 style={{ marginLeft: '5%' }}>Онцлох зангилаа</h3>
      <Modal show={state} handleClose={handleClose} nodeID={clicked}>
        <ul style={{ margin: '0', padding: '0' }}>
          {filteredModalData.map((val, key) => (
            <li key={key} onClick={() => clickedMenu(val.cmd)} className="menuItem">
              {val.title}
            </li>
          ))}
        </ul>
      </Modal>
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
          {node.map((val, key) => (
            <tr key={key}>
              <td onClick={() => setFav(val.node_id)} className="menuBtn"><StarIcon /></td>
              <td className="link" onClick={() => window.location.pathname = `/nodeInfo/${val.node_id}`}>{val.node_id}</td>
              <td>{val.node_name}</td>
              <td>{val.state_name}</td>
              <td>{val.log_us_state}</td>
              <td>{val.log_hs_state}</td>
              <td>{val.log_state}</td>
              <td onClick={() => menu(val.node_id)} className="menuBtn"><FormatListBulletedIcon /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Home;
