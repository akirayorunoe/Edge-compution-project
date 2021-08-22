import React,{useState} from 'react';
import {
  Text,
  Button,
  TextInput,
  View,
  Alert,
} from 'react-native';
import {io} from "socket.io-client";

export default function Home({navigation}){
  const [data,setData]=useState({
    name:'',
    ip:'localhost',
    bedId:''
  })
  
  return(
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <TextInput 
      placeholder="Your name"
      onChangeText={text=>{setData({...data,name:text})}}/>
       <TextInput 
      placeholder="Age"
      onChangeText={text=>{setData({...data,age:text})}}/>
       <TextInput 
      placeholder="IP Address"
      onChangeText={text=>{setData({...data,ip:text})}}/>
       <TextInput 
      placeholder="Bed ID"
      onChangeText={text=>{setData({...data,bedId:text})}}/>
      <Button
        title="Go to Details"
        onPress={() => {
          const socket = io(`ws://${data.ip}:3001`);
          console.log(data.ip)
          socket.emit("patient-info", data) 
          navigation.navigate('Details',{ip:data.ip,socket:socket,bedId:data.bedId})
          //     console.log(data)
          // })
        }}
      />
    </View>
  )
}
