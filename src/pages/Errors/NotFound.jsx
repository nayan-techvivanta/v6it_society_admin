import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Player } from "@lottiefiles/react-lottie-player";

import animation from "../../assets/lottie/No History.json";

const notFoundAnimation = animation.default || animation;

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="  p-8 max-w-md text-center"
      >
        {/* Lottie Animation */}
        <div className="flex justify-center mb-4">
          <Player
            autoplay
            loop
            src={notFoundAnimation}
            style={{ height: "320px", width: "320px" }}
          />
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>

        <p className="text-gray-500 mb-6">
          Sorry, we couldn’t find the page you were looking for.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-primary text-white rounded-xl font-semibold"
        >
          Go back
        </motion.button>
      </motion.div>
    </div>
  );
};

export default NotFound;
