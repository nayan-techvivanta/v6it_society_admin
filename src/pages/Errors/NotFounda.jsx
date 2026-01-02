import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MdErrorOutline } from "react-icons/md";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white shadow-xl rounded-2xl p-8 max-w-md text-center"
      >
        <MdErrorOutline className="text-primary text-6xl mx-auto mb-4" />

        <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>

        <p className="text-gray-500 mb-6">
          The page you are looking for does not exist.
        </p>

        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition"
        >
          Go to Login
        </button>
      </motion.div>
    </div>
  );
};

export default NotFound;
