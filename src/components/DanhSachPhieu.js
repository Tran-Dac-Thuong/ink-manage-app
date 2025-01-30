import React, { useEffect, useMemo, useState } from "react";
import { ConfigProvider, notification, Popconfirm, Select } from "antd";
import { UserOutlined } from "@ant-design/icons";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "antd";
import { Box } from "@mui/material";
import Dropdown from "react-bootstrap/Dropdown";
import { Helmet } from "react-helmet";
import { Option } from "antd/es/mentions";

const InkManager = (props) => {
  const [dataPhieuNhap, setDataPhieuNhap] = useState([]);
  const [dataPhieuXuat, setDataPhieuXuat] = useState([]);
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [tendangnhap, setTendangnhap] = useState("");
  const [hovaten, setHovaten] = useState("");
  const [loadingDanhSachPhieu, setLoadingDanhSachPhieu] = useState(true);
  const [dataTonkho, setDataTonKho] = useState([]);
  const [dataDaXuat, setDataDaXuat] = useState([]);
  const [dataDaNhap, setDataDaNhap] = useState([]);
  const [dataSoLuongMucInDaNhap, setDataSoLuongMucInDaNhap] = useState([]);
  const [dataSoLuongMucInDaXuat, setDataSoLuongMucInDaXuat] = useState([]);
  const [dataSoLuongMucInTonKho, setDataSoLuongMucInTonKho] = useState([]);
  const [danhSachThau, setDanhSachThau] = useState([]);

  const [filterThau, setFilterThau] = useState("");

  const [encodeWorkerDuyet] = useState(
    () => new Worker("encodeWorkerDuyet.js")
  );
  const [decodeWorkerLoginInfo] = useState(
    () => new Worker("decodeWorkerLoginInfo.js")
  );
  const [decodeWorkerData] = useState(() => new Worker("decodeWorkerData.js"));
  const [decodeWorkerRole] = useState(() => new Worker("decodeWorkerRole.js"));

  const navigate = useNavigate();

  const [api, contextHolder] = notification.useNotification();

  const handleEncodeDuyet = (data) => {
    return new Promise((resolve, reject) => {
      if (encodeWorkerDuyet) {
        encodeWorkerDuyet.postMessage(data);
        encodeWorkerDuyet.onmessage = function (e) {
          resolve(e.data);
        };
      } else {
        console.log("Mã hóa dữ liệu duyệt không thành công");
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
    try {
      const checkAlreadyLogin = async () => {
        let token = localStorage.getItem("token");
        if (!token) {
          navigate("/dangnhap");
        }

        let decodeLoginInfo = await handleDecodeLoginInfo(token);

        setTendangnhap(decodeLoginInfo?.username);
        setHovaten(decodeLoginInfo?.hovaten);
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
    FetchDataPhieu();
  }, [status]);

  const FetchDataPhieu = async () => {
    try {
      let res = await axios.get(`http://172.16.0.53:8080/danh_sach`);

      if (res && res.data && Array.isArray(res.data)) {
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
                "Đã xảy ra lỗi trong quá trình hiển thị danh sách phiếu",
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

        const filteredArrPhieuNhap = decodedData.filter((item) => {
          return (
            item.decodedContent?.content?.danhsachphieu?.loaiphieu ===
            "Phiếu nhập"
          );
        });

        const filteredArrPhieuXuat = decodedData.filter((item) => {
          return (
            item.decodedContent?.content?.danhsachphieu?.loaiphieu ===
            "Phiếu xuất"
          );
        });

        const resultArrayPhieuNhap = filteredArrPhieuNhap.map((item, index) => {
          let ngaytaophieuTimestampNhap;

          if (item.decodedContent?.content?.danhsachphieu?.ngaytaophieu) {
            const [day, month, year, time] =
              item.decodedContent?.content?.danhsachphieu?.ngaytaophieu.split(
                /[-\s]/
              );
            const [hours, minutes, seconds] = time.split(":");
            ngaytaophieuTimestampNhap = new Date(
              year,
              month - 1,
              day,
              hours,
              minutes,
              seconds
            ).getTime();
          }

          if (isNaN(ngaytaophieuTimestampNhap)) {
            ngaytaophieuTimestampNhap = Date.now();
          }

          return {
            stt: index + 1,
            masophieu: item._id,
            loaiphieu: item.decodedContent?.content?.danhsachphieu?.loaiphieu,
            tenphieu: item.decodedContent?.content?.danhsachphieu?.tenphieu,
            ngaytaophieu:
              item.decodedContent?.content?.danhsachphieu?.ngaytaophieu,

            nguoitaophieu:
              item.decodedContent?.content?.danhsachphieu?.nguoitaophieu,
            nguoiduyetphieu:
              item.decodedContent?.content?.danhsachphieu?.nguoiduyetphieu,
            trangthai: item.decodedContent?.content?.danhsachphieu?.trangthai,
            ngayduyetphieu:
              item.decodedContent?.content?.danhsachphieu?.ngayduyetphieu,
            danhsachmucincuaphieu:
              item.decodedContent?.content?.danhsachphieu
                ?.danhsachmucincuaphieu,
            ngaytaophieuTimestamp: ngaytaophieuTimestampNhap,
          };
        });

        const timPhieuNhapNguon = (mucInXuat) => {
          const phieuNhapNguon = {};

          mucInXuat.forEach((mucIn) => {
            const phieuNhapTuongUng = filteredArrPhieuNhap.find((phieu) =>
              phieu.decodedContent?.content?.danhsachphieu?.danhsachmucincuaphieu.some(
                (mucNhap) => mucNhap.qrcode === mucIn.qrcode
              )
            );

            if (phieuNhapTuongUng) {
              phieuNhapNguon[mucIn.qrcode] = phieuNhapTuongUng._id;
            }
          });

          return phieuNhapNguon;
        };

        const resultArrayPhieuXuat = filteredArrPhieuXuat.map((item, index) => {
          let ngaytaophieuTimestampXuat;

          if (item.decodedContent?.content?.danhsachphieu?.ngaytaophieu) {
            const [day, month, year, time] =
              item.decodedContent?.content?.danhsachphieu?.ngaytaophieu.split(
                /[-\s]/
              );
            const [hours, minutes, seconds] = time.split(":");
            ngaytaophieuTimestampXuat = new Date(
              year,
              month - 1,
              day,
              hours,
              minutes,
              seconds
            ).getTime();
          }

          if (isNaN(ngaytaophieuTimestampXuat)) {
            ngaytaophieuTimestampXuat = Date.now();
          }

          // // Find corresponding phiếu nhập
          // const phieuNhap = filteredArrPhieuNhap.find((phieu) =>
          //   phieu.decodedContent?.content?.danhsachphieu?.danhsachmucincuaphieu.some(
          //     (mucIn) =>
          //       item.decodedContent?.content?.danhsachphieu?.danhsachmucincuaphieu.some(
          //         (mucXuat) => mucXuat.qrcode === mucIn.qrcode
          //       )
          //   )
          // );

          // // Map danhsachmucincuaphieu with masophieunhap
          // const danhsachmucincuaphieu =
          //   item.decodedContent?.content?.danhsachphieu?.danhsachmucincuaphieu.map(
          //     (mucIn) => ({
          //       ...mucIn,
          //       masophieunhap: phieuNhap?._id || "",
          //     })
          //   );

          const phieuNhapNguon = timPhieuNhapNguon(
            item.decodedContent?.content?.danhsachphieu?.danhsachmucincuaphieu
          );

          const danhsachmucincuaphieu =
            item.decodedContent?.content?.danhsachphieu?.danhsachmucincuaphieu.map(
              (mucIn) => ({
                ...mucIn,
                masophieunhap: phieuNhapNguon[mucIn.qrcode] || "",
              })
            );

          return {
            stt: index + 1,
            masophieu: item._id,
            loaiphieu: item.decodedContent?.content?.danhsachphieu?.loaiphieu,
            tenphieu: item.decodedContent?.content?.danhsachphieu?.tenphieu,
            ngaytaophieu:
              item.decodedContent?.content?.danhsachphieu?.ngaytaophieu,
            nguoitaophieu:
              item.decodedContent?.content?.danhsachphieu?.nguoitaophieu,
            thoigianxuat:
              item.decodedContent?.content?.danhsachphieu?.thoigianxuat,
            trangthai: item.decodedContent?.content?.danhsachphieu?.trangthai,
            khoaphongxuatmuc:
              item.decodedContent?.content?.danhsachphieu?.khoaphongxuatmuc,
            // danhsachmucincuaphieu:
            //   item.decodedContent?.content?.danhsachphieu
            //     ?.danhsachmucincuaphieu,
            danhsachmucincuaphieu: danhsachmucincuaphieu,
            ngaytaophieuTimestamp: ngaytaophieuTimestampXuat,
          };
        });

        resultArrayPhieuNhap.sort(
          (a, b) => b.ngaytaophieuTimestamp - a.ngaytaophieuTimestamp
        );
        const sortedResultArrayNhap = resultArrayPhieuNhap.map(
          (item, index) => ({
            ...item,
            stt: index + 1,
          })
        );

        resultArrayPhieuXuat.sort(
          (a, b) => b.ngaytaophieuTimestamp - a.ngaytaophieuTimestamp
        );
        const sortedResultArrayXuat = resultArrayPhieuXuat.map(
          (item, index) => ({
            ...item,
            stt: index + 1,
          })
        );

        const uniqueThau = [
          ...new Set(
            dataPhieuNhap
              .filter((item) => item.loaiphieu === "Phiếu nhập")
              .map((item) => item.nguoitaophieu)
          ),
        ];

        setDanhSachThau(uniqueThau);
        setDataDaXuat(xuatArr);
        setDataDaNhap(nhapArr);
        setDataTonKho(tonkhoArr);
        setDataPhieuNhap(sortedResultArrayNhap);
        setDataPhieuXuat(sortedResultArrayXuat);
        setLoadingDanhSachPhieu(false);
      }
    } catch (error) {
      api["error"]({
        message: "Lỗi",
        description: "Đã xảy ra lỗi trong quá trình hiển thị danh sách phiếu",
      });
    }
  };

  useEffect(() => {
    const fetchDataSoLuongDaNhap = async () => {
      try {
        let grouped = {};

        // Duyệt qua từng phần tử trong mảng ban đầu
        for (let i = 0; i < dataDaNhap.length; i++) {
          let prefix = dataDaNhap[i].tenmuc;
          // Nếu đối tượng đã có nhóm này, cộng thêm số lượng
          if (grouped[prefix]) {
            grouped[prefix] += dataDaNhap[i].soluong;
          } else {
            // Nếu chưa có nhóm này, khởi tạo với số lượng hiện tại
            grouped[prefix] = dataDaNhap[i].soluong;
          }
        }

        // Chuyển đổi đối tượng thành mảng kết quả
        let result = [];
        for (const prefix in grouped) {
          result.push({ qrcode: prefix, soluong: grouped[prefix] });
        }

        setDataSoLuongMucInDaNhap(result);
      } catch (error) {
        api["error"]({
          message: "Lỗi",
          description: "Đã xảy ra lỗi trong quá trình hiển thị số lượng mực in",
        });
      }
    };
    fetchDataSoLuongDaNhap();
  }, [dataDaNhap]);

  useEffect(() => {
    const fetchDataSoLuongDaXuat = async () => {
      try {
        let grouped = {};

        // Duyệt qua từng phần tử trong mảng ban đầu
        for (let i = 0; i < dataDaXuat.length; i++) {
          let prefix = dataDaXuat[i].tenmuc;
          // Nếu đối tượng đã có nhóm này, cộng thêm số lượng
          if (grouped[prefix]) {
            grouped[prefix] += dataDaXuat[i].soluong;
          } else {
            // Nếu chưa có nhóm này, khởi tạo với số lượng hiện tại
            grouped[prefix] = dataDaXuat[i].soluong;
          }
        }

        // Chuyển đổi đối tượng thành mảng kết quả
        let result = [];
        for (const prefix in grouped) {
          result.push({ qrcode: prefix, soluong: grouped[prefix] });
        }

        setDataSoLuongMucInDaXuat(result);
      } catch (error) {
        api["error"]({
          message: "Lỗi",
          description: "Đã xảy ra lỗi trong quá trình hiển thị số lượng mực in",
        });
      }
    };
    fetchDataSoLuongDaXuat();
  }, [dataDaXuat]);

  useEffect(() => {
    const fetchDataSoLuongTonKho = async () => {
      try {
        let grouped = {};

        // Duyệt qua từng phần tử trong mảng ban đầu
        for (let i = 0; i < dataTonkho.length; i++) {
          let prefix = dataTonkho[i].tenmuc;
          // Nếu đối tượng đã có nhóm này, cộng thêm số lượng
          if (grouped[prefix]) {
            grouped[prefix] += dataTonkho[i].soluong;
          } else {
            // Nếu chưa có nhóm này, khởi tạo với số lượng hiện tại
            grouped[prefix] = dataTonkho[i].soluong;
          }
        }

        // Chuyển đổi đối tượng thành mảng kết quả
        let result = [];
        for (const prefix in grouped) {
          result.push({ qrcode: prefix, soluong: grouped[prefix] });
        }

        setDataSoLuongMucInTonKho(result);
      } catch (error) {
        api["error"]({
          message: "Lỗi",
          description: "Đã xảy ra lỗi trong quá trình hiển thị số lượng mực in",
        });
      }
    };
    fetchDataSoLuongTonKho();
  }, [dataTonkho]);

  const handleDangXuat = () => {
    localStorage.removeItem("token");

    navigate("/dangnhap");
  };

  const filteredData = dataPhieuNhap.filter((item) => {
    const matchThau = filterThau ? item.nguoitaophieu === filterThau : true;

    return matchThau;
  });

  const columnsPhieuNhap = useMemo(
    () => [
      {
        accessorKey: "stt",
        header: "STT",

        size: 100,
      },
      {
        accessorKey: "tenphieu",
        header: "Tên phiếu",
        size: 100,
      },
      {
        accessorKey: "masophieu",
        header: "Mã số phiếu",
        enableEditing: false,
        size: 100,
      },

      {
        accessorKey: "loaiphieu",
        header: "Loại phiếu",
        size: 100,

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
        size: 100,
      },
      {
        accessorKey: "trangthai",
        header: "Trạng thái",
        size: 100,

        Cell: ({ cell }) => (
          <Box
            component="span"
            sx={(theme) => ({
              backgroundColor:
                cell.getValue() === "Đã duyệt"
                  ? theme.palette.success.dark
                  : cell.getValue() === "Đã xuất"
                  ? theme.palette.warning.dark
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
        accessorKey: "ngayduyetphieu",
        header: "Ngày duyệt phiếu",
        size: 100,
      },
    ],
    []
  );

  const columnsPhieuXuat = useMemo(
    () => [
      {
        accessorKey: "stt",
        header: "STT",
        size: 100,
        Cell: ({ row }) => {
          return <span>{row.index + 1}</span>;
        },
      },
      {
        accessorKey: "tenphieu",
        header: "Tên phiếu",
        size: 100,
      },
      {
        accessorKey: "masophieu",
        header: "Mã số phiếu",
        size: 100,
      },

      {
        accessorKey: "loaiphieu",
        header: "Loại phiếu",
        size: 100,
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
        size: 100,
      },
      {
        accessorKey: "trangthai",
        header: "Trạng thái",
        size: 100,
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
      {
        accessorKey: "khoaphongxuatmuc",
        header: "Xuất cho",
        size: 100,
      },
      {
        accessorKey: "thoigianxuat",
        header: "Đã được xuất lúc",
        size: 100,
      },
    ],
    []
  );

  const randomString = (length = 8) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const coMucInDaXuat = (danhSachMucIn) => {
    return danhSachMucIn.some((mucIn) => {
      const mucInDaXuat = dataDaXuat.find(
        (item) => item.qrcode === mucIn.qrcode
      );
      return mucInDaXuat && mucInDaXuat.soluong > 0;
    });
  };

  const handleDuyet = async (phieu) => {
    let currentPhieu = dataPhieuNhap.find(
      (item) => item.masophieu === phieu.original.masophieu
    );

    let dataMucInCuaPhieu = currentPhieu?.danhsachmucincuaphieu;

    if (dataMucInCuaPhieu.length <= 0) {
      api["error"]({
        message: "Thất bại",
        description:
          "Phiếu này chưa được nhập mực in nào. Vui lòng nhập ít nhất một mực in trước khi duyệt",
      });
    } else {
      if (currentPhieu?.trangthai === "Đã duyệt") {
        let danhsachmucinnhapkho = currentPhieu?.danhsachmucincuaphieu;

        danhsachmucinnhapkho = danhsachmucinnhapkho.map((item) => ({
          ...item,
          thoigiannhap: "",
        }));

        let updateDataDaDuyet = {
          danhsachphieu: {
            loaiphieu: currentPhieu?.loaiphieu,
            tenphieu: currentPhieu?.tenphieu,
            ngaytaophieu: currentPhieu?.ngaytaophieu,
            nguoitaophieu: currentPhieu?.nguoitaophieu,
            nguoihuyduyet: hovaten,
            khoaphongxuatmuc:
              currentPhieu?.loaiphieu === "Phiếu nhập"
                ? ""
                : currentPhieu?.khoaphong,
            trangthai:
              currentPhieu?.loaiphieu === "Phiếu nhập"
                ? "Chưa duyệt"
                : "Đã xuất",
            ngayduyetphieu: "",
            danhsachmucincuaphieu: danhsachmucinnhapkho,
          },
          danhsachtonkho: {},
        };
        let DataPhieuValues = {
          content: updateDataDaDuyet,
        };

        let jwtToken = await handleEncodeDuyet(DataPhieuValues);

        try {
          await axios.get(
            `http://172.16.0.53:8080/update/${currentPhieu?.masophieu}/${jwtToken}`,
            {
              mode: "cors",
            }
          );

          api["success"]({
            message: "Thành công",
            description: "Phiếu này đã được hủy duyệt",
          });

          setStatus(randomString());
        } catch (error) {
          api["error"]({
            message: "Thất bại",
            description: "Đã xảy ra lỗi trong quá trình hủy duyệt phiếu",
          });
        }
      } else {
        let timestamp = Date.now();

        let date = new Date(timestamp);

        let day = date.getDate();

        let month = date.getMonth() + 1;
        let year = date.getFullYear();

        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();

        let currentTime = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;

        let danhsachmucinnhapkho = currentPhieu?.danhsachmucincuaphieu;

        danhsachmucinnhapkho = danhsachmucinnhapkho.map((item) => ({
          ...item,
          thoigiannhap: currentTime,
        }));

        let updateDataChuaDuyet = {
          danhsachphieu: {
            loaiphieu: currentPhieu?.loaiphieu,
            tenphieu: currentPhieu?.tenphieu,
            ngaytaophieu: currentPhieu?.ngaytaophieu,
            nguoitaophieu: currentPhieu?.nguoitaophieu,
            nguoiduyetphieu: hovaten,
            khoaphongxuatmuc:
              currentPhieu?.loaiphieu === "Phiếu nhập"
                ? ""
                : currentPhieu?.khoaphong,
            trangthai:
              currentPhieu?.loaiphieu === "Phiếu nhập" ? "Đã duyệt" : "Đã xuất",
            ngayduyetphieu: currentTime,
            danhsachmucincuaphieu: danhsachmucinnhapkho,
          },
          danhsachtonkho: {
            danhsachmucinthemvaokho: currentPhieu?.danhsachmucincuaphieu,
          },
        };

        let DataPhieuValues = {
          content: updateDataChuaDuyet,
        };

        let jwtToken = await handleEncodeDuyet(DataPhieuValues);

        try {
          await axios.get(
            `http://172.16.0.53:8080/update/${currentPhieu?.masophieu}/${jwtToken}`,
            {
              mode: "cors",
            }
          );

          api["success"]({
            message: "Thành công",
            description: "Phiếu này đã được duyệt",
          });

          setStatus(randomString());
        } catch (error) {
          api["error"]({
            message: "Thất bại",
            description: "Đã xảy ra lỗi trong quá trình duyệt phiếu",
          });
        }
      }
    }
  };

  const tablePhieuNhap = useMaterialReactTable({
    columns: columnsPhieuNhap,
    data: dataPhieuNhap,
    enableEditing: true,
    enableHiding: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableRowActions: true,
    enableSorting: false,
    enableFilters: true, // Enable filtering
    state: {
      isLoading: loadingDanhSachPhieu,
    },
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
    initialState: {
      columnPinning: {
        right: ["mrt-row-actions"],
      },
    },

    positionActionsColumn: "last",
    displayColumnDefOptions: {
      "mrt-row-actions": {
        header: "Thao tác",
        size: 100,
      },
    },

    // onEditingRowCancel: () => setValidationErrors({}),
    // onEditingRowSave: handleSaveUser,

    renderRowActions: ({ row, table }) =>
      row.original.loaiphieu === "Phiếu nhập" &&
      row.original.trangthai === "Đã duyệt" ? (
        <>
          {role === "Người duyệt" ? (
            <Box sx={{ display: "flex", gap: "1rem" }}>
              {!coMucInDaXuat(row.original.danhsachmucincuaphieu) ? (
                <>
                  {" "}
                  <ConfigProvider
                    theme={{
                      components: {
                        Button: {
                          colorPrimary: "#ff4d4f",

                          algorithm: true,
                        },
                      },
                    }}
                  >
                    <Popconfirm
                      title="Hủy duyệt phiếu"
                      description="Bạn có chắc chắn muốn hủy duyệt phiếu này không?"
                      onConfirm={() => handleDuyet(row)}
                      cancelText="Không"
                      okText="Có"
                    >
                      <Button type="primary" htmlType="submit">
                        Hủy duyệt
                      </Button>
                    </Popconfirm>
                  </ConfigProvider>
                </>
              ) : (
                <>
                  <Button
                    title="Không thể hủy duyệt phiếu này do mực in trong phiếu này đã được xuất khỏi kho."
                    type="primary"
                    disabled
                  >
                    Hủy duyệt
                  </Button>
                </>
              )}

              <Link
                to={`/xemphieu/${row.original.masophieu}/${row.original.loaiphieu}/${row.original.ngaytaophieu}/${row.original.nguoitaophieu}/${row.original.nguoiduyetphieu}/${row.original.ngayduyetphieu}/none/${row.original.tenphieu}`}
                state={{
                  dataMucInCuaPhieu: row.original.danhsachmucincuaphieu,
                }}
              >
                <Button type="primary" htmlType="submit">
                  Xem
                </Button>
              </Link>
            </Box>
          ) : (
            <>
              {" "}
              <Link
                to={`/xemphieu/${row.original.masophieu}/${row.original.loaiphieu}/${row.original.ngaytaophieu}/${row.original.nguoitaophieu}/${row.original.nguoiduyetphieu}/${row.original.ngayduyetphieu}/none/${row.original.tenphieu}`}
                state={{
                  dataMucInCuaPhieu: row.original.danhsachmucincuaphieu,
                }}
              >
                <Button type="primary" htmlType="submit">
                  Xem
                </Button>
              </Link>
            </>
          )}
        </>
      ) : (
        <>
          {role === "Người duyệt" ? (
            row.original.danhsachmucincuaphieu.length > 0 ? (
              <Box sx={{ display: "flex", gap: "1rem" }}>
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
                  <Popconfirm
                    title="Duyệt phiếu"
                    description="Bạn có chắc chắn muốn duyệt phiếu này không?"
                    onConfirm={() => handleDuyet(row)}
                    cancelText="Không"
                    okText="Có"
                  >
                    <Button type="primary" htmlType="submit">
                      Duyệt
                    </Button>
                  </Popconfirm>
                </ConfigProvider>
                <Link
                  to={`/xemphieu/${row.original.masophieu}/${row.original.loaiphieu}/${row.original.ngaytaophieu}/${row.original.nguoitaophieu}/none/none/none/${row.original.tenphieu}`}
                  state={{
                    dataMucInCuaPhieu: row.original.danhsachmucincuaphieu,
                  }}
                >
                  <Button type="primary" htmlType="submit">
                    Xem
                  </Button>
                </Link>
              </Box>
            ) : (
              <>
                <Box>
                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled
                    title="Phiếu này chưa được nhập mực in nào. Vui lòng nhập ít nhất một mực in trước khi duyệt"
                  >
                    Duyệt
                  </Button>
                  <Link
                    to={`/xemphieu/${row.original.masophieu}/${row.original.loaiphieu}/${row.original.ngaytaophieu}/${row.original.nguoitaophieu}/none/none/none/${row.original.tenphieu}`}
                    state={{
                      dataMucInCuaPhieu: row.original.danhsachmucincuaphieu,
                    }}
                  >
                    <Button type="primary" htmlType="submit">
                      Xem
                    </Button>
                  </Link>
                </Box>
              </>
            )
          ) : (
            <>
              {role === "Người nhập" || role === "Người xuất" ? (
                <>
                  {" "}
                  <Link
                    to={`/xemphieu/${row.original.masophieu}/${row.original.loaiphieu}/${row.original.ngaytaophieu}/${row.original.nguoitaophieu}/none/none/none/${row.original.tenphieu}`}
                    state={{
                      dataMucInCuaPhieu: row.original.danhsachmucincuaphieu,
                    }}
                  >
                    <Button type="primary" htmlType="submit">
                      Xem
                    </Button>
                  </Link>
                </>
              ) : (
                <></>
              )}
            </>
          )}
        </>
      ),
  });

  const tablePhieuXuat = useMaterialReactTable({
    columns: columnsPhieuXuat,
    data: dataPhieuXuat,
    enableHiding: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableRowActions: true,
    enableSorting: false,
    paginationDisplayMode: "pages",
    initialState: {
      columnPinning: {
        right: ["mrt-row-actions"],
      },
    },
    state: { isLoading: loadingDanhSachPhieu },
    muiCircularProgressProps: {
      color: "primary",
      thickness: 5,
      size: 55,
    },
    muiSkeletonProps: {
      animation: "pulse",
      height: 28,
    },
    positionActionsColumn: "last",
    displayColumnDefOptions: {
      "mrt-row-actions": {
        header: "Thao tác",
        size: 100,
      },
    },
    renderRowActions: ({ row, table }) =>
      row.original.loaiphieu === "Phiếu xuất" &&
      row.original.danhsachmucincuaphieu.length > 0 ? (
        row.original.trangthai === "Chưa xuất" ? (
          <>
            <Link
              to={`/xemphieu/${row.original.masophieu}/${row.original.loaiphieu}/${row.original.ngaytaophieu}/${row.original.nguoitaophieu}/none/none/none/${row.original.tenphieu}`}
              state={{
                dataMucInCuaPhieu: row.original.danhsachmucincuaphieu,
                khoaphong: row.original.khoaphongxuatmuc,
              }}
            >
              <Button type="primary" htmlType="submit">
                Xem
              </Button>
            </Link>
          </>
        ) : (
          <>
            {/* {tendangnhap === "Trần Đắc Thương" ? (
              <>
                <Link
                  to={`/chinhsuaphieu/${row.original.masophieu}`}
                  state={{
                    phieuData: row.original,
                    dataMucInCuaPhieu: row.original.danhsachmucincuaphieu,
                  }}
                >
                  <Button type="primary" danger htmlType="submit">
                    Chỉnh sửa
                  </Button>
                </Link>
              </>
            ) : (
              <></>
            )} */}
            <Link
              to={`/xemphieu/${row.original.masophieu}/${row.original.loaiphieu}/${row.original.ngaytaophieu}/${row.original.nguoitaophieu}/none/none/${row.original.thoigianxuat}/${row.original.tenphieu}`}
              state={{
                dataMucInCuaPhieu: row.original.danhsachmucincuaphieu,
                khoaphong: row.original.khoaphongxuatmuc,
              }}
            >
              <Button type="primary" htmlType="submit">
                Xem
              </Button>
            </Link>
          </>
        )
      ) : (
        <Button
          title="Phiếu này chưa được nhập mực in nào. Vui lòng nhập ít nhất một mực in trước khi xem"
          type="primary"
          htmlType="submit"
          disabled
        >
          Xem
        </Button>
      ),
  });

  return (
    <>
      {contextHolder}
      <Helmet>
        <meta charSet="utf-8" />
        <title>Trang chủ</title>
      </Helmet>
      <div className="container">
        <div className="text-center mt-5">
          <img src="../img/logo2.png" alt="" />
        </div>
        <h4 className="text-center mt-5 mb-5">DANH SÁCH PHIẾU</h4>

        <div className="mt-2 mb-5 d-flex">
          <Link to="/taophieu">
            <button type="button" className="btn btn-info me-2">
              Tạo phiếu
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
        <div className="mb-5">
          <h5>SỐ LƯỢNG ĐÃ NHẬP CỦA TỪNG LOẠI MỰC</h5>
          <div className="d-flex flex-wrap gap-2">
            {dataSoLuongMucInDaNhap && dataSoLuongMucInDaNhap.length > 0 ? (
              dataSoLuongMucInDaNhap.map((item, index) => (
                <button
                  type="button"
                  className="btn btn-success"
                  style={{ fontWeight: "bold" }}
                  key={index}
                >
                  {item.qrcode}{" "}
                  <span className="badge bg-danger">{item.soluong}</span>
                </button>
              ))
            ) : (
              <>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="mb-5">
          <h5>SỐ LƯỢNG ĐÃ XUẤT CỦA TỪNG LOẠI MỰC</h5>
          <div className="d-flex flex-wrap gap-2">
            {dataSoLuongMucInDaXuat && dataSoLuongMucInDaXuat.length > 0 ? (
              dataSoLuongMucInDaXuat.map((item, index) => (
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ fontWeight: "bold" }}
                  key={index}
                >
                  {item.qrcode}{" "}
                  <span class="badge bg-success">{item.soluong}</span>
                </button>
              ))
            ) : (
              <>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="mb-5">
          <h5>SỐ LƯỢNG TỒN KHO CỦA TỪNG LOẠI MỰC</h5>
          <div className="d-flex flex-wrap gap-2">
            {dataSoLuongMucInTonKho && dataSoLuongMucInTonKho.length > 0 ? (
              dataSoLuongMucInTonKho.map((item, index) => (
                <button
                  type="button"
                  className="btn btn-warning"
                  style={{ fontWeight: "bold" }}
                  key={index}
                >
                  {item.qrcode}{" "}
                  <span class="badge bg-danger">{item.soluong}</span>
                </button>
              ))
            ) : (
              <>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="d-flex justify-content-between">
          <h5 className="mt-1">DANH SÁCH CÁC PHIẾU NHẬP</h5>
        </div>
        <Select
          placeholder="Lọc theo thầu"
          allowClear
          style={{ width: 200 }}
          onChange={(value) => setFilterThau(value)}
        >
          {danhSachThau.map((item) => (
            <Option key={item} value={item}>
              {item}
            </Option>
          ))}
        </Select>
        <div className="mb-5 mt-3">
          <MaterialReactTable
            table={tablePhieuNhap}
            state={{ isLoading: true }}
            muiCircularProgressProps={{
              color: "secondary",
              thickness: 5,
              size: 55,
            }}
            muiSkeletonProps={{
              animation: "pulse",
              height: 28,
            }}
          />
        </div>
        {role === "Người nhập" ? (
          <></>
        ) : (
          <>
            {" "}
            <div className="d-flex justify-content-between">
              <h5 className="mt-1">DANH SÁCH CÁC PHIẾU XUẤT</h5>
            </div>
            <div className="" style={{ marginBottom: "150px" }}>
              <MaterialReactTable table={tablePhieuXuat} />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default InkManager;
