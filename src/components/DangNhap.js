import React, { useEffect, useState } from "react";
import { Button, Form, Input, notification, Select, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import axios from "axios";
import { Option } from "antd/es/mentions";

const DangNhap = (props) => {
  const [form] = Form.useForm();

  const [api, contextHolder] = notification.useNotification();

  const [dataNhanVien, setDataNhanVien] = useState([]);

  const [encodeWorkerDangNhap] = useState(
    () => new Worker("encodeWorkerDangNhap.js")
  );

  const navigate = useNavigate();

  const handleEncodeDangNhap = (data) => {
    return new Promise((resolve, reject) => {
      if (encodeWorkerDangNhap) {
        encodeWorkerDangNhap.postMessage(data);
        encodeWorkerDangNhap.onmessage = function (e) {
          resolve(e.data);
        };
      } else {
        console.log("Mã hóa dữ liệu đăng nhập không thành công");
      }
    });
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
    if (
      values.chonnhanvien === "Công ty TNHH Ngọc" &&
      values.matkhau !== "123"
    ) {
      api["error"]({
        message: "Thất bại",
        description: "Mật khẩu không đúng. Vui lòng thử lại",
      });
      return;
    }

    if (
      values.chonnhanvien === "Phòng Công Nghệ Thông Tin" &&
      values.matkhau !== "1234"
    ) {
      api["error"]({
        message: "Thất bại",
        description: "Mật khẩu không đúng. Vui lòng thử lại",
      });
      return;
    }

    if (
      values.chonnhanvien === "Công ty TNHH Ngọc" &&
      values.matkhau === "123"
    ) {
      let dataLogin = {
        username: values.chonnhanvien,

        role: "Người nhập không xuất",
        hovaten: values.chonnhanvien,
      };

      let jwtToken = await handleEncodeDangNhap(dataLogin);
      localStorage.setItem("token", jwtToken);

      navigate("/");
    } else if (
      values.chonnhanvien === "Phòng Công Nghệ Thông Tin" &&
      values.matkhau === "1234"
    ) {
      let dataLogin = {
        username: values.chonnhanvien,

        role: "Người nhập và xuất",
        hovaten: values.chonnhanvien,
      };

      let jwtToken = await handleEncodeDangNhap(dataLogin);
      localStorage.setItem("token", jwtToken);

      navigate("/");
    } else {
      try {
        let res = await axios.post("http://172.16.0.53:8080/api/auth/login", {
          username: values.chonnhanvien,
          password: values.matkhau,
        });
        if (res) {
          let dataLogin = {
            username: values.chonnhanvien,

            role: "Người duyệt",
            hovaten: values.chonnhanvien,
          };

          let jwtToken = await handleEncodeDangNhap(dataLogin);
          localStorage.setItem("token", jwtToken);
          navigate("/");
        }
      } catch (error) {
        api["error"]({
          message: "Thất bại",
          description: "Mật khẩu không đúng. Vui lòng thử lại",
        });
      }
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
              <Option value="Công ty TNHH Ngọc">Công ty TNHH Ngọc</Option>
              <Option value="Phòng Công Nghệ Thông Tin">
                Phòng Công Nghệ Thông Tin
              </Option>
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
                whitespace: true,
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
