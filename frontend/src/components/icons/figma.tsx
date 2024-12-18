'use client';

import { HTMLAttributes } from 'react';

import type { Variants } from 'motion/react';
import { motion, useAnimation } from 'motion/react';

const variants: Variants = {
  normal: {
    pathLength: 1,
    opacity: 1,
  },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      delay: 0.3,
      duration: 0.5,
      opacity: { delay: 0.25 },
    },
  },
};

const FigmaIcon = (props: HTMLAttributes<HTMLDivElement>) => {
  const { className } = props;

  const controls = useAnimation();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      onMouseEnter={() => controls.start('animate')}
      onMouseLeave={() => controls.start('normal')}
      className={className}
    >
      <motion.g
        style={{ transformOrigin: '50% 50%' }}
        variants={{
          normal: {
            rotateY: 0,
            transition: {
              duration: 0.5,
              ease: 'linear',
            },
          },
          animate: {
            rotateY: 360,
            transition: {
              duration: 0.8,
              ease: 'linear',
            },
          },
        }}
        animate={controls}
      >
        <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" />
        <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" />
      </motion.g>
      <motion.path
        d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"
        variants={variants}
        animate={controls}
      />
      <motion.path
        d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"
        variants={variants}
        animate={controls}
      />
      <motion.path
        d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"
        variants={variants}
        animate={controls}
      />
    </svg>
  );
};

export { FigmaIcon };
