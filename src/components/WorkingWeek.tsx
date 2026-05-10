/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameState, GamePhase, Hood, HoodStatus, OrderType } from '../game/types';
import { moveHood } from '../game/engine';
import { Play, Pause, FastForward, Info, AlertTriangle, Crosshair } from 'lucide-react';

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

        Object.values(nextHoods).forEach(hood => {
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
                targetBusiness.racketType = undefined; // Need to setup racket later
                nextHistory.push({
                  id: `extort-${Date.now()}`,
                  turn: prev.turn,
                  message: `${hood.nickname} successfully extorted ${targetBusiness.name}. It is now under our control.`,
                  type: 'alert',
                  timestamp: Date.now()
                });
              } else if (order.type === OrderType.OPEN_RACKET) {
                targetBusiness.racketType = ['speakeasy', 'casino', 'loan_shark'][Math.floor(Math.random() * 3)] as any;
                nextHistory.push({
                  id: `racket-${Date.now()}`,
                  turn: prev.turn,
                  message: `${hood.nickname} set up a new illegal racket in ${targetBusiness.name}.`,
                  type: 'info',
                  timestamp: Date.now()
                });
              }

              nextHoods[hood.id] = { ...updatedHood, status: HoodStatus.IDLE, currentOrderId: undefined };
            }
          }
        });

        if (stateChanged) {
          return { ...prev, hoods: nextHoods, businesses: nextBusinesses, history: nextHistory };
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
      ctx.font = 'bold 10px font-serif';
      ctx.fillStyle = isPlayer ? '#d4af37' : '#bc4749';
      ctx.textAlign = 'center';
      ctx.fillText(hood.nickname.toUpperCase(), p.x, p.y - 10);
    });

    ctx.restore();
  }, [ticker, state.hoods, state.playerGang]);

  return (
    <div className="h-full w-full relative flex flex-col overflow-hidden bg-[#0c0805]">
      {/* Map Viewport Area */}
      <div ref={containerRef} className="flex-1 cursor-crosshair relative">
        <canvas ref={canvasRef} className="opacity-90" />
        
        {/* Cinematic Overlays */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(12,8,5,0.7)_100%)] opacity-80"></div>
        <div className="absolute top-0 w-full h-24 bg-gradient-to-b from-[#0c0805] to-transparent"></div>
        <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-[#0c0805] to-transparent"></div>
      </div>

      {/* Floating Alerts Container */}
      <div className="absolute top-8 left-8 w-72 flex flex-col gap-3 z-20 pointer-events-none">
        <AnimatePresence>
          {state.history.slice(-3).reverse().map(event => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#f4ead5] border-l-4 border-l-[#bc4749] p-3 shadow-[5px_5px_15px_rgba(0,0,0,0.5)] pointer-events-auto"
            >
              <div className="flex items-center justify-between gap-2 mb-1 border-b border-black/10 pb-1">
                <div className="flex items-center gap-1.5">
                  {event.type === 'alert' ? <AlertTriangle size={10} className="text-[#bc4749]" /> : <Info size={10} className="text-blue-900" />}
                  <span className="text-[9px] uppercase font-black tracking-widest text-black/60">{event.type} dispatch</span>
                </div>
                <span className="text-[8px] font-mono text-black/40">T-{ticker % 1000}</span>
              </div>
              <p className="font-serif text-[12px] leading-tight text-[#2b251d] font-bold italic">
                {event.message}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Control Bar - Editorial Style */}
      <div className="h-16 bg-[#120a06] border-t border-[#3d2b1d] flex items-center justify-between px-8 z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2 bg-[#261810] p-1 rounded border border-[#3d2b1d]">
             <button 
               onClick={() => setState(p => ({ ...p, isPaused: !p.isPaused }))}
               className={`p-2 transition-all ${state.isPaused ? 'text-[#d4af37] bg-[#d4af37]/10' : 'text-[#a89078] hover:text-[#d4af37]'}`}
             >
               {state.isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
             </button>
             <div className="w-px h-6 bg-[#3d2b1d]" />
             <button 
               onClick={() => setState(p => ({ ...p, simulationSpeed: p.simulationSpeed === 1 ? 2 : 1 }))}
               className={`p-2 transition-all ${state.simulationSpeed > 1 ? 'text-[#d4af37] bg-[#d4af37]/10' : 'text-[#a89078] hover:text-[#d4af37]'}`}
             >
               <FastForward size={18} fill={state.simulationSpeed > 1 ? "currentColor" : "none"} />
             </button>
          </div>

          <div className="flex flex-col border-l border-[#3d2b1d] pl-8">
            <span className="text-[8px] uppercase tracking-widest font-black text-[#a89078]/40 mb-1">Chronometer</span>
            <span className="text-sm font-mono text-[#d4af37] leading-none uppercase">08:00 AM · MONDAY</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex flex-col text-right">
             <span className="text-[8px] uppercase tracking-widest font-black text-[#a89078]/40 mb-1">Simulation state</span>
             <div className="flex items-center gap-2 justify-end">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                <span className="text-[10px] font-black uppercase text-[#d4af37]">Live Feed</span>
             </div>
           </div>

           <button 
            onClick={onEndWeek}
            className="px-6 py-2 bg-[#bc4749] text-white text-[10px] uppercase font-black tracking-[0.2em] hover:bg-[#a53a3c] transition-all shadow-[0_0_20px_rgba(188,71,73,0.3)] border border-white/10"
           >
             Halt Working Week
           </button>
        </div>
      </div>

      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]"></div>
    </div>
  );
}
