import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../../../context/AuthContext";
import { useAuth } from "../../../features/auth/useAuth";
import { getNavItemsByRole } from "../../constants/navItems";

const Topbar = () => {
    const { user } = useAuthContext();
    const { handleLogout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = getNavItemsByRole(user?.role);

    return (
        <div className="topbar-wrapper">
            <header className="topbar-main">
                <div className="topbar-left">
                    {/* Mobile Menu Toggle */}
                    <button 
                        className="topbar-mobile-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
                    </button>

                    {/* Brand */}
                    <div className="topbar-brand" onClick={() => navigate("/")}>
                        <i className="fa-solid fa-heart-pulse mr-2 text-hospital-green"></i>
                        <span>OT<span className="brand-sync">Sync</span></span>
                        <span className="brand-beta">Beta</span>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="topbar-nav">
                        {navItems.map((item) => (
                            <button
                                key={item.path}
                                className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
                                onClick={() => navigate(item.path)}
                            >
                                <i className={`${item.icon} mr-1`}></i>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="topbar-right">
                    {/* Search Bar - Hidden on Mobile naturally via CSS */}
                    {/* <div className="search-container">
                        <i className="fa-solid fa-magnifying-glass search-icon"></i>
                        <input
                            type="text"
                            placeholder="Quick search..."
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div> */}

                    {/* Notifications */}
                    <button className="notif-btn">
                        <i className="fa-regular fa-bell"></i>
                        <span className="notif-dot"></span>
                    </button>

                    {/* User Profile & Dropdown */}
                    <div className="user-profile-container" style={{ position: 'relative' }}>
                        <button 
                            className="user-profile" 
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            <div className="user-avatar">
                                {user?.email?.charAt(0) || user?.role?.charAt(0) || "U"}
                            </div>
                            <div className="user-meta desktop-only">
                                <p className="user-name">{user?.role?.replace("_", " ")}</p>
                                <p className="user-status">Online</p>
                            </div>
                            <i className={`fa-solid fa-chevron-down ml-2 text-xs transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} style={{ marginLeft: '0.5rem', fontSize: '0.75rem', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}></i>
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <div className="user-dropdown">
                                <div className="dropdown-header">
                                    <p className="dropdown-email">{user?.email}</p>
                                    <p className="dropdown-role">{user?.role?.replace("_", " ")}</p>
                                </div>
                                <div className="dropdown-divider"></div>
                                <button className="dropdown-item">
                                    <i className="fa-regular fa-user mr-2"></i> My Profile
                                </button>
                                <button className="dropdown-item">
                                    <i className="fa-solid fa-gear mr-2"></i> Settings
                                </button>
                                <div className="dropdown-divider"></div>
                                <button className="dropdown-item logout-item" onClick={handleLogout}>
                                    <i className="fa-solid fa-arrow-right-from-bracket mr-2"></i> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Sidebar/Drawer */}
            <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-nav-header">
                    <div className="topbar-brand">
                        <i className="fa-solid fa-heart-pulse mr-2 text-hospital-green"></i>
                        <span>OT<span className="brand-sync">Sync</span></span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="close-mobile-btn">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div className="mobile-nav-items">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            className={`mobile-nav-link ${location.pathname === item.path ? "active" : ""}`}
                            onClick={() => {
                                navigate(item.path);
                                setMobileMenuOpen(false);
                            }}
                        >
                            <i className={`${item.icon} mr-3`}></i>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
                <div className="mobile-nav-footer">
                   <button className="dropdown-item logout-item" onClick={handleLogout}>
                        <i className="fa-solid fa-arrow-right-from-bracket mr-2"></i> Logout
                    </button>
                </div>
            </div>

            {/* Backdrop for Mobile Menu */}
            {mobileMenuOpen && (
                <div 
                    className="mobile-nav-backdrop"
                    onClick={() => setMobileMenuOpen(false)}
                ></div>
            )}
            
            {/* Overlay to close profile dropdown */}
            {dropdownOpen && (
                <div 
                    style={{ position: 'fixed', inset: 0, zIndex: 10 }} 
                    onClick={() => setDropdownOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default Topbar;