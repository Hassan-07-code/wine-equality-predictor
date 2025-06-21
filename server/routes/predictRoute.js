// backend/routes/predictRoute.js
const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");

router.post("/", (req, res) => {
  const python = spawn("python", ["predict.py"]);
  const inputData = JSON.stringify(req.body);

  python.stdin.write(inputData);
  python.stdin.end();

  let result = "";
  python.stdout.on("data", (data) => {
    result += data.toString();
  });

  python.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  python.on("close", (code) => {
    if (code === 0) {
      try {
        const prediction = JSON.parse(result);
        res.json(prediction);
      } catch (e) {
        res.status(500).json({ error: "Failed to parse prediction result" });
      }
    } else {
      res.status(500).json({ error: "Prediction script failed" });
    }
  });
});

module.exports = router;
