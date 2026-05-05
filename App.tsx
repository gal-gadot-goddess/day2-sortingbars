
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ALGORITHMS, ARRAY_SIZE, MAX_VALUE, SPEEDS } from './constants';
import { AlgorithmType, SortStep } from './types';
import { THEMES } from './themes';
import {
  generateBubbleSortSteps,
  generateTimSortSteps,
  generateQuickSortSteps,
  generateSelectionSortSteps,
  generateInsertionSortSteps,
  generateMergeSortSteps,
  generateHeapSortSteps,
  generateBogoSortSteps,
  generateCocktailSortSteps,
  generateShellSortSteps,
  generateGnomeSortSteps,
  generateRadixSortSteps,
  generateBitonicSortSteps,
  generateOddEvenSortSteps,
  generatePancakeSortSteps,
  generateStoogeSortSteps,
  generateCombSortSteps,
  generateCycleSortSteps,
  generateBinaryInsertionSortSteps,
  generateSlowSortSteps
} from './algorithms';

const App: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const initialAlgoId = params.get('algo') as AlgorithmType || AlgorithmType.BUBBLE_SORT;
  const initialThemeId = params.get('theme') || 'vampire';
  const initialSize = parseInt(params.get('size') || ARRAY_SIZE.toString());

  const [algorithm, setAlgorithm] = useState(ALGORITHMS[initialAlgoId] || ALGORITHMS[AlgorithmType.BUBBLE_SORT]);
  const [currentTheme, setCurrentTheme] = useState(THEMES[initialThemeId] || THEMES.vampire);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [array, setArray] = useState<number[]>([]);
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(params.get('recording') === 'true' ? 2 : 1);
  const [isMuted] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const hasPlayedFinishChime = useRef(false);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      audioCtxRef.current = new AudioContextClass();
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.connect(audioCtxRef.current.destination);

      (window as any).audioService = {
        ctx: audioCtxRef.current,
        masterGain: masterGainRef.current,
        init: () => {
          if (audioCtxRef.current?.state === 'suspended') {
            audioCtxRef.current.resume();
          }
        }
      };
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSharpTing = (value: number, volume = 0.15) => {
    if (isMuted || !audioCtxRef.current || !masterGainRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;

    // --- Cinematic Plucked Marimba Sound ---
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Use Triangle wave for a warmer, more "wooden" tone
    osc.type = 'triangle';
    
    // Map frequency to a more musical mid-range (C3 to C6 approx)
    const freq = 200 + (value / MAX_VALUE) * 1200;
    osc.frequency.setValueAtTime(freq, now);

    // Filter to remove harsh harmonics and add "body"
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3, now);
    filter.frequency.exponentialRampToValueAtTime(freq, now + 0.1);

    // Exponential decay for a "pluck" feel
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGainRef.current);

    osc.start(now);
    osc.stop(now + 0.25);
  };

  const playFinishChime = () => {
    if (isMuted || !audioCtxRef.current || !masterGainRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const scale = [523.25, 659.25, 783.99, 1046.50];
    scale.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.05);
      gain.gain.setValueAtTime(0, now + i * 0.05);
      gain.gain.linearRampToValueAtTime(0.05, now + i * 0.05 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.3);
      osc.connect(gain);
      gain.connect(masterGainRef.current);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.4);
    });
  };

  const renderCleanCode = (code: string, currentLine: number = 0) => {
    const isRecording = window.location.search.includes('recording=true');
    const lines = code.split('\n');
    return lines.map((line, i) => {
      const tokens: { text: string; color: string }[] = [];
      const regex = /(\/\/.*$)|(\b(?:function|const|let|for|while|if|break|return|swapped|false|true|insertionSort|merge|Math|min|quickSort|partition|low|high|pi|pivot|RUN|temp|key|slice|floor|mergeSort|heapSort|heapify|isSorted|shuffle|bogoSort|cocktailSort)\b)|(\b\d+\b)|([\[\]\(\)\{\}])|([><=+\-*/&|!]{1,3})|(\b\w+\b)|(\s+)/g;
      let match;
      while ((match = regex.exec(line)) !== null) {
        const [full, comment, keyword, number, bracket, operator, word] = match;
        let color = "text-zinc-100";
        if (comment) color = "text-zinc-600 italic";
        else if (keyword) {
          if (['function', 'const', 'let', 'for', 'while', 'if', 'break', 'return'].includes(keyword)) color = "text-[#ff79c6] font-bold";
          else if (['insertionSort', 'merge', 'Math', 'min', 'quickSort', 'partition', 'RUN', 'slice', 'floor', 'mergeSort', 'heapSort', 'heapify', 'isSorted', 'shuffle', 'bogoSort', 'cocktailSort'].includes(keyword)) color = "text-[#8be9fd] italic";
          else color = "text-[#50fa7b]";
        }
        else if (number) color = "text-[#bd93f9]";
        else if (bracket) color = "text-zinc-400";
        else if (operator) color = "text-[#ffb86c]";
        else if (word) color = "text-[#f8f8f2]";
        tokens.push({ text: full, color });
      }
      const isActive = currentLine === i + 1;
      const fontSize = isRecording ? 'text-[30px]' : 'text-[11px]';
      const lineHeight = isRecording ? 'leading-[1.3]' : 'leading-tight';

      return (
        <div key={i} id={`code-line-${i + 1}`} className={`flex gap-3 min-w-full relative py-2 transition-all duration-300 ${isActive ? 'bg-[#50fa7b]/10' : ''}`}>
          {isActive && (
            <>
              <div className={`absolute left-0 top-0 bottom-0 ${isRecording ? 'w-8' : 'w-1'} bg-[#50fa7b] shadow-[0_0_40px_rgba(80,250,123,1)]`} />
              <div className="absolute inset-0 bg-gradient-to-r from-[#50fa7b]/20 to-transparent pointer-events-none" />
            </>
          )}
          <span className={`text-zinc-800 text-right select-none ${isRecording ? 'text-[18px] w-14' : 'text-[8px] w-5'} font-mono pr-4`}>{i + 1}</span>
          <span className={`whitespace-pre font-mono ${fontSize} ${lineHeight} tracking-normal font-bold`}>
            {tokens.map((t, idx) => <span key={idx} className={t.color}>{t.text}</span>)}
          </span>
        </div>
      );
    });
  };

  const generateNewArray = useCallback(() => {
    const newArr = Array.from({ length: initialSize }, () => Math.floor(Math.random() * (MAX_VALUE - 10) + 10));
    setArray(newArr);
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setSteps([]);
    hasPlayedFinishChime.current = false;
  }, [initialSize]);

  useEffect(() => { generateNewArray(); }, [generateNewArray]);

  const startSort = useCallback(() => {
    initAudio();
    let sortingSteps: SortStep[] = [];
    const id = algorithm.id;
    if (id === AlgorithmType.BUBBLE_SORT) sortingSteps = generateBubbleSortSteps(array);
    else if (id === AlgorithmType.TIM_SORT) sortingSteps = generateTimSortSteps(array);
    else if (id === AlgorithmType.QUICK_SORT) sortingSteps = generateQuickSortSteps(array);
    else if (id === AlgorithmType.SELECTION_SORT) sortingSteps = generateSelectionSortSteps(array);
    else if (id === AlgorithmType.INSERTION_SORT) sortingSteps = generateInsertionSortSteps(array);
    else if (id === AlgorithmType.MERGE_SORT) sortingSteps = generateMergeSortSteps(array);
    else if (id === AlgorithmType.HEAP_SORT) sortingSteps = generateHeapSortSteps(array);
    else if (id === AlgorithmType.BOGO_SORT) sortingSteps = generateBogoSortSteps(array);
    else if (id === AlgorithmType.COCKTAIL_SORT) sortingSteps = generateCocktailSortSteps(array);
    else if (id === AlgorithmType.SHELL_SORT) sortingSteps = generateShellSortSteps(array);
    else if (id === AlgorithmType.GNOME_SORT) sortingSteps = generateGnomeSortSteps(array);
    else if (id === AlgorithmType.RADIX_SORT) sortingSteps = generateRadixSortSteps(array);
    else if (id === AlgorithmType.BITONIC_SORT) sortingSteps = generateBitonicSortSteps(array);
    else if (id === AlgorithmType.ODD_EVEN_SORT) sortingSteps = generateOddEvenSortSteps(array);
    else if (id === AlgorithmType.PANCAKE_SORT) sortingSteps = generatePancakeSortSteps(array);
    else if (id === AlgorithmType.STOOGE_SORT) sortingSteps = generateStoogeSortSteps(array);
    else if (id === AlgorithmType.COMB_SORT) sortingSteps = generateCombSortSteps(array);
    else if (id === AlgorithmType.CYCLE_SORT) sortingSteps = generateCycleSortSteps(array);
    else if (id === AlgorithmType.BINARY_INSERTION_SORT) sortingSteps = generateBinaryInsertionSortSteps(array);
    else if (id === AlgorithmType.SLOW_SORT) sortingSteps = generateSlowSortSteps(array);
    setSteps(sortingSteps);
    setIsPlaying(true);
    setCurrentStepIndex(0);
    hasPlayedFinishChime.current = false;
    (window as any).isSortingCompleted = false;
  }, [array, algorithm]);

  useEffect(() => {
    if (isPlaying && currentStepIndex < steps.length - 1) {
      const step = steps[currentStepIndex];
      if (step.comparingIndices.length > 0) playSharpTing(step.array[step.comparingIndices[0]], 0.06);
      else if (step.swappingIndices.length > 0) playSharpTing(step.array[step.swappingIndices[0]], 0.1);

      if (step.currentLine && codeContainerRef.current) {
        const lineEl = document.getElementById(`code-line-${step.currentLine}`);
        if (lineEl) {
          lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      timerRef.current = setTimeout(() => { setCurrentStepIndex(prev => prev + 1); }, SPEEDS[speedIndex]);
    } else if (steps.length > 0 && currentStepIndex >= steps.length - 1) {
      if (isPlaying) {
        setIsPlaying(false);
        if (!hasPlayedFinishChime.current) {
          playFinishChime();
          hasPlayedFinishChime.current = true;
          (window as any).isSortingCompleted = true;
          console.log('SORTING_COMPLETED_SUCCESS');
        }
      }
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isPlaying, currentStepIndex, steps, speedIndex, isMuted]);

  useEffect(() => {
    (window as any).startSorting = startSort;
    (window as any).startEverything = () => {
      console.log('🚀 Atomic start triggered...');
      initAudio();
      if (typeof (window as any).startAudioCapture === 'function') {
        (window as any).startAudioCapture();
      }
      startSort();
    };
  }, [startSort]);

  useEffect(() => {
    (window as any).isSortingCompleted = false;
  }, []);

  const currentStep = steps[currentStepIndex] || { array, comparingIndices: [], swappingIndices: [], sortedIndices: [], currentLine: 0 };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans flex flex-col items-center justify-center overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_20%,_rgba(40,40,40,1)_0%,_rgba(0,0,0,1)_100%)]"></div>
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-[0.05]"></div>

      <div className={`w-full ${!window.location.search.includes('recording=true') ? 'max-w-[430px] max-h-[932px] rounded-[60px] border-[8px] border-zinc-800' : 'h-full w-full scale-[0.75]'} flex flex-col z-10 relative bg-transparent overflow-hidden`}>

        {!window.location.search.includes('recording=true') && (
          <div className="flex justify-between items-center px-8 pt-4 pb-2 shrink-0 opacity-40">
            <span className="text-[12px] font-bold">9:41</span>
            <div className="flex gap-2">
              <div className="w-4 h-4 rounded-full border border-current opacity-50"></div>
              <div className="w-4 h-4 rounded-full border border-current opacity-50"></div>
            </div>
          </div>
        )}

        <div className={`flex flex-col items-center shrink-0 ${window.location.search.includes('recording=true') ? 'pt-12 px-12' : 'pt-8 px-10'}`}>
          {!window.location.search.includes('recording=true') && (
            <div className="relative w-full mb-6">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between px-5 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-3xl hover:bg-white/10 transition-all border-b-2"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Select Mode</span>
                <svg className={`w-4 h-4 text-zinc-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>
          )}

          <h1 className={`${window.location.search.includes('recording=true') ? 'text-[84px]' : 'text-[48px]'} font-[900] tracking-[-0.05em] uppercase leading-[0.8] text-white mb-6 text-center shadow-white/10`}>
            {algorithm.name}<span className="text-[#50fa7b]">.</span>
          </h1>

          {window.location.search.includes('recording=true') && (
            <p className="text-[32px] font-medium text-[#50fa7b]/60 italic text-center mb-10 tracking-widest font-serif leading-tight px-6">
              "{algorithm.description}"
            </p>
          )}

          <div className="flex gap-4 w-full justify-center">
            <div className={`flex-1 ${window.location.search.includes('recording=true') ? 'max-w-[280px] py-4' : 'max-w-[120px] py-4'} bg-white/[0.03] rounded-[24px] border border-white/10 flex flex-col items-center backdrop-blur-md`}>
              <span className={`${window.location.search.includes('recording=true') ? 'text-[14px]' : 'text-[8px]'} font-black tracking-[0.4em] text-zinc-500 mb-1 uppercase`}>Time</span>
              <span className={`text-rose-500 ${window.location.search.includes('recording=true') ? 'text-[32px]' : 'text-[14px]'} font-black font-mono`}>{algorithm.timeComplexity}</span>
            </div>
            <div className={`flex-1 ${window.location.search.includes('recording=true') ? 'max-w-[280px] py-4' : 'max-w-[120px] py-4'} bg-white/[0.03] rounded-[24px] border border-white/10 flex flex-col items-center backdrop-blur-md`}>
              <span className={`${window.location.search.includes('recording=true') ? 'text-[14px]' : 'text-[8px]'} font-black tracking-[0.4em] text-zinc-500 mb-1 uppercase`}>Space</span>
              <span className={`text-blue-500 ${window.location.search.includes('recording=true') ? 'text-[32px]' : 'text-[14px]'} font-black font-mono`}>{algorithm.spaceComplexity}</span>
            </div>
          </div>
        </div>

        <div className={`flex-1 flex flex-col justify-center px-6 ${window.location.search.includes('recording=true') ? 'mt-20 mb-12' : 'my-8'}`}>
          <div className={`${window.location.search.includes('recording=true') ? 'h-[380px]' : 'h-48'} flex items-end justify-center gap-[8px]`}>
            {currentStep.array.map((val, idx) => {
              const isComparing = currentStep.comparingIndices.includes(idx);
              const isSwapping = currentStep.swappingIndices.includes(idx);
              const isSorted = currentStep.sortedIndices.includes(idx);
              let color = "bg-white/10";
              let shadow = "";
              if (isComparing) { color = currentTheme.compare; shadow = currentTheme.compareShadow; }
              if (isSwapping) { color = currentTheme.swap; shadow = currentTheme.swapShadow; }
              if (isSorted) { color = currentTheme.sorted; shadow = currentTheme.sortedShadow; }
              return (
                <div
                  key={idx}
                  className={`flex-1 rounded-t-full transition-all duration-100 ${color}`}
                  style={{
                    height: `${(val / MAX_VALUE) * 100}%`,
                    boxShadow: shadow,
                    transform: (isComparing || isSwapping) ? 'scaleY(1.05)' : 'scaleY(1)'
                  }}
                />
              );
            })}
          </div>
        </div>

        <div className={`${window.location.search.includes('recording=true') ? 'mx-4 mb-16 h-[880px]' : 'mx-6 mb-12 max-h-[300px]'} bg-[#050505] rounded-[60px] border-l-[24px] border-[#50fa7b] shadow-[0_40px_100px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col`}>
          <div className={`px-12 ${window.location.search.includes('recording=true') ? 'py-12' : 'py-5'} flex items-center justify-between border-b border-white/5 bg-white/[0.04] shrink-0`}>
            <div className="flex gap-4">
              <div className="w-7 h-7 rounded-full bg-[#ff5555]"></div>
              <div className="w-7 h-7 rounded-full bg-[#f1fa8c]"></div>
              <div className="w-7 h-7 rounded-full bg-[#50fa7b]"></div>
            </div>
            <span className={`${window.location.search.includes('recording=true') ? 'text-[36px]' : 'text-[10px]'} text-[#50fa7b] font-mono tracking-[0.6em] font-black uppercase`}>
              KREGGSCODE
            </span>
          </div>
          <div ref={codeContainerRef} className={`${window.location.search.includes('recording=true') ? 'px-8 py-14' : 'p-12'} overflow-y-auto h-full scrollbar-none`}>
            <div className="min-w-fit">
              <pre className={`text-zinc-100 ${window.location.search.includes('recording=true') ? 'text-[30px] leading-[1.3] font-black' : 'text-[13px] leading-relaxed'}`}>
                {renderCleanCode(algorithm.code, currentStep.currentLine)}
              </pre>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/95 to-transparent pointer-events-none"></div>
        </div>

        <div className="h-3 w-80 bg-white/20 rounded-full mx-auto mb-12 shrink-0"></div>
      </div>

      {!window.location.search.includes('recording=true') && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#111]/90 backdrop-blur-3xl px-8 py-5 rounded-[32px] border border-white/10 shadow-2xl z-[200] w-[90%] max-w-[400px]">
          <button
            onClick={startSort}
            disabled={isPlaying}
            className={`bg-white text-black px-10 py-3.5 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all ${isPlaying ? 'opacity-20 translate-y-1' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
          >
            {isPlaying ? 'Running' : 'Execute'}
          </button>
          <button onClick={generateNewArray} className="p-4 text-zinc-400 hover:text-white transition-all active:rotate-180 duration-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="3" strokeLinecap="round" /></svg>
          </button>
          <div className="flex flex-1 gap-2 bg-black/80 p-2 rounded-2xl border border-white/5 ml-auto">
            {['S', 'M', 'F', '⚡'].map((l, i) => (
              <button
                key={l}
                onClick={() => setSpeedIndex(i)}
                className={`flex-1 h-10 rounded-xl text-[10px] font-black transition-all ${speedIndex === i ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .grid-bg {
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 80px 80px;
        }
      `}</style>
    </div>
  );
};

export default App;
