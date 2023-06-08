import React, {useRef} from 'react'

function FileUploader(props){
    //const fileInput = useRef(null)

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        props.onFileSelectSuccess(file);
      };

    return (
        <input type="file" onChange={handleFileInput}/>
    )
}

export default FileUploader;