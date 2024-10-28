import { Button, Form, Input, NavBar, Selector, Toast } from "antd-mobile";
import { useEffect } from "react";

import defaultSettings from "../../configs/callkit.config";
import { Region } from "../../configs/server";
import { useSessionStorage } from "../../hooks/useSessionStorage";
import { enumToItems } from "../../utils";

const Settings = () => {
  const [settings, setSettings] = useSessionStorage("settings");

  useEffect(() => {
    if (!settings) {
      setSettings(defaultSettings);
    }
  }, []);

  const onFinish = (values: any) => {
    console.log("Success:", values);

    settings.appId = values.appId;
    settings.authKey = values.authKey;
    settings.secretKey = values.secretKey;
    settings.region = values.region;
    setSettings(settings);

    Toast.show({
      content: "保存成功",
    });
    location.reload();
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  const back = () => {
    window.history.back();
  };

  return (
    <div className="settings container">
      <NavBar onBack={back} className="top">
        <div>
          <div>设置</div>
        </div>
      </NavBar>
      <Form
        className="content"
        name="basic"
        initialValues={settings}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        footer={
          <Button block type="submit" color="primary" size="large">
            保存
          </Button>
        }
      >
        <Form.Item
          label="App ID"
          name="appId"
          rules={[
            {
              required: true,
              message: "Please input your App ID!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Basic Auth Key"
          name="authKey"
          rules={[
            {
              required: true,
              message: "请输入 Basic Auth Key",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Basic Auth Secret"
          name="secretKey"
          rules={[
            {
              required: true,
              message: "请输入 Basic Auth Secret",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="区域"
          name="region"
          rules={[
            {
              required: true,
              message: "请选择区域",
            },
          ]}
        >
          <Selector
            columns={enumToItems(Region).length}
            options={enumToItems(Region)}
            value={[settings?.region]}
          />
        </Form.Item>
      </Form>
    </div>
  );
};

export default Settings;
