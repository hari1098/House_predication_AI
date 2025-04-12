import type { HouseFeatures } from '../types';
import { predictPriceWithAI, calculateConfidenceWithAI } from './model';

export async function predictPrice(features: HouseFeatures): Promise<number> {
  return await predictPriceWithAI(features);
}

export function calculateConfidence(features: HouseFeatures): number {
  return calculateConfidenceWithAI(features);
}

export function formatIndianPrice(price: number): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });
  return formatter.format(price);
}