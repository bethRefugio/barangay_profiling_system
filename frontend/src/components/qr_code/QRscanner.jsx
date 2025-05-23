import React, { useState } from 'react';
import { Fab, TextareaAutosize } from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import { Link } from "react-router-dom";
import { QrReader } from 'react-qr-reader'; // Updated import

function QRscanner() {
    const [qrscan, setQrscan] = useState('No result');

    const handleScan = (result, error) => {
        if (!!result) {
            setQrscan(result?.text); // Use `result.text` for the scanned QR code
        }
        if (!!error) {
            console.error(error);
        }
    };

    return (
        <div>
            <Link to="/qr_code">
                <Fab style={{ marginRight: 10 }} color="primary">
                    <ArrowBack />
                </Fab>
            </Link>
            <span>QR Scanner</span>

            <center>
                <div style={{ marginTop: 30 }}>
                    <QrReader
                        onResult={handleScan} // Updated to use `onResult`
                        style={{ height: 240, width: 320 }}
                    />
                </div>
            </center>

            <TextareaAutosize
                style={{ fontSize: 18, width: 320, height: 100, marginTop: 100 }}
                rowsMax={4}
                defaultValue={qrscan}
                value={qrscan}
            />
        </div>
    );
}

export default QRscanner;