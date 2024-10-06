import React from "react";
import "./PrintTemplatePhieuXuat.scss";
import { QRCode, Space } from "antd";

export const PrintTemplatePhieuXuat = React.forwardRef((props, ref) => {
  let timestamp = Date.now();

  let date = new Date(timestamp);

  const dataInkPrint = props.data ? props.data : [];

  const grouped = {};

  // Duyệt qua từng phần tử trong mảng ban đầu
  for (let i = 0; i < dataInkPrint.length; i++) {
    // Lấy prefix của phần tử hiện tại
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
      <div className="print-preview_phieuxuat" ref={ref}>
        <div className="header_phieuxuat">
          <div>
            <div className="left-header_phieuxuat">
              <img src="../../../../../../../../img/logo2.png" alt="" />
            </div>
            <br />
            <span style={{ paddingLeft: "10px" }}>
              PHÒNG CÔNG NGHỆ THÔNG TIN
            </span>
          </div>
          <div
            className="right-header_phieuxuat"
            style={{ marginRight: "120px" }}
          >
            <Space>
              <QRCode size={100} type="svg" value="Hello" />
            </Space>
            <div style={{ fontSize: "8px" }}>{props.masophieu}</div>
          </div>
        </div>
        <div className="date_phieuxuat">
          <i style={{ fontSize: "10px" }}>
            Thành phố Hồ Chí Minh, ngày {date.getDate()} tháng{" "}
            {date.getMonth() + 1} năm {date.getFullYear()}
          </i>
        </div>
        {props.paperSize}
        <h4 className="title_phieuxuat">PHIẾU XUẤT MỰC IN</h4>
        <br />
        <span>DANH SÁCH SỐ LƯỢNG TỪNG MỰC IN</span>
        <table className="ink-table_phieuxuat">
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
        <div className="footer_phieuxuat">
          <div className="department_phieuxuat mt-3">
            <p>
              <strong>{props.khoaphong}</strong>
            </p>
          </div>

          <div className="signature_phieuxuat mt-3">
            <p>
              <strong>{props.nguoilamphieu}</strong>
            </p>
          </div>
        </div>
      </div>
    </>
  );
});
