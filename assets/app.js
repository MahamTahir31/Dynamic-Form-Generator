let fieldData = [];
let formData = [];
let submissions = [];
const maxSubmissions = 10;
let isFormLoadedFromJson = false;
let isFormGenerated = false;

document.getElementById('addRow').addEventListener('click', addRow);
document.getElementById('saveJson').addEventListener('click', saveJson);
document.getElementById('loadJson').addEventListener('click', loadJson);
document.getElementById('generateForm').addEventListener('click', generateForm);
document.getElementById('saveFormData').addEventListener('click', saveFormData);
document.getElementById('loadSelectedForm').addEventListener('click', loadSelectedForm);

function addRow() {
    const tableBody = document.querySelector('#fieldTable tbody');
    const row = document.createElement('tr');

    row.innerHTML = `
                <td><input type="text" class="field-name" /></td>
                <td>
                    <select class="field-type">
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="dropdown">Dropdown</option>
                        <option value="boolean">True/False</option>
                        <option value="date">Date</option>
                    </select>
                </td>
                <td>
                    <select class="field-mandatory">
                        <option value="true">True</option>
                        <option value="false">False</option>
                    </select>
                </td>
                <td><input type="text" class="field-options" placeholder="Comma separated values" /></td>
                <td><button class="delete-row">Delete</button></td>
            `;

    tableBody.appendChild(row);

    row.querySelector('.delete-row').addEventListener('click', () => {
        row.remove();
    });
}
function saveJson() {
    const rows = document.querySelectorAll('#fieldTable tbody tr');
    const fieldData = Array.from(rows).map(row => {
        const fieldType = row.querySelector('.field-type').value;

        const options = fieldType === 'dropdown'
            ? row.querySelector('.field-options').value.split(',').map(option => option.trim()).filter(option => option !== '')
            : [];

        return {
            name: row.querySelector('.field-name').value,
            type: fieldType,
            mandatory: row.querySelector('.field-mandatory').value === 'true',
            options: options 
        };
    });

    // Validate if at least one field is filled
    console.log(fieldData);
    const isFormValid = fieldData.every(field => field.name.trim() !== '');

    if (isFormValid && fieldData.length > 0) {
        // Convert field data to JSON
        const jsonString = JSON.stringify(fieldData, null, 2); 
        const blob = new Blob([jsonString], { type: 'application/json' });   
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'form-data.json'; 

        console.log(blob)
        document.body.appendChild(link);

        link.click();
        document.body.removeChild(link);

        alert('Form structure saved successfully!');
    } else {
        // Error message if no data is entered
        alert('Fill form fields first then save data in JSON format');
    }
}

function loadJson() {
    const fileInput = document.getElementById('loadJsonFile');

    if (!fileInput.files.length) {
        alert('Please select a JSON file to load.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        try {
            const parsedData = JSON.parse(event.target.result);

            if (Array.isArray(parsedData) && parsedData.length > 0) {
                fieldData = parsedData;
                populateFieldTable();
                alert('Loaded form structure from JSON successfully!');
                isFormLoadedFromJson = true;
            } else {
                throw new Error('No data in JSON or invalid format');
            }
        } catch (error) {
            alert('Error loading form: ' + error.message);
        }
    };

    reader.onerror = function () {
        alert('Error reading file');
    };

    reader.readAsText(file);

}

function populateFieldTable() {
    const tableBody = document.querySelector('#fieldTable tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    fieldData.forEach(field => {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td><input type="text" class="field-name" value="${field.name}" /></td>
                    <td>
                        <select class="field-type">
                            <option value="string" ${field.type === 'string' ? 'selected' : ''}>String</option>
                            <option value="number" ${field.type === 'number' ? 'selected' : ''}>Number</option>
                            <option value="dropdown" ${field.type === 'dropdown' ? 'selected' : ''}>Dropdown</option>
                            <option value="boolean" ${field.type === 'boolean' ? 'selected' : ''}>True/False</option>
                            <option value="date" ${field.type === 'date' ? 'selected' : ''}>Date</option>
                        </select>
                    </td>
                    <td>
                        <select class="field-mandatory">
                            <option value="true" ${field.mandatory ? 'selected' : ''}>True</option>
                            <option value="false" ${!field.mandatory ? 'selected' : ''}>False</option>
                        </select>
                    </td>
                    <td><input type="text" class="field-options" value="${field.options.join(',')}" /></td>
                    <td><button class="delete-row">Delete</button></td>
                `;
        tableBody.appendChild(row);

        row.querySelector('.delete-row').addEventListener('click', () => {
            row.remove();
        });
    });
}

function generateForm() {
    const formContainer = document.getElementById('generatedForm');
    formContainer.innerHTML = ''; 

    if (!isFormLoadedFromJson) {
        alert('Error: You must load a form from JSON before generating the form.');
        return;
    }

    formContainer.style.width = '40%';
    formContainer.style.margin = '0 auto'; 
    formContainer.style.padding = '20px';
    formContainer.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
    formContainer.style.borderRadius = '8px';
    formContainer.style.backgroundColor = '#f9f9f9';

    let formTitle = document.getElementById('form-title').value;
    let formTitleAdd = document.createElement('h3');
    formTitleAdd.textContent = formTitle;
    formTitleAdd.style.textAlign = 'center';
    formTitleAdd.style.color = '#333';
    formTitleAdd.style.marginBottom = '20px';

    let genForm = document.getElementById('genForm');
    genForm.insertAdjacentElement('afterend', formTitleAdd);

    fieldData.forEach(field => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'form-field'; // Add this class
        fieldDiv.style.marginBottom = '15px';
        fieldDiv.style.padding = '10px';
        fieldDiv.style.borderRadius = '4px';
        fieldDiv.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';

        const label = document.createElement('label');
        label.textContent = field.name;
        label.style.display = 'block';
        label.style.marginBottom = '5px';
        label.style.fontWeight = 'bold';
        label.style.color = '#333';
        fieldDiv.appendChild(label);

        let input;
        if (field.type === 'string' || field.type === 'number' || field.type === 'date') {
            input = document.createElement('input');
            input.type = field.type;
        } else if (field.type === 'dropdown') {
            input = document.createElement('select');
            field.options.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option.trim();
                opt.textContent = option.trim();
                input.appendChild(opt);
            });
        } else if (field.type === 'boolean') {
            input = document.createElement('select');
            ['True', 'False'].forEach(option => {
                const opt = document.createElement('option');
                opt.value = option.toLowerCase();
                opt.textContent = option;
                input.appendChild(opt);
            });
        }

        input.style.width = '100%'; 
        input.style.padding = '10px';
        input.style.border = '1px solid #ccc';
        input.style.borderRadius = '4px';
        input.style.boxSizing = 'border-box';
        input.style.fontSize = '14px';

        if (field.mandatory) {
            input.required = true;
        }

        fieldDiv.appendChild(input);
        formContainer.appendChild(fieldDiv);
    });

    isFormGenerated = true;
    alert('Form generated successfully!');
}

function saveFormData() {
    // Select form fields from the generated form
    const formFields = document.querySelectorAll('#generatedForm .form-field');
    const formDataEntry = {};
    let allFieldsValid = true;  // Flag to check if all required fields are filled

    if (!isFormGenerated) {
        alert('Please generate the form first before saving data.');
        return;
    }

    formFields.forEach(fieldDiv => {
        const label = fieldDiv.querySelector('label').textContent;
        const input = fieldDiv.querySelector('input, select');
        const isRequired = input.hasAttribute('required');

        // Check if the field is required and filled
        if (isRequired && !input.value.trim()) {
            allFieldsValid = false;
            input.classList.add('error');  // Optionally add a class to highlight the error
        } else {
            input.classList.remove('error');  // Remove the error highlight if the field is valid
        }

        formDataEntry[label] = input.value;
    });

    if (allFieldsValid) {
        // Check if the record already exists in formData
        const isDuplicate = formData.some(existingEntry =>{
           Object.keys(existingEntry).every(key => existingEntry[key] === formDataEntry[key])
            // console.log(Object.keys(existingEntry))
    });

        if (isDuplicate) {
            alert('This record already exists and cannot be saved again.');
        } else {
            formData.push(formDataEntry);

            // Limit to the last 10 submissions
            if (formData.length > maxSubmissions) {
                formData.shift();
            }

            // Display submissions
            displaySubmissions();
            alert('Form data saved successfully!');
        }
    } else {
        alert('Please fill in all required fields before submitting.');
    }
}

function displaySubmissions() {
    const submissionList = document.getElementById('submissionList');
    submissionList.innerHTML = ''; // Clear existing list

    if (formData.length === 0) {
        submissionList.textContent = "No submissions yet.";
        return;
    }

    const table = document.createElement('table');
    table.style.width = '70%';
    table.style.borderCollapse = 'collapse';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const submissionHeader = document.createElement('th');
    submissionHeader.textContent = 'Submission #';
    submissionHeader.style.border = '1px solid black';
    headerRow.appendChild(submissionHeader);

    Object.keys(formData[0]).forEach(field => {
        const th = document.createElement('th');
        th.textContent = field;
        th.style.border = '1px solid black';
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    formData.forEach((data, index) => {
        const row = document.createElement('tr');

        const submissionCell = document.createElement('td');
        submissionCell.textContent = index + 1;
        submissionCell.style.border = '1px solid black';
        row.appendChild(submissionCell);

        Object.values(data).forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            td.style.border = '1px solid black';
            row.appendChild(td);
        });

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    submissionList.appendChild(table);
}

function loadSelectedForm() {

    const selectedFormTitle = document.getElementById('formSelector').value;
    let savedForms = JSON.parse(localStorage.getItem('savedForms')) || {};

    if (selectedFormTitle && savedForms[selectedFormTitle]) {
        fieldData = savedForms[selectedFormTitle].fields;
        populateFieldTable();
        document.getElementById('generatedForm').innerHTML = ''; 
        generateForm(); 
        alert(`Loaded and generated form: ${selectedFormTitle}`);
    } else {
        alert('Please select a valid form.');
    }
}
    
