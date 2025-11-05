window.onload = () => {
  // console.log('Options page loaded');
  chrome.runtime.sendMessage(
    { command: "get_table_names_and_settings" },
    (response) => {
      // console.log('Received table names and settings:', response);

      let tableNames = response.tableNames;
      let hiddenTableIndices = response.hiddenTableIndices || [];
      const container = document.getElementById("input_tables");
      container.innerHTML = "";

      for (let i = 0; i < tableNames.length; i++) {
        let name = tableNames[i];
        let itemContainer = document.createElement("div");
        itemContainer.classList.add("table-item");

        let checkbox = document.createElement("input");
        const checkboxId = `table-toggle-${i}`;

        checkbox.type = "checkbox";
        checkbox.id = checkboxId; // 設定 ID
        checkbox.checked = !hiddenTableIndices.includes(i);

        checkbox.addEventListener("change", () => {
          chrome.runtime.sendMessage({
            command: "set_table_hidden",
            tableIndex: i,
            hidden: !checkbox.checked,
          });
        });

        let label = document.createElement("label");
        label.htmlFor = checkboxId;
        label.textContent = name;
        itemContainer.appendChild(checkbox);
        itemContainer.appendChild(label);
        container.appendChild(itemContainer);
      }

      console.log(response);
    }
  );

  document.title = chrome.i18n.getMessage("optionTitle");
  document.getElementById("options_title").innerText =
    chrome.i18n.getMessage("optionTitle");
  document.getElementById("input_tables_description").innerText =
    chrome.i18n.getMessage("input_tables_description");
  console.log(document.getElementById("input_tables_description"));
  console.log(document.getElementById("input_tables_description").innerText);
};
