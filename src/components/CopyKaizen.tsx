import React, { useState } from 'react';
import { generateCopyKaizen } from '../services/gemini';
import { Loader2, Sparkles, Target, Users } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function CopyKaizen() {
  const [originalCopy, setOriginalCopy] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [goal, setGoal] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!originalCopy || !targetAudience || !goal) return;
    setLoading(true);
    try {
      const res = await generateCopyKaizen(originalCopy, targetAudience, goal);
      setResult(res);
    } catch (error) {
      console.error(error);
      setResult('An error occurred while generating variations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
          <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          AI Copy Kaizen
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Generate high-converting A/B test variations using Lean methodologies and psychological principles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <div className="flex flex-col gap-4 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Original Copy
            </label>
            <textarea
              title="Paste the marketing copy you want to improve"
              className="w-full p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none h-40"
              placeholder="Paste the marketing copy you want to improve..."
              value={originalCopy}
              onChange={(e) => setOriginalCopy(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
              <Users className="w-4 h-4" /> Target Audience
            </label>
            <input
              type="text"
              title="Describe who this copy is for (e.g., B2B SaaS founders, busy moms)"
              className="w-full p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g., SaaS founders, fitness enthusiasts..."
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
              <Target className="w-4 h-4" /> Conversion Goal
            </label>
            <input
              type="text"
              title="What is the main objective? (e.g., Increase signups, boost click-through rate)"
              className="w-full p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g., Sign up for a free trial, purchase a product..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>

          <button
            title="Click to generate 3 improved variations of your copy using Lean principles"
            onClick={handleGenerate}
            disabled={loading || !originalCopy || !targetAudience || !goal}
            className="mt-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Applying Kaizen...
              </>
            ) : (
              'Generate Variations'
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
              <Sparkles className="w-12 h-12 mb-4 opacity-20" />
              <p>Your optimized variations will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
