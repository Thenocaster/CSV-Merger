document.addEventListener('DOMContentLoaded', () => {
    const fileInput1 = document.getElementById('file1');
    const fileInput2 = document.getElementById('file2');
    const uploadButton = document.getElementById('uploadButton');
    const keySelect1 = document.getElementById('key1');
    const keySelect2 = document.getElementById('key2');
    const columnsDiv1 = document.getElementById('columns1');
    const columnsDiv2 = document.getElementById('columns2');
    const mergeButton = document.getElementById('mergeButton');
    const resultFileNameInput = document.getElementById('resultFileName');
    const columnSelection = document.getElementById('columnSelection');

    let csvData1 = [];
    let csvData2 = [];
    let headers1 = [];
    let headers2 = [];

    function updateKeyOptions() {
        keySelect1.innerHTML = '';
        keySelect2.innerHTML = '';
        headers1.forEach(header => {
            const option = document.createElement('option');
            option.value = header;
            option.textContent = header;
            keySelect1.appendChild(option);
        });
        headers2.forEach(header => {
            const option = document.createElement('option');
            option.value = header;
            option.textContent = header;
            keySelect2.appendChild(option);
        });
    }

    function updateColumnCheckboxes() {
        columnsDiv1.innerHTML = '';
        columnsDiv2.innerHTML = '';
        headers1.forEach(header => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `col1_${header}`;
            checkbox.value = header;
            const label = document.createElement('label');
            label.htmlFor = `col1_${header}`;
            label.textContent = header;
            const div = document.createElement('div');
            div.appendChild(checkbox);
            div.appendChild(label);
            columnsDiv1.appendChild(div);
        });
        headers2.forEach(header => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `col2_${header}`;
            checkbox.value = header;
            const label = document.createElement('label');
            label.htmlFor = `col2_${header}`;
            label.textContent = header;
            const div = document.createElement('div');
            div.appendChild(checkbox);
            div.appendChild(label);
            columnsDiv2.appendChild(div);
        });
    }

    function parseCSV(file, callback) {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
                callback(results.data, results.meta.fields);
            },
            error: (error) => {
                console.error(`Error parsing file: ${file.name}`, error);
            }
        });
    }

    function mergeCSVs() {
        const key1 = keySelect1.value;
        const key2 = keySelect2.value;
        const selectedColumns1 = Array.from(columnsDiv1.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
        const selectedColumns2 = Array.from(columnsDiv2.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
        const resultFileName = resultFileNameInput.value || 'merged_data';

        const mergedData = [];
        const keyMap = {};

        csvData1.forEach(row => {
            keyMap[row[key1]] = row;
        });

        csvData2.forEach(row => {
            if (keyMap[row[key2]]) {
                mergedData.push({ ...keyMap[row[key2]], ...row });
            }
        });

        const resultData = mergedData.map(row => {
            const resultRow = {};
            selectedColumns1.forEach(col => {
                resultRow[col] = row[col] !== undefined ? row[col] : '';
            });
            selectedColumns2.forEach(col => {
                resultRow[col] = row[col] !== undefined ? row[col] : '';
            });
            return resultRow;
        });

        const worksheet = XLSX.utils.json_to_sheet(resultData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Merged Data");
        XLSX.writeFile(workbook, `${resultFileName}.xlsx`);
    }

    uploadButton.addEventListener('click', () => {
        if (fileInput1.files.length > 0 && fileInput2.files.length > 0) {
            parseCSV(fileInput1.files[0], (data, headers) => {
                csvData1 = data;
                headers1 = headers;
                parseCSV(fileInput2.files[0], (data, headers) => {
                    csvData2 = data;
                    headers2 = headers;
                    updateKeyOptions();
                    updateColumnCheckboxes();
                    columnSelection.style.display = 'block';
                });
            });
        } else {
            alert("Please select both CSV files.");
        }
    });

    mergeButton.addEventListener('click', mergeCSVs);
});
