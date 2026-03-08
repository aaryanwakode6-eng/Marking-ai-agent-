import React, { useState, useRef } from 'react';
import { generatePresentation } from '../services/gemini';
import { Loader2, Presentation, Upload, X, FileText, ChevronLeft, ChevronRight, Play, Download } from 'lucide-react';
import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';

type Slide = {
  title: string;
  content: string;
  bullets?: string[];
  speakerNotes?: string;
};

type PresentationData = {
  title: string;
  slides: Slide[];
};

export function PresentationGenerator() {
  const [topic, setTopic] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [presentationData, setPresentationData] = useState<PresentationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
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

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await generatePresentation(topic, files);
      if (res) {
        const parsedData = JSON.parse(res) as PresentationData;
        setPresentationData(parsedData);
        setCurrentSlideIndex(0);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while generating the presentation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    if (presentationData && currentSlideIndex < presentationData.slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const exportJSON = () => {
    if (!presentationData) return;
    const dataStr = JSON.stringify(presentationData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${presentationData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presentation.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <Presentation className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            LLM Presentation Generator
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Generate professional slide decks from a topic or uploaded documents.
        </p>
      </div>

      {!presentationData && (
        <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-8">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Presentation className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Create a Presentation</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Enter a topic and optionally upload documents to generate a structured slide deck.
            </p>

            <div className="mb-6 text-left">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Presentation Topic
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g., Q3 Marketing Strategy, Introduction to Lean Six Sigma..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl p-6 bg-gray-50/50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mb-6">
              <button
                title="Click to select documents for context"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-500 hover:text-teal-700 dark:hover:text-teal-400 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 transition-all shadow-sm flex items-center gap-2 mx-auto"
              >
                <Upload className="w-4 h-4" />
                Add Context Files (Optional)
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

            {files.length > 0 && (
              <div className="flex flex-col gap-2 mb-6 text-left">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Attached Files ({files.length})</label>
                <div className="flex flex-wrap gap-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 bg-teal-50 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 px-3 py-2 rounded-lg text-sm border border-teal-100 dark:border-teal-800">
                      <FileText className="w-4 h-4" />
                      <span className="max-w-[200px] truncate">{file.name}</span>
                      <button
                        title="Remove this file"
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-teal-200 dark:hover:bg-teal-800 rounded-full transition-colors ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-rose-500 text-sm font-medium mb-4">{error}</p>}

            <button
              title="Click to generate the presentation"
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Generating Slides...</>
              ) : (
                <><Play className="w-5 h-5" /> Generate Presentation</>
              )}
            </button>
          </div>
        </div>
      )}

      {presentationData && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{presentationData.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Slide {currentSlideIndex + 1} of {presentationData.slides.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                title="Export presentation as JSON"
                onClick={exportJSON}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export JSON
              </button>
              <button
                title="Clear current presentation and start over"
                onClick={() => { setPresentationData(null); setFiles([]); setTopic(''); }}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>

          {/* Slide Viewer */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden relative">
            <div className="flex-1 p-8 md:p-16 flex flex-col justify-center overflow-y-auto">
              <div className="max-w-4xl mx-auto w-full">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  {presentationData.slides[currentSlideIndex].title}
                </h2>
                {presentationData.slides[currentSlideIndex].content && (
                  <div className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                    <ReactMarkdown>{presentationData.slides[currentSlideIndex].content}</ReactMarkdown>
                  </div>
                )}
                {presentationData.slides[currentSlideIndex].bullets && presentationData.slides[currentSlideIndex].bullets!.length > 0 && (
                  <ul className="list-disc pl-8 space-y-4 text-lg md:text-xl text-gray-700 dark:text-gray-200">
                    {presentationData.slides[currentSlideIndex].bullets!.map((bullet, idx) => (
                      <li key={idx}><ReactMarkdown>{bullet}</ReactMarkdown></li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Slide Navigation Controls */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center shrink-0">
              <button
                onClick={prevSlide}
                disabled={currentSlideIndex === 0}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors text-gray-700 dark:text-gray-300"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              
              <div className="flex gap-1">
                {presentationData.slides.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={clsx(
                      "w-2 h-2 rounded-full transition-all", 
                      idx === currentSlideIndex ? "bg-teal-600 dark:bg-teal-400 w-4" : "bg-gray-300 dark:bg-gray-600"
                    )}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                disabled={currentSlideIndex === presentationData.slides.length - 1}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors text-gray-700 dark:text-gray-300"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>
          </div>

          {/* Speaker Notes */}
          {presentationData.slides[currentSlideIndex].speakerNotes && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/50 rounded-xl shrink-0">
              <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-500 mb-1">Speaker Notes</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-400/90 whitespace-pre-wrap">
                {presentationData.slides[currentSlideIndex].speakerNotes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
