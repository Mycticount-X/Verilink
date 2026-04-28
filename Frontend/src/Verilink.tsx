import React, { useState } from 'react';

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

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!url.trim()) return;

//     setLoading(true);
//     setError(null);
//     setResult(null);

//     try {
//       const response = await fetch('http://localhost:8000/api/analyze', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ url: url }),
//       });

//       if (!response.ok) {
//         throw new Error('Gagal terhubung ke server. Pastikan FastAPI berjalan.');
//       }

//       const data: PredictionResult = await response.json();
//       setResult(data);
//     } catch (err: any) {
//       setError(err.message || 'Terjadi kesalahan tak terduga.');
//     } finally {
//       setLoading(false);
//     }
//   };

  // Just for Testing
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    setTimeout(() => {
      try {
        let mockPrediction: 'benign' | 'defacement' | 'phishing' | 'malware' = 'benign';
        const lowerUrl = url.toLowerCase();

        if (lowerUrl.includes('deface') || lowerUrl.includes('hack')) {
          mockPrediction = 'defacement';
        } else if (lowerUrl.includes('login') || lowerUrl.includes('phish')) {
          mockPrediction = 'phishing';
        } else if (lowerUrl.includes('virus') || lowerUrl.includes('malware')) {
          mockPrediction = 'malware';
        } else if (lowerUrl.includes('aman') || lowerUrl.includes('google')) {
          mockPrediction = 'benign';
        } else {
          const categories: Array<'benign' | 'defacement' | 'phishing' | 'malware'> = ['benign', 'defacement', 'phishing', 'malware'];
          mockPrediction = categories[Math.floor(Math.random() * categories.length)];
        }

        const mockData: PredictionResult = {
          url: url,
          prediction: mockPrediction,
          confidence: 0.75 + (Math.random() * 0.24) 
        };

        setResult(mockData);
      } catch (err: any) {
        setError("Terjadi kesalahan saat melakukan simulasi.");
      } finally {
        setLoading(false);
      }
    }, 1500); 
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
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl bg-gray-900 border border-purple-900/50 rounded-2xl shadow-[0_0_40px_-10px_rgba(147,51,234,0.3)] p-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 mb-2">
            Verilink
          </h1>
          <p className="text-gray-400 text-sm">
            Deteksi Malicious URL Berbasis AI
          </p>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Masukkan URL yang ingin dicek (misal: http://contoh.com)"
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
            {loading ? 'Menganalisis...' : 'Deteksi Tautan'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center text-sm">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-8 p-6 bg-gray-950 border border-gray-800 rounded-xl animate-fade-in">
            <h3 className="text-gray-400 text-sm mb-4 text-center">Analysis Result for: <br/><span className="text-gray-200 break-all">{result.url}</span></h3>
            
            <div className="flex justify-center">
              <div className={`px-6 py-3 rounded-full border border-solid font-bold tracking-wide ${getResultBadge(result.prediction).style}`}>
                {getResultBadge(result.prediction).text}
              </div>
            </div>
            
            {result.confidence && (
              <p className="text-center text-gray-500 mt-4 text-xs">
                Confidence Level: {(result.confidence * 100).toFixed(2)}%
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Verilink;