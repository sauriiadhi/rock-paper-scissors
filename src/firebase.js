import { initializeApp } from "firebase/app";
import { getDatabase } from 'firebase/database';


const firebaseConfig = {
  apiKey: "AIzaSyCZkUXHRH1ErjtsbnZvZxrcqhWYkxXVMxc",
  authDomain: "rock-paper-scissors-af299.firebaseapp.com",
  projectId: "rock-paper-scissors-af299",
  storageBucket: "rock-paper-scissors-af299.appspot.com",
  messagingSenderId: "331397815094",
  appId: "1:331397815094:web:bb2621c3bba877d8f83197"
};

const app = initializeApp(firebaseConfig);

const rtdb = getDatabase(app);

console.log(rtdb)

export { rtdb };