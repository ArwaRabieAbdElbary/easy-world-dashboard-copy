import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./src/pages/auth/LoginPage";
import ForgetPassword from "./src/pages/auth/ForgetPassword";
import ResetPassword from "./src/pages/auth/ResetPassword";
import DashboardLayout from "./src/components/shared/DashboardLayout";
import OverviewPage from "./src/pages/dashboard/OverviewPage";
import ProtectedRoute from "./src/components/shared/ProtectedRoute";
import MyUsersPage from "./src/pages/dashboard/users/pages/MyUsersPage";
import UserDetailsPage from "./src/pages/dashboard/users/pages/UserDetailsPage";
import MyProfilePage from "./src/pages/dashboard/profile/pages/MyProfilePage";
import StoreTypesPage from "./src/pages/dashboard/store/pages/StoreTypesPage";
import StoreTypeDetailsPage from "./src/pages/dashboard/store/pages/StoreTypeDetailsPage";
import StoresPage from "./src/pages/dashboard/store/pages/StoresPage";
import StoreDetailsPage from "./src/pages/dashboard/store/pages/StoreDetailsPage";
import VendorsPage from "./src/pages/dashboard/vendors/VendorsPage";


export const router = createBrowserRouter([

  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forget-password",
    element: <ForgetPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/dashboard",
    element: 
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>,
    children: [
      {
        index: true,
        element: <OverviewPage />,
      },
      {
        path: "users",
        element: <MyUsersPage />,
      },
      {
        path: "users/:userId",
        element: <UserDetailsPage />,
      },

      {
        path: "profile",
        element: <MyProfilePage />,
      },
      {
        path: "store-types",
        element: <StoreTypesPage />,
      },
      {
        path:"store-types/:id",
        element: <StoreTypeDetailsPage />
      }
      ,{
        path:"stores",
        element: <StoresPage />
      },
      {
        path:"stores/:id",
        element: <StoreDetailsPage />
      },
      {
        path: "vendors",
        element:<VendorsPage />
      },
      {
        path:"vendors/:id",
      }
    ],
  },
]);
