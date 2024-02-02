import * as fs from 'fs';
import * as path from 'path';
import * as xlsx from 'xlsx';

// 保存 JSON 数据为文件
export function saveJsonToFile(data: any, filePath: string): void {
  const jsonData = JSON.stringify(data);
  const directoryPath = path.dirname(filePath);

  // 确保文件夹存在
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }

  fs.writeFileSync(filePath, jsonData, 'utf-8');
}

// 将 JSON 数据转换为 Excel 文件
export function convertJsonToExcel(data: any, filePath: string): void {
  // 创建工作簿和工作表
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(data);

  // 将工作表添加到工作簿
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  const directoryPath = path.dirname(filePath);
  console.log(directoryPath);

  // 确保文件夹存在
  if (!fs.existsSync(directoryPath)) {
    console.log("不存在");
    
    fs.mkdirSync(directoryPath, { recursive: true });
  }

  // 保存工作簿为 Excel 文件
  xlsx.writeFile(workbook, filePath);
  console.log("123");
  
}