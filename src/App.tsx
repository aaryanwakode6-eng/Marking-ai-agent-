import React, { useState, useEffect } from 'react';
import { CopyKaizen } from './components/CopyKaizen';
import { VoCAnalyzer } from './components/VoCAnalyzer';
import { DMAICAssistant } from './components/DMAICAssistant';
import { ChatBot } from './components/ChatBot';
import { LiveTalk } from './components/LiveTalk';
import { DocumentOCR } from './components/DocumentOCR';
import { BIDashboard } from './components/BIDashboard';
import { PresentationGenerator } from './components/PresentationGenerator';
import { PerplexityChat } from './components/PerplexityChat';
import { Sparkles, MessageSquareText, GitMerge, LayoutDashboard, MessageSquare, Mic, FileSearch, BarChart3, Presentation, Search, Menu, X, Moon, Sun } from 'lucide-react';
import { clsx } from 'clsx';

type Tool = 'copy' | 'voc' | 'dmaic' | 'ocr' | 'bi' | 'presentation' | 'chat' | 'live' | 'perplexity';
type Theme = 'light' | 'dark';

export default function App() {
  const [activeTool, setActiveTool] = useState<Tool>('copy');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleToolSelect = (tool: Tool) => {
    setActiveTool(tool);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#f5f5f5] dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans overflow-hidden transition-colors duration-200">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-40 flex items-center justify-between px-4 transition-colors duration-200">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Six Sigma AI</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transform transition-all duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 hidden md:flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <LayoutDashboard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              Six Sigma AI
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium tracking-wide uppercase">Marketing Agent</p>
          </div>
          <button 
            onClick={toggleTheme}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>

        <div className="p-4 border-b border-gray-100 dark:border-gray-700 md:hidden flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Six Sigma AI</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">Marketing Agent</p>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            title="Improve marketing copy using Kaizen principles"
            onClick={() => handleToolSelect('copy')}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              activeTool === 'copy' 
                ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300" 
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Sparkles className={clsx("w-5 h-5", activeTool === 'copy' ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500")} />
            Copy Kaizen
          </button>

          <button
            title="Analyze customer feedback and sentiment"
            onClick={() => handleToolSelect('voc')}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              activeTool === 'voc' 
                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" 
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <MessageSquareText className={clsx("w-5 h-5", activeTool === 'voc' ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500")} />
            VoC Analyzer
          </button>

          <button
            title="Structure campaigns or analyze root causes"
            onClick={() => handleToolSelect('dmaic')}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              activeTool === 'dmaic' 
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" 
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <GitMerge className={clsx("w-5 h-5", activeTool === 'dmaic' ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500")} />
            DMAIC Assistant
          </button>

          <button
            title="Extract data from documents and images"
            onClick={() => handleToolSelect('ocr')}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              activeTool === 'ocr' 
                ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" 
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <FileSearch className={clsx("w-5 h-5", activeTool === 'ocr' ? "text-amber-600 dark:text-amber-400" : "text-gray-400 dark:text-gray-500")} />
            Document AI (OCR)
          </button>

          <button
            title="Generate BI dashboards from data files"
            onClick={() => handleToolSelect('bi')}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              activeTool === 'bi' 
                ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300" 
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <BarChart3 className={clsx("w-5 h-5", activeTool === 'bi' ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500")} />
            BI Dashboard
          </button>

          <button
            title="Generate presentations from topics or documents"
            onClick={() => handleToolSelect('presentation')}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              activeTool === 'presentation' 
                ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300" 
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Presentation className={clsx("w-5 h-5", activeTool === 'presentation' ? "text-teal-600 dark:text-teal-400" : "text-gray-400 dark:text-gray-500")} />
            Slides Generator
          </button>

          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">AI Assistants</p>
          </div>

          <button
            title="Chat with the AI Marketing Agent"
            onClick={() => handleToolSelect('chat')}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              activeTool === 'chat' 
                ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" 
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <MessageSquare className={clsx("w-5 h-5", activeTool === 'chat' ? "text-purple-600 dark:text-purple-400" : "text-gray-400 dark:text-gray-500")} />
            AI Chat
          </button>

          <button
            title="Have a live voice conversation with the AI"
            onClick={() => handleToolSelect('live')}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              activeTool === 'live' 
                ? "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300" 
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Mic className={clsx("w-5 h-5", activeTool === 'live' ? "text-rose-600 dark:text-rose-400" : "text-gray-400 dark:text-gray-500")} />
            Live Talk
          </button>

          <button
            title="Search the web with Perplexity Sonar AI"
            onClick={() => handleToolSelect('perplexity')}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              activeTool === 'perplexity' 
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" 
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Search className={clsx("w-5 h-5", activeTool === 'perplexity' ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500")} />
            Perplexity Sonar
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              Applying Lean Six Sigma principles to marketing automation.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto w-full transition-colors duration-200">
        <div className="max-w-6xl mx-auto h-full">
          {activeTool === 'copy' && <CopyKaizen />}
          {activeTool === 'voc' && <VoCAnalyzer />}
          {activeTool === 'dmaic' && <DMAICAssistant />}
          {activeTool === 'ocr' && <DocumentOCR />}
          {activeTool === 'bi' && <BIDashboard />}
          {activeTool === 'presentation' && <PresentationGenerator />}
          {activeTool === 'chat' && <ChatBot />}
          {activeTool === 'live' && <LiveTalk />}
          {activeTool === 'perplexity' && <PerplexityChat />}
        </div>
      </main>
    </div>
  );
}
