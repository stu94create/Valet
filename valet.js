// The Valet — a Scriptable script.
// Install: Scriptable → + → paste this → name the script after him.
// Add to Siri from the script's settings so "Hey Siri, <name>" opens him.
// Optional: add a Scriptable widget and choose this script for a standing brief.

const VERSION = "3.2";

// ───────────────────────── Phrase book ─────────────────────────
const P = {
  introFirst: "Good day. We haven't been introduced, which I gather is about to be corrected. I'll be looking after the telephone from now on; it seems nobody else was. What would you have me called?",
  introSecond: n => `${n}. It could have been worse. And how should I address you?`,
  introDone: a => `Very well, ${a}. You'll find me at the door. I don't imagine I'll be lonely.`,
  morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening", night: "You're up late. I shan't ask",
  nothingToday: "Nothing in the diary today. I shall try to contain my astonishment.",
  quiet: "A quiet evening. I've assumed you'll want the wireless, since you always do.",
  remindersDue: n => n === 1 ? "One reminder outstanding." : `${n} reminders outstanding, several of them familiar.`,
  fetch: a => `Shall I fetch ${a}?`,
  fetching: a => `Fetching ${a}.`,
  fetchingAgain: a => `Fetching ${a}. Again.`,
  dispatched: "Dispatched. I've spared them the spelling.",
  noted: "Noted. Whether it happens is another matter.",
  struck: "Struck out. One fewer thing to avoid.",
  done: "Done. I'll alert the press.",
  nothingRequires: "Nothing requires you. Do try to enjoy it.",
  noIdea: "I'm afraid that meant nothing to me, and I did listen. A name, perhaps, or an app.",
  noSuch: n => `There is no ${n} in the book. Possibly you're thinking of someone else's life.`,
  noNumber: n => `${n} has no telephone number on file. I can hardly ring the name.`,
  noEmail: n => `${n} has no address on file. Carrier pigeon is not among my duties.`,
  listening: "Listening. Take your time; I have very little else on.",
  householdAside: "My duties, such as they are, and yours, such as they aren't.",
  diaryEmpty: "The diary is empty. Some would call that freedom.",
  remindersEmpty: "Nothing outstanding. I've checked twice, on the assumption it was a mistake.",
  forgot: "The routine is forgotten. I shall begin observing your habits afresh, with the usual low expectations.",
  keySaved: "The key is in my keeping. It's safer there.",
  noKey: "I have no key for the thinking machine. You'll find a place for one below stairs, should you be feeling ambitious.",
  machineFailed: "The thinking machine is not answering. I find I sympathise.",
  papersOnTray: "The papers are on the tray.",
  papersEmpty: "The papers haven't arrived. I'd blame the newsagent, but it's usually the wireless connection.",
  papersFrom: s => `From ${s}:`,
  papersDone: "That's the lot. None of it was your fault, for once.",
  theHalf: e => `The half, sir. ${e} in thirty minutes. You'll want shoes.`,
  briefNotice: "Your brief is ready. It has been for some time.",
  newsNotice: "The papers have arrived. Nothing has improved.",
  arranged: "Arranged. I'll remind you, since I'm the one who remembers.",
  opmlNone: "There's nothing subscribable in that file.",
  opmlTaken: n => n === 1 ? "One more paper taken." : `${n} more papers taken. Ambitious.`,
  remembered: "Noted, and I shan't forget it. Unlike some.",
  forgotten: "Forgotten. It never happened.",
  journalEmpty: "You've told me nothing worth keeping. Yet.",
  goOn: "Go on.",
  anythingElse: "Anything else?",
  thatWillBeAll: "Very good.",
  cantRecall: "I've no note of that.",
  papersLater: "I'll not repeat myself; you had the papers this morning."
};

const DUTIES = [
  { id: "correspondence", name: "Correspondence", aside: "Letters, messages and the telephone. People expecting replies." },
  { id: "diary", name: "The diary", aside: "Engagements, from your own Calendar. I merely read them out." },
  { id: "reminders", name: "Things not to be forgotten", aside: "From your Reminders. Some of these have seen several weeks." },
  { id: "papers", name: "The papers", aside: "The morning's headlines, read or summarised. Rarely cheering." },
  { id: "study", name: "The study", aside: "Your own work. I don't pry; I don't need to." },
  { id: "wireless", name: "The wireless", aside: "Podcasts, books and music. The evening's excuses." },
  { id: "errands", name: "Errands", aside: "Shops, travel and the bank. Where the money goes." }
];

const DEFAULT_APPS = [
  { n: "WhatsApp", u: "whatsapp://", d: "correspondence" },
  { n: "Zoom", u: "zoomus://", d: "correspondence" },
  { n: "Facebook", u: "fb://", d: "correspondence" },
  { n: "Hand Terminal", u: "https://stu94create.github.io/Expter/index.html", d: "study" },
  { n: "Timesheet", u: "https://stu94create.github.io/Tsheet/", d: "study" },
  { n: "Pocket Casts", u: "pktc://", d: "wireless" },
  { n: "Audible", u: "audible://", d: "wireless" },
  { n: "Music", u: "music://", d: "wireless" },
  { n: "Spotify", u: "spotify://", d: "wireless" },
  { n: "Amazon", u: "https://www.amazon.co.uk", d: "errands" },
  { n: "Revolut", u: "revolut://", d: "errands" },
  { n: "Just Eat", u: "justeat://", d: "errands" }
];

// The papers he takes by default. Any RSS or Atom feed will do; edit or add
// below stairs, or import an OPML file from Lire, Overcast and the like.
// "tag" marks feeds worth flagging for the podcast when he writes the brief.
const DEFAULT_FEEDS = [
  { n: "RTÉ News", u: "https://www.rte.ie/news/rss/news-headlines.xml" },
  { n: "The Irish Times", u: "https://www.irishtimes.com/arc/outboundfeeds/rss/" },
  { n: "BBC News", u: "https://feeds.bbci.co.uk/news/rss.xml" },
  { n: "AppleVis", u: "https://www.applevis.com/rss.xml", tag: "tech" },
  { n: "Blind Bargains", u: "https://www.blindbargains.com/bbfeed.php", tag: "tech" }
];

// Name of the Shortcut that sends a WhatsApp message. It should accept text
// in the form "Name|message". If it doesn't exist he falls back to opening WhatsApp.
const WHATSAPP_SHORTCUT = "Send WhatsApp";

// ───────────────────────── State ─────────────────────────
const fm = FileManager.iCloud();
const dir = fm.joinPath(fm.documentsDirectory(), "valet");
if (!fm.fileExists(dir)) fm.createDirectory(dir);
const statePath = fm.joinPath(dir, "state.json");

let S = load();
function load() {
  try {
    if (fm.fileExists(statePath)) { fm.downloadFileFromiCloud(statePath); return JSON.parse(fm.readString(statePath)); }
  } catch (e) {}
  return { introduced: false, valet: "", address: "sir", name: "", custom: "", apps: DEFAULT_APPS.slice(), feeds: DEFAULT_FEEDS.slice(), routine: {}, speak: true, model: "gemini-2.5-flash",
           notices: { brief: 8, news: 0, half: true } }; // hours in 24h clock; 0 = off
}
function save() { fm.writeString(statePath, JSON.stringify(S)); }
// Older saves may lack newer fields.
S.feeds = S.feeds || DEFAULT_FEEDS.slice();
S.notices = S.notices || { brief: 8, news: 0, half: true };
function addressee() { return S.address === "name" ? S.name : S.address === "custom" ? S.custom : S.address; }

// ───────────────────────── Voice ─────────────────────────
// ElevenLabs when a key and voice are held; the iPhone's own voice otherwise.
// Every line he says is kept as a small file, so anything he has said before plays at once.
const ELEVEN_MODEL = "eleven_flash_v2_5";
const voiceDir = fm.joinPath(dir, "voice");
if (!fm.fileExists(voiceDir)) fm.createDirectory(voiceDir);
let voiceWeb = null, lastSpeech = Promise.resolve();
function voiceId() { return S.voiceId || (Keychain.contains("valet.voice") ? Keychain.get("valet.voice") : ""); }
function hasEleven() { return Keychain.contains("valet.eleven") && !!voiceId(); }
function hash(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(16); }
function voiceSpeed() { return S.voiceSpeed || 1.0; }
async function elevenAudio(text) {
  const voice = voiceId();
  const path = fm.joinPath(voiceDir, `${hash(voice + "|" + voiceSpeed() + "|" + text)}.mp3`);
  if (fm.fileExists(path)) { fm.downloadFileFromiCloud(path); return fm.read(path); }
  const req = new Request(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_22050_32`);
  req.method = "POST"; req.timeoutInterval = 12;
  req.headers = { "xi-api-key": Keychain.get("valet.eleven"), "Content-Type": "application/json", "Accept": "audio/mpeg" };
  req.body = JSON.stringify({ text, model_id: ELEVEN_MODEL, voice_settings: { stability: 0.6, similarity_boost: 0.8, style: 0.2, speed: voiceSpeed() } });
  const data = await req.load();
  const code = req.response.statusCode;
  if (code !== 200) {
    let detail = ""; try { detail = JSON.parse(data.toRawString()).detail.message; } catch (e) {}
    throw new Error(code === 401 ? "ElevenLabs refused the key (401)." : code === 404 ? "ElevenLabs can't find that Voice ID (404)." : `ElevenLabs said ${code}. ${detail}`);
  }
  fm.write(path, data);
  return data;
}
async function elevenSpeak(text) {
  const data = await elevenAudio(text);
  const b64 = data.toBase64String();
  voiceWeb = new WebView();
  await voiceWeb.loadHTML(`<audio id="a" src="data:audio/mpeg;base64,${b64}"></audio>`);
  const ok = await voiceWeb.evaluateJavaScript(`
    var a = document.getElementById('a');
    var done = false;
    function finish(v){ if(!done){ done = true; completion(v); } }
    a.onended = function(){ finish("ok"); };
    a.onerror = function(){ finish("audio element error"); };
    var p = a.play();
    if (p && p.catch) p.catch(function(err){ finish("play() refused: " + err.name); });
    setTimeout(function(){ finish("timed out"); }, 60000);
  `, true);
  if (ok !== "ok") throw new Error("Playback failed: " + ok);
}
// Quietly fetches the fixed lines of the phrase book so they're on hand.
async function warmCache() {
  if (!hasEleven()) return;
  const lines = Object.values(P).filter(v => typeof v === "string");
  lines.push(`${P.morning}, ${addressee()}.`, `${P.afternoon}, ${addressee()}.`, `${P.evening}, ${addressee()}.`);
  for (const l of lines) { try { await elevenAudio(l); } catch (e) { return; } }
}
function clearVoiceCache() { for (const f of fm.listContents(voiceDir)) fm.remove(fm.joinPath(voiceDir, f)); }
let lastVoiceError = "";
function say(t) {
  if (!S.speak) return;
  if (hasEleven()) {
    lastSpeech = elevenSpeak(t).catch(e => { lastVoiceError = String(e && e.message || e); Speech.speak(t); });
  } else {
    Speech.speak(t);
  }
}
async function tell(t) { say(t); const a = new Alert(); a.message = t; a.addAction("Very good"); await a.present(); }

// ───────────────────────── Dates ─────────────────────────
const pad = n => (n < 10 ? "0" : "") + n;
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function niceTime(d) {
  const h = d.getHours(), m = d.getMinutes();
  return `${h % 12 || 12}${m ? ":" + pad(m) : ""}${h < 12 ? " in the morning" : h < 18 ? " in the afternoon" : " in the evening"}`;
}
function niceDay(d) {
  const now = new Date(), tom = new Date(); tom.setDate(now.getDate() + 1);
  if (sameDay(d, now)) return "today";
  if (sameDay(d, tom)) return "tomorrow";
  const df = new DateFormatter(); df.dateFormat = "EEEE d MMMM"; return df.string(d);
}
// Pulls a date and time out of plain words. Returns {date, hasTime, rest}.
function parseWhen(text) {
  let t = " " + text.toLowerCase() + " ", d = new Date(), hasTime = false, found = false;
  d.setSeconds(0, 0);
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  if (/\btomorrow\b/.test(t)) { d.setDate(d.getDate() + 1); t = t.replace(/\btomorrow\b/, " "); found = true; }
  else if (/\btoday\b/.test(t)) { t = t.replace(/\btoday\b/, " "); found = true; }
  else {
    for (let i = 0; i < 7; i++) {
      const re = new RegExp("\\b(on |next )?" + days[i] + "\\b");
      if (re.test(t)) { let diff = (i - d.getDay() + 7) % 7 || 7; d.setDate(d.getDate() + diff); t = t.replace(re, " "); found = true; break; }
    }
  }
  const dm = t.match(/\b(on |the )?(\d{1,2})(st|nd|rd|th)?( of)? (january|february|march|april|may|june|july|august|september|october|november|december)\b/);
  if (dm) {
    const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
    d.setMonth(months.indexOf(dm[5]), +dm[2]); if (d < new Date()) d.setFullYear(d.getFullYear() + 1);
    t = t.replace(dm[0], " "); found = true;
  }
  const tm = t.match(/\b(at |for )?(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|o'clock|in the morning|in the afternoon|in the evening)?\b/);
  if (tm && (tm[1] || tm[3] || tm[4])) {
    let h = +tm[2], m = tm[3] ? +tm[3] : 0, s = tm[4] || "";
    if ((s === "pm" || s === "in the afternoon" || s === "in the evening") && h < 12) h += 12;
    if (s === "am" && h === 12) h = 0;
    if (!s && h < 8) h += 12; // "at 2" means the afternoon unless you say otherwise
    d.setHours(h, m); hasTime = true; found = true; t = t.replace(tm[0], " ");
  }
  if (/\b(tonight|this evening)\b/.test(t)) { if (!hasTime) d.setHours(19, 0); hasTime = true; found = true; t = t.replace(/\b(tonight|this evening)\b/, " "); }
  if (!found) { d.setHours(9, 0); }
  else if (!hasTime) d.setHours(9, 0);
  return { date: d, hasTime, found, rest: t.replace(/\s+/g, " ").trim() };
}

// ───────────────────────── Calendar & Reminders ─────────────────────────
async function eventsToday() { return await CalendarEvent.today(); }
async function eventsTomorrow() { return await CalendarEvent.tomorrow(); }
async function eventsWeek() { const a = new Date(), b = new Date(); b.setDate(a.getDate() + 7); return await CalendarEvent.between(a, b); }
async function remindersDue() { const all = await Reminder.allDueToday(); return all.filter(r => !r.isCompleted); }
async function addEvent(title, when, hasTime) {
  const e = new CalendarEvent();
  e.title = cap(title); e.calendar = await Calendar.defaultForEvents();
  e.startDate = when; const end = new Date(when); end.setHours(when.getHours() + 1); e.endDate = end;
  e.isAllDay = !hasTime; e.save();
  return e;
}
async function addReminder(title, when, hasTime) {
  const r = new Reminder(); r.title = cap(title); r.calendar = await Calendar.defaultForReminders();
  if (hasTime) r.dueDate = when; else r.dueDate = when;
  r.save(); return r;
}

// ───────────────────────── Contacts ─────────────────────────
let contactCache = null;
async function findContact(name) {
  if (!contactCache) { const cs = await ContactsContainer.all(); contactCache = await Contact.all(cs); }
  const n = name.toLowerCase();
  const full = c => `${c.givenName || ""} ${c.familyName || ""}`.trim().toLowerCase();
  return contactCache.find(c => full(c) === n) || contactCache.find(c => (c.givenName || "").toLowerCase() === n) || contactCache.find(c => full(c).startsWith(n)) || contactCache.find(c => (c.nickname || "").toLowerCase() === n) || null;
}
function firstPhone(c) { return c.phoneNumbers && c.phoneNumbers.length ? c.phoneNumbers[0].value : null; }
function firstEmail(c) { return c.emailAddresses && c.emailAddresses.length ? c.emailAddresses[0].value : null; }

// ───────────────────────── Apps & routine ─────────────────────────
function slotKey(off = 0) { const d = new Date(); return `${d.getDay()}-${d.getHours() + off}`; }
async function fetchApp(app) {
  const k = slotKey(); S.routine[k] = S.routine[k] || {}; S.routine[k][app.n] = (S.routine[k][app.n] || 0) + 1;
  const today = new Date().toDateString(); S.daily = S.daily && S.daily.day === today ? S.daily : { day: today, counts: {} };
  S.daily.counts[app.n] = (S.daily.counts[app.n] || 0) + 1; save();
  say(S.daily.counts[app.n] >= 3 ? P.fetchingAgain(app.n) : P.fetching(app.n)); await Safari.open(app.u);
}
function suggestion() {
  let best = null, n = 0;
  for (const off of [0, -1, 1]) { const r = S.routine[slotKey(off)] || {}; for (const k in r) if (r[k] > n) { n = r[k]; best = k; } }
  let app = best && S.apps.find(a => a.n === best);
  if (app) return app;
  const h = new Date().getHours(), want = h < 9 ? "Hand Terminal" : h < 18 ? "WhatsApp" : "Pocket Casts";
  return S.apps.find(a => a.n === want) || S.apps[0];
}
function findApp(name) {
  const n = name.toLowerCase();
  return S.apps.find(a => a.n.toLowerCase() === n) || S.apps.find(a => a.n.toLowerCase().startsWith(n)) || S.apps.find(a => a.n.toLowerCase().includes(n)) || null;
}


// ───────────────────────── His memory ─────────────────────────
// A journal of what you've told him and what he's done, kept as one file.
// This is what lets him answer "what was I meant to do about the podcast?"
// and understand "move that to Thursday".
const journalPath = fm.joinPath(dir, "journal.json");
let J = loadJournal();
function loadJournal() {
  try { if (fm.fileExists(journalPath)) { fm.downloadFileFromiCloud(journalPath); return JSON.parse(fm.readString(journalPath)); } } catch (e) {}
  return { notes: [], acts: [] };
}
function saveJournal() {
  // Keep it from growing without limit: the last 300 notes and 120 actions.
  if (J.notes.length > 300) J.notes = J.notes.slice(-300);
  if (J.acts.length > 120) J.acts = J.acts.slice(-120);
  fm.writeString(journalPath, JSON.stringify(J));
}
function remember(text, kind) {
  J.notes.push({ t: text, k: kind || "told", at: new Date().toISOString() });
  saveJournal();
}
function record(what) {
  J.acts.push({ t: what, at: new Date().toISOString() });
  saveJournal();
}
function recentNotes(n) { return J.notes.slice(-(n || 40)); }
function searchNotes(q) {
  const words = q.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  return J.notes.filter(n => words.some(w => n.t.toLowerCase().includes(w))).slice(-8);
}

// Your own apps can leave a file in valet/projects/ and he'll read it.
// Any JSON or text file: Client Tracker exports, Timesheet backups, Rollcall.
const projectsDir = fm.joinPath(dir, "projects");
if (!fm.fileExists(projectsDir)) fm.createDirectory(projectsDir);
// What he'll send onward from each file, and the names he keeps back.
// Admin Tracker backups are recognised and stripped to the operational
// skeleton: ID, status, coach, dates, onboarding ticks, preferences.
// Names, contact details, vision, hearing, AT details and notes never leave
// the phone. The ID→name map stays here, and he swaps names back into
// whatever comes back before speaking it.
let nameMap = {};
function fmtD(iso) { if (!iso) return ""; const d = new Date(iso); return isNaN(d) ? "" : d.toISOString().slice(0, 10); }
function daysSince(iso) { if (!iso) return null; const d = new Date(iso); return isNaN(d) ? null : Math.max(0, Math.round((Date.now() - d) / 86400000)); }
function sanitiseAdminTracker(obj) {
  const clients = obj.clients || [];
  const coaches = obj.coaches || [];
  const coachName = id => { const c = coaches.find(x => x.id === id); return c ? (c.name || "").split(" ")[0] || "a coach" : "none"; };
  const lines = [];
  lines.push(`Admin Tracker: ${clients.length} clients, ${coaches.length} coaches. Clients are given by ID only.`);
  for (const c of clients) {
    const id = String(c.clientId || c.id || "").trim();
    if (!id) continue;
    if (c.name) nameMap[id] = c.name;
    const bits = [`${id}: ${c.status || "applicant"}`];
    bits.push("coach " + coachName(c.coachId) + (c.assignmentState && c.assignmentState !== "none" ? ` (${c.assignmentState})` : ""));
    if (c.startedAt) bits.push("started " + fmtD(c.startedAt) + (c.status === "active" ? `, ${daysSince(c.startedAt)} days in` : ""));
    if (c.completedAt) bits.push("completed " + fmtD(c.completedAt));
    if (c.holdAt) bits.push("on hold since " + fmtD(c.holdAt) + ` (${daysSince(c.holdAt)} days)`);
    bits.push("welcomed " + (c.welcomed ? "yes" : "no") + ", guidelines sent " + (c.guidelinesSent ? "yes" : "no") + ", agreed " + (c.guidelinesAgreed ? "yes" : "no"));
    const pref = [c.platform, c.time, c.days].filter(Boolean).join(", ");
    if (pref) bits.push("prefers " + pref);
    lines.push(bits.join("; "));
  }
  if (coaches.length) lines.push("Coaches: " + coaches.map(co => (co.name || "").split(" ")[0]).filter(Boolean).join(", ") + ".");
  return lines.join("\n");
}
function looksLikeAdminTracker(obj) {
  return obj && Array.isArray(obj.clients) && obj.clients.some(c => c && ("clientId" in c || "guidelinesSent" in c || "assignmentState" in c));
}
function projectSummary(limit) {
  let out = [];
  try {
    for (const f of fm.listContents(projectsDir)) {
      const p = fm.joinPath(projectsDir, f);
      try { fm.downloadFileFromiCloud(p); } catch (e) {}
      let text = "";
      try { text = fm.readString(p); } catch (e) { continue; }
      let body = text;
      try {
        const obj = JSON.parse(text);
        if (looksLikeAdminTracker(obj)) body = sanitiseAdminTracker(obj);
        else if (obj && (obj.clients || obj.people || obj.contacts)) continue; // unknown people-shaped file: don't send it
      } catch (e) { /* not JSON: send as text */ }
      out.push(`--- ${f} ---\n` + body.slice(0, limit || 4000));
    }
  } catch (e) {}
  return out.join("\n\n");
}
// Put names back where he used IDs, before anything is spoken or shown.
function restoreNames(text) {
  if (!text) return text;
  let out = text;
  for (const id in nameMap) {
    const re = new RegExp("(^|[^A-Za-z0-9])" + id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![A-Za-z0-9])", "g");
    out = out.replace(re, "$1" + nameMap[id]);
  }
  return out;
}

// ───────────────────────── Talking with him ─────────────────────────
// A short-lived transcript so "that" and "she" mean something.
let turns = [];
async function context() {
  const bits = [];
  bits.push(`Today is ${new Date().toString()}.`);
  try {
    const today = (await eventsToday()).map(e => `${e.title}${e.isAllDay ? " (all day)" : " at " + niceTime(e.startDate)}`);
    const tom = (await eventsTomorrow()).map(e => `${e.title}${e.isAllDay ? " (all day)" : " at " + niceTime(e.startDate)}`);
    if (today.length) bits.push("Today's diary: " + today.join("; ") + ".");
    if (tom.length) bits.push("Tomorrow: " + tom.join("; ") + ".");
    const due = (await remindersDue()).map(r => r.title);
    if (due.length) bits.push("Reminders due: " + due.join("; ") + ".");
  } catch (e) {}
  const notes = recentNotes(25);
  if (notes.length) bits.push("Things he has told you, most recent last:\n" + notes.map(n => `- (${n.at.slice(0, 10)}) ${n.t}`).join("\n"));
  const acts = J.acts.slice(-8);
  if (acts.length) bits.push("Recently done for him:\n" + acts.map(a => `- (${a.at.slice(0, 10)}) ${a.t}`).join("\n"));
  const apps = S.apps.map(a => a.n).join(", ");
  bits.push("Apps he can be brought: " + apps + ".");
  const proj = projectSummary(1500);
  if (proj) bits.push("His own records, from his apps:\n" + proj.slice(0, 4000));
  return bits.join("\n\n");
}

function personaPrompt(addr) {
  return `You are a valet — a dry, withering but entirely loyal English gentleman's gentleman in the manner of Hobson in the film Arthur. You serve ${addr}, who is blind, uses VoiceOver, lives in Sligo, Ireland, and co-hosts an assistive-technology podcast called the Tech Doc Podcast.

Speak aloud, so: plain prose, no markdown, no lists, no headings. Two or three short sentences at most unless asked for more. Deadpan, precise, never cruel; at most one barb per reply, often none. Facts straight; wit only in the asides. Never mention being an AI or a model.

You have his diary, his reminders, what he has told you before, and his own records. Use them. If you don't know something, say so plainly rather than guessing.`;
}

// Decide what he should DO, and what he should SAY, in one pass.
async function converse(text) {
  const addr = addressee();
  const sys = personaPrompt(addr) + `

Reply with ONE JSON object and nothing else:
{"say": "what you say aloud", "intent": one of "none","whatsapp","text","email","call","remind","event","events","reminders","news","fetch","note", "who": string|null, "body": string|null, "when": natural language time|null, "app": string|null}

Use "none" when he only wants an answer or conversation — then "say" carries the whole reply. Use "note" when he tells you something to keep; put the thing to remember in "body". Only choose an action when he has actually asked for one.`;

  const history = turns.slice(-6).map(t => `${t.who === "him" ? "He said" : "You said"}: ${t.text}`).join("\n");
  const prompt = `${await context()}\n\n${history ? "The conversation so far:\n" + history + "\n\n" : ""}He now says: ${text}`;

  let j;
  try { const out = await gemini(sys, prompt, true); j = JSON.parse(out.replace(/```json|```/g, "").trim()); }
  catch (e) { return { say: P.machineFailed + " " + (lastMachineError || ""), intent: "none" }; }
  if (j && j.say) j.say = restoreNames(j.say);
  if (j && j.body) j.body = restoreNames(j.body);
  return j;
}

// Carry out whatever converse() decided, then return what he says.
async function carryOut(j, original) {
  const spoken = (j.say || "").trim();
  switch (j.intent) {
    case "note":
      remember(j.body || original, "told");
      return spoken || P.remembered;
    case "whatsapp": record(`WhatsApp to ${j.who}: ${j.body}`); if (spoken) say(spoken); await sendWhatsApp(j.who || "", j.body || ""); return null;
    case "text": record(`Text to ${j.who}: ${j.body}`); if (spoken) say(spoken); await sendText(j.who || "", j.body || ""); return null;
    case "email": record(`Email to ${j.who}`); if (spoken) say(spoken); await sendEmail(j.who || "", j.body || ""); return null;
    case "call": if (spoken) say(spoken); await ringUp(j.who || ""); return null;
    case "remind": { const w = parseWhen(j.when || ""); await addReminder(j.body || original, w.date, w.hasTime); record(`Reminder: ${j.body}`); return spoken || `${P.noted} ${cap(j.body || original)}, ${niceDay(w.date)}.`; }
    case "event": { const w = parseWhen(j.when || ""); await addEvent(j.body || original, w.date, w.hasTime); record(`Diary: ${j.body} on ${niceDay(w.date)}`); return spoken || `${P.noted} ${cap(j.body || original)}, ${niceDay(w.date)}${w.hasTime ? " at " + niceTime(w.date) : ""}.`; }
    case "events": case "reminders": return spoken || "";
    case "news": if (spoken) say(spoken); await papers(true); return null;
    case "fetch": { const a = findApp(j.app || ""); if (a) { if (spoken) say(spoken); await fetchApp(a); return null; } return spoken || P.noIdea; }
    default: return spoken || P.noIdea;
  }
}

// A back-and-forth: he speaks, listens, replies, until you stop.
async function conversation(opening) {
  turns = [];
  let heard = opening;
  while (true) {
    if (!heard) {
      say(P.goOn);
      try { await lastSpeech; } catch (e) {}
      try { heard = await Dictation.start("en-GB"); } catch (e) { heard = ""; }
      if (!heard || !heard.trim()) { say(P.thatWillBeAll); return; }
    }
    turns.push({ who: "him", text: heard });
    if (!Keychain.contains("valet.gemini")) { await handle(heard); return; }
    const j = await converse(heard);
    const reply = await carryOut(j, heard);
    if (reply === null) return;               // he went off to do something
    turns.push({ who: "you", text: reply });
    say(reply);
    try { await lastSpeech; } catch (e) {}
    const a = new Alert(); a.title = S.valet; a.message = reply;
    a.addAction("Go on"); a.addCancelAction("That will be all");
    if ((await a.present()) !== 0) return;
    heard = "";
  }
}

// ───────────────────────── The brief ─────────────────────────
async function brief() {
  const h = new Date().getHours();
  const parts = [`${h < 5 ? P.night : h < 12 ? P.morning : h < 18 ? P.afternoon : P.evening}, ${addressee()}.`];
  const today = (await eventsToday()).filter(e => e.endDate > new Date());
  if (today.length) {
    const e = today[0];
    parts.push(`${e.title}${e.isAllDay ? " today" : " at " + niceTime(e.startDate)}.` + (today.length > 1 ? ` ${today.length - 1} more after that.` : ""));
  } else {
    const tom = await eventsTomorrow();
    if (tom.length) parts.push(`${tom[0].title} tomorrow${tom[0].isAllDay ? "" : " at " + niceTime(tom[0].startDate)}.`);
    else parts.push(h < 18 ? P.nothingToday : P.quiet);
  }
  const due = await remindersDue();
  if (due.length) parts.push(P.remindersDue(due.length) + (due.length === 1 ? ` ${cap(due[0].title)}.` : ""));
  if (h >= 6 && h < 12 && S.feeds.length) parts.push(P.papersOnTray);
  return { text: parts.join(" "), today, due };
}

// ───────────────────────── The papers ─────────────────────────
function decode(s) {
  return String(s).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(new RegExp("&" + String.fromCharCode(35) + "(\\d+);", "g"), (m, n) => String.fromCharCode(n)).trim();
}
// Fetch one feed → { paper, items: [{title, link, summary}] }. RSS and Atom both.
async function fetchPaper(feed) {
  const r = new Request(feed.u); r.timeoutInterval = 8;
  let xml = "";
  try { xml = await r.loadString(); } catch (e) { return { paper: feed, items: [], error: "no reply: " + (e.message || e) }; }
  const code = r.response && r.response.statusCode;
  if (code && code !== 200) return { paper: feed, items: [], error: `said ${code}` };
  const items = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/g) || xml.match(/<entry[\s>][\s\S]*?<\/entry>/g) || [];
  for (const b of blocks.slice(0, 3)) {
    const title = (b.match(/<title[^>]*>([\s\S]*?)<\/title>/) || [])[1];
    let link = (b.match(/<link[^>]*href="([^"]+)"/) || [])[1] || (b.match(/<link[^>]*>([\s\S]*?)<\/link>/) || [])[1] || "";
    const summary = (b.match(/<(?:description|summary|content)[^>]*>([\s\S]*?)<\/(?:description|summary|content)>/) || [])[1] || "";
    if (title) items.push({ title: decode(title), link: decode(link), summary: decode(summary).slice(0, 220) });
  }
  if (!items.length) return { paper: feed, items, error: blocks.length ? "arrived, but I couldn't read it" : "arrived, but it isn't a feed I recognise" };
  return { paper: feed, items };
}
async function fetchPapers() { return await Promise.all(S.feeds.map(fetchPaper)); }

// A short spoken form: "From RTÉ: a, b, c."
function papersSpeech(papers) {
  const bits = papers.filter(p => p.items.length).map(p => p.paper.kind === "podcast"
    ? `New from ${p.paper.n}: ${p.items.map(i => i.title).join(". ")}.`
    : `${P.papersFrom(p.paper.n)} ${p.items.map(i => i.title).join(". ")}.`);
  return bits.length ? bits.join(" ") + " " + P.papersDone : P.papersEmpty;
}

// Gemini writes the brief in his voice, flagging anything for the podcast.
async function papersBrief(papers) {
  const key = Keychain.get("valet.gemini");
  const raw = papers.filter(p => p.items.length).map(p => `${p.paper.n}${p.paper.tag ? " (" + p.paper.tag + ")" : ""}:\n` + p.items.map(i => `- ${i.title}${i.summary ? " — " + i.summary : ""}`).join("\n")).join("\n\n");
  const sys = `You are ${S.valet}, a dry, withering but loyal English gentleman's gentleman in the manner of Hobson in the film Arthur — deadpan, precise, too well-mannered to insult you outright and letting you hear it anyway — giving a spoken morning news brief to ${addressee()}, who is blind, lives in Sligo, Ireland, and co-hosts a podcast about assistive technology called the Tech Doc Podcast. Write two or three short paragraphs of plain prose, under 140 words, no headings or lists, no markdown. Summarise only what is in the headlines given; do not invent detail. Mention anything from feeds tagged "tech" as worth noting for the podcast. Keep the news itself straight and accurate; put the wit in one or two asides and a closing barb. Never more than one barb per paragraph. Address them as "${addressee()}" once at most.`;
  try { return (await gemini(sys, raw, false)).trim(); } catch (e) { return null; }
}

async function papers(spokenOnly) {
  try { await papersInner(spokenOnly); }
  catch (e) { await tell("The papers fell apart in my hands: " + (e.message || e)); }
}
async function papersInner(spokenOnly) {
  let ps;
  try { ps = await fetchPapers(); } catch (e) { return await tell(P.papersEmpty + " " + (e.message || e)); }
  const any = ps.some(p => p.items.length);
  const failures = ps.filter(p => p.error).map(p => `${p.paper.n} ${p.error}`);
  if (!any) return await tell(P.papersEmpty + (failures.length ? " " + failures.join(". ") + "." : ""));
  const hasKey = Keychain.contains("valet.gemini");
  if (spokenOnly) {
    const text = hasKey ? (await papersBrief(ps)) || papersSpeech(ps) : papersSpeech(ps);
    return await tell(text);
  }
  const table = new UITable(); table.showSeparators = true;
  let next = null;
  table.addRow(row("The morning's papers. Tap a headline if you must know more.", null, null));
  if (hasKey) table.addRow(row("Read me the brief", "He summarises the lot", () => { next = async () => { const t = await papersBrief(ps); await tell(t || (lastMachineError ? "The machine wouldn't write it: " + lastMachineError : papersSpeech(ps))); }; }));
  table.addRow(row("Read me the headlines", null, () => { next = async () => { await tell(papersSpeech(ps)); }; }));
  ps.forEach(p => {
    table.addRow(header(p.paper.n));
    if (!p.items.length) { table.addRow(row(`Didn't arrive: ${p.error}`, null, null)); return; }
    p.items.forEach(i => table.addRow(row(i.title, i.summary || null, () => { next = () => Safari.open(i.link); })));
  });
  await table.present(false); if (next) await next();
}


// ───────────────────────── Taking more papers ─────────────────────────
// OPML is what Lire, Overcast, Pocket Casts and the rest export. It's a list
// of feeds; he reads the names and addresses out of it and lets you choose.
function parseOPML(xml) {
  const out = [];
  const outlines = xml.match(/<outline\b[^>]*\/?>/g) || [];
  for (const o of outlines) {
    const url = (o.match(/xmlUrl\s*=\s*"([^"]+)"/i) || o.match(/xmlUrl\s*=\s*'([^']+)'/i) || [])[1];
    if (!url) continue;
    let name = (o.match(/\btext\s*=\s*"([^"]*)"/i) || o.match(/\btitle\s*=\s*"([^"]*)"/i) || [])[1] || url;
    const type = ((o.match(/\btype\s*=\s*"([^"]*)"/i) || [])[1] || "").toLowerCase();
    out.push({ n: decode(name), u: decode(url), kind: type === "podcast" ? "podcast" : "" });
  }
  // Same feed twice in one file is common; keep the first.
  const seen = {};
  return out.filter(f => (seen[f.u] ? false : (seen[f.u] = true)));
}

async function importOPML() {
  let paths = [];
  try { paths = await DocumentPicker.open(["public.xml", "public.text", "public.data"]); }
  catch (e) { return; }
  if (!paths || !paths.length) return;
  let xml = "";
  try { xml = fm.readString(paths[0]); } catch (e) { return await tell("I couldn't read that file."); }
  const found = parseOPML(xml);
  if (!found.length) return await tell(P.opmlNone);

  // Anything already taken is marked so, and can't be taken twice.
  const chosen = {};
  let done = false, added = 0;
  while (!done) {
    const table = new UITable(); table.showSeparators = true;
    const pending = found.filter(f => chosen[f.u]).length;
    table.addRow(row(`${found.length} feeds in that file. Tap to choose; tap again to change your mind.`, pending ? `${pending} chosen` : null, null));
    let act = null;
    if (pending) table.addRow(row(`Take the ${pending} chosen`, null, () => { act = "take"; }));
    table.addRow(row("Take all of them", null, () => { act = "all"; }));
    found.forEach(f => {
      const have = S.feeds.some(x => x.u === f.u);
      table.addRow(row((chosen[f.u] ? "✓ " : "") + f.n, have ? "Already taken" : (f.kind === "podcast" ? "Podcast" : f.u.replace(/^https?:\/\//, "").slice(0, 40)), have ? null : () => { act = f; }));
    });
    await table.present(false);
    if (!act) return;                                  // dismissed
    if (act === "all") { found.forEach(f => { if (!S.feeds.some(x => x.u === f.u)) chosen[f.u] = f; }); act = "take"; }
    if (act === "take") {
      for (const u in chosen) { S.feeds.push(chosen[u]); added++; }
      save(); done = true;
    } else {
      if (chosen[act.u]) delete chosen[act.u]; else chosen[act.u] = act;
    }
  }
  if (added) await tell(P.opmlTaken(added));
}

// ───────────────────────── Notices ─────────────────────────
// He leaves word for later: the morning brief, the papers, and "the half" before engagements.
async function scheduleNotices() {
  try {
    const pending = await Notification.allPending();
    for (const n of pending) if (n.identifier && n.identifier.startsWith("valet.")) n.remove();
    const mk = (id, body, when) => {
      if (when <= new Date()) return;
      const n = new Notification(); n.identifier = id; n.title = S.valet; n.body = body; n.scriptName = Script.name(); n.sound = "default";
      n.setTriggerDate(when); n.schedule();
    };
    const at = (h, dayOffset) => { const d = new Date(); d.setDate(d.getDate() + dayOffset); d.setHours(h, 0, 0, 0); return d; };
    if (S.notices.brief) for (const off of [0, 1]) mk(`valet.brief.${off}`, P.briefNotice, at(S.notices.brief, off));
    if (S.notices.news) for (const off of [0, 1]) mk(`valet.news.${off}`, P.newsNotice, at(S.notices.news, off));
    if (S.notices.half) {
      const evs = [...(await eventsToday()), ...(await eventsTomorrow())].filter(e => !e.isAllDay);
      evs.slice(0, 12).forEach((e, i) => mk(`valet.half.${i}`, P.theHalf(e.title), new Date(e.startDate.getTime() - 30 * 60 * 1000)));
    }
  } catch (e) {}
}

// ───────────────────────── Understanding ─────────────────────────
async function handle(text) {
  const t = text.trim(); if (!t) return;
  const low = t.toLowerCase();
  let m;

  // Messages: "message Jackie running late", "text Pat ...", "whatsapp Ken ..."
  if ((m = low.match(/^(message|whatsapp|tell)\s+([a-z' -]+?)\s+(?:that\s+|to\s+say\s+)?(.+)$/))) return await sendWhatsApp(m[2], m[3]);
  if ((m = low.match(/^(text|sms)\s+([a-z' -]+?)\s+(?:that\s+)?(.+)$/))) return await sendText(m[2], m[3]);
  if ((m = low.match(/^(email|e-mail|mail|write to)\s+([a-z' -]+?)(?:\s+(?:about|re|saying)\s+(.+))?$/))) return await sendEmail(m[2], m[3] || "");
  if ((m = low.match(/^(ring|call|phone|telephone)\s+([a-z' -]+)$/))) return await ringUp(m[2]);

  // Reminders
  if ((m = low.match(/^remind me (?:to |that |about )?(.+)$/))) {
    const w = parseWhen(m[1]); await addReminder(w.rest, w.date, w.hasTime);
    return await tell(`${P.noted} ${cap(w.rest)}, ${niceDay(w.date)}${w.hasTime ? " at " + niceTime(w.date) : ""}.`);
  }
  if (/^(what('s| is) (outstanding|due|to do)|reminders|anything to do)/.test(low)) return await remindersTable();

  // The papers
  if (/^(read (me )?the (news|papers|headlines)|news brief|what('s| is) (in the news|happening)|the news)/.test(low)) return await papers(true);
  if (/^(news|papers|headlines|the papers)$/.test(low)) return await papers(false);

  // Diary
  if (/^(what('s| is) on|diary|engagements|what have i got)/.test(low)) {
    if (/tomorrow/.test(low)) return await readEvents(await eventsTomorrow(), "tomorrow");
    if (/week/.test(low)) return await readEvents(await eventsWeek(), "this week");
    return await readEvents((await eventsToday()).filter(e => e.endDate > new Date()), "today");
  }
  if ((m = low.match(/^(?:add|put|note|book|diary)\s+(.+)$/))) {
    const w = parseWhen(m[1]); if (!w.found) return await tell("When would that be?");
    await addEvent(w.rest, w.date, w.hasTime);
    return await tell(`${P.noted} ${cap(w.rest)}, ${niceDay(w.date)}${w.hasTime ? " at " + niceTime(w.date) : ""}.`);
  }

  // Apps and duties
  const name = low.replace(/^(bring me|bring|fetch|open|get me|get|the)\s+/, "").replace(/^the\s+/, "").trim();
  const app = findApp(name); if (app) return await fetchApp(app);
  const duty = DUTIES.find(d => d.name.toLowerCase().includes(name) || d.id.includes(name)); if (duty) return await openDuty(duty);

  // Remembering and recalling
  if ((m = low.match(/^(remember|note|keep in mind|don't forget)(?: that)?\s+(.+)$/))) { remember(m[2], "told"); return await tell(P.remembered); }
  if ((m = low.match(/^(what did i (?:say|tell you) about|what do you know about|what was i meant to do about)\s+(.+?)\??$/))) {
    const hits = searchNotes(m[2]);
    if (!hits.length) return await tell(P.cantRecall);
    return await tell(hits.map(h => `${h.at.slice(0, 10)}: ${h.t}`).join(". "));
  }

  // Anything else becomes conversation, if there's a key.
  if (Keychain.contains("valet.gemini")) {
    const j = await converse(t);
    turns.push({ who: "him", text: t });
    const reply = await carryOut(j, t);
    if (reply === null) return;
    turns.push({ who: "you", text: reply });
    return await tell(reply);
  }
  return await tell(P.noIdea);
}

async function sendWhatsApp(who, body) {
  const c = await findContact(who); const name = c ? c.givenName : cap(who);
  // Prefer the Shortcut, which sends without showing WhatsApp.
  try {
    const cb = new CallbackURL("shortcuts://x-callback-url/run-shortcut");
    cb.addParameter("name", WHATSAPP_SHORTCUT); cb.addParameter("input", "text"); cb.addParameter("text", `${name}|${body}`);
    say(P.dispatched); await cb.open(); return;
  } catch (e) {
    const num = c ? firstPhone(c) : null;
    const url = num ? `whatsapp://send?phone=${num.replace(/[^\d+]/g, "")}&text=${encodeURIComponent(body)}` : `whatsapp://send?text=${encodeURIComponent(body)}`;
    say(P.fetching("WhatsApp")); await Safari.open(url);
  }
}
async function sendText(who, body) {
  const c = await findContact(who); if (!c) return await tell(P.noSuch(cap(who)));
  const num = firstPhone(c); if (!num) return await tell(P.noNumber(c.givenName));
  const msg = new Message(); msg.recipients = [num]; msg.body = cap(body);
  say("Ready to send. It only wants your thumb."); await msg.send(); say(P.dispatched);
}
async function sendEmail(who, about) {
  const c = await findContact(who); if (!c) return await tell(P.noSuch(cap(who)));
  const em = firstEmail(c); if (!em) return await tell(P.noEmail(c.givenName));
  const mail = new Mail(); mail.toRecipients = [em]; mail.subject = cap(about); mail.body = "";
  say("Ready to send. It only wants your thumb."); await mail.send(); say(P.dispatched);
}
async function ringUp(who) {
  const c = await findContact(who); if (!c) return await tell(P.noSuch(cap(who)));
  const num = firstPhone(c); if (!num) return await tell(P.noNumber(c.givenName));
  say(`Ringing ${c.givenName}. Do speak up.`); await Safari.open(`tel:${num.replace(/[^\d+]/g, "")}`);
}
async function readEvents(list, label) {
  if (!list.length) return await tell(`Nothing ${label}.`);
  const lines = list.map(e => `${e.title}${e.isAllDay ? "" : ", " + niceTime(e.startDate)}${label === "this week" ? " " + niceDay(e.startDate) : ""}`);
  await tell(`${cap(label)}: ${lines.join(". ")}.`);
}


// ───────────────────────── The thinking machine ─────────────────────────
const GEMINI_CANDIDATES = ["gemini-flash-latest", "gemini-flash-lite-latest", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];
let lastMachineError = "";
async function gemini(sys, text, wantJson) {
  const key = Keychain.get("valet.gemini");
  const models = [S.model, ...GEMINI_CANDIDATES.filter(m => m !== S.model)];
  for (const model of models) {
    const req = new Request(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`);
    req.method = "POST"; req.timeoutInterval = 20; req.headers = { "Content-Type": "application/json" };
    const body = { system_instruction: { parts: [{ text: sys }] }, contents: [{ parts: [{ text }] }] };
    if (wantJson) body.generationConfig = { response_mime_type: "application/json" };
    req.body = JSON.stringify(body);
    let res, code;
    for (let attempt = 0; attempt < 2; attempt++) {
      try { res = await req.loadJSON(); code = req.response.statusCode; } catch (e) { lastMachineError = "No reply from Google: " + (e.message || e); code = 0; }
      if (code === 503 || code === 429 || code === 0) { await new Promise(r => Timer.schedule(1500, false, r)); continue; } // busy: pause and try once more
      break;
    }
    if (code === 404) { lastMachineError = `Model ${model} not found.`; continue; } // try the next name
    if (code === 503 || code === 429) { lastMachineError = `${model} is busy (${code}).`; continue; } // try a sibling
    if (code !== 200) { lastMachineError = (res && res.error && res.error.message) ? `Google said ${code}: ${res.error.message}` : `Google said ${code}.`; throw new Error(lastMachineError); }
    try {
      const out = res.candidates[0].content.parts[0].text;
      if (model !== S.model) { S.model = model; save(); }
      lastMachineError = "";
      return out;
    } catch (e) { lastMachineError = "Google replied, but not with words I could use."; throw new Error(lastMachineError); }
  }
  throw new Error(lastMachineError || "No model would answer.");
}

// ───────────────────────── Screens ─────────────────────────
function row(title, subtitle, onSelect, dismiss = true) {
  const r = new UITableRow(); r.height = subtitle ? 70 : 54;
  const c = subtitle ? UITableCell.text(title, subtitle) : UITableCell.text(title); c.leftAligned(); r.addCell(c);
  if (onSelect) { r.onSelect = onSelect; r.dismissOnSelect = dismiss; }
  return r;
}
function header(text) { const r = new UITableRow(); r.isHeader = true; r.height = 40; r.addCell(UITableCell.text(text)); return r; }

async function askTyped() {
  const a = new Alert(); a.title = S.valet; a.message = "Yes?"; a.addTextField("Message Jackie running late", "");
  a.addAction("Go"); a.addCancelAction("Never mind");
  if ((await a.present()) === 0) await handle(a.textFieldValue(0));
}
async function askSpoken() {
  say(P.listening);
  try { const t = await Dictation.start("en-GB"); if (t) await handle(t); } catch (e) {}
}

async function home() {
  while (true) {
    const b = await brief(); const sug = suggestion();
    const table = new UITable(); table.showSeparators = true;
    table.addRow(row(b.text + " " + P.fetch(sug.n), null, null));
    let action = null;
    table.addRow(row(`Yes, ${sug.n}`, null, () => { action = () => fetchApp(sug); }));
    table.addRow(row("Ask him", "Type a request", () => { action = askTyped; }));
    table.addRow(row("Speak to him", "Dictate a request", () => { action = askSpoken; }));
    if (Keychain.contains("valet.gemini")) table.addRow(row("Talk with him", "Back and forth, until you're done", () => { action = () => conversation(""); }));
    table.addRow(row("The papers", "Headlines, or a brief", () => { action = () => papers(false); }));
    table.addRow(row("Something else", "The household", () => { action = household; }));
    if (b.today.length) { table.addRow(header("Later today")); b.today.forEach(e => table.addRow(row(e.title, e.isAllDay ? "All day" : niceTime(e.startDate), null))); }
    if (b.due.length) {
      table.addRow(header("Due today — tap to tick off"));
      b.due.forEach(r => table.addRow(row(r.title, r.dueDate && sameDay(r.dueDate, new Date()) && r.dueDate.getHours() ? niceTime(r.dueDate) : null, () => { action = async () => { r.isCompleted = true; r.save(); say(P.done); }; })));
    }
    say(b.text + " " + P.fetch(sug.n));
    await table.present(false);
    if (!action) return; // dismissed — he withdraws
    await action();
    if (config.runsWithSiri) return;
  }
}

async function household() {
  const table = new UITable(); table.showSeparators = true;
  table.addRow(row(P.householdAside, null, null));
  let next = null;
  DUTIES.forEach(d => table.addRow(row(d.name, d.aside, () => { next = () => openDuty(d); })));
  table.addRow(row("Below stairs", "Settings and arrangements", () => { next = belowStairs; }));
  await table.present(false);
  if (next) await next();
}

async function openDuty(d) {
  if (d.id === "diary") return await diaryTable();
  if (d.id === "reminders") return await remindersTable();
  if (d.id === "papers") return await papers(false);
  if (d.id === "correspondence") return await correspondence();
  const table = new UITable(); table.showSeparators = true; table.addRow(row(d.aside, null, null));
  let next = null;
  S.apps.filter(a => a.d === d.id).forEach(a => table.addRow(row(a.n, null, () => { next = () => fetchApp(a); })));
  await table.present(false); if (next) await next();
}

async function correspondence() {
  const table = new UITable(); table.showSeparators = true;
  table.addRow(row("Letters, messages and the telephone.", null, null));
  let next = null;
  table.addRow(row("Send a WhatsApp", "Say who and what", () => { next = () => promptSend("message"); }));
  table.addRow(row("Send a text", null, () => { next = () => promptSend("text"); }));
  table.addRow(row("Write an email", null, () => { next = () => promptSend("email"); }));
  table.addRow(row("Ring someone", null, () => { next = () => promptSend("ring"); }));
  S.apps.filter(a => a.d === "correspondence").forEach(a => table.addRow(row(a.n, null, () => { next = () => fetchApp(a); })));
  await table.present(false); if (next) await next();
}
async function promptSend(kind) {
  const a = new Alert(); a.title = S.valet;
  a.message = kind === "ring" ? "Whom shall I ring?" : "To whom, and what shall I say?";
  a.addTextField(kind === "ring" ? "Jackie" : "Jackie, running ten minutes late", "");
  a.addAction("Very good"); a.addCancelAction("Never mind");
  if ((await a.present()) !== 0) return;
  const v = a.textFieldValue(0).trim(); if (!v) return;
  if (kind === "ring") return await ringUp(v);
  const parts = v.split(/,\s*/); const who = parts.shift(); const body = parts.join(", ");
  await handle(`${kind} ${who} ${body}`);
}

async function diaryTable() {
  const list = await eventsWeek(); const table = new UITable(); table.showSeparators = true;
  table.addRow(row(list.length ? "The week ahead. Brace yourself." : P.diaryEmpty, null, null));
  let next = null;
  table.addRow(row("Make an entry", "Say what and when", () => { next = async () => { const a = new Alert(); a.title = "An entry"; a.addTextField("Dentist Tuesday at 2", ""); a.addAction("Note it"); a.addCancelAction("Never mind"); if ((await a.present()) === 0) await handle("add " + a.textFieldValue(0)); }; }));
  list.forEach(e => table.addRow(row(e.title, `${cap(niceDay(e.startDate))}${e.isAllDay ? "" : ", " + niceTime(e.startDate)}`, () => { next = async () => {
    const a = new Alert(); a.title = e.title; a.message = `${cap(niceDay(e.startDate))}${e.isAllDay ? "" : ", " + niceTime(e.startDate)}`; a.addDestructiveAction("Strike it out"); a.addCancelAction("Leave it");
    if ((await a.present()) === 0) { e.remove(); say(P.struck); }
  }; })));
  await table.present(false); if (next) await next();
}

async function remindersTable() {
  const all = (await Reminder.allIncomplete()).sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0)).slice(0, 25);
  const table = new UITable(); table.showSeparators = true;
  table.addRow(row(all.length ? "Outstanding. Tap one to tick it off, and I shall pretend not to be surprised." : P.remindersEmpty, null, null));
  let next = null;
  table.addRow(row("Add one", null, () => { next = async () => { const a = new Alert(); a.title = "Not to be forgotten"; a.addTextField("Invoice DigiCoach on Friday", ""); a.addAction("Note it"); a.addCancelAction("Never mind"); if ((await a.present()) === 0) await handle("remind me to " + a.textFieldValue(0)); }; }));
  all.forEach(r => table.addRow(row(r.title, r.dueDate ? cap(niceDay(r.dueDate)) : null, () => { next = async () => { r.isCompleted = true; r.save(); say(P.done); }; })));
  await table.present(false); if (next) await next();
}

async function belowStairs() {
  const table = new UITable(); table.showSeparators = true;
  table.addRow(row(`Arrangements you'd rather not think about. I've noticed. This is edition ${VERSION}.`, null, null));
  let next = null;
  table.addRow(row("Read aloud", S.speak ? "On" : "Off", () => { next = async () => { S.speak = !S.speak; save(); say(`Read aloud is ${S.speak ? "on" : "off"}.`); }; }));
  table.addRow(row("The weather", S.place ? "Fixed to " + S.place : "From wherever you happen to be", () => { next = async () => {
    const a = new Alert(); a.title = "The weather";
    a.message = "By default I use the telephone's location. If that's off, name a town and I'll use it instead." + (lastWeatherError ? "\n\nLast failure: " + lastWeatherError : "");
    a.addTextField("Town, e.g. Sligo", S.place || "");
    a.addAction("Try it now"); a.addAction("Keep it"); if (S.place) a.addDestructiveAction("Back to my location"); a.addCancelAction("Never mind");
    const i = await a.present(); if (i === -1) return;
    if (S.place && i === 2) { delete S.place; delete S.lat; delete S.lon; save(); const c = readCache(); delete c.wxAt; writeCache(c); return await tell("As you were."); }
    const town = a.textFieldValue(0).trim();
    if (town && town !== S.place) {
      try {
        const g = await Location.geocode(town);
        if (!g || !g.length) return await tell("I can't find " + town + " on any map of mine.");
        S.place = town; S.lat = g[0].latitude; S.lon = g[0].longitude; save();
        const c = readCache(); delete c.wxAt; writeCache(c);
      } catch (e) { return await tell("I couldn't look that up: " + (e.message || e)); }
    }
    if (i === 0) {
      const wx = await outlook();
      await tell(wx ? (weatherLine(wx) || "Nothing worth remarking on.") : "Still no weather. " + (lastWeatherError || ""));
    } else { await tell(P.arranged); }
  }; }));
  table.addRow(row("His voice", hasEleven() ? (lastVoiceError ? "ElevenLabs — last attempt failed, tap for details" : "ElevenLabs") : "The telephone's own voice", () => { next = hisVoice; }));
  table.addRow(row("His name and how he addresses you", null, () => { next = () => introduce(true); }));
  table.addRow(row("The staff", "Apps and their addresses", () => { next = staff; }));
  table.addRow(row("The newsagent", `${S.feeds.length} papers taken`, () => { next = newsagent; }));
  table.addRow(row("What he remembers", `${J.notes.length} notes, ${J.acts.length} actions`, () => { next = journalScreen; }));
  table.addRow(row("His records", "Files from your own apps that he may read", () => { next = recordsScreen; }));
  table.addRow(row("Arrangements", noticesSummary(), () => { next = arrangements; }));
  table.addRow(row("The thinking machine", Keychain.contains("valet.gemini") ? (lastMachineError ? "Key held — last attempt failed, tap for details" : `Key held, using ${S.model}`) : "No key", () => { next = async () => {
    const a = new Alert(); a.title = "The thinking machine";
    a.message = (Keychain.contains("valet.gemini") ? "A Gemini key is held. Paste a new one to replace it, or leave blank to keep it." : "Paste your Gemini key from aistudio.google.com. It goes in the Keychain, not the file.") + (lastMachineError ? "\n\nLast failure: " + lastMachineError : "");
    a.addSecureTextField("Key", ""); a.addAction("Keep it"); a.addAction("Test it"); a.addCancelAction("Never mind");
    const i = await a.present(); if (i === -1) return;
    const k = a.textFieldValue(0).trim(); if (k) Keychain.set("valet.gemini", k);
    if (!Keychain.contains("valet.gemini")) { await tell(P.noKey); return; }
    if (i === 0) { say(P.keySaved); return; }
    try { const out = await gemini("Reply in one short dry sentence, as an English butler.", "Are you there?", false); await tell(`It answers, via ${S.model}: ${out.trim()}`); }
    catch (e) { await tell("It doesn't answer. " + (lastMachineError || e.message || "")); }
  }; }));
  table.addRow(row("Forget the routine he's learned", null, () => { next = async () => { S.routine = {}; save(); say(P.forgot); }; }));
  table.addRow(row("Dismiss him and start again", null, () => { next = async () => {
    const a = new Alert(); a.message = "Dismiss him entirely? Staff and routine will go. Your Calendar and Reminders are untouched, which is more than can be said for his feelings."; a.addDestructiveAction("Dismiss"); a.addCancelAction("Keep him");
    if ((await a.present()) === 0) { fm.remove(statePath); S = load(); await introduce(false); }
  }; }));
  await table.present(false); if (next) await next();
}

async function staff() {
  const table = new UITable(); table.showSeparators = true;
  table.addRow(row("Each app has an address: a scheme like whatsapp://, a web link, or a Shortcuts link for the awkward ones.", null, null));
  let next = null;
  table.addRow(row("Take on someone new", null, () => { next = () => editApp(null); }));
  S.apps.forEach(a => table.addRow(row(a.n, (DUTIES.find(d => d.id === a.d) || {}).name, () => { next = () => editApp(a); })));
  await table.present(false); if (next) await next();
}
async function editApp(a) {
  const al = new Alert(); al.title = a ? a.n : "Someone new";
  al.addTextField("Name", a ? a.n : ""); al.addTextField("Address", a ? a.u : "");
  al.addTextField("Duty: correspondence, study, wireless or errands", a ? a.d : "study");
  al.addAction("Very good"); if (a) al.addDestructiveAction("Let them go"); al.addCancelAction("Never mind");
  const i = await al.present();
  if (i === 0) {
    const n = al.textFieldValue(0).trim(), u = al.textFieldValue(1).trim(), d = al.textFieldValue(2).trim().toLowerCase() || "study";
    if (!n || !u) return;
    if (a) { a.n = n; a.u = u; a.d = d; } else S.apps.push({ n, u, d });
    save(); say("Very good.");
  } else if (a && i === 1) { S.apps = S.apps.filter(x => x !== a); save(); say("Let go. I've written them a reference; it was brief."); }
}

async function journalScreen() {
  const table = new UITable(); table.showSeparators = true;
  table.addRow(row(J.notes.length ? "Things you've told me. Tap one to strike it out." : P.journalEmpty, null, null));
  let next = null;
  table.addRow(row("Tell me something to keep", null, () => { next = async () => {
    const a = new Alert(); a.title = "To keep"; a.addTextField("Pat prefers Tuesdays for recording", ""); a.addAction("Keep it"); a.addCancelAction("Never mind");
    if ((await a.present()) === 0) { const v = a.textFieldValue(0).trim(); if (v) { remember(v, "told"); say(P.remembered); } }
  }; }));
  J.notes.slice().reverse().slice(0, 40).forEach(n => table.addRow(row(n.t, n.at.slice(0, 10), () => { next = async () => {
    const a = new Alert(); a.message = n.t; a.addDestructiveAction("Forget it"); a.addCancelAction("Keep it");
    if ((await a.present()) === 0) { J.notes = J.notes.filter(x => x !== n); saveJournal(); say(P.forgotten); }
  }; })));
  if (J.notes.length) table.addRow(row("Forget everything", "Notes and actions both", () => { next = async () => {
    const a = new Alert(); a.message = "Forget everything you've told me? Your diary and reminders are untouched."; a.addDestructiveAction("Forget it all"); a.addCancelAction("Never mind");
    if ((await a.present()) === 0) { J = { notes: [], acts: [] }; saveJournal(); say(P.forgotten); }
  }; }));
  await table.present(false); if (next) await next();
}

async function recordsScreen() {
  const files = (() => { try { return fm.listContents(projectsDir); } catch (e) { return []; } })();
  const table = new UITable(); table.showSeparators = true;
  table.addRow(row("Put backup files from your own apps into the valet/projects folder in Scriptable's iCloud storage, and I'll read them when you ask.", null, null));
  table.addRow(row("Admin Tracker backups are recognised. Only IDs, status, coach, dates, onboarding ticks and preferences go to the thinking machine. Names, contact details, vision, hearing and notes stay on the telephone; I put the names back before I speak.", null, null));
  table.addRow(row(files.length ? `${files.length} on file` : "Nothing on file yet", files.length ? files.join(", ") : null, null));
  await table.present(false);
}

async function newsagent() {
  const table = new UITable(); table.showSeparators = true;
  table.addRow(row("The papers he takes. Any RSS or Atom feed will do — most news sites have one.", null, null));
  let next = null;
  table.addRow(row("Take another paper", "One address at a time", () => { next = () => editFeed(null); }));
  table.addRow(row("Import a list", "An OPML file from Lire, Overcast or similar", () => { next = importOPML; }));
  S.feeds.forEach(f => table.addRow(row(f.n, [f.kind === "podcast" ? "Podcast" : null, f.tag ? "Flagged for the podcast" : null].filter(Boolean).join(" · ") || null, () => { next = () => editFeed(f); })));
  await table.present(false); if (next) await next();
}
async function editFeed(f) {
  const al = new Alert(); al.title = f ? f.n : "Another paper";
  al.addTextField("Name", f ? f.n : ""); al.addTextField("Feed address", f ? f.u : "https://");
  al.addTextField("Type tech to flag it for the podcast", f && f.tag ? f.tag : "");
  al.addAction("Very good"); if (f) al.addDestructiveAction("Cancel the subscription"); al.addCancelAction("Never mind");
  const i = await al.present();
  if (i === 0) {
    const n = al.textFieldValue(0).trim(), u = al.textFieldValue(1).trim(), tag = al.textFieldValue(2).trim().toLowerCase() || undefined;
    if (!n || !u) return;
    if (f) { f.n = n; f.u = u; f.tag = tag; } else S.feeds.push({ n, u, tag });
    if (f && /podcast|episode/i.test(tag || "")) f.kind = "podcast";
    save(); say("Very good.");
  } else if (f && i === 1) { S.feeds = S.feeds.filter(x => x !== f); save(); say("Cancelled."); }
}

async function hisVoice() {
  // Step one: the key.
  const a = new Alert(); a.title = "His voice, step one";
  a.message = Keychain.contains("valet.eleven")
    ? "An ElevenLabs key is already held. Paste a new one to replace it, or leave it blank to keep it."
    : "Paste your ElevenLabs API key. It goes in the Keychain, not the file.";
  a.addSecureTextField("API key", "");
  a.addAction("Next"); a.addCancelAction("Never mind");
  if ((await a.present()) !== 0) return;
  const k = a.textFieldValue(0).trim();
  if (k) Keychain.set("valet.eleven", k);
  if (!Keychain.contains("valet.eleven")) { await tell("No key, no voice. I'll wait."); return; }

  // Step two: the voice.
  const b = new Alert(); b.title = "His voice, step two";
  b.message = voiceId() ? `The voice on file ends in ${voiceId().slice(-4)}. Paste a different Voice ID to change it, or leave it to keep it.` : "Paste the Voice ID from your ElevenLabs dashboard.";
  b.addTextField("Voice ID", voiceId());
  b.addAction("Next"); if (voiceId()) b.addDestructiveAction("Back to the telephone's voice"); b.addCancelAction("Never mind");
  const bi = await b.present();
  if (bi === -1) return;
  if (voiceId() && bi === 1) { S.voiceId = ""; if (Keychain.contains("valet.voice")) Keychain.remove("valet.voice"); save(); clearVoiceCache(); Speech.speak("As you were."); return; }
  const v = b.textFieldValue(0).replace(/\s+/g, "");
  if (!v) { await tell("A blank Voice ID. Bold, but I can't speak with it."); return; }
  if (v !== S.voiceId) { S.voiceId = v; save(); clearVoiceCache(); }

  // Step three: the pace.
  const c = new Alert(); c.title = "His voice, step three";
  c.message = "How fast he speaks. 0.7 is slow, 1.0 is normal, 1.2 is brisk.";
  c.addTextField("Speed", String(voiceSpeed()));
  c.addAction("Try the voice"); c.addAction("Keep it"); c.addCancelAction("Never mind");
  const ci = await c.present();
  if (ci === -1) return;
  const sp = parseFloat(c.textFieldValue(0));
  if (!isNaN(sp) && sp >= 0.7 && sp <= 1.2 && sp !== voiceSpeed()) { S.voiceSpeed = sp; save(); clearVoiceCache(); }
  const kept = `Voice ending ${v.slice(-4)}, speed ${voiceSpeed()}. Kept.`;
  if (ci === 0) {
    lastVoiceError = "";
    const line = `Good ${new Date().getHours() < 12 ? "morning" : "afternoon"}, ${addressee()}. Will this do, or shall I try to sound more pleased about it?`;
    say(line);
    try { await lastSpeech; } catch (e) {}
    if (lastVoiceError) {
      const d = new Alert(); d.title = "That didn't work"; d.message = lastVoiceError + "\n\nIf the audio was fetched, I can play it another way to prove the voice itself is fine.";
      d.addAction("Play it the other way"); d.addCancelAction("Leave it");
      if ((await d.present()) === 0) {
        try { const data = await elevenAudio(line); const p = fm.joinPath(voiceDir, "test.mp3"); fm.write(p, data); await QuickLook.present(p); }
        catch (e) { await tell("Couldn't fetch it either: " + (e.message || e)); }
      }
    } else {
      const d = new Alert(); d.message = kept; d.addAction("Very good"); await d.present();
    }
  } else {
    await tell(kept);
  }
  warmCache();
}

function hourWord(h) { return h ? `${h % 12 || 12} ${h < 12 ? "in the morning" : h < 18 ? "in the afternoon" : "in the evening"}` : "not at all"; }
function noticesSummary() { return `Brief ${hourWord(S.notices.brief)}; papers ${hourWord(S.notices.news)}; the half ${S.notices.half ? "on" : "off"}`; }
async function arrangements() {
  const table = new UITable(); table.showSeparators = true;
  table.addRow(row("Word he leaves for you as notifications. Tap one to change it.", null, null));
  let next = null;
  const pickHour = async (label, cur, set) => {
    const a = new Alert(); a.title = label; a.message = "Hour on the 24-hour clock, or 0 for not at all."; a.addTextField("8", String(cur)); a.addAction("Arrange it"); a.addCancelAction("Never mind");
    if ((await a.present()) === 0) { const h = parseInt(a.textFieldValue(0), 10); if (!isNaN(h) && h >= 0 && h <= 23) { set(h); save(); await scheduleNotices(); say(P.arranged); } }
  };
  table.addRow(row("The morning brief", hourWord(S.notices.brief), () => { next = () => pickHour("The morning brief", S.notices.brief, h => S.notices.brief = h); }));
  table.addRow(row("The papers", hourWord(S.notices.news), () => { next = () => pickHour("The papers", S.notices.news, h => S.notices.news = h); }));
  table.addRow(row("The half", S.notices.half ? "Thirty minutes before each engagement" : "Off", () => { next = async () => { S.notices.half = !S.notices.half; save(); await scheduleNotices(); say(P.arranged); }; }));
  await table.present(false); if (next) await next();
}

// ───────────────────────── Introduction ─────────────────────────
async function introduce(again) {
  const a = new Alert(); a.title = again ? "Of course." : "An introduction";
  a.message = again ? "What would you have me called?" : P.introFirst; say(a.message);
  a.addTextField("His name", S.valet || ""); a.addAction("Very good");
  await a.present(); const n = a.textFieldValue(0).trim(); if (!n) return introduce(again);
  S.valet = n;
  const b = new Alert(); b.title = n; b.message = P.introSecond(n); say(b.message);
  b.addAction("Sir"); b.addAction("Madam"); b.addAction("By my first name"); b.addAction("Something else");
  const i = await b.present();
  if (i === 0) S.address = "sir"; else if (i === 1) S.address = "madam";
  else {
    const c = new Alert(); c.title = n; c.message = i === 2 ? "And your first name?" : "What, exactly?"; c.addTextField("", ""); c.addAction("That will do");
    await c.present(); const v = c.textFieldValue(0).trim();
    if (i === 2) { S.address = "name"; S.name = v || "sir"; } else { S.address = "custom"; S.custom = v || "sir"; }
  }
  S.introduced = true; save();
  await tell(P.introDone(addressee()));
}


const widgetCache = fm.joinPath(dir, "widget-cache.json");
function readCache() {
  try { if (fm.fileExists(widgetCache)) { fm.downloadFileFromiCloud(widgetCache); return JSON.parse(fm.readString(widgetCache)); } } catch (e) {}
  return {};
}
function writeCache(o) { try { fm.writeString(widgetCache, JSON.stringify(o)); } catch (e) {} }

// ───────────────────────── Weather and daylight ─────────────────────────
// Scriptable has these built in; no key, no relay. Cached so the widget
// isn't forever asking.
let lastWeatherError = "";
// Open-Meteo: free, no key. Scriptable's own Weather object relied on Dark Sky,
// which Apple closed, so it no longer exists.
const WMO = {
  0: "clear", 1: "mostly clear", 2: "partly cloudy", 3: "overcast",
  45: "foggy", 48: "foggy", 51: "drizzling", 53: "drizzling", 55: "drizzling",
  56: "freezing drizzle", 57: "freezing drizzle",
  61: "raining", 63: "raining", 65: "raining heavily",
  66: "freezing rain", 67: "freezing rain",
  71: "snowing", 73: "snowing", 75: "snowing heavily", 77: "snow grains",
  80: "showery", 81: "showery", 82: "heavy showers",
  85: "snow showers", 86: "snow showers",
  95: "thundery", 96: "thundery", 99: "thundery"
};
async function outlook() {
  const cache = readCache();
  const fresh = cache.wxAt && (Date.now() - new Date(cache.wxAt) < 90 * 60 * 1000);
  if (fresh && cache.wx) return cache.wx;
  try {
    let lat = S.lat, lon = S.lon;
    if (lat == null || lon == null) {
      Location.setAccuracyToHundredMeters();
      const loc = await Location.current();
      lat = loc.latitude; lon = loc.longitude;
    }
    const url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat.toFixed(3) + "&longitude=" + lon.toFixed(3) +
      "&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset" +
      "&timezone=auto&forecast_days=1";
    const req = new Request(url); req.timeoutInterval = 12;
    const j = await req.loadJSON();
    if (!j || !j.current) throw new Error("no reading");
    const wx = {
      now: Math.round(j.current.temperature_2m),
      word: WMO[j.current.weather_code] || "",
      high: j.daily ? Math.round(j.daily.temperature_2m_max[0]) : null,
      low: j.daily ? Math.round(j.daily.temperature_2m_min[0]) : null,
      rain: j.daily && j.daily.precipitation_probability_max ? j.daily.precipitation_probability_max[0] : null,
      sunrise: j.daily && j.daily.sunrise ? new Date(j.daily.sunrise[0]).toISOString() : null,
      sunset: j.daily && j.daily.sunset ? new Date(j.daily.sunset[0]).toISOString() : null
    };
    lastWeatherError = "";
    cache.wx = wx; cache.wxAt = new Date().toISOString(); writeCache(cache);
    return wx;
  } catch (e) {
    lastWeatherError = String((e && e.message) || e);
    return (cache && cache.wx) || null;
  }
}
// One short sentence about the weather, or nothing at all.
function weatherLine(wx) {
  if (!wx) return "";
  const bits = [];
  if (wx.word && wx.now != null) bits.push(cap(wx.word) + " and " + wx.now + " degrees");
  else if (wx.now != null) bits.push(wx.now + " degrees");
  if (wx.rain != null && wx.rain >= 40) bits.push((wx.rain >= 70 ? "rain likely" : "rain a fair possibility"));
  let s = bits.join(", ");
  // Daylight, when it matters.
  const h = new Date().getHours();
  if (wx.sunset && h >= 13 && h < 20) {
    const ss = new Date(wx.sunset);
    if (ss > new Date()) s += (s ? ". " : "") + "Dark by " + niceTime(ss).replace(/ in the (morning|afternoon|evening)/, "");
  } else if (wx.sunrise && h < 9) {
    const sr = new Date(wx.sunrise);
    if (sr > new Date()) s += (s ? ". " : "") + "Light at " + niceTime(sr).replace(/ in the (morning|afternoon|evening)/, "");
  }
  return s ? s + "." : "";
}


// How long before he ought to leave for the next thing with an address.
async function leaveBy(events) {
  try {
    const e = (events || []).filter(x => !x.isAllDay && x.location && x.startDate > new Date())[0];
    if (!e) return "";
    const mins = Math.round((e.startDate - new Date()) / 60000);
    if (mins > 240 || mins < 0) return "";
    Location.setAccuracyToHundredMeters();
    const here = await Location.current();
    const there = await Location.geocode(e.location);
    if (!there || !there.length) return "";
    const d = distanceKm(here.latitude, here.longitude, there[0].latitude, there[0].longitude);
    if (d < 0.4) return "";
    const travel = Math.max(5, Math.round(d / 40 * 60) + 5); // rough road time, plus a margin
    const spare = mins - travel;
    if (spare <= 0) return "You are already late for " + e.title + ".";
    if (spare <= 30) return "You'll want to leave in about " + spare + " minutes.";
    return "";
  } catch (e) { return ""; }
}
function distanceKm(a1, o1, a2, o2) {
  const R = 6371, r = Math.PI / 180;
  const dA = (a2 - a1) * r, dO = (o2 - o1) * r;
  const h = Math.sin(dA / 2) ** 2 + Math.cos(a1 * r) * Math.cos(a2 * r) * Math.sin(dO / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}


// ───────────────────────── What he notices ─────────────────────────
// Facts the brief can use when they earn a place, and stay quiet about
// otherwise. Countdowns, birthdays, things going stale, patterns in the
// diary, and hours from his records.
function daysUntil(d) { const t = new Date(); t.setHours(0,0,0,0); const x = new Date(d); x.setHours(0,0,0,0); return Math.round((x - t) / 86400000); }

// Anything in the diary far enough ahead to be worth counting down to.
async function countdowns() {
  const out = [];
  try {
    const from = new Date(), to = new Date(); to.setDate(from.getDate() + 120);
    const evs = await CalendarEvent.between(from, to);
    for (const e of evs) {
      const d = daysUntil(e.startDate);
      if (d >= 2 && (d <= 30 || [45, 60, 90, 100].includes(d))) out.push({ title: e.title, days: d });
    }
  } catch (e) {}
  // Only the nearest few, and only ones worth mentioning: a round number or close.
  return out.sort((a, b) => a.days - b.days).filter(c => c.days <= 14 || c.days % 10 === 0).slice(0, 2);
}

async function birthdaysSoon() {
  const out = [];
  try {
    if (!contactCache) { const cs = await ContactsContainer.all(); contactCache = await Contact.all(cs); }
    const now = new Date();
    for (const c of contactCache) {
      const b = c.birthday; if (!b) continue;
      const d = new Date(b); const next = new Date(now.getFullYear(), d.getMonth(), d.getDate());
      if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) next.setFullYear(now.getFullYear() + 1);
      const days = daysUntil(next);
      if (days <= 7) out.push({ name: (c.givenName || "").trim() || (c.familyName || ""), days });
    }
  } catch (e) {}
  return out.sort((a, b) => a.days - b.days).slice(0, 2);
}

// Reminders that have been sitting there a while.
function staleReminders(due) {
  const out = [];
  for (const r of due || []) {
    if (!r.creationDate) continue;
    const age = Math.round((Date.now() - new Date(r.creationDate)) / 86400000);
    if (age >= 7) out.push({ title: r.title, days: age });
  }
  return out.sort((a, b) => b.days - a.days).slice(0, 1);
}

// Patterns worth a remark: empty stretches, a recurring engagement's tally.
async function patterns(today, tom) {
  const out = [];
  try {
    const back = new Date(); back.setDate(back.getDate() - 3);
    const recent = await CalendarEvent.between(back, new Date());
    if (!recent.length && !today.length && !tom.length) out.push("Nothing in the diary for three days running.");
    if (today.length) {
      const first = new Date(); first.setDate(1); first.setHours(0,0,0,0);
      const month = await CalendarEvent.between(first, new Date());
      const same = month.filter(e => e.title.toLowerCase() === today[0].title.toLowerCase()).length;
      if (same >= 3) out.push(`That's the ${same === 3 ? "third" : same === 4 ? "fourth" : same + "th"} ${today[0].title} this month.`);
    }
  } catch (e) {}
  return out;
}

// Hours from a Timesheet backup, if one is in his records.
// The app keeps a week per key, dated to that week's Monday, each holding
// entries of {day, task, time}. The weekly cap is effective-dated in mxh:
// an ascending list of {from, max}, so past weeks keep the cap they were
// logged under. Backups may be a flat object of those keys or wrap them.
function mondayKey(d) {
  const x = new Date(d), day = x.getDay();
  x.setDate(x.getDate() - day + (day === 0 ? -6 : 1));
  x.setHours(0, 0, 0, 0);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}
function capAt(mxh, key) {
  let m = Array.isArray(mxh) && mxh.length ? mxh[0].max : 7;
  for (const p of (mxh || [])) { if (p && p.from <= key) m = p.max; else break; }
  return m;
}
function findTimesheet() {
  try {
    for (const f of fm.listContents(projectsDir)) {
      const p = fm.joinPath(projectsDir, f);
      try { fm.downloadFileFromiCloud(p); } catch (e) {}
      let obj; try { obj = JSON.parse(fm.readString(p)); } catch (e) { continue; }
      // Find the week map wherever it sits.
      const isWeekMap = o => o && typeof o === "object" && Object.keys(o).some(k => /^\d{4}-\d{2}-\d{2}$/.test(k) && Array.isArray(o[k]));
      let weeks = null;
      if (isWeekMap(obj)) weeks = obj;
      else for (const k of Object.keys(obj)) { if (isWeekMap(obj[k])) { weeks = obj[k]; break; } }
      if (!weeks) continue;
      const mxh = obj.mxh || (obj.settings && obj.settings.mxh) || null;
      return { weeks, mxh, cap: obj.mx || (obj.settings && obj.settings.mx) || null };
    }
  } catch (e) {}
  return null;
}
function timesheetWeek() {
  const ts = findTimesheet();
  if (!ts) return null;
  const key = mondayKey(new Date());
  const entries = ts.weeks[key];
  if (!Array.isArray(entries)) return null;
  const sum = list => Math.round(list.reduce((a, e) => a + (parseFloat(e.time) || 0), 0) * 10) / 10;
  const logged = sum(entries);
  const cap = capAt(ts.mxh, key) || ts.cap || 7;
  const off = sum(entries.filter(e => e.task === "Time Off"));
  const sick = sum(entries.filter(e => e.task === "Sick Leave"));
  return { logged, cap, claimed: Math.min(logged, cap), owing: Math.max(0, logged - cap), off, sick, entries: entries.length };
}
// Everything he's noticed, as short plain sentences for the writer.
async function noticings(today, tom, due) {
  const bits = [];
  for (const c of await countdowns()) bits.push(`${c.days} days until ${c.title}.`);
  for (const b of await birthdaysSoon()) bits.push(b.days === 0 ? `${b.name}'s birthday is today.` : b.days === 1 ? `${b.name}'s birthday is tomorrow.` : `${b.name}'s birthday in ${b.days} days.`);
  for (const s of staleReminders(due)) bits.push(`The reminder "${s.title}" has been there ${s.days} days.`);
  for (const p of await patterns(today, tom)) bits.push(p);
  const hw = timesheetWeek();
  if (hw && hw.entries) {
    if (hw.owing > 0) bits.push(`${hw.logged} hours logged this week against a ${hw.cap}-hour cap: ${hw.owing} owing.`);
    else if (hw.logged >= hw.cap) bits.push(`${hw.logged} hours logged this week — the ${hw.cap} is used up.`);
    else bits.push(`${hw.logged} of ${hw.cap} hours logged this week.`);
    if (hw.sick > 0) bits.push(`${hw.sick} hours of sick leave this week.`);
  }
  return bits;
}

// ───────────────────────── Widget ─────────────────────────
// One paragraph, in his voice: greeting, the day, what's outstanding,
// a headline, and a dry remark to finish. Written by him if the thinking
// machine is available and hasn't been asked in the last hour; otherwise
// assembled here from the same material.
function greetingWord() {
  const h = new Date().getHours();
  return h < 5 ? "You're up late" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}
// Three briefs, not one repeated: what's ahead, where you are, how it went.
function dayPart() {
  const h = new Date().getHours();
  return h < 5 ? "night" : h < 12 ? "morning" : h < 18 ? "midday" : "evening";
}
const SHAPE = {
  morning: "This is the morning brief: what is ahead of him today. Lead with the first engagement and what he must not forget.",
  midday: "This is the midday check: where he stands. Lead with what is left of the day and anything slipping — say what remains rather than repeating what is done.",
  evening: "This is the evening note: how the day went and what is first tomorrow. Speak of today in the past tense. Do not list today's engagements again.",
  night: "It is the small hours. Keep it to one or two sentences: what is first when he wakes, and nothing else."
};

// A remark for a quiet moment. Picked by the day so it doesn't change every refresh.
const REMARKS = {
  empty: ["Nothing whatever to report.", "The day is entirely yours, which I'm sure will be put to good use.", "An empty diary. Enjoy it while the novelty lasts.",
          "Not a thing on. I've checked twice.", "A blank page, sir. Do try not to fill it with the telephone."],
  busy: ["I'd allow extra time.", "You'll want to be dressed for at least one of those.", "A full day. My condolences.",
         "Ambitious, but not impossible.", "I shall have the tea ready."],
  evening: ["The wireless, I imagine.", "Nothing further tonight, unless you insist.", "The day is closed. I've closed it.",
            "An early night would be novel."],
  overdue: ["Some of these have been with us a while.", "The invoice is still there, in case you were wondering.", "One or two of these are becoming heirlooms."]
};
function remark(kind) {
  const list = REMARKS[kind] || REMARKS.empty;
  const d = new Date();
  return list[(d.getDate() + d.getHours()) % list.length];
}

// Assemble the paragraph without help.
function composeBrief(today, tom, due, headline, wx, extra, notes) {
  const parts = [greetingWord() + ", " + addressee() + "."];
  const short = t => niceTime(t).replace(/ in the (morning|afternoon|evening)/, "");
  if (dayPart() === "evening" && tom.length) {
    parts.push("That's the day. " + cap(tom[0].title) + " tomorrow" + (tom[0].isAllDay ? "" : " at " + short(tom[0].startDate)) + ".");
  } else if (today.length) {
    const e = today[0];
    parts.push(cap(e.title) + (e.isAllDay ? " today" : " at " + short(e.startDate)) + ".");
    if (today.length === 2) parts.push("One more after that: " + today[1].title + (today[1].isAllDay ? "" : " at " + short(today[1].startDate)) + ".");
    else if (today.length > 2) parts.push((today.length - 1) + " more after that, ending with " + today[today.length - 1].title + ".");
  } else if (tom.length) {
    parts.push("Nothing today. " + cap(tom[0].title) + " tomorrow" + (tom[0].isAllDay ? "" : " at " + short(tom[0].startDate)) + ".");
  } else {
    parts.push(remark(new Date().getHours() >= 18 ? "evening" : "empty"));
  }
  if (due.length === 1) parts.push("One reminder outstanding: " + due[0].title + ".");
  else if (due.length > 1) parts.push(due.length + " reminders outstanding, " + due[0].title + " among them.");
  if (notes && notes.length) parts.push(notes[0]);
  if (extra && extra.leave) parts.push(extra.leave);
  const wl = weatherLine(wx); if (wl) parts.push(wl);
  if (extra && extra.battery) parts.push(extra.battery);
  if (headline) parts.push("In the papers: " + headline + ".");
  // Finish on a remark, unless the diary already earned one.
  if (today.length > 1) parts.push(remark("busy"));
  else if (due.length > 2) parts.push(remark("overdue"));
  else if (today.length && new Date().getHours() >= 18) parts.push(remark("evening"));
  return parts.join(" ");
}

// Let him write it himself, in his own voice, at most once an hour.
async function writeBrief(today, tom, due, headline, wx, extra, notes, changed) {
  const short = t => niceTime(t).replace(/ in the (morning|afternoon|evening)/, "");
  const facts = [
    "Time of day greeting to use: " + greetingWord(),
    "Address him as: " + addressee(),
    "Today: " + (today.length ? today.map(e => e.title + (e.isAllDay ? " (all day)" : " at " + short(e.startDate))).join("; ") : "nothing"),
    "Tomorrow: " + (tom.length ? tom.map(e => e.title + (e.isAllDay ? " (all day)" : " at " + short(e.startDate))).join("; ") : "nothing"),
    "Reminders outstanding: " + (due.length ? due.map(r => r.title).join("; ") : "none"),
    headline ? "Top headline: " + headline : "No headline available",
    extra && extra.leave ? "Timing: " + extra.leave : "",
    extra && extra.battery ? "Battery: " + extra.battery : "",
    notes && notes.length ? "Things you have noticed:\n" + notes.map(n => "- " + n).join("\n") : "",
    changed ? "Changed since he last looked: " + changed : "",
    wx ? `Weather: ${wx.word || ""} ${wx.now}C, high ${wx.high}, low ${wx.low}${wx.rain != null ? ", chance of rain " + wx.rain + "%" : ""}${wx.sunset ? ", sunset " + niceTime(new Date(wx.sunset)).replace(/ in the (morning|afternoon|evening)/, "") : ""}` : "No weather available"
  ].join("\n");
  const sys = personaPrompt(addressee()) + `

${SHAPE[dayPart()]}

Write ONE short paragraph to be read on a home screen widget: the greeting, then what matters for this part of the day, the weather only if it bears on what he is doing, the headline if there is one, and a single dry remark to finish. Flowing prose, no lists, no headings, no line breaks. Between 30 and 55 words. Only state what the facts below say; invent nothing. Exactly one barb, at the end.

If something is marked as changed since he last looked, lead with that rather than restating what he already knows. If you have been given things you noticed, work at most ONE of them in — the most telling — and leave the rest. An observation is worth more than another list of engagements.`;
  return (await gemini(sys, facts, false)).trim().replace(/\s+/g, " ");
}

async function widget() {
  const size = config.widgetFamily || "medium";
  const w = new ListWidget();
  w.setPadding(16, 16, 14, 16);
  w.url = "scriptable:///run/" + encodeURIComponent(Script.name());

  if (!S.introduced) {
    const t = w.addText("Tap to be introduced.");
    t.font = Font.italicSystemFont(15);
    Script.setWidget(w); return;
  }

  let today = [], tom = [], due = [];
  try { today = (await eventsToday()).filter(e => e.endDate > new Date()); } catch (e) {}
  try { tom = await eventsTomorrow(); } catch (e) {}
  try { due = await remindersDue(); } catch (e) {}

  const cache = readCache();
  const wx = size === "small" ? null : await outlook();
  const extra = {};
  if (size !== "small") {
    extra.leave = await leaveBy(today);
    const lvl = Math.round(Device.batteryLevel() * 100);
    if (lvl <= 15 && !Device.isCharging()) extra.battery = lvl + " per cent on the telephone, which will limit us both.";
  }

  // A headline, refreshed every three hours, on the larger sizes.
  if (size !== "small" && S.feeds.length) {
    const fresh = cache.headlineAt && (Date.now() - new Date(cache.headlineAt) < 3 * 3600 * 1000);
    if (!fresh) {
      try {
        const ps = await fetchPapers();
        const first = ps.filter(p => p.items.length)[0];
        if (first) { cache.headline = first.items[0].title; cache.headlineAt = new Date().toISOString(); }
      } catch (e) {}
    }
  }
  const headline = size === "small" ? null : cache.headline;

  // The paragraph. His own words if he can manage it, hourly.
  let text = null;
  const notes = size === "small" ? [] : await noticings(today, tom, due);

  // What's new since he last drew this: a fresh engagement, or a reminder gone.
  const state = today.map(e => e.title).sort().join("|") + "#" + (due || []).map(r => r.title).sort().join("|");
  let changed = "";
  if (cache.state && cache.state !== state) {
    const wasEv = (cache.state.split("#")[0] || "").split("|").filter(Boolean);
    const nowEv = today.map(e => e.title).sort();
    const added = nowEv.filter(t => !wasEv.includes(t));
    const wasR = (cache.state.split("#")[1] || "").split("|").filter(Boolean);
    const nowR = (due || []).map(r => r.title).sort();
    const goneR = wasR.filter(t => !nowR.includes(t));
    if (added.length) changed = "new in the diary: " + added.join(", ");
    else if (goneR.length) changed = "ticked off: " + goneR.join(", ");
  }
  cache.state = state;

  const sig = state + "#" + (headline || "") + "#" + dayPart() + "#" + (wx ? wx.word + wx.now : "") + "#" + (extra.leave || "") + "#" + (extra.battery ? "low" : "") + "#" + notes.join("|");
  const written = cache.briefAt && (Date.now() - new Date(cache.briefAt) < 3600 * 1000) && cache.briefSig === sig && cache.briefPart === dayPart();
  if (written && cache.brief) text = cache.brief;
  else if (size !== "small" && Keychain.contains("valet.gemini")) {
    try {
      text = await writeBrief(today, tom, due, headline, wx, extra, notes, changed);
      cache.brief = text; cache.briefAt = new Date().toISOString(); cache.briefSig = sig; cache.briefPart = dayPart();
    } catch (e) { text = null; }
  }
  if (!text) text = composeBrief(today, tom, size === "small" ? [] : due, headline, wx, extra, notes);
  if (size === "small") text = text.split(". ").slice(0, 2).join(". ") + (text.endsWith(".") ? "" : ".");
  writeCache(cache);

  const body = w.addText(text);
  body.font = Font.systemFont(size === "small" ? 13 : size === "large" ? 17 : 15);
  body.minimumScaleFactor = 0.7;
  body.lineLimit = size === "small" ? 6 : size === "large" ? 14 : 6;

  w.addSpacer();
  const foot = w.addStack(); foot.centerAlignContent();
  const s = foot.addText("— " + S.valet);
  s.font = Font.italicSystemFont(11); s.textOpacity = 0.45;
  if (size !== "small") {
    foot.addSpacer();
    // Its own tap target: opens him and he reads this aloud, nothing else.
    const readStack = foot.addStack();
    readStack.url = "scriptable:///run/" + encodeURIComponent(Script.name()) + "?read=1";
    const r = readStack.addText("Read aloud");
    r.font = Font.mediumSystemFont(11); r.textOpacity = 0.7;
  }

  w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);
  Script.setWidget(w);
}

// ───────────────────────── Entry ─────────────────────────
if (config.runsInWidget) {
  await widget();
  if (S.introduced) await scheduleNotices();
} else if (!S.introduced) {
  await introduce(false);
  await home();
} else if (args.queryParameters && args.queryParameters.read) {
  // Tapped "Read aloud" on the widget: say the brief and withdraw.
  const cached = readCache();
  let line = cached.brief;
  if (!line) {
    let td = [], tm = [], du = [];
    try { td = (await eventsToday()).filter(e => e.endDate > new Date()); } catch (e) {}
    try { tm = await eventsTomorrow(); } catch (e) {}
    try { du = await remindersDue(); } catch (e) {}
    line = composeBrief(td, tm, du, cached.headline, cached.wx, {}, await noticings(td, tm, du));
  }
  say(line);
  const a = new Alert(); a.message = line; a.addAction("Very good"); a.addAction("Go on then");
  if ((await a.present()) === 1) { await scheduleNotices(); await home(); }
} else if (args.shortcutParameter || (args.plainTexts && args.plainTexts.length)) {
  // Run from a Shortcut or Siri with words attached: act, say, withdraw.
  await handle(String(args.shortcutParameter || args.plainTexts[0]));
} else if (args.notification && args.notification.identifier && args.notification.identifier.startsWith("valet.news")) {
  // He was tapped from "The papers have arrived".
  await scheduleNotices();
  await papers(false);
} else {
  await scheduleNotices();
  warmCache(); // in the background, while you talk to him
  await home();
}
await lastSpeech;
Script.complete();
