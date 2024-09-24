import { QuestionCircleOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input, notification, Popconfirm, Select } from "antd";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import React, { useEffect, useMemo, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ButtonBootstrap from "react-bootstrap/Button";
import axios from "axios";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import fontPath from "../fonts/Roboto-Black.ttf";
import Dropdown from "react-bootstrap/Dropdown";
import { Option } from "antd/es/mentions";

const NhapMuc = (props) => {
  const [status, setStatus] = useState("");

  const [api, contextHolder] = notification.useNotification();

  const [data, setData] = useState([]);

  const [dataTonKho, setDataTonKho] = useState([]);
  const [dataSizeTonKho, setDataSizeTonKho] = useState([]);

  const [dataDaXuat, setDataDaXuat] = useState([]);
  const [dataDaNhap, setDataDaNhap] = useState([]);

  const [dataDecode, setDataDecode] = useState([]);

  const [loadingMucIn, setLoadingMucIn] = useState(true);

  const [rowSelection, setRowSelection] = useState({});

  const [tendangnhap, setTendangnhap] = useState("");

  const [chonLoaiMuc, setChonLoaiMuc] = useState("");

  const [allInkLists, setAllInkLists] = useState([]);

  const [role, setRole] = useState("");

  const navigate = useNavigate();

  const [form] = Form.useForm();

  const [encodeWorkerXuatKho] = useState(
    () => new Worker("/encodeWorkerXuatKho.js")
  );
  const [encodeWorkerXoaMucIn] = useState(
    () => new Worker("/encodeWorkerXoaMucIn.js")
  );
  const [encodeWorkerXoaNhieuMucIn] = useState(
    () => new Worker("/encodeWorkerXoaNhieuMucIn.js")
  );
  const [encodeWorkerNhapMucInCay] = useState(
    () => new Worker("/encodeWorkerNhapMucInCay.js")
  );
  const [encodeWorkerNhapMucInNuoc] = useState(
    () => new Worker("/encodeWorkerNhapMucInNuoc.js")
  );
  const [decodeWorkerLoginInfo] = useState(
    () => new Worker("/decodeWorkerLoginInfo.js")
  );
  const [decodeWorkerData] = useState(() => new Worker("/decodeWorkerData.js"));
  const [decodeWorkerRole] = useState(() => new Worker("/decodeWorkerRole.js"));

  let dataPhieu = useParams();

  const handleEncodeXoaMucIn = (data) => {
    return new Promise((resolve, reject) => {
      if (encodeWorkerXoaMucIn) {
        encodeWorkerXoaMucIn.postMessage(data);
        encodeWorkerXoaMucIn.onmessage = function (e) {
          resolve(e.data);
        };
      } else {
        console.log("Mã hóa dữ liệu xóa mực in không thành công");
      }
    });
  };

  const handleEncodeXoaNhieuMucIn = (data) => {
    return new Promise((resolve, reject) => {
      if (encodeWorkerXoaNhieuMucIn) {
        encodeWorkerXoaNhieuMucIn.postMessage(data);
        encodeWorkerXoaNhieuMucIn.onmessage = function (e) {
          resolve(e.data);
        };
      } else {
        console.log("Mã hóa dữ liệu xóa nhiều mực in không thành công");
      }
    });
  };

  const handleEncodeXuatKho = (data) => {
    return new Promise((resolve, reject) => {
      if (encodeWorkerXuatKho) {
        encodeWorkerXuatKho.postMessage(data);
        encodeWorkerXuatKho.onmessage = function (e) {
          resolve(e.data);
        };
      } else {
        console.log("Mã hóa dữ liệu xuất kho không thành công");
      }
    });
  };

  const handleEncodeNhapMucInCay = (data) => {
    return new Promise((resolve, reject) => {
      if (encodeWorkerNhapMucInCay) {
        encodeWorkerNhapMucInCay.postMessage(data);
        encodeWorkerNhapMucInCay.onmessage = function (e) {
          resolve(e.data);
        };
      } else {
        console.log("Mã hóa dữ liệu nhập mực in không thành công");
      }
    });
  };

  const handleEncodeNhapMucInNuoc = (data) => {
    return new Promise((resolve, reject) => {
      if (encodeWorkerNhapMucInNuoc) {
        encodeWorkerNhapMucInNuoc.postMessage(data);
        encodeWorkerNhapMucInNuoc.onmessage = function (e) {
          resolve(e.data);
        };
      } else {
        console.log("Mã hóa dữ liệu nhập mực in không thành công");
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
        } else {
          let decodeLoginInfo = await handleDecodeLoginInfo(token);
          if (decodeLoginInfo?.role === "Người duyệt") {
            navigate("/forbidden");
          }
          setTendangnhap(decodeLoginInfo?.username);
        }
      };
      checkAlreadyLogin();
    } catch (error) {
      api["error"]({
        message: "Lỗi",
        description: "Đã xảy ra lỗi trong quá trình hiển thị dữ liệu",
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
    FetchDataMucInCuaPhieu();
  }, [status]);

  const FetchDataMucInCuaPhieu = async () => {
    try {
      let res = await axios.get(`http://172.16.0.53:8080/danh_sach`);
      if (res) {
        let dataInkPhieu = res?.data;
        let tonkhoArr = [];
        let tonkhoRealArr = [];
        let dataAfterEncode = [];
        let xuatArr = [];
        let nhapArr = [];
        let allInks = [];

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
                "Đã xảy ra lỗi trong quá trình hiển thị danh sách mực in",
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
            tonkhoRealArr = [...tonkhoRealArr, ...danhsachmucinthemvaokho];
          }
        }

        for (let i = 0; i < dataInkPhieu.length; i++) {
          let decodeContent = await handleDecodeData(dataInkPhieu[i].content);

          let decodeData = {
            id: dataInkPhieu[i]._id,
            decodeContent,
          };
          dataAfterEncode.push(decodeData);
        }

        setDataDecode(dataAfterEncode);

        let existsPhieu = dataInkPhieu.find(
          (item) => item._id === dataPhieu?.sophieu
        );
        if (existsPhieu) {
          let decodeData = await handleDecodeData(existsPhieu?.content);

          let decodeDanhsachmucin =
            decodeData?.content?.danhsachphieu?.danhsachmucincuaphieu;
          setData(decodeDanhsachmucin);
          setLoadingMucIn(false);
        }

        for (let i = 0; i < dataInkPhieu?.length; i++) {
          let decodeData = await handleDecodeData(dataInkPhieu[i].content);

          if (decodeData?.content?.danhsachphieu?.trangthai === "Đã duyệt") {
            let decodeDanhsachmucin =
              decodeData?.content?.danhsachtonkho?.danhsachmucinthemvaokho;
            tonkhoArr = [...tonkhoArr, ...decodeDanhsachmucin];
          }
        }

        for (const item of decodedAllData) {
          if (
            item.decodedContent?.content?.danhsachphieu
              ?.danhsachmucincuaphieu &&
            item.decodedContent?.content?.danhsachphieu?.trangthai ===
              "Chưa duyệt"
          ) {
            const inkList =
              item.decodedContent.content.danhsachphieu.danhsachmucincuaphieu.map(
                (ink) => ({
                  ...ink,
                  tenphieu: item.decodedContent.content.danhsachphieu.tenphieu,
                })
              );
            allInks = [...allInks, ...inkList];
          }
        }

        setDataSizeTonKho(tonkhoRealArr);
        setDataDaXuat(xuatArr);
        setDataDaNhap(nhapArr);
        setDataTonKho(tonkhoArr);
        setAllInkLists(allInks);
      }
    } catch (error) {
      console.log(error);

      api["error"]({
        message: "Lỗi",
        description: "Đã xảy ra lỗi trong quá trình hiển thị danh sách mực in",
      });
    }
  };

  const generateRandomEightDigitNumber = () => {
    const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
    return randomNumber;
  };

  const randomString = (length = 8) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleXuatKho = async () => {
    let timestamp = Date.now();

    let date = new Date(timestamp);

    let day = date.getDate();

    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    let currentTime = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;

    let danhsachmucinxuatkho = [...data];

    let updatedDataDecode = [...dataDecode] ? [...dataDecode] : [];

    let dataSauKhiXuat = [];

    danhsachmucinxuatkho = danhsachmucinxuatkho.map((item) => ({
      ...item,
      thoigianxuat: currentTime,
      khoaphongxuatmuc: dataPhieu?.khoaphong,
    }));

    try {
      let newDataXuatKho = {
        danhsachphieu: {
          loaiphieu: dataPhieu?.loaiphieu,
          tenphieu: dataPhieu?.tenphieu,
          ngaytaophieu: dataPhieu?.ngaytaophieu,
          nguoitaophieu: dataPhieu?.nguoitaophieu,
          thoigianxuat: currentTime,
          khoaphongxuatmuc:
            dataPhieu?.loaiphieu === "Phiếu nhập" ? "" : dataPhieu?.khoaphong,
          trangthai:
            dataPhieu?.trangthai === "Phiếu nhập" ? "Chưa duyệt" : "Đã xuất",

          danhsachmucincuaphieu: danhsachmucinxuatkho,
        },
      };

      let DataPhieuXuatKho = {
        content: newDataXuatKho,
      };

      let jwtTokenDataPhieuXuat = await handleEncodeXuatKho(DataPhieuXuatKho);

      await axios.get(
        `http://172.16.0.53:8080/update/${dataPhieu?.sophieu}/${jwtTokenDataPhieuXuat}`,
        {
          mode: "cors",
        }
      );

      for (let i = 0; i < dataDecode.length; i++) {
        if (
          dataDecode[i].decodeContent?.content?.danhsachphieu?.trangthai ===
          "Đã duyệt"
        ) {
          updatedDataDecode[
            i
          ].decodeContent.content.danhsachtonkho.danhsachmucinthemvaokho =
            updatedDataDecode[
              i
            ].decodeContent.content.danhsachtonkho.danhsachmucinthemvaokho.filter(
              (mucIn) =>
                !danhsachmucinxuatkho.some(
                  (item) => item.qrcode === mucIn.qrcode
                )
            );

          dataSauKhiXuat.push(updatedDataDecode[i]);

          let updatedData = updatedDataDecode[i].decodeContent.content;

          console.log(updatedData);

          let dataToEncode = {
            content: updatedData,
          };

          let jwtTokenUpdateDataPhieuXuat = await handleEncodeXuatKho(
            dataToEncode
          );

          await axios.get(
            `http://172.16.0.53:8080/update/${updatedDataDecode[i].id}/${jwtTokenUpdateDataPhieuXuat}`,
            {
              mode: "cors",
            }
          );
        }
      }
      toast.success("Xuất mực in khỏi kho thành công");
      navigate("/danhsachphieu");
    } catch (error) {
      api["error"]({
        message: "Thất bại",
        description: "Đã xảy ra lỗi trong quá trình xuất mực in",
      });
    }
  };

  const isValidNumericString = (str) => {
    // Sử dụng biểu thức chính quy để kiểm tra chuỗi chỉ chứa số
    const regex = /^[0-9]+$/;

    // Kiểm tra chuỗi bằng biểu thức chính quy
    return regex.test(str);
  };

  const handleThemMucInCay = async (values) => {
    let InkArray = [...data] ? [...data] : [];

    for (let i = 0; i < InkArray.length; i++) {
      if (InkArray[i].qrcode === values.qrcode) {
        api["error"]({
          message: "Thất bại",
          description: "Mực in này đã được thêm trong phiếu này",
        });
        form.resetFields();
        return;
      }
    }

    // Kiểm tra với tất cả danh sách mực in
    for (let i = 0; i < allInkLists.length; i++) {
      if (allInkLists[i].qrcode === values.qrcode) {
        api["error"]({
          message: "Thất bại",
          description: `Mực in này đã được thêm trong ${allInkLists[i].tenphieu}`,
        });
        form.resetFields();
        return;
      }
    }

    let existsInkTonKho = dataTonKho.find(
      (item) => item.qrcode === values.qrcode
    );

    if (!existsInkTonKho && dataPhieu?.loaiphieu === "Phiếu xuất") {
      api["error"]({
        message: "Thất bại",
        description: "Mực in này không có trong kho để xuất",
      });
      form.resetFields();
      return;
    }

    if (existsInkTonKho && dataPhieu?.loaiphieu === "Phiếu nhập") {
      api["error"]({
        message: "Thất bại",
        description: "Mực in này đã có trong kho",
      });
      form.resetFields();
      return;
    }
    try {
      let res = await axios.post(
        `http://172.16.0.53:8080/parse_name_id`,
        { name_id: values.qrcode },
        {
          mode: "cors",
        }
      );

      if (res && res.status === 200) {
        let insertMucIn = {
          tenmuc: res.data.name,
          mamuc: res.data.id,
          soluong: 1,
          qrcode: values.qrcode,
          loaiphieu: dataPhieu?.loaiphieu,
          tenphieu: dataPhieu?.tenphieu,
          inkId: generateRandomEightDigitNumber(),
        };

        InkArray.push(insertMucIn);

        let newTaoPhieuData = {
          danhsachphieu: {
            loaiphieu: dataPhieu?.loaiphieu,
            tenphieu: dataPhieu?.tenphieu,
            ngaytaophieu: dataPhieu?.ngaytaophieu,
            nguoitaophieu: dataPhieu?.nguoitaophieu,
            khoaphongxuatmuc:
              dataPhieu?.loaiphieu === "Phiếu nhập" ? "" : dataPhieu?.khoaphong,
            trangthai:
              dataPhieu?.loaiphieu === "Phiếu nhập"
                ? "Chưa duyệt"
                : "Chưa xuất",
            ngayduyetphieu: "",
            danhsachmucincuaphieu: InkArray,
          },
          danhsachtonkho: {},
        };
        let DataPhieuValues = {
          content: newTaoPhieuData,
        };

        let jwtToken = await handleEncodeNhapMucInCay(DataPhieuValues);
        try {
          await axios.get(
            `http://172.16.0.53:8080/update/${dataPhieu?.sophieu}/${jwtToken}`,
            {
              mode: "cors",
            }
          );
          api["success"]({
            message: "Thành công",
            description: "Nhập mực in vào phiếu thành công",
          });

          setStatus(randomString());
        } catch (error) {
          api["error"]({
            message: "Thất bại",
            description: "Đã xảy ra lỗi trong quá trình nhập mực in",
          });
        }
      }
    } catch (error) {
      api["error"]({
        message: "Thất bại",
        description:
          "Vui lòng nhập đúng định dạng và mã mực in phải đủ 8 ký tự",
      });
    }

    form.resetFields();
  };

  const handleThemMucInNuoc = async (values) => {
    let InkArray = [...data] ? [...data] : [];

    if (!isValidNumericString(values.qrcode)) {
      api["error"]({
        message: "Thất bại",
        description: "Mã mực in không đúng định dạng",
      });
      form.resetFields();
      return;
    }

    for (let i = 0; i < InkArray.length; i++) {
      if (InkArray[i].qrcode === values.qrcode) {
        api["error"]({
          message: "Thất bại",
          description: "Mực in này đã được thêm",
        });
        form.resetFields();
        return;
      }
    }

    let existsInkTonKho = dataTonKho.find(
      (item) => item.qrcode === values.qrcode
    );

    if (!existsInkTonKho && dataPhieu?.loaiphieu === "Phiếu xuất") {
      api["error"]({
        message: "Thất bại",
        description: "Mực in này không có trong kho để xuất",
      });
      form.resetFields();
      return;
    }

    if (existsInkTonKho && dataPhieu?.loaiphieu === "Phiếu nhập") {
      api["error"]({
        message: "Thất bại",
        description: "Mực in này đã có trong kho",
      });
      form.resetFields();
      return;
    }

    let insertMucIn = {
      tenmuc:
        values.qrcode === "8885007027876"
          ? "003 (Đen)"
          : values.qrcode === "8906049013198"
          ? "003 (Vàng)"
          : values.qrcode === "8885007027913"
          ? "003 (Hồng)"
          : values.qrcode === "8906049013174"
          ? "003 (Xanh)"
          : values.qrcode === "8885007020259"
          ? "664 (Hồng)"
          : values.qrcode === "8885007020242"
          ? "664 (Xanh)"
          : values.qrcode === "8885007020266"
          ? "664 (Vàng)"
          : values.qrcode === "8885007020235"
          ? "664 (Đen)"
          : values.qrcode === "8885007028255"
          ? "005 (Đen)"
          : values.qrcode === "8885007023441" && "774 (Đen)",

      mamuc:
        values.qrcode === "8885007027876"
          ? "8885007027876"
          : values.qrcode === "8906049013198"
          ? "8906049013198"
          : values.qrcode === "8885007027913"
          ? "8885007027913"
          : values.qrcode === "8906049013174"
          ? "8906049013174"
          : values.qrcode === "8885007020259"
          ? "8885007020259"
          : values.qrcode === "8885007020242"
          ? "8885007020242"
          : values.qrcode === "8885007020266"
          ? "8885007020266"
          : values.qrcode === "8885007020235"
          ? "8885007020235"
          : values.qrcode === "8885007028255"
          ? "8885007028255"
          : values.qrcode === "8885007023441" && "8885007023441",

      soluong: 1,
      qrcode: values.qrcode,
      loaiphieu: dataPhieu?.loaiphieu,
      tenphieu: dataPhieu?.tenphieu,
      inkId: generateRandomEightDigitNumber(),
    };

    InkArray.push(insertMucIn);

    let newTaoPhieuData = {
      danhsachphieu: {
        loaiphieu: dataPhieu?.loaiphieu,
        tenphieu: dataPhieu?.tenphieu,
        ngaytaophieu: dataPhieu?.ngaytaophieu,
        nguoitaophieu: dataPhieu?.nguoitaophieu,
        khoaphongxuatmuc:
          dataPhieu?.loaiphieu === "Phiếu nhập" ? "" : dataPhieu?.khoaphong,
        trangthai:
          dataPhieu?.loaiphieu === "Phiếu nhập" ? "Chưa duyệt" : "Chưa xuất",
        ngayduyetphieu: "",
        danhsachmucincuaphieu: InkArray,
      },
      danhsachtonkho: {},
    };
    let DataPhieuValues = {
      content: newTaoPhieuData,
    };

    let jwtToken = await handleEncodeNhapMucInNuoc(DataPhieuValues);
    try {
      await axios.get(
        `http://172.16.0.53:8080/update/${dataPhieu?.sophieu}/${jwtToken}`,
        {
          mode: "cors",
        }
      );
      api["success"]({
        message: "Thành công",
        description: "Nhập mực in vào phiếu thành công",
      });

      setStatus(randomString());
    } catch (error) {
      api["error"]({
        message: "Thất bại",
        description: "Đã xảy ra lỗi trong quá trình nhập mực in",
      });
    }

    form.resetFields();
  };

  const handleXoaMucIn = async (ink) => {
    const newDataInk = data.filter((item) => item.inkId !== ink.original.inkId);

    let newTaoPhieuData = {
      danhsachphieu: {
        loaiphieu: dataPhieu?.loaiphieu,
        tenphieu: dataPhieu?.tenphieu,
        ngaytaophieu: dataPhieu?.ngaytaophieu,
        nguoitaophieu: dataPhieu?.nguoitaophieu,
        khoaphongxuatmuc: dataPhieu?.khoaphong,
        trangthai: dataPhieu?.trangthai,
        ngayduyetphieu: "",
        danhsachmucincuaphieu: newDataInk,
      },
      danhsachtonkho: {},
    };
    let DataPhieuValues = {
      content: newTaoPhieuData,
    };

    let jwtToken = await handleEncodeXoaMucIn(DataPhieuValues);

    try {
      await axios.get(
        `http://172.16.0.53:8080/update/${dataPhieu?.sophieu}/${jwtToken}`,
        {
          mode: "cors",
        }
      );
      api["success"]({
        message: "Thành công",
        description: "Xóa mực in trong phiếu thành công",
      });
      setStatus(randomString());
      setTimeout(() => {
        setStatus("");
      }, 500);
    } catch (error) {
      api["error"]({
        message: "Thất bại",
        description: "Đã xảy ra lỗi trong quá trình xóa mực in",
      });
    }
  };

  const handleXoaNhieuMucInCungLuc = async (selectedRows) => {
    if (selectedRows.length === 0) return;

    const selectedInkIds = selectedRows.map((row) => row.original.inkId);

    const newDataInk = data.filter(
      (item) => !selectedInkIds.includes(item.inkId)
    );

    let newTaoPhieuData = {
      danhsachphieu: {
        loaiphieu: dataPhieu?.loaiphieu,
        tenphieu: dataPhieu?.tenphieu,
        ngaytaophieu: dataPhieu?.ngaytaophieu,
        nguoitaophieu: dataPhieu?.nguoitaophieu,
        khoaphongxuatmuc: dataPhieu?.khoaphong,
        trangthai: dataPhieu?.trangthai,
        ngayduyetphieu: "",
        danhsachmucincuaphieu: newDataInk,
      },
      danhsachtonkho: {},
    };
    let DataPhieuValues = {
      content: newTaoPhieuData,
    };

    let jwtToken = await handleEncodeXoaNhieuMucIn(DataPhieuValues);

    try {
      await axios.get(
        `http://172.16.0.53:8080/update/${dataPhieu?.sophieu}/${jwtToken}`,
        {
          mode: "cors",
        }
      );
      api["success"]({
        message: "Thành công",
        description: `Xóa ${selectedRows.length} mực in trong phiếu thành công`,
      });
      setStatus(randomString());
      setTimeout(() => {
        setStatus("");
      }, 500);
      setRowSelection({});
    } catch (error) {
      api["error"]({
        message: "Thất bại",
        description: "Đã xảy ra lỗi trong quá trình xóa mực in",
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
          "Mã QRCode": rowData[i].qrcode,
          "Tên mực": rowData[i].tenmuc,
          "Mã mực": rowData[i].mamuc,
          "Số lượng": rowData[i].soluong,
        };

        configDataArr.push(configData);
      }

      const wb = XLSX.utils.book_new();

      const ws = XLSX.utils.json_to_sheet(configDataArr);

      XLSX.utils.book_append_sheet(wb, ws, "Danh sách nhập mực");

      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });

      saveAs(blob, "danhsachnhapmuc.xlsx");
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

      doc.addFont(fontPath, "Roboto", "normal");
      doc.setFont("Roboto");

      const tableData = rows.map((row) => Object.values(row.original));
      const tableHeaders = columns.map((c) => c.header);

      autoTable(doc, {
        head: [tableHeaders],
        body: tableData,
        styles: { font: "Roboto", fontStyle: "normal" },
      });

      doc.save("danhsachnhapmuc.pdf");
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

  // const handleChonLoaiMuc = (loaimuc) => {
  //   if (loaimuc === "Mực cây") {
  //     setChonLoaiMuc("Cây");
  //   } else {
  //     setChonLoaiMuc("Nước");
  //   }
  // };

  const columns = useMemo(
    () => [
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
    enableRowActions: true,
    enableRowSelection: true,

    onRowSelectionChange: setRowSelection,
    initialState: {
      columnPinning: {
        right: ["mrt-row-actions"],
      },
    },
    state: { isLoading: loadingMucIn, rowSelection },
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
      <>
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
          <Popconfirm
            title="Xóa mực in"
            description="Bạn có chắc chắn muốn xóa những mực in này không?"
            onConfirm={() => {
              const selectedRows = table.getSelectedRowModel().rows;
              handleXoaNhieuMucInCungLuc(selectedRows);
            }}
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
            <Button
              danger
              type="primary"
              disabled={Object.keys(rowSelection).length === 0}
              variant="contained"
            >
              Xóa mực in đã chọn
            </Button>
          </Popconfirm>
        </Box>
      </>
    ),

    renderRowActions: ({ row, table }) => (
      <Popconfirm
        title="Xóa mực in"
        description="Bạn có chắc chắn muốn xóa mực in này không?"
        onConfirm={() => handleXoaMucIn(row)}
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
        <DeleteIcon color="error" style={{ cursor: "pointer" }} />
      </Popconfirm>
    ),

    positionActionsColumn: "last",
    displayColumnDefOptions: {
      "mrt-row-actions": {
        header: "Thao tác",
        size: 100,
      },
    },
  });

  return (
    <>
      {contextHolder}
      <Helmet>
        <meta charSet="utf-8" />
        <title>Nhập mực in</title>
      </Helmet>
      <div className="container">
        <div className="text-center mt-5">
          <img src="../../../../../../../img/logo2.png" alt="" />
        </div>
        <div className="mt-5 mb-3 d-flex">
          <Link to="/danhsachphieu">
            <button type="button" className="btn btn-success me-2">
              Trang chủ
            </button>
          </Link>
          <Link to="/tonkho">
            <button type="button" className="btn btn-warning me-2">
              Tồn kho{" "}
              <span class="badge bg-danger">{dataSizeTonKho.length}</span>
            </button>
          </Link>
          <Link to="/danhsachmucindanhap">
            <button type="button" className="btn btn-success me-2">
              Đã nhập <span class="badge bg-danger">{dataDaNhap.length}</span>
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
        <h4 className="text-center mt-5">THÊM MỚI MỰC IN CHO SỐ PHIẾU</h4>
        <h4 className="text-center text-danger mb-5">{dataPhieu?.sophieu}</h4>

        <Form form={form} name="control-hooks" onFinish={handleThemMucInCay}>
          <Form.Item
            name="qrcode"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Vui lòng nhập mực in",
              },
            ]}
          >
            <Input
              autoFocus
              placeholder="Nhập mực in đúng với định dạng sau: tenmucin_mamucin"
              style={{
                width: "100%",
              }}
            />
          </Form.Item>
        </Form>
        {/* <Select
          className="mb-4"
          showSearch
          placeholder="Chọn loại mực"
          allowClear
          style={{ width: "100%" }}
          onSelect={(event) => handleChonLoaiMuc(event)}
        >
          <Option value="Mực cây">Mực cây</Option>;
          <Option value="Mực nước">Mực nước</Option>;
        </Select>
        {chonLoaiMuc === "Cây" && (
          <>
            {" "}
            <Form
              form={form}
              name="control-hooks"
              onFinish={handleThemMucInCay}
            >
              <Form.Item
                name="qrcode"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: "Vui lòng nhập mực in",
                  },
                ]}
              >
                <Input
                  autoFocus
                  placeholder="Nhập mực in đúng với định dạng sau: tenmucin_mamucin"
                  style={{
                    width: "100%",
                  }}
                />
              </Form.Item>
            </Form>
          </>
        )}
        {chonLoaiMuc === "Nước" && (
          <>
            {" "}
            <Form
              form={form}
              name="control-hooks"
              onFinish={handleThemMucInNuoc}
            >
              <Form.Item
                name="qrcode"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: "Vui lòng nhập mực in",
                  },
                ]}
              >
                <Input
                  autoFocus
                  placeholder="Nhập mực in"
                  style={{
                    width: "100%",
                  }}
                />
              </Form.Item>
            </Form>
          </>
        )} */}

        <div className="d-flex justify-content-between">
          <h5 className="mt-3">CÁC MỰC IN ĐÃ THÊM</h5>
        </div>
        {dataPhieu?.loaiphieu === "Phiếu xuất" ? (
          data && data.length > 0 ? (
            <Popconfirm
              title="Xuất kho"
              description="Bạn có chắc chắn muốn xuất kho không?"
              onConfirm={() => handleXuatKho()}
              cancelText="Không"
              okText="Có"
            >
              <Button type="primary" htmlType="submit">
                Hoàn thành việc xuất kho
              </Button>
            </Popconfirm>
          ) : (
            <Button type="primary" htmlType="submit" disabled>
              Hoàn thành việc xuất kho
            </Button>
          )
        ) : (
          <></>
        )}
        <div className="mb-5 mt-3">
          <MaterialReactTable table={table} />
        </div>
      </div>
    </>
  );
};

export default NhapMuc;
