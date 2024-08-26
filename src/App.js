import "./App.css";
import DanhSachPhieu from "./components/DanhSachPhieu";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import TaoPhieu from "./components/TaoPhieu";
import NhapMuc from "./components/NhapMuc";
import TonKho from "./components/TonKho";
import NotFound from "./components/NotFound";
import DangNhap from "./components/DangNhap";
import XemPhieu from "./components/XemPhieu";
import Forbidden from "./components/Forbidden";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingBar from "react-top-loading-bar";
import { useState } from "react";

import DanhSachMucInDaNhap from "./components/DanhSachMucInDaNhap";
import DanhSachMucInDaXuat from "./components/DanhSachMucInDaXuat";
import ThongKeNhap from "./components/ThongKeNhap";
import ThongKeXuat from "./components/ThongKeXuat";

function App() {
  const [progress, setProgress] = useState(0);

  return (
    <>
      <BrowserRouter>
        <div>
          <LoadingBar
            color="#fe0000"
            progress={progress}
            onLoaderFinished={() => setProgress(0)}
          />

          <Routes>
            <Route
              path={"/"}
              element={<DanhSachPhieu setProgress={setProgress} />}
            ></Route>
            <Route
              path={"/danhsachmucindanhap"}
              element={<DanhSachMucInDaNhap setProgress={setProgress} />}
            ></Route>
            <Route
              path={"/danhsachmucindaxuat"}
              element={<DanhSachMucInDaXuat setProgress={setProgress} />}
            ></Route>
            <Route
              path={"/danhsachphieu"}
              element={<DanhSachPhieu setProgress={setProgress} />}
            ></Route>
            <Route
              path={"/thongkenhap"}
              element={<ThongKeNhap setProgress={setProgress} />}
            ></Route>
            <Route
              path={"/thongkexuat"}
              element={<ThongKeXuat setProgress={setProgress} />}
            ></Route>
            <Route
              path="/taophieu"
              element={<TaoPhieu setProgress={setProgress} />}
            ></Route>
            <Route
              path="/themmucin/:sophieu/:tenphieu/:loaiphieu/:ngaytaophieu/:nguoitaophieu/:trangthai/:khoaphong"
              element={<NhapMuc setProgress={setProgress} />}
            ></Route>
            <Route
              path="/tonkho"
              element={<TonKho setProgress={setProgress} />}
            ></Route>

            <Route
              path="/dangnhap"
              element={<DangNhap setProgress={setProgress} />}
            ></Route>

            <Route
              path="/xemphieu/:id/:loaiphieu/:ngaytaophieu/:nguoitaophieu/:nguoiduyetphieu/:ngayduyetphieu/:thoigianxuat/:tenphieu"
              element={<XemPhieu setProgress={setProgress} />}
            ></Route>
            <Route
              path="*"
              element={<NotFound setProgress={setProgress} />}
            ></Route>
            <Route
              path="/forbidden"
              element={<Forbidden setProgress={setProgress} />}
            ></Route>
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
