/**
 * QR payload builders.
 *
 * Every QR "data type" is really just a text-encoding convention that scanners
 * recognise. This module owns the field schema for each type plus the pure
 * function that turns filled-in fields into the exact string that gets encoded.
 *
 * Nothing here touches the DOM or the network — payloads are built locally,
 * which is why the resulting codes are static: no redirect, no expiry, no
 * scan limit.
 */

export type FieldType =
  | "text" | "textarea" | "tel" | "email" | "url"
  | "number" | "select" | "checkbox" | "date" | "time";

export interface QrField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  /** Render at half width so two fields sit side by side. */
  half?: boolean;
  initial?: string;
}

export type FieldValues = Record<string, string>;

export interface QrTypeDef {
  id: string;
  label: string;
  group: string;
  icon: string;
  desc: string;
  fields: QrField[];
  build: (v: FieldValues) => string;
}

/* ------------------------------------------------------------------ *
 * Escaping / normalising helpers
 * ------------------------------------------------------------------ */

/** WIFI: and MEBKM: grammars escape these with a backslash. */
const escWifi = (s: string) => s.replace(/([\\;,:"])/g, "\\$1");

/** vCard 3.0 text values: escape structure characters and newlines. */
const escVcard = (s: string) =>
  s.replace(/([\\;,])/g, "\\$1").replace(/\r?\n/g, "\\n");

/** MeCard values: escape structure characters. */
const escMecard = (s: string) => s.replace(/([\\;:,])/g, "\\$1");

/** Strip formatting from a phone number, preserving a leading "+". */
function normPhone(s: string): string {
  const t = s.trim().replace(/[^\d+]/g, "");
  return t.startsWith("+") ? `+${t.slice(1).replace(/\+/g, "")}` : t;
}

/** Digits only — wa.me and similar reject "+" and separators. */
const digits = (s: string) => s.replace(/\D/g, "");

/** Add https:// when the user typed a bare domain. */
function normUrl(s: string): string {
  const t = s.trim();
  if (!t) return "";
  return /^[a-z][a-z0-9+.-]*:/i.test(t) ? t : `https://${t}`;
}

/** Join query params, dropping empty values. */
function query(params: Record<string, string | undefined>): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

/** "2026-07-22" + "09:30" -> "20260722T093000". */
function icalStamp(date: string, time: string): string {
  const d = date.replace(/-/g, "");
  if (!d) return "";
  const t = (time || "00:00").replace(/:/g, "");
  return `${d}T${t.padEnd(6, "0")}`;
}

/** iCal/vCard lines are CRLF-delimited per RFC 5545 / RFC 6350. */
const crlf = (lines: string[]) => lines.filter(Boolean).join("\r\n");

/* ------------------------------------------------------------------ *
 * Shared option lists
 * ------------------------------------------------------------------ */

const SOCIAL_BASE: Record<string, string> = {
  x:         "https://x.com/",
  instagram: "https://instagram.com/",
  facebook:  "https://facebook.com/",
  linkedin:  "https://linkedin.com/in/",
  tiktok:    "https://tiktok.com/@",
  youtube:   "https://youtube.com/@",
  github:    "https://github.com/",
  snapchat:  "https://snapchat.com/add/",
  pinterest: "https://pinterest.com/",
  reddit:    "https://reddit.com/user/",
  telegram:  "https://t.me/",
  threads:   "https://threads.net/@",
  twitch:    "https://twitch.tv/",
  discord:   "https://discord.gg/",
};

const CURRENCIES = ["EUR", "GBP", "USD", "CAD", "AUD", "INR", "JPY", "CHF"]
  .map(c => ({ value: c, label: c }));

/* ------------------------------------------------------------------ *
 * Type definitions
 * ------------------------------------------------------------------ */

export const QR_TYPES: QrTypeDef[] = [

  /* ---------------------------- Basic ---------------------------- */
  {
    id: "url",
    label: "Website / URL",
    group: "Basic",
    icon: "🌐",
    // Covers meeting links, video and app-store URLs too — a dedicated type for
    // each would encode byte-identical output, so they'd be duplicates.
    desc: "Any web link — pages, Zoom or Teams meetings, YouTube videos.",
    fields: [
      { id: "url", label: "URL", type: "url", placeholder: "filefettle.pro/tools", required: true },
    ],
    build: v => normUrl(v.url || ""),
  },
  {
    id: "text",
    label: "Plain text",
    group: "Basic",
    icon: "📝",
    desc: "Any raw text — notes, serial numbers, keys, codes.",
    fields: [
      { id: "text", label: "Text", type: "textarea", placeholder: "Anything you like…", required: true },
    ],
    build: v => v.text || "",
  },
  {
    id: "email",
    label: "Email",
    group: "Basic",
    icon: "✉️",
    desc: "Opens a pre-filled email draft (mailto).",
    fields: [
      { id: "to",      label: "To",      type: "email",    placeholder: "hello@example.com", required: true },
      { id: "subject", label: "Subject", type: "text",     placeholder: "Optional subject" },
      { id: "body",    label: "Message", type: "textarea", placeholder: "Optional message body" },
      { id: "cc",      label: "CC",      type: "email",    placeholder: "Optional", half: true },
      { id: "bcc",     label: "BCC",     type: "email",    placeholder: "Optional", half: true },
    ],
    build: v =>
      `mailto:${(v.to || "").trim()}${query({
        subject: v.subject, body: v.body, cc: v.cc, bcc: v.bcc,
      })}`,
  },
  {
    id: "phone",
    label: "Phone call",
    group: "Basic",
    icon: "📞",
    desc: "Dials a number when scanned (tel).",
    fields: [
      { id: "phone", label: "Phone number", type: "tel", placeholder: "+44 7700 900123", required: true,
        hint: "Include the country code so it works internationally." },
    ],
    build: v => `tel:${normPhone(v.phone || "")}`,
  },
  {
    id: "sms",
    label: "SMS",
    group: "Basic",
    icon: "💬",
    desc: "Opens a text message with the number and body pre-filled.",
    fields: [
      { id: "phone",   label: "Phone number", type: "tel",      placeholder: "+44 7700 900123", required: true },
      { id: "message", label: "Message",      type: "textarea", placeholder: "Optional pre-filled message" },
    ],
    build: v => {
      const n = normPhone(v.phone || "");
      const m = (v.message || "").trim();
      return m ? `SMSTO:${n}:${m}` : `SMSTO:${n}`;
    },
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    group: "Basic",
    icon: "🟢",
    desc: "Starts a WhatsApp chat with an optional pre-written message.",
    fields: [
      { id: "phone",   label: "Phone number", type: "tel",      placeholder: "+44 7700 900123", required: true,
        hint: "Country code required — WhatsApp ignores local formats." },
      { id: "message", label: "Message",      type: "textarea", placeholder: "Optional pre-filled message" },
    ],
    build: v => `https://wa.me/${digits(v.phone || "")}${query({ text: v.message })}`,
  },

  /* --------------------------- Contact --------------------------- */
  {
    id: "vcard",
    label: "Contact card (vCard)",
    group: "Contact",
    icon: "👤",
    desc: "Full contact detail saved straight to the phone's address book.",
    fields: [
      { id: "first",   label: "First name", type: "text",  placeholder: "Ada",     half: true, required: true },
      { id: "last",    label: "Last name",  type: "text",  placeholder: "Lovelace", half: true },
      { id: "org",     label: "Company",    type: "text",  placeholder: "Analytical Engines Ltd", half: true },
      { id: "title",   label: "Job title",  type: "text",  placeholder: "Lead Engineer", half: true },
      { id: "mobile",  label: "Mobile",     type: "tel",   placeholder: "+44 7700 900123", half: true },
      { id: "work",    label: "Work phone", type: "tel",   placeholder: "+44 20 7946 0000", half: true },
      { id: "email",   label: "Email",      type: "email", placeholder: "ada@example.com", half: true },
      { id: "url",     label: "Website",    type: "url",   placeholder: "example.com", half: true },
      { id: "street",  label: "Street",     type: "text",  placeholder: "12 Dean Street" },
      { id: "city",    label: "City",       type: "text",  placeholder: "London", half: true },
      { id: "region",  label: "County / State", type: "text", placeholder: "Greater London", half: true },
      { id: "zip",     label: "Postcode",   type: "text",  placeholder: "W1D 3RQ", half: true },
      { id: "country", label: "Country",    type: "text",  placeholder: "United Kingdom", half: true },
      { id: "note",    label: "Note",       type: "textarea", placeholder: "Optional note" },
    ],
    build: v => {
      const first = (v.first || "").trim();
      const last  = (v.last  || "").trim();
      const hasAddr = [v.street, v.city, v.region, v.zip, v.country].some(x => (x || "").trim());
      return crlf([
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${escVcard(last)};${escVcard(first)};;;`,
        `FN:${escVcard([first, last].filter(Boolean).join(" "))}`,
        v.org    ? `ORG:${escVcard(v.org)}`     : "",
        v.title  ? `TITLE:${escVcard(v.title)}` : "",
        v.mobile ? `TEL;TYPE=CELL:${normPhone(v.mobile)}` : "",
        v.work   ? `TEL;TYPE=WORK,VOICE:${normPhone(v.work)}` : "",
        v.email  ? `EMAIL;TYPE=INTERNET:${(v.email || "").trim()}` : "",
        v.url    ? `URL:${normUrl(v.url)}` : "",
        hasAddr
          ? `ADR;TYPE=WORK:;;${escVcard(v.street || "")};${escVcard(v.city || "")};` +
            `${escVcard(v.region || "")};${escVcard(v.zip || "")};${escVcard(v.country || "")}`
          : "",
        v.note ? `NOTE:${escVcard(v.note)}` : "",
        "END:VCARD",
      ]);
    },
  },
  {
    id: "mecard",
    label: "Contact card (MeCard)",
    group: "Contact",
    icon: "🪪",
    desc: "Compact contact format — smaller, denser QR than a vCard.",
    fields: [
      { id: "first",  label: "First name", type: "text",  placeholder: "Ada", half: true, required: true },
      { id: "last",   label: "Last name",  type: "text",  placeholder: "Lovelace", half: true },
      { id: "phone",  label: "Phone",      type: "tel",   placeholder: "+44 7700 900123", half: true },
      { id: "email",  label: "Email",      type: "email", placeholder: "ada@example.com", half: true },
      { id: "url",    label: "Website",    type: "url",   placeholder: "example.com" },
      { id: "addr",   label: "Address",    type: "text",  placeholder: "12 Dean Street, London" },
      { id: "note",   label: "Note",       type: "textarea", placeholder: "Optional note" },
    ],
    build: v => {
      const name = [v.last, v.first].map(x => escMecard((x || "").trim())).join(",").replace(/^,|,$/, "");
      return "MECARD:" + [
        name        ? `N:${name};`                       : "",
        v.phone     ? `TEL:${normPhone(v.phone)};`       : "",
        v.email     ? `EMAIL:${escMecard(v.email.trim())};` : "",
        v.url       ? `URL:${escMecard(normUrl(v.url))};`   : "",
        v.addr      ? `ADR:${escMecard(v.addr)};`        : "",
        v.note      ? `NOTE:${escMecard(v.note)};`       : "",
      ].filter(Boolean).join("") + ";";
    },
  },

  /* ------------------------ Network & access ---------------------- */
  {
    id: "wifi",
    label: "Wi-Fi network",
    group: "Network",
    icon: "📶",
    desc: "Joins a Wi-Fi network without anyone typing the password.",
    fields: [
      { id: "ssid",     label: "Network name (SSID)", type: "text", placeholder: "MyHomeNetwork", required: true },
      { id: "password", label: "Password",            type: "text", placeholder: "Network password" },
      { id: "security", label: "Security",            type: "select", initial: "WPA", half: true,
        options: [
          { value: "WPA",    label: "WPA / WPA2 / WPA3" },
          { value: "WEP",    label: "WEP (legacy)" },
          { value: "nopass", label: "Open — no password" },
        ] },
      { id: "hidden",   label: "Hidden network", type: "checkbox", half: true },
    ],
    build: v => {
      const sec = v.security || "WPA";
      return "WIFI:" +
        `T:${sec};` +
        `S:${escWifi(v.ssid || "")};` +
        (sec === "nopass" ? "" : `P:${escWifi(v.password || "")};`) +
        (v.hidden === "true" ? "H:true;" : "") +
        ";";
    },
  },
  {
    id: "bookmark",
    label: "Browser bookmark",
    group: "Network",
    icon: "🔖",
    desc: "Saves a titled bookmark rather than just opening the link.",
    fields: [
      { id: "title", label: "Bookmark title", type: "text", placeholder: "FileFettle Tools", required: true },
      { id: "url",   label: "URL",            type: "url",  placeholder: "filefettle.pro/tools", required: true },
    ],
    build: v => `MEBKM:TITLE:${escWifi(v.title || "")};URL:${escWifi(normUrl(v.url || ""))};;`,
  },

  /* --------------------- Location & calendar ---------------------- */
  {
    id: "geo",
    label: "Map location",
    group: "Location & events",
    icon: "📍",
    desc: "Drops a pin at exact coordinates in the phone's map app.",
    fields: [
      { id: "lat", label: "Latitude",  type: "text", placeholder: "51.5074", required: true, half: true },
      { id: "lng", label: "Longitude", type: "text", placeholder: "-0.1278", required: true, half: true },
      { id: "label", label: "Place name", type: "text", placeholder: "Optional label" },
    ],
    build: v => {
      const base = `geo:${(v.lat || "").trim()},${(v.lng || "").trim()}`;
      return v.label ? `${base}${query({ q: `${v.lat},${v.lng}(${v.label})` })}` : base;
    },
  },
  {
    id: "maps",
    label: "Google Maps search",
    group: "Location & events",
    icon: "🗺️",
    desc: "Opens a map search for an address or place name.",
    fields: [
      { id: "q", label: "Address or place", type: "text", placeholder: "10 Downing Street, London", required: true },
    ],
    // Google's documented universal URL keeps the slash before the query string.
    build: v => `https://www.google.com/maps/search/${query({ api: "1", query: v.q })}`,
  },
  {
    id: "event",
    label: "Calendar event",
    group: "Location & events",
    icon: "📅",
    desc: "Adds an event straight to the calendar (iCalendar).",
    fields: [
      { id: "title",    label: "Event title", type: "text", placeholder: "Product launch", required: true },
      { id: "allday",   label: "All-day event", type: "checkbox" },
      { id: "start",    label: "Start date", type: "date", required: true, half: true },
      { id: "starttime",label: "Start time", type: "time", half: true },
      { id: "end",      label: "End date",   type: "date", half: true },
      { id: "endtime",  label: "End time",   type: "time", half: true },
      { id: "location", label: "Location",   type: "text", placeholder: "Optional venue or address" },
      { id: "desc",     label: "Description", type: "textarea", placeholder: "Optional details" },
    ],
    build: v => {
      const allDay = v.allday === "true";
      const start = allDay
        ? `DTSTART;VALUE=DATE:${(v.start || "").replace(/-/g, "")}`
        : `DTSTART:${icalStamp(v.start || "", v.starttime || "")}`;
      const endDate = v.end || v.start || "";
      const end = allDay
        ? `DTEND;VALUE=DATE:${endDate.replace(/-/g, "")}`
        : `DTEND:${icalStamp(endDate, v.endtime || v.starttime || "")}`;
      return crlf([
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        `SUMMARY:${escVcard(v.title || "")}`,
        start,
        endDate ? end : "",
        v.location ? `LOCATION:${escVcard(v.location)}` : "",
        v.desc     ? `DESCRIPTION:${escVcard(v.desc)}`  : "",
        "END:VEVENT",
        "END:VCALENDAR",
      ]);
    },
  },

  /* --------------------------- Payments --------------------------- */
  {
    id: "crypto",
    label: "Crypto payment",
    group: "Payments",
    icon: "₿",
    desc: "BIP-21 payment request — address, amount and message in one code.",
    fields: [
      { id: "coin", label: "Coin", type: "select", initial: "bitcoin", half: true,
        options: [
          { value: "bitcoin",     label: "Bitcoin (BTC)" },
          { value: "ethereum",    label: "Ethereum (ETH)" },
          { value: "litecoin",    label: "Litecoin (LTC)" },
          { value: "bitcoincash", label: "Bitcoin Cash (BCH)" },
          { value: "dogecoin",    label: "Dogecoin (DOGE)" },
          { value: "monero",      label: "Monero (XMR)" },
        ] },
      { id: "amount",  label: "Amount", type: "text", placeholder: "0.005", half: true },
      { id: "address", label: "Wallet address", type: "text", placeholder: "bc1q…", required: true },
      { id: "label",   label: "Label",   type: "text", placeholder: "Optional payee name", half: true },
      { id: "message", label: "Message", type: "text", placeholder: "Optional note", half: true },
    ],
    build: v =>
      `${v.coin || "bitcoin"}:${(v.address || "").trim()}` +
      query({ amount: v.amount, label: v.label, message: v.message }),
  },
  {
    id: "epc",
    label: "SEPA bank transfer",
    group: "Payments",
    icon: "🏦",
    desc: "EPC069-12 credit transfer, scannable by most European banking apps.",
    fields: [
      { id: "name",   label: "Recipient name", type: "text", placeholder: "Acme Ltd", required: true, hint: "Maximum 70 characters." },
      { id: "iban",   label: "IBAN",           type: "text", placeholder: "DE89370400440532013000", required: true },
      { id: "bic",    label: "BIC / SWIFT",    type: "text", placeholder: "Optional", half: true },
      { id: "amount", label: "Amount (EUR)",   type: "text", placeholder: "42.50", half: true },
      { id: "ref",    label: "Reference",      type: "text", placeholder: "Invoice 1234" },
      { id: "info",   label: "Note to recipient", type: "text", placeholder: "Optional" },
    ],
    build: v => {
      // Accept "42,50" and stray currency symbols; skip the amount entirely
      // rather than emitting "EURNaN" if it still isn't a number.
      const raw = (v.amount || "").trim().replace(",", ".").replace(/[^\d.]/g, "");
      const num = Number(raw);
      const amount = raw && Number.isFinite(num) && num > 0 ? num.toFixed(2) : "";
      return [
        "BCD", "002", "1", "SCT",
        (v.bic || "").trim().toUpperCase(),
        (v.name || "").trim().slice(0, 70),
        (v.iban || "").replace(/\s/g, "").toUpperCase(),
        amount ? `EUR${amount}` : "",
        "",
        (v.ref || "").trim(),
        "",
        (v.info || "").trim(),
      ].join("\n");
    },
  },
  {
    id: "upi",
    label: "UPI payment (India)",
    group: "Payments",
    icon: "🇮🇳",
    desc: "Pays a UPI ID from GPay, PhonePe, Paytm and other UPI apps.",
    fields: [
      { id: "pa", label: "UPI ID (VPA)", type: "text", placeholder: "name@okhdfcbank", required: true },
      { id: "pn", label: "Payee name",   type: "text", placeholder: "Acme Ltd", required: true },
      { id: "am", label: "Amount (INR)", type: "text", placeholder: "Optional", half: true },
      { id: "tn", label: "Note",         type: "text", placeholder: "Optional", half: true },
    ],
    build: v => `upi://pay${query({ pa: v.pa, pn: v.pn, am: v.am, cu: "INR", tn: v.tn })}`,
  },
  {
    id: "paypal",
    label: "PayPal.Me",
    group: "Payments",
    icon: "💳",
    desc: "Opens your PayPal.Me page, optionally with the amount filled in.",
    fields: [
      { id: "user",     label: "PayPal.Me username", type: "text", placeholder: "yourname", required: true },
      { id: "amount",   label: "Amount", type: "text", placeholder: "Optional", half: true },
      { id: "currency", label: "Currency", type: "select", initial: "GBP", half: true, options: CURRENCIES },
    ],
    build: v => {
      const user = (v.user || "").trim().replace(/^.*paypal\.me\//i, "").replace(/^\/+/, "");
      const amt  = (v.amount || "").trim();
      return `https://paypal.me/${user}${amt ? `/${amt}${v.currency || "GBP"}` : ""}`;
    },
  },

  /* ------------------------- Apps & social ------------------------ */
  {
    id: "social",
    label: "Social profile",
    group: "Apps & social",
    icon: "🔗",
    desc: "Links straight to your profile on any major platform.",
    fields: [
      { id: "platform", label: "Platform", type: "select", initial: "instagram",
        options: [
          { value: "instagram", label: "Instagram" },
          { value: "x",         label: "X (Twitter)" },
          { value: "facebook",  label: "Facebook" },
          { value: "linkedin",  label: "LinkedIn" },
          { value: "tiktok",    label: "TikTok" },
          { value: "youtube",   label: "YouTube" },
          { value: "github",    label: "GitHub" },
          { value: "snapchat",  label: "Snapchat" },
          { value: "pinterest", label: "Pinterest" },
          { value: "reddit",    label: "Reddit" },
          { value: "telegram",  label: "Telegram" },
          { value: "threads",   label: "Threads" },
          { value: "twitch",    label: "Twitch" },
          { value: "discord",   label: "Discord invite" },
        ] },
      { id: "handle", label: "Username or handle", type: "text", placeholder: "yourname", required: true,
        hint: "Just the handle — no @ and no full URL." },
    ],
    build: v => {
      const base = SOCIAL_BASE[v.platform || "instagram"] ?? SOCIAL_BASE.instagram;
      return `${base}${(v.handle || "").trim().replace(/^@/, "")}`;
    },
  },
  {
    id: "app",
    label: "App download",
    group: "Apps & social",
    icon: "📱",
    desc: "Sends scanners to your listing on the App Store or Google Play.",
    fields: [
      { id: "store", label: "Store", type: "select", initial: "ios",
        options: [
          { value: "ios",     label: "Apple App Store" },
          { value: "android", label: "Google Play" },
        ] },
      { id: "id", label: "App ID", type: "text", required: true,
        placeholder: "1234567890 or com.example.app",
        hint: "Apple: the numeric id from the store URL. Google Play: the package name." },
    ],
    build: v => {
      const id = (v.id || "").trim();
      return v.store === "android"
        ? `https://play.google.com/store/apps/details?id=${encodeURIComponent(id)}`
        : `https://apps.apple.com/app/id${id.replace(/^id/, "")}`;
    },
  },
  {
    id: "skype",
    label: "Skype call",
    group: "Apps & social",
    icon: "☎️",
    desc: "Starts a Skype call or chat with a username.",
    fields: [
      { id: "user",   label: "Skype username", type: "text", placeholder: "live:.cid.abc123", required: true },
      { id: "action", label: "Action", type: "select", initial: "call",
        options: [{ value: "call", label: "Start a call" }, { value: "chat", label: "Open a chat" }] },
    ],
    build: v => `skype:${(v.user || "").trim()}?${v.action || "call"}`,
  },
  {
    id: "facetime",
    label: "FaceTime call",
    group: "Apps & social",
    icon: "🍏",
    desc: "Places a FaceTime video or audio call (Apple devices).",
    fields: [
      { id: "contact", label: "Phone number or Apple ID", type: "text", placeholder: "+44 7700 900123", required: true },
      { id: "mode",    label: "Call type", type: "select", initial: "facetime",
        options: [{ value: "facetime", label: "Video call" }, { value: "facetime-audio", label: "Audio call" }] },
    ],
    build: v => {
      const c = (v.contact || "").trim();
      return `${v.mode || "facetime"}:${c.includes("@") ? c : normPhone(c)}`;
    },
  },
];

export const QR_GROUPS: string[] = Array.from(new Set(QR_TYPES.map(t => t.group)));

export function getQrType(id: string): QrTypeDef {
  return QR_TYPES.find(t => t.id === id) ?? QR_TYPES[0];
}

/** True when every field marked `required` has a value. */
export function isComplete(def: QrTypeDef, values: FieldValues): boolean {
  return def.fields.every(f => !f.required || (values[f.id] || "").trim() !== "");
}

/** Seed a value map with each field's initial value. */
export function initialValues(def: QrTypeDef): FieldValues {
  const out: FieldValues = {};
  for (const f of def.fields) if (f.initial) out[f.id] = f.initial;
  return out;
}
