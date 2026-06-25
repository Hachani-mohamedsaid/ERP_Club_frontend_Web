// Animation preset configurations for Framer Motion

export const cardAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
  whileHover: { scale: 1.02 },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

export const slideInRight = {
  initial: { opacity: 0, x: 400 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3 },
};

// CSS Keyframe animations
export const animationStyles = `
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes glow-danger {
    0%, 100% {
      box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
    }
    50% {
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
    }
  }

  @keyframes glow-warning {
    0%, 100% {
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
    }
    50% {
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.6);
    }
  }

  @keyframes glow-success {
    0%, 100% {
      box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
    }
    50% {
      box-shadow: 0 0 20px rgba(34, 197, 94, 0.6);
    }
  }

  @keyframes drawLine {
    from {
      stroke-dashoffset: 1000;
    }
    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes rotate-needle {
    0% {
      transform: rotate(-90deg);
    }
    100% {
      transform: rotate(var(--needle-rotation, 45deg));
    }
  }

  @keyframes blink-slow {
    0%, 49%, 100% {
      opacity: 1;
    }
    50%, 99% {
      opacity: 0.3;
    }
  }

  .animate-pulse {
    animation: pulse 2s infinite;
  }

  .animate-glow-danger {
    animation: glow-danger 2s infinite;
  }

  .animate-glow-warning {
    animation: glow-warning 2s infinite;
  }

  .animate-glow-success {
    animation: glow-success 2s infinite;
  }

  .animate-blink-slow {
    animation: blink-slow 3s infinite;
  }
`;
