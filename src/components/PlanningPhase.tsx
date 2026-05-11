/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameState, OrderType, Order, HoodStatus, Business, CityBlock } from '../game/types';
import { ATTRIBUTE_LABELS, FRONT_COMPATIBILITY, RACKET_METRICS, UI_SETTINGS } from '../game/constants';
import { FileText, Users, Newspaper, Briefcase, Map as MapIcon, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface PlanningPhaseProps {
  state: GameState;
  setState: (updater: (prev: GameState) => GameState) => void;
}

export default function PlanningPhase({ state, setState }: PlanningPhaseProps) {
  const playerHoods = Object.values(state.hoods).filter(h => h.gangId === state.playerGang);
  const events = state.history.slice(-10).reverse();

  return (
    <div className="h-full w-full grid grid-cols-[320px_1fr_360px] gap-4 p-4 overflow-hidden bg-[#1a120b]">
      
      {/* Sidebar: Hoods & Crews */}
      <div 
        className="shadow-inner relative flex flex-col border border-black/20 overflow-hidden"
        style={{ backgroundColor: UI_SETTINGS.BG_COLOR_PAPER }}
      >
        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-black/20 to-transparent"></div>
        <div className="p-6 border-b-2 border-black bg-[#e8dab5] flex justify-between items-end">
          <h2 style={{ fontSize: UI_SETTINGS.HEADER_FONT_SIZE, lineHeight: 0.8 }} className="font-black text-black uppercase font-serif">The Crew</h2>
          <span style={{ fontSize: UI_SETTINGS.SMALL_FONT_SIZE }} className="text-black/60 uppercase tracking-widest font-mono font-black">{playerHoods.length} Active</span>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar bg-black/5 p-1">
          {playerHoods.map(hood => (
            <div 
              key={hood.id} 
              onClick={() => setState(p => ({ ...p, selectedHoodId: hood.id }))}
              className={`p-6 transition-all cursor-pointer border-2 shadow-sm ${state.selectedHoodId === hood.id ? 'bg-white border-black scale-[1.02] z-10' : 'bg-[#fffcf0] border-transparent hover:border-black/20'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span style={{ fontSize: UI_SETTINGS.BASE_FONT_SIZE }} className="font-black text-black leading-none uppercase tracking-tighter">{hood.nickname}</span>
                <span style={{ fontSize: UI_SETTINGS.TINY_FONT_SIZE }} className={`font-black px-2 py-0.5 rounded-sm uppercase ${hood.status === HoodStatus.IDLE ? 'bg-green-800 text-white' : 'bg-red-800 text-white'}`}>
                  {hood.status}
                </span>
              </div>
              <div style={{ fontSize: UI_SETTINGS.SMALL_FONT_SIZE }} className="italic text-black/50 mb-4 border-b border-black/10 pb-2 font-black">{hood.name}</div>
              <div style={{ fontSize: UI_SETTINGS.TINY_FONT_SIZE }} className="grid grid-cols-4 gap-2 font-black text-black/70 font-mono">
                {Object.entries(hood.attributes).map(([key, val]) => (
                  <div key={key} className="flex flex-col bg-black/5 p-1">
                    <span className="opacity-40 text-[9px] uppercase leading-none mb-1 font-black">{key.slice(0, 3)}</span>
                    <span className="text-black font-black">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Area: Intelligence Map & Orders */}
      <div className="flex flex-col gap-4">
        {/* City Grid Overview */}
        <div className="flex-1 bg-[#2b251d] rounded border border-[#4a3d31] relative overflow-hidden flex flex-col p-4 shadow-2xl">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6d5d4b 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <MapIcon size={14} className="text-[#d4af37]" />
              <h2 className="text-[10px] uppercase tracking-[0.2em] font-black text-[#a89078]">Intelligence Map</h2>
            </div>
            {state.selectedBlockId && (
              <div className="bg-[#d4af37]/10 px-2 py-0.5 rounded border border-[#d4af37]/30 text-[9px] text-[#d4af37] font-mono uppercase">
                DISTRICT SECURE: {state.city[state.selectedBlockId].landValue} LV
              </div>
            )}
          </div>
          
          <div className="flex-1 flex items-center justify-center relative z-10">
            <div className="grid grid-cols-16 grid-rows-16 w-full max-w-[500px] aspect-square border border-white/20 bg-black/40 ring-1 ring-white/5">
              {Object.values(state.city).map(block => (
                <div 
                  key={block.id}
                  onClick={() => setState(p => ({ ...p, selectedBlockId: block.id }))}
                  className={`border-[0.5px] border-white/5 cursor-pointer transition-all hover:bg-[#d4af37]/20 ${state.selectedBlockId === block.id ? 'bg-[#d4af37]/30 ring-1 ring-inset ring-[#d4af37]' : ''}`}
                  style={{
                    backgroundColor: block.type === 'industrial' ? 'rgba(212,175,55,0.05)' : 
                                    block.type === 'residential' ? 'rgba(168,144,120,0.05)' : 'transparent'
                  }}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-between text-[8px] text-[#a89078] font-mono uppercase opacity-50 border-t border-white/10 pt-2 relative z-10">
            <span>[ ISOMETRIC SIMULATION PAUSED ]</span>
            <div className="flex gap-4">
              <span>Coord: {state.selectedBlockId || '0.0'}</span>
              <span>Pop: 5,421</span>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="h-64 flex gap-4">
          <div className="flex-1 bg-[#d2c2a4] text-[#2b251d] p-4 shadow-xl border border-[#8a765a] flex flex-col font-serif relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-b from-black/5 to-transparent"></div>
            <div className="flex items-center gap-2 border-b border-[#2b251d]/10 pb-2 mb-3">
              <Briefcase size={14} className="opacity-70" />
              <h2 className="text-[10px] uppercase tracking-widest font-black leading-none">Weekly Directives</h2>
            </div>
            <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1 custom-scrollbar-dark">
              {Object.values(OrderType).map(type => (
                <button 
                  key={type}
                  disabled={!state.selectedHoodId || !state.selectedBlockId}
                  onClick={() => {
                    const orderId = `order-${Date.now()}`;
                    const order: Order = {
                      id: orderId,
                      type,
                      targetId: state.selectedBlockId!,
                      hoodId: state.selectedHoodId!,
                      status: 'pending'
                    };
                    setState(p => {
                      const nextHoods = { ...p.hoods };
                      nextHoods[state.selectedHoodId!] = { ...nextHoods[state.selectedHoodId!], status: HoodStatus.ON_ORDER, currentOrderId: orderId };
                      return { ...p, orders: { ...p.orders, [orderId]: order }, hoods: nextHoods };
                    });
                  }}
                  className="text-[11px] h-10 uppercase font-black border-2 border-black hover:scale-105 active:scale-95 disabled:opacity-20 transition-all flex items-center justify-center shadow-[4px_4px_0px_black] active:shadow-none translate-y-[-2px] active:translate-y-[2px]"
                  style={{ 
                    backgroundColor: UI_SETTINGS.ACCENT_GREEN,
                    color: '#000',
                  }}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="w-[180px] bg-[#f2e8cf] border border-[#8a765a] p-3 shadow-xl flex flex-col gap-2 relative">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-b from-black/5 to-transparent"></div>
            <div className="text-[9px] uppercase font-black border-b border-[#2b251d]/10 pb-1 mb-1 text-[#2b251d] tracking-widest">Territory Info</div>
            {state.selectedBlockId ? (
              <div className="space-y-3">
                <div className="flex justify-between text-[11px] font-mono text-[#2b251d]">
                  <span className="opacity-50">LV:</span>
                  <span>{state.city[state.selectedBlockId].landValue}</span>
                </div>
                <div className="space-y-3">
                  {state.city[state.selectedBlockId].businesses.map(bId => {
                    const b = state.businesses[bId];
                    return (
                      <div key={bId} className="flex flex-col gap-0.5 border-t border-black/5 pt-2 first:border-0 first:pt-0">
                         <div className="text-[10px] font-bold text-[#bc4749] uppercase leading-tight font-serif">{b.name}</div>
                         <div className="text-[8px] opacity-60 uppercase font-black tracking-tighter mb-1">
                            {state.gangs[b.ownerId]?.name || 'Neutral Grounds'}
                         </div>
                         {b.racketType ? (
                           <div className="p-1 px-2 bg-[#bc4749]/10 border-l-2 border-[#bc4749] text-[#bc4749] text-[8px] uppercase font-bold">
                             Heat: High Risk
                           </div>
                         ) : (
                           <div className="text-[8px] italic text-green-900/60 opacity-80">Legal Front Only</div>
                         )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[10px] text-[#2b251d]/30 italic text-center">Reference Map to query district intel</div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar: Newspaper & Reports */}
      <div className="flex flex-col gap-4">
        {/* Newspaper */}
        <div className="flex-1 bg-white border-4 border-black flex flex-col p-8 shadow-[20px_20px_40px_rgba(0,0,0,0.5)] relative overflow-hidden transform rotate-[0.5deg]">
          <div className="border-b-4 border-black text-center pb-4 mb-6">
             <div style={{ fontSize: UI_SETTINGS.TINY_FONT_SIZE }} className="border-b-2 border-black mb-2 py-1 tracking-[0.2em] font-black opacity-80 uppercase text-black">METROPOLITAN DAILY · EST. 1888</div>
             <h4 style={{ fontSize: '64px', lineHeight: 0.8 }} className="font-black uppercase italic tracking-tighter font-serif text-black">The Morning Herald</h4>
             <div style={{ fontSize: UI_SETTINGS.SMALL_FONT_SIZE }} className="flex justify-between font-black border-t-2 border-black mt-2 pt-2 italic text-black">
              <span>{state.weekDate.toUpperCase()} LATE EDITION</span>
              <span>VOL. XXXIV · NO. 241</span>
             </div>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar-newspaper space-y-6">
            {events.length > 0 ? (
              <>
                <div style={{ fontSize: '32px', lineHeight: 1 }} className="font-black leading-none text-center underline decoration-4 decoration-black underline-offset-4 mb-8 text-black uppercase tracking-tighter">
                  {events[0].message}
                </div>
                <div className="flex flex-col gap-6">
                  {events.slice(1, 5).map(event => (
                    <div key={event.id} className="border-b-2 border-black/10 pb-4 last:border-0">
                      <p style={{ fontSize: UI_SETTINGS.BASE_FONT_SIZE }} className="font-serif leading-tight text-justify text-black font-black italic opacity-90 first-letter:text-6xl first-letter:font-black first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:text-black">
                        {event.message}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="opacity-10 flex flex-col items-center justify-center h-full gap-2 grayscale">
                <Newspaper size={64} strokeWidth={2} className="text-black" />
                <span className="text-[12px] uppercase font-black tracking-[0.4em] text-black">Scanning Wire...</span>
              </div>
            )}
          </div>
          <div className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/paper.png')]"></div>
        </div>

        {/* Diplomacy Ledger */}
        <div className="h-44 bg-[#2b251d] rounded border border-[#4a3d31] p-4 flex flex-col relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')]"></div>
          <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-3 relative z-10">
            <FileText size={14} className="text-[#d4af37]" />
            <h2 style={{ fontSize: UI_SETTINGS.SMALL_FONT_SIZE }} className="uppercase tracking-widest font-black text-[#a89078] leading-none">Syndicate Relations</h2>
          </div>
          <div className="space-y-4 relative z-10 flex-1 overflow-y-auto custom-scrollbar-dark pr-1">
             {Object.values(state.gangs).filter(g => !g.isPlayer).map(gang => (
               <div key={gang.id} className="flex flex-col gap-1">
                 <div className="flex justify-between items-end font-serif">
                   <span style={{ fontSize: UI_SETTINGS.SMALL_FONT_SIZE }} className="text-[#d4af37] font-black uppercase tracking-tighter">{gang.name}</span>
                   <span style={{ fontSize: UI_SETTINGS.TINY_FONT_SIZE }} className={`font-black px-1 ${gang.intensity > 80 ? 'text-red-500' : 'text-green-500'}`}>
                     {gang.intensity > 80 ? 'TENSE' : 'STABLE'}
                   </span>
                 </div>
                 <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${gang.intensity > 80 ? 'bg-red-500' : 'bg-[#d4af37]/40'}`} 
                      style={{ width: `${gang.intensity}%` }} 
                    />
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      <style>{`
        .grid-cols-16 { grid-template-columns: repeat(16, minmax(0, 1fr)); }
        .grid-rows-16 { grid-template-rows: repeat(16, minmax(0, 1fr)); }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .custom-scrollbar-dark::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.2); }
        .custom-scrollbar-newspaper::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-newspaper::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); }
      `}</style>
    </div>
  );
}
