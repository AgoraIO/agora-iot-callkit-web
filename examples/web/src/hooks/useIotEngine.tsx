import type { IAgoraIotAppSdk } from "iot-callkit-web";
import getAgoraIotEngine, { InitParam } from "iot-callkit-web";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";

import { useAuth } from "./useAuth";
import { useLocalStorage } from "./useLocalStorage";

export interface IotEngineContextProps {
  iotEngine: IAgoraIotAppSdk;
}

const IotEngineContext = createContext<IotEngineContextProps>({
  iotEngine: getAgoraIotEngine(),
});

export const IotEngineProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  const [settings] = useLocalStorage("settings", null);
  const iotEngine = useRef<IAgoraIotAppSdk>(getAgoraIotEngine());
  useEffect(() => {
    if (!user || !settings) {
      return;
    }
    const param = new InitParam({});
    param.mAppId = settings.appId;
    param.mCustomerKey = settings.authKey;
    param.mCustomerSecret = settings.secretKey;
    param.mLocalNodeId = user.nodeId;
    param.mLocalNodeToken = user.nodeToken;
    param.mRegion = settings.region;
    iotEngine.current.initialize(param);

    return () => {
      iotEngine.current.release();
    };
  }, [user, settings]);
  const value = useMemo(
    () => ({
      iotEngine: iotEngine.current,
    }),
    [iotEngine],
  );
  return <IotEngineContext.Provider value={value}>{children}</IotEngineContext.Provider>;
};

export const useIotEngine = () => {
  return useContext(IotEngineContext);
};
