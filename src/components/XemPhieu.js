import { PrinterFilled } from "@ant-design/icons";
import { Button, ConfigProvider, notification, QRCode, Space } from "antd";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { PrintTemplatePhieuNhap } from "./print-template/PrintTemplatePhieuNhap";
import { PrintTemplatePhieuXuat } from "./print-template/PrintTemplatePhieuXuat";
import { Helmet } from "react-helmet";

const XemPhieu = (props) => {
  const [data, setData] = useState([]);

  const [loadingXemPhieu, setLoadingXemPhieu] = useState(true);

  const [api, contextHolder] = notification.useNotification();

  const dataXemPhieu = useParams();

  const navigate = useNavigate();

  let { state } = useLocation();

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  useEffect(() => {
    props.setProgress(100);
  }, []);

  useEffect(() => {
    try {
      let token = localStorage.getItem("token");
      if (!token) {
        navigate("/dangnhap");
      }
      setData(state?.dataMucInCuaPhieu);
      setLoadingXemPhieu(false);
    } catch (error) {
      api["error"]({
        message: "Thất bại",
        description: "Đã xảy ra lỗi trong quá trình hiển thị dữ liệu",
      });
    }
  }, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: "stt",
        header: "STT",
        size: 150,
        Cell: ({ row }) => {
          return <span>{row.index + 1}</span>;
        },
      },

      {
        accessorKey: "qrcode",
        header: "Mực in",
        size: 150,
      },
      {
        accessorKey: "soluong",
        header: "Số lượng",
        size: 150,
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data,
    enableHiding: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    state: { isLoading: loadingXemPhieu },
    muiCircularProgressProps: {
      color: "primary",
      thickness: 5,
      size: 55,
    },
    muiSkeletonProps: {
      animation: "pulse",
      height: 28,
    },
    paginationDisplayMode: "pages",
  });

  return (
    <>
      {contextHolder}
      <Helmet>
        <meta charSet="utf-8" />
        <title>Xem phiếu</title>
      </Helmet>
      <div className="container">
        <div className="text-center mt-5">
          <img src="../../img/logo2.png" alt="" />
        </div>
        <div className="mt-2 mb-3">
          <Link to="/danhsachphieu">
            <button type="button" className="btn btn-success me-2">
              Trang chủ
            </button>
          </Link>
        </div>
        {dataXemPhieu?.loaiphieu === "Phiếu nhập" ? (
          <>
            <h4
              className="text-center mt-5 mb-5"
              style={{ textTransform: "uppercase" }}
            >
              {dataXemPhieu?.loaiphieu}
            </h4>

            <div className="d-flex gap-3 mb-3">
              <div className="">
                <Space>
                  <QRCode type="svg" value={dataXemPhieu?.id} />
                </Space>
              </div>
              <div className="">
                <h5>
                  NGƯỜI LÀM PHIẾU:{" "}
                  <span className="text-danger">
                    {dataXemPhieu?.nguoitaophieu}
                  </span>
                </h5>
                <h5>
                  THỜI GIAN LÀM PHIẾU:{" "}
                  <span className="text-danger">
                    {dataXemPhieu?.ngaytaophieu}
                  </span>
                </h5>
                <h5>
                  NGƯỜI DUYỆT PHIẾU:{" "}
                  <span className="text-danger">
                    {dataXemPhieu?.nguoiduyetphieu}
                  </span>
                </h5>
                <h5>
                  THỜI GIAN DUYỆT PHIẾU:{" "}
                  <span className="text-danger">
                    {dataXemPhieu?.ngayduyetphieu}
                  </span>
                </h5>
                <h5>
                  MÃ SỐ PHIẾU:{" "}
                  <span className="text-danger">{dataXemPhieu?.id}</span>
                </h5>
                <h5>
                  TÊN PHIẾU:{" "}
                  <span className="text-danger">{dataXemPhieu?.tenphieu}</span>
                </h5>
              </div>
            </div>
            <div className="mb-3">
              <ConfigProvider
                theme={{
                  components: {
                    Button: {
                      colorPrimary: "#00B96B",
                      algorithm: true,
                    },
                  },
                }}
              >
                <Button type="primary" htmlType="submit" onClick={handlePrint}>
                  <PrinterFilled />
                  In phiếu
                </Button>
              </ConfigProvider>
            </div>
          </>
        ) : (
          <>
            <h4
              className="text-center mt-5 mb-5"
              style={{ textTransform: "uppercase" }}
            >
              {dataXemPhieu?.loaiphieu}
            </h4>

            <div className="d-flex gap-3 mb-3">
              <div className="">
                <Space>
                  <QRCode type="svg" value={dataXemPhieu?.id} />
                </Space>
              </div>
              <div className="">
                <h5>
                  NGƯỜI LÀM PHIẾU:{" "}
                  <span className="text-danger">
                    {dataXemPhieu?.nguoitaophieu}
                  </span>
                </h5>
                <h5>
                  THỜI GIAN LÀM PHIẾU:{" "}
                  <span className="text-danger">
                    {dataXemPhieu?.ngaytaophieu}
                  </span>
                </h5>
                <h5>
                  ĐÃ XUẤT VÀO LÚC:{" "}
                  <span className="text-danger">
                    {dataXemPhieu?.thoigianxuat}
                  </span>
                </h5>
                <h5>
                  XUẤT CHO:{" "}
                  <span className="text-danger">{state?.khoaphong}</span>
                </h5>
                <h5>
                  MÃ SỐ PHIẾU:{" "}
                  <span className="text-danger">{dataXemPhieu?.id}</span>
                </h5>
                <h5>
                  TÊN PHIẾU:{" "}
                  <span className="text-danger">{dataXemPhieu?.tenphieu}</span>
                </h5>
              </div>
            </div>
            <div className="mb-3">
              <ConfigProvider
                theme={{
                  components: {
                    Button: {
                      colorPrimary: "#00B96B",
                      algorithm: true,
                    },
                  },
                }}
              >
                <Button type="primary" htmlType="submit" onClick={handlePrint}>
                  <PrinterFilled />
                  In phiếu
                </Button>
              </ConfigProvider>
            </div>
          </>
        )}
        <MaterialReactTable table={table} />
      </div>

      {dataXemPhieu?.loaiphieu === "Phiếu nhập" ? (
        <>
          <div style={{ display: "none" }}>
            <PrintTemplatePhieuNhap
              ref={componentRef}
              data={data}
              nguoilamphieu={dataXemPhieu?.nguoitaophieu}
              masophieu={dataXemPhieu?.id}
            />
          </div>
        </>
      ) : (
        <>
          {" "}
          <div style={{ display: "none" }}>
            <PrintTemplatePhieuXuat
              ref={componentRef}
              data={data}
              nguoilamphieu={dataXemPhieu?.nguoitaophieu}
              masophieu={dataXemPhieu?.id}
              khoaphong={state?.khoaphong}
            />
          </div>
        </>
      )}
    </>
  );
};

export default XemPhieu;
