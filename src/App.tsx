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
import TutorialOverlay from './components/TutorialOverlay';
import { UI_SETTINGS } from './game/constants';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle } from 'lucide-react';

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
    <div 
      className="h-screen w-full overflow-hidden selection:bg-[#d4af37] selection:text-black font-serif border-8 border-[#2d1e12]"
      style={{ 
        backgroundColor: UI_SETTINGS.BG_COLOR_DEEP, // Blacker background
        color: UI_SETTINGS.TEXT_COLOR_GOLD,       // Gold text on black
        fontSize: UI_SETTINGS.BASE_FONT_SIZE,
        fontWeight: UI_SETTINGS.FONT_WEIGHT       // Bolder/Blacker weight
      } as React.CSSProperties}
    >
      {/* Top Bar / HUD */}
      <div 
        className="fixed top-0 left-0 right-0 h-20 border-b border-[#3d2b1d] flex items-center justify-between px-10 shadow-2xl z-50 backdrop-blur-md"
        style={{ backgroundColor: `${UI_SETTINGS.BG_COLOR_DEEP}cc` }}
      >
        <div className="flex items-center gap-6">
          <h1 
            style={{ 
              fontSize: UI_SETTINGS.HEADER_FONT_SIZE,
              lineHeight: 0.8
            }}
            className="text-[#d4af37] font-black uppercase tracking-tighter italic"
          >
            Gangsters
          </h1>
          <div className="h-10 w-px bg-[#3d2b1d]"></div>
          <div className="flex flex-col">
            <span style={{ fontSize: UI_SETTINGS.TINY_FONT_SIZE }} className="uppercase tracking-widest opacity-60 underline decoration-[#d4af37]/50 decoration-4 underline-offset-8 mb-1">Dispatch Intelligence</span>
            <div style={{ fontSize: UI_SETTINGS.SMALL_FONT_SIZE }} className="uppercase tracking-widest flex gap-6 font-black">
              <span>{gameState.weekDate}</span>
              <span className="text-[#a89078] opacity-50">CYC {gameState.turn}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-[#261810]/50 p-1 rounded border border-[#3d2b1d]/50">
          <div className="flex gap-6 px-4 font-mono items-center">
            <div className="flex flex-col">
              <span style={{ fontSize: UI_SETTINGS.TINY_FONT_SIZE }} className="text-green-500/50 uppercase font-black">Clean</span>
              <span className="text-green-500/90 text-sm font-bold tracking-tight">${(playerGang.legalMoney / 64).toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: UI_SETTINGS.TINY_FONT_SIZE }} className="text-red-500/50 uppercase font-black">Blood</span>
              <span className="text-red-500/90 text-sm font-bold tracking-tight">${(playerGang.money / 64).toLocaleString()}</span>
            </div>
            <button 
              onClick={() => setGameState(p => ({ ...p, showTutorial: true, tutorialStep: 0 }))}
              className="flex items-center gap-2 text-[#d4af37] hover:text-white transition-colors"
            >
              <HelpCircle size={18} />
              <span style={{ fontSize: UI_SETTINGS.TINY_FONT_SIZE }} className="uppercase font-black border-b border-current">Intel</span>
            </button>
          </div>
          
          <div className="flex gap-1 h-8">
            <button 
              onClick={() => togglePhase()}
              style={{ fontSize: UI_SETTINGS.SMALL_FONT_SIZE }}
              className={`px-4 font-black uppercase transition-all duration-300 ${gameState.phase === GamePhase.PLANNING ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'text-[#a89078] hover:bg-[#3d2b1d]'}`}
            >
              Planning
            </button>
            <button 
              onClick={() => togglePhase()}
              style={{ fontSize: UI_SETTINGS.SMALL_FONT_SIZE }}
              className={`px-4 font-black uppercase transition-all duration-300 ${gameState.phase === GamePhase.WORKING ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'text-[#a89078] hover:bg-[#3d2b1d]'}`}
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

      <AnimatePresence>
        {gameState.showTutorial && (
          <TutorialOverlay 
            currentStep={gameState.tutorialStep}
            onClose={() => setGameState(p => ({ ...p, showTutorial: false }))}
            onNext={() => setGameState(p => ({ ...p, tutorialStep: p.tutorialStep + 1 }))}
            onPrev={() => setGameState(p => ({ ...p, tutorialStep: Math.max(0, p.tutorialStep - 1) }))}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
