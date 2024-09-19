import axios from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as jose from "jose";
import { Button, notification } from "antd";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import ButtonBootstrap from "react-bootstrap/Button";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Box } from "@mui/material";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import fontPath from "../fonts/Roboto-Black.ttf";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import { PrinterFilled } from "@ant-design/icons";
import { useReactToPrint } from "react-to-print";
import { PrintTemplateDanhSachMucInDaNhap } from "./print-template/PrintTemplateDanhSachMucInDaNhap";

const DanhSachMucInDaNhap = (props) => {
  const [danhSachDaNhap, setDanhSachDaNhap] = useState([]);
  const [loadingDanhSachDaNhap, setLoadingDanhSachDaNhap] = useState(true);
  const [dataTonkho, setDataTonKho] = useState([]);
  const [dataDaXuat, setDataDaXuat] = useState([]);
  const [role, setRole] = useState("");

  const [api, contextHolder] = notification.useNotification();

  const navigate = useNavigate();

  const secretKey = "your-secret-key";

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

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
      if (!token) {
        navigate("/dangnhap");
      }
    } catch (error) {
      api["error"]({
        message: "Lỗi",
        description: "Đã xảy ra lỗi trong quá trình hiển thị dữ liệu",
      });
    }
  }, []);

  useEffect(() => {
    const fetchDanhSachDaNhap = async () => {
      try {
        let res = await axios.get("http://172.16.0.53:8080/danh_sach");
        if (res && res.data) {
          let tonkhoArr = [];
          let xuatArr = [];
          let danhsachdanhapArr = [];

          const decodedData = await Promise.all(
            res.data.map(async (item) => {
              let dataDecode = await decodeJWT(item?.content, secretKey);

              return {
                ...item,
                decodedContent: dataDecode,
              };
            })
          );

          for (let i = 0; i < decodedData.length; i++) {
            if (
              decodedData[i].decodedContent?.content?.danhsachphieu
                ?.trangthai === "Đã xuất"
            ) {
              let danhsachmucinxuatkho =
                decodedData[i].decodedContent?.content?.danhsachphieu
                  ?.danhsachmucincuaphieu;
              xuatArr = [...xuatArr, ...danhsachmucinxuatkho];
            }
          }

          for (let i = 0; i < decodedData.length; i++) {
            if (
              decodedData[i].decodedContent?.content?.danhsachphieu
                ?.trangthai === "Đã duyệt"
            ) {
              let danhsachmucinthemvaokho =
                decodedData[i].decodedContent?.content?.danhsachtonkho
                  ?.danhsachmucinthemvaokho;
              tonkhoArr = [...tonkhoArr, ...danhsachmucinthemvaokho];
            }
          }

          for (let i = 0; i < decodedData.length; i++) {
            if (
              decodedData[i].decodedContent?.content?.danhsachphieu
                ?.trangthai === "Đã duyệt"
            ) {
              let danhsachmucinnhapkho =
                decodedData[i].decodedContent?.content?.danhsachphieu
                  ?.danhsachmucincuaphieu;
              danhsachdanhapArr = [
                ...danhsachdanhapArr,
                ...danhsachmucinnhapkho,
              ];
            }
          }

          // Thêm id vào từng phần tử của tonkhoArr
          let idCounter = 1;
          danhsachdanhapArr = danhsachdanhapArr.map((item) => ({
            ...item,
            stt: idCounter++,
          }));

          setDataDaXuat(xuatArr);
          setDataTonKho(tonkhoArr);
          setDanhSachDaNhap(danhsachdanhapArr);
          setLoadingDanhSachDaNhap(false);
        }
      } catch (error) {
        api["error"]({
          message: "Thất bại",
          description: "Đã xảy ra lỗi trong quá trình hiển thị dữ liệu",
        });
      }
    };
    fetchDanhSachDaNhap();
  }, []);

  const handleExportRowsExcel = (rows) => {
    try {
      const rowData = rows.map((row) => row.original);

      let configDataArr = [];

      for (let i = 0; i < rowData.length; i++) {
        let configData = {
          STT: rows[i].index + 1,
          "Mã QRCode": rowData[i].qrcode,
          "Tên mực": rowData[i].tenmuc,
          "Mã mực": rowData[i].mamuc,
          "Số lượng": rowData[i].soluong,
          "Tên phiếu": rowData[i].tenphieu,
        };

        configDataArr.push(configData);
      }
      // Tạo một workbook mới
      const wb = XLSX.utils.book_new();

      // Chuyển đổi dữ liệu thành worksheet
      const ws = XLSX.utils.json_to_sheet(configDataArr);

      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(wb, ws, "Danh sách mực in đã nhập");

      // Tạo buffer
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

      // Chuyển buffer thành Blob
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });

      // Lưu file
      saveAs(blob, "danhsachmucindanhap.xlsx");
    } catch (error) {
      api["error"]({
        message: "Thất bại",
        description: "Đã xảy ra lỗi trong quá trình xuất file Excel",
      });
    }
  };

  const handleExportRowsPDF = (rows) => {
    try {
      const doc = new jsPDF();

      // Thêm font vào PDF
      doc.addFont(fontPath, "Roboto", "normal");
      doc.setFont("Roboto");

      const tableData = rows.map((row) => Object.values(row.original));

      const tableHeaders = columns.map((c) => c.header);

      let rearrangedArray = tableData.map((arr) => [
        arr[7],
        arr[0],
        arr[1],
        arr[5],
        arr[2],
        arr[6],
        arr[3],
        arr[4],
      ]);

      autoTable(doc, {
        head: [tableHeaders],
        body: rearrangedArray,
        styles: { font: "Roboto", fontStyle: "normal" },
      });

      doc.save("danhsachmucindanhap.pdf");
    } catch (error) {
      api["error"]({
        message: "Thất bại",
        description: "Đã xảy ra lỗi trong quá trình xuất file PDF",
      });
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "stt",
        header: "STT",
        size: 150,
      },
      {
        accessorKey: "tenmuc",
        header: "Tên mực",
        size: 150,
      },
      {
        accessorKey: "mamuc",
        header: "Mã mực",
        size: 150,
      },
      {
        accessorKey: "tenphieu",
        header: "Tên phiếu",
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
    data: danhSachDaNhap,
    enableHiding: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    state: { isLoading: loadingDanhSachDaNhap },
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
    renderTopToolbarCustomActions: ({ table }) => (
      <Box
        sx={{
          display: "flex",
          gap: "15px",
          padding: "8px",
          flexWrap: "wrap",
        }}
      >
        <ButtonBootstrap
          className="btn btn-success"
          disabled={table.getPrePaginationRowModel().rows.length === 0}
          onClick={() =>
            handleExportRowsExcel(table.getPrePaginationRowModel().rows)
          }
        >
          <FileDownloadIcon />
          Xuất file Excel
        </ButtonBootstrap>
        <ButtonBootstrap
          className="btn btn-danger"
          disabled={table.getPrePaginationRowModel().rows.length === 0}
          onClick={() =>
            handleExportRowsPDF(table.getPrePaginationRowModel().rows)
          }
        >
          <FileDownloadIcon />
          Xuất file PDF
        </ButtonBootstrap>
      </Box>
    ),
  });

  const getRole = async () => {
    try {
      let decodeToken = await decodeJWT(
        localStorage.getItem("token"),
        secretKey
      );

      setRole(decodeToken.role);
    } catch (error) {
      api["error"]({
        message: "Lỗi",
        description: "Đã xảy ra lỗi trong quá trình hiển thị dữ liệu",
      });
    }
  };

  getRole();

  return (
    <>
      {contextHolder}
      <Helmet>
        <meta charSet="utf-8" />
        <title>Danh sách mực in đã nhập</title>
      </Helmet>
      <div className="container">
        <div className="text-center mt-5">
          <img src="../img/logo2.png" alt="" />
        </div>
        <div className="mt-2 mb-3">
          <Link to="/danhsachphieu">
            <button type="button" className="btn btn-info me-2">
              Trang chủ
            </button>
          </Link>
          <Link to="/tonkho">
            <button type="button" className="btn btn-warning me-2">
              Tồn kho <span class="badge bg-danger">{dataTonkho.length}</span>
            </button>
          </Link>
          {role === "Người duyệt" ? (
            <>
              {" "}
              <Link to="/danhsachmucindaxuat">
                <button type="button" className="btn btn-danger me-2">
                  Đã xuất{" "}
                  <span class="badge bg-success">{dataDaXuat.length}</span>
                </button>
              </Link>
            </>
          ) : (
            <></>
          )}
          {role === "Người duyệt" ? (
            <>
              <div className="dropdown mt-2">
                <button
                  type="button"
                  className="btn btn-primary dropdown-toggle"
                  data-bs-toggle="dropdown"
                >
                  Thống kê
                </button>
                <ul class="dropdown-menu">
                  <li>
                    <Link className="dropdown-item" to={"/thongkenhap"}>
                      Thống kê nhập
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to={"/thongkexuat"}>
                      Thống kê xuất
                    </Link>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
        <h4 className="text-center mt-5 mb-5">DANH SÁCH MỰC IN ĐÃ NHẬP</h4>
        <div className="mb-3">
          {danhSachDaNhap && danhSachDaNhap.length > 0 ? (
            <>
              {" "}
              <Button type="primary" htmlType="submit" onClick={handlePrint}>
                <PrinterFilled />
                In danh sách
              </Button>
            </>
          ) : (
            <>
              {" "}
              <Button type="primary" htmlType="submit" disabled>
                <PrinterFilled />
                In danh sách
              </Button>
            </>
          )}
        </div>
        <div className="mb-5 mt-3">
          <MaterialReactTable table={table} />
        </div>
      </div>
      <div style={{ display: "none" }}>
        <PrintTemplateDanhSachMucInDaNhap
          ref={componentRef}
          data={danhSachDaNhap}
        />
      </div>
    </>
  );
};

export default DanhSachMucInDaNhap;