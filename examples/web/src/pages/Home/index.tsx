import { Button, Grid, Input, List, Modal, NavBar, Popover, Space, Toast } from "antd-mobile";
import type { Action } from "antd-mobile/es/components/action-sheet";
import { DeleteOutline } from "antd-mobile-icons";
import type { IConnectionMgr, IConnectionObj, IConnectionObjCallback } from "iot-callkit-web";
import { ConnectCreateParam, ConnectStatus, LOG_LEVEL, STREAM_ID } from "iot-callkit-web";
import { ErrCode } from "iot-callkit-web";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import LogSink, { log } from "../../components/LogSink";
import { useIotEngine } from "../../hooks/useIotEngine";
import { useSessionStorage } from "../../hooks/useSessionStorage";

import "./index.scss";

const actions: Action[] = [
  { key: "add", text: "添加设备" },
  { key: "me", text: "个人设置" },
];

interface ConnectionObjStore {
  peerNodeId: string;
  localNodeId: string;
  isPreview: boolean;
  isFullScreen: boolean;
  isAudioMute: boolean;
  isMicOn: boolean;
}

const Home = () => {
  const navigate = useNavigate();
  const [addPeerNodeId, setAddPeerNodeId] = useState("");
  const [isShowLogSink, setIsShowLogSink] = useState(false);
  const [connectionObjStoreList, setConnectionObjStoreList] = useSessionStorage(
    "connectionObjStoreList",
    [],
  );
  const connectionObjStoreListRef = useRef(connectionObjStoreList);
  const { iotEngine } = useIotEngine();

  const connectionCreate = (peerNodeId: string) => {
    const connectionMgr: IConnectionMgr = iotEngine.getConnectionMgr();
    const param = new ConnectCreateParam({
      mAttachMsg: "",
      mPeerNodeId: peerNodeId,
    });
    const connectObj = connectionMgr?.connectionCreate(param);
    changeAndAddConnectObj(connectObj);
  };

  const changeAndAddConnectObj = (connectObj: IConnectionObj) => {
    const nextConnectionObjStoreList = connectionObjStoreListRef.current;
    if (
      !nextConnectionObjStoreList.find(
        (node: IConnectionObj) => node.peerNodeId === connectObj.peerNodeId,
      )
    ) {
      nextConnectionObjStoreList.push({
        peerNodeId: connectObj.peerNodeId,
        localNodeId: connectObj.localNodeId,
        isPreview: false,
        isFullScreen: false,
        isAudioMute: true,
        isMicOn: false,
      });
    }
    setConnectionObjStoreList(nextConnectionObjStoreList);
  };

  const connectionDestroy = (peerNodeId: string) => {
    const connectionMgr: IConnectionMgr = iotEngine.getConnectionMgr();
    const connectObj = connectionMgr
      ?.getConnectionList()
      .find(node => node.peerNodeId === peerNodeId);
    if (connectObj) {
      connectionMgr?.connectionDestroy(connectObj);
      console.log(connectionMgr?.getConnectionList());
      changeConnectionObjStore(peerNodeId, "isPreview", false);
      changeConnectionObjStore(peerNodeId, "isAudioMute", true);
      changeConnectionObjStore(peerNodeId, "isMicOn", false);
    }
  };

  const deleteConnectionObjStore = (peerNodeId: string) => {
    const nextConnectionObjStoreList = connectionObjStoreListRef.current;
    const index = nextConnectionObjStoreList.findIndex(
      (node: ConnectionObjStore) => node.peerNodeId === peerNodeId,
    );
    if (index !== -1) {
      nextConnectionObjStoreList.splice(index, 1);
    }
    setConnectionObjStoreList(nextConnectionObjStoreList);
  };

  useEffect(() => {
    const connectionMgr: IConnectionMgr = iotEngine.getConnectionMgr();
    const connectionObjEventListeners: IConnectionObjCallback = {
      onMessageReceived(connectObj, messageData) {
        log.log("onMessageReceived", "connectObj", connectObj, "messageData", messageData);
      },
      onMessageSendDone(connectObj, errCode, messageId, messageData) {
        log.log(
          "onMessageSendDone",
          "connectObj",
          connectObj,
          "errCode",
          errCode,
          "messageId",
          messageId,
          "messageData",
          messageData,
        );
      },
    };
    const eventListener = {
      onConnectionCreateDone: (connectObj: IConnectionObj, errCode: number) => {
        log.log("onConnectionCreateDone", "connectObj", connectObj, "errCode", errCode);
        if (!connectObj) {
          Toast.show("error: connectObj is null");
          return;
        }
        if (errCode !== ErrCode.ERR_OK) {
          Toast.show(`error: error code is ${errCode}`);
          connectionDestroy(connectObj.peerNodeId);
          return;
        }
        connectObj.registerListener(connectionObjEventListeners);
        changeAndAddConnectObj(connectObj);
      },
      onPeerDisconnected: (connectObj: IConnectionObj, errCode: number) => {
        log.log("onPeerDisconnected", "connectObj", connectObj, "errCode", errCode);
        if (!connectObj) {
          Toast.show("error: connectObj is null");
          return;
        }
        connectObj.unregisterListener(connectionObjEventListeners);
        connectionDestroy(connectObj.peerNodeId);
      },
    };
    iotEngine.setLogLevel(LOG_LEVEL.LOG_LEVEL_DEBUG);
    connectionMgr?.registerListener(eventListener);
    updateConnectionObjStoreList();
    return () => {
      connectionMgr?.unregisterListener(eventListener);
    };
  }, []);

  const updateConnectionObjStoreList = () => {
    const nextConnectionObjStoreList = connectionObjStoreListRef.current;
    for (let i = 0; i < nextConnectionObjStoreList.length; i++) {
      const node: ConnectionObjStore = nextConnectionObjStoreList[i];
      node.isPreview = false;
      node.isFullScreen = false;
      node.isAudioMute = true;
      node.isMicOn = false;
    }
    setConnectionObjStoreList(nextConnectionObjStoreList);
  };

  const startPreview = (peerNodeId: string) => {
    const connectObj: IConnectionObj | undefined = getConnectionObj(peerNodeId);
    if (!connectObj) {
      return;
    }
    connectObj.streamSubscribeStart(STREAM_ID.BROADCAST_STREAM_1, "");
    connectObj.setVideoDisplayView(
      STREAM_ID.BROADCAST_STREAM_1,
      document.querySelector(`.grid-video-container-${peerNodeId}`) as HTMLDivElement,
    );

    changeConnectionObjStore(peerNodeId, "isPreview", true);
  };

  const changeConnectionObjStore = (peerNodeId: string, key: string, value: any) => {
    const nextConnectionObjStoreList = connectionObjStoreListRef.current;
    nextConnectionObjStoreList.find((node: ConnectionObjStore) => {
      if (node.peerNodeId === peerNodeId && node.hasOwnProperty(key)) {
        (node as any)[key] = value;
      }
    });
    setConnectionObjStoreList(nextConnectionObjStoreList);
  };

  const stopPreview = (peerNodeId: string) => {
    const connectObj: IConnectionObj | undefined = getConnectionObj(peerNodeId);
    if (!connectObj) {
      return;
    }
    connectObj.streamSubscribeStop(STREAM_ID.BROADCAST_STREAM_1);

    changeConnectionObjStore(peerNodeId, "isPreview", false);
  };

  const getStatus = (peerNodeId: string) => {
    const status: ConnectStatus | undefined = getConnectionObj(peerNodeId)?.getInfo().mState;
    switch (status) {
      case ConnectStatus.DISCONNECTED:
        return "DISCONNECTED";
      case ConnectStatus.CONNECT_REQING:
        return "CONNECT_REQING";
      case ConnectStatus.CONNECTING:
        return "CONNECTING";
      case ConnectStatus.CONNECTED:
        return "CONNECTED";
      default:
        return "DISCONNECTED";
    }
  };

  const goStreamManager = (peerNodeId: string) => {
    muteAudio(peerNodeId, false);
    navigate(`/stream-manager/${peerNodeId}`);
  };

  const getConnectionObj = (peerNodeId: string): IConnectionObj | undefined => {
    return iotEngine
      .getConnectionMgr()
      ?.getConnectionList()
      .filter(node => node.peerNodeId === peerNodeId)[0];
  };

  const sendCmd = (peerNodeId: string) => {
    const connectObj: IConnectionObj | undefined = getConnectionObj(peerNodeId);
    if (!connectObj) {
      return;
    }
    let value = "";
    Modal.alert({
      content: (
        <>
          <div>输入命令数据</div>
          <Input
            clearable
            defaultValue={value}
            onChange={val => {
              value = val;
            }}
          />
        </>
      ),
      confirmText: "确定",
      showCloseButton: true,
      onConfirm: () => {
        connectObj.sendMessageData(value);
      },
    });
  };

  const muteAudio = (peerNodeId: string, isMute: boolean) => {
    const connectObj: IConnectionObj | undefined = getConnectionObj(peerNodeId);
    if (!connectObj) {
      return;
    }
    const mute = !isMute;
    connectObj.muteAudioPlayback(STREAM_ID.BROADCAST_STREAM_1, mute);
    changeConnectionObjStore(peerNodeId, "isAudioMute", mute);
  };

  const muteMic = (peerNodeId: string, isMute: boolean) => {
    const connectObj: IConnectionObj | undefined = getConnectionObj(peerNodeId);
    if (!connectObj) {
      return;
    }
    connectObj.publishAudioEnable(isMute);
    changeConnectionObjStore(peerNodeId, "isMicOn", isMute);
  };

  return (
    <div className="home container">
      <LogSink isShowLogSink={isShowLogSink} setIsShowLogSink={setIsShowLogSink} />
      <NavBar
        className="top"
        backIcon={false}
        right={
          <div style={{ fontSize: 12, color: "green" }}>
            <Space style={{ "--gap": "16px" }}>
              <Button
                fill="none"
                color="success"
                style={{ fontSize: 12, marginTop: "5px" }}
                onClick={() => {
                  setIsShowLogSink(!isShowLogSink);
                }}
              >
                日志
              </Button>
              <Popover.Menu
                actions={actions}
                placement="bottom-start"
                onAction={action => {
                  const { key } = action;
                  if (key === "add") {
                    let value = addPeerNodeId;
                    Modal.alert({
                      content: (
                        <>
                          <div>输入新设备信息</div>
                          <Input
                            clearable
                            defaultValue={value}
                            onChange={val => {
                              value = val;
                            }}
                          />
                        </>
                      ),
                      confirmText: "添加",
                      showCloseButton: true,
                      onConfirm: () => {
                        setAddPeerNodeId(value);
                        connectionCreate(value);
                      },
                    });
                  } else if (key === "me") {
                    navigate("/me");
                  }
                }}
                trigger="click"
              >
                <p style={{ color: "#00b578" }}>设备管理</p>
              </Popover.Menu>
            </Space>
          </div>
        }
      >
        <div>设备列表</div>
      </NavBar>
      <List className="content">
        {connectionObjStoreList.map((node: ConnectionObjStore) => (
          <List.Item className="item" key={node.peerNodeId}>
            <p className="device-name">{node.peerNodeId}</p>
            <p className="status">{getStatus(node.peerNodeId)}</p>
            <DeleteOutline
              color="#ffffff"
              className="delete"
              onClick={async () => {
                if (getStatus(node.peerNodeId) === "CONNECTED") {
                  Toast.show("设备已连接，请先断开连接");
                  return;
                }
                const result = await Modal.confirm({
                  content: "确认删除该设备吗?",
                });
                if (result) {
                  deleteConnectionObjStore(node.peerNodeId);
                }
              }}
            />
            <Grid columns={4} gap={8}>
              <Grid.Item>
                <div
                  className="grid-demo-item-block"
                  onClick={() => {
                    if (getStatus(node.peerNodeId) !== "CONNECTED") {
                      Toast.show("请先连接设备");
                    } else {
                      goStreamManager(node.peerNodeId);
                    }
                  }}
                >
                  流管理
                </div>
              </Grid.Item>
              <Grid.Item span={2}>
                <div
                  className={`grid-demo-item-block ${
                    node.isFullScreen ? "fullscreen" : "preview"
                  } grid-video-container-${node.peerNodeId}`}
                >
                  {node.isFullScreen && (
                    <Button
                      onClick={() =>
                        changeConnectionObjStore(node.peerNodeId, "isFullScreen", false)
                      }
                    >
                      关闭
                    </Button>
                  )}
                </div>
              </Grid.Item>
              <Grid.Item>
                <div
                  className="grid-demo-item-block"
                  onClick={() => {
                    if (node.isPreview) {
                      changeConnectionObjStore(node.peerNodeId, "isFullScreen", !node.isFullScreen);
                    }
                  }}
                >
                  全屏
                </div>
              </Grid.Item>
              <Grid.Item>
                <div
                  className="grid-demo-item-block"
                  onClick={() => {
                    if (getStatus(node.peerNodeId) !== "CONNECTED") {
                      Toast.show("请先连接设备");
                    } else {
                      sendCmd(node.peerNodeId);
                    }
                  }}
                >
                  命令
                </div>
              </Grid.Item>
              <Grid.Item span={2}>
                <div
                  className="grid-demo-item-block"
                  onClick={() => {
                    if (node.isPreview) {
                      stopPreview(node.peerNodeId);
                    } else {
                      startPreview(node.peerNodeId);
                    }
                  }}
                >
                  {node.isPreview ? "停止预览" : "预览"}
                </div>
              </Grid.Item>
              <Grid.Item>
                <div
                  className="grid-demo-item-block"
                  onClick={() => {
                    if (getStatus(node.peerNodeId) === "CONNECTED") {
                      connectionDestroy(node.peerNodeId);
                    } else {
                      connectionCreate(node.peerNodeId);
                    }
                  }}
                >
                  {getStatus(node.peerNodeId) === "CONNECTED" ? "断开" : "连接"}
                </div>
              </Grid.Item>
              <Grid.Item span={2}>
                <div
                  className="grid-demo-item-block"
                  onClick={() => {
                    if (getStatus(node.peerNodeId) !== "CONNECTED") {
                      Toast.show("请先连接设备");
                    } else if (node.isPreview !== true) {
                      Toast.show("请先预览");
                    } else {
                      muteAudio(node.peerNodeId, node.isAudioMute);
                    }
                  }}
                >
                  {node.isAudioMute ? "音放" : "静音"}
                </div>
              </Grid.Item>
              <Grid.Item span={2}>
                <div
                  className="grid-demo-item-block"
                  onClick={() => {
                    if (getStatus(node.peerNodeId) !== "CONNECTED") {
                      Toast.show("请先连接设备");
                    } else {
                      muteMic(node.peerNodeId, !node.isMicOn);
                    }
                  }}
                >
                  {node.isMicOn ? "禁麦" : "通话"}
                </div>
              </Grid.Item>
            </Grid>
          </List.Item>
        ))}
      </List>
    </div>
  );
};

export default Home;
