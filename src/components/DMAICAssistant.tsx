import React, { useState, useRef } from 'react';
import { generateDMAIC, analyze5Whys } from '../services/gemini';
import { Loader2, GitMerge, Target, AlertCircle, Database, HelpCircle, Upload, X, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { clsx } from 'clsx';

const ANALYTICS_PLATFORMS = [
  'Google Analytics 4',
  'HubSpot',
  'Salesforce',
  'Mixpanel',
  'Meta Ads',
  'Google Ads',
];

export function DMAICAssistant() {
  const [mode, setMode] = useState<'dmaic' | '5whys'>('dmaic');

  // DMAIC State
  const [campaignGoal, setCampaignGoal] = useState('');
  const [currentState, setCurrentState] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [customMetrics, setCustomMetrics] = useState('');
  
  // 5 Whys State
  const [problem, setProblem] = useState('');
  const [whys, setWhys] = useState(['', '', '', '', '']);

  // Shared State
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
    // Reset input so the same file can be selected again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerateDMAIC = async () => {
    if (!campaignGoal || !currentState) return;
    setLoading(true);
    try {
      const dataSources = `
Platforms: ${selectedPlatforms.length > 0 ? selectedPlatforms.join(', ') : 'None selected'}
Specific Metrics/Data: ${customMetrics || 'None provided'}
      `.trim();
      const res = await generateDMAIC(campaignGoal, currentState, dataSources, files);
      setResult(res);
    } catch (error) {
      console.error(error);
      setResult('An error occurred while generating the DMAIC framework.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze5Whys = async () => {
    if (!problem || !whys[0]) return;
    setLoading(true);
    try {
      const res = await analyze5Whys(problem, whys.filter(w => w.trim() !== ''), files);
      setResult(res);
    } catch (error) {
      console.error(error);
      setResult('An error occurred while analyzing the 5 Whys.');
    } finally {
      setLoading(false);
    }
  };

  const updateWhy = (index: number, value: string) => {
    const newWhys = [...whys];
    newWhys[index] = value;
    setWhys(newWhys);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <GitMerge className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            DMAIC & Root Cause Assistant
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Structure your campaigns with DMAIC or drill down into problems using the 5 Whys.
        </p>
        
        <div className="flex gap-2 p-1 bg-gray-200/50 dark:bg-gray-800/50 rounded-xl w-fit">
          <button 
            title="Switch to DMAIC Framework mode"
            onClick={() => setMode('dmaic')} 
            className={clsx(
              "px-5 py-2 rounded-lg text-sm font-medium transition-all", 
              mode === 'dmaic' ? "bg-white dark:bg-gray-700 shadow-sm text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            DMAIC Framework
          </button>
          <button 
            title="Switch to 5 Whys Analysis mode"
            onClick={() => setMode('5whys')} 
            className={clsx(
              "px-5 py-2 rounded-lg text-sm font-medium transition-all", 
              mode === '5whys' ? "bg-white dark:bg-gray-700 shadow-sm text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            5 Whys Analysis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <div className="flex flex-col gap-4 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-y-auto">
          
          {mode === 'dmaic' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Campaign Goal
                </label>
                <input
                  type="text"
                  title="What is the specific goal of this campaign?"
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g., Increase email open rates by 15%..."
                  value={campaignGoal}
                  onChange={(e) => setCampaignGoal(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Database className="w-4 h-4" /> Data Sources (Measure Phase)
                </label>
                <div className="flex flex-wrap gap-2 mb-1">
                  {ANALYTICS_PLATFORMS.map(platform => (
                    <button
                      key={platform}
                      title={`Toggle ${platform} as a data source`}
                      onClick={() => togglePlatform(platform)}
                      className={clsx(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                        selectedPlatforms.includes(platform)
                          ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      )}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
                <textarea
                  title="Provide specific metrics or data points to establish a baseline"
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none h-20 text-sm"
                  placeholder="Optional: Paste specific current metrics (e.g., Bounce rate 65%, CVR 1.2%) to auto-populate baselines..."
                  value={customMetrics}
                  onChange={(e) => setCustomMetrics(e.target.value)}
                />
              </div>

              <div className="flex-1 flex flex-col">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Current State / Problem
                </label>
                <textarea
                  title="Describe the current situation, pain points, or baseline metrics"
                  className="flex-1 w-full p-4 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none min-h-[120px]"
                  placeholder="Describe the current situation, pain points, or baseline metrics..."
                  value={currentState}
                  onChange={(e) => setCurrentState(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Core Problem
                </label>
                <input
                  type="text"
                  title="What is the core problem you are trying to solve?"
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g., Q3 Marketing ROI dropped by 20%..."
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                />
              </div>

              <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
                {[0, 1, 2, 3, 4].map((index) => {
                  // Only show this 'Why' if the previous 'Why' (or the problem, for index 0) is filled out
                  const isVisible = index === 0 ? problem.trim().length > 0 : whys[index - 1].trim().length > 0;
                  
                  if (!isVisible) return null;

                  const previousText = index === 0 ? problem : whys[index - 1];

                  return (
                    <div key={index} className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-start gap-2">
                        <HelpCircle className="w-4 h-4 mt-0.5 text-blue-500 dark:text-blue-400 shrink-0" /> 
                        <span>Why did <strong className="font-semibold text-blue-900 dark:text-blue-300">"{previousText}"</strong> happen?</span>
                      </label>
                      <div className="flex gap-2">
                        <div className="flex flex-col items-center justify-start pt-3 px-1">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          {index < 4 && <div className="w-0.5 h-full bg-blue-100 dark:bg-blue-900/50 mt-2"></div>}
                        </div>
                        <textarea
                          title={`Enter reason ${index + 1}`}
                          className="flex-1 p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none h-20 text-sm"
                          placeholder={`Enter reason ${index + 1}...`}
                          value={whys[index]}
                          onChange={(e) => updateWhy(index, e.target.value)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* File Upload Section */}
          <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4" /> Additional Context (Files)
            </label>
            <div className="flex items-center gap-3">
              <button
                title="Click to select files to upload"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Files
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400">Attach reports, data exports, or screenshots</span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
                accept="image/*,.pdf,.csv,.txt"
              />
            </div>
            
            {files.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg text-sm border border-blue-100 dark:border-blue-800">
                    <FileText className="w-4 h-4" />
                    <span className="max-w-[150px] truncate">{file.name}</span>
                    <button
                      title="Remove this file"
                      onClick={() => removeFile(index)}
                      className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            title={mode === 'dmaic' ? "Click to generate a structured DMAIC plan" : "Click to analyze the root cause based on your 5 Whys"}
            onClick={mode === 'dmaic' ? handleGenerateDMAIC : handleAnalyze5Whys}
            disabled={loading || (mode === 'dmaic' ? (!campaignGoal || !currentState) : (!problem || !whys[0]))}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> {mode === 'dmaic' ? 'Structuring DMAIC...' : 'Analyzing Root Cause...'}</>
            ) : (
              mode === 'dmaic' ? 'Generate Framework' : 'Analyze Root Cause'
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
              {mode === 'dmaic' ? (
                <GitMerge className="w-12 h-12 mb-4 opacity-20" />
              ) : (
                <HelpCircle className="w-12 h-12 mb-4 opacity-20" />
              )}
              <p>
                {mode === 'dmaic' 
                  ? 'Your DMAIC framework will appear here.' 
                  : 'Your Root Cause Analysis will appear here.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
