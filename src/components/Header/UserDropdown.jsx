import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { DropdownItem } from "../../ui/dropdown/DropdownItem";
import { Dropdown } from "../../ui/dropdown/Dropdown";
import { useEffect } from "react";
import { FiLogOut, FiSettings } from "react-icons/fi";
import { CiViewList } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { MdOutlineInfo } from "react-icons/md";
import { MdOutlinePrivacyTip } from "react-icons/md";
const DEFAULT_AVATAR =
  "https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-user-profile-avatar-png-image_10211471.png";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("profileImage") || DEFAULT_AVATAR,
  );

  // useEffect(() => {
  //   const handleProfileUpdate = () => {
  //     setRole(localStorage.getItem("role") || "");
  //     setEmail(localStorage.getItem("email") || "");
  //     setProfileImage(
  //       localStorage.getItem("profileImage") ||
  //         "https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-user-profile-avatar-png-image_10211471.png",
  //     );
  //   };

  //   window.addEventListener("profileImageUpdated", handleProfileUpdate);
  //   window.addEventListener("storage", handleProfileUpdate);

  //   return () => {
  //     window.removeEventListener("profileImageUpdated", handleProfileUpdate);
  //     window.removeEventListener("storage", handleProfileUpdate);
  //   };
  // }, []);
  useEffect(() => {
    const handleProfileUpdate = () => {
      const storedRole = localStorage.getItem("role");
      const storedEmail = localStorage.getItem("email");
      const storedImage = localStorage.getItem("profileImage");

      setRole(storedRole || "");
      setEmail(storedEmail || "");
      setProfileImage(storedImage || DEFAULT_AVATAR);
    };

    // Run once on mount
    handleProfileUpdate();

    window.addEventListener("profileImageUpdated", handleProfileUpdate);
    window.addEventListener("storage", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileImageUpdated", handleProfileUpdate);
      window.removeEventListener("storage", handleProfileUpdate);
    };
  }, []);
  if (!role && !email) return null;
  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const closeDropdown = () => setIsOpen(false);
  // const handleLogout = () => {
  //   localStorage.clear();
  //   closeDropdown();
  //   navigate("/login");
  // };
  const handleLogout = () => {
    localStorage.clear();

    window.dispatchEvent(new Event("profileImageUpdated"));

    closeDropdown();
    navigate("/login");
  };
  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center transition-colors duration-200 hover:text-primary"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11 border-2 border-primary/30 hover:border-primary transition-colors duration-200">
          <img
            src={profileImage}
            alt="User"
            onError={(e) => {
              e.target.src = DEFAULT_AVATAR;
            }}
            className="w-full h-full object-cover"
          />
        </span>

        <span className="block mr-1 font-medium text-sm text-black capitalize">
          {email}
        </span>
        <svg
          className={`stroke-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-3 flex w-[280px] flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-lg"
      >
        {/* User info section */}
        <div className="pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
              <img
                src={profileImage}
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="block font-semibold text-gray-900 text-sm capitalize">
                {role}
              </span>
              <span className="block text-xs text-gray-500 mt-0.5">
                {email}
              </span>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <ul className="flex flex-col gap-1 py-3">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/profile"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 hover:bg-lightBackground text-gray-700 hover:text-primary"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <CgProfile size={20} color="gray" />
              </div>
              profile
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/terms"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 hover:bg-lightBackground text-gray-700 hover:text-primary"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <MdOutlinePrivacyTip size={20} color="gray" />
              </div>
              Privacy & Policy
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/terms"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 hover:bg-lightBackground text-gray-700 hover:text-primary"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <CiViewList size={20} color="gray" />
              </div>
              Terms & Condition
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/account-settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 hover:bg-lightBackground text-gray-700 hover:text-primary"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <FiSettings size={18} color="gray" />
              </div>
              Account settings
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/about"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 hover:bg-lightBackground text-gray-700 hover:text-primary"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <MdOutlineInfo size={20} color="gray" />
              </div>
              About Us
            </DropdownItem>
          </li>
        </ul>

        {/* Sign out button */}
        <div className="pt-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5
               text-sm font-medium text-gray-700
               transition-all duration-200
               hover:bg-red-50 hover:text-red-600
               focus:outline-none focus:ring-2 focus:ring-red-200"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full
                 bg-red-50 text-red-500
                 transition-colors duration-200
                 group-hover:bg-red-100"
            >
              <FiLogOut className="text-lg" />
            </span>

            <span className="flex-1 text-left">Sign out</span>
          </button>
        </div>
      </Dropdown>
    </div>
  );
}
