import { Box } from "@mui/material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ButtonBootstrap from "react-bootstrap/Button";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import axios from "axios";
import * as jose from "jose";
import { Button, notification } from "antd";
import { Helmet } from "react-helmet";
import fontPath from "../fonts/Roboto-Black.ttf";
import { PrinterFilled } from "@ant-design/icons";
import { useReactToPrint } from "react-to-print";
import { PrintTemplateTonKho } from "./print-template/PrintTemplateTonKho";

const TonKho = (props) => {
  const [dataTonkho, setDataTonKho] = useState([]);
  const [dataDaXuat, setDataDaXuat] = useState([]);
  const [dataDaNhap, setDataDaNhap] = useState([]);

  const secretKey = "your-secret-key";

  const [loadingTonKho, setLoadingTonKho] = useState(true);

  const [api, contextHolder] = notification.useNotification();

  const navigate = useNavigate();

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
    const fetchDataTonKho = async () => {
      try {
        let res = await axios.get("http://172.16.0.53:8080/danh_sach");
        if (res && res.data) {
          let tonkhoArr = [];
          let xuatArr = [];
          let nhapArr = [];

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
              let danhsachmucinnhapkho =
                decodedData[i].decodedContent?.content?.danhsachphieu
                  ?.danhsachmucincuaphieu;
              nhapArr = [...nhapArr, ...danhsachmucinnhapkho];
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

          // Thêm id vào từng phần tử của tonkhoArr
          let idCounter = 1;
          tonkhoArr = tonkhoArr.map((item) => ({
            ...item,
            stt: idCounter++,
          }));

          setDataDaXuat(xuatArr);
          setDataDaNhap(nhapArr);
          setDataTonKho(tonkhoArr);
          setLoadingTonKho(false);
        }
      } catch (error) {
        api["error"]({
          message: "Thất bại",
          description: "Đã xảy ra lỗi trong quá trình hiển thị dữ liệu",
        });
      }
    };
    fetchDataTonKho();
  }, []);

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

  const handleExportRowsExcel = (rows) => {
    const rowData = rows.map((row) => row.original);

    let configDataArr = [];

    for (let i = 0; i < rowData.length; i++) {
      let configData = {
        STT: rows[i].index + 1,
        "Mã QRCode": rowData[i].qrcode,
        "Tên mực": rowData[i].tenmuc,
        "Mã mực": rowData[i].mamuc,
        "Số lượng": rowData[i].soluong,
        "Loại phiếu": rowData[i].loaiphieu,
        "Tên phiếu": rowData[i].tenphieu,
      };

      configDataArr.push(configData);
    }
    // Tạo một workbook mới
    const wb = XLSX.utils.book_new();

    // Chuyển đổi dữ liệu thành worksheet
    const ws = XLSX.utils.json_to_sheet(configDataArr);

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(wb, ws, "Danh sách tồn kho");

    // Tạo buffer
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    // Chuyển buffer thành Blob
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    // Lưu file
    saveAs(blob, "danhsachtonkho.xlsx");
  };

  const handleExportRowsPDF = (rows) => {
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

    doc.save("danhsachtonkho.pdf");
  };

  const table = useMaterialReactTable({
    columns,
    data: dataTonkho,
    enableHiding: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    state: { isLoading: loadingTonKho },
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

  return (
    <>
      {contextHolder}
      <Helmet>
        <meta charSet="utf-8" />
        <title>Tồn kho</title>
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
          <Link to="/danhsachmucindanhap">
            <button type="button" className="btn btn-success me-2">
              Đã nhập <span class="badge bg-danger">{dataDaNhap.length}</span>
            </button>
          </Link>
          <Link to="/danhsachmucindaxuat">
            <button type="button" className="btn btn-danger me-2">
              Đã xuất <span class="badge bg-success">{dataDaXuat.length}</span>
            </button>
          </Link>

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
        </div>
        <h4 className="text-center mt-5 mb-5">DANH SÁCH TỒN KHO</h4>
        <div className="mb-3">
          {dataTonkho && dataTonkho.length > 0 ? (
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
        <PrintTemplateTonKho ref={componentRef} data={dataTonkho} />
      </div>
    </>
  );
};

export default TonKho;
