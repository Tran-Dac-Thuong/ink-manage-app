import React, { useEffect, useState } from "react";
import "./PrintTemplateThongKeMucInDaNhapMotThang.scss";

export const PrintTemplateThongKeMucInDaNhapMotThang = React.forwardRef(
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
            <span>THỐNG KÊ MỰC IN ĐÃ NHẬP TRONG 1 THÁNG QUA</span>
            <br />
            <span>
              (Từ ngày {props.oneMonthAgo} tới ngày {props.current})
            </span>
          </h4>
          <br />
          <table className="ink-table_danhapmotthang">
            <thead>
              <tr>
                <th>Tổng cộng</th>
                <th>276</th>
                <th>337</th>
                <th>49A</th>
                <th>319</th>
                <th>78A</th>
                <th>12A</th>
                <th>17A</th>
                <th>052</th>
                <th>003 (Đen)</th>
                <th>003 (Vàng)</th>
                <th>003 (Hồng)</th>
                <th>003 (Xanh)</th>
                <th>664 (Đen)</th>
                <th>664 (Vàng)</th>
                <th>664 (Hồng)</th>
                <th>664 (Xanh)</th>
                <th>005 (Đen)</th>
                <th>774 (Đen)</th>
              </tr>
            </thead>
            <tbody>
              {dataInkPrint &&
                dataInkPrint.length > 0 &&
                dataInkPrint.map((item, index) => {
                  return (
                    <>
                      <tr>
                        <td>{item.tongSo}</td>
                        <td>{item.haibaysau}</td>
                        <td>{item.bababay}</td>
                        <td>{item.bonchinA}</td>
                        <td>{item.bamotchin}</td>
                        <td>{item.baytamA}</td>
                        <td>{item.muoihaiA}</td>
                        <td>{item.muoibayA}</td>
                        <td>{item.khongnamhai}</td>
                        <td>{item.khongkhongbaden}</td>
                        <td>{item.khongkhongbavang}</td>
                        <td>{item.khongkhongbahong}</td>
                        <td>{item.khongkhongbaxanh}</td>
                        <td>{item.sausaubonden}</td>
                        <td>{item.sausaubonvang}</td>
                        <td>{item.sausaubonhong}</td>
                        <td>{item.sausaubonxanh}</td>
                        <td>{item.khongkhongnamden}</td>
                        <td>{item.baybaybonden}</td>
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
