const url = "http://localhost:3001/mid";
var action = "statistic";

export const fetchDailyData = async (node, date) => {
    function formatDate(raw) {
        const formattedDate = new Date(raw);
        const options = {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        };

        return formattedDate.toLocaleDateString('en-US', options);
    }
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, node, date }),
        });
        const data = await res.json();
        const log = data.data
        const modifiedData = log.map((logData) => ({
            date: formatDate(logData.log_date),
            t11: logData.log_t11,
            t12: logData.log_t12,
            t21: logData.log_t21,
            t22: logData.log_t22,
            t31: logData.log_t31, 
            t41: logData.log_t41, 
            t42: logData.log_t42,
            p11: logData.log_p11,
            p12: logData.log_p12,
            p21: logData.log_p21,
            p22: logData.log_p22,
            p32: logData.log_p32,
            p41: logData.log_p41,
            p42: logData.log_p42,
            p52: logData.log_p52,
        }));
        return modifiedData;
    } catch (err) {
        console.log(err);
    }
};