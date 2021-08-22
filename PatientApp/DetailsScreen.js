import React,{useEffect,useState} from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';

export default function DetailsScreen({route,navigation}){
  const { ip,socket,bedId } = route.params;
  const [data,setData]=useState({})
  const [img,setImage]=useState('')
  const [spo2,setSpo2]=useState([])
  const [bpm,setBpm]=useState([])
  const [check,setCheck]=useState(false)
  const [emotion,setEmotion]=useState()
  useEffect(async()=>{
    await socket.on('feedback', message => {
      setData(message)
      setBpm(Object.keys(message?.bpm).length>0?message.bpm:[])
      setSpo2(Object.keys(message?.spo2).length>0?message.spo2:[])
      setEmotion(message?.emotion)
      message?.imageBase64?setImage(`data:${message?.imageMime};base64,${message.imageBase64}`):''
      if(bpmCheck(message?.bpm[message?.bpm?.length-1]?.data,message?.age)==true||spo2Check(message?.spo2[message?.spo2?.length-1]?.data)==true)
      {Alert.alert('Alert','Bpm/spo2 bất thường, mời liên lạc chuyên gia y tế')
  }
      console.log(message)
    });
  },[]);
  const bpmCheck=(value,age)=>{
    let bpm=value
    if(age==0){
        if(bpm<85||bpm>200)
        {return true}
    }
    else if(age>0 && age<=2){
        if(bpm<100||bpm>180)
        {return true}
    }
    else if(age>2 && age<=10){
        if(bpm<60||bpm>140)
        {return true}
    }
    else
        if(bpm<50||bpm>100)
        {return true}
}
const spo2Check=(value)=>{
    let spo2=value;
    if(spo2<95){
        return true
    }
}
  const takePhotoFromCamera = () => {
    ImagePicker.openCamera({
      compressImageMaxWidth: 48,
      compressImageMaxHeight: 48,
      cropping: true,
      includeBase64:true,
      //compressImageQuality: 0.7
    }).then(image => {
      setCheck(true);
      //console.log(image);
      setImage(`data:${image.mime};base64,${image.data}`);
      fetch(`http://${ip}:3001/predict`,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances:
          [
            {
              image_bytes:
              {
                b64: image.data
              },
              key: "image"
            }
          ],
          imageMime:image.mime,
          bedId
        })
    }).then(res=>res.json()).then(data=>{
      setEmotion(data?.emotion)
      setCheck(false)
    Alert.alert('Update image','Update success~')
    }).catch(err=>{
      console.log(err,ip)
      setCheck(false)
      Alert.alert('Update image','Update fail!')})
    });
  }
  return(
    check?<ActivityIndicator size="large" style={{flex:1,justifyContent:'center'}}/>:
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    {/* <Text>IP:{ip}</Text> */}
    <TouchableOpacity onPress={takePhotoFromCamera}>
            <View
              style={{
                height: 100,
                width: 100,
                borderRadius: 15,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Image
                source={{
                  uri: img?`${img}`:'https://upload.wikimedia.org/wikipedia/commons/9/9a/No_avatar.png',
                }}
                style={{height: 100, width: 100}}
                imageStyle={{borderRadius: 15}}>
              </Image>
            </View>
          </TouchableOpacity>
      <Text>Emotion:{emotion}</Text>
      <Text>{data?.name}</Text>
      <Text>{data?.age}</Text>
    <Text>BPM:{bpm[bpm.length-1]?.data}</Text>
    <Text>SPO2:{spo2[spo2.length-1]?.data}</Text>
    {/* <Text>BPM:{data?.bpm[Object.keys(data?.bpm).length-1]?.data}</Text>
    <Text>SPO2:{data?.spo2[Object.keys(data?.spo2).length-1]?.data}</Text> */}
  </View>
  )
}
