import React, { useState } from 'react';
import { Fab, TextField, TextareaAutosize, Grid } from '@material-ui/core';
import { ArrowBack, GetApp } from '@material-ui/icons';
import { Link } from "react-router-dom";
import QRCode from 'react-qr-code'; // Using react-qr-code

function QRgenerator() {
    const [qr, setQr] = useState('lintangwisesa');
    const handleChange = (event) => {
        setQr(event.target.value);
    };
    const downloadQR = () => {
        const svg = document.getElementById("myqr");
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngFile;
            downloadLink.download = "myqr.png";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    return (
      <div>
            <Link to="/qr_code">
            <Fab style={{marginRight:10}} color="primary">
                <ArrowBack/>
            </Fab>
            </Link>
            <span>QR Generator</span>
            
            <div style={{marginTop:30}}>
                <TextField onChange={handleChange} style={{width:320}}
                value={qr} label="QR content" size="large" variant="outlined" color="primary" 
                />
            </div>

            <div>
                {
                    qr ?
                    <QRCode
                        id="myqr"
                        value={qr} 
                        size={320}
                    /> :
                    <p>No QR code preview</p>
                }
            </div>
            <div>
                {
                    qr ? 
                    <Grid container>
                        <Grid item xs={10}>
                        <TextareaAutosize
                            style={{fontSize:18, width:250, height:100}}
                            rowsMax={4}
                            defaultValue={qr}
                            value={qr}
                            variant="outlined"
                            color="primary" 
                        />
                        </Grid>
                        <Grid item xs={2}>
                        <Fab onClick={downloadQR} style={{marginLeft:10}} color="primary">
                            <GetApp/>
                        </Fab>
                        </Grid>
                    </Grid> :
                    ''
                }
            </div>
      </div>
    );
}

export default QRgenerator;