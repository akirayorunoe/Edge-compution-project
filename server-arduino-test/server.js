// var PORT = process.env.port||3000;
var app = require('express')();
// var http = require('http').createServer(app);
var server = require("http").Server(app);
var io = require("socket.io")(server);
const axios = require('axios');
const cors=require('cors')
const bp = require('body-parser')
const config = require('./config');
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
const firebase = require('./db');
const firestore = firebase.firestore();

var clients =[];
io.on("connection", function(socket)
	{
		// socket.on("disconnect", function()
		// 	{
		// 	});
         //server lắng nghe dữ liệu từ client
         console.log('connect client')
		socket.on("patient-info", async function(data)
			{
				//sau khi lắng nghe dữ liệu, server phát lại dữ liệu này đến các client khác
                // socket.emit("Server-sent-data", data);
                var clientInfo = new Object();
                clientInfo.bedId = data.bedId;
                clientInfo.clientId= socket.id;
                clients.push(clientInfo);
                //console.log(data,'data')
                await firestore.collection('patients').doc(data.bedId).set({name:data.name,age:data.age},{merge:true});
                //get data of bed if have 
                let dataFeedback;
                await firestore.collection('patients').doc(data.bedId).get().then(doc=>{
                    if (doc.exists) {
                    dataFeedback=doc.data()
                    }
                    else{
                        dataFeedback={}
                    }
                });
                socket.emit('feedback',dataFeedback)
			});
            socket.on('disconnect', function (data) {
                for(var i=0, len=clients.length; i<len; ++i ){
                    var c = clients[i];
                    if(c.clientId == socket.id){
                        clients.splice(i,1);
                        break;
                    }
                }
    
            });
	});

app.get('/',(req,res)=>{
    console.log('connect')
    res.send('<h1>Test</h1>')
})

app.post('/data', async (req,res) => {
    let baseSpo2=[];
    let baseBpm=[];
    let bedId=req.body.bedId;
    let spo2=req.body.spo2;
    let bpm=req.body.bpm;
    let check=false;
    let date=new Date().toISOString();
    let image;
    let emotion;
    let name;
    let mime;
    let age;
   // console.log({spo2:{[`${date}`]:spo2},bpm:{[`${date}`]:bpm}},'a');
    await firestore.collection('patients').doc(bedId).get().then(doc=>{
        if (doc.exists) {
        baseSpo2=doc.data().spo2;
        if(!baseSpo2){baseSpo2=[]}
        baseSpo2.push({dateTime:date,data:spo2})
        baseBpm=doc.data().bpm;
        if(!baseBpm){baseBpm=[]}
        baseBpm.push({dateTime:date,data:bpm})
        }
        else{
            check=true;
            baseSpo2.push({dateTime:date,data:spo2})
            baseBpm.push({dateTime:date,data:bpm})
        }
        image=doc.data().imageBase64
        emotion=doc.data().emotion
        age=doc.data().age
        name=doc.data().name
        mime=doc.data().imageMime
        //console.log(baseBpm,baseSpo2)
    })
    let obj={bpm:baseBpm,spo2:baseSpo2,imageBase64:image?image:'',emotion:emotion?emotion:'',name:name?name:'',imageMime:mime?mime:'',age:age?age:0}
    console.log(obj,'obj')
    await firestore.collection('patients').doc(bedId).set(check?{...obj,date:new Date().toISOString()}:obj,{merge:true});
    //send data to client when recieve
    for(var i=0, len=clients.length; i<len; ++i ){
        var c = clients[i];
        console.log(c)
        if(c.bedId == bedId){
            console.log(c)
            io.to(c.clientId).emit('feedback',obj)
            break;
        }
    }
    res.send('Record saved successfuly');
})

// app.post('/dataPatient', async (req,res) => {
    
// })

app.post('/predict', (req, res) => {
    let bedId=req.body.bedId
    // console.log((req.body))
    let imageMime=req.body.imageMime
    let imageBase64=req.body.instances[0].image_bytes.b64
    //axios.post('http://localhost:8501/v1/models/default:predict',JSON.stringify(req.body))
    axios({
        method: 'post',
        url: 'http://localhost:8501/v1/models/default:predict',
        data: req.body
      })
    .then(response => response.data).then(result => {
        let scores = result.predictions[0].scores
        let labels = result.predictions[0].labels
        let emotion = labels[scores.indexOf(Math.max(...scores))]//tìm index score lớn nhất cũng chính là index của label đó
        console.log(emotion)
        firestore.collection('patients').doc(bedId).set({emotion,imageBase64,imageMime},{merge:true});
        res.send({emotion});
    })
    .catch(err=>console.log(err))
})


server.listen(config.port,()=>{
    console.log('listen on port '+config.port)
})



