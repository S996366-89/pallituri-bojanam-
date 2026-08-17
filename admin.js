import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app=initializeApp(firebaseConfig), auth=getAuth(app), db=getFirestore(app);
const loginBox=document.querySelector("#loginBox"), panel=document.querySelector("#panel");

document.querySelector("#loginBtn").onclick=async()=>{
  try{await signInWithEmailAndPassword(auth,document.querySelector("#email").value,document.querySelector("#password").value)}
  catch(e){document.querySelector("#loginStatus").textContent="లాగిన్ వివరాలు తప్పుగా ఉన్నాయి."}
};
document.querySelector("#logoutBtn").onclick=()=>signOut(auth);

onAuthStateChanged(auth,async user=>{
  if(user){loginBox.classList.add("hidden");panel.classList.remove("hidden");loadMenu();loadOrders()}
  else{loginBox.classList.remove("hidden");panel.classList.add("hidden")}
});

document.querySelector("#menuForm").addEventListener("submit",async e=>{
  e.preventDefault();
  await addDoc(collection(db,"menu"),{
    name:document.querySelector("#itemName").value.trim(),
    price:Number(document.querySelector("#itemPrice").value),
    image:document.querySelector("#itemImage").value.trim(),
    createdAt:new Date().toISOString()
  });
  e.target.reset();loadMenu();
});

async function loadMenu(){
  const el=document.querySelector("#adminMenu"),snap=await getDocs(query(collection(db,"menu"),orderBy("createdAt","desc")));
  el.innerHTML=snap.docs.map(d=>{const x=d.data();return `<article class="card"><img src="${x.image||'https://placehold.co/600x600'}"><div class="card-body"><h3>${x.name}</h3><div class="price">₹${x.price}</div><button data-id="${d.id}" class="delete">తొలగించు</button></div></article>`}).join("");
  el.querySelectorAll(".delete").forEach(b=>b.onclick=async()=>{await deleteDoc(doc(db,"menu",b.dataset.id));loadMenu()});
}
async function loadOrders(){
  const el=document.querySelector("#orders"),snap=await getDocs(query(collection(db,"orders"),orderBy("createdAt","desc")));
  el.innerHTML=snap.empty?"ఆర్డర్లు ఇంకా లేవు.":snap.docs.map(d=>{const x=d.data();return `<div class="order"><b>${x.name}</b> · ${x.phone}<br>భోజనాలు: ${x.quantity}<br>${x.address}</div>`}).join("");
}
