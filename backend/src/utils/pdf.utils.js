import fs from "fs/promises";
import pdfParse from "pdf-parse";

//reads the pdf data.
export const extractTextFromPdf = async (filePath) => {
    try {
        const fileBuffer = await fs.readFile(filePath);

        const pdfData = await pdfParse(fileBuffer);

        return pdfData.text.trim();
    } catch (error) {
        throw new Error(
            `Failed to extract PDF text: ${error.message}`
        );
    }
};