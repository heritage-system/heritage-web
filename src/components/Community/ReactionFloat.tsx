// src/components/ReactionFloat.tsx
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Reaction {
  id: number;
  icon: React.ReactNode;
  x: number;
}

interface ReactionFloatProps {
  reactions: Reaction[];
  onRemove: (id: number) => void;
}

export const ReactionFloat: React.FC<ReactionFloatProps> = ({ reactions, onRemove }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-205.mp3');
    audioRef.current.volume = 0.3;
  }, []);

  useEffect(() => {
    if (reactions.length > 0 && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [reactions]);

  return (
    <AnimatePresence>
      {reactions.map((reaction) => (
        <motion.div
          key={reaction.id}
          className="fixed pointer-events-none z-40 text-5xl drop-shadow-xl"
          initial={{ y: 120, scale: 0.7, opacity: 1 }}
          animate={{ y: -320, scale: 1.3, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 2.8,
            ease: [0.25, 0.8, 0.25, 1],
          }}
          style={{
            left: `${reaction.x}%`,
            bottom: '10%',
          }}
          onAnimationComplete={() => onRemove(reaction.id)}
        >
          {reaction.icon}
        </motion.div>
      ))}
    </AnimatePresence>
  );
};