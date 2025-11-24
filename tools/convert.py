import json
import xlrd
import os


def parse_excel_file(path):
    workbook = xlrd.open_workbook(path)
    sheet = workbook.sheet_by_index(0)
    name = sheet.cell_value(0, 2)
    data = []
    for row_idx in range(3, sheet.nrows):
        row = sheet.row(row_idx)
        ch = row[2].value
        text = row[3].value
        if "無此詞彙" in text:
            continue
        if ch and text:
            if "/" in text:
                components = text.split("/")
                for component in components:
                    data.append((component.strip(), ch))
            else:
                data.append((text.strip(), ch))
    data.sort(key=lambda x: x[0])
    table = {"name": name, "data": data}
    mapping = json.dumps(table, ensure_ascii=False, separators=(',', ':'))
    mapping = mapping.replace('`', '\\`').replace('${', '\\${')
    return mapping


def main():
    """
    Converts Excel files in the current directory to TypeScript files.
    """
    for i in range(1, 43):
        current_folder = os.getcwd()
        current_folder = os.path.join(current_folder, "glossary")
        files = os.listdir(current_folder)
        path = next((f for f in files if "-{:02d}".format(i + 1) in f), None)
        try:
            file_path = os.path.join(current_folder, path)
            data = parse_excel_file(file_path)
            name = "TW_{:02d}".format(i)
            write_file = os.path.join("../src/data", name + ".ts")
            with open(write_file, "w") as json_file:
                data = "export const " + name + " = JSON.parse(`" + data + "`);"
                json_file.write(data)
        except Exception as e:
            print("Error processing {}: {}".format(path, e))


if __name__ == "__main__":
    main()
    print("Data processed and written to files")
