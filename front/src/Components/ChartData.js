import { apiPostJSON } from '../utils/api';

export const fetchDailyData = async (node, date) => {
    function formatTime(raw) {
        return new Date(raw).toLocaleTimeString('en-US', {
            hour: 'numeric', minute: 'numeric', second: 'numeric',
        });
    }

    const data = await apiPostJSON('/mid', { action: 'statistic', node, date });
    if (!data?.data) return [];

    return data.data.map(logData => ({
        date:  formatTime(logData.log_date),
        t11:   logData.log_t11,
        t12:   logData.log_t12,
        t21:   logData.log_t21,
        t22:   logData.log_t22,
        t31:   logData.log_t31,
        t41:   logData.log_t41,
        t42:   logData.log_t42,
        p11:   logData.log_p11,
        p12:   logData.log_p12,
        p21:   logData.log_p21,
        p22:   logData.log_p22,
        p32:   logData.log_p32,
        p41:   logData.log_p41,
        p42:   logData.log_p42,
        p52:   logData.log_p52,
    }));
};
