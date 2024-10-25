import { List, NavBar } from "antd-mobile";
import { useEffect } from "react";

import defaultSettings from "../../configs/callkit.config";
import { useSessionStorage } from "../../hooks/useSessionStorage";

const PersonalCenter = () => {
  const [settings, setSettings] = useSessionStorage("settings");

  useEffect(() => {
    if (!settings) {
      setSettings(defaultSettings);
    }
  }, []);

  const back = () => {
    window.history.back();
  };

  const logout = () => {
    sessionStorage.removeItem("user");
    location.reload();
  };

  const clearAll = () => {
    sessionStorage.clear();
    location.reload();
  };

  return (
    <div className="settings container">
      <NavBar onBack={back}>
        <div>
          <div>我的</div>
        </div>
      </NavBar>
      <List>
        <List.Item
          onClick={() => {
            logout();
          }}
        >
          退出登录
        </List.Item>
        <List.Item
          onClick={() => {
            clearAll();
          }}
        >
          清除应用配置
        </List.Item>
      </List>
    </div>
  );
};

export default PersonalCenter;
