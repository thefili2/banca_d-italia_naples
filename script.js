// script.js

let utenti = {};
let commodities = {};
let loggedUser = null;

const utentiUrl = 'utenti.json';
const commoditiesUrl = 'azioni.json';

const loader = document.getElementById('loader');
const mainContent = document.getElementById('main-content');

const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

const portfolioTableBody = document.querySelector('#portfolio-table tbody');
const portfolioValueDisplay = document.getElementById('portfolio-value');
const userNameDisplay = document.getElementById('user-name-display');
const emptyPortfolioMsg = document.getElementById('empty-portfolio-msg');

const logoutUserBtn = document.getElementById('logout-user');

// --- Utility functions ---

async function loadJsonFile(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Errore caricamento file ${url}`);
  return await res.json();
}

function getStoredJson(url, defaultData) {
  let stored = null;
  if (url === utentiUrl) stored = localStorage.getItem('utenti');
  else if (url === commoditiesUrl) stored = localStorage.getItem('azioni');
  if (stored) return JSON.parse(stored);
  else return defaultData;
}

async function saveJsonFile(url, data) {
  if (url === utentiUrl) {
    localStorage.setItem('utenti', JSON.stringify(data));
  } else if (url === commoditiesUrl) {
    localStorage.setItem('azioni', JSON.stringify(data));
  }
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

function clearMessages() {
  loginError.textContent = '';
  loginError.classList.remove('show');
}

// --- Load initial data ---

async function loadInitialData() {
  try {
    const utentiData = await loadJsonFile(utentiUrl);
    const commoditiesData = await loadJsonFile(commoditiesUrl);
    utenti = getStoredJson(utentiUrl, utentiData);
    commodities = getStoredJson(commoditiesUrl, commoditiesData);
  } catch (err) {
    alert('Errore caricamento dati. Ricarica la pagina.');
    console.error(err);
  }
}

// --- Login ---

loginForm.addEventListener('submit', e => {
  e.preventDefault();
  clearMessages();

  const username = loginForm.username.value.trim();
  const password = loginForm.password.value.trim();

  if (username === 'admin' && password === 'admin') {
    alert('Accesso admin non disponibile in questa versione.');
    loginForm.reset();
    return;
  } else if (utenti[username] && utenti[username].password === password) {
    loggedUser = username;
    loadUserDashboard();
    showPage('user-dashboard');
  } else {
    loginError.textContent = "Credenziali non valide.";
    loginError.classList.add('show');
  }
});

// --- Logout ---

logoutUserBtn.addEventListener('click', () => {
  loggedUser = null;
  showPage('login-page');
  loginForm.reset();
  clearMessages();
});

// --- User dashboard ---

function loadUserDashboard() {
  renderPortfolio();
}

function renderPortfolio() {
  const user = utenti[loggedUser];
  if (!user || !user.portafoglio || Object.keys(user.portafoglio).length === 0) {
    portfolioTableBody.innerHTML = '<tr><td colspan="4">Portafoglio vuoto.</td></tr>';
    portfolioValueDisplay.textContent = '0.00';
    emptyPortfolioMsg.classList.remove('hidden');
    return;
  }

  emptyPortfolioMsg.classList.add('hidden');
  let totalValue = 0;
  portfolioTableBody.innerHTML = '';
  for (const key in user.portafoglio) {
    const qty = user.portafoglio[key];
    const prezzo = commodities[key]?.prezzo || 0;
    const valore = qty * prezzo;
    totalValue += valore;
    portfolioTableBody.innerHTML += `
      <tr>
        <td>${commodities[key]?.nome || key}</td>
        <td>${qty}</td>
        <td>${prezzo.toFixed(2)}</td>
        <td>${valore.toFixed(2)}</td>
      </tr>
    `;
  }
  portfolioValueDisplay.textContent = totalValue.toFixed(2);
}

// --- App start with loader ---

window.addEventListener('load', async () => {
  loader.classList.remove('hidden');
  await loadInitialData();
  loader.classList.add('hidden');
  mainContent.classList.remove('hidden');
  showPage('login-page');
});