/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameState, GamePhase, Hood, HoodStatus, OrderType } from '../game/types';
import { moveHood } from '../game/engine';
import { UI_SETTINGS } from '../game/constants';
import { Play, Pause, FastForward, Info, AlertTriangle, Crosshair } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WorkingWeekProps {
  state: GameState;
  setState: (updater: (prev: GameState) => GameState) => void;
  onEndWeek: () => void;
}

export default function WorkingWeek({ state, setState, onEndWeek }: WorkingWeekProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ticker, setTicker] = useState(0);

  // Simulation Logic
  useEffect(() => {
    if (state.isPaused) return;

    const interval = setInterval(() => {
      setTicker(t => t + 1);
      
      setState(prev => {
        const nextHoods = { ...prev.hoods };
        const nextBusinesses = { ...prev.businesses };
        const nextHistory = [...prev.history];
        let stateChanged = false;

        let nextActiveCutscene = prev.activeCutscene;

        for (const hood of Object.values(nextHoods)) {
          if (hood.status === HoodStatus.ON_ORDER && hood.currentOrderId) {
            const order = prev.orders[hood.currentOrderId];
            const targetBlock = prev.city[order.targetId];
            
            // Move hood towards target
            const speed = 0.05 * prev.simulationSpeed;
            const updatedHood = moveHood(hood, targetBlock.x, targetBlock.y, speed);
            nextHoods[hood.id] = updatedHood;
            stateChanged = true;

            // Check if arrived
            if (updatedHood.x === targetBlock.x && updatedHood.y === targetBlock.y) {
              const bId = targetBlock.businesses[0];
              const targetBusiness = nextBusinesses[bId];

              // Resolve Order
              if (order.type === OrderType.EXTORT) {
                targetBusiness.ownerId = hood.gangId;
                targetBusiness.racketType = undefined;
                const msg = `${hood.nickname} successfully extorted ${targetBusiness.name}. It is now under our control.`;
                nextHistory.push({
                  id: `extort-${Date.now()}`,
                  turn: prev.turn,
                  message: msg,
                  type: 'crime',
                  timestamp: Date.now()
                });
                nextHoods[hood.id] = { ...updatedHood, status: HoodStatus.IDLE, currentOrderId: undefined };
                nextActiveCutscene = { type: OrderType.EXTORT, outcome: 'success', message: msg, hoodId: hood.id };
              } else if (order.type === OrderType.OPEN_RACKET) {
                const racket = ['speakeasy', 'casino', 'loan_sharks'][Math.floor(Math.random() * 3)] as any;
                targetBusiness.racketType = racket;
                const msg = `${hood.nickname} set up a new illegal ${racket.replace('_', ' ')} in ${targetBusiness.name}.`;
                nextHistory.push({
                  id: `racket-${Date.now()}`,
                  turn: prev.turn,
                  message: msg,
                  type: 'profit',
                  timestamp: Date.now()
                });
                nextHoods[hood.id] = { ...updatedHood, status: HoodStatus.IDLE, currentOrderId: undefined };
                nextActiveCutscene = { type: OrderType.OPEN_RACKET, outcome: 'success', message: msg, hoodId: hood.id };
              } else if (order.type === OrderType.HIT) {
                const roll = Math.random();
                if (roll > 0.4) {
                  const msg = `${hood.nickname} eliminated the target in ${targetBlock.id}. Neutralizing threats for the syndicate.`;
                  nextHistory.push({ id: `hit-${Date.now()}`, turn: prev.turn, message: msg, type: 'crime', timestamp: Date.now() });
                  nextHoods[hood.id] = { ...updatedHood, status: HoodStatus.IDLE, currentOrderId: undefined };
                  nextActiveCutscene = { type: OrderType.HIT, outcome: 'success', message: msg, hoodId: hood.id };
                } else if (roll > 0.1) {
                  const msg = `The hit on ${targetBlock.id} failed. ${hood.nickname} was nearly caught!`;
                  nextHistory.push({ id: `hit-fail-${Date.now()}`, turn: prev.turn, message: msg, type: 'warning', timestamp: Date.now() });
                  nextHoods[hood.id] = { ...updatedHood, status: HoodStatus.IDLE, currentOrderId: undefined };
                  nextActiveCutscene = { type: OrderType.HIT, outcome: 'failure', message: msg, hoodId: hood.id };
                } else {
                  const msg = `TRAGEDY: ${hood.nickname} was gunned down during the attempt in ${targetBlock.id}.`;
                  nextHistory.push({ id: `death-${Date.now()}`, turn: prev.turn, message: msg, type: 'death', timestamp: Date.now() });
                  nextHoods[hood.id] = { ...updatedHood, status: HoodStatus.DEAD, currentOrderId: undefined };
                  nextActiveCutscene = { type: 'death', outcome: 'failure', message: msg, hoodId: hood.id };
                }
              } else if (order.type === OrderType.BOMB) {
                const msg = `A massive explosion rocked ${targetBusiness.name}! Structural damage confirmed.`;
                nextHistory.push({ id: `bomb-${Date.now()}`, turn: prev.turn, message: msg, type: 'crime', timestamp: Date.now() });
                nextHoods[hood.id] = { ...updatedHood, status: HoodStatus.IDLE, currentOrderId: undefined };
                nextActiveCutscene = { type: OrderType.BOMB, outcome: 'success', message: msg, hoodId: hood.id };
              } else if (order.type === OrderType.SCOUT) {
                const msg = `${hood.nickname} finished scouting ${targetBlock.id}. Map data updated.`;
                nextHistory.push({ id: `scout-${Date.now()}`, turn: prev.turn, message: msg, type: 'info', timestamp: Date.now() });
                nextHoods[hood.id] = { ...updatedHood, status: HoodStatus.IDLE, currentOrderId: undefined };
                nextActiveCutscene = { type: OrderType.SCOUT, outcome: 'success', message: msg, hoodId: hood.id };
              }
            }
          }
        }

        if (stateChanged) {
          return { ...prev, hoods: nextHoods, businesses: nextBusinesses, history: nextHistory, activeCutscene: nextActiveCutscene };
        }
        return prev;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [state.isPaused, state.simulationSpeed, setState]);

  // Viewport/Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const updateSize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    updateSize();

    return () => observer.disconnect();
  }, []);

  // Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Draw Isometric Grid
    const tileSize = 60;
    const centerX = width / 2;
    const centerY = height / 4;

    ctx.save();
    ctx.translate(centerX, centerY);

    // Simple isometric projection
    const toIso = (x: number, y: number) => ({
      x: (x - y) * (tileSize / 2),
      y: (x + y) * (tileSize / 4)
    });

    // Draw Grid
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.05)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const p = toIso(x, y);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + tileSize / 2, p.y + tileSize / 4);
        ctx.lineTo(p.x, p.y + tileSize / 2);
        ctx.lineTo(p.x - tileSize / 2, p.y + tileSize / 4);
        ctx.closePath();
        
        ctx.fillStyle = (x + y) % 2 === 0 ? 'rgba(0,0,0,0.4)' : 'rgba(18, 10, 6, 0.4)';
        ctx.fill();
        ctx.stroke();
      }
    }

    // Draw NPCs
    for (let i = 0; i < 150; i++) {
      const nx = Math.sin(ticker * 0.005 + i) * 8 + 8;
      const ny = Math.cos(ticker * 0.005 + i * 0.7) * 8 + 8;
      const p = toIso(nx, ny);
      ctx.fillStyle = 'rgba(168, 144, 120, 0.3)';
      ctx.fillRect(p.x - 1, p.y - 1, 1.5, 1.5);
    }

    // Draw Hoods
    Object.values(state.hoods).forEach(hood => {
      const p = toIso(hood.x, hood.y);
      const isPlayer = hood.gangId === state.playerGang;
      
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 2, 3, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Token
      ctx.fillStyle = isPlayer ? '#d4af37' : '#bc4749';
      ctx.strokeStyle = isPlayer ? '#22c55e' : '#ef4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y - 2, 4, 0, Math.PI * 2);
      ctx.fill();
      if (hood.status === HoodStatus.ON_ORDER) ctx.stroke();
      
      // Label
      ctx.font = `black 14px ${UI_SETTINGS.FONT_FAMILY}`;
      ctx.fillStyle = isPlayer ? UI_SETTINGS.TEXT_COLOR_GOLD : '#bc4749';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(hood.nickname.toUpperCase(), p.x, p.y - 12);
      ctx.shadowBlur = 0;
    });

    ctx.restore();
  }, [ticker, state.hoods, state.playerGang]);

  return (
    <div className="min-h-full w-full relative flex flex-col overflow-hidden bg-[#0c0805]">
      {/* Map Viewport Area */}
      <div ref={containerRef} className="h-64 sm:h-96 md:flex-1 cursor-crosshair relative min-h-[300px]">
        <canvas ref={canvasRef} className="opacity-90" />
        
        {/* Cinematic Overlays */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(12,8,5,0.7)_100%)] opacity-80"></div>
        <div className="absolute top-0 w-full h-24 bg-gradient-to-b from-[#0c0805] to-transparent"></div>
        <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-[#0c0805] to-transparent"></div>
      </div>

      {/* Floating Alerts Container */}
      <div className="absolute top-4 md:top-12 left-4 md:left-12 right-4 md:right-auto w-auto md:w-96 flex flex-col gap-4 z-20 pointer-events-none">
        <AnimatePresence>
          {state.history.slice(-3).reverse().map(event => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, x: -40, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-5 shadow-[10px_10px_30px_rgba(0,0,0,0.8)] pointer-events-auto border-l-[12px]"
              style={{ 
                backgroundColor: UI_SETTINGS.BG_COLOR_PAPER,
                borderLeftColor: event.type === 'alert' ? '#bc4749' : '#1e3a8a'
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-2 border-b-2 border-black/20 pb-2">
                <div className="flex items-center gap-2">
                  {event.type === 'alert' ? <AlertTriangle size={14} className="text-[#bc4749]" /> : <Info size={14} className="text-blue-900" />}
                  <span style={{ fontSize: UI_SETTINGS.TINY_FONT_SIZE }} className="uppercase font-black tracking-[0.2em] text-black/60">{event.type} report</span>
                </div>
                <span style={{ fontSize: UI_SETTINGS.TINY_FONT_SIZE }} className="font-mono text-black/40 font-black">LOG: {ticker % 1000}</span>
              </div>
              <p 
                style={{ fontSize: UI_SETTINGS.BASE_FONT_SIZE }}
                className="font-serif leading-none text-black font-black italic tracking-tighter"
              >
                "{event.message}"
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Control Bar - Editorial Style */}
      <div 
        className="h-auto md:h-24 border-t-2 border-black flex flex-col md:flex-row items-center justify-between px-4 md:px-12 py-6 md:py-0 z-30 shadow-[0_-20px_50px_rgba(0,0,0,1)] gap-6"
        style={{ backgroundColor: UI_SETTINGS.BG_COLOR_DEEP }}
      >
        <div className="flex items-center gap-6 md:gap-12 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-sm border border-white/10">
             <button 
               onClick={() => setState(p => ({ ...p, isPaused: !p.isPaused }))}
               className={`p-3 transition-all ${state.isPaused ? 'text-[#d4af37] bg-[#d4af37]/20 scale-110' : 'text-white/40 hover:text-white'}`}
             >
               {state.isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
             </button>
             <div className="w-px h-8 bg-white/10" />
             <button 
               onClick={() => setState(p => ({ ...p, simulationSpeed: p.simulationSpeed === 1 ? 2 : 1 }))}
               className={`p-3 transition-all ${state.simulationSpeed > 1 ? 'text-[#d4af37] bg-[#d4af37]/20 scale-110' : 'text-white/40 hover:text-white'}`}
             >
               <FastForward size={24} fill={state.simulationSpeed > 1 ? "currentColor" : "none"} />
             </button>
          </div>

          <div className="flex flex-col border-l-4 border-[#3d2b1d] pl-10">
            <span style={{ fontSize: UI_SETTINGS.TINY_FONT_SIZE }} className="uppercase tracking-[0.3em] font-black text-[#a89078]/60 mb-2">Simulation Chronology</span>
            <span style={{ fontSize: UI_SETTINGS.HEADER_FONT_SIZE, lineHeight: 0.8 }} className="font-mono text-[#d4af37] uppercase font-black">08:00 AM · MON</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 md:gap-10 w-full md:w-auto">
           <div className="flex flex-col text-right">
             <span style={{ fontSize: UI_SETTINGS.TINY_FONT_SIZE }} className="uppercase tracking-[0.3em] font-black text-[#a89078]/60 mb-2">Network status</span>
             <div className="flex items-center gap-3 justify-end">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.8)]"></div>
                <span style={{ fontSize: UI_SETTINGS.SMALL_FONT_SIZE }} className="font-black uppercase text-[#d4af37] tracking-widest">Live Pulse</span>
             </div>
           </div>

           <button 
            onClick={onEndWeek}
            style={{ fontSize: UI_SETTINGS.SMALL_FONT_SIZE }}
            className="px-10 py-4 bg-[#bc4749] text-white uppercase font-black tracking-[0.3em] hover:bg-[#a53a3c] transition-all shadow-[0_0_40px_rgba(188,71,73,0.4)] border-2 border-white/20 active:scale-95"
           >
             Halt Operations
           </button>
        </div>
      </div>

      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]"></div>
    </div>
  );
}
