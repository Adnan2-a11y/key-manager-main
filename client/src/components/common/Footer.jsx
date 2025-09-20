import { Link } from "react-router-dom";
import "../../assets/css/footer.css";

const Footer = () => {
  return (
    <div className="footer text-white mt-5">
      <div className="container" style={{ maxWidth: "1200px" }}>
        <div className="browser-wrap">
          {/* <img src="data:image/gif;base64,R0lGODdhAQABAIAAAAAAAP///yH5BAEAAAEALAAAAAABAAEAAAICTAEAOw==" alt="gif" /> */}
          <p>
            Our website works best in the newest and last prior version of these
            browsers: <br />
            Google Chrome.
          </p>
        </div>
        <ul className="policy-link">
          <li>
            <Link to="/privacy-policy">Privacy Policy</Link>
          </li>
          <li>
            <Link to="/terms-and-Conditions">Terms and Conditions</Link>
          </li>
          <li>
            <Link to="/rules-and-regulation">Rules and Regulations</Link>
          </li>
          <li>
            <Link to="/self-exclusion-policy">Self-exclusion Policy</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Footer;
