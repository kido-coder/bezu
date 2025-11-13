import { ExportToExcel } from "./ExportToExcel";
import { Delete } from "./Delete";

export var ConfirmDelete = function (id, type) {
    var action = "xlsx_" + type;
    fetch(`${process.env.REACT_APP_API_URL}/operator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.length > 0) {
                Delete(id, type)
                ExportToExcel(data, id)
                console.log('pisda')
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });

}