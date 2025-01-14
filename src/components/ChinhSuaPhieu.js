import React, { useState, useMemo, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Form, Input, Button, notification, Select } from "antd";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import axios from "axios";
import { Modal } from "antd";

const { Option } = Select;

const ChinhSuaPhieu = () => {
  const location = useLocation();

  const navigate = useNavigate();

  const { phieuData, dataMucInCuaPhieu } = location.state;

  const [rowSelection, setRowSelection] = useState({});

  const [api, contextHolder] = notification.useNotification();

  const [form] = Form.useForm();

  const [formData, setFormData] = useState({
    tenphieu: phieuData.tenphieu,
    loaiphieu: phieuData.loaiphieu,
    ngaytaophieu: phieuData.ngaytaophieu,
    trangthai: phieuData.trangthai,
    thoigianxuat: phieuData.thoigianxuat,
    khoaphongxuatmuc: phieuData.khoaphongxuatmuc,
  });

  const [scanBuffer, setScanBuffer] = useState("");
  const [scanTimeout, setScanTimeout] = useState(null);

  const [dataDaNhap, setDataDaNhap] = useState([]);
  const [dataCore, setDataCore] = useState([]);
  const [status, setStatus] = useState("");
  const [khoaPhong, setKhoaPhong] = useState([]);
  const [decodeWorkerData] = useState(() => new Worker("/decodeWorkerData.js"));

  const [dataTonKho, setDataTonKho] = useState([]);

  const [tendangnhap, setTendangnhap] = useState("");

  const [decodeWorkerLoginInfo] = useState(
    () => new Worker("/decodeWorkerLoginInfo.js")
  );

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

  useEffect(() => {
    FetchDataPhieu();
  }, [status]);

  const FetchDataPhieu = async () => {
    try {
      let res = await axios.get(`http://172.16.0.53:8080/danh_sach`);

      if (res && res.data && Array.isArray(res.data)) {
        let dataInkPhieu = res?.data;
        let nhapArr = [];
        let tonkhoArr = [];

        const listData = res?.data;
        setDataCore(listData);
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
            "Đã duyệt"
          ) {
            let danhsachmucinnhapkho =
              decodedData[i].decodedContent?.content?.danhsachphieu
                ?.danhsachmucincuaphieu;
            nhapArr = [...nhapArr, ...danhsachmucinnhapkho];
          }
        }

        for (let i = 0; i < dataInkPhieu?.length; i++) {
          let decodeData = await handleDecodeData(dataInkPhieu[i].content);

          if (decodeData?.content?.danhsachphieu?.trangthai === "Đã duyệt") {
            let decodeDanhsachmucin =
              decodeData?.content?.danhsachtonkho?.danhsachmucinthemvaokho;
            tonkhoArr = [...tonkhoArr, ...decodeDanhsachmucin];
          }
        }

        setDataTonKho(tonkhoArr);
        setDataDaNhap(nhapArr);
      }
    } catch (error) {
      api["error"]({
        message: "Lỗi",
        description: "Đã xảy ra lỗi trong quá trình hiển thị danh sách phiếu",
      });
    }
  };

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

        handleThemMucInCay({ qrcode: value });
        setScanBuffer("");
      }
    }, 100); // Đợi 100ms sau khi nhận ký tự cuối

    setScanTimeout(timeout);
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

  const handleThemMucInCay = async (values) => {
    let timestamp = Date.now();

    let date = new Date(timestamp);

    let day = date.getDate();

    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    let currentTime = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;

    const pattern = /(\d+)-(\d+)-(\d+) (\d+):(\d+):(\d+)/;
    const match = currentTime.match(pattern);

    const [, ngay, thang, nam, gio, phut, giay] = match.map(Number);

    try {
      let res = await axios.post(
        `http://172.16.0.53:8080/parse_name_id`,
        { name_id: values.qrcode },
        {
          mode: "cors",
        }
      );

      let dataInkDecode = res.data.name + "_" + res.data.id;

      for (let i = 0; i < dataMucInCuaPhieu.length; i++) {
        if (dataMucInCuaPhieu[i].qrcode === dataInkDecode) {
          api["error"]({
            message: "Thất bại",
            description: "Mực in này đã được thêm trong phiếu này",
          });
          form.resetFields();
          return;
        }
      }

      // // Kiểm tra với tất cả danh sách mực in
      // for (let i = 0; i < allInkLists.length; i++) {
      //   if (
      //     allInkLists[i].qrcode === dataInkDecode &&
      //     dataPhieu?.loaiphieu === "Phiếu nhập"
      //   ) {
      //     api["error"]({
      //       message: "Thất bại",
      //       description: `Mực in này đã được thêm trong ${allInkLists[i].tenphieu}`,
      //     });
      //     form.resetFields();
      //     return;
      //   }
      // }

      let existsInkTonKho = dataTonKho.find(
        (item) => item.qrcode === dataInkDecode
      );

      if (!existsInkTonKho && phieuData?.loaiphieu === "Phiếu xuất") {
        api["error"]({
          message: "Thất bại",
          description: "Mực in này không có trong kho để xuất",
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

        // // Tìm thông tin phiếu nhập của mực này
        // const inkInStock = dataDaNhap.find(
        //   (ink) => ink.qrcode === dataInkDecode
        // );

        console.log("Data phiếu: ", phieuData);

        if (res && res.status === 200) {
          let insertMucIn = {
            tenmuc: res.data.name,
            mamuc: res.data.id,
            soluong: 1,
            qrcode: dataInkDecode,
            loaiphieu: phieuData?.loaiphieu,
            tenphieu: phieuData?.tenphieu,
            // masophieunhap: inkInStock?.masophieu || "", // Thêm số phiếu nhập
            thoigiannhapmucin: currentTime,
            nguoinhapmucin: "Người xuất mực",
            ngay: ngay,
            thang: thang,
            nam: nam,
            gio: gio,
            phut: phut,
            giay: giay,
            inkId: generateRandomEightDigitNumber(),
          };

          // Add new ink to current list

          dataMucInCuaPhieu.push(insertMucIn);

          let newTaoPhieuData = {
            danhsachphieu: {
              loaiphieu: phieuData?.loaiphieu,
              tenphieu: phieuData?.tenphieu,
              ngaytaophieu: phieuData?.ngaytaophieu,
              nguoitaophieu: phieuData?.nguoitaophieu,
              khoaphongxuatmuc: phieuData?.khoaphongxuatmuc,
              trangthai: phieuData?.trangthai,
              thoigianxuat: phieuData?.thoigianxuat,
              danhsachmucincuaphieu: dataMucInCuaPhieu,
            },
            danhsachtonkho: {},
          };
          let DataPhieuValues = {
            content: newTaoPhieuData,
          };

          console.log(DataPhieuValues);

          // let jwtToken = await handleEncodeNhapMucInCay(DataPhieuValues);
          // try {
          //   await axios.get(
          //     `http://172.16.0.53:8080/update/${dataPhieu?.sophieu}/${jwtToken}`,
          //     {
          //       mode: "cors",
          //     }
          //   );
          //   api["success"]({
          //     message: "Thành công",
          //     description: "Nhập mực in vào phiếu thành công",
          //   });

          //   setStatus(randomString());
          // } catch (error) {
          //   api["error"]({
          //     message: "Thất bại",
          //     description: "Đã xảy ra lỗi trong quá trình nhập mực in",
          //   });
          // }
        }
      } catch (error) {
        api["error"]({
          message: "Thất bại",
          description:
            "Vui lòng nhập đúng định dạng và mã mực in phải đủ 8 ký tự",
        });
      }
    } catch (error) {
      console.log(error);

      api["error"]({
        message: "Thất bại",
        description:
          "Vui lòng nhập đúng định dạng và mã mực in phải đủ 8 ký tự",
      });
    }
    form.resetFields();
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "tenmuc",
        header: "Tên mực",
        enableEditing: false,
      },
      {
        accessorKey: "mamuc",
        header: "Mã mực",
        enableEditing: false,
      },
      {
        accessorKey: "thoigiannhapmucin",
        header: "Thời gian nhập",
        enableEditing: false,
      },
      {
        accessorKey: "nguoinhapmucin",
        header: "Người nhập",
        enableEditing: false,
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: dataMucInCuaPhieu,
    enableEditing: true,
    enableHiding: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    paginationDisplayMode: "pages",
    editDisplayMode: "cell",

    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,

    state: { rowSelection },
  });

  const handleSubmit = async () => {
    // Get selected ink IDs
    const selectedIds = Object.keys(rowSelection).filter(
      (key) => rowSelection[key]
    );

    // Check if all inks are selected
    if (selectedIds.length === dataMucInCuaPhieu.length) {
      //   console.log("Xóa luôn phiếu");
      Modal.confirm({
        title: "Xác nhận",
        content:
          "Phiếu này sẽ bị xóa nếu bạn chọn hết tất cả mực in. Bạn có chắc chắn muốn lưu thay đổi không?",
        okText: "Đồng ý",
        cancelText: "Hủy",
        onOk: async () => {
          try {
            console.log("Xóa luôn phiếu");
          } catch (error) {
            api["error"]({
              message: "Thất bại",
              description: "Đã xảy ra lỗi khi cập nhật phiếu",
            });
          }
        },
      });
      // try {
      //   await axios.get(`http://172.16.0.53:8080/delete/${phieuData.masophieu}`);
      //   api["success"]({
      //     message: "Thành công",
      //     description: "Đã xóa phiếu thành công"
      //   });
      //   navigate('/danhsachphieu');
      //   return;
      // } catch (error) {
      //   api["error"]({
      //     message: "Thất bại",
      //     description: "Đã xảy ra lỗi khi xóa phiếu"
      //   });
      //   navigate("/");
      //   return;
      // }
      return;
    }

    if (selectedIds.length === 0) {
      // Cập nhật tên phiếu cho tất cả mực in
      const updatedMucInList = dataMucInCuaPhieu.map((mucIn) => ({
        ...mucIn,
        tenphieu: formData.tenphieu,
        loaiphieu: formData.loaiphieu,
        khoaphongxuatmuc: formData.khoaphongxuatmuc,
        thoigianxuat: formData.thoigianxuat,
      }));

      const updatedCurrentPhieuData = {
        content: {
          danhsachphieu: {
            loaiphieu: formData.loaiphieu,
            tenphieu: formData.tenphieu,
            ngaytaophieu: formData.ngaytaophieu,
            nguoitaophieu: phieuData.nguoitaophieu,
            khoaphongxuatmuc: formData.khoaphongxuatmuc,
            trangthai: formData.trangthai,
            thoigianxuat: formData.thoigianxuat,
            danhsachmucincuaphieu: updatedMucInList,
          },
          danhsachtonkho: {},
        },
      };

      console.log(
        "Cập nhật phiếu hiện tại khi không chọn mực in nào: ",
        updatedCurrentPhieuData
      );

      // try {
      //   await axios.get(
      //     `http://172.16.0.53:8080/update/${phieuData.masophieu}/${jwtToken}`,
      //     { mode: "cors" }
      //   );

      //   api["success"]({
      //     message: "Thành công",
      //     description: "Cập nhật phiếu thành công"
      //   });

      //   navigate('/');
      // } catch (error) {
      //   api["error"]({
      //     message: "Thất bại",
      //     description: "Đã xảy ra lỗi khi cập nhật phiếu"
      //   });
      // }
      //   navigate("/");
      return;
    }

    // Get selected and unselected inks
    const selectedInks = dataMucInCuaPhieu.filter((_, index) =>
      selectedIds.includes(index.toString())
    );

    const unselectedInks = dataMucInCuaPhieu
      .filter((_, index) => !selectedIds.includes(index.toString()))
      .map((mucIn) => ({
        ...mucIn,
        tenphieu: formData.tenphieu,
        loaiphieu: formData.loaiphieu,
        khoaphongxuatmuc: formData.khoaphongxuatmuc,
        thoigianxuat: formData.thoigianxuat,
      }));

    const updatedPhieuData = {
      content: {
        danhsachphieu: {
          loaiphieu: formData.loaiphieu,
          tenphieu: formData.tenphieu,
          ngaytaophieu: formData.ngaytaophieu,
          nguoitaophieu: phieuData.nguoitaophieu,
          khoaphongxuatmuc: formData.khoaphongxuatmuc,
          trangthai: formData.trangthai,
          thoigianxuat: formData.thoigianxuat,
          danhsachmucincuaphieu: unselectedInks,
        },
        danhsachtonkho: {},
      },
    };

    // Gọi API cập nhật phiếu hiện tại
    // let jwtTokenPhieu = await handleEncode(updatedPhieuData);

    // try {
    //       await axios.get(`http://172.16.0.53:8080/update/${phieuData.masophieu}/${jwtTokenPhieu}`);
    // } catch (error) {
    //     api["error"]({
    //         message: "Thất bại",
    //         description: "Đã xảy ra lỗi khi cập nhật phiếu"
    //     });

    // }

    console.log("Cập nhật phiếu hiện tại: ", updatedPhieuData);

    // Nhóm mực in theo phiếu nhập
    const inksByImportPhieu = {};
    selectedInks.forEach((selectedInk) => {
      const matchingInk = dataDaNhap.find(
        (ink) => ink.qrcode === selectedInk.qrcode
      );
      if (matchingInk) {
        const phieuNhapId = selectedInk.masophieunhap;
        if (!inksByImportPhieu[phieuNhapId]) {
          inksByImportPhieu[phieuNhapId] = [];
        }
        inksByImportPhieu[phieuNhapId].push(matchingInk);
      }
    });
    console.log("Mực đã chọn: ", selectedInks);

    // Cập nhật từng phiếu nhập
    for (const phieuNhapId in inksByImportPhieu) {
      const inkInfo = dataCore.find((item) => item._id === phieuNhapId);
      let dataDecode = await handleDecodeData(inkInfo.content);

      const newArray = inksByImportPhieu[phieuNhapId].map(
        ({ thoigiannhap, ...rest }) => rest
      );

      const updatedPhieuNhapData = {
        content: {
          danhsachphieu: {
            ...dataDecode.content.danhsachphieu,
          },
          danhsachtonkho: {
            danhsachmucinthemvaokho: [
              ...dataDecode.content.danhsachtonkho.danhsachmucinthemvaokho,
              ...newArray,
            ],
          },
        },
      };

      console.log("Cập nhật phiếu nhập: ", updatedPhieuNhapData);
      // Gọi API cập nhật cho từng phiếu nhập
      // let jwtTokenPhieuNhap = await handleEncode(updatedPhieuNhapData);

      //   try {
      //     await axios.get(`http://172.16.0.53:8080/update/${phieuNhapId}/${jwtTokenPhieuNhap}`);
      //   } catch (error) {
      //     api["error"]({
      //       message: "Thất bại",
      //       description: "Đã xảy ra lỗi khi cập nhật phiếu nhập",
      //     });

      //   }
    }
    // navigate("/");
  };

  return (
    <div className="container mt-5">
      {contextHolder}
      <div className="mt-2 mb-3">
        <Link to="/danhsachphieu">
          <button type="button" className="btn btn-success me-2">
            Trang chủ
          </button>
        </Link>
      </div>
      <h2 className="text-center mb-4">Chỉnh sửa phiếu</h2>

      <Form layout="vertical">
        <Form.Item label="Tên phiếu">
          <Input
            value={formData.tenphieu}
            onChange={(e) =>
              setFormData({ ...formData, tenphieu: e.target.value })
            }
          />
        </Form.Item>

        <Form.Item label="Loại phiếu">
          <Select
            showSearch
            allowClear
            value={formData.loaiphieu}
            onChange={(value) => setFormData({ ...formData, loaiphieu: value })}
          >
            <Option value="Phiếu nhập">Phiếu nhập</Option>
            <Option value="Phiếu xuất">Phiếu xuất</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Ngày tạo phiếu">
          <Input
            value={formData.ngaytaophieu}
            onChange={(e) =>
              setFormData({ ...formData, ngaytaophieu: e.target.value })
            }
          />
        </Form.Item>

        <Form.Item label="Trạng thái">
          <Select
            showSearch
            allowClear
            value={formData.trangthai}
            onChange={(value) => setFormData({ ...formData, trangthai: value })}
          >
            <Option value="Chưa duyệt">Chưa duyệt</Option>
            <Option value="Đã duyệt">Đã duyệt</Option>
            <Option value="Chưa xuất">Chưa xuất</Option>
            <Option value="Đã xuất">Đã xuất</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Đã xuất vào lúc">
          <Input
            value={formData.thoigianxuat}
            onChange={(e) =>
              setFormData({ ...formData, thoigianxuat: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item label="Xuất cho">
          <Select
            showSearch
            allowClear
            value={formData.khoaphongxuatmuc}
            onChange={(value) =>
              setFormData({ ...formData, khoaphongxuatmuc: value })
            }
          >
            {khoaPhong.map((item, index) => {
              return <Option value={item}>{item}</Option>;
            })}
          </Select>
        </Form.Item>
      </Form>

      <h5 className="mt-3">BỔ SUNG MỰC IN (NẾU CẦN)</h5>

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
            placeholder="Nhập mực in cần bổ sung"
            style={{
              width: "100%",
            }}
            onChange={handleScan}
          />
        </Form.Item>
      </Form>
      <h5 className="mt-4">DANH SÁCH MỰC IN</h5>
      <MaterialReactTable table={table} />

      <div className="text-left mt-4 mb-5">
        <Button type="primary" size="large" onClick={handleSubmit}>
          Lưu thay đổi
        </Button>
      </div>
    </div>
  );
};

export default ChinhSuaPhieu;
