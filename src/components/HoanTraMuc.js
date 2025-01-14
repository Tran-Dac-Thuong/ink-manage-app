import { QuestionCircleOutlined, UserOutlined } from "@ant-design/icons";
import {
  Button,
  ConfigProvider,
  Form,
  Input,
  Modal,
  notification,
  Popconfirm,
} from "antd";
import axios from "axios";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
import { Box } from "@mui/material";
import { Helmet } from "react-helmet";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";

const HoanTraMuc = (props) => {
  const [decodeWorkerData] = useState(() => new Worker("decodeWorkerData.js"));
  const [decodeWorkerRole] = useState(() => new Worker("decodeWorkerRole.js"));
  const [decodeWorkerLoginInfo] = useState(
    () => new Worker("decodeWorkerLoginInfo.js")
  );
  const [encodeWorkerHoanTra] = useState(
    () => new Worker("encodeWorkerHoanTra.js")
  );
  const [encodeWorkerXoaMucHoanTra] = useState(
    () => new Worker("encodeWorkerXoaMucHoanTra.js")
  );
  const [dataTonkho, setDataTonKho] = useState([]);
  const [dataDaXuat, setDataDaXuat] = useState([]);
  const [dataDaNhap, setDataDaNhap] = useState([]);
  const [status, setStatus] = useState("");
  const [tendangnhap, setTendangnhap] = useState("");
  const [role, setRole] = useState("");

  const [api, contextHolder] = notification.useNotification();

  const [form] = Form.useForm();

  const [scanBuffer, setScanBuffer] = useState("");
  const [scanTimeout, setScanTimeout] = useState(null);

  const [returnedInks, setReturnedInks] = useState([]);

  const [loadingMucIn, setLoadingMucIn] = useState(true);

  // Thêm state để quản lý modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInk, setSelectedInk] = useState(null);

  const navigate = useNavigate();

  const handleEncodeHoanTra = (data) => {
    return new Promise((resolve, reject) => {
      if (encodeWorkerHoanTra) {
        encodeWorkerHoanTra.postMessage(data);
        encodeWorkerHoanTra.onmessage = function (e) {
          resolve(e.data);
        };
      } else {
        console.log("Mã hóa dữ liệu hoàn trả không thành công");
      }
    });
  };

  const handleEncodeXoaMucHoanTra = (data) => {
    return new Promise((resolve, reject) => {
      if (encodeWorkerXoaMucHoanTra) {
        encodeWorkerXoaMucHoanTra.postMessage(data);
        encodeWorkerXoaMucHoanTra.onmessage = function (e) {
          resolve(e.data);
        };
      } else {
        console.log("Mã hóa dữ liệu hoàn trả không thành công");
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
        let returnedInksArr = [];

        const listData = res?.data;

        const decodedAllData = [];
        for (const item of listData) {
          try {
            let dataDecode = await handleDecodeData(item.content);

            decodedAllData.push({
              ...item,
              decodedContent: dataDecode,
            });

            if (dataDecode?.content?.danhsachphieu?.trangthai === "Đã xuất") {
              const danhsachmucin =
                dataDecode?.content?.danhsachphieu?.danhsachmucincuaphieu;

              // Lọc các mực đã hoàn trả (hoantra = 1)
              const returnedInksInPhieu = danhsachmucin?.filter(
                (mucin) => mucin.hoantra === 1
              );

              if (returnedInksInPhieu?.length > 0) {
                returnedInksArr = [...returnedInksArr, ...returnedInksInPhieu];
              }
            }

            // setReturnedInks(returnedInksArr);
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

        setReturnedInks(returnedInksArr);
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

  const handleScan = (e) => {
    const value = e.target.value;
    setScanBuffer(value);

    // Clear timeout cũ nếu có
    if (scanTimeout) {
      clearTimeout(scanTimeout);
    }

    // Đặt timeout mới
    const timeout = setTimeout(() => {
      if (value) {
        form.setFieldsValue({
          qrcode: value,
        });

        handleNhapMucIn({ qrcode: value });
        setScanBuffer("");
      }
    }, 100); // Đợi 100ms sau khi nhận ký tự cuối

    setScanTimeout(timeout);
  };

  const handleNhapMucIn = async (values) => {
    const qrcodeScan = values.qrcode;

    try {
      let res = await axios.get(`http://172.16.0.53:8080/danh_sach`);
      if (res && res.data) {
        const listData = res.data;
        let soLuongPhieuChuaMuc = 0;
        let mucDaXuat = false;

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
              if (
                danhsachmucin?.some((mucin) => mucin.qrcode === dataInkDecode)
              ) {
                mucDaXuat = true;
                break;
              }
            }
          }

          // Nếu mực chưa được xuất, hiển thị thông báo lỗi
          if (!mucDaXuat) {
            api["error"]({
              message: "Thất bại",
              description:
                "Mực này chưa được xuất khỏi kho nên không thể thu hồi",
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
                danhsachmucin[inkIndex] = {
                  ...danhsachmucin[inkIndex],
                  hoantra: 1,
                  thoigianhoantra: currentTime,
                };

                const mucInVaMaSoPhieu = {
                  ...timThayMuc,
                  masophieuxuat: maSoPhieu,
                };

                soLuongPhieuChuaMuc++;

                // Kiểm tra nếu mực đã hoàn trả và chỉ có trong 1 phiếu
                if (timThayMuc.hoantra === 1 && soLuongPhieuChuaMuc === 1) {
                  api["error"]({
                    message: "Thất bại",
                    description: "Mực này đã được thu hồi trước đó",
                  });
                  form.resetFields();
                  return;
                }

                // Cập nhật lại nội dung phiếu
                const updatedContent = {
                  content: {
                    danhsachphieu: {
                      ...dataDecode.content.danhsachphieu,
                      danhsachmucincuaphieu: danhsachmucin,
                    },
                  },
                };

                let jwtTokenContent = await handleEncodeHoanTra(updatedContent);

                //Gọi API cập nhật phiếu
                await axios.get(
                  `http://172.16.0.53:8080/update/${mucInVaMaSoPhieu.masophieuxuat}/${jwtTokenContent}`
                );

                setStatus("hoantra");

                api["success"]({
                  message: "Thành công",
                  description: "Mực in đã được thu hồi",
                });
                form.resetFields();
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

          api["error"]({
            message: "Thất bại",
            description: "Không tìm thấy mực này trong danh sách phiếu xuất",
          });
        } catch (error) {
          api["error"]({
            message: "Lỗi",
            description: "Đã xảy ra lỗi khi thu hồi vỏ mực",
          });
        }
      }
    } catch (error) {
      api["error"]({
        message: "Lỗi",
        description: "Đã xảy ra lỗi khi thu hồi vỏ mực",
      });
    }
    form.resetFields();
  };

  // const handleNhapMucIn = async (values) => {
  //   const qrcodeScan = values.qrcode;

  //   try {
  //     let res = await axios.get(`http://172.16.0.53:8080/danh_sach`);
  //     if (res && res.data) {
  //       const listData = res.data;

  //       // Tìm phiếu xuất chứa mực cần hoàn trả
  //       for (const item of listData) {
  //         let dataDecode = await handleDecodeData(item.content);

  //         if (dataDecode?.content?.danhsachphieu?.trangthai === "Đã xuất") {
  //           const danhsachmucin =
  //             dataDecode?.content?.danhsachphieu?.danhsachmucincuaphieu;
  //           const inkIndex = danhsachmucin?.findIndex(
  //             (mucin) => mucin.qrcode === qrcodeScan
  //           );

  //           if (inkIndex !== -1) {
  //             // Lấy thông tin mực cần hoàn trả
  //             const returnedInk = danhsachmucin[inkIndex];

  //             // Xóa mực khỏi danh sách xuất
  //             danhsachmucin.splice(inkIndex, 1);

  //             // Tìm phiếu nhập để thêm mực vào tồn kho
  //             for (const nhapItem of listData) {
  //               let nhapDecode = await handleDecodeData(nhapItem.content);

  //               if (
  //                 nhapDecode?.content?.danhsachphieu?.trangthai === "Đã duyệt"
  //               ) {
  //                 // Thêm mực vào danh sách tồn kho
  //                 const danhsachtonkho =
  //                   nhapDecode?.content?.danhsachtonkho
  //                     ?.danhsachmucinthemvaokho || [];
  //                 danhsachtonkho.push({
  //                   ...returnedInk,

  //                   hoantra: 1,
  //                 });

  //                 // Cập nhật phiếu nhập
  //                 const updatedNhapContent = {
  //                   ...nhapDecode.content,
  //                   danhsachtonkho: {
  //                     danhsachmucinthemvaokho: danhsachtonkho,
  //                   },
  //                 };

  //                 // Cập nhật phiếu xuất
  //                 const updatedXuatContent = {
  //                   ...dataDecode.content,
  //                   danhsachphieu: {
  //                     ...dataDecode.content.danhsachphieu,
  //                     danhsachmucincuaphieu: danhsachmucin,
  //                   },
  //                 };

  //                 console.log(
  //                   "Phiếu nhập sau khi cập nhật: ",
  //                   updatedNhapContent
  //                 );
  //                 console.log(
  //                   "Phiếu xuất sau khi cập nhật: ",
  //                   updatedXuatContent
  //                 );

  //                 // // Gọi API cập nhật cả 2 phiếu
  //                 // await axios.put(`http://172.16.0.53:8080/cap_nhat/${nhapItem.id}`, {
  //                 //   content: updatedNhapContent
  //                 // });

  //                 // await axios.put(`http://172.16.0.53:8080/cap_nhat/${item.id}`, {
  //                 //   content: updatedXuatContent
  //                 // });

  //                 api["success"]({
  //                   message: "Thành công",
  //                   description: "Đã hoàn trả mực thành công",
  //                 });

  //                 form.resetFields();
  //                 return;
  //               }
  //             }
  //           }
  //         }
  //       }

  //       api["error"]({
  //         message: "Lỗi",
  //         description: "Không tìm thấy mực này trong danh sách phiếu xuất",
  //       });
  //     }
  //   } catch (error) {
  //     api["error"]({
  //       message: "Lỗi",
  //       description: "Đã xảy ra lỗi khi hoàn trả mực",
  //     });
  //   }
  // };

  const handleXoaMucHoanTra = async (row) => {
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
              delete danhsachmucin[inkIndex].hoantra;
              delete danhsachmucin[inkIndex].thoigianhoantra;

              const updatedContent = {
                content: {
                  danhsachphieu: {
                    ...dataDecode.content.danhsachphieu,
                    danhsachmucincuaphieu: danhsachmucin,
                  },
                },
              };

              let jwtTokenContent = await handleEncodeXoaMucHoanTra(
                updatedContent
              );

              await axios.get(
                `http://172.16.0.53:8080/update/${maSoPhieu}/${jwtTokenContent}`
              );

              setStatus("xoamuchoantra");
              api["success"]({
                message: "Thành công",
                description: "Đã xóa mực khỏi danh sách hoàn trả",
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

  const handleDangXuat = () => {
    localStorage.removeItem("token");

    navigate("/dangnhap");
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
        header: "Tên phiếu xuất",
        size: 150,
      },
      {
        accessorKey: "thoigianhoantra",
        header: "Thời gian thu hồi",
        size: 150,
      },
      {
        accessorKey: "hoantra",
        header: "Trạng thái",
        size: 150,
        Cell: ({ cell }) => (
          <Box
            component="span"
            sx={(theme) => ({
              backgroundColor:
                cell.getValue() === 1 && theme.palette.success.main,

              borderRadius: "0.25rem",
              color: "#fff",
              maxWidth: "9ch",
              p: "0.25rem",
            })}
          >
            {cell.getValue() === 1 && "Đã thu hồi"}
          </Box>
        ),
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: returnedInks,
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
      <>
        <Button
          title="Xem chi tiết"
          type="primary"
          onClick={() => showModal(row)}
        >
          <VisibilityIcon />
        </Button>
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
            title="Hủy thu hồi"
            description="Bạn có chắc chắn muốn hủy thu hồi mực này không?"
            onConfirm={() => handleXoaMucHoanTra(row)}
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
            <Button title="Hủy thu hồi" type="primary" danger>
              <CloseIcon />
            </Button>
          </Popconfirm>
        </ConfigProvider>
      </>
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
        <title>Thu hồi vỏ mực</title>
      </Helmet>
      <div className="container">
        <div className="text-center mt-5">
          <img src="../../../../../../../img/logo2.png" alt="" />
        </div>

        <h4 className="text-center mt-5">THU HỒI VỎ MỰC IN</h4>
        <div className="mt-5 mb-5 d-flex">
          <Link to="/danhsachphieu">
            <button type="button" className="btn btn-success me-2">
              Trang chủ
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
        <Form form={form} name="control-hooks">
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
              value={scanBuffer}
              placeholder="Nhập mực in cần thu hồi vỏ"
              style={{
                width: "100%",
              }}
              onChange={handleScan}
            />
          </Form.Item>
        </Form>

        <div className="d-flex justify-content-between">
          <h5 className="mt-3">DANH SÁCH MỰC IN ĐÃ THU HỒI VỎ</h5>
        </div>

        <div className="mb-5 ">
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
                <strong>Tên phiếu:</strong> {selectedInk.tenphieu}
              </p>
              <p>
                <strong>Thời gian thu hồi:</strong>{" "}
                {selectedInk.thoigianhoantra}
              </p>

              <p>
                <strong>Trạng thái:</strong>{" "}
                {selectedInk.hoantra === 1 && "Đã thu hồi"}
              </p>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
};

export default HoanTraMuc;
