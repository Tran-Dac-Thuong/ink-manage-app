import React, { useEffect, useState } from "react";
import { Input, Form, notification } from "antd";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
import Dropdown from "react-bootstrap/Dropdown";

const KiemTraMuc = (props) => {
  const [status, setStatus] = useState("");

  const [api, contextHolder] = notification.useNotification();

  const [dataSizeTonKho, setDataSizeTonKho] = useState([]);

  const [dataDaXuat, setDataDaXuat] = useState([]);
  const [dataDaNhap, setDataDaNhap] = useState([]);

  const [dataDecode, setDataDecode] = useState([]);

  const [tendangnhap, setTendangnhap] = useState("");

  const [allInkLists, setAllInkLists] = useState([]);

  const [scanBuffer, setScanBuffer] = useState("");
  const [scanTimeout, setScanTimeout] = useState(null);

  const [role, setRole] = useState("");

  const navigate = useNavigate();

  const [form] = Form.useForm();

  const [decodeWorkerLoginInfo] = useState(
    () => new Worker("/decodeWorkerLoginInfo.js")
  );
  const [decodeWorkerData] = useState(() => new Worker("/decodeWorkerData.js"));
  const [decodeWorkerRole] = useState(() => new Worker("/decodeWorkerRole.js"));

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

  const handleDangXuat = () => {
    localStorage.removeItem("token");

    navigate("/dangnhap");
  };

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

        handleKiemTraMuc({ qrcode: value });
        setScanBuffer("");
      }
    }, 100); // Đợi 100ms sau khi nhận ký tự cuối

    setScanTimeout(timeout);
  };

  const handleKiemTraMuc = (values) => {
    // Tìm trong danh sách mực chưa duyệt
    const mucChuaDuyet = allInkLists.find(
      (item) => item.qrcode === values.qrcode
    );

    const mucDaXuat = dataDaXuat.find((item) => item.qrcode === values.qrcode);

    if (mucChuaDuyet) {
      api["info"]({
        message: "Thông tin mực",
        description: `Mực ${values.qrcode} đã nhập và đang chờ duyệt trong ${mucChuaDuyet.tenphieu}
                     `,
      });
    } else {
      // Kiểm tra trong phiếu đã duyệt
      const phieuDaDuyet = dataDecode.find((phieu) => {
        const danhSachMuc =
          phieu.decodeContent?.content?.danhsachphieu?.danhsachmucincuaphieu;
        const trangThai =
          phieu.decodeContent?.content?.danhsachphieu?.trangthai;
        return (
          trangThai === "Đã duyệt" &&
          danhSachMuc?.some((muc) => muc.qrcode === values.qrcode)
        );
      });

      const phieuDaXuat = dataDecode.find((phieu) => {
        const danhSachMuc =
          phieu.decodeContent?.content?.danhsachphieu?.danhsachmucincuaphieu;
        const trangThai =
          phieu.decodeContent?.content?.danhsachphieu?.trangthai;
        return (
          trangThai === "Đã xuất" &&
          danhSachMuc?.some((muc) => muc.qrcode === values.qrcode)
        );
      });

      if (phieuDaDuyet) {
        const tenPhieu =
          phieuDaDuyet?.decodeContent?.content?.danhsachphieu?.tenphieu;
        const tenPhieuXuat =
          phieuDaXuat?.decodeContent?.content?.danhsachphieu?.tenphieu;
        // const danhSachMuc =
        //   phieuDaDuyet.decodeContent?.content?.danhsachphieu
        //     ?.danhsachmucincuaphieu;
        // const mucInfo = danhSachMuc.find((muc) => muc.qrcode === values.qrcode);

        if (mucDaXuat) {
          api["success"]({
            message: "Thông tin nhập",
            description: `Mực ${values.qrcode} đã được duyệt trong ${tenPhieu}
                  `,
          });
          api["warning"]({
            message: "Thông tin xuất",
            description: `Mực ${values.qrcode} đã được xuất trong ${tenPhieuXuat}
                  `,
          });
        } else {
          api["success"]({
            message: "Thông tin nhập",
            description: `Mực ${values.qrcode} đã được duyệt trong ${tenPhieu}
                  `,
          });
          api["warning"]({
            message: "Thông tin xuất",
            description: `Mực ${values.qrcode} chưa được xuất cho khoa phòng nào
                  `,
          });
        }
      } else {
        api["warning"]({
          message: "Thông tin mực",
          description: `Không tìm thấy mực ${values.qrcode} trong hệ thống`,
        });
      }
    }

    form.resetFields();
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
            // let danhsachmucinnhapkho = decodedAllData[
            //   i
            // ].decodedContent?.content?.danhsachphieu?.danhsachmucincuaphieu.map(
            //   (item) => ({
            //     ...item,
            //     masophieu: decodedAllData[i]._id, // Thêm mã số phiếu vào từng mực in
            //   })
            // );
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

  return (
    <>
      {contextHolder}
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
              Tồn kho{" "}
              <span class="badge bg-danger">{dataSizeTonKho.length}</span>
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
            <> */}
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

        <h4 className="text-center mt-5 mb-5">KIỂM TRA MỰC IN</h4>

        <Form form={form} name="control-hooks">
          <Form.Item
            name="qrcode"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Vui lòng nhập mực để kiểm tra",
              },
            ]}
          >
            <Input
              autoFocus
              value={scanBuffer}
              placeholder="Nhập mực in để kiểm tra"
              style={{
                width: "100%",
              }}
              onChange={handleScan}
            />
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default KiemTraMuc;
