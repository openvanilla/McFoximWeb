#!/bin/bash

rm -rf glossary
curl https://glossary-api.ilrdf.org.tw/glossary_2022/excel/2022%E5%AD%B8%E7%BF%92%E8%A9%9E%E8%A1%A8.zip >glossary.zip
unar -e big5 glossary.zip || unzip glossary.zip
rm glossary.zip

python3 -m venv venv
source venv/bin/activate # On Windows use `venv\Scripts\activate`
echo "Installing required packages..."
pip install -r requirements.txt
echo "Converting glossary files..."
python convert.py
