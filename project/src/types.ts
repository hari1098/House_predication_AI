export interface HouseFeatures {
  size: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
  city: string;
  state: string;
  country: string;
  yearBuilt: number;
  hasGarage: boolean;
  hasPool: boolean;
}

export interface PredictionResult {
  price: number;
  confidence: number;
}

export interface LocationMultiplier {
  [key: string]: {
    [key: string]: number;
  };
}