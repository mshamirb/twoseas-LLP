// src/pages/ClientDashboard/ClientDashboard.jsx
import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import EmployeeCard from "../EmployeeCard/EmployeeCard";
import CalendarScheduler from "../../components/CalendarScheduler";
import "./ClientDashboard.css";
import Logo from "../../assets/Two Seas Logo.png";

// Icons
import {
  FiUsers,
  FiHeart,
  FiCalendar,
  FiChevronDown,
  FiRefreshCcw,
  FiMenu,
  FiX
} from "react-icons/fi";
import { doc, getDoc, getDocs, addDoc, collection, db, deleteDoc } from "../../firebase";
import { onSnapshot, query, setDoc, where } from "firebase/firestore";
import EmployeeDetail from "../../components/EmployeeDetail/EmployeeDetail";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ClientDashboard() {
  const { theme, changeTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("employees");
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState("employees");
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("clientUser"));
    if (!storedUser || !storedUser.email) return;

    const interviewsRef = collection(db, "scheduledInterviews");
    const q = query(interviewsRef, where("clientUserEmail", "==", storedUser.email));

    // Real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInterviews(data);
      },
      (error) => {
        console.error("Error fetching interviews in real-time:", error);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  // const formatDateTime = (date, time, timeZone) => {
  //   if (!date || !time) return "Not set";
  //   return `${date} at ${time} ${timeZone || ""}`;
  // };
  const formatDateTime = (date, time, timeZone) => {
    if (!date || !time) return "Not set";

    try {
      // Combine date and time
      const [hours, minutes] = time.split(":"); // ignore seconds
      const dateTime = new Date(date);
      dateTime.setHours(parseInt(hours), parseInt(minutes));

      // Format time with AM/PM and remove seconds
      const formattedTime = dateTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: timeZone || "UTC",
      });

      // Return formatted string
      return `${date} at ${formattedTime} ${timeZone || ""}`;
    } catch (err) {
      console.error("Error formatting date/time:", err);
      return `${date} at ${time} ${timeZone || ""}`;
    }
  };


  const [recommendedEmployees, setRecommendedEmployees] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("clientUser"));
    if (!storedUser?.clientId) return;

    const fetchRecommended = async () => {
      try {
        const clientRef = doc(db, "clients", storedUser.clientId);
        const clientSnap = await getDoc(clientRef);

        if (clientSnap.exists()) {
          const data = clientSnap.data();
          setRecommendedEmployees(data.recommendedEmployees || []);
        }
      } catch (error) {
        console.error("Error fetching recommended employees:", error);
      }
    };

    fetchRecommended();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("clientUser");
    localStorage.removeItem("clientUserEmail");
    navigate("/client-login"); // Redirect to client login page
  }

  // Store client info from localStorage
  const [clientUser, setClientUser] = useState({
    clientName: "",
    email: ""
  });

  const [wishlistEmployees, setWishlistEmployees] = useState([]);
  const [wishlistEmployeeIds, setWishlistEmployeeIds] = useState(new Set()); // Track IDs for quick lookup

  // Real-time wishlist listener
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("clientUser"));
    const clientId = storedUser?.clientId;
    if (!clientId) return;

    const wishlistRef = collection(db, "clients", clientId, "wishlist");

    const unsubscribe = onSnapshot(wishlistRef, async (snapshot) => {
      const employeeIds = new Set();
      const employees = [];

      for (const docSnap of snapshot.docs) {
        const employeeId = docSnap.id;
        employeeIds.add(employeeId);

        const employeeRef = doc(db, "employees", employeeId);
        const employeeSnap = await getDoc(employeeRef);
        if (employeeSnap.exists()) {
          employees.push({ id: employeeSnap.id, ...employeeSnap.data() });
        }
      }

      setWishlistEmployees(employees);
      setWishlistEmployeeIds(employeeIds);
    });

    // Add this function to handle menu navigation
    const handleMenuItemChange = (menuItem, employeeId = null) => {
      setActiveMenuItem(menuItem);
      if (employeeId) {
        setSelectedEmployeeId(employeeId);
      }
    };

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch clientUser from localStorage
    const storedUser = JSON.parse(localStorage.getItem("clientUser"));
    if (storedUser) {
      setClientUser({
        clientName: storedUser.clientName || "Unknown Client",
        email: storedUser.email || "No Email"
      });
    }
  }, []);

  const themeOptions = [
    { value: "light", label: "Light", icon: "☀️" },
    // { value: "dark", label: "Dark", icon: "🌙" },
    { value: "candy-green", label: "Candy Green", icon: "🍃" },
    { value: "candy-lightgreen", label: "Candy Light Green", icon: "🌿" },
    { value: "candy-blue", label: "Candy Blue", icon: "💧" },
    { value: "candy-blend", label: "Candy Blend", icon: "🌈" }
  ];

  const getCurrentThemeLabel = () => {
    const currentTheme = themeOptions.find(option => option.value === theme);
    return currentTheme ? `${currentTheme.icon} ${currentTheme.label}` : "Select Theme";
  };

  const handleThemeChange = (themeValue) => {
    changeTheme(themeValue);
    setIsThemeDropdownOpen(false);
  };

  // Add this function to handle employee selection
  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    console.log("Selected employee:", employeeId);
  };

  // Add this function to handle menu item changes
  const handleMenuItemChange = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  // Save employee to wishlist in Firestore
  const handleAddToWishlist = async (employee) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("clientUser"));
      const clientId = storedUser?.clientId;
      if (!clientId) {
        alert("You must be logged in to add to wishlist");
        return;
      }

      const employeeRef = doc(db, "clients", clientId, "wishlist", employee.id);

      await setDoc(employeeRef, {
        createdAt: new Date()
      });

      console.log("✅ Employee added to wishlist:", employee);
      alert(`${employee.name} added to your wishlist!`);
    } catch (error) {
      console.error("❌ Error adding to wishlist:", error);
      alert("Something went wrong while adding to wishlist");
    }
  };

  // Remove employee from wishlist
  const handleRemoveFromWishlist = async (employeeId) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("clientUser"));
      const clientId = storedUser?.clientId;
      if (!clientId) return;

      // Delete from Firestore - the real-time listener will update the state
      const employeeRef = doc(db, "clients", clientId, "wishlist", employeeId);
      await deleteDoc(employeeRef);

      console.log("✅ Removed from wishlist:", employeeId);
    } catch (error) {
      console.error("❌ Error removing from wishlist:", error);
      alert("Failed to remove employee from wishlist");
    }
  };

  return (
    <div className={`client-dashboard theme-${theme}`}>
      {/* ✅ Mobile Header with Hamburger */}
      <div className="mobile-header">
        <button
          className="hamburger-btn"
          onClick={() => setIsSidebarOpen(true)}
        >
          <FiMenu size={22} />
        </button>
        <h2 className="mobile-title">Client Dashboard</h2>
      </div>
      {/* Sidebar */}
      <aside className={`side ${isSidebarOpen ? "open" : ""}`}>
        <button
          className="close-sidebar-btn"
          onClick={() => setIsSidebarOpen(false)}
        >
          <FiX size={22} />
        </button>
        <div className="side-header">
          <div className="logo">
            <a href="/client-dashboard" style={{ display: "inline-block" }}>
              <img
                src={Logo}
                alt="Two Seas Logo"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "contain",
                  cursor: "pointer",
                }}
              />
            </a>
            <h2>Two Seas | Client Portal</h2>
          </div>

          {/* Theme Controls */}
          <div className="theme-controls">
            <div className="theme-dropdown">
              <button
                className="theme-dropdown-toggle"
                onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
              >
                <span>{getCurrentThemeLabel()}</span>
                <FiChevronDown size={16} />
              </button>

              {isThemeDropdownOpen && (
                <div className="theme-dropdown-menu">
                  {themeOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`theme-dropdown-item ${theme === option.value ? 'active' : ''}`}
                      onClick={() => handleThemeChange(option.value)}
                    >
                      <span className="theme-icon">{option.icon}</span>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <nav className="sideNav">
          <ul>
            <li className={activeTab === "employees" ? "active" : ""}>
              <button onClick={() => { setActiveTab("employees"); setIsSidebarOpen(false); setSelectedEmployeeId(null); setActiveMenuItem("employees"); }} >
                <FiUsers size={18} />
                Employees
              </button>
            </li>
            <li className={activeTab === "wishlist" ? "active" : ""}>
              <button onClick={() => { setActiveTab("wishlist"); setIsSidebarOpen(false) }}>
                <FiHeart size={18} />
                Wishlist
              </button>
            </li>
            <li className={activeTab === "recommended" ? "active" : ""}>
              <button onClick={() => { setActiveTab("recommended"); setIsSidebarOpen(false); setSelectedEmployeeId(null); setActiveMenuItem("recommended"); }}>
                <FiUsers size={18} />
                Our Recommendations
              </button>
            </li>
            <li className={activeTab === "schedule" ? "active" : ""}>
              <button onClick={() => { setActiveTab("schedule"); setIsSidebarOpen(false) }}>
                <FiCalendar size={18} />
                My Scheduled Interviews
              </button>
            </li>
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="user-profile">
          <div className="user-avatar">
            <FiUsers size={20} />
          </div>
          <div className="user-info">
            <p className="user-name">{clientUser.clientName}</p>
            <p className="user-role">{clientUser.email}</p>
          </div>
          <div style={{ width: "100%", textAlign: "right" }}>
            <LogOut onClick={() => handleLogout()} style={{ cursor: "pointer" }} />
          </div>
        </div>
      </aside>

      {/* ✅ Overlay (for mobile) */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main */}
      <main className="main">
        <header className={`theme-${theme} dashboard-header`}>
          <h1>
            {activeTab === "employees" && "Available Employees"}
            {activeTab === "wishlist" && "Your Wishlist"}
            {activeTab === "schedule" && "My Scheduled Interviews"}
            {activeTab === "recommended" && "Our Recommended Employees"}
          </h1>
        </header>

        <div className="dashboard-content">
          {activeTab === "employees" && (
            <>
              {activeMenuItem === "employees" && (
                <div className="employees-list">
                  <EmployeeCard
                    archived={false}
                    setSelectedEmployeeId={setSelectedEmployeeId}
                    setActiveMenuItem={handleMenuItemChange}
                    visibilityFilter="client"
                    onAddToWishlist={handleAddToWishlist}
                    isInWishlist={(employeeId) => wishlistEmployeeIds.has(employeeId)}
                  />
                </div>
              )}

              {activeMenuItem === "employee-details" && selectedEmployeeId && (
                <div className="employee-details-section">
                  <EmployeeDetail
                    employeeId={selectedEmployeeId}
                    onBack={() => handleMenuItemChange("employees")}
                    setActiveTab={setActiveTab}   // ✅ add this
                    onAddToWishlist={handleAddToWishlist}
                    isInWishlist={(employeeId) => wishlistEmployeeIds.has(employeeId)}
                  />

                </div>
              )}
            </>
          )}

          {activeTab === "wishlist" && (
            <div className="wishlist-section">
              {wishlistEmployees.length > 0 ? (
                <div className="wishlist-grid">
                  {wishlistEmployees.map((employee) => (
                    <EmployeeCard
                      key={employee.id}
                      employee={employee}
                      archived={false}
                      setSelectedEmployeeId={setSelectedEmployeeId}
                      setActiveMenuItem={handleMenuItemChange}
                      visibilityFilter="client"
                      onRemoveFromWishlist={() => handleRemoveFromWishlist(employee.id)}
                      showRemoveButton={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FiHeart size={48} />
                  <h3>Your wishlist is empty</h3>
                  <p>Start adding employees to your wishlist to keep track of favorites</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "schedule" && (
            // <div className="scheduler-section">
            //   <CalendarScheduler />
            // </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    <th style={{ padding: "16px", fontWeight: "600", borderBottom: "1px solid #e5e7eb" }}>
                      Client
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", borderBottom: "1px solid #e5e7eb" }}>
                      Employee
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", borderBottom: "1px solid #e5e7eb" }}>
                      Primary Date & Time
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", borderBottom: "1px solid #e5e7eb" }}>
                      Secondary Date & Time
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", borderBottom: "1px solid #e5e7eb" }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {interviews.map((interview) => (
                    <tr
                      key={interview.id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#f8fafc";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                      }}
                    >
                      <td style={{ padding: "16px" }}>
                        <div>
                          <div style={{ fontWeight: "600", color: "#374151", fontSize: "14px" }}>
                            {interview.clientName}
                          </div>
                          <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
                            {interview.clientUserEmail}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <div>
                          <div style={{ fontWeight: "500", color: "#374151", fontSize: "14px" }}>
                            {interview.employeeName}
                          </div>
                          <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
                            {interview.employeeEmail}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#374151" }}>
                        {formatDateTime(interview.primaryDate, interview.primaryTime, interview.primaryTimeZone)}
                      </td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#374151" }}>
                        {interview.alternateDate ?
                          formatDateTime(interview.alternateDate, interview.alternateTime, interview.alternateTimeZone) :
                          <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Not provided</span>
                        }
                      </td>
                      <td style={{ padding: "16px", fontSize: "14px", fontWeight: "500" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "8px",
                            backgroundColor:
                              interview.status === "confirmed"
                                ? "#dcfce7" // light green
                                : "#fef9c3", // light yellow for 'In Process'
                            color:
                              interview.status === "confirmed"
                                ? "#166534" // dark green text
                                : "#854d0e", // brownish text for 'In Process'
                            textTransform: "capitalize",
                            fontStyle: "normal",
                            fontWeight: "600",
                            border: "1px solid rgba(0, 0, 0, 0.05)",
                            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          {interview.status || "In Process"}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* {activeTab === "recommended" && (
            <div className="recommended-section" style={{ padding: "24px" }}>
              {recommendedEmployees.length > 0 ? (
                <EmployeeCard
                  archived={false}
                  visibilityFilter="client"
                  currentClientId={clientUser.clientId}
                  setActiveMenuItem={setActiveMenuItem}
                  setSelectedEmployeeId={setSelectedEmployeeId}
                  recommendedIds={recommendedEmployees.map(emp => emp.id)} // 👈 pass recommended list
                  onAddToWishlist={handleAddToWishlist}
                  isInWishlist={(employeeId) => wishlistEmployeeIds.has(employeeId)}
                />
              ) : (
                <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
                  No recommended employees found.
                </div>
              )}
            </div>
          )} */}

          {activeTab === "recommended" && (
  <>
    {activeMenuItem !== "employee-details" && (
      <div className="recommended-section" style={{ padding: "24px" }}>
        {recommendedEmployees.length > 0 ? (
          <EmployeeCard
            archived={false}
            visibilityFilter="client"
            currentClientId={clientUser.clientId}
            setActiveMenuItem={setActiveMenuItem}
            setSelectedEmployeeId={setSelectedEmployeeId}
            recommendedIds={recommendedEmployees.map(emp => emp.id)}
            onAddToWishlist={handleAddToWishlist}
            isInWishlist={(employeeId) => wishlistEmployeeIds.has(employeeId)}
          />
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#9ca3af",
            }}
          >
            No recommended employees found.
          </div>
        )}
      </div>
    )}

    {activeMenuItem === "employee-details" && selectedEmployeeId && (
      <div className="employee-details-section">
        <EmployeeDetail
          employeeId={selectedEmployeeId}
          onBack={() => setActiveMenuItem("recommended")}
          setActiveTab={setActiveTab}
          onAddToWishlist={handleAddToWishlist}
          isInWishlist={(employeeId) => wishlistEmployeeIds.has(employeeId)}
        />
      </div>
    )}
  </>
)}



        </div>

      </main>
    </div>
  );
}