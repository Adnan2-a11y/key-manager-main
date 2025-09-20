/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";

function AccountMenuItem({ link, title, icon, onClick }) {
  return (
    <li className="account-menu">
      <Link
        className="parent-inner d-flex align-items-center gap-2"
        to={link}
        onClick={onClick}
      >
        <div
          className={`parent-text flex-grow-1 d-flex justify-content-end align-items-center `}
        >
          <span>{title}</span>
        </div>
        <div className="icon">{icon}</div>
      </Link>
    </li>
  );
}

export default AccountMenuItem;
