import '../components/qr_code/styles.css';
import { Routes, Route } from "react-router-dom";

import Home from '../components/qr_code/QRcode';
import QRgen from '../components/qr_code/QRgenerator';
import QRscan from '../components/qr_code/QrScanner';

function QRPage() {
  return (
    <div className="App">
      <div className="App-header relative z-10 ">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="qr_generator" element={<QRgen />} /> {/* Relative path */}
          <Route path="qr_scanner" element={<QRscan />} /> {/* Relative path */}
        </Routes>
      </div>
    </div>
  );
}

export default QRPage;