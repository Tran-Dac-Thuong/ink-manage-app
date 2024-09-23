import React, { useEffect, useState } from "react";
import "./PrintTemplateThongKeMucInDaNhapMotNam.scss";

export const PrintTemplateThongKeMucInDaNhapMotNam = React.forwardRef(
  (props, ref) => {
    const dataInkPrint = props.data ? props.data : [];

    return (
      <>
        <div className="print-preview_danhapmotnam" ref={ref}>
          <div className="header_danhapmotnam">
            <div className="">
              <img src="../../../../../../../img/logo2.png" alt="" />
            </div>
          </div>

          <br />
          <h4 className="title_danhapmotnam">
            <span>THỐNG KÊ MỰC IN ĐÃ NHẬP TRONG 1 NĂM QUA</span>
            <br />
            <span>
              (Từ ngày {props.oneYearAgo} tới ngày {props.current})
            </span>
          </h4>
          <br />
          <table className="ink-table_danhapmotnam">
            <thead>
              <tr>
                <th>Tổng cộng</th>
                {Object.keys(props.inkNameMapping).map((inkName) => (
                  <th key={inkName}>{inkName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataInkPrint &&
                dataInkPrint.length > 0 &&
                dataInkPrint.map((item, index) => {
                  return (
                    <>
                      <tr key={index}>
                        <td>{item.tongSo}</td>
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
