import React,{useState,useEffect} from "react";
import {Link} from 'react-router-dom';
import emailjs from 'emailjs-com';
import app from "../firebase";
const Category=({categories})=>{
    const [color,setColor]=useState(true)
    useEffect(()=>{
        let bpmValue
        let spo2Value
        let age
        categories.forEach(i => {
            bpmValue=i.data?.bpm?i.data?.bpm[i?.data?.bpm?.length-1]?.data:0
            spo2Value=i.data?.spo2?i.data?.spo2[i?.data?.spo2?.length-1]?.data:0
            age=i.data?.age
            if(bpmCheck(bpmValue,age)=="tomato"||spo2Check(spo2Value)=="tomato")
            {i.color="tomato"
            setColor(!color)
        }
            else{i.color='#03fc84'
            setColor(!color)
        }
        
            //console.log(i.color,'icolor')
            //setColor(false)
            //console.log(i.data?.bpm?i.data?.bpm[i?.data?.bpm?.length-1]?.data:0,"bpm")
        });
       const warnPatient=categories.filter(patient=>patient.color=="tomato")
        sendEmail(warnPatient);
    },[categories])
    const bpmCheck=(value,age)=>{
        let bpm=value
        if(age==0){
            if(bpm<85||bpm>200)
            {return "tomato"}
        }
        else if(age>0 && age<=2){
            if(bpm<100||bpm>180)
            {return "tomato"}
        }
        else if(age>2 && age<=10){
            if(bpm<60||bpm>140)
            {return "tomato"}
        }
        else
            if(bpm<50||bpm>100)
            {return "tomato"}
    }
    const spo2Check=(value)=>{
        let spo2=value;
        if(spo2<95){
            return "tomato"
        }
    }
    function sendEmail(patients) {
        //console.log(app.auth().currentUser.email)
        let temp={
            emailTo:`17520518@gm.uit.edu.vn`,
            notes:'Cảnh báo bệnh nhân: '
        }
        let tempArr=(patients.filter(patient=>patient.color=='tomato')).forEach(i=>temp.notes=temp.notes+i.id+' ')
        emailjs.send('service_b181xyg', 'template_5svcbqk', temp,'user_vjCLCwjOd5HRf0P7Inbqh')
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
         }, function(error) {
            console.log('FAILED...', error);
         });
        }
    return<>
        {<div>
            {categories?.map(category=><Link to={`${category.id}`}>
                {console.log(category.color,'color')}
                <div className="wrapper-grid" style={{background:category.color,marginBottom:10}}>
                    <h1>BedId:{category.id}</h1>
                    <h1>{category.data.name}</h1>
                </div>
            </Link>)}
            
        </div>}
        
    </>
}
export default Category;