import { Link } from "react-router-dom";

function GuestEL() {
  return (
    <>
      <ul className="login-wrap">
        <li>
          <Link to="/login" className="login btn btn-primary">
            Login
          </Link>
        </li>
        <li>
          <Link to="/registration" className="register btn btn-success">
            Register
          </Link>
        </li>
      </ul>
    </>
  );
}

export default GuestEL;
