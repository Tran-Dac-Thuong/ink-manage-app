import { Button, notification } from "antd";
import axios from "axios";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import * as jose from "jose";
import { Link } from "react-router-dom";
import { Box } from "@mui/material";
import ButtonBootstrap from "react-bootstrap/Button";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import fontPath from "../fonts/Roboto-Black.ttf";
import { useReactToPrint } from "react-to-print";
import { PrinterFilled } from "@ant-design/icons";
import { PrintTemplateThongKeMotThang } from "./print-template/PrintTemplateThongKeMotThang";
import { PrintTemplateThongKeMotNam } from "./print-template/PrintTemplateThongKeMotNam";
import { PrintTemplateMucInKhoa } from "./print-template/PrintTemplateMucInKhoa";
import { PrintTemplateMucInKhoaMotNam } from "./print-template/PrintTemplateMucInKhoaMotNam";

const Thongke = (props) => {
  const [dataSearchOnOneMonth, setDataSearchOnOneMonth] = useState([]);
  const [dataSearchOnOneYear, setDataSearchOnOneYear] = useState([]);
  const [loadingDataSearch, setLoadingDataSearch] = useState(true);
  const [loadingDataMucInTheoKhoa, setLoadingDataMucInTheoKhoa] =
    useState(true);
  const [dataTonkho, setDataTonKho] = useState([]);
  const [dataDaXuat, setDataDaXuat] = useState([]);
  const [dataDaNhap, setDataDaNhap] = useState([]);
  const [dataMucInTheoKhoaMotThang, setDataMucInTheoKhoaMotThang] = useState(
    []
  );
  const [dataMucInTheoKhoaMotNam, setDataMucInTheoKhoaMotNam] = useState([]);
  const [oneMonthAgo, setOneMonthAgo] = useState("");
  const [oneYearAgo, setOneYearAgo] = useState("");
  const [current, setCurrent] = useState("");

  const [api, contextHolder] = notification.useNotification();

  const componentRefMotThang = useRef();
  const componentRefMotNam = useRef();
  const componentRefMucInTheoKhoaMotThang = useRef();
  const componentRefMucInTheoKhoaMotNam = useRef();

  const handlePrintMucInTheoKhoaMotThang = useReactToPrint({
    content: () => componentRefMucInTheoKhoaMotThang.current,
  });

  const handlePrintMucInTheoKhoaMotNam = useReactToPrint({
    content: () => componentRefMucInTheoKhoaMotNam.current,
  });

  const handlePrintMotThang = useReactToPrint({
    content: () => componentRefMotThang.current,
  });

  const handlePrintMotNam = useReactToPrint({
    content: () => componentRefMotNam.current,
  });

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

  const parseDate = (dateStr) => {
    let [day, month, year] = dateStr.split("-");
    // Lưu ý: tháng trong đối tượng Date bắt đầu từ 0
    return new Date(year, month - 1, day);
  };

  useEffect(() => {
    props.setProgress(100);
  }, []);

  useEffect(() => {
    const fetchDataSearch = async () => {
      try {
        let timestamp = Date.now();

        let date = new Date(timestamp);

        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();

        let currentTime = `${day}-${month}-${year}`;

        // Lấy ngày hiện tại
        const currentDate = new Date();
        // Tính ngày 1 tháng trước
        const oneMonthAgo = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          currentDate.getDate()
        );

        const oneYearAgo = new Date(
          currentDate.getFullYear() - 1,
          currentDate.getMonth(),
          currentDate.getDate()
        );

        let dayOfOneMonthAgo = oneMonthAgo.getDate();
        let monthOfOneMonthAgo = oneMonthAgo.getMonth() + 1;
        let yearOfOneMonthAgo = oneMonthAgo.getFullYear();

        let dayOfOneYearAgo = oneYearAgo.getDate();
        let monthOfOneYearAgo = oneYearAgo.getMonth() + 1;
        let yearOfOneYearAgo = oneYearAgo.getFullYear();

        let oneMonthAgoTime = `${dayOfOneMonthAgo}-${monthOfOneMonthAgo}-${yearOfOneMonthAgo}`;

        let oneYearAgoTime = `${dayOfOneYearAgo}-${monthOfOneYearAgo}-${yearOfOneYearAgo}`;

        setOneMonthAgo(oneMonthAgoTime);
        setOneYearAgo(oneYearAgoTime);
        setCurrent(currentTime);

        let res = await axios.get("http://172.16.0.53:8080/danh_sach");
        if (res && res.data) {
          let dataFilterOnMonth = [];
          let dataFilterOnYear = [];
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

          for (let i = 0; i < decodedData.length; i++) {
            if (
              decodedData[i].decodedContent?.content?.danhsachphieu
                ?.trangthai === "Đã xuất"
            ) {
              let danhsachmucindaxuat =
                decodedData[i].decodedContent?.content?.danhsachphieu
                  ?.danhsachmucincuaphieu;

              // Giả sử mỗi mục có một trường ngayTao kiểu Date
              const filteredItemsOneMonth = danhsachmucindaxuat.filter(
                (item) => {
                  const itemDate = item.thoigianxuat;

                  let date1OneMonthAgo = parseDate(itemDate.split(" ")[0]);
                  let date2OneMonthAgo = parseDate(oneMonthAgoTime);

                  const isInRange =
                    date1OneMonthAgo >= date2OneMonthAgo &&
                    date1OneMonthAgo <= currentDate;

                  return isInRange;
                }
              );

              dataFilterOnMonth = [
                ...dataFilterOnMonth,
                ...filteredItemsOneMonth,
              ];
            }
          }

          for (let i = 0; i < decodedData.length; i++) {
            if (
              decodedData[i].decodedContent?.content?.danhsachphieu
                ?.trangthai === "Đã xuất"
            ) {
              let danhsachmucindaxuat =
                decodedData[i].decodedContent?.content?.danhsachphieu
                  ?.danhsachmucincuaphieu;

              // Giả sử mỗi mục có một trường ngayTao kiểu Date
              const filteredItemsOneYear = danhsachmucindaxuat.filter(
                (item) => {
                  const itemDate = item.thoigianxuat;

                  let date1OneYearAgo = parseDate(itemDate.split(" ")[0]);
                  let date2OneYearAgo = parseDate(oneYearAgoTime);

                  const isInRange =
                    date1OneYearAgo >= date2OneYearAgo &&
                    date1OneYearAgo <= currentDate;

                  return isInRange;
                }
              );

              dataFilterOnYear = [...dataFilterOnYear, ...filteredItemsOneYear];
            }
          }

          // Định nghĩa ánh xạ từ mã số sang tên chữ
          const maCodeMap = {
            276: "haibaysau",
            "49A": "bonchinA",
            337: "bababay",
            "78A": "baytamA",
            "052": "khongnamhai",
            319: "bamotchin",
            "12A": "muoihaiA",
            "003 (Đen)": "khongkhongbaden",
            "003 (Vàng)": "khongkhongbavang",
            "003 (Hồng)": "khongkhongbahong",
            "003 (Xanh)": "khongkhongbaxanh",
            "664 (Đen)": "sausaubonden",
            "664 (Vàng)": "sausaubonvang",
            "664 (Hồng)": "sausaubonhong",
            "664 (Xanh)": "sausaubonxanh",
            "005 (Đen)": "khongkhongnamden",
            "774 (Đen)": "baybaybonden",
          };

          const maCodes = Object.keys(maCodeMap);

          // Hàm để tạo object với các thuộc tính mới có giá trị ban đầu là 0
          const createInitialStats = () => {
            return {
              soLuong: 0,
              ...Object.fromEntries(
                Object.values(maCodeMap).map((name) => [name, 0])
              ),
            };
          };

          // Đếm số lượng xuất hiện của mỗi tên khoa phòng và tính tổng cho các mã
          let khoaPhongStatsMotThang = {};
          dataFilterOnMonth.forEach((item) => {
            const khoaPhong = item.khoaphongxuatmuc;
            if (!khoaPhongStatsMotThang[khoaPhong]) {
              khoaPhongStatsMotThang[khoaPhong] = createInitialStats();
            }
            khoaPhongStatsMotThang[khoaPhong].soLuong += 1;

            // Cập nhật số lượng cho mỗi mã
            maCodes.forEach((code) => {
              if (item.tenmuc === code) {
                khoaPhongStatsMotThang[khoaPhong][maCodeMap[code]] +=
                  parseInt(item.soluong) || 0;
              }
            });
          });

          let khoaPhongStatsMotNam = {};
          dataFilterOnYear.forEach((item) => {
            const khoaPhong = item.khoaphongxuatmuc;
            if (!khoaPhongStatsMotNam[khoaPhong]) {
              khoaPhongStatsMotNam[khoaPhong] = createInitialStats();
            }
            khoaPhongStatsMotNam[khoaPhong].soLuong += 1;

            // Cập nhật số lượng cho mỗi mã
            maCodes.forEach((code) => {
              if (item.tenmuc === code) {
                khoaPhongStatsMotNam[khoaPhong][maCodeMap[code]] +=
                  parseInt(item.soluong) || 0;
              }
            });
          });

          // Chuyển đổi object thành mảng và thêm STT
          let dataMucInTheoKhoaMotThang = Object.entries(
            khoaPhongStatsMotThang
          ).map(([tenKhoaPhong, stats], index) => ({
            stt: index + 1,
            tenKhoaPhong,
            ...stats,
          }));

          // Chuyển đổi object thành mảng và thêm STT
          let dataMucInTheoKhoaMotNam = Object.entries(
            khoaPhongStatsMotNam
          ).map(([tenKhoaPhong, stats], index) => ({
            stt: index + 1,
            tenKhoaPhong,
            ...stats,
          }));

          let idCounterMonth = 1;
          dataFilterOnMonth = dataFilterOnMonth.map((item) => ({
            ...item,
            stt: idCounterMonth++,
          }));

          let idCounterYear = 1;
          dataFilterOnYear = dataFilterOnYear.map((item) => ({
            ...item,
            stt: idCounterYear++,
          }));

          setDataDaXuat(xuatArr);
          setDataDaNhap(nhapArr);
          setDataTonKho(tonkhoArr);
          setDataSearchOnOneMonth(dataFilterOnMonth);
          setDataSearchOnOneYear(dataFilterOnYear);
          setDataMucInTheoKhoaMotThang(dataMucInTheoKhoaMotThang);
          setDataMucInTheoKhoaMotNam(dataMucInTheoKhoaMotNam);
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
        "Mực 276": rowData[i].haibaysau,
        "Mực 337": rowData[i].bababay,
        "Mực 49A": rowData[i].bonchinA,
        "Mực 319": rowData[i].bamotchin,
        "Mực 78A": rowData[i].baytamA,
        "Mực 12A": rowData[i].muoihaiA,
        "Mực 052": rowData[i].khongnamhai,
        "Mực 003 (Đen)": rowData[i].khongkhongbaden,
        "Mực 003 (Vàng)": rowData[i].khongkhongbavang,
        "Mực 003 (Hồng)": rowData[i].khongkhongbahong,
        "Mực 003 (Xanh)": rowData[i].khongkhongbaxanh,
        "Mực 664 (Đen)": rowData[i].sausaubonden,
        "Mực 664 (Vàng)": rowData[i].sausaubonvang,
        "Mực 664 (Hồng)": rowData[i].sausaubonhong,
        "Mực 664 (Xanh)": rowData[i].sausaubonxanh,
        "Mực 005 (Đen)": rowData[i].khongkhongnamden,
        "Mực 774 (Đen)": rowData[i].baybaybonden,
      };

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

  const handleExportRowsExcelMucInTheoKhoaMotNam = (rows) => {
    const rowData = rows.map((row) => row.original);

    let configDataArr = [];

    for (let i = 0; i < rowData.length; i++) {
      let configData = {
        STT: rows[i].index + 1,
        "Khoa phòng": rowData[i].tenKhoaPhong,
        "Tổng cộng": rowData[i].soLuong,
        "Mực 276": rowData[i].haibaysau,
        "Mực 337": rowData[i].bababay,
        "Mực 49A": rowData[i].bonchinA,
        "Mực 319": rowData[i].bamotchin,
        "Mực 78A": rowData[i].baytamA,
        "Mực 12A": rowData[i].muoihaiA,
        "Mực 052": rowData[i].khongnamhai,
        "Mực 003 (Đen)": rowData[i].khongkhongbaden,
        "Mực 003 (Vàng)": rowData[i].khongkhongbavang,
        "Mực 003 (Hồng)": rowData[i].khongkhongbahong,
        "Mực 003 (Xanh)": rowData[i].khongkhongbaxanh,
        "Mực 664 (Đen)": rowData[i].sausaubonden,
        "Mực 664 (Vàng)": rowData[i].sausaubonvang,
        "Mực 664 (Hồng)": rowData[i].sausaubonhong,
        "Mực 664 (Xanh)": rowData[i].sausaubonxanh,
        "Mực 005 (Đen)": rowData[i].khongkhongnamden,
        "Mực 774 (Đen)": rowData[i].baybaybonden,
      };

      configDataArr.push(configData);
    }

    // Tạo một workbook mới
    const wb = XLSX.utils.book_new();

    // Chuyển đổi dữ liệu thành worksheet
    const ws = XLSX.utils.json_to_sheet(configDataArr);

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(wb, ws, "Thống kê mực in trong 1 năm");

    // Tạo buffer
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    // Chuyển buffer thành Blob
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    // Lưu file
    saveAs(blob, "thongkemucincuakhoatrongmotnam.xlsx");
  };

  const handleExportRowsPDFMucInTheoKhoa = (rows) => {
    const doc = new jsPDF();

    // Thêm font vào PDF
    doc.addFont(fontPath, "Roboto", "normal");
    doc.setFont("Roboto");

    const tableData = rows.map((row) => Object.values(row.original));

    const tableHeaders = columnsMucInTheoKhoa.map((c) => c.header);

    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      styles: { font: "Roboto", fontStyle: "normal" },
    });

    doc.save("thongkemucintheokhoa.pdf");
  };

  const handleExportRowsExcelOneMonth = (rows) => {
    const rowData = rows.map((row) => row.original);

    let configDataArr = [];

    for (let i = 0; i < rowData.length; i++) {
      let configData = {
        STT: rows[i].index + 1,
        "Tên mực": rowData[i].tenmuc,
        "Mã mực": rowData[i].mamuc,
        "Mã QRCode": rowData[i].qrcode,
        "Tên phiếu": rowData[i].tenphieu,
        "Số lượng": rowData[i].soluong,
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
  };

  const handleExportRowsPDFOneMonth = (rows) => {
    const doc = new jsPDF();

    // Thêm font vào PDF
    doc.addFont(fontPath, "Roboto", "normal");
    doc.setFont("Roboto");

    const tableData = rows.map((row) => Object.values(row.original));

    const tableHeaders = columns.map((c) => c.header);

    let rearrangedArray = tableData.map((arr) => [
      arr[9],
      arr[0],
      arr[1],
      arr[3],
      arr[5],
      arr[2],
      arr[8],
      arr[7],
    ]);

    autoTable(doc, {
      head: [tableHeaders],
      body: rearrangedArray,
      styles: { font: "Roboto", fontStyle: "normal" },
    });

    doc.save("danhsachmucincackhoadadoitrongmotthangqua.pdf");
  };

  const handleExportRowsExcelOneYear = (rows) => {
    const rowData = rows.map((row) => row.original);

    let configDataArr = [];

    for (let i = 0; i < rowData.length; i++) {
      let configData = {
        STT: rows[i].index + 1,
        "Tên mực": rowData[i].tenmuc,
        "Mã mực": rowData[i].mamuc,
        "Mã QRCode": rowData[i].qrcode,
        "Tên phiếu": rowData[i].tenphieu,
        "Số lượng": rowData[i].soluong,
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
    saveAs(blob, "danhsachmucincackhoadadoitrongmotnamqua.xlsx");
  };

  const handleExportRowsPDFOneYear = (rows) => {
    const doc = new jsPDF();

    // Thêm font vào PDF
    doc.addFont(fontPath, "Roboto", "normal");
    doc.setFont("Roboto");

    const tableData = rows.map((row) => Object.values(row.original));

    const tableHeaders = columns.map((c) => c.header);

    let rearrangedArray = tableData.map((arr) => [
      arr[9],
      arr[0],
      arr[1],
      arr[3],
      arr[5],
      arr[2],
      arr[8],
      arr[7],
      arr[4],
    ]);

    autoTable(doc, {
      head: [tableHeaders],
      body: rearrangedArray,
      styles: { font: "Roboto", fontStyle: "normal" },
    });

    doc.save("danhsachmucincackhoadadoitrongmotnamqua.pdf");
  };

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
        accessorKey: "tenphieu",
        header: "Tên phiếu",
        size: 120,
      },
      {
        accessorKey: "soluong",
        header: "Số lượng",
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

  const columnsMucInTheoKhoa = useMemo(
    () => [
      {
        accessorKey: "stt",
        header: "STT",
        size: 80,
      },
      {
        accessorKey: "tenKhoaPhong",
        header: "Khoa phòng",
        size: 80,
      },
      {
        accessorKey: "soLuong",
        header: "Tổng cộng",
        size: 80,
      },
      {
        accessorKey: "haibaysau",
        header: "276",
        size: 80,
      },
      {
        accessorKey: "bababay",
        header: "337",
        size: 80,
      },
      {
        accessorKey: "bonchinA",
        header: "49A",
        size: 80,
      },
      {
        accessorKey: "bamotchin",
        header: "319",
        size: 80,
      },
      {
        accessorKey: "baytamA",
        header: "78A",
        size: 80,
      },
      {
        accessorKey: "muoihaiA",
        header: "12A",
        size: 80,
      },
      {
        accessorKey: "khongnamhai",
        header: "052",
        size: 80,
      },
      {
        accessorKey: "khongkhongbaden",
        header: "003 (Đen)",
        size: 80,
      },
      {
        accessorKey: "khongkhongbavang",
        header: "003 (Vàng)",
        size: 80,
      },
      {
        accessorKey: "khongkhongbahong",
        header: "003 (Hồng)",
        size: 80,
      },
      {
        accessorKey: "khongkhongbaxanh",
        header: "003 (Xanh)",
        size: 80,
      },
      {
        accessorKey: "sausaubonden",
        header: "664 (Đen)",
        size: 80,
      },
      {
        accessorKey: "sausaubonvang",
        header: "664 (Vàng)",
        size: 80,
      },
      {
        accessorKey: "sausaubonhong",
        header: "664 (Hồng)",
        size: 80,
      },
      {
        accessorKey: "sausaubonxanh",
        header: "664 (Xanh)",
        size: 80,
      },
      {
        accessorKey: "khongkhongnamden",
        header: "005 (Đen)",
        size: 80,
      },
      {
        accessorKey: "baybaybonden",
        header: "774 (Đen)",
        size: 80,
      },
    ],
    []
  );

  const tableMucInTheoKhoaMotThang = useMaterialReactTable({
    columns: columnsMucInTheoKhoa,
    data: dataMucInTheoKhoaMotThang,
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

  const tableMucInTheoKhoaMotNam = useMaterialReactTable({
    columns: columnsMucInTheoKhoa,
    data: dataMucInTheoKhoaMotNam,
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
            handleExportRowsExcelMucInTheoKhoaMotNam(
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

  const tableOneMonth = useMaterialReactTable({
    columns,
    data: dataSearchOnOneMonth,
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

  const tableOneYear = useMaterialReactTable({
    columns,
    data: dataSearchOnOneYear,
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
            handleExportRowsExcelOneYear(table.getPrePaginationRowModel().rows)
          }
        >
          <FileDownloadIcon />
          Xuất file Excel
        </ButtonBootstrap>
        <ButtonBootstrap
          className="btn btn-danger"
          disabled={table.getPrePaginationRowModel().rows.length === 0}
          onClick={() =>
            handleExportRowsPDFOneYear(table.getPrePaginationRowModel().rows)
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
        <title>Thống kê</title>
      </Helmet>
      <div className="container">
        <div className="text-center mt-5">
          <img src="../img/logo2.png" alt="" />
        </div>
        <div className="mt-5 mb-3">
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
          <button type="button" className="btn btn-success me-2">
            Đã nhập <span class="badge bg-danger">{dataDaNhap.length}</span>
          </button>
          <button type="button" className="btn btn-danger me-2">
            Đã xuất <span class="badge bg-success">{dataDaXuat.length}</span>
          </button>
        </div>
        <h4 className="text-center mt-5 mb-5">
          <span>
            DANH SÁCH SỐ LƯỢNG MỰC IN ĐÃ ĐỔI CHO TỪNG KHOA TRONG 1 THÁNG QUA
          </span>
          <br />
          <span>
            (Từ ngày {oneMonthAgo} tới ngày {current})
          </span>
        </h4>
        <div className="mb-3">
          {dataMucInTheoKhoaMotThang && dataMucInTheoKhoaMotThang.length > 0 ? (
            <>
              {" "}
              <Button
                type="primary"
                htmlType="submit"
                onClick={handlePrintMucInTheoKhoaMotThang}
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
          <MaterialReactTable table={tableMucInTheoKhoaMotThang} />
        </div>
        <h4 className="text-center mt-5 mb-5">
          <span>
            DANH SÁCH SỐ LƯỢNG MỰC IN ĐÃ ĐỔI CHO TỪNG KHOA TRONG 1 NĂM QUA
          </span>
          <br />
          <span>
            (Từ ngày {oneYearAgo} tới ngày {current})
          </span>
        </h4>
        <div className="mb-3">
          {dataMucInTheoKhoaMotNam && dataMucInTheoKhoaMotNam.length > 0 ? (
            <>
              {" "}
              <Button
                type="primary"
                htmlType="submit"
                onClick={handlePrintMucInTheoKhoaMotNam}
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
          <MaterialReactTable table={tableMucInTheoKhoaMotNam} />
        </div>
        <h4 className="text-center mt-5 mb-5">
          <span>
            DANH SÁCH CÁC MỰC IN ĐÃ ĐỔI CHO CÁC KHOA TRONG 1 THÁNG QUA
          </span>
          <br />
          <span>
            (Từ ngày {oneMonthAgo} tới ngày {current})
          </span>
        </h4>
        <div className="mb-3">
          {dataSearchOnOneMonth && dataSearchOnOneMonth.length > 0 ? (
            <>
              {" "}
              <Button
                type="primary"
                htmlType="submit"
                onClick={handlePrintMotThang}
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
          <MaterialReactTable table={tableOneMonth} />
        </div>
        <h4 className="text-center mt-5 mb-5">
          <span>DANH SÁCH CÁC MỰC IN ĐÃ ĐỔI CHO CÁC KHOA TRONG 1 NĂM QUA</span>
          <br />
          <span>
            (Từ ngày {oneYearAgo} tới ngày {current})
          </span>
        </h4>
        <div className="mb-3">
          {dataSearchOnOneYear && dataSearchOnOneYear.length > 0 ? (
            <>
              {" "}
              <Button
                type="primary"
                htmlType="submit"
                onClick={handlePrintMotNam}
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
          <MaterialReactTable table={tableOneYear} />
        </div>
      </div>
      <div style={{ display: "none" }}>
        <PrintTemplateThongKeMotThang
          ref={componentRefMotThang}
          data={dataSearchOnOneMonth}
          oneMonthAgo={oneMonthAgo}
          current={current}
        />
      </div>
      <div style={{ display: "none" }}>
        <PrintTemplateThongKeMotNam
          ref={componentRefMotNam}
          data={dataSearchOnOneYear}
          oneYearAgo={oneYearAgo}
          current={current}
        />
      </div>

      <div style={{ display: "none" }}>
        <PrintTemplateMucInKhoa
          ref={componentRefMucInTheoKhoaMotThang}
          data={dataMucInTheoKhoaMotThang}
          oneMonthAgo={oneMonthAgo}
          current={current}
        />
      </div>
      <div style={{ display: "none" }}>
        <PrintTemplateMucInKhoaMotNam
          ref={componentRefMucInTheoKhoaMotNam}
          data={dataMucInTheoKhoaMotNam}
          oneYearAgo={oneYearAgo}
          current={current}
        />
      </div>
    </>
  );
};

export default Thongke;
