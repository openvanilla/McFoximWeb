# 族語學習詞表轉換輸入法詞庫流程

1. 前往原住民族語言發展基金會的原住民學習詞表系統的 [資源下載](https://glossary.ilrdf.org.tw/resources) 頁面
2. 在「語言與方言」下拉選單中，選擇「全部」
3. 選擇下載 Excel 的按鈕，解開之後會有多個 excel 檔案
4. 將 Excel 檔案放到 `tools` 目錄下
5. 使用 `convert.py` 這個腳本來轉成 .ts 檔案，最後更換 src/data 目錄下的詞庫檔案

```bash
cd tools
python3 -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
python convert.py
```

另，目前學習詞表位在[這個位置](https://glossary-api.ilrdf.org.tw/glossary_2022/excel/2022%E5%AD%B8%E7%BF%92%E8%A9%9E%E8%A1%A8.zip) ，可以直接下載。不過原語會可能會改版網頁，所以建議還是從官網下載比較保險。
