import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD3wH1Bk53pN7CrAHAfZCcwjaseWoQXV1U",
  authDomain: "edutalks-c3d4f.firebaseapp.com",
  projectId: "edutalks-c3d4f",
  storageBucket: "edutalks-c3d4f.appspot.com",
  messagingSenderId: "319477588117",
  appId: "1:319477588117:web:f0b9d4b26d4df589d6fb9c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
