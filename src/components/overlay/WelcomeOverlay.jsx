import { useEffect } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import { motion } from "framer-motion";

import animation from "../../assets/lottie/loading_gray.json";

const welcomeAnimation = animation.default || animation;

const WelcomeOverlay = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] bg-white/80 backdrop-blur-sm flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="flex flex-col items-center"
      >
        <Player
          autoplay
          loop
          src={welcomeAnimation}
          style={{ width: 180, height: 180 }}
        />
      </motion.div>
    </motion.div>
  );
};

export default WelcomeOverlay;
