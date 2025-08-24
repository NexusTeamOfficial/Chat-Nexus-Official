// Firebase Import
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCo6ELZsvcwgLzMQBytsLs0pIHq9-s8zBI",
  authDomain: "chat-nexus-official.firebaseapp.com",
  projectId: "chat-nexus-official",
  storageBucket: "chat-nexus-official.firebasestorage.app",
  messagingSenderId: "427610743541",
  appId: "1:427610743541:web:d27643e75d36baecd2dbbc",
  measurementId: "G-0JB1NXBD5B"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM elements
const loginBox = document.getElementById("login-box");
const signupBox = document.getElementById("signup-box");
const setupBox = document.getElementById("setup-box");

document.getElementById("login-btn").onclick = () => {
  const email = document.getElementById("login-email").value;
  const pass = document.getElementById("login-password").value;
  signInWithEmailAndPassword(auth, email, pass)
    .then(() => {
      alert("Login successful!");
      window.location.href = "home.html"; // Next step
    })
    .catch(err => alert(err.message));
};

document.getElementById("signup-btn").onclick = () => {
  const email = document.getElementById("signup-email").value;
  const pass = document.getElementById("signup-password").value;
  createUserWithEmailAndPassword(auth, email, pass)
    .then(() => {
      // Show setup profile after signup
      signupBox.classList.add("hidden");
      setupBox.classList.remove("hidden");
    })
    .catch(err => alert(err.message));
};

document.getElementById("setup-btn").onclick = async () => {
  const user = auth.currentUser;
  const name = document.getElementById("setup-name").value;
  let bio = document.getElementById("setup-bio").value;
  if (bio.trim() === "") bio = "Hey, I'm using NexusChat";

  if (user) {
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      bio: bio,
      email: user.email,
      createdAt: new Date()
    });
    alert("Profile setup complete!");
    window.location.href = "home.html"; // redirect
  }
};

// Helpers
window.showSignup = () => {
  loginBox.classList.add("hidden");
  signupBox.classList.remove("hidden");
};

window.showLogin = () => {
  signupBox.classList.add("hidden");
  loginBox.classList.remove("hidden");
};
