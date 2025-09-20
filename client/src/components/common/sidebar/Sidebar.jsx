import "../../../assets/css/sidebar.css";
import SidebarItem from "./SidebarItem";
import { FaHome, FaRegUserCircle, FaBoxes, FaKey, FaShoppingCart } from "react-icons/fa";
import { LiaKeySolid } from "react-icons/lia";
import { IoMdSettings } from "react-icons/io";
import { useStore } from "../../../store/store";

import { shallow } from "zustand/shallow";
import SidebarSubMenu from "./SidebarSubMenu";

function Sidebar() {
const { isSidebarCollapsed, user } = useStore(
  (state) => ({ isSidebarCollapsed: state.isSidebarCollapsed, user: state.user }),
  shallow
);

  const userSubMenuItems = [
    { title: "All User", link: "/user/all" },
    { title: "Add User", link: "/user/add" },
  ];

  const productSubMenuItems = [
    { title: "All Product", link: "/product/all" },
    { title: "Add product", link: "/product/add" },
    { title: "Categories", link: "/product/categories" },
    { title: "Tags", link: "/product/tags" },
  ];

  const serialNumberItems = [
    { title: "Serial Numbers", link: "/serial-numbers" },
    { title: "Add Serial Number", link: "/serial-numbers/add" },
    { title: "Suppliers", link: "/serial-numbers/suppliers" },
    { title: "Stock Manager", link: "/serial-numbers/stock-manager" },
  ];

  const ordersItems = [
    { title: "All Orders", link: "/orders/all" },
    { title: "Pending Orders", link: "/orders/all?type=pending" },
    { title: "Completed Orders", link: "/orders/all?type=complete" },
    { title: "Partial Orders", link: "/orders/all?type=partial" },
    { title: "Cancelled Orders", link: "/orders/all?type=cancel" },
    { title: "Failed Orders", link: "/orders/all?type=failed" },
  ];

  const apiKeysItems = [
    { title: "All API Keys", link: "/api-keys" },
    // { title: "Add API Key", link: "/api-key/add" },
    { title: "Add API Key", link: "/api-key/v2/add" },
  ];

  return (
    <div
      className={`AccountNav mt-3  ${
        isSidebarCollapsed ? "sd-hide" : "sd-show"
      }`}
    >
      <ul className="accountNavBar">

        {user && (
          <>
            <SidebarItem
              isSidebarCollapsed={isSidebarCollapsed}
              title={"Dashboard"}
              link={"/"}
              icon={<FaHome className="icon" />}
            />
            <SidebarSubMenu
            title="API Keys"
            icon={<LiaKeySolid className="icon"/>}
            isSidebarCollapsed={isSidebarCollapsed}
            menuItem={apiKeysItems}
            />
          </>
        )}

        {user && user.role === "admin" ? (
          <>
            <SidebarSubMenu
              title="Products"
              icon={<FaBoxes className="icon" />}
              isSidebarCollapsed={isSidebarCollapsed}
              menuItem={productSubMenuItems}
            />
            <SidebarSubMenu
              title="Keys"
              icon={<FaKey className="icon" />}
              isSidebarCollapsed={isSidebarCollapsed}
              menuItem={serialNumberItems}
            />
            <SidebarSubMenu
              title="Orders"
              icon={<FaShoppingCart className="icon" />}
              isSidebarCollapsed={isSidebarCollapsed}
              menuItem={ordersItems}
            />
            <SidebarSubMenu
              title="Users"
              icon={<FaRegUserCircle className="icon" />}
              isSidebarCollapsed={isSidebarCollapsed}
              menuItem={userSubMenuItems}
            />
            <SidebarItem
              isSidebarCollapsed={isSidebarCollapsed}
              title={"Settings"}
              link={"/settings"}
              icon={<IoMdSettings className="icon" />}
            />
          </>
        ) : null}
      </ul>
    </div>
  );
}

export default Sidebar;
