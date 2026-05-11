import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UI_SETTINGS } from '../game/constants';
import { X, ChevronRight, ChevronLeft, Info, HelpCircle } from 'lucide-react';

interface TutorialStep {
  title: string;
  content: string;
  target?: string; // Optional CSS selector for focus (future expansion)
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Welcome to the Outfit",
    content: "You are the Boss of a rising syndicate. Your goal is to dominate the city districts through racketeering, bribery, and brute force."
  },
  {
    title: "The Planning Phase",
    content: "This is where you issue orders. Select a 'Hood' from the left menu, then click a district on the map to assign a task like 'EXTORT' or 'SCOUT'."
  },
  {
    title: "The Working Week",
    content: "Once you've given your orders, switch to the 'Working Week' tab. Your crew will execute your commands in real-time. Watch the map carefully for rival movements."
  },
  {
    title: "Fronts & Rackets",
    content: "To earn cash, you need Businesses. High Land Value districts are better for Speakeasies, while low-rent areas are perfect for underground Casinos."
  },
  {
    title: "Heat & The FBI",
    content: "The more suspicious your business, the more 'Heat' you generate. Incompatible fronts (like a Casino in a Library) will bring federal heat down on your head."
  }
];

interface TutorialOverlayProps {
  currentStep: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function TutorialOverlay({ currentStep, onClose, onNext, onPrev }: TutorialOverlayProps) {
  const step = TUTORIAL_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-2xl border-4 border-black shadow-[30px_30px_0px_rgba(0,0,0,0.5)] overflow-hidden"
        style={{ backgroundColor: UI_SETTINGS.BG_COLOR_PAPER }}
      >
        {/* Header */}
        <div className="bg-black p-6 flex justify-between items-center">
          <div className="flex items-center gap-3 text-[#d4af37]">
            <HelpCircle size={32} />
            <h2 style={{ fontSize: UI_SETTINGS.HEADER_FONT_SIZE, lineHeight: 1 }} className="font-black uppercase italic tracking-tighter">
              Field Briefing
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-10">
          <div className="mb-2">
            <span style={{ fontSize: UI_SETTINGS.TINY_FONT_SIZE }} className="font-black uppercase tracking-[0.4em] text-black/40">
              Module {currentStep + 1} of {TUTORIAL_STEPS.length}
            </span>
          </div>
          <h3 
            style={{ fontSize: '36px', lineHeight: 1, color: UI_SETTINGS.TEXT_COLOR_BLACK }} 
            className="font-black uppercase mb-6 border-b-4 border-black pb-2 inline-block"
          >
            {step.title}
          </h3>
          <p 
            style={{ fontSize: UI_SETTINGS.BASE_FONT_SIZE, fontWeight: 900 }} 
            className="text-black/80 font-serif leading-relaxed italic mb-10"
          >
            "{step.content}"
          </p>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button 
              onClick={onPrev}
              disabled={currentStep === 0}
              className="flex items-center gap-2 font-black uppercase text-black hover:translate-x-[-4px] transition-transform disabled:opacity-0"
              style={{ fontSize: UI_SETTINGS.SMALL_FONT_SIZE }}
            >
              <ChevronLeft size={20} /> Prev
            </button>
            <div className="flex gap-2">
              {TUTORIAL_STEPS.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2 transition-all ${i === currentStep ? 'w-8 bg-black' : 'w-2 bg-black/20'}`}
                />
              ))}
            </div>
            <button 
              onClick={currentStep === TUTORIAL_STEPS.length - 1 ? onClose : onNext}
              className="flex items-center gap-2 font-black uppercase bg-black text-[#d4af37] px-8 py-4 hover:scale-110 active:scale-95 transition-all shadow-[8px_8px_0px_rgba(212,175,55,0.3)]"
              style={{ fontSize: UI_SETTINGS.BASE_FONT_SIZE }}
            >
              {currentStep === TUTORIAL_STEPS.length - 1 ? "Start Operations" : "Next Directive"} <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/paper.png')]"></div>
      </motion.div>
    </div>
  );
}
