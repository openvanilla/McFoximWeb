(function () {
  const { InputController, InputTableManager } = window.mcfoxim;

  function resetUI() {
    document.getElementById('function').style.visibility = 'hidden';
    document.getElementById('candidates').style.visibility = 'hidden';
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
        let renderText = '<p>';
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
        renderText += '</p>';
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
          s += '<td class="keycap">';
          s += candidate.keyCap;
          s += '</td>';
          s += '<td class="candidate">';
          s += candidate.candidate.text;
          s += '</td>';
          s += '<td class="description">';
          s += candidate.candidate.description;
          s += '</td>';
          s += '</tr>';
        }
        s += '<tr class="page_info"> ';
        s += '<td colspan="2">';
        s += 'Tab 補完單詞';
        s += '</td>';
        s += '<td colspan="1">';
        s += '' + (state.candidatePageIndex + 1) + ' / ' + state.candidatePageCount;
        s += '</td>';
        s += '</tr>';
        s += '</table>';

        document.getElementById('candidates').innerHTML = s;
      }

      document.getElementById('candidates').style.visibility = state.candidates.length
        ? 'visible'
        : 'hidden';

      document.getElementById('function').style.visibility = 'visible';
      const textArea = document.getElementById('text_area');
      const functionDiv = document.getElementById('function');
      const rect = textArea.getBoundingClientRect();
      const textAreaStyle = window.getComputedStyle(textArea);
      const lineHeight = parseInt(textAreaStyle.lineHeight) || 20;

      // Create a temporary mirror div to measure actual caret position
      const mirror = document.createElement('div');
      const styles = [
        'fontFamily',
        'fontSize',
        'fontWeight',
        'letterSpacing',
        'overflowWrap',
        'whiteSpace',
        'lineHeight',
        'padding',
        'border',
        'boxSizing',
        'width',
      ];
      styles.forEach((style) => {
        mirror.style[style] = textAreaStyle[style];
      });
      mirror.style.position = 'absolute';
      mirror.style.visibility = 'hidden';
      mirror.style.whiteSpace = 'pre-wrap';
      mirror.style.overflowWrap = 'break-word';

      const caretPos = textArea.selectionStart;
      const textBeforeCaret = textArea.value.substring(0, caretPos);
      mirror.textContent = textBeforeCaret;

      const caretSpan = document.createElement('span');
      caretSpan.textContent = '|';
      mirror.appendChild(caretSpan);

      document.body.appendChild(mirror);

      const caretRect = caretSpan.getBoundingClientRect();
      const mirrorRect = mirror.getBoundingClientRect();

      const relativeTop = caretRect.top - mirrorRect.top;
      const relativeLeft = caretRect.left - mirrorRect.left;

      document.body.removeChild(mirror);

      // Account for textarea scroll position
      const scrollTop = textArea.scrollTop;
      const scrollLeft = textArea.scrollLeft;

      functionDiv.style.position = 'absolute';
      functionDiv.style.top = rect.top + relativeTop + lineHeight - scrollTop + 'px';
      functionDiv.style.left = rect.left + relativeLeft - scrollLeft + 'px';
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
    document.getElementById('text_area').focus();
  });

  const controller = new InputController(ui);
  const textarea = document.getElementById('text_area');
  textarea.addEventListener('keydown', (event) => {
    if (event.metaKey || event.altKey || event.ctrlKey) {
      controller.reset();
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

document.getElementById('loading').innerText = '載入完畢！';
setTimeout(function () {
  document.getElementById('loading').style.display = 'none';
}, 2000);

document.getElementById('text_area').focus();
