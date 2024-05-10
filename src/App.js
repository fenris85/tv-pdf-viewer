import React, { useState } from 'react';

import logo from './logo.svg';
import './App.css';
import { jsPDF } from "jspdf";

function convertTradingViewLink(url) {
  let identifier = url.split('/').pop();
  if (identifier == '') {
    identifier = url.split('/').slice(-2)[0];
  }
  return identifier;
}

const buckets = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']

function checkImageAvailability(url) {
  return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {resolve(true);}
      img.onerror = () => {reject(new Error("Image failed to load at URL: " + url))};
      img.src = url;
  });
}

async function findFirstValidImage(identifier) {
  let bucketIndex = 0;
  let validLink = null;

  while (true) {    
      try {
        const imgLink = `https://s3.tradingview.com/snapshots/${buckets[bucketIndex]}/${identifier}.png`
        validLink = imgLink;
        const res = await checkImageAvailability(imgLink);
    } catch (error) {
        console.error(error.message);
        bucketIndex++;
        continue;
    }
    return validLink;
  }
}

function generatePDF(linksContent) {  
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [237, 150]
});

  const tvLinks = linksContent.split('\n');

  const tvImages = tvLinks.map(link => {
    if(link.trim() == '') return;
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

          
          findFirstValidImage(link).then(imgLink => {
            img.src = imgLink
          });
           
          
      }));
  });

  Promise.all(promises).then(() => {
      images.forEach((img, index) => {
          if (index > 0) doc.addPage();
           doc.addImage(img, 'PNG', 0, 0, 237, 150);
           
          
      });
      doc.save('tradingview_snapshots.pdf');
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
