import React, { useState, useEffect } from 'react';
import SongList from './components/songList';

const App = () => {
  const [selectedFile, setSelectedFile] = useState([]);
  const [isVisible,setIsVisible] = useState(false);
  const [songList, setSongList] = useState([]);

  const baseURL='http://127.0.0.1:5000';

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files);
  };

  const handleUpload = () => {
    const formData = new FormData();
    for(var i=0; i<selectedFile.length; i++){
      formData.append('file', selectedFile[i]);
    }
    
    setIsVisible(true);
    fetch( baseURL + '/upload', {
      method: 'POST',
      body: formData,
    })
      .then(response => {setIsVisible(false); return response.json(); })
      .then(data => { 
        console.log("handleUpload");
        updateSongList();
      })
      .catch(error => { console.error(error); });
  };

  const updateSongList = () => {
    const user = 'admin';

    fetch( baseURL + '/' + user, {
      method: 'GET'
    })
      .then(response => {return response.json(); })
      .then(data => {
        const list=[];
        for(var i=0;i<data.songList.length;i++){
          list.push({
            key : i,
            name : data.songList[i].name,
            url : data.songList[i].url
          })
        }
        setSongList(list);
        console.log("updateSongList");
      })
      .catch(error => { console.error(error); });
  };

  useEffect(() => {
    updateSongList();
  }, []);

  return (
    <div>
      <p style={{visibility:isVisible? "visible" : "hidden"}}>Uploading</p>
      <input type="file" onChange={handleFileChange} multiple/>
      <button onClick={handleUpload}>Upload</button>
      <SongList list={songList}/>
    </div>
  );
};

export default App;