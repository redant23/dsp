"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface AnimateInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  reduceMotion?: boolean;
}

// 애니메이션 효과를 적용할 컴포넌트를 감싸는 래퍼 컴포넌트
const AnimateIn = ({ children, delay = 0, duration = 0.4, reduceMotion = false }: AnimateInProps) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    // 컴포넌트가 마운트된 후 애니메이션 시작
    setShouldAnimate(true)
  }, []);

  const variants = {
    hidden: { opacity: 0, y: 80 },
    visible: { opacity: 1, y: 0 },
  };

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial="hidden"
      animate={shouldAnimate ? "visible" : "hidden"}
      variants={variants}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
};

export default AnimateIn;