import React, { useState } from 'react';
import { analyzeVoC } from '../services/gemini';
import { Loader2, MessageSquareText, Activity, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function VoCAnalyzer() {
  const [feedbackData, setFeedbackData] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!feedbackData) return;
    setLoading(true);
    try {
      const res = await analyzeVoC(feedbackData);
      setResult(res);
    } catch (error) {
      console.error(error);
      setResult('An error occurred while analyzing feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
          <MessageSquareText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          Voice of Customer (VoC) Analyzer
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze sentiment, extract key themes, and identify specific "Defects" in the customer journey.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <div className="flex flex-col gap-4 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-y-auto">
          <div className="flex-1 flex flex-col">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Customer Feedback / Reviews
            </label>
            <textarea
              title="Paste customer reviews, survey responses, or support tickets here"
              className="flex-1 w-full p-4 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none min-h-[300px]"
              placeholder="Paste customer feedback, reviews, survey data, or support tickets here..."
              value={feedbackData}
              onChange={(e) => setFeedbackData(e.target.value)}
            />
          </div>

          <button
            title="Click to analyze sentiment and identify key themes and defects"
            onClick={handleAnalyze}
            disabled={loading || !feedbackData}
            className="mt-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing VoC...
              </>
            ) : (
              'Analyze Feedback'
            )}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-y-auto">
          {result ? (
            <div className="markdown-body dark:text-gray-200">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
              <AlertTriangle className="w-12 h-12 mb-4 opacity-20" />
              <p>Your VoC analysis and identified defects will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
