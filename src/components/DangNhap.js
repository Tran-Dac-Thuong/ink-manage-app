import React, { useEffect } from "react";
import { Button, Form, Input, notification, Space } from "antd";
import { Link, useNavigate } from "react-router-dom";
import * as jose from "jose";
import { Helmet } from "react-helmet";

const DangNhap = (props) => {
  const [form] = Form.useForm();

  const [api, contextHolder] = notification.useNotification();

  const navigate = useNavigate();

  const secretKey = "your-secret-key";

  const decodeJWT = async (token, secretKey) => {
    try {
      const secret = new TextEncoder().encode(secretKey);
      const { payload } = await jose.jwtVerify(token, secret);
      return payload;
    } catch (error) {
      api["error"]({
        message: "Lỗi",
        description: "Đã xảy ra lỗi trong quá trình hiển thị dữ liệu",
      });
    }
  };

  const encodeDataToJWT = async (data, secretKey, options = {}) => {
    try {
      const defaultOptions = { expiresIn: "10y" };
      const finalOptions = { ...defaultOptions, ...options };

      const secret = new TextEncoder().encode(secretKey);
      const alg = "HS256";

      const jwt = await new jose.SignJWT(data)
        .setProtectedHeader({ alg })
        .setExpirationTime(finalOptions.expiresIn)
        .sign(secret);

      return jwt;
    } catch (error) {
      api["error"]({
        message: "Lỗi",
        description: "Đã xảy ra lỗi trong quá trình hiển thị dữ liệu",
      });
    }
  };

  useEffect(() => {
    props.setProgress(100);
  }, []);

  useEffect(() => {
    try {
      let token = localStorage.getItem("token");
      if (token) {
        navigate(`/`);
      }
    } catch (error) {
      api["error"]({
        message: "Lỗi",
        description: "Đã xảy ra lỗi trong quá trình hiển thị dữ liệu",
      });
    }
  }, []);

  const handleDangNhap = async (values) => {
    if (values.tendangnhap === "thuongduyet" && values.matkhau === "123") {
      let dataLoginDuyet = {
        username: values.tendangnhap,
        password: values.matkhau,
        role: "Người duyệt",
        hovaten: "Trần Đắc Thương Duyệt",
      };
      try {
        let jwtToken = await encodeDataToJWT(dataLoginDuyet, secretKey);

        localStorage.setItem("token", jwtToken);

        navigate("/");
      } catch (error) {
        api["error"]({
          message: "Thất bại",
          description: "Đã xảy ra lỗi trong quá trình đăng nhập",
        });
      }
    } else if (
      values.tendangnhap === "thuongnhapxuat" &&
      values.matkhau === "123"
    ) {
      let dataLoginNhapXuat = {
        username: values.tendangnhap,
        password: values.matkhau,
        role: "Người nhập xuất",
        hovaten: "Trần Đắc Thương Tạo Phiếu",
      };
      try {
        let jwtToken = await encodeDataToJWT(dataLoginNhapXuat, secretKey);

        localStorage.setItem("token", jwtToken);

        navigate("/");
      } catch (error) {
        api["error"]({
          message: "Thất bại",
          description: "Đã xảy ra lỗi trong quá trình đăng nhập",
        });
      }
    } else {
      api["error"]({
        message: "Thất bại",
        description: "Tên đăng nhập hoặc mật khẩu không chính xác",
      });
    }
  };

  const onReset = () => {
    form.resetFields();
  };

  return (
    <>
      {contextHolder}
      <Helmet>
        <meta charSet="utf-8" />
        <title>Đăng nhập</title>
      </Helmet>
      <div className="container">
        <div className="text-center mt-5">
          <img src="../img/logo2.png" alt="" />
        </div>

        <h4 className="text-center mt-5 mb-5">
          ĐĂNG NHẬP HỆ THỐNG QUẢN LÝ MỰC IN
        </h4>

        <Form
          form={form}
          name="control-hooks"
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          style={{
            maxWidth: 1000,
          }}
          onFinish={handleDangNhap}
        >
          <Form.Item
            label="Tên đăng nhập"
            name="tendangnhap"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tên đăng nhập",
              },
            ]}
          >
            <Input
              placeholder="Nhập tên đăng nhập"
              style={{
                width: "100%",
              }}
            />
          </Form.Item>
          <Form.Item
            label="Mật khẩu"
            name="matkhau"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu",
              },
            ]}
          >
            <Input.Password
              placeholder="Nhập mật khẩu"
              style={{
                width: "100%",
              }}
            />
          </Form.Item>

          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Space>
              <Button type="primary" htmlType="submit">
                Đăng nhập
              </Button>
              <Button danger type="primary" htmlType="button" onClick={onReset}>
                Đặt lại
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default DangNhap;
