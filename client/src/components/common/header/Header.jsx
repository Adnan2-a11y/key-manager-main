import { Link, useNavigate } from "react-router-dom";
import "../../../assets/css/header.css";
import AccountMenu from "./AccountMenu";
import UserEl from "./UserEl";
import GuestEL from "./GuestEL";
import { logout } from "../../../services/authServices";
import Logo from "./Logo";
import { useState, useEffect } from "react";
import axios from "axios";

import { useStore } from "../../../store/store";
import API_CONFIG from "../../constant/apiConstants";

const BASE_URL = API_CONFIG.API_ENDPOINT;

function Header() {
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState(
    `${BASE_URL}/api/uploads/logo/logo.png`
  );

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = axios.get(`${BASE_URL}/api/uploads/logo/logo.png`);

        if (response.status === 200) {
          setLogoUrl(response.config.url);
        }
      } catch (error) {
        console.error("Error fetching logo:", error);
      }
    };
    fetchLogo();
  }, []);

  const {
    isSidebarCollapsed,
    toggleSidebarCollapsed,
    isLoggedIn,
    setIsLoggedIn,
    user,
    setUser,
    isAccountMenuOpen,
    setIsAccountMenuOpen,
  } = useStore();

  const handleSidebarClick = () => {
    toggleSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setIsLoggedIn(false);
      setIsAccountMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className={`header-area desktop`}>
      <div className="header-area-inner container-fluid">
        <div className="row d-flex align-items-center">
          <Logo onSidebarClick={handleSidebarClick} logoUrl={logoUrl} />
          <div className="col-md-6 d-flex justify-content-center align-items-center justify-content-md-end">
            {isLoggedIn && user && (
              <UserEl
                setIsAccountMenuOpen={setIsAccountMenuOpen}
                isAccountMenuOpen={isAccountMenuOpen}
                user={user}
              />
            )}

            {!isLoggedIn && <GuestEL />}

            {isAccountMenuOpen && (
              <AccountMenu
                isAccountMenuOpen={isAccountMenuOpen}
                user={user}
                setIsAccountMenuOpen={setIsAccountMenuOpen}
                onLogout={handleLogout}
              />
            )}
          </div>
        </div>
      </div>

      <div className="menu-wrap">
        <div className="full-wrap container-fluid">
          <ul className="main-menu">
            <li>
              <Link to="/">Dashboard</Link>
            </li>
            <li>
              <Link to="/product/all">Products</Link>
            </li>
            <li>
              <Link to="/serial-numbers">Serial Keys</Link>
            </li>
            <li>
              <Link to="/orders/all">Orders</Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}

export default Header;
