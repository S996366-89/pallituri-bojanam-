import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const menuEl = document.querySelector("#menu");

function card(d){
  const x=d.data();
  return `<article class="card">
    <img src="${x.image || 'https://placehold.co/600x600?text=పల్లెటూరు+భోజనం'}" alt="">
    <div class="card-body"><h3>${escapeHtml(x.name||"కూర")}</h3><div class="price">₹${Number(x.price||0)}</div></div>
  </article>`;
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}

async function loadMenu(){
  try{
    const snap=await getDocs(query(collection(db,"menu"),orderBy("createdAt","desc")));
    menuEl.innerHTML=snap.empty ? '<p class="muted">ఇవాళ మెనూ ఇంకా పెట్టలేదు.</p>' : snap.docs.map(card).join("");
  }catch(e){ menuEl.innerHTML='<p class="muted">Firebase configuration పెట్టిన తర్వాత మెనూ కనిపిస్తుంది.</p>'; console.error(e); }
}
loadMenu();

document.querySelector("#orderForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const status=document.querySelector("#orderStatus");
  try{
    await addDoc(collection(db,"orders"),{
      name:document.querySelector("#name").value.trim(),
      phone:document.querySelector("#phone").value.trim(),
      address:document.querySelector("#address").value.trim(),
      quantity:Number(document.querySelector("#quantity").value),
      createdAt:new Date().toISOString(),
      status:"new"
    });
    status.textContent="ఆర్డర్ విజయవంతంగా పంపబడింది. ధన్యవాదాలు!";
    e.target.reset();
    document.querySelector("#quantity").value=1;
  }catch(err){status.textContent="ఆర్డర్ పంపలేకపోయాం. Firebase settings చెక్ చేయండి.";console.error(err)}
});
