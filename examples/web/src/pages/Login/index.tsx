import { Button, Form, Input, NavBar, Space } from "antd-mobile";
import { SetOutline } from "antd-mobile-icons";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./index.scss";

import { useAuth } from "../../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const right = (
    <div style={{ fontSize: 24 }}>
      <Space style={{ "--gap": "16px" }}>
        <SetOutline
          onClick={() => {
            navigate("/settings");
          }}
        />
      </Space>
    </div>
  );

  useEffect(() => {
    if (user?.userId) {
      navigate("/");
    }
  }, []);

  const onLogin = async (values: { account: string }) => {
    await login({ userId: values.account });
  };

  const onError = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="login container">
      <NavBar backIcon={false} right={right} className="top">
        <div>
          <div>灵隼 2.0</div>
        </div>
      </NavBar>
      <div className="content">
        <Form
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onLogin}
          onFinishFailed={onError}
          footer={
            <Button block type="submit" color="primary" size="large">
              登录
            </Button>
          }
        >
          <Form.Item
            label="账号"
            name="account"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input placeholder="请输入用户账号" />
          </Form.Item>
        </Form>
      </div>
      <div className="register">
        <span
          onClick={() => {
            navigate("/register");
          }}
        >
          注册账号
        </span>
      </div>
    </div>
  );
};

export default Login;
