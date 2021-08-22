import React,{useState,useEffect} from "react";
import "./App.css";
import { BrowserRouter as Router, Route,Switch } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import SignUp from "./SignUp";
import { AuthProvider } from "./Auth";
import PrivateRoute from "./PrivateRoute";
import app from "./firebase";
import Item from './components/Item';
const App = () => {
  const [patientsData,setPatientsData]=useState([]);
  useEffect(() => {
    const docRefPatients=app.firestore().collection("patients")
    //const docRefUsers=app.firestore().collection("users")
    const snapshot = docRefPatients.onSnapshot((querySnapshot) => {
      let array=[];
      querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          array.push({id:doc.id,data:doc.data()});
      });
      console.log(array,'array')
       setPatientsData(array)
  })
  // .catch((error) => {
  //     console.log("Error getting documents: ", error);
  // });
    //console.log(snapshot)
  },[])
  return (
    <AuthProvider>
      <Router>
        <Switch>
          <PrivateRoute exact path="/" render={()=><Home categories={patientsData}/>} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/signup" component={SignUp} />
          <PrivateRoute path={`/:patientId`} render={()=><Item data={patientsData}/>}/>
        </Switch>
      </Router>
    </AuthProvider>
  );
};

export default App;