import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { Star, ChevronDown, ChevronLeft, ChevronRight, X, MapPin, Menu } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════
   DESIGN TOKENS — Palette C · Zaffiro
   ═══════════════════════════════════════════════════════ */
const T = {
  base: "#F8F5F0", baseDark: "#EDE9E2", dark: "#191A1E",
  textMid: "#5C5750", textLight: "#7A756F",
  lihele: "#1494A3", lihelePale: "#D0F0F4",
  likele: "#1E5AA8", likelePale: "#D4E4F7",
  gold: "#CFA64C", goldPale: "#F7F0E0",
  wa: "#25D366", waDark: "#1DA851",
  border: "#E2DDD6",
};

/* ═══════════════════════════════════════════════════════
   i18n CONTEXT
   ═══════════════════════════════════════════════════════ */
const LangCtx = createContext({ lang: "it", toggle: () => {} });
const useLang = () => useContext(LangCtx);
const t = (it, en, lang) => (lang === "it" ? it : en);

/* ═══════════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════════ */
function useGSAP(callback, deps = []) {
  useEffect(() => {
    const ctx = gsap.context(() => callback(gsap, ScrollTrigger));
    return () => ctx.revert();
  }, deps);
}

function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", h, { passive: true });
    h();
    return () => window.removeEventListener("scroll", h);
  }, [threshold]);
  return scrolled;
}

/* ═══════════════════════════════════════════════════════
   MAGNETIC BUTTON
   Hover: subtle scale + sliding bg overlay
   ═══════════════════════════════════════════════════════ */
function MagneticBtn({ children, className = "", href, onClick, target, rel, style = {} }) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = useCallback((e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({
      x: ((e.clientX - r.left) / r.width - 0.5) * 8,
      y: ((e.clientY - r.top) / r.height - 0.5) * 4,
    });
  }, []);

  const reset = () => { setPos({ x: 0, y: 0 }); setHovered(false); };
  const baseStyle = {
    transform: hovered ? `translate(${pos.x}px, ${pos.y}px) scale(1.03)` : "translate(0,0) scale(1)",
    transition: hovered ? "transform 0.15s ease-out" : "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
    ...style,
  };
  const slideStyle = {
    transform: hovered ? "translateY(0)" : "translateY(100%)",
    transition: "transform 0.3s ease-out",
  };

  const props = {
    ref, style: baseStyle, className: `relative overflow-hidden ${className}`,
    onMouseEnter: () => setHovered(true), onMouseMove: handleMove, onMouseLeave: reset,
  };

  const overlay = <span className="absolute inset-0 bg-white/10 pointer-events-none" style={slideStyle} />;
  if (href) return <a href={href} target={target} rel={rel} {...props}>{children}{overlay}</a>;
  return <button onClick={onClick} {...props}>{children}{overlay}</button>;
}

/* ═══════════════════════════════════════════════════════
   WHATSAPP ICON + HELPERS
   ═══════════════════════════════════════════════════════ */
const WA_PATH = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";
const WAIcon = ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d={WA_PATH} /></svg>;
const waLink = (msg) => `https://wa.me/393385037171?text=${encodeURIComponent(msg)}`;

/* ═══════════════════════════════════════════════════════
   REVEAL — GSAP scroll-triggered fade-up
   ═══════════════════════════════════════════════════════ */
function Reveal({ children, className = "", delay = 0, y = 40 }) {
  const ref = useRef(null);
  useGSAP((gsap) => {
    if (!ref.current) return;
    gsap.fromTo(ref.current,
      { y, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, delay, ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 88%", once: true } }
    );
  }, []);
  return <div ref={ref} className={className} style={{ opacity: 0 }}>{children}</div>;
}

/* ═══════════════════════════════════════════════════════
   ANIMATED SCORE — GSAP count-up from 0 to target
   ═══════════════════════════════════════════════════════ */
function AnimatedScore({ score, className = "", style = {} }) {
  const ref = useRef(null);
  useGSAP((gsap) => {
    if (!ref.current) return;
    const num = parseFloat(score);
    const decimals = score.includes(".") ? score.split(".")[1].length : 0;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: num,
      duration: 1.8,
      ease: "power3.out",
      onUpdate() { if (ref.current) ref.current.textContent = obj.val.toFixed(decimals); },
      scrollTrigger: { trigger: ref.current, start: "top 92%", once: true },
    });
  }, []);
  return <span ref={ref} className={className} style={style}>0.0</span>;
}

/* ═══════════════════════════════════════════════════════
   SECTION HEADING
   ═══════════════════════════════════════════════════════ */
function SectionHead({ label, titleIt, titleEn, subIt, subEn, light = false }) {
  const { lang } = useLang();
  return (
    <Reveal className="text-center mb-14">
      {label && (
        <>
          <p className="font-mono text-xs tracking-widest uppercase mb-3" style={{ color: light ? "rgba(248,245,240,0.4)" : T.textLight }}>{label}</p>
          <span className="block mx-auto mb-4 h-px" style={{ width: 32, background: light ? "rgba(255,255,255,0.18)" : T.border, transformOrigin: "center", animation: "lineGrow 0.7s ease-out 0.4s both" }} />
        </>
      )}
      <h2 className="font-serif text-3xl md:text-5xl font-light leading-tight" style={{ color: light ? "#fff" : T.dark }}>{t(titleIt, titleEn, lang)}</h2>
      {subIt && <p className="mt-3 text-base font-light" style={{ color: light ? "rgba(248,245,240,0.55)" : T.textMid }}>{t(subIt, subEn, lang)}</p>}
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════════ */
function Navbar() {
  const scrolled = useScrolled();
  const { lang, toggle } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { id: "strutture", it: "Le Strutture", en: "Properties" },
    { id: "awards", it: "Awards", en: "Awards" },
    { id: "gallery", it: "Galleria", en: "Gallery" },
    { id: "location", it: "Dove Siamo", en: "Location" },
    { id: "faq", it: "FAQ", en: "FAQ" },
    { id: "contatti", it: "Contatti", en: "Contact" },
  ];

  return (
    <>
      {/* Dark gradient behind navbar when at top of page */}
      <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none transition-opacity duration-500"
        style={{ height: 120, background: "linear-gradient(to bottom, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)", opacity: scrolled ? 0 : 1 }} />

      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center px-6 transition-all duration-500"
        style={{
          height: 68,
          background: scrolled ? "rgba(248,245,240,0.97)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          boxShadow: scrolled ? `0 1px 0 ${T.border}` : "none",
        }}>
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between gap-6">
          <a href="#hero" className="flex-shrink-0 transition-all duration-300" style={{ height: 32 }}>
            <img src={scrolled ? "/assets/Lihele.svg" : "/assets/Lihele-wh.svg"} alt="Lihele · Likele" className="h-full w-auto transition-all duration-300" />
          </a>
          <ul className="hidden lg:flex gap-7 list-none">
            {links.map(l => (
              <li key={l.id}>
                <a href={`#${l.id}`}
                  className="text-sm font-medium tracking-wide transition-all duration-200 hover:opacity-100"
                  style={{ color: scrolled ? T.textMid : "rgba(248,245,240,0.75)" }}
                  onMouseEnter={(e) => { e.target.style.color = scrolled ? T.lihele : "#fff"; }}
                  onMouseLeave={(e) => { e.target.style.color = scrolled ? T.textMid : "rgba(248,245,240,0.75)"; }}>
                  {t(l.it, l.en, lang)}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button onClick={toggle} className="font-mono text-xs tracking-widest px-2 py-1 transition-colors duration-200 hover:opacity-100"
              style={{ color: scrolled ? T.textLight : "rgba(248,245,240,0.6)" }}>
              <span style={{ fontWeight: lang === "it" ? 600 : 400, color: lang === "it" ? (scrolled ? T.dark : "#fff") : undefined }}>IT</span>
              <span className="mx-1">|</span>
              <span style={{ fontWeight: lang === "en" ? 600 : 400, color: lang === "en" ? (scrolled ? T.dark : "#fff") : undefined }}>EN</span>
            </button>
            <MagneticBtn href={waLink("Ciao! Ho visto il vostro sito e vorrei informazioni.")} target="_blank" rel="noopener"
              className="hidden md:inline-flex items-center gap-2 text-white text-sm font-medium px-4 py-2.5 rounded-full"
              style={{ background: T.wa }}>
              <WAIcon size={15} /><span className="relative z-10">{t("Scrivici", "WhatsApp", lang)}</span>
            </MagneticBtn>
            <button className="lg:hidden flex flex-col gap-1.5 p-1" onClick={() => setMobileOpen(v => !v)} aria-label="Menu" aria-expanded={mobileOpen}>
              {[0,1,2].map(i => <span key={i} className="block w-5 h-0.5 rounded transition-all duration-300"
                style={{ background: scrolled ? T.dark : "#fff",
                  transform: mobileOpen ? (i===0 ? "rotate(45deg) translateY(6px)" : i===2 ? "rotate(-45deg) translateY(-6px)" : "scaleX(0)") : "none" }} />)}
            </button>
          </div>
        </div>
      </nav>
      {/* Mobile drawer */}
      <div className="fixed left-0 right-0 z-40 px-6 py-6 flex flex-col lg:hidden transition-all duration-400"
        style={{ top: 68, background: T.base, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", borderTop: `1px solid ${T.border}`,
          transform: mobileOpen ? "translateY(0)" : "translateY(-120%)", opacity: mobileOpen ? 1 : 0, pointerEvents: mobileOpen ? "auto" : "none" }}>
        {links.map(l => (
          <a key={l.id} href={`#${l.id}`} onClick={() => setMobileOpen(false)}
            className="block py-3.5 text-base font-medium border-b" style={{ color: T.dark, borderColor: T.border }}>
            {t(l.it, l.en, lang)}
          </a>
        ))}
        <MagneticBtn href={waLink("Ciao!")} target="_blank" rel="noopener"
          className="flex items-center justify-center gap-2 text-white text-base font-medium py-3.5 rounded-xl mt-5"
          style={{ background: T.wa }}>
          <WAIcon size={18} /><span className="relative z-10">{t("Scrivici su WhatsApp", "Message us on WhatsApp", lang)}</span>
        </MagneticBtn>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════ */
function Hero() {
  const { lang } = useLang();
  const heroRef = useRef(null);

  useGSAP((gsap) => {
    const el = heroRef.current;
    if (!el) return;
    const tl = gsap.timeline({ delay: 0.3 });
    tl.fromTo(el.querySelector(".hero-tag"), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" })
      .fromTo(el.querySelector(".hero-headline"), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" }, "-=0.4")
      .fromTo(el.querySelector(".hero-sub"), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, "-=0.5")
      .fromTo(el.querySelector(".hero-ctas"), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, "-=0.4");
    // Parallax overlay
    gsap.to(el.querySelector(".hero-overlay"), {
      yPercent: 30, ease: "none",
      scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true }
    });
  }, []);

  return (
    <section id="hero" ref={heroRef} className="relative flex items-end overflow-hidden" style={{ minHeight: "100svh" }}>
      <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #1494A3 0%, #0e6872 35%, #162838 65%, #0d1218 100%)" }} />
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" src="public/assets/hero-reduced2.mp4" />
      <div className="hero-overlay absolute inset-0" style={{ zIndex: 1, background: "linear-gradient(to top, rgba(25,26,30,0.88) 0%, rgba(25,26,30,0) 70%)" }} />
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-16 md:pb-20">
        <div className="hero-tag flex items-center gap-2.5 mb-5 opacity-0">
          <span className="block w-7 h-px" style={{ background: T.gold }} />
          <span className="font-mono text-xs tracking-[0.16em] uppercase" style={{ color: "rgba(207,166,76,0.9)" }}>Castelsardo, {t("Sardegna", "Sardinia", lang)}</span>
        </div>
        <h1 className="hero-headline font-serif text-5xl md:text-7xl lg:text-8xl font-light leading-none text-white mb-5 max-w-3xl opacity-0">
          {t(
            <>
              Castelsardo dall'alto,<br />
              <em className="italic">il mare sotto.</em>
            </>,
            <>
              Castelsardo from above,<br />
              <em className="italic">the sea below.</em>
            </>,
            lang
          )}
        </h1>
        <p className="hero-sub text-base md:text-lg font-light max-w-lg leading-relaxed opacity-0" style={{ color: "rgba(255,255,255,0.7)" }}>
          {t("Un appartamento intero o una camera privata — due strutture con vista mare, stesso stabile, esperienze diverse.",
            "Entire apartment or private room — two spaces with sea views, same building, different experiences.", lang)}
        </p>
        <div className="hero-ctas flex flex-wrap gap-3.5 items-center mt-10 opacity-0">
          <MagneticBtn href={waLink("Ciao! Ho visto il vostro sito e vorrei informazioni.")} target="_blank" rel="noopener"
            className="inline-flex items-center gap-2.5 text-white text-base font-medium px-7 py-4 rounded-full" style={{ background: T.wa }}>
            <WAIcon size={18} /><span className="relative z-10">{t("Scrivici su WhatsApp", "Message us on WhatsApp", lang)}</span>
          </MagneticBtn>
          <a href="#strutture" className="inline-flex items-center gap-2 text-base font-light py-3.5 px-1 border-b transition-all hover:text-white hover:border-white/70"
            style={{ color: "rgba(255,255,255,0.7)", borderColor: "rgba(255,255,255,0.3)" }}>
            {t("Scopri le strutture", "Explore properties", lang)}
            <span style={{ animation: "subtleBounce 1.6s ease-in-out infinite" }}><ChevronDown size={16} /></span>
          </a>
        </div>
      </div>
      <div className="absolute bottom-7 right-7 z-10 hidden md:flex flex-col items-center gap-1.5">
        <div className="w-px h-10" style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.4))", animation: "scrollPulse 2s ease-in-out infinite" }} />
        <span className="font-mono text-[0.6rem] tracking-[0.14em]" style={{ color: "rgba(255,255,255,0.35)", writingMode: "vertical-rl" }}>scroll</span>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   AWARDS BAR
   ═══════════════════════════════════════════════════════ */
function Awards() {
  const { lang } = useLang();
  const ref = useRef(null);
  useGSAP((gsap) => {
    if (!ref.current) return;
    gsap.fromTo(ref.current.querySelectorAll(".award-item"),
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.12, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 85%", once: true } });
  }, []);

  const AwardCard = ({ score, name, typeIt, typeEn, reviews, href }) => (
    <a href={href} target="_blank" rel="noopener" className="award-item flex items-center gap-4 px-7 py-5 rounded-xl transition-all duration-200 hover:bg-white/5 hover:scale-105" style={{ transition: "transform 0.25s cubic-bezier(0.22,1,0.36,1), background 0.2s" }}>
      <AnimatedScore score={score} className="font-mono text-4xl font-medium leading-none" style={{ color: T.gold }} />
      <div className="flex flex-col gap-0.5">
        <span className="font-serif text-lg text-white tracking-wide">{name}</span>
        <span className="font-mono text-[0.6rem] tracking-[0.1em] uppercase" style={{ color: "rgba(248,245,240,0.4)" }}>{t(typeIt, typeEn, lang)}</span>
        <div className="flex gap-0.5 mt-1">{[...Array(5)].map((_, i) => <Star key={i} size={11} fill={T.gold} color={T.gold} />)}</div>
        <span className="font-mono text-[0.58rem] tracking-wide mt-0.5" style={{ color: "rgba(248,245,240,0.3)" }}>{reviews} {t("recensioni verificate", "verified reviews", lang)}</span>
      </div>
    </a>
  );

  return (
    <section id="awards" ref={ref} className="py-10" style={{ background: T.dark, borderBottom: `3px solid ${T.gold}` }}>
      <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 md:gap-12">
        <div className="award-item flex flex-col items-center gap-1 text-center">
          <span className="font-mono text-[0.62rem] tracking-[0.14em] uppercase" style={{ color: "rgba(248,245,240,0.45)" }}>Booking.com</span>
          <span className="font-mono text-[0.62rem] tracking-[0.1em] uppercase" style={{ color: "rgba(248,245,240,0.45)" }}>Traveller Review Awards 2026</span>
        </div>
        <div className="hidden md:block w-px h-12" style={{ background: "rgba(248,245,240,0.12)" }} />
        <AwardCard score="9.8" name="Lihele" typeIt="Casa Vacanze" typeEn="Holiday Apartment" reviews="53" href="https://www.booking.com/hotel/it/casa-vacanza-lihele-locazione-turistica-castelsardo.it.html" />
        <div className="hidden md:block w-px h-12" style={{ background: "rgba(248,245,240,0.12)" }} />
        <AwardCard score="9.7" name="Likele" typeIt="Affittacamere" typeEn="Guest Room" reviews="66" href="https://www.booking.com/hotel/it/affittacamere-likele.it.html" />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   PROPERTY CARDS
   ═══════════════════════════════════════════════════════ */
function Properties() {
  const { lang } = useLang();
  const Card = ({ name, color, pale, typeIt, typeEn, pitchIt, pitchEn, facts, score, waMsg, detailId, imgGrad }) => (
    <Reveal className="group rounded-xl overflow-hidden border bg-white flex flex-col transition-all duration-400 hover:-translate-y-1 hover:shadow-2xl" style={{ borderColor: T.border, borderTop: `3px solid ${color}` }}>
      <div className="aspect-[4/3] relative overflow-hidden" style={{ background: imgGrad }}>
        <span className="absolute inset-0 flex items-center justify-center font-mono text-xs tracking-[0.12em] uppercase text-white/40">{name}<br/>Photo</span>
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: "rgba(15,20,18,0.8)", backdropFilter: "blur(8px)", border: `1px solid rgba(207,166,76,0.35)` }}>
          <Star size={12} fill={T.gold} color={T.gold} /><span className="font-serif text-sm" style={{ color: T.gold }}>{score}</span>
        </div>
      </div>
      <div className="p-7 flex flex-col gap-4 flex-1">
        <span className="font-mono text-[0.6rem] tracking-[0.12em] uppercase px-2.5 py-1 rounded-full self-start" style={{ background: pale, color }}>{t(typeIt, typeEn, lang)}</span>
        <span className="font-serif text-3xl font-light" style={{ color }}>{name}</span>
        <p className="text-sm font-light italic" style={{ color: T.textMid }}>{t(pitchIt, pitchEn, lang)}</p>
        <div className="flex flex-wrap gap-2">{facts.map((f, i) => <span key={i} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border" style={{ color: T.textMid, borderColor: T.border, background: T.base }}>{f}</span>)}</div>
        <div className="flex flex-col gap-2 mt-auto pt-2">
          <MagneticBtn href={waLink(waMsg)} target="_blank" rel="noopener" className="flex items-center justify-center gap-2 text-white text-sm font-medium py-3.5 rounded-full" style={{ background: color }}>
            <WAIcon size={15} /><span className="relative z-10">{t(`Contattaci per ${name}`, `Enquire about ${name}`, lang)}</span>
          </MagneticBtn>
          <a href={`#${detailId}`} className="text-xs text-center py-2 transition-colors" style={{ color: T.textLight }}>{t("↓ Scopri di più", "↓ Learn more", lang)}</a>
        </div>
      </div>
    </Reveal>
  );

  return (
    <section id="strutture" className="py-24 px-6" style={{ background: T.base }}>
      <div className="max-w-5xl mx-auto">
        <SectionHead label={`Castelsardo, ${t("Sardegna", "Sardinia", lang)}`} titleIt="Due strutture, un'unica anima" titleEn="Two spaces, one soul" subIt="Stesso stabile, stessa vista — scegli la tua." subEn="Same building, same view — choose yours." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card name="Lihele" color={T.lihele} pale={T.lihelePale} score="9.8" typeIt="Casa Vacanze Intera" typeEn="Entire Apartment" pitchIt="Luce, spazio e mare — tutta per voi." pitchEn="Light, space and sea — all yours." facts={[`👥 ${t("Fino a 5 ospiti","Up to 5 guests",lang)}`,`🛏 ${t("3 camere","3 bedrooms",lang)}`,`🌊 ${t("Vista mare","Sea view",lang)}`,`🍳 ${t("Cucina","Kitchen",lang)}`]} waMsg="Ciao! Vorrei informazioni su Lihele." detailId="lihele" imgGrad="linear-gradient(135deg, #1494A3, #0c6d78)" />
          <Card name="Likele" color={T.likele} pale={T.likelePale} score="9.7" typeIt="Camera Privata" typeEn="Private Room" pitchIt="Intima, accogliente, affacciata sul mare." pitchEn="Intimate, welcoming, facing the sea." facts={[`👥 1–2 ${t("ospiti","guests",lang)}`,`🛁 ${t("Bagno privato","Private bath",lang)}`,`🌅 ${t("Terrazza mare","Sea terrace",lang)}`,`☕ ${t("Colazione","Breakfast",lang)}`]} waMsg="Ciao! Vorrei informazioni su Likele." detailId="likele" imgGrad="linear-gradient(135deg, #1E5AA8, #164280)" />
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   GALLERY CAROUSEL (Likele detail)
   ═══════════════════════════════════════════════════════ */
function GalleryCarousel({ images, imgGrad }) {
  const scrollRef = useRef(null);
  const [active, setActive] = useState(0);
  const drag = useRef({ on: false, startX: 0, startScroll: 0 });
  const n = images.length;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function onScroll() {
      const w = el.offsetWidth;
      if (!w) return;
      setActive(Math.max(0, Math.min(Math.round(el.scrollLeft / w), n - 1)));
    }
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [n]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const d = drag.current;
    function onDown(e) {
      if (e.pointerType !== 'mouse') return;
      d.on = true; d.startX = e.clientX; d.startScroll = el.scrollLeft;
      el.style.scrollBehavior = 'auto';
      el.setPointerCapture(e.pointerId);
    }
    function onMove(e) {
      if (!d.on) return;
      el.scrollLeft = d.startScroll - (e.clientX - d.startX);
    }
    function onUp() {
      if (!d.on) return;
      d.on = false; el.style.scrollBehavior = '';
      const w = el.offsetWidth;
      el.scrollTo({ left: Math.round(el.scrollLeft / w) * w, behavior: 'smooth' });
    }
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
    };
  }, []);

  function goTo(i) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.offsetWidth, behavior: 'smooth' });
  }

  return (
    <>
      <div
        ref={scrollRef}
        className="scrollbar-hide absolute inset-0 overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing"
        style={{ display: 'flex', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {images.map((img, i) => (
          <div key={i} style={{ minWidth: '100%', flexShrink: 0, scrollSnapAlign: 'start', scrollSnapStop: 'always', background: imgGrad }}>
            {img.imgSrc
              ? <img src={img.imgSrc} alt={img.alt || ''} draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none', userSelect: 'none' }} />
              : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', textAlign: 'center' }}>{img.alt}</span>}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top right, rgba(0,0,0,0.78) 0%, transparent 55%)', zIndex: 1 }} />
      {n > 1 && (
        <div className="absolute left-0 right-0 flex justify-center gap-2" style={{ bottom: 18, zIndex: 2 }}>
          {images.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} aria-label={`Foto ${i + 1}`} className="rounded-full border-0 p-0 transition-all duration-200" style={{ width: 6, height: 6, background: active === i ? '#fff' : 'rgba(255,255,255,0.45)', transform: active === i ? 'scale(1.35)' : 'scale(1)', cursor: 'pointer' }} />
          ))}
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   DETAIL SECTION
   ═══════════════════════════════════════════════════════ */
function DetailSection({ id, name, color, pale, score, typeIt, typeEn, descIt, descEn, note, facts, reverse, imgGrad, imgSrc, gallery, waMsg, bookingUrl, logoSrc }) {
  const { lang } = useLang();
  const factsRef = useRef(null);
  useGSAP((gsap) => {
    if (!factsRef.current) return;
    gsap.fromTo(
      Array.from(factsRef.current.children),
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.07, duration: 0.45, ease: "power2.out",
        scrollTrigger: { trigger: factsRef.current, start: "top 82%", once: true } }
    );
  }, []);
  return (
    <section id={id} className="py-24 px-6" style={{ background: pale }}>
      <div className="max-w-5xl mx-auto">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
          <Reveal className="relative">
            <div className="aspect-[4/5] rounded-xl overflow-hidden relative" style={{ background: imgGrad }}>
              {gallery ? <GalleryCarousel images={gallery} imgGrad={imgGrad} /> :
                imgSrc ? <img src={imgSrc} alt={`${name} — Castelsardo`} className="w-full h-full object-cover" /> :
                <span className="absolute inset-0 flex items-center justify-center font-mono text-xs tracking-[0.12em] text-white/30 uppercase text-center">{name}<br/>Main Photo</span>}
            </div>
            <div className="absolute -bottom-4 right-5 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-xl" style={{ background: T.dark, color: T.gold }}>
              <Star size={14} fill={T.gold} color={T.gold} /><span className="font-serif text-xl">{score}</span>
              <div className="ml-1"><div className="font-mono text-[0.5rem] tracking-wide uppercase" style={{ color: "rgba(248,245,240,0.4)" }}>Booking.com</div><div className="font-mono text-[0.5rem] tracking-wide uppercase" style={{ color: "rgba(248,245,240,0.4)" }}>Award 2026</div></div>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="flex items-center gap-2 mb-5"><span className="w-6 h-px" style={{ background: color }} /><span className="font-mono text-xs tracking-[0.14em] uppercase" style={{ color }}>{t(typeIt, typeEn, lang)}</span></div>
            {logoSrc ? <img src={logoSrc} alt={name} className="mb-3" style={{ height: "2.6rem", width: "auto" }} /> : <h2 className="font-serif text-4xl md:text-5xl font-light mb-2" style={{ color }}>{name}</h2>}
            <p className="text-base font-light leading-relaxed my-5" style={{ color: T.textMid }}>{t(descIt, descEn, lang)}</p>
            {note && <div className="rounded-r-lg p-3.5 mb-6 text-sm leading-relaxed" style={{ background: T.goldPale, borderLeft: `3px solid ${T.gold}`, color: T.textMid }}><strong style={{ color: T.dark }}>{t(note.labelIt, note.labelEn, lang)}</strong> {t(note.textIt, note.textEn, lang)}</div>}
            <div ref={factsRef} className="grid grid-cols-2 gap-2 mb-8">
              {facts.map((f, i) => <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm" style={{ background: "rgba(255,255,255,0.5)", borderColor: `${color}15` }}><span className="text-base flex-shrink-0 mt-0.5">{f.icon}</span><div><span className="font-mono text-[0.6rem] tracking-wide uppercase block font-medium" style={{ color: T.dark }}>{t(f.labelIt, f.labelEn, lang)}</span><span className="text-xs" style={{ color: T.textMid }}>{t(f.valIt, f.valEn, lang)}</span></div></div>)}
            </div>
            <div className="flex flex-col gap-2.5">
              <MagneticBtn href={waLink(waMsg)} target="_blank" rel="noopener" className="flex items-center justify-center gap-2.5 text-white text-base font-medium py-4 rounded-full" style={{ background: T.wa }}>
                <WAIcon size={20} /><span className="relative z-10">{t("Contattaci su WhatsApp","Message us on WhatsApp",lang)}</span>
              </MagneticBtn>
              <a href={bookingUrl} target="_blank" rel="noopener" className="text-sm text-center py-1.5 transition-colors hover:text-blue-700" style={{ color: T.textLight }}>{t("Oppure prenota su Booking.com →","Or book on Booking.com →",lang)}</a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   GALLERY
   ═══════════════════════════════════════════════════════ */
function Gallery() {
  const { lang } = useLang();
  const [lb, setLb] = useState(null);
  const items = [
    { label: "Lihele — Insegna",             grad: "linear-gradient(160deg,#1494A3,#0c6d78)", tall:  true, imgSrc: "/assets/images/lihele-website/dettagli/insegna.jpg" },
    { label: "Likele — Camera",               grad: "linear-gradient(160deg,#1E5AA8,#164280)",         imgSrc: "/assets/images/likele-website/letto.jpg" },
    { label: "Lihele — Soggiorno",            grad: "linear-gradient(160deg,#1494A3,#0c6d78)", short: true, imgSrc: "/assets/images/lihele-website/selezione/entrata.jpg" },
    { label: "Lihele — Camera Matrimoniale",  grad: "linear-gradient(160deg,#1494A3,#0E7A87)",         imgSrc: "/assets/images/lihele-website/selezione/stanza-doppia.jpg" },
    { label: "Likele — Terrazza",             grad: "linear-gradient(160deg,#2B6DB5,#1a4a80)", tall:  true, imgSrc: "/assets/images/likele-website/entrata2.jpg" },
    { label: "Lihele — Ingresso",             grad: "linear-gradient(160deg,#1aabbf,#0e7a88)",         imgSrc: "/assets/images/lihele-website/selezione/entrata2.jpg" },
    { label: "Lihele — Tavolo",               grad: "linear-gradient(160deg,#1aabbf,#0e7a88)", short: true, imgSrc: "/assets/images/lihele-website/dettagli/tavolo.jpg" },
    { label: "Lihele — Camera con Vista",     grad: "linear-gradient(160deg,#10808e,#084a55)", tall:  true, imgSrc: "/assets/images/lihele-website/selezione/stanza-singola-vista.jpg" },
    { label: "Likele — Bagno",                grad: "linear-gradient(160deg,#2468A0,#1a4a78)",         imgSrc: "/assets/images/likele-website/bagno.jpg" },
    { label: "Lihele — Letto",                grad: "linear-gradient(160deg,#1494A3,#0E7A87)",         imgSrc: "/assets/images/lihele-website/dettagli/letto.jpg" },
    { label: "Lihele — Doccia",               grad: "linear-gradient(160deg,#1aabbf,#0e7a88)", short: true, imgSrc: "/assets/images/lihele-website/selezione/doccia.jpg" },
    { label: "Lihele — Camera Twin",          grad: "linear-gradient(160deg,#1494A3,#0c6d78)",         imgSrc: "/assets/images/lihele-website/selezione/stanza-twin.jpg" },
    { label: "Likele — Colazione",            grad: "linear-gradient(160deg,#2a7a8a,#1a5a66)",         imgSrc: "/assets/images/likele-website/colazione.jpg" },
    { label: "Lihele — Parete",               grad: "linear-gradient(160deg,#10808e,#084a55)", short: true, imgSrc: "/assets/images/lihele-website/dettagli/parete.jpg" },
    { label: "Lihele — Area Comune",          grad: "linear-gradient(160deg,#1494A3,#0E7A87)", tall:  true, imgSrc: "/assets/images/lihele-website/selezione/entrata3.jpg" },
    { label: "Likele — Dettaglio",            grad: "linear-gradient(160deg,#2468A0,#1a4a78)", short: true, imgSrc: "/assets/images/likele-website/dettaglio.jpg" },
    { label: "Lihele — Camera Singola",       grad: "linear-gradient(160deg,#1494A3,#0c6d78)",         imgSrc: "/assets/images/lihele-website/selezione/stanza-singola.jpg" },
    { label: "Lihele — Bagno",                grad: "linear-gradient(160deg,#1aabbf,#0e7a88)",         imgSrc: "/assets/images/lihele-website/selezione/bagno.jpg" },
    { label: "Likele — Ingresso",             grad: "linear-gradient(160deg,#1E5AA8,#164280)", tall:  true, imgSrc: "/assets/images/likele-website/entrata.jpg" },
    { label: "Lihele — Comodin",              grad: "linear-gradient(160deg,#1494A3,#0c6d78)", short: true, imgSrc: "/assets/images/lihele-website/dettagli/comodin.jpg" },
    { label: "Lihele — Camera Matrimoniale 2",grad: "linear-gradient(160deg,#1494A3,#0E7A87)",         imgSrc: "/assets/images/lihele-website/selezione/stanza-doppia2.jpg" },
    { label: "Lihele — Bancone",              grad: "linear-gradient(160deg,#10808e,#084a55)", short: true, imgSrc: "/assets/images/lihele-website/dettagli/tavolo-alto.jpg" },
    { label: "Likele — Tavolo Colazione",     grad: "linear-gradient(160deg,#2a7a8a,#1a5a66)",         imgSrc: "/assets/images/likele-website/tavolo.jpg" },
    { label: "Lihele — Insegna Esterna",      grad: "linear-gradient(160deg,#1aabbf,#0e7a88)", short: true, imgSrc: "/assets/images/lihele-website/dettagli/insegnafull.jpg" },
    { label: "Lihele — Camera Twin 2",        grad: "linear-gradient(160deg,#1494A3,#0c6d78)",         imgSrc: "/assets/images/lihele-website/selezione/stanza-twin2.jpg" },
    { label: "Lihele — Ancora",               grad: "linear-gradient(160deg,#10808e,#084a55)", short: true, imgSrc: "/assets/images/lihele-website/dettagli/ancora.jpg" },
    { label: "Lihele — Terrazza",             grad: "linear-gradient(160deg,#1494A3,#0E7A87)",         imgSrc: "/assets/images/lihele-website/selezione/entrata4.jpg" },
    { label: "Lihele — Camera Singola 2",     grad: "linear-gradient(160deg,#1aabbf,#0e7a88)", tall:  true, imgSrc: "/assets/images/lihele-website/selezione/stanza-singola2.jpg" },
    { label: "Lihele — Asciugamani",          grad: "linear-gradient(160deg,#1494A3,#0c6d78)", short: true, imgSrc: "/assets/images/lihele-website/dettagli/asciugamani.jpg" },
    { label: "Lihele — Camera Matrimoniale 3",grad: "linear-gradient(160deg,#1494A3,#0E7A87)",         imgSrc: "/assets/images/lihele-website/selezione/stanza-doppia3.jpg" },
    { label: "Lihele — Insegna",              grad: "linear-gradient(160deg,#10808e,#084a55)", short: true, imgSrc: "/assets/images/lihele-website/selezione/insegna.jpg" },
    { label: "Lihele — Tavolo 2",             grad: "linear-gradient(160deg,#1aabbf,#0e7a88)", short: true, imgSrc: "/assets/images/lihele-website/dettagli/tavolo2.jpg" },
    { label: "Lihele — Vista Mare",           grad: "linear-gradient(160deg,#1494A3,#0c6d78)",         imgSrc: "/assets/images/lihele2.jpeg" },
  ];

  useEffect(() => {
    if (lb === null) return;
    const handler = (e) => { if (e.key === "Escape") setLb(null); if (e.key === "ArrowRight") setLb(i => (i + 1) % items.length); if (e.key === "ArrowLeft") setLb(i => (i - 1 + items.length) % items.length); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [lb]);

  return (
    <section id="gallery" className="py-24 px-6" style={{ background: T.base }}>
      <div className="max-w-5xl mx-auto">
        <SectionHead label={t("Galleria","Gallery",lang)} titleIt="Lihele · Likele · Castelsardo" titleEn="Lihele · Likele · Castelsardo" />
        <div className="columns-2 md:columns-3 gap-4">
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 0.05} className="mb-4 break-inside-avoid cursor-pointer group">
              <div className={`rounded-xl overflow-hidden relative ${item.tall ? "aspect-[3/5]" : item.short ? "aspect-[4/3]" : "aspect-[3/4]"}`}
                style={{ background: item.grad }} onClick={() => setLb(i)} role="button" tabIndex={0} aria-label={item.label} onKeyDown={(e) => e.key === "Enter" && setLb(i)}>
                {item.imgSrc && <img src={item.imgSrc} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" style={{ filter: "brightness(0.85)" }} />}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-end p-4">
                  <span className="font-mono text-xs tracking-[0.1em] uppercase text-white/0 group-hover:text-white/80 transition-all duration-500 translate-y-2 group-hover:translate-y-0">{item.label}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="text-center mt-12">
          <p className="italic text-sm mb-4" style={{ color: T.textMid }}>{t("Quello che vedi ti convince? Scrivici.","Like what you see? Get in touch.",lang)}</p>
          <MagneticBtn href={waLink("Ciao! Ho visto le foto e vorrei informazioni.")} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-white text-sm font-medium px-6 py-3 rounded-full" style={{ background: T.wa }}>
            <WAIcon size={16} /><span className="relative z-10">{t("Scrivici su WhatsApp","Message us on WhatsApp",lang)}</span>
          </MagneticBtn>
        </Reveal>
      </div>
      {lb !== null && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center" style={{ background: "rgba(10,12,14,0.92)", backdropFilter: "blur(16px)", animation: "lbFadeIn 0.2s ease-out" }} onClick={() => setLb(null)}>
          <button className="absolute top-5 right-5 w-11 h-11 rounded-full flex items-center justify-center text-white bg-white/10 hover:bg-white/20 transition-all duration-200 hover:rotate-90 z-10" onClick={() => setLb(null)}><X size={20} /></button>
          <button className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-110" onClick={(e) => { e.stopPropagation(); setLb((lb - 1 + items.length) % items.length); }}><ChevronLeft size={24} /></button>
          <div className="flex flex-col items-center gap-4 max-w-[90vw]" style={{ animation: "lbContentIn 0.3s cubic-bezier(0.22,1,0.36,1)" }} onClick={(e) => e.stopPropagation()}>
            <div className="w-[70vw] max-w-[600px] aspect-[3/4] rounded-xl overflow-hidden" style={{ background: items[lb].grad }}>{items[lb].imgSrc && <img src={items[lb].imgSrc} alt={items[lb].label} className="w-full h-full object-cover" />}</div>
            <span className="font-mono text-xs tracking-[0.12em] uppercase text-white/60">{items[lb].label}</span>
          </div>
          <button className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-110" onClick={(e) => { e.stopPropagation(); setLb((lb + 1) % items.length); }}><ChevronRight size={24} /></button>
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   REVIEWS CAROUSEL
   ═══════════════════════════════════════════════════════ */
function Reviews() {
  const { lang } = useLang();
  const scrollRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const reviews = [
    { quoteIt: "Luciano è un host straordinario. Casa sarda bellissima, comodissima su due livelli, fornita di tutto. Siamo andati via da pochi giorni e già sentiamo la nostalgia.", quoteEn: "Luciano is an extraordinary host. Beautiful, comfortable Sardinian house on two levels, equipped with everything. We left just days ago and already feel nostalgic.", author: "Margherita I. 🇮🇹", prop: "lihele", source: "via Google", href: "https://share.google/PHwmJrSrwGIiTIjRR" },
    { quoteIt: "Castelsardo è un luogo incantevole e questa casa, molto comoda e super accessoriata, permette di vivere pienamente il posto e il mare vicinissimo. Gli ambienti, ampi, pulitissimi e ben arredati, ti fanno sentire a casa. Un valore aggiunto è dato dall'ospitalità garbata e disponibile di Luciano, un super host.", quoteEn: "Castelsardo is enchanting and this super comfortable, well-equipped house lets you fully experience the place and the sea nearby. The spacious, spotless and well-furnished rooms make you feel at home. Luciano's gracious hospitality is a wonderful added value.", author: "Mara L. 🇮🇹", prop: "lihele", source: "via Booking.com", href: "https://share.google/qmX1OqVisJENs9UJI" },
    { quoteIt: "La camera è esattamente come si vede nella foto: nuova, pulita, decorata con gusto e nei dettagli. Così pure il bagno. Luciano è una persona gentilissima e disponibile. La casa è in una zona molto tranquilla. Se dovessi tornare a Castelsardo non esiterei a tornare qui! Assolutamente consigliatissimo!", quoteEn: "The room is exactly as pictured: new, clean, tastefully decorated down to every detail. Same for the bathroom. Luciano is very kind and helpful. The house is in a very quiet area. If I return to Castelsardo, I'd come straight back here! Absolutely recommended!", author: "Marina 🇩🇪", prop: "likele", source: "via Booking.com", href: "https://www.booking.com/hotel/it/affittacamere-likele.it.html" },
    { quoteIt: "Camera bellissima, moderna, pulita e comoda! Terrazzino dove poter stendere i costumi a fine giornata. Posizione perfetta, non distante dal centro e la spiaggia ma silenziosa e tranquilla. Proprietario molto gentile e disponibile.", quoteEn: "Beautiful, modern, clean and comfortable room! Small terrace to hang swimsuits at the end of the day. Perfect location, not far from the centre and beach but quiet and peaceful. Very kind and helpful host.", author: "Sofia 🇮🇹", prop: "likele", source: "via Booking.com" },
    { quoteIt: "Tutto perfetto in questo posto, camera molto pulita e ben attrezzata. Ottima posizione in città. L'host è stato davvero disponibile. Torneremmo sicuramente.", quoteEn: "Everything was perfect in this place, very clean and well equipped room. Great location in the city. Host was really helpful. We would definitely come back again.", author: "Ondřej 🇨🇿", prop: "likele", source: "via Booking.com" },
    { quoteIt: "Struttura molto accogliente, dotata di tutti i comfort. Cucina attrezzata con tutto il necessario, aria condizionata in tutte le stanze, bagno spazioso. Tutti i balconi e le finestre sono vista mare. Il proprietario è una persona fantastica, accogliente, disponibile e attenta a ogni dettaglio.", quoteEn: "Very welcoming property with all comforts. Fully equipped kitchen, A/C in every room, spacious bathroom. All balconies and windows with sea view. The owner is fantastic, welcoming, helpful and attentive to every detail.", author: "Arianna 🇮🇹", prop: "lihele", source: "via Booking.com" },
    { quoteIt: "Una delle rare occasioni in cui si è completamente soddisfatti dell'alloggio. Luciano fa del suo meglio per offrire un servizio eccellente. L'interno è moderno, accogliente e pulito. C'era anche una macchina Nespresso e la colazione inclusa. La posizione non potrebbe essere migliore — il centro storico e la spiaggia sono a pochi passi. Ci siamo pentiti di aver trascorso solo due notti!", quoteEn: "One of those rare occasions to be fully satisfied with the accommodation. Luciano does his best to offer excellent service. The interior is modern, cozy and clean. There was a Nespresso machine and breakfast basics at no extra cost. The location couldn't be better — old town and beach just a short walk away. We regret only spending two nights here!", author: "Petra 🇨🇿", prop: "lihele", source: "via Booking.com" },
  ];

  const scroll = (dir) => { const el = scrollRef.current; if (!el) return; const w = el.querySelector(".rev-card")?.offsetWidth || 360; el.scrollBy({ left: dir * (w + 20), behavior: "smooth" }); };

  useEffect(() => {
    const el = scrollRef.current; if (!el) return;
    let timer;
    const handler = () => { clearTimeout(timer); timer = setTimeout(() => { const cards = el.querySelectorAll(".rev-card"); let c = 0, m = Infinity; cards.forEach((card, i) => { const d = Math.abs(card.offsetLeft - el.offsetLeft - el.scrollLeft); if (d < m) { m = d; c = i; } }); setActiveIdx(c); }, 80); };
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  return (
    <section id="reviews" className="py-24" style={{ background: T.dark }}>
      <div className="max-w-5xl mx-auto px-6">
        <SectionHead light titleIt="Cosa dicono i nostri ospiti" titleEn="What our guests say" />
        <Reveal className="flex items-center justify-center gap-6 md:gap-10 mb-10 flex-wrap">
          <div className="text-center"><AnimatedScore score="9.8" className="font-mono text-3xl font-medium" style={{ color: "#48D4E0" }} /><div className="font-mono text-[0.55rem] tracking-[0.1em] uppercase" style={{ color: "rgba(248,245,240,0.3)" }}>Lihele</div></div>
          <div className="text-center font-mono text-[0.55rem] tracking-[0.08em] uppercase" style={{ color: "rgba(248,245,240,0.2)" }}>Booking.com<br/>Awards 2026</div>
          <div className="text-center"><AnimatedScore score="9.7" className="font-mono text-3xl font-medium" style={{ color: "#5B9BD5" }} /><div className="font-mono text-[0.55rem] tracking-[0.1em] uppercase" style={{ color: "rgba(248,245,240,0.3)" }}>Likele</div></div>
        </Reveal>
        <div className="relative overflow-hidden">
          <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-4 cursor-grab snap-x snap-mandatory scrollbar-hide">
            {reviews.map((r, i) => { const isL = r.prop === "lihele"; const pc = isL ? "#48D4E0" : "#5B9BD5"; return (
              <a key={i} href={r.href || "#reviews"} target={r.href ? "_blank" : undefined} rel="noopener"
                className="rev-card flex-shrink-0 snap-start rounded-xl p-6 border flex flex-col"
                style={{ background: `rgba(${isL ? "20,148,163" : "30,90,168"},0.06)`, borderColor: "rgba(255,255,255,0.06)", height: 346, width: 340, transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease, border-color 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.35)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}>
                <div className="flex gap-0.5 mb-3">{[...Array(5)].map((_, j) => <Star key={j} size={13} fill={T.gold} color={T.gold} />)}</div>
                <p className="font-serif text-sm italic leading-relaxed mb-4 flex-1 overflow-hidden" style={{ color: "rgba(255,255,255,0.8)", display: "-webkit-box", WebkitLineClamp: 9, WebkitBoxOrient: "vertical" }}>"{t(r.quoteIt, r.quoteEn, lang)}"</p>
                <div className="flex items-center justify-between"><span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{r.author}</span><span className="font-mono text-[0.5rem] tracking-[0.08em] uppercase px-2 py-0.5 rounded-full" style={{ color: pc, background: `${pc}18` }}>{isL ? "Lihele" : "Likele"}</span></div>
                <div className="font-mono text-[0.55rem] tracking-wide mt-2" style={{ color: "rgba(248,245,240,0.2)" }}>{r.source}</div>
              </a>
            ); })}
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => scroll(-1)} className="w-10 h-10 rounded-full border flex items-center justify-center transition-all hover:bg-white/10" style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}><ChevronLeft size={18} /></button>
          <div className="flex gap-1.5 mx-2">{reviews.map((_, i) => <div key={i} className="h-1.5 rounded-full transition-all duration-300" style={{ width: i === activeIdx ? 20 : 6, background: i === activeIdx ? T.gold : "rgba(255,255,255,0.12)" }} />)}</div>
          <button onClick={() => scroll(1)} className="w-10 h-10 rounded-full border flex items-center justify-center transition-all hover:bg-white/10" style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}><ChevronRight size={18} /></button>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   LOCATION
   ═══════════════════════════════════════════════════════ */
function Location() {
  const { lang } = useLang();
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const distsRef = useRef(null);
  useGSAP((gsap) => {
    if (!distsRef.current) return;
    gsap.fromTo(
      Array.from(distsRef.current.children),
      { x: -16, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: "power2.out",
        scrollTrigger: { trigger: distsRef.current, start: "top 85%", once: true } }
    );
  }, []);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setMapLoaded(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (mapRef.current) obs.observe(mapRef.current);
    return () => obs.disconnect();
  }, []);

  const dists = [
    { icon: "🏖", lIt: "Spiaggia di Castelsardo", lEn: "Castelsardo Beach", v: "500m" },
    { icon: "🏛", lIt: "Centro storico", lEn: "Historic old town", vIt: "10 min a piedi", vEn: "10 min walk" },
    { icon: "✈️", lIt: "Aeroporto di Alghero", lEn: "Alghero Airport", v: "57 km" },
    { icon: "🚗", lIt: "Sassari", lEn: "Sassari", v: "30 km" },
    { icon: "✈️", lIt: "Aeroporto di Olbia", lEn: "Olbia Airport", v: "~90 km" },
  ];

  return (
    <section id="location" className="py-24 px-6" style={{ background: T.baseDark }}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-stretch">
        <Reveal>
          <div
            ref={mapRef}
            className="rounded-xl overflow-hidden border relative h-full"
            style={{ borderColor: T.border, background: "#d0ccc5", minHeight: 400 }}
          >
            {!mapLoaded && (
              <div
                className="absolute inset-0 flex items-center justify-center font-mono text-xs tracking-[0.1em]"
                style={{ color: T.textLight }}
              >
                {t("Caricamento mappa…", "Loading map…", lang)}
              </div>
            )}
            {mapLoaded && (
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2998.5!2d8.7131!3d40.9156!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12d96c94cf2b7b7f%3A0x6c5f0e0c0d0a0b0c!2sVia+Tibula%2C+4%2C+07031+Castelsardo+SS!5e0!3m2!1sit!2sit!4v1700000000000!5m2!1sit!2sit"
                className="w-full h-full border-none"
                style={{ minHeight: 400 }}
                loading="lazy"
                title="Mappa — Castelsardo"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-serif text-4xl font-light mb-1.5">Castelsardo</h2>
          <p className="font-mono text-xs tracking-[0.12em] uppercase mb-5" style={{ color: T.textLight }}>{t("Sardegna, Italia","Sardinia, Italy",lang)}</p>
          <p className="text-base font-light leading-relaxed mb-8" style={{ color: T.textMid }}>{t("Uno dei borghi medievali più belli d'Italia, arroccato su una roccia a picco sul mar Mediterraneo. Vicoli in pietra, panorami infiniti, spiagge raggiungibili a piedi.","One of Italy's most beautiful medieval villages, perched on a cliff over the Mediterranean. Stone alleyways, endless views, beaches you can walk to.",lang)}</p>
          <div ref={distsRef} className="rounded-xl overflow-hidden border mb-6" style={{ borderColor: T.border }}>
            {dists.map((d, i) => <div key={i} className="flex items-center gap-3.5 px-4 py-3 bg-white border-b transition-colors duration-150 hover:bg-gray-50/80" style={{ borderColor: T.border }}><span className="text-lg">{d.icon}</span><span className="flex-1 text-sm" style={{ color: T.dark }}>{t(d.lIt, d.lEn, lang)}</span><span className="font-mono text-xs" style={{ color: T.textLight }}>{d.v || t(d.vIt, d.vEn, lang)}</span></div>)}
          </div>
          <div className="flex items-start gap-2.5 p-3.5 rounded-lg mb-6 text-sm" style={{ background: T.lihelePale, border: `1px solid rgba(20,148,163,0.12)`, color: T.textMid }}>🅿️ <span><strong style={{ color: T.dark }}>{t("Parcheggio","Parking",lang)}</strong> — {t("disponibile in strada nelle vicinanze, solitamente libero.","available on the street nearby, usually free.",lang)}</span></div>
          <MagneticBtn href="https://maps.google.com/maps?q=Via+Tibula+4,+07031+Castelsardo" target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-full" style={{ background: T.dark, color: T.base }}>
            <MapPin size={15} /><span className="relative z-10">{t("Apri in Google Maps","Open in Google Maps",lang)}</span>
          </MagneticBtn>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   FAQ
   ═══════════════════════════════════════════════════════ */
function FAQ() {
  const { lang } = useLang();
  const [openIdx, setOpenIdx] = useState(null);
  const groups = [
    { titleIt: "Prenotazione", titleEn: "Booking", items: [
      { qIt: "Come si prenota direttamente?", qEn: "How do I book directly?", aIt: "Scrivici su WhatsApp — è il modo più rapido. Rispondiamo entro poche ore, confermiamo disponibilità e prezzi e organizziamo tutto direttamente con voi.", aEn: "Message us on WhatsApp — it's the fastest way. We reply within a few hours, confirm availability and rates, and arrange everything directly with you." },
      { qIt: "Conviene prenotare direttamente?", qEn: "Is it better to book direct?", aIt: "Sì — prenotando direttamente evitate le commissioni delle piattaforme, avete comunicazione diretta con noi e possiamo essere più flessibili su richieste particolari.", aEn: "Yes — by booking direct you avoid platform fees, have direct communication with us, and we can be more flexible with special requests." },
      { qIt: "Quali metodi di pagamento accettate?", qEn: "What payment methods do you accept?", aIt: "Da definire — vi informiamo al momento della prenotazione.", aEn: "To be confirmed — we'll let you know at time of booking." },
      { qIt: "Qual è la politica di cancellazione?", qEn: "What is the cancellation policy?", aIt: "Da definire — vi comunichiamo le condizioni complete al momento della prenotazione.", aEn: "To be confirmed — we'll share full terms at time of booking." },
    ]},
    { titleIt: "Le Strutture", titleEn: "The Properties", items: [
      { qIt: "Qual è la differenza tra Lihele e Likele?", qEn: "What's the difference between Lihele and Likele?", aIt: "Lihele è l'appartamento intero: 3 camere, fino a 5 ospiti, cucina completa, balcone vista mare. Likele è una camera privata con bagno privato, terrazza vista mare e colazione. Sono nello stesso stabile, con ingressi su strade diverse.", aEn: "Lihele is the entire apartment: 3 bedrooms, up to 5 guests, full kitchen, sea-view balcony. Likele is a private room with en-suite bathroom, sea-view terrace and breakfast. Same building, different street entrances." },
      { qIt: "La colazione è inclusa a Likele?", qEn: "Is breakfast included at Likele?", aIt: "Sì — macchina Dolce Gusto, tè e tisane, brioche confezionate, biscotti, yogurt e succhi di frutta.", aEn: "Yes — Dolce Gusto machine, teas, packaged brioches, biscuits, yogurt and fruit juices." },
      { qIt: "Sono ammessi animali?", qEn: "Are pets allowed?", aIt: "Da definire — contattateci direttamente.", aEn: "To be confirmed — please contact us directly." },
    ]},
    { titleIt: "Il Soggiorno", titleEn: "Your Stay", items: [
      { qIt: "C'è l'aria condizionata?", qEn: "Is there air conditioning?", aIt: "Sì, in entrambe le strutture.", aEn: "Yes, in both properties." },
      { qIt: "Il WiFi è incluso?", qEn: "Is WiFi included?", aIt: "Sì, WiFi gratuito disponibile in tutta la struttura.", aEn: "Yes, free WiFi throughout both properties." },
    ]},
    { titleIt: "Posizione", titleEn: "Location", items: [
      { qIt: "È necessaria la macchina?", qEn: "Do I need a car?", aIt: "Per raggiungere la struttura sì, ma una volta a Castelsardo la spiaggia e il centro storico sono a piedi.", aEn: "To reach the property yes, but once in Castelsardo the beach and old town are walkable." },
      { qIt: "È adatta per i bambini?", qEn: "Is it suitable for children?", aIt: "Sì — Lihele dispone di un'area giochi per bambini.", aEn: "Yes — Lihele has a children's play area." },
      { qIt: "Lihele e Likele sono nello stesso posto?", qEn: "Are Lihele and Likele in the same place?", aIt: "Sì — stesso stabile, ingressi su strade diverse. Lihele: Via Colle di Frigiano 35. Likele: Via Tibula 4.", aEn: "Yes — same building, different entrances. Lihele: Via Colle di Frigiano 35. Likele: Via Tibula 4." },
    ]},
  ];
  let gi = 0;
  return (
    <section id="faq" className="py-24 px-6" style={{ background: T.base }}>
      <div className="max-w-3xl mx-auto">
        <SectionHead label="FAQ" titleIt="Domande frequenti" titleEn="Frequently asked questions" />
        {groups.map((g, gIdx) => (
          <Reveal key={gIdx} className="mb-10">
            <h3 className="font-mono text-xs tracking-[0.14em] uppercase pb-2 mb-2 border-b" style={{ color: T.textLight, borderColor: T.border }}>{t(g.titleIt, g.titleEn, lang)}</h3>
            {g.items.map((item, iIdx) => { const idx = gi++; const isOpen = openIdx === idx; return (
              <div key={idx} className="border-b" style={{ borderColor: T.border }}>
                <button className="w-full text-left py-5 flex justify-between items-center gap-4 text-base font-medium transition-colors hover:text-[#1494A3]" style={{ color: T.dark }} onClick={() => setOpenIdx(isOpen ? null : idx)} aria-expanded={isOpen}>
                  {t(item.qIt, item.qEn, lang)}<span className="flex-shrink-0 text-lg transition-transform duration-300" style={{ color: T.textLight, transform: isOpen ? "rotate(45deg)" : "none" }}>+</span>
                </button>
                <div className="overflow-hidden transition-all duration-400" style={{ maxHeight: isOpen ? 300 : 0, paddingBottom: isOpen ? 20 : 0 }}>
                  <p className="text-sm font-light leading-relaxed" style={{ color: T.textMid }}>{t(item.aIt, item.aEn, lang)}</p>
                </div>
              </div>
            ); })}
          </Reveal>
        ))}
        <Reveal className="text-center mt-12">
          <p className="text-base mb-4" style={{ color: T.textMid }}>{t("Altre domande? Siamo qui.","More questions? We're here.",lang)}</p>
          <MagneticBtn href={waLink("Ciao! Ho una domanda.")} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-white text-sm font-medium px-6 py-3 rounded-full" style={{ background: T.wa }}>
            <WAIcon size={16} /><span className="relative z-10">{t("Scrivici su WhatsApp","Message us on WhatsApp",lang)}</span>
          </MagneticBtn>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   CONTACT
   ═══════════════════════════════════════════════════════ */
function Contact() {
  const { lang } = useLang();
  const [contactFormLoading, setContactFormLoading] = useState(false);
  const [contactFormMessage, setContactFormMessage] = useState("");
  const [contactFormSuccess, setContactFormSuccess] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      property: formData.get("property"),
      dates: formData.get("dates"),
      message: formData.get("message"),
    };

    setContactFormLoading(true);
    setContactFormMessage("");
    try {
      const res = await fetch("/.netlify/functions/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (res.ok) {
        setContactFormSuccess(true);
        setContactFormMessage(lang === "en" ? "Thank you! We'll get back to you soon." : "Grazie! Ti contatteremo a breve.");
        form.reset();
        setTimeout(() => setContactFormMessage(""), 5000);
      } else {
        setContactFormSuccess(false);
        setContactFormMessage(result.error || (lang === "en" ? "Something went wrong. Please try again." : "Qualcosa è andato storto. Riprova."));
      }
    } catch (err) {
      setContactFormSuccess(false);
      setContactFormMessage(lang === "en" ? "Network error. Please try again." : "Errore di rete. Riprova.");
    } finally {
      setContactFormLoading(false);
    }
  };

  return (
    <section id="contatti" className="py-24 px-6" style={{ background: T.dark }}>
      <div className="max-w-xl mx-auto text-center">
        <Reveal>
          <p className="font-mono text-xs tracking-[0.14em] uppercase mb-4" style={{ color: "rgba(248,245,240,0.35)" }}>{t("Contatti","Contact",lang)}</p>
          <h2 className="font-serif text-3xl md:text-5xl font-light text-white mb-3">{t("Scriveteci, siamo qui.","Get in touch, we're here.",lang)}</h2>
          <p className="text-base font-light mb-9 leading-relaxed" style={{ color: "rgba(248,245,240,0.5)" }}>{t("Di solito rispondiamo entro poche ore. Scrivici su WhatsApp per il modo più rapido.","We usually reply within a few hours. WhatsApp is the fastest way.",lang)}</p>
          <MagneticBtn href={waLink("Ciao! Vorrei informazioni su Lihele o Likele.")} target="_blank" rel="noopener" className="inline-flex items-center gap-3 text-white text-lg font-medium px-9 py-5 rounded-full mx-auto" style={{ background: T.wa }}>
            <WAIcon size={22} /><span className="relative z-10">💬 {t("Scrivici su WhatsApp","Message us on WhatsApp",lang)}</span>
          </MagneticBtn>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="flex items-center gap-4 my-8" style={{ color: "rgba(248,245,240,0.2)" }}><span className="flex-1 h-px" style={{ background: "rgba(248,245,240,0.08)" }} /><span className="font-mono text-xs tracking-[0.1em] uppercase">{t("oppure usa il modulo","or use the form",lang)}</span><span className="flex-1 h-px" style={{ background: "rgba(248,245,240,0.08)" }} /></div>
          <form className="flex flex-col gap-3 text-left" onSubmit={handleContactSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5"><label className="font-mono text-[0.6rem] tracking-[0.1em] uppercase" style={{ color: "rgba(248,245,240,0.4)" }}>{t("Nome","Name",lang)}</label><input type="text" name="name" required className="bg-white/5 border border-white/10 rounded-lg px-3.5 py-3 text-sm text-white/90 outline-none focus:border-white/30 transition-colors" placeholder={t("Il tuo nome","Your name",lang)} disabled={contactFormLoading} /></div>
              <div className="flex flex-col gap-1.5"><label className="font-mono text-[0.6rem] tracking-[0.1em] uppercase" style={{ color: "rgba(248,245,240,0.4)" }}>Email</label><input type="email" name="email" required className="bg-white/5 border border-white/10 rounded-lg px-3.5 py-3 text-sm text-white/90 outline-none focus:border-white/30 transition-colors" placeholder="la@tua.email" disabled={contactFormLoading} /></div>
            </div>
            <div className="flex flex-col gap-1.5"><label className="font-mono text-[0.6rem] tracking-[0.1em] uppercase" style={{ color: "rgba(248,245,240,0.4)" }}>{t("Struttura","Property",lang)}</label><select name="property" className="bg-white/5 border border-white/10 rounded-lg px-3.5 py-3 text-sm text-white/90 outline-none focus:border-white/30" disabled={contactFormLoading}><option value="">—</option><option value="lihele">Lihele — Casa Vacanze</option><option value="likele">Likele — Camera Privata</option><option value="entrambe">{t("Entrambe","Both",lang)}</option></select></div>
            <div className="flex flex-col gap-1.5"><label className="font-mono text-[0.6rem] tracking-[0.1em] uppercase" style={{ color: "rgba(248,245,240,0.4)" }}>{t("Date","Dates",lang)}</label><input type="text" name="dates" className="bg-white/5 border border-white/10 rounded-lg px-3.5 py-3 text-sm text-white/90 outline-none focus:border-white/30 transition-colors" placeholder={t("es. 10 luglio – 17 luglio 2026","e.g. 10 July – 17 July 2026",lang)} disabled={contactFormLoading} /></div>
            <div className="flex flex-col gap-1.5"><label className="font-mono text-[0.6rem] tracking-[0.1em] uppercase" style={{ color: "rgba(248,245,240,0.4)" }}>{t("Messaggio","Message",lang)}</label><textarea name="message" rows={3} className="bg-white/5 border border-white/10 rounded-lg px-3.5 py-3 text-sm text-white/90 outline-none focus:border-white/30 transition-colors resize-y" placeholder={t("Numero di ospiti, richieste particolari…","Number of guests, special requests…",lang)} disabled={contactFormLoading} /></div>
            {contactFormMessage && (
              <p className={`text-xs text-center p-2 rounded ${contactFormSuccess ? 'bg-green-900/30 text-green-200' : 'bg-red-900/30 text-red-200'}`}>{contactFormMessage}</p>
            )}
            <MagneticBtn type="submit" className="text-sm font-medium py-3.5 rounded-full mt-1" style={{ background: T.gold, color: T.dark }} disabled={contactFormLoading}><span className="relative z-10">{contactFormLoading ? (lang === "en" ? "Sending..." : "Invio...") : t("Invia richiesta","Send enquiry",lang)}</span></MagneticBtn>
            <p className="text-xs text-center mt-2" style={{ color: "rgba(248,245,240,0.25)" }}>{t("I tuoi dati sono usati solo per rispondere alla tua richiesta.","Your data is only used to respond to your enquiry.",lang)} <a href="#" className="underline" style={{ color: "rgba(248,245,240,0.4)" }}>Privacy Policy</a></p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════ */
function Footer() {
  const { lang } = useLang();
  return (
    <footer className="px-6" style={{ background: "#0d0f09" }}>
      {/* Top section */}
      <div className="max-w-5xl mx-auto pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand column */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <img src="/assets/Lihele-wh.svg" alt="Lihele" style={{ height: 22 }} />
              <span className="text-xs" style={{ color: "rgba(248,245,240,0.15)" }}>·</span>
              <img src="/assets/Likele-wh.svg" alt="Likele" style={{ height: 22 }} />
            </div>
            <p className="text-sm font-light leading-relaxed" style={{ color: "rgba(248,245,240,0.4)" }}>
              {t("Due strutture con vista mare a Castelsardo, Sardegna. Appartamento intero o camera privata.", "Two sea-view properties in Castelsardo, Sardinia. Entire apartment or private room.", lang)}
            </p>
          </div>

          {/* Navigation column */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[0.6rem] tracking-[0.14em] uppercase mb-1" style={{ color: "rgba(248,245,240,0.25)" }}>{t("Navigazione", "Navigation", lang)}</span>
            {[
              { id: "strutture", it: "Le Strutture", en: "Properties" },
              { id: "gallery", it: "Galleria", en: "Gallery" },
              { id: "location", it: "Dove Siamo", en: "Location" },
              { id: "faq", it: "FAQ", en: "FAQ" },
              { id: "contatti", it: "Contatti", en: "Contact" },
            ].map(l => (
              <a key={l.id} href={`#${l.id}`} className="text-sm transition-colors duration-200 hover:text-white/70" style={{ color: "rgba(248,245,240,0.4)" }}>{t(l.it, l.en, lang)}</a>
            ))}
          </div>

          {/* Contact column */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[0.6rem] tracking-[0.14em] uppercase mb-1" style={{ color: "rgba(248,245,240,0.25)" }}>{t("Contatti", "Contact", lang)}</span>
            <a href={waLink("Ciao!")} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-sm transition-colors duration-200 hover:text-green-400" style={{ color: "rgba(248,245,240,0.4)" }}>
              <WAIcon size={14} /> +39 338 503 7171
            </a>
            <div className="text-sm" style={{ color: "rgba(248,245,240,0.35)" }}>
              <div>Via Colle di Frigiano 35 (Lihele)</div>
              <div>Via Tibula 4 (Likele)</div>
              <div>07031 Castelsardo (SS)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-5xl mx-auto border-t py-6 flex flex-wrap items-center justify-between gap-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <span className="font-mono text-[0.65rem] tracking-wide" style={{ color: "rgba(248,245,240,0.2)" }}>© 2026 Lihele · Likele — Castelsardo, {t("Sardegna", "Sardinia", lang)}</span>
        <div className="flex gap-5">
          <a href="#" className="text-xs transition-colors duration-200 hover:text-white/60" style={{ color: "rgba(248,245,240,0.3)" }}>Privacy Policy</a>
          <a href="#" className="text-xs transition-colors duration-200 hover:text-white/60" style={{ color: "rgba(248,245,240,0.3)" }}>Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════
   FLOATING WHATSAPP
   ═══════════════════════════════════════════════════════ */
function FloatingWA() {
  return (
    <div className="fixed bottom-7 right-7 z-[200]" style={{ animation: "waBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) 1s both" }}>
      <span className="absolute inset-0 rounded-full pointer-events-none" style={{ background: T.wa, animation: "ringPulse 2.2s ease-out 1.8s infinite" }} />
      <span className="absolute inset-0 rounded-full pointer-events-none" style={{ background: T.wa, animation: "ringPulse 2.2s ease-out 2.9s infinite" }} />
      <a href={waLink("Ciao!")} target="_blank" rel="noopener" aria-label="WhatsApp"
        className="relative w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110"
        style={{ background: T.wa, boxShadow: "0 4px 20px rgba(37,211,102,0.4)" }}>
        <WAIcon size={26} />
      </a>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ROOT
   ═══════════════════════════════════════════════════════ */
const breakfastNote = {
  labelIt: "☕ Colazione italiana in camera —", labelEn: "☕ Italian breakfast in-room —",
  textIt: " macchina Dolce Gusto, tè e tisane, brioche, biscotti, yogurt e succhi di frutta.",
  textEn: " Dolce Gusto machine, teas, brioches, biscuits, yogurt and fruit juices.",
};

export default function App() {
  const [lang, setLang] = useState("it");
  return (
    <LangCtx.Provider value={{ lang, toggle: () => setLang(l => l === "it" ? "en" : "it") }}>
      <Navbar />
      <Hero />
      <Awards />
      <Properties />
      <DetailSection id="lihele" name="Lihele" color={T.lihele} pale={T.lihelePale} score="9.8" typeIt="Casa Vacanze Intera" typeEn="Entire Holiday Apartment" logoSrc="/assets/Lihele.svg" descIt="Un appartamento luminoso affacciato sul mare di Castelsardo. Tre camere da letto per un massimo di cinque ospiti, balcone con vista diretta, cucina attrezzata, area giochi per i bambini. La luce del mattino qui è qualcosa di speciale." descEn="A bright apartment overlooking the sea at Castelsardo. Three bedrooms for up to five guests, a balcony with direct sea views, fully equipped kitchen, and a children's play area. The morning light here is something special." note={breakfastNote} imgGrad="linear-gradient(160deg, #1494A3, #0c6d78)" waMsg="Ciao! Vorrei informazioni su Lihele (appartamento)."
        gallery={[
          { imgSrc: "/assets/images/lihele-website/selezione/entrata2.jpg", alt: "Lihele — Entrata" },
          { imgSrc: "/assets/images/lihele-website/selezione/stanza-doppia.jpg", alt: "Lihele — Stanza Doppia" },
          { imgSrc: "/assets/images/lihele-website/dettagli/tavolo-alto.jpg", alt: "Lihele — Tavolo" },
          { imgSrc: "/assets/images/lihele-website/dettagli/parete.jpg", alt: "Lihele — Parete" },
          { imgSrc: "/assets/images/lihele-website/dettagli/ancora.jpg", alt: "Lihele — Ancora" },
        ]} bookingUrl="https://www.booking.com/hotel/it/casa-vacanza-lihele-locazione-turistica-castelsardo.it.html"
        facts={[
          { icon: "👥", labelIt: "Ospiti", labelEn: "Guests", valIt: "Fino a 5", valEn: "Up to 5" },
          { icon: "🛏", labelIt: "Camere", labelEn: "Bedrooms", valIt: "3", valEn: "3" },
          { icon: "🌊", labelIt: "Vista", labelEn: "View", valIt: "Balcone mare", valEn: "Sea balcony" },
          { icon: "🍳", labelIt: "Cucina", labelEn: "Kitchen", valIt: "Attrezzata", valEn: "Fully equipped" },
          { icon: "📺", labelIt: "TV", labelEn: "TV", valIt: "Satellitare", valEn: "Satellite" },
          { icon: "🎠", labelIt: "Per famiglie", labelEn: "Families", valIt: "Area giochi", valEn: "Play area" },
          { icon: "🛁", labelIt: "Bagno", labelEn: "Bathroom", valIt: "1", valEn: "1" },
          { icon: "📶", labelIt: "WiFi", labelEn: "WiFi", valIt: "Incluso", valEn: "Free" },
        ]} />
      <DetailSection id="likele" name="Likele" color={T.likele} pale={T.likelePale} score="9.7" reverse typeIt="Camera con Bagno Privato" typeEn="Private Room & Bathroom" logoSrc="/assets/Likele.svg" descIt="Una camera intima con terrazza affacciata sul mare, bagno privato, aria condizionata e colazione servita in camera. A cinquecento metri dalla spiaggia, nel cuore di Castelsardo." descEn="An intimate room with a private sea-view terrace, en-suite bathroom, air conditioning and breakfast in-room. Five hundred metres from the beach, in the heart of Castelsardo." note={breakfastNote} imgGrad="linear-gradient(160deg, #1E5AA8, #164280)" waMsg="Ciao! Vorrei informazioni su Likele (camera)." bookingUrl="https://www.booking.com/hotel/it/affittacamere-likele.it.html"
        gallery={[
          { imgSrc: "/assets/images/likele-website/letto.jpg", alt: "Likele — Camera" },
          { imgSrc: "/assets/images/likele-website/entrata2.jpg", alt: "Likele — Terrazza vista mare" },
          { imgSrc: "/assets/images/likele-website/bagno.jpg", alt: "Likele — Bagno" },
          { imgSrc: "/assets/images/likele-website/colazione.jpg", alt: "Likele — Colazione" },
        ]}
        facts={[
          { icon: "👥", labelIt: "Ospiti", labelEn: "Guests", valIt: "1–2", valEn: "1–2" },
          { icon: "🛁", labelIt: "Bagno", labelEn: "Bathroom", valIt: "Privato", valEn: "Private" },
          { icon: "🌅", labelIt: "Terrazza", labelEn: "Terrace", valIt: "Vista mare", valEn: "Sea view" },
          { icon: "❄️", labelIt: "Clima", labelEn: "A/C", valIt: "Incluso", valEn: "Included" },
          { icon: "🏖", labelIt: "Spiaggia", labelEn: "Beach", valIt: "500m", valEn: "500m" },
          { icon: "📶", labelIt: "WiFi", labelEn: "WiFi", valIt: "Incluso", valEn: "Free" },
          { icon: "🕐", labelIt: "Reception", labelEn: "Reception", valIt: "24h", valEn: "24h" },
          { icon: "✈️", labelIt: "Aeroporto", labelEn: "Airport", valIt: "Transfer su richiesta", valEn: "Transfer on request" },
        ]} />
      <Gallery />
      <Reviews />
      <Location />
      <FAQ />
      <Contact />
      <Footer />
      <FloatingWA />
    </LangCtx.Provider>
  );
}
