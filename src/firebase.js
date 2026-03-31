import { initializeApp } from 'firebase/app';
import { getAuth }       from 'firebase/auth';

const firebaseConfig = {
  apiKey:            "AIzaSyDifcHMx7kqfaJh4_rJQZfLYf-UqKDNuQ8",
  authDomain:        "movies-c861e.firebaseapp.com",
  projectId:         "movies-c861e",
  storageBucket:     "movies-c861e.firebasestorage.app",
  messagingSenderId: "815395885754",
  appId:             "1:815395885754:web:ea5baabf70cb661b43e883",
};

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);