import { apiPost } from '../utils/api';

export function InsertCmd(cmd, user, id) {
    apiPost('/mid', { action: 'add_log', cmd, user, id });
}
