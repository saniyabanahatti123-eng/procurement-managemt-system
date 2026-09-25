import fs from "fs";
import XLSX from "xlsx";

//reads the Excel data.
export const extractDataFromExcel = (filePath) => {
    try {
        const workbook = XLSX.readFile(filePath);

        const sheets = workbook.SheetNames;

        if (!sheets.length) {
            throw new Error("No worksheets found in Excel file");
        }

        const result = {};

        for (const sheetName of sheets) {
            const worksheet = workbook.Sheets[sheetName];

            result[sheetName] = XLSX.utils.sheet_to_json(
                worksheet,
                {
                    defval: ""
                }
            );
        }

        return result;
    } catch (error) {
        throw new Error(
            `Failed to extract Excel data: ${error.message}`
        );
    }
};