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
import { Button, notification, Select } from "antd";
import { Helmet } from "react-helmet";
import fontPath from "../fonts/Roboto-Black.ttf";
import { PrinterFilled, UserOutlined } from "@ant-design/icons";
import { useReactToPrint } from "react-to-print";
import { PrintTemplateTonKho } from "./print-template/PrintTemplateTonKho";
import Dropdown from "react-bootstrap/Dropdown";
import { Option } from "antd/es/mentions";

const TonKho = (props) => {
  const [dataTonkho, setDataTonKho] = useState([]);
  const [dataDaXuat, setDataDaXuat] = useState([]);
  const [dataDaNhap, setDataDaNhap] = useState([]);
  const [role, setRole] = useState("");
  const [decodeWorkerLoginInfo] = useState(
    () => new Worker("decodeWorkerLoginInfo.js")
  );
  const [decodeWorkerData] = useState(() => new Worker("decodeWorkerData.js"));
  const [decodeWorkerRole] = useState(() => new Worker("decodeWorkerRole.js"));

  const [danhSachThau, setDanhSachThau] = useState([]);

  const [filterThau, setFilterThau] = useState("");

  const [tendangnhap, setTendangnhap] = useState("");

  const [loadingTonKho, setLoadingTonKho] = useState(true);

  const [status, setStatus] = useState("");

  const [api, contextHolder] = notification.useNotification();

  const navigate = useNavigate();

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleDecodeLoginInfo = (encodedString) => {
    return new Promise((resolve, reject) => {
      if (decodeWorkerLoginInfo) {
        decodeWorkerLoginInfo.postMessage(encodedString);
        decodeWorkerLoginInfo.onmessage = function (e) {
          resolve(e.data);
        };
      } else {
        console.log("Giải mã thông tin đăng nhập không thành công");
      }
    });
  };

  const handleDecodeData = (encodedString) => {
    return new Promise((resolve, reject) => {
      if (decodeWorkerData) {
        decodeWorkerData.postMessage(encodedString);
        decodeWorkerData.onmessage = function (e) {
          resolve(e.data);
        };
      } else {
        console.log("Giải mã danh sách không thành công");
      }
    });
  };

  const handleDecodeRole = (encodedString) => {
    return new Promise((resolve, reject) => {
      if (decodeWorkerRole) {
        decodeWorkerRole.postMessage(encodedString);
        decodeWorkerRole.onmessage = function (e) {
          resolve(e.data);
        };
      } else {
        console.log("Giải mã vai trò không thành công");
      }
    });
  };

  useEffect(() => {
    props.setProgress(100);
  }, []);

  useEffect(() => {
    try {
      const checkAlreadyLogin = async () => {
        let token = localStorage.getItem("token");
        if (!token) {
          navigate("/dangnhap");
        } else {
          let decodeToken = await handleDecodeLoginInfo(token);
          setTendangnhap(decodeToken?.username);
        }
      };
      checkAlreadyLogin();
    } catch (error) {
      api["error"]({
        message: "Lỗi",
        description: "Đã xảy ra lỗi trong quá trình kiểm tra đăng nhập",
      });
    }
  }, []);

  useEffect(() => {
    const getRole = async () => {
      try {
        let decodeToken = await handleDecodeRole(localStorage.getItem("token"));

        setRole(decodeToken.role);
      } catch (error) {
        api["error"]({
          message: "Lỗi",
          description: "Đã xảy ra lỗi trong quá trình lấy vai trò người dùng",
        });
      }
    };

    getRole();
  }, []);

  useEffect(() => {
    const fetchDataTonKho = async () => {
      try {
        let res = await axios.get("http://172.16.0.53:8080/danh_sach");
        if (res && res.data) {
          let tonkhoArr = [];
          let xuatArr = [];
          let nhapArr = [];

          const listData = res?.data;

          const decodedData = [];
          for (const item of listData) {
            try {
              let dataDecode = await handleDecodeData(item.content);

              decodedData.push({
                ...item,
                decodedContent: dataDecode,
              });
            } catch (error) {
              console.error("Error decoding item:", item, error);
              api["error"]({
                message: "Lỗi",
                description:
                  "Đã xảy ra lỗi trong quá trình hiển thị danh sách tồn kho",
              });
            }
          }

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

          const filteredData = tonkhoArr.filter((item) => {
            // Nếu không có filter thì trả về tất cả
            if (!filterThau) return true;

            // Nếu có filter thì lọc theo filterThau hoặc nguoinhapmucin rỗng
            return (
              item.nguoinhapmucin === filterThau ||
              item.nguoinhapmucin === undefined
            );
          });

          const uniqueThau = [
            ...new Set(
              tonkhoArr
                .filter(
                  (item) =>
                    item.loaiphieu === "Phiếu nhập" && item.nguoinhapmucin
                )
                .map((item) => item.nguoinhapmucin)
            ),
          ];

          setDanhSachThau(uniqueThau);
          setDataDaXuat(xuatArr);
          setDataDaNhap(nhapArr);
          setDataTonKho(filteredData);
          setLoadingTonKho(false);
          setStatus("Fetch");
        }
      } catch (error) {
        api["error"]({
          message: "Thất bại",
          description:
            "Đã xảy ra lỗi trong quá trình hiển thị danh sách tồn kho",
        });
      }
    };
    fetchDataTonKho();
  }, [status]);

  const handleFilterThau = (value) => {
    setFilterThau(value);
    setStatus("Filter");
  };

  const handleDangXuat = () => {
    localStorage.removeItem("token");

    navigate("/dangnhap");
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
        accessorKey: "qrcode",
        header: "Mã QRCode",
        size: 150,
      },
      {
        accessorKey: "tenphieu",
        header: "Tên phiếu",
        size: 150,
      },
      {
        accessorKey: "thoigiannhapmucin",
        header: "Thời gian nhập",
        size: 200,
      },
      {
        accessorKey: "nguoinhapmucin",
        header: "Người nhập",
        size: 150,
        Cell: ({ cell }) => cell.getValue() || "Công ty TNHH Ngọc",
      },
    ],
    []
  );

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
          "Tên phiếu": rowData[i].tenphieu,
          "Thời gian nhập mực in": rowData[i].thoigiannhapmucin,
          "Người nhập mực in": rowData[i].nguoinhapmucin,
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

      let rearrangedArray = tableData.map((arr, i) => [
        i + 1,
        arr[0],
        arr[1],
        arr[3],
        arr[5],
        arr.length === 9 || arr.length === 8 ? "" : arr[6],
        arr.length === 9 || arr.length === 8 ? "" : arr[7],
        arr[8],
        arr[2],
        arr[4],
      ]);

      autoTable(doc, {
        head: [tableHeaders],
        body: rearrangedArray,
        styles: { font: "Roboto", fontStyle: "normal", fontSize: 8 },
      });

      doc.save("danhsachtonkho.pdf");
    } catch (error) {
      api["error"]({
        message: "Thất bại",
        description: "Đã xảy ra lỗi trong quá trình xuất file PDF",
      });
    }
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
        <div className="mt-3 mb-3 d-flex">
          <Link to="/danhsachphieu">
            <button type="button" className="btn btn-info me-2">
              Trang chủ
            </button>
          </Link>
          <Link to="/hoantramuc">
            <button type="button" className="btn btn-dark me-2">
              Thu hồi vỏ mực
            </button>
          </Link>
          <Link to="/suachuamucin">
            <button type="button" className="btn btn-primary me-2">
              Sửa chữa mực
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

          {role === "Người duyệt" || role === "Người xuất" ? (
            <>
              <div className="dropdown me-2">
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
          <Dropdown data-bs-theme="dark">
            <Dropdown.Toggle id="dropdown-button-dark" variant="secondary">
              <UserOutlined />
              {tendangnhap}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={handleDangXuat}>Đăng xuất</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <h4 className="text-center mt-5 mb-5">DANH SÁCH TỒN KHO</h4>
        <Select
          placeholder="Lọc tồn kho theo thầu"
          allowClear
          style={{ width: 250 }}
          onChange={(value) => handleFilterThau(value)}
        >
          {danhSachThau.map((item) => (
            <Option key={item} value={item}>
              {item}
            </Option>
          ))}
        </Select>
        <div className="mb-3 mt-3">
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
