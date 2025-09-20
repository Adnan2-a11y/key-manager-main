/* eslint-disable react/prop-types */
import { IoIosArrowForward } from "react-icons/io";
import { BiSolidCircle } from "react-icons/bi";
import { Link } from "react-router-dom";
import "../../../assets/css/sidebar.css";
import { useState } from "react";

function SidebarSubMenu({ title, icon, isSidebarCollapsed, menuItem }) {
  const [isMenuExpand, setIsMenuExpand] = useState(false);

  const toggleHandler = () => {
    setIsMenuExpand(!isMenuExpand);
  };

  return (
    <li className={`account-menu has-child ${isMenuExpand ? "active" : ""}`}>
      <div
        className="parent-inner d-flex align-items-center gap-3"
        onClick={toggleHandler}
      >
        <div className="icon">{icon}</div>
        <div
          className={`parent-text flex-grow-1 d-flex justify-content-between align-items-center ${
            isSidebarCollapsed ? "hide" : "show"
          }`}
        >
          <span>{title}</span>
          <IoIosArrowForward />
        </div>
      </div>
      {!isSidebarCollapsed && (
        <ul>
          {menuItem.map((item, index) => (
            <li key={index} className="child_menu">
              <Link to={item.link}>
                <BiSolidCircle className="sub_menu_icon_admin" />
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default SidebarSubMenu;
