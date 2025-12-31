import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiLock } from "react-icons/fi";
import { IoKeyOutline } from "react-icons/io5";
import { FaSignInAlt } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import Logo from "../../assets/Images/Logo/logo.png";
import { FaRegEye, FaRegEyeSlash, FaRegUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { MdOutlineEmail } from "react-icons/md";
import { supabase } from "../../api/supabaseClient";

const userTypes = [
  "super admin",
  "property manager",
  "building admin",
  "building security",
  "building user",
  "school admin",
  "school security",
];

const Login = () => {
  const [selectedType, setSelectedType] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const navigate = useNavigate();

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setIsLoading(true);

  //   try {
  //     const { data, error } = await supabase.auth.signInWithPassword({
  //       email,
  //       password,
  //     });

  //     if (error) {
  //       alert(error.message);
  //       return;
  //     }

  //     console.log("User:", data.user);
  //     console.log("Session:", data.session);
  //     console.log("User Type:", selectedType);
  //     console.log("Secret Key:", secretKey);

  //     navigate("/dashboard");
  //   } catch (err) {
  //     console.error("Login failed:", err);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setIsLoading(true);

  //   const { data, error } = await supabase.auth.signInWithPassword({
  //     // email,
  //     // password,
  //     email: "test@mail.com",
  //     password: "password123",
  //   });

  //   if (error) {
  //     console.error("Login error:", error.message);
  //     alert(error.message);
  //     setIsLoading(false);
  //     return;
  //   }

  //   // ✅ PRINT ONLY USER ID
  //   console.log(data.user.id);

  //   setIsLoading(false);
  //   navigate("/dashboard");
  // };
  // console.log("SUPABASE URL:", import.meta.env.VITE_SUPABASE_URL);
  // console.log("SUPABASE KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY);
  useEffect(() => {
    const autoLogin = async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "User1@gmail.com",
        password: "Test@1234",
      });

      if (error) {
        console.error("Login error:", error.message);
        return;
      }

      console.log(data.user.id);
    };

    autoLogin();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "User1@gmail.com",
        password: "Test@1234",
      });

      if (error) {
        console.error("Login error:", error.message);
        alert(error.message);
        return;
      }

      console.log("User ID:", data.user.id);

      // optional
      navigate("/dashboard");
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  async function handleLogin() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "test@mail.com",
      password: "password123",
    });

    if (error) {
      console.error("Login error:", error.message);
      return;
    }

    console.log(data.user.id);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-lightBackground font-roboto flex flex-col md:flex-row">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden md:flex md:w-1/2 lg:w-1/2 bg-gradient-to-br from-primary/10 to-primary/5 flex-col items-center justify-center p-8"
      >
        <div className="max-w-md w-full space-y-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="flex flex-col items-center"
          >
            <div className="mb-6 p-4  ">
              <img
                src={Logo}
                alt="Company Logo"
                className="h-56 w-auto object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-textAndTab text-center">
              Welcome to <span className="text-primary">Secure Access</span>
            </h1>
            <p className="text-hintText text-center mt-4 max-w-sm">
              One platform for all your access management needs. Secure,
              reliable, and efficient.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 grid grid-cols-2 gap-4"
          >
            {["Security", "Management", "Monitoring", "Control"].map(
              (item, index) => (
                <div
                  key={item}
                  className="bg-white/50 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm"
                >
                  <div className="text-primary font-semibold">{item}</div>
                </div>
              )
            )}
          </motion.div>
        </div>
      </motion.div>

      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-100"
          >
            {/* Mobile Logo Inside Form */}
            <div className="md:hidden flex justify-center ">
              <div className="p-3 bg-white ">
                <img
                  src={Logo}
                  alt="Company Logo"
                  className="h-14 w-auto object-contain"
                />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl md:text-3xl font-bold text-textAndTab"
              >
                Welcome Back
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-hintText mt-2"
              >
                Please enter your credentials to continue
              </motion.p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Type Select */}
              {/* <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <label className="block text-sm font-semibold ">
                  Select Type
                </label>
                <div className="relative group">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 appearance-none cursor-pointer bg-white hover:border-gray-300 group-hover:shadow-sm"
                    required
                  >
                    <option value="" disabled>
                      Select your role
                    </option>
                    {userTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </motion.div>
                */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <label className="block text-sm font-semibold text-black">
                  Email Address
                </label>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdOutlineEmail className="h-5 w-5 text-hintText group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl
             focus:outline-none focus:ring-2 focus:ring-primary/50
             focus:border-primary transition-all duration-200
             placeholder:text-gray-400 hover:border-gray-300"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-2"
              >
                <label className="block text-sm font-semibold text-black">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-hintText group-focus-within:text-primary transition-colors" />
                  </div>

                  {/* Input */}
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3.5 border border-gray-200 rounded-xl
               focus:outline-none focus:ring-2 focus:ring-primary/50
               focus:border-primary transition-all duration-200
               placeholder:text-gray-400 hover:border-gray-300"
                    placeholder="Enter your password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center
               text-hintText hover:text-primary
               hover:scale-110 transition-all "
                  >
                    {showPassword ? (
                      <FaRegEyeSlash size={18} />
                    ) : (
                      <FaRegEye size={18} />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Secret Key Input */}
              {/*  <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-2"
              >
                <label className="block text-sm font-semibold ">
                  Secret Key
                </label>
                <div className="relative group">
               
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoKeyOutline className="h-5 w-5 text-hintText group-focus-within:text-primary transition-colors" />
                  </div>

                  
                  <input
                    type={showSecretKey ? "text" : "password"}
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    className="w-full pl-10 pr-12 py-3.5 border border-gray-200 rounded-xl
               focus:outline-none focus:ring-2 focus:ring-primary/50
               focus:border-primary transition-all duration-200
               placeholder:text-gray-400 hover:border-gray-300"
                    placeholder="Enter your secret key"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center
               text-hintText hover:text-primary
               hover:scale-110 transition-all"
                  >
                    {showSecretKey ? (
                      <FaRegEyeSlash size={18} />
                    ) : (
                      <FaRegEye Eye size={18} />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Login Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="pt-4"
              >
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-primary to-primary/90 text-white py-3.5 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <ImSpinner2 className="w-5 h-5 animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>Sign In</span>
                      <FaSignInAlt className="w-5 h-5" />
                    </div>
                  )}
                </motion.button>
              </motion.div>

              {/* Forgot Password */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-center"
              >
                <button className="text-sm text-primary hover:text-primary/80 font-medium hover:underline transition-colors">
                  Forgot your password?
                </button>
              </motion.div>
            </form>

            {/* Help Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 pt-6 border-t border-gray-100 text-center"
            >
              <p className="text-sm text-hintText">
                Need help?{" "}
                <button className="text-primary font-semibold hover:underline transition-colors">
                  Contact our support team
                </button>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ delay: 1.2 }}
        className="fixed top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/20 blur-3xl -z-10"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ delay: 1.4 }}
        className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-primary/10 blur-3xl -z-10"
      />
    </div>
  );
};

export default Login;
