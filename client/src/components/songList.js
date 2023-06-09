import React from 'react';

function SongList(props){
    console.log("SongList");
    return (
        <div>
            {props.list.map((item,index)=>{
                return (
                    <div key={index}>
                        <p>{item.name}</p><br/>
                        <audio controls src={item.url}></audio>
                    </div>
                );
            })}
        </div>
    );
}

export default SongList;