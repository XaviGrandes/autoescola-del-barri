const MAPS_URL = "https://www.google.com/maps/place/Autoescola+Del+Barri/@41.4143231,2.1791696,17z/data=!4m6!3m5!1s0x12a4bd165527acd7:0x64d1ce1599520a98!8m2!3d41.4143763!4d2.1792652!16s%2Fg%2F11cmfvb804";
const WHATSAPP = "34637944768";

// Self-check: both languages must have the same keys
console.assert(
  Object.keys(I18N.es).sort().join() === Object.keys(I18N.ca).sort().join(),
  "i18n: es y ca no tienen las mismas claves"
);

/* ---------- Idioma ---------- */
let lang;
function setLang(l) {
  lang = l;
  const t = I18N[l];
  document.documentElement.lang = l;
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t[el.dataset.i18n]; });
  document.querySelectorAll("[data-i18n-ph]").forEach(el => { el.placeholder = t[el.dataset.i18nPh]; });
  document.querySelectorAll("[data-lang]").forEach(b => b.classList.toggle("is-active", b.dataset.lang === l));
  try { localStorage.setItem("lang", l); } catch {}
}
let saved = null;
try { saved = localStorage.getItem("lang"); } catch {}
setLang(saved || (navigator.language.startsWith("ca") ? "ca" : "es"));
document.querySelectorAll("[data-lang]").forEach(b => b.addEventListener("click", () => setLang(b.dataset.lang)));

/* ---------- Enlaces a Google Maps ---------- */
document.querySelectorAll("[data-maps]").forEach(a => { a.href = MAPS_URL; });

/* ---------- Header y menú móvil ---------- */
const header = document.querySelector(".header");
addEventListener("scroll", () => header.classList.toggle("is-scrolled", scrollY > 20), { passive: true });

const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
burger.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  burger.setAttribute("aria-expanded", open);
});
nav.addEventListener("click", e => {
  if (e.target.tagName === "A") { nav.classList.remove("is-open"); burger.setAttribute("aria-expanded", false); }
});

/* ---------- Animaciones de scroll ---------- */
function countUp(el) {
  const end = +el.dataset.count, dec = +(el.dataset.decimals || 0), start = performance.now();
  const step = now => {
    const p = Math.min((now - start) / 1400, 1);
    el.textContent = (end * (1 - (1 - p) ** 3)).toLocaleString(lang, { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-visible");
    e.target.querySelectorAll("[data-count]").forEach(countUp);
    io.unobserve(e.target);
  });
}, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

/* ---------- Formulario → WhatsApp ---------- */
// shortcut: sin backend, abre WhatsApp con el mensaje; conectar Formspree o similar si quieren recibirlo por email
document.getElementById("book").addEventListener("submit", e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const msg = I18N[lang]["book.msg"]
    .replace("{name}", f.get("name").trim())
    .replace("{phone}", f.get("phone").trim())
    .replace("{permit}", f.get("permit"));
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
});
