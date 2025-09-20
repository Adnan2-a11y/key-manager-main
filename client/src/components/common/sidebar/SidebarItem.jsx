/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import "../../../assets/css/sidebar.css";

function SidebarItem({ isSidebarCollapsed, title, link, icon }) {
  return (
    <li className="account-menu">
      <Link className="parent-inner d-flex align-items-center gap-3" to={link}>
        <div className="icon">{icon}</div>
        <div
          className={`parent-text flex-grow-1 d-flex justify-content-between align-items-center ${
            isSidebarCollapsed ? "hide" : "show"
          }`}
        >
          <span>{title}</span>
        </div>
      </Link>
    </li>
  );
}

export default SidebarItem;
