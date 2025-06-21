# backend/python/predict.py
import sys
import json
import joblib
import numpy as np
import os

# Load model (dynamic path to support spawn from anywhere)
model_path = os.path.join(os.path.dirname(__file__), 'random_forest_wine_quality_model.pkl')
model = joblib.load(model_path)

# Read and parse input
input_data = json.loads(sys.stdin.read())

# Expected keys from React frontend
features = [
    "fixed_acidity", "volatile_acidity", "citric_acid", "residual_sugar", "chlorides",
    "free_sulfur_dioxide", "total_sulfur_dioxide", "density", "pH", "sulphates", "alcohol"
]

# Prepare input
input_array = np.array([[input_data[feature] for feature in features]])

# Predict
prediction = model.predict(input_array)[0]

# Output
print(json.dumps({"prediction": round(float(prediction), 2)}))  # Round to 2 decimal places
