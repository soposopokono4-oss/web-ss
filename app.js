const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const store={get(k){try{return JSON.parse(localStorage.getItem('smartstudy_'+k))||[]}catch{return[]}},set(k,v){localStorage.setItem('smartstudy_'+k,JSON.stringify(v))}};
let schedules=store.get('schedules'),tasks=store.get('tasks');
let currentUser=null, authMode='login', remoteReady=false;
const apiUrl=window.SMARTSTUDY_API||'./api/index.php';
async function api(action, payload={}) {
  const response=await fetch(apiUrl+'?action='+encodeURIComponent(action),{
    method: action==='me'||action==='data'?'GET':'POST',
    credentials:'same-origin',
    headers:{'Content-Type':'application/json'},
    body: action==='me'||action==='data'?undefined:JSON.stringify(payload)
  });
  const data=await response.json().catch(()=>({error:'Respons server tidak valid.'}));
  if(!response.ok) throw new Error(data.error||'Permintaan gagal.');
  return data;
}
async function syncRemote(){
  if(!currentUser)return;
  try{await api('saveData',{schedules,tasks});}catch(e){toast('Gagal sinkron: '+e.message);}
}
async function loadRemote(){
  const data=await api('data');
  schedules=Array.isArray(data.schedules)?data.schedules:[];
  tasks=Array.isArray(data.tasks)?data.tasks:[];
  store.set('schedules',schedules);store.set('tasks',tasks);renderAll();
}
function updateAccountUI(){
  $('#accountLabel').textContent=currentUser?currentUser.name:'Mode lokal';
  $('#authOpenBtn').textContent=currentUser?'Akun':'Masuk / Daftar';
  $('#logoutBtn').hidden=!currentUser;
  $('#authTitle').textContent=currentUser?'Akun SmartStudy':(authMode==='login'?'Selamat datang!':'Buat akun SmartStudy');
  $('#authName').parentElement.hidden=authMode!=='register';
  $('#authSubmit').textContent=authMode==='login'?'Masuk':'Buat akun';
  $$('.auth-tab').forEach(b=>b.classList.toggle('active',b.dataset.authMode===authMode));
}
async function initializeAccount(){
  try{const data=await api('me');if(data.user){currentUser=data.user;await loadRemote();}}
  catch(e){/* server belum disiapkan: mode lokal tetap berjalan */}
  updateAccountUI();
}

const days=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
// Tema terang/gelap tersimpan di perangkat pengguna.
const themeRoot=document.documentElement;
function applyTheme(theme){const dark=theme==='dark';themeRoot.dataset.theme=dark?'dark':'light';const icon=$('#themeIcon'),toggle=$('#themeToggle');if(icon)icon.textContent=dark?'☀️':'🌙';if(toggle){toggle.setAttribute('aria-label',dark?'Aktifkan tema terang':'Aktifkan tema gelap');toggle.title=dark?'Ganti ke tema terang':'Ganti ke tema gelap';}const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=dark?'#171725':'#635bff';}
applyTheme(localStorage.getItem('smartstudy_theme')||'light');
$('#themeToggle').addEventListener('click',()=>{const next=themeRoot.dataset.theme==='dark'?'light':'dark';localStorage.setItem('smartstudy_theme',next);applyTheme(next);toast(next==='dark'?'Tema gelap diaktifkan.':'Tema terang diaktifkan.');});

function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function toast(msg){let t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove('show'),2300)}
function go(view){$$('.view').forEach(v=>v.classList.toggle('active',v.id===view));$$('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.view===view));$('#pageTitle').textContent=({dashboard:'Dashboard',schedule:'Jadwal Belajar',tasks:'Manajemen Tugas',recommendations:'Rekomendasi Belajar',assistant:'AI Study Assistant',install:'Install Aplikasi',developers:'Tim Pengembang'})[view];$('.sidebar').classList.remove('open');window.scrollTo({top:0,behavior:'smooth'});}
$$('.nav-link').forEach(b=>b.addEventListener('click',()=>go(b.dataset.view)));
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
$('#menuToggle').addEventListener('click',()=>$('.sidebar').classList.toggle('open'));
$('#todayLabel').textContent=new Intl.DateTimeFormat('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date()).toUpperCase();
function renderSchedules(){
 $('#scheduleCount').textContent=schedules.length+' jadwal';
 $('#scheduleList').innerHTML=schedules.length?schedules.map(x=>`<div class="list-item"><div class="item-main"><b>${esc(x.subject)}</b><p>📅 ${esc(x.day)} · ⏰ ${esc(x.time)} · ${esc(x.duration)}${x.note?' · '+esc(x.note):''}</p></div><div class="item-actions"><button class="small-btn delete" data-del-s="${x.id}">Hapus</button></div></div>`).join(''):'<div class="empty-state">Belum ada jadwal belajar. Tambahkan jadwal pertamamu!</div>';
 $('#dashboardSchedules').innerHTML=schedules.length?schedules.slice(0,3).map(x=>`<div class="list-item"><div class="item-main"><b>${esc(x.subject)}</b><p>${esc(x.day)} · ${esc(x.time)} · ${esc(x.duration)}</p></div></div>`).join(''):'<div class="empty-state">Belum ada jadwal. Yuk, buat rencana belajarmu!</div>';
 $$('[data-del-s]').forEach(b=>b.onclick=()=>{schedules=schedules.filter(x=>x.id!==b.dataset.delS);store.set('schedules',schedules);syncRemote();renderAll();toast('Jadwal dihapus.')});
}
function renderTasks(){
 let filter=$('#taskFilter').value, shown=tasks.filter(t=>filter==='all'||(filter==='done'?t.done:!t.done));
 $('#taskList').innerHTML=shown.length?shown.map(t=>`<div class="list-item"><div class="item-main"><b>${esc(t.title)}</b><p>${esc(t.subject)} · Tenggat: ${esc(t.due)} · <span class="priority ${t.priority==='Tinggi'?'high':t.priority==='Rendah'?'low':''}">${esc(t.priority)}</span>${t.description?' · '+esc(t.description):''}</p></div><div class="item-actions"><button class="small-btn ${t.done?'':'done'}" data-toggle="${t.id}">${t.done?'↶ Batal':'✓ Selesai'}</button><button class="small-btn delete" data-del-t="${t.id}">Hapus</button></div></div>`).join(''):'<div class="empty-state">Tidak ada tugas pada kategori ini.</div>';
 $('#dashboardTasks').innerHTML=tasks.filter(t=>!t.done).sort((a,b)=>a.due.localeCompare(b.due)).slice(0,3).map(t=>`<div class="list-item"><div class="item-main"><b>${esc(t.title)}</b><p>${esc(t.subject)} · Tenggat ${esc(t.due)}</p></div><span class="priority ${t.priority==='Tinggi'?'high':''}">${esc(t.priority)}</span></div>`).join('')||'<div class="empty-state">Belum ada tugas aktif. Semua aman!</div>';
 $$('[data-toggle]').forEach(b=>b.onclick=()=>{tasks=tasks.map(t=>t.id===b.dataset.toggle?{...t,done:!t.done}:t);store.set('tasks',tasks);syncRemote();renderAll();toast('Status tugas diperbarui.')});
 $$('[data-del-t]').forEach(b=>b.onclick=()=>{tasks=tasks.filter(t=>t.id!==b.dataset.delT);store.set('tasks',tasks);syncRemote();renderAll();toast('Tugas dihapus.')});
 let done=tasks.filter(t=>t.done).length,pct=tasks.length?Math.round(done/tasks.length*100):0;
 $('#statSchedules').textContent=schedules.length;$('#statTasks').textContent=tasks.filter(t=>!t.done).length;$('#statDone').textContent=done;$('#statProgress').textContent=pct+'%';$('#ringValue').textContent=pct+'%';$('#progressRing').style.background=`conic-gradient(var(--purple) ${pct*3.6}deg,#eeedff 0deg)`;$('#progressCaption').textContent=tasks.length?`${done} dari ${tasks.length} tugas telah selesai.`:'Mulai kerjakan tugas pertamamu.';
}
function renderAll(){renderSchedules();renderTasks()}
$('#scheduleForm').addEventListener('submit',e=>{e.preventDefault();let f=new FormData(e.target);schedules.push({id:crypto.randomUUID(),subject:f.get('subject'),day:f.get('day'),time:f.get('time'),duration:f.get('duration'),note:f.get('note')});store.set('schedules',schedules);syncRemote();e.target.reset();renderAll();toast('Jadwal berhasil ditambahkan!')});
$('#taskForm').addEventListener('submit',e=>{e.preventDefault();let f=new FormData(e.target);tasks.push({id:crypto.randomUUID(),title:f.get('title'),subject:f.get('subject'),due:f.get('due'),priority:f.get('priority'),description:f.get('description'),done:false});store.set('tasks',tasks);syncRemote();e.target.reset();renderAll();toast('Tugas berhasil dicatat!')});
$('#taskFilter').addEventListener('change',renderTasks);
const tips={
 'Matematika':{mudah:['Pahami definisi dan contoh dasar sebelum mengerjakan soal.','Kerjakan 3–5 soal sederhana dan periksa langkahnya.'],sedang:['Pelajari satu tipe soal, lalu coba variasi tingkat menengah.','Tuliskan rumus penting beserta kapan rumus digunakan.'],sulit:['Pecah soal kompleks menjadi beberapa langkah kecil.','Bandingkan beberapa metode penyelesaian dan evaluasi kesalahan.']},
 'Bahasa Indonesia':{mudah:['Baca teks pendek dan tandai gagasan utamanya.','Catat kosakata atau istilah yang belum dipahami.'],sedang:['Latih identifikasi struktur teks dan kaidah kebahasaan.','Buat ringkasan dengan bahasamu sendiri.'],sulit:['Bandingkan sudut pandang dan kekuatan argumen dalam teks.','Susun analisis dengan bukti kutipan yang relevan.']},
 'Bahasa Inggris':{mudah:['Pelajari 5 kosakata baru dalam konteks kalimat.','Dengarkan materi singkat dan ulangi pengucapannya.'],sedang:['Latih grammar melalui contoh kalimat sehari-hari.','Baca satu paragraf lalu tulis ringkasannya.'],sulit:['Baca artikel lebih panjang dan identifikasi ide tersirat.','Latih menulis paragraf dengan struktur yang jelas.']},
 'Informatika':{mudah:['Kenali istilah dan fungsi komponen utama.','Buat peta konsep dari materi yang dipelajari.'],sedang:['Praktikkan konsep dengan contoh kecil.','Jelaskan kembali alur kerja menggunakan diagram.'],sulit:['Kerjakan proyek mini dan dokumentasikan prosesnya.','Uji solusi dengan beberapa kasus dan perbaiki kesalahan.']}
};
$('#recommendForm').addEventListener('submit',e=>{e.preventDefault();let s=$('#recSubject').value,l=$('#recLevel').value;let generic={mudah:['Baca ringkasan materi selama 10 menit.','Buat 5 kartu istilah penting dan pahami artinya.'],sedang:['Bagi materi menjadi beberapa subtopik kecil.','Kerjakan latihan, lalu catat bagian yang masih membingungkan.'],sulit:['Mulai dari konsep prasyarat sebelum masuk ke materi inti.','Gunakan latihan bertahap dan evaluasi proses berpikirmu.']};let arr=(tips[s]||{})[l]||generic[l];$('#recommendResult').innerHTML=`<article class="recommend-card"><span class="recommend-icon">🎯</span><span class="eyebrow">RENCANA BELAJAR</span><h3>${esc(s)} · Tingkat ${esc(l)}</h3><p>Strategi yang bisa kamu coba pada sesi belajar berikutnya:</p><ul>${arr.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></article><article class="recommend-card"><span class="recommend-icon">⏱️</span><h3>Ritme belajar yang disarankan</h3><p>Mulai dengan 25 menit fokus, lalu istirahat 5 menit. Setelah empat sesi, ambil istirahat lebih panjang.</p><p><b>Target:</b> akhiri sesi dengan menulis 2 hal yang sudah dipahami dan 1 hal yang ingin ditanyakan.</p></article>`});
function answer(q){let s=q.toLowerCase();if(s.includes('fotosintesis'))return 'Fotosintesis adalah proses tumbuhan membuat makanan dengan bantuan cahaya matahari. Secara umum, tumbuhan menggunakan air dan karbon dioksida untuk menghasilkan glukosa dan oksigen. Klorofil pada daun membantu menangkap energi cahaya.\\n\\nIngat: cahaya + air + karbon dioksida → glukosa + oksigen.';
if(s.includes('persamaan linear')||s.includes('linear'))return 'Persamaan linear adalah persamaan dengan variabel berpangkat satu. Contoh: 2x + 3 = 9.\\n\\nLangkah: kurangi kedua ruas dengan 3 sehingga 2x = 6, lalu bagi kedua ruas dengan 2. Jadi x = 3. Kuncinya, lakukan operasi yang sama pada kedua ruas.';
if(s.includes('html')||s.includes('css')||s.includes('javascript'))return 'HTML, CSS, dan JavaScript punya peran berbeda dalam website:\\n• HTML: menyusun struktur dan konten.\\n• CSS: mengatur tampilan, warna, dan layout.\\n• JavaScript: menambahkan interaksi dan logika.\\n\\nIbarat rumah: HTML adalah kerangka, CSS adalah desain interior, dan JavaScript membuat fitur rumah bekerja.';
if(s.includes('database'))return 'Database adalah tempat menyimpan data secara terstruktur agar mudah dicari, dikelola, dan diperbarui. Contohnya, aplikasi perpustakaan menyimpan data buku, anggota, dan peminjaman dalam tabel yang saling berhubungan.';
if(s.includes('jaringan'))return 'Jaringan komputer adalah kumpulan perangkat yang saling terhubung untuk bertukar data dan berbagi sumber daya. Contohnya LAN untuk area lokal dan WAN untuk area geografis yang lebih luas.';
return 'Aku belum punya penjelasan khusus untuk topik itu di mode demo. Coba tulis kata kunci yang lebih spesifik, misalnya “fotosintesis”, “persamaan linear”, “HTML CSS JavaScript”, “database”, atau “jaringan komputer”. Untuk jawaban AI yang lebih luas, aplikasi perlu dihubungkan ke layanan AI melalui backend yang aman.'}
async function sendChat(q){if(!q.trim())return;let box=$('#chatMessages');box.insertAdjacentHTML('beforeend',`<div class="message user">${esc(q)}</div>`);$('#chatInput').value='';box.scrollTop=box.scrollHeight;
  let reply;
  if(currentUser){try{let result=await api('askAI',{question:q});reply=result.answer;}catch(e){reply='Layanan AI belum siap: '+e.message+' Kamu masih bisa memakai jawaban demo untuk topik yang tersedia.\n\n'+answer(q);}}
  else reply=answer(q);
  box.insertAdjacentHTML('beforeend',`<div class="message bot">${esc(reply)}</div>`);box.scrollTop=box.scrollHeight;
}
$('#chatForm').addEventListener('submit',e=>{e.preventDefault();sendChat($('#chatInput').value)});
$$('[data-prompt]').forEach(b=>b.addEventListener('click',()=>sendChat(b.dataset.prompt)));
renderAll();
let deferredPrompt;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').hidden=false;$('#installHint').textContent='Perangkat ini mendukung pemasangan langsung. Tekan tombol Install Aplikasi.';$('#installPageBtn').textContent='⬇ Install Aplikasi Sekarang'});
async function installSmartStudy(){if(!deferredPrompt){const isAndroid=/Android/i.test(navigator.userAgent);toast(isAndroid?'Di Chrome Android: tekan ⋮ lalu pilih “Install aplikasi” atau “Tambahkan ke layar utama”.':'Buka menu browser lalu pilih Install app / Tambahkan ke layar utama.');$('#installHint').textContent=isAndroid?'Chrome Android: buka menu ⋮ → Install aplikasi / Tambahkan ke layar utama. Pastikan website memakai HTTPS.':'Jika tombol belum tersedia, buka menu browser lalu pilih Install app atau Tambahkan ke layar utama. Gunakan HTTPS.';return}deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('#installBtn').hidden=true;$('#installHint').textContent='Jika belum terpasang, coba lagi melalui menu browser.'}
$('#installBtn').addEventListener('click',installSmartStudy);
$('#installPageBtn').addEventListener('click',installSmartStudy);
window.addEventListener('appinstalled',()=>{toast('SmartStudy berhasil dipasang!');$('#installBtn').hidden=true;$('#installPageBtn').textContent='Aplikasi sudah terpasang'});
if('serviceWorker'in navigator && location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
