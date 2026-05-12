import React, { useRef, useEffect } from 'react';
import { GameEvent } from '../game/types';
import { UI_SETTINGS as CONST_UI } from '../game/constants';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, ScrollText } from 'lucide-react';

interface GameLogProps {
  events: GameEvent[];
}

export default function GameLog({ events }: GameLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const getEventColor = (type: GameEvent['type']) => {
    switch (type) {
      case 'profit': return '#00ff41'; // Bright green
      case 'death': return '#bc4749'; // Direct red
      case 'crime': return '#d4af37'; // Gold
      case 'critical': return '#ff0000'; // Pure red
      case 'warning': return '#f59e0b'; // Amber
      case 'alert': return '#3b82f6'; // Blue
      default: return '#a89078'; // Muted sand
    }
  };

  return (
    <div className="flex flex-col h-full border-2 border-black bg-black/80 backdrop-blur-xl shadow-[10px_10px_0px_black]">
      <div className="bg-black p-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3 text-[#d4af37]">
          <Terminal size={18} />
          <h2 style={{ fontSize: '14px' }} className="font-black uppercase tracking-[0.3em]">Operational Log</h2>
        </div>
        <ScrollText size={16} className="text-white/20" />
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar-dark font-mono selection:bg-[#d4af37] selection:text-black"
      >
        <AnimatePresence initial={false}>
          {events.map((event, i) => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4 border-b border-white/5 pb-2 last:border-0"
            >
              <span className="text-white/30 text-[10px] shrink-0 pt-1">
                [{event.turn}:{new Date(event.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}]
              </span>
              <p 
                style={{ 
                  color: getEventColor(event.type),
                  fontSize: '13px',
                  lineHeight: 1.4,
                  fontWeight: 900
                }}
                className="italic"
              >
                {event.message}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="bg-black p-2 border-t border-white/10 flex justify-between items-center px-4">
        <span className="text-[9px] uppercase font-black text-white/30 tracking-widest leading-none">End of Wire</span>
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-1 h-1 bg-[#d4af37]/40 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
