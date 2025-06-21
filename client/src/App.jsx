import { useState, useRef } from 'react';
import './App.css';

const FEATURES = [
  'fixed acidity', 'volatile acidity', 'citric acid', 'residual sugar',
  'chlorides', 'free sulfur dioxide', 'total sulfur dioxide', 'density',
  'pH', 'sulphates', 'alcohol',
];

const FEATURE_MAP = {
  'fixed acidity': 'fixed_acidity',
  'volatile acidity': 'volatile_acidity',
  'citric acid': 'citric_acid',
  'residual sugar': 'residual_sugar',
  'chlorides': 'chlorides',
  'free sulfur dioxide': 'free_sulfur_dioxide',
  'total sulfur dioxide': 'total_sulfur_dioxide',
  'density': 'density',
  'pH': 'pH',
  'sulphates': 'sulphates',
  'alcohol': 'alcohol',
};

const FEATURE_META = {
  'fixed acidity': { unit: 'g/dm³', range: [4.6, 15.9], info: 'Affects taste & stability' },
  'volatile acidity': { unit: 'g/dm³', range: [0.12, 1.58], info: 'Higher levels give vinegary taste' },
  'citric acid': { unit: 'g/dm³', range: [0.0, 1.0], info: 'Adds freshness' },
  'residual sugar': { unit: 'g/dm³', range: [0.9, 15.5], info: 'Sweetness of the wine' },
  'chlorides': { unit: 'g/dm³', range: [0.012, 0.611], info: 'Saltiness indicator' },
  'free sulfur dioxide': { unit: 'mg/dm³', range: [1.0, 72.0], info: 'Prevents spoilage' },
  'total sulfur dioxide': { unit: 'mg/dm³', range: [6.0, 289.0], info: 'Preservative, too much = harsh' },
  'density': { unit: 'g/cm³', range: [0.9900, 1.0040], info: 'Alcohol vs sugar balance' },
  'pH': { unit: '', range: [2.74, 4.01], info: 'Acidity level' },
  'sulphates': { unit: 'g/dm³', range: [0.33, 2.0], info: 'Antimicrobial agent' },
  'alcohol': { unit: '% vol', range: [8.4, 14.9], info: 'Strength of the wine' },
};

function App() {
  const [inputs, setInputs] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSaveMsg, setShowSaveMsg] = useState(false);
  const formRef = useRef(null);

  const handleChange = (e, feature) => {
    setInputs({ ...inputs, [feature]: e.target.value });
  };

  const handleStart = () => {
    setStarted(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handlePredict = async () => {
    const payload = {};
    const outOfRangeFeatures = [];

    for (const feature of FEATURES) {
      const val = parseFloat(inputs[feature]);
      const [min, max] = FEATURE_META[feature].range;
      if (isNaN(val) || val < 0) {
        alert(`⚠️ "${feature}" invalid. Please enter zero or positive values only.`);
        return;
      }
      if (val < min || val > max) {
        outOfRangeFeatures.push(feature);
      }
      payload[FEATURE_MAP[feature]] = val;
    }

    setIsLoading(true);
    setSuggestion('');
    try {
      const res = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const { prediction } = await res.json();
      const msg = outOfRangeFeatures.length
        ? `⚠️ Out of range: ${outOfRangeFeatures.join(', ')}`
        : '';

      setSuggestion(msg);
      setPrediction(prediction);
      setHistory(prev => [{ ...inputs, prediction, suggestion: msg }, ...prev]);
      setShowSaveMsg(true);
      setTimeout(() => setShowSaveMsg(false), 3000);
    } catch (err) {
      alert('❌ Server error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInputs({});
    setPrediction(null);
    setSuggestion('');
    setStarted(false);
  };

  return (
    <div className="app-background">
      <div className="overlay">
        <button className="history-btn" onClick={() => setShowHistory(!showHistory)} title="View history">📜</button>

        {showHistory && (
          <div className="history-popup">
            <h3>Prediction History</h3>
            {history.length === 0 ? (
              <p>No predictions yet.</p>
            ) : (
              history.map((entry, idx) => (
                <div key={idx} className="history-entry">
                  <p><strong>Prediction:</strong> {entry.prediction}/10</p>
                  <ul>
                    {FEATURES.map(f => (
                      <li key={f}>{f}: {entry[f]}</li>
                    ))}
                  </ul>
                  {entry.suggestion && <p className="warning">{entry.suggestion}</p>}
                </div>
              ))
            )}
          </div>
        )}

        {!started ? (
          <>
            <h1>🍷 Welcome to WineBot AI</h1>
            <p>This AI predicts wine quality using chemical features.</p>
            <button className="btn" onClick={handleStart}>Let’s Get Started</button>
          </>
                ) : isLoading ? (
          <div className="loading-block">
            <p className="loading-text">🍾 Pouring wine into glass… please wait</p>
            <div className="wine-loader" />
            <div className="spinner"></div>
          </div>
        ) : prediction !== null ? (
          <>
            <h2>Prediction Result</h2>
            <p className="result">{prediction}/10</p>
            {suggestion && <p className="warning">{suggestion}</p>}
            {showSaveMsg && <p className="save-msg">✅ Prediction saved to history!</p>}
            <button onClick={handleReset} className="btn">Try Again</button>
          </>
        ) : (
          <form
            ref={formRef}
            className="input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handlePredict();
            }}
          >
            <div className="form-grid">
              {FEATURES.map((feature) => (
                <div key={feature} className="form-field">
                  <label>
                    <strong>{feature} ({FEATURE_META[feature].unit})</strong>
                    <span title={FEATURE_META[feature].info}>
                      <span className="info-icon">i</span>
                    </span>
                  </label>
                  <div className="range-text">
                    Range: {FEATURE_META[feature].range[0]} - {FEATURE_META[feature].range[1]}
                  </div>
                  <input
                    type="number"
                    step="any"
                    inputMode="decimal"
                    className="input no-spinner"
                    value={inputs[feature] || ''}
                    onChange={(e) => handleChange(e, feature)}
                    placeholder={`Enter ${feature}`}
                  />
                </div>
              ))}
            </div>
            <div className="button-group">
              <button type="submit" className="btn">Predict</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default App;
