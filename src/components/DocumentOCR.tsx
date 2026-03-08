import React, { useState, useRef } from 'react';
import { extractDocumentData } from '../services/gemini';
import { Loader2, FileSearch, Upload, X, FileText, Settings } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { clsx } from 'clsx';

export function DocumentOCR() {
  const [files, setFiles] = useState<File[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleExtract = async () => {
    if (files.length === 0) return;
    setLoading(true);
    try {
      const res = await extractDocumentData(files, customPrompt);
      setResult(res);
    } catch (error) {
      console.error(error);
      setResult('An error occurred while extracting data from the document(s).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <FileSearch className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            Document AI (OCR & Extraction)
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Upload images, PDFs, or text files to extract data, summarize reports, or parse structured information using Gemini's multimodal capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <div className="flex flex-col gap-4 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-y-auto">
          
          <div className="flex-1 flex flex-col justify-center items-center border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl p-8 bg-gray-50/50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Upload Documents</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Supports Images, PDFs, CSVs, and TXT files.</p>
              <button
                title="Click to select files for data extraction"
                onClick={() => fileInputRef.current?.click()}
                className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2 mx-auto"
              >
                <Upload className="w-4 h-4" />
                Select Files to Process
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
                accept="image/*,.pdf,.csv,.txt"
              />
            </div>
          </div>

          {files.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Attached Files ({files.length})</label>
              <div className="flex flex-wrap gap-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-3 py-2 rounded-lg text-sm border border-amber-100 dark:border-amber-800">
                    <FileText className="w-4 h-4" />
                    <span className="max-w-[200px] truncate">{file.name}</span>
                    <button
                      title="Remove this file"
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-amber-200 dark:hover:bg-amber-800 rounded-full transition-colors ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 mt-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Custom Extraction Prompt (Optional)
            </label>
            <textarea
              title="Provide specific instructions on what data to extract or how to format it"
              className="w-full p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all resize-none h-24 text-sm"
              placeholder="e.g., 'Extract all invoice line items as a JSON array', 'Summarize the key findings of this report', or leave blank for general extraction."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
          </div>

          <button
            title="Click to extract data from the uploaded documents"
            onClick={handleExtract}
            disabled={loading || files.length === 0}
            className="mt-2 bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processing Documents...</>
            ) : (
              'Extract Data'
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
              <FileSearch className="w-12 h-12 mb-4 opacity-20" />
              <p>Your extracted document data will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
