import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { ReactNode, useState, useEffect } from "react";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";

interface JwtPayload {
  exp: number;
  [key: string]: any;
}

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    auth().catch(() => setIsAuthorized(false));
  }, []);

  const refreshToken = async (): Promise<void> => {
    const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN);

    if (!refreshTokenValue) {
      setIsAuthorized(false);
      return;
    }

    try {
      const res = await api.post("/api/token/refresh/", {
        refresh: refreshTokenValue,
      });

      if (res.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.log(error);
      setIsAuthorized(false);
    }
  };

  const auth = async (): Promise<void> => {
    const token = localStorage.getItem(ACCESS_TOKEN);

    if (!token) {
      setIsAuthorized(false);
      return;
    }

    const decoded = jwtDecode<JwtPayload>(token);
    const tokenExpiration = decoded.exp;
    const now = Date.now() / 1000;

    if (tokenExpiration < now) {
      await refreshToken();
    } else {
      setIsAuthorized(true);
    }
  };

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  return isAuthorized ? <>{children}</> : <Navigate to="/login" />;
}

export default ProtectedRoute;
