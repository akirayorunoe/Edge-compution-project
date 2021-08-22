import React,{useState,useEffect} from "react";
import {useLocation} from 'react-router-dom';
import app from "../firebase";

const Item=({data})=>{
    const [patient,setPatient]=useState(data)
    const [patientData,setPatientData]=useState({})
    const location = useLocation()
    const id=location.pathname.replace(/[^0-9]/g, '');
    useEffect(() => {
        const docRefPatients=app.firestore().collection("patients")
        const snapshot = docRefPatients.onSnapshot((querySnapshot) => {
          querySnapshot.forEach((doc) => {
              // doc.data() is never undefined for query doc snapshots
              if(parseInt(id)===parseInt(doc.id)){
                //  chuyển object of objects về dạng
                //  [
                //     {
                //         "2021-04-18T02:24:46.668Z": "50"
                //     },
                //     {
                //         "2021-04-18T02:25:27.571Z": "60"
                //     }
                // ]
                //const arrayBPM = Object.entries(doc.data().bpm).map(e => ({[e[0]]:e[1]}));//e=>e[0] lấy key e=>e[1] lấy value
                //const arraySpo2 = Object.entries(doc.data().spo2).map(e => ({[e[0]]:e[1]}));
                setPatientData({id:doc.id,data:{...doc.data()}})
              }
          });
      })
      console.log(patientData)
    //   .catch((error) => {
    //       console.log("Error getting documents: ", error);
    //   });
      },[])
    return console.log(patientData),
    <>
        {patientData && <>
            <h1>BedId: {patientData?.id}</h1>
            <h1>Name: {patientData?.data?.name}</h1>
            <h1>Age: {patientData?.data?.age}</h1>
            {/* <h1>Check-in date: {patientData?.data?.date}</h1> */}
            <h1>Emotion: {patientData?.data?.emotion}</h1>
            <img src={`data:${patientData?.data?.imageMime};base64,`+patientData?.data?.imageBase64}/>
            {/* Lấy data mới nhất và value */}
            <h1>BPM: {patientData?.data?.bpm?patientData?.data?.bpm[patientData?.data?.bpm?.length-1]?.data:0}
            </h1>
            <h1>SPO2: {patientData?.data?.spo2?patientData?.data?.spo2[patientData?.data?.spo2?.length-1]?.data:0}</h1>
        </>}
        
    </>
}
export default Item;