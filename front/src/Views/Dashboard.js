import { Pie, Line } from "react-chartjs-2";
// eslint-disable-next-line
import Chart from 'chart.js/auto';
import { Get } from "../Middleware/Get";
import { useState, useEffect } from "react";

const Dashboard = () => {
    const [uType, setUType] = useState([]);
    const [one, setOne] = useState([]);
    const [two, setTwo] = useState([]);
    const [three, setThree] = useState([]);
    const time = Array.from(Array(24).keys());
    const yValues = [3, 5, 1, 0, 0, 3, 5, 4, 55, 49, 44, 24, 15, 21, 17, 26, 49, 44, 24, 15, 4, 3, 3, 3];
    const barColors = [
        "#b91d47",
        "#00aba9",
        "#2b5797",
        "#e8c3b9",
        "#1e7145"
    ];
    useEffect(() => {
            Get('usertype', setUType);
            Get('one', setOne);
            Get('two', setTwo);
            Get('three', setThree);
    }, []);
    console.log(one)
    const userChart = uType ? (
        <Pie id="userChart" options='
            responsive: true,' style={{ width: '100%' , maxHeight: '200px'}}
            data={{
                labels: uType.map((uType) => uType.turul_ner),
                datasets: [{
                    backgroundColor: barColors,
                    data: uType.map((uType) => uType.num)
                }]
            }} />
    ) : null;
    const dataChart = uType ? (
        <Pie id="userChart" options='
            responsive: true,' style={{ width: '100%' , maxHeight: '200px'}}
            data={{
                labels: ['Ажилтан төрөл', 'Төлөв', 'Команд'],
                datasets: [{
                    backgroundColor: barColors,
                    data: one.length > 0 ? [one[0].num, two[0].num, three[0].num] : []
                }]
            }} />
    ) : null;
    const userLine =  (
        <Line id="userLine" options='
            responsive: true,' style={{ width: '100%' , maxHeight: '250px'}}
            data={{
                labels: time,
                datasets: [{
                    pointRadius: 5,
                    pointBackgroundColor: "rgba(0,0,255,1)",
                    backgroundColor: "rgba(0,0,255,1)",
                    data: yValues
                }]
            }} />
    );
    return (
        <div className="table-container" style={{textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between'}}>
                <div style={{ width: '100%' }}>
                    <h3>Хэрэглэгчийн төрөл</h3>
                    {userChart}
                </div>
                <div style={{ width: '100%' }}>
                    <h3>Лавлахууд</h3>
                    {dataChart}
                </div>
            </div>
            <div style={{ width: '100%' }}>
                <h3>Хэрэглэгчдийн урсгал</h3>
                {userLine}
            </div>
        </div>
    )
}

export default Dashboard;