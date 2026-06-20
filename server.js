const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'lockeye2024';

process.on('SIGINT', () => { console.log('\n  Shutting down...'); process.exit(0); });
process.on('SIGTERM', () => { console.log('\n  Shutting down...'); process.exit(0); });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(session({
  secret: 'lockeye-secret-' + Math.random().toString(36).slice(2),
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, sameSite: 'lax' }
}));

// Auth middleware for admin routes
function requireAdmin(req, res, next) {
  const isApi = req.path.startsWith('/api/admin');
  const isPage = req.path === '/admin' || req.path.startsWith('/admin?');

  if (!isApi && !isPage && !req.path.startsWith('/admin/login')) return next();
  if (req.path === '/admin/login' && req.method === 'POST') return next();
  if (req.session && req.session.isAdmin) return next();

  if (req.path.startsWith('/api/admin')) {
    return res.status(401).json({ error: 'Unauthorized. Please login first.', loginUrl: '/admin/login' });
  }
  if (req.path === '/admin' || req.path.startsWith('/admin?')) {
    return res.redirect('/admin/login');
  }
  next();
}

app.use(requireAdmin);

// Serve static files (AFTER auth check for admin pages)
app.use(express.static(path.join(__dirname, 'public'), {
  index: false,
  extensions: ['html']
}));

// ===== Data storage =====
const DATA_DIR = path.join(__dirname, 'data');
const WAITLIST_FILE = path.join(DATA_DIR, 'waitlist.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

function ensureDataFile(file, defaultData) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

function readData(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); }
  catch { return null; }
}

function readArray(file) {
  ensureDataFile(file, []);
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); }
  catch { return []; }
}

function writeData(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

// Default site settings
const DEFAULT_SETTINGS = {
  hero: {
    badge: "Now in early access",
    title1: "Find out how much your",
    title2: "gym membership is wasting.",
    subtitle: "Move the sliders. See your number. Then see what LockEye does about it.",
    assurances: ["No card to demo", "GPS + selfie verified", "85% to charity on skip"]
  },
  about: {
    headline: "Stop paying for a gym you never go to.",
    body: "LockEye puts real money on the line every time you skip. Prove you showed up, keep your cash. Skip, and 85% goes to charity. Your wallet finally works for you."
  },
  pricing: {
    free: { name: "Free", price: 0, desc: "The standard experience: money on the line, verified check-ins, a streak to protect.", features: ["Stake money to show up", "GPS + selfie check-in", "Basic streak tracking", "Charity routing on skip"] },
    pro: { name: "LockEye Pro · Lifetime", price: 24.99, originalPrice: 99.99, desc: "Everything in Free, plus the tools that make skipping even harder to justify.", features: ["Unlimited goals", "1 grace pass / month", "Streak revival token", "1.5× points multiplier", "Group challenges + founder badge"], founderLimit: 2000 }
  },
  calculator: {
    defaultMembership: 55, defaultIntend: 4, defaultActual: 2,
    membershipMin: 10, membershipMax: 200,
    freeRecoveryRate: 0.7, proRecoveryRate: 0.9
  },
  demo: {
    defaultStake: 30,
    charities: [
      { id: "malaria", name: "Against Malaria", desc: "AMF — bed nets that save lives", icon: "\uD83C\uDF0D" },
      { id: "givewell", name: "GiveWell", desc: "Top-rated charities, rigorous evidence", icon: "\uD83D\uDCC8" },
      { id: "climate", name: "Climate Fund", desc: "High-impact climate interventions", icon: "\uD83C\uDF0E" }
    ]
  },
  waitlist: { totalSpots: 2000 },
  contact: { email: "support@lockeye.app", responseTime: "Usually within 24 hours" }
};

function getSettings() {
  ensureDataFile(SETTINGS_FILE, DEFAULT_SETTINGS);
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch { return { ...DEFAULT_SETTINGS }; }
}

// ===== Auth routes =====

// Serve login page
app.get('/admin/login', (req, res) => {
  if (req.session && req.session.isAdmin) return res.redirect('/admin');
  res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

// Login POST
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.isAdmin = true;
    return res.json({ success: true, redirect: '/admin' });
  }
  res.status(401).json({ error: 'Invalid username or password.' });
});

// Logout
app.post('/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, redirect: '/admin/login' });
  });
});

// Check auth status
app.get('/api/admin/auth', (req, res) => {
  res.json({ authenticated: !!(req.session && req.session.isAdmin) });
});

// ===== API Routes (public) =====

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/waitlist', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  const list = readArray(WAITLIST_FILE);
  if (list.some(entry => entry.email === email.toLowerCase())) {
    return res.status(409).json({ error: 'This email is already on the waitlist.' });
  }
  list.push({ email: email.toLowerCase(), source: req.headers.referer || 'direct', createdAt: new Date().toISOString() });
  writeData(WAITLIST_FILE, list);
  res.json({ success: true, message: "You're on the list! We'll email you when your wave opens." });
});

app.get('/api/waitlist/count', (req, res) => {
  res.json({ count: readArray(WAITLIST_FILE).length });
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'All fields are required.' });
  if (!email.includes('@') || !email.includes('.')) return res.status(400).json({ error: 'Invalid email.' });
  const contacts = readArray(CONTACTS_FILE);
  contacts.push({ name: name.trim(), email: email.toLowerCase(), message: message.trim(), createdAt: new Date().toISOString() });
  writeData(CONTACTS_FILE, contacts);
  res.json({ success: true, message: 'Message received! We will get back to you within 24 hours.' });
});

// Public settings endpoint
app.get('/api/settings', (req, res) => {
  res.json(getSettings());
});

// ===== Admin API routes (protected by requireAdmin) =====

app.get('/api/admin/waitlist', (req, res) => {
  res.json(readArray(WAITLIST_FILE));
});

app.delete('/api/admin/waitlist/:index', (req, res) => {
  const index = parseInt(req.params.index);
  const list = readArray(WAITLIST_FILE);
  if (index < 0 || index >= list.length) return res.status(404).json({ error: 'Entry not found.' });
  const removed = list.splice(index, 1);
  writeData(WAITLIST_FILE, list);
  res.json({ success: true, removed: removed[0] });
});

app.get('/api/admin/contacts', (req, res) => {
  res.json(readArray(CONTACTS_FILE));
});

app.delete('/api/admin/contacts/:index', (req, res) => {
  const index = parseInt(req.params.index);
  const contacts = readArray(CONTACTS_FILE);
  if (index < 0 || index >= contacts.length) return res.status(404).json({ error: 'Message not found.' });
  const removed = contacts.splice(index, 1);
  writeData(CONTACTS_FILE, contacts);
  res.json({ success: true, removed: removed[0] });
});

// Admin settings
app.get('/api/admin/settings', (req, res) => {
  res.json(getSettings());
});

app.put('/api/admin/settings', (req, res) => {
  const current = getSettings();
  const updated = { ...current, ...req.body };
  writeData(SETTINGS_FILE, updated);
  res.json({ success: true, settings: getSettings() });
});

// Dashboard stats
app.get('/api/admin/stats', (req, res) => {
  const waitlist = readArray(WAITLIST_FILE);
  const contacts = readArray(CONTACTS_FILE);
  const settings = getSettings();
  const today = new Date().toISOString().slice(0, 10);
  const todaySignups = waitlist.filter(e => e.createdAt && e.createdAt.slice(0, 10) === today).length;
  const todayMessages = contacts.filter(e => e.createdAt && e.createdAt.slice(0, 10) === today).length;
  res.json({
    totalWaitlist: waitlist.length,
    totalMessages: contacts.length,
    todaySignups,
    todayMessages,
    waitlistRemaining: Math.max(0, settings.waitlist.totalSpots - waitlist.length),
    totalSpots: settings.waitlist.totalSpots
  });
});

// ===== Main site =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/how-it-works', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'how-it-works.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'demo.html'));
});

app.get('/savings', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'savings.html'));
});

app.get('/pricing', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pricing.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

// ===== 404 =====
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Endpoint not found.' });
  if (req.accepts('html') && !req.path.includes('.')) return res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
  next();
});

app.listen(PORT, () => {
  console.log('');
  console.log('  LockEye Server');
  console.log('  ─────────────');
  console.log(`  Local:     http://localhost:${PORT}`);
  console.log(`  Admin:     http://localhost:${PORT}/admin/login`);
  console.log(`  API:       http://localhost:${PORT}/api/health`);
  console.log(`  Credentials: ${ADMIN_USER} / ${ADMIN_PASS}`);
  console.log('');
});
