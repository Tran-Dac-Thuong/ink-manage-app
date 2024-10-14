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
            <div
              className="left-header_phieuxuat"
              style={{ marginBottom: "10px" }}
            >
              <img
                src="../../../../../../../../img/logo2.png"
                alt=""
                style={{ width: "280px" }}
              />
            </div>

            <span
              style={{
                paddingLeft: "10px",
                fontSize: "14px",
              }}
            >
              PHÒNG CÔNG NGHỆ THÔNG TIN
            </span>
          </div>
          <div
            className="right-header_phieuxuat"
            style={{ marginRight: "10px", marginTop: "-5px" }}
          >
            <Space>
              <QRCode size={70} type="svg" value={props.masophieu} />
            </Space>
            <div style={{ fontSize: "7px" }}>{props.masophieu}</div>
          </div>
        </div>

        {props.paperSize}
        <h4 className="title_phieuxuat" style={{ fontSize: "18px" }}>
          PHIẾU XUẤT MỰC IN
        </h4>

        <span style={{ fontSize: "12px" }}>DANH SÁCH SỐ LƯỢNG TỪNG MỰC IN</span>
        <table
          className="ink-table_phieuxuat"
          style={{ fontSize: "12px", marginBottom: "5px" }}
        >
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

        <span style={{ fontSize: "12px" }}>
          DANH SÁCH THÔNG TIN CHI TIẾT CỦA TỪNG MỰC IN
        </span>
        <table className="ink-table_phieuxuat" style={{ fontSize: "12px" }}>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên mực</th>
              <th>Mã mực</th>
              <th>Thời gian nhập</th>
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
          <div className="department_phieuxuat mt-2">
            <p>
              <strong>{props.khoaphong}</strong>
              <br />
              <i style={{ fontSize: "12px" }}>
                TP Hồ Chí Minh, ngày {date.getDate()} tháng{" "}
                {date.getMonth() + 1} năm {date.getFullYear()}
              </i>
            </p>
          </div>
        </div>
      </div>
    </>
  );
});
