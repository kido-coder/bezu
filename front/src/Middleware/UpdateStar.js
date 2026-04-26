import { apiPost } from '../utils/api';

export function UpdateStar(node, user, state) {
    apiPost('/mid', { action: 'star', node, user, state });
}
