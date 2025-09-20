/* eslint-disable react/prop-types */
import { useMediaQuery } from "react-responsive";

import Header from "../common/header/Header";
import Footer from "../common/Footer";

function AuthLayout({ children }) {
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });
  return (
    <div className={`wrapper ${isMobile ? "mobile" : "desktop"}`}>
      <Header />
      <div className="container-fluid" style={{ backgroundColor: "#282726" }}>
        <div className="row">
          <div className={`main-content`}>
            <div className="main-content-inner">
              {children}
              <Footer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
