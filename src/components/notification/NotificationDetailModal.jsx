import React, { useState, useEffect } from "react";
import { useNotificationDetails } from "../../Hooks/useNotificationDetails";
import {
  FaFile,
  FaBuilding,
  FaUsers,
  FaHome,
  FaTimes,
  FaDownload,
  FaExternalLinkAlt,
  FaImage,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const NotificationDetailModal = ({ notification, onClose, onNavigate }) => {
  const [fullScreenImage, setFullScreenImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const { societyName, buildingName, flatName, loading } =
    useNotificationDetails(notification);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        if (fullScreenImage) {
          setFullScreenImage(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [fullScreenImage, onClose]);

  const getIconByType = () => {
    switch (notification.type) {
      case "document":
        return <FaFile className="text-primary" size={28} />;
      case "society":
        return <FaUsers className="text-green-500" size={28} />;
      case "building":
        return <FaBuilding className="text-orange-500" size={28} />;
      case "flat":
        return <FaHome className="text-purple-500" size={28} />;
      default:
        return <FaFile className="text-gray-500" size={28} />;
    }
  };

  const getTypeColor = () => {
    switch (notification.type) {
      case "document":
        return "bg-primary text-white";
      case "society":
        return "bg-green-100 text-green-800";
      case "building":
        return "bg-orange-100 text-orange-800";
      case "flat":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setFullScreenImage(true);
  };

  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate(notification);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Check if the document is an image
  const isImageFile = (url) => {
    if (!url) return false;
    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".webp",
      ".svg",
    ];
    return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Main Modal */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-50"
        onClick={handleBackdropClick}
      >
        <div
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with primary color */}
          <div className="bg-primary bg-opacity-10 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                  {getIconByType()}
                </div>
                <div>
                  <h2 className="text-xl font-roboto font-semibold text-gray-800">
                    Notification Details
                  </h2>
                  <p className="text-sm text-hintText">ID: {notification.id}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-lightBackground flex items-center justify-center transition-colors"
              >
                <IoClose size={24} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* Title */}
            <div className="mb-6">
              <label className="text-xs font-roboto font-medium text-hintText uppercase tracking-wider">
                Title
              </label>
              <p className="mt-1 text-xl font-roboto font-semibold text-gray-800">
                {notification.title}
              </p>
            </div>

            {/* Type Chip */}
            {notification.type && (
              <div className="mb-6">
                <label className="text-xs font-roboto font-medium text-hintText uppercase tracking-wider">
                  Type
                </label>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-roboto font-medium ${getTypeColor()}`}
                  >
                    {getIconByType()}
                    {notification.type.charAt(0).toUpperCase() +
                      notification.type.slice(1)}
                  </span>
                </div>
              </div>
            )}

            {/* Message */}
            <div className="mb-6">
              <label className="text-xs font-roboto font-medium text-hintText uppercase tracking-wider">
                Message
              </label>
              <div className="mt-1 p-4 bg-lightBackground rounded-lg border border-gray-200">
                <p className="text-gray-700 font-roboto whitespace-pre-wrap">
                  {notification.body || notification.message}
                </p>
              </div>
            </div>

            {/* Document/Image Section */}
            {notification.document && (
              <div className="mb-6">
                <label className="text-xs font-roboto font-medium text-hintText uppercase tracking-wider">
                  Attachment
                </label>
                {isImageFile(notification.document) ? (
                  <div
                    className="mt-1 relative rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => handleImageClick(notification.document)}
                  >
                    <img
                      src={notification.document}
                      alt="Notification attachment"
                      className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-white text-primary px-3 py-1 rounded-full text-sm font-roboto flex items-center gap-2">
                          <FaImage /> Click to enlarge
                        </span>
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <a
                        href={notification.document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white text-primary p-2 rounded-full shadow-md hover:bg-lightBackground transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FaExternalLinkAlt size={14} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <a
                    href={notification.document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 flex items-center justify-between p-3 bg-lightBackground rounded-lg border border-gray-200 hover:bg-opacity-80 transition-colors group"
                  >
                    <span className="flex items-center gap-2 text-gray-700 font-roboto">
                      <FaFile className="text-primary" />
                      <span className="truncate max-w-[200px] sm:max-w-[300px]">
                        {notification.document.split("/").pop() ||
                          "View Document"}
                      </span>
                    </span>
                    <FaDownload className="text-hintText group-hover:text-primary transition-colors" />
                  </a>
                )}
              </div>
            )}

            {/* Related Information - Now showing names instead of IDs */}
            {(notification.society_id ||
              notification.building_id ||
              notification.flat_id) && (
              <div className="mb-6">
                <label className="text-xs font-roboto font-medium text-hintText uppercase tracking-wider">
                  Related Information
                </label>
                <div className="mt-1 space-y-2">
                  {loading ? (
                    <div className="text-center py-2">
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                    </div>
                  ) : (
                    <>
                      {societyName && (
                        <div className="flex items-center gap-3 p-3 bg-lightBackground rounded-lg border border-gray-200">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <FaUsers className="text-green-600" size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-roboto text-hintText">
                              Society
                            </p>
                            <p className="text-sm font-roboto font-medium text-gray-800">
                              {societyName}
                            </p>
                          </div>
                        </div>
                      )}

                      {buildingName && (
                        <div className="flex items-center gap-3 p-3 bg-lightBackground rounded-lg border border-gray-200">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <FaBuilding className="text-orange-600" size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-roboto text-hintText">
                              Building
                            </p>
                            <p className="text-sm font-roboto font-medium text-gray-800">
                              {buildingName}
                            </p>
                          </div>
                        </div>
                      )}

                      {flatName && (
                        <div className="flex items-center gap-3 p-3 bg-lightBackground rounded-lg border border-gray-200">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <FaHome className="text-purple-600" size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-roboto text-hintText">
                              Flat
                            </p>
                            <p className="text-sm font-roboto font-medium text-gray-800">
                              {flatName}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Timestamp and Status */}
            <div className="flex items-center justify-between p-4 bg-lightBackground rounded-lg">
              <div>
                <p className="text-xs font-roboto text-hintText uppercase tracking-wider">
                  Received
                </p>
                <p className="text-sm font-roboto text-gray-700">
                  {formatDate(notification.created_at)}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-roboto font-medium ${
                  notification.is_read
                    ? "bg-green-100 text-success"
                    : "bg-yellow-100 text-pending"
                }`}
              >
                {notification.is_read ? "Read" : "Unread"}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-roboto font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {(notification.document ||
              notification.society_id ||
              notification.building_id ||
              notification.flat_id) && (
              <button
                onClick={handleNavigate}
                className="px-4 py-2 text-sm font-roboto font-medium text-white bg-primary rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
              >
                {notification.document ? (
                  <>
                    <FaExternalLinkAlt size={14} />
                    Open Document
                  </>
                ) : (
                  "View Details"
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Full Screen Image Viewer */}
      {fullScreenImage && (
        <div
          className="fixed inset-0 z-[110] bg-black bg-opacity-98 flex items-center justify-center p-4"
          onClick={() => setFullScreenImage(false)}
        >
          <button
            onClick={() => setFullScreenImage(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <IoClose size={32} />
          </button>
          <img
            src={selectedImage}
            alt="Full screen preview"
            className="max-w-full max-h-full object-contain animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default NotificationDetailModal;
