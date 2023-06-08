import React, { useState } from 'react';

const App = () => {
  const [selectedFile, setSelectedFile] = useState([]);
  const [isVisible,setIsVisible] = useState(false);

  const postBaseURL='http://127.0.0.1:5000';

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files);
  };

  const handleUpload = () => {
    const formData = new FormData();
    for(var i=0; i<selectedFile.length; i++){
      formData.append('file', selectedFile[i]);
    }
    //formData.append('file', selectedFile);
    setIsVisible(true);
    fetch( postBaseURL + '/upload', {
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
      <input type="file" onChange={handleFileChange} multiple/>
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default App;
