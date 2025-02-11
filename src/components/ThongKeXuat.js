import { Button, notification } from "antd";
import axios from "axios";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import ButtonBootstrap from "react-bootstrap/Button";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import fontPath from "../fonts/Roboto-Black.ttf";
import { useReactToPrint } from "react-to-print";
import { PrinterFilled, UserOutlined } from "@ant-design/icons";

import Dropdown from "react-bootstrap/Dropdown";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { PrintTemplateChiTietThongKeMucInDaXuat } from "./print-template/PrintTemplateChiTietThongKeMucInDaXuat";
import { PrintTemplateThongKeMucInDaXuat } from "./print-template/PrintTemplateThongKeMucInDaXuat";

const ThongKeXuat = (props) => {
  const [loadingDataSearch, setLoadingDataSearch] = useState(true);
  const [loadingDataMucInTheoKhoa, setLoadingDataMucInTheoKhoa] =
    useState(true);
  const [dataTonkho, setDataTonKho] = useState([]);
  const [dataDaXuat, setDataDaXuat] = useState([]);
  const [dataDaNhap, setDataDaNhap] = useState([]);
  const [dataMucInDaXuat, setDataMucInDaXuat] = useState([]);
  const [dataDetailMucInDaXuat, setDataDetailMucInDaXuat] = useState([]);

  const [tendangnhap, setTendangnhap] = useState("");
  const [role, setRole] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [fromDateDetail, setFromDateDetail] = useState(null);
  const [toDateDetail, setToDateDetail] = useState(null);
  const [showTable, setShowTable] = useState(false);

  const [decodeWorkerLoginInfo] = useState(
    () => new Worker("decodeWorkerLoginInfo.js")
  );
  const [decodeWorkerData] = useState(() => new Worker("decodeWorkerData.js"));
  const [decodeWorkerRole] = useState(() => new Worker("decodeWorkerRole.js"));
  const [api, contextHolder] = notification.useNotification();
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

  const componentRefMucInDaXuat = useRef();

  const componentRefDetailMucInDaXuat = useRef();

  const navigate = useNavigate();

  const handlePrintMucInDaXuat = useReactToPrint({
    content: () => componentRefMucInDaXuat.current,
  });

  const handlePrintDetailMucInDaXuat = useReactToPrint({
    content: () => componentRefDetailMucInDaXuat.current,
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
          // if (decodeToken?.role === "Người nhập") {
          //   navigate("/forbidden");
          // }
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
                  "Đã xảy ra lỗi trong quá trình hiển thị thống kê xuất",
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

          setDataDaXuat(xuatArr);
          setDataDaNhap(nhapArr);
          setDataTonKho(tonkhoArr);

          setLoadingDataSearch(false);
          setLoadingDataMucInTheoKhoa(false);
        }
      } catch (error) {
        api["error"]({
          message: "Thất bại",
          description: "Đã xảy ra lỗi trong quá trình hiển thị dữ liệu",
        });
      }
    };
    fetchDataSearch();
  }, []);

  const handleExportRowsExcelMucInTheoKhoaMotThang = (rows) => {
    const rowData = rows.map((row) => row.original);

    let configDataArr = [];

    for (let i = 0; i < rowData.length; i++) {
      let configData = {
        STT: rows[i].index + 1,
        "Khoa phòng": rowData[i].tenKhoaPhong,
        "Tổng cộng": rowData[i].soLuong,
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
    XLSX.utils.book_append_sheet(wb, ws, "Thống kê mực in trong 1 tháng");

    // Tạo buffer
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    // Chuyển buffer thành Blob
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    // Lưu file
    saveAs(blob, "thongkemucincuakhoatrongmotthang.xlsx");
  };

  const handleExportRowsExcelOneMonth = (rows) => {
    try {
      const rowData = rows.map((row) => row.original);

      let configDataArr = [];

      for (let i = 0; i < rowData.length; i++) {
        let configData = {
          STT: rows[i].index + 1,
          "Tên mực": rowData[i].tenmuc,
          "Mã mực": rowData[i].mamuc,
          "Mã QRCode": rowData[i].qrcode,
          "Tên phiếu nhập": rowData[i].phieunhap,
          "Tên phiếu xuất": rowData[i].tenphieu,
          "Xuất cho": rowData[i].khoaphongxuatmuc,
          "Đã xuất vào lúc": rowData[i].thoigianxuat,
        };

        configDataArr.push(configData);
      }
      // Tạo một workbook mới
      const wb = XLSX.utils.book_new();

      // Chuyển đổi dữ liệu thành worksheet
      const ws = XLSX.utils.json_to_sheet(configDataArr);

      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(wb, ws, "Danh sách mực in");

      // Tạo buffer
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

      // Chuyển buffer thành Blob
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });

      // Lưu file
      saveAs(blob, "danhsachmucincackhoadadoitrongmotthangqua.xlsx");
    } catch (error) {
      api["error"]({
        message: "Thất bại",
        description: "Đã xảy ra lỗi trong quá trình xuất file Excel",
      });
    }
  };

  const handleExportRowsPDFOneMonth = (rows) => {
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
        arr.length === 11 ? arr[10] : arr[18],
        arr[5],
        arr.length === 11 ? arr[8] : arr[16],
        arr.length === 11 ? arr[7] : arr[15],
        arr[2],
      ]);

      autoTable(doc, {
        head: [tableHeaders],
        body: rearrangedArray,
        styles: { font: "Roboto", fontStyle: "normal" },
      });

      doc.save("danhsachmucincackhoadadoitrongmotthangqua.pdf");
    } catch (error) {
      api["error"]({
        message: "Thất bại",
        description: "Đã xảy ra lỗi trong quá trình xuất file PDF",
      });
    }
  };

  const handleDangXuat = () => {
    localStorage.removeItem("token");

    navigate("/dangnhap");
  };

  const handleResetDataMucInDaXuat = () => {
    setFromDate(null);
    setToDate(null);
    setShowTable(false);
  };

  const handleResetDataChiTietMucInDaXuat = () => {
    setFromDateDetail(null);
    setToDateDetail(null);
    setDataDetailMucInDaXuat([]);
  };

  const handleSearchMucInDaXuatByDate = async () => {
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
                "Đã xảy ra lỗi trong quá trình hiển thị thống kê xuất",
            });
          }
        }

        // Convert selected dates to timestamps for comparison
        const fromTimestamp = fromDate.$d.getTime();
        const toTimestamp = toDate.$d.getTime();

        // Filter data based on import time
        for (let i = 0; i < decodedData.length; i++) {
          if (
            decodedData[i].decodedContent?.content?.danhsachphieu?.trangthai ===
            "Đã xuất"
          ) {
            let danhsachmucindaxuat =
              decodedData[i].decodedContent?.content?.danhsachphieu
                ?.danhsachmucincuaphieu;

            const filteredItems = danhsachmucindaxuat.filter((item) => {
              const [datePart, timePart] = item.thoigianxuat.split(" ");
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

        // Process statistics based on departments
        const createInitialStats = () => {
          return {
            soLuong: 0,
            ...Object.fromEntries(
              Object.values(inkNameMapping).map((name) => [name, 0])
            ),
          };
        };

        let khoaPhongStats = {};
        dataFilterByDateRange.forEach((item) => {
          const khoaPhong = item.khoaphongxuatmuc;
          if (!khoaPhongStats[khoaPhong]) {
            khoaPhongStats[khoaPhong] = createInitialStats();
          }
          khoaPhongStats[khoaPhong].soLuong += 1;

          if (!inkNameMapping.hasOwnProperty(item.tenmuc)) {
            const newKey = item.tenmuc.toLowerCase().replace(/\s+/g, "");
            inkNameMapping[item.tenmuc] = newKey;
            Object.values(khoaPhongStats).forEach((stats) => {
              stats[newKey] = 0;
            });
            setInkNameMapping((prevMapping) => ({
              ...prevMapping,
              [item.tenmuc]: newKey,
            }));
          }

          const inkKey = inkNameMapping[item.tenmuc];
          khoaPhongStats[khoaPhong][inkKey] += parseInt(item.soluong) || 0;
        });

        // Track active ink types
        const activeInkTypes = new Set();
        Object.values(khoaPhongStats).forEach((stats) => {
          Object.entries(stats).forEach(([key, value]) => {
            if (key !== "soLuong" && value > 0) {
              const originalInkName = Object.entries(inkNameMapping).find(
                ([_, mappedName]) => mappedName === key
              )?.[0];
              if (originalInkName) {
                activeInkTypes.add(originalInkName);
              }
            }
          });
        });

        // Filter inkNameMapping
        const filteredInkMapping = {};
        Object.entries(inkNameMapping).forEach(([inkName, mappedValue]) => {
          if (activeInkTypes.has(inkName)) {
            filteredInkMapping[inkName] = mappedValue;
          }
        });

        setInkNameMapping(filteredInkMapping);

        // Convert to array format
        let dataSoLuongMucIn = Object.entries(khoaPhongStats).map(
          ([tenKhoaPhong, stats], index) => ({
            stt: index + 1,
            tenKhoaPhong,
            ...stats,
          })
        );

        // Map import vouchers
        const importVoucherMap = new Map();
        for (const item of decodedData) {
          if (
            item.decodedContent?.content?.danhsachphieu?.trangthai ===
            "Đã duyệt"
          ) {
            const danhsachmucincuaphieu =
              item.decodedContent?.content?.danhsachphieu
                ?.danhsachmucincuaphieu || [];
            const tenphieu =
              item.decodedContent?.content?.danhsachphieu?.tenphieu;
            danhsachmucincuaphieu.forEach((mucin) => {
              importVoucherMap.set(mucin.qrcode, tenphieu);
            });
          }
        }

        // Add sequential numbers and import voucher info
        let idCounter = 1;
        dataFilterByDateRange = dataFilterByDateRange.map((item) => ({
          ...item,
          stt: idCounter++,
          phieunhap: importVoucherMap.get(item.qrcode) || "Không có thông tin",
        }));

        if (dataSoLuongMucIn.length <= 0) {
          setDataMucInDaXuat([]);
          setShowTable(false);
        } else {
          setDataMucInDaXuat(dataSoLuongMucIn);
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

  const handleSearchChiTietMucInDaXuatByDate = async () => {
    if (!fromDateDetail || !toDateDetail) {
      api["error"]({
        message: "Thất bại",
        description: "Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc",
      });
      return;
    }

    if (fromDateDetail.$d > toDateDetail.$d) {
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
                "Đã xảy ra lỗi trong quá trình hiển thị thống kê xuất",
            });
          }
        }

        // Convert selected dates to timestamps for comparison
        const fromTimestamp = fromDateDetail.$d.getTime();
        const toTimestamp = toDateDetail.$d.getTime();

        // Filter data based on import time
        for (let i = 0; i < decodedData.length; i++) {
          if (
            decodedData[i].decodedContent?.content?.danhsachphieu?.trangthai ===
            "Đã xuất"
          ) {
            let danhsachmucindaxuat =
              decodedData[i].decodedContent?.content?.danhsachphieu
                ?.danhsachmucincuaphieu;

            const filteredItems = danhsachmucindaxuat.filter((item) => {
              const [datePart, timePart] = item.thoigianxuat.split(" ");
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

        // Process statistics based on departments
        const createInitialStats = () => {
          return {
            soLuong: 0,
            ...Object.fromEntries(
              Object.values(inkNameMapping).map((name) => [name, 0])
            ),
          };
        };

        let khoaPhongStats = {};
        dataFilterByDateRange.forEach((item) => {
          const khoaPhong = item.khoaphongxuatmuc;
          if (!khoaPhongStats[khoaPhong]) {
            khoaPhongStats[khoaPhong] = createInitialStats();
          }
          khoaPhongStats[khoaPhong].soLuong += 1;

          if (!inkNameMapping.hasOwnProperty(item.tenmuc)) {
            const newKey = item.tenmuc.toLowerCase().replace(/\s+/g, "");
            inkNameMapping[item.tenmuc] = newKey;
            Object.values(khoaPhongStats).forEach((stats) => {
              stats[newKey] = 0;
            });
            setInkNameMapping((prevMapping) => ({
              ...prevMapping,
              [item.tenmuc]: newKey,
            }));
          }

          const inkKey = inkNameMapping[item.tenmuc];
          khoaPhongStats[khoaPhong][inkKey] += parseInt(item.soluong) || 0;
        });

        // Map import vouchers
        const importVoucherMap = new Map();
        for (const item of decodedData) {
          if (
            item.decodedContent?.content?.danhsachphieu?.trangthai ===
            "Đã duyệt"
          ) {
            const danhsachmucincuaphieu =
              item.decodedContent?.content?.danhsachphieu
                ?.danhsachmucincuaphieu || [];
            const tenphieu =
              item.decodedContent?.content?.danhsachphieu?.tenphieu;
            danhsachmucincuaphieu.forEach((mucin) => {
              importVoucherMap.set(mucin.qrcode, tenphieu);
            });
          }
        }

        // Add sequential numbers and import voucher info
        let idCounter = 1;
        dataFilterByDateRange = dataFilterByDateRange.map((item) => ({
          ...item,
          stt: idCounter++,
          phieunhap: importVoucherMap.get(item.qrcode) || "Không có thông tin",
        }));

        setDataDetailMucInDaXuat(dataFilterByDateRange);
      }
    } catch (error) {
      api["error"]({
        message: "Thất bại",
        description: "Đã xảy ra lỗi trong quá trình tìm kiếm",
      });
    }
  };

  const columnsEmpty = useMemo(() => [], []);

  const columns = useMemo(
    () => [
      {
        accessorKey: "stt",
        header: "STT",
        size: 120,
      },
      {
        accessorKey: "tenmuc",
        header: "Tên mực",
        size: 120,
      },
      {
        accessorKey: "mamuc",
        header: "Mã mực",
        size: 120,
      },
      {
        accessorKey: "qrcode",
        header: "Mã QRCode",
        size: 120,
      },
      {
        accessorKey: "phieunhap",
        header: "Tên phiếu nhập",
        size: 120,
      },
      {
        accessorKey: "tenphieu",
        header: "Tên phiếu xuất",
        size: 120,
      },

      {
        accessorKey: "khoaphongxuatmuc",
        header: "Xuất cho",
        size: 120,
      },
      {
        accessorKey: "thoigianxuat",
        header: "Đã xuất vào lúc",
        size: 120,
      },
    ],
    []
  );

  const columnsMucInTheoKhoa = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: "stt",
        header: "STT",
        size: 80,
      },
      {
        accessorKey: "tenKhoaPhong",
        header: "Khoa phòng",
        size: 150,
      },
      {
        accessorKey: "soLuong",
        header: "Tổng số",
        size: 100,
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

  const tableEmpty = useMaterialReactTable({
    columns: columnsEmpty,
    data: [],
    enableHiding: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
  });

  const tableMucInDaXuat = useMaterialReactTable({
    columns: columnsMucInTheoKhoa,
    data: dataMucInDaXuat,
    enableHiding: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    state: { isLoading: loadingDataMucInTheoKhoa },
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
            handleExportRowsExcelMucInTheoKhoaMotThang(
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

  const tableDetailMucInDaXuat = useMaterialReactTable({
    columns,
    data: dataDetailMucInDaXuat,
    enableHiding: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    state: { isLoading: loadingDataSearch },
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
            handleExportRowsExcelOneMonth(table.getPrePaginationRowModel().rows)
          }
        >
          <FileDownloadIcon />
          Xuất file Excel
        </ButtonBootstrap>
        <ButtonBootstrap
          className="btn btn-danger"
          disabled={table.getPrePaginationRowModel().rows.length === 0}
          onClick={() =>
            handleExportRowsPDFOneMonth(table.getPrePaginationRowModel().rows)
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
        <title>Thống kê mực in đã xuất</title>
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
          {/* {role === "Người duyệt" || role === "Người xuất" ? (
            <>
              {" "} */}
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
          {/* </>
          ) : (
            <></>
          )} */}

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
          <span>DANH SÁCH SỐ LƯỢNG CÁC MỰC IN ĐÃ ĐỔI CHO CÁC KHOA</span>
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
              onClick={handleSearchMucInDaXuatByDate}
            >
              Tìm kiếm
            </button>
          </div>
          <div className="">
            <button
              type="button"
              className="btn btn-danger mt-3"
              onClick={handleResetDataMucInDaXuat}
            >
              Đặt lại
            </button>
          </div>
        </div>
        <br />
        {showTable ? (
          <>
            {" "}
            <div className="mb-3">
              {dataMucInDaXuat && dataMucInDaXuat.length > 0 ? (
                <>
                  {" "}
                  <Button
                    type="primary"
                    htmlType="submit"
                    onClick={handlePrintMucInDaXuat}
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
              <MaterialReactTable table={tableMucInDaXuat} />
            </div>
          </>
        ) : (
          <>
            <MaterialReactTable table={tableEmpty} />
          </>
        )}
        <br />
        <h4 className="text-center mt-5 mb-5">
          <span>
            DANH SÁCH THÔNG TIN CHI TIẾT SỐ LƯỢNG CÁC MỰC IN ĐÃ ĐỔI CHO CÁC KHOA
          </span>
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
                  value={fromDateDetail}
                  onChange={(newValue) => setFromDateDetail(newValue)}
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
                  value={toDateDetail}
                  onChange={(newValue) => setToDateDetail(newValue)}
                />
              </DemoContainer>
            </LocalizationProvider>
          </div>

          <div className="">
            <button
              type="button"
              className="btn btn-success mt-3"
              onClick={handleSearchChiTietMucInDaXuatByDate}
            >
              Tìm kiếm
            </button>
          </div>
          <div className="">
            <button
              type="button"
              className="btn btn-danger mt-3"
              onClick={handleResetDataChiTietMucInDaXuat}
            >
              Đặt lại
            </button>
          </div>
        </div>
        <br />{" "}
        <div className="mb-3">
          {dataDetailMucInDaXuat && dataDetailMucInDaXuat.length > 0 ? (
            <>
              {" "}
              <Button
                type="primary"
                htmlType="submit"
                onClick={handlePrintDetailMucInDaXuat}
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
          <MaterialReactTable table={tableDetailMucInDaXuat} />
        </div>
      </div>
      <div style={{ display: "none" }}>
        <PrintTemplateThongKeMucInDaXuat
          ref={componentRefMucInDaXuat}
          data={dataMucInDaXuat}
          inkNameMapping={inkNameMapping}
        />
      </div>

      <div style={{ display: "none" }}>
        <PrintTemplateChiTietThongKeMucInDaXuat
          ref={componentRefDetailMucInDaXuat}
          data={dataDetailMucInDaXuat}
        />
      </div>
    </>
  );
};

export default ThongKeXuat;
