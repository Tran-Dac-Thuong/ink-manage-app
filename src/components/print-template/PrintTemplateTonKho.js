import React, { useEffect, useState } from "react";
import "./PrintTemplateTonKho.scss";
import { QRCode, Space } from "antd";

export const PrintTemplateTonKho = React.forwardRef((props, ref) => {
  const dataInkPrint = props.data ? props.data : [];

  const grouped = {};

  // Duyệt qua từng phần tử trong mảng ban đầu
  for (let i = 0; i < dataInkPrint.length; i++) {
    const qrCode = dataInkPrint[i].qrcode;
    const prefix =
      qrCode === "8885007027876"
        ? "003 (Đen)"
        : qrCode === "8906049013198"
        ? "003 (Vàng)"
        : qrCode === "8885007027913"
        ? "003 (Hồng)"
        : qrCode === "8906049013174"
        ? "003 (Xanh)"
        : qrCode === "8885007020259"
        ? "664 (Hồng)"
        : qrCode === "8885007020242"
        ? "664 (Xanh)"
        : qrCode === "8885007020266"
        ? "664 (Vàng)"
        : qrCode === "8885007020235"
        ? "664 (Đen)"
        : qrCode === "8885007028255"
        ? "005 (Đen)"
        : qrCode === "8885007023441"
        ? "774 (Đen)"
        : qrCode.substring(0, 3); // Lấy ba ký tự đầu của mã QR

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
      <div className="print-preview_tonkho" ref={ref}>
        <div className="header_tonkho">
          <div className="">
            <img src="../../../../../../../img/logo2.png" alt="" />
          </div>
        </div>

        <br />
        <h4 className="title_tonkho">DANH SÁCH TỒN KHO</h4>
        <br />
        <table className="ink-table_tonkho">
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
      </div>
    </>
  );
});
