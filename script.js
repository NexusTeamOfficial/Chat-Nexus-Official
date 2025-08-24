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

import { getFirestore, doc, setDoc, getDocs, getDoc, collection, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// 🔹 Home Page Functions
const auth = getAuth();
const db = getFirestore();

// Check auth on home.html
if (window.location.pathname.endsWith("home.html")) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "index.html";
    } else {
      loadChats(user.uid);
    }
  });

  // Search users
  const searchBtn = document.getElementById("search-btn");
  const searchBox = document.getElementById("search-box");
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");

  searchBtn.onclick = () => {
    searchBox.classList.toggle("hidden");
  };

  searchInput.addEventListener("input", async () => {
    searchResults.innerHTML = "";
    const q = searchInput.value.toLowerCase();
    if (q.trim() === "") return;

    const usersSnap = await getDocs(collection(db, "users"));
    usersSnap.forEach(docSnap => {
      const u = docSnap.data();
      if (u.name.toLowerCase().includes(q)) {
        const div = document.createElement("div");
        div.className = "user-item";
        div.innerHTML = `
          <span>${u.name} <small>${u.bio || ""}</small></span>
          <button data-id="${docSnap.id}" class="follow-btn">Follow</button>
        `;
        searchResults.appendChild(div);
      }
    });

    // Follow/Unfollow
    document.querySelectorAll(".follow-btn").forEach(btn => {
      btn.onclick = async () => {
        const targetId = btn.getAttribute("data-id");
        const me = auth.currentUser.uid;
        const ref = doc(db, "follows", me + "_" + targetId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          await updateDoc(ref, { active: !snap.data().active });
          btn.textContent = snap.data().active ? "Follow" : "Unfollow";
        } else {
          await setDoc(ref, { from: me, to: targetId, active: true });
          btn.textContent = "Unfollow";
        }
      };
    });
  });

  // Load recent chats
  async function loadChats(uid) {
    const chatList = document.getElementById("chat-list");
    chatList.innerHTML = "<h3>Recent Chats</h3>";

    // (Later step → messages collection se fetch karenge)
    chatList.innerHTML += `<div class="chat-item">No chats yet</div>`;
  }
  }
                                              
