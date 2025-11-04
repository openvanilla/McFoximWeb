# McFoximWeb - 小麥族語輸入法 Web/ChromeOS 版本

基於原住民族語言發展基金會的族語學習詞表，以及 Web 技術打造的族語輸入法。

## 支援平台

- Web 平台
- Chrome OS

## 編譯方式

這套輸入法使用 Type Script 語言開發，所以在 Windows、macOS、Linux 平台上都可以編譯。請先安裝 [Node.js](https://nodejs.org/) 以及 [Git](https://git-scm.com/)，然後在終端機中執行命令。

### Web 版

```bash
npm install
npm run build
```

用瀏覽器打開 output/example/index.html 就可以使用輸入法了。

### Chrome OS 版

```bash
npm install
npm run build:chromeos
```

然後在 Chrome OS 上開啟「chrome://extensions/」，並啟用「開發人員模式」，接著按下「載入已解壓縮的擴充功能」，選擇 output/chromeos 目錄，就可以安裝輸入法了。您可以選擇將 `output/chromeos` 傳到你的 Chrome OS 裝置上，或是直接在 Chrome OS 上使用 Linux 子系統（Crostini）編譯。

## 輸入法使用方式

小麥族語輸入法其實比較接近以字母為基礎的語言的自動完成（auto-complete）功能。在開始輸入的時候，只要直接輸入字母即可，如果有可以自動補完的字詞，就會出現候選字選單—旁邊也有對應的中文說明—這時候按下 Tab 鍵，就可以補完單字。另外，也可以用上下鍵移動要選擇的候選字，或是用 page up / page down 換頁。

## 支援語言

輸入法提供原語會的族語學習詞表所涵蓋的語言。

## 常見問題

Q: 輸入法的資料來源？

A: 來自[原語會的學習詞表](https://glossary.ilrdf.org.tw/resources)，以及[族語 E 樂園的學習詞表](https://web.klokah.tw/vocabulary/)

Q: McFoxim 這個名字的意思？

A: 在 ISO 639 語言代碼中，fox 就是台酸南島民族語言的代號，IM 則是 Input Method 的縮寫，合起來就是 McFoxim。請參見 Wikipedia 上的 [ISO 639-5](https://zh.wikipedia.org/wiki/ISO_639-5) 的說明。
