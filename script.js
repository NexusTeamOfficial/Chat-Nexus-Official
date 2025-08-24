// ---------------- Firebase Imports ----------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  onAuthStateChanged, setPersistence, browserLocalPersistence 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, 
  addDoc, collection, query, orderBy, onSnapshot, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ---------------- Firebase Config ----------------
const firebaseConfig = {
  apiKey: "AIzaSyCo6ELZsvcwgLzMQBytsLs0pIHq9-s8zBI",
  authDomain: "chat-nexus-official.firebaseapp.com",
  projectId: "chat-nexus-official",
  storageBucket: "chat-nexus-official.firebasestorage.app",
  messagingSenderId: "427610743541",
  appId: "1:427610743541:web:d27643e75d36baecd2dbbc",
  measurementId: "G-0JB1NXBD5B"
};

// ---------------- Init Firebase ----------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Persistent login (cookies/localStorage)
setPersistence(auth, browserLocalPersistence);

// ---------------- INDEX (Login/Signup/Setup) ----------------
if (window.location.pathname.endsWith("index.html")) {
  const loginBox = document.getElementById("login-box");
  const signupBox = document.getElementById("signup-box");
  const setupBox = document.getElementById("setup-box");

  document.getElementById("login-btn").onclick = () => {
    const email = document.getElementById("login-email").value;
    const pass = document.getElementById("login-password").value;
    signInWithEmailAndPassword(auth, email, pass)
      .then(() => window.location.href = "home.html")
      .catch(err => alert(err.message));
  };

  document.getElementById("signup-btn").onclick = () => {
    const email = document.getElementById("signup-email").value;
    const pass = document.getElementById("signup-password").value;
    createUserWithEmailAndPassword(auth, email, pass)
      .then(() => {
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
        name, bio, email: user.email, createdAt: new Date()
      });
      window.location.href = "home.html";
    }
  };

  // Helpers to switch forms
  window.showSignup = () => { loginBox.classList.add("hidden"); signupBox.classList.remove("hidden"); };
  window.showLogin = () => { signupBox.classList.add("hidden"); loginBox.classList.remove("hidden"); };
}

// ---------------- HOME PAGE ----------------
if (window.location.pathname.endsWith("home.html")) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "index.html";
    } else {
      loadChats(user.uid);
    }
  });

  const searchBtn = document.getElementById("search-btn");
  const searchBox = document.getElementById("search-box");
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");

  if (searchBtn) {
    searchBtn.onclick = () => { searchBox.classList.toggle("hidden"); };
  }

  if (searchInput) {
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
  }

  async function loadChats(uid) {
    const chatList = document.getElementById("chat-list");
    if (chatList) {
      chatList.innerHTML = "<h3>Recent Chats</h3><div>No chats yet</div>";
    }
  }
}

// ---------------- CHAT PAGE ----------------
if (window.location.pathname.endsWith("chat.html")) {
  const urlParams = new URLSearchParams(window.location.search);
  const partnerId = urlParams.get("id");

  const messagesBox = document.getElementById("messages-box");
  const msgInput = document.getElementById("message-input");
  const sendBtn = document.getElementById("send-btn");

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "index.html";
    } else {
      loadPartnerInfo(partnerId);
      loadMessages(user.uid, partnerId);

      if (sendBtn) {
        sendBtn.onclick = async () => {
          if (msgInput.value.trim() === "") return;
          const msgText = msgInput.value;
          msgInput.value = "";

          await addDoc(collection(db, "messages"), {
            from: user.uid,
            to: partnerId,
            text: msgText,
            createdAt: serverTimestamp(),
            seen: false
          });
        };
      }
    }
  });

  async function loadPartnerInfo(uid) {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      document.getElementById("chat-username").innerText = snap.data().name;
      document.getElementById("chat-status").innerText = snap.data().bio || "last seen recently";
    }
  }

  function loadMessages(myId, partnerId) {
    const q = query(collection(db, "messages"), orderBy("createdAt"));
    onSnapshot(q, (snapshot) => {
      messagesBox.innerHTML = "";
      snapshot.forEach(docSnap => {
        const m = docSnap.data();
        if ((m.from === myId && m.to === partnerId) || (m.from === partnerId && m.to === myId)) {
          const div = document.createElement("div");
          div.className = "message " + (m.from === myId ? "message-right" : "message-left");
          div.innerHTML = `
            ${m.text}
            <span class="msg-time">${formatTime(m.createdAt)} ${m.from === myId ? seenIcon(m.seen) : ""}</span>
          `;
          messagesBox.appendChild(div);
          messagesBox.scrollTop = messagesBox.scrollHeight;

          if (m.to === myId && !m.seen) {
            updateDoc(doc(db, "messages", docSnap.id), { seen: true });
          }
        }
      });
    });
  }

  function formatTime(ts) {
    if (!ts) return "";
    const date = ts.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  function seenIcon(seen) {
    return seen ? "✔✔" : "✔";
  }
      }
  
