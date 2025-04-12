import React, { useState } from 'react';
import { Home, DollarSign, BarChart2, AlertCircle, MapPin, Building2, Map, Brain } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import type { HouseFeatures, PredictionResult } from './types';
import { predictPrice, calculateConfidence, formatIndianPrice } from './utils/prediction';

function App() {
  const [features, setFeatures] = useState<HouseFeatures>({
    size: 0,
    bedrooms: 0,
    bathrooms: 0,
    location: 'suburban',
    city: '',
    state: '',
    country: 'India',
    yearBuilt: new Date().getFullYear(),
    hasGarage: false,
    hasPool: false
  });

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (features.size <= 0) {
      toast.error('Please enter a valid house size');
      return;
    }

    if (features.bedrooms <= 0) {
      toast.error('Please enter a valid number of bedrooms');
      return;
    }

    if (features.bathrooms <= 0) {
      toast.error('Please enter a valid number of bathrooms');
      return;
    }

    if (!features.city || !features.state) {
      toast.error('Please enter both city and state');
      return;
    }

    setIsLoading(true);
    try {
      const predictedPrice = await predictPrice(features);
      const confidence = calculateConfidence(features);

      setPrediction({ price: predictedPrice, confidence });
      toast.success('AI prediction completed successfully!');
    } catch (error) {
      toast.error('Error calculating prediction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFeatures(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : type === 'number' 
          ? parseFloat(value) || 0
          : value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-indigo-50">
          {/* Header */}
          <div className="p-8 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Building2 className="text-white" size={40} />
                <Brain className="text-white absolute -top-2 -right-2" size={20} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">AI-Powered Property Price Predictor</h1>
                <p className="text-indigo-100 mt-2 text-lg">Advanced machine learning model for accurate property valuations</p>
              </div>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <Home size={24} className="text-indigo-600" />
                Property Details
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-indigo-50 p-6 rounded-xl space-y-4">
                  <h3 className="text-lg font-medium text-indigo-900 flex items-center gap-2">
                    <MapPin size={20} className="text-indigo-600" />
                    Location Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <input
                        type="text"
                        name="city"
                        value={features.city}
                        onChange={handleInputChange}
                        placeholder="e.g., Mumbai"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">State</label>
                      <input
                        type="text"
                        name="state"
                        value={features.state}
                        onChange={handleInputChange}
                        placeholder="e.g., Maharashtra"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Area Type</label>
                    <select
                      name="location"
                      value={features.location}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="urban">Urban</option>
                      <option value="suburban">Suburban</option>
                      <option value="rural">Rural</option>
                    </select>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl space-y-4">
                  <h3 className="text-lg font-medium text-blue-900 flex items-center gap-2">
                    <Map size={20} className="text-blue-600" />
                    Property Specifications
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Size (sq ft)
                    </label>
                    <input
                      type="number"
                      name="size"
                      value={features.size || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Bedrooms
                      </label>
                      <input
                        type="number"
                        name="bedrooms"
                        value={features.bedrooms || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Bathrooms
                      </label>
                      <input
                        type="number"
                        name="bathrooms"
                        value={features.bathrooms || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Year Built
                    </label>
                    <input
                      type="number"
                      name="yearBuilt"
                      value={features.yearBuilt || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="hasGarage"
                        checked={features.hasGarage}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        Parking/Garage Available
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="hasPool"
                        checked={features.hasPool}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        Swimming Pool
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <Brain className="animate-pulse mr-2" size={20} />
                      AI Processing...
                    </>
                  ) : (
                    <>
                      <Brain size={20} className="mr-2" />
                      Calculate with AI
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Results */}
            <div className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-xl shadow-inner">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2 mb-6">
                <Brain size={24} className="text-indigo-600" />
                AI Valuation Results
              </h2>

              {prediction ? (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-50">
                    <h3 className="text-sm font-medium text-gray-500">AI-Predicted Price</h3>
                    <p className="text-4xl font-bold text-indigo-600 mt-2">
                      {formatIndianPrice(prediction.price)}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Based on advanced machine learning analysis
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-50">
                    <h3 className="text-sm font-medium text-gray-500">AI Confidence Level</h3>
                    <div className="mt-4">
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${prediction.confidence}%` }}
                        />
                      </div>
                      <p className="mt-2 text-sm font-medium text-gray-600">
                        {prediction.confidence}% prediction accuracy
                      </p>
                    </div>
                  </div>

                  <div className="bg-indigo-50 p-6 rounded-xl flex items-start gap-3">
                    <AlertCircle className="text-indigo-600 shrink-0" size={24} />
                    <div className="space-y-2">
                      <p className="text-sm text-indigo-900">
                        This AI prediction is based on machine learning analysis of market data, location trends, and property characteristics in {features.city}, {features.state}.
                      </p>
                      <p className="text-sm text-indigo-700">
                        Our model considers multiple factors including seasonal trends, market dynamics, and location-specific patterns.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <Brain size={64} className="mx-auto mb-6 opacity-50" />
                  <p className="text-lg">Enter property details for AI analysis</p>
                  <p className="text-sm text-gray-400 mt-2">Our advanced machine learning model will process the information and provide a detailed prediction</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;