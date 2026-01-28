import React from 'react';
import { FaHome, FaShieldAlt, FaUserFriends, FaBell } from 'react-icons/fa';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white font-roboto text-black">
      {/* Hero Section */}
      <section className="bg-primary text-white py-24">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">About Us</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            Empowering modern residential societies with seamless, secure, and efficient management solutions.
          </p>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-20 bg-lightBackground">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <h2 className="text-4xl font-bold text-primary mb-8">
            Transforming Society Management
          </h2>
          <p className="text-lg leading-relaxed text-black opacity-80">
            Our society management platform is designed to simplify daily operations for residents, administrators, and security teams. 
            From resident services to emergency response, we provide a comprehensive, user-friendly system that enhances safety, 
            communication, and convenience in residential communities.
          </p>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-primary text-center mb-16">
            Core Management Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Resident Management */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center">
                <FaHome className="text-4xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Resident Management</h3>
              <p className="text-hintText leading-relaxed">
                Streamline resident profiles, maintenance requests, amenity bookings, notices, and community communication.
              </p>
            </div>

            {/* Security Management */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center">
                <FaShieldAlt className="text-4xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Security Management</h3>
              <p className="text-hintText leading-relaxed">
                Real-time guard tracking, patrol management, incident reporting, and access control for maximum safety.
              </p>
            </div>

            {/* Visitor Management */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center">
                <FaUserFriends className="text-4xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Visitor Management</h3>
              <p className="text-hintText leading-relaxed">
                Digital visitor registration, pre-approval, QR-based entry, and complete visit logs for enhanced security.
              </p>
            </div>

            {/* Emergency Management */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center">
                <FaBell className="text-4xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Emergency Management</h3>
              <p className="text-hintText leading-relaxed">
                Instant alerts, emergency contact integration, evacuation protocols, and rapid response coordination.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing Section */}
      <section className="bg-primary text-white py-20">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <h2 className="text-4xl font-bold mb-8">Committed to Safer, Smarter Communities</h2>
          <p className="text-xl opacity-90 leading-relaxed">
            We believe every residential society deserves modern tools that make management effortless and living secure. 
            Our platform is built with residents and administrators in mind — reliable, intuitive, and always evolving.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;