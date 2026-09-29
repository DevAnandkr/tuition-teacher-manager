import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyCoAkloh7AJdI79I6xP6mzhtdjweRq4tI0",
  authDomain: "tuition-teacher-manager-176ef.firebaseapp.com",
  projectId: "tuition-teacher-manager-176ef",
  storageBucket: "tuition-teacher-manager-176ef.firebasestorage.app",
  messagingSenderId: "672398901772",
  appId: "1:672398901772:web:d2c85be26045eb66ec6429",
  measurementId: "G-VWMC7JJNWB",
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)