import { apiPost } from '../utils/api';

export function Delete(id, type) {
    apiPost('/operator', { action: 'delete_' + type, id });
}
