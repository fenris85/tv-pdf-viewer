import React, { useState } from 'react';

import logo from './logo.svg';
import './App.css';
import { jsPDF } from "jspdf";

function convertTradingViewLink(url) {
  let identifier = url.split('/').pop();
  if (identifier == '') {
    identifier = url.split('/').slice(-2)[0];
  }
  const newUrl = `https://s3.tradingview.com/snapshots/i/${identifier}.png`;
  return newUrl;
}

function generatePDF(linksContent) {  
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [237, 150]
});

  const tvLinks = linksContent.split('\n');

  const tvImages = tvLinks.map(link => {
    return convertTradingViewLink(link);
  });  

  let promises = [];
  let images = [];
  tvImages.forEach(link => {
      promises.push(new Promise((resolve, reject) => {
          let img = new Image();
          img.onload = () => {
              images.push(img);
              resolve();
          };
          img.onerror = reject;
          img.src = link;
      }));
  });

  Promise.all(promises).then(() => {
      images.forEach((img, index) => {
          if (index > 0) doc.addPage();
          doc.addImage(img, 'PNG', 0, 0, 237, 150); // Assuming A4 size page
      });
      doc.save('tradingview_images.pdf');
  }).catch(error => {
      console.error('Error loading images:', error);
  });
}

function App() {

  const [text, setText] = useState('');

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  return (

    <div className="App">

      <h3>TradingView PDF Maker</h3>
      <p>Paste Tradingview snapshots links (one per line) below and click on Generate PDF</p>
      <br/>
      <br/>
      <textarea onChange={handleTextChange} placeholder="Paste snapshots links here..." id="editor" rows="10" cols="50"></textarea>
      <br/>
      <br/>
      <button onClick={()=>generatePDF(text)}>Generate PDF</button>
    </div>
  );
}

export default App;
