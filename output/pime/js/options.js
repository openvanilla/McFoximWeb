window.onload = () => {
  let settings = {};
  const defaultSettings = {
    selected_input_table_index: 0,
    candidate_font_size: 16,
  };

  function applySettings(settings) {
    console.log('applying settings: ' + settings);
    const tableIndex = settings.selected_input_table_index;
    const radioButton = document.getElementById(`table_${tableIndex}`);
    if (radioButton) {
      radioButton.checked = true;
    }
    const fontSizeInput = document.getElementById('font_size');
    let options = fontSizeInput.getElementsByTagName('option');
    if (fontSizeInput) {
      for (let option of options) {
        if (+option.value === settings.candidate_font_size) {
          option.selected = 'selected';
          break;
        }
      }
    }
  }

  function loadSettings() {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
      try {
        settings = JSON.parse(this.responseText);
        if (settings == undefined) {
          settings = defaultSettings;
        }
        console.log('settings loaded: ' + settings);
        applySettings(settings);
      } catch {
        settings = defaultSettings;
        applySettings(settings);
      }
    };
    xhttp.open('GET', '/config');
    xhttp.send('');
  }

  function saveSettings(settings) {
    console.log('saving settings: ' + settings);
    const xhttp = new XMLHttpRequest();
    xhttp.open('POST', '/config');
    let string = JSON.stringify(settings);
    xhttp.send(string);
  }

  for (let i = 0; i < 42; i++) {
    let radioButton = document.getElementById(`table_${i}`);
    radioButton.addEventListener('change', () => {
      settings.selected_input_table_index = i;
      saveSettings(settings);
    });
  }

  document.getElementById('font_size').onchange = (event) => {
    let value = document.getElementById('font_size').value;
    settings.candidate_font_size = +value;
    saveSettings(settings);
  };

  loadSettings();
};
