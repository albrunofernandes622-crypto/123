/* ===== bloco-8 ===== */
/* Chart.js é carregado somente quando uma tela realmente precisa de gráficos. */
window.__chartJSReady = null;
function ensureChartJS(){
  if(typeof Chart !== "undefined") return Promise.resolve(true);
  if(window.__chartJSReady) return window.__chartJSReady;
  window.__chartJSReady = new Promise(resolve=>{
    const existing=document.querySelector('script[data-chartjs]');
    if(existing){ existing.addEventListener('load',()=>resolve(true),{once:true}); existing.addEventListener('error',()=>resolve(false),{once:true}); return; }
    const script=document.createElement('script');
    script.src='https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js';
    script.async=true; script.defer=true; script.dataset.chartjs='1';
    script.onload=()=>resolve(true); script.onerror=()=>resolve(false);
    document.head.appendChild(script);
  });
  return window.__chartJSReady;
}


/* ===== extracted script block ===== */

/* BANCO DE DADOS - COMPATIBILIDADE INTEGRAL PRESERVADA */
const STORAGE_KEY = "studio_pilates_louise_karla_v2";
const BACKUP_KEY = "studio_pilates_louise_karla_v2_backup";
const META_KEY = "studio_pilates_louise_karla_v2_meta";
const STUDENTS_STORAGE_KEY = "studio_pilates_louise_karla_students_v1";
const STORAGE_VERSION = 11;

const defaultData = {
  settings:{
    studioName:"Studio de Pilates LOUISE KARLA",
    owner:"LOUISE KARLA",
    whatsapp:"",
    instagram:"",
    email:"",
    address:"",
    capacity:4,
    duration:60,
    logo:"",
    pixType:"CPF/CNPJ",
    pixKey:"",
    pixName:"",
    darkMode:false,
    darkPalette:"carvao",
    dashboardGradient:"tema",
    theme:{ p:"#f08300", p2:"#ffb04d", a:"#ff5a1f", preset:"marfim" },
    interface:{ density:"standard", reducedEffects:false, tableWidth:720, tableDensity:"standard", backgroundOpacity:66, menuOpacity:72, bottomNavOpacity:72, menuPosition:"left" },
    system:{ confirmDelete:true, animations:true, hapticVisual:true, showBadges:true, keyboardShortcuts:true },
    messages:{
      billing: "Olá, {nome}! 😊\n\nPassando para lembrar da mensalidade do {studio}.\n\nPlano: {plano}\nValor: R$ {valor}\nVencimento: {vencimento}\n\nChave PIX ({pix_tipo}): {pix}\nBeneficiário: {pix_nome}\n\nQualquer dúvida, estamos à disposição!",
      reminder: "Olá, {nome}! 😊\n\nSua mensalidade do {studio} vence hoje ({vencimento}).\nValor: R$ {valor}\nChave PIX: {pix}\n\nCaso já tenha pago, por favor desconsidere!",
      welcome: "Seja muito bem-vindo(a) ao {studio}, {nome}! 🎉\n\nFicamos muito felizes em ter você conosco em nosso time de alunos no plano {plano}.\n\nSua aula está agendada para o horário das {horario}.\n\nQualquer dúvida é só nos chamar por aqui!",
      birthday: "Olá, {nome}! 🎂✨\n\nO Studio de Pilates {studio} deseja um feliz aniversário! Que seu novo ciclo seja cheio de saúde, movimento e conquistas. 💜",
      class: "Olá, {nome}! 😊\n\nPassando para confirmar sua aula de Pilates às {horario} no {studio}.\n\nAté lá!"
    }
  },
  plans:[
    { id:"pl1", name:"Plano 2X na semana", weekly:2, price:170 },
    { id:"pl2", name:"Plano 3X na semana", weekly:3, price:220 }
  ],
  hours:["08:00","09:00","10:00","11:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00"],
  teachers:["LOUISE KARLA", "Professor 2", "Prof. Substituto"],
  payments:["PIX", "Cartão de Crédito", "Dinheiro", "Transferência"],
  hourDays:{},
  teacherClosings:{},
  alertDismissed:{},
  teacherFixedRates:{},
  teacherClassValues:{},
  students:[], classes:[], finance:[], makeups:[], waitlist:[], equipment:[
    {id:"eq_reformer",name:"Reformer",category:"Reformer",quantity:1,active:true,notes:"Aparelho principal."},
    {id:"eq_cadillac",name:"Cadillac",category:"Cadillac",quantity:1,active:true,notes:"Estrutura completa."},
    {id:"eq_chair",name:"Chair",category:"Chair",quantity:1,active:true,notes:"Cadeira de Pilates."},
    {id:"eq_barrel",name:"Ladder Barrel",category:"Barrel",quantity:1,active:true,notes:"Mobilidade e alongamento."},
    {id:"eq_spine",name:"Spine Corrector",category:"Acessório",quantity:1,active:true,notes:"Suporte para mobilidade da coluna."}
  ]
};

let db;
let charts = {};
let currentMonth = new Date();
let editingId = null;

function clone(obj){ return JSON.parse(JSON.stringify(obj)); }

function mergeDefaults(data){
  const result = clone(defaultData);
  if(!data || typeof data !== "object") return result;
  Object.assign(result, data);
  result.settings = { ...clone(defaultData.settings), ...(data.settings || {}) };
  result.settings.messages = { ...clone(defaultData.settings.messages), ...((data.settings || {}).messages || {}) };
  result.settings.theme = { ...clone(defaultData.settings.theme), ...((data.settings || {}).theme || {}) };
  result.settings.interface = { ...clone(defaultData.settings.interface), ...((data.settings || {}).interface || {}) };

  result.plans = Array.isArray(data.plans) ? data.plans : result.plans;
  result.hours = Array.isArray(data.hours) ? data.hours : result.hours;
  result.hourDays = (data.hourDays && typeof data.hourDays === "object") ? data.hourDays : {};
  result.teacherClosings = (data.teacherClosings && typeof data.teacherClosings === "object") ? data.teacherClosings : {};
  result.alertDismissed = (data.alertDismissed && typeof data.alertDismissed === "object") ? data.alertDismissed : {};
  result.teacherFixedRates = (data.teacherFixedRates && typeof data.teacherFixedRates === "object") ? data.teacherFixedRates : {};
  result.teacherClassValues = (data.teacherClassValues && typeof data.teacherClassValues === "object") ? data.teacherClassValues : {};
  result.teachers = Array.isArray(data.teachers) ? data.teachers : result.teachers;
  result.payments = Array.isArray(data.payments) ? data.payments : result.payments;
  result.students = Array.isArray(data.students) ? data.students : [];
  result.classes = Array.isArray(data.classes) ? data.classes : [];
  result.finance = Array.isArray(data.finance) ? data.finance : [];
  result.makeups = Array.isArray(data.makeups) ? data.makeups : [];
  result.waitlist = Array.isArray(data.waitlist) ? data.waitlist : [];
  result.equipment = Array.isArray(data.equipment) ? data.equipment : clone(defaultData.equipment);
  result.finance.forEach(f=>{ if(!f.type) f.type="Receita"; });
  return result;
}

function validateDB(data){
  if(!data || typeof data !== "object") return false;
  const keys = ["plans","hours","teachers","payments","students","classes","finance","makeups","waitlist","equipment"];
  for(const k of keys){ if(!Array.isArray(data[k])) return false; }
  return data.settings && typeof data.settings === "object";
}

/* Persistência redundante dos alunos.
   O cadastro de alunos é mantido também em uma chave própria para impedir que
   uma gravação/recarregamento parcial do banco principal faça alunos anteriores
   desaparecerem. O ID é a chave de reconciliação. */
function loadStudentVault(){
  try{
    const raw=localStorage.getItem(STUDENTS_STORAGE_KEY);
    if(!raw) return [];
    const parsed=JSON.parse(raw);
    return Array.isArray(parsed)?parsed:[];
  }catch(e){
    console.warn("Não foi possível ler o cofre de alunos:",e);
    return [];
  }
}

function saveStudentVault(students){
  try{
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(Array.isArray(students)?students:[]));
    return true;
  }catch(e){
    console.error("Não foi possível persistir os alunos:",e);
    return false;
  }
}

function mergeStudentRecords(primary, secondary){
  const map=new Map();
  [...(Array.isArray(primary)?primary:[]), ...(Array.isArray(secondary)?secondary:[])].forEach(s=>{
    if(!s || typeof s!=="object" || !s.id) return;
    const previous=map.get(String(s.id));
    // O registro mais recente vence quando ambos existem.
    const previousStamp=previous?.updatedAt||previous?.createdAt||"";
    const currentStamp=s.updatedAt||s.createdAt||"";
    if(!previous || String(currentStamp)>=String(previousStamp)) map.set(String(s.id),s);
  });
  return Array.from(map.values());
}

function hydrateStudentPersistence(data){
  const result=mergeDefaults(data);
  const vault=loadStudentVault();
  result.students=mergeStudentRecords(result.students,vault);
  return result;
}

function loadDB(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      if(validateDB(parsed)) return hydrateStudentPersistence(parsed);
    }
  }catch(e){ console.error("Erro ao carregar banco:", e); }

  try{
    const backupRaw = localStorage.getItem(BACKUP_KEY);
    if(backupRaw){
      const backup = JSON.parse(backupRaw);
      if(validateDB(backup)) return hydrateStudentPersistence(backup);
    }
  }catch(e){}

  const initial = hydrateStudentPersistence(defaultData);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  localStorage.setItem(BACKUP_KEY, JSON.stringify(initial));
  saveStudentVault(initial.students);
  return initial;
}

function saveDB(){
  try{
    const serialized = JSON.stringify(db);
    localStorage.setItem(BACKUP_KEY, localStorage.getItem(STORAGE_KEY) || serialized);
    localStorage.setItem(STORAGE_KEY, serialized);
    setStorageStatus("ok", "Dados protegidos");

    // Agenda uma confirmação somente se a ação atual não apresentar outra mensagem.
    // Isso evita o toast vazio/duplicado e também impede que “Alteração feita”
    // sobrescreva mensagens específicas como “Aluno atualizado com sucesso!”.
    if(window.__appReady){
      const saveStamp = Date.now();
      window.__lastSaveStamp = saveStamp;
      clearTimeout(window.__changeNoticeTimer);
      window.__changeNoticeTimer = setTimeout(() => {
        if(window.__lastToastAt && window.__lastToastAt >= saveStamp) return;
        toast("Alteração feita");
      }, 120);
    }
    return true;
  }catch(e){
    setStorageStatus("error", "Falha ao salvar");
    toast("⚠ Erro ao salvar dados locais.");
    return false;
  }
}

function setStorageStatus(type, msg){
  const targets=[
    [document.getElementById("storageDot"),document.getElementById("storageStatus")],
    [document.getElementById("backupStorageDot"),document.getElementById("backupStorageText")]
  ];
  targets.forEach(([dot,txt])=>{
    if(dot) dot.className = "storage-dot " + (type==="warning"?"warning":type==="error"?"error":"");
    if(txt) txt.textContent = msg;
  });
}

/* UTILITÁRIOS */
function uid(prefix="id"){ return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
function esc(v){ return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;"); }
function money(v){ return Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }

function todayISO(){
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
}

function whatsappNumber(num){
  let n = String(num||"").replace(/\D/g,"");
  if(!n) return "";
  return n.startsWith("55") ? n : "55" + n;
}
/* Ícones de interface (traço, herdam a cor do texto) */
const UI_ICONS={"search": "<circle cx=\"11\" cy=\"11\" r=\"6.5\"/><path d=\"m20 20-4-4\"/>", "plus": "<path d=\"M12 5v14M5 12h14\"/>", "bolt": "<path d=\"M13 3 5 14h6l-1 7 8-11h-6z\"/>", "userplus": "<circle cx=\"9\" cy=\"8\" r=\"3.2\"/><path d=\"M3.5 19.5c.5-3.4 2.4-5.3 5.5-5.3s5 1.9 5.5 5.3M18 8v6M15 11h6\"/>", "calplus": "<rect x=\"3.5\" y=\"5\" width=\"17\" height=\"15.5\" rx=\"3\"/><path d=\"M8 3v4M16 3v4M3.5 10h17M12 13.5v4.5M9.75 15.75h4.5\"/>", "cash": "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"3\"/><circle cx=\"12\" cy=\"12\" r=\"2.6\"/><path d=\"M6.5 12h.01M17.5 12h.01\"/>", "phone": "<rect x=\"7\" y=\"2.8\" width=\"10\" height=\"18.4\" rx=\"2.6\"/><path d=\"M10.5 18h3\"/>", "menu": "<path d=\"M4 7h16M4 12h16M4 17h10\"/>", "clock": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 7.5V12l3 2\"/>", "gauge": "<path d=\"M4.5 17a8 8 0 1 1 15 0\"/><path d=\"m12 13 4-4\"/><circle cx=\"12\" cy=\"13\" r=\"1.2\"/>", "alert": "<path d=\"M12 4 2.8 19.5h18.4z\"/><path d=\"M12 10v4.2M12 17h.01\"/>", "users": "<circle cx=\"9\" cy=\"8\" r=\"3.2\"/><path d=\"M3.5 19.5c.5-3.4 2.4-5.3 5.5-5.3s5 1.9 5.5 5.3\"/><path d=\"M16 5.2a3.2 3.2 0 0 1 0 5.6M17.5 14.4c1.7.6 2.7 2.2 3 5\"/>", "trend": "<path d=\"M3.5 17 9 11.5l3.5 3.5L20.5 7\"/><path d=\"M15 7h5.5v5.5\"/>", "check": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"m8.5 12.3 2.4 2.4 4.6-5\"/>", "pie": "<path d=\"M12 3.5v8.5h8.5A8.5 8.5 0 0 0 12 3.5z\"/><path d=\"M10 6a8.5 8.5 0 1 0 8 8\"/>", "building": "<path d=\"M4.5 20.5V5.5L12 3v17.5M12 8.5h7.5v12M8 8h.01M8 12h.01M8 16h.01M15.5 12h.01M15.5 16h.01M3 20.5h18\"/>", "tag": "<path d=\"M3.5 12.2V4.5h7.7L20.5 13.8a1.8 1.8 0 0 1 0 2.5l-4.2 4.2a1.8 1.8 0 0 1-2.5 0z\"/><circle cx=\"8\" cy=\"9\" r=\"1.2\"/>", "card": "<rect x=\"3\" y=\"5.5\" width=\"18\" height=\"13\" rx=\"3\"/><path d=\"M3 10h18M7 15h3\"/>", "msg": "<path d=\"M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4v-4h0A2.5 2.5 0 0 1 4 13.5z\"/>", "palette": "<path d=\"M12 3.2a8.8 8.8 0 1 0 0 17.6c1.2 0 1.9-.8 1.9-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H17a3.9 3.9 0 0 0 3.9-3.9C20.9 6.7 17 3.2 12 3.2z\"/><circle cx=\"7.8\" cy=\"11\" r=\"1\"/><circle cx=\"10.5\" cy=\"7.3\" r=\"1\"/><circle cx=\"15\" cy=\"7.8\" r=\"1\"/>", "shield": "<path d=\"M12 3 5 6v5.5c0 4.4 3 7.9 7 9.5 4-1.6 7-5.1 7-9.5V6z\"/><path d=\"m9 12 2.2 2.2L15.2 10\"/>", "download": "<path d=\"M12 4v11M7.5 10.8 12 15.3l4.5-4.5M5 20h14\"/>", "upload": "<path d=\"M12 16V5M7.5 9.2 12 4.7l4.5 4.5M5 20h14\"/>", "file": "<path d=\"M6 3h8l4.5 4.5V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z\"/><path d=\"M14 3v5h4.5M8.5 13h7M8.5 16.5h5\"/>", "table": "<rect x=\"3.5\" y=\"4.5\" width=\"17\" height=\"15\" rx=\"2.5\"/><path d=\"M3.5 10h17M3.5 14.5h17M9.5 10v9.5\"/>", "restore": "<path d=\"M3.5 12a8.5 8.5 0 1 0 2.8-6.3L3.5 8.5\"/><path d=\"M3.5 3.8v4.7h4.7M12 8v4.2l2.8 1.6\"/>", "db": "<ellipse cx=\"12\" cy=\"6\" rx=\"7.5\" ry=\"3\"/><path d=\"M4.5 6v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6M4.5 12v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6\"/>", "refresh": "<path d=\"M20 11a8 8 0 0 0-14.3-4.2L4 8.5M4 4v4.5h4.5M4 13a8 8 0 0 0 14.3 4.2L20 15.5M20 20v-4.5h-4.5\"/>", "chev_l": "<path d=\"m14.5 6-6 6 6 6\"/>", "chev_r": "<path d=\"m9.5 6 6 6-6 6\"/>", "wrench": "<path d=\"M14.5 6.5a4 4 0 0 0 5 5L10 21l-3.5-3.5L16 8z\" opacity=\"0\"/><path d=\"M14.7 5.3a4.2 4.2 0 0 0-4.9 5.4L3.5 17a1.8 1.8 0 0 0 2.5 2.5l6.3-6.3a4.2 4.2 0 0 0 5.4-4.9l-2.6 2.6-2.4-.5-.5-2.4z\"/>", "pencil": "<path d=\"M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z\"/><path d=\"m14.5 7.5 3 3\"/>", "power": "<path d=\"M12 3.5v8M7 6.6a7.5 7.5 0 1 0 10 0\"/>", "wa": "<path d=\"M4.2 19.8 5.4 16A8 8 0 1 1 8.2 18.7z\"/><path d=\"M9.2 9c.2 2.4 2.8 5 5.4 5.4l1.3-1.3-2-1-1 .7c-.9-.4-1.8-1.3-2.2-2.2l.7-1-1-2z\"/>", "wallet": "<path d=\"M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3\"/><rect x=\"3.5\" y=\"7.5\" width=\"17\" height=\"12\" rx=\"2.5\"/><path d=\"M16 13.5h.01\"/>", "heart": "<path d=\"M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z\"/>", "pulse": "<path d=\"M3 12h4l2.5-6 4 12 2.5-6H21\"/>", "user": "<circle cx=\"12\" cy=\"8\" r=\"3.4\"/><path d=\"M5 20c.6-4 3.1-6 7-6s6.4 2 7 6\"/>", "dollar": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.4 0-2.4.7-2.4 1.8 0 2.7 5 1.2 5 4 0 1.1-1 1.9-2.6 1.9-1.2 0-2.2-.5-2.7-1.4M12 6.5v1.5M12 16v1.5\"/>", "cake": "<path d=\"M5 12h14v7.5H5zM4 12h16\"/><path d=\"M8 12V9.5M12 12V9.5M16 12V9.5M8 7.5v.01M12 7.5v.01M16 7.5v.01\"/>", "hourglass": "<path d=\"M7 4h10M7 20h10M8 4c0 4 4 4 4 8s-4 4-4 8M16 4c0 4-4 4-4 8s4 4 4 8\"/>", "calendar": "<rect x=\"3.5\" y=\"5\" width=\"17\" height=\"15.5\" rx=\"3\"/><path d=\"M8 3v4M16 3v4M3.5 10h17\"/>", "cog": "<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M19 13.5a7.8 7.8 0 0 0 0-3l2-1.2-2-3.4-2.2 1a8 8 0 0 0-2.5-1.5L14 3h-4l-.3 2.4a8 8 0 0 0-2.5 1.5L5 5.9l-2 3.4 2 1.2a7.8 7.8 0 0 0 0 3l-2 1.2 2 3.4 2.2-1a8 8 0 0 0 2.5 1.5L10 21h4l.3-2.4a8 8 0 0 0 2.5-1.5l2.2 1 2-3.4z\"/>", "reformer": "<rect x=\"2.5\" y=\"12\" width=\"19\" height=\"3.5\" rx=\"1.5\"/><rect x=\"4\" y=\"8.5\" width=\"6.5\" height=\"3.5\" rx=\"1.2\"/><path d=\"M13 12V9.5M16 12V9.5M19 12V9.5M5 15.5V19M19 15.5V19\"/>", "cadillac": "<path d=\"M4 20.5V4.5h16v16M4 4.5h16M4 9.5h16M7 20.5v-5h10v5M9 9.5v6M15 9.5v6\"/>", "chair": "<rect x=\"5\" y=\"10\" width=\"12\" height=\"6.5\" rx=\"1.5\"/><path d=\"M5 10V4h5.5v6M7 16.5v4M15 16.5v4M19.5 12.5v6h-3\"/>", "barrel": "<path d=\"M5 8c0-1.7 3.1-3 7-3s7 1.3 7 3v8c0 1.7-3.1 3-7 3s-7-1.3-7-3z\"/><path d=\"M5 8c0 1.7 3.1 3 7 3s7-1.3 7-3M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3\"/>", "ring": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><circle cx=\"12\" cy=\"12\" r=\"3.8\"/>", "cube": "<path d=\"m12 3-8 4.5v9L12 21l8-4.5v-9z\"/><path d=\"m4 7.5 8 4.5 8-4.5M12 12v9\"/>", "layers": "<path d=\"m12 3.5 9 5-9 5-9-5z\"/><path d=\"m3 13 9 5 9-5\"/>", "box": "<path d=\"M4 8.5 12 4l8 4.5v7L12 20l-8-4.5z\"/><path d=\"M12 12v8M4 8.5l8 4.5 8-4.5\"/>", "clock2": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 7.5V12l3 2\"/>", "x": "<path d=\"m6 6 12 12M18 6 6 18\"/>"};
function uiIcon(name,size=18){
  const d=UI_ICONS[name]||UI_ICONS.cube;
  return `<svg class="ui-i" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
}
function trashIcon(size=16){
  const n=Number(size)||16;
  return `<svg class="ios-trash-svg" width="${n}" height="${n}" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M9 7V4.8c0-.5.4-.8.9-.8h4.2c.5 0 .9.3.9.8V7M7.2 7l.7 12.1c.05.5.45.9.95.9h6.3c.5 0 .9-.4.95-.9L16.8 7M10 10.5v6M14 10.5v6"/></svg>`;
}
function waIcon(size=18){
  const n=Number(size)||18;
  return `<svg class="wa-svg" width="${n}" height="${n}" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.52 3.48A11.8 11.8 0 0 0 12.12 0C5.5 0 .12 5.38.12 12c0 2.11.55 4.17 1.6 5.98L.05 24l6.17-1.62A11.9 11.9 0 0 0 12.12 24h.01c6.62 0 12-5.38 12-12 0-3.2-1.25-6.21-3.61-8.52zM12.13 21.9c-1.87 0-3.7-.5-5.29-1.45l-.38-.23-3.66.96.98-3.56-.25-.39a9.85 9.85 0 1 1 8.6 4.67zm5.42-7.39c-.3-.15-1.77-.87-2.05-.97-.28-.1-.48-.15-.69.15-.2.3-.79.97-.97 1.17-.18.2-.36.22-.66.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.14-.14.3-.36.45-.54.15-.18.2-.3.3-.51.1-.2.05-.38-.03-.53-.08-.15-.69-1.66-.94-2.27-.25-.6-.5-.52-.69-.53h-.59c-.2 0-.53.08-.81.38-.28.3-1.06 1.03-1.06 2.5s1.09 2.9 1.24 3.1c.15.2 2.14 3.27 5.19 4.59.73.31 1.3.5 1.75.64.74.24 1.41.21 1.94.13.59-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.13-.28-.2-.58-.35z"/></svg>`;
}

function openWhatsApp(num, msg){
  const phone = whatsappNumber(num);
  if(!phone){ toast("Nenhum WhatsApp válido cadastrado."); return; }
  window.open("https://wa.me/" + phone + "?text=" + encodeURIComponent(msg||""), "_blank");
}

function replaceVars(text, student={}, extra={}){
  const values = {
    nome: student.name || "",
    valor: Number(extra.value ?? student.monthly ?? 0).toFixed(2).replace(".",","),
    vencimento: extra.due || student.due || "",
    plano: student.plan || "",
    horario: student.time || "",
    studio: db.settings.studioName || "",
    pix: db.settings.pixKey || "Não configurada",
    pix_tipo: db.settings.pixType || "PIX",
    pix_nome: db.settings.pixName || db.settings.owner || ""
  };
  return String(text || "").replace(/\{(\w+)\}/g, (_, k) => values[k] ?? "");
}

function toastTone(text){
  const t = String(text).toLowerCase();
  if(/^\u26A0|erro|falha|n[ãa]o foi poss[ií]vel|n[ãa]o p[ôo]de|inv[áa]lid|incompat[ií]vel/.test(t)) return "error";
  if(/^(informe|selecione|permita|escolha)|indispon|lotado|n[ãa]o [ée] permitido|n[ãa]o pode|j[áa] existe|n[ãa]o h[áa]|deve estar|n[ãa]o possui|n[ãa]o est[áa]/.test(t)) return "warn";
  if(/^nenhum/.test(t)) return "info";
  return "ok";
}

function toast(msg){
  clearTimeout(window.__changeNoticeTimer);
  window.__changeNoticeTimer = null;
  const el = document.getElementById("toast");
  if(!el) return;
  const raw = String(msg ?? "").trim();
  clearTimeout(window.toastTimer);
  // Nunca renderiza um toast vazio.
  if(!raw){
    el.classList.remove("show");
    el.textContent = "";
    el.removeAttribute("data-tone");
    return;
  }
  window.__lastToastAt = Date.now();
  const tone = toastTone(raw);
  // O ponto colorido já indica o tom; remove o emoji de alerta do início.
  el.textContent = raw.replace(/^(?:\u26A0\uFE0F?\s*)+/, "") || raw;
  el.setAttribute("data-tone", tone);
  el.setAttribute("aria-live", tone === "error" ? "assertive" : "polite");
  el.classList.add("show");
  const duration = (tone === "error" || tone === "warn") ? 4200 : 3000;
  window.toastTimer = setTimeout(() => {
    el.classList.remove("show");
    // Limpa o conteúdo só depois da transição de saída.
    setTimeout(() => {
      if(!el.classList.contains("show")){ el.textContent = ""; el.removeAttribute("data-tone"); }
    }, 280);
  }, duration);
}

document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();focusGlobalSearch();return;}
  if(e.key==='/' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){e.preventDefault();focusGlobalSearch();return;}
  if(e.key==='Escape'){closeTransientUI();}
});

/* NAVEGAÇÃO & INTERFACE */
document.querySelectorAll(".nav button").forEach(btn => {
  btn.addEventListener("click", () => {
    goPage(btn.dataset.page);
    document.getElementById("sidebar").classList.remove("open");
  });
});

function filterMenus(term){
  const q=String(term||'').trim().toLowerCase();
  let visible=0;
  document.querySelectorAll('.nav button[data-page]').forEach(btn=>{
    const show=!q || btn.textContent.toLowerCase().includes(q);
    btn.style.display=show?'flex':'none';
    if(show)visible++;
  });
  document.querySelectorAll('.nav .nav-group-label').forEach(l=>{l.style.display=q?'none':'';});
  const empty=document.getElementById('navEmpty');
  if(empty)empty.style.display=visible?'none':'block';
}

function updateMenuBadges(){
  const set=(id,n)=>{const e=document.getElementById(id);if(e)e.textContent=n>99?'99+':String(Math.max(0,Number(n)||0));};
  set('navBillingBadge',Array.isArray(db.finance)?db.finance.filter(f=>f.status==='Pendente' && f.type!=='Despesa').length:0);
  const now=new Date(), md=String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
  const birthdays=Array.isArray(db.students)?db.students.filter(s=>{
    if(s.status && s.status!=='Ativo') return false;
    const raw=String(s.birth||s.birthDate||s.birthday||'');
    return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw.slice(5)===md : raw.slice(-5)===md;
  }).length:0;
  set('navBirthdayBadge',birthdays);
  set('navWaitlistBadge',Array.isArray(db.waitlist)?db.waitlist.filter(x=>x.status!=='Atendido' && x.status!=='Cancelado').length:0);
  set('navEquipmentBadge',Array.isArray(db.equipment)?db.equipment.filter(x=>x.active!==false).length:0);
  if(typeof getStudioAlerts==='function')set('navAlertsBadge',getStudioAlerts().filter(a=>!a.dismissed).length);
  document.querySelectorAll('.nav-badge').forEach(b=>b.classList.toggle('is-zero',String(b.textContent).trim()==='0'));
}

function goPage(page){
  const previousPage=window.currentPage || document.querySelector('.page.active')?.id?.replace('page-','') || '';
  if(previousPage===page){ document.getElementById('sidebar')?.classList.remove('open'); return; }
  const applyPage=()=>{
    window.currentPage=page;
    // Ao retornar para Configurações vindo de outra janela, sempre inicia em
    // Empresa & PIX. A subaba anterior não deve permanecer aberta entre janelas.
    if(page==='settings' && previousPage!=='settings'){
      const target=window.__settingsTarget||'general'; window.__settingsTarget=null;
      document.querySelectorAll('[data-settings]').forEach(x=>x.classList.remove('active'));
      document.querySelectorAll('.settings-section').forEach(x=>x.classList.remove('active'));
      document.querySelector(`[data-settings="${target}"]`)?.classList.add('active');
      document.querySelector(`#settings-${target}`)?.classList.add('active');
    }
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    const nextPage=document.querySelector("#page-" + page);
    if(nextPage) nextPage.classList.add("active");
    document.querySelectorAll(".nav button").forEach(b => b.classList.toggle("active", b.dataset.page === page));

    const titles = {
    dashboard:"Painel Principal", students:"Alunos", agenda:"Agenda", hours:"Horários",
    occupancy:"Ocupação", finance:"Financeiro", billing:"Cobranças", makeups:"Reposições",
    birthdays:"Aniversários", waitlist:"Lista de Espera", reports:"Relatórios", teacher:"Painel da Professora", teachers:"Gestão de Professores", alerts:"Alertas", equipment:"Equipamentos",evolution:"Evolução", settings:"Configurações"
  };
    document.getElementById("topTitle").textContent = titles[page] || "Painel";
    renderCurrentPage(page);
    updateMenuBadges();
    if(page==="dashboard" || page==="occupancy" || page==="settings") setTimeout(()=>refreshAdvancedPanels(false),0);
  };
  document.getElementById('sidebar')?.classList.remove('open');
  if(document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && document.documentElement.dataset.reduceEffects!=='1'){
    document.startViewTransition(applyPage);
  }else{
    requestAnimationFrame(applyPage);
  }
}

document.addEventListener("keydown", (e) => {
  if(e.key === "Escape" && document.getElementById("modalBackdrop")?.classList.contains("show")){
    e.preventDefault();
    closeModal();
  }
});

function toggleSidebar(){ document.getElementById("sidebar").classList.toggle("open"); }

function goSettings(sec){
  window.__settingsTarget=sec;
  setTimeout(()=>{window.__settingsTarget=null;},600);
  goPage("settings");
  document.querySelectorAll("[data-settings]").forEach(x => x.classList.remove("active"));
  document.querySelectorAll(".settings-section").forEach(x => x.classList.remove("active"));
  document.querySelector(`[data-settings="${sec}"]`)?.classList.add("active");
  document.querySelector(`#settings-${sec}`)?.classList.add("active");
}

function openModal(title, body, onSave){
  const backdrop = document.getElementById("modalBackdrop");
  const modalBody = document.getElementById("modalBody");
  document.getElementById("modalTitle").textContent = title;
  modalBody.innerHTML = body;
  modalBody.scrollTop = 0;
  backdrop.classList.add("show");
  document.documentElement.classList.add("modal-open");
  document.body.classList.add("modal-open");
  document.getElementById("modalSave").onclick = onSave || closeModal;
  requestAnimationFrame(() => {
    modalBody.scrollTop = 0;
    const first = modalBody.querySelector("input,select,textarea,button");
    if(first && first.autofocus) first.focus({preventScroll:true});
  });
}

function closeModal(){
  document.getElementById("modalBackdrop").classList.remove("show");
  document.documentElement.classList.remove("modal-open");
  document.body.classList.remove("modal-open");
  editingId = null;
}

/* MODAL DE AÇÕES RÁPIDAS */
function openQuickActions(){
  const item=(icon,title,sub,fn,tone='')=>`<button type="button" class="quick-action ${tone}" onclick="closeModal();${fn}"><span class="quick-action-ico">${uiIcon(icon,22)}</span><span class="quick-action-txt"><strong>${title}</strong><small>${sub}</small></span></button>`;
  const body = `
    <div class="quick-actions-grid">
      ${item('userplus','Cadastrar aluno','Novo cadastro completo','openStudentModal()','tone-violet')}
      ${item('calplus','Agendar aula','Escolher aluno, dia e horário','openClassModal()','tone-blue')}
      ${item('cash','Lançar receita / cobrança','Registrar entrada no financeiro','openFinanceModal()','tone-green')}
      <button type="button" class="quick-action tone-wa" onclick="closeModal();openBatchWhatsAppModal()"><span class="quick-action-ico">${waIcon(22)}</span><span class="quick-action-txt"><strong>WhatsApp em lote</strong><small>Cobranças pendentes</small></span></button>
      ${item('refresh','Gerar mensalidades','Cobranças do mês atual','generateCharges()','tone-amber')}
      ${item('calendar','Gerar aulas recorrentes','Aulas fixas do mês','generateRecurringClasses()','tone-blue')}
      ${item('hourglass','Lista de espera','Adicionar novo contato','openWaitModal()','tone-violet')}
    </div>
  `;
  openModal("Ações rápidas", body, null);
}

/* WHATSAPP EM LOTE / COBRANÇA */
function openBatchWhatsAppModal(){
  const pending = db.finance.filter(f => f.status === "Pendente");
  if(pending.length === 0){
    toast("Nenhuma cobrança pendente para envio.");
    return;
  }

  let rows = pending.map(f => {
    const s = db.students.find(x => x.id === f.studentId) || { name: f.studentName, whatsapp: f.whatsapp };
    const msg = replaceVars(db.settings.messages.billing, s, { value: f.value, due: f.dueDate });
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px;border-bottom:1px solid var(--line)">
        <div>
          <strong>${esc(f.studentName)}</strong>
          <div class="muted" style="font-size:11px">${money(f.value)} • Vence: ${f.dueDate}</div>
        </div>
        <button class="btn whatsapp small" onclick="openWhatsApp('${esc(s.whatsapp||'')}', \`${esc(msg)}\`)"><span class="wa-inline">${waIcon(16)}<span>Enviar</span></span></button>
      </div>
    `;
  }).join("");

  openModal("Envio de Cobranças via WhatsApp", `<div style="max-height:400px;overflow:auto">${rows}</div>`, closeModal);
}

/* V65 — PAINEL UNIFICADO: aluno + dia + horário + equipamento + status */
window.controlEquipmentDate=window.controlEquipmentDate||todayISO();
window.controlEquipmentTicker=window.controlEquipmentTicker||null;
function controlEquipmentWeekDates(anchor){
  const d=new Date(`${anchor}T12:00:00`); const day=(d.getDay()+6)%7; d.setDate(d.getDate()-day);
  return Array.from({length:7},(_,i)=>{const x=new Date(d);x.setDate(d.getDate()+i);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;});
}
function controlEquipmentSlots(date){
  ensureEquipmentData(); ensureV7Data(); normalizeAllStudentDays();
  const rows=db.classes.filter(c=>c.date===date&&c.status!=='Cancelada').map(c=>({c,s:studentById(c.studentId),eq:c.equipmentId?equipmentById(c.equipmentId):null}));
  return rows.sort((a,b)=>(timeToMinutes(a.c.time)||0)-(timeToMinutes(b.c.time)||0));
}
function selectControlEquipmentDay(date){window.controlEquipmentDate=date;renderControlEquipment();}
function renderControlEquipment(){
  const daysEl=document.getElementById('controlEquipmentDays'),root=document.getElementById('dashboardEquipmentSchedule'),summary=document.getElementById('controlEquipmentSummary');
  if(!root)return; ensureEquipmentData(); ensureV7Data(); normalizeAllStudentDays();
  const date=window.controlEquipmentDate||todayISO(), today=todayISO();
  const days=controlEquipmentWeekDates(date); const names=['SEG','TER','QUA','QUI','SEX','SÁB','DOM'];
  if(daysEl) daysEl.innerHTML=days.map(d=>{const x=new Date(`${d}T12:00:00`),rows=controlEquipmentSlots(d),pending=rows.filter(r=>!r.eq).length;return `<button type="button" class="control-equipment-day ${d===date?'is-selected':''} ${d===today?'is-today':''}" aria-pressed="${d===date}" onclick="selectControlEquipmentDay('${d}')"><b>${names[(x.getDay()+6)%7]}</b><strong>${String(x.getDate()).padStart(2,'0')}</strong><small>${x.toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</small><em>${rows.length?rows.length+' aula'+(rows.length===1?'':'s'):'Sem aulas'}${pending?' · '+pending+' pend.':''}</em></button>`}).join('');
  const filter=document.getElementById('controlEquipmentFilter')?.value||'all', search=String(document.getElementById('controlEquipmentSearch')?.value||'').trim().toLowerCase();
  let rows=controlEquipmentSlots(date); const matches=r=>{const name=String(r.s?.name||r.c.studentName||'').toLowerCase(), eq=String(r.eq?.name||'').toLowerCase(); if(search&&!name.includes(search)&&!eq.includes(search))return false; if(filter==='scheduled'&&r.c.status!=='Agendada')return false; if(filter==='pending'&&r.eq)return false; if(filter==='done'&&r.c.status!=='Realizada')return false; return true;}; rows=rows.filter(matches);
  const allToday=controlEquipmentSlots(date), assigned=allToday.filter(r=>r.eq).length,pending=allToday.length-assigned,done=allToday.filter(r=>r.c.status==='Realizada').length,capacity=Number(db.settings.capacity||0),usedSlots=new Set(allToday.map(r=>r.c.time)).size,pct=allToday.length?Math.round(assigned/allToday.length*100):0;
  if(summary)summary.innerHTML=`<div><b>${allToday.length}</b><span>Aulas</span></div><div><b>${new Set(allToday.map(r=>r.s?.id||r.c.studentId)).size}</b><span>Alunos</span></div><div><b>${usedSlots}</b><span>Horários</span></div><div class="${pending?'attention':''}"><b>${pending}</b><span>Sem aparelho</span></div><div><b>${done}/${allToday.length||0}</b><span>Realizadas</span></div>`;
  const grouped=new Map(); rows.forEach(r=>{const t=r.c.time||'—';if(!grouped.has(t))grouped.set(t,[]);grouped.get(t).push(r);});
  const selectedLabel=new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'});
  if(!rows.length){root.innerHTML=`<div class="control-equipment-empty">Nenhuma aula encontrada para <strong>${esc(selectedLabel)}</strong> com os filtros atuais.</div>`;return;}
  root.innerHTML=[...grouped.entries()].map(([time,items])=>{const cap=slotCapacity(date,time), p=cap.capacity?Math.min(100,Math.round(cap.used/cap.capacity*100)):0;return `<div class="control-equipment-time"><div class="control-equipment-time-head"><div><strong>${esc(formatTimeRange(time))}</strong><small> · ${items.length} aluno${items.length===1?'':'s'} · ocupação ${cap.capacity?cap.used+'/'+cap.capacity:'—'}</small></div><span class="badge ${cap.full?'bad':cap.percent>=80?'warning':'info'}">${cap.capacity?cap.used+'/'+cap.capacity:'Sem capacidade'}</span></div><div class="control-equipment-time-body">${items.map(r=>{const s=r.s,eq=r.eq,c=r.c, initials=String(s?.name||c.studentName||'?').trim().charAt(0).toUpperCase(),state=c.status==='Realizada'?'Realizada':eq?'Programada':'Aparelho pendente';const stateClass=c.status==='Realizada'?'ok':eq?'info':'warn';const hist=previousEquipmentForStudent(c.studentId,c.date,c.time,c.id),last=hist?.equipmentId?equipmentById(hist.equipmentId):null;return `<div class="control-equipment-row"><div class="control-equipment-student"><span class="control-equipment-avatar">${esc(initials)}</span><div><strong>${esc(s?.name||c.studentName||'Aluno')}</strong><small>${esc(c.teacher||s?.teacher||'Professor não definido')} · ${esc(s?.plan||'')}</small></div></div><div class="control-equipment-cell"><small>Último</small><strong>${esc(last?.name||'—')}</strong><small>${last?'Rodízio automático':'Sem histórico'}</small></div><div class="control-equipment-cell"><small>Equipamento da aula</small><div class="eq-inline">${eq?equipmentIconSVG(eq,34):'<span style="font-size:20px">⚠️</span>'}<strong>${esc(eq?.name||'Definir aparelho')}</strong></div></div><div class="control-equipment-cell"><small>Status</small><span class="badge ${stateClass}">${state}</span><div class="control-equipment-progress"><i style="width:${eq?100:0}%"></i></div></div><div class="control-equipment-action"><button class="btn small ${eq?'':'primary'}" type="button" onclick="openClassModal(null,'${esc(c.studentId||'')}','${esc(c.id||'')}')">${eq?'Editar':'Definir'}</button></div></div>`;}).join('')}</div></div>`;}).join('');
  const note=document.getElementById('controlEquipmentRefreshNote');if(note)note.textContent=`Atualizado ${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})} · sincronizado com a agenda`;
  const count=document.getElementById('dashboardEquipmentCount');if(count)count.textContent=`${allToday.length} ${allToday.length===1?'aula':'aulas'}`;
}
function refreshControlEquipment(force=false){
  window.controlEquipmentDate=window.controlEquipmentDate||todayISO();
  renderControlEquipment();
  if(force)toast('Controle de equipamentos atualizado.');
}
function startControlEquipmentLive(){
}
startControlEquipmentLive();

/* V47 — PAINEL OPERACIONAL DE EQUIPAMENTOS */
function dashboardEquipmentStatus(c){
  if(c.status==='Cancelada') return '<span class="badge gray">Cancelada</span>';
  const now=new Date(), today=todayISO();
  if(c.date!==today) return `<span class="badge info">${esc(c.status||'Agendada')}</span>`;
  const start=timeToMinutes(c.time), current=now.getHours()*60+now.getMinutes();
  const duration=Math.max(1,Number(c.duration||db.settings.duration||60));
  if(start!=null && current>=start && current<start+duration) return '<span class="badge ok">Agora</span>';
  if(start!=null && current<start) return '<span class="badge info">Próxima</span>';
  return `<span class="badge gray">${esc(c.status||'Realizada')}</span>`;
}
function renderDashboardEquipmentSchedule(){
  const wrap=document.getElementById('dashboardEquipmentSchedule');
  const countEl=document.getElementById('dashboardEquipmentCount');
  if(!wrap)return;
  ensureEquipmentData();
  const today=todayISO();
  const now=new Date();
  const current=now.getHours()*60+now.getMinutes();
  const rows=db.classes.filter(c=>c.date===today && c.status!=='Cancelada').sort((a,b)=>(timeToMinutes(a.time)||0)-(timeToMinutes(b.time)||0));
  const upcoming=rows.filter(c=>{
    const start=timeToMinutes(c.time);
    const duration=Math.max(1,Number(c.duration||db.settings.duration||60));
    return start==null || start+duration>=current;
  });
  if(countEl)countEl.textContent=`${upcoming.length} ${upcoming.length===1?'aula':'aulas'}`;
  if(!upcoming.length){
    wrap.innerHTML=`<div class="empty">Nenhuma aula restante para hoje. O painel será atualizado automaticamente quando a agenda mudar.</div>`;
    return;
  }
  wrap.innerHTML=`<div class="dashboard-equipment-list">${upcoming.map(c=>{
    const s=studentById(c.studentId);
    const eq=c.equipmentId?equipmentById(c.equipmentId):null;
    const eqLabel=eq?eq.name:'Equipamento a definir';
    const missing=!eq;
    const statusHtml=dashboardEquipmentStatus(c);
    return `<div class="dashboard-equipment-row ${statusHtml.includes('Agora')?'is-now':''}">
      <div class="dashboard-equipment-time"><span class="dashboard-equipment-label">Horário</span>${esc(formatTimeRange(c.time))}</div>
      <div class="dashboard-equipment-person"><span class="dashboard-equipment-label">Aluno</span><strong>${esc(s?.name||c.studentName||'Aluno não identificado')}</strong></div>
      <div class="dashboard-equipment-eq"><span class="dashboard-equipment-label">Equipamento</span><strong>${missing?'⚠️ ': '🧘 '}${esc(eqLabel)}</strong></div>
      <div class="dashboard-equipment-teacher"><span class="dashboard-equipment-label">Professor</span><strong>${esc(c.teacher||s?.teacher||'—')}</strong></div>
      <div class="dashboard-equipment-status">${statusHtml}</div>
    </div>`;
  }).join('')}</div>`;
}

/* RENDERS & DASHBOARD DINÂMICO */
function renderDashboard(){
  syncDeviceDateTime();
  // Saudação Dinâmica
  const hr = new Date().getHours();
  const greeting = hr < 12 ? "Bom dia" : hr < 18 ? "Boa tarde" : "Boa noite";
  document.getElementById("heroGreeting").textContent = db.settings.dashboardGreeting || `${greeting}, ${db.settings.owner || "Louise Karla"}!`;
  document.getElementById("heroSub").textContent = `Painel de controle do ${db.settings.studioName}.`;
  applyDashboardHero();

  // Métricas KPI
  const activeStudents = db.students.filter(s => s.status === "Ativo");
  document.getElementById("kpiStudents").textContent = activeStudents.length;

  const currentMonthStr = todayISO().slice(0,7);
  const monthFinance = db.finance.filter(f => f.dueDate && f.dueDate.startsWith(currentMonthStr));
  const monthIncome = monthFinance.filter(f => f.type !== "Despesa");
  
  const totalRev = monthIncome.reduce((acc, f) => acc + Number(f.value||0), 0);
  const totalRec = monthIncome.filter(f => f.status === "Pago").reduce((acc, f) => acc + Number(f.value||0), 0);
  
  document.getElementById("kpiRevenue").textContent = money(totalRev);
  document.getElementById("kpiReceived").textContent = money(totalRec);

  // Taxa de ocupação semanal da grade (mesmo cálculo da tela Ocupação)
  const occK = occupancyStats(), occEl = document.getElementById("kpiOccupancy");
  if(occEl){
    occEl.textContent = occK.pct.toFixed(0) + "%";
    const occFoot = occEl.parentElement && occEl.parentElement.querySelector(".kpi-foot");
    if(occFoot) occFoot.textContent = occK.capacity ? occK.used + " de " + occK.capacity + " vagas na semana" : "Configure horários e capacidade";
  }

  // Alertas Rápidos no Painel
  const alertsDiv = document.getElementById("dashboardAlerts");
  const pendingFinance = db.finance.filter(f => f.status === "Pendente");
  
  let alertHtml = "";
  if(pendingFinance.length > 0){
    alertHtml += `
      <div style="background:var(--surface-2);border:1px solid var(--warn);padding:12px 16px;border-radius:14px;display:flex;align-items:center;justify-content:space-between;gap:10px">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:20px">⚠️</span>
          <div><strong>${pendingFinance.length} mensalidades pendentes</strong> este mês.</div>
        </div>
        <button class="btn whatsapp small" onclick="openBatchWhatsAppModal()"><span class="wa-inline">${waIcon(17)}<span>Enviar Cobranças</span></span></button>
      </div>
    `;
  }
  alertsDiv.innerHTML = alertHtml;
  window.controlEquipmentDate=window.controlEquipmentDate||todayISO();
  renderControlEquipment();

  // O painel de equipamentos já exibe horário, aluno, professor e equipamento.
  // Aqui mostramos apenas exceções, evitando repetir a mesma agenda em dois cards.
  const today = todayISO();
  const dashClassesDiv = document.getElementById("dashboardClasses");
  if(dashClassesDiv){
    const pendingEquipment=db.classes.filter(c=>c.date===today&&c.status!=='Cancelada'&&!c.equipmentId)
      .sort((a,b)=>(timeToMinutes(a.time)||0)-(timeToMinutes(b.time)||0));
    dashClassesDiv.innerHTML=pendingEquipment.length
      ? pendingEquipment.map(c=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:10px;border-bottom:1px solid var(--line);gap:10px"><div><strong>${esc(c.time||'—')}</strong> — ${esc(c.studentName||studentById(c.studentId)?.name||'Aluno')}</div><span class="badge warning">⚠️ Equipamento a definir</span></div>`).join('')
      : `<div class="empty">Nenhuma aula de hoje está sem equipamento definido. A agenda completa está no painel acima.</div>`;
  }

  // Cobranças Pendentes no Painel
  const dashBillingDiv = document.getElementById("dashboardBilling");
  if(pendingFinance.length === 0){
    dashBillingDiv.innerHTML = `<div class="empty">Todas as mensalidades do mês estão pagas! 🎉</div>`;
  } else {
    dashBillingDiv.innerHTML = pendingFinance.slice(0, 5).map(f => {
      const s = db.students.find(x => x.id === f.studentId) || { name: f.studentName, whatsapp: f.whatsapp };
      const msg = replaceVars(db.settings.messages.billing, s, { value: f.value, due: f.dueDate });
      return `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px;border-bottom:1px solid var(--line)">
          <div>
            <strong>${esc(f.studentName)}</strong>
            <div class="muted" style="font-size:11px">${money(f.value)} • Vence: ${f.dueDate}</div>
          </div>
          <button class="btn whatsapp small" onclick="openWhatsApp('${esc(s.whatsapp||'')}', \`${esc(msg)}\`)"><span class="wa-inline">${waIcon(16)}<span>Cobrar</span></span></button>
        </div>
      `;
    }).join("");
  }

  renderCharts();
}

/* RENDERS DE OUTRAS ABAS (Mantendo compatibilidade) */
async function deleteStudent(id){
  const student = db.students.find(s => s.id === id);
  if(!student) return;
  const name = String(student.name || "este aluno");
  const confirmed = await iosConfirm(`Deseja realmente excluir o aluno “${name}”?\n\nO cadastro do aluno será removido. Registros financeiros e histórico já existentes serão preservados. As aulas futuras e reposições pendentes deste aluno serão removidas da agenda.`, {title:'Excluir aluno', okLabel:'Excluir', danger:true});
  if(!confirmed) return;
  const previousStudents = db.students.slice();
  db.students = db.students.filter(s => s.id !== id);
  if(!saveStudentVault(db.students) || !saveDB()){
    db.students = previousStudents;
    saveStudentVault(previousStudents);
    renderStudents();
    toast("Não foi possível excluir o aluno. Os dados foram preservados.");
    return;
  }
  renderAll();
  toast("Aluno excluído com sucesso.");
}

/* ALUNOS - SALVAR */
function openStudentModal(id=null){
  editingId = id;
  const s = db.students.find(x => x.id === id) || {};

  const planOptions = db.plans.map(p => `<option value="${esc(p.name)}" ${s.plan===p.name?"selected":""}>${esc(p.name)} — ${money(p.price)}</option>`).join("");
  const teacherOptions = db.teachers.map(t => `<option ${s.teacher===t?"selected":""}>${esc(t)}</option>`).join("");
  const hourOptions = db.hours.map(h => `<option ${s.time===h?"selected":""}>${h}</option>`).join("");

  const body = `
    <div class="form-grid">
      <div class="field full"><label>Nome Completo *</label><input id="fName" required autocomplete="name" value="${esc(s.name)}"></div>
      <div class="field"><label><span class="wa-label">${waIcon(14)} WhatsApp</span></label><input id="fWhatsapp" inputmode="tel" autocomplete="tel" placeholder="(81) 99999-9999" value="${esc(s.whatsapp)}"></div>
      <div class="field"><label>Data de Nascimento</label><input id="fBirth" type="date" value="${esc(s.birth)}"></div>
      <div class="field"><label>Data de Início</label><input id="fStart" type="date" value="${esc(s.startDate||"")}"></div>
      <div class="field"><label>Objetivo do Aluno</label><input id="fGoal" value="${esc(s.goal||"")}" placeholder="Ex.: fortalecimento, postura, reabilitação"></div>
      <div class="field full"><label>Plano</label><select id="fPlan"><option value="">Selecione</option>${planOptions}</select><div id="fPlanPrice" class="muted student-plan-price" aria-live="polite">${s.plan && db.plans.find(p=>p.name===s.plan) ? 'Mensalidade: ' + money(db.plans.find(p=>p.name===s.plan).price) : 'O valor da mensalidade é definido pelo plano.'}</div></div>
      <div class="field"><label>Dia de Vencimento</label><input id="fDue" type="number" min="1" max="31" value="${s.due??10}"></div>
      <div class="field"><label>Professor Responsável</label><select id="fTeacher"><option value="">Selecione</option>${teacherOptions}</select></div>
      <div class="field"><label>Horário Principal</label><select id="fTime"><option value="">Selecione</option>${hourOptions}</select></div>
      <div class="field full"><label>Dias da Semana <span class="required-mark">*</span></label><div class="student-days-picker" role="group" aria-label="Selecione os dias da semana em que o aluno irá frequentar as aulas">${[['1','SEG','Segunda'],['2','TER','Terça'],['3','QUA','Quarta'],['4','QUI','Quinta'],['5','SEX','Sexta'],['6','SÁB','Sábado'],['0','DOM','Domingo']].map(([v,l,a])=>`<label class="ios-day-chip"><input type="checkbox" class="fDay" value="${v}" ${normalizeStudentDays(s.days).includes(v)?'checked':''} aria-label="${a}"><span class="ios-day-check" aria-hidden="true">✓</span><span class="ios-day-label">${l}</span></label>`).join('')}</div><small class="muted" style="display:block;margin-top:7px">Selecione um ou mais dias em que o aluno irá frequentar as aulas.</small></div>
      <div class="field"><label>Status</label>
        <select id="fStatus">
          <option ${s.status==="Ativo"?"selected":""}>Ativo</option>
          <option ${s.status==="Inativo"?"selected":""}>Inativo</option>
          <option ${s.status==="Trancado"?"selected":""}>Trancado</option>
        </select>
      </div>
      <div class="field full"><label>Observações / Histórico de Saúde</label><textarea id="fNotes">${esc(s.notes)}</textarea></div>
    </div>
  `;
  openModal(id ? "Editar Aluno" : "Cadastrar Novo Aluno", body, saveStudent);
  const studentSaveButton=document.getElementById("modalSave");
  if(studentSaveButton){
    studentSaveButton.innerHTML = '<span class="ios-save-icon" aria-hidden="true">✓</span> ' + (id ? 'Salvar alterações' : 'Salvar aluno');
    studentSaveButton.setAttribute('aria-label', id ? 'Salvar alterações do aluno' : 'Salvar aluno');
  }
  const planSelect=document.getElementById("fPlan");
  const planPrice=document.getElementById("fPlanPrice");
  if(planSelect && planPrice){
    const updatePlanPrice=()=>{
      const selected=db.plans.find(p=>String(p?.name||"")===String(planSelect.value||""));
      planPrice.textContent=selected ? `Mensalidade definida pelo plano: ${money(selected.price)}` : "O valor da mensalidade é definido pelo plano.";
    };
    planSelect.addEventListener("change",updatePlanPrice);
    updatePlanPrice();
  }
}

function saveStudent(){
  const get = id => document.getElementById(id);
  const value = id => String(get(id)?.value ?? "").trim();
  try{
    if(!window.db || !Array.isArray(db.students)) db.students = [];
    if(!Array.isArray(db.plans)) db.plans = [];
    if(!Array.isArray(db.teachers)) db.teachers = [];
    if(!Array.isArray(db.hours)) db.hours = [];

    // Recupera imediatamente os alunos já persistidos antes de adicionar outro.
    // Isso evita que uma instância parcial do banco substitua cadastros anteriores.
    const persistedStudents=loadStudentVault();
    db.students=mergeStudentRecords(db.students,persistedStudents);

    const name=value("fName");
    if(!name){get("fName")?.focus();toast("Informe o nome completo do aluno.");return false;}
    const currentId=editingId||null;
    const existing=currentId?db.students.find(x=>x.id===currentId):null;
    const planName=value("fPlan");
    const selectedPlan=db.plans.find(p=>String(p?.name||"")===planName);
    const monthly=Number(selectedPlan?.price||0);
    if(!planName || !selectedPlan){get("fPlan")?.focus();toast("Selecione um plano para definir a mensalidade.");return false;}
    if(!Number.isFinite(monthly)||monthly<0){get("fPlan")?.focus();toast("O plano selecionado não possui um valor de mensalidade válido.");return false;}
    const selectedDays=normalizeStudentDays(Array.from(document.querySelectorAll("#modalBody .fDay:checked")).map(x=>x.value));
    if(!selectedDays.length){document.querySelector("#modalBody .fDay")?.focus();toast("Selecione pelo menos um dia da semana.");return false;}
    const dueRaw=value("fDue");
    const due=dueRaw===""?10:Number(dueRaw);
    if(!Number.isInteger(due)||due<1||due>31){get("fDue")?.focus();toast("O vencimento deve estar entre 1 e 31.");return false;}
    const birth=value("fBirth"), startDate=value("fStart");
    if(birth&&startDate&&startDate<birth){get("fStart")?.focus();toast("A data de início não pode ser anterior ao nascimento.");return false;}

    const student={
      id:currentId||uid("stu"),name,whatsapp:value("fWhatsapp"),
      email:existing?.email||"",birth,startDate,
      goal:value("fGoal"),address:existing?.address||"",emergency:existing?.emergency||"",plan:planName,
      monthly,due,teacher:value("fTeacher"),time:value("fTime"),
      days:selectedDays,
      status:value("fStatus")||"Ativo",notes:String(get("fNotes")?.value??""),
      clinical:existing?.clinical||{}, evolution:Array.isArray(existing?.evolution)?existing.evolution:[],
      createdAt:existing?.createdAt||new Date().toISOString(),
      updatedAt:new Date().toISOString()
    };

    if(currentId){
      const idx=db.students.findIndex(x=>x.id===currentId);
      if(idx===-1){toast("Não foi possível localizar o aluno para edição.");return false;}
      db.students[idx]=student;
    }else{
      // Novo cadastro: nunca substitui os existentes; sempre acrescenta.
      db.students.push(student);
    }

    const studentsSnapshot=mergeStudentRecords([],db.students);
    if(!saveStudentVault(studentsSnapshot)){
      toast("Não foi possível salvar o cadastro dos alunos. Verifique o armazenamento do navegador.");
      return false;
    }

    if(!saveDB()){
      // Mantém o cadastro no cofre redundante, mas sinaliza a falha do banco principal.
      toast("Aluno salvo na proteção local, mas houve falha no banco principal. Reabra o sistema para sincronizar.");
      return false;
    }

    db.students=studentsSnapshot;
    try{renderAll();}catch(renderError){console.error("Aluno salvo, mas houve erro ao atualizar a interface:",renderError);}
    closeModal();
    toast(currentId?"Aluno atualizado com sucesso!":"Aluno cadastrado com sucesso!");
    return true;
  }catch(error){
    console.error("Erro ao salvar aluno:",error);
    toast("Ocorreu um erro ao salvar o aluno. Os dados permanecem no formulário.");
    return false;
  }
}

/* CONFIGURAÇÕES DE EMPRESA & PIX */
function loadGeneralSettingsInputs(){
  const set = db.settings;
  document.getElementById("setStudioName").value = set.studioName || "";
  document.getElementById("setOwner").value = set.owner || "";
  document.getElementById("setWhatsapp").value = set.whatsapp || "";
  document.getElementById("setInstagram").value = set.instagram || "";
  document.getElementById("setEmail").value = set.email || "";
  document.getElementById("setAddress").value = set.address || "";
  document.getElementById("setCapacity").value = set.capacity || 4;
  document.getElementById("setDuration").value = set.duration || 60;
  
  document.getElementById("setPixType").value = set.pixType || "CPF/CNPJ";
  document.getElementById("setPixKey").value = set.pixKey || "";
  document.getElementById("setPixName").value = set.pixName || "";

  const logoPreview = document.getElementById("logoPreview");
  const brandLogo = document.getElementById("brandLogo");
  if(logoPreview){
    logoPreview.innerHTML = set.logo
      ? `<img src="${set.logo}" alt="Logo">`
      : "Sem logo";
  }
  if(brandLogo){
    brandLogo.innerHTML = set.logo
      ? `<img src="${set.logo}" alt="Logo">`
      : "LK";
  }

  document.getElementById("msgBilling").value = set.messages.billing || "";
  document.getElementById("msgReminder").value = set.messages.reminder || "";
  document.getElementById("msgWelcome").value = set.messages.welcome || "";
  document.getElementById("msgBirthday").value = set.messages.birthday || "";
  document.getElementById("msgClass").value = set.messages.class || "";
}

function saveGeneralSettings(){
  db.settings.studioName = document.getElementById("setStudioName").value.trim();
  db.settings.owner = document.getElementById("setOwner").value.trim();
  db.settings.whatsapp = document.getElementById("setWhatsapp").value.trim();
  db.settings.instagram = document.getElementById("setInstagram").value.trim();
  db.settings.email = document.getElementById("setEmail").value.trim();
  db.settings.address = document.getElementById("setAddress").value.trim();
  db.settings.capacity = Number(document.getElementById("setCapacity").value || 4);
  db.settings.duration = Number(document.getElementById("setDuration").value || 60);

  db.settings.pixType = document.getElementById("setPixType").value;
  db.settings.pixKey = document.getElementById("setPixKey").value.trim();
  db.settings.pixName = document.getElementById("setPixName").value.trim();

  saveDB();
  renderAll();
  toast("Configurações do Studio atualizadas!");
}

function uploadDashboardHero(event){
  const file=event?.target?.files?.[0];
  if(!file) return;
  if(!file.type.startsWith('image/')){toast('Selecione um arquivo de imagem válido.');return;}
  if(file.size>3*1024*1024){toast('Escolha uma imagem de até 3 MB.');return;}
  const reader=new FileReader();
  reader.onerror=()=>toast('Não foi possível ler a imagem. Tente novamente.');
  reader.onload=()=>{
    const dataUrl=String(reader.result||'');
    const probe=new Image();
    probe.onload=()=>{
      db.settings.dashboardHeroImage=dataUrl;
      saveDB();
      renderDashboard();
      requestAnimationFrame(()=>{
        applyDashboardHero();
        loadDashboardAppearance();
      });
      toast('Imagem carregada e aplicada ao painel.');
    };
    probe.onerror=()=>toast('A imagem foi selecionada, mas não pôde ser carregada.');
    probe.src=dataUrl;
  };
  reader.readAsDataURL(file);
}
function removeDashboardHeroImage(){
  db.settings.dashboardHeroImage='';
  const input=document.getElementById('dashboardHeroImageInput');if(input)input.value='';
  saveDB();renderDashboard();loadDashboardAppearance();toast('Imagem removida. O fundo padrão do sistema foi restaurado.');
}
function applyDashboardHero(){
  const hero=document.querySelector('#page-dashboard .hero');if(!hero)return;
  const image=String(db.settings.dashboardHeroImage||'');
  const stored=db.settings.dashboardGradient||'tema';
  const gradients={
    violeta:'linear-gradient(135deg,#241047 0%,#4c1d95 55%,#7c3aed 100%)',
    rose:'linear-gradient(135deg,#3b102b 0%,#9d174d 55%,#ec4899 100%)',
    oceano:'linear-gradient(135deg,#06202b 0%,#075985 55%,#0891b2 100%)',
    menta:'linear-gradient(135deg,#06352d 0%,#047857 55%,#10b981 100%)',
    dourado:'linear-gradient(135deg,#3b2305 0%,#a16207 55%,#f59e0b 100%)',
    grafite:'linear-gradient(135deg,#111827 0%,#334155 55%,#64748b 100%)'
  };
  const key=gradients[stored]?stored:'tema';
  const grad=gradients[key]||'';
  const opacity=Math.max(35,Math.min(100,Number(db.settings?.interface?.backgroundOpacity??86)))/100;
  const overlayA=(0.82-opacity*0.55).toFixed(2);
  const overlayB=(0.34-opacity*0.22).toFixed(2);
  const heroBg=image?`linear-gradient(135deg,rgba(8,5,15,${overlayA}),rgba(8,5,15,${overlayB})),url("${image}")`:grad;
  if(heroBg){hero.style.backgroundImage=heroBg;hero.style.setProperty('--hero-bg',heroBg);}
  else{hero.style.removeProperty('background-image');hero.style.removeProperty('--hero-bg');}
  hero.style.backgroundSize='cover';hero.style.backgroundPosition='center';
  document.querySelectorAll('.dashboard-palette').forEach(b=>b.classList.toggle('active',b.dataset.dashboardPalette===key));
}
function applyDashboardPalette(key){
  const allowed=['tema','violeta','rose','oceano','menta','dourado','grafite'];
  if(!allowed.includes(key))key='tema';
  db.settings.dashboardGradient=key;saveDB();applyDashboardHero();toast('Fundo do painel atualizado.');
}
function applyDashboardGradientLegacy(){applyDashboardHero();}

function loadDashboardAppearance(){
  applyAdvancedInterfaceSettings();
  const g=document.getElementById('dashboardGreetingText');if(g)g.value=db.settings.dashboardGreeting||'';
  const preview=document.getElementById('dashboardHeroPreview');
  const removeBtn=document.querySelector('.ios-delete-button[onclick*="removeDashboardHeroImage"]');
  const image=String(db.settings.dashboardHeroImage||'');
  if(preview){
    if(image){
      preview.innerHTML='';
      const img=document.createElement('img');
      img.alt='Fundo do painel';
      img.loading='eager';
      img.onload=()=>{preview.dataset.loaded='true';};
      img.onerror=()=>{preview.dataset.loaded='false';preview.textContent='Imagem não pôde ser carregada';};
      img.src=image;
      preview.appendChild(img);
    }else{
      preview.dataset.loaded='false';
      preview.textContent='Sem imagem';
    }
  }
  if(removeBtn)removeBtn.disabled=!image;
}
function saveDashboardAppearance(){
  db.settings.dashboardGreeting=document.getElementById('dashboardGreetingText')?.value.trim()||'';
  saveDB();renderDashboard();loadDashboardAppearance();toast('Painel principal atualizado.');
}
function resetDashboardAppearance(){
  db.settings.dashboardGreeting='';db.settings.dashboardHeroImage='';
  const input=document.getElementById('dashboardHeroImageInput');if(input)input.value='';
  saveDB();renderDashboard();loadDashboardAppearance();toast('Painel principal restaurado.');
}
function uploadLogo(event){
  const file=event?.target?.files?.[0];
  if(!file) return;
  if(!file.type.startsWith("image/")){ toast("Selecione uma imagem válida."); return; }
  const reader=new FileReader();
  reader.onload=()=>{
    db.settings.logo=reader.result;
    saveDB();
    loadGeneralSettingsInputs();
    toast("Logo atualizado com sucesso.");
  };
  reader.readAsDataURL(file);
}
async function removeLogo(){
  if(!db.settings.logo){ toast("Nenhum logo está cadastrado."); return; }
  const confirmed=await iosConfirm("O logo atual será removido da personalização do Studio.", {title:'Remover logo', okLabel:'Remover', danger:true});
  if(!confirmed) return;
  db.settings.logo="";
  const input=document.getElementById("logoInput");
  if(input) input.value="";
  saveDB();
  loadGeneralSettingsInputs();
  toast("Logo removido.");
}

const MESSAGE_TEMPLATES = {
  billing: {
    profissional: "Olá, {nome}.\n\nInformamos que a mensalidade do {studio} está disponível para pagamento.\n\nPlano: {plano}\nValor: R$ {valor}\nVencimento: {vencimento}\n\nPIX ({pix_tipo}): {pix}\nBeneficiário: {pix_nome}\n\nAgradecemos a atenção.",
    humanizada: "Olá, {nome}! 💜\n\nTudo bem? Passando para lembrar com carinho da sua mensalidade do {studio}.\n\nPlano: {plano}\nValor: R$ {valor}\nVencimento: {vencimento}\n\nPIX: {pix}\nBeneficiário: {pix_nome}\n\nSe precisar de qualquer coisa, estamos à disposição! 😊"
  },
  reminder: {
    express: "Olá, {nome}! 😊 Sua mensalidade do {studio}, no valor de R$ {valor}, vence em {vencimento}. PIX: {pix}. Se já realizou o pagamento, desconsidere esta mensagem. 💜"
  },
  welcome: {
    premium: "✨ Seja muito bem-vindo(a), {nome}!\n\nÉ uma alegria receber você no {studio}.\n\nPlano: {plano}\nHorário: {horario}\n\nPrepare-se para uma experiência de cuidado, movimento e bem-estar. Conte conosco! 💜"
  },
  class: {
    objetiva: "📅 Confirmação de aula\n\nOlá, {nome}! Sua aula no {studio} está confirmada para {horario}.\n\nAté lá! 😊"
  }
};
function applyMessageTemplate(field, templateKey){
  const template=MESSAGE_TEMPLATES[field]?.[templateKey];
  const target=document.getElementById("msg"+field.charAt(0).toUpperCase()+field.slice(1));
  if(!template || !target) return;
  target.value=template;
  target.focus();
  toast("Novo template aplicado. Revise e salve quando quiser.");
}

function saveMessages(){
  db.settings.messages.billing = document.getElementById("msgBilling").value;
  db.settings.messages.reminder = document.getElementById("msgReminder").value;
  db.settings.messages.welcome = document.getElementById("msgWelcome").value;
  db.settings.messages.birthday = document.getElementById("msgBirthday").value;
  db.settings.messages.class = document.getElementById("msgClass").value;

  saveDB();
  toast("Templates de mensagem salvos!");
}

/* TEMAS E PALETAS PROFISSIONAIS */
function toggleDarkModePro(){
  db.settings.darkMode = !db.settings.darkMode;
  saveDB();
  if(db.settings.darkMode) applyDarkPalette(db.settings.darkPalette||'carvao');
  else applyThemeStyles();
}

function applyProfessionalPalette(presetKey, persist=true, notify=true, refresh=true){
  /* Paletas completas: cada preset define fundo, superfícies, texto, linhas e acentos.
     Isso evita que a troca de apenas --p deixe resíduos visuais da paleta anterior. */
  const presets = {
    marfim:{bg:'#e8eaee',card:'#ffffff',surface:'#f2f3f6',surface3:'#dcdfe6',ink:'#1c1f26',muted:'#667085',line:'#d2d6df',input:'#ffffff',p:'#f08300',p2:'#ffb04d',a:'#ff5a1f',focus:'rgba(240,131,0,.26)',gradient:'linear-gradient(135deg,#f3f4f7,#e3e6ec)'},
    gelo:{bg:'#d8ebf2',card:'#ffffff',surface:'#e7f4f8',surface3:'#c8e1ea',ink:'#0e2a33',muted:'#4b6d78',line:'#bcd9e3',input:'#ffffff',p:'#10b9bf',p2:'#7ee8e4',a:'#f08300',focus:'rgba(16,185,191,.26)',gradient:'linear-gradient(135deg,#e2f1f6,#cde5ee)'},
    perola:{bg:'#efe9e6',card:'#ffffff',surface:'#f7f2ef',surface3:'#e4dbd6',ink:'#2a1f1c',muted:'#7a6a64',line:'#dcd0ca',input:'#ffffff',p:'#e8512a',p2:'#ff9b7a',a:'#f0a000',focus:'rgba(232,81,42,.26)',gradient:'linear-gradient(135deg,#f6f1ee,#e8dfda)'},
    cobalto:{bg:'#e6eaf4',card:'#ffffff',surface:'#f1f3fa',surface3:'#d9deee',ink:'#151a30',muted:'#5a6385',line:'#ccd3e8',input:'#ffffff',p:'#3358f0',p2:'#8fa5ff',a:'#ff8a00',focus:'rgba(51,88,240,.26)',gradient:'linear-gradient(135deg,#eef1f9,#dde3f2)'},
    rosa:{bg:'#fbe6f0',card:'#ffffff',surface:'#fff2f8',surface3:'#f5d0e1',ink:'#3a1226',muted:'#85546b',line:'#efc3d8',input:'#ffffff',p:'#e5388a',p2:'#ff8fc4',a:'#ff8a5c',focus:'rgba(229,56,138,.26)',gradient:'linear-gradient(135deg,#fdeef5,#f6d6e5)'}
  };
  const t=presets[presetKey]||presets.marfim;
  db.settings.darkMode=false;
  db.settings.theme={...t,preset:presetKey};
  const html=document.documentElement;
  html.removeAttribute('data-theme');
  [['--bg',t.bg],['--card',t.card],['--surface-2',t.surface],['--surface-3',t.surface3],['--input-bg',t.input],['--ink',t.ink],['--muted',t.muted],['--line',t.line],['--p',t.p],['--p2',t.p2],['--a',t.a],['--focus',t.focus],['--dashboard-gradient',t.gradient],['--hero-overlay-1','rgba(255,255,255,.08)'],['--hero-overlay-2','rgba(255,255,255,.025)']].forEach(([k,v])=>html.style.setProperty(k,v));
  if(persist) saveDB();
  document.getElementById('themeTogglePro')?.classList.remove('on');
  const label=document.getElementById('themeModeLabel'); if(label) label.textContent='Modo claro — '+presetKey.charAt(0).toUpperCase()+presetKey.slice(1);
  updatePaletteButtons();
  updateDarkPaletteButtons();
  if(refresh) renderDashboard();
  if(notify) toast(`Paleta ${presetKey.toUpperCase()} aplicada!`);
}

function updatePaletteButtons(){
  const key=db.settings?.theme?.preset||'marfim';
  document.querySelectorAll('.palette-pro').forEach(b=>b.classList.toggle('active',b.dataset.palette===key));
}

function applyDarkPalette(key, persist=true, notify=true, refresh=true){
  const palettes={
    carvao:{bg:'#17181c',card:'#23252b',surface:'#2b2d34',surface3:'#363942',line:'#41454f',ink:'#f3f4f6',muted:'#a9aeba',input:'#1d1e23',p:'#ff9500',p2:'#ffc266',a:'#ffb340',focus:'rgba(255,149,0,.32)',gradient:'linear-gradient(135deg,#17181c,#2b2d34)'},
    lago:{bg:'#0c1a1f',card:'#14262d',surface:'#1a323a',surface3:'#244350',line:'#2e5260',ink:'#eafafb',muted:'#9cc2c8',input:'#0f1f25',p:'#22d3d3',p2:'#86f0ec',a:'#ff9f43',focus:'rgba(34,211,211,.30)',gradient:'linear-gradient(135deg,#0c1a1f,#1a323a)'},
    rose:{bg:'#1a0f16',card:'#281723',surface:'#321c2c',surface3:'#402538',line:'#55304a',ink:'#fdeef6',muted:'#d1a3bd',input:'#20121b',p:'#ff5fa8',p2:'#ffa3cf',a:'#ffb38a',focus:'rgba(255,95,168,.32)',gradient:'linear-gradient(135deg,#1a0f16,#321c2c)'}
  };
  const t=palettes[key]||palettes.carvao;
  db.settings.darkPalette=key; db.settings.darkMode=true;
  db.settings.theme={...(db.settings.theme||{}),preset:key,p:t.p,p2:t.p2,a:t.a};
  const html=document.documentElement; html.setAttribute('data-theme','dark');
  [['--bg',t.bg],['--card',t.card],['--surface-2',t.surface],['--surface-3',t.surface3],['--input-bg',t.input],['--ink',t.ink],['--muted',t.muted],['--line',t.line],['--p',t.p],['--p2',t.p2],['--a',t.a],['--focus',t.focus],['--dashboard-gradient',t.gradient],['--hero-overlay-1','rgba(0,0,0,.12)'],['--hero-overlay-2','rgba(0,0,0,.035)']].forEach(([k,v])=>html.style.setProperty(k,v));
  if(persist) saveDB(); updatePaletteButtons(); updateDarkPaletteButtons();
  const label=document.getElementById('themeModeLabel'); if(label) label.textContent='Modo escuro — '+key.charAt(0).toUpperCase()+key.slice(1);
  document.getElementById('themeTogglePro')?.classList.add('on');
  if(refresh) renderDashboard();
  if(notify) toast(`Paleta ${key.toUpperCase()} aplicada — modo escuro.`);
}
function updateDarkPaletteButtons(){
  const key=db.settings.darkPalette||'carvao';
  document.querySelectorAll('.dark-palette').forEach(b=>b.classList.toggle('active',b.dataset.darkPalette===key));
}

function applyDashboardGradient(){
  const gradients={
    violet:'linear-gradient(135deg,#241047 0%,#4c1d95 55%,#7c3aed 100%)',
    rose:'linear-gradient(135deg,#3b102b 0%,#9d174d 55%,#ec4899 100%)',
    ocean:'linear-gradient(135deg,#06202b 0%,#075985 55%,#0891b2 100%)',
    sage:'linear-gradient(135deg,#172313 0%,#365314 55%,#65a30d 100%)'
  };
  const key=db.settings.dashboardGradient||'violet';
  document.documentElement.style.setProperty('--dashboard-gradient',gradients[key]||gradients.violet);
}

function applyThemeStyles(){
  /* Aplicação visual silenciosa: renderizações/navegação não são alterações do usuário.
     Persistência e notificações acontecem somente na ação explícita de trocar a paleta. */
  if(db.settings.darkMode) applyDarkPalette(db.settings.darkPalette||'carvao',false,false,false);
  else applyProfessionalPalette(db.settings.theme?.preset||'marfim',false,false,false);
}

/* GRÁFICOS CHART.JS — paleta única derivada do tema ativo */
function hexToRgb(hex){
  const h=String(hex||'').replace('#','').trim();
  if(!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)};
}
function rgbToHex(r,g,b){ return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join(''); }
function mixHex(a,b,t){ const A=hexToRgb(a),B=hexToRgb(b); if(!A||!B)return a||b||'#7c3aed'; return rgbToHex(A.r+(B.r-A.r)*t,A.g+(B.g-A.g)*t,A.b+(B.b-A.b)*t); }
function chartPalette(count=6){
  const t=db?.settings?.theme||{};
  const p=t.p||'#7c3aed', p2=t.p2||'#a78bfa', a=t.a||'#ec4899';
  const anchors=[p,p2,a], out=[];
  for(let i=0;i<count;i++){ const pos=count===1?0:i/(count-1), seg=pos*2, idx=Math.min(1,Math.floor(seg)), local=seg-idx; out.push(mixHex(anchors[idx],anchors[idx+1],local)); }
  return out;
}
function chartGridColor(){ return document.documentElement.getAttribute('data-theme')==='dark'?'rgba(255,255,255,.08)':'rgba(15,23,42,.07)'; }
function chartTextColor(){ return getComputedStyle(document.documentElement).getPropertyValue('--muted').trim()||'#667085'; }

function renderCharts(){
  // Chart.js é opcional e carregado sob demanda para acelerar a abertura inicial.
  if(typeof Chart === "undefined"){
    ensureChartJS().then(ok=>{ if(ok) requestAnimationFrame(()=>renderCharts()); });
    return;
  }

  // Gráfico Faturamento vs Recebimento
  const ctxRev = document.getElementById("revenueChart");
  if(ctxRev){
    if(charts.revenue) charts.revenue.destroy();
    charts.revenue = new Chart(ctxRev, {
      type:"bar",
      data:{
        labels:["Previsto", "Recebido"],
        datasets:[{
          data:[
            parseFloat(document.getElementById("kpiRevenue").textContent.replace(/\D/g,"")/100||0),
            parseFloat(document.getElementById("kpiReceived").textContent.replace(/\D/g,"")/100||0)
          ],
          backgroundColor:[chartPalette(3)[0], chartPalette(3)[2]],
          borderRadius:8
        }]
      },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } } }
    });
  }

  // Gráfico de Planos
  const ctxPlan = document.getElementById("planChart");
  if(ctxPlan){
    if(charts.plan) charts.plan.destroy();
    const plansCount = {};
    db.students.forEach(s => { if(s.plan) plansCount[s.plan] = (plansCount[s.plan]||0) + 1; });

    charts.plan = new Chart(ctxPlan, {
      type:"doughnut",
      data:{
        labels:Object.keys(plansCount),
        datasets:[{
          data:Object.values(plansCount),
          backgroundColor:chartPalette(Math.max(3,Object.keys(plansCount).length))
        }]
      },
      options:{ responsive:true, maintainAspectRatio:false }
    });
  }

  // Vagas Preenchidas por Horário — quantidade de alunos ativos x capacidade
  const ctxOcc = document.getElementById("dashboardOccupancyChart");
  if(ctxOcc){
    if(charts.dashboardOccupancy) charts.dashboardOccupancy.destroy();
    const hours = Array.isArray(db.hours) ? db.hours : [];
    const occS = occupancyStats();
    const values = hours.map(h => (occS.perHour[h]||{used:0}).used);
    const cap = Number(db.settings.capacity||0);
    const pct = occS.pct;
    const lab=document.getElementById('dashboardOccupancyLabel');if(lab)lab.textContent=pct.toFixed(0)+'%';
    charts.dashboardOccupancy = new Chart(ctxOcc,{type:'bar',data:{labels:hours,datasets:[{label:'Vagas ocupadas',data:values,backgroundColor:chartPalette(5)[0],borderRadius:8,maxBarThickness:42}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.raw} de ${(occS.perHour[hours[c.dataIndex]]||{}).capacity||0} vagas na semana`}}},scales:{y:{beginAtZero:true,ticks:{precision:0},suggestedMax:Math.max(0,...hours.map(h=>(occS.perHour[h]||{}).capacity||0))||undefined}}}});
  }
}

/* COMPATIBILIDADE E INICIALIZAÇÃO */
function generateCharges(){
  const today = todayISO();
  const currentMonthStr = today.slice(0,7);

  db.students.filter(s => s.status === "Ativo").forEach(s => {
    const exists = db.finance.some(f => f.studentId === s.id && f.dueDate && f.dueDate.startsWith(currentMonthStr) && f.type !== 'Despesa');
    if(!exists){
      db.finance.push({
        id: uid("fin"),
        studentId: s.id,
        studentName: s.name,
        description: `Mensalidade — ${s.plan || 'Pilates'}`,
        value: s.monthly || 0,
        dueDate: `${currentMonthStr}-${String(s.due||10).padStart(2,'0')}`,
        status: "Pendente",
        paymentMethod: "PIX"
      });
    }
  });

  saveDB();
  renderAll();
  toast("Mensalidades do mês geradas com sucesso!");
}

const V9_BACKUP_HISTORY_KEY = "studio_pilates_louise_karla_v9_backup_history";

function getV9BackupHistory(){
  try{ const raw=localStorage.getItem(V9_BACKUP_HISTORY_KEY); const arr=raw?JSON.parse(raw):[]; return Array.isArray(arr)?arr:[]; }catch(e){ return []; }
}
function setV9BackupHistory(arr){ localStorage.setItem(V9_BACKUP_HISTORY_KEY, JSON.stringify(arr.slice(0,5))); }
function createManualBackup(){
  try{
    const snapshot={version:9,createdAt:new Date().toISOString(),data:clone(db)};
    const history=getV9BackupHistory(); history.unshift(snapshot); setV9BackupHistory(history);
    localStorage.setItem(BACKUP_KEY, JSON.stringify(db));
    renderV9BackupStatus(); setStorageStatus('ok','Backup local criado'); toast('Cópia de segurança local criada.');
  }catch(e){ setStorageStatus('error','Falha no backup'); toast('Não foi possível criar o backup local.'); }
}
async function restoreLastLocalBackup(){
  const history=getV9BackupHistory();
  if(!history.length){toast('Nenhuma cópia local manual disponível.');return;}
  const confirmed=await iosConfirm('Restaurar a última cópia local? Os dados atuais serão substituídos.', {title:'Restaurar cópia', okLabel:'Restaurar', danger:false, icon:'restore'});
  if(!confirmed) return;
  const snap=history[0];
  if(!snap || !validateDB(snap.data)){toast('A última cópia local está inválida.');return;}
  db=mergeDefaults(snap.data); saveDB(); renderAll(); renderV9BackupStatus(); toast('Última cópia local restaurada.');
}
async function restoreV9BackupByIndex(index){
  const history=getV9BackupHistory(), snap=history[index];
  if(!snap || !validateDB(snap.data)) return toast('Cópia inválida.');
  const confirmed=await iosConfirm('Restaurar esta cópia de segurança? Os dados atuais serão substituídos.', {title:'Restaurar cópia', okLabel:'Restaurar', danger:false, icon:'restore'});
  if(!confirmed) return;
  db=mergeDefaults(snap.data); saveDB(); renderAll(); renderV9BackupStatus(); toast('Backup restaurado com sucesso.');
}
async function deleteV9BackupByIndex(index){
  const history=getV9BackupHistory();
  if(index<0 || index>=history.length) return;
  const confirmed=await iosConfirm("Excluir esta cópia de segurança local? Esta ação não apaga os dados atuais do sistema.", {title:'Excluir cópia', okLabel:'Excluir', danger:true});
  if(!confirmed) return;
  history.splice(index,1);
  setV9BackupHistory(history);
  renderV9BackupStatus();
  toast("Cópia de segurança excluída.");
}
async function deleteAllLocalBackups(){
  const history=getV9BackupHistory();
  if(!history.length){ toast("Não há cópias locais para excluir."); return; }
  const confirmed=await iosConfirm("Excluir todas as cópias de segurança locais? Os dados atuais do sistema não serão apagados.", {title:'Excluir todas as cópias', okLabel:'Excluir todas', danger:true});
  if(!confirmed) return;
  localStorage.removeItem(V9_BACKUP_HISTORY_KEY);
  renderV9BackupStatus();
  toast("Todas as cópias locais foram excluídas.");
}

function formatBytes(bytes){
  const n=Number(bytes||0);
  if(n<1024) return `${n} B`;
  if(n<1024*1024) return `${(n/1024).toFixed(1)} KB`;
  return `${(n/1024/1024).toFixed(2)} MB`;
}
function getDatabaseRecordCount(){
  const collections=[db.plans,db.hours,db.teachers,db.payments,db.students,db.classes,db.finance,db.makeups,db.waitlist,db.equipment];
  return collections.reduce((sum,a)=>sum+(Array.isArray(a)?a.length:0),0);
}
function getDatabaseSizeBytes(){
  try{return new Blob([JSON.stringify(db)]).size;}catch(e){return JSON.stringify(db).length;}
}
function runDatabaseDiagnostics(showToast=true){
  const valid=validateDB(db);
  const size=getDatabaseSizeBytes();
  const records=getDatabaseRecordCount();
  const structure=document.getElementById('dbDiagStructure');
  const recordsEl=document.getElementById('dbDiagRecords');
  const storage=document.getElementById('dbDiagStorage');
  const time=document.getElementById('dbDiagTime');
  const current=document.getElementById('v9CurrentDBSize');
  if(structure){structure.textContent=valid?'✓ Íntegra':'⚠ Verificar'; structure.style.color=valid?'var(--success,#15803d)':'var(--danger,#d92d20)';}
  if(recordsEl) recordsEl.textContent=records.toLocaleString('pt-BR');
  if(storage) storage.textContent=formatBytes(size);
  if(current) current.textContent=formatBytes(size);
  if(time) time.textContent=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  if(showToast) toast(valid?'Diagnóstico concluído: banco íntegro.':'Diagnóstico encontrou inconsistências no banco.');
  return valid;
}
function renderV9BackupStatus(){
  const history=getV9BackupHistory();
  const last=history[0];
  const date=last?.createdAt?new Date(last.createdAt).toLocaleString('pt-BR'): '—';
  const e=document.getElementById('v9LastBackup'); if(e)e.textContent=date;
  const c=document.getElementById('v9BackupCount'); if(c)c.textContent=history.length;
  const i=document.getElementById('v9BackupIntegrity'); if(i)i.textContent=last&&validateDB(last.data)?'✓ JSON válido':'—';
  runDatabaseDiagnostics(false);
  const h=document.getElementById('v9BackupHistory'); if(!h)return;
  h.innerHTML=history.length?`<div class="panel-title" style="margin-bottom:8px">Histórico das últimas 5 cópias</div><div class="table-wrap"><table style="min-width:620px"><thead><tr><th>Data</th><th>Versão</th><th>Integridade</th><th>Ação</th></tr></thead><tbody>${history.map((x,i)=>`<tr><td>${new Date(x.createdAt).toLocaleString('pt-BR')}</td><td>V${x.version||9}</td><td>${validateDB(x.data)?'✓ Válida':'⚠ Inválida'}</td><td><div class="row-actions"><button class="btn small" onclick="restoreV9BackupByIndex(${i})">Restaurar</button><button class="btn danger small icon ios-delete-button" onclick="deleteV9BackupByIndex(${i})" title="Excluir" aria-label="Excluir">${trashIcon(15)}</button></div></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Nenhuma cópia manual criada ainda.</div>';
}

function renderV9Alerts(){
  const el=document.getElementById('dashboardAlerts'); if(!el)return;
  const alerts=[]; const today=todayISO(); const now=new Date();
  const overdue=db.finance.filter(f=>f.status==='Pendente'&&f.dueDate&&f.dueDate<today);
  const pending=db.finance.filter(f=>f.status==='Pendente');
  const makeups=db.makeups.filter(m=>m.status==='Pendente');
  const wait=db.waitlist.filter(w=>w.status==='Aguardando'||w.status==='Contactar');
  const birthdays=db.students.filter(s=>s.birth).filter(s=>{const [y,m,d]=String(s.birth).split('-').map(Number); const target=new Date(now.getFullYear(),m-1,d); const start=new Date(now.getFullYear(),now.getMonth(),now.getDate()); const end=new Date(start); end.setDate(end.getDate()+7); return target>=start&&target<=end;});
  if(overdue.length) alerts.push({type:'bad',icon:uiIcon('alert',18),title:`${overdue.length} cobrança(s) vencida(s)`,sub:`${money(overdue.reduce((a,f)=>a+Number(f.value||0),0))} em aberto.`,action:`goPage('billing')`,label:'Ver cobranças'});
  else if(pending.length) alerts.push({type:'warn',icon:uiIcon('alert',18),title:`${pending.length} cobrança(s) pendente(s)`,sub:`${money(pending.reduce((a,f)=>a+Number(f.value||0),0))} aguardando pagamento.`,action:`goPage('billing')`,label:'Abrir cobranças'});
  if(makeups.length) alerts.push({type:'info',icon:uiIcon('refresh',18),title:`${makeups.length} reposição(ões) pendente(s)`,sub:'Há reposições aguardando agendamento.',action:`goPage('makeups')`,label:'Ver reposições'});
  if(wait.length) alerts.push({type:'info',icon:uiIcon('hourglass',18),title:`${wait.length} contato(s) na lista de espera`,sub:'Há pessoas aguardando vaga ou contato.',action:`goPage('waitlist')`,label:'Ver lista'});
  if(birthdays.length) alerts.push({type:'ok',icon:uiIcon('cake',18),title:`${birthdays.length} aniversário(s) nos próximos 7 dias`,sub:birthdays.slice(0,3).map(s=>s.name.split(' ')[0]).join(', '),action:`goPage('birthdays')`,label:'Ver aniversários'});
  el.innerHTML=alerts.length?`<div class="v9-alerts">${alerts.map(a=>`<div class="v9-alert ${a.type}"><div class="v9-alert-main"><span class="v9-alert-icon">${a.icon}</span><div class="v9-alert-text"><strong>${esc(a.title)}</strong><span>${esc(a.sub)}</span></div></div><button class="btn small" onclick="${a.action}">${a.label}</button></div>`).join('')}</div>`:'<div class="v9-alert ok"><div class="v9-alert-main"><span class="v9-alert-icon">'+uiIcon('check',18)+'</span><div class="v9-alert-text"><strong>Sistema em dia</strong><span>Nenhum alerta operacional crítico no momento.</span></div></div></div>';
}

function generateRecurringClasses(){
  const key=monthKey(currentMonth), [y,m]=key.split('-').map(Number); const last=new Date(y,m,0).getDate(); let created=0;
  const students=activeStudents().filter(s=>s.time&&Array.isArray(s.days)&&s.days.length);
  for(let day=1;day<=last;day++){
    const iso=`${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`; const dow=new Date(iso+'T12:00:00').getDay();
    students.filter(s=>normalizeStudentDays(s.days).map(Number).includes(dow)).forEach(s=>{
      const exists=db.classes.some(c=>c.date===iso&&c.time===s.time&&c.studentId===s.id&&c.status!=='Cancelada');
      if(!exists){db.classes.push({id:uid('cls'),date:iso,time:s.time,studentId:s.id,studentName:s.name,teacher:s.teacher||'',status:'Agendada',notes:'Aula recorrente'});created++;}
    });
  }
  saveDB();renderAll();toast(created?`${created} aula(s) recorrente(s) gerada(s) para ${monthLabel(currentMonth)}.`:'Nenhuma nova aula recorrente foi necessária.');
}

function exportData(){
  const exportPayload = { schemaVersion: 9, exportedAt: new Date().toISOString(), data: db };
  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type:"application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `backup_studio_pilates_${todayISO()}.json`;
  a.click();
}

function downloadBlobFile(content, type, filename){
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download=filename; a.click();
  setTimeout(()=>URL.revokeObjectURL(url),500);
}
function backupMetrics(){
  const students=Array.isArray(db.students)?db.students:[];
  const active=students.filter(s=>(s.status||'Ativo')==='Ativo');
  const plans={}; active.forEach(s=>{const k=s.plan||'Sem plano';plans[k]=(plans[k]||0)+1;});
  const hours={}; active.forEach(s=>{const k=s.time||'Sem horário';hours[k]=(hours[k]||0)+1;});
  const days={Seg:0,Ter:0,Qua:0,Qui:0,Sex:0,Sáb:0,Dom:0};
  const dn={1:'Seg',2:'Ter',3:'Qua',4:'Qui',5:'Sex',6:'Sáb',0:'Dom'};
  active.forEach(s=>(Array.isArray(s.days)?s.days:[]).forEach(d=>{const k=dn[String(d)];if(k)days[k]++;}));
  const finance=Array.isArray(db.finance)?db.finance:[];
  const revenue=finance.filter(f=>(f.type||'Receita')!=='Despesa'&&f.status!=='Cancelado').reduce((a,f)=>a+Number(f.value||0),0);
  const received=finance.filter(f=>(f.type||'Receita')!=='Despesa'&&f.status==='Pago').reduce((a,f)=>a+Number(f.value||0),0);
  const expenses=finance.filter(f=>f.type==='Despesa'&&f.status!=='Cancelado').reduce((a,f)=>a+Number(f.value||0),0);
  const paidExpenses=finance.filter(f=>f.type==='Despesa'&&f.status==='Pago').reduce((a,f)=>a+Number(f.value||0),0);
  return {students,active,plans,hours,days,finance,revenue,received,expenses,paidExpenses,net:received-paidExpenses,pending:Math.max(0,revenue-received),classes:Array.isArray(db.classes)?db.classes:[]};
}
function svgBarChart(title, data, unit=''){
  const entries=Object.entries(data).filter(x=>Number(x[1])>=0).sort((a,b)=>b[1]-a[1]).slice(0,10);
  const max=Math.max(1,...entries.map(x=>Number(x[1]))); const w=720,h=220,left=155,row=28;
  const bars=entries.map(([label,val],i)=>{const y=35+i*row;const bw=Math.max(2,(Number(val)/max)*(w-left-35));return `<text x="8" y="${y+14}" font-size="11" fill="#334155">${esc(label).slice(0,25)}</text><rect x="${left}" y="${y}" width="${bw}" height="18" rx="5" fill="#7c3aed"/><text x="${left+bw+7}" y="${y+14}" font-size="11" fill="#334155">${esc(String(val))}${unit}</text>`;}).join('');
  return `<div class="pdf-chart"><h3>${esc(title)}</h3><svg viewBox="0 0 ${w} ${Math.max(h,50+entries.length*row)}" role="img" aria-label="${esc(title)}">${bars||'<text x="10" y="30" fill="#64748b">Sem dados disponíveis</text>'}</svg></div>`;
}
function svgDonut(title,data){
  const entries=Object.entries(data); const total=entries.reduce((a,x)=>a+Number(x[1]),0)||1; let angle=-Math.PI/2;
  const colors=['#7c3aed','#ec4899','#0891b2','#059669','#f59e0b','#64748b'];
  const paths=entries.slice(0,6).map(([label,val],i)=>{const frac=Number(val)/total,a1=angle,a2=angle+frac*Math.PI*2;angle=a2;const large=frac>.5?1:0;const x1=100+70*Math.cos(a1),y1=100+70*Math.sin(a1),x2=100+70*Math.cos(a2),y2=100+70*Math.sin(a2);return `<path d="M100 100 L${x1} ${y1} A70 70 0 ${large} 1 ${x2} ${y2} Z" fill="${colors[i%colors.length]}"/>`;}).join('');
  const legend=entries.slice(0,6).map(([l,v],i)=>`<span><i style="background:${colors[i%colors.length]}"></i>${esc(l)}: ${v}</span>`).join('');
  return `<div class="pdf-chart donut"><h3>${esc(title)}</h3><div class="donut-wrap"><svg viewBox="0 0 200 200">${paths}<circle cx="100" cy="100" r="38" fill="white"/><text x="100" y="105" text-anchor="middle" font-size="18" font-weight="800" fill="#1e293b">${total}</text></svg><div class="legend">${legend||'Sem dados'}</div></div></div>`;
}
function exportBackupPDF(){
  const m=backupMetrics(), now=new Date();
  const planData=m.plans, hourData=m.hours, dayData=m.days;
  const occupancy=Math.round(occupancyStats().pct);
  const studentRows=m.students.slice().sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'pt-BR')).map(s=>`<tr><td>${esc(s.name||'')}</td><td>${esc(s.plan||'—')}</td><td>${esc(s.status||'Ativo')}</td><td>${esc(formatTimeRange(s.time||''))}</td><td>${esc(daysLabel(s.days||[]))}</td><td>${esc(s.teacher||'—')}</td></tr>`).join('');
  const financeRows=m.finance.slice().sort((a,b)=>String(a.dueDate||'').localeCompare(String(b.dueDate||''))).slice(0,60).map(f=>`<tr><td>${esc(dateBR(f.dueDate))}</td><td>${esc(f.description||'')}</td><td>${esc(f.type||'Receita')}</td><td>${esc(f.status||'')}</td><td>R$ ${Number(f.value||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</td></tr>`).join('');
  const html=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório Gerencial — ${esc(db.settings.studioName||'Studio de Pilates')}</title><style>@page{size:A4;margin:14mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#1e293b;margin:0;background:#fff;font-size:11px}h1{font-size:24px;margin:0 0 4px;color:#3b1a70}h2{font-size:16px;color:#3b1a70;margin:22px 0 8px}h3{font-size:12px;margin:0 0 8px;color:#334155}.sub{color:#64748b}.cover{border-bottom:3px solid #7c3aed;padding-bottom:14px;margin-bottom:15px}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.kpi{border:1px solid #ddd6fe;border-radius:10px;padding:10px;background:#faf9ff}.kpi b{display:block;font-size:18px;color:#3b1a70;margin-top:3px}.charts{display:grid;grid-template-columns:1fr 1fr;gap:12px}.pdf-chart{border:1px solid #e2e8f0;border-radius:10px;padding:10px;break-inside:avoid}.pdf-chart svg{width:100%;height:auto}.donut-wrap{display:flex;align-items:center;gap:12px}.donut-wrap svg{max-width:180px}.legend{display:grid;gap:5px}.legend span{display:block}.legend i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:5px}table{width:100%;border-collapse:collapse;margin-top:8px}th,td{padding:6px;border-bottom:1px solid #e2e8f0;text-align:left}th{background:#f1f5f9;font-size:10px}.note{padding:9px;border-left:4px solid #7c3aed;background:#f8f7ff;border-radius:5px;margin:8px 0;line-height:1.45}.pagebreak{break-before:page}.small{font-size:9px;color:#64748b}@media print{.no-print{display:none}.pagebreak{break-before:page}}
/* V11 — refinamentos de desempenho, acessibilidade e experiência */
html{scroll-padding-top:82px;overscroll-behavior-y:none}
body{overscroll-behavior-x:hidden;-webkit-tap-highlight-color:transparent}
button,.btn,.nav button,.settings-nav button,.mobile-bottom-nav button{touch-action:manipulation}
.page:not(.active){content-visibility:auto;contain:layout style paint}
.card,.panel,.kpi,.table-wrap,.modal{contain:layout style}
img{content-visibility:auto}
:focus-visible{outline:3px solid color-mix(in srgb,var(--p) 34%,transparent);outline-offset:2px}
html[data-ui-density="compact"] .content{padding:18px}
html[data-ui-density="compact"] .grid{gap:11px}
html[data-ui-density="compact"] .panel{padding:14px}
html[data-ui-density="compact"] .kpi{padding:14px}
html[data-ui-density="compact"] td{padding:8px}
html[data-ui-density="compact"] th{padding:8px}
html[data-ui-density="compact"] .page-head{margin-bottom:14px}
html[data-ui-density="compact"] .section{margin-top:13px}
html[data-ui-density="compact"] .page-title{font-size:25px}
html[data-ui-density="compact"] .topbar{height:64px}
html[data-reduce-effects="1"] *,html[data-reduce-effects="1"] *::before,html[data-reduce-effects="1"] *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}
html[data-reduce-effects="1"] .sidebar,html[data-reduce-effects="1"] .topbar,html[data-reduce-effects="1"] .modal,html[data-reduce-effects="1"] .mobile-bottom-nav,html[data-reduce-effects="1"] .btn,html[data-reduce-effects="1"] .card{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
html[data-reduce-effects="1"] .btn:hover{transform:none}
.v11-preference-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.v11-preference-btn{border:1px solid var(--line);background:var(--surface-2);color:var(--ink);border-radius:15px;padding:12px;text-align:left;min-height:72px}
.v11-preference-btn strong{display:block;font-size:13px}.v11-preference-btn small{display:block;color:var(--muted);margin-top:3px;line-height:1.35}
.v11-preference-btn.active{border-color:var(--p);box-shadow:0 0 0 3px color-mix(in srgb,var(--p) 12%,transparent);background:color-mix(in srgb,var(--p) 8%,var(--surface-2))}
.v11-switch-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-top:1px solid var(--line)}
.v11-switch{width:48px;height:28px;border:0;border-radius:999px;background:var(--surface-3);position:relative;flex:none}
.v11-switch::after{content:"";position:absolute;width:22px;height:22px;left:3px;top:3px;border-radius:50%;background:#fff;box-shadow:0 2px 5px rgba(0,0,0,.18);transition:.18s}
.v11-switch.on{background:var(--p)}.v11-switch.on::after{transform:translateX(20px)}
.v11-shortcut{font-size:10px;color:var(--muted);border:1px solid var(--line);border-radius:7px;padding:2px 6px;background:var(--surface-2)}
@media(max-width:760px){
  html[data-ui-density="compact"] .content{padding:12px 10px 88px}
  .v11-preference-grid{grid-template-columns:1fr}
  .page-title{font-size:24px}
  .page-head{align-items:flex-start;flex-direction:column}
  .actions{width:100%}.actions .btn{flex:1}
  .topbar{padding:0 12px}
}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
</style>
<style id="student-settings-ios18-fix">
#modalBody .fDay{accent-color:var(--p);width:18px!important;height:18px!important;margin:0;flex:0 0 auto}
#modalBody .schedule-chip{cursor:pointer;user-select:none;min-height:38px;padding:8px 11px!important;display:inline-flex;align-items:center;gap:7px;transition:transform .18s cubic-bezier(.2,.8,.2,1),background .18s ease,border-color .18s ease,box-shadow .18s ease}
#modalBody .schedule-chip:has(.fDay:checked){background:color-mix(in srgb,var(--p) 18%,transparent)!important;border-color:color-mix(in srgb,var(--p) 38%,var(--line))!important;box-shadow:0 5px 16px color-mix(in srgb,var(--p) 14%,transparent)}
#modalBody .schedule-chip:active{transform:scale(.96)}
@media(max-width:600px){#modalBody .schedule-chip{min-height:40px;padding:8px 10px!important;flex:1 1 calc(25% - 8px);justify-content:center}}
#modalBody input:invalid,#modalBody select:invalid{border-color:var(--bad)!important}
@media(max-width:600px){
 #modalBackdrop{padding:8px}#modalBackdrop .modal{width:100%;max-height:calc(100dvh - 16px);border-radius:28px}
 #modalBackdrop .modal-body{padding:14px}.modal-foot{padding:10px 12px calc(10px + env(safe-area-inset-bottom))}
 #modalBackdrop .modal-foot .btn{min-height:44px;flex:1}
}
#page-settings.active{display:grid;grid-template-columns:260px minmax(0,1fr);column-gap:18px;align-items:start}
#page-settings>.page-head{grid-column:1/-1;width:100%}
#page-settings>.settings-nav{grid-column:1;grid-row:2;display:grid;gap:6px;padding:8px;margin:0;border:1px solid var(--ios-border);border-radius:22px;background:var(--ios-glass);backdrop-filter:var(--ios-blur);-webkit-backdrop-filter:var(--ios-blur);box-shadow:var(--ios-shadow-soft);overflow:visible;position:sticky;top:94px}
#page-settings>.settings-nav button{position:relative;display:flex;align-items:center;min-height:48px;width:100%;padding:9px 32px 9px 43px;text-align:left;border:0;border-radius:14px;color:var(--ink);background:transparent;font-size:12px;font-weight:650;box-shadow:none;transition:background .16s,color .16s}
#page-settings>.settings-nav button::before{position:absolute;left:10px;width:25px;height:25px;display:grid;place-items:center;border-radius:8px;color:#fff;font-size:13px;font-weight:800}
#page-settings>.settings-nav button::after{content:"›";position:absolute;right:12px;color:var(--muted);font-size:20px;font-weight:300;line-height:1}
#page-settings>.settings-nav button:nth-child(1)::before{content:"⌂";background:#8b5cf6}
#page-settings>.settings-nav button:nth-child(2)::before{content:"$";background:#10b981}
#page-settings>.settings-nav button:nth-child(3)::before{content:"◷";background:#0ea5e9}
#page-settings>.settings-nav button:nth-child(4)::before{content:"♙";background:#f59e0b}
#page-settings>.settings-nav button:nth-child(5)::before{content:"▣";background:#14b8a6}
#page-settings>.settings-nav button:nth-child(6)::before{content:"✉";background:#ec4899}
#page-settings>.settings-nav button:nth-child(7)::before{content:"✦";background:#6366f1}
#page-settings>.settings-nav button:nth-child(8)::before{content:"⌾";background:#64748b}
#page-settings>.settings-nav button:hover{background:rgba(120,100,160,.08);color:var(--ink)}
#page-settings>.settings-nav button.active{background:var(--ios-glass-strong);color:var(--p);box-shadow:0 4px 14px rgba(50,40,80,.08)}
#page-settings>.settings-nav button.active::after{color:var(--p)}
#page-settings>.settings-section{grid-column:2;grid-row:2;min-width:0}
#page-settings>.settings-section .card{border-radius:24px}
#page-settings>.settings-section .section-title,#page-settings>.settings-section .panel-title{letter-spacing:-.2px}
#page-settings>.settings-section .section-title{font-size:15px}
#page-settings>.settings-section .field label{color:var(--muted)}
#page-settings>.settings-section .field input,#page-settings>.settings-section .field select,#page-settings>.settings-section .field textarea{min-height:43px}
#page-settings>.settings-section .theme-toggle-pro{border:1px solid var(--ios-line);border-radius:18px;background:rgba(255,255,255,.35)}
html[data-theme="dark"] #page-settings>.settings-section .theme-toggle-pro{background:rgba(255,255,255,.045)}
@media(max-width:900px){
 #page-settings.active{display:block}#page-settings>.page-head{margin-bottom:10px}
 #page-settings>.settings-nav{position:sticky;top:78px;z-index:20;display:flex;gap:6px;padding:6px;margin-bottom:12px;border-radius:18px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
 #page-settings>.settings-nav::-webkit-scrollbar{display:none}
 #page-settings>.settings-nav button{flex:0 0 auto;width:auto;min-width:142px;min-height:43px;padding:8px 26px 8px 38px;border-radius:13px;white-space:nowrap}
 #page-settings>.settings-nav button::after{right:8px}#page-settings>.settings-section{width:100%}
}
@media(max-width:600px){#page-settings>.settings-nav{top:72px}#page-settings>.settings-nav button{min-width:150px}#page-settings>.settings-section .card{border-radius:21px}}
/* V84 — page isolation: Configurações só pode renderizar quando sua página está ativa. */
.page#page-settings:not(.active){display:none!important;}
</style>

<style id="student-form-v27-fix">
#modalBody .student-plan-price{margin-top:7px;font-size:12px;font-weight:700;letter-spacing:.01em;color:var(--muted)}
#modalBody .student-days-picker{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:7px;margin-top:5px}
#modalBody .student-days-picker .schedule-chip{min-width:0;justify-content:center;text-align:center}
#modalBody .required-mark{color:var(--bad);font-weight:900}
@media(max-width:600px){#modalBody .student-days-picker{grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}#modalBody .student-days-picker .schedule-chip{min-height:42px}}
</style>

<style id="ios27-v70-final-2">
/* v70 — paleta enxuta + Liquid Glass refinado + desempenho */
:root{--ios27-accent-soft:color-mix(in srgb,var(--p) 10%,transparent);--ios27-surface-tint:color-mix(in srgb,var(--p) 3%,white);}
.palette-grid-pro{grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.palette-pro{min-height:106px;padding:12px 11px;border-radius:18px!important;background:linear-gradient(145deg,rgba(255,255,255,.72),rgba(255,255,255,.42))!important}.palette-swatches{gap:4px}.palette-swatches span{height:24px;border-radius:7px}.dark-palette-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.dark-palette{min-height:106px;padding:12px 11px;border-radius:18px!important;background:linear-gradient(145deg,rgba(40,40,50,.82),rgba(24,24,31,.66))!important}.dark-swatches{gap:4px}.dark-swatches span{height:22px;border-radius:7px}
html[data-theme="dark"] .palette-pro{background:rgba(255,255,255,.045)!important}
html[data-theme="dark"] .dark-palette.active,html[data-theme="dark"] .palette-pro.active{box-shadow:0 0 0 2px color-mix(in srgb,var(--p) 32%,transparent),0 12px 30px rgba(0,0,0,.22)!important}
/* Material hierarchy: blur fica concentrado nos elementos estruturais, evitando excesso de composição. */
.card,.panel,.kpi,.dashboard-equipment-row,.equipment-card-v40,.equipment-inventory-card,.rotation-block-v41,.rotation-center-card{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
.sidebar,.topbar,.mobile-bottom-nav,.modal{backdrop-filter:blur(26px) saturate(165%)!important;-webkit-backdrop-filter:blur(26px) saturate(165%)!important}
@media(max-width:900px){.palette-grid-pro{grid-template-columns:repeat(2,minmax(0,1fr))}.dark-palette-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.sidebar{backdrop-filter:blur(22px) saturate(155%)!important;-webkit-backdrop-filter:blur(22px) saturate(155%)!important}}
@media(prefers-reduced-transparency:reduce),(prefers-reduced-motion:reduce){.sidebar,.topbar,.mobile-bottom-nav,.modal{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}.palette-pro:hover,.dark-palette:hover{transform:none!important}}
</style>
</head><body>
  <div class="cover"><h1>${esc(db.settings.studioName||'Studio de Pilates')}</h1><div class="sub">Relatório gerencial dinâmico • gerado em ${now.toLocaleString('pt-BR')}</div></div>
  <div class="kpis"><div class="kpi">Alunos ativos<b>${m.active.length}</b></div><div class="kpi">Receita prevista<b>R$ ${m.revenue.toLocaleString('pt-BR',{minimumFractionDigits:2})}</b></div><div class="kpi">Recebido<b>R$ ${m.received.toLocaleString('pt-BR',{minimumFractionDigits:2})}</b></div><div class="kpi">Ocupação estimada<b>${occupancy}%</b></div></div>
  <div class="note"><b>Como interpretar:</b> o PDF é uma fotografia dos dados atuais. Receita prevista considera receitas não canceladas; recebido considera lançamentos pagos; despesas pagas reduzem o resultado líquido. A ocupação é uma referência baseada na capacidade configurada do Studio.</div>
  <h2>1. Visão dos alunos e planos</h2><div class="charts">${svgDonut('Distribuição de alunos por plano',planData)}${svgBarChart('Alunos por horário',hourData)}</div>
  <h2>2. Distribuição semanal</h2>${svgBarChart('Alunos vinculados por dia da semana',dayData,' aluno(s)')}
  <h2>3. Indicadores financeiros</h2><div class="kpis"><div class="kpi">Pendente<b>R$ ${m.pending.toLocaleString('pt-BR',{minimumFractionDigits:2})}</b></div><div class="kpi">Despesas<b>R$ ${m.expenses.toLocaleString('pt-BR',{minimumFractionDigits:2})}</b></div><div class="kpi">Despesas pagas<b>R$ ${m.paidExpenses.toLocaleString('pt-BR',{minimumFractionDigits:2})}</b></div><div class="kpi">Resultado recebido<b>R$ ${m.net.toLocaleString('pt-BR',{minimumFractionDigits:2})}</b></div></div>
  <div class="note"><b>Leitura gerencial:</b> use a diferença entre previsto e recebido para acompanhar cobranças; compare o resultado recebido com as despesas pagas para visualizar o caixa líquido registrado.</div>
  <div class="pagebreak"></div><h2>4. Cadastro detalhado dos alunos</h2><table><thead><tr><th>Aluno</th><th>Plano</th><th>Status</th><th>Horário</th><th>Dias</th><th>Professor</th></tr></thead><tbody>${studentRows||'<tr><td colspan="6">Nenhum aluno cadastrado.</td></tr>'}</tbody></table>
  <h2>5. Lançamentos financeiros</h2><table><thead><tr><th>Vencimento</th><th>Descrição</th><th>Tipo</th><th>Status</th><th>Valor</th></tr></thead><tbody>${financeRows||'<tr><td colspan="5">Nenhum lançamento.</td></tr>'}</tbody></table>
  <div class="small">Relatório gerado pelo sistema local do Studio. Os dados permanecem no dispositivo; este documento é uma exportação para análise e impressão.</div>
  <script>window.addEventListener('load',()=>setTimeout(()=>window.print(),350));<\/script>

<style id="v35-unified-delete-actions">
/* Todas as ações destrutivas usam o mesmo padrão de ícone iOS. */
.ios-delete-button{
  display:inline-grid!important;place-items:center!important;
  width:40px!important;min-width:40px!important;height:40px!important;
  padding:0!important;margin:0!important;gap:0!important;
  border-radius:13px!important;font-size:0!important;line-height:0!important;
  color:var(--ink)!important;background:var(--ios-glass,rgba(255,255,255,.72))!important;
  border:1px solid rgba(120,120,128,.18)!important;
  box-shadow:0 2px 10px rgba(0,0,0,.05)!important;
  transition:transform .18s cubic-bezier(.22,1,.36,1),background-color .18s ease,color .18s ease,box-shadow .18s ease!important;
}
.ios-delete-button .ios-trash-svg{display:grid!important;place-items:center!important;width:19px!important;height:19px!important}
.ios-delete-button .ios-trash-svg svg{display:block!important;width:18px!important;height:18px!important;fill:none!important;stroke:currentColor!important;stroke-width:1.8!important;stroke-linecap:round!important;stroke-linejoin:round!important}
.ios-delete-button:hover{color:#d92d20!important;background:rgba(217,45,32,.08)!important;box-shadow:0 5px 16px rgba(217,45,32,.12)!important}
.ios-delete-button:active{transform:scale(.90)!important}
@media (max-width:600px){.ios-delete-button{width:42px!important;min-width:42px!important;height:42px!important;border-radius:14px!important}.ios-delete-button .ios-trash-svg svg{width:18px!important;height:18px!important}}
html[data-theme="dark"] .ios-delete-button{color:var(--ink)!important;background:var(--ios-glass,rgba(28,28,30,.72))!important;border-color:rgba(255,255,255,.12)!important}
</style>
<style id="v47-final-layout-overrides">
#page-students .table-wrap{overflow-x:auto!important;scrollbar-width:auto!important}
#page-students .table-wrap::-webkit-scrollbar{height:12px}
#page-students .table-wrap::-webkit-scrollbar-thumb{background:rgba(120,120,140,.5);border-radius:999px;border:3px solid transparent;background-clip:padding-box}
</style>



</body></html>`;
  const w=window.open('','_blank'); if(!w){toast('Permita pop-ups para gerar o PDF.');return;} w.document.open();w.document.write(html);w.document.close(); toast('Relatório PDF preparado. Na janela aberta, escolha “Salvar como PDF”.');
}
function exportBackupCSV(){
  const m=backupMetrics(); const rows=[];
  rows.push(['RELATÓRIO GERAL DO STUDIO']); rows.push(['Gerado em',new Date().toLocaleString('pt-BR')]); rows.push([]);
  rows.push(['INDICADORES','VALOR']); rows.push(['Alunos ativos',m.active.length],['Alunos cadastrados',m.students.length],['Receita prevista',m.revenue.toFixed(2)],['Recebido',m.received.toFixed(2)],['Pendente',m.pending.toFixed(2)],['Despesas',m.expenses.toFixed(2)],['Despesas pagas',m.paidExpenses.toFixed(2)],['Resultado recebido',m.net.toFixed(2)]); rows.push([]);
  rows.push(['ALUNOS','PLANO','STATUS','HORÁRIO','DIAS','PROFESSOR']); m.students.forEach(s=>rows.push([s.name||'',s.plan||'',s.status||'Ativo',formatTimeRange(s.time||''),daysLabel(s.days||[]),s.teacher||''])); rows.push([]);
  rows.push(['PLANOS','ALUNOS']); Object.entries(m.plans).forEach(x=>rows.push(x)); rows.push([]);
  rows.push(['HORÁRIOS','ALUNOS']); Object.entries(m.hours).sort().forEach(([h,v])=>rows.push([formatTimeRange(h),v])); rows.push([]);
  rows.push(['DIA','ALUNOS VINCULADOS']); Object.entries(m.days).forEach(x=>rows.push(x)); rows.push([]);
  rows.push(['FINANCEIRO','DESCRIÇÃO','TIPO','STATUS','VENCIMENTO','VALOR']); m.finance.forEach(f=>rows.push([f.studentName||'',f.description||'',f.type||'Receita',f.status||'',dateBR(f.dueDate),Number(f.value||0).toFixed(2)]));
  const csv=rows.map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(';')).join('\n'); downloadBlobFile('\uFEFF'+csv,'text/csv;charset=utf-8;',`backup_detalhado_studio_${todayISO()}.csv`); toast('CSV detalhado gerado.');
}

async function importData(evt){
  const file = evt.target.files[0];
  evt.target.value = '';
  if(!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    try{
      const parsed = JSON.parse(e.target.result);
      const payload = parsed && parsed.data ? parsed.data : parsed;
      if(!validateDB(payload)){
        toast("Arquivo JSON inválido ou incompatível com este sistema.");
        return;
      }
      const incoming=mergeDefaults(payload);
      const confirmed=await iosConfirm('Importar este banco? Os dados atuais serão substituídos. Recomenda-se criar um backup antes.', {title:'Importar banco', okLabel:'Importar', danger:true, icon:'warning'});
      if(!confirmed) return;
      db=incoming;
      if(!saveDB()) return;
      saveStudentVault(db.students);
      renderAll();
      renderV9BackupStatus();
      setStorageStatus('ok','Banco importado e validado');
      toast("Backup importado e validado com sucesso!");
    }catch(err){
      console.error('Erro ao importar banco:',err);
      setStorageStatus('error','Falha ao importar banco');
      toast("Erro ao ler o arquivo JSON.");
    }
  };
  reader.readAsText(file);
}

async function resetData(){
  const confirmed=await iosConfirm("Essa ação apaga os cadastros locais e restaura o sistema aos dados de fábrica.", {title:'Restaurar dados de fábrica', okLabel:'Restaurar', danger:true, icon:'warning'});
  if(!confirmed) return;
  db = clone(defaultData);
  if(!saveDB()) return;
  saveStudentVault(db.students);
  localStorage.removeItem(V9_BACKUP_HISTORY_KEY);
  renderAll();
  renderV9BackupStatus();
  setStorageStatus('ok','Dados de fábrica restaurados');
  toast("Sistema restaurado aos dados originais.");
}


/* V7 — MÓDULOS OPERACIONAIS COMPLETOS */
function ensureV7Data(){
  ensurePatientEvolutionData();
  ensureEquipmentData();
  db.students.forEach(s=>{ s.days=normalizeStudentDays(s.days); });
  db.classes.forEach(c=>{ if(!c.status) c.status='Agendada'; });
  db.makeups.forEach(m=>{ if(!m.status) m.status='Pendente'; });
  db.waitlist.forEach(w=>{ if(!w.status) w.status='Aguardando'; if(!w.createdAt) w.createdAt=new Date().toISOString(); });
  if(!db.settings.teacherRates) db.settings.teacherRates={};
}
function dateBR(v){ if(!v) return '-'; const [y,m,d]=String(v).slice(0,10).split('-'); return d&&m&&y?`${d}/${m}/${y}`:v; }
function dateTimeSort(a,b){ return String(a.date||'').localeCompare(String(b.date||'')) || String(a.time||'').localeCompare(String(b.time||'')); }
function monthKey(d=new Date()){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }
function monthLabel(d=new Date()){ return d.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}); }
function sameMonth(date,key){ return String(date||'').slice(0,7)===key; }
function studentById(id){ return db.students.find(s=>s.id===id); }
function normalizeAllStudentDays(){ if(!Array.isArray(db.students)) db.students=[]; db.students.forEach(s=>{ s.days=normalizeStudentDays(s.days); }); }
function classById(id){ return db.classes.find(c=>c.id===id); }
function classStatusBadge(st){ const map={Realizada:'ok',Agendada:'info','Cancelada':'bad','Falta':'warn','Reposição':'info'}; return `<span class="badge ${map[st]||'gray'}">${esc(st||'Agendada')}</span>`; }
function studentStatusBadge(st){ const map={Ativo:'ok',Inativo:'gray',Trancado:'warn'}; return `<span class="badge ${map[st]||'gray'}">${esc(st||'')}</span>`; }
function teacherRateLegacy(t){ return Number((db.settings.teacherRates||{})[t]||0); }
function normalizeStudentDays(days){
  const valid=['0','1','2','3','4','5','6'];
  const aliases={dom:'0',domingo:'0',seg:'1',segunda:'1','segunda-feira':'1',ter:'2','terça':'2',terca:'2','terça-feira':'2','terca-feira':'2',qua:'3',quarta:'3','quarta-feira':'3',qui:'4',quinta:'4','quinta-feira':'4',sex:'5',sexta:'5','sexta-feira':'5','sáb':'6',sab:'6','sábado':'6',sabado:'6'};
  const raw=Array.isArray(days)?days:(days==null||days===''?[]:String(days).split(/[,;|\s]+/));
  const out=[];
  raw.forEach(x=>{
    const k=String(x).trim().toLowerCase();
    if(valid.includes(k)) out.push(k); else if(aliases[k]) out.push(aliases[k]);
  });
  const order={1:0,2:1,3:2,4:3,5:4,6:5,0:6};
  return [...new Set(out)].sort((a,b)=>order[a]-order[b]);
}
function daysLabel(days){ const names={1:'Seg',2:'Ter',3:'Qua',4:'Qui',5:'Sex',6:'Sáb',0:'Dom'}; return normalizeStudentDays(days).map(x=>names[x]).join(', ') || '—'; }
function isoDayOfWeek(date){ return new Date(date+'T12:00:00').getDay(); }
function activeStudents(){ return db.students.filter(s=>s.status==='Ativo'); }
function classesForMonth(key){ return db.classes.filter(c=>sameMonth(c.date,key)).sort(dateTimeSort); }
function actualClassCount(key){ return classesForMonth(key).filter(c=>c.status==='Realizada').length; }


function evolutionDefaultEntry(s){return{id:uid('evo'),date:todayISO(),title:'Evolução',complaint:s?.clinical?.complaint||'',objective:s?.clinical?.objective||s?.goal||'',assessment:'',pain:s?.clinical?.pain||'',intervention:'',response:'',nextSteps:s?.clinical?.plan||'',professional:s?.teacher||''};}
function evolutionSummary(s){return(Array.isArray(s?.evolution)?s.evolution:[]).slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)));}function openClinicalProfile(id){
  const s=studentById(id);if(!s)return;const c=s.clinical||{};
  const b=`<div class="evolution-grid-v40"><div class="evolution-section-v40"><h3>Identificação clínica</h3>
  <div class="field"><label>Queixa principal</label><textarea id="cpComplaint">${esc(c.complaint||'')}</textarea></div>
  <div class="field"><label>Objetivo terapêutico/funcional</label><textarea id="cpObjective">${esc(c.objective||s.goal||'')}</textarea></div>
  <div class="field"><label>Diagnóstico / condição informada</label><textarea id="cpDiagnosis">${esc(c.diagnosis||'')}</textarea></div>
  <div class="field"><label>Histórico relevante</label><textarea id="cpMedical">${esc(c.medicalHistory||'')}</textarea></div>
  <div class="field"><label>Medicamentos / informações relevantes</label><textarea id="cpMeds">${esc(c.medications||'')}</textarea></div>
  <div class="field"><label>Contraindicações / cuidados</label><textarea id="cpContra">${esc(c.contraindications||'')}</textarea></div></div>
  <div class="evolution-section-v40"><h3>Avaliação funcional</h3>
  <div class="field"><label>Dor / escala e localização</label><textarea id="cpPain">${esc(c.pain||'')}</textarea></div>
  <div class="field"><label>Postura</label><textarea id="cpPosture">${esc(c.posture||'')}</textarea></div>
  <div class="field"><label>Mobilidade / amplitude</label><textarea id="cpMobility">${esc(c.mobility||'')}</textarea></div>
  <div class="field"><label>Força / resistência</label><textarea id="cpStrength">${esc(c.strength||'')}</textarea></div>
  <div class="field"><label>Equilíbrio / coordenação</label><textarea id="cpBalance">${esc(c.balance||'')}</textarea></div>
  <div class="field"><label>Respiração / controle motor</label><textarea id="cpBreathing">${esc(c.breathing||'')}</textarea></div>
  <div class="field"><label>Medidas / testes / referências</label><textarea id="cpMeasurements">${esc(c.measurements||'')}</textarea></div></div>
  <div class="evolution-section-v40"><h3>Planejamento</h3>
  <div class="field"><label>Frequência planejada</label><input id="cpFrequency" value="${esc(c.frequency||'')}"></div>
  <div class="field"><label>Plano de intervenção</label><textarea id="cpPlan">${esc(c.plan||'')}</textarea></div>
  <div class="field"><label>Orientações para casa</label><textarea id="cpHome">${esc(c.homecare||'')}</textarea></div>
  <div class="field"><label>Próxima reavaliação</label><input id="cpNext" type="date" value="${esc(c.nextReview||'')}"></div>
  <div class="field"><label>Alertas / pontos de atenção</label><textarea id="cpAlerts">${esc(c.alerts||'')}</textarea></div></div></div>`;
  openModal(`Ficha clínica — ${esc(s.name)}`,b,()=>{s.clinical={complaint:cpComplaint.value.trim(),objective:cpObjective.value.trim(),diagnosis:cpDiagnosis.value.trim(),medicalHistory:cpMedical.value.trim(),medications:cpMeds.value.trim(),contraindications:cpContra.value.trim(),pain:cpPain.value.trim(),posture:cpPosture.value.trim(),mobility:cpMobility.value.trim(),strength:cpStrength.value.trim(),balance:cpBalance.value.trim(),breathing:cpBreathing.value.trim(),measurements:cpMeasurements.value.trim(),frequency:cpFrequency.value.trim(),plan:cpPlan.value.trim(),homecare:cpHome.value.trim(),nextReview:cpNext.value,alerts:cpAlerts.value.trim()};s.goal=s.clinical.objective||s.goal||'';s.updatedAt=new Date().toISOString();saveDB();renderAll();toast('Ficha clínica atualizada.');return true;});
}function studentEquipmentHistory7(studentId,date,time,ignoreId=''){
  const targetDate=date||todayISO(), targetTime=time||'23:59';
  const target=new Date(`${targetDate}T${targetTime}`).getTime();
  return db.classes.filter(c=>c.studentId===studentId&&c.equipmentId&&c.status!=='Cancelada'&&c.id!==ignoreId).filter(c=>{
    const t=new Date(`${c.date}T${c.time||'00:00'}`).getTime();
    return Number.isFinite(t)&&t<target;
  }).sort((a,b)=>{
    const ta=new Date(`${a.date}T${a.time||'00:00'}`).getTime(),tb=new Date(`${b.date}T${b.time||'00:00'}`).getTime();
    return tb-ta;
  }).slice(0,7);
}
function studentRotationUI(s){
  ensureEquipmentData();
  const date=todayISO(), time=s.time||'23:59';
  const last=previousEquipmentForStudent(s.id,date,time,'');
  const lastEq=last?.equipmentId?equipmentById(last.equipmentId):null;
  const suggested=recommendEquipment(s.id,date,time,'');
  const persisted=String(s.nextEquipmentId||'');
  const persistedEq=persisted?activeEquipment().find(e=>String(e.id)===persisted):null;
  const persistedValid=!!(persistedEq && String(persistedEq.id)!==String(last?.equipmentId||'') && equipmentAvailable(persistedEq,date,time,''));
  const selected=persistedValid?persisted:(suggested?.id||'');
  const candidates=equipmentRotationCandidates(s.id,date,time,'');
  const all=activeEquipment();
  const ordered=[...candidates,...all.filter(e=>!candidates.some(x=>String(x.id)===String(e.id)))];
  const options=ordered.map(e=>{
    const available=equipmentAvailable(e,date,time,'');
    const repeated=lastEq&&String(e.id)===String(lastEq.id);
    const disabled=!available||repeated;
    const label=`${e.name}${repeated?' · último usado':(!available?' · indisponível':'')}`;
    return `<option value="${esc(e.id)}" ${String(selected)===String(e.id)?'selected':''} ${disabled?'disabled':''}>${esc(label)}</option>`;
  }).join('');
  const history=studentEquipmentHistory7(s.id,date,time,'');
  const historyHtml=history.length?`<div class="student-rotation-history-title"><span>Histórico recente</span><span>últimos ${history.length} de 7</span></div><div class="student-rotation-history">${history.map((c,i)=>{
    const eq=c.equipmentId?equipmentById(c.equipmentId):null;
    const labelDate=String(c.date||'').split('-').reverse().join('/');
    return `<div class="student-rotation-history-item" data-index="${i+1}" title="${esc(`${labelDate} · ${c.time||''}`)}"><strong>${esc(eq?.name||'Equipamento')}</strong><small>${esc(labelDate)} · ${esc(c.time||'—')}</small></div>`;
  }).join('')}</div>`:`<div class="student-rotation-history-title"><span>Histórico recente</span><span>0 de 7</span></div><div class="student-rotation-empty">Nenhum equipamento utilizado anteriormente. O histórico será preenchido automaticamente após as aulas.</div>`;
  const stateClass=suggested?'':' warn';
  const stateText=suggested?'Rodízio disponível':'Sem equipamento disponível';
  return `<div class="student-rotation-card">
    <div class="student-rotation-head">
      <div class="student-rotation-heading">
        <div class="student-rotation-heading-icon" aria-hidden="true">🧘</div>
        <div class="student-rotation-heading-text"><div class="student-rotation-heading-title">Rodízio de equipamento</div><div class="student-rotation-heading-sub">Seleção automática baseada no histórico e disponibilidade</div></div>
      </div>
      <span class="student-rotation-state${stateClass}">${stateText}</span>
    </div>
    <div class="student-rotation-main">
      <div class="student-rotation-metric last"><div class="student-rotation-metric-label">↩ Último usado</div><strong>${lastEq?esc(lastEq.name):'Nenhum registro'}</strong></div>
      <div class="student-rotation-metric next"><div class="student-rotation-metric-label">→ Próximo sugerido</div><strong>${suggested?esc(suggested.name):'Sem disponibilidade'}</strong></div>
    </div>
    <div class="student-rotation-control">
      <select class="student-rotation-select" aria-label="Próximo equipamento de ${esc(s.name)}" onchange="setStudentNextEquipment('${s.id}',this.value)"><option value="">Automático — Rodízio</option>${options}</select>
      <button class="btn small primary student-rotation-book" type="button" onclick="openClassModal(null,'${s.id}',null,'${esc(selected)}')">＋ Aula</button>
    </div>
    <div class="student-rotation-history-wrap">${historyHtml}</div>
    <div class="student-rotation-foot">
      <span class="student-rotation-note">${lastEq?'🔒 '+esc(lastEq.name)+' não será repetido imediatamente.':'🔄 Rodízio automático ativo.'}</span>
      <span class="student-rotation-note">Horário: <strong>${esc(s.time||'—')}</strong></span>
    </div>
  </div>`;
}
function setStudentNextEquipment(studentId,equipmentId){
  const s=studentById(studentId);if(!s)return;
  const id=String(equipmentId||'');
  const date=todayISO(),time=s.time||'23:59';
  const last=previousEquipmentForStudent(studentId,date,time,'');
  if(id){
    const eq=activeEquipment().find(e=>String(e.id)===id);
    if(!eq){toast('Esse equipamento não está ativo no rodízio.');renderStudents();return;}
    if(last?.equipmentId && String(last.equipmentId)===id){
      toast('O equipamento usado na última aula não pode ser repetido imediatamente.');
      renderStudents();return;
    }
    if(!equipmentAvailable(eq,date,time,'')){
      toast('Esse equipamento está indisponível para o horário do aluno.');
      renderStudents();return;
    }
  }
  s.nextEquipmentId=id;
  s.updatedAt=new Date().toISOString();
  if(!saveDB())return;
  renderStudents();
  toast(id?'Próximo equipamento salvo.':'Rodízio automático restaurado.');
}
function studentInitials(name){
  const parts=String(name||'?').trim().split(/\s+/).filter(Boolean);
  return ((parts[0]||'?')[0]+(parts.length>1?parts[parts.length-1][0]:'')).toUpperCase();
}
function studentHue(name){
  let h=0;const s=String(name||'');
  for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%360;
  return h;
}
function studentFinBadge(s){
  const t=todayISO();
  const p=db.finance.filter(f=>f.studentId===s.id&&f.type!=='Despesa'&&f.status==='Pendente'&&f.dueDate).sort((a,b)=>String(a.dueDate).localeCompare(String(b.dueDate)))[0];
  if(!p)return '<span class="badge ok">Em dia</span>';
  const d=Math.round((new Date(p.dueDate+'T12:00:00')-new Date(t+'T12:00:00'))/864e5);
  if(d<0)return '<span class="badge bad">Atrasado '+(-d)+'d</span>';
  if(d<=7)return '<span class="badge warn">Vence '+(d===0?'hoje':'em '+d+'d')+'</span>';
  return '<span class="badge gray">Vence em '+d+'d</span>';
}
function studentCardExtras(s){
  const t=todayISO(),cls=db.classes.filter(c=>c.studentId===s.id);
  const done=cls.filter(c=>c.status==='Realizada').length,miss=cls.filter(c=>c.status==='Falta').length;
  const next=cls.filter(c=>c.date>=t&&c.status==='Agendada').sort(dateTimeSort)[0];
  const plan=db.plans.find(p=>p.name===s.plan);
  const ev=(s.evolution||[]).length;
  const row=(k,v)=>v?`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`:'';
  return row('Início',s.startDate?dateBR(s.startDate):'')+row('Nascimento',s.birth?dateBR(s.birth):'')+row('Frequência',plan?plan.weekly+'x por semana':'')+row('Objetivo',s.goal||'')+row('Aulas',cls.length?done+' realizadas'+(miss?' · '+miss+' faltas':''):'')+row('Próxima aula',next?dateBR(next.date)+' às '+next.time:'')+row('Evoluções',ev?String(ev)+' registro'+(ev===1?'':'s'):'');
}
function renderStudents(){
  ensureV7Data();
  normalizeAllStudentDays();
  ensureEquipmentData();
  const q=(document.getElementById('studentSearch')?.value||'').toLowerCase().trim();
  const status=document.getElementById('studentStatusFilter')?.value||'';
  const all=db.students||[];
  const list=all.filter(s=>{
    const text=[s.name,s.whatsapp,s.plan,s.teacher].join(' ').toLowerCase();
    return (!q||text.includes(q))&&(!status||s.status===status);
  }).sort((a,b)=>String(a.name).localeCompare(String(b.name),'pt-BR'));

  const sum=document.getElementById('studentsSummary');
  if(sum){
    const count=st=>all.filter(s=>s.status===st).length;
    const tile=(label,val,icon,tone)=>`<div class="students-stat tone-${tone}"><span class="students-stat-ico">${uiIcon(icon,20)}</span><div><strong>${val}</strong><small>${label}</small></div></div>`;
    sum.innerHTML=tile('Total de alunos',all.length,'users','violet')+tile('Ativos',count('Ativo'),'check','green')+tile('Trancados',count('Trancado'),'clock','amber')+tile('Inativos',count('Inativo'),'user','gray');
  }

  const el=document.getElementById('studentsGrid');if(!el)return;
  if(!list.length){el.innerHTML=`<div class="empty students-empty">${uiIcon('users',34)}<strong>Nenhum aluno encontrado</strong><span>Ajuste a busca ou cadastre um novo aluno.</span></div>`;return;}
  el.innerHTML=list.map(s=>{
    const hue=studentHue(s.name);
    const days=s.days?.length?daysLabel(s.days):'Dias não definidos';
    const stClass={Ativo:'is-active',Inativo:'is-inactive',Trancado:'is-locked'}[s.status]||'';
    const nm=esc(s.name);
    return `<article class="cg-card student-cg ${stClass}" style="--i:0">
      <div class="cg-cover cv${Math.abs(Math.round(hue))%4}"><i></i><i></i></div>
      <div class="cg-av">${esc(studentInitials(s.name))}</div>
      <div class="cg-head"><h4 title="${nm}">${nm}</h4><p>${esc(s.whatsapp||'Sem WhatsApp')}</p></div>
      <div class="cg-chips">${studentStatusBadge(s.status)}${studentFinBadge(s)}</div>
      <div class="cg-stats"><div><b>${esc(s.plan||'—')}</b><small>Plano</small></div><div><b>${esc(s.time||'—')}</b><small>Horário</small></div><div><b>${money(s.monthly)}</b><small>Mensalidade</small></div></div>
      <dl class="cg-more"><div><dt>Dias</dt><dd>${esc(days)}</dd></div><div><dt>Professora</dt><dd>${esc(s.teacher||'—')}</dd></div><div><dt>Vencimento</dt><dd>Dia ${s.due||10}</dd></div>${studentCardExtras(s)}</dl>
      <div class="cg-actions">
        <button class="btn small" type="button" onclick="openStudentModal('${s.id}')">${uiIcon('pencil',15)}<span>Editar</span></button>
        ${s.whatsapp?`<button class="btn small icon student-wa-action" type="button" title="Enviar WhatsApp" aria-label="Enviar WhatsApp para ${nm}" onclick="openStudentWhatsApp('${s.id}')">${waIcon(17)}</button>`:''}
        <button class="btn small icon" type="button" title="Financeiro" aria-label="Financeiro de ${nm}" onclick="openStudentFinancial('${s.id}')">${uiIcon('wallet',17)}</button>
        <button class="btn small icon" type="button" title="Evolução" aria-label="Evolução de ${nm}" onclick="openEvolutionModal('${s.id}')">${uiIcon('pulse',17)}</button>
        <button class="btn small icon" type="button" title="Agendar aula" aria-label="Agendar aula para ${nm}" onclick="openClassModal(null,'${s.id}')">${uiIcon('calplus',17)}</button>
        <button class="btn small icon danger-soft ios-delete-button" type="button" title="Excluir aluno" aria-label="Excluir aluno ${nm}" onclick="deleteStudent('${s.id}')">${trashIcon(16)}</button>
      </div>
    </article>`;
  }).join('');
}

function openStudentWhatsApp(id){ const s=studentById(id); if(!s)return; openWhatsApp(s.whatsapp,replaceVars(db.settings.messages.welcome,s)); }
function openStudentFinancial(id){
  const s=studentById(id); if(!s)return;
  const rows=db.finance.filter(f=>f.studentId===id).sort((a,b)=>String(b.dueDate).localeCompare(String(a.dueDate)));
  const total=rows.reduce((a,f)=>a+Number(f.value||0),0), paid=rows.filter(f=>f.status==='Pago').reduce((a,f)=>a+Number(f.value||0),0);
  openModal(`Financeiro — ${esc(s.name)}`,`<div class="module-kpis"><div class="module-kpi"><div class="label">Lançado</div><div class="value">${money(total)}</div></div><div class="module-kpi"><div class="label">Pago</div><div class="value">${money(paid)}</div></div><div class="module-kpi"><div class="label">Pendente</div><div class="value">${money(total-paid)}</div></div><div class="module-kpi"><div class="label">Plano</div><div class="value" style="font-size:15px">${esc(s.plan||'—')}</div></div></div><div class="table-wrap"><table><thead><tr><th>Vencimento</th><th>Valor</th><th>Status</th></tr></thead><tbody>${rows.map(f=>`<tr><td>${dateBR(f.dueDate)}</td><td>${money(f.value)}</td><td>${f.status==='Pago'?'<span class="badge ok">Pago</span>':'<span class="badge warn">Pendente</span>'}</td></tr>`).join('')||'<tr><td colspan="3"><div class="empty">Nenhum lançamento.</div></td></tr>'}</tbody></table></div>`,closeModal);
}

function renderAgenda(){
  ensureV7Data();
  const y=currentMonth.getFullYear(), m=currentMonth.getMonth();
  const key=`${y}-${String(m+1).padStart(2,'0')}`;
  const title=document.getElementById('calendarMonth'); if(title) title.textContent=monthLabel(currentMonth);
  const cal=document.getElementById('calendar');
  if(cal){
    const first=new Date(y,m,1), start=(first.getDay()+6)%7, days=new Date(y,m+1,0).getDate(), prevDays=new Date(y,m,0).getDate();
    let html=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(x=>`<div class="calendar-week">${x}</div>`).join('');
    const total=Math.ceil((start+days)/7)*7;
    for(let i=0;i<total;i++){
      const n=i-start+1; let d=n, other=false;
      if(n<1){d=prevDays+n;other=true;} else if(n>days){d=n-days;other=true;}
      const date=other?(n<1?new Date(y,m-1,d):new Date(y,m+1,d)):new Date(y,m,d);
      const iso=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
      const events=db.classes.filter(c=>c.date===iso).sort(dateTimeSort).slice(0,3);
      html+=`<div class="day-cell ${other?'other':''} ${iso===todayISO()?'today':''}" onclick="openClassModal('${iso}')"><div class="day-number">${d}</div>${events.map(c=>`<div class="event" title="${esc(c.studentName||'')}">${esc(formatTimeRange(c.time||''))} · ${esc(c.studentName||'')}</div>`).join('')}${db.classes.filter(c=>c.date===iso).length>3?`<div class="event">+${db.classes.filter(c=>c.date===iso).length-3} aulas</div>`:''}</div>`;
    }
    cal.innerHTML=html;
  }
  const monthClasses=classesForMonth(key), table=document.getElementById('classesTable');
  if(document.getElementById('classCount')) document.getElementById('classCount').textContent=`${monthClasses.length} aula${monthClasses.length===1?'':'s'}`;
  if(table) table.innerHTML=monthClasses.map(c=>`<tr><td>${dateBR(c.date)}</td><td><strong>${esc(formatTimeRange(c.time||''))}</strong></td><td>${esc(c.studentName||studentById(c.studentId)?.name||'—')}</td><td>${esc(c.teacher||'—')}</td><td>${classStatusBadge(c.status)}</td><td><div class="row-actions">${c.status==='Agendada'?`<button class="btn success small" onclick="setClassStatus('${c.id}','Realizada')">Concluir</button><button class="btn small" onclick="setClassStatus('${c.id}','Cancelada')">Cancelar</button>`:''}<button class="btn small" onclick="openClassModal(null,null,'${c.id}')">Editar</button><button class="btn danger small icon ios-delete-button" onclick="deleteClass('${c.id}')" title="Excluir" aria-label="Excluir">${trashIcon(15)}</button></div></td></tr>`).join('')||'<tr><td colspan="6"><div class="empty">Nenhuma aula cadastrada neste mês.</div></td></tr>';
}
function changeMonth(delta){ currentMonth=new Date(currentMonth.getFullYear(),currentMonth.getMonth()+delta,1); renderAgenda(); renderOccupancy(); }

/* V41 — Miniaturas dos equipamentos */
function equipmentIconSVG(eq,size=42){
  const key=String(eq?.id||'')+'|'+String(eq?.name||'')+'|'+String(eq?.category||'')+'|'+size;
  equipmentIconSVG.cache=equipmentIconSVG.cache||new Map();
  if(equipmentIconSVG.cache.has(key)) return equipmentIconSVG.cache.get(key);
  const n=String(eq?.name||'').toLowerCase(), c=String(eq?.category||'').toLowerCase();
  const t=n.includes('reformer')||c.includes('reformer')?'reformer':n.includes('cadillac')||c.includes('cadillac')?'cadillac':n.includes('chair')||c.includes('chair')?'chair':n.includes('barrel')||c.includes('barrel')?'barrel':n.includes('spine')||n.includes('corrector')?'spine':'generic';
  const s=Math.max(32,Number(size)||42), S='stroke-linecap="round" stroke-linejoin="round"'; let b='';
  if(t==='reformer') b=`<defs><linearGradient id="rg${s}" x1="8" y1="8" x2="56" y2="56"><stop stop-color="#6d7886"/><stop offset=".45" stop-color="#f0f2f5"/><stop offset="1" stop-color="#59636f"/></linearGradient><linearGradient id="rc${s}" x1="10" y1="25" x2="52" y2="44"><stop stop-color="#303844"/><stop offset="1" stop-color="#9ba4b0"/></linearGradient></defs><rect x="7" y="38" width="50" height="7" rx="3" fill="url(#rg${s})" stroke="#525c68" stroke-width="1.4" ${S}/><rect x="14" y="28" width="31" height="9" rx="3" fill="url(#rc${s})" stroke="#4d5662" stroke-width="1.3" ${S}/><path d="M12 45 8 54M52 45l4 9M17 28V13M47 28V13M17 14h30" fill="none" stroke="#626c79" stroke-width="2" ${S}/><path d="M20 46h24" stroke="#d0d4da" stroke-width="1.5" ${S}/><circle cx="19" cy="49" r="3" fill="#444d59"/><circle cx="45" cy="49" r="3" fill="#444d59"/><circle cx="32" cy="32" r="2" fill="#cbd0d6"/>`;
  else if(t==='cadillac') b=`<defs><linearGradient id="cg${s}" x1="10" y1="8" x2="54" y2="52"><stop stop-color="#555f6c"/><stop offset=".5" stop-color="#eef0f3"/><stop offset="1" stop-color="#697381"/></linearGradient></defs><rect x="9" y="40" width="46" height="7" rx="3" fill="#3f4854"/><path d="M13 40V8M51 40V8M13 9h38M20 17h24M20 26h24M20 17v18M44 17v18" fill="none" stroke="url(#cg${s})" stroke-width="3" ${S}/><path d="M27 27c3 3 7 3 10 0" fill="none" stroke="#2f3741" stroke-width="2" ${S}/><circle cx="32" cy="35" r="3" fill="#b6bdc6"/>`;
  else if(t==='chair') b=`<defs><linearGradient id="ch${s}" x1="18" y1="14" x2="47" y2="54"><stop stop-color="#59636f"/><stop offset=".5" stop-color="#e1e5e9"/><stop offset="1" stop-color="#66707c"/></linearGradient></defs><path d="M18 47h29M21 47V21h22v26" fill="none" stroke="url(#ch${s})" stroke-width="4" ${S}/><rect x="21" y="21" width="22" height="10" rx="2" fill="#444d59"/><path d="M27 21V13h10v8M17 53h8M39 53h8M24 35h16M24 40h16" fill="none" stroke="#6b7582" stroke-width="2" ${S}/><rect x="27" y="31" width="10" height="7" rx="2" fill="#c5cbd1"/>`;
  else if(t==='barrel'||t==='spine') b=`<defs><linearGradient id="bg${s}" x1="12" y1="17" x2="52" y2="53"><stop stop-color="#a96d40"/><stop offset=".45" stop-color="#e2ad78"/><stop offset="1" stop-color="#81502f"/></linearGradient></defs><path d="M10 47h44" stroke="#555e69" stroke-width="3" ${S}/><path d="M15 47c1-18 7-29 17-29s16 11 17 29" fill="url(#bg${s})" stroke="#70472f" stroke-width="1.5" ${S}/><path d="M19 40h26M21 33h22M25 26h14M14 47v7M50 47v7" fill="none" stroke="#795039" stroke-width="1.7" ${S}/><path d="M17 47h30" stroke="#d8dce1" stroke-width="1.3" ${S}/>`;
  else b=`<defs><linearGradient id="gg${s}" x1="10" y1="10" x2="54" y2="54"><stop stop-color="#5c6673"/><stop offset=".5" stop-color="#e2e6ea"/><stop offset="1" stop-color="#727c89"/></linearGradient></defs><rect x="9" y="13" width="46" height="37" rx="9" fill="url(#gg${s})" stroke="#4e5865" stroke-width="1.5"/><circle cx="32" cy="31" r="9" fill="#343d48" stroke="#c4cad0" stroke-width="2"/><path d="M32 22v18M23 31h18" stroke="#e2e5e8" stroke-width="1.5" ${S}/>`;
  const out=`<span class="equipment-real-thumb" style="--icon-size:${s}px" aria-hidden="true"><svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">${b}</svg></span>`;
  equipmentIconSVG.cache.set(key,out); return out;
}

/* V11 — Central de equipamentos e rodízio automático */
function ensurePatientEvolutionData(){
  if(!Array.isArray(db.students)) db.students=[];
  db.students.forEach(s=>{
    if(!Array.isArray(s.evolution)) s.evolution=[];
    if(!s.clinical || typeof s.clinical!=='object') s.clinical={};
    const c=s.clinical;
    ['complaint','objective','diagnosis','pain','limitations','contraindications','medicalHistory','medications','posture','mobility','strength','balance','breathing','measurements','frequency','plan','homecare','nextReview','alerts'].forEach(k=>{if(c[k]==null)c[k]='';});
    if(!c.objective)c.objective=s.goal||'';
    if(!c.medicalHistory)c.medicalHistory=s.notes||'';
  });
}
function ensureEquipmentData(){
  if(!Array.isArray(db.equipment)) db.equipment=clone(defaultData.equipment||[]);
  db.equipment.forEach(e=>{
    if(!e.id)e.id=uid('eq');
    e.name=String(e.name||'Equipamento').trim();
    e.category=String(e.category||'Pilates').trim();
    e.quantity=Math.max(1,Number(e.quantity||1));
    e.active=e.active!==false;
    e.notes=String(e.notes||'');
  });
}
function equipmentById(id){ensureEquipmentData();return db.equipment.find(e=>e.id===id);}
function activeEquipment(){ensureEquipmentData();return db.equipment.filter(e=>e.active!==false&&e.name);}
function equipmentUsageCount(id){return db.classes.filter(c=>c.equipmentId===id&&c.status!=='Cancelada').length;}
function equipmentClassesAt(date,time,ignoreId=null){
  return db.classes.filter(c=>c.date===date&&c.time===time&&c.status!=='Cancelada'&&c.equipmentId&&c.id!==ignoreId);
}
function timeToMinutes(value){
  const m=String(value||'').match(/^(\d{1,2}):(\d{2})$/);
  if(!m)return null;
  const h=Number(m[1]),min=Number(m[2]);
  if(h>23||min>59)return null;
  return h*60+min;
}
function intervalsOverlap(startA,endA,startB,endB){return startA<endB&&startB<endA;}
function equipmentAvailable(e,date,time,ignoreId=null,duration=null){
  if(!e||!date||!time)return false;
  const targetStart=timeToMinutes(time);
  if(targetStart==null)return false;
  const targetDuration=Math.max(1,Number(duration||db?.settings?.duration||60));
  const targetEnd=targetStart+targetDuration;
  const overlaps=db.classes.filter(c=>c.date===date&&c.status!=='Cancelada'&&c.equipmentId===e.id&&c.id!==ignoreId).filter(c=>{
    const start=timeToMinutes(c.time);
    if(start==null)return false;
    const dur=Math.max(1,Number(c.duration||db?.settings?.duration||60));
    return intervalsOverlap(targetStart,targetEnd,start,start+dur);
  }).length;
  return overlaps<Math.max(1,Number(e.quantity||1));
}
function previousEquipmentForStudent(studentId,date,time,ignoreId=null){
  const classes=db.classes.filter(c=>c.studentId===studentId && c.equipmentId && c.status!=='Cancelada' && c.id!==ignoreId);
  const target=new Date(`${date}T${time||'23:59'}`).getTime();
  return classes.filter(c=>{
    const t=new Date(`${c.date}T${c.time||'00:00'}`).getTime();
    return Number.isFinite(t)&&t<target;
  }).sort((a,b)=>{
    const ta=new Date(`${a.date}T${a.time||'00:00'}`).getTime(),tb=new Date(`${b.date}T${b.time||'00:00'}`).getTime();
    return tb-ta;
  })[0]||null;
}
function equipmentRotationCandidates(studentId,date,time,ignoreId=null){
  const last=previousEquipmentForStudent(studentId,date,time,ignoreId);
  const studentUseCount={};
  db.classes.filter(c=>c.studentId===studentId&&c.equipmentId&&c.status!=='Cancelada'&&c.id!==ignoreId).forEach(c=>{studentUseCount[c.equipmentId]=(studentUseCount[c.equipmentId]||0)+1;});
  return activeEquipment().filter(e=>equipmentAvailable(e,date,time,ignoreId)).sort((a,b)=>{
    const ar=last&&String(a.id)===String(last.id)?1:0,br=last&&String(b.id)===String(last.id)?1:0;
    if(ar!==br)return ar-br;
    const au=studentUseCount[a.id]||0,bu=studentUseCount[b.id]||0;
    return au-bu||equipmentUsageCount(a.id)-equipmentUsageCount(b.id)||String(a.name).localeCompare(String(b.name),'pt-BR');
  });
}
function recommendEquipment(studentId,date,time,ignoreId=null){
  return equipmentRotationCandidates(studentId,date,time,ignoreId)[0]||null;
}
function equipmentSelectOptions(studentId,date,time,selected='',ignoreId=null){
  const list=equipmentRotationCandidates(studentId,date,time,ignoreId);
  const all=activeEquipment();
  const ordered=[...list,...all.filter(e=>!list.some(x=>x.id===e.id))];
  const last=previousEquipmentForStudent(studentId,date,time,ignoreId);
  return '<option value="">Automático — Rodízio</option>'+ordered.map(e=>{
    const available=equipmentAvailable(e,date,time,ignoreId);
    const repeated=last&&String(last.id)===String(e.id);
    const disabled=!available||repeated;
    const label=`${e.name} · ${e.category} · ${repeated?'último usado':(available?'disponível':'indisponível')}`;
    return `<option value="${esc(e.id)}" ${selected===e.id?'selected':''} ${disabled?'disabled':''}>${esc(label)}</option>`;
  }).join('');
}
function refreshClassEquipmentOptions(){
  const student=document.getElementById('cStudent')?.value;
  const date=document.getElementById('cDate')?.value;
  const time=document.getElementById('cTime')?.value;
  const sel=document.getElementById('cEquipment')?.value||'';
  const el=document.getElementById('cEquipment');
  if(!el||!student||!date||!time)return;
  el.innerHTML=equipmentSelectOptions(student,date,time,sel,editingId);
  const selectedOption=sel?[...el.options].find(o=>String(o.value)===String(sel)&&!o.disabled):null;
  if(selectedOption) el.value=sel;
  else el.value=recommendEquipment(student,date,time,editingId)?.id||'';
  updateEquipmentRecommendation();
}
function updateEquipmentRecommendation(){
  const student=document.getElementById('cStudent')?.value;
  const date=document.getElementById('cDate')?.value;
  const time=document.getElementById('cTime')?.value;
  const selected=document.getElementById('cEquipment')?.value||'';
  const note=document.getElementById('equipmentRecommendation');
  if(!note)return;
  if(!student||!date||!time){note.textContent='Selecione aluno, data e horário para aplicar o rodízio automático.';return;}
  const last=previousEquipmentForStudent(student,date,time,editingId);
  const rec=recommendEquipment(student,date,time,editingId);
  if(selected){
    const e=equipmentById(selected);
    note.innerHTML=`<span class="equipment-chip">Manual</span> Equipamento selecionado: <strong>${esc(e?.name||'')}</strong>${last?` · último usado: ${esc(last.name)}`:''}.`;
    return;
  }
  note.innerHTML=rec
    ? `<span class="equipment-chip">🧘 Rodízio</span> Sugestão: <strong>${esc(rec.name)}</strong>${last?` · evitando repetição de <strong>${esc(last.name)}</strong>`:''}.`
    : `<span class="badge warn">Sem equipamento disponível</span> Cadastre/ative outro aparelho ou aumente a quantidade.`;

  const hs=document.getElementById('studentEquipmentHistory'),sid=document.getElementById('cStudent')?.value;
  if(hs&&sid){hs.style.display='block';hs.innerHTML='<h4>📋 Histórico deste cliente</h4>'+renderStudentEquipmentHistory(sid,6);}
}
function studentEquipmentHistory(studentId,limit=8){
  const s=studentById(studentId);
  return db.classes.filter(c=>c.studentId===studentId&&c.equipmentId).sort((a,b)=>{
    const ta=new Date(`${a.date}T${a.time||'00:00'}`).getTime(),tb=new Date(`${b.date}T${b.time||'00:00'}`).getTime();return tb-ta;
  }).slice(0,limit);
}
function renderStudentEquipmentHistory(studentId,limit=8){
  const rows=studentEquipmentHistory(studentId,limit);
  if(!rows.length)return '<div class="muted">Ainda não há aulas com equipamento registradas para este cliente.</div>';
  return `<div class="rotation-history-v41">${rows.map(c=>{const eq=equipmentById(c.equipmentId);return `<div class="rotation-row-v41">${equipmentIconSVG(eq||{name:'Equipamento'},38)}<div><div class="date">${dateBR(c.date)}${c.time?' · '+esc(c.time):''}</div><div class="name">${esc(eq?.name||'Equipamento removido')}</div><div class="eq">${esc(c.title||'Aula')} · ${esc(c.status||'Agendada')}</div></div><span class="badge ok">Usado</span></div>`}).join('')}</div>`;
}
function rotationNextLabel(studentId,date,time,ignoreId=null){
  const prev=previousEquipmentForStudent(studentId,date,time,ignoreId), eq=prev?.equipmentId?equipmentById(prev.equipmentId):null;
  return eq?`<div class="rotation-block-v41"><h4>🔄 Rodízio deste cliente</h4><div style="display:flex;align-items:center;gap:9px">${equipmentIconSVG(eq,38)}<div>Último equipamento: <strong>${esc(eq.name)}</strong><br><span class="muted">Ele ficará bloqueado nesta próxima aula.</span></div></div></div>`:'';
}
function equipmentDayKey(date){return new Date(`${date}T12:00:00`).getDay();}
function studentScheduledOnDate(s,date){const d=equipmentDayKey(date),names=['domingo','segunda','terça','quarta','quinta','sexta','sábado'],a=[String(d),names[d],names[d].slice(0,3)],days=Array.isArray(s.days)?s.days.map(x=>String(x).toLowerCase().trim()):[];return days.some(x=>a.includes(x));}
function rotationScheduleForStudent(s,date){const cs=db.classes.filter(c=>c.studentId===s.id&&c.date===date&&c.status!=='Cancelada').sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));if(cs.length)return cs.map(c=>({date,time:c.time||s.time||'',classId:c.id,equipmentId:c.equipmentId||'',status:c.status||'Agendada'}));return studentScheduledOnDate(s,date)&&s.time?[{date,time:s.time,classId:'',equipmentId:s.nextEquipmentId||'',status:'Programada'}]:[];}
function rotationWeekStart(date){const d=new Date(`${date||todayISO()}T12:00:00`);const day=d.getDay();const diff=day===0?-6:1-day;d.setDate(d.getDate()+diff);return d.toISOString().slice(0,10);}
function rotationWeekDates(anchor){const start=new Date(`${rotationWeekStart(anchor)}T12:00:00`);return Array.from({length:7},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d.toISOString().slice(0,10);});}
function shiftEquipmentRotationWeek(delta){const input=document.getElementById('equipmentRotationDate');const base=input?.value||todayISO();const d=new Date(`${rotationWeekStart(base)}T12:00:00`);d.setDate(d.getDate()+Number(delta||0)*7);if(input)input.value=d.toISOString().slice(0,10);renderEquipmentRotationCenter();}
function rotationWeekLabel(date){return new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'}).replace(/^./,m=>m.toUpperCase());}
function rotationCompactStudentRow(s,date,slot){const time=slot.time||s.time||'23:59',last=previousEquipmentForStudent(s.id,date,time,slot.classId||''),lastEq=last?.equipmentId?equipmentById(last.equipmentId):null,rec=recommendEquipment(s.id,date,time,slot.classId||''),current=slot.equipmentId?equipmentById(slot.equipmentId):null,persisted=s.nextEquipmentId?equipmentById(s.nextEquipmentId):null,validPersisted=persisted&&(!lastEq||persisted.id!==lastEq.id)&&equipmentAvailable(persisted,date,time,slot.classId||''),next=current||(validPersisted?persisted:rec),options=activeEquipment().map(e=>{const unavailable=!equipmentAvailable(e,date,time,slot.classId||''),repeated=!!lastEq&&String(e.id)===String(lastEq.id);return `<option value="${esc(e.id)}" ${next&&String(next.id)===String(e.id)?'selected':''} ${unavailable||repeated?'disabled':''}>${esc(e.name)}${repeated?' · último usado':unavailable?' · indisponível':''}</option>`}).join(''),state=current?'Confirmado':next?'Sugestão':'Aguardando aparelho',stateClass=current?'ok':next?'info':'warn',teacher=String(s.teacher||'').trim(),plan=String(s.plan||'').trim(),meta=[teacher,plan].filter(Boolean).join(' · ');return `<div class="rotation-student-compact"><div class="rotation-student-main"><div class="rotation-student-avatar">${esc(String(s.name||'?').trim().charAt(0).toUpperCase())}</div><div class="rotation-student-name"><strong>${esc(s.name)}</strong>${meta?`<small>${esc(meta)}</small>`:''}</div></div><div class="rotation-student-last"><span>Último</span><strong>${esc(lastEq?.name||'—')}</strong></div><div class="rotation-student-next"><span>Próximo</span><select aria-label="Próximo equipamento de ${esc(s.name)} às ${esc(time)}" onchange="setRotationForSchedule('${s.id}','${esc(date)}','${esc(time)}','${esc(slot.classId||'')}',this.value)"><option value="">Automático</option>${options}</select></div><span class="badge ${stateClass}">${state}</span><div class="rotation-student-action">${slot.classId?`<button class="btn small" onclick="openClassModal(null,'${s.id}','${slot.classId}')">Editar</button>`:`<button class="btn small primary" onclick="openClassModal('${date}','${s.id}',null,'${esc(next?.id||'')}')">＋ Aula</button>`}</div></div>`;}
function renderRotationTimeGroup(date,time,items){
  const duration=Math.max(...items.map(x=>Number(x.slot.duration||classById(x.slot.classId)?.duration||db?.settings?.duration||60)),60);
  const assigned=items.filter(x=>x.slot.equipmentId).length;
  const pct=items.length?Math.round((assigned/items.length)*100):0;
  const statuses=[...new Set(items.map(x=>x.slot.status||'Programada'))];
  return `<div class="rotation-time-group">
    <div class="rotation-time-head-v55">
      <div class="rotation-time-main-v55"><div class="rotation-time-clock-v55">${esc(time)}</div><div><strong>${items.length} aluno${items.length===1?'':'s'}</strong><small>${duration} min · ${assigned===items.length?'todos os aparelhos definidos':`${items.length-assigned} aparelho${items.length-assigned===1?'':'s'} pendente${items.length-assigned===1?'':'s'}`}</small></div></div><div class="rotation-occupancy-v59"><span>Ocupação</span><b>${slotCapacity(date,time).used}/${slotCapacity(date,time).capacity||'—'}</b></div>
      <div class="rotation-time-side-v55"><strong>${pct}%</strong><small>${statuses.length===1?esc(statuses[0]):'Aula'}</small><div class="rotation-time-progress-v55"><i style="width:${pct}%"></i></div></div>
    </div>
    <div class="rotation-students-header-v56"><span>Aluno</span><span>Último</span><span>Próximo aparelho</span><span>Status</span><span>Ação</span></div><div class="rotation-students-list">${items.map(x=>rotationCompactStudentRowV55(x.s,date,x.slot)).join('')}</div>
  </div>`;
}
function rotationCompactStudentRowV55(s,date,slot){
  const time=slot.time||s.time||'23:59',capacity=slotCapacity(date,time,slot.classId||''),last=previousEquipmentForStudent(s.id,date,time,slot.classId||''),lastEq=last?.equipmentId?equipmentById(last.equipmentId):null,rec=recommendEquipment(s.id,date,time,slot.classId||''),current=slot.equipmentId?equipmentById(slot.equipmentId):null,persisted=s.nextEquipmentId?equipmentById(s.nextEquipmentId):null,validPersisted=persisted&&(!lastEq||persisted.id!==lastEq.id)&&equipmentAvailable(persisted,date,time,slot.classId||''),next=current||(validPersisted?persisted:rec);
  const options=activeEquipment().map(e=>{const unavailable=!equipmentAvailable(e,date,time,slot.classId||''),repeated=!!lastEq&&String(e.id)===String(lastEq.id);return `<option value="${esc(e.id)}" ${next&&String(next.id)===String(e.id)?'selected':''} ${unavailable||repeated?'disabled':''}>${esc(e.name)}${repeated?' · último':unavailable?' · indisponível':''}</option>`}).join('');
  const state=current?'Confirmado':next?'Sugestão':'Pendente',stateClass=current?'ok':next?'info':'warn';
  const teacher=String(s.teacher||'').trim(),plan=String(s.plan||'').trim(),meta=[teacher,plan].filter(Boolean).join(' · ');
  const action=slot.classId?`<button class="btn small" onclick="openClassModal(null,'${s.id}','${slot.classId}')">Editar aula</button>`:(capacity.full?`<button class="btn small primary" disabled title="Horário lotado">Lotado</button>`:`<button class="btn small primary" onclick="openClassModal('${date}','${s.id}',null,'${esc(next?.id||'')}')">＋ Aula</button>`);
  return `<div class="rotation-student-compact-v55">
    <div class="rotation-student-main-v55"><div class="rotation-student-avatar-v55">${esc(String(s.name||'?').trim().charAt(0).toUpperCase())}</div><div class="rotation-student-name-v55"><strong>${esc(s.name)}</strong><small>${esc(meta||'Aluno ativo')}</small></div></div>
    <div class="rotation-last-v55"><span>Último</span><strong>${esc(lastEq?.name||'—')}</strong></div>
    <div class="rotation-next-v55"><span>Próximo aparelho</span><select aria-label="Próximo equipamento de ${esc(s.name)} às ${esc(time)}" onchange="setRotationForSchedule('${s.id}','${esc(date)}','${esc(time)}','${esc(slot.classId||'')}',this.value)"><option value="">Automático${next?' · '+esc(next.name):''}</option>${options}</select></div>
    <span class="badge ${stateClass} rotation-state-v55">${state}</span>
    <div class="rotation-action-v55">${action}</div>
  </div>`;
}
function selectEquipmentRotationDay(date){const input=document.getElementById('equipmentRotationDate');if(input)input.value=date;renderEquipmentRotationCenter();requestAnimationFrame(()=>document.getElementById(`rotation-day-${date}`)?.scrollIntoView({behavior:'smooth',block:'start'}));}
function renderEquipmentRotationCenter(){
  const root=document.getElementById('equipmentRotationControl');if(!root)return;
  ensureEquipmentData();ensureV7Data();normalizeAllStudentDays();
  const input=document.getElementById('equipmentRotationDate'),anchor=input?.value||todayISO();if(input&&!input.value)input.value=anchor;
  const filter=document.getElementById('equipmentRotationFilter')?.value||'all';
  const search=String(document.getElementById('equipmentRotationSearch')?.value||'').trim().toLowerCase();
  const dates=rotationWeekDates(anchor),today=todayISO(),all=[];
  dates.forEach(date=>db.students.filter(s=>s.status==='Ativo').forEach(s=>rotationScheduleForStudent(s,date).forEach(slot=>all.push({s,slot,date}))));
  const matches=x=>(!search||String(x.s.name||'').toLowerCase().includes(search))&&(filter==='all'||filter==='scheduled'&&x.slot.classId||filter==='pending'&&!x.slot.equipmentId);
  const filtered=all.filter(matches);
  const dayItems=filtered.filter(x=>x.date===anchor);
  const grouped=new Map();dayItems.forEach(x=>{const key=x.slot.time||'23:59';if(!grouped.has(key))grouped.set(key,{date:anchor,time:key,items:[]});grouped.get(key).items.push(x);});
  const pending=all.filter(x=>!x.slot.equipmentId).length,studentsCount=new Set(all.map(x=>x.s.id)).size,slotCount=new Set(all.map(x=>`${x.date}|${x.slot.time||''}`)).size,assigned=all.filter(x=>x.slot.equipmentId).length,total=all.length,pct=total?Math.round((assigned/total)*100):0,start=rotationWeekStart(anchor);
  const selectedAssigned=dayItems.filter(x=>x.slot.equipmentId).length,selectedPending=dayItems.length-selectedAssigned,selectedTimes=new Set(dayItems.map(x=>x.slot.time||'')).size,selectedPct=dayItems.length?Math.round((selectedAssigned/dayItems.length)*100):0;
  const dayShort=['SEG','TER','QUA','QUI','SEX','SÁB','DOM'];
  const weekStrip=dates.map(date=>{const d=new Date(`${date}T12:00:00`),count=all.filter(x=>x.date===date).length,p=all.filter(x=>x.date===date&&!x.slot.equipmentId).length,isToday=date===today,isSel=date===anchor;return `<button type="button" class="rotation-v55-day ${isSel?'is-selected':''} ${isToday?'is-today':''}" aria-pressed="${isSel}" onclick="selectEquipmentRotationDay('${date}')"><b>${dayShort[(d.getDay()+6)%7]}</b><span>${String(d.getDate()).padStart(2,'0')}</span><small>${d.toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</small><em>${count?`${count} aluno${count===1?'':'s'}${p?' · '+p+' pend.':''}`:'Sem aulas'}</em></button>`}).join('');
  const summary=`<div class="rotation-v55-hero"><div class="rotation-v55-title"><div class="rotation-v55-icon">↻</div><div><strong>Rodízio de Pilates</strong><small>Semana de ${esc(dateBR(start))} · selecione um dia para controlar os aparelhos das aulas.</small></div></div><div class="rotation-v55-progress"><div class="rotation-v55-progress-head"><span>Organização da semana</span><b>${pct}%</b></div><div class="rotation-v55-bar"><i style="width:${pct}%"></i></div></div></div><div class="rotation-v55-days">${weekStrip}</div><div class="rotation-v55-summary"><div class="rotation-v55-stat"><b>${studentsCount}</b><span>Alunos</span></div><div class="rotation-v55-stat"><b>${slotCount}</b><span>Horários</span></div><div class="rotation-v55-stat"><b>${assigned}</b><span>Definidos</span></div><div class="rotation-v55-stat ${pending?'attention':''}"><b>${pending}</b><span>Pendentes</span></div></div>`;
  const selectedDateLabel=rotationWeekLabel(anchor);
  const selected=`<div class="rotation-v56-selected"><div class="rotation-v56-selected-main"><strong>${esc(selectedDateLabel)}</strong><span>Controle do dia selecionado</span></div><div class="rotation-v56-selected-kpis"><span><b>${dayItems.length}</b> alunos</span><span><b>${selectedTimes}</b> horários</span><span><b>${selectedAssigned}</b> definidos</span><span><b>${selectedPending}</b> pendentes</span><span><b>${selectedPct}%</b> organizado</span></div></div>`;
  const content=grouped.size?[...grouped.values()].sort((a,b)=>String(a.time).localeCompare(String(b.time))).map(g=>renderRotationTimeGroup(anchor,g.time,g.items)).join(''):`<div class="rotation-v55-empty">Nenhuma aula encontrada para <strong>${esc(selectedDateLabel)}</strong> com os filtros atuais.<br><small>Selecione outro dia, altere o filtro ou limpe a busca.</small></div>`;
  root.innerHTML=summary+selected+`<div class="rotation-v56-hint"><b>Como usar:</b> cada linha representa um aluno naquele horário. Escolha o próximo aparelho e o sistema valida o rodízio automaticamente.</div>`+content;
}

function setRotationForSchedule(studentId,date,time,classId,equipmentId){const s=studentById(studentId);if(!s)return;const id=String(equipmentId||''),last=previousEquipmentForStudent(studentId,date,time,classId||'');if(id){const e=equipmentById(id);if(!e||!e.active){toast('Equipamento não está ativo.');renderEquipmentRotationCenter();return;}if(last?.equipmentId===id){toast('Não é permitido repetir o último equipamento.');renderEquipmentRotationCenter();return;}if(!equipmentAvailable(e,date,time,classId||'')){toast('Equipamento indisponível neste horário.');renderEquipmentRotationCenter();return;}}if(classId){const c=classById(classId);if(c){c.equipmentId=id;c.updatedAt=new Date().toISOString();}}else{s.nextEquipmentId=id;s.updatedAt=new Date().toISOString();}if(!saveDB())return;renderEquipmentRotationCenter();renderStudents();toast(id?'Rodízio atualizado.':'Rodízio automático restaurado.');}

const EQUIPMENT_CATEGORIES={
  Reformer:{icon:'reformer',tone:'violet'},
  Cadillac:{icon:'cadillac',tone:'blue'},
  Chair:{icon:'chair',tone:'amber'},
  Barrel:{icon:'barrel',tone:'green'},
  'Acessório':{icon:'ring',tone:'rose'},
  Outro:{icon:'cube',tone:'gray'}
};
function equipmentCategoryInfo(cat){return EQUIPMENT_CATEGORIES[cat]||EQUIPMENT_CATEGORIES.Outro;}
window.__eqCategoryFilter=window.__eqCategoryFilter||'all';
function setEquipmentCategoryFilter(cat){window.__eqCategoryFilter=cat;renderEquipment();}
function renderEquipment(){
  ensureEquipmentData();
  const active=activeEquipment();
  const total=db.equipment.length;
  const uses=db.classes.filter(c=>c.equipmentId&&c.status!=='Cancelada').length;
  const units=active.reduce((a,e)=>a+Number(e.quantity||1),0);
  const k=document.getElementById('equipmentKpis');
  const kpi=(label,val,foot,icon,tone)=>`<div class="module-kpi equipment-kpi tone-${tone}"><span class="module-kpi-ico">${uiIcon(icon,22)}</span><div class="label">${label}</div><div class="value">${val}</div><div class="foot">${foot}</div></div>`;
  if(k)k.innerHTML=kpi('Aparelhos',total,'Cadastrados','layers','violet')+kpi('Ativos',active.length,'No rodízio','power','green')+kpi('Unidades',units,'Disponíveis nas aulas','box','blue')+kpi('Aulas com aparelho',uses,'Histórico de uso','pulse','amber');

  /* filtros */
  const chipsEl=document.getElementById('equipmentCategoryChips');
  const cats=Object.keys(EQUIPMENT_CATEGORIES);
  const catCount=c=>db.equipment.filter(e=>(e.category||'Outro')===c).length;
  const cur=window.__eqCategoryFilter||'all';
  if(chipsEl)chipsEl.innerHTML=`<button type="button" class="eq-chip ${cur==='all'?'active':''}" onclick="setEquipmentCategoryFilter('all')">Todos <b>${total}</b></button>`+
    cats.filter(c=>catCount(c)>0||cur===c).map(c=>`<button type="button" class="eq-chip tone-${equipmentCategoryInfo(c).tone} ${cur===c?'active':''}" onclick="setEquipmentCategoryFilter('${c}')">${uiIcon(equipmentCategoryInfo(c).icon,15)}${c} <b>${catCount(c)}</b></button>`).join('');
  const term=(document.getElementById('equipmentInvSearch')?.value||'').toLowerCase().trim();
  const shown=db.equipment.filter(e=>(cur==='all'||(e.category||'Outro')===cur)&&(!term||[e.name,e.category,e.notes].join(' ').toLowerCase().includes(term)));
  const maxUse=Math.max(1,...db.equipment.map(e=>equipmentUsageCount(e.id)));

  const vg=document.getElementById('equipmentVisualGrid');
  if(vg){
    vg.innerHTML=shown.length?shown.map(e=>{
      const count=equipmentUsageCount(e.id);
      const info=equipmentCategoryInfo(e.category);
      const pct=Math.round(count/maxUse*100);
      return `<article class="equipment-inventory-card tone-${info.tone} ${e.active?'':'is-off'}">
        <div class="eq-card-top">
          <div class="eq-thumb">${equipmentIconSVG(equipmentById(e.id),46)}</div>
          <div class="eq-info">
            <div class="eq-name" title="${esc(e.name)}">${esc(e.name)}</div>
            <span class="eq-cat">${uiIcon(info.icon,14)}${esc(e.category||'Aparelho')}</span>
          </div>
          <span class="eq-state ${e.active?'on':'off'}">${e.active?'Ativo':'Inativo'}</span>
        </div>
        <div class="eq-stats">
          <div><b>${Number(e.quantity||1)}</b><small>${Number(e.quantity||1)===1?'unidade':'unidades'}</small></div>
          <div><b>${count}</b><small>${count===1?'aula':'aulas'}</small></div>
        </div>
        <div class="eq-usage" title="Uso em relação ao aparelho mais usado"><span style="width:${pct}%"></span></div>
        ${e.notes?`<p class="eq-notes">${esc(e.notes)}</p>`:''}
        <div class="equipment-inventory-actions">
          <button class="btn small primary-soft" type="button" onclick="openEquipmentModal('${e.id}')" title="Editar">${uiIcon('pencil',15)}<span>Editar</span></button>
          <button class="btn small" type="button" onclick="toggleEquipment('${e.id}')" title="${e.active?'Desativar':'Ativar'}">${uiIcon('power',15)}<span>${e.active?'Desativar':'Ativar'}</span></button>
          <button class="btn danger-soft small icon ios-delete-button" type="button" onclick="deleteEquipment('${e.id}')" title="Excluir" aria-label="Excluir ${esc(e.name)}">${trashIcon(15)}</button>
        </div>
      </article>`;
    }).join(''):`<div class="equipment-inventory-empty">${uiIcon('layers',32)}<strong>${db.equipment.length?'Nenhum aparelho neste filtro':'Nenhum aparelho cadastrado'}</strong><span>${db.equipment.length?'Altere a categoria ou a busca.':'Use <b>Novo</b> para começar.'}</span></div>`;
  }

  const el=document.getElementById('equipmentTable');
  if(el)el.innerHTML='';
  const rs=document.getElementById('equipmentRotationSummary');
  if(rs)rs.innerHTML='';
  renderEquipmentRotationCenter();
}
if(!window.__rotationCenterTicker){window.__rotationCenterTicker=setInterval(()=>{if(document.getElementById('page-equipment')?.classList.contains('active'))renderEquipmentRotationCenter();},30000);}
function openEquipmentModal(id=null){
  ensureEquipmentData();
  const e=equipmentById(id)||{name:'',category:'Reformer',quantity:1,active:true,notes:''};
  const cats=['Reformer','Cadillac','Chair','Barrel','Acessório','Outro'];
  const body=`<div class="form-grid">
    <div class="field"><label>Nome do equipamento *</label><input id="eqName" value="${esc(e.name)}" placeholder="Ex.: Reformer 01"></div>
    <div class="field"><label>Categoria</label><select id="eqCategory">${cats.map(c=>`<option ${e.category===c?'selected':''}>${c}</option>`).join('')}</select></div>
    <div class="field"><label>Quantidade de unidades *</label><input id="eqQuantity" type="number" min="1" max="99" value="${Number(e.quantity||1)}"></div>
    <div class="field"><label>Status no rodízio</label><select id="eqActive"><option value="1" ${e.active?'selected':''}>Ativo — participar do rodízio</option><option value="0" ${!e.active?'selected':''}>Inativo — não sugerir</option></select></div>
    <div class="field full"><label>Observações</label><textarea id="eqNotes" placeholder="Localização, estado, cuidados...">${esc(e.notes||'')}</textarea></div>
  </div>`;
  openModal(id?'Editar Equipamento':'Adicionar Equipamento',body,()=>saveEquipment(id));
}
function saveEquipment(id=null){
  ensureEquipmentData();
  const name=document.getElementById('eqName')?.value.trim();
  if(!name){toast('Informe o nome do equipamento.');return;}
  const obj={
    id:id||uid('eq'),name,
    category:document.getElementById('eqCategory')?.value||'Outro',
    quantity:Math.max(1,Number(document.getElementById('eqQuantity')?.value||1)),
    active:document.getElementById('eqActive')?.value!=='0',
    notes:document.getElementById('eqNotes')?.value.trim()||''
  };
  const i=db.equipment.findIndex(e=>e.id===id);
  if(i>=0)db.equipment[i]=obj;else db.equipment.push(obj);
  saveDB();closeModal();renderAll();toast(id?'Equipamento atualizado.':'Equipamento adicionado ao rodízio.');
}
function toggleEquipment(id){
  const e=equipmentById(id);if(!e)return;
  e.active=!e.active;saveDB();renderEquipment();updateMenuBadges();
  toast(`${e.name}: ${e.active?'ativo no rodízio':'retirado do rodízio'}.`);
}
async function deleteEquipment(id){
  const e=equipmentById(id);if(!e)return;
  const used=db.classes.some(c=>c.equipmentId===id);
  const ok=await iosConfirm(
    used?'O equipamento será removido do cadastro, mas o histórico das aulas será preservado.':'O equipamento será removido do cadastro.',
    {title:'Excluir equipamento',okLabel:'Excluir',danger:true}
  );
  if(!ok)return;
  db.equipment=db.equipment.filter(x=>x.id!==id);
  saveDB();renderAll();toast('Equipamento excluído.');
}

function openClassModal(date=null,studentId=null,classId=null,preselectedEquipmentId=null){
  const c=classById(classId)||{}; editingId=classId;
  const selected=studentId||c.studentId||'';
  const rotationEquipmentId=preselectedEquipmentId||c.equipmentId||studentById(selected)?.nextEquipmentId||'';
  const students=activeStudents().map(s=>`<option value="${s.id}" ${selected===s.id?'selected':''}>${esc(s.name)} — ${esc(s.time||'sem horário')}</option>`).join('');
  const teachers=db.teachers.map(t=>`<option ${c.teacher===t?'selected':''}>${esc(t)}</option>`).join('');
  const hours=db.hours.map(h=>hourOption(h,c.time)).join('');
  const body=`<div class="form-grid"><div class="field"><label>Data *</label><input id="cDate" type="date" value="${esc(c.date||date||todayISO())}"></div><div class="field"><label>Horário *</label><select id="cTime"><option value="">Selecione</option>${hours}</select><div id="classCapacityIndicator"></div></div><div class="field full"><label>Aluno *</label><select id="cStudent"><option value="">Selecione</option>${students}</select></div><div class="field"><label>Professor</label><select id="cTeacher"><option value="">Selecione</option>${teachers}</select></div><div class="field"><label>Duração (min)</label><input id="cDuration" type="number" min="15" value="${c.duration||db.settings.duration||60}"></div><div class="field"><label>Status</label><select id="cStatus"><option ${c.status==='Agendada'?'selected':''}>Agendada</option><option ${c.status==='Realizada'?'selected':''}>Realizada</option><option ${c.status==='Cancelada'?'selected':''}>Cancelada</option><option ${c.status==='Falta'?'selected':''}>Falta</option></select></div><div class="field"><label>Tipo de aula</label><label class="ios-switch-field"><input id="cExperimental" type="checkbox" ${c.experimental?'checked':''}> Aula experimental</label></div><div class="field full"><label>Equipamento de Pilates</label><select id="cEquipment" onchange="updateEquipmentRecommendation()">${equipmentSelectOptions(selected,c.date||date||todayISO(),c.time||'',rotationEquipmentId,classId)}</select><div class="equipment-auto" id="equipmentRecommendation">Selecione aluno, data e horário para aplicar o rodízio automático.</div><div id="studentEquipmentHistory" class="rotation-block-v41" style="display:none"></div></div><div class="field full"><label>Observação</label><textarea id="cNotes">${esc(c.notes||'')}</textarea></div></div>`;
  openModal(classId?'Editar Aula':'Agendar Aula',body,saveClass);
  ['cStudent','cDate','cTime'].forEach(id=>document.getElementById(id)?.addEventListener('change',()=>{refreshClassEquipmentOptions();refreshClassCapacityIndicator();}));
  refreshClassEquipmentOptions();refreshClassCapacityIndicator();
}
function activeClassesAtSlot(date,time,ignoreId=null){
  return db.classes.filter(c=>c.date===date&&c.time===time&&c.status!=='Cancelada'&&c.id!==ignoreId);
}
function slotCapacity(date,time,ignoreId=null){
  const capacity=Math.max(0,Number(db?.settings?.capacity||0));
  const used=activeClassesAtSlot(date,time,ignoreId).length;
  return {capacity,used,remaining:Math.max(0,capacity-used),full:capacity>0&&used>=capacity,percent:capacity?Math.min(100,Math.round(used/capacity*100)):0};
}
function slotCapacityMessage(date,time,ignoreId=null){
  const x=slotCapacity(date,time,ignoreId);
  if(!x.capacity)return 'Capacidade não configurada';
  if(x.full)return `Lotado · ${x.used}/${x.capacity} alunos`;
  return `${x.used}/${x.capacity} alunos · ${x.remaining} vaga${x.remaining===1?'':'s'} disponível${x.remaining===1?'':'eis'}`;
}
function refreshClassCapacityIndicator(){
  const el=document.getElementById('classCapacityIndicator');
  const date=document.getElementById('cDate')?.value,time=document.getElementById('cTime')?.value;
  if(!el||!date||!time){if(el)el.innerHTML='';return;}
  const x=slotCapacity(date,time,editingId);
  el.innerHTML=x.capacity?`<div class="class-capacity-live ${x.full?'is-full':x.percent>=80?'is-high':''}"><span>Ocupação do horário</span><strong>${x.used}/${x.capacity}</strong><small>${x.full?'Horário lotado':`${x.remaining} vaga${x.remaining===1?'':'s'} disponível${x.remaining===1?'':'eis'}`}</small><i><b style="width:${x.percent}%"></b></i></div>`:'<div class="class-capacity-live"><span>Ocupação do horário</span><small>Defina a capacidade máxima em Configurações.</small></div>';
}

function saveClass(){
  const studentId=document.getElementById('cStudent').value, date=document.getElementById('cDate').value, time=document.getElementById('cTime').value;
  if(!studentId||!date||!time){toast('Informe aluno, data e horário.');return;}
  const s=studentById(studentId), existing=classById(editingId);
  const selectedEquipment=document.getElementById('cEquipment')?.value||'';
  const duration=Math.max(1,Number(document.getElementById('cDuration').value||db.settings.duration||60));
  const capacityState=slotCapacity(date,time,editingId);
  if(capacityState.capacity>0 && capacityState.full){toast(`Horário lotado: ${capacityState.used}/${capacityState.capacity} alunos.`);refreshClassCapacityIndicator();return;}
  const autoEquipment=recommendEquipment(studentId,date,time,editingId);
  const equipmentId=selectedEquipment||autoEquipment?.id||'';
  if(!equipmentId){toast('Não há equipamento disponível para o rodízio neste horário.');return;}
  const eq=equipmentById(equipmentId);
  if(!eq||!eq.active){toast('O equipamento selecionado não está ativo no rodízio.');refreshClassEquipmentOptions();return;}
  const last=previousEquipmentForStudent(studentId,date,time,editingId);
  if(last?.equipmentId&&String(last.equipmentId)===String(equipmentId)){toast('O equipamento usado na última aula não pode ser repetido imediatamente.');refreshClassEquipmentOptions();return;}
  if(!equipmentAvailable(eq,date,time,editingId,duration)){toast('O equipamento selecionado ficou indisponível nesse horário. Escolha outro equipamento.');refreshClassEquipmentOptions();return;}
  const obj={id:editingId||uid('cls'),studentId,studentName:s?.name||'',teacher:document.getElementById('cTeacher').value||s?.teacher||'',date,time,duration,status:document.getElementById('cStatus').value,experimental:!!document.getElementById('cExperimental')?.checked,equipmentId,notes:document.getElementById('cNotes').value,createdAt:existing?.createdAt||new Date().toISOString()};
  if(editingId){const i=db.classes.findIndex(x=>x.id===editingId);if(i>=0)db.classes[i]=obj;}else db.classes.push(obj);
  if(s&&String(s.nextEquipmentId||'')===String(equipmentId))s.nextEquipmentId='';
  s.updatedAt=new Date().toISOString();
  if(!saveDB())return;
  closeModal();renderAll();if(typeof renderControlEquipment==='function'){window.controlEquipmentDate=date;renderControlEquipment();}toast('Aula salva com sucesso.');
}
function setClassStatus(id,status){const c=classById(id);if(!c)return;c.status=status;c.updatedAt=new Date().toISOString();saveDB();renderAll();if(typeof renderControlEquipment==='function'){window.controlEquipmentDate=c.date||todayISO();renderControlEquipment();}toast(`Aula marcada como ${status.toLowerCase()}.`);}
async function deleteClass(id){const confirmed=await iosConfirm('A aula será removida do agendamento.',{title:'Excluir aula',okLabel:'Excluir',danger:true});if(!confirmed)return;db.classes=db.classes.filter(c=>c.id!==id);saveDB();renderAll();toast('Aula excluída.');}

function formatTime12(value){
  const m=String(value||'').match(/^(\d{1,2}):(\d{2})$/); if(!m)return String(value||'');
  return `${String(Number(m[1])).padStart(2,'0')}:${m[2]}`;
}
function formatTimeRange(value){
  const m=String(value||'').match(/^(\d{1,2}):(\d{2})$/); if(!m)return String(value||'');
  const h=Number(m[1]), min=Number(m[2]), duration=Number(db?.settings?.duration||60);
  const end=new Date(2000,0,1,h,min); end.setMinutes(end.getMinutes()+duration);
  const pad=n=>String(n).padStart(2,'0');
  return `${formatTime12(value)} às ${pad(end.getHours())}:${pad(end.getMinutes())}`;
}
function hourOption(value, selected=''){return `<option value="${esc(value)}" ${String(selected)===String(value)?'selected':''}>${esc(formatTimeRange(value))}</option>`;}

function getHourDays(hour){
  db.hourDays=db.hourDays||{};
  const v=db.hourDays[hour];
  return Array.isArray(v)&&v.length?v.map(String):['1','2','3','4','5'];
}
function occupancyStats(){
  /* Ocupação semanal: vagas = (dias oferecidos de cada horário) × capacidade; ocupadas = aluno × dia dentro da grade, limitado à capacidade de cada célula. */
  const cap=Math.max(0,Number(db.settings?.capacity||0));
  const hours=Array.isArray(db.hours)?db.hours:[];
  const perHour={}, offered=new Set(), cells={};
  hours.forEach(h=>{const ds=getHourDays(h);perHour[h]={days:ds.length,capacity:ds.length*cap,used:0,over:0};ds.forEach(d=>offered.add(h+'|'+d));});
  let noDays=0,outside=0;
  activeStudents().forEach(s=>{
    const days=normalizeStudentDays(s.days);
    if(!days.length||!s.time){noDays++;return}
    days.forEach(d=>{const k=s.time+'|'+d;if(offered.has(k))cells[k]=(cells[k]||0)+1;else outside++;});
  });
  let used=0,over=0;
  Object.entries(cells).forEach(([k,n])=>{const h=k.split('|')[0],u=Math.min(n,cap),o=Math.max(0,n-cap);used+=u;over+=o;if(perHour[h]){perHour[h].used+=u;perHour[h].over+=o;}});
  const capacity=offered.size*cap;
  return {cap,capacity,used,free:Math.max(0,capacity-used),pct:capacity?used/capacity*100:0,over,noDays,outside,perHour,cells,offered};
}
function hourDaysLabel(hour){
  const names={1:'Seg',2:'Ter',3:'Qua',4:'Qui',5:'Sex',6:'Sáb',0:'Dom'};
  return getHourDays(hour).map(d=>names[String(d)]||d).join(', ');
}
function renderHours(){
  const el=document.getElementById('hoursGrid'); if(!el)return;
  const active=activeStudents(), occ=occupancyStats();
  const counts={}; db.hours.forEach(h=>counts[h]=active.filter(s=>s.time===h).length);
  el.innerHTML=`<div class="module-kpis"><div class="module-kpi"><div class="label">Horários cadastrados</div><div class="value">${db.hours.length}</div><div class="foot">Grade configurada</div></div><div class="module-kpi"><div class="label">Alunos ativos</div><div class="value">${active.length}</div><div class="foot">Com cadastro ativo</div></div><div class="module-kpi"><div class="label">Horário mais ocupado</div><div class="value" style="font-size:18px">${formatTimeRange(Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0]||'')}</div><div class="foot">${Math.max(0,...Object.values(counts))} aluno(s)</div></div><div class="module-kpi"><div class="label">Capacidade</div><div class="value">${db.settings.capacity||0}</div><div class="foot">Por horário</div></div></div><div class="table-wrap"><table><thead><tr><th>Horário</th><th>Dias</th><th>Alunos</th><th>Ocupação</th><th>Disponibilidade</th><th>Ações</th></tr></thead><tbody>${db.hours.map((h,i)=>{const n=counts[h]||0,ph=occ.perHour[h]||{capacity:0,used:0},pct=ph.capacity?ph.used/ph.capacity*100:0;return `<tr><td><strong>${esc(formatTimeRange(h))}</strong></td><td><span class="badge info">${esc(hourDaysLabel(h))}</span></td><td>${n}</td><td><div class="occupancy-meter"><small>${pct.toFixed(0)}%</small><div class="progress"><span style="width:${pct}%"></span></div></div></td><td>${Math.max(0,ph.capacity-ph.used)} vaga(s)/sem.</td><td><div class="row-actions"><button class="btn small" type="button" onclick="addHour(${i})">Editar</button><button class="btn danger small icon ios-delete-button" type="button" onclick="deleteHour(${i})" title="Excluir" aria-label="Excluir">${trashIcon(15)}</button></div></td></tr>`}).join('')}</tbody></table></div>`;
}

function renderOccupancy(){
  const st=occupancyStats(), cap=st.cap, active=activeStudents();
  [['occCapacity',st.capacity],['occOccupied',st.used],['occFree',st.free],['occPercent',st.pct.toFixed(0)+'%']].forEach(([id,v])=>{const e=document.getElementById(id);if(e)e.textContent=v;});
  const lab=document.getElementById('occupancyChartLabel');if(lab)lab.textContent=st.pct.toFixed(0)+'% da capacidade semanal';
  const grid=document.getElementById('occupancyGrid');if(!grid)return;
  const dayNames={1:'Seg',2:'Ter',3:'Qua',4:'Qui',5:'Sex',6:'Sáb',0:'Dom'};
  const showSun=[...st.offered].some(k=>k.split('|')[1]==='0');
  const dayList=[1,2,3,4,5,6].concat(showSun?[0]:[]);
  grid.style.gridTemplateColumns='100px repeat('+dayList.length+',minmax(100px,1fr))';
  let html='<div class="occ-cell occ-head">Hora</div>'+dayList.map(d=>`<div class="occ-cell occ-head">${dayNames[d]}</div>`).join('');
  db.hours.forEach(h=>{
    html+=`<div class="occ-cell occ-time">${esc(formatTimeRange(h))}</div>`;
    dayList.forEach(d=>{
      if(!st.offered.has(h+'|'+d)){html+='<div class="occ-cell" style="opacity:.35"><span class="muted">—</span></div>';return;}
      const list=active.filter(s=>s.time===h&&normalizeStudentDays(s.days).includes(String(d)));
      const n=list.length,p=cap?Math.min(100,n/cap*100):0;
      html+=`<div class="occ-cell"><strong${n>cap&&cap?' style="color:var(--bad)"':''}>${n}/${cap}</strong><div class="progress" style="margin:6px 0"><span style="width:${p}%"></span></div><div class="muted" style="font-size:9px">${list.slice(0,2).map(s=>esc(s.name.split(' ')[0])).join(', ')}</div></div>`;
    });
  });
  grid.innerHTML=html;
  /* avisos que explicam diferenças no cálculo */
  let note=document.getElementById('occNote');
  if(!note){note=document.createElement('div');note.id='occNote';note.className='muted';note.style.cssText='font-size:11px;margin:0 0 8px';grid.parentNode.insertBefore(note,grid);}
  const msgs=[];
  if(st.over)msgs.push(st.over+' vaga(s) excedida(s) (turma acima da capacidade)');
  if(st.noDays)msgs.push(st.noDays+' aluno(s) ativo(s) sem dias/horário definidos (fora do cálculo)');
  if(st.outside)msgs.push(st.outside+' presença(s) em dia/horário fora da grade');
  note.textContent=msgs.join(' · ');note.style.display=msgs.length?'':'none';
  if(typeof Chart!=='undefined'){const ctx=document.getElementById('occupancyBarChart');if(ctx){if(charts.occupancy)charts.occupancy.destroy();const vals=db.hours.map(h=>(st.perHour[h]||{used:0}).used);charts.occupancy=new Chart(ctx,{type:'bar',data:{labels:db.hours.map(formatTimeRange),datasets:[{data:vals,borderRadius:8,backgroundColor:chartPalette(5)[0]}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.raw} de ${(st.perHour[db.hours[c.dataIndex]]||{}).capacity||0} vagas na semana`}}},scales:{y:{beginAtZero:true,ticks:{precision:0}}}}});}}
}

function changeFinanceMonth(delta){
  currentMonth=new Date(currentMonth.getFullYear(),currentMonth.getMonth()+Number(delta||0),1);
  renderFinance();
  const lbl=document.getElementById('financeMonthLabel'); if(lbl)lbl.textContent=monthLabel(currentMonth);
}
function goFinanceCurrentMonth(){ currentMonth=new Date(); currentMonth.setDate(1); renderFinance(); const lbl=document.getElementById('financeMonthLabel'); if(lbl)lbl.textContent=monthLabel(currentMonth); }

function financeTone(f){
  const status=f.status||'Pendente';
  if(status==='Cancelado')return{tone:'',badge:'<span class="badge gray">Cancelado</span>'};
  if(status==='Pago'){const w=f.paidAt?' em '+dateBR(f.paidAt):'';return{tone:'ok',badge:'<span class="badge ok">Pago</span><span class="badge ok">Em dia'+w+'</span>'}}
  if(!f.dueDate)return{tone:'',badge:'<span class="badge warn">Pendente</span>'};
  const diff=Math.round((new Date(f.dueDate+'T12:00:00')-new Date(todayISO()+'T12:00:00'))/864e5);
  if(diff<0)return{tone:'bad',badge:'<span class="badge bad">Pendente</span><span class="badge bad">Atrasado '+(-diff)+'d</span>'};
  if(diff===0)return{tone:'warn',badge:'<span class="badge warn">Pendente</span><span class="badge warn">Vence hoje</span>'};
  if(diff<=7)return{tone:'warn',badge:'<span class="badge warn">Pendente</span><span class="badge warn">Vence em '+diff+'d</span>'};
  return{tone:'',badge:'<span class="badge info">Pendente</span><span class="badge gray">Vence em '+diff+'d</span>'};
}
function financeCardDetails(){
  try{
    const key=monthKey(currentMonth), today=todayISO();
    const rows=db.finance.filter(f=>sameMonth(f.dueDate,key)&&f.status!=='Cancelado');
    const rev=rows.filter(f=>(f.type||'Receita')!=='Despesa'), exp=rows.filter(f=>f.type==='Despesa');
    const paid=rev.filter(f=>f.status==='Pago'), open=rev.filter(f=>f.status!=='Pago');
    const late=open.filter(f=>f.dueDate&&f.dueDate<today), expPaid=exp.filter(f=>f.status==='Pago');
    const sum=a=>a.reduce((s,f)=>s+Number(f.value||0),0);
    const pl=(n,a,b)=>n+' '+(n===1?a:b);
    const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
    const exp$=sum(rev), rec$=sum(paid), net=rec$-sum(expPaid), rate=exp$?Math.min(100,rec$/exp$*100):0;
    set('financeExpectedFoot',pl(rev.length,'lançamento','lançamentos'));
    set('financeReceivedFoot',pl(paid.length,'pago','pagos'));
    set('financePendingFoot',open.length?open.length+' em aberto'+(late.length?' · '+late.length+' atras.':''):'Tudo recebido');
    set('financeRateFoot',paid.length+' de '+rev.length+' pagos');
    const bar=document.getElementById('financeRateBar');if(bar)bar.style.width=rate.toFixed(0)+'%';
    set('financeExpensesFoot',pl(exp.length,'despesa','despesas')+' · '+money(sum(expPaid))+' pagas');
    set('financeNetFoot','Recebido − despesas pagas');
    const n=document.getElementById('financeNet');if(n)n.dataset.tone=net>=0?'ok':'bad';
  }catch(e){}
}
function renderFinance(){
  const key=monthKey(currentMonth);
  const rows=db.finance.filter(f=>sameMonth(f.dueDate,key));
  const revenues=rows.filter(f=>(f.type||'Receita')!=='Despesa' && f.status!=='Cancelado');
  const expenses=rows.filter(f=>f.type==='Despesa' && f.status!=='Cancelado');
  const expected=revenues.reduce((a,f)=>a+Number(f.value||0),0);
  const received=revenues.filter(f=>f.status==='Pago').reduce((a,f)=>a+Number(f.value||0),0);
  const pending=Math.max(0,expected-received);
  const expenseTotal=expenses.reduce((a,f)=>a+Number(f.value||0),0);
  const expensePaid=expenses.filter(f=>f.status==='Pago').reduce((a,f)=>a+Number(f.value||0),0);
  const net=received-expensePaid;
  const rate=expected?received/expected*100:0;
  [['financeExpected',money(expected)],['financeReceived',money(received)],['financePending',money(pending)],['financeRate',rate.toFixed(0)+'%'],['financeExpenses',money(expenseTotal)],['financeNet',money(net)]].forEach(([id,v])=>{const e=document.getElementById(id);if(e)e.textContent=v;});
  const lbl=document.getElementById('financeMonthLabel');if(lbl)lbl.textContent=monthLabel(currentMonth);
  financeCardDetails();
  const el=document.getElementById('financeTable');if(!el)return;el.closest('table').dataset.cardTitle='Aluno';
  const ordered=[...rows].sort((a,b)=>String(a.dueDate).localeCompare(String(b.dueDate)));
  el.innerHTML=ordered.map(f=>{const isExp=f.type==='Despesa';const status=f.status||'Pendente';const tn=financeTone(f);return `<tr data-tone="${tn.tone}"><td>${isExp?'🔻 ':''}${esc(f.description||'Lançamento')}</td><td>${isExp?'—':esc(f.studentName||studentById(f.studentId)?.name||'—')}</td><td>${dateBR(f.dueDate)}</td><td><strong>${money(f.value)}</strong></td><td>${tn.badge}</td><td>${esc(f.paymentMethod||'—')}</td><td>${isExp?'—':esc(studentById(f.studentId)?.plan||'—')}</td><td>${esc(f.notes||'—')}</td><td><div class="row-actions">${status!=='Pago'&&status!=='Cancelado'?`<button class="btn success small" onclick="markFinancePaid('${f.id}')">Marcar pago</button>`:''}<button class="btn small" onclick="${isExp?'openExpenseModal':'openFinanceModal'}('${f.id}')">Editar</button><button class="btn danger small icon ios-delete-button" onclick="deleteFinance('${f.id}')" title="Excluir" aria-label="Excluir">${trashIcon(15)}</button></div></td></tr>`}).join('')||'<tr><td colspan="9"><div class="empty">Nenhum lançamento neste mês.</div></td></tr>';
}
function openFinanceModal(id=null){
  editingId=id; const f=db.finance.find(x=>x.id===id)||{}; const opts=db.students.map(s=>`<option value="${s.id}" ${(f.studentId===s.id)?'selected':''}>${esc(s.name)}</option>`).join(''); const pays=db.payments.map(p=>`<option ${f.paymentMethod===p?'selected':''}>${esc(p)}</option>`).join('');
  const body=`<div class="form-grid"><div class="field full"><label>Aluno</label><select id="finStudent"><option value="">Sem aluno</option>${opts}</select></div><div class="field"><label>Descrição</label><input id="finDesc" value="${esc(f.description||'Mensalidade')}"></div><div class="field"><label>Valor</label><input id="finValue" type="number" step="0.01" value="${f.value??''}"></div><div class="field"><label>Vencimento</label><input id="finDue" type="date" value="${esc(f.dueDate||todayISO())}"></div><div class="field"><label>Status</label><select id="finStatus"><option ${f.status==='Pendente'?'selected':''}>Pendente</option><option ${f.status==='Pago'?'selected':''}>Pago</option><option ${f.status==='Cancelado'?'selected':''}>Cancelado</option></select></div><div class="field"><label>Forma de pagamento</label><select id="finPay"><option value="">Selecione</option>${pays}</select></div><div class="field full"><label>Observação</label><textarea id="finNotes">${esc(f.notes||'')}</textarea></div></div>`;
  openModal(id?'Editar Lançamento':'Novo Lançamento',body,saveFinance);
}
function saveFinance(){const sid=document.getElementById('finStudent').value,s=studentById(sid),value=Number(document.getElementById('finValue').value||0),obj={id:editingId||uid('fin'),studentId:sid,studentName:s?.name||'',description:document.getElementById('finDesc').value.trim(),value,dueDate:document.getElementById('finDue').value,status:document.getElementById('finStatus').value,paymentMethod:document.getElementById('finPay').value,notes:document.getElementById('finNotes').value,type:'Receita'};if(!obj.description||!obj.dueDate||value<=0){toast('Informe descrição, valor maior que zero e vencimento.');return;}if(editingId){const i=db.finance.findIndex(x=>x.id===editingId);if(i>=0)db.finance[i]=obj;}else db.finance.push(obj);saveDB();closeModal();renderAll();toast('Lançamento salvo e financeiro atualizado.');}
function markFinancePaid(id){const f=db.finance.find(x=>x.id===id);if(!f)return;f.status='Pago';f.paidAt=todayISO();saveDB();renderAll();toast('Pagamento registrado.');}
async function deleteFinance(id){const confirmed=await iosConfirm('O lançamento financeiro será removido.',{title:'Excluir lançamento',okLabel:'Excluir',danger:true});if(!confirmed)return;db.finance=db.finance.filter(x=>x.id!==id);saveDB();renderAll();}

function renderBilling(){
  renderBillingCentralStatus();
  const key=monthKey(currentMonth), allRows=db.finance.filter(f=>(f.type||'Receita')!=='Despesa'&&sameMonth(f.dueDate,key));
  const rows=allRows.filter(f=>{if(billingCentralFilter==='all')return true;const s=studentById(f.studentId)||{name:f.studentName};return billingStatusForStudent(s,key)===billingCentralFilter;});
  const pending=allRows.filter(f=>f.status==='Pendente'), value=pending.reduce((a,f)=>a+Number(f.value||0),0);
  [['billingPending',pending.length],['billingValue',money(value)]].forEach(([id,v])=>{const e=document.getElementById(id);if(e)e.textContent=v;});
  const el=document.getElementById('billingTable');if(!el)return;
  el.innerHTML=rows.sort((a,b)=>String(a.dueDate).localeCompare(String(b.dueDate))).map(f=>{const s=studentById(f.studentId)||{name:f.studentName,whatsapp:f.whatsapp};const st=billingStatusForStudent(s,key);return `<tr data-tone="${{paid:'ok',due:'warn',overdue:'bad'}[st]||''}"><td><strong>${esc(s.name)}</strong><div class="muted" style="font-size:11px">${esc(s.whatsapp||'Sem WhatsApp')}</div></td><td>${dateBR(f.dueDate)}</td><td><strong>${money(f.value)}</strong></td><td>${st==='paid'?'<span class="badge ok">Em dia</span>':st==='overdue'?'<span class="badge bad">Atrasado</span>':'<span class="badge warn">Vencendo</span>'}</td><td><div class="row-actions">${s.whatsapp&&st!=='paid'?`<button class="btn whatsapp small" onclick="sendBillingWhatsApp('${f.id}')"><span class="wa-inline">${waIcon(16)}<span>Cobrar</span></span></button>`:''}${f.status!=='Pago'?`<button class="btn success small" onclick="markFinancePaid('${f.id}')">Pago</button>`:''}</div></td></tr>`}).join('')||'<tr><td colspan="5"><div class="empty">Nenhum registro para este filtro. 🎉</div></td></tr>';
}
function renderBirthdays(){
  const el=document.getElementById('birthdaysList');if(!el)return; const now=new Date(), month=now.getMonth()+1;
  const base=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const list=db.students.filter(s=>s.birth).map(s=>{const [y,m,d]=s.birth.split('-').map(Number);let nx=new Date(base.getFullYear(),m-1,d);if(nx<base)nx=new Date(base.getFullYear()+1,m-1,d);const diff=Math.round((nx-base)/864e5);return {...s,bm:m,bd:d,diff,turning:nx.getFullYear()-y};}).sort((a,b)=>a.diff-b.diff);
  const monthList=list.filter(s=>s.bm===month); const upcoming=list.slice(0,12);
  el.innerHTML=`<div class="module-kpis"><div class="module-kpi"><div class="label">Este mês</div><div class="value">${monthList.length}</div><div class="foot">Aniversários</div></div><div class="module-kpi"><div class="label">Próximo</div><div class="value" style="font-size:16px">${upcoming[0]?esc(upcoming[0].name.split(' ')[0]):'—'}</div><div class="foot">${upcoming[0]?`${String(upcoming[0].bd).padStart(2,'0')}/${String(upcoming[0].bm).padStart(2,'0')}`:'Sem cadastro'}</div></div><div class="module-kpi"><div class="label">Com nascimento</div><div class="value">${list.length}</div><div class="foot">Cadastros</div></div><div class="module-kpi"><div class="label">Ação</div><div class="value" style="font-size:15px">WhatsApp</div><div class="foot">Mensagem pronta</div></div></div><div style="display:grid;gap:9px">${upcoming.map(s=>`<div class="birth-card"><div style="display:flex;align-items:center;gap:12px"><div class="birth-date">${String(s.bd).padStart(2,'0')}/${String(s.bm).padStart(2,'0')}</div><div><strong>${esc(s.name)}</strong><div class="muted">${s.diff===0?'🎂 Hoje':s.diff===1?'Amanhã':`em ${s.diff} dias`}${s.turning>0&&s.turning<120?` · ${s.turning} anos`:''}${s.plan?` · ${esc(s.plan)}`:''}</div></div></div>${s.whatsapp?`<button class="btn whatsapp small" onclick="sendBirthdayWhatsApp('${s.id}')"><span class="wa-inline">${waIcon(16)}<span>Parabenizar</span></span></button>`:''}</div>`).join('')||'<div class="empty">Cadastre a data de nascimento dos alunos para acompanhar aniversários.</div>'}</div>`;
}

function openMakeupModal(id=null,studentId=null){
  editingId=id; const m=db.makeups.find(x=>x.id===id)||{}; const opts=db.students.map(s=>`<option value="${s.id}" ${(m.studentId||studentId)===s.id?'selected':''}>${esc(s.name)}</option>`).join('');
  const body=`<div class="form-grid"><div class="field full"><label>Aluno</label><select id="mkStudent"><option value="">Selecione</option>${opts}</select></div><div class="field"><label>Data original</label><input id="mkOriginal" type="date" value="${esc(m.originalDate||todayISO())}"></div><div class="field"><label>Nova data</label><input id="mkNew" type="date" value="${esc(m.newDate||'')}"></div><div class="field"><label>Novo horário</label><select id="mkTime"><option value="">Selecione</option>${db.hours.map(h=>`<option ${m.newTime===h?'selected':''}>${h}</option>`).join('')}</select></div><div class="field"><label>Status</label><select id="mkStatus"><option ${m.status==='Pendente'?'selected':''}>Pendente</option><option ${m.status==='Agendada'?'selected':''}>Agendada</option><option ${m.status==='Realizada'?'selected':''}>Realizada</option><option ${m.status==='Cancelada'?'selected':''}>Cancelada</option></select></div><div class="field full"><label>Motivo / observação</label><textarea id="mkNotes">${esc(m.notes||'')}</textarea></div></div>`;
  openModal(id?'Editar Reposição':'Agendar Reposição',body,saveMakeup);
}
function saveMakeup(){const sid=document.getElementById('mkStudent').value,s=studentById(sid);if(!sid){toast('Selecione o aluno.');return;}const obj={id:editingId||uid('mk'),studentId:sid,studentName:s?.name||'',originalDate:document.getElementById('mkOriginal').value,newDate:document.getElementById('mkNew').value,newTime:document.getElementById('mkTime').value,status:document.getElementById('mkStatus').value,notes:document.getElementById('mkNotes').value};if(editingId){const i=db.makeups.findIndex(x=>x.id===editingId);if(i>=0)db.makeups[i]=obj;}else db.makeups.push(obj);saveDB();closeModal();renderAll();toast('Reposição salva.');}
function renderMakeupsPage(){const el=document.getElementById('makeupsTable');if(!el)return;const rows=[...db.makeups].sort((a,b)=>String(a.newDate||'').localeCompare(String(b.newDate||'')));el.innerHTML=rows.map(m=>`<tr><td><strong>${esc(m.studentName||studentById(m.studentId)?.name||'—')}</strong></td><td>${dateBR(m.originalDate)}</td><td>${dateBR(m.newDate)} ${m.newTime?`<span class="schedule-chip">${esc(formatTimeRange(m.newTime))}</span>`:''}</td><td>${classStatusBadge(m.status)}</td><td>${esc(m.notes||'—')}</td><td><div class="row-actions"><button class="btn small" onclick="openMakeupModal('${m.id}')">Editar</button>${m.status==='Agendada'?`<button class="btn success small" onclick="completeMakeup('${m.id}')">Concluir</button>`:''}<button class="btn danger small icon ios-delete-button" onclick="deleteMakeup('${m.id}')" title="Excluir" aria-label="Excluir">${trashIcon(15)}</button></div></td></tr>`).join('')||'<tr><td colspan="6"><div class="empty">Nenhuma reposição cadastrada.</div></td></tr>';}
function completeMakeup(id){const m=db.makeups.find(x=>x.id===id);if(!m)return;m.status='Realizada';saveDB();renderAll();toast('Reposição concluída.');}
async function deleteMakeup(id){const confirmed=await iosConfirm('A reposição será removida.',{title:'Excluir reposição',okLabel:'Excluir',danger:true});if(!confirmed)return;db.makeups=db.makeups.filter(x=>x.id!==id);saveDB();renderAll();}

function openWaitModal(id=null){editingId=id;const w=db.waitlist.find(x=>x.id===id)||{};const body=`<div class="form-grid"><div class="field full"><label>Nome *</label><input id="wName" value="${esc(w.name||'')}"></div><div class="field"><label>WhatsApp</label><input id="wWhatsapp" value="${esc(w.whatsapp||'')}"></div><div class="field"><label>Plano desejado</label><select id="wPlan"><option value="">Selecione</option>${db.plans.map(p=>`<option ${w.plan===p.name?'selected':''}>${esc(p.name)}</option>`).join('')}</select></div><div class="field"><label>Horário desejado</label><select id="wTime"><option value="">Qualquer</option>${db.hours.map(h=>`<option ${w.time===h?'selected':''}>${h}</option>`).join('')}</select></div><div class="field"><label>Prioridade</label><select id="wPriority"><option value="1" ${Number(w.priority||1)===1?'selected':''}>1 — Alta</option><option value="2" ${Number(w.priority||1)===2?'selected':''}>2 — Média</option><option value="3" ${Number(w.priority||1)===3?'selected':''}>3 — Normal</option></select></div><div class="field"><label>Status</label><select id="wStatus"><option ${w.status==='Aguardando'?'selected':''}>Aguardando</option><option ${w.status==='Contactar'?'selected':''}>Contactar</option><option ${w.status==='Convertido'?'selected':''}>Convertido</option><option ${w.status==='Cancelado'?'selected':''}>Cancelado</option></select></div><div class="field full"><label>Observação</label><textarea id="wNotes">${esc(w.notes||'')}</textarea></div></div>`;openModal(id?'Editar Lista de Espera':'Adicionar à Lista de Espera',body,saveWait);}
function saveWait(){const name=document.getElementById('wName').value.trim();if(!name){toast('Informe o nome.');return;}const obj={id:editingId||uid('wait'),name,whatsapp:document.getElementById('wWhatsapp').value.trim(),plan:document.getElementById('wPlan').value,time:document.getElementById('wTime').value,priority:Number(document.getElementById('wPriority').value||3),status:document.getElementById('wStatus').value,notes:document.getElementById('wNotes').value,createdAt:db.waitlist.find(x=>x.id===editingId)?.createdAt||new Date().toISOString()};if(editingId){const i=db.waitlist.findIndex(x=>x.id===editingId);if(i>=0)db.waitlist[i]=obj;}else db.waitlist.push(obj);saveDB();closeModal();renderAll();toast('Contato adicionado à lista de espera.');}
function renderWaitlist(){const el=document.getElementById('waitTable');if(!el)return;const rows=[...db.waitlist].filter(w=>w.status!=='Convertido'&&w.status!=='Cancelado').sort((a,b)=>(a.priority||3)-(b.priority||3)||String(a.createdAt).localeCompare(String(b.createdAt)));el.innerHTML=rows.map(w=>`<tr><td><div style="display:flex;align-items:center;gap:8px"><span class="wait-priority">${w.priority||3}</span><strong>${esc(w.name)}</strong></div></td><td>${esc(w.whatsapp||'—')}</td><td>${esc(w.plan||'—')}</td><td>${esc(w.time||'Qualquer')}</td><td><span class="badge ${w.status==='Contactar'?'warn':'info'}">${esc(w.status)}</span></td><td>${w.createdAt?dateBR(w.createdAt):'—'}</td><td>${esc(w.notes||'—')}</td><td><div class="row-actions">${w.whatsapp?`<button class="btn whatsapp small" onclick="openWaitWhatsApp('${w.id}')"><span class="wa-inline">${waIcon(16)}<span>Contatar</span></span></button>`:''}<button class="btn small" onclick="openWaitModal('${w.id}')">Editar</button><button class="btn success small" onclick="convertWait('${w.id}')">Converter</button><button class="btn danger small icon ios-delete-button" onclick="deleteWait('${w.id}')" title="Excluir" aria-label="Excluir">${trashIcon(15)}</button></div></td></tr>`).join('')||'<tr><td colspan="8"><div class="empty">Lista de espera vazia.</div></td></tr>';}
function openWaitWhatsApp(id){const w=db.waitlist.find(x=>x.id===id);if(!w)return;openWhatsApp(w.whatsapp,`Olá, ${w.name}! 😊 Temos uma possibilidade de vaga no ${db.settings.studioName||'Studio de Pilates'}. Podemos conversar sobre horário e plano?`);}
function convertWait(id){const w=db.waitlist.find(x=>x.id===id);if(!w)return;w.status='Convertido';saveDB();renderAll();openStudentModal(null);toast('Contato convertido. Complete o cadastro do novo aluno.');}
async function deleteWait(id){const confirmed=await iosConfirm('O contato será removido da lista de espera.',{title:'Excluir contato',okLabel:'Excluir',danger:true});if(!confirmed)return;db.waitlist=db.waitlist.filter(x=>x.id!==id);saveDB();renderAll();}

/* Indicadores complementares no cabeçalho das páginas */
function enhanceModuleHeaders(){
  const pages={
    students:{id:'page-students',kpis:[['Alunos ativos',activeStudents().length],['Inativos',db.students.filter(s=>s.status==='Inativo').length],['Trancados',db.students.filter(s=>s.status==='Trancado').length],['Mensalidade ativa',money(activeStudents().reduce((a,s)=>a+Number(s.monthly||0),0))]]},
    agenda:{id:'page-agenda',kpis:[['Aulas do mês',classesForMonth(monthKey(currentMonth)).length],['Realizadas',classesForMonth(monthKey(currentMonth)).filter(c=>c.status==='Realizada').length],['Agendadas',classesForMonth(monthKey(currentMonth)).filter(c=>c.status==='Agendada').length],['Canceladas',classesForMonth(monthKey(currentMonth)).filter(c=>c.status==='Cancelada').length]]},
    makeups:{id:'page-makeups',kpis:[['Pendentes',db.makeups.filter(x=>x.status==='Pendente').length],['Agendadas',db.makeups.filter(x=>x.status==='Agendada').length],['Realizadas',db.makeups.filter(x=>x.status==='Realizada').length],['Total',db.makeups.length]]},
    waitlist:{id:'page-waitlist',kpis:[['Aguardando',db.waitlist.filter(x=>x.status==='Aguardando').length],['Contactar',db.waitlist.filter(x=>x.status==='Contactar').length],['Alta prioridade',db.waitlist.filter(x=>Number(x.priority)===1).length],['Total histórico',db.waitlist.length]]}
  };
  Object.values(pages).forEach(p=>{const sec=document.getElementById(p.id);if(!sec)return;let box=sec.querySelector('.v7-kpis');if(!box){box=document.createElement('div');box.className='module-kpis v7-kpis';sec.querySelector('.page-head')?.after(box);}box.innerHTML=p.kpis.map(k=>`<div class="module-kpi"><div class="label">${k[0]}</div><div class="value">${k[1]}</div></div>`).join('');});
}


let teacherManagementMonth=new Date(),billingCentralFilter='all',selectedTeacherManagement='';
function changeTeacherMonth(n){teacherManagementMonth=new Date(teacherManagementMonth.getFullYear(),teacherManagementMonth.getMonth()+n,1);renderTeacherManagement();}
function goTeacherCurrentMonth(){teacherManagementMonth=new Date();renderTeacherManagement();}
function teacherModel(t,key){const rows=db.classes.filter(c=>c.teacher===t&&sameMonth(c.date,key)),done=rows.filter(c=>c.status==='Realizada'),cancel=rows.filter(c=>c.status==='Cancelada'),students=new Set(done.map(c=>c.studentId).filter(Boolean)),rate=teacherRate(t),fixed=Number(db.settings.teacherFixedRates?.[t]||0),per=Number(db.settings.teacherClassValues?.[t]||db.settings.teacherDefaultClassValue||0),gross=done.reduce((a,c)=>a+Number(c.classValue||c.value||per||0),0),base=gross||done.length*per,total=base*rate/100+fixed;return{rows,done,cancel,experimental:done.filter(c=>c.experimental),students,rate,fixed,per,base,total};}
function openTeacherManagementModal(t=''){const rates=ensureTeacherRates(),name=t||db.teachers[0]||'';const b=`<div class="form-grid"><div class="field full"><label>Professor</label><input id="tmName" value="${esc(name)}"></div><div class="field"><label>Repasse (%)</label><input id="tmRate" type="number" min="0" max="100" step="0.1" value="${Number(rates[name]||0)}"></div><div class="field"><label>Repasse fixo</label><input id="tmFixed" type="number" min="0" step="0.01" value="${Number(db.settings.teacherFixedRates?.[name]||0)}"></div><div class="field"><label>Valor por aula</label><input id="tmClassValue" type="number" min="0" step="0.01" value="${Number(db.settings.teacherClassValues?.[name]||0)}"></div></div>`;openModal(name?'Editar professor':'Adicionar professor',b,()=>{const n=document.getElementById('tmName').value.trim(),r=Math.min(100,Math.max(0,Number(document.getElementById('tmRate').value||0))),fx=Math.max(0,Number(document.getElementById('tmFixed').value||0)),v=Math.max(0,Number(document.getElementById('tmClassValue').value||0));if(!n){toast('Informe o nome.');return false;}if(!db.teachers.includes(n))db.teachers.push(n);ensureTeacherRates()[n]=r;db.settings.teacherFixedRates=db.settings.teacherFixedRates||{};db.settings.teacherClassValues=db.settings.teacherClassValues||{};db.settings.teacherFixedRates[n]=fx;db.settings.teacherClassValues[n]=v;saveDB();renderAll();toast('Professor atualizado.');return true;});}
function selectTeacherManagement(t){selectedTeacherManagement=t;renderTeacherManagement();}
function renderTeacherManagement(){const key=monthKey(teacherManagementMonth),lbl=document.getElementById('teacherMonthLabel');if(lbl)lbl.textContent=monthLabel(teacherManagementMonth);const rows=db.teachers.map(t=>({teacher:t,...teacherModel(t,key)})),taught=rows.reduce((a,x)=>a+x.done.length,0),people=new Set();rows.forEach(x=>x.done.forEach(c=>c.studentId&&people.add(c.studentId)));const total=rows.reduce((a,x)=>a+x.total,0),cancel=rows.reduce((a,x)=>a+x.cancel.length,0),exp=rows.reduce((a,x)=>a+x.experimental.length,0);const k=document.getElementById('teacherManagementKpis');if(k)k.innerHTML=[['Professores',db.teachers.length],['Aulas ministradas',taught],['Alunos atendidos',people.size],['Total a receber',money(total)],['Canceladas',cancel],['Experimentais',exp]].map(x=>`<div class="module-kpi"><div class="label">${x[0]}</div><div class="value">${x[1]}</div></div>`).join('');const closed=db.teacherClosings?.[key],cs=document.getElementById('teacherClosingStatus');if(cs)cs.innerHTML=closed?`<span class="badge ok">Fechado em ${dateBR(closed.closedAt.slice(0,10))}</span>`:'<span class="badge warn">Mês aberto</span>';const tb=document.getElementById('teacherManagementTable');if(tb)tb.innerHTML=rows.map(x=>`<tr class="${selectedTeacherManagement===x.teacher?'is-selected':''}" onclick="selectTeacherManagement('${esc(x.teacher).replace(/'/g,"\\'")}')"><td><strong>${esc(x.teacher)}</strong></td><td>${x.done.length}</td><td>${x.students.size}</td><td>${money(x.per)}</td><td><strong>${x.rate.toFixed(1).replace('.',',')}%</strong>${x.fixed?`<div class="muted">+ ${money(x.fixed)} fixo</div>`:''}</td><td><strong>${money(x.total)}</strong></td><td>${x.cancel.length}</td><td>${x.experimental.length}</td><td><button class="btn small" onclick="event.stopPropagation();openTeacherManagementModal('${esc(x.teacher).replace(/'/g,"\\'")}')">Editar</button></td></tr>`).join('')||'<tr><td colspan="9"><div class="empty">Nenhum professor cadastrado.</div></td></tr>';const d=document.getElementById('teacherManagementDetail'),sel=selectedTeacherManagement||rows[0]?.teacher;if(d&&sel){const x=rows.find(r=>r.teacher===sel)||teacherModel(sel,key);d.innerHTML=`<div class="teacher-detail-grid"><div><span>Aulas</span><strong>${x.done.length}</strong></div><div><span>Alunos</span><strong>${x.students.size}</strong></div><div><span>Repasse</span><strong>${x.rate.toFixed(1).replace('.',',')}%</strong></div><div><span>Total</span><strong>${money(x.total)}</strong></div></div><div class="section-title" style="margin-top:14px">Aulas do mês</div>${x.done.slice().sort(dateTimeSort).reverse().slice(0,30).map(c=>`<div class="v61-list-row"><span>${dateBR(c.date)} · ${esc(c.time||'')}</span><strong>${esc(c.studentName||studentById(c.studentId)?.name||'Aluno')}</strong><small>${c.experimental?'Experimental · ':''}${money(c.classValue||c.value||x.per)}</small></div>`).join('')||'<div class="empty">Nenhuma aula ministrada.</div>'}`;}const rl=document.getElementById('teacherDefaultRateLabel');if(rl)rl.textContent=`${Number(db.settings.teacherDefaultRate||0).toFixed(1).replace('.',',')}%`;}
function closeTeacherMonth(){const key=monthKey(teacherManagementMonth),rows=db.teachers.map(t=>({teacher:t,...teacherModel(t,key)}));db.teacherClosings=db.teacherClosings||{};db.teacherClosings[key]={closedAt:new Date().toISOString(),total:rows.reduce((a,x)=>a+x.total,0),classes:rows.reduce((a,x)=>a+x.done.length,0),teachers:rows.map(x=>({teacher:x.teacher,total:x.total,classes:x.done.length}))};saveDB();renderTeacherManagement();toast('Fechamento mensal registrado.');}
function billingStatusForStudent(s,key=monthKey(currentMonth)){const rows=db.finance.filter(f=>f.studentId===s.id&&f.type!=='Despesa'&&sameMonth(f.dueDate,key));if(rows.some(f=>f.status==='Pago'))return'paid';const p=rows.filter(f=>f.status==='Pendente').sort((a,b)=>String(a.dueDate).localeCompare(String(b.dueDate)))[0];if(!p)return'due';return p.dueDate<todayISO()?'overdue':'due';}
function setBillingFilter(f){billingCentralFilter=f;document.querySelectorAll('[data-billing-filter]').forEach(b=>b.classList.toggle('active',b.dataset.billingFilter===f));renderBilling();}
function renderBillingCentralStatus(){const key=monthKey(currentMonth),c={paid:0,due:0,overdue:0};activeStudents().forEach(s=>c[billingStatusForStudent(s,key)]++);const e=document.getElementById('billingStatusStrip');if(e)e.innerHTML=[['paid','🟢 Em dia'],['due','🟡 Vencendo'],['overdue','🔴 Atrasado']].map(x=>`<button class="billing-status-card ${billingCentralFilter===x[0]?'active':''}" onclick="setBillingFilter('${x[0]}')"><span>${x[1]}</span><strong>${c[x[0]]}</strong><small>alunos</small></button>`).join('');}
function getStudioAlerts(){const a=[],today=todayISO(),soon=new Date(Date.now()+3*864e5).toISOString().slice(0,10),reviewSoon=new Date(Date.now()+7*864e5).toISOString().slice(0,10);db.finance.filter(f=>f.type!=='Despesa'&&f.status==='Pendente'&&f.dueDate).forEach(f=>{const s=studentById(f.studentId)||{name:f.studentName};if(f.dueDate<today)a.push({id:'overdue-'+f.id,type:'overdue',icon:uiIcon('alert',18),title:'Mensalidade atrasada',text:`${s.name||'Aluno'} · ${money(f.value)} · ${dateBR(f.dueDate)}`,page:'billing'});else if(f.dueDate<=soon)a.push({id:'due-'+f.id,type:'due',icon:'🟠',title:'Mensalidade vencendo',text:`${s.name||'Aluno'} · ${money(f.value)} · ${dateBR(f.dueDate)}`,page:'billing'});});activeStudents().forEach(s=>{const from=new Date(Date.now()-30*864e5).toISOString().slice(0,10),n=db.classes.filter(c=>c.studentId===s.id&&c.date>=from&&c.status==='Realizada').length,expected=Math.max(1,Math.round(studentFrequency(s)*4.33));if(n<Math.max(1,Math.floor(expected*.6)))a.push({id:'freq-'+s.id,type:'frequency',icon:'🟡',title:'Aluno com baixa frequência',text:`${s.name} · ${n} aulas nos últimos 30 dias`,page:'students'});const r=s.clinical?.nextReview;if(r&&r>=today&&r<=reviewSoon)a.push({id:'review-'+s.id,type:'review',icon:'🟣',title:'Reavaliação próxima',text:`${s.name} · ${dateBR(r)}`,page:'evolution'});});db.classes.filter(c=>c.status==='Agendada'&&c.date>=today&&!c.equipmentId).forEach(c=>a.push({id:'equipment-'+c.id,type:'equipment',icon:'🔵',title:'Aula sem aparelho',text:`${dateBR(c.date)} · ${c.time||'—'} · ${c.studentName||studentById(c.studentId)?.name||'Aluno'}`,page:'equipment'}));db.finance.filter(f=>f.type!=='Despesa'&&f.status==='Pago'&&f.paidAt&&Date.now()-Date.parse(f.paidAt)<=7*864e5).forEach(f=>{const st=studentById(f.studentId)||{name:f.studentName};a.push({id:'paid-'+f.id,type:'paid',icon:'🟢',title:'Pagamento recebido',text:`${st.name||'Aluno'} · ${money(f.value)}`,page:'finance'});});return a.map(x=>({...x,dismissed:!!db.alertDismissed?.[x.id]}));}
function dismissAlert(id){db.alertDismissed=db.alertDismissed||{};db.alertDismissed[id]=true;saveDB();renderAlertsCenter();updateMenuBadges();}
function dismissAllAlerts(){getStudioAlerts().forEach(a=>{db.alertDismissed=db.alertDismissed||{};db.alertDismissed[a.id]=true;});saveDB();renderAlertsCenter();updateMenuBadges();toast('Alertas marcados como visualizados.');}
function renderAlertsCenter(){const all=getStudioAlerts(),items=all.filter(a=>!a.dismissed),types=['overdue','due','frequency','equipment','review','paid'],labels={'overdue':'🔴 Atrasadas','due':'🟠 Vencendo','frequency':'🟡 Frequência','equipment':'🔵 Aparelho','review':'🟣 Reavaliação','paid':'🟢 Recebidos'},counts=Object.fromEntries(types.map(t=>[t,items.filter(a=>a.type===t).length]));const k=document.getElementById('alertsKpis');if(k)k.innerHTML=types.map(t=>`<div class="module-kpi"><div class="label">${labels[t]}</div><div class="value">${counts[t]}</div></div>`).join('');const g=document.getElementById('alertsCenterGrid');if(!g)return;g.innerHTML=items.length?items.map(a=>`<article class="alert-card alert-${a.type}"><div class="alert-card-icon">${a.icon}</div><div class="alert-card-body"><strong>${esc(a.title)}</strong><p>${esc(a.text)}</p></div><div class="alert-card-actions"><button class="btn small" onclick="goPage('${a.page}')">Abrir</button><button class="btn small" onclick="dismissAlert('${a.id}')">Dispensar</button></div></article>`).join(''):'<div class="card panel"><div class="empty">Tudo em ordem. Nenhum alerta pendente. ✨</div></div>';}
function sendBillingWhatsApp(id){const f=db.finance.find(x=>x.id===id);if(!f)return;const s=studentById(f.studentId)||{name:f.studentName,whatsapp:f.whatsapp};openWhatsApp(s.whatsapp,replaceVars(db.settings.messages.billing,s,{value:f.value,due:dateBR(f.dueDate)}));}
function sendBirthdayWhatsApp(id){const s=studentById(id);if(!s)return;openWhatsApp(s.whatsapp,replaceVars(db.settings.messages.birthday,s));}
const REPORT_WEEKS_PER_MONTH = 4.33;

function ensureTeacherRates(){
  if(!db.settings) db.settings = {};
  if(!db.settings.teacherRates || typeof db.settings.teacherRates !== "object"){
    db.settings.teacherRates = {};
  }
  return db.settings.teacherRates;
}

function teacherRate(teacher){
  const rates = ensureTeacherRates();
  const value = Number(rates[teacher] ?? 0);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function studentFrequency(student){
  const plan = db.plans.find(p => p.name === student.plan);
  const value = Number(plan?.weekly || student.weekly || 1);
  return Math.max(1, Math.min(7, Number.isFinite(value) ? value : 1));
}

function studentEconomics(student){
  const weekly = studentFrequency(student);
  const monthlyClasses = weekly * REPORT_WEEKS_PER_MONTH;
  const monthly = Math.max(0, Number(student.monthly || 0));
  const revenuePerClass = monthlyClasses ? monthly / monthlyClasses : 0;
  const durationHours = Math.max(0.25, Number(db.settings.duration || 60) / 60);
  const revenuePerHour = revenuePerClass / durationHours;
  const rate = teacherRate(student.teacher || "Sem professor");
  const teacherCost = monthlyClasses * revenuePerClass * (rate / 100);
  const margin = monthly - teacherCost;
  return { weekly, monthlyClasses, monthly, revenuePerClass, revenuePerHour, rate, teacherCost, margin };
}

function populateReportFilters(){
  const teacherEl = document.getElementById("reportTeacherFilter");
  if(!teacherEl) return;

  const current = teacherEl.value;
  const teachers = [...new Set([
    ...db.teachers,
    ...db.students.map(s => s.teacher).filter(Boolean)
  ])].sort((a,b)=>String(a).localeCompare(String(b),"pt-BR"));

  teacherEl.innerHTML = `<option value="">Todos</option>` +
    teachers.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join("");

  if(teachers.includes(current)) teacherEl.value = current;

  const monthEl = document.getElementById("reportMonthFilter");
  if(monthEl && !monthEl.value) monthEl.value = todayISO().slice(0,7);
}

function reportFilteredStudents(){
  const teacher = document.getElementById("reportTeacherFilter")?.value || "";
  const status = document.getElementById("reportStatusFilter")?.value || "Ativo";

  return db.students.filter(s => {
    const statusOk = status === "Todos" || s.status === status;
    const teacherOk = !teacher || s.teacher === teacher;
    return statusOk && teacherOk;
  });
}

function renderReports(){
  if(!db) return;

  populateReportFilters();

  const students = reportFilteredStudents();
  const month = document.getElementById("reportMonthFilter")?.value || todayISO().slice(0,7);

  let revenue = 0;
  let teacherCost = 0;
  let classes = 0;

  students.forEach(s => {
    const e = studentEconomics(s);
    revenue += e.monthly;
    teacherCost += e.teacherCost;
    classes += e.monthlyClasses;
  });

  const margin = revenue - teacherCost;
  const marginPct = revenue ? (margin / revenue) * 100 : 0;

  const setText = (id,val) => { const el=document.getElementById(id); if(el) el.textContent=val; };
  setText("reportRevenue", money(revenue));
  setText("reportTeacherCost", money(teacherCost));
  setText("reportMargin", money(margin));
  setText("reportMarginPct", `${marginPct.toFixed(1).replace(".",",")}% da receita`);
  setText("reportClasses", classes.toFixed(1).replace(".",","));

  // IDs legados mantidos.
  const active = db.students.filter(s=>s.status==="Ativo");
  const ticket = active.length ? active.reduce((a,s)=>a+Number(s.monthly||0),0)/active.length : 0;
  const pending = db.finance.filter(f=>f.status==="Pendente").reduce((a,f)=>a+Number(f.value||0),0);
  const billed = db.finance.reduce((a,f)=>a+Number(f.value||0),0);
  setText("reportTicket", money(ticket));
  setText("reportDefault", billed ? `${((pending/billed)*100).toFixed(1).replace(".",",")}%` : "0%");
  setText("reportInactive", db.students.filter(s=>s.status==="Inativo").length);
  setText("reportPaused", db.students.filter(s=>s.status==="Trancado").length);

  const filterStatus = document.getElementById("reportFilterStatus");
  if(filterStatus){
    const teacher = document.getElementById("reportTeacherFilter")?.value;
    const status = document.getElementById("reportStatusFilter")?.value || "Ativo";
    filterStatus.textContent = `${students.length} aluno(s) • ${teacher || "Todas as professoras"} • ${status}`;
  }

  renderReportStudents(students);
  renderReportTeachers(students);
  renderReportSummary(students, revenue, teacherCost, margin, classes, month);
  renderTeacherRateConfig();
}

function renderReportStudents(students){
  const el = document.getElementById("reportStudentsTable");
  if(!el) return;

  if(!students.length){
    el.innerHTML = `<tr><td colspan="10"><div class="settings-empty">Nenhum aluno encontrado para os filtros selecionados.</div></td></tr>`;
    return;
  }

  el.innerHTML = students
    .slice()
    .sort((a,b)=>String(a.name||"").localeCompare(String(b.name||""),"pt-BR"))
    .map(s=>{
      const e = studentEconomics(s);
      const marginClass = e.revenuePerClass - e.rate >= 0 ? "report-positive" : "report-negative";
      return `
        <tr>
          <td><span class="report-name">${esc(s.name)}</span><span class="report-sub">${esc(s.status||"")}</span></td>
          <td>${esc(s.plan||"Sem plano")}</td>
          <td>${esc(s.teacher||"Não definido")}</td>
          <td>${e.weekly}x</td>
          <td class="report-number">${money(e.monthly)}</td>
          <td class="report-number">${e.monthlyClasses.toFixed(1).replace(".",",")}</td>
          <td class="report-number">${money(e.revenuePerClass)}</td>
          <td class="report-number">${money(e.revenuePerHour)}</td>
          <td class="report-number">${money(e.rate)}</td>
          <td class="report-number ${marginClass}">${money(e.revenuePerClass-e.rate)}</td>
        </tr>`;
    }).join("");
}

function renderReportTeachers(students){
  const el = document.getElementById("reportTeachersTable");
  if(!el) return;

  const groups = {};
  students.forEach(s=>{
    const teacher = s.teacher || "Sem professor";
    const e = studentEconomics(s);
    if(!groups[teacher]) groups[teacher] = {students:0,classes:0,revenue:0,cost:0};
    groups[teacher].students++;
    groups[teacher].classes += e.monthlyClasses;
    groups[teacher].revenue += e.monthly;
    groups[teacher].cost += e.teacherCost;
  });

  const rows = Object.entries(groups).sort((a,b)=>a[0].localeCompare(b[0],"pt-BR"));
  if(!rows.length){
    el.innerHTML = `<tr><td colspan="6"><div class="settings-empty">Nenhum dado de professora para exibir.</div></td></tr>`;
    return;
  }

  el.innerHTML = rows.map(([teacher,g])=>{
    const margin = g.revenue-g.cost;
    return `
      <tr>
        <td><span class="report-name">${esc(teacher)}</span><span class="report-sub">${money(teacherRate(teacher))} por aluno/aula</span></td>
        <td class="report-number">${g.students}</td>
        <td class="report-number">${g.classes.toFixed(1).replace(".",",")}</td>
        <td class="report-number">${money(g.revenue)}</td>
        <td class="report-number">${money(g.cost)}</td>
        <td class="report-number ${margin>=0?"report-positive":"report-negative"}">${money(margin)}</td>
      </tr>`;
  }).join("");
}

function renderReportSummary(students, revenue, cost, margin, classes, month){
  const el = document.getElementById("reportSummary");
  if(!el) return;

  const avgPerClass = classes ? revenue/classes : 0;
  const avgRepasse = classes ? cost/classes : 0;
  const avgMargin = classes ? margin/classes : 0;

  el.innerHTML = `
    <div class="report-mini-grid">
      <div class="report-mini-card"><div class="report-mini-label">Alunos</div><div class="report-mini-value">${students.length}</div></div>
      <div class="report-mini-card"><div class="report-mini-label">R$/aula médio</div><div class="report-mini-value">${money(avgPerClass)}</div></div>
      <div class="report-mini-card"><div class="report-mini-label">Repasse médio</div><div class="report-mini-value">${money(avgRepasse)}</div></div>
      <div class="report-mini-card"><div class="report-mini-label">Margem/aula média</div><div class="report-mini-value">${money(avgMargin)}</div></div>
    </div>
    <div style="margin-top:14px">
      <div class="section-title" style="font-size:13px">Referência: ${esc(month)}</div>
      <div class="report-table-note">A projeção é baseada na mensalidade cadastrada e na frequência semanal do plano. Ela não substitui o controle de presença realizado.</div>
    </div>`;
}

function renderTeacherRateConfig(){
  const el = document.getElementById("reportTeacherConfig");
  if(!el) return;

  const teachers = [...new Set([
    ...db.teachers,
    ...db.students.map(s=>s.teacher).filter(Boolean)
  ])].sort((a,b)=>a.localeCompare(b,"pt-BR"));

  if(!teachers.length){
    el.innerHTML = `<div class="settings-empty">Cadastre uma professora em Configurações → Professores para definir o repasse.</div>`;
    return;
  }

  el.innerHTML = `
    <div class="report-config-card">
      ${teachers.map(t=>`
        <div class="report-config-row">
          <div>
            <label>${esc(t)}</label>
            <small>Percentual do valor da aula destinado à professora.</small>
          </div>
          <div class="field">
            <div class="repasse-percent-field"><input type="number" min="0" max="100" step="0.1" value="${teacherRate(t)}"
              onchange="saveTeacherRate('${esc(t).replaceAll("'","&#39;")}', this.value)"></div>
          </div>
        </div>
      `).join("")}
      <div class="actions" style="margin-top:4px">
        <button type="button" class="btn primary small" onclick="saveDB();renderReports();toast('Repasses salvos com sucesso!')">✓ Salvar repasses</button>
      </div>
    </div>`;
}

function saveTeacherRate(teacher, value){
  const rates = ensureTeacherRates();
  const n = Number(value||0);
  const pct = Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
  rates[teacher] = pct;
  saveDB();
  renderReports();
}

function exportReportsCSV(){
  const students = reportFilteredStudents();
  const rows = [
    ["Aluno","Plano","Professor","Frequência semanal","Mensalidade","Aulas/mês","Valor por aula","Valor por hora","Repasse (%)","Repasse mensal","Margem mensal"]
  ];

  students.forEach(s=>{
    const e = studentEconomics(s);
    rows.push([
      s.name||"", s.plan||"", s.teacher||"", e.weekly,
      e.monthly.toFixed(2), e.monthlyClasses.toFixed(2),
      e.revenuePerClass.toFixed(2), e.revenuePerHour.toFixed(2),
      e.rate.toFixed(2), e.teacherCost.toFixed(2), e.margin.toFixed(2)
    ]);
  });

  const csv = rows.map(row=>row.map(v=>{
    const text = String(v??"").replaceAll('"','""');
    return `"${text}"`;
  }).join(";")).join("\n");

  const blob = new Blob(["\uFEFF"+csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `relatorio_pilates_${todayISO()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* CONFIGURAÇÕES — CRUD CORRIGIDO (somente Planos, Horários, Professores e Pagamentos) */
function renderSettingsCatalogs(){
  const plansEl=document.getElementById('plansSettings');
  if(plansEl){
    const rows=(db.plans||[]).map((p,i)=>`<tr>
      <td><strong>${esc(p.name||'—')}</strong></td>
      <td>${Number(p.weekly||0)}x/semana</td>
      <td>${money(p.price)}</td>
      <td><div class="row-actions"><button class="btn small" onclick="addPlan(${i})">Editar</button><button class="btn danger small icon ios-delete-button" onclick="deletePlan(${i})" title="Excluir" aria-label="Excluir">${trashIcon(15)}</button></div></td>
    </tr>`).join('');
    plansEl.innerHTML=rows?`<div class="table-wrap"><table><thead><tr><th>Plano</th><th>Frequência</th><th>Mensalidade</th><th>Ações</th></tr></thead><tbody>${rows}</tbody></table></div>`:`<div class="empty">Nenhum plano cadastrado. Clique em “Novo Plano”.</div>`;
  }

  const hoursEl=document.getElementById('hoursSettings');
  if(hoursEl){
    const rows=(db.hours||[]).map((h,i)=>`<tr><td><strong>${esc(formatTimeRange(h))}</strong></td><td>${esc(hourDaysLabel(h))}</td><td><div class="row-actions"><button class="btn small" type="button" onclick="addHour(${i})">Editar dias/horário</button><button class="btn danger small icon ios-delete-button" type="button" onclick="deleteHour(${i})" title="Excluir" aria-label="Excluir">${trashIcon(15)}</button></div></td></tr>`).join('');
    hoursEl.innerHTML=rows?`<div class="table-wrap"><table><thead><tr><th>Horário</th><th>Dias da semana</th><th>Ações</th></tr></thead><tbody>${rows}</tbody></table></div>`:`<div class="empty">Nenhum horário cadastrado. Clique em “Novo Horário”.</div>`;
  }

  const teachersEl=document.getElementById('teachersSettings');
  if(teachersEl){
    const rows=(db.teachers||[]).map((t,i)=>`<tr><td><strong>${esc(t)}</strong></td><td><span class="repasse-percent-badge">${Number(teacherRate(t)).toLocaleString('pt-BR',{maximumFractionDigits:1})}%</span></td><td><div class="row-actions"><button class="btn small" onclick="addTeacher(${i})">Editar</button><button class="btn danger small icon ios-delete-button" onclick="deleteTeacher(${i})" title="Excluir" aria-label="Excluir">${trashIcon(15)}</button></div></td></tr>`).join('');
    teachersEl.innerHTML=rows?`<div class="table-wrap"><table><thead><tr><th>Professor(a)</th><th>Repasse configurado</th><th>Ações</th></tr></thead><tbody>${rows}</tbody></table></div>`:`<div class="empty">Nenhum professor cadastrado. Clique em “Novo Professor”.</div>`;
  }

  const paymentsEl=document.getElementById('paymentsSettings');
  if(paymentsEl){
    const rows=(db.payments||[]).map((t,i)=>`<tr><td><strong>${esc(t)}</strong></td><td><span class="badge ok">Disponível</span></td><td><div class="row-actions"><button class="btn small" onclick="addPayment(${i})">Editar</button><button class="btn danger small icon ios-delete-button" onclick="deletePayment(${i})" title="Excluir" aria-label="Excluir">${trashIcon(15)}</button></div></td></tr>`).join('');
    paymentsEl.innerHTML=rows?`<div class="table-wrap"><table><thead><tr><th>Forma de recebimento</th><th>Status</th><th>Ações</th></tr></thead><tbody>${rows}</tbody></table></div>`:`<div class="empty">Nenhuma forma de recebimento cadastrada. Clique em “Nova Forma”.</div>`;
  }
}

function addPlan(index=null){
  const p=index!==null?db.plans[index]:{};
  const body=`<div class="form-grid">
    <div class="field full"><label>Nome do plano *</label><input id="cfgPlanName" value="${esc(p.name||'')}"></div>
    <div class="field"><label>Frequência semanal *</label><input id="cfgPlanWeekly" type="number" min="1" max="7" step="1" value="${Number(p.weekly||2)}"></div>
    <div class="field"><label>Mensalidade (R$) *</label><input id="cfgPlanPrice" type="number" min="0" step="0.01" value="${Number(p.price||0)}"></div>
  </div>`;
  openModal(index!==null?'Editar Plano':'Novo Plano',body,()=>savePlan(index));
}
function savePlan(index=null){
  const name=document.getElementById('cfgPlanName').value.trim();
  const weekly=Number(document.getElementById('cfgPlanWeekly').value||0);
  const price=Number(document.getElementById('cfgPlanPrice').value||0);
  if(!name){toast('Informe o nome do plano.');return;}
  if(weekly<1||weekly>7){toast('A frequência deve estar entre 1 e 7 aulas por semana.');return;}
  if(price<0){toast('Informe uma mensalidade válida.');return;}
  const duplicate=db.plans.some((x,i)=>i!==index&&String(x.name).trim().toLowerCase()===name.toLowerCase());
  if(duplicate){toast('Já existe um plano com esse nome.');return;}
  const obj={id:index!==null?(db.plans[index].id||uid('pln')):uid('pln'),name,weekly,price};
  if(index!==null) db.plans[index]=obj; else db.plans.push(obj);
  saveDB();closeModal();renderAll();toast(index!==null?'Plano atualizado com sucesso.':'Plano adicionado com sucesso.');
}
async function deletePlan(index){
  const p=db.plans[index]; if(!p)return;
  const inUse=db.students.some(s=>s.plan===p.name)||db.waitlist.some(w=>w.plan===p.name);
  if(inUse){toast('Este plano está vinculado a aluno ou lista de espera e não pode ser excluído.');return;}
  const confirmed=await iosConfirm(`Excluir o plano “${p.name}”?`,{title:'Excluir plano',okLabel:'Excluir',danger:true});
  if(!confirmed)return;
  db.plans.splice(index,1);saveDB();renderAll();toast('Plano excluído.');
}

function addHour(index=null){
  const current=index!==null?(db.hours[index]||''):'';
  const currentDays=index!==null&&db.hourDays?((db.hourDays[current]||[]).map(String)):['1','2','3','4','5'];
  const duration=Number(db.settings.duration||60);
  const dayOpts=[['1','Segunda'],['2','Terça'],['3','Quarta'],['4','Quinta'],['5','Sexta'],['6','Sábado'],['0','Domingo']];
  const body=`<div class="form-grid"><div class="field"><label>Horário de início *</label><input id="cfgHour" type="time" value="${esc(current)}"></div><div class="field"><label>Duração (minutos)</label><input id="cfgHourDuration" type="number" min="15" max="240" step="5" value="${duration}"></div><div class="field full"><label>Dias da semana</label><div class="actions" id="cfgHourDays">${dayOpts.map(([v,n])=>{const short={1:'SEG',2:'TER',3:'QUA',4:'QUI',5:'SEX',6:'SÁB',0:'DOM'}[v];return `<label class="ios-day-chip ios-day-chip-settings"><input type="checkbox" value="${v}" ${currentDays.includes(v)?'checked':''} aria-label="${n}"><span class="ios-day-check" aria-hidden="true">✓</span><span class="ios-day-label">${short}</span></label>`;}).join('')}</div></div></div><div class="muted" id="cfgHourPreview" style="margin-top:8px">Prévia: ${esc(current?formatTimeRange(current):'08:00 às 09:00')}</div>`;
  openModal(index!==null?'Editar Horário':'Novo Horário',body,()=>saveHour(index));
}
function saveHour(index=null){
  const value=document.getElementById('cfgHour').value;
  const duration=Math.max(15,Number(document.getElementById('cfgHourDuration')?.value||db.settings.duration||60));
  const days=[...document.querySelectorAll('#cfgHourDays input:checked')].map(x=>x.value);
  if(!value){toast('Informe o horário.');return;} if(!days.length){toast('Selecione pelo menos um dia.');return;}
  const duplicate=db.hours.some((x,i)=>i!==index&&x===value); if(duplicate){toast('Este horário já está cadastrado.');return;}
  if(!db.hourDays)db.hourDays={};
  if(index!==null){const old=db.hours[index];db.hours[index]=value;db.hourDays[value]=days;delete db.hourDays[old];db.students.forEach(s=>{if(s.time===old)s.time=value;});db.classes.forEach(c=>{if(c.time===old)c.time=value;});}
  else{db.hours.push(value);db.hourDays[value]=days;}
  db.settings.duration=duration; db.hours.sort(); saveDB();closeModal();renderAll();toast(index!==null?'Horário atualizado com sucesso.':'Horário adicionado com sucesso.');
}
async function deleteHour(index){
  const h=db.hours[index];if(!h)return;
  const inUse=db.students.some(s=>s.time===h)||db.classes.some(c=>c.time===h)||db.waitlist.some(w=>w.time===h);
  if(inUse){toast('Este horário está em uso e não pode ser excluído.');return;}
  const confirmed=await iosConfirm(`Excluir o horário ${h}?`,{title:'Excluir horário',okLabel:'Excluir',danger:true});
  if(!confirmed)return;
  db.hours.splice(index,1);if(db.hourDays)delete db.hourDays[h];saveDB();renderAll();toast('Horário excluído.');
}

function addTeacher(index=null){
  const name=index!==null?(db.teachers[index]||''):'';
  const rate=index!==null?teacherRate(name):0;
  const body=`<div class="form-grid">
    <div class="field full"><label>Nome da professora/professor *</label><input id="cfgTeacher" value="${esc(name)}"></div>
    <div class="field"><label>Repasse configurado (%)</label><div class="repasse-percent-field"><input id="cfgTeacherRate" type="number" min="0" max="100" step="0.1" value="${Number(rate||0)}"></div></div>
  </div><div class="muted" style="font-size:12px;margin-top:8px">O percentual será aplicado sobre o valor da aula e usado no módulo de Relatórios & Rentabilidade.</div>`;
  openModal(index!==null?'Editar Professor':'Novo Professor',body,()=>saveTeacher(index,name));
}
function saveTeacher(index=null,oldName=''){
  const name=document.getElementById('cfgTeacher').value.trim();
  const rate=Number(document.getElementById('cfgTeacherRate').value||0);
  if(!name){toast('Informe o nome do professor.');return;}
  if(rate<0){toast('Informe um repasse válido.');return;}
  const duplicate=db.teachers.some((x,i)=>i!==index&&String(x).trim().toLowerCase()===name.toLowerCase());
  if(duplicate){toast('Já existe um professor com esse nome.');return;}
  if(index!==null){
    db.teachers[index]=name;
    db.students.forEach(s=>{if(s.teacher===oldName)s.teacher=name;});
    db.classes.forEach(c=>{if(c.teacher===oldName)c.teacher=name;});
    db.settings.teacherRates=db.settings.teacherRates||{};
    if(oldName!==name && Object.prototype.hasOwnProperty.call(db.settings.teacherRates,oldName)){
      db.settings.teacherRates[name]=rate;
      delete db.settings.teacherRates[oldName];
    }else db.settings.teacherRates[name]=rate;
  }else{
    db.teachers.push(name);
    db.settings.teacherRates=db.settings.teacherRates||{};
    db.settings.teacherRates[name]=rate;
  }
  saveDB();closeModal();renderAll();toast(index!==null?'Professor atualizado com sucesso.':'Professor adicionado com sucesso.');
}
async function deleteTeacher(index){
  const name=db.teachers[index];if(!name)return;
  const inUse=db.students.some(s=>s.teacher===name)||db.classes.some(c=>c.teacher===name);
  if(inUse){toast('Este professor está vinculado a alunos ou aulas e não pode ser excluído.');return;}
  const confirmed=await iosConfirm(`Excluir “${name}”?`,{title:'Excluir professor',okLabel:'Excluir',danger:true});
  if(!confirmed)return;
  db.teachers.splice(index,1);
  if(db.settings.teacherRates)delete db.settings.teacherRates[name];
  saveDB();renderAll();toast('Professor excluído.');
}

function addPayment(index=null){
  const name=index!==null?(db.payments[index]||''):'';
  const body=`<div class="form-grid"><div class="field full"><label>Forma de recebimento *</label><input id="cfgPayment" value="${esc(name)}" placeholder="Ex.: PIX, Cartão, Dinheiro"></div></div>`;
  openModal(index!==null?'Editar Forma de Recebimento':'Nova Forma de Recebimento',body,()=>savePayment(index));
}
function savePayment(index=null){
  const name=document.getElementById('cfgPayment').value.trim();
  if(!name){toast('Informe a forma de recebimento.');return;}
  const duplicate=db.payments.some((x,i)=>i!==index&&String(x).trim().toLowerCase()===name.toLowerCase());
  if(duplicate){toast('Esta forma de recebimento já está cadastrada.');return;}
  if(index!==null)db.payments[index]=name;else db.payments.push(name);
  saveDB();closeModal();renderAll();toast(index!==null?'Forma de recebimento atualizada.':'Forma de recebimento adicionada.');
}
async function deletePayment(index){
  const name=db.payments[index];if(!name)return;
  const inUse=db.finance.some(f=>f.paymentMethod===name);
  if(inUse){toast('Esta forma de recebimento está vinculada a lançamentos financeiros e não pode ser excluída.');return;}
  const confirmed=await iosConfirm(`Excluir “${name}”?`,{title:'Excluir forma de recebimento',okLabel:'Excluir',danger:true});
  if(!confirmed)return;
  db.payments.splice(index,1);saveDB();renderAll();toast('Forma de recebimento excluída.');
}

/* Mantém o fluxo original e adiciona os novos módulos */
const _renderAllOriginal=renderAll;
function renderCurrentPage(page){
  ensureV7Data();
  applyThemeStyles();
  applyInterfacePreferences();
  const p=page||document.querySelector('.page.active')?.id?.replace('page-','')||'dashboard';
  if(p==='dashboard'){renderDashboard();ensureV10Data();renderV10Dashboard();renderV9Alerts();}
  else if(p==='students') renderStudents();
  else if(p==='agenda') renderAgenda();
  else if(p==='hours') renderHours();
  else if(p==='occupancy'){renderOccupancy();renderOccupancyManagement();}
  else if(p==='finance'){renderFinance();ensureV10Data();renderV10FinanceEnhancement();}
  else if(p==='billing') renderBilling();
  else if(p==='makeups') renderMakeups();
  else if(p==='birthdays') renderBirthdays();
  else if(p==='waitlist') renderWaitlist();
  else if(p==='reports') renderReports();
  else if(p==='teacher'){ensureV10Data();renderTeacherPanel();}
  else if(p==='teachers'){ensureV10Data();renderTeacherManagement();}
  else if(p==='alerts'){ensureV10Data();renderAlertsCenter();}
  else if(p==='equipment') renderEquipment();
  else if(p==='evolution') renderEvolution();
  else if(p==='settings'){loadGeneralSettingsInputs();renderSettingsCatalogs();renderTeacherRateConfig();renderV9BackupStatus();}
}
function renderAll(){
  const page=document.querySelector('.page.active')?.id?.replace('page-','')||window.currentPage||'dashboard';
  window.currentPage=page;
  renderCurrentPage(page);
  updateMenuBadges();
}



/* V10 — CAMADA DE EVOLUÇÃO */
function ensureV10Data(){
  if(!db.settings) db.settings={};
  if(!db.settings.interface) db.settings.interface={density:'standard',reducedEffects:false};
  db.settings.interface={density:'standard',reducedEffects:false,tableWidth:720,tableDensity:'standard',backgroundOpacity:66,menuOpacity:72,bottomNavOpacity:72,menuPosition:'left',...db.settings.interface};
  db.settings.system={confirmDelete:true,animations:true,hapticVisual:true,showBadges:true,keyboardShortcuts:true,...(db.settings.system||{})};
  if(!Array.isArray(db.finance)) db.finance=[];
  if(!db.settings.teacherFixedRates) db.settings.teacherFixedRates={};
  if(!db.settings.teacherClassValues) db.settings.teacherClassValues={};
  if(!db.settings.teacherClosings) db.settings.teacherClosings={};
  if(!db.settings.alertDismissed) db.settings.alertDismissed={};
  db.students.forEach(s=>{ if(!Array.isArray(s.history)) s.history=[]; });
  db.finance.forEach(f=>{ if(!f.type) f.type='Receita'; });
}
function v10Month(){ return todayISO().slice(0,7); }
function v10FinanceRows(){ return db.finance.filter(f=>sameMonth(f.dueDate,v10Month())); }
function v10Expenses(){ return v10FinanceRows().filter(f=>f.type==='Despesa'); }
function v10Income(){ return v10FinanceRows().filter(f=>f.type!=='Despesa'); }
function v10IncomeReceived(){ return v10Income().filter(f=>f.status==='Pago').reduce((a,f)=>a+Number(f.value||0),0); }
function v10ExpensePaid(){ return v10Expenses().filter(f=>f.status==='Pago').reduce((a,f)=>a+Number(f.value||0),0); }
function v10DefaultRate(){ const rows=v10Income(); const pending=rows.filter(f=>f.status==='Pendente').reduce((a,f)=>a+Number(f.value||0),0); const total=rows.reduce((a,f)=>a+Number(f.value||0),0); return total?pending/total*100:0; }
function renderV10Dashboard(){
  ensureV10Data();
  const received=v10IncomeReceived(), expenses=v10ExpensePaid(), net=received-expenses;
  const today=todayISO(), todayClasses=db.classes.filter(c=>c.date===today);
  const pendingMakeups=db.makeups.filter(m=>m.status==='Pendente');
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
  set('kpiNet',money(net)); set('kpiDefault',v10DefaultRate().toFixed(1).replace('.',',')+'%'); set('kpiTodayClasses',todayClasses.length); set('kpiMakeups',pendingMakeups.length);
  const active=activeStudents(), occS=occupancyStats();
  const teacherGroups={}; active.forEach(s=>{const t=s.teacher||'Sem professora'; teacherGroups[t]=(teacherGroups[t]||0)+1;});
  const topTeacher=Object.entries(teacherGroups).sort((a,b)=>b[1]-a[1])[0];
  const mg=document.getElementById('dashboardManagement'); if(mg) mg.innerHTML=`
    <div class="v10-management-item"><div class="label">Alunos ativos</div><div class="value">${active.length}</div><div class="foot">Base atual</div></div>
    <div class="v10-management-item"><div class="label">Ocupação estimada</div><div class="value">${occS.pct.toFixed(0)}%</div><div class="foot">Grade semanal</div></div>
    <div class="v10-management-item"><div class="label">Professora com mais alunos</div><div class="value" style="font-size:15px">${topTeacher?esc(topTeacher[0]):'—'}</div><div class="foot">${topTeacher?topTeacher[1]+' aluno(s)':'Sem dados'}</div></div>
    <div class="v10-management-item"><div class="label">Despesas pagas</div><div class="value">${money(expenses)}</div><div class="foot">Mês atual</div></div>`;
}
function renderV10FinanceEnhancement(){
  const exp=v10Expenses().reduce((a,f)=>a+Number(f.value||0),0), net=v10IncomeReceived()-v10ExpensePaid();
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;}; set('financeExpenses',money(exp));set('financeNet',money(net));
  financeCardDetails();
}
function openExpenseModal(id=null){
  editingId=id; const f=db.finance.find(x=>x.id===id)||{};
  const body=`<div class="form-grid"><div class="field full"><label>Descrição da despesa *</label><input id="expDesc" value="${esc(f.description||'')}" placeholder="Ex.: aluguel, energia, material"></div><div class="field"><label>Valor *</label><input id="expValue" type="number" step="0.01" min="0" value="${f.value??''}"></div><div class="field"><label>Data</label><input id="expDue" type="date" value="${esc(f.dueDate||todayISO())}"></div><div class="field"><label>Status</label><select id="expStatus"><option ${f.status==='Pendente'?'selected':''}>Pendente</option><option ${f.status==='Pago'?'selected':''}>Pago</option></select></div><div class="field"><label>Forma de pagamento</label><select id="expPay"><option value="">Selecione</option>${db.payments.map(p=>`<option ${f.paymentMethod===p?'selected':''}>${esc(p)}</option>`).join('')}</select></div><div class="field full"><label>Observação</label><textarea id="expNotes">${esc(f.notes||'')}</textarea></div></div>`;
  openModal(id?'Editar Despesa':'Nova Despesa',body,saveExpense);
}
function saveExpense(){
  const obj={id:editingId||uid('exp'),studentId:'',studentName:'',description:document.getElementById('expDesc').value.trim(),value:Number(document.getElementById('expValue').value||0),dueDate:document.getElementById('expDue').value,status:document.getElementById('expStatus').value,paymentMethod:document.getElementById('expPay').value,notes:document.getElementById('expNotes').value,type:'Despesa'};
  if(!obj.description||obj.value<=0||!obj.dueDate){toast('Informe descrição, valor e data da despesa.');return;}
  const i=db.finance.findIndex(x=>x.id===editingId); if(i>=0)db.finance[i]=obj;else db.finance.push(obj);
  saveDB();closeModal();renderAll();toast('Despesa salva com sucesso.');
}
function renderTeacherPanel(){
  ensureV10Data(); const filter=document.getElementById('teacherPanelFilter')?.value||'';
  const sel=document.getElementById('teacherPanelFilter'); if(sel){const cur=filter;sel.innerHTML='<option value="">Todas as professoras</option>'+db.teachers.map(t=>`<option ${t===cur?'selected':''}>${esc(t)}</option>`).join('');if(cur)sel.value=cur;}
  const classes=db.classes.filter(c=>c.date===todayISO()&&(!filter||c.teacher===filter)).sort(dateTimeSort);
  const students=activeStudents().filter(s=>!filter||s.teacher===filter);
  const k=document.getElementById('teacherPanelKpis'); if(k) k.innerHTML=[['Aulas hoje',classes.length,'Agenda do dia'],['Alunos',students.length,'Ativos'],['Realizadas',classes.filter(c=>c.status==='Realizada').length,'Hoje'],['Pendentes',classes.filter(c=>c.status==='Agendada').length,'Hoje']].map(x=>`<div class="module-kpi"><div class="label">${x[0]}</div><div class="value">${x[1]}</div><div class="foot">${x[2]}</div></div>`).join('');
  const tc=document.getElementById('teacherTodayClasses'); if(tc) tc.innerHTML=classes.map(c=>`<div class="v10-teacher-row"><strong>${esc(c.time)}</strong> — ${esc(c.studentName)}<div style="margin-top:5px">${classStatusBadge(c.status)} <button class="btn small" onclick="openClassModal(null,null,'${c.id}')">Editar</button></div></div>`).join('')||'<div class="empty">Nenhuma aula hoje.</div>';
  const ts=document.getElementById('teacherStudents'); if(ts) ts.innerHTML=students.slice(0,30).map(s=>`<div class="v10-teacher-row"><strong>${esc(s.name)}</strong><div class="muted">${esc(s.time||'—')} • ${daysLabel(s.days)} • ${esc(s.plan||'Sem plano')}</div></div>`).join('')||'<div class="empty">Nenhum aluno encontrado.</div>';
}
function openStudentTimeline(id){
  const s=studentById(id);if(!s)return; const classes=db.classes.filter(c=>c.studentId===id).sort(dateTimeSort).slice(-20).reverse(); const fin=db.finance.filter(f=>f.studentId===id).sort((a,b)=>String(b.dueDate).localeCompare(String(a.dueDate))).slice(0,12);
  const body=`<div><div class="module-kpis"><div class="module-kpi"><div class="label">Plano</div><div class="value" style="font-size:15px">${esc(s.plan||'—')}</div></div><div class="module-kpi"><div class="label">Mensalidade</div><div class="value" style="font-size:17px">${money(s.monthly)}</div></div><div class="module-kpi"><div class="label">Aulas registradas</div><div class="value">${classes.length}</div></div></div><div class="section-title">Últimas aulas</div>${classes.map(c=>`<div class="v10-teacher-row">${dateBR(c.date)} • ${esc(c.time)} • ${classStatusBadge(c.status)}</div>`).join('')||'<div class="empty">Sem aulas registradas.</div>'}<div class="section-title" style="margin-top:15px">Últimos lançamentos</div>${fin.map(f=>`<div class="v10-teacher-row">${dateBR(f.dueDate)} • ${esc(f.description||'Lançamento')} • ${money(f.value)} • ${esc(f.status)}</div>`).join('')||'<div class="empty">Sem lançamentos.</div>'}</div>`;
  openModal('Ficha / Linha do Tempo — '+s.name,body,closeModal);
}
function enhanceStudentActions(){
}
function enhanceFinanceTable(){
  const el=document.getElementById('financeTable'); if(!el)return;
  el.querySelectorAll('tr').forEach(tr=>{});
}
function registerPWA(){ if('serviceWorker' in navigator && location.protocol!=='file:'){ navigator.serviceWorker.register('sw.js').catch(()=>{}); } }

/* INICIALIZAÇÃO DO SISTEMA */
document.addEventListener("DOMContentLoaded", () => {
  db = loadDB();
  // Migra/espelha imediatamente os alunos existentes para a persistência redundante.
  saveStudentVault(db.students);
  renderAll();
  // A partir daqui, persistências sem mensagem específica recebem “Alteração feita”.
  window.__appReady = true;
});


/* ===== extracted script block ===== */

(function(){
  'use strict';
  const actions=[
    {icon:uiIcon('search',20),title:'Buscar aluno',sub:'Encontre rapidamente um aluno',type:'student-search'},
    {icon:uiIcon('userplus',20),title:'Cadastrar aluno',sub:'Abrir cadastro de novo aluno',run:()=>openStudentModal()},
    {icon:uiIcon('calplus',20),title:'Agendar aula',sub:'Abrir agenda e nova aula',run:()=>openClassModal()},
    {icon:uiIcon('cash',20),title:'Financeiro',sub:'Receitas, cobranças e despesas',run:()=>iosSmartGo('finance')},
    {icon:uiIcon('cog',20),title:'Configurações',sub:'Preferências e aparência',run:()=>iosSmartGo('settings')},
    {icon:uiIcon('bolt',20),title:'Ações rápidas',sub:'Abrir central de ações',run:()=>openQuickActions()}
  ];
  window.iosHaptic=function(kind){
    try{if(navigator.vibrate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){navigator.vibrate(kind==='success'?[8,24,8]:kind==='warning'?[18]:[6]);}}catch(e){}
  };
  window.iosSmartGo=function(page){
    try{
      const btn=document.querySelector('#mobileBottomNav button[data-page="'+page+'"]');
      if(btn) btn.click();
      else if(typeof goPage==='function') goPage(page);
      else if(typeof showPage==='function') showPage(page);
      else if(typeof navigateTo==='function') navigateTo(page);
      iosHaptic('tap');
    }catch(e){console.warn('iosSmartGo',e)}
  };
  function escSafe(v){return typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function dateKey(c){return String(c?.date||'');}
  function timeVal(c){return String(c?.time||'').replace(/\D/g,'').padStart(4,'0');}
  function updateSmartState(){
    try{
      const classes=Array.isArray(window.db?.classes)?window.db.classes:[];
      const today=typeof todayISO==='function'?todayISO():new Date().toISOString().slice(0,10);
      const todayClasses=classes.filter(c=>dateKey(c)===today && c.status!=='Cancelada').sort((a,b)=>timeVal(a).localeCompare(timeVal(b)));
      const now=new Date(); const hm=String(now.getHours()).padStart(2,'0')+String(now.getMinutes()).padStart(2,'0');
      const next=todayClasses.find(c=>timeVal(c)>=hm) || todayClasses[0];
      const occupancy=todayClasses.length;
      const _dow=String(new Date().getDay());
      const capacity=Number(window.db?.settings?.capacity||0)*(window.db?.hours||[]).filter(h=>getHourDays(h).includes(_dow)).length;
      const used=todayClasses.length;
      const wNext=document.getElementById('iosWidgetNext');
      const wNextFoot=document.getElementById('iosWidgetNextFoot');
      const wOcc=document.getElementById('iosWidgetOccupancy');
      const wOccFoot=document.getElementById('iosWidgetOccupancyFoot');
      if(wNext) wNext.textContent=next?(String(next.time||'').slice(0,5)||'Hoje'):'—';
      if(wNextFoot) wNextFoot.textContent=next?`${next.studentName||'Aula'}${next.teacher?' · '+next.teacher:''}`:'Nenhuma aula programada';
      if(wOcc) wOcc.textContent=capacity?`${used}/${capacity}`:String(occupancy);
      if(wOccFoot) wOccFoot.textContent=capacity?'vagas de hoje':'aulas agendadas hoje';
      const alertCount=document.querySelectorAll('#navAlertsBadge').length?Number(document.getElementById('navAlertsBadge')?.textContent||0):0;
      const wa=document.getElementById('iosWidgetAlerts'); const waf=document.getElementById('iosWidgetAlertsFoot');
      if(wa) wa.textContent=Number.isFinite(alertCount)?String(alertCount):'0';
      if(waf) waf.textContent=alertCount?'Requer sua atenção':'Tudo em ordem';
    }catch(e){console.warn('smart state',e)}
  }
  window.openIOSCommandCenter=function(){
    const b=document.getElementById('iosCommandBackdrop'); if(!b)return;
    b.classList.add('open'); b.setAttribute('aria-hidden','false'); renderCommands('');
    setTimeout(()=>document.getElementById('iosCommandInput')?.focus(),40); iosHaptic('tap');
  };
  window.closeIOSCommandCenter=function(){const b=document.getElementById('iosCommandBackdrop');if(!b)return;b.classList.remove('open');b.setAttribute('aria-hidden','true');};
  function renderCommands(q){
    const list=document.getElementById('iosCommandList'); if(!list)return;
    q=String(q||'').trim().toLowerCase();
    let items=actions.filter(a=>!q || (a.title+' '+a.sub).toLowerCase().includes(q));
    if(q){
      const students=Array.isArray(window.db?.students)?window.db.students:[];
      students.filter(s=>String(s.name||'').toLowerCase().includes(q)).slice(0,8).forEach(s=>items.push({icon:uiIcon('user',20),title:s.name||'Aluno',sub:'Abrir ficha do aluno',run:()=>{try{iosSmartGo('students')}catch(e){iosSmartGo('students')}}}));
    }
    list.innerHTML=items.length?items.map((a,i)=>`<button class="ios-command-item" type="button" data-cmd="${i}"><span class="cmd-icon">${a.icon}</span><span><strong>${escSafe(a.title)}</strong><small>${escSafe(a.sub)}</small></span></button>`).join(''):`<div style="padding:22px;text-align:center;color:var(--muted);font-size:12px">Nenhum resultado.</div>`;
    [...list.querySelectorAll('[data-cmd]')].forEach((el,i)=>el.addEventListener('click',()=>{const a=items[i];closeIOSCommandCenter();setTimeout(()=>{try{a.run&&a.run()}catch(e){console.warn(e)}},30)}));
  }
  document.addEventListener('keydown',e=>{
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openIOSCommandCenter();}
    if(e.key==='Escape') closeIOSCommandCenter();
  });
  document.addEventListener('click',e=>{
    const t=e.target.closest('button,.btn,[role="button"]'); if(t && t.id!=='iosCommandInput') iosHaptic('tap');
  },{passive:true});
  document.addEventListener('input',e=>{if(e.target.id==='iosCommandInput')renderCommands(e.target.value)},{passive:true});
  window.addEventListener('load',()=>{updateSmartState();setInterval(updateSmartState,15000);});
  window.addEventListener('storage',updateSmartState);
  window.addEventListener('ios:db-updated',updateSmartState);
})();


/* ===== extracted script block ===== */


/* Funções extras com fallback seguro */
function pinDashboardSummary(){localStorage.setItem("dashboard_summary_pinned","1");if(typeof toast==="function")toast("Resumo gerencial fixado.")}
function refreshManagementPanel(){if(typeof renderDashboard==="function")renderDashboard();if(typeof renderDashboardManagement==="function")renderDashboardManagement();if(typeof toast==="function")toast("Painel atualizado.")}
function printManagementSummary(){window.print()}
function focusStudentSearch(){goPage("students");setTimeout(()=>document.getElementById("studentSearch")?.focus(),100)}
function exportStudentsList(){if(typeof exportData==="function")exportData()}
function printStudentsList(){window.print()}
function goAgendaToday(){goPage("agenda")}
function focusNextClass(){goPage("agenda")}
function printAgenda(){window.print()}
function printHours(){window.print()}
function pinOccupancyMatrix(){localStorage.setItem("occupancy_matrix_pinned","1");if(typeof toast==="function")toast("Matriz de ocupação fixada.")}
function printOccupancyManagement(){window.print()}
function openFinanceSummary(){goPage("finance")}
function exportFinanceReport(){if(typeof exportData==="function")exportData()}
function printFinanceSummary(){window.print()}
function printBilling(){window.print()}
function renderMakeups(){if(typeof renderMakeupsPage==="function")renderMakeupsPage()}
function filterBirthdaysMonth(){goPage("birthdays")}
function openBirthdayBatch(){if(typeof openBatchWhatsAppModal==="function")openBatchWhatsAppModal()}
function printBirthdays(){window.print()}
function sortWaitlistPriority(){goPage("waitlist")}
function openWaitlistBatch(){goPage("waitlist")}
function exportReports(){if(typeof exportData==="function")exportData()}
function printReports(){window.print()}
function printTeacherPanel(){window.print()}

/* Painel gerencial resumido */
function renderManagementSummary(){
  const box=document.getElementById("managementSummary");if(!box)return;
  const students=(typeof db!=="undefined"&&db.students)?db.students:[];
  const active=students.filter(s=>String(s.status||"Ativo").toLowerCase()==="ativo").length;
  const plans=[...new Set(students.map(s=>s.plan||s.plano).filter(Boolean))].length;
  const classes=(typeof db!=="undefined"&&db.classes)?db.classes:[];
  const today=new Date().toISOString().slice(0,10);
  const todayClasses=classes.filter(c=>String(c.date||c.data||"").slice(0,10)===today).length;
  box.innerHTML=`
    <div class="grid grid-4">
      <div class="card kpi"><div class="kpi-label">ALUNOS ATIVOS</div><div class="kpi-value">${active}</div><div class="kpi-foot">Base atual</div></div>
      <div class="card kpi"><div class="kpi-label">PLANOS EM USO</div><div class="kpi-value">${plans}</div><div class="kpi-foot">Planos cadastrados nos alunos</div></div>
      <div class="card kpi"><div class="kpi-label">AULAS HOJE</div><div class="kpi-value">${todayClasses}</div><div class="kpi-foot">Agenda do dia</div></div>
      <div class="card kpi"><div class="kpi-label">GESTÃO</div><div class="kpi-value">Ativa</div><div class="kpi-foot">Sistema operacional</div></div>
    </div>`;
}

/* Ocupação: alunos por plano + dia + horário */
function normalizeOccupancyDays(raw){
  const arr=Array.isArray(raw)?raw:[raw];
  const map={seg:'1',segunda:'1',ter:'2',terça:'2',terca:'2',qua:'3',quarta:'3',qui:'4',quinta:'4',sex:'5',sexta:'5',sáb:'6',sab:'6',sábado:'6',sabado:'6',dom:'0',domingo:'0'};
  return [...new Set(arr.flatMap(v=>{const x=String(v??'').trim().toLowerCase();return map[x]?[map[x]]:[x];}).filter(Boolean))];
}
function occupancyDayName(v){return ({'1':'Seg','2':'Ter','3':'Qua','4':'Qui','5':'Sex','6':'Sáb','0':'Dom'})[String(v)]||String(v)}
function filterOccupancyDay(day){
  window.occupancySelectedDay=day||'all';
  document.querySelectorAll('#occupancyDayFilters .btn').forEach(b=>b.classList.remove('primary'));
  const labels={all:'Todos','1':'Segunda','2':'Terça','3':'Quarta','4':'Quinta','5':'Sexta','6':'Sábado','0':'Domingo'};
  const target=[...document.querySelectorAll('#occupancyDayFilters .btn')].find(b=>b.textContent.trim()===labels[String(window.occupancySelectedDay)]);
  if(target)target.classList.add('primary');
  renderOccupancyManagement();
}
function renderOccupancyManagement(){
  const box=document.getElementById("occupancyPlanMatrix");if(!box)return;
  const students=(typeof db!=="undefined"&&db.students)?db.students:[];
  const selected=window.occupancySelectedDay||'all';
  const rows=students.map(s=>({
    name:s.name||s.nome||"Aluno",
    plan:s.plan||s.plano||s.planName||"Sem plano",
    time:s.schedule||s.horario||s.time||"—",
    days:normalizeOccupancyDays(s.days||s.dias||s.weekdays||s.day||[])
  })).filter(r=>selected==='all'||r.days.length===0||r.days.includes(String(selected)));
  const plans=[...new Set(rows.map(r=>r.plan))].sort((a,b)=>String(a).localeCompare(String(b),'pt-BR'));
  if(!plans.length){box.innerHTML='<div class="empty">Nenhum aluno encontrado para o filtro selecionado.</div>';return;}
  box.innerHTML=plans.map(plan=>{
    const pr=rows.filter(r=>r.plan===plan);
    const groups={};
    pr.forEach(r=>{
      const days=r.days.length?r.days.slice().sort((a,b)=>Number(a)-Number(b)):[];
      const key=r.time+'|'+(days.length?days.join(','):'sem-dia');
      if(!groups[key])groups[key]={time:r.time,days,names:[]};
      groups[key].names.push(r.name);
    });
    const ordered=Object.values(groups).sort((a,b)=>String(a.time).localeCompare(String(b.time)));
    return `<div class="card panel" style="margin-top:10px">
      <div class="panel-head"><div><div class="panel-title">${esc(plan)}</div><div class="muted" style="font-size:11px">${pr.length} aluno(s) neste plano</div></div><span class="badge info">${selected==='all'?'Todos os dias':occupancyDayName(selected)}</span></div>
      <div class="table-wrap"><table><thead><tr><th>Dias</th><th>Horário</th><th>Aluno(s)</th></tr></thead><tbody>
      ${ordered.map(g=>`<tr><td><strong>${esc(g.days.length?g.days.map(occupancyDayName).join(', '):'Não definido')}</strong></td><td><span class="schedule-chip">${esc(g.time)}</span></td><td>${g.names.map(esc).join(', ')}</td></tr>`).join('')||'<tr><td colspan="3" class="muted">Nenhum aluno registrado.</td></tr>'}
      </tbody></table></div>
    </div>`;
  }).join('');
}


/* iOS 27 — personalização de densidade, tabelas, transparência e relógio do aparelho */
function applyAdvancedInterfaceSettings(){
  const prefs=db?.settings?.interface||{};
  const width=Math.max(520,Math.min(1100,Number(prefs.tableWidth||720)));
  const density=['compact','standard','comfortable'].includes(prefs.tableDensity)?prefs.tableDensity:'standard';
  const opacity=Math.max(0,Math.min(100,Number(prefs.backgroundOpacity??66)));
  const menuOpacity=Math.max(0,Math.min(100,Number(prefs.menuOpacity??72)));
  const bottomNavOpacity=Math.max(0,Math.min(100,Number(prefs.bottomNavOpacity??72)));
  document.documentElement.style.setProperty('--white-bg-opacity',(opacity/100).toFixed(2));
  document.documentElement.style.setProperty('--menu-opacity',(menuOpacity/100).toFixed(2));
  document.documentElement.style.setProperty('--bottom-nav-opacity',(bottomNavOpacity/100).toFixed(2));
  document.documentElement.style.setProperty('--table-min-width',width+'px');
  document.documentElement.style.setProperty('--system-bg-opacity',(opacity/100).toFixed(2));
  document.documentElement.dataset.tableDensity=density;
  const wr=document.getElementById('tableWidthRange'); if(wr)wr.value=String(width);
  const wo=document.getElementById('tableWidthValue'); if(wo)wo.textContent=width+' px';
  const br=document.getElementById('backgroundOpacityRange'); if(br)br.value=String(opacity);
  const bo=document.getElementById('backgroundOpacityValue'); if(bo)bo.textContent=opacity+'%';
  const mr=document.getElementById('menuOpacityRange'); if(mr)mr.value=String(menuOpacity);
  const mo=document.getElementById('menuOpacityValue'); if(mo)mo.textContent=menuOpacity+'%';
  const brn=document.getElementById('bottomNavOpacityRange'); if(brn)brn.value=String(bottomNavOpacity);
  const bno=document.getElementById('bottomNavOpacityValue'); if(bno)bno.textContent=bottomNavOpacity+'%';
  document.querySelectorAll('[data-table-width]').forEach(b=>b.classList.toggle('active',(width<=620?'compact':width>=900?'wide':'standard')===b.dataset.tableWidth));
  document.querySelectorAll('[data-table-density]').forEach(b=>b.classList.toggle('active',b.dataset.tableDensity===density));
}
function setTableWidth(value){
  const width=Math.max(520,Math.min(1100,Number(value)||720));
  db.settings.interface={...(db.settings.interface||{}),tableWidth:width};
  applyAdvancedInterfaceSettings(); saveDB();
}
function setTableWidthPreset(preset){ setTableWidth({compact:600,standard:720,wide:920}[preset]||720); }
function setTableDensity(density){
  if(!['compact','standard','comfortable'].includes(density)) density='standard';
  db.settings.interface={...(db.settings.interface||{}),tableDensity:density};
  applyAdvancedInterfaceSettings(); saveDB(); toast('Densidade das tabelas atualizada.');
}
function setBackgroundOpacity(value){
  const opacity=Math.max(0,Math.min(100,Number(value)));
  db.settings.interface={...(db.settings.interface||{}),backgroundOpacity:opacity};
  applyAdvancedInterfaceSettings();
  if(typeof applyDashboardHero==='function') applyDashboardHero();
  saveDB();
}
function setMenuOpacity(value){
  const menuOpacity=Math.max(0,Math.min(100,Number(value)||0));
  db.settings.interface={...(db.settings.interface||{}),menuOpacity};
  applyAdvancedInterfaceSettings();
  saveDB();
}
function setBottomNavOpacity(value){
  const bottomNavOpacity=Math.max(0,Math.min(100,Number(value)||0));
  db.settings.interface={...(db.settings.interface||{}),bottomNavOpacity};
  applyAdvancedInterfaceSettings();
  saveDB();
}
function syncDeviceDateTime(){
  const now=new Date(), dateEl=document.getElementById('deviceDate'), timeEl=document.getElementById('deviceTime');
  if(dateEl) dateEl.textContent=new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}).format(now);
  if(timeEl) timeEl.textContent=new Intl.DateTimeFormat('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(now);
}
function startDeviceClock(){
  syncDeviceDateTime();
  if(window.__deviceClockTimer) clearInterval(window.__deviceClockTimer);
  if(window.__equipmentDashboardTimer) clearInterval(window.__equipmentDashboardTimer);
  window.__deviceClockTimer=setInterval(syncDeviceDateTime,1000);
  // Atualização operacional sem criar múltiplos timers quando a inicialização
  // da interface for executada novamente.
  window.__equipmentDashboardTimer=setInterval(()=>{
    if(window.currentPage==='dashboard' && typeof renderDashboardEquipmentSchedule==='function') renderDashboardEquipmentSchedule();
    if(window.currentPage==='equipment' && typeof renderControlEquipment==='function') renderControlEquipment();
  },15000);
}

/* V11 — preferências de interface e atalhos */
function applyInterfacePreferences(){
  const prefs=db?.settings?.interface || {};
  const density=['comfortable','standard','compact'].includes(prefs.density)?prefs.density:'standard';
  const reduced=!!prefs.reducedEffects;
  document.documentElement.dataset.uiDensity=density;
  document.documentElement.dataset.reduceEffects=reduced?'1':'0';
  applyAdvancedInterfaceSettings();
  document.querySelectorAll('#uiDensityOptions .v11-preference-btn').forEach(b=>b.classList.toggle('active',b.dataset.density===density));
  const sw=document.getElementById('reduceEffectsSwitch');
  if(sw){sw.classList.toggle('on',reduced);sw.setAttribute('aria-checked',String(reduced));}
}
function setInterfaceDensity(density){
  if(!['comfortable','standard','compact'].includes(density)) density='standard';
  db.settings.interface={...(db.settings.interface||{}),density};
  applyInterfacePreferences(); saveDB(); toast(`Interface ${density==='compact'?'compacta':density==='comfortable'?'confortável':'padrão'} aplicada.`);
}
function toggleReducedEffects(){
  db.settings.interface={...(db.settings.interface||{}),reducedEffects:!db.settings.interface?.reducedEffects};
  applyInterfacePreferences(); saveDB();
  toast(db.settings.interface.reducedEffects?'Efeitos reduzidos para priorizar desempenho.':'Efeitos visuais restaurados.');
}
function focusGlobalSearch(){
  const i=document.getElementById('menuSearch');
  if(i){document.getElementById('sidebar')?.classList.add('open');i.focus();i.select();}
}
function closeTransientUI(){
  const modal=document.getElementById('modalBackdrop');
  if(modal?.classList.contains('show')){closeModal();return true;}
  const sidebar=document.getElementById('sidebar');
  if(sidebar?.classList.contains('open')){sidebar.classList.remove('open');return true;}
  document.getElementById('menuSearch')?.blur();
  return false;
}

/* Tenta atualizar os blocos sem interferir no código oficial */
function refreshAdvancedPanels(force=false){
  try{updateCustomizationState()}catch(e){}
  if(force || document.getElementById('page-occupancy')?.classList.contains('active')) try{renderOccupancyManagement()}catch(e){}
}
document.addEventListener("DOMContentLoaded",()=>{
  document.documentElement.dataset.reduceEffects=(db.settings.interface?.reducedEffects?'1':'0');
  loadDashboardAppearance();
  applyInterfacePreferences();
  applyAdvancedInterfaceSettings();
  startDeviceClock();
  if(window.requestIdleCallback){requestIdleCallback(()=>refreshAdvancedPanels(false),{timeout:1500});}
});


/* ===== extracted script block ===== */

(function(){
  function syncBottomNav(){
    const page=window.currentPage||document.querySelector('.page.active')?.id?.replace('page-','')||'dashboard';
    document.querySelectorAll('#mobileBottomNav button').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
  }
  document.addEventListener('click',e=>{
    const sidebar=document.getElementById('sidebar');
    if(sidebar?.classList.contains('open') && !e.target.closest('#sidebar') && !e.target.closest('.mobile-menu')) sidebar.classList.remove('open');
    const b=e.target.closest('#mobileBottomNav button');
    if(!b)return;
    e.preventDefault();
    e.stopPropagation();
    if(typeof goPage==='function') goPage(b.dataset.page);
    setTimeout(syncBottomNav,30);
  });
  const oldGo=window.goPage;
  if(typeof oldGo==='function') window.goPage=function(page){const r=oldGo.apply(this,arguments);setTimeout(syncBottomNav,20);return r;};
  window.addEventListener('DOMContentLoaded',()=>setTimeout(syncBottomNav,100));
})();


/* ===== extracted script block ===== */

(function(){
  const backdrop=document.getElementById('iosConfirmBackdrop');
  const titleEl=document.getElementById('iosConfirmTitle');
  const messageEl=document.getElementById('iosConfirmMessage');
  const okBtn=document.getElementById('iosConfirmOk');
  const cancelBtn=document.getElementById('iosConfirmCancel');
  const iconEl=document.getElementById('iosConfirmIcon');
  let resolver=null, previousFocus=null;
  const trashSvg='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M7 7l1 13h8l1-13"/><path d="M10 11v5M14 11v5"/></svg>';
  const warnSvg='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5 21 20H3L12 3.5Z"/><path d="M12 9v5"/><path d="M12 17.5h.01"/></svg>';
  const restoreSvg='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9a8 8 0 1 1 2.35 5.65"/><path d="M4 4v5h5"/></svg>';
  function close(value){
    if(!backdrop||!resolver)return;
    const r=resolver; resolver=null; backdrop.classList.remove('is-open'); backdrop.setAttribute('aria-hidden','true');
    document.body.classList.remove('ios-confirm-open');
    setTimeout(()=>{if(previousFocus?.focus) previousFocus.focus();previousFocus=null;},180);
    r(value);
  }
  window.iosConfirm=function(message, options={}){
    if(!backdrop) return Promise.resolve(false);
    if(resolver) close(false);
    previousFocus=document.activeElement;
    titleEl.textContent=options.title||'Confirmar ação';
    messageEl.textContent=String(message??'');
    const danger=options.danger!==false;
    okBtn.textContent=options.okLabel||'Confirmar';
    okBtn.classList.toggle('danger',danger);
    iconEl.innerHTML=options.icon==='restore'?restoreSvg:(danger?trashSvg:warnSvg);
    backdrop.classList.add('is-open'); backdrop.setAttribute('aria-hidden','false'); document.body.classList.add('ios-confirm-open');
    requestAnimationFrame(()=>okBtn.focus());
    return new Promise(resolve=>{resolver=resolve;});
  };
  okBtn?.addEventListener('click',()=>close(true));
  cancelBtn?.addEventListener('click',()=>close(false));
  backdrop?.addEventListener('click',e=>{if(e.target===backdrop)close(false)});
  document.addEventListener('keydown',e=>{if(!backdrop?.classList.contains('is-open'))return;if(e.key==='Escape'){e.preventDefault();close(false)}});
})();


/* ===== extracted script block ===== */

/* V42 — evolução profissional: indicadores, metas, reavaliação e comparação longitudinal */
function evo42Num(v,def=0){const n=Number(v);return Number.isFinite(n)?n:def}
function evo42Clamp(v,min=0,max=10){return Math.max(min,Math.min(max,evo42Num(v,min)))}
function evo42Date(d){return d?dateBR(d):'—'}
function evo42DaysFrom(a,b){if(!a||!b)return null;return Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/864e5)}
function ensureEvolutionV42(){
 ensurePatientEvolutionData();
 db.students.forEach(s=>{
  const c=s.clinical||{};
  ['baselineDate','painScore','painLocation','functionalScale','functionalScore','postureScore','mobilityScore','strengthScore','balanceScore','controlScore'].forEach(k=>{if(c[k]==null)c[k]='';});
  if(!Array.isArray(c.goals))c.goals=[];
  c.goals=c.goals.map(g=>({id:g.id||uid('goal'),area:String(g.area||'Funcional'),description:String(g.description||''),baseline:g.baseline??'',target:g.target??'',current:g.current??'',unit:String(g.unit||''),targetDate:g.targetDate||'',status:g.status||'Em andamento'}));
  s.clinical=c;
  if(!Array.isArray(s.evolution))s.evolution=[];
  s.evolution=s.evolution.map(e=>({id:e.id||uid('evo'),date:e.date||todayISO(),title:e.title||'Evolução',complaint:e.complaint||'',objective:e.objective||c.objective||'',assessment:e.assessment||'',pain:e.pain||'',painBefore:e.painBefore??'',painAfter:e.painAfter??'',functionalScore:e.functionalScore??'',mobilityScore:e.mobilityScore??'',strengthScore:e.strengthScore??'',balanceScore:e.balanceScore??'',controlScore:e.controlScore??'',intervention:e.intervention||'',exercises:e.exercises||'',response:e.response||'',adherence:e.adherence||'',tolerance:e.tolerance||'',progression:e.progression||'',incidents:e.incidents||'',nextSteps:e.nextSteps||'',nextReview:e.nextReview||'',professional:e.professional||s.teacher||''}));
 });
}
function evo42Progress(g){const b=Number(g.baseline),t=Number(g.target),c=Number(g.current);if(![b,t,c].every(Number.isFinite)||t===b)return null;return Math.max(0,Math.min(100,Math.round(((c-b)/(t-b))*100)))}
function evo42Metric(label,val){if(val===''||val==null||!Number.isFinite(Number(val)))return `<div class="evo42-meter"><div class="evo42-meter-top"><span>${label}</span><b>—</b></div><div class="evo42-bar"><i style="width:0%"></i></div></div>`;const n=evo42Clamp(val);return `<div class="evo42-meter"><div class="evo42-meter-top"><span>${label}</span><b>${n}/10</b></div><div class="evo42-bar"><i style="width:${n*10}%"></i></div></div>`}
function renderEvolution(){
 ensureEvolutionV42();const q=(document.getElementById('evolutionSearch')?.value||'').toLowerCase().trim(),sel=document.getElementById('evolutionStudentSelect');
 if(sel){const cur=sel.value;sel.innerHTML='<option value="">Todos os pacientes</option>'+db.students.slice().sort((a,b)=>String(a.name).localeCompare(String(b.name),'pt-BR')).map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('');sel.value=cur;}
 const selected=sel?.value||'',list=db.students.filter(s=>(!selected||s.id===selected)&&(!q||String(s.name).toLowerCase().includes(q))),k=document.getElementById('evolutionKpis');
 const total=db.students.reduce((n,s)=>n+(s.evolution||[]).length,0),tracked=db.students.filter(s=>(s.evolution||[]).length||s.clinical?.baselineDate).length,d30=new Date(Date.now()-30*864e5).toISOString().slice(0,10),recent=db.students.reduce((n,s)=>n+(s.evolution||[]).filter(e=>e.date>=d30).length,0),due=db.students.filter(s=>s.clinical?.nextReview&&s.clinical.nextReview<=todayISO()).length;
 if(k)k.className='evo42-kpis',k.innerHTML=[['Pacientes acompanhados',tracked],['Sessões registradas',total],['Reavaliações vencidas',due],['Registros · 30 dias',recent]].map(x=>`<div class="evo42-kpi"><div class="n">${x[1]}</div><div class="l">${x[0]}</div></div>`).join('');
 const grid=document.getElementById('evolutionPatientGrid');if(!grid)return;if(!list.length){grid.innerHTML='<div class="evo42-empty">Nenhum paciente encontrado.</div>';return;}grid.innerHTML='<div class="evo42-shell">'+list.map(evo42PatientCard).join('')+'</div>';
}
function evo42PatientCard(s){
 const c=s.clinical||{},entries=evolutionSummary(s),latest=entries[0],goals=c.goals||[],p0=latest?.painAfter!==''&&latest?.painAfter!=null?latest.painAfter:c.painScore,days=evo42DaysFrom(c.baselineDate||entries.at(-1)?.date,latest?.date),painDelta=(Number.isFinite(Number(c.painScore))&&Number.isFinite(Number(p0)))?Number(p0)-Number(c.painScore):null;
 return `<div class="evo42-patient"><div class="evo42-head"><div><h3>${esc(s.name)}</h3><div class="muted">${esc(s.plan||'Sem plano')} · ${esc(s.teacher||'Sem profissional')} ${days!=null?'· acompanhamento há '+days+' dias':''}</div></div><div class="evo42-actions"><button class="btn small primary" onclick="openEvolutionModal('${s.id}')">＋ Registrar sessão</button><button class="btn small" onclick="openClinicalProfileV42('${s.id}')">Ficha completa</button><button class="btn small" onclick="openEvolutionReport('${s.id}')">Relatório</button></div></div>
 <div class="evo42-grid"><div class="evo42-card"><div class="evo42-section-title"><h4>Indicadores atuais</h4><span class="evo42-badge">${latest?evo42Date(latest.date):'Sem sessão'}</span></div><div class="evo42-metrics">${evo42Metric('Mobilidade',latest?.mobilityScore??c.mobilityScore)}${evo42Metric('Força / resistência',latest?.strengthScore??c.strengthScore)}${evo42Metric('Equilíbrio / coordenação',latest?.balanceScore??c.balanceScore)}${evo42Metric('Controle motor',latest?.controlScore??c.controlScore)}</div>${c.painScore!==''||p0!==''?`<div class="evo42-compare" style="margin-top:10px"><div class="box"><div class="v">${c.painScore!==''?c.painScore:'—'}</div><div class="k">Dor inicial</div></div><div class="box"><div class="v">${p0!==''?p0:'—'}</div><div class="k">Dor atual</div></div><div class="box"><div class="v">${painDelta==null?'—':(painDelta>0?'+':'')+painDelta}</div><div class="k">Variação</div></div></div>`:''}</div>
 <div class="evo42-card"><div class="evo42-section-title"><h4>Metas</h4><span class="evo42-badge">${goals.length}</span></div>${goals.length?goals.slice(0,4).map(g=>{const pr=evo42Progress(g);return `<div class="evo42-goal"><div class="gt"><span>${esc(g.area)} · ${esc(g.description||'Meta')}</span><span>${pr==null?'—':pr+'%'}</span></div><div class="sub">${esc(String(g.current||'—'))} ${esc(g.unit)} → ${esc(String(g.target||'—'))} ${esc(g.unit)} ${g.targetDate?'· '+evo42Date(g.targetDate):''}</div>${pr!=null?`<div class="evo42-bar" style="margin-top:7px"><i style="width:${pr}%"></i></div>`:''}</div>`}).join(''):'<div class="evo42-empty">Cadastre metas mensuráveis na ficha completa.</div>'}${c.alerts?`<div class="evo42-alert" style="margin-top:9px"><b>Pontos de atenção:</b> ${esc(c.alerts)}</div>`:''}</div></div>
 <div class="evo42-card" style="margin-top:12px"><div class="evo42-section-title"><h4>Histórico de evolução</h4><span class="evo42-badge">${entries.length} registro(s)</span></div><div class="evo42-timeline">${entries.slice(0,5).map(e=>`<div class="evo42-entry"><div class="meta">${evo42Date(e.date)} · ${esc(e.professional||s.teacher||'Profissional')}</div><div class="title">${esc(e.title||'Evolução')}</div><div class="evo42-badges">${e.painAfter!==''?`<span class="evo42-badge">Dor ${esc(String(e.painAfter))}/10</span>`:''}${e.mobilityScore!==''?`<span class="evo42-badge">Mobilidade ${esc(String(e.mobilityScore))}/10</span>`:''}${e.functionalScore!==''?`<span class="evo42-badge">Função ${esc(String(e.functionalScore))}/10</span>`:''}${e.equipment?`<span class="evo42-badge">${esc(e.equipment)}</span>`:''}</div><div class="txt">${esc([e.assessment,e.response,e.progression].filter(Boolean).join('\n'))||'Sem observação detalhada.'}</div><div class="evo42-actions" style="margin-top:7px;justify-content:flex-start"><button class="btn small" onclick="openEvolutionModal('${s.id}','${e.id}')">Editar</button></div></div>`).join('')||'<div class="evo42-empty">Nenhuma sessão registrada.</div>'}</div></div></div>`;
}
function openClinicalProfileV42(id){
 ensureEvolutionV42();const s=studentById(id);if(!s)return;const c=s.clinical||{};
 const goalRows=(c.goals||[]).map(g=>`<div class="evo42-goal" data-goal-row="1"><input type="hidden" class="goalId" value="${esc(g.id)}"><div class="form-grid"><div class="field"><label>Área</label><input class="goalArea" value="${esc(g.area)}"></div><div class="field"><label>Meta</label><input class="goalDesc" value="${esc(g.description)}"></div><div class="field"><label>Inicial</label><input type="number" step="any" class="goalBase" value="${esc(String(g.baseline))}"></div><div class="field"><label>Atual</label><input type="number" step="any" class="goalCurrent" value="${esc(String(g.current))}"></div><div class="field"><label>Alvo</label><input type="number" step="any" class="goalTarget" value="${esc(String(g.target))}"></div><div class="field"><label>Unidade</label><input class="goalUnit" value="${esc(g.unit)}"></div><div class="field"><label>Prazo</label><input type="date" class="goalDate" value="${esc(g.targetDate)}"></div><div class="field"><label>Status</label><select class="goalStatus"><option ${g.status==='Em andamento'?'selected':''}>Em andamento</option><option ${g.status==='Atingida'?'selected':''}>Atingida</option><option ${g.status==='Pausada'?'selected':''}>Pausada</option><option ${g.status==='Revisar'?'selected':''}>Revisar</option></select></div></div><button class="btn small danger" type="button" onclick="this.closest('[data-goal-row]').remove()">Excluir meta</button></div>`).join('');
 const b=`<div class="evo42-modal-grid"><div class="evo42-card"><h4>Resumo clínico e funcional</h4><div class="field"><label>Queixa principal</label><textarea id="v42Complaint">${esc(c.complaint||'')}</textarea></div><div class="field"><label>Objetivo terapêutico / funcional</label><textarea id="v42Objective">${esc(c.objective||s.goal||'')}</textarea></div><div class="field"><label>Diagnóstico / condição informada</label><textarea id="v42Diagnosis">${esc(c.diagnosis||'')}</textarea></div><div class="field"><label>Histórico relevante</label><textarea id="v42Medical">${esc(c.medicalHistory||'')}</textarea></div><div class="field"><label>Contraindicações / cuidados</label><textarea id="v42Contra">${esc(c.contraindications||'')}</textarea></div><div class="field"><label>Alertas / pontos de atenção</label><textarea id="v42Alerts">${esc(c.alerts||'')}</textarea></div></div>
 <div class="evo42-card"><h4>Avaliação inicial e base de comparação</h4><div class="form-grid"><div class="field"><label>Data da avaliação inicial</label><input id="v42BaselineDate" type="date" value="${esc(c.baselineDate||'')}"></div><div class="field"><label>Próxima reavaliação</label><input id="v42Review" type="date" value="${esc(c.nextReview||'')}"></div><div class="field"><label>Dor inicial (0–10)</label><input id="v42Pain" type="number" min="0" max="10" value="${esc(String(c.painScore??''))}"></div><div class="field"><label>Localização da dor</label><input id="v42PainLoc" value="${esc(c.painLocation||'')}"></div><div class="field"><label>Escala funcional</label><input id="v42Scale" value="${esc(c.functionalScale||'')}"></div><div class="field"><label>Função inicial (0–10)</label><input id="v42Func" type="number" min="0" max="10" value="${esc(String(c.functionalScore??''))}"></div></div><div class="form-grid" style="margin-top:8px">${[['posture','Postura'],['mobility','Mobilidade'],['strength','Força / resistência'],['balance','Equilíbrio / coordenação'],['control','Controle motor']].map(x=>`<div class="field"><label>${x[1]} inicial (0–10)</label><input id="v42_${x[0]}" type="number" min="0" max="10" value="${esc(String(c[x[0]+'Score']??''))}"></div>`).join('')}</div><div class="field"><label>Medidas / testes / referências</label><textarea id="v42Measures">${esc(c.measurements||'')}</textarea></div></div>
 <div class="evo42-card full"><div class="evo42-section-title"><h4>Metas mensuráveis</h4><button class="btn small" type="button" onclick="addGoalV42()">＋ Adicionar meta</button></div><div id="v42Goals">${goalRows||'<div class="evo42-empty">Nenhuma meta cadastrada.</div>'}</div><div class="evo42-mini-note">Registre valores que possam ser comparados nas próximas avaliações. A unidade pode ser %, repetições, segundos, centímetros ou uma escala definida pelo profissional.</div></div>
 <div class="evo42-card full"><h4>Planejamento e observações</h4><div class="form-grid"><div class="field"><label>Frequência planejada</label><input id="v42Frequency" value="${esc(c.frequency||'')}"></div><div class="field"><label>Plano de intervenção</label><textarea id="v42Plan">${esc(c.plan||'')}</textarea></div><div class="field"><label>Orientações para casa</label><textarea id="v42Home">${esc(c.homecare||'')}</textarea></div><div class="field"><label>Postura</label><textarea id="v42Posture">${esc(c.posture||'')}</textarea></div><div class="field"><label>Mobilidade / amplitude</label><textarea id="v42Mobility">${esc(c.mobility||'')}</textarea></div><div class="field"><label>Força / resistência</label><textarea id="v42Strength">${esc(c.strength||'')}</textarea></div><div class="field"><label>Equilíbrio / coordenação</label><textarea id="v42Balance">${esc(c.balance||'')}</textarea></div><div class="field"><label>Respiração / controle motor</label><textarea id="v42Breathing">${esc(c.breathing||'')}</textarea></div></div></div></div>`;
 openModal(`Ficha completa — ${esc(s.name)}`,b,()=>{const goals=[...document.querySelectorAll('#v42Goals [data-goal-row]')].map(r=>({id:r.querySelector('.goalId')?.value||uid('goal'),area:r.querySelector('.goalArea')?.value.trim()||'Funcional',description:r.querySelector('.goalDesc')?.value.trim()||'',baseline:r.querySelector('.goalBase')?.value??'',current:r.querySelector('.goalCurrent')?.value??'',target:r.querySelector('.goalTarget')?.value??'',unit:r.querySelector('.goalUnit')?.value.trim()||'',targetDate:r.querySelector('.goalDate')?.value||'',status:r.querySelector('.goalStatus')?.value||'Em andamento'})).filter(g=>g.description||g.area);
 s.clinical={...s.clinical,complaint:v42Complaint.value.trim(),objective:v42Objective.value.trim(),diagnosis:v42Diagnosis.value.trim(),medicalHistory:v42Medical.value.trim(),contraindications:v42Contra.value.trim(),alerts:v42Alerts.value.trim(),baselineDate:v42BaselineDate.value,painScore:v42Pain.value,painLocation:v42PainLoc.value.trim(),functionalScale:v42Scale.value.trim(),functionalScore:v42Func.value,postureScore:v42_posture.value,mobilityScore:v42_mobility.value,strengthScore:v42_strength.value,balanceScore:v42_balance.value,controlScore:v42_control.value,measurements:v42Measures.value.trim(),nextReview:v42Review.value,goals,frequency:v42Frequency.value.trim(),plan:v42Plan.value.trim(),homecare:v42Home.value.trim(),posture:v42Posture.value.trim(),mobility:v42Mobility.value.trim(),strength:v42Strength.value.trim(),balance:v42Balance.value.trim(),breathing:v42Breathing.value.trim()};s.goal=s.clinical.objective||s.goal||'';s.updatedAt=new Date().toISOString();saveDB();renderAll();toast('Ficha de evolução atualizada.');return true;});
}
function addGoalV42(){const box=document.getElementById('v42Goals');if(!box)return;if(box.querySelector('.evo42-empty'))box.innerHTML='';const r=document.createElement('div');r.className='evo42-goal';r.dataset.goalRow='1';r.innerHTML=`<input type="hidden" class="goalId" value="${uid('goal')}"><div class="form-grid"><div class="field"><label>Área</label><input class="goalArea" value="Funcional"></div><div class="field"><label>Meta</label><input class="goalDesc"></div><div class="field"><label>Inicial</label><input type="number" step="any" class="goalBase"></div><div class="field"><label>Atual</label><input type="number" step="any" class="goalCurrent"></div><div class="field"><label>Alvo</label><input type="number" step="any" class="goalTarget"></div><div class="field"><label>Unidade</label><input class="goalUnit"></div><div class="field"><label>Prazo</label><input type="date" class="goalDate"></div><div class="field"><label>Status</label><select class="goalStatus"><option>Em andamento</option><option>Atingida</option><option>Pausada</option><option>Revisar</option></select></div></div><button class="btn small danger" type="button" onclick="this.closest('[data-goal-row]').remove()">Excluir meta</button>`;box.appendChild(r)}
function openEvolutionModal(studentId=null,entryId=null){
 ensureEvolutionV42();const s=studentById(studentId)||db.students[0];if(!s){toast('Cadastre um paciente primeiro.');return;}const old=(s.evolution||[]).find(e=>e.id===entryId)||{id:uid('evo'),date:todayISO(),title:'Evolução da sessão',complaint:s.clinical?.complaint||'',objective:s.clinical?.objective||s.goal||'',assessment:'',pain:'',painBefore:s.clinical?.painScore??'',painAfter:'',functionalScore:'',mobilityScore:'',strengthScore:'',balanceScore:'',controlScore:'',intervention:'',exercises:'',equipment:'',response:'',adherence:'',tolerance:'',progression:'',incidents:'',nextSteps:s.clinical?.plan||'',nextReview:s.clinical?.nextReview||'',professional:s.teacher||''};
 const b=`<div class="evo42-modal-grid"><div class="evo42-card"><h4>Sessão</h4><div class="field"><label>Paciente</label><select id="v42EvStudent">${db.students.map(x=>`<option value="${x.id}" ${x.id===s.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select></div><div class="form-grid"><div class="field"><label>Data</label><input id="v42EvDate" type="date" value="${esc(old.date||todayISO())}"></div><div class="field"><label>Título</label><input id="v42EvTitle" value="${esc(old.title||'Evolução da sessão')}"></div></div><div class="field"><label>Queixa / relato no início</label><textarea id="v42EvComplaint">${esc(old.complaint||'')}</textarea></div><div class="field"><label>Objetivo acompanhado</label><textarea id="v42EvObjective">${esc(old.objective||'')}</textarea></div></div>
 <div class="evo42-card"><h4>Indicadores da sessão</h4><div class="form-grid"><div class="field"><label>Dor antes (0–10)</label><input id="v42EvPainBefore" type="number" min="0" max="10" value="${esc(String(old.painBefore??''))}"></div><div class="field"><label>Dor depois (0–10)</label><input id="v42EvPainAfter" type="number" min="0" max="10" value="${esc(String(old.painAfter??''))}"></div><div class="field"><label>Função (0–10)</label><input id="v42EvFunc" type="number" min="0" max="10" value="${esc(String(old.functionalScore??''))}"></div><div class="field"><label>Mobilidade (0–10)</label><input id="v42EvMob" type="number" min="0" max="10" value="${esc(String(old.mobilityScore??''))}"></div><div class="field"><label>Força / resistência (0–10)</label><input id="v42EvStrength" type="number" min="0" max="10" value="${esc(String(old.strengthScore??''))}"></div><div class="field"><label>Equilíbrio (0–10)</label><input id="v42EvBalance" type="number" min="0" max="10" value="${esc(String(old.balanceScore??''))}"></div><div class="field"><label>Controle motor (0–10)</label><input id="v42EvControl" type="number" min="0" max="10" value="${esc(String(old.controlScore??''))}"></div></div></div>
 <div class="evo42-card full"><h4>Avaliação e intervenção</h4><div class="field"><label>Avaliação / achados</label><textarea id="v42EvAssessment">${esc(old.assessment||'')}</textarea></div><div class="form-grid"><div class="field"><label>Exercícios realizados</label><textarea id="v42EvExercises">${esc(old.exercises||'')}</textarea></div><div class="field"><label>Equipamentos utilizados</label><textarea id="v42EvEquipment">${esc(old.equipment||'')}</textarea></div><div class="field"><label>Intervenção / ajustes</label><textarea id="v42EvIntervention">${esc(old.intervention||'')}</textarea></div><div class="field"><label>Resposta / evolução observada</label><textarea id="v42EvResponse">${esc(old.response||'')}</textarea></div></div></div>
 <div class="evo42-card full"><h4>Adesão, tolerância e continuidade</h4><div class="form-grid"><div class="field"><label>Adesão</label><input id="v42EvAdherence" value="${esc(old.adherence||'')}"></div><div class="field"><label>Tolerância</label><input id="v42EvTolerance" value="${esc(old.tolerance||'')}"></div><div class="field"><label>Progressão</label><input id="v42EvProgression" value="${esc(old.progression||'')}"></div></div><div class="field"><label>Intercorrências / observações de segurança</label><textarea id="v42EvIncidents">${esc(old.incidents||'')}</textarea></div><div class="form-grid"><div class="field"><label>Plano para próxima sessão</label><textarea id="v42EvNext">${esc(old.nextSteps||'')}</textarea></div><div class="field"><label>Próxima revisão</label><input id="v42EvReview" type="date" value="${esc(old.nextReview||'')}"></div><div class="field"><label>Profissional responsável</label><input id="v42EvProfessional" value="${esc(old.professional||s.teacher||'')}"></div></div></div></div>`;
 openModal(entryId?'Editar evolução':'Registrar evolução',b,()=>{const t=studentById(v42EvStudent.value);if(!t)return false;if(!Array.isArray(t.evolution))t.evolution=[];const e={...old,id:old.id||uid('evo'),date:v42EvDate.value||todayISO(),title:v42EvTitle.value.trim()||'Evolução da sessão',complaint:v42EvComplaint.value.trim(),objective:v42EvObjective.value.trim(),assessment:v42EvAssessment.value.trim(),pain:v42EvPainAfter.value||v42EvPainBefore.value||'',painBefore:v42EvPainBefore.value,painAfter:v42EvPainAfter.value,functionalScore:v42EvFunc.value,mobilityScore:v42EvMob.value,strengthScore:v42EvStrength.value,balanceScore:v42EvBalance.value,controlScore:v42EvControl.value,intervention:v42EvIntervention.value.trim(),exercises:v42EvExercises.value.trim(),equipment:v42EvEquipment.value.trim(),response:v42EvResponse.value.trim(),adherence:v42EvAdherence.value.trim(),tolerance:v42EvTolerance.value.trim(),progression:v42EvProgression.value.trim(),incidents:v42EvIncidents.value.trim(),nextSteps:v42EvNext.value.trim(),nextReview:v42EvReview.value,professional:v42EvProfessional.value.trim()};const i=t.evolution.findIndex(x=>x.id===e.id);if(i>=0)t.evolution[i]=e;else t.evolution.push(e);t.evolution.sort((a,b)=>String(b.date).localeCompare(String(a.date)));if(e.nextReview)t.clinical.nextReview=e.nextReview;saveDB();renderAll();toast('Evolução registrada com sucesso.');return true;});
}
function openEvolutionReport(id){ensureEvolutionV42();const s=studentById(id);if(!s)return;const c=s.clinical||{},e=evolutionSummary(s),goals=c.goals||[];const w=window.open('','_blank');if(!w){toast('Permita pop-ups para gerar o relatório.');return;}w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Evolução — ${esc(s.name)}</title><style>body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;padding:28px;color:#17202a;max-width:900px;margin:auto}h1{font-size:22px}h2{font-size:15px;margin-top:22px;border-bottom:1px solid #ddd;padding-bottom:6px}.box{padding:12px;border:1px solid #ddd;border-radius:10px;margin:8px 0}.muted{color:#667085;font-size:12px}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.entry{border-left:3px solid #777;padding:8px 12px;margin:9px 0;background:#fafafa}.entry small{color:#667085}@media print{body{padding:0}}</style>
<style id="ios27-v70-final-3">
/* v70 — paleta enxuta + Liquid Glass refinado + desempenho */
:root{--ios27-accent-soft:color-mix(in srgb,var(--p) 10%,transparent);--ios27-surface-tint:color-mix(in srgb,var(--p) 3%,white);}
.palette-grid-pro{grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.palette-pro{min-height:106px;padding:12px 11px;border-radius:18px!important;background:linear-gradient(145deg,rgba(255,255,255,.72),rgba(255,255,255,.42))!important}.palette-swatches{gap:4px}.palette-swatches span{height:24px;border-radius:7px}.dark-palette-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.dark-palette{min-height:106px;padding:12px 11px;border-radius:18px!important;background:linear-gradient(145deg,rgba(40,40,50,.82),rgba(24,24,31,.66))!important}.dark-swatches{gap:4px}.dark-swatches span{height:22px;border-radius:7px}
html[data-theme="dark"] .palette-pro{background:rgba(255,255,255,.045)!important}
html[data-theme="dark"] .dark-palette.active,html[data-theme="dark"] .palette-pro.active{box-shadow:0 0 0 2px color-mix(in srgb,var(--p) 32%,transparent),0 12px 30px rgba(0,0,0,.22)!important}
/* Material hierarchy: blur fica concentrado nos elementos estruturais, evitando excesso de composição. */
.card,.panel,.kpi,.dashboard-equipment-row,.equipment-card-v40,.equipment-inventory-card,.rotation-block-v41,.rotation-center-card{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
.sidebar,.topbar,.mobile-bottom-nav,.modal{backdrop-filter:blur(26px) saturate(165%)!important;-webkit-backdrop-filter:blur(26px) saturate(165%)!important}
@media(max-width:900px){.palette-grid-pro{grid-template-columns:repeat(2,minmax(0,1fr))}.dark-palette-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.sidebar{backdrop-filter:blur(22px) saturate(155%)!important;-webkit-backdrop-filter:blur(22px) saturate(155%)!important}}
@media(prefers-reduced-transparency:reduce),(prefers-reduced-motion:reduce){.sidebar,.topbar,.mobile-bottom-nav,.modal{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}.palette-pro:hover,.dark-palette:hover{transform:none!important}}
</style>

<style id="v71-performance-modal-palettes">
/* v71: performance + modal viewport + exactly 4 light / 2 dark palettes */
:root{
 --p:#6f5bd3;--p2:#9a8de5;--a:#d783ad;
 --bg:#f5f5f7;--card:#ffffff;--ink:#1c1c1e;--muted:#6e6e73;--line:rgba(60,60,67,.16);
 --surface-2:#f2f2f7;--surface-3:#e5e5ea;--input-bg:#fff;--focus:rgba(111,91,211,.20);
 --ios27-material:rgba(255,255,255,.72);--ios27-material-strong:rgba(255,255,255,.88);
}
html[data-theme="dark"]{--p:#a99bf5;--p2:#c5bcff;--a:#dca1bf;--bg:#0b0b0f;--card:#1c1c20;--ink:#f5f5f7;--muted:#a1a1a6;--line:rgba(235,235,245,.16);--surface-2:#2c2c30;--surface-3:#3a3a40;--input-bg:#16161a;--focus:rgba(169,155,245,.30);--ios27-material:rgba(36,36,42,.76);--ios27-material-strong:rgba(44,44,50,.92)}
/* Keep palette controls deterministic: four light choices and two dark choices. */
.palette-grid-pro{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.dark-palette-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.palette-pro,.dark-palette{min-height:88px;border-radius:18px;padding:12px;background:var(--ios27-material);border-color:var(--ios27-hairline);box-shadow:0 6px 18px rgba(30,30,40,.05)}
.palette-pro.active,.dark-palette.active{border-color:var(--p);box-shadow:0 0 0 3px color-mix(in srgb,var(--p) 16%,transparent)}
/* Modal: never clip the footer or content; viewport-safe on iPhone/Android keyboards. */
.modal-backdrop{padding:clamp(8px,2vw,20px);align-items:center;overflow:auto;-webkit-overflow-scrolling:touch}
.modal{width:min(720px,calc(100vw - 16px));max-height:min(88dvh,820px);display:flex;flex-direction:column;overflow:hidden;overscroll-behavior:contain}
.modal-head{flex:0 0 auto;min-height:64px}.modal-body{flex:1 1 auto;min-height:0;overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding-bottom:24px}.modal-foot{flex:0 0 auto;min-height:68px;padding:12px 16px;background:var(--ios27-material-strong);border-top:1px solid var(--ios27-hairline);box-shadow:0 -8px 22px rgba(20,20,30,.06)}
.modal-foot .btn{min-width:112px;min-height:44px;font-size:13px;font-weight:750;opacity:1!important;visibility:visible!important}
.modal-foot .btn:not(.primary){background:var(--surface-2);color:var(--ink);border-color:var(--line)}
.modal-foot .btn.primary{background:linear-gradient(135deg,var(--p),var(--a));color:#fff;border-color:transparent;box-shadow:0 7px 18px color-mix(in srgb,var(--p) 22%,transparent)}
@media(max-width:900px){
 body{padding-bottom:calc(88px + env(safe-area-inset-bottom,0px))}
 .modal-backdrop{align-items:flex-end;padding:8px 8px calc(8px + env(safe-area-inset-bottom,0px))}
 .modal{width:100%;max-height:min(86dvh,760px);border-radius:28px!important}
 .modal-head{min-height:60px;padding:14px 16px}.modal-body{padding:14px 14px 22px}.modal-foot{padding:10px 12px calc(10px + env(safe-area-inset-bottom,0px));display:grid;grid-template-columns:1fr 1.25fr;gap:8px;min-height:68px}.modal-foot .btn{width:100%;min-width:0}
}
@media(max-height:700px) and (max-width:900px){.modal{max-height:82dvh}.modal-body{padding-bottom:18px}}
/* Reduce expensive paint operations while retaining Liquid Glass hierarchy. */
.card,.dashboard-equipment-row,.equipment-card-v40,.equipment-inventory-card,.rotation-block-v41,.rotation-center-card{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
.sidebar,.topbar,.mobile-bottom-nav,.modal{backdrop-filter:blur(22px) saturate(150%);-webkit-backdrop-filter:blur(22px) saturate(150%)}
body:before{filter:blur(6px);opacity:.72}
@media(prefers-reduced-transparency:reduce){body:before{display:none}.sidebar,.topbar,.mobile-bottom-nav,.modal{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}}
</style>

<style id="v92-hero-contrast-fix">
/* v92 — correção de contraste do painel principal no modo claro.
   O fundo real é aplicado por applyDashboardHero(); esta regra apenas garante
   que o texto permaneça legível quando a paleta clara estiver ativa. */
#page-dashboard .hero{
  color:#fff!important;
  text-shadow:0 1px 2px rgba(20,14,35,.18);
}
#page-dashboard .hero-title{color:#fff!important;}
#page-dashboard .hero-text{color:rgba(255,255,255,.88)!important;}
#page-dashboard .device-datetime{color:rgba(255,255,255,.84)!important;}
#page-dashboard .hero-actions .btn{
  color:#fff!important;
  background:rgba(255,255,255,.12)!important;
  border-color:rgba(255,255,255,.20)!important;
}
html[data-theme="dark"] #page-dashboard .hero{
  text-shadow:0 1px 2px rgba(0,0,0,.32);
}
</style>
</head><body><h1>Evolução do paciente — ${esc(s.name)}</h1><div class="muted">Gerado em ${evo42Date(todayISO())} · ${esc(s.plan||'')}</div><h2>Resumo inicial</h2><div class="box"><b>Queixa:</b> ${esc(c.complaint||'—')}<br><b>Objetivo:</b> ${esc(c.objective||'—')}<br><b>Diagnóstico/condição informada:</b> ${esc(c.diagnosis||'—')}<br><b>Avaliação inicial:</b> ${evo42Date(c.baselineDate)}</div><h2>Indicadores</h2><div class="grid"><div class="box"><b>Dor inicial:</b> ${esc(String(c.painScore||'—'))}/10</div><div class="box"><b>Função inicial:</b> ${esc(String(c.functionalScore||'—'))}/10</div><div class="box"><b>Mobilidade inicial:</b> ${esc(String(c.mobilityScore||'—'))}/10</div><div class="box"><b>Força inicial:</b> ${esc(String(c.strengthScore||'—'))}/10</div></div><h2>Metas</h2>${goals.length?goals.map(g=>`<div class="box"><b>${esc(g.area)}:</b> ${esc(g.description)} — ${esc(String(g.current||'—'))} ${esc(g.unit)} / alvo ${esc(String(g.target||'—'))} ${esc(g.unit)}</div>`).join(''):'<div class="box">Nenhuma meta cadastrada.</div>'}<h2>Histórico</h2>${e.length?e.map(x=>`<div class="entry"><small>${evo42Date(x.date)} · ${esc(x.professional||'Profissional')}</small><br><b>${esc(x.title)}</b><br>${esc([x.assessment,x.intervention,x.response,x.progression,x.nextSteps].filter(Boolean).join('\n'))}</div>`).join(''):'<div class="box">Nenhum registro.</div>'}<script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script></body></html>`);w.document.close();}
openClinicalProfile=openClinicalProfileV42;
if(db) ensureEvolutionV42();


/* ===== extracted script block ===== */

(function(){'use strict';const root=document.documentElement;root.classList.add('ios27-runtime');const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1);if(isIOS)root.dataset.platform='ios';const setVH=()=>root.style.setProperty('--app-vh',Math.round(window.innerHeight)+'px');setVH();window.addEventListener('resize',setVH,{passive:true});window.addEventListener('orientationchange',()=>setTimeout(setVH,250),{passive:true});if(window.visualViewport){const sync=()=>root.style.setProperty('--keyboard-offset',Math.max(0,window.innerHeight-window.visualViewport.height)+'px');window.visualViewport.addEventListener('resize',sync,{passive:true});sync();}if(window.navigator.standalone)root.classList.add('ios-standalone');})();


/* ===== extracted script block ===== */

/* V49 — evolução básica e objetiva; equipamentos permanecem exclusivamente no módulo de rodízio. */
function cleanEvolutionEntry(e,s){return{id:e.id||uid('evo'),studentId:s.id,date:e.date||todayISO(),title:String(e.title||'Evolução da sessão'),complaint:String(e.complaint||''),objective:String(e.objective||''),assessment:String(e.assessment||''),pain:String(e.pain||''),painBefore:e.painBefore??'',painAfter:e.painAfter??'',functionalScore:e.functionalScore??'',mobilityScore:e.mobilityScore??'',strengthScore:e.strengthScore??'',balanceScore:e.balanceScore??'',controlScore:e.controlScore??'',exercises:String(e.exercises||''),intervention:String(e.intervention||''),response:String(e.response||''),nextSteps:String(e.nextSteps||''),nextReview:e.nextReview||'',professional:String(e.professional||s.teacher||'')};}
function ensureEvolutionV49(){ensurePatientEvolutionData();db.students.forEach(s=>{const c=s.clinical||{};if(!Array.isArray(s.evolution))s.evolution=[];s.evolution=s.evolution.map(e=>cleanEvolutionEntry(e,s));s.evolution.sort((a,b)=>String(b.date).localeCompare(String(a.date)));s.clinical=c;});}
function openEvolutionModalV49(studentId=null,entryId=null){ensureEvolutionV49();const s=studentById(studentId)||db.students[0];if(!s){toast('Cadastre um aluno primeiro.');return;}const old=(s.evolution||[]).find(e=>e.id===entryId)||{id:uid('evo'),date:todayISO(),title:'Evolução da sessão',complaint:'',objective:s.clinical?.objective||s.goal||'',assessment:'',painBefore:'',painAfter:'',functionalScore:'',mobilityScore:'',strengthScore:'',balanceScore:'',controlScore:'',exercises:'',intervention:'',response:'',nextSteps:s.clinical?.plan||'',nextReview:s.clinical?.nextReview||'',professional:s.teacher||''};
 const b=`<div class="evo49-modal"><div class="evo49-modal-section"><h4>Identificação</h4><div class="evo49-modal-grid"><div class="field"><label>Aluno</label><select id="v49EvStudent">${db.students.map(x=>`<option value="${x.id}" ${x.id===s.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select></div><div class="field"><label>Data</label><input id="v49EvDate" type="date" value="${esc(old.date||todayISO())}"></div><div class="field full"><label>Título</label><input id="v49EvTitle" value="${esc(old.title||'Evolução da sessão')}"></div><div class="field"><label>Queixa / relato</label><textarea id="v49EvComplaint">${esc(old.complaint||'')}</textarea></div><div class="field"><label>Objetivo</label><textarea id="v49EvObjective">${esc(old.objective||'')}</textarea></div></div></div>
 <div class="evo49-modal-section"><h4>Indicadores rápidos</h4><div class="evo49-modal-grid"><div class="field"><label>Dor antes (0–10)</label><input id="v49EvPainBefore" type="number" min="0" max="10" value="${esc(String(old.painBefore??''))}"></div><div class="field"><label>Dor depois (0–10)</label><input id="v49EvPainAfter" type="number" min="0" max="10" value="${esc(String(old.painAfter??''))}"></div><div class="field"><label>Função (0–10)</label><input id="v49EvFunc" type="number" min="0" max="10" value="${esc(String(old.functionalScore??''))}"></div><div class="field"><label>Mobilidade (0–10)</label><input id="v49EvMob" type="number" min="0" max="10" value="${esc(String(old.mobilityScore??''))}"></div><div class="field"><label>Força / resistência (0–10)</label><input id="v49EvStrength" type="number" min="0" max="10" value="${esc(String(old.strengthScore??''))}"></div><div class="field"><label>Equilíbrio (0–10)</label><input id="v49EvBalance" type="number" min="0" max="10" value="${esc(String(old.balanceScore??''))}"></div><div class="field"><label>Controle motor (0–10)</label><input id="v49EvControl" type="number" min="0" max="10" value="${esc(String(old.controlScore??''))}"></div></div></div>
 <div class="evo49-modal-section"><h4>Registro objetivo</h4><div class="field"><label>Avaliação / achados</label><textarea id="v49EvAssessment">${esc(old.assessment||'')}</textarea></div><div class="evo49-modal-grid"><div class="field"><label>Exercícios realizados</label><textarea id="v49EvExercises">${esc(old.exercises||'')}</textarea></div><div class="field"><label>Intervenção / ajustes</label><textarea id="v49EvIntervention">${esc(old.intervention||'')}</textarea></div><div class="field full"><label>Resposta / evolução observada</label><textarea id="v49EvResponse">${esc(old.response||'')}</textarea></div><div class="field full"><label>Plano para próxima sessão</label><textarea id="v49EvNext">${esc(old.nextSteps||'')}</textarea></div></div></div>
 <div class="evo49-modal-section"><h4>Continuidade</h4><div class="evo49-modal-grid"><div class="field"><label>Próxima revisão</label><input id="v49EvReview" type="date" value="${esc(old.nextReview||'')}"></div><div class="field"><label>Profissional</label><input id="v49EvProfessional" value="${esc(old.professional||s.teacher||'')}"></div></div></div></div>`;
 openModal(entryId?'Editar evolução':'Registrar evolução',b,()=>{const t=studentById(document.getElementById('v49EvStudent')?.value);if(!t)return false;if(!Array.isArray(t.evolution))t.evolution=[];const e=cleanEvolutionEntry({id:old.id,date:document.getElementById('v49EvDate').value||todayISO(),title:document.getElementById('v49EvTitle').value.trim()||'Evolução da sessão',complaint:document.getElementById('v49EvComplaint').value.trim(),objective:document.getElementById('v49EvObjective').value.trim(),assessment:document.getElementById('v49EvAssessment').value.trim(),pain:document.getElementById('v49EvPainAfter').value||document.getElementById('v49EvPainBefore').value||'',painBefore:document.getElementById('v49EvPainBefore').value,painAfter:document.getElementById('v49EvPainAfter').value,functionalScore:document.getElementById('v49EvFunc').value,mobilityScore:document.getElementById('v49EvMob').value,strengthScore:document.getElementById('v49EvStrength').value,balanceScore:document.getElementById('v49EvBalance').value,controlScore:document.getElementById('v49EvControl').value,exercises:document.getElementById('v49EvExercises').value.trim(),intervention:document.getElementById('v49EvIntervention').value.trim(),response:document.getElementById('v49EvResponse').value.trim(),nextSteps:document.getElementById('v49EvNext').value.trim(),nextReview:document.getElementById('v49EvReview').value,professional:document.getElementById('v49EvProfessional').value.trim()},t);const i=t.evolution.findIndex(x=>x.id===e.id);if(i>=0)t.evolution[i]=e;else t.evolution.push(e);t.evolution.sort((a,b)=>String(b.date).localeCompare(String(a.date)));if(e.nextReview){t.clinical=t.clinical||{};t.clinical.nextReview=e.nextReview;}saveDB();renderAll();toast('Evolução registrada com sucesso.');return true;});}
function renderEvolutionV49(){ensureEvolutionV49();const q=(document.getElementById('evolutionSearch')?.value||'').toLowerCase().trim(),sel=document.getElementById('evolutionStudentSelect');if(sel){const cur=sel.value;sel.innerHTML='<option value="">Todos os alunos</option>'+db.students.slice().sort((a,b)=>String(a.name).localeCompare(String(b.name),'pt-BR')).map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('');sel.value=cur;}const selected=sel?.value||'',list=db.students.filter(s=>(!selected||s.id===selected)&&(!q||String(s.name).toLowerCase().includes(q))),total=db.students.reduce((n,s)=>n+(s.evolution||[]).length,0),tracked=db.students.filter(s=>(s.evolution||[]).length).length,recent=db.students.reduce((n,s)=>n+(s.evolution||[]).filter(e=>e.date>=new Date(Date.now()-30*864e5).toISOString().slice(0,10)).length,0),k=document.getElementById('evolutionKpis');if(k){k.className='evo49-kpis';k.innerHTML=[['Alunos acompanhados',tracked],['Registros',total],['Últimos 30 dias',recent]].map(x=>`<div class="evo49-kpi"><div class="n">${x[1]}</div><div class="l">${x[0]}</div></div>`).join('');}const grid=document.getElementById('evolutionPatientGrid');if(!grid)return;if(!list.length){grid.innerHTML='<div class="evo49-empty">Nenhum aluno encontrado.</div>';return;}grid.innerHTML='<div class="evo49-shell">'+list.map(s=>{const entries=evolutionSummary(s),latest=entries[0],pain=latest?.painAfter!==''&&latest?.painAfter!=null?latest.painAfter:latest?.painBefore??'',func=latest?.functionalScore??'',mob=latest?.mobilityScore??'';return `<div class="evo49-patient"><div class="evo49-head"><div><h3>${esc(s.name)}</h3><div class="muted">${esc(s.plan||'Sem plano')} · ${esc(s.teacher||'Sem profissional')}</div></div><div class="evo49-actions"><button class="btn small primary" onclick="openEvolutionModalV49('${s.id}')">＋ Registrar evolução</button><button class="btn small" onclick="openClinicalProfileV42('${s.id}')">Ficha</button><button class="btn small" onclick="openEvolutionReport('${s.id}')">Relatório</button></div></div><div class="evo49-grid"><div class="evo49-card"><h4>Resumo atual</h4><div class="evo49-summary"><div class="evo49-stat"><div class="v">${esc(String(pain||'—'))}${pain!==''?' /10':''}</div><div class="k">Dor</div></div><div class="evo49-stat"><div class="v">${esc(String(func||'—'))}${func!==''?' /10':''}</div><div class="k">Função</div></div><div class="evo49-stat"><div class="v">${esc(String(mob||'—'))}${mob!==''?' /10':''}</div><div class="k">Mobilidade</div></div></div><div class="evo49-text" style="margin-top:9px"><b>Última observação:</b> ${esc(latest?.response||latest?.assessment||'Nenhuma evolução registrada.')}</div></div><div class="evo49-card"><h4>Próxima conduta</h4><div class="evo49-text">${esc(latest?.nextSteps||'Nenhum plano registrado.')}</div>${latest?.nextReview?`<div class="muted" style="margin-top:8px">Próxima revisão: ${evo42Date(latest.nextReview)}</div>`:''}</div></div><div class="evo49-card" style="margin-top:10px"><div class="evo42-section-title"><h4>Histórico</h4><span class="evo42-badge">${entries.length} registro(s)</span></div><div class="evo49-timeline">${entries.slice(0,5).map(e=>`<div class="evo49-entry"><div class="meta">${evo42Date(e.date)} · ${esc(e.professional||s.teacher||'Profissional')}</div><div class="title">${esc(e.title||'Evolução')}</div><div class="txt">${esc([e.assessment,e.response,e.nextSteps].filter(Boolean).join('\n'))||'Sem observações.'}</div><div class="evo49-actions" style="margin-top:7px;justify-content:flex-start"><button class="btn small" onclick="openEvolutionModalV49('${s.id}','${e.id}')">Editar</button></div></div>`).join('')||'<div class="evo49-empty">Nenhuma evolução registrada.</div>'}</div></div></div>`}).join('')+'</div>';}
openEvolutionModal=openEvolutionModalV49;renderEvolution=renderEvolutionV49;if(db) ensureEvolutionV49();


/* ===== extracted script block ===== */

(function(){
  const KEY='studio_pilates_apple27_ui_v1';
  const root=document.documentElement;
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
  function write(o){try{localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}}
  function apply(){
    const p=read();
    const menu=Math.max(0,Math.min(100,Number(p.menuOpacity ?? 72)))/100;
    const bottom=Math.max(0,Math.min(100,Number(p.bottomNavOpacity ?? 72)))/100;
    root.style.setProperty('--menu-opacity',menu.toFixed(2));
    root.style.setProperty('--bottom-nav-opacity',bottom.toFixed(2));
    root.dataset.apple27='1';
  }
  function syncFromDB(){
    try{
      const i=(window.db&&db.settings&&db.settings.interface)||{};
      const p=read();
      if(i.menuOpacity!=null)p.menuOpacity=i.menuOpacity;
      if(i.bottomNavOpacity!=null)p.bottomNavOpacity=i.bottomNavOpacity;
      write(p);
    }catch(e){}
    apply();
  }
  window.apple27UI={apply,sync:syncFromDB};
  apply();
  document.addEventListener('DOMContentLoaded',function(){
    syncFromDB();
    // Harmoniza o estado salvo pelo sistema principal com o novo design.
    setTimeout(syncFromDB,120);
  });
})();
/* V84 — Navigation Isolation Fix System preferences: estado único, persistente e integrado. */
function getSystemPrefs(){
  const i=(db&&db.settings&&db.settings.interface)||{};
  const s=(db&&db.settings&&db.settings.system)||{};
  return {
    confirmDelete:s.confirmDelete!==false,
    animations:s.animations!==false,
    hapticVisual:s.hapticVisual!==false,
    showBadges:s.showBadges!==false,
    keyboardShortcuts:s.keyboardShortcuts!==false,
    menuPosition:['left','right','top'].includes(i.menuPosition)?i.menuPosition:'left'
  };
}
function applySystemPrefs(){
  const p=getSystemPrefs(), root=document.documentElement;
  root.dataset.systemAnimations=p.animations?'1':'0';
  root.dataset.hapticVisual=p.hapticVisual?'1':'0';
  root.dataset.showBadges=p.showBadges?'1':'0';
  root.dataset.keyboardShortcuts=p.keyboardShortcuts?'1':'0';
  root.dataset.menuPosition=p.menuPosition;
  root.style.setProperty('--motion-enabled',p.animations?'1':'0');
  const ids={confirmDelete:'sysConfirmDelete',animations:'sysAnimations',hapticVisual:'sysHapticVisual',showBadges:'sysShowBadges',keyboardShortcuts:'sysKeyboard'};
  Object.entries(ids).forEach(([k,id])=>{
    const e=document.getElementById(id);
    if(e){
      e.classList.toggle('on',!!p[k]);
      e.setAttribute('aria-checked',String(!!p[k]));
      e.title=!!p[k]?'Ativado':'Desativado';
    }
  });
  const mp=document.getElementById('sysMenuPosition');
  if(mp)mp.value=p.menuPosition;
  document.querySelectorAll('[data-sys-density]').forEach(b=>b.classList.toggle('active',b.dataset.sysDensity===(db.settings.interface?.density||'standard')));
  document.querySelectorAll('.nav-badge').forEach(e=>e.style.display=p.showBadges?'':'none');
}
function toggleSystemPref(key){
  const allowed=['confirmDelete','animations','hapticVisual','showBadges','keyboardShortcuts'];
  if(!allowed.includes(key))return;
  const current=getSystemPrefs();
  const next=!current[key];
  db.settings.system={...(db.settings.system||{}),[key]:next};
  saveDB();
  applySystemPrefs();
  if(key==='showBadges')updateMenuBadges();
  toast(`${key==='confirmDelete'?'Confirmação de exclusões':key==='animations'?'Animações do sistema':key==='hapticVisual'?'Resposta visual ao toque':key==='showBadges'?'Indicadores nos menus':'Atalhos de teclado'} ${next?'ativados':'desativados'}.`);
}
function setSystemMenuPosition(pos){
  if(!['left','right','top'].includes(pos))pos='left';
  db.settings.interface={...(db.settings.interface||{}),menuPosition:pos};
  saveDB();
  applyAdvancedInterfaceSettings();
  applySystemPrefs();
  toast(`Posição do menu: ${pos==='left'?'esquerda':pos==='right'?'direita':'superior'}.`);
}
const __oldApplyInterfacePreferences=applyInterfacePreferences;
applyInterfacePreferences=function(){__oldApplyInterfacePreferences();applySystemPrefs();};
const __oldGoSettings=goSettings;
goSettings=function(sec){__oldGoSettings(sec);applySystemPrefs();};
applySystemPrefs();
/* Confirmações destrutivas seguem uma única política global. */
if(typeof window.iosConfirm==='function' && !window.__apple27ConfirmWrapped){
  const __nativeIosConfirm=window.iosConfirm;
  window.iosConfirm=function(message, options={}){
    const p=getSystemPrefs();
    if(options.danger!==false && p.confirmDelete===false) return Promise.resolve(true);
    return __nativeIosConfirm(message, options);
  };
  window.__apple27ConfirmWrapped=true;
}
/* Atalhos globais opcionais. */
document.addEventListener('keydown',e=>{
  if(!getSystemPrefs().keyboardShortcuts)return;
  const mod=e.ctrlKey||e.metaKey;
  if(mod && e.key.toLowerCase()==='k'){e.preventDefault();focusGlobalSearch();}
  if(e.key==='Escape') closeTransientUI();
});


/* ===== extracted script block ===== */

(function(){
  function setupDashboardGlance(){
    const page=document.getElementById('page-dashboard');
    if(!page || page.dataset.glanceReady==='1') return;
    const kpis=page.querySelector('.grid.grid-4');
    if(!kpis) return;
    const grids=Array.from(page.querySelectorAll('.grid.grid-2.section'));
    const chartGrid=grids[0];
    const finalGrid=grids[1];
    const occupancy=Array.from(page.querySelectorAll('.card.panel.section')).find(el=>el.querySelector('#dashboardOccupancyChart'));
    if(!chartGrid && !occupancy && !finalGrid) return;
    const details=document.createElement('details');
    details.className='dashboard-details';
    const summary=document.createElement('summary');
    summary.innerHTML='<span>Ver análises detalhadas</span><span class="details-sub">Gráficos · ocupação · pendências</span>';
    const body=document.createElement('div');
    body.className='dashboard-details-body';
    if(chartGrid) body.appendChild(chartGrid);
    if(occupancy) body.appendChild(occupancy);
    if(finalGrid) body.appendChild(finalGrid);
    details.appendChild(summary);details.appendChild(body);
    kpis.insertAdjacentElement('afterend',details);
    page.dataset.glanceReady='1';
    details.addEventListener('toggle',function(){
      if(details.open && typeof window.renderCharts==='function'){
        requestAnimationFrame(()=>{try{window.renderCharts()}catch(e){}});
      }
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(setupDashboardGlance,80));
  else setTimeout(setupDashboardGlance,80);
  const oldGoPage=window.goPage;
  if(typeof oldGoPage==='function' && !window.__glanceGoWrapped){
    window.goPage=function(page){const r=oldGoPage.apply(this,arguments);if(page==='dashboard')setTimeout(setupDashboardGlance,50);return r;};
    window.__glanceGoWrapped=true;
  }
})();

;
/* ===== bloco-9 ===== */
/* V95 — ilhas, pipeline e cartões dinâmicos */
(function(){
  let mode='classes';
  const $=id=>document.getElementById(id);
  const fmt=n=>Number(n||0).toLocaleString('pt-BR');
  function stage(label,val,pct,note,i){return `<div class="stage" style="animation-delay:${i*90}ms"><small>${label}</small><b>${val}</b><div class="bar"><i data-w="${Math.max(0,Math.min(100,pct))}"></i></div><em>${note}</em></div>`}
  function render(){
    try{
      if(typeof db==='undefined'||!db)return; /* V106: banco ainda não carregado */
      const today=todayISO(),cls=(db.classes||[]).filter(c=>c.date===today);
      const live=cls.filter(c=>!/cancel/i.test(c.status||''));
      const done=live.filter(c=>/realiz|conclu|presen/i.test(c.status||''));
      const ready=live.filter(c=>c.equipmentId);
      const month=todayISO().slice(0,7),fin=(db.finance||[]).filter(f=>f.dueDate&&f.dueDate.startsWith(month)&&f.type!=='Despesa');
      const tot=fin.reduce((a,f)=>a+Number(f.value||0),0),paid=fin.filter(f=>f.status==='Pago').reduce((a,f)=>a+Number(f.value||0),0);
      const pend=fin.filter(f=>f.status==='Pendente'),pendV=pend.reduce((a,f)=>a+Number(f.value||0),0);
      const active=(db.students||[]).filter(s=>s.status==='Ativo').length;
      // ilhas
      const now=new Date(),hm=now.getHours()*60+now.getMinutes();
      const next=live.filter(c=>(timeToMinutes(c.time)||0)>=hm).sort((a,b)=>timeToMinutes(a.time)-timeToMinutes(b.time))[0];
      $('islNow').textContent=now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
      $('islNext').textContent=next?`Próxima: ${next.time} · ${next.studentName||next.student||'aula'}`:(live.length?'Sem mais aulas hoje':'Dia livre');
      $('islClasses').textContent=live.length;$('islPending').textContent=(db.finance||[]).filter(f=>f.status==='Pendente'&&f.type!=='Despesa').length;$('islStudents').textContent=active;
      // pipeline
      const t=$('pipeTrack'),sub=$('pipeSub');if(!t)return;
      if(mode==='classes'){sub.textContent='Fluxo das aulas de hoje';
        t.innerHTML=stage('Agendadas',live.length,live.length?100:0,'aulas no dia',0)+stage('Preparadas',ready.length,live.length?ready.length/live.length*100:0,`${live.length-ready.length} sem aparelho`,1)+stage('Realizadas',done.length,live.length?done.length/live.length*100:0,`${cls.length-live.length} canceladas`,2);
      }else{sub.textContent='Fluxo financeiro do mês';
        t.innerHTML=stage('Previsto',money(tot),100,`${fin.length} lançamentos`,0)+stage('Pendente',money(pendV),tot?pendV/tot*100:0,`${pend.length} em aberto`,1)+stage('Recebido',money(paid),tot?paid/tot*100:0,tot?Math.round(paid/tot*100)+'% do previsto':'—',2);}
      requestAnimationFrame(()=>requestAnimationFrame(()=>t.querySelectorAll('.bar i').forEach(i=>i.style.width=i.dataset.w+'%')));
      // medidores nos KPIs
      const occ=parseFloat(($('kpiOccupancy')||{}).textContent)||0;
      const m={kpiStudents:Math.min(100,active*4),kpiRevenue:100,kpiReceived:tot?paid/tot*100:0,kpiOccupancy:occ};
      Object.keys(m).forEach(id=>{const k=$(id)?.closest('.kpi');if(!k)return;let bar=k.querySelector('.kpi-meter');if(!bar){bar=document.createElement('div');bar.className='kpi-meter';bar.innerHTML='<i></i>';k.appendChild(bar)}
        requestAnimationFrame(()=>bar.firstChild.style.width=Math.max(4,Math.min(100,m[id]))+'%')});
    }catch(e){console.warn('V95 painel:',e)}
  }
  // seletor segmentado
  function seg(){const s=$('pipeSeg');if(!s)return;const b=[...s.querySelectorAll('button')];
    const move=()=>{const on=s.querySelector('.on'),th=s.querySelector('.seg-thumb');if(on){th.style.setProperty('--w',on.offsetWidth+'px');th.style.setProperty('--x',(on.offsetLeft-4)+'px')}};
    b.forEach(x=>x.onclick=()=>{b.forEach(y=>y.classList.toggle('on',y===x));mode=x.dataset.m;move();render()});setTimeout(move,60);addEventListener('resize',move)}
  // brilho que segue o cursor
  document.addEventListener('pointermove',e=>{const c=e.target.closest&&e.target.closest('.card,.kpi');if(!c)return;const r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')},{passive:true});
  // encaixa no renderDashboard existente
  const orig=window.renderDashboard;
  window.renderDashboard=function(){const r=orig.apply(this,arguments);render();return r};
  seg();render();setInterval(render,30000);
})();

;
/* ===== bloco-10 ===== */
/* V112 — tabelas viram cartões compactos e detalhados (variações removidas) */
(function(){
  const root=document.documentElement;root.dataset.cardstyle='classico';
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const clean=s=>(s||'').replace(/\s+/g,' ').trim();
  const NAMEH=/aluno|nome|professor|plano|descri|equipamento|forma|aparelho|dias|hor[aá]rio/i;
  function initials(t){
    if(/^\d{1,2}:\d{2}/.test(t))return '◷';if(/R\$/.test(t))return 'R$';if(/^\d{1,4}[\/-]\d{1,2}/.test(t))return '▦';
    const w=t.replace(/[^\p{L}\p{N} ]/gu,'').split(' ').filter(Boolean);return ((w[0]||'•')[0]+(w[1]?w[1][0]:'')).toUpperCase()}
  function hash(s){let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))|0;return Math.abs(h)}
  function build(table){
    const heads=[...table.querySelectorAll('thead th')].map(t=>clean(t.textContent));
    const rows=[...table.querySelectorAll('tbody tr')];let out='';const tcol=table.dataset.cardTitle||'';
    rows.forEach((tr,n)=>{
      const tds=[...tr.children];
      if(tds.length===1&&(tds[0].colSpan>1||!heads.length||heads.length>1)){out+=`<div class="cg-empty">${tds[0].innerHTML}</div>`;return}
      let actions='',chips='';const items=[];
      tds.forEach((td,i)=>{
        const h=heads[i]||'';
        if(/a[cç][oõ]es/i.test(h)||td.querySelector('button,a.btn')){actions+=td.innerHTML;return}
        if(td.querySelector('.badge,[class*="status"],[class*="chip"]')){chips+=td.innerHTML;return}
        const t=clean(td.textContent),st=td.querySelector('strong');
        if(st){const a=clean(st.textContent);if(a&&t.length>a.length+1){const b=clean(t.slice(t.indexOf(a)+a.length));items.push({h,t:a});if(b)items.push({h:/aluno/i.test(h)?'WhatsApp':'Detalhe',t:b});return}}
        if(t&&t!=='—'&&t!=='-')items.push({h,t})});
      let ti=tcol?items.findIndex(x=>x.h===tcol):-1;if(ti<0)ti=items.findIndex(x=>NAMEH.test(x.h));if(ti<0)ti=0;
      const title=items[ti]?items[ti].t:'Registro';const rest=items.filter((_,i)=>i!==ti);
      const sub=rest.length?rest.shift():null;
      const stats=[],more=[];rest.forEach(x=>{(stats.length<3&&x.t.length<=22?stats:more).push(x)});
      const ck=tr.getAttribute('onclick'),tone=tr.dataset.tone;
      out+=`<article class="cg-card${tone?' tone-'+tone:''}" style="--i:${Math.min(n,14)}"${ck?` onclick="${esc(ck)}" role="button" tabindex="0"`:''}>
        <div class="cg-cover cv${hash(title)%4}"><i></i><i></i></div>
        <div class="cg-av">${esc(initials(title))}</div>
        <div class="cg-head"><h4>${esc(title)}</h4>${sub?`<p>${sub.h?esc(sub.h)+': ':''}${esc(sub.t)}</p>`:''}</div>
        ${chips?`<div class="cg-chips">${chips}</div>`:''}
        ${stats.length?`<div class="cg-stats">${stats.map(s=>`<div><b>${esc(s.t)}</b><small>${esc(s.h)}</small></div>`).join('')}</div>`:''}
        ${more.length?`<dl class="cg-more">${more.slice(0,8).map(s=>`<div><dt>${esc(s.h)}</dt><dd>${esc(s.t)}</dd></div>`).join('')}</dl>`:''}
        ${actions?`<div class="cg-actions">${actions}</div>`:''}</article>`});
    const foot=[...table.querySelectorAll('tfoot td,tfoot th')].map(c=>clean(c.textContent)).filter(Boolean);
    if(foot.length)out+=`<div class="cg-foot" style="grid-column:1/-1">${foot.map(esc).join('<span>·</span>')}</div>`;
    return out||'<div class="cg-empty">Nenhum registro.</div>'}
  function scan(){
    document.querySelectorAll('table').forEach(t=>{
      if(t.closest('.cg-grid')||t.closest('[style*="display:none"]'))return;
      const host=t.closest('.table-wrap')||t;
      let g=t._cg;
      if(!g){g=document.createElement('div');g.className='cg-wrap';const grid=document.createElement('div');grid.className='cg-grid';g.appendChild(grid);host.parentNode.insertBefore(g,host);host.classList.add('cg-hide');t._cg=g;g._sig=null;t.classList.add('cg-src')}
      const sig=t.innerHTML+'|'+(t.dataset.cardTitle||'');
      if(g._sig!==sig){g._sig=sig;g.querySelector('.cg-grid').innerHTML=build(t)}
    })}
  let tm;const obs=new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(scan,90)});
  obs.observe(document.body,{childList:true,subtree:true,characterData:true});
  scan();setTimeout(scan,600);
})();

;
/* ===== bloco-11 ===== */
/* V100 — cartões inteligentes do painel */
(function(){
  const $=id=>document.getElementById(id),E=s=>esc(s??'');
  const mk=(t,sub,body,act)=>`<div class="card panel w-card"><div class="w-head"><div><h3>${t}</h3><small>${sub||''}</small></div>${act||''}</div>${body}</div>`;
  const btn=(l,go)=>`<button class="btn small" type="button" onclick="${go}">${l}</button>`;
  const day0=d=>{const x=new Date(d);x.setHours(0,0,0,0);return x};
  function bday(s){const r=String(s.birth||s.birthDate||s.birthday||'');let m,d;
    if(/^\d{4}-\d{2}-\d{2}$/.test(r)){m=+r.slice(5,7);d=+r.slice(8,10)}else if(/^\d{2}\/\d{2}/.test(r)){d=+r.slice(0,2);m=+r.slice(3,5)}else return null;
    const t=day0(new Date());let n=new Date(t.getFullYear(),m-1,d);if(n<t)n=new Date(t.getFullYear()+1,m-1,d);return{diff:Math.round((n-t)/864e5),label:String(d).padStart(2,'0')+'/'+String(m).padStart(2,'0')}}
  function render(){
    const g=$('v100Grid');if(!g||typeof db==='undefined')return;
    try{
      const today=todayISO(),now=new Date(),hm=now.getHours()*60+now.getMinutes();
      const st=db.students||[],act=st.filter(s=>s.status==='Ativo');
      const cls=(db.classes||[]).filter(c=>c.date===today&&!/cancel/i.test(c.status||'')).sort((a,b)=>(timeToMinutes(a.time)||0)-(timeToMinutes(b.time)||0));
      const nxt=cls.find(c=>(timeToMinutes(c.time)||0)>=hm);
      const chip=s=>/realiz|conclu|presen/i.test(s||'')?'ok':/falt|cancel/i.test(s||'')?'bad':'info';
      const nm=c=>c.studentName||(st.find(s=>s.id===c.studentId)||{}).name||'Aula';
      const w1=mk('Agenda de hoje',cls.length+' aula(s) · '+now.toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'short'}),
        cls.length?cls.slice(0,6).map(c=>`<div class="tl${c===nxt?' next':''}"><b>${E(c.time||'—')}</b><span>${E(nm(c))}<small>${E(c.teacher||c.professor||'')}</small></span><span class="badge ${chip(c.status)}">${E(c.status||'Agendada')}</span></div>`).join('')+(cls.length>6?`<div class="w-empty">+${cls.length-6} aulas</div>`:''):'<div class="w-empty">Nenhuma aula agendada para hoje.</div>',btn('Agenda',"goPage('agenda')"));
      const mo=today.slice(0,7),fin=(db.finance||[]).filter(f=>f.dueDate&&f.dueDate.startsWith(mo)&&f.type!=='Despesa');
      const tot=fin.reduce((a,f)=>a+Number(f.value||0),0),paid=fin.filter(f=>f.status==='Pago').reduce((a,f)=>a+Number(f.value||0),0),pc=tot?Math.round(paid/tot*100):0;
      const w2=mk('Meta do mês','Recebido sobre o previsto',`<div class="goal"><div class="donut" style="--v:${pc}"><span>${pc}%</span></div><dl><div><dt>Recebido</dt><dd>${money(paid)}</dd></div><div><dt>A receber</dt><dd>${money(Math.max(0,tot-paid))}</dd></div><div><dt>Previsto</dt><dd>${money(tot)}</dd></div></dl></div>`,btn('Financeiro',"goPage('finance')"));
      const pend=(db.finance||[]).filter(f=>f.status==='Pendente'&&f.type!=='Despesa').sort((a,b)=>String(a.dueDate).localeCompare(String(b.dueDate)));
      const late=f=>{const d=Math.round((day0(new Date())-day0(f.dueDate+'T00:00'))/864e5);return d>0?`<em style="color:var(--bad)">${d}d atraso</em>`:`<em>${E(String(f.dueDate||'').split('-').reverse().slice(0,2).join('/'))}</em>`};
      const w3=mk('Pendências',pend.length?pend.length+' em aberto · '+money(pend.reduce((a,f)=>a+Number(f.value||0),0)):'Tudo em dia',
        pend.length?pend.slice(0,4).map(f=>`<div class="row" onclick="goPage('billing')"><span class="ic">$</span><div><b>${E(f.studentName)}</b><small>${money(f.value)}</small></div>${late(f)}</div>`).join(''):'<div class="w-empty">Nenhuma cobrança pendente 🎉</div>',btn('Cobrar',"openBatchWhatsAppModal()"));
      const bd=act.map(s=>({s,b:bday(s)})).filter(x=>x.b&&x.b.diff<=7).sort((a,b)=>a.b.diff-b.b.diff);
      const w4=mk('Aniversários','Próximos 7 dias',bd.length?bd.slice(0,4).map(x=>`<div class="row" onclick="goPage('birthdays')"><span class="ic">★</span><div><b>${E(x.s.name)}</b><small>${x.b.label}</small></div><em>${x.b.diff?'em '+x.b.diff+'d':'hoje!'}</em></div>`).join(''):'<div class="w-empty">Sem aniversariantes nesta semana.</div>',btn('Ver',"goPage('birthdays')"));
      const mon=day0(new Date());mon.setDate(mon.getDate()-((mon.getDay()+6)%7));
      const names=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'],cnt=names.map((_,i)=>{const d=new Date(mon);d.setDate(mon.getDate()+i);const iso=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');return{iso,n:(db.classes||[]).filter(c=>c.date===iso&&!/cancel/i.test(c.status||'')).length}});
      const mx=Math.max(1,...cnt.map(c=>c.n));
      const w5=mk('Semana em aulas','Aulas por dia',`<div class="wk">${cnt.map((c,i)=>`<div class="${c.iso===today?'today':''}"><b>${c.n}</b><i style="height:${Math.max(6,c.n/mx*80)}%"></i><small>${names[i]}</small></div>`).join('')}</div>`,btn('Agenda',"goPage('agenda')"));
      const pl={};act.forEach(s=>{const k=s.plan||'Sem plano';pl[k]=(pl[k]||0)+1});const top=Object.entries(pl).sort((a,b)=>b[1]-a[1]).slice(0,4),pm=top.length?top[0][1]:1;
      const w6=mk('Alunos por plano',act.length+' ativos',top.length?top.map(([k,v])=>`<div class="pl"><div><span>${E(k)}</span><b>${v}</b></div><div class="bar"><i style="width:${v/pm*100}%"></i></div></div>`).join(''):'<div class="w-empty">Cadastre alunos para ver a distribuição.</div>',btn('Alunos',"goPage('students')"));
      g.innerHTML=w1+w2+w3+w4+w5+w6;
    }catch(e){console.warn('V100:',e)}
  }
  const p=$('modernPipeline');if(p&&!$('v100Grid')){const g=document.createElement('div');g.id='v100Grid';g.className='v100-grid';p.parentNode.insertBefore(g,p.nextSibling)}
  const o=window.renderDashboard;window.renderDashboard=function(){const r=o.apply(this,arguments);render();return r};
  render();setInterval(render,60000);
})();

;
/* ===== bloco-12 ===== */
/* V101 — números que contam até o valor */
(function(){
  if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  const brl=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  function tween(el){
    const t=el.textContent.trim();let m,to,fmt;
    if(m=t.match(/^R\$\s?([\d.]+,\d{2})$/)){to=parseFloat(m[1].replace(/\./g,'').replace(',','.'));fmt=brl}
    else if(m=t.match(/^(\d+)(%?)$/)){to=+m[1];const s=m[2];fmt=v=>Math.round(v)+s}else return;
    const from=el._v||0;if(from===to){el._v=to;return}
    el._lock=true;const t0=performance.now();
    (function step(now){const k=Math.min(1,(now-t0)/700),e=1-Math.pow(1-k,3);
      if(k<1){el.textContent=fmt(from+(to-from)*e);requestAnimationFrame(step)}else{el._v=to;el.textContent=fmt(to);el._lock=false}})(t0)}
  const pick=n=>{const e=n.nodeType===3?n.parentElement:n;return e&&e.closest?e.closest('.kpi-value'):null};
  new MutationObserver(ms=>ms.forEach(m=>{const el=pick(m.target);if(el&&!el._lock)tween(el);
    m.addedNodes.forEach(n=>{if(n.querySelectorAll)n.querySelectorAll('.kpi-value').forEach(e=>{if(!e._lock)tween(e)})})}))
    .observe(document.getElementById('page-dashboard')||document.body,{childList:true,subtree:true,characterData:true});
  document.querySelectorAll('.kpi-value').forEach(e=>{if(!e._lock)tween(e)});
})();

;
/* ===== bloco-13 ===== */
/* V102 — títulos com ícone + aparência Claro/Escuro/Auto */
(function(){
  const P={users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
   cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/>',clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
   chart:'<path d="M3 3v18h18M7 14l4-4 3 3 5-6"/>',wallet:'<path d="M3 7h18v13H3zM3 7l3-4h12l3 4M16 14h2"/>',receipt:'<path d="M6 2h12v20l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6"/>',
   redo:'<path d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6"/>',gift:'<path d="M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0"/>',
   hour:'<path d="M6 2h12M6 22h12M7 2v4l5 6-5 6v4M17 2v4l-5 6 5 6v4"/>',bars:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
   teach:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M16 11l2 2 4-4"/>',bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>',
   pulse:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',star:'<path d="M12 3l2.6 5.9 6.4.6-4.8 4.2 1.4 6.3L12 16.9 6.4 20l1.4-6.3L3 9.5l6.4-.6z"/>'};
  const R=[[/aluno/,'users'],[/agenda/,'cal'],[/hor[aá]rio/,'clock'],[/ocupa/,'chart'],[/financ/,'wallet'],[/cobran/,'receipt'],[/reposi/,'redo'],[/anivers/,'gift'],[/espera/,'hour'],[/relat|rentab/,'bars'],[/professor/,'teach'],[/alerta/,'bell'],[/evolu/,'pulse'],[/config|ajuste/,'gear']];
  function titles(){document.querySelectorAll('.page .page-title').forEach(t=>{if(t.querySelector('.title-ico'))return;
    const k=(R.find(r=>r[0].test(t.textContent.toLowerCase()))||[0,'star'])[1];const s=document.createElement('span');s.className='title-ico';
    s.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[k]}</svg>`;t.prepend(s)})}
  const $=id=>document.getElementById(id),mq=matchMedia('(prefers-color-scheme: dark)');let auto=false;
  const mode=()=>(db&&db.settings&&db.settings.appearance)||(db&&db.settings&&db.settings.darkMode?'dark':'light');
  function thumb(){const s=$('themeSeg');if(!s)return;const on=s.querySelector('button.on'),t=s.querySelector('.seg-thumb');if(on&&on.offsetWidth){t.style.setProperty('--w',on.offsetWidth+'px');t.style.setProperty('--x',(on.offsetLeft-4)+'px')}}
  function sync(){const s=$('themeSeg');if(!s)return;const m=mode();s.querySelectorAll('button').forEach(b=>{const on=b.dataset.m===m;b.classList.toggle('on',on);b.setAttribute('aria-checked',on)});thumb();
    if(m==='auto'){const l=$('themeModeLabel');if(l)l.textContent='Automático — segue o aparelho ('+(mq.matches?'escuro':'claro')+')'}}
  function apply(m,persist){auto=true;
    try{const dark=m==='dark'||(m==='auto'&&mq.matches);db.settings.appearance=m;
      if(dark)applyDarkPalette(db.settings.darkPalette||'carvao',false,false,true);else{db.settings.darkMode=false;applyThemeStyles()}}
    finally{auto=false}
    db.settings.appearance=m;if(persist)saveDB();sync()}
  window.setAppearance=m=>apply(m,true);
  ['applyDarkPalette','applyProfessionalPalette'].forEach(n=>{const o=window[n];if(typeof o!=='function')return;
    window[n]=function(){const r=o.apply(this,arguments);if(!auto&&db.settings.appearance!=='auto')db.settings.appearance=db.settings.darkMode?'dark':'light';sync();return r}});
  mq.addEventListener&&mq.addEventListener('change',()=>{if(mode()==='auto')apply('auto',false)});
  const s=$('themeSeg');if(s&&window.ResizeObserver)new ResizeObserver(thumb).observe(s);
  const start=()=>{titles();if(!db||!db.settings)return;if(db.settings.appearance==='auto')apply('auto',false);else sync()};
  start();addEventListener('load',start);setTimeout(titles,400);
})();

;
/* ===== bloco-14 ===== */
/* V103 — Central de recursos: lembretes, PIX, mensalidades, aluno, backup, painel + cartões */
(function(){
  'use strict';
  const $=id=>document.getElementById(id),E=s=>esc(s??''),S=()=>db.settings||(db.settings={});
  const dig=p=>{let d=String(p||'').replace(/\D/g,'');if(d.length>=10&&d.length<=11)d='55'+d;return d};
  const wa=(p,m)=>{const d=dig(p);if(!d){toast('Aluno sem WhatsApp cadastrado.');return}window.open('https://wa.me/'+d+'?text='+encodeURIComponent(m),'_blank')};
  const first=n=>String(n||'').split(' ')[0],dm=d=>String(d||'').split('-').reverse().slice(0,2).join('/');
  const isoD=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const addDays=n=>{const d=new Date();d.setDate(d.getDate()+n);return isoD(d)};
  const stu=c=>(db.students||[]).find(s=>s.id===c.studentId)||(db.students||[]).find(s=>s.name===c.studentName)||{};
  const notC=c=>!/cancel/i.test(c.status||'');
  /* PIX copia e cola (BR Code) */
  const tlv=(i,v)=>i+String(v.length).padStart(2,'0')+v;
  const crc=s=>{let c=0xFFFF;for(const ch of s){c^=ch.charCodeAt(0)<<8;for(let i=0;i<8;i++)c=c&0x8000?((c<<1)^0x1021)&0xFFFF:(c<<1)&0xFFFF}return c.toString(16).toUpperCase().padStart(4,'0')};
  const norm=(t,n)=>String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9 ]/g,'').slice(0,n);
  function pixFor(f){const k=S().pixKey;if(!k)return '';const p=tlv('00','01')+tlv('26',tlv('00','br.gov.bcb.pix')+tlv('01',k))+tlv('52','0000')+tlv('53','986')+(Number(f.value)>0?tlv('54',Number(f.value).toFixed(2)):'')+tlv('58','BR')+tlv('59',norm(S().pixName||S().owner||'STUDIO PILATES',25)||'STUDIO')+tlv('60','BRASIL')+tlv('62',tlv('05',String(f.id||'').replace(/[^A-Za-z0-9]/g,'').slice(0,25)||'***'))+'6304';return p+crc(p)}
  const pend=()=>(db.finance||[]).filter(f=>f.status==='Pendente'&&f.type!=='Despesa').sort((a,b)=>String(a.dueDate).localeCompare(String(b.dueDate)));
  const missing=m=>(db.students||[]).filter(s=>s.status==='Ativo'&&!(db.finance||[]).some(f=>f.studentId===s.id&&f.dueDate&&f.dueDate.startsWith(m)&&f.type!=='Despesa'));
  const months=()=>{const n=new Date(),a=isoD(n).slice(0,7),b=isoD(new Date(n.getFullYear(),n.getMonth()+1,1)).slice(0,7);return[a,b]};
  const ago=iso=>{if(!iso)return null;return Math.floor((Date.now()-new Date(iso))/864e5)};
  const copy=t=>{(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast('PIX copia e cola copiado!')).catch(()=>{const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');toast('PIX copiado!')}catch(_){toast('Não foi possível copiar.')}a.remove()})};
  /* cartão do aluno (arquivo HTML) */
  function cardHTML(s){const t=todayISO(),cl=(db.classes||[]).filter(c=>(c.studentId===s.id||c.studentName===s.name)&&c.date>=t&&notC(c)).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,8),pd=(db.finance||[]).filter(f=>f.studentId===s.id&&f.status==='Pendente'&&f.type!=='Despesa'),px=pd[0]?pixFor(pd[0]):'';
    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cartão — ${E(s.name)}</title><style>body{margin:0;font-family:system-ui,sans-serif;background:#e8eaee;color:#1c1f26;padding:20px}.c{max-width:460px;margin:auto;background:#fff;border-radius:28px;overflow:hidden;box-shadow:0 14px 40px rgba(40,50,70,.15)}.h{padding:26px;background:linear-gradient(150deg,#30323a,#15161a);color:#fff;position:relative;overflow:hidden}.h:after{content:"";position:absolute;right:-40px;top:-40px;width:120px;height:120px;border:11px solid #f08300;border-radius:50%}h1{margin:0;font-weight:300;font-size:26px}p{margin:4px 0 0;opacity:.7;font-size:13px}.b{padding:20px 26px}h2{font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#667085;margin:18px 0 8px}.r{display:flex;justify-content:space-between;gap:10px;padding:9px 0;border-bottom:1px solid #eceef2;font-size:14px}code{display:block;word-break:break-all;background:#f2f3f6;padding:10px;border-radius:12px;font-size:11px}</style></head><body><div class="c"><div class="h"><h1>${E(s.name)}</h1><p>${E(s.plan||'Pilates')} · Studio Pilates</p></div><div class="b"><h2>Próximas aulas</h2>${cl.length?cl.map(c=>`<div class="r"><span>${dm(c.date)}</span><b>${E(c.time||'')}</b></div>`).join(''):'<div class="r">Sem aulas agendadas.</div>'}<h2>Pagamentos</h2>${pd.length?pd.map(f=>`<div class="r"><span>${E(f.description)}</span><b>${money(f.value)} · ${dm(f.dueDate)}</b></div>`).join(''):'<div class="r">Tudo em dia 🎉</div>'}${px?`<h2>PIX copia e cola</h2><code>${px}</code>`:''}<p style="font-size:11px;color:#98a2b3;margin-top:18px">Atualizado em ${new Date().toLocaleDateString('pt-BR')}</p></div></div></body></html>`}
  /* ---- Central (folha) ---- */
  let tab='rem',day=1,hubStu='';
  const TABS=[['rem','Lembretes'],['pix','PIX'],['mens','Mensalidades'],['card','Aluno'],['bkp','Backup'],['dash','Painel']];
  const SECT=[['hero','Saudação','.hero'],['kpi','Indicadores','.kpi-grid'],['equip','Equipamentos','#dashboardEquipmentPanel'],['island','Ilhas de status','#islandDock'],['alerts','Alertas','#dashboardAlerts'],['pipe','Pipeline','#modernPipeline'],['widgets','Cartões inteligentes','#v100Grid'],['mgmt','Visão gerencial','#managementSummary']];
  const dcfg=()=>{const d=S().dash||(S().dash={});const all=SECT.map(x=>x[0]);d.order=(d.order||[]).filter(k=>all.includes(k));all.forEach(k=>{if(!d.order.includes(k))d.order.push(k)});d.hide=d.hide||[];return d};
  function applyDash(){try{const d=dcfg();SECT.forEach(([k,,sel])=>{const el=document.querySelector('#page-dashboard>'+sel);if(!el)return;el.style.order=(d.order.indexOf(k)+1)*10;if(d.hide.includes(k))el.style.setProperty('display','none','important');else el.style.removeProperty('display')})}catch(e){}}
  function body(){
    if(tab==='rem'){const date=addDays(day),l=(db.classes||[]).filter(c=>c.date===date&&notC(c)).sort((a,b)=>String(a.time).localeCompare(String(b.time)));
      return `<div class="cg-seg" style="margin-bottom:10px"><button data-a3="day" data-d="0" class="${day===0?'on':''}">Hoje</button><button data-a3="day" data-d="1" class="${day===1?'on':''}">Amanhã</button></div>`+(l.length?l.map(c=>{const ok=(S().rem||{})[c.id+date];return `<div class="row"><span class="ic">◷</span><div><b>${E(c.studentName||stu(c).name)}</b><small>${E(c.time)} · ${dm(date)}</small></div><button class="btn small" data-a3="rem" data-id="${E(c.id)}">${ok?'Reenviar ✓':'Enviar'}</button></div>`}).join(''):'<div class="w-empty">Nenhuma aula neste dia.</div>')}
    if(tab==='pix'){const l=pend();return (S().pixKey?'':'<div class="hub-note">Cadastre a chave PIX em <b>Configurações</b> para gerar o “copia e cola” com o valor de cada cobrança.</div>')+(l.length?l.slice(0,30).map(f=>`<div class="row"><span class="ic">$</span><div><b>${E(f.studentName)}</b><small>${money(f.value)} · vence ${dm(f.dueDate)}</small></div><button class="btn small" data-a3="pixcopy" data-id="${E(f.id)}">Copiar</button><button class="btn small" data-a3="pixwa" data-id="${E(f.id)}">WhatsApp</button></div>`).join(''):'<div class="w-empty">Nenhuma cobrança pendente 🎉</div>')}
    if(tab==='mens'){return months().map(m=>{const n=missing(m).length;return `<div class="row" style="cursor:default"><span class="ic">▦</span><div><b>${m.split('-').reverse().join('/')}</b><small>${n?n+' aluno(s) sem mensalidade lançada':'Todas as mensalidades já lançadas'}</small></div>${n?`<button class="btn small" data-a3="gen" data-m="${m}">Gerar ${n}</button>`:'<em>✓</em>'}</div>`}).join('')+'<div class="hub-note">Gera uma cobrança “Pendente” por aluno ativo, com o valor da mensalidade e o dia de vencimento do cadastro. Quem já tem lançamento no mês não é duplicado.</div>'}
    if(tab==='card'){const st=(db.students||[]).filter(s=>s.status==='Ativo');if(!hubStu&&st[0])hubStu=st[0].id;return `<select id="hubStu" data-a3="stu">${st.map(s=>`<option value="${E(s.id)}"${s.id===hubStu?' selected':''}>${E(s.name)}</option>`).join('')}</select><div class="hub-actions"><button class="btn primary" data-a3="cardDl">Baixar cartão do aluno</button><button class="btn" data-a3="cardWa">Enviar resumo no WhatsApp</button></div><div class="hub-note">O cartão é um arquivo HTML com próximas aulas, pagamentos e PIX. É uma <b>foto do momento</b>: não atualiza sozinho — gere outro quando mudar algo.</div>`}
    if(tab==='bkp'){const d=ago(S().lastBackup);return `<div class="hub-note">${S().lastBackup?'Último backup: há '+d+' dia(s).':'Você ainda não fez backup por aqui.'} Os dados ficam só neste aparelho — exporte uma vez por semana.</div><div class="hub-actions"><button class="btn primary" data-a3="export">Exportar backup</button><button class="btn" data-a3="restore">Restaurar backup</button></div><input type="file" id="hubFile" accept=".json,application/json" hidden>`}
    const d=dcfg();return '<div class="hub-note">Escolha o que aparece no painel e a ordem.</div>'+d.order.map((k,i)=>`<div class="dash-row"><input type="checkbox" ${d.hide.includes(k)?'':'checked'} data-a3="tog" data-k="${k}" aria-label="Mostrar"><span>${SECT.find(x=>x[0]===k)[1]}</span><button class="btn small" data-a3="up" data-k="${k}" ${i?'':'disabled'}>▲</button><button class="btn small" data-a3="dn" data-k="${k}" ${i<d.order.length-1?'':'disabled'}>▼</button></div>`).join('')+'<div class="hub-actions"><button class="btn small" data-a3="reset">Restaurar padrão</button></div>'}
  function draw(){const t=$('hubTabs'),b=$('hubBody');if(!t)return;t.innerHTML=TABS.map(x=>`<button data-a3="tab" data-t="${x[0]}" class="${x[0]===tab?'on':''}">${x[1]}</button>`).join('');b.innerHTML=body();const f=$('hubFile');if(f)f.onchange=restore}
  function open(t){if(t)tab=t;if(!$('hub')){const d=document.createElement('div');d.id='hub';d.innerHTML='<div class="hub-sheet v103"><div class="hub-head"><h3>Central de recursos</h3><button class="btn small" data-a3="close">Fechar</button></div><div class="cg-seg hub-tabs" id="hubTabs"></div><div id="hubBody"></div></div>';document.body.appendChild(d);d.addEventListener('click',e=>{if(e.target===d)d.classList.remove('open')})}$('hub').classList.add('open');draw()}
  function restore(){const f=$('hubFile').files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const p=JSON.parse(r.result),d=p.data||p;if(!Array.isArray(d.students))throw 0;if(!confirm('Substituir TODOS os dados atuais por este backup?'))return;try{localStorage.setItem('sp_pre_restore',JSON.stringify(db))}catch(_){}Object.keys(db).forEach(k=>delete db[k]);Object.assign(db,d);saveDB();location.reload()}catch(_){toast('Arquivo de backup inválido.')}};r.readAsText(f)}
  const fin=id=>(db.finance||[]).find(f=>f.id===id)||{};
  const A={close:()=>$('hub').classList.remove('open'),tab:b=>{tab=b.t;draw()},day:b=>{day=+b.d;draw()},stu:()=>{hubStu=$('hubStu').value},
    rem:b=>{const c=(db.classes||[]).find(x=>x.id===b.id);if(!c)return;const s=stu(c);wa(s.whatsapp,`Olá, ${first(s.name||c.studentName)}! Lembrete da sua aula de Pilates ${day?'amanhã':'hoje'} às ${c.time}. Podemos confirmar sua presença? 💜`);S().rem=S().rem||{};S().rem[c.id+c.date]=1;saveDB();draw()},
    pixcopy:b=>{const f=fin(b.id),p=pixFor(f);if(!p)return toast('Cadastre a chave PIX em Configurações.');copy(p)},
    pixwa:b=>{const f=fin(b.id),s=(db.students||[]).find(x=>x.id===f.studentId)||{},p=pixFor(f);wa(s.whatsapp,`Olá, ${first(f.studentName)}! Sua cobrança (${f.description||'mensalidade'}) de ${money(f.value)} vence em ${dm(f.dueDate)}.`+(p?`\n\nPague pelo PIX copia e cola:\n${p}`:''))},
    gen:b=>{const l=missing(b.m);l.forEach(s=>db.finance.push({id:uid('fin'),studentId:s.id,studentName:s.name,description:`Mensalidade — ${s.plan||'Pilates'}`,value:s.monthly||0,dueDate:`${b.m}-${String(s.due||10).padStart(2,'0')}`,status:'Pendente',paymentMethod:'PIX',type:'Receita'}));saveDB();try{renderDashboard()}catch(_){}toast(l.length+' mensalidade(s) gerada(s).');draw()},
    cardDl:()=>{const s=(db.students||[]).find(x=>x.id===hubStu);if(s)downloadBlobFile(cardHTML(s),'text/html',`cartao_${norm(s.name,30).toLowerCase().replace(/ /g,'_')}.html`)},
    cardWa:()=>{const s=(db.students||[]).find(x=>x.id===hubStu);if(!s)return;const t=todayISO(),cl=(db.classes||[]).filter(c=>(c.studentId===s.id||c.studentName===s.name)&&c.date>=t&&notC(c)).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,5),pd=(db.finance||[]).filter(f=>f.studentId===s.id&&f.status==='Pendente'&&f.type!=='Despesa');
      wa(s.whatsapp,`Olá, ${first(s.name)}! Seu resumo no Studio:\n\n📅 Próximas aulas:\n${cl.length?cl.map(c=>`• ${dm(c.date)} às ${c.time}`).join('\n'):'• nenhuma agendada'}\n\n💳 Pagamentos: ${pd.length?pd.map(f=>`${money(f.value)} (vence ${dm(f.dueDate)})`).join(', '):'tudo em dia 🎉'}`)},
    export:()=>{exportData();S().lastBackup=new Date().toISOString();saveDB();draw();render()},restore:()=>$('hubFile').click(),
    tog:b=>{const d=dcfg();d.hide=d.hide.includes(b.k)?d.hide.filter(x=>x!==b.k):[...d.hide,b.k];saveDB();applyDash();draw()},
    up:b=>{const o=dcfg().order,i=o.indexOf(b.k);if(i>0){[o[i-1],o[i]]=[o[i],o[i-1]];saveDB();applyDash();draw()}},
    dn:b=>{const o=dcfg().order,i=o.indexOf(b.k);if(i<o.length-1){[o[i+1],o[i]]=[o[i],o[i+1]];saveDB();applyDash();draw()}},
    reset:()=>{S().dash={order:SECT.map(x=>x[0]),hide:[]};saveDB();applyDash();draw()},
    wawarn:b=>{const s=(db.students||[]).find(x=>x.id===b.id)||{};wa(s.whatsapp,`Olá, ${first(s.name)}! Sentimos sua falta no Studio 💜 Está tudo bem? Quer remarcar sua próxima aula?`)},
    wawait:b=>{const w=(db.waitlist||[]).find(x=>x.id===b.id)||{};wa(w.whatsapp,`Olá, ${first(w.name)}! Abriu uma vaga no Studio Pilates. Ainda tem interesse? 😊`)}};
  document.addEventListener('click',e=>{const b=e.target.closest('[data-a3]');if(!b||!A[b.dataset.a3])return;if(b.tagName==='INPUT'&&e.type!=='click')return;A[b.dataset.a3](b.dataset,e)});
  document.addEventListener('change',e=>{if(e.target.id==='hubStu')hubStu=e.target.value});
  /* ---- cartões do painel ---- */
  const card=(t,sub,bd,act)=>`<div class="card panel w-card v103"><div class="w-head"><div><h3>${t}</h3><small>${sub||''}</small></div>${act||''}</div>${bd}</div>`;
  function render(){const g=$('v100Grid');if(!g||typeof db==='undefined'||!db)return;try{g.querySelectorAll('.v103').forEach(n=>n.remove());let h='';
    const ms=[];for(let i=5;i>=0;i--){const d=new Date(new Date().getFullYear(),new Date().getMonth()-i,1);ms.push(isoD(d).slice(0,7))}
    const sum=(m,ex)=>(db.finance||[]).filter(f=>f.status==='Pago'&&f.dueDate&&f.dueDate.startsWith(m)&&((f.type==='Despesa')===ex)).reduce((a,f)=>a+Number(f.value||0),0);
    const rows=ms.map(m=>({m,i:sum(m,false),o:sum(m,true)})),mx=Math.max(1,...rows.flatMap(r=>[r.i,r.o])),cur=rows[5],prev=(db.finance||[]).filter(f=>f.status==='Pendente'&&f.type!=='Despesa'&&f.dueDate&&f.dueDate.startsWith(ms[5])).reduce((a,f)=>a+Number(f.value||0),0);
    h+=card('Fluxo de caixa','Receitas x despesas pagas · 6 meses',`<div class="cf">${rows.map(r=>`<div><div class="pair"><i class="in" style="height:${Math.max(3,r.i/mx*100)}%"></i><i class="out" style="height:${Math.max(3,r.o/mx*100)}%"></i></div><small>${r.m.slice(5)}</small></div>`).join('')}</div><div class="cf-sum"><div>Receita<b>${money(cur.i)}</b></div><div>Despesa<b>${money(cur.o)}</b></div><div>Saldo<b>${money(cur.i-cur.o)}</b></div><div>Previsto<b>${money(cur.i-cur.o+prev)}</b></div></div>`,'<button class="btn small" data-a3="hub" data-t="pix">Cobranças</button>');
    const today=todayISO(),risk=(db.students||[]).filter(s=>s.status==='Ativo').map(s=>{const cs=(db.classes||[]).filter(c=>(c.studentId===s.id||c.studentName===s.name)&&c.date<=today).sort((a,b)=>b.date.localeCompare(a.date));let k=0;for(const c of cs){if(/falt|ausen/i.test(c.status||''))k++;else if(/cancel/i.test(c.status||''))continue;else break}const l=cs.find(c=>!/falt|ausen|cancel/i.test(c.status||'')),gap=l?Math.round((Date.now()-new Date(l.date+'T00:00'))/864e5):null;return{s,k,gap}}).filter(x=>x.k>=2||(x.gap!==null&&x.gap>=21));
    h+=card('Risco de evasão',risk.length?risk.length+' aluno(s) para acompanhar':'Ninguém em risco agora',risk.length?risk.slice(0,4).map(x=>`<div class="row" style="cursor:default"><span class="ic">!</span><div><b>${E(x.s.name)}</b><small>${x.k>=2?x.k+' faltas seguidas':x.gap+' dias sem aula'}</small></div><button class="btn small" data-a3="wawarn" data-id="${E(x.s.id)}">Chamar</button></div>`).join(''):'<div class="w-empty">Sem faltas seguidas ou sumiços. 🎉</div>');
    const w=(db.waitlist||[]);h+=card('Lista de espera',w.length+' interessado(s)',w.length?w.slice(0,3).map(x=>`<div class="row" style="cursor:default"><span class="ic">★</span><div><b>${E(x.name)}</b><small>${E(x.plan||x.time||'')}</small></div><button class="btn small" data-a3="wawait" data-id="${E(x.id)}">Avisar vaga</button></div>`).join(''):'<div class="w-empty">Ninguém aguardando vaga.</div>',`<button class="btn small" onclick="goPage('waitlist')">Abrir</button>`);
    const d=ago(S().lastBackup);if(d===null||d>=7)h+=card('Backup',d===null?'Ainda não feito':'Há '+d+' dias',`<div class="hub-note">Seus dados ficam só neste aparelho. Exporte um backup para não perder nada.</div><div class="hub-actions"><button class="btn primary small" data-a3="export">Exportar agora</button></div>`);
    g.insertAdjacentHTML('beforeend',h)}catch(e){console.warn('V103:',e)}}
  A.hub=b=>open(b.t);
  const tb=document.querySelector('.top-right');if(tb&&!$('hubBtn')){const x=document.createElement('button');x.id='hubBtn';x.type='button';x.className='btn small';x.title='Central de recursos';x.textContent='✦ Central';x.onclick=()=>open();tb.insertBefore(x,tb.firstChild)}
  const g=$('v100Grid');if(g)new MutationObserver(()=>{if(!g.querySelector('.v103'))render()}).observe(g,{childList:true});
  const o=window.renderDashboard;window.renderDashboard=function(){const r=o.apply(this,arguments);render();applyDash();return r};
  render();applyDash();setTimeout(applyDash,500);
})();

;
/* ===== bloco-15 ===== */
/* V105 — cor do texto sobre a cor principal + acesso à Central no menu */
(function(){
  const root=document.documentElement;let last='';
  function lum(c){const m=c.match(/#([0-9a-f]{6})/i);let r,g,b;if(m){const n=parseInt(m[1],16);r=n>>16;g=(n>>8)&255;b=n&255}else{const q=c.match(/[\d.]+/g);if(!q)return null;[r,g,b]=q.map(Number)}
    const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(r)+.7152*f(g)+.0722*f(b)}
  function onp(){const v=getComputedStyle(root).getPropertyValue('--p').trim();const L=v&&lum(v);if(L===null||L===''||L===false)return;const c=L>.18?'#14161c':'#ffffff';if(c!==last){last=c;root.style.setProperty('--on-p',c)}}
  new MutationObserver(onp).observe(root,{attributes:true,attributeFilter:['style','data-theme']});onp();addEventListener('load',onp);setTimeout(onp,500);
  const nav=document.querySelector('.nav');
  if(nav&&!nav.querySelector('.nav-hub')){const ref=nav.querySelector('button');const b=document.createElement('button');b.type='button';b.className=(ref?ref.className.replace(/\bactive\b/,'').trim()+' ':'')+'nav-hub';b.setAttribute('data-a3','hub');b.setAttribute('data-t','rem');b.innerHTML='<span>✦</span><span>Central de recursos</span>';nav.appendChild(b)}
})();

;
/* ===== bloco-16 ===== */
/* V107 — alternar painel limpo/completo */
(function(){try{const p=document.getElementById('page-dashboard');if(!p)return;
const b=document.createElement('button');b.id='dashMoreBtn';b.type='button';
const set=f=>{p.classList.toggle('dash-full',f);b.textContent=f?'Mostrar menos ▲':'Ver mais detalhes ▼';try{localStorage.setItem('dash_full',f?'1':'0')}catch(e){}};
let f=false;try{f=localStorage.getItem('dash_full')==='1'}catch(e){}
b.onclick=()=>set(!p.classList.contains('dash-full'));p.appendChild(b);set(f);
}catch(e){console.warn('V107',e)}})();

;
/* ===== bloco-17 ===== */
/* V109 — 35 alunos de exemplo (importação única, não apaga dados existentes) */
(function run(){try{if(typeof db==='undefined'||!db){if(!run.n)run.n=0;if(run.n++<40)setTimeout(run,150);return}let done=false;try{done=localStorage.getItem('seed35_v1')==='1'}catch(e){}
if(done)return;const seed=[{"id": "stu_seed35_01", "name": "Ana Beatriz Souza", "whatsapp": "(11) 98000-1000", "email": "", "birth": "1965-01-01", "startDate": "2026-09-01", "goal": "Dor lombar", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 5, "teacher": "LOUISE KARLA", "time": "08:00", "days": ["1", "3"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_02", "name": "Marcos Vinícius Lima", "whatsapp": "(11) 98037-1053", "email": "", "birth": "1972-02-04", "startDate": "2026-09-01", "goal": "Postura", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 10, "teacher": "LOUISE KARLA", "time": "09:00", "days": ["1", "3"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_03", "name": "Camila Ferreira", "whatsapp": "(11) 98074-1106", "email": "", "birth": "1979-03-07", "startDate": "2026-09-01", "goal": "Condicionamento", "address": "", "emergency": "", "plan": "Plano 3X na semana", "monthly": 220, "due": 15, "teacher": "LOUISE KARLA", "time": "10:00", "days": ["1", "3", "5"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_04", "name": "João Pedro Alves", "whatsapp": "(11) 98111-1159", "email": "", "birth": "1986-04-10", "startDate": "2026-09-01", "goal": "Flexibilidade", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 20, "teacher": "LOUISE KARLA", "time": "11:00", "days": ["2", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_05", "name": "Patrícia Rocha", "whatsapp": "(11) 98148-1212", "email": "", "birth": "1993-05-13", "startDate": "2026-09-01", "goal": "Reabilitação", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 5, "teacher": "LOUISE KARLA", "time": "14:00", "days": ["1", "3"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_06", "name": "Rafael Mendes", "whatsapp": "(11) 98185-1265", "email": "", "birth": "2000-06-16", "startDate": "2026-09-01", "goal": "Fortalecimento", "address": "", "emergency": "", "plan": "Plano 3X na semana", "monthly": 220, "due": 10, "teacher": "LOUISE KARLA", "time": "15:00", "days": ["1", "3", "5"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_07", "name": "Juliana Costa", "whatsapp": "(11) 98222-1318", "email": "", "birth": "1967-07-19", "startDate": "2026-09-01", "goal": "Bem-estar", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 15, "teacher": "LOUISE KARLA", "time": "16:00", "days": ["2", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_08", "name": "Eduardo Martins", "whatsapp": "(11) 98259-1371", "email": "", "birth": "1974-08-22", "startDate": "2026-09-01", "goal": "Dor lombar", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 20, "teacher": "LOUISE KARLA", "time": "17:00", "days": ["2", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_09", "name": "Fernanda Oliveira", "whatsapp": "(11) 98296-1424", "email": "", "birth": "1981-09-25", "startDate": "2026-09-01", "goal": "Postura", "address": "", "emergency": "", "plan": "Plano 3X na semana", "monthly": 220, "due": 5, "teacher": "LOUISE KARLA", "time": "18:00", "days": ["1", "3", "5"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_10", "name": "Lucas Pereira", "whatsapp": "(11) 98333-1477", "email": "", "birth": "1988-10-01", "startDate": "2026-09-01", "goal": "Condicionamento", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 10, "teacher": "LOUISE KARLA", "time": "19:00", "days": ["1", "3"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_11", "name": "Mariana Barros", "whatsapp": "(11) 98370-1530", "email": "", "birth": "1995-11-04", "startDate": "2026-09-01", "goal": "Flexibilidade", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 15, "teacher": "LOUISE KARLA", "time": "20:00", "days": ["2", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_12", "name": "Gustavo Ribeiro", "whatsapp": "(11) 98407-1583", "email": "", "birth": "2002-12-07", "startDate": "2026-09-01", "goal": "Reabilitação", "address": "", "emergency": "", "plan": "Plano 3X na semana", "monthly": 220, "due": 20, "teacher": "LOUISE KARLA", "time": "21:00", "days": ["1", "3", "5"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_13", "name": "Larissa Carvalho", "whatsapp": "(11) 98444-1636", "email": "", "birth": "1969-01-10", "startDate": "2026-09-01", "goal": "Fortalecimento", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 5, "teacher": "LOUISE KARLA", "time": "08:00", "days": ["1", "3"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_14", "name": "Thiago Nascimento", "whatsapp": "(11) 98481-1689", "email": "", "birth": "1976-02-13", "startDate": "2026-09-01", "goal": "Bem-estar", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 10, "teacher": "LOUISE KARLA", "time": "09:00", "days": ["1", "3"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_15", "name": "Beatriz Araújo", "whatsapp": "(11) 98518-1742", "email": "", "birth": "1983-03-16", "startDate": "2026-09-01", "goal": "Dor lombar", "address": "", "emergency": "", "plan": "Plano 3X na semana", "monthly": 220, "due": 15, "teacher": "LOUISE KARLA", "time": "10:00", "days": ["1", "3", "5"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_16", "name": "Felipe Gomes", "whatsapp": "(11) 98555-1795", "email": "", "birth": "1990-04-19", "startDate": "2026-09-01", "goal": "Postura", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 20, "teacher": "LOUISE KARLA", "time": "11:00", "days": ["2", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_17", "name": "Renata Duarte", "whatsapp": "(11) 98592-1848", "email": "", "birth": "1997-05-22", "startDate": "2026-09-01", "goal": "Condicionamento", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 5, "teacher": "LOUISE KARLA", "time": "14:00", "days": ["1", "3"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_18", "name": "Bruno Teixeira", "whatsapp": "(11) 98629-1901", "email": "", "birth": "2004-06-25", "startDate": "2026-09-01", "goal": "Flexibilidade", "address": "", "emergency": "", "plan": "Plano 3X na semana", "monthly": 220, "due": 10, "teacher": "LOUISE KARLA", "time": "15:00", "days": ["1", "3", "5"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_19", "name": "Aline Moreira", "whatsapp": "(11) 98666-1954", "email": "", "birth": "1971-07-01", "startDate": "2026-09-01", "goal": "Reabilitação", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 15, "teacher": "LOUISE KARLA", "time": "16:00", "days": ["2", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_20", "name": "Diego Cardoso", "whatsapp": "(11) 98703-2007", "email": "", "birth": "1978-08-04", "startDate": "2026-09-01", "goal": "Fortalecimento", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 20, "teacher": "LOUISE KARLA", "time": "17:00", "days": ["2", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_21", "name": "Vanessa Freitas", "whatsapp": "(11) 98740-2060", "email": "", "birth": "1985-09-07", "startDate": "2026-09-01", "goal": "Bem-estar", "address": "", "emergency": "", "plan": "Plano 3X na semana", "monthly": 220, "due": 5, "teacher": "LOUISE KARLA", "time": "18:00", "days": ["1", "3", "5"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_22", "name": "Leonardo Batista", "whatsapp": "(11) 98777-2113", "email": "", "birth": "1992-10-10", "startDate": "2026-09-01", "goal": "Dor lombar", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 10, "teacher": "LOUISE KARLA", "time": "19:00", "days": ["1", "3"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_23", "name": "Carolina Dias", "whatsapp": "(11) 98814-2166", "email": "", "birth": "1999-11-13", "startDate": "2026-09-01", "goal": "Postura", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 15, "teacher": "LOUISE KARLA", "time": "20:00", "days": ["2", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_24", "name": "André Monteiro", "whatsapp": "(11) 98851-2219", "email": "", "birth": "1966-12-16", "startDate": "2026-09-01", "goal": "Condicionamento", "address": "", "emergency": "", "plan": "Plano 3X na semana", "monthly": 220, "due": 20, "teacher": "LOUISE KARLA", "time": "21:00", "days": ["1", "3", "5"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_25", "name": "Paula Cunha", "whatsapp": "(11) 98888-2272", "email": "", "birth": "1973-01-19", "startDate": "2026-09-01", "goal": "Flexibilidade", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 5, "teacher": "LOUISE KARLA", "time": "08:00", "days": ["1", "3"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_26", "name": "Ricardo Pinto", "whatsapp": "(11) 98925-2325", "email": "", "birth": "1980-02-22", "startDate": "2026-09-01", "goal": "Reabilitação", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 10, "teacher": "LOUISE KARLA", "time": "09:00", "days": ["1", "3"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_27", "name": "Isabela Correia", "whatsapp": "(11) 98962-2378", "email": "", "birth": "1987-03-25", "startDate": "2026-09-01", "goal": "Fortalecimento", "address": "", "emergency": "", "plan": "Plano 3X na semana", "monthly": 220, "due": 15, "teacher": "LOUISE KARLA", "time": "10:00", "days": ["1", "3", "5"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_28", "name": "Sérgio Azevedo", "whatsapp": "(11) 98999-2431", "email": "", "birth": "1994-04-01", "startDate": "2026-09-01", "goal": "Bem-estar", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 20, "teacher": "LOUISE KARLA", "time": "11:00", "days": ["2", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_29", "name": "Tatiane Lopes", "whatsapp": "(11) 99036-2484", "email": "", "birth": "2001-05-04", "startDate": "2026-09-01", "goal": "Dor lombar", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 5, "teacher": "LOUISE KARLA", "time": "14:00", "days": ["1", "3"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_30", "name": "Henrique Machado", "whatsapp": "(11) 99073-2537", "email": "", "birth": "1968-06-07", "startDate": "2026-09-01", "goal": "Postura", "address": "", "emergency": "", "plan": "Plano 3X na semana", "monthly": 220, "due": 10, "teacher": "LOUISE KARLA", "time": "15:00", "days": ["1", "3", "5"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_31", "name": "Cláudia Nogueira", "whatsapp": "(11) 99110-2590", "email": "", "birth": "1975-07-10", "startDate": "2026-09-01", "goal": "Condicionamento", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 15, "teacher": "LOUISE KARLA", "time": "16:00", "days": ["2", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_32", "name": "Vitor Hugo Santos", "whatsapp": "(11) 99147-2643", "email": "", "birth": "1982-08-13", "startDate": "2026-09-01", "goal": "Flexibilidade", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 20, "teacher": "LOUISE KARLA", "time": "17:00", "days": ["2", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_33", "name": "Débora Ramos", "whatsapp": "(11) 99184-2696", "email": "", "birth": "1989-09-16", "startDate": "2026-09-01", "goal": "Reabilitação", "address": "", "emergency": "", "plan": "Plano 3X na semana", "monthly": 220, "due": 5, "teacher": "LOUISE KARLA", "time": "18:00", "days": ["1", "3", "5"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_34", "name": "Otávio Farias", "whatsapp": "(11) 99221-2749", "email": "", "birth": "1996-10-19", "startDate": "2026-09-01", "goal": "Fortalecimento", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 10, "teacher": "LOUISE KARLA", "time": "19:00", "days": ["1", "3"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}, {"id": "stu_seed35_35", "name": "Letícia Borges", "whatsapp": "(11) 99258-2802", "email": "", "birth": "2003-11-22", "startDate": "2026-09-01", "goal": "Bem-estar", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 15, "teacher": "LOUISE KARLA", "time": "20:00", "days": ["2", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-01T09:00:00.000Z", "updatedAt": "2026-09-01T09:00:00.000Z"}];
const have=new Set((db.students||[]).map(s=>String(s.id)));const add=seed.filter(s=>!have.has(s.id));
db.students=(db.students||[]).concat(add);try{saveStudentVault(db.students)}catch(e){}
saveDB();try{localStorage.setItem('seed35_v1','1')}catch(e){}
try{renderAll()}catch(e){console.warn('V109 render',e)}
}catch(e){console.warn('V109',e)}})();

;
/* ===== bloco-18 ===== */
/* V110 — +40 alunos de exemplo (importação única, não apaga dados existentes) */
(function run(){try{if(typeof db==='undefined'||!db){if(!run.n)run.n=0;if(run.n++<40)setTimeout(run,150);return}let done=false;try{done=localStorage.getItem('seed40_v1')==='1'}catch(e){}
if(done)return;const seed=[{"id": "stu_seed40_01", "name": "Amanda Figueiredo", "whatsapp": "(11) 97100-2000", "email": "", "birth": "1960-01-01", "startDate": "2026-09-15", "goal": "Postura", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 5, "teacher": "LOUISE KARLA", "time": "11:00", "days": ["1", "3"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_02", "name": "Caio Vasconcelos", "whatsapp": "(11) 97141-2067", "email": "", "birth": "1965-06-08", "startDate": "2026-09-15", "goal": "Dor lombar", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 10, "teacher": "LOUISE KARLA", "time": "08:00", "days": ["2", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_03", "name": "Natália Prado", "whatsapp": "(11) 97182-2134", "email": "", "birth": "1970-11-15", "startDate": "2026-09-15", "goal": "Flexibilidade", "address": "", "emergency": "", "plan": "Plano 3X na semana", "monthly": 220, "due": 15, "teacher": "LOUISE KARLA", "time": "16:00", "days": ["1", "3", "5"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_04", "name": "Roberto Siqueira", "whatsapp": "(11) 97223-2201", "email": "", "birth": "1975-04-22", "startDate": "2026-09-15", "goal": "Condicionamento", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 20, "teacher": "LOUISE KARLA", "time": "09:00", "days": ["2", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_05", "name": "Priscila Medeiros", "whatsapp": "(11) 97264-2268", "email": "", "birth": "1980-09-02", "startDate": "2026-09-15", "goal": "Reabilitação", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 25, "teacher": "LOUISE KARLA", "time": "21:00", "days": ["1", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_06", "name": "Fábio Albuquerque", "whatsapp": "(11) 97305-2335", "email": "", "birth": "1985-02-09", "startDate": "2026-09-15", "goal": "Fortalecimento", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 5, "teacher": "LOUISE KARLA", "time": "14:00", "days": ["2", "5"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_07", "name": "Luciana Tavares", "whatsapp": "(11) 97346-2402", "email": "", "birth": "1990-07-16", "startDate": "2026-09-15", "goal": "Bem-estar", "address": "", "emergency": "", "plan": "Plano 3X na semana", "monthly": 220, "due": 10, "teacher": "LOUISE KARLA", "time": "17:00", "days": ["1", "3", "5"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_08", "name": "Matheus Coelho", "whatsapp": "(11) 97387-2469", "email": "", "birth": "1995-12-23", "startDate": "2026-09-15", "goal": "Gestação", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 15, "teacher": "LOUISE KARLA", "time": "20:00", "days": ["1", "3"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_09", "name": "Simone Barbosa", "whatsapp": "(11) 97428-2536", "email": "", "birth": "2000-05-03", "startDate": "2026-09-15", "goal": "Postura", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 20, "teacher": "LOUISE KARLA", "time": "10:00", "days": ["2", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_10", "name": "Alexandre Rezende", "whatsapp": "(11) 97469-2603", "email": "", "birth": "1963-10-10", "startDate": "2026-09-15", "goal": "Dor lombar", "address": "", "emergency": "", "plan": "Plano 3X na semana", "monthly": 220, "due": 25, "teacher": "LOUISE KARLA", "time": "11:00", "days": ["1", "3", "5"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_11", "name": "Bianca Moraes", "whatsapp": "(11) 97510-2670", "email": "", "birth": "1968-03-17", "startDate": "2026-09-15", "goal": "Flexibilidade", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 5, "teacher": "LOUISE KARLA", "time": "15:00", "days": ["2", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_12", "name": "Wagner Lacerda", "whatsapp": "(11) 97551-2737", "email": "", "birth": "1973-08-24", "startDate": "2026-09-15", "goal": "Condicionamento", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 10, "teacher": "LOUISE KARLA", "time": "14:00", "days": ["1", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_13", "name": "Elaine Fonseca", "whatsapp": "(11) 97592-2804", "email": "", "birth": "1978-01-04", "startDate": "2026-09-15", "goal": "Reabilitação", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 15, "teacher": "LOUISE KARLA", "time": "19:00", "days": ["2", "5"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_14", "name": "Rodrigo Peixoto", "whatsapp": "(11) 97633-2871", "email": "", "birth": "1983-06-11", "startDate": "2026-09-15", "goal": "Fortalecimento", "address": "", "emergency": "", "plan": "Plano 3X na semana", "monthly": 220, "due": 20, "teacher": "LOUISE KARLA", "time": "20:00", "days": ["1", "3", "5"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_15", "name": "Cristina Vieira", "whatsapp": "(11) 97674-2938", "email": "", "birth": "1988-11-18", "startDate": "2026-09-15", "goal": "Bem-estar", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 25, "teacher": "LOUISE KARLA", "time": "16:00", "days": ["1", "3"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_16", "name": "Igor Amaral", "whatsapp": "(11) 97715-3005", "email": "", "birth": "1993-04-25", "startDate": "2026-09-15", "goal": "Gestação", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 5, "teacher": "LOUISE KARLA", "time": "18:00", "days": ["2", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_17", "name": "Michele Andrade", "whatsapp": "(11) 97756-3072", "email": "", "birth": "1998-09-05", "startDate": "2026-09-15", "goal": "Postura", "address": "", "emergency": "", "plan": "Plano 3X na semana", "monthly": 220, "due": 10, "teacher": "LOUISE KARLA", "time": "17:00", "days": ["1", "3", "5"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_18", "name": "Danilo Siqueira", "whatsapp": "(11) 97797-3139", "email": "", "birth": "1961-02-12", "startDate": "2026-09-15", "goal": "Dor lombar", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 15, "teacher": "LOUISE KARLA", "time": "19:00", "days": ["2", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_19", "name": "Raquel Bezerra", "whatsapp": "(11) 97838-3206", "email": "", "birth": "1966-07-19", "startDate": "2026-09-15", "goal": "Flexibilidade", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 20, "teacher": "LOUISE KARLA", "time": "08:00", "days": ["1", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_20", "name": "Marcelo Viana", "whatsapp": "(11) 97879-3273", "email": "", "birth": "1971-12-26", "startDate": "2026-09-15", "goal": "Condicionamento", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 25, "teacher": "LOUISE KARLA", "time": "08:00", "days": ["2", "5"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_21", "name": "Sabrina Leite", "whatsapp": "(11) 97920-3340", "email": "", "birth": "1976-05-06", "startDate": "2026-09-15", "goal": "Reabilitação", "address": "", "emergency": "", "plan": "Plano 3X na semana", "monthly": 220, "due": 5, "teacher": "LOUISE KARLA", "time": "11:00", "days": ["1", "3", "5"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_22", "name": "Paulo César Duarte", "whatsapp": "(11) 97961-3407", "email": "", "birth": "1981-10-13", "startDate": "2026-09-15", "goal": "Fortalecimento", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 10, "teacher": "LOUISE KARLA", "time": "16:00", "days": ["1", "3"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_23", "name": "Gabriela Matos", "whatsapp": "(11) 98002-3474", "email": "", "birth": "1986-03-20", "startDate": "2026-09-15", "goal": "Bem-estar", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 15, "teacher": "LOUISE KARLA", "time": "21:00", "days": ["2", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_24", "name": "Nelson Quintino", "whatsapp": "(11) 98043-3541", "email": "", "birth": "1991-08-27", "startDate": "2026-09-15", "goal": "Gestação", "address": "", "emergency": "", "plan": "Plano 3X na semana", "monthly": 220, "due": 20, "teacher": "LOUISE KARLA", "time": "20:00", "days": ["1", "3", "5"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_25", "name": "Viviane Brandão", "whatsapp": "(11) 98084-3608", "email": "", "birth": "1996-01-07", "startDate": "2026-09-15", "goal": "Postura", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 25, "teacher": "LOUISE KARLA", "time": "09:00", "days": ["2", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_26", "name": "Leandro Pacheco", "whatsapp": "(11) 98125-3675", "email": "", "birth": "2001-06-14", "startDate": "2026-09-15", "goal": "Dor lombar", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 5, "teacher": "LOUISE KARLA", "time": "10:00", "days": ["1", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_27", "name": "Adriana Salgado", "whatsapp": "(11) 98166-3742", "email": "", "birth": "1964-11-21", "startDate": "2026-09-15", "goal": "Flexibilidade", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 10, "teacher": "LOUISE KARLA", "time": "14:00", "days": ["2", "5"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_28", "name": "Júlio César Lins", "whatsapp": "(11) 98207-3809", "email": "", "birth": "1969-04-01", "startDate": "2026-09-15", "goal": "Condicionamento", "address": "", "emergency": "", "plan": "Plano 3X na semana", "monthly": 220, "due": 15, "teacher": "LOUISE KARLA", "time": "17:00", "days": ["1", "3", "5"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_29", "name": "Tânia Mirandola", "whatsapp": "(11) 98248-3876", "email": "", "birth": "1974-09-08", "startDate": "2026-09-15", "goal": "Reabilitação", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 20, "teacher": "LOUISE KARLA", "time": "21:00", "days": ["1", "3"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_30", "name": "Renan Sampaio", "whatsapp": "(11) 98289-3943", "email": "", "birth": "1979-02-15", "startDate": "2026-09-15", "goal": "Fortalecimento", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 25, "teacher": "LOUISE KARLA", "time": "15:00", "days": ["2", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_31", "name": "Elisa Montenegro", "whatsapp": "(11) 98330-4010", "email": "", "birth": "1984-07-22", "startDate": "2026-09-15", "goal": "Bem-estar", "address": "", "emergency": "", "plan": "Plano 3X na semana", "monthly": 220, "due": 5, "teacher": "LOUISE KARLA", "time": "09:00", "days": ["1", "3", "5"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_32", "name": "Fernando Bastos", "whatsapp": "(11) 98371-4077", "email": "", "birth": "1989-12-02", "startDate": "2026-09-15", "goal": "Gestação", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 10, "teacher": "LOUISE KARLA", "time": "18:00", "days": ["2", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_33", "name": "Kelly Cristina Reis", "whatsapp": "(11) 98412-4144", "email": "", "birth": "1994-05-09", "startDate": "2026-09-15", "goal": "Postura", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 15, "teacher": "LOUISE KARLA", "time": "19:00", "days": ["1", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_34", "name": "Maurício Falcão", "whatsapp": "(11) 98453-4211", "email": "", "birth": "1999-10-16", "startDate": "2026-09-15", "goal": "Dor lombar", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 20, "teacher": "LOUISE KARLA", "time": "08:00", "days": ["2", "5"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_35", "name": "Daniela Esteves", "whatsapp": "(11) 98494-4278", "email": "", "birth": "1962-03-23", "startDate": "2026-09-15", "goal": "Flexibilidade", "address": "", "emergency": "", "plan": "Plano 3X na semana", "monthly": 220, "due": 25, "teacher": "LOUISE KARLA", "time": "16:00", "days": ["1", "3", "5"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_36", "name": "Samuel Guimarães", "whatsapp": "(11) 98535-4345", "email": "", "birth": "1967-08-03", "startDate": "2026-09-15", "goal": "Condicionamento", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 5, "teacher": "LOUISE KARLA", "time": "11:00", "days": ["1", "3"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_37", "name": "Rosana Tolentino", "whatsapp": "(11) 98576-4412", "email": "", "birth": "1972-01-10", "startDate": "2026-09-15", "goal": "Reabilitação", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 10, "teacher": "LOUISE KARLA", "time": "10:00", "days": ["2", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_38", "name": "Anderson Prates", "whatsapp": "(11) 98617-4479", "email": "", "birth": "1977-06-17", "startDate": "2026-09-15", "goal": "Fortalecimento", "address": "", "emergency": "", "plan": "Plano 3X na semana", "monthly": 220, "due": 15, "teacher": "LOUISE KARLA", "time": "20:00", "days": ["1", "3", "5"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_39", "name": "Ingrid Valadares", "whatsapp": "(11) 98658-4546", "email": "", "birth": "1982-11-24", "startDate": "2026-09-15", "goal": "Bem-estar", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 20, "teacher": "LOUISE KARLA", "time": "14:00", "days": ["2", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}, {"id": "stu_seed40_40", "name": "Cássio Menezes", "whatsapp": "(11) 98699-4613", "email": "", "birth": "1987-04-04", "startDate": "2026-09-15", "goal": "Gestação", "address": "", "emergency": "", "plan": "Plano 2X na semana", "monthly": 170, "due": 25, "teacher": "LOUISE KARLA", "time": "15:00", "days": ["1", "4"], "status": "Ativo", "notes": "Aluno de exemplo", "clinical": {}, "evolution": [], "createdAt": "2026-09-15T09:00:00.000Z", "updatedAt": "2026-09-15T09:00:00.000Z"}];
const have=new Set((db.students||[]).map(s=>String(s.id)));const add=seed.filter(s=>!have.has(s.id));
db.students=(db.students||[]).concat(add);try{saveStudentVault(db.students)}catch(e){}
saveDB();try{localStorage.setItem('seed40_v1','1')}catch(e){}
try{renderAll()}catch(e){console.warn('V110 render',e)}
}catch(e){console.warn('V110',e)}})();

;
/* ===== bloco-19 ===== */
/* V111 — histórico de 1 ano de operação (importação única; só acrescenta) */
(function run(){try{
if(typeof db==='undefined'||!db||(db.students||[]).length<75){if(!run.n)run.n=0;if(run.n++<40)setTimeout(run,150);if(!(run.n>=40&&db&&db.students))return}
let done=false;try{done=localStorage.getItem('hist1y_v1')==='1'}catch(e){}if(done)return;
let sd=20261003;const R=()=>{sd|=0;sd=sd+0x6D2B79F5|0;let t=Math.imul(sd^sd>>>15,1|sd);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const pick=a=>a[Math.floor(R()*a.length)],iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const today=new Date();today.setHours(12,0,0,0);const T=iso(today);
const eqs=(db.equipment||[]).filter(e=>e.active!==false).map(e=>e.id);const pays=db.payments||['PIX'];
db.classes=db.classes||[];db.finance=db.finance||[];db.makeups=db.makeups||[];db.waitlist=db.waitlist||[];
const st=db.students;const stN=st.length;
/* datas de início escalonadas ao longo do ano */
st.forEach((s,i)=>{const d=new Date(today);d.setDate(d.getDate()-Math.round(360-(i/(stN-1))*330));s.startDate=iso(d);s.updatedAt=new Date().toISOString()});
/* aulas: últimos 120 dias + próximos 14 */
const slot={},last={},from=new Date(today);from.setDate(from.getDate()-120);const to=new Date(today);to.setDate(to.getDate()+14);
const cls=[];
for(let d=new Date(from);d<=to;d.setDate(d.getDate()+1)){const ds=iso(d),wd=String(d.getDay());
 st.forEach(s=>{if(!(s.days||[]).includes(wd)||ds<s.startDate)return;
  let status='Agendada';if(ds<T){const r=R();status=r<.88?'Realizada':r<.94?'Falta':'Cancelada'}
  let eq='';if(status!=='Cancelada'){const k=ds+s.time,u=slot[k]||(slot[k]=new Set());eq=eqs.find((e,j)=>!u.has(e)&&e!==last[s.id])||eqs.find(e=>!u.has(e))||'';if(eq){u.add(eq);last[s.id]=eq}}
  cls.push({id:'cls_h'+cls.length,date:ds,time:s.time,studentId:s.id,studentName:s.name,teacher:s.teacher,duration:50,status,equipmentId:eq,experimental:false,notes:status==='Falta'?'Faltou sem aviso':(status==='Cancelada'?'Cancelada pelo aluno':''),createdAt:ds+'T08:00:00.000Z'})})}
const ex=new Set(db.classes.map(c=>c.studentId+c.date+c.time));db.classes=db.classes.concat(cls.filter(c=>!ex.has(c.studentId+c.date+c.time)));
/* financeiro: mensalidades desde o início de cada aluno */
const fin=[];st.forEach(s=>{const sd0=new Date(s.startDate+'T12:00:00');let y=sd0.getFullYear(),m=sd0.getMonth();
 while(y<today.getFullYear()||(y===today.getFullYear()&&m<=today.getMonth())){const due=y+'-'+String(m+1).padStart(2,'0')+'-'+String(Math.min(s.due||10,28)).padStart(2,'0');
  const cur=y===today.getFullYear()&&m===today.getMonth();let status='Pago';
  if(cur)status=R()<.45?'Pago':'Pendente';else if(due>T)status='Pendente';else if(R()<.04)status='Pendente';
  const o={id:'fin_h'+fin.length,studentId:s.id,studentName:s.name,description:'Mensalidade — '+s.plan,value:s.monthly,dueDate:due,status,paymentMethod:pick(pays),notes:'',type:'Receita'};
  if(status==='Pago'){const p=new Date(due+'T12:00:00');p.setDate(p.getDate()+Math.floor(R()*4)-2);o.paidAt=iso(p)>T?T:iso(p)}
  fin.push(o);m++;if(m>11){m=0;y++}}});
/* despesas mensais do último ano */
const dsp=[['Aluguel do studio',2800,5],['Energia elétrica',420,12],['Internet e telefone',180,15],['Material de limpeza',150,8],['Marketing e redes sociais',350,20],['Contabilidade',300,10],['Manutenção de aparelhos',260,25],['Pagamento Professor 2',1800,5]];
for(let k=11;k>=0;k--){const b=new Date(today.getFullYear(),today.getMonth()-k,1);dsp.forEach(([n,v,dd])=>{const due=b.getFullYear()+'-'+String(b.getMonth()+1).padStart(2,'0')+'-'+String(dd).padStart(2,'0');
 fin.push({id:'fin_h'+fin.length,studentId:'',studentName:'',description:n,value:Math.round(v*(.92+R()*.16)),dueDate:due,status:due<=T?'Pago':'Pendente',paymentMethod:pick(pays),notes:'',type:'Despesa',category:n.split(' ')[0],paidAt:due<=T?due:undefined})})}
db.finance=db.finance.concat(fin);
/* reposições */
const miss=cls.filter(c=>c.status==='Falta'||c.status==='Cancelada');
for(let i=0;i<30&&miss.length;i++){const c=miss.splice(Math.floor(R()*miss.length),1)[0];const nd=new Date(c.date+'T12:00:00');nd.setDate(nd.getDate()+3+Math.floor(R()*8));const nds=iso(nd);
 db.makeups.push({id:'mk_h'+i,studentId:c.studentId,studentName:c.studentName,originalDate:c.date,newDate:nds,newTime:c.time,status:nds<T?'Realizada':(R()<.5?'Agendada':'Pendente'),notes:'Reposição de aula '+(c.status==='Falta'?'faltada':'cancelada')})}
/* lista de espera */
['Helena Castro','Murilo Teixeira','Sandra Lopes','Cleber Antunes','Patrícia Gouveia','Rogério Dantas','Marta Pires','Tiago Salles','Eliane Borges','Lívia Chaves'].forEach((n,i)=>db.waitlist.push({id:'wait_h'+i,name:n,whatsapp:'(11) 9'+(6100+i*29)+'-'+(3100+i*71),plan:i%2?'Plano 3X na semana':'Plano 2X na semana',time:db.hours[(i*3)%db.hours.length],priority:1+i%3,status:['Aguardando','Contactar','Aguardando'][i%3],notes:'Aguardando vaga no horário',createdAt:new Date(today.getTime()-i*864e5*9).toISOString()}));
/* avaliação clínica e evolução */
const queix=['Dor lombar crônica','Dor cervical','Postura','Rigidez de quadril','Condicionamento geral','Pós-operatório de joelho'];
st.forEach((s,i)=>{const sdt=new Date(s.startDate+'T12:00:00'),days=Math.max(1,Math.round((today-sdt)/864e5)),n=Math.min(8,Math.floor(days/42));
 const q=queix[i%6],p0=5+Math.floor(R()*4),f0=3+Math.floor(R()*3);
 s.clinical={baselineDate:s.startDate,complaint:q,objective:s.goal||'Melhorar qualidade de movimento',diagnosis:'',painScore:p0,painLocation:q.includes('cerv')?'Cervical':'Lombar',functionalScore:f0,postureScore:f0,mobilityScore:f0,strengthScore:f0,balanceScore:f0+1,controlScore:f0,goals:[{id:'goal_h'+i,area:'Funcional',description:'Reduzir dor e ganhar mobilidade',baseline:p0,target:2,current:Math.max(2,p0-Math.min(5,n)),unit:'/10'}]};
 s.evolution=[];for(let k=1;k<=n;k++){const d=new Date(sdt);d.setDate(d.getDate()+k*42);const pr=k/Math.max(n,1),pn=Math.max(1,Math.round(p0-pr*(p0-2))),fn=Math.min(10,Math.round(f0+pr*(8-f0)));
  s.evolution.push({id:'evo_h'+i+'_'+k,date:iso(d),title:'Reavaliação '+k,complaint:q,objective:s.goal||'',assessment:'Evolução '+(k<3?'inicial positiva':'consistente')+'; dor '+pn+'/10.',pain:String(pn),painBefore:String(pn+1),painAfter:String(pn),functionalScore:String(fn),mobilityScore:String(fn),strengthScore:String(fn),balanceScore:String(fn),controlScore:String(fn),intervention:'Reformer e Cadillac com foco em estabilização.',exercises:'Footwork, Short Spine, Leg Springs',equipment:'Reformer, Cadillac',response:'Boa resposta ao exercício.',adherence:'Frequência regular',tolerance:'Boa',progression:'Aumento gradual de carga e molas.',incidents:'',nextSteps:'Manter progressão e reavaliar em 6 semanas.',nextReview:iso(new Date(d.getTime()+42*864e5)),professional:s.teacher||'LOUISE KARLA'})}
 s.evolution.sort((a,b)=>String(b.date).localeCompare(String(a.date)))});
try{saveStudentVault(db.students)}catch(e){}
if(saveDB()!==false){try{localStorage.setItem('hist1y_v1','1')}catch(e){}}
try{renderAll()}catch(e){console.warn('V111 render',e)}
}catch(e){console.warn('V111',e)}})();

;
/* ===== v113-cards-js ===== */
(function(){
function enh(c){
  if(c.dataset.v113)return;c.dataset.v113=1;
  const m=c.querySelector('.cg-more');
  if(m&&m.children.length>2){
    m.classList.add('clip');
    const b=document.createElement('button');b.type='button';b.className='cg-tg';b.innerHTML='Ver detalhes <i>▾</i>';
    b.onclick=e=>{e.stopPropagation();const o=m.classList.toggle('open');m.classList.toggle('clip',!o);b.classList.toggle('open',o);b.firstChild.nodeValue=o?'Ocultar ':'Ver detalhes ';};
    m.after(b);
  }
}
function run(){
  document.querySelectorAll('.cg-grid').forEach(g=>[...g.querySelectorAll(':scope>.cg-card')].forEach((c,i)=>{if(!c.dataset.v113)c.style.setProperty('--i',Math.min(i,14));}));
  document.querySelectorAll('.cg-card').forEach(enh);
}
let t;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(run,60)}).observe(document.body,{childList:true,subtree:true});
run();
})();

;
/* ===== v114-live-js ===== */
(function(){
function slotsFrom(){
  const now=new Date(),today=todayISO(),cur=now.getHours()*60+now.getMinutes();
  const list=(db.classes||[]).filter(c=>c.status!=='Cancelada'&&c.date&&timeToMinutes(c.time)!=null);
  const dur=c=>Math.max(1,Number(c.duration||db.settings.duration||60));
  const nowC=list.filter(c=>c.date===today&&timeToMinutes(c.time)<=cur&&cur<timeToMinutes(c.time)+dur(c));
  const key=c=>c.date+'T'+String(timeToMinutes(c.time)).padStart(4,'0');
  const nowKey=new Set(nowC.map(key));
  const nowKeyStr=today+'T'+String(cur).padStart(4,'0');
  const fut=list.filter(c=>key(c)>nowKeyStr&&!nowKey.has(key(c))).sort((a,b)=>key(a)<key(b)?-1:1);
  const nextC=fut.length?fut.filter(c=>key(c)===key(fut[0])):[];
  return{nowC,nextC,cur,dur};
}
function ini(n){return String(n||'?').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()}
function chips(arr){
  return '<div class="ln-list">'+arr.map(c=>{const s=studentById(c.studentId);const n=s?.name||c.studentName||'Aluno';
    const eq=c.equipmentId?equipmentById(c.equipmentId):null;
    return `<span class="ln-chip"><b>${esc(ini(n))}</b>${esc(n.split(' ')[0])}${eq?` <em>${esc(eq.name)}</em>`:''}</span>`}).join('')+'</div>';
}
function dayLabel(d){const t=todayISO();if(d===t)return'Hoje';const tm=new Date(t+'T12:00:00');tm.setDate(tm.getDate()+1);
  if(d===tm.toISOString().slice(0,10))return'Amanhã';const x=new Date(d+'T12:00:00');return x.toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit'})}
function render(){
  const el=document.getElementById('liveNow');if(!el||typeof db==='undefined'||!db.classes)return;
  try{
  const {nowC,nextC,cur,dur}=slotsFrom();
  let h='';
  if(nowC.length){
    const st=Math.min(...nowC.map(c=>timeToMinutes(c.time))),d=dur(nowC[0]),pct=Math.max(0,Math.min(100,(cur-st)/d*100)),left=st+d-cur;
    h+=`<div class="ln-box now"><div class="ln-top"><span><i class="ln-dot"></i>Em andamento</span><span>${nowC.length} ${nowC.length>1?'alunos':'aluno'}</span></div>
      <div class="ln-time">${esc(formatTimeRange(nowC[0].time))}<small>restam ${left} min</small></div><div class="ln-bar"><i style="width:${pct}%"></i></div>${chips(nowC)}</div>`;
  }else h+=`<div class="ln-box now"><div class="ln-top"><span><i class="ln-dot" style="animation:none;opacity:.4"></i>Em andamento</span></div><div class="ln-empty">Nenhuma aula acontecendo agora.</div></div>`;
  if(nextC.length){
    const c0=nextC[0],st=timeToMinutes(c0.time);
    let eta='';if(c0.date===todayISO()){const m=st-cur;eta=m>=60?`em ${Math.floor(m/60)}h${String(m%60).padStart(2,'0')}`:`em ${m} min`}
    h+=`<div class="ln-box next"><div class="ln-top"><span><i class="ln-dot"></i>Próxima aula</span><span>${nextC.length} ${nextC.length>1?'alunos':'aluno'}</span></div>
      <div class="ln-time">${esc(formatTimeRange(c0.time))}<small>${esc(dayLabel(c0.date))}${eta?' · '+eta:''}</small></div>${chips(nextC)}</div>`;
  }else h+=`<div class="ln-box next"><div class="ln-top"><span><i class="ln-dot"></i>Próxima aula</span></div><div class="ln-empty">Nenhuma aula futura agendada.</div></div>`;
  if(el._h!==h){el.innerHTML=h;el._h=h}
  }catch(e){console.warn('liveNow',e)}
}
window.renderLiveNow=render;
if(typeof renderDashboard==='function'){const o=renderDashboard;window.renderDashboard=renderDashboard=function(){const r=o.apply(this,arguments);render();return r}}
setInterval(render,20000);
document.addEventListener('visibilitychange',render);
render();
})();

;
/* ===== v115-cards-js ===== */
(function(){
function glow(c){if(c.querySelector(':scope>.cg-glow'))return;const g=document.createElement('span');g.className='cg-glow';c.prepend(g)}
function scan(){document.querySelectorAll('.cg-card').forEach(glow)}
document.addEventListener('pointermove',e=>{const c=e.target.closest&&e.target.closest('.cg-card');if(!c)return;const r=c.getBoundingClientRect();c.style.setProperty('--gx',(e.clientX-r.left)+'px');c.style.setProperty('--gy',(e.clientY-r.top)+'px')},{passive:true});
let t;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(scan,60)}).observe(document.body,{childList:true,subtree:true});
scan();
})();

;
/* ===== v117-evolucao-js ===== */
(function(){
function glow(c){if(c.querySelector(':scope>.cg-glow'))return;const g=document.createElement('span');g.className='cg-glow';c.prepend(g)}
function scan(){document.querySelectorAll('.card.kpi').forEach(glow)}
document.addEventListener('pointermove',e=>{const c=e.target.closest&&e.target.closest('.card.kpi');if(!c)return;const r=c.getBoundingClientRect();c.style.setProperty('--gx',(e.clientX-r.left)+'px');c.style.setProperty('--gy',(e.clientY-r.top)+'px')},{passive:true});
let t;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(scan,60)}).observe(document.body,{childList:true,subtree:true});
scan();
})();

;
/* ===== v118-refresh-js ===== */
(function(){
'use strict';
var busy=false,last=null,timer=null;
function call(n){var a=[].slice.call(arguments,1);try{if(typeof window[n]==='function')return window[n].apply(null,a)}catch(e){console.error('[V118]',n,e)}}
function curPage(){var p=document.querySelector('.page.active');return (p&&p.id.replace('page-',''))||window.currentPage||'dashboard'}
function typing(){var a=document.activeElement;return !!(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))||!!document.querySelector('.modal-backdrop.show,#iosConfirmBackdrop.show')}
function stamp(){var b=document.getElementById('btnGlobalRefresh');if(!b||!last)return;b.title='Atualizar todos os dados e telas (última: '+last.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})+')'}
function refreshAll(manual){
  if(busy)return;if(!manual&&typing())return;
  busy=true;var b=document.getElementById('btnGlobalRefresh');
  if(b){b.classList.add('is-refreshing');b.disabled=true}
  try{
    if(typeof loadDB==='function'){var fresh=loadDB();if(fresh&&Array.isArray(fresh.students))db=fresh}
    call('ensureV10Data');call('ensureEvolutionV42');
    call('renderCurrentPage',curPage());
    call('updateMenuBadges');call('refreshControlEquipment',true);call('refreshAdvancedPanels',true);
    call('renderV9BackupStatus');call('renderV9Alerts');
    last=new Date();stamp();
    if(manual)call('toast','Sistema atualizado.');
  }catch(e){console.error('[V118] falha na atualização',e);if(manual)call('toast','Falha ao atualizar. Veja o console.')}
  setTimeout(function(){busy=false;if(b){b.classList.remove('is-refreshing');b.disabled=false}},650);
}
window.refreshAll=refreshAll;
document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('#btnGlobalRefresh'))refreshAll(true)});
function soft(){clearTimeout(timer);timer=setTimeout(function(){refreshAll(false)},400)}
document.addEventListener('visibilitychange',function(){if(!document.hidden)soft()});
window.addEventListener('storage',function(e){if(e.storageArea===localStorage)soft()});
})();

;
/* ===== v121-dynamic ===== */
(function(){'use strict';
var root=document.documentElement,$=function(i){return document.getElementById(i)};
var bar=document.createElement('div');bar.id='v121-progress';document.body.appendChild(bar);
var lastY=0,tk=false;
function onScroll(){if(tk)return;tk=true;requestAnimationFrame(function(){
  var h=document.documentElement,max=h.scrollHeight-h.clientHeight,y=h.scrollTop;
  bar.style.transform='scaleX('+(max>0?Math.min(1,y/max):0)+')';
  var tb=document.querySelector('.topbar');
  if(tb&&window.innerWidth<=1080&&!document.querySelector('.modal-backdrop.show')){tb.classList.toggle('v121-hide',y>lastY+4&&y>120);if(y<lastY-4||y<60)tb.classList.remove('v121-hide')}
  lastY=y;tk=false})}
addEventListener('scroll',onScroll,{passive:true});
var kt=new WeakMap();
new MutationObserver(function(ms){ms.forEach(function(m){
  var e=m.target.nodeType===3?m.target.parentElement:m.target;e=e&&e.closest&&e.closest('.kpi-value');
  if(!e||e.classList.contains('v121-tick'))return;if(!kt.has(e)){kt.set(e,1);return}
  e.classList.add('v121-tick');setTimeout(function(){e.classList.remove('v121-tick')},800)})})
 .observe(document.body,{childList:true,subtree:true,characterData:true});
function live(){
  try{var s=$('heroSub'),n=$('islNext');if(!s||!n)return;
    var t=(n.textContent||'').trim();if(!t||/carreg/i.test(t))return;
    var cls=$('islClasses'),pe=$('islPending');
    var txt=t+' · '+(cls?cls.textContent:'0')+' aula(s) hoje'+(pe&&+pe.textContent?' · '+pe.textContent+' cobrança(s) pendente(s)':'');
    if(s.dataset.v121!==txt){s.dataset.v121=txt;s.innerHTML='<span class="v121-live"><i></i>'+txt.replace(/</g,'&lt;')+'</span>'}
  }catch(e){}}
setInterval(live,15000);setTimeout(live,1200);
if(typeof window.renderDashboard==='function'){var o=window.renderDashboard;window.renderDashboard=function(){var r=o.apply(this,arguments);setTimeout(live,60);return r}}
var gT=0,map={d:'dashboard',a:'agenda',s:'students',f:'finance',c:'billing',e:'equipment',r:'reports',t:'settings'},hint=document.createElement('div');hint.id='v121-toast-hint';document.body.appendChild(hint);
document.addEventListener('keydown',function(e){
  var a=document.activeElement;if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)||e.metaKey||e.ctrlKey||e.altKey)return;
  var k=e.key.toLowerCase();
  if(k==='g'){gT=Date.now();hint.textContent='G → D painel · A agenda · S alunos · F financeiro · C cobranças · E equipamentos';hint.classList.add('on');setTimeout(function(){hint.classList.remove('on')},1400);return}
  if(Date.now()-gT<1400&&map[k]&&typeof goPage==='function'){gT=0;hint.classList.remove('on');goPage(map[k])}
});
var go=window.goPage;if(typeof go==='function'){window.goPage=function(){var r=go.apply(this,arguments);setTimeout(function(){var b=document.querySelector('.nav button.active');if(b&&b.scrollIntoView)b.scrollIntoView({block:'nearest'});window.scrollTo({top:0,behavior:'smooth'})},40);return r}}
var m=document.querySelector('meta[name="application-version"]');if(m)m.content='v122-gastos';
})();

;
/* ===== v122-gastos-js ===== */
(function(){
'use strict';
var CATS=[
 ['Aluguel','#6366f1',/alug|condom[ií]nio|iptu/i],
 ['Contas','#0ea5e9',/energia|luz\b|[aá]gua|internet|telefone|g[aá]s\b|enel|sabesp|vivo|claro/i],
 ['Pessoal','#10b981',/sal[aá]rio|professor|instrutor|pr[oó].?labore|comiss|folha|estagi|freela/i],
 ['Material','#f59e0b',/material|equip|aparelho|bola|mola|colchonete|reformer|cadillac|toalha|acess[oó]rio/i],
 ['Manutenção','#14b8a6',/manuten|limpeza|conserto|faxina|higien|reparo/i],
 ['Marketing','#ec4899',/marketing|an[uú]ncio|instagram|ads\b|divulg|panfleto|brinde/i],
 ['Impostos','#ef4444',/imposto|taxa|\bdas\b|\bmei\b|inss|\biss\b|cont[aá]bil|contador|tarifa|maquininha/i],
 ['Assinaturas','#8b5cf6',/software|assinatura|aplicativo|sistema|mensalidade do/i],
 ['Outros','#94a3b8',null]
];
var NAMES=CATS.map(function(c){return c[0]});
function col(n){for(var i=0;i<CATS.length;i++)if(CATS[i][0]===n)return CATS[i][1];return '#94a3b8'}
function guess(f){if(f.category&&NAMES.indexOf(f.category)>=0)return f.category;var t=(f.description||'')+' '+(f.supplier||'');for(var i=0;i<CATS.length-1;i++)if(CATS[i][2].test(t))return CATS[i][0];return 'Outros'}
var ym=(typeof todayISO==='function'?todayISO():new Date().toISOString().slice(0,10)).slice(0,7);
var fCat='',fSt='',fQ='';
function addM(k,n){var p=k.split('-'),d=new Date(+p[0],+p[1]-1+n,1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
function lbl(k){var p=k.split('-');return new Date(+p[0],+p[1]-1,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}
function sh(k){var p=k.split('-');return new Date(+p[0],+p[1]-1,1).toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}
function exps(){return (db.finance||[]).filter(function(f){return f.type==='Despesa'&&f.status!=='Cancelado'})}
function inM(list,k){return list.filter(function(f){return String(f.dueDate||'').slice(0,7)===k})}
function sum(list){return list.reduce(function(a,f){return a+Number(f.value||0)},0)}
function budgets(){if(!db.expenseBudgets||typeof db.expenseBudgets!=='object')db.expenseBudgets={};return db.expenseBudgets}
function $(id){return document.getElementById(id)}

/* ===== página + menu ===== */
function mount(){
  var fin=$('page-finance');if(!fin||$('page-expenses'))return;
  var sec=document.createElement('section');sec.className='page';sec.id='page-expenses';
  sec.innerHTML=
  '<div class="page-head"><div><h1 class="page-title">Gastos</h1><div class="page-sub">Controle detalhado de despesas por categoria, fornecedor e mês.</div></div>'+
  '<div class="actions"><button class="btn" onclick="V122.budgets()">Orçamentos</button><button class="btn" onclick="V122.recurring()">Lançar fixas</button><button class="btn" onclick="V122.csv()">Exportar CSV</button><button class="btn primary" onclick="openExpenseModal()"><span>Nova Despesa</span></button></div></div>'+
  '<div class="finance-period-toolbar"><button class="btn small" type="button" onclick="V122.month(-1)">‹ Anterior</button><strong id="gxLabel"></strong><button class="btn small" type="button" onclick="V122.month(1)">Próximo ›</button><button class="btn small" type="button" onclick="V122.month(0)">Hoje</button></div>'+
  '<div class="grid grid-4" id="gxKpis"></div>'+
  '<div class="gx-grid"><div class="card gx-card"><h3>Por categoria</h3><div id="gxCats"></div></div>'+
  '<div style="display:grid;gap:14px;align-content:start"><div class="card gx-card"><h3>Últimos 6 meses</h3><div class="gx-months" id="gxMonths"></div></div>'+
  '<div class="card gx-card"><h3>Maiores fornecedores</h3><div id="gxSup"></div></div></div></div>'+
  '<div class="gx-filters"><input id="gxQ" type="search" placeholder="Buscar descrição ou fornecedor"><select id="gxC"></select><select id="gxS"><option value="">Todos os status</option><option value="Pago">Pago</option><option value="Pendente">A pagar</option><option value="Atrasado">Atrasado</option></select></div>'+
  '<div class="card panel section"><div class="table-wrap"><table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Fornecedor</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead><tbody id="gxTable"></tbody></table></div></div>';
  fin.insertAdjacentElement('afterend',sec);
  var q=$('gxQ'),c=$('gxC'),s=$('gxS');
  q.oninput=function(){fQ=q.value;table()};
  c.onchange=function(){fCat=c.value;render()};
  s.onchange=function(){fSt=s.value;table()};
  var fb=document.querySelector('.nav button[data-page="finance"]');
  if(fb&&!document.querySelector('.nav button[data-page="expenses"]')){
    var b=fb.cloneNode(true);b.setAttribute('data-page','expenses');b.classList.remove('active');
    var t=b.querySelector('.nav-text');if(t)t.textContent='Gastos';
    var svg=b.querySelector('svg');if(svg)svg.innerHTML='<path d="M12 4v11"/><path d="m7.5 11 4.5 4.5 4.5-4.5"/><path d="M5 20h14"/>';
    b.addEventListener('click',function(){goPage('expenses')});
    fb.insertAdjacentElement('afterend',b);
  }
}

/* ===== render ===== */
function render(){
  if(!$('page-expenses'))return;
  var all=exps(),cur=inM(all,ym),prev=inM(all,addM(ym,-1)),today=todayISO();
  var tot=sum(cur),paid=sum(cur.filter(function(f){return f.status==='Pago'})),open=tot-paid;
  var over=sum(cur.filter(function(f){return f.status!=='Pago'&&f.dueDate<today}));
  var pt=sum(prev),delta=pt>0?(tot-pt)/pt*100:null;
  var rec=sum(inM((db.finance||[]).filter(function(f){return f.type!=='Despesa'&&f.status==='Pago'},0),ym));
  var avg=0;for(var i=1;i<=6;i++)avg+=sum(inM(all,addM(ym,-i)));avg/=6;
  var share=rec>0?tot/rec*100:null;
  $('gxLabel').textContent=lbl(ym);
  function k(l,v,x){return '<div class="card kpi"><div class="kpi-label">'+l+'</div><div class="kpi-value">'+v+'</div>'+(x||'')+'</div>'}
  $('gxKpis').innerHTML=
   k('TOTAL DO MÊS',money(tot),delta===null?'<div class="gx-delta">sem mês anterior</div>':'<div class="gx-delta '+(delta>0?'up':'down')+'">'+(delta>0?'▲ ':'▼ ')+Math.abs(delta).toFixed(0)+'% vs mês anterior</div>')+
   k('PAGO',money(paid))+
   k('A PAGAR',money(open),over>0?'<div class="gx-delta up">'+money(over)+' em atraso</div>':'')+
   k('% DA RECEITA',share===null?'—':share.toFixed(0)+'%','<div class="gx-delta">média 6 meses: '+money(avg)+'</div>');
  /* categorias */
  var by={};cur.forEach(function(f){var c=guess(f);by[c]=(by[c]||0)+Number(f.value||0)});
  var B=budgets(),keys=Object.keys(by);Object.keys(B).forEach(function(c){if(B[c]>0&&keys.indexOf(c)<0)keys.push(c)});
  keys.sort(function(a,b){return (by[b]||0)-(by[a]||0)});
  $('gxCats').innerHTML=keys.length?keys.map(function(c){
    var v=by[c]||0,bd=Number(B[c]||0),pct=bd>0?Math.min(100,v/bd*100):(tot>0?v/tot*100:0),ov=bd>0&&v>bd;
    return '<div class="gx-cat'+(fCat===c?' on':'')+'" onclick="V122.cat(\''+c+'\')"><b><i class="gx-dot" style="background:'+col(c)+'"></i>'+c+'</b><span class="'+(ov?'gx-over':'')+'">'+money(v)+(bd>0?' / '+money(bd):(tot>0?' · '+(v/tot*100).toFixed(0)+'%':''))+'</span><div class="gx-bar"><i style="width:'+pct+'%;background:'+(ov?'var(--bad,#dc2626)':col(c))+'"></i></div></div>';
  }).join(''):'<div class="gx-empty">Nenhuma despesa neste mês.</div>';
  /* 6 meses */
  var ms=[],mx=1;for(var j=5;j>=0;j--){var kk=addM(ym,-j),v=sum(inM(all,kk));ms.push([kk,v]);if(v>mx)mx=v}
  $('gxMonths').innerHTML=ms.map(function(m){return '<div class="gx-m'+(m[0]===ym?' cur':'')+'"><em>'+(m[1]?Math.round(m[1]):'')+'</em><i style="height:'+Math.max(3,m[1]/mx*86)+'%"></i><small>'+sh(m[0])+'</small></div>'}).join('');
  /* fornecedores */
  var sp={};cur.forEach(function(f){var n=(f.supplier||f.description||'—').trim();sp[n]=(sp[n]||0)+Number(f.value||0)});
  var top=Object.keys(sp).sort(function(a,b){return sp[b]-sp[a]}).slice(0,5);
  $('gxSup').innerHTML=top.length?top.map(function(n){return '<div class="gx-sup"><b style="font-weight:500">'+esc(n)+'</b><span>'+money(sp[n])+'</span></div>'}).join(''):'<div class="gx-empty">—</div>';
  /* filtro categoria */
  var c=$('gxC'),opts='<option value="">Todas as categorias</option>'+NAMES.map(function(n){return '<option'+(fCat===n?' selected':'')+'>'+n+'</option>'}).join('');
  if(c.innerHTML!==opts)c.innerHTML=opts;
  table();
}
function table(){
  var el=$('gxTable');if(!el)return;var today=todayISO(),q=fQ.trim().toLowerCase();
  var rows=inM(exps(),ym).filter(function(f){
    var st=f.status==='Pago'?'Pago':(f.dueDate<today?'Atrasado':'Pendente');
    if(fCat&&guess(f)!==fCat)return false;
    if(fSt&&st!==fSt)return false;
    if(q&&((f.description||'')+' '+(f.supplier||'')).toLowerCase().indexOf(q)<0)return false;
    return true}).sort(function(a,b){return String(a.dueDate).localeCompare(String(b.dueDate))});
  el.innerHTML=rows.map(function(f){
    var paid=f.status==='Pago',late=!paid&&f.dueDate<today,c=guess(f);
    var badge=paid?'<span class="badge ok">Pago</span>':late?'<span class="badge bad">Atrasado</span>':'<span class="badge warn">A pagar</span>';
    return '<tr><td>'+dateBR(f.dueDate)+'</td><td>'+esc(f.description)+(f.recurring?' <small title="Fixa mensal">↻</small>':'')+'</td><td><span class="gx-tag"><i class="gx-dot" style="background:'+col(c)+';margin-right:6px"></i>'+c+'</span></td><td>'+esc(f.supplier||'—')+'</td><td><strong>'+money(f.value)+'</strong></td><td>'+badge+'</td><td><div class="row-actions">'+(paid?'':'<button class="btn success small" onclick="markFinancePaid(\''+f.id+'\')">Pagar</button>')+'<button class="btn small" onclick="openExpenseModal(\''+f.id+'\')">Editar</button><button class="btn danger small icon" onclick="deleteFinance(\''+f.id+'\')" title="Excluir" aria-label="Excluir">✕</button></div></td></tr>';
  }).join('')||'<tr><td colspan="7"><div class="gx-empty">Nenhuma despesa encontrada.</div></td></tr>';
}

/* ===== modal de despesa (substitui o antigo, mesmos dados + categoria/fornecedor/fixa) ===== */
window.openExpenseModal=function(id){
  id=id||null;editingId=id;var f=(db.finance||[]).find(function(x){return x.id===id})||{};
  var cat=f.id?guess(f):'';
  var body='<div class="form-grid"><div class="field full"><label>Descrição *</label><input id="expDesc" value="'+esc(f.description||'')+'" placeholder="Ex.: aluguel, energia, material"></div>'+
  '<div class="field"><label>Valor *</label><input id="expValue" type="number" step="0.01" min="0" inputmode="decimal" value="'+(f.value==null?'':f.value)+'"></div>'+
  '<div class="field"><label>Data</label><input id="expDue" type="date" value="'+esc(f.dueDate||(ym===todayISO().slice(0,7)?todayISO():ym+'-01'))+'"></div>'+
  '<div class="field"><label>Categoria</label><select id="expCat"><option value="">Automática</option>'+NAMES.map(function(n){return '<option'+(cat===n&&f.category?' selected':'')+'>'+n+'</option>'}).join('')+'</select></div>'+
  '<div class="field"><label>Fornecedor</label><input id="expSup" value="'+esc(f.supplier||'')+'" placeholder="Opcional"></div>'+
  '<div class="field"><label>Status</label><select id="expStatus"><option'+(f.status!=='Pago'?' selected':'')+'>Pendente</option><option'+(f.status==='Pago'?' selected':'')+'>Pago</option></select></div>'+
  '<div class="field"><label>Forma de pagamento</label><select id="expPay"><option value="">Selecione</option>'+(db.payments||[]).map(function(p){return '<option'+(f.paymentMethod===p?' selected':'')+'>'+esc(p)+'</option>'}).join('')+'</select></div>'+
  '<div class="field full"><label style="display:flex;gap:8px;align-items:center"><input id="expRec" type="checkbox"'+(f.recurring?' checked':'')+' style="width:auto"> Despesa fixa (repete todo mês)</label></div>'+
  '<div class="field full"><label>Observação</label><textarea id="expNotes">'+esc(f.notes||'')+'</textarea></div></div>';
  openModal(id?'Editar Despesa':'Nova Despesa',body,window.saveExpense);
};
window.saveExpense=function(){
  var old=(db.finance||[]).find(function(x){return x.id===editingId})||{};
  var o={};for(var k in old)o[k]=old[k];
  o.id=editingId||uid('exp');o.studentId='';o.studentName='';o.type='Despesa';
  o.description=$('expDesc').value.trim();o.value=Number($('expValue').value||0);o.dueDate=$('expDue').value;
  o.status=$('expStatus').value;o.paymentMethod=$('expPay').value;o.notes=$('expNotes').value;
  o.category=$('expCat').value;o.supplier=$('expSup').value.trim();o.recurring=$('expRec').checked;
  if(o.status==='Pago'&&!o.paidAt)o.paidAt=todayISO();if(o.status!=='Pago')delete o.paidAt;
  if(!o.description||o.value<=0||!o.dueDate){toast('Informe descrição, valor e data da despesa.');return}
  var i=db.finance.findIndex(function(x){return x.id===editingId});if(i>=0)db.finance[i]=o;else db.finance.push(o);
  saveDB();closeModal();renderAll();toast('Despesa salva com sucesso.');
};

/* ===== ações ===== */
window.V122={
  month:function(n){ym=n===0?todayISO().slice(0,7):addM(ym,n);render()},
  cat:function(c){fCat=fCat===c?'':c;render()},
  recurring:function(){
    var all=exps(),have={};inM(all,ym).forEach(function(f){have[(f.description||'').toLowerCase()+'|'+(f.supplier||'')]=1});
    var src={};all.filter(function(f){return f.recurring&&String(f.dueDate).slice(0,7)<ym}).sort(function(a,b){return String(a.dueDate).localeCompare(String(b.dueDate))}).forEach(function(f){src[(f.description||'').toLowerCase()+'|'+(f.supplier||'')]=f});
    var n=0,p=ym.split('-'),last=new Date(+p[0],+p[1],0).getDate();
    Object.keys(src).forEach(function(key){if(have[key])return;var f=src[key],d=Math.min(last,+String(f.dueDate).slice(8,10)||1),c={};for(var k in f)c[k]=f[k];
      c.id=uid('exp');c.dueDate=ym+'-'+String(d).padStart(2,'0');c.status='Pendente';delete c.paidAt;db.finance.push(c);n++});
    if(n){saveDB();renderAll()}
    toast(n?n+' despesa(s) fixa(s) lançada(s) em '+lbl(ym)+'.':'Nenhuma fixa nova para lançar. Marque despesas como "fixa" ao criá-las.');
  },
  budgets:function(){
    var B=budgets();
    openModal('Orçamento mensal por categoria','<div id="gxBudgetForm"><p style="margin:0 0 8px;color:var(--muted);font-size:13px">Defina o limite mensal. Deixe vazio para não limitar.</p>'+NAMES.map(function(n,i){return '<div class="gx-brow"><label for="gxb'+i+'"><i class="gx-dot" style="background:'+col(n)+'"></i>'+n+'</label><input id="gxb'+i+'" type="number" step="1" min="0" inputmode="decimal" value="'+(B[n]||'')+'"></div>'}).join('')+'</div>',function(){
      var b=budgets();NAMES.forEach(function(n,i){var v=Number($('gxb'+i).value||0);if(v>0)b[n]=v;else delete b[n]});
      saveDB();closeModal();render();toast('Orçamentos salvos.');
    });
  },
  csv:function(){
    var rows=inM(exps(),ym).sort(function(a,b){return String(a.dueDate).localeCompare(String(b.dueDate))});
    var q=function(v){return '"'+String(v==null?'':v).replace(/"/g,'""')+'"'};
    var out=['Data;Descrição;Categoria;Fornecedor;Valor;Status;Pagamento;Fixa;Observação'];
    rows.forEach(function(f){out.push([f.dueDate,f.description,guess(f),f.supplier,String(Number(f.value||0).toFixed(2)).replace('.',','),f.status,f.paymentMethod,f.recurring?'Sim':'Não',f.notes].map(q).join(';'))});
    var blob=new Blob(['﻿'+out.join('\r\n')],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');
    a.href=URL.createObjectURL(blob);a.download='gastos_'+ym+'.csv';document.body.appendChild(a);a.click();
    setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500);toast('CSV exportado.');
  }
};

/* ===== integração com o roteador existente ===== */
var rcp=window.renderCurrentPage;
window.renderCurrentPage=function(p){var r=rcp.apply(this,arguments);var pg=p||(document.querySelector('.page.active')||{}).id;if(pg==='expenses'||pg==='page-expenses'){render();var t=$('topTitle');if(t)t.textContent='Gastos'}return r};
var gp=window.goPage;
window.goPage=function(p){var r=gp.apply(this,arguments);if(p==='expenses')setTimeout(function(){var t=$('topTitle');if(t)t.textContent='Gastos'},60);return r};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();

;
/* ===== v123-agenda-integrada ===== */
/* =====================================================================
   V123 — AGENDA / CALENDÁRIO INTEGRADOS AOS ALUNOS
   O cadastro do aluno (dias, horário, professor, status, nome) é a fonte
   da agenda. Qualquer mudança no aluno reflete nas aulas futuras, e a
   agenda, as reposições e o calendário apontam sempre para o aluno.
   ===================================================================== */
(function(){
'use strict';
if(window.__v123Agenda)return;window.__v123Agenda=true;

var $=function(id){return document.getElementById(id)};
var pad=function(n){return String(n).padStart(2,'0')};
var WD=['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
var WDS=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
function iso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function at(s){return new Date(String(s).slice(0,10)+'T12:00:00')}
function addD(s,n){var d=at(s);d.setDate(d.getDate()+n);return iso(d)}
function endOfMonth(s){var d=at(s);return iso(new Date(d.getFullYear(),d.getMonth()+1,0,12))}
function startOfMonth(s){return String(s).slice(0,7)+'-01'}
function dow(s){return at(s).getDay()}
function now(){return new Date().toISOString()}
function ready(){return typeof db!=='undefined'&&db&&Array.isArray(db.students)&&Array.isArray(db.classes)}
function settings(){db.settings=db.settings||{};if(typeof db.settings.autoSchedule!=='boolean')db.settings.autoSchedule=true;return db.settings}
function skipMap(){if(!db.classSkips||typeof db.classSkips!=='object'||Array.isArray(db.classSkips))db.classSkips={};return db.classSkips}
function isAuto(c){return !!c&&(c.auto===true||(c.auto===undefined&&c.notes==='Aula recorrente'))}
function stuDays(s){return normalizeStudentDays(s.days).map(String)}
function isActive(s){return (s.status||'Ativo')==='Ativo'}
function sById(id){return db.students.find(function(s){return s.id===id})}
function plural(n,a,b){return n+' '+(n===1?a:b)}
function hhmm(v){return (typeof formatTime12==='function')?formatTime12(v):String(v||'')}

/* ---------- equipamento (rodízio) ---------- */
function assignEquipment(c){
  try{
    if(typeof recommendEquipment!=='function')return;
    var eq=recommendEquipment(c.studentId,c.date,c.time,c.id);
    if(eq)c.equipmentId=eq.id;
  }catch(e){console.warn('Rodízio automático indisponível:',e)}
}

/* ---------- núcleo: reconcilia cadastro dos alunos × aulas ---------- */
function horizonEnd(){
  var t=todayISO(),end=endOfMonth(addD(endOfMonth(t),1));
  if(typeof currentMonth!=='undefined'&&currentMonth){
    var v=iso(new Date(currentMonth.getFullYear(),currentMonth.getMonth()+1,0,12));
    if(v>end)end=v;
  }
  var max=addD(t,366);
  return end>max?max:end;
}
function reconcile(scopeId,end,o){
  o=o||{};
  var t=todayISO(),res={created:0,removed:0,moved:0,issues:[]};
  var byId={};db.students.forEach(function(s){byId[s.id]=s});
  var skips=skipMap();
  var cap0=function(d,tm,ign){return slotCapacity(d,tm,ign)};

  /* A) aulas automáticas futuras acompanham o cadastro */
  for(var i=db.classes.length-1;i>=0;i--){
    var c=db.classes[i];
    if(!c||c.date<t||c.status!=='Agendada'||!isAuto(c)||c.makeupId)continue;
    if(scopeId&&c.studentId!==scopeId)continue;
    var s=byId[c.studentId];if(!s)continue;
    var keep=isActive(s)&&s.time&&stuDays(s).indexOf(String(dow(c.date)))>=0&&(!s.startDate||c.date>=s.startDate);
    if(!keep){db.classes.splice(i,1);res.removed++;continue}
    var changed=false;
    if(c.time!==s.time){
      var cp=cap0(c.date,s.time,c.id);
      if(cp.capacity>0&&cp.full){res.issues.push({type:'cap',studentId:s.id,date:c.date,time:s.time,msg:'mantida no horário anterior (novo horário lotado)'})}
      else{c.time=s.time;delete c.equipmentId;assignEquipment(c);res.moved++;changed=true}
    }
    if(s.name&&c.studentName!==s.name){c.studentName=s.name;changed=true}
    if((c.teacher||'')!==(s.teacher||'')){c.teacher=s.teacher||'';changed=true}
    if(changed)c.updatedAt=now();
  }

  /* B) gera as aulas que faltam */
  var list=[];
  db.students.forEach(function(s){
    if(scopeId&&s.id!==scopeId)return;
    if(!isActive(s))return;
    var days=stuDays(s);if(!s.time||!days.length)return;
    var from=o.from||t;if(s.startDate&&s.startDate>from)from=s.startDate;
    for(var d=from;d<=end;d=addD(d,1)){
      if(days.indexOf(String(dow(d)))<0)continue;
      list.push({d:d,s:s});
    }
  });
  list.sort(function(a,b){return a.d.localeCompare(b.d)||String(a.s.time).localeCompare(String(b.s.time))||String(a.s.name).localeCompare(String(b.s.name),'pt-BR')});
  var has={};db.classes.forEach(function(c){if(c&&c.studentId)has[c.studentId+'|'+c.date]=1});
  list.forEach(function(x){
    var key=x.s.id+'|'+x.d;
    if(has[key])return;
    if(skips[key]){if(o.ignoreSkips)delete skips[key];else return}
    var cp=cap0(x.d,x.s.time);
    if(cp.capacity>0&&cp.full){res.issues.push({type:'cap',studentId:x.s.id,date:x.d,time:x.s.time,msg:'horário lotado'});return}
    var c={id:uid('cls'),date:x.d,time:x.s.time,studentId:x.s.id,studentName:x.s.name,teacher:x.s.teacher||'',status:'Agendada',duration:Number((db.settings&&db.settings.duration)||60),notes:'Aula recorrente',auto:true,createdAt:now()};
    db.classes.push(c);has[key]=1;
    assignEquipment(c);
    res.created++;
  });
  return res;
}
function signature(end){
  return [todayISO(),end,db.settings.capacity,db.settings.duration,
    db.students.map(function(s){return [s.id,s.status,s.time,stuDays(s).join(''),s.startDate,s.teacher,s.name].join(':')}).join('|'),
    JSON.stringify(db.hourDays||{}),db.classes.length,JSON.stringify(db.equipment?db.equipment.length:0)].join('#');
}
function syncAll(force){
  if(!ready()||window.__agHold)return null;
  if(!settings().autoSchedule&&!force)return null;
  var end=horizonEnd();
  if(!force&&window.__agSig===signature(end))return null;
  var r=reconcile(null,end);
  window.__agIssues=r.issues;
  window.__agSig=signature(end);
  if(r.created||r.removed||r.moved){
    saveDB();
    if(r.created){
      if(window.__appReady)toast('Agenda atualizada: '+plural(r.created,'aula gerada','aulas geradas')+' a partir do cadastro dos alunos.');
      else window.__agPending=(window.__agPending||0)+r.created;
    }
  }
  return r;
}

/* ---------- aluno → agenda ---------- */
function propagateName(s){
  Object.keys(db).forEach(function(k){
    if(k==='students'||!Array.isArray(db[k]))return;
    db[k].forEach(function(it){if(it&&typeof it==='object'&&it.studentId===s.id&&'studentName' in it)it.studentName=s.name});
  });
}
function cancelFutureManual(s,why){
  var t=todayISO(),n=0;
  db.classes.forEach(function(c){
    if(c.studentId===s.id&&c.date>=t&&c.status==='Agendada'&&!isAuto(c)){
      c.status='Cancelada';c.notes=(c.notes?c.notes+' · ':'')+why;c.updatedAt=now();n++;
    }
  });
  return n;
}
function onStudentChanged(b,s){
  var out={created:0,removed:0,moved:0,cancelled:0,issues:[]};
  if(b&&b.name!==s.name)propagateName(s);
  if(b&&isActive(b)&&!isActive(s))out.cancelled=cancelFutureManual(s,'Aluno '+String(s.status||'inativo').toLowerCase());
  if(b&&(b.teacher||'')!==(s.teacher||'')){
    var t=todayISO();
    db.classes.forEach(function(c){
      if(c.studentId===s.id&&c.date>=t&&c.status==='Agendada'&&(!c.teacher||c.teacher===b.teacher)){c.teacher=s.teacher||'';c.updatedAt=now()}
    });
  }
  var r=settings().autoSchedule?reconcile(s.id,horizonEnd()):{created:0,removed:0,moved:0,issues:[]};
  out.created=r.created;out.removed=r.removed;out.moved=r.moved;out.issues=r.issues;
  return out;
}
function summaryText(o){
  var p=[];
  if(o.created)p.push(plural(o.created,'aula gerada','aulas geradas'));
  if(o.moved)p.push(plural(o.moved,'aula reagendada','aulas reagendadas'));
  if(o.removed)p.push(plural(o.removed,'aula removida','aulas removidas'));
  if(o.cancelled)p.push(plural(o.cancelled,'aula cancelada','aulas canceladas'));
  var capIssues=(o.issues||[]).filter(function(x){return x.type==='cap'}).length;
  if(capIssues)p.push(plural(capIssues,'aula não gerada por falta de vaga','aulas não geradas por falta de vaga'));
  return p.length?'Agenda sincronizada: '+p.join(' · ')+'.':'';
}
var _saveStudent=window.saveStudent;
window.saveStudent=function(){
  var id=editingId,typed=String(($('fName')||{}).value||'').trim();
  var cur=id?sById(id):null,before=cur?JSON.parse(JSON.stringify(cur)):null;
  var ids={};db.students.forEach(function(s){ids[s.id]=1});
  var r;window.__agHold=true;
  try{r=_saveStudent.apply(this,arguments)}finally{window.__agHold=false}
  if(r===false)return r;
  try{
    var s=id?sById(id):null;
    if(!s){
      var fresh=db.students.filter(function(x){return !ids[x.id]});
      s=fresh.filter(function(x){return x.name===typed})[0]||fresh.sort(function(a,b){return String(b.createdAt).localeCompare(String(a.createdAt))})[0];
    }
    if(s){
      var o=onStudentChanged(before,s);
      saveDB();window.__agSig=signature(horizonEnd());renderAll();
      var msg=summaryText(o);
      toast((before?'Aluno atualizado com sucesso!':'Aluno cadastrado com sucesso!')+(msg?' '+msg:''));
    }
  }catch(e){console.error('Integração aluno → agenda:',e)}
  return r;
};
var _deleteStudent=window.deleteStudent;
window.deleteStudent=async function(id){
  var existed=!!sById(id);
  var r=await _deleteStudent.apply(this,arguments);
  try{
    if(existed&&!sById(id)){
      var t=todayISO(),nc=0,nm=0,sk=skipMap();
      db.classes=db.classes.filter(function(c){if(c.studentId===id&&c.date>=t&&c.status==='Agendada'){nc++;return false}return true});
      db.makeups=db.makeups.filter(function(m){if(m.studentId===id&&(m.status==='Pendente'||m.status==='Agendada')){nm++;return false}return true});
      Object.keys(sk).forEach(function(k){if(k.indexOf(id+'|')===0)delete sk[k]});
      window.__agSig=null;
      if(nc||nm){saveDB();renderAll();toast('Aluno excluído · '+plural(nc,'aula futura removida','aulas futuras removidas')+(nm?' · '+plural(nm,'reposição removida','reposições removidas'):'')+'.')}
    }
  }catch(e){console.error('Integração exclusão de aluno:',e)}
  return r;
};

/* ---------- reposições ↔ agenda ---------- */
function makeupFor(c){return db.makeups.find(function(m){return m.originalClassId===c.id})}
function syncClassFromMakeup(m){
  var c=db.classes.find(function(x){return x.makeupId===m.id});
  var want=(m.status==='Agendada'||m.status==='Realizada')&&m.newDate&&m.newTime;
  if(!want){
    if(c){if(c.status==='Agendada')db.classes=db.classes.filter(function(x){return x!==c});else delete c.makeupId}
    return;
  }
  var s=sById(m.studentId),moved=false;
  if(!c){c={id:uid('cls'),makeupId:m.id,auto:false,createdAt:now()};db.classes.push(c);moved=true}
  if(c.date!==m.newDate||c.time!==m.newTime)moved=true;
  c.date=m.newDate;c.time=m.newTime;c.studentId=m.studentId;c.studentName=s?s.name:(m.studentName||'');
  c.teacher=c.teacher||(s&&s.teacher)||'';
  c.status=m.status==='Realizada'?'Realizada':'Agendada';
  c.notes='Reposição'+(m.originalDate?' da aula de '+dateBR(m.originalDate):'');
  c.duration=c.duration||Number((db.settings&&db.settings.duration)||60);
  c.updatedAt=now();
  if(c.status==='Agendada'&&(moved||!c.equipmentId)){delete c.equipmentId;assignEquipment(c)}
}
function syncMakeupFromClass(c){
  var m=db.makeups.find(function(x){return x.id===c.makeupId});if(!m)return;
  if(c.status==='Realizada')m.status='Realizada';
  else if(c.status==='Agendada')m.status='Agendada';
  else if(c.status==='Cancelada'||c.status==='Falta'){m.status='Pendente';m.newDate='';m.newTime='';delete c.makeupId}
}
var _saveMakeup=window.saveMakeup;
window.saveMakeup=function(){
  var eid=editingId,sid=($('mkStudent')||{}).value,st=($('mkStatus')||{}).value,nd=($('mkNew')||{}).value,nt=($('mkTime')||{}).value;
  var prev=eid?db.makeups.find(function(x){return x.id===eid}):null,keepOrig=prev&&prev.originalClassId;
  if(sid&&(st==='Agendada'||st==='Realizada')&&(!nd||!nt)){toast('Informe a nova data e o novo horário para agendar a reposição.');return}
  if(sid&&st==='Agendada'&&nd&&nt){
    var linked=eid&&db.classes.find(function(x){return x.makeupId===eid});
    var cp=slotCapacity(nd,nt,linked&&linked.id);
    if(cp.capacity>0&&cp.full){toast('Horário lotado: '+cp.used+'/'+cp.capacity+' alunos. Escolha outro horário para a reposição.');return}
  }
  var ids={};db.makeups.forEach(function(x){ids[x.id]=1});
  var r=_saveMakeup.apply(this,arguments);
  try{
    var m=eid?db.makeups.find(function(x){return x.id===eid&&x!==prev}):db.makeups.find(function(x){return !ids[x.id]});
    if(m){if(keepOrig)m.originalClassId=keepOrig;syncClassFromMakeup(m);window.__agSig=null;saveDB();renderAll()}
  }catch(e){console.error('Integração reposição → agenda:',e)}
  return r;
};
var _completeMakeup=window.completeMakeup;
window.completeMakeup=function(id){
  var r=_completeMakeup.apply(this,arguments);
  try{var m=db.makeups.find(function(x){return x.id===id});if(m){syncClassFromMakeup(m);saveDB();renderAll()}}catch(e){console.error(e)}
  return r;
};
var _deleteMakeup=window.deleteMakeup;
window.deleteMakeup=async function(id){
  var r=await _deleteMakeup.apply(this,arguments);
  try{
    if(!db.makeups.some(function(x){return x.id===id})){
      var c=db.classes.find(function(x){return x.makeupId===id});
      if(c){if(c.status==='Agendada')db.classes=db.classes.filter(function(x){return x!==c});else delete c.makeupId;saveDB();renderAll()}
    }
  }catch(e){console.error(e)}
  return r;
};

/* ---------- aulas ---------- */
var _saveClass=window.saveClass;
window.saveClass=function(){
  var eid=editingId,prev=eid?classById(eid):null;
  var keep=prev?{makeupId:prev.makeupId,auto:isAuto(prev),date:prev.date,studentId:prev.studentId}:null;
  var ids={};db.classes.forEach(function(c){ids[c.id]=1});
  var r;window.__agHold=true;
  try{r=_saveClass.apply(this,arguments)}finally{window.__agHold=false}
  try{
    var c=eid?classById(eid):db.classes.find(function(x){return !ids[x.id]});
    var saved=c&&(eid?c!==prev:true);
    if(saved){
      if(keep&&keep.makeupId)c.makeupId=keep.makeupId;
      c.auto=false;
      if(keep&&keep.auto&&(keep.date!==c.date||keep.studentId!==c.studentId))skipMap()[keep.studentId+'|'+keep.date]=1;
      if(c.makeupId)syncMakeupFromClass(c);
      window.__agSig=null;saveDB();renderAll();
    }
  }catch(e){console.error('Integração aula:',e)}
  return r;
};
var _setStatus=window.setClassStatus;
window.setClassStatus=function(id,status){
  var r=_setStatus.apply(this,arguments);
  try{
    var c=classById(id);if(!c)return r;
    var hadLink=!!c.makeupId;
    if(c.makeupId){syncMakeupFromClass(c);saveDB();renderAll()}
    if((status==='Cancelada'||status==='Falta')&&c.studentId&&!hadLink&&!makeupFor(c))offerMakeup(c,status);
  }catch(e){console.error(e)}
  return r;
};
function offerMakeup(c,status){
  if(typeof iosConfirm!=='function')return;
  var nm=c.studentName||(sById(c.studentId)||{}).name||'o aluno';
  Promise.resolve(iosConfirm('Criar uma reposição pendente para '+nm+' referente à aula de '+dateBR(c.date)+'?',{title:'Reposição de aula',okLabel:'Criar reposição'})).then(function(ok){
    if(!ok)return;
    db.makeups.push({id:uid('mk'),studentId:c.studentId,studentName:nm,originalDate:c.date,originalClassId:c.id,newDate:'',newTime:'',status:'Pendente',notes:'Aula de '+dateBR(c.date)+' marcada como '+String(status).toLowerCase()+'.'});
    saveDB();renderAll();toast('Reposição pendente criada. Agende o novo horário em Reposições.');
  });
}
var _deleteClass=window.deleteClass;
window.deleteClass=async function(id){
  var c=classById(id),snap=c?JSON.parse(JSON.stringify(c)):null;
  var r;window.__agHold=true;
  try{r=await _deleteClass.apply(this,arguments)}finally{window.__agHold=false}
  try{
    if(snap&&!classById(id)){
      if(isAuto(snap)&&snap.studentId)skipMap()[snap.studentId+'|'+snap.date]=1;
      if(snap.makeupId){var m=db.makeups.find(function(x){return x.id===snap.makeupId});if(m&&m.status==='Agendada'){m.status='Pendente';m.newDate='';m.newTime=''}}
      window.__agSig=null;saveDB();renderAll();
    }
  }catch(e){console.error(e)}
  return r;
};
/* "Gerar aulas recorrentes" passa a usar a mesma regra da sincronização */
window.generateRecurringClasses=function(){
  var key=monthKey(currentMonth),first=key+'-01',last=endOfMonth(first),t=todayISO();
  var from=last<t?first:(first>t?first:t);
  var r=reconcile(null,last,{from:from,ignoreSkips:true});
  window.__agSig=null;
  if(r.created||r.removed||r.moved)saveDB();
  renderAll();
  var cap=r.issues.filter(function(x){return x.type==='cap'}).length;
  toast(r.created?plural(r.created,'aula gerada','aulas geradas')+' para '+monthLabel(currentMonth)+(cap?' · '+plural(cap,'sem vaga','sem vaga'):'')+'.':'Nenhuma nova aula foi necessária'+(cap?' · '+plural(cap,'sem vaga','sem vaga'):'')+'.');
};

/* ---------- renderização da Agenda ---------- */
var ag={day:null,student:'',teacher:'',status:'',slots:{}};
function statusCls(c){return c.status==='Realizada'?'ev-ok':c.status==='Cancelada'?'ev-cancel':c.status==='Falta'?'ev-miss':(c.makeupId?'ev-makeup':'')}
function filtered(list){
  return list.filter(function(c){
    return (!ag.student||c.studentId===ag.student)&&(!ag.teacher||(c.teacher||'')===ag.teacher)&&(!ag.status||c.status===ag.status);
  });
}
function stuLink(c){
  var s=c.studentId?sById(c.studentId):null,nm=esc(c.studentName||(s&&s.name)||'—');
  if(!s)return '<span title="Aluno removido do cadastro">'+nm+(c.studentId?' <span class="badge gray">removido</span>':'')+'</span>';
  return '<a href="#" class="stu-link" onclick="openStudentAgenda(\''+s.id+'\');return false">'+nm+'</a>';
}
function ensureScaffold(){
  var page=$('page-agenda'),cal=$('calendar');
  if(!page||!cal||$('agendaToolbar'))return;
  var card=cal.closest('.card');
  var tb=document.createElement('details');tb.id='agendaToolbar';tb.className='card panel agenda-toolbar';
  tb.innerHTML='<summary><span class="panel-title">Filtros e automação</span> <span class="badge gray" id="agToolbarInfo"></span></summary>'+
    '<div class="ag-filters">'+
    '<div class="field"><label for="agFStudent">Aluno</label><select id="agFStudent"></select></div>'+
    '<div class="field"><label for="agFTeacher">Professor</label><select id="agFTeacher"></select></div>'+
    '<div class="field"><label for="agFStatus">Status</label><select id="agFStatus"><option value="">Todos</option><option>Agendada</option><option>Realizada</option><option>Falta</option><option>Cancelada</option></select></div>'+
    '</div><div class="ag-actions"><label class="ios-switch-field ag-auto"><input type="checkbox" id="agAuto"> Gerar aulas automaticamente a partir do cadastro dos alunos</label>'+
    '<button type="button" class="btn small" id="agSyncBtn">Sincronizar mês</button></div>';
  card.parentNode.insertBefore(tb,card);
  var dp=document.createElement('div');dp.id='agendaDayPanel';dp.className='card panel section';card.parentNode.insertBefore(dp,card.nextSibling);
  var ip=document.createElement('details');ip.id='agendaIntegrity';ip.className='card panel section ag-integrity';dp.parentNode.insertBefore(ip,dp.nextSibling);
  $('agFStudent').addEventListener('change',function(){ag.student=this.value;renderAgenda()});
  $('agFTeacher').addEventListener('change',function(){ag.teacher=this.value;renderAgenda()});
  $('agFStatus').addEventListener('change',function(){ag.status=this.value;renderAgenda()});
  $('agAuto').addEventListener('change',function(){settings().autoSchedule=this.checked;saveDB();if(this.checked){window.__agSig=null;syncAll()}renderAgenda();toast(this.checked?'Geração automática de aulas ativada.':'Geração automática desativada. Use “Sincronizar mês” quando quiser gerar.')});
  $('agSyncBtn').addEventListener('click',function(){generateRecurringClasses()});
}
function fillToolbar(){
  var sS=$('agFStudent'),sT=$('agFTeacher');if(!sS||!sT)return;
  var ss=db.students.slice().sort(function(a,b){return String(a.name).localeCompare(String(b.name),'pt-BR')});
  sS.innerHTML='<option value="">Todos os alunos</option>'+ss.map(function(s){return '<option value="'+esc(s.id)+'">'+esc(s.name)+(isActive(s)?'':' ('+esc(s.status)+')')+'</option>'}).join('');
  sS.value=ag.student;if(sS.value!==ag.student){ag.student='';sS.value=''}
  sT.innerHTML='<option value="">Todos os professores</option>'+(db.teachers||[]).map(function(t){return '<option>'+esc(t)+'</option>'}).join('');
  sT.value=ag.teacher;if(sT.value!==ag.teacher){ag.teacher='';sT.value=''}
  $('agFStatus').value=ag.status;
  $('agAuto').checked=!!settings().autoSchedule;
  var nf=(ag.student?1:0)+(ag.teacher?1:0)+(ag.status?1:0),info=$('agToolbarInfo');
  if(info){info.className='badge '+(nf?'warn':'gray');info.textContent=(nf?plural(nf,'filtro ativo','filtros ativos'):'sem filtros')+' · automático '+(settings().autoSchedule?'ligado':'desligado')}
}
function birthdaysOn(d){
  var md=d.slice(5);
  return db.students.filter(function(s){return s.birth&&String(s.birth).slice(5,10)===md});
}
function renderCalendar(){
  var y=currentMonth.getFullYear(),m=currentMonth.getMonth(),key=y+'-'+pad(m+1);
  var title=$('calendarMonth');if(title)title.textContent=monthLabel(currentMonth);
  var cal=$('calendar');if(!cal)return;
  var first=new Date(y,m,1),start=(first.getDay()+6)%7,days=new Date(y,m+1,0).getDate(),total=Math.ceil((start+days)/7)*7;
  var all=filtered(db.classes),byDay={};
  all.forEach(function(c){(byDay[c.date]=byDay[c.date]||[]).push(c)});
  var html=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(function(x){return '<div class="calendar-week">'+x+'</div>'}).join('');
  var today=todayISO();
  for(var i=0;i<total;i++){
    var n=i-start+1,date=new Date(y,m,n),d=iso(date),other=date.getMonth()!==m;
    var ev=(byDay[d]||[]).slice().sort(dateTimeSort),bd=(!ag.student&&!ag.teacher&&!ag.status)||ag.student?birthdaysOn(d).filter(function(s){return !ag.student||s.id===ag.student}):[];
    var chips=ev.slice(0,3).map(function(c){
      return '<div class="event '+statusCls(c)+'" title="'+esc((c.studentName||'')+' · '+formatTimeRange(c.time||''))+'" onclick="event.stopPropagation();openClassModal(null,null,\''+c.id+'\')">'+esc(hhmm(c.time))+' · '+esc(c.studentName||'—')+'</div>';
    }).join('');
    var more=ev.length>3?'<div class="event ev-more">+'+(ev.length-3)+' aulas</div>':'';
    var dots=ev.slice(0,4).map(function(c){return '<i class="'+statusCls(c)+'"></i>'}).join('');
    html+='<div class="day-cell'+(other?' other':'')+(d===today?' today':'')+(d===ag.day?' sel':'')+'" data-date="'+d+'" onclick="selectAgendaDay(\''+d+'\')">'+
      '<div class="day-number">'+date.getDate()+'</div>'+
      (bd.length?'<span class="ag-bday" title="Aniversário: '+esc(bd.map(function(s){return s.name}).join(', '))+'">'+uiIcon('cake',13)+'</span>':'')+
      chips+more+(ev.length?'<div class="ag-dots">'+dots+'</div><div class="ag-num">'+ev.length+'</div>':'')+'</div>';
  }
  cal.innerHTML=html;
}
function pickDefaultDay(){
  var key=monthKey(currentMonth);
  if(ag.day&&ag.day.slice(0,7)===key)return;
  var t=todayISO();
  ag.day=t.slice(0,7)===key?t:key+'-01';
}
window.agSlotToggle=function(tm,open){ag.slots[ag.day+'|'+tm]=!!open};
function dayItem(c){
  var eq=c.equipmentId&&typeof equipmentById==='function'?equipmentById(c.equipmentId):null;
  var sub=[c.teacher||'Sem professor',eq?eq.name:(c.status==='Agendada'?'Sem equipamento':'')].filter(Boolean).join(' · ');
  var tags=classStatusBadge(c.status)+(c.makeupId?' <span class="badge info">Reposição</span>':'')+(c.experimental?' <span class="badge warn">Experimental</span>':'');
  var acts=(c.status==='Agendada'?'<button class="btn success small" onclick="setClassStatus(\''+c.id+'\',\'Realizada\')">Concluir</button><button class="btn small" onclick="setClassStatus(\''+c.id+'\',\'Falta\')">Falta</button><button class="btn small" onclick="setClassStatus(\''+c.id+'\',\'Cancelada\')">Cancelar</button>':'')+
    '<button class="btn small" onclick="openClassModal(null,null,\''+c.id+'\')">Editar</button>';
  return '<div class="calendar-event-card ag-item"><div class="who"><strong>'+stuLink(c)+'</strong><small class="muted">'+esc(sub)+'</small><div class="ag-tags">'+tags+'</div></div><div class="row-actions">'+acts+'</div></div>';
}
function dayPanel(){
  var el=$('agendaDayPanel');if(!el)return;
  var d=ag.day,t=todayISO();if(!d){el.innerHTML='';return}
  var list=filtered(db.classes.filter(function(c){return c.date===d})).sort(dateTimeSort);
  var head=WD[dow(d)]+', '+dateBR(d)+(d===t?' · hoje':'');
  var cap=Number(db.settings.capacity||0),groups={};
  list.forEach(function(c){var k=c.time||'—';(groups[k]=groups[k]||[]).push(c)});
  var times=Object.keys(groups).sort(),nd=new Date(),hm=pad(nd.getHours())+':'+pad(nd.getMinutes());
  var def=d===t?(times.filter(function(x){return x>=hm})[0]||times[times.length-1]):times[0],openAll=list.length<=6;
  var items=times.map(function(tm){
    var arr=groups[tm],act=arr.filter(function(x){return x.status!=='Cancelada'}).length,full=cap&&act>=cap;
    var key=d+'|'+tm,isOpen=key in ag.slots?ag.slots[key]:(openAll||tm===def);
    return '<details class="ag-slot"'+(isOpen?' open':'')+' ontoggle="agSlotToggle(\''+tm+'\',this.open)"><summary><b>'+esc(hhmm(tm))+'</b><span class="badge '+(full?'bad':'gray')+'">'+plural(act,'aluno','alunos')+(cap?' · '+act+'/'+cap:'')+'</span></summary>'+arr.map(dayItem).join('')+'</details>';
  }).join('');
  /* alunos previstos no cadastro para este dia que ainda não têm aula */
  var missing=[];
  if(d>=t&&!ag.status&&!ag.teacher){
    var haveIds={};db.classes.forEach(function(c){if(c.date===d&&c.studentId)haveIds[c.studentId]=1});
    missing=db.students.filter(function(s){return isActive(s)&&s.time&&stuDays(s).indexOf(String(dow(d)))>=0&&!haveIds[s.id]&&(!s.startDate||d>=s.startDate)&&(!ag.student||s.id===ag.student)});
  }
  var miss=missing.length?'<div class="ag-missing"><div class="panel-title" style="font-size:13px">Previstos no cadastro, sem aula neste dia</div>'+missing.map(function(s){
    return '<div class="calendar-event-card"><span class="time">'+esc(hhmm(s.time))+'</span><div class="who"><strong>'+stuLink({studentId:s.id,studentName:s.name})+'</strong><small class="muted">'+esc(s.teacher||'Sem professor')+'</small></div><button class="btn small" onclick="openClassModal(\''+d+'\',\''+s.id+'\')">Agendar</button></div>';
  }).join('')+'</div>':'';
  var bd=birthdaysOn(d).filter(function(s){return !ag.student||s.id===ag.student});
  var bday=bd.length?'<div class="ag-bd-row">'+uiIcon('cake',16)+'<span>Aniversário: '+bd.map(function(s){return '<a href="#" class="stu-link" onclick="openStudentAgenda(\''+s.id+'\');return false">'+esc(s.name)+'</a>'}).join(', ')+'</span></div>':'';
  el.innerHTML='<div class="panel-head"><div><div class="panel-title">'+esc(head)+'</div><div class="muted" style="font-size:12px">'+plural(list.length,'aula','aulas')+(ag.student||ag.teacher||ag.status?' (filtro ativo)':'')+'</div></div>'+
    '<button class="btn primary small" onclick="openClassModal(\''+d+'\')">Agendar neste dia</button></div>'+bday+
    '<div class="ag-slotlist">'+(items||'<div class="empty">Nenhuma aula neste dia.</div>')+'</div>'+miss;
}
function integrityIssues(){
  var out=[],t=todayISO();
  db.students.filter(isActive).forEach(function(s){
    var days=stuDays(s);
    if(!s.time||!days.length){out.push({sid:s.id,msg:'<b>'+esc(s.name)+'</b>: defina '+(!s.time?'o horário':'os dias da semana')+' no cadastro para gerar aulas.',act:'Editar aluno',fn:'openStudentModal(\''+s.id+'\')'});return}
    var bad=days.filter(function(d){return getHourDays(s.time).indexOf(String(d))<0});
    if(bad.length)out.push({sid:s.id,msg:'<b>'+esc(s.name)+'</b>: o horário '+esc(hhmm(s.time))+' não está liberado para '+bad.map(function(d){return WDS[d]}).join(', ')+' em Horários.',act:'Ver horários',fn:'goPage(\'hours\')'});
  });
  var capBy={};
  (window.__agIssues||[]).filter(function(x){return x.type==='cap'}).forEach(function(x){(capBy[x.studentId]=capBy[x.studentId]||[]).push(x)});
  Object.keys(capBy).forEach(function(id){
    var s=sById(id);if(!s)return;var arr=capBy[id];
    out.push({sid:id,msg:'<b>'+esc(s.name)+'</b>: '+plural(arr.length,'aula não pôde ser gerada','aulas não puderam ser geradas')+' por lotação às '+esc(hhmm(arr[0].time))+' (primeira: '+dateBR(arr[0].date)+').',act:'Ver dia',fn:'selectAgendaDay(\''+arr[0].date+'\')'});
  });
  var orphans=db.classes.filter(function(c){return c.date>=t&&c.status==='Agendada'&&c.studentId&&!sById(c.studentId)});
  if(orphans.length)out.push({msg:plural(orphans.length,'aula futura pertence','aulas futuras pertencem')+' a alunos que não existem mais no cadastro.',act:'Remover',fn:'removeOrphanClasses()'});
  var noEq=db.classes.filter(function(c){return c.date>=t&&c.status==='Agendada'&&!c.equipmentId}).length;
  if(noEq)out.push({msg:plural(noEq,'aula futura está','aulas futuras estão')+' sem equipamento definido (sem vaga no rodízio ou criadas antes da integração).',act:'Abrir rodízio',fn:'goPage(\'equipment\')'});
  return out;
}
function integrityPanel(){
  var el=$('agendaIntegrity');if(!el)return;
  var is=integrityIssues(),open=el.open;
  el.innerHTML='<summary><span class="panel-title">Verificação de integração</span> <span class="badge '+(is.length?'warn':'ok')+'">'+(is.length?plural(is.length,'ponto de atenção','pontos de atenção'):'Tudo integrado')+'</span></summary>'+
    (is.length?'<div class="calendar-list">'+is.slice(0,15).map(function(x){return '<div class="calendar-event-card"><div class="who" style="white-space:normal">'+x.msg+'</div><button class="btn small" onclick="'+x.fn+'">'+x.act+'</button></div>'}).join('')+(is.length>15?'<div class="muted" style="font-size:12px">+'+(is.length-15)+' itens</div>':'')+'</div>':'<div class="muted" style="margin-top:8px;font-size:13px">Alunos ativos, horários, equipamentos e agenda estão consistentes.</div>');
  el.open=open;
}
window.removeOrphanClasses=function(){
  var t=todayISO(),n=0;
  db.classes=db.classes.filter(function(c){if(c.date>=t&&c.status==='Agendada'&&c.studentId&&!sById(c.studentId)){n++;return false}return true});
  saveDB();renderAll();toast(plural(n,'aula removida','aulas removidas')+'.');
};
window.selectAgendaDay=function(d){
  ag.day=d;
  var m=at(d);
  if(m.getFullYear()!==currentMonth.getFullYear()||m.getMonth()!==currentMonth.getMonth())currentMonth=new Date(m.getFullYear(),m.getMonth(),1);
  renderAgenda();
  var p=$('agendaDayPanel');if(p&&p.scrollIntoView)p.scrollIntoView({behavior:'smooth',block:'nearest'});
};
window.renderAgenda=function(){
  if(!ready())return;
  ensureV7Data();
  try{syncAll()}catch(e){console.error('Sincronização da agenda:',e)}
  ensureScaffold();fillToolbar();pickDefaultDay();
  renderCalendar();dayPanel();integrityPanel();
  var key=monthKey(currentMonth),rows=filtered(classesForMonth(key));
  var cnt=$('classCount');if(cnt)cnt.textContent=plural(rows.length,'aula','aulas');
  var tb=$('classesTable');
  if(tb)tb.innerHTML=rows.map(function(c){
    var tag=(c.makeupId?' <span class="badge info">Reposição</span>':'')+(c.experimental?' <span class="badge warn">Experimental</span>':'');
    return '<tr><td>'+dateBR(c.date)+'<div class="muted" style="font-size:11px">'+WDS[dow(c.date)]+'</div></td><td><strong>'+esc(formatTimeRange(c.time||''))+'</strong></td><td>'+stuLink(c)+tag+'</td><td>'+esc(c.teacher||'—')+'</td><td>'+classStatusBadge(c.status)+'</td><td><div class="row-actions">'+
      (c.status==='Agendada'?'<button class="btn success small" onclick="setClassStatus(\''+c.id+'\',\'Realizada\')">Concluir</button><button class="btn small" onclick="setClassStatus(\''+c.id+'\',\'Cancelada\')">Cancelar</button>':'')+
      '<button class="btn small" onclick="openClassModal(null,null,\''+c.id+'\')">Editar</button><button class="btn danger small icon ios-delete-button" onclick="deleteClass(\''+c.id+'\')" title="Excluir" aria-label="Excluir">'+trashIcon(15)+'</button></div></td></tr>';
  }).join('')||'<tr><td colspan="6"><div class="empty">Nenhuma aula '+(ag.student||ag.teacher||ag.status?'com este filtro':'cadastrada')+' neste mês.</div></td></tr>';
};

/* ---------- Agenda do aluno (modal) + cartões de alunos ---------- */
var stuMonth=null;
function stuAgendaBody(id){
  var s=sById(id);if(!s)return '<div class="empty">Aluno não encontrado.</div>';
  var t=todayISO(),cls=db.classes.filter(function(c){return c.studentId===id}).sort(dateTimeSort);
  var done=cls.filter(function(c){return c.status==='Realizada'}).length,miss=cls.filter(function(c){return c.status==='Falta'}).length,canc=cls.filter(function(c){return c.status==='Cancelada'}).length;
  var up=cls.filter(function(c){return c.date>=t&&c.status==='Agendada'});
  var past=cls.filter(function(c){return c.date<t||c.status!=='Agendada'}).slice(-5).reverse();
  var y=stuMonth.getFullYear(),m=stuMonth.getMonth(),first=new Date(y,m,1),start=(first.getDay()+6)%7,days=new Date(y,m+1,0).getDate(),total=Math.ceil((start+days)/7)*7;
  var by={};cls.forEach(function(c){(by[c.date]=by[c.date]||[]).push(c)});
  var grid=['S','T','Q','Q','S','S','D'].map(function(x){return '<div class="calendar-week">'+x+'</div>'}).join('');
  for(var i=0;i<total;i++){
    var dt=new Date(y,m,i-start+1),d=iso(dt),other=dt.getMonth()!==m,ev=by[d]||[];
    var sched=isActive(s)&&s.time&&stuDays(s).indexOf(String(dt.getDay()))>=0&&d>=t&&!ev.length;
    grid+='<div class="ag-mini'+(other?' other':'')+(d===t?' today':'')+'" onclick="closeModal();openClassModal(\''+d+'\',\''+id+'\')" title="'+(ev.length?esc(ev.map(function(c){return hhmm(c.time)+' '+c.status}).join(' · ')):'Agendar aula')+'"><span>'+dt.getDate()+'</span>'+(ev.length?'<i class="'+statusCls(ev[0])+'"></i>':(sched?'<i class="ev-pending"></i>':''))+'</div>';
  }
  var rows=function(arr,empty){return arr.length?arr.map(function(c){return '<tr><td>'+dateBR(c.date)+' <span class="muted">'+WDS[dow(c.date)]+'</span></td><td>'+esc(hhmm(c.time))+'</td><td>'+classStatusBadge(c.status)+(c.makeupId?' <span class="badge info">Reposição</span>':'')+'</td><td><button class="btn small" onclick="closeModal();openClassModal(null,null,\''+c.id+'\')">Editar</button></td></tr>'}).join(''):'<tr><td colspan="4"><div class="empty">'+empty+'</div></td></tr>'};
  return '<div class="ag-stu-head">'+studentStatusBadge(s.status)+' <span class="badge gray">'+esc(daysLabel(s.days))+'</span> <span class="badge gray">'+esc(s.time?formatTimeRange(s.time):'Sem horário')+'</span> <span class="badge gray">'+esc(s.teacher||'Sem professor')+'</span></div>'+
    '<div class="ag-kpis"><div class="ag-kpi"><b>'+up.length+'</b><small>Próximas</small></div><div class="ag-kpi"><b>'+done+'</b><small>Realizadas</small></div><div class="ag-kpi"><b>'+miss+'</b><small>Faltas</small></div><div class="ag-kpi"><b>'+canc+'</b><small>Canceladas</small></div></div>'+
    '<div class="calendar-head" style="margin-top:14px"><button class="btn small" onclick="stuAgNav(\''+id+'\',-1)" aria-label="Mês anterior">‹</button><strong>'+esc(monthLabel(stuMonth))+'</strong><button class="btn small" onclick="stuAgNav(\''+id+'\',1)" aria-label="Próximo mês">›</button></div>'+
    '<div class="calendar-grid ag-mini-grid">'+grid+'</div><div class="ag-legend"><span><i class="ev-pending"></i> previsto</span><span><i></i> agendada</span><span><i class="ev-ok"></i> realizada</span><span><i class="ev-miss"></i> falta</span><span><i class="ev-cancel"></i> cancelada</span></div>'+
    '<div class="panel-title" style="margin:14px 0 8px">Próximas aulas</div><div class="table-wrap"><table><tbody>'+rows(up.slice(0,8),'Nenhuma aula futura. Use “Sincronizar” ou agende manualmente.')+'</tbody></table></div>'+
    '<div class="panel-title" style="margin:14px 0 8px">Histórico recente</div><div class="table-wrap"><table><tbody>'+rows(past,'Sem histórico ainda.')+'</tbody></table></div>'+
    '<div class="ag-stu-actions"><button class="btn primary small" onclick="closeModal();openClassModal(null,\''+id+'\')">Agendar aula</button><button class="btn small" onclick="stuAgSync(\''+id+'\')">Sincronizar com o cadastro</button><button class="btn small" onclick="closeModal();openStudentModal(\''+id+'\')">Editar cadastro</button></div>';
}
window.openStudentAgenda=function(id){
  var s=sById(id);if(!s)return;
  stuMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1);
  openModal('Agenda — '+s.name,stuAgendaBody(id),closeModal);
  var sb=$('modalSave'),cb=document.querySelector('#modalFoot .btn:not(#modalSave)');
  if(sb){sb.dataset.agDefault=sb.innerHTML;sb.dataset.agLabel='1';sb.innerHTML='Fechar'}
  if(cb){cb.style.display='none';cb.dataset.agHidden='1'}
};
var _openModal=window.openModal;
window.openModal=function(){
  var sb=$('modalSave'),cb=document.querySelector('#modalFoot .btn:not(#modalSave)');
  if(sb&&sb.dataset.agLabel){sb.innerHTML=sb.dataset.agDefault;delete sb.dataset.agLabel;delete sb.dataset.agDefault}
  if(cb&&cb.dataset.agHidden){cb.style.display='';delete cb.dataset.agHidden}
  return _openModal.apply(this,arguments);
};
window.stuAgNav=function(id,delta){
  stuMonth=new Date(stuMonth.getFullYear(),stuMonth.getMonth()+delta,1);
  var b=$('modalBody');if(b)b.innerHTML=stuAgendaBody(id);
};
window.stuAgSync=function(id){
  var s=sById(id);if(!s)return;
  var end=horizonEnd();
  if(stuMonth){var e2=iso(new Date(stuMonth.getFullYear(),stuMonth.getMonth()+1,0,12));if(e2>end&&e2<=addD(todayISO(),366))end=e2}
  var r=reconcile(id,end,{ignoreSkips:true});window.__agSig=null;
  if(r.created||r.removed||r.moved)saveDB();
  var b=$('modalBody');if(b)b.innerHTML=stuAgendaBody(id);
  renderAll();toast(summaryText(r)||'A agenda deste aluno já está de acordo com o cadastro.');
};
var _renderStudents=window.renderStudents;
window.renderStudents=function(){
  var r=_renderStudents.apply(this,arguments);
  try{
    var t=todayISO();
    document.querySelectorAll('#studentsGrid .student-cg').forEach(function(card){
      var b=card.querySelector('button[onclick^="openStudentModal"]');if(!b||card.querySelector('.ag-stu-btn'))return;
      var m=/'([^']+)'/.exec(b.getAttribute('onclick')||'');if(!m)return;
      var id=m[1],s=sById(id);if(!s)return;
      var actions=card.querySelector('.cg-actions'),sched=actions&&actions.querySelector('button[onclick^="openClassModal"]');
      if(sched){
        var nb=document.createElement('button');nb.type='button';nb.className='btn small icon ag-stu-btn';nb.title='Agenda do aluno';nb.setAttribute('aria-label','Agenda de '+s.name);nb.setAttribute('onclick',"openStudentAgenda('"+id+"')");nb.innerHTML=uiIcon('calendar',17);
        actions.insertBefore(nb,sched);
      }
      if(isActive(s)){
        var has=db.classes.some(function(c){return c.studentId===id&&c.date>=t&&c.status==='Agendada'});
        var chips=card.querySelector('.cg-chips');
        if(chips&&!has)chips.insertAdjacentHTML('beforeend','<span class="badge warn" title="Nenhuma aula futura agendada">Sem aulas futuras</span>');
      }
    });
  }catch(e){console.error(e)}
  return r;
};

/* ---------- gatilhos: abrir o app, voltar ao app, virar o dia ---------- */
var _rcp=window.renderCurrentPage;
window.renderCurrentPage=function(p){
  try{if(ready())syncAll()}catch(e){console.error('Sincronização da agenda:',e)}
  return _rcp.apply(this,arguments);
};
function boot(){
  if(!window.__appReady||!ready()){return false}
  var r=syncAll();
  if(r&&(r.created||r.removed||r.moved))renderAll();
  if(window.__agPending){toast('Agenda atualizada: '+plural(window.__agPending,'aula gerada','aulas geradas')+' a partir do cadastro dos alunos.');window.__agPending=0}
  return true;
}
var tries=0,iv=setInterval(function(){if(boot()||++tries>40)clearInterval(iv)},250);
var lastDay=todayISO();
function dayCheck(){
  if(!ready())return;
  var t=todayISO();
  if(t!==lastDay){lastDay=t;window.__agSig=null;ag.day=null;var r=syncAll();renderAll()}
}
window.v123Agenda={syncAll:syncAll,reconcile:reconcile,horizonEnd:horizonEnd,integrityIssues:integrityIssues};
document.addEventListener('visibilitychange',function(){if(!document.hidden)dayCheck()});
window.addEventListener('focus',dayCheck);
setInterval(dayCheck,60000);
})();
