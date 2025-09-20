import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useState } from "react";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { checkTokenValidity } from "./services/authServices";
import API_CONFIG from "./components/constant/apiConstants";
import { useStore } from "./store/store";

import Homepage from "./pages/Homepage";
import NotFound from "./pages/NotFound";

import Login from "./pages/auth/Login";
import Registration from "./pages/auth/Registration";
import Success from "./pages/auth/Success";

import MyProfile from "./pages/profile/MyProfile";
import AuthorizedRoute from "./components/layout/AuthorizedRoute";
import RequiredAuth from "./components/layout/RequiredAuth";
import RequiredRole from "./components/layout/RequiredRole";
import UserPage from "./pages/user/UserPage";
import AddUser from "./pages/user/AddUser";
import Settings from "./pages/Settings";
import ProductPage from "./pages/product/ProductPage";
import ProductAddPage from "./pages/product/ProductAddPage";
import Category from "./pages/category/Category";
import SerialNumberPage from "./pages/serial number/SerialNumberPage";
import AddSerialNumber from "./pages/serial number/AddSerialNumber";
import Supplier from "./pages/supplier/Supplier";
import StockManager from "./pages/serial number/StockManager";
import OrderPage from "./pages/shop/OrderPage";
import ApiKeys from "./pages/api/ApiKeys";
import ApiKeyEdit from "./pages/api/ApiKeyEdit";
import OrderDetailsPage from "./pages/shop/OrderDetailsPage";
import ApiKeyAddV2 from "./pages/api/ApiKeyAddV2";
import MultiDashboard from "./pages/v2/MultiDashboard";
import StoreSync from "./pages/StoreSync";

const BASE_URL = API_CONFIG.API_ENDPOINT;

function App() {
  const { setIsLoggedIn, setUser, isLoggedIn } = useStore();
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const accessToken = Cookies.get("accessToken");
      if (accessToken) {
        // Verify token
        const isValidToken = await checkTokenValidity(accessToken);
        if (isValidToken) {
          try {
            const res = await axios.get(`${BASE_URL}/api/verifyToken`, {
              headers: {
                auth_token: `Bearer ${accessToken}`,
              },
            });
            setUser(res.data.user);
            setIsLoggedIn(true);
          } catch (error) {
            // Handle error fetching user data
            console.error("Error fetching user data:", error);
            Cookies.remove("accessToken");
          }
        } else {
          // Token is invalid, logout user
          setIsLoggedIn(false);
          // Clear token from cookies
          Cookies.remove("accessToken");
        }
      }
      setShouldLoad(true);
    };

    checkLoginStatus();
  }, [setIsLoggedIn, setUser, isLoggedIn]);

  return (
    shouldLoad && (
      <>
        <Router>
          <Routes>

            <Route element={<AuthorizedRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/registration" element={<Registration />} />
              <Route path="/success" element={<Success />} />
            </Route>

            <Route element={<RequiredAuth />}>
              <Route path="/" element={<Homepage />} />
              {/* <Route path="/new" element={<Dashboard />} /> */}
              <Route path="/multi" element={<MultiDashboard />} />
              <Route path="/profile" element={<MyProfile />} />
              <Route path="/api-keys" element={<ApiKeys />} />
              {/* <Route path="/api-key/add" element={<ApiKeyAdd />} /> */}
              <Route path="/api-key/v2/add" element={<ApiKeyAddV2 />} />
              <Route path="/api-key/edit/:id" element={<ApiKeyEdit />} />
            </Route>

            <Route element={<RequiredRole requiredRole="admin" />}>
              <Route path="/user/all" element={<UserPage />} />
              <Route path="/user/add" element={<AddUser />} />

              <Route path="/product/all" element={<ProductPage />} />
              <Route path="/product/add" element={<ProductAddPage />} />
              <Route path="/product/categories" element={<Category />} />

              <Route path="/orders/all" element={<OrderPage />} />
              <Route path="/orders/view/:id" element={<OrderDetailsPage />} />

              <Route path="/serial-numbers" element={<SerialNumberPage />} />
              <Route path="/serial-numbers/add" element={<AddSerialNumber />} />
              <Route path="/serial-numbers/suppliers" element={<Supplier />} />
              <Route
                path="/serial-numbers/stock-manager"
                element={<StockManager />}
              />

              <Route path="/store/sync/:id" element={<StoreSync />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </>
    )
  );
}

export default App;
