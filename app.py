import streamlit as st
import pickle
import numpy as np

# Load model
model = pickle.load(open("wine_model.pkl", "rb"))

st.title("🍷 Wine Quality Predictor")
st.markdown("Enter the wine's chemical properties to predict its quality score (0–10).")

# Input fields
fixed_acidity = st.number_input("Fixed Acidity", 0.0, 20.0, step=0.1)
volatile_acidity = st.number_input("Volatile Acidity", 0.0, 2.0, step=0.01)
citric_acid = st.number_input("Citric Acid", 0.0, 2.0, step=0.01)
residual_sugar = st.number_input("Residual Sugar", 0.0, 15.0, step=0.1)
chlorides = st.number_input("Chlorides", 0.0, 1.0, step=0.01)
free_sulfur = st.number_input("Free Sulfur Dioxide", 0.0, 100.0, step=1.0)
total_sulfur = st.number_input("Total Sulfur Dioxide", 0.0, 300.0, step=1.0)
density = st.number_input("Density", 0.9900, 1.0100, step=0.0001, format="%.4f")
pH = st.number_input("pH", 2.5, 4.5, step=0.01)
sulphates = st.number_input("Sulphates", 0.0, 2.0, step=0.01)
alcohol = st.number_input("Alcohol", 8.0, 15.0, step=0.1)

if st.button("Predict Quality"):
    input_data = np.array([[fixed_acidity, volatile_acidity, citric_acid, residual_sugar,
                            chlorides, free_sulfur, total_sulfur, density, pH,
                            sulphates, alcohol]])
    prediction = model.predict(input_data)[0]
    st.success(f"Predicted Wine Quality Score: **{prediction}** / 10")
