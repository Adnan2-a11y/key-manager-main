/* eslint-disable react/prop-types */
import { Link, useNavigate } from "react-router-dom";
import { IoClose, IoHomeOutline } from "react-icons/io5";
import { LuLogOut } from "react-icons/lu";
import AccountMenuItem from "./AccountMenuItem";
import { useStore } from "../../../store/store";
import { logout } from "../../../services/authServices";

function AccountMenu({
  isAccountMenuOpen,
  setIsAccountMenuOpen,
  user,
  onLogout,
}) {
  const handleMenuClick = () => {
    setIsAccountMenuOpen(false);
  };

  const navigate = useNavigate();
  const {
      setIsLoggedIn,
      setUser,
    } = useStore();

  const handleAllLogout = async() => {
    try {
      await logout("logout-all");
      setUser(null);
      setIsLoggedIn(false);
      setIsAccountMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="MyAccount-Nav">
      <div
        className="close"
        onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
      >
        <IoClose />
      </div>
      <div
        className="overlay"
        onClick={() => setIsAccountMenuOpen(false)}
      ></div>
      <ul className="account-pop">
        <li className="account-plate">
          <h4 className="userPlate d-flex align-items-center justify-content-between">
            <span className="username">Hi {user.username} </span>
          </h4>
        </li>

        <AccountMenuItem
          link={"/profile"}
          icon={<IoHomeOutline />}
          title={"My Profile"}
          onClick={handleMenuClick}
        />

        <AccountMenuItem
          link={"/account-statement"}
          icon={<IoHomeOutline />}
          title={"Balance Overview"}
        />

        <AccountMenuItem
          link={"/Account Statement"}
          icon={<IoHomeOutline />}
          title={"Statement"}
        />

        <AccountMenuItem
          link={"/account-settings"}
          icon={<IoHomeOutline />}
          title={"Settings"}
        />

        <li className="logout">
          <Link to="/" id="logout" onClick={onLogout}>
            Log Out <LuLogOut />
          </Link>
        </li>
        <li className="logout">
          <Link to="/" id="logout" onClick={handleAllLogout}>
            Logout from all <LuLogOut />
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default AccountMenu;
