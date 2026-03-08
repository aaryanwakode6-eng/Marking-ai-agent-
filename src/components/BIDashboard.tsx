import React, { useState, useRef } from 'react';
import { generateBIDashboard } from '../services/gemini';
import { Loader2, BarChart3, Upload, X, FileText, TrendingUp, TrendingDown, Minus, Settings2 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter } from 'recharts';
import { clsx } from 'clsx';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter';

type DashboardData = {
  title: string;
  summary: string;
  keyMetrics: { label: string; value: string; trend?: string }[];
  charts: {
    title: string;
    type: ChartType;
    data: { name: string; value: number }[];
  }[];
};

export function BIDashboard() {
  const [files, setFiles] = useState<File[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    if (files.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await generateBIDashboard(files);
      if (res) {
        const parsedData = JSON.parse(res) as DashboardData;
        setDashboardData(parsedData);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while generating the dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderTrendIcon = (trend?: string) => {
    if (!trend) return <Minus className="w-4 h-4 text-gray-400" />;
    if (trend.startsWith('+')) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (trend.startsWith('-')) return <TrendingDown className="w-4 h-4 text-rose-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const renderTrendColor = (trend?: string) => {
    if (!trend) return "text-gray-500";
    if (trend.startsWith('+')) return "text-emerald-600 bg-emerald-50";
    if (trend.startsWith('-')) return "text-rose-600 bg-rose-50";
    return "text-gray-500 bg-gray-50";
  };

  const changeChartType = (chartIndex: number, newType: ChartType) => {
    if (!dashboardData) return;
    const newData = { ...dashboardData };
    newData.charts[chartIndex].type = newType;
    setDashboardData(newData);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            AI BI Dashboard Generator
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Upload PDF reports, CSVs, or data exports. The AI will extract key metrics and automatically build a Business Intelligence dashboard.
        </p>
      </div>

      {!dashboardData && (
        <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-8">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Generate a Dashboard</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Upload your data files to instantly visualize key metrics, trends, and categorical breakdowns.
            </p>

            <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl p-6 bg-gray-50/50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mb-6">
              <button
                title="Click to select data files for the dashboard"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-400 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 transition-all shadow-sm flex items-center gap-2 mx-auto"
              >
                <Upload className="w-4 h-4" />
                Browse Files
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
                    <div key={index} className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-3 py-2 rounded-lg text-sm border border-indigo-100 dark:border-indigo-800">
                      <FileText className="w-4 h-4" />
                      <span className="max-w-[200px] truncate">{file.name}</span>
                      <button
                        title="Remove this file"
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full transition-colors ml-1"
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
              title="Click to analyze data and generate the BI dashboard"
              onClick={handleGenerate}
              disabled={loading || files.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Data...</>
              ) : (
                'Generate Dashboard'
              )}
            </button>
          </div>
        </div>
      )}

      {dashboardData && (
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{dashboardData.summary}</p>
            </div>
            <button
              title="Clear current dashboard and start over"
              onClick={() => { setDashboardData(null); setFiles([]); }}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
            >
              Start Over
            </button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {dashboardData.keyMetrics.map((metric, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{metric.label}</p>
                <div className="flex items-end justify-between">
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</h4>
                  {metric.trend && (
                    <div className={clsx("flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium", renderTrendColor(metric.trend))}>
                      {renderTrendIcon(metric.trend)}
                      {metric.trend}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dashboardData.charts.map((chart, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{chart.title}</h4>
                  <div className="relative group">
                    <button className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded-lg transition-colors" title="Change chart type">
                      <Settings2 className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 overflow-hidden">
                      <div className="p-1 flex flex-col">
                        <button onClick={() => changeChartType(idx, 'bar')} className={clsx("text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300", chart.type === 'bar' && "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium")}>Bar Chart</button>
                        <button onClick={() => changeChartType(idx, 'line')} className={clsx("text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300", chart.type === 'line' && "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium")}>Line Chart</button>
                        <button onClick={() => changeChartType(idx, 'area')} className={clsx("text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300", chart.type === 'area' && "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium")}>Area Chart</button>
                        <button onClick={() => changeChartType(idx, 'scatter')} className={clsx("text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300", chart.type === 'scatter' && "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium")}>Scatter Plot</button>
                        <button onClick={() => changeChartType(idx, 'pie')} className={clsx("text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300", chart.type === 'pie' && "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium")}>Pie Chart</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {chart.type === 'bar' ? (
                      <BarChart data={chart.data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    ) : chart.type === 'line' ? (
                      <LineChart data={chart.data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    ) : chart.type === 'area' ? (
                      <AreaChart data={chart.data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="#c4b5fd" fillOpacity={0.5} strokeWidth={2} />
                      </AreaChart>
                    ) : chart.type === 'scatter' ? (
                      <ScatterChart margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                        <YAxis dataKey="value" type="number" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Scatter name="Values" data={chart.data} fill="#f59e0b" />
                      </ScatterChart>
                    ) : (
                      <PieChart>
                        <Pie
                          data={chart.data}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chart.data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
