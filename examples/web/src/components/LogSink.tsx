import { List, Popup } from "antd-mobile";
import { useEffect } from "react";

interface LogSinkProps {
  isShowLogSink: boolean;
  setIsShowLogSink: (isShowLogSink: boolean) => void;
}

export class log {
  static logList: Array<string> = [];
  static _logSink(
    level: "debug" | "log" | "info" | "warn" | "error",
    message?: any,
    ...optionalParams: any[]
  ) {
    console[level](message, ...optionalParams);
    const content = `${optionalParams.map(v => (typeof v === "object" ? v : JSON.stringify(v)))}`;
    log.logList.splice(0, 0, `[${level}] ${message} ${content}`);
    return content;
  }

  static clear() {
    log.logList = [];
  }

  static log(message?: any, ...optionalParams: any[]): void {
    log._logSink("log", message, optionalParams);
  }
}

const LogSink = ({ isShowLogSink, setIsShowLogSink }: LogSinkProps) => {
  useEffect(() => {
    return () => {
      log.clear();
    };
  }, []);

  return (
    <>
      <Popup
        className="logSink"
        visible={isShowLogSink}
        onMaskClick={() => {
          setIsShowLogSink(false);
        }}
        onClose={() => {
          setIsShowLogSink(false);
        }}
        bodyStyle={{ height: "40vh" }}
      >
        <List header="logs">
          {log.logList.map((log, index) => (
            <List.Item key={index}>{log}</List.Item>
          ))}
        </List>
      </Popup>
    </>
  );
};

export default LogSink;
