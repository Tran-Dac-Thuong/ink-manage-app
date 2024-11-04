import React from "react";
import "./PrintTemplateThongKeMucInDaNhap.scss";

export const PrintTemplateThongKeMucInDaNhap = React.forwardRef(
  (props, ref) => {
    const dataInkPrint = props.data ? props.data : [];

    return (
      <>
        <div className="print-preview_danhapmotthang" ref={ref}>
          <div className="header_danhapmotthang">
            <div className="">
              <img src="../../../../../../../img/logo2.png" alt="" />
            </div>
          </div>

          <br />
          <h4 className="title_danhapmotthang">
            <span>THỐNG KÊ SỐ LƯỢNG MỰC IN ĐÃ NHẬP</span>
          </h4>
          <br />
          <table className="ink-table_danhapmotthang">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên hàng</th>
                <th>Số lượng</th>
              </tr>
            </thead>
            <tbody>
              {dataInkPrint &&
                dataInkPrint.length > 0 &&
                dataInkPrint.map((item, index) => {
                  return (
                    <>
                      <tr key={index}>
                        <td>{item.stt}</td>
                        <td>{item.tenmuc}</td>
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
  }
);
