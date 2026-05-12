import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState, EconomicReport } from '../game/types';
import { UI_SETTINGS } from '../game/constants';
import { Newspaper as NewspaperIcon, TrendingUp, TrendingDown, DollarSign, Wallet, PieChart, Info, Map } from 'lucide-react';

interface NewspaperProps {
  state: GameState;
}

type Page = 'front' | 'economy' | 'society' | 'crime';

export default function Newspaper({ state }: NewspaperProps) {
  const [currentPage, setCurrentPage] = useState<Page>('front');
  const events = state.history.slice(-15).reverse();
  const report = state.lastReport;

  const PageTab = ({ type, label, icon: Icon }: { type: Page, label: string, icon: any }) => (
    <button 
      onClick={() => setCurrentPage(type)}
      className={`flex flex-col items-center gap-1 p-2 border-r last:border-0 border-black/10 transition-all ${currentPage === type ? 'bg-black text-[#d4af37]' : 'hover:bg-black/5 text-black/50'}`}
    >
      <Icon size={16} />
      <span className="text-[7px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <div className="flex-1 bg-white border-4 border-black flex flex-col p-6 shadow-[20px_20px_40px_rgba(0,0,0,0.5)] relative overflow-hidden transform lg:rotate-[0.5deg] selection:bg-black selection:text-white">
      {/* Newspaper Header */}
      <div className="border-b-4 border-black text-center pb-4 mb-4">
          <div style={{ fontSize: '9px' }} className="border-b-2 border-black mb-2 py-1 tracking-[0.2em] font-black opacity-80 uppercase text-black">METROPOLITAN DAILY · EST. 1888</div>
          <h4 style={{ fontSize: '48px', lineHeight: 0.8 }} className="font-black uppercase italic tracking-tighter font-serif text-black">The Morning Herald</h4>
          <div className="flex justify-between items-center bg-black text-[#d4af37] px-2 py-1 mt-2 text-[9px] font-black uppercase italic tracking-widest">
            <span>{state.weekDate.toUpperCase()} LATE EDITION</span>
            <div className="flex gap-4">
                <span>VOL. XXXIV · NO. 241</span>
                <span>PRICE: TWO CENTS</span>
            </div>
          </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b-2 border-black mb-4">
        <PageTab type="front" label="Front Page" icon={NewspaperIcon} />
        <PageTab type="economy" label="Financials" icon={DollarSign} />
        <PageTab type="crime" label="Police Blotter" icon={Info} />
        <PageTab type="society" label="The City" icon={Map} />
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar-newspaper">
        <AnimatePresence mode="wait">
          {currentPage === 'front' && (
            <motion.div 
              key="front"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                 <h2 className="text-3xl font-black uppercase italic leading-none border-b-2 border-black pb-2">
                    {events[0]?.message.split('.')[0] || "CITY QUIET AS PROHIBITION CONTINUES"}
                 </h2>
                 <p className="font-serif italic text-sm opacity-80 leading-tight">By Our Special Correspondent</p>
              </div>

              <div className="flex flex-col gap-6">
                {events.slice(0, 4).map((event, i) => (
                  <div key={event.id} className="border-b-2 border-black/10 pb-4 last:border-0">
                    <p style={{ fontSize: '15px' }} className="font-serif leading-tight text-justify text-black font-black italic opacity-90 first-letter:text-6xl first-letter:font-black first-letter:float-left first-letter:mr-2 first-letter:mt-1">
                      {event.message}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {currentPage === 'economy' && (
            <motion.div 
              key="economy"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-black text-[#d4af37] p-4 font-mono">
                 <h3 className="text-sm font-black uppercase border-b border-[#d4af37]/30 pb-2 mb-4 flex items-center gap-2">
                    <PieChart size={16} /> Weekly Fiscal Report
                 </h3>
                 <div className="space-y-3">
                    <div className="flex justify-between border-b border-[#d4af37]/10 pb-1">
                        <span>GROSS REVENUE</span>
                        <span className="font-black">${(report?.grossIncome || 0) / 64}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#d4af37]/10 pb-1 text-red-500">
                        <span>OVERHEAD & SALARIES</span>
                        <span className="font-black">-${(report?.expenses || 0) / 64}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#d4af37]/10 pb-1 text-red-500">
                        <span>GOV TAXES (FEDERAL)</span>
                        <span className="font-black">-${(report?.taxesPaid || 0) / 64}</span>
                    </div>
                    <div className="flex justify-between pt-2 text-white border-t-2 border-[#d4af37]/50">
                        <span className="font-black uppercase tracking-widest">NET PROFIT</span>
                        <span className="text-xl font-black">${((report?.legalProfit || 0) + (report?.illegalProfit || 0) - (report?.expenses || 0) - (report?.taxesPaid || 0)) / 64}</span>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="font-black uppercase italic border-b-2 border-black pb-1">Industry Breakdown</h4>
                 <div className="grid grid-cols-2 gap-4">
                    {Object.entries(report?.racketBreakdown || {}).map(([type, amount]) => (
                        <div key={type} className="border-l-4 border-black pl-3 py-2">
                            <div className="text-[9px] font-black uppercase opacity-60 text-black">{type.replace('_', ' ')}</div>
                            <div className="text-xl font-black text-black">${amount / 64}</div>
                        </div>
                    ))}
                 </div>
              </div>

              <p className="text-[12px] font-serif border-t-2 border-black pt-4 italic opacity-70">
                "The economy is booming, yet the underground market remains the primary driver of capital in the metro area. Investigative reports suggest a massive influx of untaxed funds surfacing in recent weeks."
              </p>
            </motion.div>
          )}

          {currentPage === 'crime' && (
            <motion.div 
              key="crime"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
               <h3 className="text-2xl font-black uppercase italic border-b-2 border-black mb-4">Underworld Tensions</h3>
               <div className="space-y-6">
                  {events.filter(e => e.type === 'alert' || e.type === 'critical' || e.type === 'crime' || e.type === 'death').map(event => (
                    <div key={event.id} className="border-l-4 border-red-800 pl-4 py-2 bg-red-50/50">
                        <div className="text-[10px] font-black uppercase text-red-800 mb-1">Incident Report #{event.id.slice(-4)}</div>
                        <p className="font-serif font-black italic text-black leading-tight">
                            "{event.message}"
                        </p>
                    </div>
                  ))}
               </div>
            </motion.div>
          )}

          {currentPage === 'society' && (
            <motion.div 
              key="society"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
               <h3 className="text-2xl font-black uppercase italic border-b-2 border-black mb-4">City Life & Politics</h3>
               <div className="p-4 border-4 border-black relative overflow-hidden bg-gray-50 h-48 flex items-center justify-center">
                  <Map size={48} strokeWidth={1} className="opacity-10 absolute" />
                  <p className="relative z-10 font-serif text-center italic text-lg leading-snug">
                    "Metropolitan landscape continues to evolve as new developments arise near the industrial zones."
                  </p>
               </div>
               <p className="font-serif leading-tight text-justify indent-8">
                  The Mayor's office released a statement this morning regarding the recent 'unexplained movements' in the northern districts. Officials maintain that there is no rising syndicate activity, despite local rumors of street-level disputes. Citizens are encouraged to remain vigilant and report suspicious behavior to their local precinct.
               </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/paper.png')]"></div>
    </div>
  );
}
