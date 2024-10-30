import { PrinterFilled, UserOutlined } from "@ant-design/icons";
import { Button, notification } from "antd";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
import { Box } from "@mui/material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ButtonBootstrap from "react-bootstrap/Button";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { PrintTemplateThongKeMucInDaNhap } from "./print-template/PrintTemplateThongKeMucInDaNhap";
import Dropdown from "react-bootstrap/Dropdown";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

const ThongKeNhap = (props) => {
  const [loadingDataMucInDaNhap, setLoadingDataMucInDaNhap] = useState(true);
  const [dataTonkho, setDataTonKho] = useState([]);
  const [dataDaXuat, setDataDaXuat] = useState([]);
  const [dataDaNhap, setDataDaNhap] = useState([]);
  const [dataMucInDaNhap, setDataMucInDaNhap] = useState([]);

  const [tendangnhap, setTendangnhap] = useState("");
  const [role, setRole] = useState("");
  const [decodeWorkerLoginInfo] = useState(
    () => new Worker("decodeWorkerLoginInfo.js")
  );
  const [decodeWorkerData] = useState(() => new Worker("decodeWorkerData.js"));
  const [decodeWorkerRole] = useState(() => new Worker("decodeWorkerRole.js"));
  const [api, contextHolder] = notification.useNotification();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [inkNameMapping, setInkNameMapping] = useState({
    // 276: "haibaysau",
    // "49A": "bonchinA",
    // 337: "bababay",
    // "78A": "baytamA",
    // "052": "khongnamhai",
    // 319: "bamotchin",
    // "12A": "muoihaiA",
    // "17A": "muoibayA",
    // "003 (Đen)": "khongkhongbaden",
    // "003 (Vàng)": "khongkhongbavang",
    // "003 (Hồng)": "khongkhongbahong",
    // "003 (Xanh)": "khongkhongbaxanh",
    // "664 (Đen)": "sausaubonden",
    // "664 (Vàng)": "sausaubonvang",
    // "664 (Hồng)": "sausaubonhong",
    // "664 (Xanh)": "sausaubonxanh",
    // "005 (Đen)": "khongkhongnamden",
    // "774 (Đen)": "baybaybonden",
  });

  const navigate = useNavigate();

  const componentRefMotThang = useRef();

  const handlePrintMucInDaNhapMotThang = useReactToPrint({
    content: () => componentRefMotThang.current,
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
          if (decodeToken?.role === "Người nhập") {
            navigate("/forbidden");
          }
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
    fetchDataSearch();
  }, []);

  const fetchDataSearch = async () => {
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
                "Đã xảy ra lỗi trong quá trình hiển thị thống kê nhập",
            });
          }
        }

        for (let i = 0; i < decodedData.length; i++) {
          if (
            decodedData[i].decodedContent?.content?.danhsachphieu?.trangthai ===
            "Đã xuất"
          ) {
            let danhsachmucinxuatkho =
              decodedData[i].decodedContent?.content?.danhsachphieu
                ?.danhsachmucincuaphieu;
            xuatArr = [...xuatArr, ...danhsachmucinxuatkho];
          }
        }

        for (let i = 0; i < decodedData.length; i++) {
          if (
            decodedData[i].decodedContent?.content?.danhsachphieu?.trangthai ===
            "Đã duyệt"
          ) {
            let danhsachmucinnhapkho =
              decodedData[i].decodedContent?.content?.danhsachphieu
                ?.danhsachmucincuaphieu;
            nhapArr = [...nhapArr, ...danhsachmucinnhapkho];
          }
        }

        for (let i = 0; i < decodedData.length; i++) {
          if (
            decodedData[i].decodedContent?.content?.danhsachphieu?.trangthai ===
            "Đã duyệt"
          ) {
            let danhsachmucinthemvaokho =
              decodedData[i].decodedContent?.content?.danhsachtonkho
                ?.danhsachmucinthemvaokho;
            tonkhoArr = [...tonkhoArr, ...danhsachmucinthemvaokho];
          }
        }

        setDataDaXuat(xuatArr);
        setDataDaNhap(nhapArr);
        setDataTonKho(tonkhoArr);

        setLoadingDataMucInDaNhap(false);
      }
    } catch (error) {
      api["error"]({
        message: "Thất bại",
        description: "Đã xảy ra lỗi trong quá trình hiển thị dữ liệu",
      });
    }
  };

  const handleExportRowsExcelMucInDaNhapMotThang = (rows) => {
    try {
      const rowData = rows.map((row) => row.original);

      let configDataArr = [];

      for (let i = 0; i < rowData.length; i++) {
        let configData = {
          "Tổng cộng": rowData[i].tongSo,
        };

        Object.entries(inkNameMapping).forEach(([inkName, mappedName]) => {
          configData[`Mực ${inkName}`] = rowData[i][mappedName];
        });

        configDataArr.push(configData);
      }

      // Tạo một workbook mới
      const wb = XLSX.utils.book_new();

      // Chuyển đổi dữ liệu thành worksheet
      const ws = XLSX.utils.json_to_sheet(configDataArr);

      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(wb, ws, "Mực in đã nhập trong 1 tháng");

      // Tạo buffer
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

      // Chuyển buffer thành Blob
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });

      // Lưu file
      saveAs(blob, "thongkemucindanhaptrongmotthang.xlsx");
    } catch (error) {
      api["error"]({
        message: "Thất bại",
        description: "Đã xảy ra lỗi trong quá trình xuất file Excel",
      });
    }
  };

  const handleDangXuat = () => {
    localStorage.removeItem("token");

    navigate("/dangnhap");
  };

  const handleResetData = () => {
    setFromDate(null);
    setToDate(null);
    setShowTable(false);
  };

  const handleSearchByDate = async () => {
    if (!fromDate || !toDate) {
      api["error"]({
        message: "Thất bại",
        description: "Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc",
      });
      return;
    }

    if (fromDate.$d > toDate.$d) {
      api["error"]({
        message: "Thất bại",
        description: "Thời gian bắt đầu không được lớn hơn thời gian kết thúc",
      });
      return;
    }

    try {
      let res = await axios.get("http://172.16.0.53:8080/danh_sach");
      if (res && res.data) {
        let dataFilterByDateRange = [];

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
                "Đã xảy ra lỗi trong quá trình hiển thị thống kê nhập",
            });
          }
        }

        // Convert selected dates to timestamps for comparison
        const fromTimestamp = fromDate.$d.getTime();
        const toTimestamp = toDate.$d.getTime();

        // Lọc dữ liệu theo khoảng thời gian
        for (let i = 0; i < decodedData.length; i++) {
          if (
            decodedData[i].decodedContent?.content?.danhsachphieu?.trangthai ===
            "Đã duyệt"
          ) {
            let danhsachmucindanhap =
              decodedData[i].decodedContent?.content?.danhsachphieu
                ?.danhsachmucincuaphieu;

            const filteredItems = danhsachmucindanhap.filter((item) => {
              const [datePart, timePart] = item.thoigiannhap.split(" ");
              const [day, month, year] = datePart.split("-");
              const [hours, minutes, seconds] = timePart.split(":");
              const itemTimestamp = new Date(
                year,
                month - 1,
                day,
                hours,
                minutes,
                seconds
              ).getTime();
              return (
                itemTimestamp >= fromTimestamp && itemTimestamp <= toTimestamp
              );
            });

            dataFilterByDateRange = [
              ...dataFilterByDateRange,
              ...filteredItems,
            ];
          }
        }

        const initializeInkCounts = () => {
          const counts = {};
          Object.values(inkNameMapping).forEach((value) => {
            counts[value] = 0;
          });
          return counts;
        };

        const inkCountsFilteredDate = initializeInkCounts();
        let totalCountFilteredDate = 0;

        dataFilterByDateRange.forEach((item) => {
          totalCountFilteredDate += 1;
          if (!inkNameMapping.hasOwnProperty(item.tenmuc)) {
            setInkNameMapping((prevMapping) => ({
              ...prevMapping,
              [item.tenmuc]: item.tenmuc.toLowerCase().replace(/\s+/g, ""),
            }));
          }
          const inkKey =
            inkNameMapping[item.tenmuc] ||
            item.tenmuc.toLowerCase().replace(/\s+/g, "");
          inkCountsFilteredDate[inkKey] =
            (inkCountsFilteredDate[inkKey] || 0) + 1;
        });

        const tableDataFilteredDate = [
          {
            tongSo: totalCountFilteredDate,
            ...Object.fromEntries(
              Object.entries(inkCountsFilteredDate).map(([key, value]) => [
                key,
                value || 0,
              ])
            ),
          },
        ];

        const hasNonZeroValues =
          tableDataFilteredDate[0].tongSo !== 0 ||
          Object.values(inkCountsFilteredDate).some((value) => value !== 0);
        console.log(tableDataFilteredDate);

        if (!hasNonZeroValues) {
          // setDataMucInDaNhap([]);
          setShowTable(false);
        } else {
          setDataMucInDaNhap(tableDataFilteredDate);
          setShowTable(true);
        }
      }
    } catch (error) {
      api["error"]({
        message: "Thất bại",
        description: "Đã xảy ra lỗi trong quá trình tìm kiếm",
      });
    }
  };

  const columnsNhapMucIn = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: "tongSo",
        header: "Tổng cộng",
        size: 80,
      },
    ];

    const dynamicColumns = Object.entries(inkNameMapping).map(
      ([originalName, mappedName]) => ({
        accessorKey: mappedName,
        header: originalName,
        size: 80,
      })
    );

    return [...baseColumns, ...dynamicColumns];
  }, [inkNameMapping]);

  const columnsEmpty = useMemo(() => [], []);

  const tableNhapMucInTheo = useMaterialReactTable({
    columns: columnsNhapMucIn,
    data: dataMucInDaNhap,
    enableHiding: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    state: { isLoading: loadingDataMucInDaNhap },
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
            handleExportRowsExcelMucInDaNhapMotThang(
              table.getPrePaginationRowModel().rows
            )
          }
        >
          <FileDownloadIcon />
          Xuất file Excel
        </ButtonBootstrap>
      </Box>
    ),
  });

  const tableEmpty = useMaterialReactTable({
    columns: columnsEmpty,
    data: [],
    enableHiding: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
  });

  return (
    <>
      {contextHolder}
      <Helmet>
        <meta charSet="utf-8" />
        <title>Thống kê mực in đã nhập</title>
      </Helmet>
      <div className="container">
        <div className="text-center mt-5">
          <img src="../img/logo2.png" alt="" />
        </div>
        <div className="mt-5 mb-3 d-flex">
          <Link to="/danhsachphieu">
            <button type="button" className="btn btn-success me-2">
              Trang chủ
            </button>
          </Link>
          <Link to="/tonkho">
            <button type="button" className="btn btn-warning me-2">
              Tồn kho <span class="badge bg-danger">{dataTonkho.length}</span>
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
        <h4 className="text-center mt-5 mb-5">
          <span>DANH SÁCH SỐ LƯỢNG MỰC IN ĐÃ NHẬP </span>
        </h4>
        <div className="row">
          <div className="">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["DateTimePicker"]}>
                <DateTimePicker
                  label="Chọn thời gian bắt đầu"
                  views={[
                    "year",
                    "month",
                    "day",
                    "hours",
                    "minutes",
                    "seconds",
                  ]}
                  value={fromDate}
                  onChange={(newValue) => setFromDate(newValue)}
                />
              </DemoContainer>
            </LocalizationProvider>
          </div>
          <div className="">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["DateTimePicker"]}>
                <DateTimePicker
                  label="Chọn thời gian kết thúc"
                  views={[
                    "year",
                    "month",
                    "day",
                    "hours",
                    "minutes",
                    "seconds",
                  ]}
                  value={toDate}
                  onChange={(newValue) => setToDate(newValue)}
                />
              </DemoContainer>
            </LocalizationProvider>
          </div>

          <div className="">
            <button
              type="button"
              className="btn btn-success mt-3"
              onClick={handleSearchByDate}
            >
              Tìm kiếm
            </button>
          </div>
          <div className="">
            <button
              type="button"
              className="btn btn-danger mt-3"
              onClick={handleResetData}
            >
              Đặt lại
            </button>
          </div>
        </div>
        <br />
        {showTable ? (
          <>
            <div className="mb-3">
              {dataMucInDaNhap && dataMucInDaNhap.length > 0 ? (
                <>
                  {" "}
                  <Button
                    type="primary"
                    htmlType="submit"
                    onClick={handlePrintMucInDaNhapMotThang}
                  >
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
            <div className="" style={{ marginBottom: "150px" }}>
              <MaterialReactTable table={tableNhapMucInTheo} />
            </div>
          </>
        ) : (
          <>
            {" "}
            <div className="" style={{ marginBottom: "150px" }}>
              <MaterialReactTable table={tableEmpty} />
            </div>
          </>
        )}
      </div>
      <div style={{ display: "none" }}>
        <PrintTemplateThongKeMucInDaNhap
          ref={componentRefMotThang}
          data={dataMucInDaNhap}
          inkNameMapping={inkNameMapping}
        />
      </div>
    </>
  );
};

export default ThongKeNhap;
