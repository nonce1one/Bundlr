import React, { useState, useEffect, useRef } from 'react';
import Menubar from './components/Menubar';
import './App.css';

import background from './images/background1.png';

function App() {
  const [lineColor, setLineColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(10);
  const [bkgrdColor, setBkgrdColor] = useState();
  const [dataUrl, setDataUrl] = useState('#');
  const [isDrawing, setIsDrawing] = useState(false);
  const [undoStrokeArray, setUndoStrokeArray] = useState([]);
  const [undoCount, setUndoCount] = useState(0);

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.style.background = bkgrdColor;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctxRef.current = ctx;
  }, [lineColor, lineWidth]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 860, 860);
    const image = new Image();
    image.src = background;
    image.onload = () => {
      ctx.drawImage(image, 0, 0, 860, 860);
      setUndoCount((undoCount) => undoCount + 1);
      setUndoStrokeArray((undoStrokeArray) => [
        ...undoStrokeArray,
        canvasRef.current.toDataURL('image/png'),
      ]);
    };
  }, []);

  const startDrawing = (e) => {
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    ctxRef.current.closePath();
    setIsDrawing(false);
    setUndoCount((undoCount) => undoCount + 1);
    setUndoStrokeArray((undoStrokeArray) => [
      ...undoStrokeArray,
      canvasRef.current.toDataURL('image/png'),
    ]);
  };

  const draw = (e) => {
    if (!isDrawing) {
      return;
    }
    ctxRef.current.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctxRef.current.stroke();
  };

  const undo = () => {
    if (undoCount > 1) {
      setUndoCount((undoCount) => undoCount - 1);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      let canvasPic = new Image();
      canvasPic.src = undoStrokeArray[undoStrokeArray.length - 2];
      canvasPic.onload = function () {
        ctx.drawImage(canvasPic, 0, 0);
      };
      setUndoStrokeArray(undoStrokeArray.slice(0, -1));
    }
  };

  const handleColorChange = (color) => {
    setLineColor(color);
  };

  const handleLineWidth = (width) => {
    setLineWidth(width);
  };

  const handleDownload = () => {
    setDataUrl(canvasRef.current.toDataURL('image/png'));
    let f = canvasRef.current.toDataURL('image/png');
    return f;
  };

  const widthHalf = lineWidth ? lineWidth / 2 : 0;
  const cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="%23000000" opacity="0.3" height="${lineWidth}" viewBox="0 0 ${lineWidth} ${lineWidth}" width="${lineWidth}"><circle cx="${widthHalf}" cy="${widthHalf}" r="${widthHalf}" fill="%23000000" /></svg>') ${widthHalf} ${widthHalf}, auto`;

  return (
    <section>
      <Menubar
        handleColorChange={handleColorChange}
        handleDownload={handleDownload}
        dataUrl={dataUrl}
        handleLineWidth={handleLineWidth}
        undo={undo}
        undoCount={undoCount}
        currentImage={undoStrokeArray}
      />
      <canvas
        style={{ cursor }}
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        width={`860px`}
        height={`860px`}
        ref={canvasRef}
      />
    </section>
  );
}

export default App;
