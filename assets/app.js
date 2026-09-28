"use strict";
const RES_URL=""; // empty = QR poster uses this page's own web address
const $=s=>document.querySelector(s);
const esc=t=>String(t==null?"":t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const UI={
 en:{title:"Help paying rent",choose:"Where do you live?",zip:"Your ZIP code",pick:"Choose your community…",other:"Somewhere else",special:"Programs for specific situations (veterans, seniors, disability, safety, HIV, children)",indep:"These organizations are independent of Ashford Communities. Programs open and close often — if one is full, call the next one and 2-1-1. Your leasing office can send the ledger and forms an agency asks for.",printList:"Print this list",printPoster:"Print office poster",posterA:"Behind on rent?",posterB:"Free help is available.",scan:"Scan for a list of organizations that can help — in English, Spanish and Vietnamese.",none:"Choose where you live to see who to call.",theme:"Display",light:"Light",dark:"Dark",auto:"Match device"},
 es:{title:"Ayuda para pagar la renta",choose:"¿Dónde vive?",zip:"Su código postal",pick:"Elija su comunidad…",other:"En otro lugar",special:"Programas para situaciones específicas (veteranos, mayores, discapacidad, seguridad, VIH, niños)",indep:"Estas organizaciones no pertenecen a Ashford Communities. Los programas abren y cierran seguido; si uno está lleno, llame al siguiente y al 2-1-1. Su oficina puede enviar el estado de cuenta y los formularios que pida una agencia.",printList:"Imprimir esta lista",printPoster:"Imprimir cartel",posterA:"¿Atrasado con la renta?",posterB:"Hay ayuda gratuita.",scan:"Escanee para ver organizaciones que pueden ayudar — en inglés, español y vietnamita.",none:"Elija dónde vive para ver a quién llamar.",theme:"Pantalla",light:"Claro",dark:"Oscuro",auto:"Según el dispositivo"},
 vi:{title:"Hỗ trợ trả tiền nhà",choose:"Bạn sống ở đâu?",zip:"Mã ZIP của bạn",pick:"Chọn khu nhà của bạn…",other:"Nơi khác",special:"Chương trình cho hoàn cảnh riêng (cựu chiến binh, người cao tuổi, khuyết tật, an toàn, HIV, trẻ em)",indep:"Các tổ chức này độc lập với Ashford Communities. Chương trình mở và đóng thường xuyên — nếu một nơi đã hết suất, hãy gọi nơi tiếp theo và 2-1-1. Văn phòng cho thuê có thể gửi bảng kê và giấy tờ mà cơ quan yêu cầu.",printList:"In danh sách này",printPoster:"In áp phích văn phòng",posterA:"Trễ tiền nhà?",posterB:"Có hỗ trợ miễn phí.",scan:"Quét mã để xem các tổ chức có thể giúp — bằng tiếng Anh, Tây Ban Nha và Việt.",none:"Chọn nơi bạn sống để xem nên gọi ai.",theme:"Hiển thị",light:"Sáng",dark:"Tối",auto:"Theo thiết bị"}
};
const LANGS=["en","es","vi","zh","hi","ur","ps"],RTL=["ur","ps"];
const NATIVE={en:"English",es:"Español",vi:"Tiếng Việt",zh:"中文",hi:"हिन्दी",ur:"اردو",ps:"پښتو"};
if(typeof MORE!=="undefined"){Object.assign(UI,MORE.ui);Object.assign(I18N,MORE.page);R.forEach(r=>{for(const l in MORE.agency){const t=MORE.agency[l][r.id];if(t)r[l]=t}})}
let theme="auto";try{const t=localStorage.getItem("theme");if(t==="light"||t==="dark")theme=t}catch(e){}
function applyTheme(){const d=document.documentElement;if(theme==="auto")delete d.dataset.theme;else d.dataset.theme=theme;document.querySelectorAll(".theme button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.t===theme)))}
let lang=(navigator.language||"en").slice(0,2).toLowerCase();if(!UI[lang]||!I18N[lang])lang="en";
const OTH=[["O-harris","Houston / Harris","harris"],["O-brazoria","Brazoria","brazoria"],["O-fortbend","Fort Bend","fortbend"],["O-travis","Austin / Travis","travis"],["O-hays","San Marcos / Hays","hays"],["O-ector","Odessa / Ector","ector"]];
function fillProps(){const L=UI[lang];let h=`<option value="">${esc(L.pick)}</option>`;[...new Set(PROPS.map(p=>p.region))].forEach(rg=>{h+=`<optgroup label="${esc(rg)}">`+PROPS.filter(p=>p.region===rg).map(p=>`<option value="${p.code}">Ashford ${esc(p.name)}</option>`).join("")+`</optgroup>`});h+=`<optgroup label="${esc(L.other)}">`+OTH.map(o=>`<option value="${o[0]}">${esc(o[1])}</option>`).join("")+`</optgroup>`;const v=$("#prop").value;$("#prop").innerHTML=h;$("#prop").value=v}
function card(r){const d=lang==="en"?r.what:(r[lang]||r.what);const ph=(r.ph||[]).map(([n,l])=>`<a class="tel" dir="ltr" href="tel:${n==="2-1-1"?"211":n.replace(/[^0-9]/g,"")}">${esc(n)}</a>${l?`<small><bdi>${esc(l)}</bdi></small>`:""}`).join("");
  return `<article class="slip open"><div><h3><bdi>${esc(r.name)}</bdi></h3><p class="what">${esc(d)}</p>${r.addr?`<p class="meta"><bdi>${esc(r.addr)}</bdi></p>`:""}</div><div class="phones">${ph}${r.web?`<a class="web" href="${esc(r.web)}" target="_blank" rel="noopener">Web</a>`:""}</div></article>`}
function render(){
  const L=UI[lang],T=I18N[lang];document.documentElement.lang=lang;document.documentElement.dir=RTL.includes(lang)?"rtl":"ltr";
  $("#t_title").textContent=L.title;$("#t_intro").textContent=T.intro;$("#t_choose").textContent=L.choose;$("#t_zip").textContent=L.zip;$("#t_special").textContent=L.special;$("#t_check").textContent=T.check;$("#t_foot").textContent=T.foot;$("#t_indep").textContent=L.indep;$("#printList").textContent=L.printList;$("#printPoster").textContent=L.printPoster;
  $("#checkList").innerHTML=T.items.map(i=>`<li>${esc(i)}</li>`).join("");
  document.querySelectorAll(".lang button").forEach(b=>b.className=b.dataset.l===lang?"":"ghost");
  $("#themeGroup").setAttribute("aria-label",L.theme);document.querySelectorAll(".theme button").forEach(b=>{b.title=L[b.dataset.t];b.setAttribute("aria-label",L[b.dataset.t])});applyTheme();
  fillProps();
  const v=$("#prop").value,p=PROPS.find(x=>x.code===v),o=OTH.find(x=>x[0]===v),county=p?p.county:(o?o[2]:""),zip=$("#zip").value.trim();
  if(!county){$("#list").innerHTML=`<div class="empty">${esc(L.none)}</div>`;$("#specialList").innerHTML="";return}
  const ok=r=>r.st!=="closed"&&r.c.includes(county)&&(!r.zips||(zip.length===5&&r.zips.includes(zip)))&&!r.cause;
  const main=R.filter(r=>ok(r)&&!r.pop&&r.sec!=="special").sort((a,b)=>((b.zips?1:0)-(a.zips?1:0))||((a.rank||9)-(b.rank||9)));
  let h="";["start","rent","utility","legal","benefits"].forEach(k=>{const g=main.filter(r=>r.sec===k);if(g.length)h+=`<section class="group"><h2>${esc(T.sec[k])}</h2>${g.map(card).join("")}</section>`});
  $("#list").innerHTML=h;
  $("#specialList").innerHTML=R.filter(r=>ok(r)&&(r.pop||r.sec==="special")).map(card).join("");
}
document.querySelectorAll(".lang button").forEach(b=>b.addEventListener("click",()=>{lang=b.dataset.l;render()}));
document.querySelectorAll(".theme button").forEach(b=>b.addEventListener("click",()=>{theme=b.dataset.t;try{if(theme==="auto")localStorage.removeItem("theme");else localStorage.setItem("theme",theme)}catch(e){}applyTheme()}));
$("#prop").addEventListener("change",()=>{const p=PROPS.find(x=>x.code===$("#prop").value);$("#zip").value=p?p.zip:"";render()});
$("#zip").addEventListener("input",e=>{e.target.value=e.target.value.replace(/\D/g,"").slice(0,5);render()});
$("#printList").addEventListener("click",()=>{$("#specialBox").open=true;window.print()});
$("#printPoster").addEventListener("click",()=>{
  const po=$("#printArea");const url=RES_URL.startsWith("http")?RES_URL:location.href;
  po.innerHTML=`<div class="plead"><h1>${esc(UI.en.posterA)}</h1><h2>${esc(UI.en.posterB)}</h2></div><div class="pgrid">`+LANGS.slice(1).map(l=>`<div lang="${l}" dir="${RTL.includes(l)?"rtl":"ltr"}"><h3>${esc(UI[l].posterA)}</h3><p>${esc(UI[l].posterB)}</p></div>`).join("")+`</div><div id="qr"></div><p>${esc(UI.en.scan)}</p><p class="plangs">${LANGS.map(l=>`<span lang="${l}">${esc(NATIVE[l])}</span>`).join(" · ")}</p><p style="font-size:14px">${esc(url)}</p>`;
  try{if(window.QRCode)new QRCode(document.getElementById("qr"),{text:url,width:320,height:320,correctLevel:QRCode.CorrectLevel.M})}catch(e){}
  document.body.dataset.print="1";const done=()=>{delete document.body.dataset.print;window.removeEventListener("afterprint",done)};window.addEventListener("afterprint",done);setTimeout(()=>window.print(),300);
});
render();
