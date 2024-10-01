import { Button, Form, Popconfirm, Select, notification } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { Option } from "antd/es/mentions";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import axios from "axios";
import { QuestionCircleOutlined, UserOutlined } from "@ant-design/icons";
import { Box, FormControlLabel, Switch, Tooltip } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import ButtonBootstrap from "react-bootstrap/Button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Helmet } from "react-helmet";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import fontPath from "../fonts/Roboto-Black.ttf";
import Dropdown from "react-bootstrap/Dropdown";

const CreatePhieu = (props) => {
  const [dataLoaiPhieu, setDataLoaiPhieu] = useState([
    "Phiếu nhập",
    "Phiếu xuất",
  ]);

  const [dataTonkho, setDataTonKho] = useState([]);
  const [dataDaXuat, setDataDaXuat] = useState([]);
  const [dataDaNhap, setDataDaNhap] = useState([]);
  const [khoaPhong, setKhoaPhong] = useState([]);
  const [role, setRole] = useState("");
  const [chonPhieu, setChonPhieu] = useState(false);
  const [tendangnhap, setTendangnhap] = useState("");
  const [encodeWorkerTaoPhieu] = useState(
    () => new Worker("encodeWorkerTaoPhieu.js")
  );

  const [decodeWorkerLoginInfo] = useState(
    () => new Worker("decodeWorkerLoginInfo.js")
  );
  const [decodeWorkerData] = useState(() => new Worker("decodeWorkerData.js"));
  const [decodeWorkerRole] = useState(() => new Worker("decodeWorkerRole.js"));

  const [api, contextHolder] = notification.useNotification();

  const [data, setData] = useState([]);

  const [status, setStatus] = useState("");

  const [hovaten, setHovaten] = useState("");

  const [form] = Form.useForm();

  const [loadingTaoPhieu, setLoadingTaoPhieu] = useState(true);

  const [filteredData, setFilteredData] = useState(data);

  const [showPhieuNhap, setShowPhieuNhap] = useState(true);
  const [showPhieuXuat, setShowPhieuXuat] = useState(true);

  const navigate = useNavigate();

  const handleEncodeTaoPhieu = (data) => {
    return new Promise((resolve, reject) => {
      if (encodeWorkerTaoPhieu) {
        encodeWorkerTaoPhieu.postMessage(data);
        encodeWorkerTaoPhieu.onmessage = function (e) {
          resolve(e.data);
        };
      } else {
        console.log("Mã hóa dữ liệu tạo phiếu không thành công");
      }
    });
  };

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
    const fetchDataKhoaPhong = async () => {
      try {
        let res = await axios.get("http://172.16.0.61/api_ds_khoa_phong");
        if (res && res.data) {
          let khoaphongArr = [];
          let dataKhoaphong = res?.data;
          for (let i = 0; i < dataKhoaphong.length; i++) {
            khoaphongArr.push(dataKhoaphong[i].TENGOIKHOAPHONG);
          }
          setKhoaPhong(khoaphongArr);
        }
      } catch (error) {
        api["error"]({
          message: "Lỗi",
          description:
            "Đã xảy ra lỗi trong quá trình hiển thị dữ liệu khoa phòng",
        });
      }
    };
    fetchDataKhoaPhong();
  }, []);

  const handleTogglePhieuNhap = () => {
    setShowPhieuNhap(!showPhieuNhap);
  };

  const handleTogglePhieuXuat = () => {
    setShowPhieuXuat(!showPhieuXuat);
  };

  useEffect(() => {
    const newFilteredData = data.filter(
      (item) =>
        (showPhieuNhap && item.loaiphieu === "Phiếu nhập") ||
        (showPhieuXuat && item.loaiphieu === "Phiếu xuất")
    );
    setFilteredData(newFilteredData);
  }, [data, showPhieuNhap, showPhieuXuat]);

  useEffect(() => {
    try {
      const checkAlreadyLogin = async () => {
        let token = localStorage.getItem("token");
        if (!token) {
          navigate("/dangnhap");
        } else {
          let decodeLoginInfo = await handleDecodeLoginInfo(token);

          setHovaten(decodeLoginInfo?.hovaten);
          setTendangnhap(decodeLoginInfo?.username);
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
    FetchDataPhieuInk();
  }, [status]);

  const FetchDataPhieuInk = async () => {
    try {
      let res = await axios.get(`http://172.16.0.53:8080/danh_sach`);
      if (res && res.data) {
        const resultArray = [];
        let tonkhoArr = [];
        let xuatArr = [];
        let nhapArr = [];

        const listData = res?.data;

        const decodedAllData = [];
        for (const item of listData) {
          try {
            let dataDecode = await handleDecodeData(item.content);

            decodedAllData.push({
              ...item,
              decodedContent: dataDecode,
            });
          } catch (error) {
            console.error("Error decoding item:", item, error);
            api["error"]({
              message: "Lỗi",
              description:
                "Đã xảy ra lỗi trong quá trình hiển thị danh sách phiếu",
            });
          }
        }

        for (let i = 0; i < decodedAllData.length; i++) {
          if (
            decodedAllData[i].decodedContent?.content?.danhsachphieu
              ?.trangthai === "Đã xuất"
          ) {
            let danhsachmucinxuatkho =
              decodedAllData[i].decodedContent?.content?.danhsachphieu
                ?.danhsachmucincuaphieu;
            xuatArr = [...xuatArr, ...danhsachmucinxuatkho];
          }
        }

        for (let i = 0; i < decodedAllData.length; i++) {
          if (
            decodedAllData[i].decodedContent?.content?.danhsachphieu
              ?.trangthai === "Đã duyệt"
          ) {
            let danhsachmucinnhapkho =
              decodedAllData[i].decodedContent?.content?.danhsachphieu
                ?.danhsachmucincuaphieu;
            nhapArr = [...nhapArr, ...danhsachmucinnhapkho];
          }
        }

        for (let i = 0; i < decodedAllData.length; i++) {
          if (
            decodedAllData[i].decodedContent?.content?.danhsachphieu
              ?.trangthai === "Đã duyệt"
          ) {
            let danhsachmucinthemvaokho =
              decodedAllData[i].decodedContent?.content?.danhsachtonkho
                ?.danhsachmucinthemvaokho;
            tonkhoArr = [...tonkhoArr, ...danhsachmucinthemvaokho];
          }
        }

        for (let i = 0; i < res.data.length; i++) {
          let decodeData = await handleDecodeData(res.data[i].content);

          const decodedLoaiphieu =
            decodeData?.content?.danhsachphieu?.loaiphieu;
          const decodedNgayTaoPhieu =
            decodeData?.content?.danhsachphieu?.ngaytaophieu;
          const decodedNguoiTaoPhieu =
            decodeData?.content?.danhsachphieu?.nguoitaophieu;
          const decodedTrangthai =
            decodeData?.content?.danhsachphieu?.trangthai;
          const decodedKhoaphong =
            decodeData?.content?.danhsachphieu?.khoaphongxuatmuc;
          const decodedDanhsachmucincuaphieu =
            decodeData?.content?.danhsachphieu?.danhsachmucincuaphieu;
          const decodedNguoiduyetphieu =
            decodeData?.content?.danhsachphieu?.nguoiduyetphieu;
          const decodedNgayduyetphieu =
            decodeData?.content?.danhsachphieu?.ngayduyetphieu;
          const decodedTenphieu = decodeData?.content?.danhsachphieu?.tenphieu;
          const decodedThoigianxuat =
            decodeData?.content?.danhsachphieu?.thoigianxuat;

          const insertDataPhieu = {
            stt: i + 1,
            sophieu: res.data[i]._id,
            loaiphieu: decodedLoaiphieu,

            ngaytaophieu: decodedNgayTaoPhieu,
            trangthai: decodedTrangthai,
            tenphieu: decodedTenphieu,
            nguoitaophieu: decodedNguoiTaoPhieu,
            nguoiduyetphieu: decodedNguoiduyetphieu,
            ngayduyetphieu: decodedNgayduyetphieu,
            khoaphongxuatmuc: decodedKhoaphong,
            thoigianxuat: decodedThoigianxuat,
            danhsachmucincuaphieu: decodedDanhsachmucincuaphieu,
          };
          resultArray.push(insertDataPhieu);
        }

        setDataDaNhap(nhapArr);
        setDataDaXuat(xuatArr);
        setDataTonKho(tonkhoArr);
        setData(resultArray);
        setLoadingTaoPhieu(false);
      }
    } catch (error) {
      api["error"]({
        message: "Lỗi",
        description: "Đã xảy ra lỗi trong quá trình hiển thị danh sách phiếu",
      });
    }
  };

  const handleTaoPhieu = async (values) => {
    const dataAfterFilter = data.filter(
      (item) => item?.loaiphieu === values.chonloaiphieu
    );

    let timestamp = Date.now();

    let date = new Date(timestamp);

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    let currentTime = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;

    const newTaoPhieuData = {
      danhsachphieu: {
        loaiphieu: values.chonloaiphieu,
        tenphieu:
          values.chonloaiphieu === "Phiếu nhập"
            ? "Phiếu nhập " + Number(dataAfterFilter.length + 1)
            : "Phiếu xuất " + Number(dataAfterFilter.length + 1),
        ngaytaophieu: currentTime,
        nguoitaophieu: hovaten,
        khoaphongxuatmuc:
          values.chonloaiphieu === "Phiếu nhập" ? "" : values.chonkhoaphong,
        trangthai:
          values.chonloaiphieu === "Phiếu nhập" ? "Chưa duyệt" : "Chưa xuất",
        ngayduyetphieu: "",

        danhsachmucincuaphieu: [],
      },
      danhsachtonkho: {},
    };

    let DataPhieuValues = {
      content: newTaoPhieuData,
    };

    let jwtToken = await handleEncodeTaoPhieu(DataPhieuValues);

    try {
      await axios.get(`http://172.16.0.53:8080/insert/${jwtToken}`, {
        mode: "cors",
      });
      api["success"]({
        message: "Thành công",
        description: "Phiếu đã được tạo thành công",
      });
      setStatus("Create");
      setTimeout(() => {
        setStatus("");
      }, 500);

      form.resetFields();
    } catch (error) {
      api["error"]({
        message: "Thất bại",
        description: "Đã xảy ra lỗi trong quá trình tạo phiếu",
      });
      form.resetFields();
    }
  };

  const handleXoaPhieu = async (phieu) => {
    try {
      await axios.get(
        `http://172.16.0.53:8080/delete/${phieu.original?.sophieu}`
      );
      api["success"]({
        message: "Thành công",
        description: "Xóa phiếu thành công.",
      });
      setStatus("Delete");
      setTimeout(() => {
        setStatus("");
      }, 500);
    } catch (error) {
      api["error"]({
        message: "Thất bại",
        description: "Đã xảy ra lỗi trong quá trình xóa phiếu",
      });
    }
  };

  const handleExportRowsExcel = (rows) => {
    try {
      const rowData = rows.map((row) => row.original);

      let configDataArr = [];

      for (let i = 0; i < rowData.length; i++) {
        let configData = {
          STT: rows[i].index + 1,
          "Mã số phiếu": rowData[i].sophieu,
          "Loại phiếu": rowData[i].loaiphieu,
          "Ngày tạo phiếu": rowData[i].ngaytaophieu,
          "Trạng thái": rowData[i].trangthai,
        };

        configDataArr.push(configData);
      }
      // Tạo một workbook mới
      const wb = XLSX.utils.book_new();

      // Chuyển đổi dữ liệu thành worksheet
      const ws = XLSX.utils.json_to_sheet(configDataArr);

      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(wb, ws, "Danh sách các phiếu đã tạo");

      // Tạo buffer
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

      // Chuyển buffer thành Blob
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });

      // Lưu file
      saveAs(blob, "danhsachphieudatao.xlsx");
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

      autoTable(doc, {
        head: [tableHeaders],
        body: tableData,
        styles: { font: "Roboto", fontStyle: "normal" },
      });

      doc.save("danhsachphieudatao.pdf");
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

  const columns = useMemo(
    () => [
      {
        accessorKey: "stt",
        header: "STT",
        size: 150,
      },
      {
        accessorKey: "sophieu",
        header: "Mã Số phiếu",
        size: 150,
      },
      {
        accessorKey: "loaiphieu",
        header: "Loại phiếu",
        size: 150,
        Cell: ({ cell }) => (
          <Box
            component="span"
            sx={(theme) => ({
              backgroundColor:
                cell.getValue() === "Phiếu nhập"
                  ? theme.palette.success.dark
                  : theme.palette.error.dark,
              borderRadius: "0.25rem",
              color: "#fff",
              maxWidth: "9ch",
              p: "0.25rem",
            })}
          >
            {cell.getValue()}
          </Box>
        ),
      },

      {
        accessorKey: "ngaytaophieu",
        header: "Ngày tạo phiếu",
        size: 150,
      },

      {
        accessorKey: "trangthai",
        header: "Trạng thái",
        size: 150,
        Cell: ({ cell }) => (
          <Box
            component="span"
            sx={(theme) => ({
              backgroundColor:
                cell.getValue() === "Đã duyệt"
                  ? theme.palette.success.dark
                  : cell.getValue() === "Đã xuất"
                  ? theme.palette.warning.dark
                  : cell.getValue() === "Chưa xuất"
                  ? theme.palette.info.dark
                  : theme.palette.error.dark,
              borderRadius: "0.25rem",
              color: "#fff",
              maxWidth: "9ch",
              p: "0.25rem",
            })}
          >
            {cell.getValue()}
          </Box>
        ),
      },
    ],
    []
  );

  const handleSelect = (phieu) => {
    if (phieu === "Phiếu xuất") {
      setChonPhieu(true);
    } else {
      setChonPhieu(false);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    enableHiding: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableRowActions: true,
    initialState: {
      columnPinning: {
        right: ["mrt-row-actions"],
      },
    },
    state: { isLoading: loadingTaoPhieu },
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
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        {row.original.loaiphieu === "Phiếu xuất" &&
        row.original.trangthai === "Chưa xuất" ? (
          <Tooltip title="">
            <Link
              to={`/themmucin/${row.original.sophieu}/${
                row.original.tenphieu
              }/${row.original.loaiphieu}/${row.original.ngaytaophieu}/${
                row.original.nguoitaophieu
              }/${row.original.trangthai}/${
                row.original.khoaphongxuatmuc || "none"
              }`}
            >
              <Button type="primary">Nhập mực in</Button>
            </Link>
          </Tooltip>
        ) : (
          <></>
        )}
        {row.original.loaiphieu === "Phiếu nhập" &&
        row.original.trangthai === "Chưa duyệt" ? (
          <Tooltip title="">
            <Link
              to={`/themmucin/${row.original.sophieu}/${
                row.original.tenphieu
              }/${row.original.loaiphieu}/${row.original.ngaytaophieu}/${
                row.original.nguoitaophieu
              }/${row.original.trangthai}/${
                row.original.khoaphongxuatmuc || "none"
              }`}
            >
              <Button type="primary">Nhập mực in</Button>
            </Link>
          </Tooltip>
        ) : (
          <></>
        )}
        {row.original.loaiphieu === "Phiếu xuất" &&
        row.original.trangthai === "Chưa xuất" ? (
          <Popconfirm
            title="Xóa phiếu"
            description="Bạn có chắc chắn muốn xóa phiếu này không?"
            onConfirm={() => handleXoaPhieu(row)}
            cancelText="Không"
            okText="Xóa"
            icon={
              <QuestionCircleOutlined
                style={{
                  color: "red",
                }}
              />
            }
          >
            <Button danger type="primary">
              Xóa phiếu
            </Button>
          </Popconfirm>
        ) : (
          <></>
        )}
        {row.original.loaiphieu === "Phiếu nhập" &&
        row.original.trangthai === "Chưa duyệt" ? (
          <Popconfirm
            title="Xóa phiếu"
            description="Bạn có chắc chắn muốn xóa phiếu này không?"
            onConfirm={() => handleXoaPhieu(row)}
            cancelText="Không"
            okText="Xóa"
            icon={
              <QuestionCircleOutlined
                style={{
                  color: "red",
                }}
              />
            }
          >
            <Button danger type="primary">
              Xóa phiếu
            </Button>
          </Popconfirm>
        ) : (
          <></>
        )}
        {row.original.loaiphieu === "Phiếu xuất" &&
        row.original.trangthai === "Đã xuất" ? (
          <Link
            to={`/xemphieu/${row.original.sophieu}/${row.original.loaiphieu}/${row.original.ngaytaophieu}/${row.original.nguoitaophieu}/none/none/${row.original.thoigianxuat}/${row.original.tenphieu}`}
            state={{
              dataMucInCuaPhieu: row.original.danhsachmucincuaphieu,
              khoaphong: row.original.khoaphongxuatmuc,
            }}
          >
            <Button type="primary">Xem</Button>
          </Link>
        ) : (
          <></>
        )}
        {row.original.loaiphieu === "Phiếu nhập" &&
        row.original.trangthai === "Đã duyệt" ? (
          <Link
            to={`/xemphieu/${row.original.sophieu}/${row.original.loaiphieu}/${row.original.ngaytaophieu}/${row.original.nguoitaophieu}/${row.original.nguoiduyetphieu}/${row.original.ngayduyetphieu}/none/${row.original.tenphieu}`}
            state={{
              dataMucInCuaPhieu: row.original.danhsachmucincuaphieu,
            }}
          >
            <Button type="primary">Xem</Button>
          </Link>
        ) : (
          <></>
        )}
      </Box>
    ),
    positionActionsColumn: "last",
    displayColumnDefOptions: {
      "mrt-row-actions": {
        header: "Thao tác",
        size: 200,
      },
    },
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

        <FormControlLabel
          control={
            <Switch
              checked={showPhieuNhap}
              onChange={handleTogglePhieuNhap}
              color="primary"
            />
          }
          label="Phiếu nhập"
        />
        <FormControlLabel
          control={
            <Switch
              checked={showPhieuXuat}
              onChange={handleTogglePhieuXuat}
              color="primary"
            />
          }
          label="Phiếu xuất"
        />
      </Box>
    ),
  });

  return (
    <>
      {contextHolder}
      <Helmet>
        <meta charSet="utf-8" />
        <title>Tạo phiếu</title>
      </Helmet>
      <div className="container">
        <div className="text-center mt-5 mb-5">
          <img src="../img/logo2.png" alt="" />
        </div>
        <div className="mt-2 mb-3 d-flex">
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
        <h4 className="text-center mt-5 mb-5">TẠO PHIẾU</h4>
        {role === "Người nhập" ? (
          <>
            <Form form={form} name="control-hooks" onFinish={handleTaoPhieu}>
              <Form.Item
                name="chonloaiphieu"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn loại phiếu",
                  },
                ]}
              >
                <Select
                  placeholder="Chọn phiếu"
                  allowClear
                  style={{ width: "100%" }}
                >
                  <Option value="Phiếu nhập">Phiếu nhập</Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Tạo phiếu
                </Button>
              </Form.Item>
            </Form>
          </>
        ) : (
          <>
            <Form form={form} name="control-hooks" onFinish={handleTaoPhieu}>
              <Form.Item
                name="chonloaiphieu"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn loại phiếu",
                  },
                ]}
              >
                <Select
                  placeholder="Chọn phiếu"
                  allowClear
                  style={{ width: "100%" }}
                  onSelect={(event) => handleSelect(event)}
                >
                  {dataLoaiPhieu.map((item, index) => {
                    return <Option value={item}>{item}</Option>;
                  })}
                </Select>
              </Form.Item>
              {chonPhieu ? (
                <Form.Item
                  name="chonkhoaphong"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn khoa phòng",
                    },
                  ]}
                >
                  <Select
                    showSearch
                    placeholder="Chọn khoa phòng"
                    allowClear
                    style={{ width: "100%" }}
                  >
                    {khoaPhong.map((item, index) => {
                      return <Option value={item}>{item}</Option>;
                    })}
                  </Select>
                </Form.Item>
              ) : (
                <></>
              )}
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Tạo phiếu
                </Button>
              </Form.Item>
            </Form>
          </>
        )}

        <div className="d-flex justify-content-between">
          <h5 className="mt-1">CÁC PHIẾU ĐÃ TẠO </h5>
        </div>
        <div className="mb-5 mt-3">
          <MaterialReactTable table={table} />
        </div>
      </div>
    </>
  );
};

export default CreatePhieu;
