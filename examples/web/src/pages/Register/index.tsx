import { Button, Form, Input, Modal, NavBar, Toast } from "antd-mobile";
import { useNavigate } from "react-router-dom";

import { BASE_URL_TAIL, CREATE_ACCOUNT, fetchAPI, generateBasicAuth } from "../../configs/server";
import { useSessionStorage } from "../../hooks/useSessionStorage";

const Register = () => {
  const navigate = useNavigate();
  const [settings] = useSessionStorage("settings");
  const onFinish = async (values: { account: string }) => {
    if (settings.appId === "") {
      Toast.show("please input appid in setting page");
      return;
    }
    const res = await fetchAPI({
      url: `${settings.region[0]}${BASE_URL_TAIL}${CREATE_ACCOUNT}`,
      body: {
        appId: settings.appId,
        userId: values.account,
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
        Toast.show({ content: res.msg });
      }
      navigate("/login");
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  const back = () => {
    window.history.back();
  };

  return (
    <div className="register container">
      <NavBar onBack={back} className="top">
        <div>
          <div>注册账号</div>
        </div>
      </NavBar>
      <div className="content">
        <Form
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          footer={
            <Button block type="submit" color="primary" size="large">
              注册账号
            </Button>
          }
        >
          <Form.Item
            label="账号"
            name="account"
            rules={[
              {
                required: true,
                message: "请输入用户账号",
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Register;
