import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA7NyQ14X1YNxhrMlAXRXAj8-1sTKKtRag",
  authDomain: "school-fce31.firebaseapp.com",
  projectId: "school-fce31",
  storageBucket: "school-fce31.firebasestorage.app",
  messagingSenderId: "930907502818",
  appId: "1:930907502818:web:a050dfa0c8a52e470fc6bb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);