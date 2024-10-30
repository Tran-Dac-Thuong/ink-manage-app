import React from "react";
import "./PrintTemplateThongKeMucInDaXuat.scss";

export const PrintTemplateThongKeMucInDaXuat = React.forwardRef(
  (props, ref) => {
    const dataMucInTheoKhoa = props.data ? props.data : [];

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
            <span>THỐNG KÊ CHI TIẾT THÔNG TIN MỰC IN THEO TỪNG KHOA</span>
          </h4>
          <br />
          <table className="ink-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Khoa phòng</th>
                <th>Tổng cộng</th>
                {Object.keys(props.inkNameMapping).map((inkName) => (
                  <th key={inkName}>{inkName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataMucInTheoKhoa &&
                dataMucInTheoKhoa.length > 0 &&
                dataMucInTheoKhoa.map((item, index) => {
                  return (
                    <>
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.tenKhoaPhong}</td>
                        <td>{item.soLuong}</td>
                        {Object.entries(props.inkNameMapping).map(
                          ([inkName, mappedName]) => (
                            <td key={mappedName}>{item[mappedName]}</td>
                          )
                        )}
                      </tr>
                    </>
                  );
                })}
            </tbody>
          </table>
        </div>
      </>
    );
  }
);
