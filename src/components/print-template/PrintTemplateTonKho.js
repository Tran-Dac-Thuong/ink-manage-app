import React from "react";
import "./PrintTemplateTonKho.scss";

export const PrintTemplateTonKho = React.forwardRef((props, ref) => {
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
