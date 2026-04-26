import { apiPost } from '../utils/api';

export function Insert(action, array) {
    apiPost('/admin', { action, array });
}
