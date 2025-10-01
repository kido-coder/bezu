import { useEffect, useState } from "react";
import React from 'react';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { confirmAlert } from 'react-confirm-alert';

import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import StarIcon from '@mui/icons-material/Star';

import Modal from '../Components/Modal'
import { ModalData } from "../Components/ModalData";
import { InsertCmd } from '../Middleware/InsertCmd';
import { UpdateStar } from '../Middleware/UpdateStar';
import { ConfirmDelete } from "../Middleware/ConfirmDelete";

const Home = () => {
  const [node, setNode] = useState([]);
  const [userID, setUserID] = useState([]);
  const [authenticated, setauthenticated] = useState(null);
  const [state, setState] = useState(false)
  const [clicked, setClicked] = useState([])
  var action = 'fav_node';

  function menu(nodeID) {
    setState(true);
    setClicked(nodeID)
  }
  function handleClose() {
    setState(false);
  }
  function clickedMenu(type) {
    switch (type) {
      case "edit":
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
      setUserID(localStorage.getItem("user"))
    }
  }, []);

  async function fetchData() {
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
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  });

  function setFav(nodeID) {
    UpdateStar(nodeID, userID, false)
    fetchData();
  }

  if (!authenticated) {
  } else {
    return (
      <div className="table-container">
        <h3 style={{ marginLeft: '5%' }}>Онцлох зангилаа</h3>
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
          {node.length > 0 && node.map((val, key) => {
            return (
              <tbody key={key}>
                <tr>
                  <td onClick={() => setFav(val.node_id)} className='menuBtn'>{<StarIcon />}</td>
                  <td className='link'
                    onClick={() => window.location.pathname = `/nodeInfo/${val.node_id}`}>{val.node_id}</td>
                  <td>{val.node_name}</td>
                  <td>{val.state_name}</td>
                  <td>{val.log_us_state}</td>
                  <td>{val.log_hs_state}</td>
                  <td>{val.log_state}</td>
                  <td onClick={() => menu(val.node_id)} className='menuBtn'>{<FormatListBulletedIcon />}</td>
                </tr>
              </tbody>
            )
          })}
        </table>
      </div>
    );
  }
};

export default Home;