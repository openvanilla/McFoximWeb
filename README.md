# McFoximWeb - 小麥族語輸入法 Web/ChromeOS 版本

基於原住民族語言發展基金會的族語學習詞表，以及 Web 技術打造的族語輸入法。

<!-- TOC -->

- [McFoximWeb - 小麥族語輸入法 Web/ChromeOS 版本](#mcfoximweb---%E5%B0%8F%E9%BA%A5%E6%97%8F%E8%AA%9E%E8%BC%B8%E5%85%A5%E6%B3%95-webchromeos-%E7%89%88%E6%9C%AC)
  - [支援平台](#%E6%94%AF%E6%8F%B4%E5%B9%B3%E5%8F%B0)
  - [編譯方式](#%E7%B7%A8%E8%AD%AF%E6%96%B9%E5%BC%8F)
    - [Web 版](#web-%E7%89%88)
    - [Chrome OS 版](#chrome-os-%E7%89%88)
  - [輸入法使用方式](#%E8%BC%B8%E5%85%A5%E6%B3%95%E4%BD%BF%E7%94%A8%E6%96%B9%E5%BC%8F)
  - [支援語言](#%E6%94%AF%E6%8F%B4%E8%AA%9E%E8%A8%80)
  - [常見問題](#%E5%B8%B8%E8%A6%8B%E5%95%8F%E9%A1%8C)

<!-- /TOC -->

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

然後在 Chrome OS 上開啟「chrome://extensions/」，並啟用「開發人員模式」，接著按下「載入已解壓縮的擴充功能」，選擇 `output/chromeos` 目錄，就可以安裝輸入法了。您可以選擇將 `output/chromeos` 傳到你的 Chrome OS 裝置上，或是直接在 Chrome OS 上使用 Linux 子系統（Crostini）編譯。

## 輸入法使用方式

小麥族語輸入法其實比較接近以字母為基礎的語言的自動完成（auto-complete）功能。在開始輸入的時候，只要直接輸入字母即可，如果有可以自動補完的字詞，就會出現候選字選單—旁邊也有對應的中文說明—這時候按下 Tab 鍵，就可以補完單字。另外，也可以用上下鍵移動要選擇的候選字，或是用 page up / page down 換頁。

## 支援語言

輸入法提供原語會的族語學習詞表所涵蓋的語言。

## 常見問題

Q: 輸入法的資料來源？

A: 來自[原語會的學習詞表](https://glossary.ilrdf.org.tw/resources)，以及[族語 E 樂園的學習詞表](https://web.klokah.tw/vocabulary/)

Q: 是否有 Windows、macOS、iOS、Android 版本？

A: 原語會本身也已經提供了這些平台的官方[族語輸入法](https://www.ilrdf.org.tw/basic/?mode=detail&node=1247)。這個版本主要提供官方所支援的其他平台。

Q: McFoxIM 這個名字的意思？

A: 在 ISO 639 語言代碼中，fox 就是台灣南島民族語言的代號，IM 則是 Input Method 的縮寫，合起來就是 McFoxIM。請參見 Wikipedia 上的 [ISO 639-5](https://zh.wikipedia.org/wiki/ISO_639-5) 的說明。

Q: 授權方式？

A: 本專案程式碼採用 MIT License 授權，詳情請見 [LICENSE](./LICENSE) 檔案。資料表格授權請參考[族語 E 樂園創用 CC 授權](https://web.klokah.tw/creativeCommons/)。
