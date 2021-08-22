import React, { useCallback } from "react";
import { withRouter } from "react-router";
import app from "./firebase";
import 'firebase/firestore';

const SignUp = ({ history }) => {
  const handleSignUp = useCallback(async event => {
    event.preventDefault();
    const { email, username, password } = event.target.elements;
    try {
      await app
        .auth()
        .createUserWithEmailAndPassword(email.value, password.value).then(({user})=>{
          // const usersRef =app.firestore().collection("users").doc(user.uid);
          // console.log(usersRef,'userRef')
          // usersRef.get()
          // .then(docSnapshot=>{
          //   usersRef.set({username:username.value})
          // })
          // ;
        });
      history.push("/");
    } catch (error) {
      console.log(error,'error')
      alert(error);
    }
  }, [history]);

  return (
    <div>
      <h1>Sign up</h1>
      <form onSubmit={handleSignUp}>
        <label>
          Email
          <input name="email" type="email" placeholder="Email" />
        </label>
        <label>
          Username
          <input name="username" type="username" placeholder="Username" />
        </label>
        <label>
          Password
          <input name="password" type="password" placeholder="Password" />
        </label>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default withRouter(SignUp);