/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { RiMenu2Line } from "react-icons/ri";

function Logo({ onSidebarClick, logoUrl }) {
  return (
    <div className="col-md-6 logo flex-row d-flex justify-content-start align-items-center gap-3">
      <div
        className="menuIcon"
        style={{ cursor: "pointer", fontSize: "28px" }}
        onClick={onSidebarClick}
      >
        <RiMenu2Line />
      </div>
      <Link to="/">
        <img src={logoUrl} alt="logo" className="" />
      </Link>
    </div>
  );
}

export default Logo;
