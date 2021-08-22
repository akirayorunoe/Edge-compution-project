import React,{useEffect,useState} from "react";
import app from "./firebase";
import Category from './components/Category';
const Home = ({categories},props) => {
  return (
    <React.Fragment>
      <div className="wrapper-hr" style={{justifyContent:"space-evenly"}}>
      <h1>Home</h1><button onClick={() => app.auth().signOut()}>Sign out</button></div>
      <div style={{display:"flex",alignItems: "center",marginBottom:10}}><div style={{background:"tomato",height:50,width:100}}></div>Bệnh nhân có chỉ số bpm/spo2 không bình thường</div>
      <div style={{display:"flex",alignItems: "center",marginBottom:10}}><div style={{background:"#03fc84",height:50,width:100}}></div>Bệnh nhân có chỉ số bpm/spo2 bình thường</div>
      <Category categories={categories} {...props}/>  
      
    </React.Fragment>
  )
}

export default Home;