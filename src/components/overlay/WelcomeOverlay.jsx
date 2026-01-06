import { useEffect } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import { motion } from "framer-motion";

import animation from "../../assets/lottie/Loading_Progress_Bar.json";

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
          style={{ width: 220, height: 220 }}
        />

        <h2 className="mt-4 text-xl font-semibold text-gray-800">
          Welcome Back 👋
        </h2>

        <p className="text-gray-500 text-sm mt-1">
          Preparing your dashboard...
        </p>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeOverlay;
