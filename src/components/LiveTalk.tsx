import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, Loader2, Activity, User, Bot } from 'lucide-react';
import { clsx } from 'clsx';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function float32ToBase64(float32Array: Float32Array) {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    let s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  const bytes = new Uint8Array(int16Array.buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToFloat32(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16Array = new Int16Array(bytes.buffer);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }
  return float32Array;
}

type TranscriptItem = {
  id: string;
  role: 'user' | 'model';
  text: string;
  finished: boolean;
};

export function LiveTalk() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recordContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  const stopLiveSession = () => {
    setIsConnecting(false);
    setIsConnected(false);
    setIsSpeaking(false);
    
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (recordContextRef.current) {
      recordContextRef.current.close().catch(() => {});
      recordContextRef.current = null;
    }
    if (sessionRef.current) {
      sessionRef.current.then((session: any) => session.close()).catch(() => {});
      sessionRef.current = null;
    }
    activeSourcesRef.current.forEach(s => {
      try { s.stop(); } catch (e) {}
    });
    activeSourcesRef.current = [];
  };

  const startLiveSession = async () => {
    try {
      setError(null);
      setIsConnecting(true);
      setTranscripts([]);
      
      // Playback context (24kHz as per Gemini TTS output)
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx({ sampleRate: 24000 });
      nextPlayTimeRef.current = audioContextRef.current.currentTime;

      // Recording context (16kHz as per Gemini Live input)
      recordContextRef.current = new AudioCtx({ sampleRate: 16000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1 } });
      streamRef.current = stream;

      const source = recordContextRef.current.createMediaStreamSource(stream);
      const processor = recordContextRef.current.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are an elite AI Marketing Agent with 40 years of experience as a Lean Six Sigma Black Belt. Keep responses concise, professional, and conversational.",
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const base64Data = float32ToBase64(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                });
              });
            };
            source.connect(processor);
            processor.connect(recordContextRef.current!.destination);
          },
          onmessage: (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              setIsSpeaking(true);
              const float32Data = base64ToFloat32(base64Audio);
              const audioBuffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
              audioBuffer.getChannelData(0).set(float32Data);

              const sourceNode = audioContextRef.current.createBufferSource();
              sourceNode.buffer = audioBuffer;
              sourceNode.connect(audioContextRef.current.destination);

              const startTime = Math.max(nextPlayTimeRef.current, audioContextRef.current.currentTime);
              sourceNode.start(startTime);
              nextPlayTimeRef.current = startTime + audioBuffer.duration;

              activeSourcesRef.current.push(sourceNode);
              sourceNode.onended = () => {
                activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== sourceNode);
                if (activeSourcesRef.current.length === 0) {
                  setIsSpeaking(false);
                }
              };
            }

            // Handle Input Transcription (User)
            if (message.serverContent?.inputTranscription) {
              const t = message.serverContent.inputTranscription;
              setTranscripts(prev => {
                const lastUser = prev.slice().reverse().find(p => p.role === 'user');
                if (lastUser && !lastUser.finished) {
                  return prev.map(p => p.id === lastUser.id ? { ...p, text: p.text + (t.text || ''), finished: !!t.finished } : p);
                } else {
                  return [...prev, { id: Date.now().toString() + '-user', role: 'user', text: t.text || '', finished: !!t.finished }];
                }
              });
            }

            // Handle Output Transcription (Model)
            if (message.serverContent?.outputTranscription) {
              const t = message.serverContent.outputTranscription;
              setTranscripts(prev => {
                const lastModel = prev.slice().reverse().find(p => p.role === 'model');
                if (lastModel && !lastModel.finished) {
                  return prev.map(p => p.id === lastModel.id ? { ...p, text: p.text + (t.text || ''), finished: !!t.finished } : p);
                } else {
                  return [...prev, { id: Date.now().toString() + '-model', role: 'model', text: t.text || '', finished: !!t.finished }];
                }
              });
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              activeSourcesRef.current.forEach(s => {
                try { s.stop(); } catch (e) {}
              });
              activeSourcesRef.current = [];
              if (audioContextRef.current) {
                nextPlayTimeRef.current = audioContextRef.current.currentTime;
              }
              setIsSpeaking(false);
              
              setTranscripts(prev => {
                const lastModel = prev.slice().reverse().find(p => p.role === 'model');
                if (lastModel && !lastModel.finished) {
                  return prev.map(p => p.id === lastModel.id ? { ...p, finished: true } : p);
                }
                return prev;
              });
            }
          },
          onclose: () => {
            stopLiveSession();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setError("Connection error occurred.");
            stopLiveSession();
          }
        }
      });

      sessionRef.current = sessionPromise;

    } catch (err) {
      console.error("Failed to start live session:", err);
      setError("Failed to access microphone or connect to AI.");
      stopLiveSession();
    }
  };

  useEffect(() => {
    return () => {
      stopLiveSession();
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 text-center shrink-0">
        <h2 className="text-3xl font-semibold mb-3 flex items-center justify-center gap-3 text-gray-900 dark:text-white">
          <Activity className="w-8 h-8 text-rose-500 dark:text-rose-400" />
          Live Talk
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Have a real-time voice conversation with your Lean Six Sigma Marketing Agent.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start min-h-0">
        <div className="relative flex flex-col items-center justify-center shrink-0 mb-8 mt-4">
          {/* Pulsing background when connected */}
          {isConnected && (
            <>
              <div className="absolute w-40 h-40 bg-rose-200 rounded-full animate-ping opacity-20"></div>
              <div className={clsx("absolute w-48 h-48 bg-rose-300 rounded-full animate-pulse opacity-20 transition-all", isSpeaking ? "scale-110 opacity-40" : "")}></div>
            </>
          )}

          <button
            title={isConnected ? "Click to stop the live conversation" : "Click to start a live voice conversation with the AI"}
            onClick={isConnected ? stopLiveSession : startLiveSession}
            disabled={isConnecting}
            className={clsx(
              "relative z-10 w-28 h-28 rounded-full flex items-center justify-center transition-all shadow-xl border-4",
              isConnected 
                ? "bg-rose-500 hover:bg-rose-600 border-rose-200 dark:border-rose-800 text-white" 
                : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200"
            )}
          >
            {isConnecting ? (
              <Loader2 className="w-10 h-10 animate-spin text-gray-400 dark:text-gray-500" />
            ) : isConnected ? (
              <MicOff className="w-10 h-10" />
            ) : (
              <Mic className="w-10 h-10 text-rose-500 dark:text-rose-400" />
            )}
          </button>

          <div className="mt-6 text-center h-8">
            {isConnecting && <p className="text-gray-500 dark:text-gray-400 font-medium">Connecting to AI...</p>}
            {isConnected && (
              <p className={clsx("font-medium transition-colors", isSpeaking ? "text-rose-600 dark:text-rose-400" : "text-gray-500 dark:text-gray-400")}>
                {isSpeaking ? "AI is speaking..." : "Listening..."}
              </p>
            )}
            {!isConnected && !isConnecting && <p className="text-gray-500 dark:text-gray-400 font-medium">Click to start conversation</p>}
            {error && <p className="text-red-500 dark:text-red-400 font-medium mt-2">{error}</p>}
          </div>
        </div>

        {/* Transcript Area */}
        <div className="w-full max-w-3xl flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
            <h3 className="font-medium text-gray-700 dark:text-gray-300">Live Transcript</h3>
            {transcripts.length > 0 && (
              <span className="text-xs font-medium px-2 py-1 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded-full">Live</span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {transcripts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                <p className="text-sm">Start the conversation to see the transcript here.</p>
              </div>
            ) : (
              transcripts.map((t) => (
                <div key={t.id} className={clsx("flex gap-3", t.role === 'user' ? "flex-row-reverse" : "")}>
                  <div className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                    t.role === 'user' ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300" : "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300"
                  )}>
                    {t.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={clsx(
                    "px-4 py-3 rounded-2xl max-w-[80%]",
                    t.role === 'user' 
                      ? "bg-indigo-600 text-white rounded-tr-none" 
                      : "bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none"
                  )}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {t.text}
                      {!t.finished && <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-current animate-pulse opacity-50"></span>}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
