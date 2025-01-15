import { QuestionCircleOutlined, UserOutlined } from "@ant-design/icons";
import {
  Button,
  ConfigProvider,
  Form,
  Input,
  Modal,
  notification,
  Popconfirm,
  Space,
} from "antd";
import axios from "axios";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
import { Box, FormControlLabel, Switch } from "@mui/material";
import { Helmet } from "react-helmet";
import TextArea from "antd/es/input/TextArea";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BlockIcon from "@mui/icons-material/Block";
import EditIcon from "@mui/icons-material/Edit";

const SuaChuaMuc = (props) => {
  const [decodeWorkerData] = useState(() => new Worker("decodeWorkerData.js"));
  const [decodeWorkerRole] = useState(() => new Worker("decodeWorkerRole.js"));
  const [decodeWorkerLoginInfo] = useState(
    () => new Worker("decodeWorkerLoginInfo.js")
  );
  const [encodeWorkerDangSuaChua] = useState(
    () => new Worker("encodeWorkerSuaChua.js")
  );
  const [encodeWorkerHoanTatSuaChua] = useState(
    () => new Worker("encodeWorkerHoanTatSuaChua.js")
  );
  const [encodeWorkerXoaMucSuaChua] = useState(
    () => new Worker("encodeWorkerXoaMucSuaChua.js")
  );
  const [encodeWorkerDungSuaChua] = useState(
    () => new Worker("encodeWorkerDungSuaChua.js")
  );
  const [encodeWorkerChinhSuaNoiDung] = useState(
    () => new Worker("encodeWorkerChinhSuaNoiDung.js")
  );
  const [dataTonkho, setDataTonKho] = useState([]);
  const [dataDaXuat, setDataDaXuat] = useState([]);
  const [dataDaNhap, setDataDaNhap] = useState([]);
  const [status, setStatus] = useState("");
  const [tendangnhap, setTendangnhap] = useState("");
  const [role, setRole] = useState("");

  // Thêm state để quản lý modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInk, setSelectedInk] = useState(null);

  const [api, contextHolder] = notification.useNotification();

  const [form] = Form.useForm();

  const [fixingInks, setFixingInks] = useState([]);

  const [loadingMucIn, setLoadingMucIn] = useState(true);

  const [showDangSuaChua, setShowDangSuaChua] = useState(true);
  const [showDaSuaChua, setShowDaSuaChua] = useState(true);
  const [showDungSuaChua, setShowDungSuaChua] = useState(true);
  const [originalFixingInks, setOriginalFixingInks] = useState([]); // Data gốc
  const [displayedFixingInks, setDisplayedFixingInks] = useState([]); // Data hiển thị

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInk, setEditingInk] = useState(null);
  const [editForm] = Form.useForm();

  const navigate = useNavigate();

  const handleEncodeDangSuaChua = (data) => {
    return new Promise((resolve, reject) => {
      if (encodeWorkerDangSuaChua) {
        encodeWorkerDangSuaChua.postMessage(data);
        encodeWorkerDangSuaChua.onmessage = function (e) {
          resolve(e.data);
        };
      } else {
        console.log("Mã hóa dữ liệu đang sửa chữa không thành công");
      }
    });
  };

  const handleEncodeHoanTatSuaChua = (data) => {
    return new Promise((resolve, reject) => {
      if (encodeWorkerHoanTatSuaChua) {
        encodeWorkerHoanTatSuaChua.postMessage(data);
        encodeWorkerHoanTatSuaChua.onmessage = function (e) {
          resolve(e.data);
        };
      } else {
        console.log("Mã hóa dữ liệu hoàn tất sửa chữa không thành công");
      }
    });
  };

  const handleEncodeChinhSuaNoiDungSuaChua = (data) => {
    return new Promise((resolve, reject) => {
      if (encodeWorkerChinhSuaNoiDung) {
        encodeWorkerChinhSuaNoiDung.postMessage(data);
        encodeWorkerChinhSuaNoiDung.onmessage = function (e) {
          resolve(e.data);
        };
      } else {
        console.log("Mã hóa dữ liệu chỉnh sửa sửa chữa không thành công");
      }
    });
  };

  const handleEncodeDungSuaChua = (data) => {
    return new Promise((resolve, reject) => {
      if (encodeWorkerDungSuaChua) {
        encodeWorkerDungSuaChua.postMessage(data);
        encodeWorkerDungSuaChua.onmessage = function (e) {
          resolve(e.data);
        };
      } else {
        console.log("Mã hóa dữ liệu hoàn tất sửa chữa không thành công");
      }
    });
  };

  const handleEncodeXoaMucDangSuaChua = (data) => {
    return new Promise((resolve, reject) => {
      if (encodeWorkerXoaMucSuaChua) {
        encodeWorkerXoaMucSuaChua.postMessage(data);
        encodeWorkerXoaMucSuaChua.onmessage = function (e) {
          resolve(e.data);
        };
      } else {
        console.log("Mã hóa dữ liệu đang xóa sửa chữa không thành công");
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

  const handleToggleDangSuaChua = () => {
    setShowDangSuaChua(!showDangSuaChua);
  };

  const handleToggleDaSuaChua = () => {
    setShowDaSuaChua(!showDaSuaChua);
  };

  const handleToggleDungSuaChua = () => {
    setShowDungSuaChua(!showDungSuaChua);
  };

  // Filter data khi toggle thay đổi
  useEffect(() => {
    const newFilteredData = originalFixingInks.filter(
      (item) =>
        (showDangSuaChua && item.suachua === "Đang sửa chữa") ||
        (showDaSuaChua && item.suachua === "Đã sửa chữa") ||
        (showDungSuaChua && item.suachua === "Dừng sửa chữa")
    );
    setDisplayedFixingInks(newFilteredData);
  }, [showDangSuaChua, showDaSuaChua, showDungSuaChua, originalFixingInks]);

  useEffect(() => {
    FetchDataPhieuInk();
  }, [status]);

  const FetchDataPhieuInk = async () => {
    try {
      let res = await axios.get(`http://172.16.0.53:8080/danh_sach`);
      if (res && res.data) {
        let tonkhoArr = [];
        let xuatArr = [];
        let nhapArr = [];
        let fixingInksArr = [];

        const listData = res?.data;

        const decodedAllData = [];
        for (const item of listData) {
          try {
            let dataDecode = await handleDecodeData(item.content);

            decodedAllData.push({
              ...item,
              decodedContent: dataDecode,
            });

            if (
              dataDecode?.content?.danhsachphieu?.trangthai === "Đã xuất" ||
              dataDecode?.content?.danhsachphieu?.trangthai === "Đã duyệt"
            ) {
              const danhsachmucin =
                dataDecode?.content?.danhsachphieu?.danhsachmucincuaphieu;

              // Lọc các mực đã hoàn trả (hoantra = 1)
              const fixingInksInPhieu = danhsachmucin?.filter(
                (mucin) =>
                  mucin?.suachua === "Đang sửa chữa" ||
                  mucin?.suachua === "Đã sửa chữa" ||
                  mucin?.suachua === "Dừng sửa chữa"
              );

              if (fixingInksInPhieu?.length > 0) {
                fixingInksArr = [...fixingInksArr, ...fixingInksInPhieu];
              }
            }
          } catch (error) {
            console.error("Error decoding item:", item, error);
            api["error"]({
              message: "Lỗi",
              description: "Đã xảy ra lỗi trong quá trình hiển thị dữ liệu",
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

        fixingInksArr.sort((a, b) => {
          const timeA = new Date(
            a.thoigianbatdausuachua.split(" ")[0].split("-").reverse().join("-")
          );
          const timeB = new Date(
            b.thoigianbatdausuachua.split(" ")[0].split("-").reverse().join("-")
          );
          return timeB - timeA;
        });

        setOriginalFixingInks(fixingInksArr);
        setFixingInks(fixingInksArr);
        setDataDaNhap(nhapArr);
        setDataDaXuat(xuatArr);
        setDataTonKho(tonkhoArr);
        setLoadingMucIn(false);
      }
    } catch (error) {
      api["error"]({
        message: "Lỗi",
        description: "Đã xảy ra lỗi trong quá trình hiển thị danh sách phiếu",
      });
    }
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

  const handleChinhSuaNoiDungSuaChua = async (values) => {
    try {
      let res = await axios.get(`http://172.16.0.53:8080/danh_sach`);
      if (res && res.data) {
        const listData = res.data;

        for (const item of listData) {
          let dataDecode = await handleDecodeData(item.content);

          if (dataDecode?.content?.danhsachphieu?.trangthai === "Đã xuất") {
            const danhsachmucin =
              dataDecode?.content?.danhsachphieu?.danhsachmucincuaphieu;
            const maSoPhieu = item._id;

            const inkIndex = danhsachmucin?.findIndex(
              (mucin) => mucin.qrcode === editingInk.qrcode
            );

            if (inkIndex !== -1) {
              danhsachmucin[inkIndex] = {
                ...danhsachmucin[inkIndex],
                noidungsuachua: values.noidung,
              };

              const updatedContent = {
                content: {
                  danhsachphieu: {
                    ...dataDecode.content.danhsachphieu,
                    danhsachmucincuaphieu: danhsachmucin,
                  },
                },
              };

              let jwtTokenContent = await handleEncodeChinhSuaNoiDungSuaChua(
                updatedContent
              );
              await axios.get(
                `http://172.16.0.53:8080/update/${maSoPhieu}/${jwtTokenContent}`
              );

              setStatus("chinhsua");
              setIsEditModalOpen(false);
              api["success"]({
                message: "Thành công",
                description: "Đã cập nhật nội dung sửa chữa",
              });
              return;
            }
          }
        }
      }
    } catch (error) {
      api["error"]({
        message: "Lỗi",
        description: "Đã xảy ra lỗi khi cập nhật nội dung",
      });
    }
  };

  const handleNhapMucInSuaChua = async (values) => {
    const qrcodeScan = values.qrcode;

    try {
      let res = await axios.get(`http://172.16.0.53:8080/danh_sach`);
      if (res && res.data) {
        const listData = res.data;
        console.log(listData);

        let mucDaXuat = false;
        let mucDangSuaChua = false;

        try {
          let res = await axios.post(
            `http://172.16.0.53:8080/parse_name_id`,
            { name_id: qrcodeScan },
            {
              mode: "cors",
            }
          );

          let dataInkDecode = res.data.name + "_" + res.data.id;

          // Kiểm tra xem mực đã được xuất chưa
          for (const item of listData) {
            let dataDecode = await handleDecodeData(item.content);
            if (dataDecode?.content?.danhsachphieu?.trangthai === "Đã xuất") {
              const danhsachmucin =
                dataDecode?.content?.danhsachphieu?.danhsachmucincuaphieu;
              const timThayMuc = danhsachmucin?.find(
                (mucin) => mucin.qrcode === dataInkDecode
              );

              if (timThayMuc && timThayMuc.suachua === "Đang sửa chữa") {
                mucDangSuaChua = true;
                break;
              }
              if (
                danhsachmucin?.some((mucin) => mucin.qrcode === dataInkDecode)
              ) {
                mucDaXuat = true;
                break;
              }
            }
          }

          // Nếu mực đang sửa chữa, hiển thị thông báo lỗi
          if (mucDangSuaChua) {
            api["error"]({
              message: "Thất bại",
              description: "Mực này đang trong quá trình sửa chữa",
            });
            form.resetFields();
            return;
          }

          // Nếu mực chưa được xuất, hiển thị thông báo lỗi
          if (!mucDaXuat) {
            api["error"]({
              message: "Thất bại",
              description:
                "Mực này không có trong danh sách xuất để có thể sửa chữa",
            });
            form.resetFields();
            return;
          }

          for (const item of listData) {
            let dataDecode = await handleDecodeData(item.content);

            if (dataDecode?.content?.danhsachphieu?.trangthai === "Đã xuất") {
              const danhsachmucin =
                dataDecode?.content?.danhsachphieu?.danhsachmucincuaphieu;
              const maSoPhieu = item._id;

              const timThayMuc = danhsachmucin?.find(
                (mucin) => mucin.qrcode === dataInkDecode
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

              if (timThayMuc) {
                const inkIndex = danhsachmucin?.findIndex(
                  (mucin) => mucin.qrcode === dataInkDecode
                );
                // Cập nhật thuộc tính hoàn trả cho mực
                // danhsachmucin[inkIndex] = {
                //   ...danhsachmucin[inkIndex],
                //   suachua: "Đang sửa chữa",
                //   noidungsuachua: values.noidung,
                //   thoigianbatdausuachua: currentTime,
                // };

                const newInkItem = {
                  ...danhsachmucin[inkIndex],
                  suachua: "Đang sửa chữa",
                  noidungsuachua: values.noidung,
                  thoigianbatdausuachua: currentTime,
                };

                danhsachmucin[inkIndex] = newInkItem;

                const mucInVaMaSoPhieu = {
                  ...timThayMuc,
                  masophieuxuat: maSoPhieu,
                };

                // Cập nhật lại nội dung phiếu
                const updatedContent = {
                  content: {
                    danhsachphieu: {
                      ...dataDecode.content.danhsachphieu,
                      danhsachmucincuaphieu: danhsachmucin,
                    },
                  },
                };

                let jwtTokenContent = await handleEncodeDangSuaChua(
                  updatedContent
                );

                //Gọi API cập nhật phiếu
                await axios.get(
                  `http://172.16.0.53:8080/update/${mucInVaMaSoPhieu.masophieuxuat}/${jwtTokenContent}`
                );
                // Add new item at the beginning of the list
                setFixingInks([newInkItem, ...fixingInks]);
                setStatus("suachua");

                api["success"]({
                  message: "Thành công",
                  description: "Mực in đã được thêm vào danh sách sửa chữa",
                });
                form.resetFields();
                return;
              }
            }
          }

          api["error"]({
            message: "Thất bại",
            description: "Không tìm thấy mực này trong danh sách phiếu xuất",
          });
        } catch (error) {
          api["error"]({
            message: "Lỗi",
            description: "Đã xảy ra lỗi khi thêm mực sửa chữa",
          });
        }
      }
    } catch (error) {
      api["error"]({
        message: "Lỗi",
        description: "Đã xảy ra lỗi khi thêm mực sửa chữa",
      });
    }
    form.resetFields();
  };

  const handleDangXuat = () => {
    localStorage.removeItem("token");

    navigate("/dangnhap");
  };

  const handleHoanTatSuaChua = async (row) => {
    try {
      let res = await axios.get(`http://172.16.0.53:8080/danh_sach`);
      if (res && res.data) {
        const listData = res.data;

        // Tìm và cập nhật trạng thái trong phiếu xuất
        for (const item of listData) {
          let dataDecode = await handleDecodeData(item.content);

          if (dataDecode?.content?.danhsachphieu?.trangthai === "Đã xuất") {
            const danhsachmucin =
              dataDecode?.content?.danhsachphieu?.danhsachmucincuaphieu;
            const maSoPhieu = item._id;

            const timThayMuc = danhsachmucin?.find(
              (mucin) => mucin.qrcode === row.original.qrcode
            );

            if (timThayMuc) {
              // Cập nhật trạng thái trong phiếu xuất
              const inkIndex = danhsachmucin?.findIndex(
                (mucin) => mucin.qrcode === row.original.qrcode
              );

              // Xóa mực khỏi danh sách xuất
              danhsachmucin.splice(inkIndex, 1);

              // Tìm phiếu nhập chứa mực này
              for (const nhapItem of listData) {
                let nhapDecode = await handleDecodeData(nhapItem.content);

                if (
                  nhapDecode?.content?.danhsachphieu?.trangthai === "Đã duyệt"
                ) {
                  const danhsachmucinnhap =
                    nhapDecode?.content?.danhsachphieu?.danhsachmucincuaphieu ||
                    [];

                  // Kiểm tra xem mực có trong phiếu nhập không
                  const mucTrongPhieuNhap = danhsachmucinnhap.find(
                    (mucin) => mucin.qrcode === row.original.qrcode
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

                  if (mucTrongPhieuNhap) {
                    const danhsachtonkho =
                      nhapDecode?.content?.danhsachtonkho
                        ?.danhsachmucinthemvaokho || [];

                    // Thêm mực đã sửa vào tồn kho
                    danhsachtonkho.push({
                      ...timThayMuc,
                      suachua: "Đã sửa chữa",
                      thoigianketthucsuachua: currentTime,
                    });

                    // Cập nhật phiếu nhập
                    const updatedNhapContent = {
                      content: {
                        ...nhapDecode.content,
                        danhsachtonkho: {
                          danhsachmucinthemvaokho: danhsachtonkho,
                        },
                      },
                    };

                    // Cập nhật phiếu xuất
                    const updatedXuatContent = {
                      content: {
                        danhsachphieu: {
                          ...dataDecode.content.danhsachphieu,
                          danhsachmucincuaphieu: danhsachmucin,
                        },
                      },
                    };

                    let jwtTokenNhapContent = await handleEncodeHoanTatSuaChua(
                      updatedNhapContent
                    );
                    let jwtTokenXuatContent = await handleEncodeHoanTatSuaChua(
                      updatedXuatContent
                    );

                    await axios.get(
                      `http://172.16.0.53:8080/update/${nhapItem._id}/${jwtTokenNhapContent}`
                    );
                    await axios.get(
                      `http://172.16.0.53:8080/update/${maSoPhieu}/${jwtTokenXuatContent}`
                    );

                    setStatus("hoantatsua");
                    api["success"]({
                      message: "Thành công",
                      description: "Đã hoàn tất sửa chữa và trả mực về kho",
                    });
                    return;
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      api["error"]({
        message: "Lỗi",
        description: "Đã xảy ra lỗi khi hoàn tất sửa chữa mực",
      });
    }
  };

  const handleDungSuaChua = async (row) => {
    try {
      let res = await axios.get(`http://172.16.0.53:8080/danh_sach`);
      if (res && res.data) {
        const listData = res.data;

        for (const item of listData) {
          let dataDecode = await handleDecodeData(item.content);

          if (dataDecode?.content?.danhsachphieu?.trangthai === "Đã xuất") {
            const danhsachmucin =
              dataDecode?.content?.danhsachphieu?.danhsachmucincuaphieu;
            const maSoPhieu = item._id;

            const timThayMuc = danhsachmucin?.find(
              (mucin) => mucin.qrcode === row.original.qrcode
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

            if (timThayMuc) {
              const inkIndex = danhsachmucin?.findIndex(
                (mucin) => mucin.qrcode === row.original.qrcode
              );

              danhsachmucin[inkIndex] = {
                ...danhsachmucin[inkIndex],
                suachua: "Dừng sửa chữa",
                thoigianketthucsuachua: currentTime,
              };

              const updatedContent = {
                content: {
                  danhsachphieu: {
                    ...dataDecode.content.danhsachphieu,
                    danhsachmucincuaphieu: danhsachmucin,
                  },
                },
              };

              let jwtTokenContent = await handleEncodeDungSuaChua(
                updatedContent
              );

              await axios.get(
                `http://172.16.0.53:8080/update/${maSoPhieu}/${jwtTokenContent}`
              );

              setStatus("dungsuachua");
              api["success"]({
                message: "Thành công",
                description: "Đã dừng sửa chữa mực",
              });
              return;
            } else {
              api["error"]({
                message: "Thất bại",
                description:
                  "Không tìm thấy mực này trong danh sách phiếu xuất",
              });
              return;
            }
          }
        }
      }
    } catch (error) {
      api["error"]({
        message: "Lỗi",
        description: "Đã xảy ra lỗi khi hoàn tất sửa chữa mực",
      });
    }
  };

  const handleXoaMucSuaChua = async (row) => {
    try {
      let res = await axios.get(`http://172.16.0.53:8080/danh_sach`);
      if (res && res.data) {
        const listData = res.data;

        for (const item of listData) {
          let dataDecode = await handleDecodeData(item.content);

          if (dataDecode?.content?.danhsachphieu?.trangthai === "Đã xuất") {
            const danhsachmucin =
              dataDecode?.content?.danhsachphieu?.danhsachmucincuaphieu;
            const maSoPhieu = item._id;

            const timThayMuc = danhsachmucin?.find(
              (mucin) => mucin.qrcode === row.original.qrcode
            );

            if (timThayMuc) {
              const inkIndex = danhsachmucin?.findIndex(
                (mucin) => mucin.qrcode === row.original.qrcode
              );

              // Xóa thuộc tính suachua
              delete danhsachmucin[inkIndex].suachua;
              delete danhsachmucin[inkIndex].thoigianbatdausuachua;
              delete danhsachmucin[inkIndex].thoigianketthucsuachua;
              delete danhsachmucin[inkIndex].noidungsuachua;

              const updatedContent = {
                content: {
                  danhsachphieu: {
                    ...dataDecode.content.danhsachphieu,
                    danhsachmucincuaphieu: danhsachmucin,
                  },
                },
              };

              let jwtTokenContent = await handleEncodeXoaMucDangSuaChua(
                updatedContent
              );

              await axios.get(
                `http://172.16.0.53:8080/update/${maSoPhieu}/${jwtTokenContent}`
              );

              setStatus("xoamuc");
              api["success"]({
                message: "Thành công",
                description: "Đã xóa mực khỏi danh sách sửa chữa",
              });
              return;
            } else {
              api["error"]({
                message: "Thất bại",
                description:
                  "Không tìm thấy mực này trong danh sách phiếu xuất",
              });
              return;
            }
          }
        }
      }
    } catch (error) {
      api["error"]({
        message: "Lỗi",
        description: "Đã xảy ra lỗi khi xóa mực",
      });
    }
  };

  const showModal = (row) => {
    setSelectedInk(row.original);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedInk(null);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "tenmuc",
        header: "Tên mực",
        size: 100,
      },

      {
        accessorKey: "mamuc",
        header: "Mã mực",
        size: 100,
      },
      {
        accessorKey: "qrcode",
        header: "Mã QRCode",
        size: 100,
      },
      {
        accessorKey: "noidungsuachua",
        header: "Nội dung sửa chữa",
        size: 100,
      },
      {
        accessorKey: "thoigianbatdausuachua",
        header: "Bắt đầu vào lúc",
        size: 100,
      },
      {
        accessorKey: "thoigianketthucsuachua",
        header: "Kết thúc vào lúc",
        size: 100,
      },
      {
        accessorKey: "suachua",
        header: "Trạng thái",
        size: 100,

        Cell: ({ cell }) => (
          <Box
            component="span"
            sx={(theme) => ({
              backgroundColor:
                cell.getValue() === "Đã sửa chữa"
                  ? theme.palette.success.dark
                  : cell.getValue() === "Đang sửa chữa"
                  ? theme.palette.warning.dark
                  : cell.getValue() === "Dừng sửa chữa" &&
                    theme.palette.error.dark,

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

  const table = useMaterialReactTable({
    columns,
    data: displayedFixingInks,
    enableHiding: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableRowActions: true,
    state: { isLoading: loadingMucIn },
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
      <Box sx={{ display: "flex", gap: "0.5rem" }}>
        <>
          {row.original.suachua === "Đã sửa chữa" ||
          row.original.suachua === "Dừng sửa chữa" ? (
            <>
              <Button
                title="Xem chi tiết"
                type="primary"
                onClick={() => showModal(row)}
              >
                <VisibilityIcon />
              </Button>
            </>
          ) : (
            <>
              {" "}
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
                  title="Hoàn tất sửa chữa"
                  description="Bạn có chắc chắn muốn hoàn tất sửa chữa mực này không?"
                  onConfirm={() => handleHoanTatSuaChua(row)}
                  cancelText="Không"
                  okText="Có"
                  icon={
                    <QuestionCircleOutlined
                      style={{
                        color: "green",
                      }}
                    />
                  }
                >
                  <Button title="Hoàn tất sửa chữa" type="primary">
                    <CheckIcon />
                  </Button>
                </Popconfirm>
              </ConfigProvider>
              {row.original.suachua === "Đang sửa chữa" && (
                <Button
                  title="Chỉnh sửa nội dung"
                  type="primary"
                  onClick={() => {
                    setEditingInk(row.original);
                    setIsEditModalOpen(true);
                    editForm.setFieldsValue({
                      noidung: row.original.noidungsuachua,
                    });
                  }}
                >
                  <EditIcon />
                </Button>
              )}
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
                  title="Dừng sửa chữa"
                  description="Bạn có chắc chắn muốn dừng sửa chữa mực này không?"
                  onConfirm={() => handleDungSuaChua(row)}
                  cancelText="Không"
                  okText="Có"
                  icon={
                    <QuestionCircleOutlined
                      style={{
                        color: "red",
                      }}
                    />
                  }
                >
                  <Button title="Dừng sửa chữa" danger type="primary">
                    <BlockIcon />
                  </Button>
                </Popconfirm>
              </ConfigProvider>
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
                  title="Xóa mực in"
                  description="Bạn có chắc chắn muốn xóa mực này không?"
                  onConfirm={() => handleXoaMucSuaChua(row)}
                  cancelText="Không"
                  okText="Có"
                  icon={
                    <QuestionCircleOutlined
                      style={{
                        color: "red",
                      }}
                    />
                  }
                >
                  <Button title="Xóa mực in" type="primary" danger>
                    <CloseIcon />
                  </Button>
                </Popconfirm>
              </ConfigProvider>
            </>
          )}
        </>
      </Box>
    ),
    positionActionsColumn: "last",
    displayColumnDefOptions: {
      "mrt-row-actions": {
        header: "Thao tác",
        size: 100,
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
        <FormControlLabel
          control={
            <Switch
              checked={showDangSuaChua}
              onChange={handleToggleDangSuaChua}
              color="primary"
            />
          }
          label="Đang sửa chữa"
        />
        <FormControlLabel
          control={
            <Switch
              checked={showDaSuaChua}
              onChange={handleToggleDaSuaChua}
              color="primary"
            />
          }
          label="Đã sửa chữa"
        />
        <FormControlLabel
          control={
            <Switch
              checked={showDungSuaChua}
              onChange={handleToggleDungSuaChua}
              color="primary"
            />
          }
          label="Dừng sửa chữa"
        />
      </Box>
    ),
  });

  const onReset = () => {
    form.resetFields();
  };

  return (
    <>
      {contextHolder}
      <Helmet>
        <meta charSet="utf-8" />
        <title>Sửa chữa mực</title>
      </Helmet>
      <div className="container">
        <div className="text-center mt-5">
          <img src="../../../../../../../img/logo2.png" alt="" />
        </div>

        <h4 className="text-center mt-5">DANH SÁCH SỬA CHỮA MỰC</h4>
        <div className="mt-5 mb-5 d-flex">
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
        <Form
          form={form}
          name="control-hooks"
          onFinish={handleNhapMucInSuaChua}
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
              placeholder="Nhập mực in cần sửa chữa"
              style={{
                width: "100%",
              }}
            />
          </Form.Item>
          <Form.Item
            name="noidung"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Vui lòng nhập nội dung",
              },
            ]}
          >
            <TextArea
              placeholder="Nhập nội dung sửa chữa"
              style={{
                width: "100%",
              }}
            />
          </Form.Item>
          <Form.Item
            wrapperCol={{
              span: 16,
            }}
          >
            <Space>
              <Button type="primary" htmlType="submit">
                Lưu thông tin
              </Button>
              <Button danger type="primary" htmlType="button" onClick={onReset}>
                Đặt lại
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <div className="mb-5 mt-5">
          <MaterialReactTable table={table} />
        </div>

        <Modal
          title="Chi tiết mực in"
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
        >
          {selectedInk && (
            <div>
              <p>
                <strong>Tên mực:</strong> {selectedInk.tenmuc}
              </p>
              <p>
                <strong>Mã mực:</strong> {selectedInk.mamuc}
              </p>
              <p>
                <strong>Mã QRCode:</strong> {selectedInk.qrcode}
              </p>
              <p>
                <strong>Nội dung sửa chữa:</strong> {selectedInk.noidungsuachua}
              </p>
              <p>
                <strong>Thời gian bắt đầu:</strong>{" "}
                {selectedInk.thoigianbatdausuachua}
              </p>
              <p>
                <strong>Thời gian kết thúc:</strong>{" "}
                {selectedInk.thoigianketthucsuachua}
              </p>
              <p>
                <strong>Trạng thái:</strong> {selectedInk.suachua}
              </p>
            </div>
          )}
        </Modal>

        <Modal
          title="Chỉnh sửa nội dung sửa chữa"
          open={isEditModalOpen}
          onCancel={() => setIsEditModalOpen(false)}
          footer={null}
        >
          <Form form={editForm} onFinish={handleChinhSuaNoiDungSuaChua}>
            <Form.Item
              name="noidung"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Vui lòng nhập nội dung",
                },
              ]}
            >
              <TextArea
                placeholder="Nhập nội dung sửa chữa"
                style={{
                  width: "100%",
                }}
              />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Cập nhật
                </Button>
                <Button onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default SuaChuaMuc;
