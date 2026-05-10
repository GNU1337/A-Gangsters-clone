/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { GameState, GamePhase } from './game/types';
import { generateInitialState, processWeekEnd } from './game/engine';
import { processFBIChecks } from './game/heat';
import PlanningPhase from './components/PlanningPhase';
import WorkingWeek from './components/WorkingWeek';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => generateInitialState());

  const playerGang = useMemo(() => {
    return gameState.gangs[gameState.playerGang];
  }, [gameState.gangs, gameState.playerGang]);

  const togglePhase = () => {
    setGameState(prev => {
      if (prev.phase === GamePhase.WORKING) {
        // Ending the week
        const stateAfterIncome = processWeekEnd(prev);
        const stateAfterFBI = processFBIChecks(stateAfterIncome);
        return {
          ...stateAfterFBI,
          phase: GamePhase.PLANNING
        };
      } else {
        // Starting the week
        return {
          ...prev,
          phase: GamePhase.WORKING
        };
      }
    });
  };

  const updateState = (updater: (prev: GameState) => GameState) => {
    setGameState(prev => updater(prev));
  };

  return (
    <div className="h-screen w-full bg-[#1a120b] text-[#a89078] overflow-hidden selection:bg-[#d4af37] selection:text-black font-serif border-8 border-[#2d1e12]">
      {/* Top Bar / HUD */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-[#120a06] border-b border-[#3d2b1d] flex items-center justify-between px-8 shadow-2xl z-50">
        <div className="flex items-center gap-6">
          <h1 className="text-[#d4af37] text-2xl font-black uppercase tracking-widest opacity-80 italic">Gangsters</h1>
          <div className="h-6 w-px bg-[#3d2b1d]"></div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-tighter opacity-50 underline decoration-[#d4af37]/30 decoration-2 underline-offset-4 mb-0.5">District Dispatch</span>
            <div className="text-xs uppercase tracking-tighter flex gap-4">
              <span>{gameState.weekDate}</span>
              <span className="opacity-50">WEEK {gameState.turn}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-[#261810]/50 p-1 rounded border border-[#3d2b1d]/50">
          <div className="flex gap-4 px-4 font-mono">
            <span className="text-green-500/90 text-sm font-bold tracking-tight">${(playerGang.legalMoney / 64).toLocaleString()}</span>
            <span className="text-red-500/90 text-sm font-bold tracking-tight">${(playerGang.money / 64).toLocaleString()}</span>
          </div>
          
          <div className="flex gap-1 h-8">
            <button 
              onClick={() => togglePhase()}
              className={`px-4 text-[10px] font-black uppercase transition-all duration-300 ${gameState.phase === GamePhase.PLANNING ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'text-[#a89078] hover:bg-[#3d2b1d]'}`}
            >
              Planning
            </button>
            <button 
              onClick={() => togglePhase()}
              className={`px-4 text-[10px] font-black uppercase transition-all duration-300 ${gameState.phase === GamePhase.WORKING ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'text-[#a89078] hover:bg-[#3d2b1d]'}`}
            >
              Working Week
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState.phase === GamePhase.PLANNING ? (
          <motion.div
            key="planning"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="h-full w-full pt-16"
          >
            <PlanningPhase state={gameState} setState={updateState} />
          </motion.div>
        ) : (
          <motion.div
            key="working"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="h-full w-full pt-16"
          >
            <WorkingWeek state={gameState} setState={updateState} onEndWeek={togglePhase} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Atmospheric Overlays */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-40 mix-blend-overlay">
        <div className="absolute inset-0 bg-[#000] [mask-image:radial-gradient(ellipse_at_center,transparent_0%,black_100%)]"></div>
      </div>
    </div>
  );
}
