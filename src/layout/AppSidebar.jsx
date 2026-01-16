import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { FaRegIdCard, FaUsers } from "react-icons/fa";
import { BsThreeDots, BsBuildings } from "react-icons/bs";
import { FiLogOut } from "react-icons/fi";
import { MdCampaign, MdDevices, MdOutlineHowToReg } from "react-icons/md";
import { PiBuildingApartment } from "react-icons/pi";
import { FaUserShield } from "react-icons/fa6";
import { FiChevronDown } from "react-icons/fi";
import { FaBuildingUser, FaHouse } from "react-icons/fa6";
import { RxDashboard } from "react-icons/rx";

import Logo from "../assets/Images/Logo/logo.png";
import { useSidebar } from "../context/SidebarContext";

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});
  const userRole = localStorage.getItem("role");

  if (!userRole) return null;

  const basePath =
    userRole === "superadmin"
      ? "/superadmin"
      : userRole === "propertymanager"
      ? "/property"
      : userRole === "admin"
      ? "/admin"
      : "";
  const roleDisplayNames = useMemo(
    () => ({
      superadmin: "Super Admin",
      propertymanager: "Property Manager",
      admin: "Admin",
    }),
    []
  );

  const displayRole =
    roleDisplayNames[userRole] || userRole?.toUpperCase() || "User";

  const navItems = [
    {
      icon: <RxDashboard size={20} />,
      name: "Dashboard",
      path: `${basePath}/dashboard`,
      roles: ["superadmin", "admin", "propertymanager"],
    },
    {
      icon: <FaBuildingUser size={20} />,
      name: "Property Manager",
      path: `${basePath}/property-managers`,
      roles: ["superadmin"],
    },
    {
      icon: <FaBuildingUser size={20} />,
      name: "Admin",
      path: `${basePath}/admin`,
      roles: ["propertymanager"],
    },
    {
      icon: <PiBuildingApartment size={22} />,
      name: "Society",
      path: `${basePath}/society`,
      roles: ["superadmin"],
    },
    {
      icon: <BsBuildings size={20} />,
      name: "Buildings",
      path: `${basePath}/buildings`,
      roles: ["superadmin", "admin"],
    },
    {
      icon: <FaUsers size={20} />,
      name: "Users/Tanent",
      path: `${basePath}/users`,
      roles: ["superadmin", "admin"],
    },

    {
      icon: <FaUserShield size={20} />,
      name: "Security",
      path: `${basePath}/security`,
      roles: ["superadmin", "admin"],
    },
    {
      icon: <FaRegIdCard size={20} />,
      name: "Cards",
      path: `${basePath}/cards`,
      roles: ["superadmin", "admin"],
    },
    {
      icon: <MdDevices size={20} />,
      name: "Devices",
      path: `${basePath}/devices`,
      roles: ["superadmin"],
    },
    {
      icon: <MdCampaign size={22} />,
      name: "Broadcast",
      path: `${basePath}/broadcast`,
      roles: ["superadmin", "admin", "propertymanager"],
    },
    {
      icon: <MdOutlineHowToReg size={20} />,
      name: "Visitors Log",
      path: `${basePath}/visitors`,
      roles: ["superadmin", "propertymanager", "admin"],
    },
  ];
  const filteredNavItems = useMemo(() => {
    return navItems.filter((item) => item.roles.includes(userRole));
  }, [userRole]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };
  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu(index);
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null && subMenuRefs.current[openSubmenu]) {
      setSubMenuHeight((prev) => ({
        ...prev,
        [openSubmenu]: subMenuRefs.current[openSubmenu]?.scrollHeight || 0,
      }));
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index) => {
    setOpenSubmenu((prev) => (prev === index ? null : index));
  };

  const renderMenuItems = () => (
    <ul className="flex flex-col gap-1">
      {filteredNavItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index)}
              className={`flex items-center w-full px-3 py-3 rounded-lg transition-all duration-200 group ${
                openSubmenu === index
                  ? "bg-primary/10 text-primary border-l-4 border-primary"
                  : "hover:bg-lightBackground text-gray-700 hover:text-primary"
              } ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`flex items-center justify-center w-6 h-6 ${
                  openSubmenu === index
                    ? "text-primary"
                    : "text-hintText group-hover:text-primary"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <div className="flex items-center justify-between flex-1 ml-3">
                  <span className="text-sm font-medium">{nav.name}</span>
                </div>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <FiChevronDown
                  className={`ml-2 w-4 h-4 transition-transform duration-200 ${
                    openSubmenu === index
                      ? "rotate-180 text-primary"
                      : "text-hintText"
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
                  isActive(nav.path)
                    ? "bg-primary/10 text-primary border-l-4 border-primary"
                    : "hover:bg-lightBackground text-gray-700 hover:text-primary"
                } ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-6 h-6 ${
                    isActive(nav.path)
                      ? "text-primary"
                      : "text-hintText group-hover:text-primary"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <div className="flex items-center justify-between flex-1 ml-3">
                    <span className="text-sm font-medium">{nav.name}</span>
                  </div>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[index] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu === index ? `${subMenuHeight[index]}px` : "0px",
              }}
            >
              <ul className="mt-1 ml-9 space-y-0.5">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                        isActive(subItem.path)
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-lightBackground text-hintText hover:text-primary"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-1.5 h-1.5 rounded-full mr-3 ${
                            isActive(subItem.path)
                              ? "bg-primary"
                              : "bg-hintText"
                          }`}
                        />
                        <span>{subItem.name}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
    ${
      isExpanded || isMobileOpen
        ? "w-[270px]"
        : isHovered
        ? "w-[270px]"
        : "w-[95px]"
    }
    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start pl-1"
        }`}
      >
        <Link to={`${basePath}/dashboard`} className="flex items-center gap-2">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img src={Logo} alt="Logo" className="w-10 h-10" />

              <span className="text-lg font-semibold text-primary whitespace-nowrap">
                {displayRole}
              </span>
            </>
          ) : (
            <img src={Logo} alt="Logo" className="w-10 h-10" />
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start pl-4"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <BsThreeDots className="size-5" />
                )}
              </h2>
              {/* {renderMenuItems(navItems, "main")} */}
              {renderMenuItems()}
            </div>
          </div>
        </nav>
      </div>
      {/* Logout Section */}
      <div
        className={`mt-auto pb-6 ${
          !isExpanded && !isHovered ? "lg:flex lg:justify-center" : "px-3"
        }`}
      >
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-lg transition-all duration-200
               text-reject hover:bg-red-50"
        >
          <span className="flex items-center justify-center w-6 h-6">
            <FiLogOut size={20} />
          </span>

          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="text-sm font-medium whitespace-nowrap">
              Logout
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
