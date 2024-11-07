import { Navigate, Outlet } from "react-router-dom";

export function ProtectedRoute() {
  const keys = Object.keys(localStorage);
  const tokenArr = keys.filter((key) => key.endsWith('accessToken'));

  return tokenArr.length
    ? <Outlet />
    : <Navigate to="/" />
}