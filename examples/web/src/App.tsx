import { Footer } from "antd-mobile";
import { getAgoraIotEngine } from "iot-callkit-web";
import React, { useEffect, useState } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";

import "./App.global.scss";
import defaultSettings from "../src/configs/callkit.config";

import { AuthProvider, useAuth } from "./hooks/useAuth";
import { IotEngineProvider } from "./hooks/useIotEngine";
import { useLocalStorage } from "./hooks/useLocalStorage";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PersonalCenter from "./pages/PersonalCenter";
import Register from "./pages/Register";
import StreamManager from "./pages/StreamManager";
import Settings from "./pages/settings";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

const App = () => {
  useLocalStorage("settings", defaultSettings);

  const [version, setVersion] = useState<{
    version: string | undefined;
  }>({ version: undefined });

  useEffect(() => {
    const iotInstance = getAgoraIotEngine();
    setVersion({ version: iotInstance.getVersion() });
  }, []);

  return (
    <div className="app">
      <div className="body">
        <HashRouter>
          <AuthProvider>
            <IotEngineProvider>
              <Routes>
                <Route
                  path="/"
                  Component={() => (
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/stream-manager/:peerNodeId"
                  Component={() => (
                    <ProtectedRoute>
                      <StreamManager />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/me"
                  Component={() => (
                    <ProtectedRoute>
                      <PersonalCenter />
                    </ProtectedRoute>
                  )}
                />
                <Route path="/settings" Component={() => <Settings />} />
                <Route path="/login" Component={() => <Login />} />
                <Route path="/register" Component={() => <Register />} />
              </Routes>
            </IotEngineProvider>
          </AuthProvider>
        </HashRouter>
      </div>
      <Footer content={`Powered by Agora IoT CallKit ${version.version}`} />
    </div>
  );
};

export default App;
