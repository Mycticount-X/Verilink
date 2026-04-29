import React, { useState } from 'react';
import MatrixRain from './MatrixRain';

interface PredictionResult {
  url: string;
  prediction: 'benign' | 'defacement' | 'phishing' | 'malware';
  confidence?: number;
}

const Verilink: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url }),
      });

      if (!response.ok) {
        throw new Error('Server FastAPI tidak merespon.');
      }

      const data = await response.json();
      setResult(data); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getResultBadge = (prediction: string) => {
    switch (prediction.toLowerCase()) {
      case 'benign':
        return { text: 'Safe (Benign)', style: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/30' };
      case 'defacement':
        return { text: 'Defacement', style: 'text-orange-400 bg-orange-400/10 border-orange-500/30' };
      case 'phishing':
        return { text: 'Phishing', style: 'text-red-400 bg-red-400/10 border-red-500/30' };
      case 'malware':
        return { text: 'Malware', style: 'text-rose-500 bg-rose-500/10 border-rose-500/30' };
      default:
        return { text: 'Tidak Diketahui', style: 'text-gray-400 bg-gray-800 border-gray-600' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-4 font-sans relative">
       <MatrixRain />
      
      <div className="w-full max-w-2xl bg-gray-900 border border-purple-900/50 rounded-2xl shadow-[0_0_40px_-10px_rgba(147,51,234,0.3)] p-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 mb-2">
            Verilink
          </h1>
          <p className="text-gray-400 text-sm">
            Analyze URLs for Malicious Content
          </p>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter the URL to check (e.g., https://google.com)"
              className="w-full px-5 py-4 bg-gray-950 border border-gray-800 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-600"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 ${
              loading 
                ? 'bg-purple-800 cursor-not-allowed opacity-70' 
                : 'bg-purple-600 hover:bg-purple-500 hover:shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)]'
            }`}
          >
            {loading ? 'Analyzing...' : 'Analyze URL'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center text-sm">
            {error}
          </div>
        )}
      </div>
      {result && (
        <div className="w-full max-w-sm mt-6 bg-gray-1000 border border-purple-800/50 rounded-2xl shadow-[0_0_20px_-5px_rgba(147,51,234,0.2)] p-6 relative animate-fade-in transition-all relative z-10">  
          {/* X */}
          <button 
            onClick={() => setResult(null)}
            className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors p-1"
            aria-label="Tutup"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h3 className="text-gray-400 text-sm mb-6 text-center pr-4 pl-4">
            Analysis Result for: <br/>
            <span className="text-gray-200 break-all font-medium">{result.url}</span>
          </h3>
          
          <div className="flex justify-center">
            <div className={`px-8 py-3 rounded-full border border-solid font-bold tracking-wider shadow-lg ${getResultBadge(result.prediction).style}`}>
              {getResultBadge(result.prediction).text}
            </div>
          </div>
          
          {result.confidence && (
            <p className="text-center text-gray-500 mt-6 text-xs">
              Confidence Level: {(result.confidence * 100).toFixed(2)}%
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Verilink;