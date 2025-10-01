import React, { useRef } from 'react';
import { Line } from "react-chartjs-2";
// eslint-disable-next-line
import Chart from 'chart.js/auto';
import { useState } from 'react';
import moment from "moment";
import html2canvas from 'html2canvas';
import { fetchDailyData } from '../Components/ChartData';

const Statistic = () => {
    const [node, setNode] = useState([]);
    const [date, setDate] = useState([]);
    const [data, setData] = useState([]);
    const printableComponentRef = useRef(null);
    const fetchApi = async () => {
        const dailyData = await fetchDailyData(node, date);
        setData(dailyData);
    };

    const handlePrint = async () => {
        const printableComponent = printableComponentRef.current;
        let newDate = moment().format("YYYY-MM-DD")
        var check = moment(newDate, 'YYYY/MM/DD');
        var month = check.format('M');
        var day = check.format('D');
        var year = check.format('YYYY');
        setTimeout(() => {
            html2canvas(printableComponent).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const printWindow = window.open('', '_blank');
                printWindow.document.write(`<html><head><title>${node} ${date}</title></head><body>`);
                printWindow.document.write(`<div style="justify-content: center; ">
                <img src="../Images/logo.png" style="height: 5%"/>
                <h2 style="text-align: center;">${node} зангилааны график тайлан</h2>
                <div style=" margin: 0.5 rem 0 0.5 rem 2rem">
                    <div style="display: flex">
                        <p>Хамаарах огноо : ${date}</p>
                    </div>
                </div>
            </div>
            <img src="${imgData}" style="width:92%; margin-left: auto; margin-right: auto;" />
            <footer style=" margin: 2rem" >
                <div style="display: flex">
                    <p style="margin: 0">Хэвлэсэн огноо: ${year} оны ${month} сарын ${day}</p>
                </div>
                <div style="text-align: end;">
                    <p>Хуудас | 1</p>
                </div>
            </footer>
        </body>
        
        </html>`)
                printWindow.document.close();
                printWindow.print();
                printWindow.close();
            });
        }, 1000);
    };

    const handleClick = async () => {
        let newDate = moment().format("YYYY-MM-DD")
        if (date > newDate) {
            alert("Оруулсан хугацаа алдаатай байна")
        } else if (date.length === 0 || node.length === 0 || node.length < 5) {
            alert("Өгөгдлөө бүрэн оруулна уу?")
        } else {
            await fetchApi();
        }
    }

    const tempChart = data ? (
        <Line id="temp" options='
            responsive: true,
            maintainAspectRatio: false' style={{ width: '95%' }}
            data={{
                labels: data.map((data) => data.date),
                datasets: [
                    {
                        data: data.map((data) => data.t11),
                        label: "T11 ирэх температур",
                        borderColor: "#c61a09",
                        backgroundColor: "#c61a09",
                        fill: false,
                    },
                    {
                        data: data.map((data) => data.t12),
                        label: "T12 буцах температур",
                        borderColor: '#008631',
                        backgroundColor: '#008631',
                        fill: false,
                    },
                    {
                        data: data.map((data) => data.t21),
                        label: "T21 ирэх температур",
                        borderColor: '#fb3b1e',
                        backgroundColor: '#fb3b1e',
                        fill: false,
                    },
                    {
                        data: data.map((data) => data.t22),
                        label: "T22 буцах температур",
                        borderColor: '#1fd655',
                        backgroundColor: '#1fd655',
                        fill: false,
                    },
                    {
                        data: data.map((data) => data.t31),
                        label: "Гадаад температур",
                        borderColor: '#ff8164',
                        backgroundColor: '#ff8164',
                        fill: false,
                    },
                    {
                        data: data.map((data) => data.t41),
                        label: "T41 ирэх температур",
                        borderColor: '#ff8164',
                        backgroundColor: '#ff8164',
                        fill: false,
                    },
                    {
                        data: data.map((data) => data.t42),
                        label: "T42 буцах температур",
                        borderColor: '#83f28f',
                        backgroundColor: '#83f28f',
                        fill: false,
                    },
                ],
            }}
        />
    ) : null;
    const presChart = data ? (
        <Line id="pres" options='
            responsive: true,
            maintainAspectRatio: false' style={{ width: '95%' }}
            data={{
                labels: data.map((data) => data.date),
                datasets: [
                    {
                        data: data.map((data) => data.p11),
                        label: "P11 ирэх даралт",
                        borderColor: "#c61a09",
                        backgroundColor: "#c61a09",
                        fill: false,
                    },
                    {
                        data: data.map((data) => data.p12),
                        label: "P12 буцах даралт",
                        borderColor: '#008631',
                        backgroundColor: '#008631',
                        fill: false,
                    },
                    {
                        data: data.map((data) => data.p21),
                        label: "P21 ирэх даралт",
                        borderColor: '#fb3b1e',
                        backgroundColor: '#fb3b1e',
                        fill: false,
                    },
                    {
                        data: data.map((data) => data.p22),
                        label: "P22 буцах даралт",
                        borderColor: '#1fd655',
                        backgroundColor: '#1fd655',
                        fill: false,
                    },
                    {
                        data: data.map((data) => data.p32),
                        label: "P32 хэлхээ 2 насос",
                        borderColor: '#83f28f',
                        backgroundColor: '#83f28f',
                        fill: false,
                    },
                    {
                        data: data.map((data) => data.p41),
                        label: "P41 ирэх даралт",
                        borderColor: '#ff8164',
                        backgroundColor: '#ff8164',
                        fill: false,
                    },
                    {
                        data: data.map((data) => data.p42),
                        label: "P42 буцах даралт",
                        borderColor: '#83f28f',
                        backgroundColor: '#83f28f',
                        fill: false,
                    },
                    {
                        data: data.map((data) => data.p52),
                        label: "P52 хэлхээ 1 насос",
                        borderColor: '#83f28f',
                        backgroundColor: '#83f28f',
                        fill: false,
                    },
                ],
            }}
        />
    ) : null;
    return (
        <div className='table-container'>
            <div style={{ display: 'flex', justifyContent: 'space-around', margin: '2rem' }}>
                <div style={{ display: 'flex' }}>
                    <p>Зангилаа:</p>
                    <input type='text'
                        className='inp full'
                        style={{ margin: '0 0.5rem 0 0.5rem' }}
                        value={node}
                        onChange={(e) => setNode(e.target.value)} />
                </div>
                <div style={{ display: 'flex' }}>
                    <p>Огноо:</p>
                    <input type='date'
                        className='inp full'
                        style={{ margin: '0 0.5rem 0 0.5rem' }}
                        value={date}
                        onChange={(e) => setDate(e.target.value)} />

                    <button onClick={handleClick}>Шүүх</button>
                </div>
                <div style={{ display: 'flex' }}>
                    <button onClick={handlePrint}>Тайлан хэвлэх</button>
                </div>
            </div>
            <div style={{ textAlign: 'center', justifyContent: 'space-around' }} ref={printableComponentRef}>
                <h3>Температур</h3>
                <div style={{borderStyle: 'solid', width:'98%'}}>{tempChart}</div>
                <h3>Даралт</h3>
                <div style={{borderStyle: 'solid', width:'98%'}}>{presChart}</div>
            </div>
        </div>
    )
}

export default Statistic;