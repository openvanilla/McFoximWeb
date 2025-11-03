window.onload = () => {
  // console.log('Options page loaded');
  chrome.runtime.sendMessage({ command: 'get_table_names_and_settings' }, (response) => {
    // console.log('Received table names and settings:', response);

    let tableNames = response.tableNames;
    let hiddenTableIndices = response.hiddenTableIndices || [];
    let table = document.getElementById('input_tables');

    table.innerHTML = '';

    {
      let headerRow = document.createElement('tr');
      let hiddenHeader = document.createElement('th');
      hiddenHeader.id = 'msg_hidden_checked';
      hiddenHeader.textContent = 'Visible';
      headerRow.appendChild(hiddenHeader);
      let nameHeader = document.createElement('th');
      nameHeader.id = 'msg_name';
      nameHeader.textContent = 'Name';
      headerRow.appendChild(nameHeader);
      table.appendChild(headerRow);
    }

    for (let i = 0; i < tableNames.length; i++) {
      let name = tableNames[i];
      let row = document.createElement('tr');
      let checkboxCell = document.createElement('td');
      let checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = !hiddenTableIndices.includes(i);
      checkbox.addEventListener('change', () => {
        chrome.runtime.sendMessage({
          command: 'set_table_hidden',
          tableIndex: i,
          hidden: !checkbox.checked,
        });
      });
      checkboxCell.appendChild(checkbox);
      row.appendChild(checkboxCell);

      let nameCell = document.createElement('td');
      nameCell.textContent = name;
      row.appendChild(nameCell);
      table.appendChild(row);
    }

    console.log(response);
  });
};
