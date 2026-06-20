'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScoreFlipDigitProps {
  value: number;
  className?: string;
  digitClassName?: string;
}

/**
 * A single animated score digit that flips like a physical scoreboard
 * when its value changes.
 */
export function ScoreFlipDigit({
  value,
  className = '',
  digitClassName = '',
}: ScoreFlipDigitProps) {
  const prevValueRef = useRef(value);
  const [displayValue, setDisplayValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (value !== prevValueRef.current) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setIsFlipping(false);
        prevValueRef.current = value;
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <span
      className={`inline-block relative select-none ${className}`}
      style={{ perspective: '400px' }}
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={displayValue}
          className={`inline-block tabular-nums ${digitClassName}`}
          initial={isFlipping ? { rotateX: -90, opacity: 0 } : false}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0 }}
          transition={{
            duration: 0.18,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ transformOrigin: 'center center', display: 'inline-block' }}
        >
          {String(displayValue).padStart(2, '0')}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

interface ScoreGlowFlashProps {
  trigger: number; // increment to trigger flash
  children: React.ReactNode;
}

/**
 * Wraps children and flashes a green glow when `trigger` increments.
 */
export function ScoreGlowFlash({ trigger, children }: ScoreGlowFlashProps) {
  const prevTriggerRef = useRef(trigger);
  const [glowing, setGlowing] = useState(false);

  useEffect(() => {
    if (trigger > prevTriggerRef.current) {
      setGlowing(true);
      const timer = setTimeout(() => setGlowing(false), 600);
      prevTriggerRef.current = trigger;
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <motion.span
      animate={
        glowing
          ? { scale: [1, 1.18, 1], filter: ['brightness(1)', 'brightness(1.9)', 'brightness(1)'] }
          : { scale: 1, filter: 'brightness(1)' }
      }
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      {children}
    </motion.span>
  );
}
