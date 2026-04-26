import { apiPostJSON } from '../utils/api';

export async function Get(action, setData) {
    const data = await apiPostJSON('/admin', { action });
    if (data) setData(data);
}
