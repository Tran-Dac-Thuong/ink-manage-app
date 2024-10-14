import React from "react";
import "./PrintTemplateThongKeMotThang.scss";

export const PrintTemplateThongKeMotThang = React.forwardRef((props, ref) => {
  const dataThongKeMotThang = props.data ? props.data : [];

  return (
    <>
      <div className="print-preview" ref={ref}>
        <div className="header">
          <div className="">
            <img src="../../../../../../../img/logo2.png" alt="" />
          </div>
        </div>

        <br />
        <h4 className="title">
          <span>
            DANH SÁCH THÔNG TIN CHI TIẾT CÁC MỰC IN ĐÃ ĐỔI CHO CÁC KHOA TRONG 1
            THÁNG QUA
          </span>
          <br />
          <span>
            (Từ ngày {props.oneMonthAgo} tới ngày {props.current})
          </span>
        </h4>
        <br />
        <table className="ink-table" style={{ fontSize: "12px" }}>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên mực</th>
              <th>Mã mực</th>
              <th>Mã QRCode</th>
              <th>Tên phiếu nhập</th>
              <th>Tên phiếu xuất</th>
              <th>Xuất cho</th>
              <th>Đã xuất vào lúc</th>
            </tr>
          </thead>
          <tbody>
            {dataThongKeMotThang &&
              dataThongKeMotThang.length > 0 &&
              dataThongKeMotThang.map((item, index) => {
                return (
                  <>
                    <tr>
                      <td>{index + 1}</td>
                      <td>{item.tenmuc}</td>
                      <td>{item.mamuc}</td>
                      <td>{item.qrcode}</td>
                      <td>{item.phieunhap}</td>
                      <td>{item.tenphieu}</td>

                      <td>{item.khoaphongxuatmuc}</td>
                      <td>{item.thoigianxuat}</td>
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
