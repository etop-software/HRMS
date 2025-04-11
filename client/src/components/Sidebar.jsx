import {
  MoreVertical,
  ChevronLast,
  ChevronFirst,
  LayoutDashboard,
  SettingsIcon,
  LogOutIcon,
  Users,
  CalendarPlus,
  TreePalm,
  NotebookText,
  LandPlot,
  CopyPlus,
  PcCase,
  ChevronDown,
  ChevronRight,
  RefreshCcw,
  Building2,
  Utensils
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, createContext, useState, useEffect } from "react";
import { useDispatch } from 'react-redux';
import { logoutUser } from '../redux/slices/userSlice';
import { useSelector } from 'react-redux';

const SidebarContext = createContext();

export default function Sidebar() {
  const username = useSelector((state) => state.user.username);
  const storedUser = localStorage.getItem('userName');
  const storedUserType = localStorage.getItem('userType');
  
  // Check if the token exists
  const token = localStorage.getItem('token');
  
  // If no token, redirect to login page
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!token) {
      navigate('/login'); // Redirect to login page if no token exists
    }
  }, [token, navigate]);

  // Only attempt to access privileges if the token exists
  const storedPrivileges = token ? JSON.parse(localStorage.getItem('privileges')) || {} : {};

  // Destructure privileges with fallback values
  const { 
    organization = false, 
    departments = false,
    designations = false,
    employees = false,
    company = false,
    shifts = false, 
    deviceArea = false, 
    reports = false, 
    processing = false, 
    manualPunch = false, 
    users = false 
  } = storedPrivileges;

  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(true);

  const handleLogout = () => {
    const isConfirmed = confirm('Are you sure you want to logout?');
    
    if (isConfirmed) {
      dispatch(logoutUser());
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userId');
      localStorage.removeItem('userType');
      localStorage.removeItem('privileges');
      navigate('/login'); // Redirect to the login page
    }
  };

  return (
    <SidebarContext.Provider value={{ expanded }}>
      <aside className="h-screen w-[250px]">
        <nav
          className={`h-full flex flex-col bg-white border-r shadow-lg transition-all duration-300 ${
            expanded ? "w-[250px]" : "w-[80px]"
          }`}
        >
          <div className="p-4 pb-2 flex justify-between items-center border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <Link to="/dashboard" className="flex items-center">
              <img
                src="https://etopme.ae/wp-content/uploads/2024/08/eTOP-Trading.png"
                className={`transition-all ${expanded ? "w-24" : "w-0"}`}
                alt="Logo"
              />
            </Link>
            <button
              onClick={() => setExpanded((curr) => !curr)}
              className="p-2 rounded-lg hover:bg-blue-100 transition-colors"
            >
              {expanded ? (
                <ChevronFirst size={20} />
              ) : (
                <ChevronLast size={20} />
              )}
            </button>
          </div>

          <ul className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <SidebarItem
              icon={<LayoutDashboard size={20} />}
              text="Dashboard"
              to="/dashboard"
            />
            {deviceArea && (
              <>
                <SidebarItem icon={<LandPlot size={20} />} text="Areas" to="/areas" />
                <SidebarItem icon={<PcCase size={20} />} text="Devices" to="/devices" />
              </>
            )}

            {(departments || designations || employees || company) && (
              <SidebarItem
                icon={<Building2 size={20} />}
                text="Organization"
                subItems={[
                  departments && { text: "Departments", to: "/departments" },
                  designations && { text: "Designations", to: "/designations" },
                  employees && { text: "Employees", to: "/employees" },
                  company && { text: "Company", to: "/company" }
                ].filter(Boolean)}
              />
            )}

            {shifts && (
              <>
                <SidebarItem
                  icon={<CalendarPlus size={20} />}
                  text="Shifts"
                  to="/shifts"
                  subItems={[{ text: "Assign Shifts", to: "/EmployeeShifts" }]}
                />
                <SidebarItem
                  icon={<TreePalm size={20} />}
                  text="Leaves"
                  to="/leaves"
                  subItems={[{ text: "Assign Leaves", to: "/EmployeeLeave" }]}
                />
              </>
            )}

            {reports && (
              <SidebarItem
                icon={<NotebookText size={20} />}
                text="Reports"
                to="/reports"
              />
            )}

            {users && (
              <SidebarItem 
                icon={<Users size={20} />} 
                text="Users" 
                to="/users" 
              />
            )}

            {manualPunch && (
              <SidebarItem
                icon={<CopyPlus size={20} />}
                text="Manual Punch"
                to="/manualpunch"
              />
            )}

            {processing && (
              <SidebarItem
                icon={<RefreshCcw size={20} />}
                text="Process Logs"
                to="/process"
              />
            )}
          </ul>

          <div className="border-t bg-gradient-to-r from-gray-50 to-blue-50 p-4">
            <div className="flex items-center gap-4">
              <img
                src={`https://ui-avatars.com/api/?background=c7d2fe&color=3730a3&bold=true&name=${storedUser}`}
                alt="User Avatar"
                className="w-10 h-10 rounded-lg shadow-sm"
              />
              <div
                className={`flex-1 overflow-hidden transition-all ${
                  expanded ? "w-40" : "w-0"
                }`}
              >
                <h4 className="font-semibold text-gray-800 truncate">{storedUser}</h4>
              </div>
              {expanded && (
                <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors" onClick={handleLogout}>
                  <LogOutIcon size={18} className="text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </nav>
      </aside>
    </SidebarContext.Provider>
  );
}

function SidebarItem({ icon, text, to, subItems }) {
  const { pathname } = useLocation();
  const { expanded } = useContext(SidebarContext);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  const isMainItemActive = pathname === to;
  const isSubItemActive = (subItemTo) => pathname === subItemTo;
  const isActive =
    isMainItemActive ||
    (subItems && subItems.some((item) => item.to === pathname));

  return (
    <>
      <li
        className={`relative flex items-center py-2.5 px-3 my-1 font-medium rounded-lg cursor-pointer transition-all duration-200
          ${
            isActive
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
              : "hover:bg-blue-50 text-gray-600"
          }`}
        onClick={() => subItems && setIsSubMenuOpen(!isSubMenuOpen)}
      >
        <Link to={to} className="flex items-center w-full">
          <span className={`${isActive ? "text-white" : "text-gray-500"}`}>
            {icon}
          </span>
          <span
            className={`overflow-hidden transition-all ${
              expanded ? "w-40 ml-3" : "w-0"
            }`}
          >
            {text}
          </span>
        </Link>
        {subItems && expanded && (
          <span className="ml-auto">
            {isSubMenuOpen ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </span>
        )}
      </li>

      {isSubMenuOpen && expanded && subItems && (
        <ul className="pl-10 mt-2">
          {subItems.map((subItem) => (
            <li key={subItem.to}>
              <Link
                to={subItem.to}
                className={`flex items-center py-2 px-3 rounded-md text-sm transition-colors
                  ${
                    isSubItemActive(subItem.to)
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                  }`}
              >
                {subItem.text}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
