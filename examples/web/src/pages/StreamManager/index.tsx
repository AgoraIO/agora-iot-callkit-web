import { Button, Grid, List, NavBar, Space, Toast } from "antd-mobile";
import type { IConnectionMgr, IConnectionObj, IConnectionObjCallback } from "iot-callkit-web";
import { ConnectCreateParam, ConnectStatus, STREAM_ID } from "iot-callkit-web";
import { ErrCode } from "iot-callkit-web";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./index.scss";

import LogSink, { log } from "../../components/LogSink";
import { useIotEngine } from "../../hooks/useIotEngine";

interface Stream {
  type: string;
  value: STREAM_ID;
  isPreview: boolean;
  isPlaying: boolean;
  ref: React.RefObject<HTMLDivElement>;
}

const StreamManager = () => {
  const navigate = useNavigate();

  const { iotEngine } = useIotEngine();

  const [connectionObj, setConnectionObj] = useState<IConnectionObj | null>(null);
  const [isShowLogSink, setIsShowLogSink] = useState(false);

  const [currentStreamType, _setCurrentStreamType] = useState<string>("BROADCAST_STREAM_1");

  const { peerNodeId } = useParams();
  const [streamList, setStreamList] = useState<Stream[]>([
    {
      type: "BROADCAST_STREAM_1",
      value: STREAM_ID.BROADCAST_STREAM_1,
      isPreview: false,
      isPlaying: false,
      ref: useRef<HTMLDivElement>(null),
    },
    {
      type: "BROADCAST_STREAM_2",
      value: STREAM_ID.BROADCAST_STREAM_2,
      isPreview: false,
      isPlaying: false,
      ref: useRef<HTMLDivElement>(null),
    },
    {
      type: "BROADCAST_STREAM_3",
      value: STREAM_ID.BROADCAST_STREAM_3,
      isPreview: false,
      isPlaying: false,
      ref: useRef<HTMLDivElement>(null),
    },
    {
      type: "BROADCAST_STREAM_4",
      value: STREAM_ID.BROADCAST_STREAM_4,
      isPreview: false,
      isPlaying: false,
      ref: useRef<HTMLDivElement>(null),
    },
    {
      type: "BROADCAST_STREAM_5",
      value: STREAM_ID.BROADCAST_STREAM_5,
      isPreview: false,
      isPlaying: false,
      ref: useRef<HTMLDivElement>(null),
    },
    {
      type: "BROADCAST_STREAM_6",
      value: STREAM_ID.BROADCAST_STREAM_6,
      isPreview: false,
      isPlaying: false,
      ref: useRef<HTMLDivElement>(null),
    },
    {
      type: "BROADCAST_STREAM_7",
      value: STREAM_ID.BROADCAST_STREAM_7,
      isPreview: false,
      isPlaying: false,
      ref: useRef<HTMLDivElement>(null),
    },
    {
      type: "BROADCAST_STREAM_8",
      value: STREAM_ID.BROADCAST_STREAM_8,
      isPreview: false,
      isPlaying: false,
      ref: useRef<HTMLDivElement>(null),
    },
    {
      type: "BROADCAST_STREAM_9",
      value: STREAM_ID.BROADCAST_STREAM_9,
      isPreview: false,
      isPlaying: false,
      ref: useRef<HTMLDivElement>(null),
    },
    {
      type: "UNICAST_STREAM_2",
      value: STREAM_ID.UNICAST_STREAM_2,
      isPreview: false,
      isPlaying: false,
      ref: useRef<HTMLDivElement>(null),
    },
    {
      type: "UNICAST_STREAM_3",
      value: STREAM_ID.UNICAST_STREAM_3,
      isPreview: false,
      isPlaying: false,
      ref: useRef<HTMLDivElement>(null),
    },
    {
      type: "UNICAST_STREAM_4",
      value: STREAM_ID.UNICAST_STREAM_4,
      isPreview: false,
      isPlaying: false,
      ref: useRef<HTMLDivElement>(null),
    },
    {
      type: "UNICAST_STREAM_5",
      value: STREAM_ID.UNICAST_STREAM_5,
      isPreview: false,
      isPlaying: false,
      ref: useRef<HTMLDivElement>(null),
    },
    {
      type: "UNICAST_STREAM_6",
      value: STREAM_ID.UNICAST_STREAM_6,
      isPreview: false,
      isPlaying: false,
      ref: useRef<HTMLDivElement>(null),
    },
    {
      type: "UNICAST_STREAM_7",
      value: STREAM_ID.UNICAST_STREAM_7,
      isPreview: false,
      isPlaying: false,
      ref: useRef<HTMLDivElement>(null),
    },
    {
      type: "UNICAST_STREAM_8",
      value: STREAM_ID.UNICAST_STREAM_8,
      isPreview: false,
      isPlaying: false,
      ref: useRef<HTMLDivElement>(null),
    },
    {
      type: "UNICAST_STREAM_9",
      value: STREAM_ID.UNICAST_STREAM_9,
      isPreview: false,
      isPlaying: false,
      ref: useRef<HTMLDivElement>(null),
    },
  ]);

  const back = () => {
    navigate("/");
  };

  useEffect(() => {
    const connectionMgr: IConnectionMgr = iotEngine.getConnectionMgr();
    const connectionObj = getConnectionObj(peerNodeId!);
    const connectionObjEventListeners: IConnectionObjCallback = {
      onStreamFirstFrame(connectObj, subStreamId, videoWidth, videoHeight) {
        log.log(
          "onStreamFirstFrame",
          "connectObj",
          connectObj,
          "subStreamId",
          subStreamId,
          "videoWidth",
          videoWidth,
          "videoHeight",
          videoHeight,
        );

        const newStreamList = streamList.map(stream => {
          if (stream.type === currentStreamType) {
            return { ...stream, isPreview: true };
          }
          return stream;
        });
        setStreamList(newStreamList);
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
          return;
        }
        connectObj.registerListener(connectionObjEventListeners);
        setConnectionObj(connectObj);
      },
      onPeerDisconnected: (connectObj: IConnectionObj, errCode: number) => {
        log.log("onPeerDisconnected", "connectObj", connectObj, "errCode", errCode);
        if (!connectObj) {
          Toast.show("error: connectObj is null");
          return;
        }
      },
    };
    connectionMgr?.registerListener(eventListener);
    if (!connectionObj) {
      connectionObjCreate();
    } else {
      connectionObj.registerListener(connectionObjEventListeners);
      setConnectionObj(connectionObj);
    }
    return () => {
      connectionMgr?.unregisterListener(eventListener);
      if (connectionObj) {
        connectionObj.unregisterListener(connectionObjEventListeners);
      }
    };
  }, []);

  const connectionObjCreate = () => {
    const connectionMgr: IConnectionMgr = iotEngine.getConnectionMgr();
    connectionMgr?.connectionCreate(
      new ConnectCreateParam({
        mAttachMsg: "",
        mPeerNodeId: peerNodeId,
      }),
    );
  };

  const startPreview = (type: STREAM_ID) => {
    if (!connectionObj) {
      return;
    }
    const stream = streamList.find(stream => stream.value === type);
    if (!stream) {
      return;
    }
    connectionObj.setVideoDisplayView(type, stream.ref.current);
    connectionObj.streamSubscribeStart(type, "");
    const newStreamList = streamList.map(stream => {
      if (stream.value === type) {
        return { ...stream, isPreview: true };
      }
      return stream;
    });
    setStreamList(newStreamList);
  };

  const stopPreview = (type: STREAM_ID) => {
    if (!connectionObj) {
      return;
    }
    connectionObj.streamSubscribeStop(type);
    const newStreamList = streamList.map(stream => {
      if (stream.value === type) {
        return { ...stream, isPreview: false };
      }
      return stream;
    });
    setStreamList(newStreamList);
  };

  const onAudioPlay = (type: STREAM_ID, isPlaying: boolean) => {
    if (!connectionObj) {
      return;
    }
    connectionObj.muteAudioPlayback(type, isPlaying);
    const newStreamList = streamList.map(stream => {
      if (stream.value === type) {
        return { ...stream, isPlaying: !isPlaying };
      }
      return stream;
    });
    setStreamList(newStreamList);
  };

  const getConnectionObj = (peerNodeId: string): IConnectionObj | undefined => {
    const connectionMgr: IConnectionMgr = iotEngine.getConnectionMgr();
    return connectionMgr?.getConnectionList().find((connectObj: IConnectionObj) => {
      return connectObj.getInfo().mPeerNodeId === peerNodeId;
    });
  };

  const getStatus = () => {
    const status: ConnectStatus | undefined = connectionObj?.getInfo().mState;
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

  return (
    <div className="stream-manage container">
      <LogSink isShowLogSink={isShowLogSink} setIsShowLogSink={setIsShowLogSink} />
      <NavBar
        className="top"
        onBack={back}
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
            </Space>
          </div>
        }
      >
        <div>设备流管理</div>
      </NavBar>
      <List className="content">
        {streamList.map((stream: Stream) => (
          <List.Item className="item" key={stream.type}>
            <p className="device-name">{stream.type}</p>
            <p className="status">{getStatus()}</p>
            <Grid columns={4} gap={8}>
              <Grid.Item span={4}>
                <div className={`grid-demo-item-block preview`} ref={stream.ref}></div>
              </Grid.Item>
              <Grid.Item span={2}>
                <div
                  className="grid-demo-item-block"
                  onClick={() => {
                    if (stream.isPreview) {
                      stopPreview(stream.value);
                    } else {
                      startPreview(stream.value);
                    }
                  }}
                >
                  {stream.isPreview ? "停止预览" : "预览"}
                </div>
              </Grid.Item>
              <Grid.Item span={2}>
                <div
                  className="grid-demo-item-block"
                  onClick={() => {
                    onAudioPlay(stream.value, stream.isPlaying);
                  }}
                >
                  {stream.isPlaying ? "静音" : "音放"}
                </div>
              </Grid.Item>
            </Grid>
          </List.Item>
        ))}
      </List>
    </div>
  );
};

export default StreamManager;
