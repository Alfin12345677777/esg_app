// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc, query, where, orderBy } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCj1iBHUqnr5pUossiyCfWltnA0VBiu2gU",
  authDomain: "junction2025-afdd1.firebaseapp.com",
  projectId: "junction2025-afdd1",
  storageBucket: "junction2025-afdd1.firebasestorage.app",
  messagingSenderId: "98832430622",
  appId: "1:98832430622:web:d4b47e3762798241c3a00f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export const mockFirebaseData = [
  {
    id: 'samsung-ct',
    companyName: "Samsung C&T",
    overallScore: 85,
    e_score: 88,
    s_score: 90,
    g_score: 80,
    sapaViolations: 0,
    slug: "samsung-ct",
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'hyundai-ec',
    companyName: "Hyundai E&C",
    overallScore: 78,
    e_score: 82,
    s_score: 75,
    g_score: 79,
    sapaViolations: 1,
    slug: "hyundai-ec", 
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'daewoo-ec',
    companyName: "Daewoo E&C",
    overallScore: 72,
    e_score: 70,
    s_score: 75,
    g_score: 71,
    sapaViolations: 0,
    slug: "daewoo-ec",
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'gs-ec',
    companyName: "GS E&C", 
    overallScore: 69,
    e_score: 65,
    s_score: 72,
    g_score: 70,
    sapaViolations: 2,
    slug: "gs-ec",
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'lotte-ec',
    companyName: "Lotte E&C",
    overallScore: 65,
    e_score: 60,
    s_score: 68,
    g_score: 67,
    sapaViolations: 1,
    slug: "lotte-ec",
    lastUpdated: new Date().toISOString()
  }
];

console.log('🔥 Firebase service initialized (mock data mode)');