import { Modal, Toast } from "antd-mobile";
import { createContext, useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { ACTIVE_ACCOUNT, BASE_URL_TAIL, fetchAPI, generateBasicAuth } from "../configs/server";

import { useLocalStorage } from "./useLocalStorage";

export interface AuthContextProps {
  user: User;
  login: (data: User) => Promise<void>;
  logout: () => void;
}

export interface User {
  userId?: string;
  mqttPort?: number;
  nodeId?: string;
  nodeRegion?: string;
  nodeToken?: string;
}

const AuthContext = createContext<AuthContextProps>({
  user: {},
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useLocalStorage("user", null);
  const [settings] = useLocalStorage("settings", null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!settings) {
      navigate("/settings");
    }
  }, []);

  const login = async (data: User) => {
    const res = await fetchAPI({
      url: `${settings.region[0]}${BASE_URL_TAIL}${ACTIVE_ACCOUNT}`,
      body: {
        appId: settings.appId,
        userId: data.userId,
        clientType: 1,
      },
      headers: {
        Authorization: `Basic ${generateBasicAuth(settings.authKey, settings.secretKey)}`,
      },
    });
    if (res.code !== 0) {
      if (res.msg) {
        Modal.alert({
          content: res.msg,
        });
      }
    } else {
      if (res.msg) {
        Toast.show({
          content: res.msg,
        });
      }
      setUser({
        userId: data.userId,
        mqttPort: res.data?.mqttPort,
        nodeId: res.data?.nodeId,
        nodeRegion: res.data?.nodeRegion,
        nodeToken: res.data?.nodeToken,
      });
      location.href = "/#/";
    }
  };

  const logout = () => {
    setUser(null);
    navigate("/", { replace: true });
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
    }),
    [user],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
