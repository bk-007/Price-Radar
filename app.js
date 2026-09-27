const state={location:null,stream:null,scanning:false,currentQuery:""};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const statusEl=$("#status");

function setStatus(message="",error=false){statusEl.textContent=message;statusEl.classList.toggle("error",error)}
function selectMode(mode){$$(".tab").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));$$(".panel").forEach(p=>p.classList.remove("active"));$("#"+mode+"Panel").classList.add("active");if(mode!=="scan")stopScanner()}
$$(".tab").forEach(b=>b.addEventListener("click",()=>selectMode(b.dataset.mode)));

$("#locationBtn").addEventListener("click",()=>{
  if(!("geolocation" in navigator)){setStatus("This browser does not support location services.",true);return}
  setStatus("Requesting location permission…");
  navigator.geolocation.getCurrentPosition(p=>{
    state.location={latitude:p.coords.latitude,longitude:p.coords.longitude,accuracy:p.coords.accuracy};
    $("#locationCard").classList.add("enabled");$("#locationTitle").textContent="Nearby mode is on";
    $("#locationText").textContent="Location is available for this session only. It is not saved or sent anywhere.";
    $("#locationBtn").textContent="Location active";setStatus("Location ready.");
  },e=>setStatus(e.code===1?"Location permission was denied. Price comparison still works.":"Could not access location.",true),
  {enableHighAccuracy:false,timeout:10000,maximumAge:300000});
});

$$(".search-btn").forEach(btn=>btn.addEventListener("click",()=>startComparison(btn.dataset.source)));
["descriptionInput","barcodeInput"].forEach(id=>$("#"+id).addEventListener("keydown",e=>{if(e.key==="Enter")startComparison(id==="barcodeInput"?"barcode":"describe")}));

function startComparison(source){
  const query=(source==="barcode"?$("#barcodeInput").value:$("#descriptionInput").value).trim();
  if(!query){setStatus("Enter something to compare first.",true);return}
  state.currentQuery=query;$("#resultTitle").textContent=source==="barcode"?"Barcode "+query:query;
  $("#workspace").classList.remove("hidden");renderRetailers();renderObservations();
  setStatus("Open retailers below and add the matching prices you find.");
}

function renderRetailers(){
  $("#retailerGrid").innerHTML=window.PRICE_RADAR_RETAILERS.map(r=>`
    <a class="retailer-link" href="${r.buildSearchUrl(state.currentQuery)}" target="_blank" rel="noopener noreferrer">
      ${escapeHtml(r.name)} <span>↗</span>
    </a>`).join("");
}

$("#addPriceBtn").addEventListener("click",()=>{
  if(!state.currentQuery){setStatus("Start a product comparison first.",true);return}
  const store=$("#storeInput").value.trim(), raw=$("#priceInput").value, note=$("#noteInput").value.trim();
  if(!store||raw===""){setStatus("Add a store and price.",true);return}
  try{
    PriceRadarObservations.add({query:state.currentQuery,store,price:Number(raw),note});
    $("#storeInput").value="";$("#priceInput").value="";$("#noteInput").value="";
    renderObservations();setStatus("Price added for this session.");
  }catch{setStatus("That price could not be added.",true)}
});

$("#clearBtn").addEventListener("click",()=>{PriceRadarObservations.clear();renderObservations();setStatus("Session price observations cleared.")});

function renderObservations(){
  const items=PriceRadarObservations.forQuery(state.currentQuery).sort((a,b)=>a.price-b.price);
  $("#observationCount").textContent=items.length?items.length+" price"+(items.length===1?"":"s")+" compared":"No prices yet";
  $("#resultsList").innerHTML=items.map((item,i)=>`
    <article class="result-card">
      <div><div class="store">${escapeHtml(item.store)}</div><div class="meta">${escapeHtml(item.note||"Observed just now")} · session only</div></div>
      <div class="price">$${item.price.toFixed(2)}${i===0?'<div class="best">LOWEST</div>':""}</div>
    </article>`).join("");
}

$("#scanBtn").addEventListener("click",async()=>{
  if(state.scanning){stopScanner();return}
  if(!("BarcodeDetector" in window)){setStatus("Barcode scanning is not supported by this browser. Enter the UPC manually.",true);return}
  try{
    const formats=await BarcodeDetector.getSupportedFormats(), preferred=["ean_13","ean_8","upc_a","upc_e"], supported=preferred.filter(f=>formats.includes(f));
    state.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});
    const video=$("#video");video.srcObject=state.stream;await video.play();state.scanning=true;$(".scanner").classList.add("running");
    $("#scanBtn").textContent="Stop scanner";$("#scanStatus").textContent="Point the camera at a product barcode.";setStatus("");
    scanLoop(new BarcodeDetector({formats:supported.length?supported:undefined}));
  }catch{setStatus("Camera access failed. Enter the barcode manually instead.",true)}
});
async function scanLoop(detector){
  if(!state.scanning)return;
  try{const codes=await detector.detect($("#video"));if(codes.length){const value=codes[0].rawValue;stopScanner();$("#barcodeInput").value=value;selectMode("barcode");startComparison("barcode");return}}catch{}
  requestAnimationFrame(()=>scanLoop(detector));
}
function stopScanner(){state.scanning=false;if(state.stream){state.stream.getTracks().forEach(t=>t.stop());state.stream=null}const s=$(".scanner");if(s)s.classList.remove("running");const b=$("#scanBtn");if(b)b.textContent="Start scanner";const v=$("#video");if(v)v.srcObject=null}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
window.addEventListener("pagehide",stopScanner);
