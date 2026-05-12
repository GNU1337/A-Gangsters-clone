import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveCutscene, OrderType } from '../game/types';
import { UI_SETTINGS } from '../game/constants';
import { Skull, Target, Bomb, Zap, Shield, UserX, AlertCircle } from 'lucide-react';

interface ActionCutsceneProps {
  cutscene: ActiveCutscene;
  onComplete: () => void;
}

export default function ActionCutscene({ cutscene, onComplete }: ActionCutsceneProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for exit animation
    }, 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const getIcon = () => {
    switch (cutscene.type) {
      case OrderType.EXTORT: return <Shield size={80} className="text-[#d4af37]" />;
      case OrderType.HIT: return <Target size={80} className="text-red-500" />;
      case OrderType.BOMB: return <Bomb size={80} className="text-orange-500" />;
      case 'death': return <Skull size={80} className="text-white" />;
      case 'raid': return <Zap size={80} className="text-blue-500" />;
      default: return <AlertCircle size={80} className="text-white" />;
    }
  };

  const getOutcomeText = () => {
    if (cutscene.outcome === 'success') return 'DIRECTIVE SUCCESSFUL';
    if (cutscene.outcome === 'failure') return 'OPERATION FAILED';
    return 'TRANSACTION COMPLETE';
  };

  const getOutcomeColor = () => {
    if (cutscene.outcome === 'success') return '#00ff41';
    if (cutscene.outcome === 'failure') return '#bc4749';
    return '#d4af37';
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.5, rotate: 10 }}
            className="w-full max-w-lg border-8 border-black shadow-[40px_40px_0px_rgba(0,0,0,0.6)] overflow-hidden relative"
            style={{ backgroundColor: UI_SETTINGS.BG_COLOR_PAPER }}
          >
            {/* Action Frame */}
            <div className="bg-black p-8 flex flex-col items-center justify-center gap-6 relative overflow-hidden">
               {/* Cartoony Background Lines */}
               <div className="absolute inset-0 opacity-20 flex items-center justify-center">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute w-full h-[2px] bg-white mt-[-2px]" 
                      style={{ transform: `rotate(${i * 30}deg)` }} 
                    />
                  ))}
               </div>
               
               <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="relative z-10"
               >
                {getIcon()}
               </motion.div>

               <div className="text-center relative z-10">
                  <h2 
                    style={{ fontSize: '48px', lineHeight: 1, color: getOutcomeColor() }} 
                    className="font-black uppercase italic tracking-tighter mb-2 drop-shadow-[4px_4px_0px_black]"
                  >
                    {getOutcomeText()}
                  </h2>
                  <p 
                    style={{ fontSize: UI_SETTINGS.BASE_FONT_SIZE }} 
                    className="text-white font-mono uppercase tracking-widest opacity-80"
                  >
                    {cutscene.type} IN PROGRESS
                  </p>
               </div>
            </div>

            {/* Description Area */}
            <div className="p-8 border-t-8 border-black">
              <p 
                style={{ fontSize: '24px', lineHeight: 1.2, fontWeight: 900 }} 
                className="text-black font-serif italic text-center mb-6 leading-tight"
              >
                "{cutscene.message}"
              </p>
              
              <div className="flex items-center justify-center gap-4 border-t-2 border-black/10 pt-4">
                <span className="w-12 h-1 bg-black/20" />
                <span style={{ fontSize: '12px' }} className="font-black uppercase tracking-[0.5em] text-black/40 text-center">
                  SURVEILLANCE FEED ACTIVE
                </span>
                <span className="w-12 h-1 bg-black/20" />
              </div>
            </div>

            {/* Grain Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.1] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
