# McFoximWeb - 小麥族語輸入法 Web/Chrome OS/PIME 版本

![Static Badge](https://img.shields.io/badge/platform-web-green)
![ChromeOS](https://img.shields.io/badge/platform-chome_os-yellow) ![Static Badge](https://img.shields.io/badge/platform-windows-blue) [![CI](https://github.com/openvanilla/McFoximWeb/actions/workflows/ci.yml/badge.svg)](https://github.com/openvanilla/McFoximWeb/actions/workflows/ci.yml) [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/openvanilla/McFoximWeb)

基於[原住民族語言發展基金會](https://www.ilrdf.org.tw/)的族語學習詞表，以及 Web 技術打造的族語輸入法。

![images/banner.png](images/banner.png)

<!-- TOC -->

- [McFoximWeb - 小麥族語輸入法 Web/Chrome OS/PIME 版本](#mcfoximweb---%E5%B0%8F%E9%BA%A5%E6%97%8F%E8%AA%9E%E8%BC%B8%E5%85%A5%E6%B3%95-webchrome-ospime-%E7%89%88%E6%9C%AC)
  - [支援平台](#%E6%94%AF%E6%8F%B4%E5%B9%B3%E5%8F%B0)
  - [編譯方式](#%E7%B7%A8%E8%AD%AF%E6%96%B9%E5%BC%8F)
    - [Web 版](#web-%E7%89%88)
    - [Chrome OS 版](#chrome-os-%E7%89%88)
    - [Windows PIME](#windows-pime)
  - [輸入法使用方式](#%E8%BC%B8%E5%85%A5%E6%B3%95%E4%BD%BF%E7%94%A8%E6%96%B9%E5%BC%8F)
  - [支援語言](#%E6%94%AF%E6%8F%B4%E8%AA%9E%E8%A8%80)
  - [社群公約](#%E7%A4%BE%E7%BE%A4%E5%85%AC%E7%B4%84)
  - [常見問題](#%E5%B8%B8%E8%A6%8B%E5%95%8F%E9%A1%8C)
    - [Q: 輸入法的資料來源？](#q-%E8%BC%B8%E5%85%A5%E6%B3%95%E7%9A%84%E8%B3%87%E6%96%99%E4%BE%86%E6%BA%90)
    - [Q: 是否有 Windows、macOS、iOS、Android 版本？](#q-%E6%98%AF%E5%90%A6%E6%9C%89-windowsmacosiosandroid-%E7%89%88%E6%9C%AC)
    - [Q: 小麥族語輸入法與另外的族語輸入法有什麼不同？](#q-%E5%B0%8F%E9%BA%A5%E6%97%8F%E8%AA%9E%E8%BC%B8%E5%85%A5%E6%B3%95%E8%88%87%E5%8F%A6%E5%A4%96%E7%9A%84%E6%97%8F%E8%AA%9E%E8%BC%B8%E5%85%A5%E6%B3%95%E6%9C%89%E4%BB%80%E9%BA%BC%E4%B8%8D%E5%90%8C)
    - [Q: McFoxIM 這個名字的意思？](#q-mcfoxim-%E9%80%99%E5%80%8B%E5%90%8D%E5%AD%97%E7%9A%84%E6%84%8F%E6%80%9D)
    - [Q: 授權方式？](#q-%E6%8E%88%E6%AC%8A%E6%96%B9%E5%BC%8F)
    - [Q: 怎樣更新輸入法表格？](#q-%E6%80%8E%E6%A8%A3%E6%9B%B4%E6%96%B0%E8%BC%B8%E5%85%A5%E6%B3%95%E8%A1%A8%E6%A0%BC)

<!-- /TOC -->
<!-- /TOC -->

## 支援平台

- Web 平台
- Chrome OS
- Windows (透過 [PIME 輸入法框架](https://github.com/EasyIME/))

## 編譯方式

這套輸入法使用 Type Script 語言開發，所以在 Windows、macOS、Linux 平台上都可以編譯。請先安裝 [Node.js](https://nodejs.org/) 以及 [Git](https://git-scm.com/)，然後在終端機中執行編譯命令。

大部分的 Node.js 版本應該都可以成功編譯這個專案，您也可以查看我們在 CI/CD 中使用的 Node.js 版本。

### Web 版

請輸入：

```bash
npm install
npm run build
```

用瀏覽器打開 output/example/index.html 就可以使用輸入法了。

您也可以透過參考 output/example/index.html 裡頭的方式，將小麥族語輸入法，嵌入到您的網頁中。

### Chrome OS 版

您可以從 [Chrome Web Store](https://chromewebstore.google.com/detail/mcfoxim/oglljkfjpohndcffedmakligpffmeoih) 下載安裝。

如果要要自行編譯，請在終端機中執行：

```bash
npm install
npm run build:chromeos
```

然後在 Chrome OS 上開啟「chrome://extensions/」，並啟用「開發人員模式」，接著按下「載入已解壓縮的擴充功能」，選擇 `output/chromeos` 目錄，就可以安裝輸入法了。您可以選擇將 `output/chromeos` 傳到你的 Chrome OS 裝置上，或是直接在 Chrome OS 上使用 Linux 子系統（Crostini）編譯。

### Windows (PIME)

首先您要在您的 Windows 系統上安裝 PIME，請前往 PIME 的專案頁面下載。請注意，在安裝的過程中，**務必要勾選 Node.js 支援**，否則無法使用這個輸入法— PIME 預設是不安裝 Node.js 支援的。

請在 Windows 的命令提示字元（Command Prompt）或 PowerShell 中執行：

```bash
npm install
npm run build:pime
```

然後將 `output/pime` 目錄下的所有檔案複製到 PIME 安裝目錄下的 `node\input_methods\mcfoxim` 目錄中（通常是 `C:\Program Files (x86)\PIME\node\input_methods\mcfoxim`），您會需要用到系統管理員權限。第一次使用時，請在這個目錄中，執行一次 `run_register_ime.bat`，將小麥族語輸入法註冊到 Windows 系統中。接著重新啟動 PIME 啟動器（PIME Launcher），就可以在輸入法清單中選擇小麥族語輸入法了。

如果在系統清單中，沒有看到小麥族語輸入法，請進入 Windows 的系統設定中，確認「語言」設定中已經加入了小麥族語輸入法。

## 輸入法使用方式

小麥族語輸入法，其實比較接近以字母為基礎的語言的自動完成（auto-complete）功能。

- 在開始輸入的時候，只要直接輸入字母即可
- 如果有可以自動補完的字詞，就會出現候選字選單—旁邊也有對應的中文說明
- 這時候按下 Tab 鍵，就可以補完單字
- 另外，也可以用上下鍵移動要選擇的候選字，或是用 page up / page down 換頁。

您可以直接在 [網頁版本](https://openvanilla.github.io/McFoximWeb/) 中，體驗這個輸入法的使用方式。

## 支援語言

輸入法提供原語會的族語學習詞表所涵蓋的語言。

## 社群公約

我們採用了 GitHub 的[通用社群公約](CODE_OF_CONDUCT.md)。公約的中文版請參考[這裡的翻譯](https://www.contributor-covenant.org/zh-tw/version/1/4/code-of-conduct/)。

## 常見問題

### Q: 輸入法的資料來源？

A: 來自[原語會的學習詞表](https://glossary.ilrdf.org.tw/resources)，以及[族語 E 樂園的學習詞表](https://web.klokah.tw/vocabulary/)

### Q: 是否有 Windows、macOS、iOS、Android 版本？

A: 原語會本身也已經提供了這些平台的官方[族語輸入法](https://www.ilrdf.org.tw/basic/?mode=detail&node=1247)。這個版本主要提供官方所支援的其他平台。

### Q: 小麥族語輸入法與另外的族語輸入法有什麼不同？

A: 原語會的族語輸入法是族語會所提供的官方輸入法，小麥族語則是由 OpenVanilla 社群為了官方沒有涵蓋到的平台而開發。

### Q: McFoxIM 這個名字的意思？

A: 在 ISO 639 語言代碼中，fox 就是台灣南島民族語言的代號，IM 則是 Input Method 的縮寫，合起來就是 McFoxIM。請參見 Wikipedia 上的 [ISO 639-5](https://zh.wikipedia.org/wiki/ISO_639-5) 、[Formosan languages 詞條](https://en.wikipedia.org/wiki/Formosan_languages)、以及 [SIL 官方](https://iso639-3.sil.org/code/fox) 的說明。

### Q: 授權方式？

A: 本專案程式碼採用 MIT License 授權，詳情請見 [LICENSE](./LICENSE) 檔案。資料表格授權請參考[族語 E 樂園創用 CC 授權](https://web.klokah.tw/creativeCommons/)。

### Q: 怎樣更新輸入法表格？

A: 請參考 [tools/README.md](./tools/README.md) 中的說明。
