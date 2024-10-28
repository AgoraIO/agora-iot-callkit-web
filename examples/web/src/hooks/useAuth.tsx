import { Modal, Toast } from "antd-mobile";
import { createContext, useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { ACTIVE_ACCOUNT, BASE_URL_TAIL, fetchAPI, generateBasicAuth } from "../configs/server";

import { useSessionStorage } from "./useSessionStorage";

export interface AuthContextProps {
  user: User;
  login: (data: User) => Promise<void>;
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
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useSessionStorage("user", null);
  const [settings] = useSessionStorage("settings", null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!settings) {
      navigate("/settings");
    }
  }, []);

  const login = async (data: User) => {
    if (settings.appId === "") {
      Toast.show("please input appid in setting page");
      return;
    }
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
      location.reload();
    }
  };

  const value = useMemo(
    () => ({
      user,
      login,
    }),
    [user],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
