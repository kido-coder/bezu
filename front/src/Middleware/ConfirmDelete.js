import { apiPostJSON } from '../utils/api';
import { ExportToExcel } from './ExportToExcel';
import { Delete } from './Delete';

export async function ConfirmDelete(id, type) {
    const data = await apiPostJSON('/operator', { action: 'xlsx_' + type, id });
    if (!data) return;
    if (data.length > 0) {
        Delete(id, type);
        ExportToExcel(data, id);
    }
}
