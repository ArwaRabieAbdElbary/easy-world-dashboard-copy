import { createBrowserRouter } from "react-router-dom";
import Login from "./src/pages/auth/LoginPage";
import ForgetPassword from "./src/pages/auth/ForgetPassword";
import ResetPassword from "./src/pages/auth/ResetPassword";
import DashboardLayout from "./src/components/shared/DashboardLayout";
import OverviewPage from "./src/pages/dashboard/OverviewPage";
import MyUsersPage from "./src/pages/dashboard/MyUsersPage";
import MyProfilePage from "./src/pages/dashboard/MyProfilePage";

export const router = createBrowserRouter([
  {
    path: "/",
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
    element: <DashboardLayout />,
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
        path: "profile",
        element: <MyProfilePage />,
      },
    ],
  },
]);
