import Sidebar from "../common/sidebar/Sidebar";
import Footer from "../common/Footer";
import Header from "../common/header/Header";

import { useStore } from "../../store/store";
// eslint-disable-next-line no-unused-vars
import React from "react";

// eslint-disable-next-line react/prop-types
function MainLayout({ children }) {
  const { isSidebarCollapsed } = useStore();
  return (
    <>
      <div
        className={`wrapper desktop`}
        style={
          isSidebarCollapsed ? { overflow: "hidden", height: "100vh" } : {}
        }
      >
        <Header />
        <div className="container-fluid" style={{ backgroundColor: "#282726" }}>
          <div className="row">
            <div
              className={`left-sidebar ${
                isSidebarCollapsed ? "col-md-1 custom-col-md-1" : "col-md-2"
              } `}
            >
              <Sidebar />
            </div>
            <div
              className={`main-content pt-3 ${
                isSidebarCollapsed ? "col-md-9 custom-col-md-9" : "col-md-10"
              }`}
            >
              <div className="main-content-inner">
                {children}
                <Footer />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MainLayout;
