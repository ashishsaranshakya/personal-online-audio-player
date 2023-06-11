import React, { useState, useEffect } from 'react';
import SongList from './components/songList';

const App = () => {
  const [selectedFile, setSelectedFile] = useState([]);
  const [isVisible,setIsVisible] = useState(false);
  const [songList, setSongList] = useState([]);
  const [loginStatus, setLoginStatus] = useState(false);

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
    fetch( baseURL + '/upload', 
      {
        method: 'POST',
        body: formData,
        headers: { authorization: localStorage.getItem('accessToken') }
      })
      .then(response => {setIsVisible(false); return response.json(); })
      .then(data => { 
        updateSongList();
      })
      .catch(error => { console.error(error); });
  };

  const updateSongList = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');
    if(token){
      localStorage.setItem('accessToken', token);
      setLoginStatus(true);
    }
    else if(!localStorage.getItem('accessToken')){
      localStorage.setItem('accessToken', 'admin');
    }

    fetch( baseURL + '/songs', 
      { headers: { authorization: localStorage.getItem('accessToken') } } ,
      {
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
      })
      .catch(error => { console.error(error); });
  };

  useEffect(() => {
    updateSongList();
  }, []);

  function handleLogout(){
    fetch( baseURL + '/logout', 
      { headers: { authorization: localStorage.getItem('accessToken') } } ,
      {
        method: 'GET'
      })
      .then(response => {return response.json(); })
      .then(data => {
        localStorage.setItem('accessToken', 'admin');
        setLoginStatus(false);
        window.location.replace('http://localhost:3000');
      })
      .catch(error => { console.error(error); });
  }

  return (
    <div>
      <p style={{visibility:isVisible? "visible" : "hidden"}}>Uploading</p>
      <input type="file" onChange={handleFileChange} multiple/>
      <button onClick={handleUpload}>Upload</button>
      {
        !loginStatus ?
        <button><a href="http://localhost:5000/login">Login</a></button> :
        <button onClick={handleLogout}>Logout</button>
      }
      <SongList list={songList}/>
    </div>
  );
};

export default App;