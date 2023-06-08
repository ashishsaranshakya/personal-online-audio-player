import React, { useState } from 'react';

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isVisible,setIsVisible] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    const formData = new FormData();
    formData.append('file', selectedFile);
    setIsVisible(true);
    fetch('http://127.0.0.1:5000/upload', {
      method: 'POST',
      body: formData,
    })
      .then(response => {setIsVisible(false); return response.json(); })
      .then(data => { console.log(data); })
      .catch(error => { console.error(error); });
  };

  return (
    <div>
      <p style={{visibility:isVisible? "visible" : "hidden"}}>Uploading</p>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default App;
