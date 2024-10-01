import React from "react";
import "./PrintTemplateThongKeMotNam.scss";

export const PrintTemplateThongKeMotNam = React.forwardRef((props, ref) => {
  const dataThongKeMotNam = props.data ? props.data : [];

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
          <span>DANH SÁCH CÁC MỰC IN ĐÃ ĐỔI CHO CÁC KHOA TRONG 1 NĂM QUA</span>
          <br />
          <span>
            (Từ ngày {props.oneYearAgo} tới ngày {props.current})
          </span>
        </h4>
        <br />
        <table className="ink-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên mực</th>
              <th>Mã mực</th>
              <th>Mã QRCode</th>
              <th>Tên phiếu</th>
              <th>Xuất cho</th>
              <th>Đã xuất vào lúc</th>
            </tr>
          </thead>
          <tbody>
            {dataThongKeMotNam &&
              dataThongKeMotNam.length > 0 &&
              dataThongKeMotNam.map((item, index) => {
                return (
                  <>
                    <tr>
                      <td>{index + 1}</td>
                      <td>{item.tenmuc}</td>
                      <td>{item.mamuc}</td>
                      <td>{item.qrcode}</td>
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
