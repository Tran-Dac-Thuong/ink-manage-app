import { Button, Result } from "antd";
import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

const Forbidden = () => {
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Trang không được quyền truy cập</title>
      </Helmet>
      <Result
        status="403"
        title="403"
        subTitle="Xin lỗi, bạn không được phép truy cập trang này."
        extra={
          <Link to="/danhsachphieu">
            <Button type="primary">Quay về trang chủ</Button>
          </Link>
        }
      />
    </>
  );
};

export default Forbidden;
