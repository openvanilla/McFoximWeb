(function () {
  const { InputController, InputTableManager } = window.mcnative;

  function resetUI() {
    document.getElementById('function').style.visibility = 'hidden';
    let renderText = '';
    renderText += "<span class='cursor'>|</span>";
    document.getElementById('composing_buffer').innerHTML = renderText;
    document.getElementById('candidates').innerHTML = '';
    composingBuffer = '';
  }

  function onChangeTable(value) {
    window.localStorage.setItem('selectedTableIndex', value);
    let index = parseInt(value);
    const manager = InputTableManager.getInstance();
    manager.selectedIndexValue = index;
    controller.reset();
  }

  let ui = (function () {
    let that = {};
    that.reset = resetUI;

    that.commitString = function (string) {
      var selectionStart = document.getElementById('text_area').selectionStart;
      var selectionEnd = document.getElementById('text_area').selectionEnd;
      var text = document.getElementById('text_area').value;
      var head = text.substring(0, selectionStart);
      var tail = text.substring(selectionEnd);
      document.getElementById('text_area').value = head + string + tail;
      let start = selectionStart + string.length;
      document.getElementById('text_area').setSelectionRange(start, start);
      composingBuffer = '';
    };

    that.update = function (string) {
      let state = JSON.parse(string);
      {
        let buffer = state.composingBuffer;
        let renderText = '';
        let plainText = '';
        let i = 0;
        for (let item of buffer) {
          if (item.style === 'highlighted') {
            renderText += '<span class="marking">';
          }
          let text = item.text;
          plainText += text;
          for (let c of text) {
            if (i === state.cursorIndex) {
              renderText += "<span class='cursor'>|</span>";
            }
            renderText += c;
            i++;
          }
          if (item.style === 'highlighted') {
            renderText += '</span>';
          }
        }
        if (i === state.cursorIndex) {
          renderText += "<span class='cursor'>|</span>";
        }
        document.getElementById('composing_buffer').innerHTML = renderText;
        composingBuffer = plainText;
      }

      if (state.candidates.length) {
        let s = '<table>';
        for (let candidate of state.candidates) {
          if (candidate.selected) {
            s += '<tr class="highlighted_candidate"> ';
          } else {
            s += '<tr>';
          }
          s += '<td>';
          s += '<span class="keycap">';
          s += candidate.keyCap;
          s += '</span>';
          s += '<span class="candidiate">';
          s += candidate.candidate.text;
          s += '</span>';
          s += '</td>';
          s += '</tr>';
        }
        s += '<tr class="page_info"> ';
        s += '<td>';
        s += 'Page ' + (state.candidatePageIndex + 1) + ' / ' + state.candidatePageCount;
        s += '</td>';
        s += '</tr>';
        s += '</table>';

        document.getElementById('candidates').innerHTML = s;
      }

      document.getElementById('function').style.visibility = 'visible';
      const textArea = document.getElementById('text_area');
      const functionDiv = document.getElementById('function');
      const rect = textArea.getBoundingClientRect();
      const textAreaStyle = window.getComputedStyle(textArea);
      const lineHeight = parseInt(textAreaStyle.lineHeight) || 0;
      const paddingTop = parseInt(textAreaStyle.paddingTop) || 0;
      const caretPos = textArea.selectionStart;
      const textBeforeCaret = textArea.value.substring(0, caretPos);
      const linesBeforeCaret = textBeforeCaret.split('\n').length - 1;
      const lastLineStart = textBeforeCaret.lastIndexOf('\n') + 1;
      const columnPos = caretPos - lastLineStart;

      functionDiv.style.position = 'absolute';
      let top = (rect.top || 0) + paddingTop + linesBeforeCaret * lineHeight;
      functionDiv.style.top = top + 'px';
      functionDiv.style.left = rect.left + columnPos * 8 + 'px';
    };

    return that;
  })();

  const manager = InputTableManager.getInstance();
  const tableNames = manager.tableNames;
  let selectedIndex = window.localStorage.getItem('selectedTableIndex');
  if (selectedIndex !== null) {
    manager.selectedIndexValue = parseInt(selectedIndex);
  }

  const select = document.getElementById('input-table-select');
  select.innerHTML = '';
  for (const name of tableNames) {
    const option = document.createElement('option');
    option.value = tableNames.indexOf(name);
    option.textContent = name;
    if (tableNames.indexOf(name) === manager.selectedIndexValue) {
      option.selected = true;
    }
    select.appendChild(option);
  }
  select.value = manager.selectedIndexValue;
  select.addEventListener('change', (event) => {
    onChangeTable(event.target.value);
  });

  const controller = new InputController(ui);
  const textarea = document.getElementById('text_area');
  textarea.addEventListener('keydown', (event) => {
    if (event.metaKey || event.altKey) {
      return;
    }

    let accepted = controller.handleKeyboardEvent(event);
    if (accepted) {
      event.preventDefault();
    }
  });
  textarea.addEventListener('blur', () => {
    controller.reset();
    resetUI();
  });
})();
