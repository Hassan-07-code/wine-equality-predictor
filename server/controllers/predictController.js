const { spawn } = require('child_process');
const path = require('path');
const { saveToExcel } = require('./saveResult'); // ✅ Import Excel saver

const predictWineQuality = (req, res) => {
  const inputData = req.body;
  const pythonScriptPath = path.join(__dirname, 'predict.py');

  // ✅ Spawn Python process with JSON input
  const pythonProcess = spawn('python', [pythonScriptPath, JSON.stringify(inputData)]);

  let result = '';
  let errorOutput = '';

  // ✅ Listen for Python stdout
  pythonProcess.stdout.on('data', (data) => {
    result += data.toString();
  });

  // ✅ Listen for stderr (errors from Python)
  pythonProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  // ✅ After process ends
  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Python script error:\n', errorOutput);
      return res.status(500).json({ error: 'Python script execution failed.' });
    }

    try {
      const parsed = JSON.parse(result); // ✅ Expecting: { prediction: 6.0 }

      // ✅ Combine input + predicted quality
      const excelRow = {
        ...inputData,
        predicted_quality: parsed.prediction
      };

      // ✅ Save result to Excel
      saveToExcel(excelRow);

      // ✅ Return response
      return res.status(200).json(parsed);
    } catch (err) {
      console.error('❌ JSON parse error from Python:', err.message);
      return res.status(500).json({ error: 'Invalid response from Python script.' });
    }
  });
};

module.exports = { predictWineQuality };
