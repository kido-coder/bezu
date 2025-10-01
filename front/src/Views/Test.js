import React, { useRef } from 'react';
import html2canvas from 'html2canvas';

const Test = () => {
  const printableComponentRef = useRef(null);

  const handlePrint = () => {
    const printableComponent = printableComponentRef.current;
    setTimeout(() => {
      html2canvas(printableComponent).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Print</title></head><body>');
        printWindow.document.write(`<img src="${imgData}" />`);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
      });
    }, 1000);
  };

  return (
    <div className='table-container'>
      {/* Content you want to print */}
      <div ref={printableComponentRef}>
        <h1>Hello, World!</h1>
        {/* Include your charts here */}
        <div id="chart1"><canvas id="myCanvas" width="200" height="100" style={{border:"1px solid #000000"}}>
Your browser does not support the HTML canvas tag.
</canvas></div>
        <div id="chart2"><canvas id="myCanvas" width="200" height="100" style={{border:"1px solid #000000"}}>
Your browser does not support the HTML canvas tag.
</canvas></div>
      </div>
      <button onClick={handlePrint}>Print</button>
    </div>
  );
};

export default Test;
