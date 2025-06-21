const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const saveToExcel = (data) => {
  const filePath = path.join(__dirname, '..', 'predictions.xlsx');
  console.log('📂 Excel file will be saved at:', filePath);

  // ✅ Add timestamp
  const timestamp = new Date().toISOString();

  // ✅ Generate suggestion
  let suggestion = '';
  if (data.alcohol > 13) suggestion += 'High alcohol. ';
  if (data.volatile_acidity > 1) suggestion += 'Very acidic. ';
  if (data.sulphates > 0.9) suggestion += 'High sulphates. ';
  if (!suggestion.trim()) suggestion = 'All parameters look fine.';

  // ✅ Construct row with timestamp & suggestion
  const newRow = {
    timestamp,
    ...data,
    suggestion
  };

  let workbook, worksheet;

  // ✅ If file exists, read and update
  if (fs.existsSync(filePath)) {
    workbook = XLSX.readFile(filePath);
    worksheet = workbook.Sheets[workbook.SheetNames[0]];

    const existingData = XLSX.utils.sheet_to_json(worksheet);
    existingData.push(newRow);

    worksheet = XLSX.utils.json_to_sheet(existingData);
    workbook.Sheets[workbook.SheetNames[0]] = worksheet;
  } else {
    // ✅ First-time creation
    worksheet = XLSX.utils.json_to_sheet([newRow]);
    workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Predictions');
  }

  // ✅ Save file
  XLSX.writeFile(workbook, filePath);
};

module.exports = { saveToExcel };
