import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MdBlock } from "react-icons/md";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white shadow-xl rounded-2xl p-8 max-w-md text-center"
      >
        <MdBlock className="text-red-500 text-6xl mx-auto mb-4" />

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>

        <p className="text-gray-500 mb-6">
          You do not have permission to view this page.
        </p>

        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition"
        >
          Go Back
        </button>
      </motion.div>
    </div>
  );
};

export default Unauthorized;
