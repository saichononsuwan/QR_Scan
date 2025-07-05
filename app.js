const LIFF_ID = "YOUR_LIFF_ID";
const GAS_URL = "https://script.google.com/macros/s/AKfycbxj4m10YRPpvH5gBDImqgPi97j2S8p4srKGgmaQCMNMsKVPjvv7CZCUXknHdtb8N3tD/exec";

async function main() {
  await liff.init({ liffId: LIFF_ID });
  document.querySelectorAll('#menu button').forEach(btn => {
    btn.onclick = () => loadPage(btn.dataset.page);
  });
  const page = new URLSearchParams(location.search).get("page") || "scan";
  loadPage(page);
}

function loadPage(page) {
  const root = document.getElementById('page');
  root.innerHTML = '';
  if (page === 'scan') renderScan(root);
  if (page === 'history') renderHistory(root);
  if (page === 'redeem') renderRedeem(root);
  if (page === 'help') renderHelp(root);
}

function renderScan(root) {
  const btn = document.createElement('button');
  btn.textContent = "เริ่มสแกน QR";
  btn.onclick = scanQR;
  root.appendChild(btn);
}

async function scanQR() {
  const profile = await liff.getProfile();
  const result = await liff.scanCode();
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      action: 'scan',
      userId: profile.userId,
      displayName: profile.displayName,
      qrValue: result.value
    })
  });
  const data = await res.json();
  alert(data.message);
}

function renderHistory(root) {
  const btn = document.createElement('button');
  btn.textContent = "โหลดประวัติการสแกน";
  btn.onclick = async () => {
    const profile = await liff.getProfile();
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({action:'view', userId: profile.userId})
    });
    const data = await res.json();
    root.innerHTML = "<h3>ประวัติการใช้งาน</h3>" + data.history.map(s=>`<p>${s}</p>`).join('');
  };
  root.appendChild(btn);
}

async function renderRedeem(root) {
  const profile = await liff.getProfile();
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({action:'view', userId: profile.userId})
  });
  const data = await res.json();
  const count = data.history.length || 0;
  const msg = document.createElement('p');
  msg.innerHTML = `คุณสแกนแล้ว ${count} ครั้ง<br>`;
  const canRedeem = count >= 3;
  msg.innerHTML += canRedeem? "✅ สามารถแลกรางวัลได้": "❌ ยังไม่ครบสิทธิ์";
  root.appendChild(msg);
  if (canRedeem) {
    const btn = document.createElement('button');
    btn.textContent = "แลกรางวัล";
    btn.onclick = () => alert("ส่งคำขอแลกรางวัลแล้ว!");
    root.appendChild(btn);
  }
}

function renderHelp(root) {
  const html = `
    <h3>วิธีใช้งาน</h3>
    <p>1. กด “สแกน QR” แล้วใช้กล้องสแกน</p>
    <p>2. ดูประวัติการใช้งานผ่านเมนู</p>
    <p>3. เมื่อครบสิทธิ์ จะสามารถแลกรางวัลได้</p>
  `;
  root.innerHTML = html;
}

window.onload = main;
