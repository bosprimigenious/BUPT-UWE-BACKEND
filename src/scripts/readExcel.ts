import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";

// Excel 文件路径
const filePath = path.resolve(__dirname, "../assets/BUPT_UWE.xlsx");
if (!fs.existsSync(filePath)) {
    throw new Error(`Excel 文件不存在: ${filePath}`);
}

// 读取工作簿
const workbook = XLSX.readFile(filePath);
const sheetNames = workbook.SheetNames;

// Markdown 输出路径
const mdPath = path.resolve(__dirname, "../../public/BUPT_UWE.md");

let mdContent = "";

// 遍历每个 sheet
sheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, { defval: "" });

    if (jsonData.length === 0) return;

    mdContent += `## ${sheetName}\n\n`;

    // 表头
    const headers = Object.keys(jsonData[0]);
    mdContent += `| ${headers.join(" | ")} |\n`;
    mdContent += `| ${headers.map(() => "---").join(" | ")} |\n`;

    // 表格内容
    jsonData.forEach(row => {
        mdContent += `| ${headers.map(h => row[h] ?? "").join(" | ")} |\n`;
    });

    mdContent += `\n`; // 每个 sheet 空一行
});

// 写入文件
fs.writeFileSync(mdPath, mdContent, "utf-8");
console.log(`Markdown 文件已生成: ${mdPath}`);
