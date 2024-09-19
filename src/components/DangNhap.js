import React, { useEffect, useState } from "react";
import { Button, Form, Input, notification, Select, Space } from "antd";
import { Link, useNavigate } from "react-router-dom";
import * as jose from "jose";
import { Helmet } from "react-helmet";
import axios from "axios";
import { Option } from "antd/es/mentions";

const DangNhap = (props) => {
  const [form] = Form.useForm();

  const [api, contextHolder] = notification.useNotification();

  const [dataNhanVien, setDataNhanVien] = useState([]);

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
    const fetchDataNhanVien = async () => {
      try {
        let res = await axios.get("http://172.16.0.53:8080/danh_sach_cntt");
        if (res && res.data) {
          // Thay thế NaN bằng null
          res.data = res.data.replace(/: NaN/g, ": null");

          setDataNhanVien(JSON.parse(res.data));
        }
      } catch (error) {
        console.log(error);

        api["error"]({
          message: "Thất bại",
          description: "Đã xảy ra lỗi trong quá trình hiển thị dữ liệu",
        });
      }
    };
    fetchDataNhanVien();
  }, []);

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
    try {
      if (values.chonnhanvien === "Thầu" && values.matkhau === "123") {
        let dataLogin = {
          username: values.chonnhanvien,

          role: "Người nhập không xuất",
          hovaten: values.chonnhanvien,
        };
        let jwtToken = await encodeDataToJWT(dataLogin, secretKey);
        localStorage.setItem("token", jwtToken);
        navigate("/");
      } else if (
        values.chonnhanvien === "Nguyễn Văn Hữu" &&
        values.matkhau === "123"
      ) {
        let dataLogin = {
          username: values.chonnhanvien,

          role: "Người nhập",
          hovaten: values.chonnhanvien,
        };
        let jwtToken = await encodeDataToJWT(dataLogin, secretKey);
        localStorage.setItem("token", jwtToken);
        navigate("/");
      } else {
        let res = await axios.post("http://172.16.0.53:8080/api/auth/login", {
          username: values.chonnhanvien,
          password: values.matkhau,
        });
        if (res && res.data) {
          let dataLogin = {
            username: values.chonnhanvien,

            role: "Người duyệt",
            hovaten: values.chonnhanvien,
          };

          let jwtToken = await encodeDataToJWT(dataLogin, secretKey);
          localStorage.setItem("token", jwtToken);
          navigate("/");
        }
      }
    } catch (error) {
      api["error"]({
        message: "Thất bại",
        description: "Đã xảy ra lỗi trong quá trình đăng nhập",
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
          ĐĂNG NHẬP PHẦN MỀM QUẢN LÝ MỰC IN
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
            label="Tên nhân viên"
            name="chonnhanvien"
            rules={[
              {
                required: true,
                message: "Chọn tên nhân viên",
              },
            ]}
          >
            <Select
              showSearch
              placeholder="Chọn tên nhân viên"
              allowClear
              style={{ width: "100%" }}
            >
              <Option value="Thầu">Thầu</Option>
              <Option value="Nguyễn Văn Hữu">Nguyễn Văn Hữu</Option>
              {dataNhanVien.map((item, index) => {
                return <Option value={item.HOTEN}>{item.HOTEN}</Option>;
              })}
            </Select>
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
