import logo from './logo.svg';
import './App.css';
import { jsPDF } from "jspdf";

function generatePDF() {
  console.log('GENERATE', );
  
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [237, 150]
});

  const links = ['https://s3.tradingview.com/snapshots/i/I5qa31yG.png']

  let promises = [];
  let images = [];
  links.forEach(link => {
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
  return (
    <div className="App">
      <button onClick={generatePDF}>Generate PDF</button>
    </div>
  );
}

export default App;
