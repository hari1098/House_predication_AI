import * as tf from '@tensorflow/tfjs';
import type { HouseFeatures } from '../types';

// Normalize values to a 0-1 range
const normalizeValue = (value: number, min: number, max: number) => {
  return (value - min) / (max - min);
};

// Convert location type to one-hot encoding
const locationToVector = (location: string) => {
  const locations = ['urban', 'suburban', 'rural'];
  return locations.map(loc => loc === location ? 1 : 0);
};

// Convert state to embedding
const stateToEmbedding = (state: string) => {
  const stateEmbeddings: { [key: string]: number[] } = {
    'Maharashtra': [0.8, 0.9, 0.85],
    'Karnataka': [0.75, 0.85, 0.8],
    'Delhi': [0.9, 0.95, 0.9],
    'Tamil Nadu': [0.7, 0.8, 0.75],
    'Gujarat': [0.65, 0.75, 0.7],
  };
  return stateEmbeddings[state] || [0.5, 0.5, 0.5];
};

// Create and train the model
const createModel = () => {
  const model = tf.sequential();

  // Input layer for numerical features
  model.add(tf.layers.dense({
    inputShape: [12], // size, bedrooms, bathrooms, yearBuilt, location(3), state(3), hasGarage, hasPool
    units: 64,
    activation: 'relu'
  }));

  // Hidden layers
  model.add(tf.layers.dropout({ rate: 0.2 }));
  model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
  model.add(tf.layers.dropout({ rate: 0.1 }));
  model.add(tf.layers.dense({ units: 16, activation: 'relu' }));

  // Output layer
  model.add(tf.layers.dense({ units: 1 }));

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'meanSquaredError'
  });

  return model;
};

// Convert features to tensor input
const featuresToTensor = (features: HouseFeatures) => {
  const normalizedSize = normalizeValue(features.size, 100, 10000);
  const normalizedBedrooms = normalizeValue(features.bedrooms, 1, 10);
  const normalizedBathrooms = normalizeValue(features.bathrooms, 1, 8);
  const normalizedYear = normalizeValue(features.yearBuilt, 1900, 2025);
  
  const locationVector = locationToVector(features.location);
  const stateEmbedding = stateToEmbedding(features.state);

  const inputArray = [
    normalizedSize,
    normalizedBedrooms,
    normalizedBathrooms,
    normalizedYear,
    ...locationVector,
    ...stateEmbedding,
    features.hasGarage ? 1 : 0,
    features.hasPool ? 1 : 0
  ];

  return tf.tensor2d([inputArray]);
};

// Initialize and cache the model
let cachedModel: tf.LayersModel | null = null;

const initializeModel = async () => {
  if (!cachedModel) {
    cachedModel = createModel();
    
    // Pre-train the model with some synthetic data
    const syntheticData = generateSyntheticData(1000);
    await trainModelWithSyntheticData(cachedModel, syntheticData);
  }
  return cachedModel;
};

// Generate synthetic training data
const generateSyntheticData = (count: number) => {
  const data = [];
  for (let i = 0; i < count; i++) {
    const size = Math.random() * 9900 + 100; // 100 to 10000 sq ft
    const bedrooms = Math.floor(Math.random() * 9) + 1; // 1 to 10
    const bathrooms = Math.floor(Math.random() * 7) + 1; // 1 to 8
    const yearBuilt = Math.floor(Math.random() * 125) + 1900; // 1900 to 2025
    const locationIndex = Math.floor(Math.random() * 3);
    const location = ['urban', 'suburban', 'rural'][locationIndex];
    const states = ['Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu', 'Gujarat'];
    const state = states[Math.floor(Math.random() * states.length)];
    const hasGarage = Math.random() > 0.5;
    const hasPool = Math.random() > 0.7;

    data.push({
      features: {
        size,
        bedrooms,
        bathrooms,
        yearBuilt,
        location,
        state,
        hasGarage,
        hasPool,
        city: 'synthetic',
        country: 'India'
      },
      price: calculateSyntheticPrice({
        size,
        bedrooms,
        bathrooms,
        yearBuilt,
        location,
        state,
        hasGarage,
        hasPool,
        city: 'synthetic',
        country: 'India'
      })
    });
  }
  return data;
};

// Calculate synthetic price for training data
const calculateSyntheticPrice = (features: HouseFeatures) => {
  const basePrice = 2500000;
  const sizeMultiplier = 2000;
  const bedroomValue = 500000;
  const bathroomValue = 300000;
  const locationMultipliers = {
    'urban': 1.3,
    'suburban': 1.1,
    'rural': 0.9
  };
  const stateMultipliers = {
    'Maharashtra': 1.5,
    'Karnataka': 1.4,
    'Delhi': 1.6,
    'Tamil Nadu': 1.3,
    'Gujarat': 1.2
  };

  let price = basePrice;
  price += features.size * sizeMultiplier;
  price += features.bedrooms * bedroomValue;
  price += features.bathrooms * bathroomValue;
  price *= locationMultipliers[features.location as keyof typeof locationMultipliers];
  price *= stateMultipliers[features.state as keyof typeof stateMultipliers] || 1;
  price += (2025 - features.yearBuilt) * 20000;
  if (features.hasGarage) price += 400000;
  if (features.hasPool) price += 600000;

  // Add some random variation
  price *= 0.9 + Math.random() * 0.2;

  return price;
};

// Train model with synthetic data
const trainModelWithSyntheticData = async (model: tf.LayersModel, data: any[]) => {
  const xs = tf.stack(data.map(d => featuresToTensor(d.features).dataSync()));
  const ys = tf.tensor2d(data.map(d => [d.price]), [data.length, 1]);

  await model.fit(xs, ys, {
    epochs: 50,
    batchSize: 32,
    shuffle: true,
    validationSplit: 0.2
  });

  xs.dispose();
  ys.dispose();
};

// Predict price using the trained model
export const predictPriceWithAI = async (features: HouseFeatures): Promise<number> => {
  const model = await initializeModel();
  const inputTensor = featuresToTensor(features);
  const prediction = model.predict(inputTensor) as tf.Tensor;
  const price = (await prediction.data())[0];
  
  // Cleanup tensors
  inputTensor.dispose();
  prediction.dispose();

  // Apply post-processing adjustments
  const adjustedPrice = applyMarketAdjustments(price, features);
  
  return Math.round(adjustedPrice);
};

// Apply market-specific adjustments
const applyMarketAdjustments = (price: number, features: HouseFeatures): number => {
  // Apply city-specific premium
  const cityPremiums: { [key: string]: number } = {
    'Mumbai': 1.4,
    'Bangalore': 1.3,
    'Delhi': 1.35,
    'Pune': 1.25,
    'Chennai': 1.2
  };
  
  let adjustedPrice = price;
  
  // Apply city premium if available
  if (cityPremiums[features.city]) {
    adjustedPrice *= cityPremiums[features.city];
  }
  
  // Apply recent market trends (simulated)
  const marketTrendMultiplier = 1.1; // Assuming 10% market growth
  adjustedPrice *= marketTrendMultiplier;
  
  // Apply seasonal adjustments (simulated)
  const month = new Date().getMonth();
  const seasonalMultiplier = 1 + (Math.sin(month / 12 * 2 * Math.PI) * 0.05);
  adjustedPrice *= seasonalMultiplier;
  
  return adjustedPrice;
};

// Calculate confidence score based on input features and model uncertainty
export const calculateConfidenceWithAI = (features: HouseFeatures): number => {
  let confidence = 85; // Base confidence

  // Adjust confidence based on data completeness
  confidence += features.size > 0 ? 2 : -5;
  confidence += features.bedrooms > 0 ? 2 : -3;
  confidence += features.bathrooms > 0 ? 2 : -3;
  confidence += features.city ? 2 : -4;
  confidence += features.state ? 2 : -4;
  
  // Adjust for location reliability
  const reliableLocations = ['Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Chennai'];
  confidence += reliableLocations.includes(features.city) ? 3 : -2;
  
  // Adjust for data recency
  const currentYear = new Date().getFullYear();
  confidence -= Math.max(0, Math.floor((currentYear - features.yearBuilt) / 10));
  
  // Ensure confidence stays within reasonable bounds
  return Math.min(95, Math.max(70, confidence));
};