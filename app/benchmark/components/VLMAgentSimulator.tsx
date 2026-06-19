'use client';

import React, { useState, useEffect, useRef } from 'react';
import { VLMSimulatorStep } from '../models/types';

interface VLMAgentSimulatorProps {
  modelName: string;
  gameId: string;
  steps: VLMSimulatorStep[];
}

export default function VLMAgentSimulator({ modelName, gameId, steps }: VLMAgentSimulatorProps) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset step index when game or model changes
  useEffect(() => {
    setCurrentStepIdx(0);
  }, [gameId, modelName]);

  // Autoplay loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIdx((prev) => (prev + 1) % steps.length);
      }, 2500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, steps.length]);

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentStepIdx((prev) => (prev + 1) % steps.length);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentStepIdx((prev) => (prev - 1 + steps.length) % steps.length);
  };

  const activeStep = steps[currentStepIdx] || steps[0];
  if (!activeStep) return null;

  const { frame, detectedObjects, action, confidence, moodAlignment, log, boardState } = activeStep;

  // Render the visual representation of the active game step
  const renderVisualGame = () => {
    const dangerColor =
      boardState.dangerLevel === 'high'
        ? 'text-rose-500 bg-rose-500/10 border-rose-500/20'
        : boardState.dangerLevel === 'medium'
          ? 'text-amber-500 bg-amber-500/10 border-amber-500/20'
          : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';

    switch (gameId) {
      case 'colorize':
        return (
          <div className="relative w-full h-full flex flex-col justify-center items-center bg-slate-950 p-6 rounded-xl border border-slate-900 overflow-hidden">
            {/* Grid display */}
            <div className="grid grid-cols-5 gap-1.5 w-48 h-48 mb-4">
              {Array.from({ length: 25 }).map((_, i) => {
                // Determine block color based on grid progress and step index
                const blockProgressRatio = (boardState.gridProgress / 100) * 25;
                const isFlooded = i < blockProgressRatio;

                let fill = '#1e293b'; // slate-800
                if (isFlooded) {
                  fill =
                    boardState.selectedColor === 'purple'
                      ? '#543DEB'
                      : boardState.selectedColor === 'green'
                        ? '#05DF91'
                        : boardState.selectedColor === 'orange'
                          ? '#ea580c'
                          : '#05DF91'; // default flood color
                } else {
                  // fragmented colors
                  const colors = ['#ea580c', '#38bdf8', '#05DF91', '#543DEB'];
                  fill = colors[i % colors.length];
                }

                return (
                  <div
                    key={i}
                    className="w-full h-full rounded transition-all duration-500"
                    style={{ backgroundColor: fill }}
                  />
                );
              })}
            </div>
            {/* Stats Overlay */}
            <div className="flex justify-between w-full text-[10px] text-slate-400 font-mono">
              <span>Moves left: {boardState.movesLeft}</span>
              <span>Flooded: {boardState.gridProgress}%</span>
            </div>
          </div>
        );

      case 'box_tower':
        const wobbleOffset = boardState.wobble * 24; // Translate wobble to pixels
        const boxWidth = boardState.boxSize === 'large' ? 80 : boardState.boxSize === 'narrow' ? 50 : 60;

        return (
          <div className="relative w-full h-full flex flex-col justify-end bg-slate-950 p-6 rounded-xl border border-slate-900 overflow-hidden">
            {/* Wind Telemetry */}
            {boardState.windSpeed > 0 && (
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[9px] font-mono text-sky-400 bg-sky-500/10 px-2 py-1 rounded border border-sky-500/20">
                <span>Wind speed: {boardState.windSpeed} m/s</span>
                <span className="animate-pulse">➔➔</span>
              </div>
            )}

            {/* Pendulum Swing (mocked at the top) */}
            {boardState.height < 12 && (
              <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full flex flex-col items-center">
                {/* String */}
                <div className="w-0.5 h-16 bg-slate-700 origin-top rotate-12 animate-pulse" />
                {/* Swinging block */}
                <div
                  className="h-6 rounded bg-rose-500 border border-rose-400 opacity-80"
                  style={{ width: `${boxWidth}px`, marginTop: '-2px' }}
                />
              </div>
            )}

            {/* Stacking tower representation */}
            <div className="flex flex-col items-center w-full mt-24">
              {Array.from({ length: Math.min(boardState.height, 5) }).map((_, i) => {
                const heightIndex = boardState.height - i;
                const offset = i === 0 ? wobbleOffset : (i % 2 === 0 ? 3 : -2);
                const blockWidth = heightIndex > 8 ? 55 : heightIndex > 4 ? 70 : 85;
                return (
                  <div
                    key={i}
                    className="h-6 bg-sky-500/70 border border-sky-400 rounded-sm mb-0.5 transition-all duration-300 shadow"
                    style={{
                      width: `${blockWidth}px`,
                      transform: `translateX(${offset}px)`
                    }}
                  />
                );
              })}
              {/* Foundation */}
              <div className="w-24 h-2.5 bg-slate-800 rounded-t border-t border-slate-700 mt-0.5" />
            </div>

            <div className="flex justify-between w-full text-[10px] text-slate-400 font-mono mt-3">
              <span>Tower height: {boardState.height}</span>
              <span>Wobble factor: {boardState.wobble}</span>
            </div>
          </div>
        );

      case 'hextris':
      default:
        return (
          <div className="relative w-full h-full flex flex-col justify-center items-center bg-slate-950 p-6 rounded-xl border border-slate-900 overflow-hidden">
            {/* Hextris Hexagon base representation */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Inner core */}
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[9px] text-slate-400">
                AI
              </div>
              {/* Main Outer Rotatable Hexagon */}
              <div
                className="absolute w-28 h-28 border-2 border-indigo-500/40 transition-transform duration-500 ease-out"
                style={{
                  transform: `rotate(${boardState.rotation}deg)`,
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                }}
              >
                {/* Placed blocks represented as wedges or block stacks */}
                {boardState.blocksCount > 0 && (
                  <div className="absolute top-0 left-4 right-4 h-3 bg-indigo-500 rounded" />
                )}
                {boardState.blocksCount > 1 && (
                  <div className="absolute bottom-0 left-4 right-4 h-3 bg-rose-500 rounded" />
                )}
                {boardState.blocksCount > 2 && (
                  <div className="absolute top-6 left-0 w-3 h-10 bg-emerald-500 rounded" />
                )}
              </div>

              {/* Falling element */}
              {boardState.activeBlock !== 'none' && (
                <div
                  className="absolute top-2 w-14 h-3.5 bg-indigo-500 border border-indigo-300 rounded shadow-lg animate-bounce"
                  style={{
                    backgroundColor: boardState.activeBlock === 'green' ? '#05DF91' : '#543DEB'
                  }}
                />
              )}
            </div>

            {/* Telemetry overlay labels */}
            <div className="flex justify-between w-full text-[10px] text-slate-400 font-mono mt-4">
              <span>Rotation: {boardState.rotation}°</span>
              <span className={`px-2 py-0.5 rounded border ${dangerColor}`}>
                Danger: {boardState.dangerLevel.toUpperCase()}
              </span>
            </div>
          </div>
        );
    }
  };

  return (
    <></>
    // <div className="w-full bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md flex flex-col lg:flex-row gap-6">

    //   {/* Left Column: Visual Screen telemetry */}
    //   <div className="flex-1 flex flex-col justify-between">
    //     <div className="flex justify-between items-center mb-3">
    //       <div className="flex items-center gap-2">
    //         <span className="relative flex h-2 w-2">
    //           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
    //           <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
    //         </span>
    //         <span className="text-xs font-bold text-white uppercase tracking-wider">Gameplay Vision Telemetry</span>
    //       </div>
    //       <span className="text-[10px] font-mono text-slate-500">
    //         VLM Frame Rate: {frame} / {steps.length}
    //       </span>
    //     </div>

    //     {/* Visual box */}
    //     <div className="h-[220px] md:h-[240px] w-full">
    //       {renderVisualGame()}
    //     </div>

    //     {/* Controls */}
    //     <div className="flex items-center justify-between mt-4 bg-slate-950/80 p-2.5 rounded-xl border border-slate-900">
    //       <button
    //         onClick={handlePrev}
    //         className="p-1 px-3 text-[10px] font-extrabold text-slate-400 hover:text-white bg-slate-900 rounded border border-slate-800 transition-colors"
    //       >
    //         PREV
    //       </button>

    //       <button
    //         onClick={() => setIsPlaying((prev) => !prev)}
    //         className="flex items-center justify-center gap-1.5 px-4 py-1 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all"
    //       >
    //         {isPlaying ? (
    //           <>
    //             <span className="w-1.5 h-3 border-x-2 border-white" />
    //             PAUSE
    //           </>
    //         ) : (
    //           <>
    //             <span className="w-0 h-0 border-y-4 border-y-transparent border-l-[6px] border-l-white" />
    //             AUTOPLAY
    //           </>
    //         )}
    //       </button>

    //       <button
    //         onClick={handleNext}
    //         className="p-1 px-3 text-[10px] font-extrabold text-slate-400 hover:text-white bg-slate-900 rounded border border-slate-800 transition-colors"
    //       >
    //         NEXT
    //       </button>
    //     </div>
    //   </div>

    //   {/* Right Column: VLM Cognitive analysis logs */}
    //   <div className="w-full lg:w-[320px] flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800/60 pt-4 lg:pt-0 lg:pl-6">
    //     <div className="space-y-4">
    //       {/* Header */}
    //       <div>
    //         <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Active Analysis Target</div>
    //         <h4 className="text-sm font-extrabold text-white">{modelName}</h4>
    //       </div>

    //       {/* Detections */}
    //       <div>
    //         <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1.5">Detected Entities</div>
    //         <div className="flex flex-wrap gap-1">
    //           {detectedObjects.map((obj) => (
    //             <span
    //               key={obj}
    //               className="text-[9px] px-2 py-0.5 bg-slate-950 border border-slate-900 text-slate-300 font-mono rounded"
    //             >
    //               {obj}
    //             </span>
    //           ))}
    //         </div>
    //       </div>

    //       {/* Action Decision */}
    //       <div className="grid grid-cols-2 gap-4">
    //         <div>
    //           <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">VLM Output Action</div>
    //           <div className="text-xs font-bold text-indigo-400 mt-1 font-mono">{action}</div>
    //         </div>
    //         <div>
    //           <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Confidence Gauge</div>
    //           <div className="flex items-center gap-2 mt-1">
    //             <div className="flex-grow bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
    //               <div
    //                 className="bg-emerald-500 h-full rounded-full transition-all duration-500"
    //                 style={{ width: `${confidence * 100}%` }}
    //               />
    //             </div>
    //             <span className="text-[9px] font-mono text-emerald-400 font-bold">{Math.round(confidence * 100)}%</span>
    //           </div>
    //         </div>
    //       </div>

    //       {/* Terminal log */}
    //       <div>
    //         <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1.5">Decision Rationale</div>
    //         <div className="bg-slate-950/80 border border-slate-900/60 p-3 rounded-xl font-mono text-[10px] text-slate-400 leading-relaxed min-h-[70px]">
    //           <span className="text-indigo-400">sys_agent_vlm&gt;</span> {log}
    //         </div>
    //       </div>

    //       {/* Cognitive Impact alignment metrics */}
    //       <div>
    //         <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-2">Cognitive Alignment telemetry</div>
    //         <div className="space-y-2 text-[10px]">

    //           {/* Focus */}
    //           <div>
    //             <div className="flex justify-between text-slate-400 mb-1">
    //               <span>Focus (Hextris priority)</span>
    //               <span className="font-bold text-indigo-400">{Math.round(moodAlignment.focus * 100)}%</span>
    //             </div>
    //             <div className="bg-slate-950 h-1 rounded-full overflow-hidden">
    //               <div className="bg-indigo-500 h-full" style={{ width: `${moodAlignment.focus * 100}%` }} />
    //             </div>
    //           </div>

    //           {/* Relax */}
    //           <div>
    //             <div className="flex justify-between text-slate-400 mb-1">
    //               <span>Relax (Colorize priority)</span>
    //               <span className="font-bold text-emerald-400">{Math.round(moodAlignment.relax * 100)}%</span>
    //             </div>
    //             <div className="bg-slate-950 h-1 rounded-full overflow-hidden">
    //               <div className="bg-emerald-500 h-full" style={{ width: `${moodAlignment.relax * 100}%` }} />
    //             </div>
    //           </div>

    //           {/* Creativity */}
    //           <div>
    //             <div className="flex justify-between text-slate-400 mb-1">
    //               <span>Creativity (Box Tower priority)</span>
    //               <span className="font-bold text-sky-400">{Math.round(moodAlignment.creativity * 100)}%</span>
    //             </div>
    //             <div className="bg-slate-950 h-1 rounded-full overflow-hidden">
    //               <div className="bg-sky-500 h-full" style={{ width: `${moodAlignment.creativity * 100}%` }} />
    //             </div>
    //           </div>

    //         </div>
    //       </div>
    //     </div>
    //   </div>

    // </div>
  );
}
