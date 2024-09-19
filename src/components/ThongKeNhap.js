import { PrinterFilled } from "@ant-design/icons";
import { Button, notification } from "antd";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import * as jose from "jose";
import axios from "axios";
import { Box } from "@mui/material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ButtonBootstrap from "react-bootstrap/Button";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { PrintTemplateThongKeMucInDaNhapMotThang } from "./print-template/PrintTemplateThongKeMucInDaNhapMotThang";
import { PrintTemplateThongKeMucInDaNhapMotNam } from "./print-template/PrintTemplateThongKeMucInDaNhapMotNam";

const ThongKeNhap = (props) => {
  const [loadingDataMucInDaNhap, setLoadingDataMucInDaNhap] = useState(true);
  const [dataTonkho, setDataTonKho] = useState([]);
  const [dataDaXuat, setDataDaXuat] = useState([]);
  const [dataDaNhap, setDataDaNhap] = useState([]);
  const [dataMucInDaNhapMotThang, setDataMucInDaNhapMotThang] = useState([]);
  const [dataMucInDaNhapMotNam, setDataMucInDaNhapMotNam] = useState([]);
  const [oneMonthAgo, setOneMonthAgo] = useState("");
  const [oneYearAgo, setOneYearAgo] = useState("");
  const [current, setCurrent] = useState("");

  const [api, contextHolder] = notification.useNotification();

  const componentRefMotThang = useRef();

  const componentRefMotNam = useRef();

  const handlePrintMucInDaNhapMotThang = useReactToPrint({
    content: () => componentRefMotThang.current,
  });

  const handlePrintMucInDaNhapMotNam = useReactToPrint({
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
                ?.trangthai === "Đã duyệt"
            ) {
              let danhsachmucindanhap =
                decodedData[i].decodedContent?.content?.danhsachphieu
                  ?.danhsachmucincuaphieu;

              // Giả sử mỗi mục có một trường ngayTao kiểu Date
              const filteredItemsOneMonth = danhsachmucindanhap.filter(
                (item) => {
                  const itemDate = item.thoigiannhap;

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
                ?.trangthai === "Đã duyệt"
            ) {
              let danhsachmucindanhap =
                decodedData[i].decodedContent?.content?.danhsachphieu
                  ?.danhsachmucincuaphieu;

              // Giả sử mỗi mục có một trường ngayTao kiểu Date
              const filteredItemsOneYear = danhsachmucindanhap.filter(
                (item) => {
                  const itemDate = item.thoigiannhap;

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

          // Định nghĩa một đối tượng mapping để chuyển đổi tên mực
          const inkNameMapping = {
            276: "haibaysau",
            "49A": "bonchinA",
            337: "bababay",
            "78A": "baytamA",
            "052": "khongnamhai",
            319: "bamotchin",
            "12A": "muoihaiA",
            "17A": "muoibayA",
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

          // Tạo một đối tượng để lưu trữ số lượng của từng loại mực với tên mới
          const inkCountsMotThang = Object.keys(inkNameMapping).reduce(
            (acc, key) => {
              acc[inkNameMapping[key]] = 0;
              return acc;
            },
            {}
          );

          const inkCountsMotNam = Object.keys(inkNameMapping).reduce(
            (acc, key) => {
              acc[inkNameMapping[key]] = 0;
              return acc;
            },
            {}
          );

          // Tính tổng số lượng và số lượng của từng loại mực
          let totalCountMotThang = 0;
          dataFilterOnMonth.forEach((item) => {
            totalCountMotThang += 1;
            // Giả sử tên mực được lưu trong trường 'tenMuc' của mỗi item
            if (inkNameMapping.hasOwnProperty(item.tenmuc)) {
              inkCountsMotThang[inkNameMapping[item.tenmuc]] += 1;
            }
          });

          let totalCountMotNam = 0;
          dataFilterOnYear.forEach((item) => {
            totalCountMotNam += 1;
            // Giả sử tên mực được lưu trong trường 'tenMuc' của mỗi item
            if (inkNameMapping.hasOwnProperty(item.tenmuc)) {
              inkCountsMotNam[inkNameMapping[item.tenmuc]] += 1;
            }
          });

          // Tạo mảng dữ liệu cho bảng
          const tableDataMotThang = [
            {
              tongSo: totalCountMotThang,
              ...inkCountsMotThang,
            },
          ];

          const tableDataMotNam = [
            {
              tongSo: totalCountMotNam,
              ...inkCountsMotNam,
            },
          ];

          setDataDaXuat(xuatArr);
          setDataDaNhap(nhapArr);
          setDataTonKho(tonkhoArr);

          setDataMucInDaNhapMotThang(tableDataMotThang);
          setDataMucInDaNhapMotNam(tableDataMotNam);

          setLoadingDataMucInDaNhap(false);
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

  const handleExportRowsExcelMucInDaNhapMotThang = (rows) => {
    try {
      const rowData = rows.map((row) => row.original);

      let configDataArr = [];

      for (let i = 0; i < rowData.length; i++) {
        let configData = {
          "Tổng cộng": rowData[i].tongSo,
          "Mực 276": rowData[i].haibaysau,
          "Mực 337": rowData[i].bababay,
          "Mực 49A": rowData[i].bonchinA,
          "Mực 319": rowData[i].bamotchin,
          "Mực 78A": rowData[i].baytamA,
          "Mực 12A": rowData[i].muoihaiA,
          "Mực 17A": rowData[i].muoibayA,
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

  const handleExportRowsExcelMucInDaNhapMotNam = (rows) => {
    try {
      const rowData = rows.map((row) => row.original);

      let configDataArr = [];

      for (let i = 0; i < rowData.length; i++) {
        let configData = {
          "Tổng cộng": rowData[i].tongSo,
          "Mực 276": rowData[i].haibaysau,
          "Mực 337": rowData[i].bababay,
          "Mực 49A": rowData[i].bonchinA,
          "Mực 319": rowData[i].bamotchin,
          "Mực 78A": rowData[i].baytamA,
          "Mực 12A": rowData[i].muoihaiA,
          "Mực 17A": rowData[i].muoibayA,
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
      XLSX.utils.book_append_sheet(wb, ws, "Mực in đã nhập trong 1 năm");

      // Tạo buffer
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

      // Chuyển buffer thành Blob
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });

      // Lưu file
      saveAs(blob, "thongkemucindanhaptrongmotnam.xlsx");
    } catch (error) {
      api["error"]({
        message: "Thất bại",
        description: "Đã xảy ra lỗi trong quá trình xuất file Excel",
      });
    }
  };

  const columnsNhapMucIn = useMemo(
    () => [
      {
        accessorKey: "tongSo",
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
        accessorKey: "muoibayA",
        header: "17A",
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

  const tableNhapMucInTheoMotThang = useMaterialReactTable({
    columns: columnsNhapMucIn,
    data: dataMucInDaNhapMotThang,
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

  const tableNhapMucInTheoMotNam = useMaterialReactTable({
    columns: columnsNhapMucIn,
    data: dataMucInDaNhapMotNam,
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
            handleExportRowsExcelMucInDaNhapMotNam(
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
        <h4 className="text-center mt-5 mb-5">
          <span>DANH SÁCH SỐ LƯỢNG MỰC IN ĐÃ NHẬP TRONG 1 THÁNG QUA</span>
          <br />
          <span>
            (Từ ngày {oneMonthAgo} tới ngày {current})
          </span>
        </h4>
        <div className="mb-3">
          {dataMucInDaNhapMotThang && dataMucInDaNhapMotThang.length > 0 ? (
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
          <MaterialReactTable table={tableNhapMucInTheoMotThang} />
        </div>
        <h4 className="text-center mt-5 mb-5">
          <span>DANH SÁCH CÁC MỰC IN ĐÃ NHẬP TRONG 1 NĂM QUA</span>
          <br />
          <span>
            (Từ ngày {oneYearAgo} tới ngày {current})
          </span>
        </h4>
        <div className="mb-3">
          {dataMucInDaNhapMotNam && dataMucInDaNhapMotNam.length > 0 ? (
            <>
              {" "}
              <Button
                type="primary"
                htmlType="submit"
                onClick={handlePrintMucInDaNhapMotNam}
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
          <MaterialReactTable table={tableNhapMucInTheoMotNam} />
        </div>
      </div>
      <div style={{ display: "none" }}>
        <PrintTemplateThongKeMucInDaNhapMotThang
          ref={componentRefMotThang}
          data={dataMucInDaNhapMotThang}
          oneMonthAgo={oneMonthAgo}
          current={current}
        />
      </div>
      <div style={{ display: "none" }}>
        <PrintTemplateThongKeMucInDaNhapMotNam
          ref={componentRefMotNam}
          data={dataMucInDaNhapMotNam}
          oneYearAgo={oneYearAgo}
          current={current}
        />
      </div>
    </>
  );
};

export default ThongKeNhap;
