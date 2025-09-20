/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";

function UserEl({ setIsAccountMenuOpen, isAccountMenuOpen, user }) {
  const handleButtonClick = (e) => {
    e.preventDefault();
    setIsAccountMenuOpen(!isAccountMenuOpen);
  };

  return (
    <>
      <ul className="accounts-wrap">
        {user ? (
          <>
            <li className="account">
              <Link to="" onClick={handleButtonClick}>
                My Account
              </Link>
            </li>
          </>
        ) : null}
      </ul>
    </>
  );
}

export default UserEl;
