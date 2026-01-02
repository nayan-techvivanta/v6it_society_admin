// import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router";
// import { FaRegIdCard } from "react-icons/fa";
// import { BsThreeDots, BsBuildings } from "react-icons/bs";
// import { FiLogOut } from "react-icons/fi";
// import { MdDevices } from "react-icons/md";

// import {
//   FiHome,
//   FiBook,
//   FiUsers,
//   FiCreditCard,
//   FiChevronDown,
//   FiBookOpen,
// } from "react-icons/fi";
// import { FaBuildingUser } from "react-icons/fa6";
// import { RxDashboard } from "react-icons/rx";

// import Logo from "../assets/Images/Logo/logo.png";
// import { useSidebar } from "../context/SidebarContext";

// const navItems = [
//   {
//     icon: <RxDashboard size={20} />,
//     name: "Dashboard",
//     path: "/superadmin/dashboard",
//     roles: ["superadmin", "admin", "propertymanager"],
//   },
//   {
//     icon: <FaBuildingUser size={20} />,
//     name: "Property Manager",
//     path: "/superadmin/property-managers",
//     roles: ["superadmin", "admin"],
//   },
//   {
//     icon: <BsBuildings size={20} />,
//     name: "Buildings",
//     path: "/superadmin/buildings",
//     roles: ["superadmin", "admin", "propertymanager"],
//   },
//   {
//     icon: <FaRegIdCard size={20} />,
//     name: "Cards",
//     path: "/superadmin/cards",
//     roles: ["superadmin", "admin"],
//   },
//   {
//     icon: <MdDevices size={20} />,
//     name: "Devices",
//     path: "/superadmin/devices",
//     roles: ["superadmin"],
//   },
// ];

// const AppSidebar = () => {
//   const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [openSubmenu, setOpenSubmenu] = useState(null);
//   const [subMenuHeight, setSubMenuHeight] = useState({});
//   const subMenuRefs = useRef({});
//   const userRole = localStorage.getItem("role");

//   const filteredNavItems = useMemo(() => {
//     return navItems.filter((item) => item.roles.includes(userRole));
//   }, [userRole]);
//   const handleLogout = () => {
//     localStorage.clear();
//     navigate("/login", { replace: true });
//   };
//   const isActive = useCallback(
//     (path) => location.pathname === path,
//     [location.pathname]
//   );

//   useEffect(() => {
//     let submenuMatched = false;
//     navItems.forEach((nav, index) => {
//       if (nav.subItems) {
//         nav.subItems.forEach((subItem) => {
//           if (isActive(subItem.path)) {
//             setOpenSubmenu(index);
//             submenuMatched = true;
//           }
//         });
//       }
//     });

//     if (!submenuMatched) {
//       setOpenSubmenu(null);
//     }
//   }, [location, isActive]);

//   // useEffect(() => {
//   //   if (openSubmenu !== null) {
//   //     const key = openSubmenu;
//   //     if (subMenuRefs.current[key]) {
//   //       setSubMenuHeight((prevHeights) => ({
//   //         ...prevHeights,
//   //         [key]: subMenuRefs.current[key]?.scrollHeight || 0,
//   //       }));
//   //     }
//   //   }
//   // }, [openSubmenu]);
//   useEffect(() => {
//     if (openSubmenu !== null && subMenuRefs.current[openSubmenu]) {
//       setSubMenuHeight((prev) => ({
//         ...prev,
//         [openSubmenu]: subMenuRefs.current[openSubmenu]?.scrollHeight || 0,
//       }));
//     }
//   }, [openSubmenu]);

//   // const handleSubmenuToggle = (index) => {
//   //   setOpenSubmenu((prevOpenSubmenu) => {
//   //     if (prevOpenSubmenu === index) {
//   //       return null;
//   //     }
//   //     return index;
//   //   });
//   // };
//   const handleSubmenuToggle = (index) => {
//     setOpenSubmenu((prev) => (prev === index ? null : index));
//   };

//   const renderMenuItems = () => (
//     <ul className="flex flex-col gap-1">
//       {filteredNavItems.map((nav, index) => (
//         <li key={nav.name}>
//           {nav.subItems ? (
//             <button
//               onClick={() => handleSubmenuToggle(index)}
//               className={`flex items-center w-full px-3 py-3 rounded-lg transition-all duration-200 group ${
//                 openSubmenu === index
//                   ? "bg-primary/10 text-primary border-l-4 border-primary"
//                   : "hover:bg-lightBackground text-gray-700 hover:text-primary"
//               } ${
//                 !isExpanded && !isHovered
//                   ? "lg:justify-center"
//                   : "lg:justify-start"
//               }`}
//             >
//               <span
//                 className={`flex items-center justify-center w-6 h-6 ${
//                   openSubmenu === index
//                     ? "text-primary"
//                     : "text-hintText group-hover:text-primary"
//                 }`}
//               >
//                 {nav.icon}
//               </span>
//               {(isExpanded || isHovered || isMobileOpen) && (
//                 <div className="flex items-center justify-between flex-1 ml-3">
//                   <span className="text-sm font-medium">{nav.name}</span>
//                 </div>
//               )}
//               {(isExpanded || isHovered || isMobileOpen) && (
//                 <FiChevronDown
//                   className={`ml-2 w-4 h-4 transition-transform duration-200 ${
//                     openSubmenu === index
//                       ? "rotate-180 text-primary"
//                       : "text-hintText"
//                   }`}
//                 />
//               )}
//             </button>
//           ) : (
//             nav.path && (
//               <Link
//                 to={nav.path}
//                 className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
//                   isActive(nav.path)
//                     ? "bg-primary/10 text-primary border-l-4 border-primary"
//                     : "hover:bg-lightBackground text-gray-700 hover:text-primary"
//                 } ${
//                   !isExpanded && !isHovered
//                     ? "lg:justify-center"
//                     : "lg:justify-start"
//                 }`}
//               >
//                 <span
//                   className={`flex items-center justify-center w-6 h-6 ${
//                     isActive(nav.path)
//                       ? "text-primary"
//                       : "text-hintText group-hover:text-primary"
//                   }`}
//                 >
//                   {nav.icon}
//                 </span>
//                 {(isExpanded || isHovered || isMobileOpen) && (
//                   <div className="flex items-center justify-between flex-1 ml-3">
//                     <span className="text-sm font-medium">{nav.name}</span>
//                   </div>
//                 )}
//               </Link>
//             )
//           )}
//           {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
//             <div
//               ref={(el) => {
//                 subMenuRefs.current[index] = el;
//               }}
//               className="overflow-hidden transition-all duration-300"
//               style={{
//                 height:
//                   openSubmenu === index ? `${subMenuHeight[index]}px` : "0px",
//               }}
//             >
//               <ul className="mt-1 ml-9 space-y-0.5">
//                 {nav.subItems.map((subItem) => (
//                   <li key={subItem.name}>
//                     <Link
//                       to={subItem.path}
//                       className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
//                         isActive(subItem.path)
//                           ? "bg-primary/10 text-primary"
//                           : "hover:bg-lightBackground text-hintText hover:text-primary"
//                       }`}
//                     >
//                       <div className="flex items-center">
//                         <div
//                           className={`w-1.5 h-1.5 rounded-full mr-3 ${
//                             isActive(subItem.path)
//                               ? "bg-primary"
//                               : "bg-hintText"
//                           }`}
//                         />
//                         <span>{subItem.name}</span>
//                       </div>
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </li>
//       ))}
//     </ul>
//   );

//   return (
//     <aside
//       className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
//     ${
//       isExpanded || isMobileOpen
//         ? "w-[270px]"
//         : isHovered
//         ? "w-[270px]"
//         : "w-[95px]"
//     }
//     ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
//     lg:translate-x-0`}
//       onMouseEnter={() => !isExpanded && setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <div
//         className={`py-8 flex ${
//           !isExpanded && !isHovered ? "lg:justify-center" : "justify-start pl-1"
//         }`}
//       >
//         <Link to="/dashboard" className="flex items-center gap-2">
//           {isExpanded || isHovered || isMobileOpen ? (
//             <>
//               <img src={Logo} alt="Logo" className="w-10 h-10" />

//               <span className="text-lg font-semibold text-primary whitespace-nowrap">
//                 Super Admin
//               </span>
//             </>
//           ) : (
//             <img src={Logo} alt="Logo" className="w-10 h-10" />
//           )}
//         </Link>
//       </div>

//       <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
//         <nav className="mb-6">
//           <div className="flex flex-col gap-4">
//             <div>
//               <h2
//                 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
//                   !isExpanded && !isHovered
//                     ? "lg:justify-center"
//                     : "justify-start pl-4"
//                 }`}
//               >
//                 {isExpanded || isHovered || isMobileOpen ? (
//                   "Menu"
//                 ) : (
//                   <BsThreeDots className="size-5" />
//                 )}
//               </h2>
//               {renderMenuItems(navItems, "main")}
//             </div>
//           </div>
//         </nav>
//       </div>
//       {/* Logout Section */}
//       <div
//         className={`mt-auto pb-6 ${
//           !isExpanded && !isHovered ? "lg:flex lg:justify-center" : "px-3"
//         }`}
//       >
//         <button
//           onClick={handleLogout}
//           className="flex items-center gap-3 w-full px-3 py-3 rounded-lg transition-all duration-200
//                text-reject hover:bg-red-50"
//         >
//           <span className="flex items-center justify-center w-6 h-6">
//             <FiLogOut size={20} />
//           </span>

//           {(isExpanded || isHovered || isMobileOpen) && (
//             <span className="text-sm font-medium whitespace-nowrap">
//               Logout
//             </span>
//           )}
//         </button>
//       </div>
//     </aside>
//   );
// };

// export default AppSidebar;
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* 🔴 FIX: use react-router-dom instead of react-router */
import { Link, useLocation, useNavigate } from "react-router-dom";

import { FaRegIdCard } from "react-icons/fa";
import { BsThreeDots, BsBuildings } from "react-icons/bs";
import { FiLogOut, FiChevronDown } from "react-icons/fi";
import { MdDevices } from "react-icons/md";
import { FaBuildingUser } from "react-icons/fa6";
import { RxDashboard } from "react-icons/rx";

import Logo from "../assets/Images/Logo/logo.png";
import { useSidebar } from "../context/SidebarContext";

/* ================= NAV ITEMS ================= */
const navItems = [
  {
    icon: <RxDashboard size={20} />,
    name: "Dashboard",
    path: "/superadmin/dashboard",
    roles: ["superadmin", "admin", "propertymanager"],
  },
  {
    icon: <FaBuildingUser size={20} />,
    name: "Property Manager",
    path: "/superadmin/property-managers",
    roles: ["superadmin", "admin"],
  },
  {
    icon: <BsBuildings size={20} />,
    name: "Buildings",
    path: "/superadmin/buildings",
    roles: ["superadmin", "admin", "propertymanager"],
  },
  {
    icon: <FaRegIdCard size={20} />,
    name: "Cards",
    path: "/superadmin/cards",
    roles: ["superadmin", "admin"],
  },
  {
    icon: <MdDevices size={20} />,
    name: "Devices",
    path: "/superadmin/devices",
    roles: ["superadmin"],
  },
];

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});

  /* 🔴 FIX: normalize role to lowercase */
  const userRole = localStorage.getItem("role")?.toLowerCase();

  /* 🔴 FIX: use filteredNavItems everywhere */
  const filteredNavItems = useMemo(() => {
    return navItems.filter((item) => item.roles.includes(userRole));
  }, [userRole]);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  /* ================= ACTIVE ROUTE ================= */
  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );

  /* ================= SUBMENU AUTO OPEN ================= */
  useEffect(() => {
    let submenuMatched = false;

    filteredNavItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu(index);
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) setOpenSubmenu(null);
  }, [location, isActive, filteredNavItems]);

  /* ================= SUBMENU HEIGHT ================= */
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

  /* ================= RENDER MENU ================= */
  const renderMenuItems = () => (
    <ul className="flex flex-col gap-1">
      {filteredNavItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index)}
              className={`flex items-center w-full px-3 py-3 rounded-lg transition-all
              ${
                openSubmenu === index
                  ? "bg-primary/10 text-primary border-l-4 border-primary"
                  : "hover:bg-lightBackground text-gray-700 hover:text-primary"
              }`}
            >
              {nav.icon}
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="ml-3 text-sm font-medium">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <FiChevronDown
                  className={`ml-auto transition-transform ${
                    openSubmenu === index ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>
          ) : (
            <Link
              to={nav.path}
              className={`flex items-center px-3 py-3 rounded-lg transition-all
              ${
                isActive(nav.path)
                  ? "bg-primary/10 text-primary border-l-4 border-primary"
                  : "hover:bg-lightBackground text-gray-700 hover:text-primary"
              }`}
            >
              {nav.icon}
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="ml-3 text-sm font-medium">{nav.name}</span>
              )}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed top-0 left-0 mt-16 lg:mt-0 z-50 h-screen bg-white border-r
      transition-all duration-300
      ${isExpanded || isHovered || isMobileOpen ? "w-[270px]" : "w-[95px]"}
      ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ================= LOGO ================= */}
      <div className="py-8 flex justify-center">
        {/* 🔴 FIX: correct dashboard path */}
        <Link to="/superadmin/dashboard" className="flex items-center gap-2">
          <img src={Logo} alt="Logo" className="w-10 h-10" />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="text-lg font-semibold text-primary">
              Super Admin
            </span>
          )}
        </Link>
      </div>

      {/* ================= MENU ================= */}
      <nav className="px-4 overflow-y-auto">
        <h2 className="mb-4 text-xs uppercase text-gray-400 flex justify-center">
          {isExpanded || isHovered ? "Menu" : <BsThreeDots />}
        </h2>
        {renderMenuItems()}
      </nav>

      {/* ================= LOGOUT ================= */}
      <div className="mt-auto px-4 pb-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-lg
          text-red-500 hover:bg-red-50 transition"
        >
          <FiLogOut size={20} />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="text-sm font-medium">Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
