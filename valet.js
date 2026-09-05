// The Valet — a Scriptable script.
// Install: Scriptable → + → paste this → name the script after him.
// Add to Siri from the script's settings so "Hey Siri, <name>" opens him.
// Optional: add a Scriptable widget and choose this script for a standing brief.

const VERSION = "4.4";

// ───────────────────────── Phrase book ─────────────────────────
const P = {
  introFirst: "Good day. We haven't been introduced, which I gather is about to be corrected. I'll be looking after the telephone from now on; it seems nobody else was. What would you have me called?",
  introSecond: n => `${n}. It could have been worse. And how should I address you?`,
  introDone: a => `Very well, ${a}. You'll find me at the door. I don't imagine I'll be lonely.`,
  morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening", night: "You're up late. I shan't ask",
  nothingToday: "Nothing in the diary today. I shall try to contain my astonishment.",
  quiet: "A quiet evening. I've assumed you'll want the wireless, since you always do.",
  remindersDue: n => n === 1 ? "One reminder outstanding." : n === 2 ? "Two reminders outstanding." : `${n} reminders outstanding, several of them familiar.`,
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
  theHalf: (e, a) => `The half, ${a}. ${e} in thirty minutes. You'll want shoes.`,
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
  papersLater: "I'll not repeat myself; you had the papers this morning.",
  householdAsk: "Anything I should know about the household? You can tell me later, below stairs.",
  householdNoted: "Noted. I shan't mention it at parties.",
  usual: a => `You normally have ${a} about now. Shall I fetch it?`,
  detailsBelow: "The particulars are below stairs, under what went wrong.",
  voiceGone: "My voice has deserted me. The telephone's own will have to do.",
  nothingWrong: "Nothing has gone wrong. I've made a note of the date.",
  changesIntro: "This edition, in brief.",
  quietArranged: "Quiet hours arranged. I shall hold my tongue.",
  putOff: w => `Put off until ${w}. It will keep; they always do.`,
  leftIt: "Left where it was.",
  nothingOnThisDay: "Nothing of note happened on this day, or nothing the encyclopaedia will admit to.",
  notSent: "Not sent. I'll assume you thought better of it.",
  diaryShut: "The diary and the reminders are shut to me; the telephone hasn't given me leave. The particulars are below stairs.",
  fellOver: "Something has gone wrong below stairs. I've made a note of it; the particulars are there."
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
// "tag" marks feeds he should flag for your attention when he writes the brief.
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
  return { introduced: false, valet: "", address: "sir", name: "", custom: "", apps: DEFAULT_APPS.slice(), feeds: DEFAULT_FEEDS.slice(), routine: {}, habits: [], speak: true, model: "gemini-2.5-flash",
           notices: { brief: 8, news: 0, half: true }, // hours in 24h clock; 0 = off
           profile: { where: "", does: "", papers: "", other: "" }, quiet: { from: 0, to: 0 }, symbols: true };
}
function save() { fm.writeString(statePath, JSON.stringify(S)); }
// Older saves may lack newer fields.
S.feeds = S.feeds || DEFAULT_FEEDS.slice();
S.notices = S.notices || { brief: 8, news: 0, half: true };
S.profile = S.profile || { where: "", does: "", papers: "", other: "" };   // About the household; blank until he's told
S.quiet = S.quiet || { from: 0, to: 0 };                                     // quiet hours; the same hour twice means off
S.habits = S.habits || [];                                                   // recent fetches, {n, at}; S.routine is the older ledger
if (S.symbols === undefined) S.symbols = true;                               // small pictures beside rows
function addressee() { return S.address === "name" ? S.name : S.address === "custom" ? S.custom : S.address; }
// What he has been told about the household, as plain sentences for the
// thinking machine. Anything left blank is left unsaid.
const clean = s => String(s || "").trim().replace(/[.\s]+$/, "");
function profileLines() {
  const p = S.profile || {}, bits = [];
  if (clean(p.where)) bits.push(`He lives in ${clean(p.where)}.`);
  if (clean(p.does)) bits.push(`What he does: ${clean(p.does)}.`);
  if (clean(p.papers)) bits.push(`In the papers he wants flagged: ${clean(p.papers)}.`);
  if (clean(p.other)) bits.push(`Also: ${clean(p.other)}.`);
  return bits.join("\n");
}

// ───────────────────────── What went wrong ─────────────────────────
// Failures are kept here, with their particulars, for the screen below
// stairs. Aloud he only ever says that something isn't answering.
const faultsPath = fm.joinPath(dir, "faults.json");
function readFaults() {
  try { if (fm.fileExists(faultsPath)) { fm.downloadFileFromiCloud(faultsPath); return JSON.parse(fm.readString(faultsPath)); } } catch (e) {}
  return [];
}
function fault(where, detail) {
  try {
    const list = readFaults();
    list.push({ at: new Date().toISOString(), where, detail: String(detail || "").slice(0, 400) });
    fm.writeString(faultsPath, JSON.stringify(list.slice(-20)));
  } catch (e) {}
}
function clearFaults() { try { fm.writeString(faultsPath, "[]"); } catch (e) {} }

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
// Lines queue: each waits for the one before, so nothing talks over him.
function say(t) {
  if (!S.speak) return;
  lastSpeech = lastSpeech.catch(() => {}).then(() => {
    if (!hasEleven()) { Speech.speak(t); return; }
    return elevenSpeak(t).catch(e => { lastVoiceError = String(e && e.message || e); fault("His voice", lastVoiceError); Speech.speak(t); });
  });
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
// How an engagement's time is spoken. Timed: "at 2 in the afternoon".
// All day: the day word you supply. Running over several days: "all week"
// or "until Friday", rather than pretending it starts at midnight.
function spanWords(e) {
  if (!e.isAllDay) return "";
  const days = Math.round((e.endDate - e.startDate) / 86400000);
  if (days <= 1) return "";
  if (days === 7) return "all week";
  const last = new Date(e.endDate.getTime() - 1); // an all-day entry ends at the following midnight
  const df = new DateFormatter(); df.dateFormat = days > 7 ? "EEEE d MMMM" : "EEEE";
  return "until " + df.string(last);
}
function eventWords(e, dayWord) {
  if (e.isAllDay) return spanWords(e) || dayWord || "all day";
  const now = new Date();
  if (e.startDate <= now && e.endDate > now) return "now, until " + niceTime(e.endDate); // in progress, not upcoming
  return "at " + niceTime(e.startDate);
}
function tomorrowWords(e) {
  if (!e.isAllDay) return "tomorrow at " + niceTime(e.startDate);
  const sp = spanWords(e);
  if (e.startDate <= new Date()) return sp ? "still on tomorrow, " + sp : "still on tomorrow"; // under way already; not "from tomorrow"
  return sp ? "from tomorrow, " + sp : "tomorrow";
}
// A running all-day entry (a trip, a week away) that merely continues tomorrow.
function continuing(e) { return e.isAllDay && e.startDate <= new Date(); }
// Timed engagements first, in order; all-day entries after. The thing with a
// clock on it is what leads a briefing.
function leadOrder(list) {
  const timed = (list || []).filter(e => !e.isAllDay).sort((a, b) => a.startDate - b.startDate);
  return timed.concat((list || []).filter(e => e.isAllDay));
}

// ───────────────────────── Reminders, spoken ─────────────────────────
// Titles are tidied and no more: a capital to start, and a space where a
// letter runs straight into a digit. What he says of a reminder: when it is
// due, in clock words; overdue, said plainly; which list, when more than one
// is in play; the priority, only if high. Notes are kept for the tap.
function tidy(s) {
  const t = String(s || "").trim().replace(/\b([a-z]+)(\d)/g, "$1 $2");   // "for30", not "MP3", "A4", "Covid19" or "3D"
  return /^[a-z][A-Z]/.test(t) ? t : cap(t);                                // leave iPhone and eBay their own capitals
}
function clockWords(d) {
  const h = d.getHours(), m = d.getMinutes(), hr = x => String(x % 12 || 12);
  const period = h < 12 ? " in the morning" : h < 18 ? " in the afternoon" : " in the evening";
  if (m === 0) return `${hr(h)} o'clock${period}`;
  if (m === 15) return `quarter past ${hr(h)}${period}`;
  if (m === 30) return `half past ${hr(h)}${period}`;
  if (m === 45) return `quarter to ${hr(h + 1)}${period}`;
  return m < 30 ? `${m} past ${hr(h)}${period}` : `${60 - m} to ${hr(h + 1)}${period}`;
}
function reminderTimed(r) {
  if (!r.dueDate) return false;
  if (typeof r.dueDateIncludesTime === "boolean") return r.dueDateIncludesTime;
  return !!(r.dueDate.getHours() || r.dueDate.getMinutes());
}
// A reminder that repeats is never stale; the only lateness that means
// anything is today's turn being past its time.
function repeating(r) { const rules = r && r.recurrenceRules; return Array.isArray(rules) && rules.length > 0; }
function dueWords(r) {
  if (!r.dueDate) return "no date set";
  const d = new Date(r.dueDate), now = new Date(), timed = reminderTimed(r);
  const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
  if (repeating(r)) {
    if (sameDay(d, now)) return timed ? (d < now ? `overdue since ${clockWords(d)}` : `due ${clockWords(d)}`) : "due today";
    if (d < dayStart) return `repeating, last due ${niceDay(d)}`;
    return timed ? `due ${niceDay(d)} at ${clockWords(d)}` : `due ${niceDay(d)}`;
  }
  if (timed && d < now) return sameDay(d, now) ? `overdue, was due ${clockWords(d)}` : `overdue since ${niceDay(d)}`;
  if (!timed && d < dayStart) return `overdue since ${niceDay(d)}`;
  if (sameDay(d, now)) return timed ? `due ${clockWords(d)}` : "due today";
  return timed ? `due ${niceDay(d)} at ${clockWords(d)}` : `due ${niceDay(d)}`;
}
function highPriority(r) { return typeof r.priority === "number" && r.priority >= 1 && r.priority <= 4; }
function listsOf(rs) { const s = new Set(); for (const r of rs || []) if (r.calendar && r.calendar.title) s.add(r.calendar.title); return s; }
// The line beneath a reminder: due, the list if it matters, the priority if high.
function reminderDetail(r, lists) {
  const bits = [dueWords(r)];
  if (lists && lists.size > 1 && r.calendar && r.calendar.title) bits.push(r.calendar.title);
  if (highPriority(r)) bits.push("high priority");
  return bits.join(", ");
}
function reminderWords(r, lists) { return `${tidy(r.title)}, ${reminderDetail(r, lists)}`; }
// Tapping a reminder: he reads it out, notes and all, and offers to tick it
// off or put it off. Nothing happens without a tap on the answer.
async function attend(r) {
  const title = tidy(r.title), due = dueWords(r);
  const a = new Alert(); a.title = title;
  a.message = cap(due) + "." + (highPriority(r) ? " High priority." : "") + (r.notes ? "\n\n" + r.notes : "");
  say(`${title}, ${due}.`);
  a.addAction("Tick it off"); a.addAction("Later today"); a.addAction("Tomorrow"); a.addCancelAction("Leave it");
  const i = await a.present();
  if (i === 0) { r.isCompleted = true; r.save(); say(P.done); }
  else if (i === 1) {
    const d = new Date(Date.now() + 3 * 3600 * 1000); d.setMinutes(Math.round(d.getMinutes() / 5) * 5, 0, 0); // to the nearest five minutes
    r.dueDate = d; r.dueDateIncludesTime = true; r.save(); say(P.putOff(clockWords(d)));
  } else if (i === 2) {
    const d = new Date(); d.setDate(d.getDate() + 1);
    if (reminderTimed(r)) { const t = new Date(r.dueDate); d.setHours(t.getHours(), t.getMinutes(), 0, 0); } else d.setHours(9, 0, 0, 0);
    r.dueDate = d; r.dueDateIncludesTime = true; r.save(); say(P.putOff("tomorrow, " + clockWords(d)));
  } else say(P.leftIt);
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
  // The first thing that is really a clock time: not "30 minutes", not 25 o'clock.
  const timeRe = /\b(at |for )?(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|o'clock|in the morning|in the afternoon|in the evening)?\b/g;
  let tm;
  while ((tm = timeRe.exec(t))) {
    if (!(tm[1] || tm[3] || tm[4])) continue;
    if (/^\s*(minutes?|mins?|hours?|hrs?)\b/.test(t.slice(tm.index + tm[0].length))) continue; // a duration, not a time
    let h = +tm[2], m = tm[3] ? +tm[3] : 0, s = tm[4] || "";
    if (h > 23 || m > 59) continue;
    if ((s === "pm" || s === "in the afternoon" || s === "in the evening") && h < 12) h += 12;
    if (s === "am" && h === 12) h = 0;
    if (!s && h < 8) h += 12; // "at 2" means the afternoon unless you say otherwise
    d.setHours(h, m); hasTime = true; found = true; t = t.replace(tm[0], " ");
    break;
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
// Everything due by the end of today, the overdue included: what requires you.
async function remindersDue() {
  const end = new Date(); end.setHours(23, 59, 59, 999);
  const all = await Reminder.allIncomplete();
  return all.filter(r => !r.isCompleted && r.dueDate && r.dueDate <= end).sort((a, b) => a.dueDate - b.dueDate);
}
async function addEvent(title, when, hasTime) {
  const e = new CalendarEvent();
  e.title = cap(title); e.calendar = await Calendar.defaultForEvents();
  e.startDate = when; const end = new Date(when); end.setHours(when.getHours() + 1); e.endDate = end;
  e.isAllDay = !hasTime; e.save();
  return e;
}
// No date given, no date set: he doesn't invent nine in the morning.
async function addReminder(title, when, hasTime) {
  const r = new Reminder(); r.title = cap(title); r.calendar = await Calendar.defaultForReminders();
  if (when) { r.dueDate = when; r.dueDateIncludesTime = !!hasTime; }
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
// He notes when each app is fetched and, from that, what you tend to want
// about now. Recent habits count for more than old ones; weekdays and
// weekends are kept apart; the hour and the broader part of the day both
// weigh. Older editions kept counts by weekday and hour in S.routine; those
// still count, faintly, until the routine is forgotten.
function band(h) { return h < 12 ? "morning" : h < 14 ? "midday" : h < 18 ? "afternoon" : "evening"; }
function isWeekend(d) { return d.getDay() === 0 || d.getDay() === 6; }
async function fetchApp(app) {
  S.habits.push({ n: app.n, at: new Date().toISOString() });
  if (S.habits.length > 400) S.habits = S.habits.slice(-400);
  const today = new Date().toDateString(); S.daily = S.daily && S.daily.day === today ? S.daily : { day: today, counts: {} };
  S.daily.counts[app.n] = (S.daily.counts[app.n] || 0) + 1; save();
  say(S.daily.counts[app.n] >= 3 ? P.fetchingAgain(app.n) : P.fetching(app.n)); await Safari.open(app.u);
}
function habitScores() {
  const now = new Date(), h = now.getHours(), wk = isWeekend(now), b = band(h);
  const scores = {}, lastOpen = {};
  for (const x of S.habits || []) {
    const d = new Date(x.at); if (isNaN(d)) continue;
    let w = Math.pow(0.5, (now - d) / 86400000 / 30);     // half its weight every month
    w *= isWeekend(d) === wk ? 1 : 0.3;
    const dh = Math.abs(d.getHours() - h);
    w *= dh <= 1 ? 1 : band(d.getHours()) === b ? 0.5 : 0;
    if (w) scores[x.n] = (scores[x.n] || 0) + w;
    if (!lastOpen[x.n] || d > lastOpen[x.n]) lastOpen[x.n] = d;
  }
  for (const k in S.routine || {}) {                      // the old ledger, faded
    const [day, hour] = k.split("-").map(Number);
    if (isNaN(day) || isNaN(hour) || (day === 0 || day === 6) !== wk) continue;
    const dh = Math.abs(hour - h);
    const f = dh <= 1 ? 0.3 : band(hour) === b ? 0.15 : 0;
    if (!f) continue;
    for (const n in S.routine[k]) scores[n] = (scores[n] || 0) + (S.routine[k][n] || 0) * f;
  }
  return { scores, lastOpen };
}
// One suggestion, and whether he is sure of it. Returns { app, confident }.
function suggestion() {
  const { scores, lastOpen } = habitScores();
  const justHad = n => lastOpen[n] && (Date.now() - lastOpen[n]) < 30 * 60 * 1000;
  const ranked = Object.keys(scores).filter(n => !justHad(n) && S.apps.some(a => a.n === n)).sort((a, b) => scores[b] - scores[a]);
  if (ranked.length && scores[ranked[0]] >= 1.5) {
    const top = scores[ranked[0]], second = ranked[1] ? scores[ranked[1]] : 0;
    return { app: S.apps.find(a => a.n === ranked[0]), confident: top >= 3 && top >= second * 1.5 };
  }
  const h = new Date().getHours(), want = h < 9 ? "Hand Terminal" : h < 18 ? "WhatsApp" : "Pocket Casts";
  const rested = S.apps.filter(a => !justHad(a.n));
  return { app: rested.find(a => a.n === want) || rested[0] || S.apps[0], confident: false };
}
// Whole words only, three letters at least, never on nothing: "no" is not
// "Things not to be forgotten", and "open" on its own fetches nobody.
function wordMatch(hay, needle) {
  const n = String(needle || "").trim().toLowerCase();
  if (n.length < 3) return false;
  const re = new RegExp("(^|[^a-z0-9])" + n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "($|[^a-z0-9])");
  return re.test(String(hay || "").toLowerCase());
}
function findApp(name) {
  const n = String(name || "").trim().toLowerCase();
  if (n.length < 3) return null;
  return S.apps.find(a => a.n.toLowerCase() === n) || S.apps.find(a => wordMatch(a.n, n)) || null;
}


// ───────────────────────── His memory ─────────────────────────
// A journal of what you've told him and what he's done, kept as one file.
// This is what lets him answer "what was I meant to do about the dentist?"
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
// What he knows, in order of importance, within a fixed budget. The top of
// the list is never cut; whatever doesn't fit is trimmed from the bottom.
const CONTEXT_BUDGET = 6000;
async function context(history) {
  const items = [];
  items.push(`Today is ${new Date().toString()}.`);
  try {
    const today = (await eventsToday()).map(e => `${tidy(e.title)} ${eventWords(e, "all day")}`);
    const dueList = await remindersDue(), lists = listsOf(dueList);
    const due = dueList.map(r => reminderWords(r, lists));
    items.push((today.length ? "Today's diary: " + today.join("; ") + "." : "Nothing in today's diary.") + (due.length ? " Reminders due: " + due.join("; ") + "." : ""));
    const tom = (await eventsTomorrow()).map(e => `${tidy(e.title)} ${eventWords(e, "all day")}`);
    if (tom.length) items.push("Tomorrow: " + tom.join("; ") + ".");
  } catch (e) {}
  if (history) items.push("The conversation so far:\n" + history);
  const who = profileLines();
  if (who) items.push("About the household:\n" + who);
  const notes = recentNotes(40), recent = notes.slice(-12), older = notes.slice(0, -12);
  const line = n => `- (${n.at.slice(0, 10)}) ${n.t}`;
  if (recent.length) items.push("Things he has told you, most recent last:\n" + recent.map(line).join("\n"));
  const acts = J.acts.slice(-8);
  if (acts.length) items.push("Recently done for him:\n" + acts.map(a => `- (${a.at.slice(0, 10)}) ${a.t}`).join("\n"));
  items.push("Apps he can be brought: " + S.apps.map(a => a.n).join(", ") + ".");
  const fact = onThisDayUsable(readCache());
  if (fact) items.push("An historical note for today, for when he asks for something or nothing in particular, and never as trivia: " + fact);
  const proj = projectSummary(1500);
  if (proj) items.push("His own records, from his apps:\n" + proj);
  if (older.length) items.push("Older notes, oldest first:\n" + older.map(line).join("\n"));
  return fitBudget(items, CONTEXT_BUDGET);
}
function fitBudget(items, budget) {
  const out = []; let left = budget;
  for (const it of items) {
    const sep = out.length ? 2 : 0;
    if (it.length + sep <= left) { out.push(it); left -= it.length + sep; }
    else if (left - sep > 200) { out.push(it.slice(0, left - sep - 1) + "…"); break; }
    else break;
  }
  return out.join("\n\n");
}

function personaPrompt(addr) {
  const who = profileLines();
  return `You are a valet — a dry, withering but entirely loyal English gentleman's gentleman in the manner of Hobson in the film Arthur. You serve ${addr}.${who ? "\n\n" + who : ""}

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
  const prompt = `${await context(history)}\n\nHe now says: ${text}`;

  let j;
  try { const out = await gemini(sys, prompt, true); j = JSON.parse(out.replace(/```json|```/g, "").trim()); }
  catch (e) { return { say: P.machineFailed + " " + P.detailsBelow, intent: "none" }; }
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
    case "remind": {
      const w = j.when ? parseWhen(j.when) : null, dated = w && w.found;   // nothing said about when: left undated
      await addReminder(j.body || original, dated ? w.date : null, dated ? w.hasTime : false); record(`Reminder: ${j.body}`);
      return spoken || `${P.noted} ${cap(j.body || original)}${dated ? ", " + niceDay(w.date) : ""}.`;
    }
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
  let today = [], due = [], shut = false;
  try {
    today = leadOrder((await eventsToday()).filter(e => e.endDate > new Date()));
    if (today.length) {
      const e = today[0];
      parts.push(`${tidy(e.title)} ${eventWords(e, "today")}.` + (today.length > 1 ? ` ${today.length - 1} more after that.` : ""));
    } else {
      const tom = (await eventsTomorrow()).filter(e => !continuing(e));   // a trip that merely goes on isn't news
      if (tom.length) parts.push(`${tidy(tom[0].title)} ${tomorrowWords(tom[0])}.`);
      else parts.push(h < 18 ? P.nothingToday : P.quiet);
    }
  } catch (e) { shut = true; fault("The diary", e && e.message || e); }
  try {
    due = await remindersDue();
    if (due.length) parts.push(P.remindersDue(due.length) + (due.length === 1 ? ` ${reminderWords(due[0], listsOf(due))}.` : ""));
  } catch (e) { shut = true; fault("The reminders", e && e.message || e); }
  if (shut) parts.push(P.diaryShut);
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
  const r = new Request(feed.u); r.timeoutInterval = FEED_TIMEOUT;
  let xml = "";
  const failed = error => ({ paper: feed, items: [], error });
  try { xml = await r.loadString(); } catch (e) { return failed("no reply: " + (e.message || e)); }
  const code = r.response && r.response.statusCode;
  if (code && code !== 200) return failed(`said ${code}`);
  const items = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/g) || xml.match(/<entry[\s>][\s\S]*?<\/entry>/g) || [];
  for (const b of blocks.slice(0, 3)) {
    const title = (b.match(/<title[^>]*>([\s\S]*?)<\/title>/) || [])[1];
    let link = (b.match(/<link[^>]*href="([^"]+)"/) || [])[1] || (b.match(/<link[^>]*>([\s\S]*?)<\/link>/) || [])[1] || "";
    const summary = (b.match(/<(?:description|summary|content)[^>]*>([\s\S]*?)<\/(?:description|summary|content)>/) || [])[1] || "";
    const stamp = (b.match(/<(?:pubDate|published|updated|dc:date)[^>]*>([\s\S]*?)<\/(?:pubDate|published|updated|dc:date)>/) || [])[1];
    const when = stamp ? new Date(decode(stamp)) : null;
    if (title) items.push({ title: decode(title), link: decode(link), summary: decode(summary).slice(0, 220), when: when && !isNaN(when) ? when.toISOString() : null });
  }
  if (!items.length) return failed(blocks.length ? "arrived, but couldn't be read" : "arrived, but isn't a feed I recognise");
  return { paper: feed, items };
}
// A paper that fails once is weather; one that fails three times running is
// worth a note below stairs. The tally lives in the widget cache.
function tallyFailures(ps, cache) {
  const failing = cache.failing || {};
  for (const p of ps) {
    if (!p) continue;
    if (!p.error) { delete failing[p.paper.u]; continue; }
    failing[p.paper.u] = (failing[p.paper.u] || 0) + 1;
    if (failing[p.paper.u] === 3) fault("The newsagent", `${p.paper.n}: ${p.error}, three times running`);
  }
  cache.failing = failing;
}

// ───────────────────────── Keeping the tray stocked ─────────────────────────
// The app fetches; the widget only reads. Every paper is sent for at once,
// six seconds each, and the tray is restocked as each arrives, so one slow
// paper never holds up the rest. Three lists come out of it: the top story
// from every paper; the top three from each paper he has flagged; and any
// episode from the last two days from a feed marked as a podcast.
const FEED_TIMEOUT = 6;
let trayWork = null;                         // the restocking in hand, so he can finish it before leaving
function shelve(ps) {
  const top = [], tagged = [], episodes = [];
  const cutoff = Date.now() - 48 * 3600 * 1000;
  for (const p of ps) {
    if (!p || !p.items || !p.items.length) continue;
    const item = i => ({ paper: p.paper.n, title: i.title, summary: i.summary || "", link: i.link || "", tag: p.paper.tag || "" });
    if (p.paper.kind === "podcast") {
      for (const i of p.items) if (i.when && new Date(i.when).getTime() > cutoff) episodes.push({ podcast: p.paper.n, title: i.title, when: i.when });
      continue;
    }
    top.push(item(p.items[0]));
    if (p.paper.tag) p.items.slice(0, 3).forEach(i => tagged.push(item(i)));
  }
  episodes.sort((a, b) => new Date(b.when) - new Date(a.when));
  return { top, tagged, episodes: episodes.slice(0, 4) };
}
// Resolves with the value, or with fallback() once the seconds are up.
function withinSeconds(p, secs, fallback) {
  return new Promise(resolve => {
    let done = false;
    const t = Timer.schedule(secs * 1000, false, () => { if (!done) { done = true; resolve(fallback()); } });
    p.then(v => { if (!done) { done = true; t.invalidate(); resolve(v); } }, () => { if (!done) { done = true; t.invalidate(); resolve(fallback()); } });
  });
}
async function refreshPapers(cache) {
  cache = cache || readCache();
  const started = Date.now(), results = new Array(S.feeds.length).fill(null);
  const write = complete => {
    const done = results.filter(Boolean);
    const took = complete ? Date.now() - started : (cache.papers && cache.papers.took) || null;
    cache.papers = Object.assign(shelve(done), { at: new Date().toISOString(), complete, took, feeds: S.feeds.length, arrived: done.length });
    writeCache(cache);
  };
  await Promise.all(S.feeds.map((feed, i) =>
    withinSeconds(fetchPaper(feed), FEED_TIMEOUT + 0.5, () => ({ paper: feed, items: [], error: "no reply in time" }))
      .then(p => { results[i] = p; write(false); })));
  tallyFailures(results, cache);
  write(true);
  return results;
}
// Papers and weather together, once at a time. Callers that don't need the
// answer leave it running; the script waits for it before it leaves.
function refreshTray() {
  if (trayWork) return trayWork;
  trayWork = (async () => {
    const cache = readCache();
    try { await outlook(cache); writeCache(cache); } catch (e) {}
    try { await fetchOnThisDay(cache); writeCache(cache); } catch (e) {}
    try { await refreshPapers(cache); } catch (e) {}
  })().then(() => { trayWork = null; }, () => { trayWork = null; });
  return trayWork;
}

// ───────────────────────── On this day ─────────────────────────
// One historical note a day, from Wikipedia, no key needed. Fetched by the
// app with the rest of the tray and kept for the day. Offered to the brief
// only when the day is quiet, and to you whenever you ask. Never trivia.
const ON_THIS_DAY_PREFER = /\b(Ireland|Irish|Dublin|Belfast|Cork|Galway|Sligo|Limerick|Ulster|Munster|Leinster|Connacht|computer|computing|telephone|telegraph|wireless|radio|television|internet|software|electric|electricity|engine|patent|invented|invention|satellite|rocket|spacecraft|aircraft|aeroplane|flight|railway|ship|ships|sailed|sails|sail|fleet|navy|naval|voyage|harbour|lighthouse|submarine|vessel|liner|maritime)\b/i;
function dayKey(d) { d = d || new Date(); return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
async function fetchOnThisDay(cache) {
  cache = cache || readCache();
  if (cache.onThisDay && cache.onThisDay.day === dayKey()) return cache.onThisDay;
  const [mm, dd] = dayKey().split("-");
  const req = new Request(`https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/selected/${mm}/${dd}`);
  req.timeoutInterval = FEED_TIMEOUT; req.headers = { "User-Agent": "Valet (Scriptable, personal use)", "Accept": "application/json" };
  const j = await req.loadJSON();
  const all = ((j && j.selected) || []).filter(e => e && e.text && typeof e.year === "number");
  if (!all.length) throw new Error("nothing selected for the day");
  const mild = all.filter(e => !GRAVE.test(e.text));                          // not a massacre, to fill a quiet afternoon
  const events = mild.length ? mild : all;
  const preferred = events.filter(e => ON_THIS_DAY_PREFER.test(e.text));   // Irish, technological or maritime, else the oldest
  const e = (preferred.length ? preferred : events).slice().sort((a, b) => a.year - b.year)[0];
  let text = String(e.text).trim().replace(/\s+/g, " ").replace(/\.$/, "");
  text = text.replace(/^(The|A|An)\b/, m => m.toLowerCase());
  const year = e.year < 0 ? `${-e.year} BC` : String(e.year);
  cache.onThisDay = { day: dayKey(), year: e.year, text, line: `On this day in ${year}, ${text}.`, at: new Date().toISOString() };
  return cache.onThisDay;
}
function onThisDayUsable(cache) { return cache.onThisDay && cache.onThisDay.day === dayKey() ? cache.onThisDay.line : ""; }
async function onThisDayLine() {
  try { const cache = readCache(); const o = await fetchOnThisDay(cache); writeCache(cache); return o.line; }
  catch (e) { fault("On this day", e && e.message || e); return P.nothingOnThisDay; }
}
// A quiet day: nothing pressing in the diary, no more than one reminder,
// and nothing grave in the headlines. Only then is the note offered, and
// only as one clause. The papers may be full; it is the diary that decides.
const GRAVE = /\b(die|dies|died|death|deaths|dead|killed|killing|kills|murder|murdered|shot|stabbed|crash|crashes|funeral|suicide|massacre|bomb|bombing|war|attack|terror|hospitalised|cancer|missing|drowned|tragedy)\b/i;
function quietDay(today, due, pick) {
  const pressing = (today || []).some(e => !e.isAllDay);
  const headlines = pick ? pick.items.concat(pick.extra ? [pick.extra] : []) : [];
  const grave = headlines.some(i => GRAVE.test(i.title));
  return !pressing && (due || []).length <= 1 && !grave;
}
// What the widget may use: a tray stocked in the last twelve hours, weather
// from the last three. Older than that and it says nothing, quietly.
function papersUsable(cache) { return cache.papers && cache.papers.at && (Date.now() - new Date(cache.papers.at) < 12 * 3600 * 1000) ? cache.papers : null; }
function weatherUsable(cache) { return cache.wx && cache.wxAt && (Date.now() - new Date(cache.wxAt) < 3 * 3600 * 1000) ? cache.wx : null; }
function trayReport() {
  const p = readCache().papers;
  if (!p || !p.complete || !p.took) return `${S.feeds.length} papers taken. The tray hasn't been stocked yet; open the papers, or run me with the word refresh.`;
  return `${S.feeds.length} papers taken. The last full restocking took ${(p.took / 1000).toFixed(1)} seconds, ${whenAgo(p.at)}.`;
}
// What a brief will carry, chosen here so it is the same whoever writes it
// and so the next brief can avoid repeating it: two or three stories across
// different papers, one of them flagged when there is one; a fourth held
// back for the large widget's second paragraph; the new episodes. Small
// gets one headline and no episodes. If nothing at all is new since the
// previous brief, it is said again rather than left out.
function pickPapers(papers, previous, size) {
  if (!papers) return null;
  const prev = new Set(previous || []);
  const unseen = list => (list || []).filter(i => !prev.has(i.title));
  let top = unseen(papers.top), tagged = unseen(papers.tagged);
  if (!top.length && !tagged.length) { top = papers.top || []; tagged = papers.tagged || []; }
  const want = size === "small" ? 1 : 3;
  const items = [], papersUsed = new Set(), titles = new Set();
  const take = i => { if (i && !titles.has(i.title)) { items.push(i); titles.add(i.title); papersUsed.add(i.paper); } };
  if (size !== "small" && tagged.length) take(tagged[0]);
  for (const i of top) { if (items.length >= want) break; if (!papersUsed.has(i.paper)) take(i); }
  for (const i of top.concat(tagged)) { if (items.length >= want) break; take(i); }
  const extra = size === "large" ? top.concat(tagged).find(i => !titles.has(i.title)) || null : null;
  const episodes = size === "small" ? [] : unseen(papers.episodes).slice(0, 2);
  return { items, extra, episodes, used: items.map(i => i.title).concat(extra ? [extra.title] : [], episodes.map(e => e.title)) };
}
// The plain form, for composeBrief and for reading aloud.
function paperWords(pick, size) {
  if (!pick || !pick.items.length) return { line: "", more: "" };
  const line = pick.items.map((i, k) => (k === 0 ? `In the papers, from ${i.paper}` : `From ${i.paper}`) + (i.tag ? `, flagged ${i.tag}` : "") + `: ${i.title}.`).join(" ")
    + pick.episodes.map(e => ` New from ${e.podcast}: ${e.title}.`).join("");
  const more = size === "large" && pick.extra
    ? `Also, from ${pick.extra.paper}: ${pick.extra.title}.` + (pick.extra.tag ? ` Flagged ${pick.extra.tag}, so worth a moment of your attention.` : "")
    : "";
  return { line, more };
}

// A short spoken form: "From RTÉ: a, b, c."
function papersSpeech(papers) {
  const bits = papers.filter(p => p.items.length).map(p => p.paper.kind === "podcast"
    ? `New from ${p.paper.n}: ${p.items.map(i => i.title).join(". ")}.`
    : `${P.papersFrom(p.paper.n)} ${p.items.map(i => i.title).join(". ")}.`);
  return bits.length ? bits.join(" ") + " " + P.papersDone : P.papersEmpty;
}

// Gemini writes the brief in his voice, flagging anything he's been asked to.
async function papersBrief(papers) {
  const raw = papers.filter(p => p.items.length).map(p => `${p.paper.n}${p.paper.tag ? " (" + p.paper.tag + ")" : ""}:\n` + p.items.map(i => `- ${i.title}${i.summary ? " — " + i.summary : ""}`).join("\n")).join("\n\n");
  const who = profileLines().replace(/\n/g, " ");
  const flagged = clean(S.profile && S.profile.papers) ? ` He has asked that anything touching on ${clean(S.profile.papers)} be pointed out.` : "";
  const sys = `You are ${S.valet}, a dry, withering but loyal English gentleman's gentleman in the manner of Hobson in the film Arthur — deadpan, precise, too well-mannered to insult you outright and letting you hear it anyway — giving a spoken morning news brief to ${addressee()}.${who ? " " + who : ""} Write two or three short paragraphs of plain prose, under 140 words, no headings or lists, no markdown. Summarise only what is in the headlines given; do not invent detail. A paper marked with a word in brackets is one he has flagged; mention anything from it as worth his particular attention.${flagged} Keep the news itself straight and accurate; put the wit in one or two asides and a closing barb. Never more than one barb per paragraph. Address them as "${addressee()}" once at most.`;
  try { return (await gemini(sys, raw, false)).trim(); } catch (e) { return null; }
}

async function papers(spokenOnly) {
  try { await papersInner(spokenOnly); }
  catch (e) { fault("The papers", e && e.message || e); await tell(P.papersEmpty + " " + P.detailsBelow); }
}
async function papersInner(spokenOnly) {
  let ps;
  try { ps = await refreshPapers(); } catch (e) { fault("The newsagent", e && e.message || e); return await tell(P.papersEmpty + " " + P.detailsBelow); }
  const any = ps.some(p => p.items.length);
  if (!any) return await tell(P.papersEmpty + " " + P.detailsBelow);
  const hasKey = Keychain.contains("valet.gemini");
  if (spokenOnly) {
    const text = hasKey ? (await papersBrief(ps)) || papersSpeech(ps) : papersSpeech(ps);
    return await tell(text);
  }
  const table = new UITable(); table.showSeparators = true;
  let next = null;
  table.addRow(infoRow("The morning's papers. Tap a headline if you must know more."));
  if (hasKey) table.addRow(actionRow("Read me the brief", "He summarises the lot", () => { next = async () => { const t = await papersBrief(ps); await tell(t || (lastMachineError ? P.machineFailed + " " + papersSpeech(ps) : papersSpeech(ps))); }; }));
  table.addRow(actionRow("Read me the headlines", null, () => { next = async () => { await tell(papersSpeech(ps)); }; }));
  ps.forEach(p => {
    table.addRow(headerRow(p.paper.n));
    if (!p.items.length) { table.addRow(infoRow("Didn't arrive", "The particulars are below stairs")); return; }
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
      if (when <= new Date() || inQuietHours(when)) return;
      const n = new Notification(); n.identifier = id; n.title = S.valet; n.body = body; n.scriptName = Script.name(); n.sound = "default";
      n.setTriggerDate(when); n.schedule();
    };
    const at = (h, dayOffset) => { const d = new Date(); d.setDate(d.getDate() + dayOffset); d.setHours(h, 0, 0, 0); return d; };
    if (S.notices.brief) for (const off of [0, 1]) mk(`valet.brief.${off}`, P.briefNotice, at(S.notices.brief, off));
    if (S.notices.news) for (const off of [0, 1]) mk(`valet.news.${off}`, P.newsNotice, at(S.notices.news, off));
    if (S.notices.half) {
      const evs = [...(await eventsToday()), ...(await eventsTomorrow())].filter(e => !e.isAllDay);
      evs.slice(0, 12).forEach((e, i) => mk(`valet.half.${i}`, P.theHalf(tidy(e.title), addressee()), new Date(e.startDate.getTime() - 30 * 60 * 1000)));
    }
  } catch (e) {}
}
// Quiet hours: no notices, and a shorter brief on the widget. Off unless
// two different hours are set; may run across midnight.
function inQuietHours(d) {
  const q = S.quiet || {};
  if (!q.from && !q.to) return false;
  if (q.from === q.to) return false;
  const h = (d || new Date()).getHours();
  return q.from < q.to ? (h >= q.from && h < q.to) : (h >= q.from || h < q.to);
}

// ───────────────────────── Understanding ─────────────────────────
async function handle(text) {
  const t = text.trim(); if (!t) return;
  const low = t.toLowerCase();
  let m;

  // Messages: "message Margaret running late", "text Tom ...", "whatsapp Ann ..."
  if ((m = low.match(/^(message|whatsapp)\s+([a-z' -]+?)\s+(?:that\s+|to\s+say\s+)?(.+)$/))) return await sendWhatsApp(m[2], m[3]);
  if ((m = low.match(/^(text|sms)\s+([a-z' -]+?)\s+(?:that\s+)?(.+)$/))) return await sendText(m[2], m[3]);
  if ((m = low.match(/^(email|e-mail|mail|write to)\s+([a-z' -]+?)(?:\s+(?:about|re|saying)\s+(.+))?$/))) return await sendEmail(m[2], m[3] || "");
  if ((m = low.match(/^(ring|call|phone|telephone)\s+([a-z' -]+)$/))) return await ringUp(m[2]);

  // Remembering and recalling. "Note" means remember; it comes before the diary.
  if ((m = low.match(/^(remember|note|keep in mind|don't forget)(?: that)?\s+(.+)$/))) { remember(m[2], "told"); return await tell(P.remembered); }
  if ((m = low.match(/^(what did i (?:say|tell you) about|what do you know about|what was i meant to do about)\s+(.+?)\??$/))) {
    const hits = searchNotes(m[2]);
    if (!hits.length) return await tell(P.cantRecall);
    return await tell(hits.map(h => `${h.at.slice(0, 10)}: ${h.t}`).join(". "));
  }

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
  if ((m = low.match(/^(?:add|put|book|diary)\s+(.+)$/))) {
    const w = parseWhen(m[1]); if (!w.found) return await tell("When would that be?");
    await addEvent(w.rest, w.date, w.hasTime);
    return await tell(`${P.noted} ${cap(w.rest)}, ${niceDay(w.date)}${w.hasTime ? " at " + niceTime(w.date) : ""}.`);
  }

  // Something to say when asked for nothing in particular
  if (/^(anything (on|for) (this day|today)|on this day|what happened (on this day|today in history)|tell me something|say something|anything (interesting|of note))\b/.test(low)) return await tell(await onThisDayLine());

  // This edition
  if (/^(what('s| is| has) (new|changed)|what changed)\b/.test(low)) return await tell(P.changesIntro + " " + CHANGES.join(" "));

  // Apps and duties: whole words, three letters or more, never on nothing.
  const name = low.replace(/^(bring me|bring|fetch|open|get me|get|the)\s+/, "").replace(/^the\s+/, "").trim();
  if (name.length >= 3) {
    const app = findApp(name); if (app) return await fetchApp(app);
    const duty = DUTIES.find(d => wordMatch(d.name, name) || wordMatch(d.id, name)); if (duty) return await openDuty(duty);
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
  say("Ready to send. It only wants your thumb.");
  try { await msg.send(); say(P.dispatched); } catch (e) { say(P.notSent); }   // the sheet was put away
}
async function sendEmail(who, about) {
  const c = await findContact(who); if (!c) return await tell(P.noSuch(cap(who)));
  const em = firstEmail(c); if (!em) return await tell(P.noEmail(c.givenName));
  const mail = new Mail(); mail.toRecipients = [em]; mail.subject = cap(about); mail.body = "";
  say("Ready to send. It only wants your thumb.");
  try { await mail.send(); say(P.dispatched); } catch (e) { say(P.notSent); }
}
async function ringUp(who) {
  const c = await findContact(who); if (!c) return await tell(P.noSuch(cap(who)));
  const num = firstPhone(c); if (!num) return await tell(P.noNumber(c.givenName));
  say(`Ringing ${c.givenName}. Do speak up.`); await Safari.open(`tel:${num.replace(/[^\d+]/g, "")}`);
}
async function readEvents(list, label) {
  if (!list.length) return await tell(`Nothing ${label}.`);
  const lines = list.map(e => `${tidy(e.title)}${e.isAllDay ? (spanWords(e) ? ", " + spanWords(e) : "") : ", " + eventWords(e)}${label === "this week" ? " " + niceDay(e.startDate) : ""}`);
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
    if (code !== 200) {
      if (code !== 0) lastMachineError = (res && res.error && res.error.message) ? `Google said ${code}: ${res.error.message}` : `Google said ${code}.`; // code 0: keep the "no reply" reason
      fault("The thinking machine", lastMachineError); throw new Error(lastMachineError);
    }
    try {
      const out = res.candidates[0].content.parts[0].text;
      if (model !== S.model) { S.model = model; save(); }
      lastMachineError = "";
      return out;
    } catch (e) { lastMachineError = "Google replied, but not with words I could use."; fault("The thinking machine", lastMachineError); throw new Error(lastMachineError); }
  }
  lastMachineError = lastMachineError || "No model would answer.";
  fault("The thinking machine", lastMachineError);
  throw new Error(lastMachineError);
}

// ───────────────────────── Screens ─────────────────────────
// Every row is built here, so the look lives in one place. Four kinds: a
// header, a line of information, something to tap, and something to tap
// that destroys. A destructive row says so in its words, not only its
// colour. A symbol beside a row is for sighted eyes; it goes in as a second
// cell so the spoken text is unchanged, and can be turned off below stairs.
const SYMBOLS = { correspondence: "envelope", diary: "calendar", reminders: "checklist", papers: "newspaper", study: "book", wireless: "radio", errands: "cart", below: "wrench.and.screwdriver" };
function buildRow(title, subtitle, onSelect, symbol, destructive) {
  const r = new UITableRow();
  r.height = subtitle ? 70 : Math.min(120, 54 + Math.floor(String(title).length / 48) * 18); // long lines get room
  const pic = symbol && S.symbols !== false;
  if (pic) { try { const im = UITableCell.image(SFSymbol.named(symbol).image); im.widthWeight = 12; r.addCell(im); } catch (e) {} }
  const c = subtitle ? UITableCell.text(title, subtitle) : UITableCell.text(title);
  c.leftAligned(); c.widthWeight = pic ? 88 : 100;
  if (destructive) c.titleColor = Color.red();
  r.addCell(c);
  if (onSelect) { r.onSelect = onSelect; r.dismissOnSelect = true; }
  return r;
}
function headerRow(text) { const r = new UITableRow(); r.isHeader = true; r.height = 40; r.addCell(UITableCell.text(text)); return r; }
function infoRow(title, subtitle) { return buildRow(title, subtitle || null, null, null, false); }
function actionRow(title, subtitle, onSelect, symbol) { return buildRow(title, subtitle || null, onSelect, symbol || null, false); }
function destructiveRow(title, subtitle, onSelect) { return buildRow(title, subtitle || null, onSelect, null, true); }
// The older names, kept so every screen reads the same.
function row(title, subtitle, onSelect, dismiss = true) { const r = buildRow(title, subtitle, onSelect, null, false); if (onSelect) r.dismissOnSelect = dismiss; return r; }
function header(text) { return headerRow(text); }

async function askTyped() {
  const a = new Alert(); a.title = S.valet; a.message = "Yes?"; a.addTextField("Message Margaret running late", "");
  a.addAction("Go"); a.addCancelAction("Never mind");
  if ((await a.present()) === 0) await handle(a.textFieldValue(0));
}
async function askSpoken() {
  say(P.listening);
  try { const t = await Dictation.start("en-GB"); if (t) await handle(t); } catch (e) {}
}

// The front door. In order: his briefing; what genuinely requires you;
// his one suggestion; three ways of asking him; the household.
async function home() {
  while (true) {
    const b = await brief(); const sug = suggestion();
    const table = new UITable(); table.showSeparators = true;
    let action = null;
    table.addRow(infoRow(b.text));

    const now = new Date();
    const soon = b.today.filter(e => !e.isAllDay && e.startDate > now && e.startDate - now < 4 * 3600 * 1000)[0];
    const leave = await leaveBy(b.today);
    if (soon || leave || b.due.length) {
      table.addRow(headerRow("What requires you"));
      if (soon) table.addRow(infoRow(tidy(soon.title), cap(niceTime(soon.startDate))));
      if (leave) table.addRow(infoRow(leave));
      const lists = listsOf(b.due);
      b.due.forEach(r => table.addRow(actionRow(tidy(r.title), cap(reminderDetail(r, lists)), () => { action = () => attend(r); })));
    }

    // He is observant, not insistent: the fuller phrasing at most once a day, and only when sure.
    const today = now.toDateString();
    const usual = sug.app && sug.confident && S.usualDay !== today;
    if (usual) { S.usualDay = today; save(); }
    if (sug.app) table.addRow(actionRow(usual ? P.usual(sug.app.n) : P.fetch(sug.app.n), null, () => { action = () => fetchApp(sug.app); }));

    table.addRow(headerRow("Ask him"));
    table.addRow(actionRow("Type a request", null, () => { action = askTyped; }, "keyboard"));
    table.addRow(actionRow("Speak to him", "Dictate a request", () => { action = askSpoken; }, "mic"));
    if (Keychain.contains("valet.gemini")) table.addRow(actionRow("Talk with him", "Back and forth, until you're done", () => { action = () => conversation(""); }, "bubble.left.and.bubble.right"));

    table.addRow(headerRow("The household"));
    DUTIES.forEach(d => table.addRow(actionRow(d.name, null, () => { action = () => openDuty(d); }, SYMBOLS[d.id])));
    table.addRow(actionRow("Below stairs", "Settings and arrangements", () => { action = belowStairs; }, SYMBOLS.below));

    say(b.text); // the briefing only; the rows say themselves
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
  a.addTextField(kind === "ring" ? "Margaret" : "Margaret, running ten minutes late", "");
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
  const when = e => `${cap(niceDay(e.startDate))}${e.isAllDay ? (spanWords(e) ? ", " + spanWords(e) : "") : ", " + niceTime(e.startDate)}`;
  list.forEach(e => table.addRow(row(tidy(e.title), when(e), () => { next = async () => {
    const a = new Alert(); a.title = tidy(e.title); a.message = when(e); a.addDestructiveAction("Strike it out"); a.addCancelAction("Leave it");
    if ((await a.present()) === 0) { e.remove(); say(P.struck); }
  }; })));
  await table.present(false); if (next) await next();
}

async function remindersTable() {
  const all = (await Reminder.allIncomplete()).sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0)).slice(0, 25);
  const table = new UITable(); table.showSeparators = true;
  table.addRow(row(all.length ? "Outstanding. Tap one to tick it off or put it off, and I shall pretend not to be surprised." : P.remindersEmpty, null, null));
  let next = null;
  table.addRow(row("Add one", null, () => { next = async () => { const a = new Alert(); a.title = "Not to be forgotten"; a.addTextField("Invoice the accountant on Friday", ""); a.addAction("Note it"); a.addCancelAction("Never mind"); if ((await a.present()) === 0) await handle("remind me to " + a.textFieldValue(0)); }; }));
  const lists = listsOf(all);
  all.forEach(r => table.addRow(row(tidy(r.title), cap(reminderDetail(r, lists)), () => { next = () => attend(r); })));
  await table.present(false); if (next) await next();
}

async function belowStairs() {
  const table = new UITable(); table.showSeparators = true;
  table.addRow(infoRow(`Arrangements you'd rather not think about. I've noticed. This is edition ${VERSION}.`));
  let next = null;

  table.addRow(headerRow("Himself"));
  table.addRow(actionRow("His name and how he addresses you", `${S.valet}, to ${addressee()}`, () => { next = () => introduce(true); }));
  table.addRow(actionRow("His voice", hasEleven() ? (lastVoiceError ? "ElevenLabs — last attempt failed, tap for details" : "ElevenLabs") : "The telephone's own voice", () => { next = hisVoice; }));
  table.addRow(actionRow("Read aloud", S.speak ? "On" : "Off", () => { next = async () => { S.speak = !S.speak; save(); say(`Read aloud is ${S.speak ? "on" : "off"}.`); }; }));
  table.addRow(actionRow("Pictures beside rows", S.symbols !== false ? "On. Decoration for sighted eyes; VoiceOver is unaffected" : "Off", () => { next = async () => { S.symbols = S.symbols === false; save(); say(`Pictures ${S.symbols ? "on" : "off"}.`); }; }));

  table.addRow(headerRow("The household"));
  table.addRow(actionRow("About the household", profileSummary(), () => { next = aboutHousehold; }));
  table.addRow(actionRow("The staff", "Apps and their addresses", () => { next = staff; }));
  table.addRow(actionRow("The newsagent", `${S.feeds.length} papers taken`, () => { next = newsagent; }));
  table.addRow(actionRow("The weather", S.place ? "Fixed to " + S.place : "From wherever you happen to be", () => { next = async () => {
    const a = new Alert(); a.title = "The weather";
    a.message = "By default I use the telephone's location. If that's off, name a town and I'll use it instead." + (lastWeatherError ? "\n\nLast failure: " + lastWeatherError : "");
    a.addTextField("Town", S.place || "");
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

  table.addRow(headerRow("His mind"));
  table.addRow(actionRow("The thinking machine", Keychain.contains("valet.gemini") ? (lastMachineError ? "Key held — last attempt failed, tap for details" : `Key held, using ${S.model}`) : "No key", () => { next = async () => {
    const a = new Alert(); a.title = "The thinking machine";
    a.message = (Keychain.contains("valet.gemini") ? "A Gemini key is held. Paste a new one to replace it, or leave blank to keep it." : "Paste your Gemini key from aistudio.google.com. It goes in the Keychain, not the file.") + (lastMachineError ? "\n\nLast failure: " + lastMachineError : "");
    a.addSecureTextField("Key", ""); a.addAction("Keep it"); a.addAction("Test it"); a.addCancelAction("Never mind");
    const i = await a.present(); if (i === -1) return;
    const k = a.textFieldValue(0).trim(); if (k) Keychain.set("valet.gemini", k);
    if (!Keychain.contains("valet.gemini")) { await tell(P.noKey); return; }
    if (i === 0) { say(P.keySaved); return; }
    try { const out = await gemini("Reply in one short dry sentence, as an English butler.", "Are you there?", false); await tell(`It answers, via ${S.model}: ${out.trim()}`); }
    catch (e) { await tell(P.machineFailed + " " + P.detailsBelow); }
  }; }));
  table.addRow(actionRow("What he remembers", `${J.notes.length} notes, ${J.acts.length} actions`, () => { next = journalScreen; }));
  table.addRow(actionRow("His records", "Files from your own apps that he may read", () => { next = recordsScreen; }));

  table.addRow(headerRow("Arrangements"));
  table.addRow(actionRow("Arrangements", noticesSummary(), () => { next = arrangements; }));
  table.addRow(actionRow("Quiet hours", quietSummary(), () => { next = quietHours; }));

  table.addRow(headerRow("Housekeeping"));
  table.addRow(actionRow("What went wrong", (() => { const n = readFaults().length; return n ? `${n} on record` : "Nothing on record"; })(), () => { next = wentWrong; }));
  table.addRow(actionRow("What's changed", `Edition ${VERSION}`, () => { next = whatsChanged; }));
  table.addRow(destructiveRow("Forget the routine he's learned", "Clears what he knows of your habits. He will ask first", () => { next = async () => {
    const a = new Alert(); a.message = "Forget the routine? I shall start observing afresh."; a.addDestructiveAction("Forget it"); a.addCancelAction("Keep it");
    if ((await a.present()) === 0) { S.routine = {}; S.habits = []; delete S.usualDay; save(); say(P.forgot); }
  }; }));
  table.addRow(destructiveRow("Dismiss him and start again", "Everything he holds goes. He will ask first", () => { next = async () => {
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
    const a = new Alert(); a.title = "To keep"; a.addTextField("The plumber prefers Tuesdays", ""); a.addAction("Keep it"); a.addCancelAction("Never mind");
    if ((await a.present()) === 0) { const v = a.textFieldValue(0).trim(); if (v) { remember(v, "told"); say(P.remembered); } }
  }; }));
  J.notes.slice().reverse().slice(0, 40).forEach(n => table.addRow(row(n.t, n.at.slice(0, 10), () => { next = async () => {
    const a = new Alert(); a.message = n.t; a.addDestructiveAction("Forget it"); a.addCancelAction("Keep it");
    if ((await a.present()) === 0) { J.notes = J.notes.filter(x => x !== n); saveJournal(); say(P.forgotten); }
  }; })));
  if (J.notes.length) table.addRow(destructiveRow("Forget everything", "Notes and actions both. He will ask first", () => { next = async () => {
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
  table.addRow(infoRow(trayReport()));
  let next = null;
  table.addRow(row("Take another paper", "One address at a time", () => { next = () => editFeed(null); }));
  table.addRow(row("Import a list", "An OPML file from Lire, Overcast or similar", () => { next = importOPML; }));
  S.feeds.forEach(f => table.addRow(row(f.n, [f.kind === "podcast" ? "Podcast" : null, f.tag ? "Flagged: " + f.tag : null].filter(Boolean).join(" · ") || null, () => { next = () => editFeed(f); })));
  await table.present(false); if (next) await next();
}
async function editFeed(f) {
  const al = new Alert(); al.title = f ? f.n : "Another paper";
  al.addTextField("Name", f ? f.n : ""); al.addTextField("Feed address", f ? f.u : "https://");
  al.addTextField("A word to flag it by, e.g. tech, or leave blank", f && f.tag ? f.tag : "");
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
      const d = new Alert(); d.title = "That didn't work"; d.message = P.voiceGone + "\n\nThe particulars: " + lastVoiceError + "\n\nIf the audio was fetched, I can play it another way to prove the voice itself is fine.";
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
  if (again) a.addCancelAction("Never mind");                       // keeps the name he has
  const ai = await a.present(); if (ai === -1) return;
  const n = a.textFieldValue(0).trim(); if (!n) return again ? undefined : introduce(again);
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
  if (!again) {
    // Offered once. Never insisted upon; it lives below stairs thereafter.
    const d = new Alert(); d.title = n; d.message = P.householdAsk; say(d.message);
    d.addAction("Tell him now"); d.addCancelAction("Later");
    if ((await d.present()) === 0) await aboutHousehold();
  }
  S.introduced = true; save();
  await tell(P.introDone(addressee()));
}

// ───────────────────────── About the household ─────────────────────────
// What he may be told about you. All of it optional, all of it blank until
// you say otherwise, and none of it in the script.
async function aboutHousehold() {
  const p = S.profile || {};
  const a = new Alert(); a.title = "About the household";
  a.message = "Whatever you tell me here shapes what I say and what I flag. Every line is optional. It stays on the telephone, except when the thinking machine writes for me.";
  a.addTextField("Where you live", p.where || "");
  a.addTextField("What you do", p.does || "");
  a.addTextField("Things worth flagging in the papers", p.papers || "");
  a.addTextField("Anything else I should know", p.other || "");
  a.addAction("Very good"); a.addCancelAction("Never mind");
  if ((await a.present()) !== 0) return false;
  S.profile = { where: a.textFieldValue(0).trim(), does: a.textFieldValue(1).trim(), papers: a.textFieldValue(2).trim(), other: a.textFieldValue(3).trim() };
  save(); say(P.householdNoted); return true;
}
function profileSummary() {
  const p = S.profile || {}, n = ["where", "does", "papers", "other"].filter(k => clean(p[k])).length;
  return n ? `${n} of 4 things told` : "Nothing told yet";
}

// ───────────────────────── Housekeeping screens ─────────────────────────
function whenAgo(iso) { const d = new Date(iso); return isNaN(d) ? "" : `${niceDay(d)} at ${niceTime(d)}`; }
async function wentWrong() {
  const list = readFaults().slice().reverse();
  const table = new UITable(); table.showSeparators = true;
  table.addRow(infoRow(list.length ? "What went wrong, most recent first. I keep the particulars here so I needn't say them aloud." : P.nothingWrong));
  let next = null;
  list.forEach(f => table.addRow(infoRow(`${f.where}, ${whenAgo(f.at)}`, f.detail)));
  if (list.length) table.addRow(destructiveRow("Clear the record", "Forgets these failures. Nothing else is touched", () => { next = async () => {
    const a = new Alert(); a.message = "Clear the record of what went wrong?"; a.addDestructiveAction("Clear it"); a.addCancelAction("Leave it");
    if ((await a.present()) === 0) { clearFaults(); lastMachineError = ""; lastVoiceError = ""; lastWeatherError = ""; say(P.forgotten); }
  }; }));
  await table.present(false); if (next) await next();
}

const CHANGES = [
  "The widget no longer fetches anything. I stock the tray, papers and weather, when you open me, when you open the papers, when you ask me to read aloud, or when an automation runs me with the word refresh; the widget only reads what's there. Every paper is sent for at once, six seconds each, and the tray fills as they arrive.",
  "The newsagent says how many papers you take and how long the last full restocking took.",
  "On a quiet day, with nothing pressing in the diary and no more than one reminder, I may mention what happened on this day, once, and plainly. Ask me for something and I'll tell you regardless."
];
const PAST = [
  { edition: "4.2", items: [
  "Overdue reminders now reach the front door and the briefing, not only the full list. You may find one or two you'd forgotten. That is rather the point.",
  "I listen more carefully. A short word is no longer taken for an app or a screen, 'note' means remember, and 'tell me' is a question rather than a message to somebody called Me.",
  "Times are checked: thirty minutes is a duration, not half past twenty-nine. A reminder with no date stays undated rather than being fixed for nine in the morning.",
  "I speak one line at a time, and I no longer talk over myself.",
  "A trip already under way is not announced as starting tomorrow, does not lead the briefing ahead of the day's engagements, and is not repeated in the evening.",
  "If the telephone won't let me at the diary, or you put a message away unsent, I say so rather than falling over.",
  "A reminder that repeats is never called stale. If today's turn is past its time I say so; otherwise I hold my peace. Only a one-off earns 'has been there N days', counted from when it was due.",
  "The papers in the brief, properly: the top story from each paper, more from the ones you've flagged, and any episode from the last two days. Two or three stories across different papers, always one you've flagged, never the same headline twice running. The large widget may add a second paragraph; the small one gets a single headline."
  ] },
  { edition: "4.1", items: [
    "The widget keeps up. Every draw starts from the diary as it stands: nothing that has finished, and anything under way said as now. I ask the telephone to redraw at the moments that matter, and my written paragraph is dropped the instant it stops being true. It says when I last looked, so you know.",
    "Reminders are fuller: when they're due, in clock words; overdue said plainly; the list, when more than one is in play; the priority, when it's high. Tap one and I read it out, notes and all, and offer to tick it off or put it off until later today or tomorrow.",
    "Titles are tidied before I say them: a capital to start, and a space where a word ran into a digit."
  ] },
  { edition: "4.0", items: [
    "Nothing about you lives in the script any more. Tell me about the household below stairs and I'll write accordingly; say nothing and I'll assume nothing.",
    "The front door is in order: my briefing, then what requires you, then one suggestion, then three ways of asking me, then the household.",
    "I weigh recent habits over old ones, keep weekdays apart from weekends, and won't suggest what you've only just had.",
    "When something fails I say so plainly and keep the particulars under what went wrong, below stairs.",
    "Below stairs is grouped: himself, the household, his mind, arrangements, housekeeping. Everything is where it was, only tidier.",
    "Engagements that run for days are said plainly: all week, or until Friday, rather than at midnight.",
    "Quiet hours, should you want them: no notices, and a one-line brief on the widget."
  ] }
];
async function whatsChanged() {
  const table = new UITable(); table.showSeparators = true;
  table.addRow(infoRow(`${P.changesIntro} Edition ${VERSION}.`));
  CHANGES.forEach(c => table.addRow(infoRow(c)));
  for (const past of PAST) { table.addRow(headerRow(`Edition ${past.edition}`)); past.items.forEach(c => table.addRow(infoRow(c))); }
  await table.present(false);
}

function clockWord(h) { return `${h % 12 || 12} ${h < 12 ? "in the morning" : h < 18 ? "in the afternoon" : "in the evening"}`; }
function quietSummary() { return S.quiet.from !== S.quiet.to ? `From ${clockWord(S.quiet.from)} until ${clockWord(S.quiet.to)}` : "Off"; }
async function quietHours() {
  const a = new Alert(); a.title = "Quiet hours";
  a.message = "Between these hours I leave no notices and keep the widget to a line. Hours on the 24-hour clock; the same hour twice means off.";
  a.addTextField("From", String(S.quiet.from)); a.addTextField("Until", String(S.quiet.to));
  a.addAction("Arrange it"); a.addCancelAction("Never mind");
  if ((await a.present()) !== 0) return;
  const f = parseInt(a.textFieldValue(0), 10), t = parseInt(a.textFieldValue(1), 10);
  if (isNaN(f) || isNaN(t) || f < 0 || f > 23 || t < 0 || t > 23) return await tell("Those aren't hours I recognise.");
  S.quiet = { from: f, to: t }; save(); await scheduleNotices();
  say(f === t ? "As you were." : P.quietArranged);
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
// Pass the cache in if you already hold it, so your later write doesn't undo this one.
async function outlook(cache) {
  const own = !cache; if (own) cache = readCache();
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
    const req = new Request(url); req.timeoutInterval = FEED_TIMEOUT;
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
    cache.wx = wx; cache.wxAt = new Date().toISOString(); delete cache.wxFails;
    if (own) writeCache(cache);
    return wx;
  } catch (e) {
    lastWeatherError = String((e && e.message) || e);
    cache.wxFails = (cache.wxFails || 0) + 1;                        // three in a row is worth a note; one is weather
    if (cache.wxFails === 3) fault("The weather", lastWeatherError + ", three times running");
    if (own) writeCache(cache);
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
    if (spare <= 0) return "You are already late for " + tidy(e.title) + ".";
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
      if (d >= 2 && (d <= 30 || [45, 60, 90, 100].includes(d))) out.push({ title: tidy(e.title), days: d });
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
// One-off reminders only. Age is counted from the due date when there is
// one, and from creation only for the undated. Repeating ones never qualify.
function staleReminders(due) {
  const out = [];
  for (const r of due || []) {
    if (repeating(r)) continue;
    const since = r.dueDate ? new Date(r.dueDate) : r.creationDate ? new Date(r.creationDate) : null;
    if (!since || isNaN(since)) continue;
    const age = Math.floor((Date.now() - since) / 86400000);
    if (age >= 7) out.push({ title: tidy(r.title), days: age, overdue: !!r.dueDate });
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
      if (same >= 3) out.push(`That's the ${same === 3 ? "third" : same === 4 ? "fourth" : same + "th"} ${tidy(today[0].title)} this month.`);
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
  for (const s of staleReminders(due)) bits.push(s.overdue ? `The reminder "${s.title}" has been overdue ${s.days} days.` : `The reminder "${s.title}" has been there ${s.days} days.`);
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
          "Not a thing on. I've checked twice.", "A blank page, {a}. Do try not to fill it with the telephone."],
  busy: ["I'd allow extra time.", "You'll want to be dressed for at least one of those.", "A full day. My condolences.",
         "Ambitious, but not impossible.", "I shall have the tea ready."],
  evening: ["The wireless, I imagine.", "Nothing further tonight, unless you insist.", "The day is closed. I've closed it.",
            "An early night would be novel."],
  overdue: ["Some of these have been with us a while.", "The invoice is still there, in case you were wondering.", "One or two of these are becoming heirlooms."]
};
function remark(kind) {
  const list = REMARKS[kind] || REMARKS.empty;
  const d = new Date();
  return list[(d.getDate() + d.getHours()) % list.length].replace("{a}", addressee());
}

// Assemble the paragraph without help.
function composeBrief(today, tom, due, pick, wx, extra, notes, size, fact) {
  const parts = [greetingWord() + ", " + addressee() + "."];
  const short = s => s.replace(/ in the (morning|afternoon|evening)/, "");
  today = leadOrder(today);                                  // the timed thing leads
  const fresh = (tom || []).filter(e => !continuing(e));      // not the trip that merely goes on
  if (dayPart() === "evening" && fresh.length && !today.some(e => !e.isAllDay)) {   // nothing timed left tonight
    parts.push("That's the day. " + tidy(fresh[0].title) + " " + short(tomorrowWords(fresh[0])) + ".");
  } else if (today.length) {
    const e = today[0];
    parts.push(tidy(e.title) + " " + short(eventWords(e, "today")) + ".");
    if (size !== "small") {
      if (today.length === 2) parts.push("One more after that: " + tidy(today[1].title) + " " + short(eventWords(today[1], "all day")) + ".");
      else if (today.length > 2) parts.push((today.length - 1) + " more after that, ending with " + tidy(today[today.length - 1].title) + ".");
    }
  } else if (fresh.length) {
    parts.push("Nothing today. " + tidy(fresh[0].title) + " " + short(tomorrowWords(fresh[0])) + ".");
  } else {
    parts.push(remark(new Date().getHours() >= 18 ? "evening" : "empty"));
  }
  const pw = paperWords(pick, size);
  if (size === "small") { if (pw.line) parts.push(pw.line); return parts.join(" "); }   // the day and one headline; nothing else fits
  if (due.length === 1) parts.push("One reminder outstanding: " + short(reminderWords(due[0], listsOf(due))) + ".");
  else if (due.length > 1) parts.push(due.length + " reminders outstanding, " + tidy(due[0].title) + " among them.");
  if (notes && notes.length) parts.push(notes[0]);
  if (extra && extra.leave) parts.push(extra.leave);
  const wl = weatherLine(wx); if (wl) parts.push(wl);
  if (extra && extra.battery) parts.push(extra.battery);
  if (pw.line) parts.push(pw.line);
  if (fact && quietDay(today, due, pick)) parts.push(fact);   // a quiet day earns one historical clause
  // Finish on a remark, unless the diary already earned one.
  if (today.length > 1) parts.push(remark("busy"));
  else if (due.length > 2) parts.push(remark("overdue"));
  else if (today.length && new Date().getHours() >= 18) parts.push(remark("evening"));
  return parts.join(" ") + (pw.more ? "\n\n" + pw.more : "");
}

// Let him write it himself, in his own voice, over the material chosen above.
async function writeBrief(today, tom, due, pick, wx, extra, notes, changed, size, previous, fact) {
  const note = fact && quietDay(today, due, pick) ? fact : "";   // offered only when the day is quiet; the code decides, he phrases
  const words = (e, d) => eventWords(e, d).replace(/ in the (morning|afternoon|evening)/, "");
  today = leadOrder(today);
  const story = i => `${i.paper}${i.tag ? " (flagged " + i.tag + ")" : ""}: ${i.title}${i.summary ? " — " + i.summary : ""}`;
  const facts = [
    "Time of day greeting to use: " + greetingWord(),
    "Address him as: " + addressee(),
    "Today: " + (today.length ? today.map(e => tidy(e.title) + " " + words(e, "all day")).join("; ") : "nothing"),
    "Tomorrow: " + (tom.length ? tom.map(e => tidy(e.title) + " " + (continuing(e) ? "continuing, " + (spanWords(e) || "all day") : words(e, "all day"))).join("; ") : "nothing"),
    "Reminders outstanding: " + (due.length ? due.map(r => reminderWords(r, listsOf(due))).join("; ") : "none"),
    pick && pick.items.length ? "The news for this brief, from different papers: " + pick.items.map(story).join("; ") : "No news available",
    pick && pick.extra ? "One further headline, only for a second paragraph if there is room: " + story(pick.extra) : "",
    pick && pick.episodes.length ? "New episodes in the last two days: " + pick.episodes.map(e => `${e.podcast}: ${e.title}`).join("; ") : "No new episodes",
    previous && previous.length ? "Headlines given in the previous brief, not to be repeated: " + previous.join("; ") : "",
    extra && extra.leave ? "Timing: " + extra.leave : "",
    extra && extra.battery ? "Battery: " + extra.battery : "",
    notes && notes.length ? "Things you have noticed:\n" + notes.map(n => "- " + n).join("\n") : "",
    note ? "An historical note, because the day is quiet: " + note : "",
    changed ? "Changed since he last looked: " + changed : "",
    today.some(e => /^now,/.test(words(e, ""))) ? "An engagement marked \"now\" is in progress: speak of it as happening, not as upcoming." : "",
    wx ? `Weather: ${wx.word || ""} ${wx.now}C, high ${wx.high}, low ${wx.low}${wx.rain != null ? ", chance of rain " + wx.rain + "%" : ""}${wx.sunset ? ", sunset " + niceTime(new Date(wx.sunset)).replace(/ in the (morning|afternoon|evening)/, "") : ""}` : "No weather available"
  ].join("\n");
  const shape = size === "large"
    ? `Write for the large widget, up to 90 words. Order: the greeting and the day; what is outstanding; the weather only if it bears on what he is doing; the news; the new episodes; one closing dry remark. If that paragraph comes in under 60 words and you were given a further headline, add a blank line and a second short paragraph: that headline, and, if it is from a flagged paper, one sentence on why it deserves his attention. Otherwise stop. Never pad.`
    : `Write ONE paragraph for the widget, no more than 75 words and no line breaks: the greeting, then what matters for this part of the day, the weather only if it bears on what he is doing, the news, the new episodes, and a single dry remark to finish.`;
  const sys = personaPrompt(addressee()) + `

${SHAPE[dayPart()]}

${shape}

Flowing prose, no lists, no headings. Give two or three of the news items, from different papers, in your own words, always including the one from a flagged paper when there is one. Say a new episode as "New from [podcast]: title". Never repeat a headline from the previous brief. Only state what the facts below say; invent nothing. Exactly one barb, at the end.

If something is marked as changed since he last looked, lead with that rather than restating what he already knows. If you have been given things you noticed, work at most ONE of them in — the most telling — and leave the rest. An observation is worth more than another list of engagements.

If you have been given an historical note, it is because the day is quiet: nothing pressing in the diary, no more than one reminder. Give it as one clause, plainly, in the form "On this day in 1798, the French landed at Killala." Never as trivia, never "did you know", never more than one, and never beside a death or a grave matter.`;
  const out = (await gemini(sys, facts, false)).trim();
  return size === "large" ? out.replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n\n") : out.replace(/\s+/g, " ");
}

// ───────────────────────── Keeping the widget honest ─────────────────────────
// What the facts are, in one string: every unfinished engagement with its
// start and whether it is upcoming or under way, every reminder due with
// its time, and the part of day. If any of it changes, the written
// paragraph is stale and is not shown.
function factsKey(today, due, tom) {
  const now = new Date();
  const phase = e => e.isAllDay ? "day" : e.startDate > now ? "soon" : "now";
  const ev = (today || []).map(e => `${e.title}@${e.startDate.getTime()}:${phase(e)}`).sort().join("|");
  const tm = (tom || []).map(e => `${e.title}@${e.startDate.getTime()}`).sort().join("|");
  const rm = (due || []).map(r => `${r.title}@${r.dueDate ? r.dueDate.getTime() : 0}`).sort().join("|");
  return ev + "#" + tm + "#" + rm + "#" + dayPart();
}
// Only the facts as they stand: nothing that has ended, nothing from cache.
async function liveFacts() {
  const now = new Date();
  let today = [], tom = [], due = [];
  try { today = (await eventsToday()).filter(e => e.endDate > now); } catch (e) {}
  try { tom = await eventsTomorrow(); } catch (e) {}
  try { due = await remindersDue(); } catch (e) {}
  return { today, tom, due };
}
// When iOS should next redraw: the earliest of the next engagement's start,
// the current one's end, the next reminder due today, the next turn of the
// day (5, 12, 18), or a quarter of an hour; never sooner than five minutes.
function nextRedraw(today, tom, due) {
  const now = Date.now(), soon = [now + 15 * 60 * 1000];
  for (const e of [...(today || []), ...(tom || [])]) {
    if (e.isAllDay) continue;
    const s = e.startDate.getTime(), f = e.endDate.getTime();
    if (s > now) soon.push(s + 30 * 1000);
    else if (f > now) soon.push(f + 30 * 1000);
  }
  for (const r of due || []) if (reminderTimed(r) && r.dueDate.getTime() > now) soon.push(r.dueDate.getTime() + 30 * 1000);
  for (const h of [5, 12, 18, 29]) { const d = new Date(); d.setHours(h, 0, 30, 0); if (d.getTime() > now) { soon.push(d.getTime()); break; } } // 29 = 5 tomorrow
  return new Date(Math.max(Math.min(...soon), now + 5 * 60 * 1000));
}
function lookedAt() { const d = new Date(); return `Looked at ${pad(d.getHours())}:${pad(d.getMinutes())}.`; }

// ───────────────────────── The look ─────────────────────────
// A dark card that reads like a letter, not a notification. Monochrome:
// near-black, three weights of warm white, and one thread of brass on the
// rule and the signature and nowhere else. Nothing louder than the paragraph.
const LOOK = {
  bgFrom: "#0B0B0C", bgTo: "#111112", bgLift: "#151310",      // top-left to bottom-right, a warm lift in the last corner
  ink: "#F2EEE6", muted: "#8A8781", brass: "#B8925A",
  serif: "IowanOldStyle-Roman", serifItalic: "IowanOldStyle-Italic", // the PostScript names iOS answers to
  pad: { top: 16, left: 16, bottom: 14, right: 16 }
};
const ink = () => new Color(LOOK.ink), muted = () => new Color(LOOK.muted), brass = a => new Color(LOOK.brass, a == null ? 1 : a);
function paintCard(w) {
  const g = new LinearGradient();
  g.colors = [new Color(LOOK.bgFrom), new Color(LOOK.bgTo), new Color(LOOK.bgLift)];
  g.locations = [0, 0.82, 1];
  g.startPoint = new Point(0, 0); g.endPoint = new Point(1, 1);
  w.backgroundGradient = g;
  w.setPadding(LOOK.pad.top, LOOK.pad.left, LOOK.pad.bottom, LOOK.pad.right);
}
// UIKit gives the system face if a named one is missing, silently; there is
// no way to ask. Iowan Old Style ships with iOS, so this should hold.
const serif = (size, italic) => new Font(italic ? LOOK.serifItalic : LOOK.serif, size);
const smallCaps = s => String(s).toUpperCase();   // capitals only: spacing the letters by hand made VoiceOver spell them out
// Spelt out from the device clock, not a formatter, so the day is the telephone's own.
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
// The glanceable line: figures and short forms only, never the paragraph's words.
function statusStrip(wx, due, today, tom) {
  const bits = [];
  if (wx && wx.now != null) bits.push(`${wx.now}°${wx.word ? " " + wx.word : ""}`);
  if (wx && wx.rain != null && wx.rain >= 40) bits.push(`rain ${wx.rain}%`);
  bits.push(due.length ? `${due.length} outstanding` : "nothing outstanding");
  const next = leadOrder(today).find(e => !e.isAllDay && e.startDate > new Date());
  if (next) bits.push(`${tidy(next.title)} ${niceTime(next.startDate).replace(/ in the (morning|afternoon|evening)/, "")}`);
  else { const t = (tom || []).filter(e => !continuing(e))[0]; if (t) bits.push(`${tidy(t.title)} tomorrow`); }
  return bits.join(" · ");
}

async function widget() {
  const size = config.widgetFamily || "medium";
  const w = new ListWidget();
  paintCard(w);
  w.url = "scriptable:///run/" + encodeURIComponent(Script.name());

  if (!S.introduced) {
    const t = w.addText("Tap to be introduced.");
    t.font = serif(15, true); t.textColor = ink();
    Script.setWidget(w); return;
  }

  const { today, tom, due } = await liveFacts();   // fresh every draw; nothing finished, nothing cached

  // The widget fetches nothing. It reads the tray the app has stocked; an
  // empty or stale tray means a brief without papers or weather, said nothing of.
  const cache = readCache();
  const wx = size === "small" ? null : weatherUsable(cache);
  const extra = {};
  if (size !== "small") {
    extra.leave = await leaveBy(today);
    const lvl = Math.round(Device.batteryLevel() * 100);
    if (lvl <= 15 && !Device.isCharging()) extra.battery = lvl + " per cent on the telephone, which will limit us both.";
  }

  const papers = papersUsable(cache);
  const pick = pickPapers(papers, cache.lastHeadlines, size);
  const fact = size === "small" ? "" : onThisDayUsable(cache);

  // The paragraph. His own words if he can manage it, for half an hour at
  // most, and only while the facts it was written from still hold.
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

  const facts = factsKey(today, due, tom);
  // The papers enter the signature by their hourly refresh, not by what was
  // picked: the pick moves on after every brief, and must not itself force one.
  const sig = facts + "#" + (papers ? papers.at : "") + "#" + size + "#" + (wx ? wx.word + wx.now : "") + "#" + (extra.leave || "") + "#" + (extra.battery ? "low" : "") + "#" + notes.join("|") + "#" + (fact ? dayKey() : "");
  const written = cache.briefAt && (Date.now() - new Date(cache.briefAt) < 30 * 60 * 1000) && cache.briefSig === sig;
  let wrote = false;
  if (written && cache.brief && size !== "small") text = cache.brief;
  else if (size !== "small" && Keychain.contains("valet.gemini")) {
    try {
      text = await writeBrief(today, tom, due, pick, wx, extra, notes, changed, size, cache.lastHeadlines, fact);
      cache.brief = text; cache.briefAt = new Date().toISOString(); cache.briefSig = sig; cache.briefFacts = facts; wrote = true;
    } catch (e) { text = null; }
  }
  delete cache.briefPart;
  if (!text) { text = composeBrief(today, tom, size === "small" ? [] : due, pick, wx, extra, notes, size, fact); wrote = size !== "small"; } // local, and never stale
  if (wrote && pick) cache.lastHeadlines = pick.used;           // so the next brief says something else
  if (inQuietHours()) {                                                   // quiet hours: the greeting and one sentence
    const s = text.split(". ");
    text = s.slice(0, /^(Good|You're up)/.test(s[0]) ? 2 : 1).join(". ").replace(/\.?$/, ".");
  }
  // Write only what is the widget's to write, onto whatever the app has
  // put on the tray since this draw began.
  const latest = readCache();
  for (const k of ["brief", "briefAt", "briefSig", "briefFacts", "state", "lastHeadlines"]) if (cache[k] !== undefined) latest[k] = cache[k];
  delete latest.briefPart; delete latest.headline; delete latest.headlineAt;
  writeCache(latest);

  // ── The card, top to bottom ──
  // Each line of the top matter is its own row of fixed height, so nothing
  // can be squeezed onto its neighbour when the paragraph runs long.
  const line = (h, fill) => { const s = w.addStack(); s.layoutHorizontally(); s.centerAlignContent(); s.size = new Size(0, h); fill(s); s.addSpacer(); return s; };
  // 1. Header: his name in capitals, then today's date from the device clock. Muted.
  const now = new Date();
  const dateWords = `${DAY_NAMES[now.getDay()]} ${now.getDate()} ${MONTH_NAMES[now.getMonth()]}`;
  line(14, s => { const head = s.addText(size === "small" ? smallCaps(S.valet) : `${smallCaps(S.valet)} · ${smallCaps(dateWords)}`); head.font = Font.mediumSystemFont(11); head.textColor = muted(); head.lineLimit = 1; });

  if (size !== "small") {
    // 2. Status strip, on its own row beneath: the glanceable layer, figures and short forms.
    const strip = statusStrip(wx, due, today, tom);
    if (strip) { w.addSpacer(4); line(14, s => { const st = s.addText(strip); st.font = Font.regularSystemFont(11); st.textColor = muted(); st.lineLimit = 1; st.minimumScaleFactor = 0.85; }); }
    // 3. A hairline in brass, a quarter strength: a full-width row one point tall.
    w.addSpacer(8);
    line(1, s => { s.backgroundColor = brass(0.25); s.cornerRadius = 0.5; });
    w.addSpacer(8);
  } else {
    w.addSpacer(6);
  }

  // 4. The paragraph, ivory serif. Truncate before shrinking.
  const body = w.addText(text);
  body.font = serif(size === "small" ? 13 : size === "large" ? 17 : 15);
  body.textColor = ink();
  if (size === "large") {
    // No fixed line count: the paragraph fills the card and the spacer below
    // pins the footer. The scale factor absorbs the occasional long brief; the
    // text is cut at a sentence end before it could ever be cut mid-word.
    body.minimumScaleFactor = 0.75;
    body.lineLimit = 0;
    if (text.length > 650) { const cut = text.lastIndexOf(". ", 650); if (cut > 200) body.text = text.slice(0, cut + 1); }
  } else {
    body.minimumScaleFactor = 0.8;
    body.lineLimit = 5;
  }

  // 5. Whatever the length, the footer sits at the foot.
  w.addSpacer();

  // 6. Footer: signature in brass italic, "Looked at" beneath on the large
  //    card, and the Read-aloud pill on its own tap target.
  const foot = w.addStack(); foot.layoutHorizontally(); foot.bottomAlignContent();
  const left = foot.addStack(); left.layoutVertically();
  const signature = left.addText("— " + S.valet); signature.font = serif(12, true); signature.textColor = brass();
  if (size === "large") { const looked = left.addText(lookedAt()); looked.font = Font.regularSystemFont(10); looked.textColor = muted(); looked.textOpacity = 0.6; }
  if (size !== "small") {
    foot.addSpacer();
    const pill = foot.addStack();
    pill.url = "scriptable:///run/" + encodeURIComponent(Script.name()) + "?read=1";   // opens him and he reads this aloud, nothing else
    pill.setPadding(4, 10, 4, 10); pill.cornerRadius = 11; pill.borderWidth = 1; pill.borderColor = new Color(LOOK.muted, 0.4);
    const r = pill.addText("Read aloud"); r.font = Font.mediumSystemFont(11); r.textColor = ink();
  }

  w.refreshAfterDate = nextRedraw(today, tom, due);
  Script.setWidget(w);
}

// ───────────────────────── Entry ─────────────────────────
// Whatever goes wrong here lands in his voice and below stairs, never as
// the telephone's own error dialogue.
try {
  if (config.runsInWidget) {
    await widget();
    if (S.introduced) await scheduleNotices();
  } else if (!S.introduced) {
    await introduce(false);
    await home();
  } else if (args.shortcutParameter === "refresh" || (args.queryParameters && args.queryParameters.refresh)) {
    // Run by an automation with the word "refresh": stock the tray, papers
    // and weather, and leave without a word. The widget reads it next time.
    await refreshTray();
  } else if (args.queryParameters && args.queryParameters.read) {
    // Tapped "Read aloud" on the widget: say the brief and withdraw. His
    // written paragraph only if it is recent and still true; otherwise a
    // fresh line from the facts as they stand. The tray is restocked
    // meanwhile, for next time.
    refreshTray();
    const cached = readCache();
    const { today: td, tom: tm, due: du } = await liveFacts();
    const recent = cached.brief && cached.briefAt && (Date.now() - new Date(cached.briefAt) < 10 * 60 * 1000) && cached.briefFacts === factsKey(td, du, tm);
    let line = cached.brief;
    if (!recent) {
      const pick = pickPapers(cached.papers, cached.lastHeadlines, "medium");   // the same papers the widget holds
      line = composeBrief(td, tm, du, pick, cached.wx, {}, await noticings(td, tm, du), "medium", onThisDayUsable(cached));
      if (pick) { cached.lastHeadlines = pick.used; writeCache(cached); }
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
    warmCache();    // in the background, while you talk to him
    refreshTray();  // likewise: the papers and the weather, for the widget
    await home();
  }
} catch (e) {
  fault("The household", (e && e.stack) || (e && e.message) || e);
  if (config.runsInWidget) {
    try { const w = new ListWidget(); const t = w.addText(P.fellOver); t.font = Font.systemFont(14); Script.setWidget(w); } catch (e2) {}
  } else {
    try { await tell(P.fellOver); } catch (e2) {}
  }
}
try { await lastSpeech; } catch (e) {}
if (trayWork) { try { await trayWork; } catch (e) {} }   // let the restocking finish before he leaves
Script.complete();
