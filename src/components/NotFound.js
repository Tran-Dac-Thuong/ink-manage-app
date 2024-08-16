import { Button, Result } from "antd";
import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Trang không tồn tại</title>
      </Helmet>
      <Result
        status="404"
        title="404"
        subTitle="Xin lỗi, trang bạn truy cập không tồn tại."
        extra={
          <Link to="/danhsachphieu">
            <Button type="primary">Quay về trang chủ</Button>
          </Link>
        }
      />
    </>
  );
};

export default NotFound;
