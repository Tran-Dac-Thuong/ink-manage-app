import React from "react";
import "./PrintTemplatePhieuNhap.scss";
import { QRCode, Space } from "antd";

export const PrintTemplatePhieuNhap = React.forwardRef((props, ref) => {
  let timestamp = Date.now();

  let date = new Date(timestamp);

  const dataInkPrint = props.data ? props.data : [];

  const grouped = {};

  // Duyệt qua từng phần tử trong mảng ban đầu
  for (let i = 0; i < dataInkPrint.length; i++) {
    const qrCode = dataInkPrint[i].qrcode;
    // const prefix =
    //   qrCode === "8885007027876"
    //     ? "003 (Đen)"
    //     : qrCode === "8906049013198"
    //     ? "003 (Vàng)"
    //     : qrCode === "8885007027913"
    //     ? "003 (Hồng)"
    //     : qrCode === "8906049013174"
    //     ? "003 (Xanh)"
    //     : qrCode === "8885007020259"
    //     ? "664 (Hồng)"
    //     : qrCode === "8885007020242"
    //     ? "664 (Xanh)"
    //     : qrCode === "8885007020266"
    //     ? "664 (Vàng)"
    //     : qrCode === "8885007020235"
    //     ? "664 (Đen)"
    //     : qrCode === "8885007028255"
    //     ? "005 (Đen)"
    //     : qrCode === "8885007023441"
    //     ? "774 (Đen)"
    //     : dataInkPrint[i].tenmuc; // Lấy ba ký tự đầu của mã QR
    const prefix = dataInkPrint[i].tenmuc;
    // Nếu đối tượng đã có nhóm này, cộng thêm số lượng
    if (grouped[prefix]) {
      grouped[prefix] += dataInkPrint[i].soluong;
    } else {
      // Nếu chưa có nhóm này, khởi tạo với số lượng hiện tại
      grouped[prefix] = dataInkPrint[i].soluong;
    }
  }

  // Chuyển đổi đối tượng thành mảng kết quả
  const result = [];
  for (const prefix in grouped) {
    result.push({ qrcode: prefix, soluong: grouped[prefix] });
  }

  return (
    <>
      <div className="print-preview_phieunhap" ref={ref}>
        <div className="header_phieunhap">
          <div className="left-header_phieunhap">
            <img src="../../../../../../../../img/logo2.png" alt="" />
          </div>
          <div
            className="right-header_phieunhap"
            style={{ marginRight: "120px" }}
          >
            <Space>
              <QRCode size={100} type="svg" value="Hello" />
            </Space>

            <div style={{ fontSize: "11px" }}>{props.masophieu}</div>
          </div>
        </div>
        <br />
        <div className="date_phieunhap">
          <i>
            Thành phố Hồ Chí Minh, ngày {date.getDate()} tháng{" "}
            {date.getMonth() + 1} năm {date.getFullYear()}
          </i>
        </div>

        <h4 className="title_phieunhap">PHIẾU NHẬP MỰC IN</h4>
        <span>DANH SÁCH SỐ LƯỢNG TỪNG MỰC IN</span>
        <table className="ink-table_phieunhap">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên mực</th>

              <th>Số lượng</th>
            </tr>
          </thead>
          <tbody>
            {props.data &&
              result.map((item, index) => {
                return (
                  <>
                    <tr>
                      <td>{index + 1}</td>
                      <td>{item.qrcode}</td>

                      <td>{item.soluong}</td>
                    </tr>
                  </>
                );
              })}
          </tbody>
        </table>
        <br />
        <span>DANH SÁCH THÔNG TIN CHI TIẾT CỦA TỪNG MỰC IN</span>
        <table className="ink-table_phieunhap">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên mực</th>
              <th>Mã mực</th>
              <th>Thời gian nhập mực in</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {props.data &&
              dataInkPrint.map((item, index) => {
                return (
                  <>
                    <tr>
                      <td>{index + 1}</td>
                      <td>{item.tenmuc}</td>

                      <td>{item.mamuc}</td>
                      <td>{item.thoigiannhapmucin}</td>
                      <td></td>
                    </tr>
                  </>
                );
              })}
          </tbody>
        </table>
        <div className="footer_phieunhap">
          <div className="department_phieunhap mt-3">
            <p>
              <strong>Phòng Công Nghệ Thông Tin</strong>
            </p>
          </div>

          <div className="signature_phieunhap mt-3">
            <p>
              <strong>Tên công ty</strong>
            </p>

            {props.nguoilamphieu}
          </div>
        </div>
      </div>
    </>
  );
});
