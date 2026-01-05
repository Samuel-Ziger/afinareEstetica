import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyDxk8Cm0lkJafbWENfrGncgQCESzTvrKOI",
  authDomain: "afinare-estetica.firebaseapp.com",
  projectId: "afinare-estetica",
  storageBucket: "afinare-estetica.firebasestorage.app",
  messagingSenderId: "273989849878",
  appId: "1:273989849878:web:1733ac4839f7708f927637",
  measurementId: "G-R5Q3Y43LEJ",
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

// Analytics only runs in browser
let analytics
if (typeof window !== "undefined") {
  analytics = getAnalytics(app)
}

export { app, auth, db, storage, analytics }
