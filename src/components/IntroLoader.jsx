import { useEffect, useRef, useState, useCallback } from "react";
import { createParticleIntro } from "./particleIntro";
import "./IntroLoader.css";

/**
 * IntroLoader – kinetic typography + particle intro for IGNITRON 2K26
 *
 * Props
 *  ready       boolean   -> true when your 3D avatar has finished loading
 *  images      string[]  -> gallery image URLs to preload while the intro plays
 *  minTime     number    -> minimum ms the intro stays (default covers the full animation)
 *  onFinish    fn        -> called after the intro has disappeared
 *  onRegister  fn        -> called when "Register Now" is clicked (after intro exits)
 */

const WORDS = ["WELCOME TO", "IGNITE", "COMPETE", "INNOVATE", "CONQUER"];
const WORD_MS = 800;
const HOLD = WORD_MS * WORDS.length; // particles start forming after the typography

export default function IntroLoader({
  ready = true,
  images = [],
  minTime = 5500,
  onFinish,
  onRegister,
}) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const phaseRef = useRef("loading");
  const [phase, _setPhase] = useState("loading"); // loading | ready | exiting | done
  const [word, setWord] = useState(0); // index of the word on screen; WORDS.length = particles stage
  const [progress, setProgress] = useState(0);
  const [minDone, setMinDone] = useState(false);
  const [imgsDone, setImgsDone] = useState(images.length === 0);

  const setPhase = (p) => {
    phaseRef.current = p;
    _setPhase(p);
  };

  /* typography sequence */
  useEffect(() => {
    const id = setInterval(() => setWord((w) => (w < WORDS.length ? w + 1 : w)), WORD_MS);
    return () => clearInterval(id);
  }, []);

  /* minimum display time */
  useEffect(() => {
    const t = setTimeout(() => setMinDone(true), minTime);
    return () => clearTimeout(t);
  }, [minTime]);

  /* preload gallery images */
  useEffect(() => {
    if (!images.length) return;
    let left = images.length;
    const done = () => --left <= 0 && setImgsDone(true);
    images.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = done; // a broken image must never block the intro
      img.src = src;
    });
    // eslint-disable-next-line
  }, []);

  const allReady = ready && imgsDone && minDone;

  /* smooth progress: climbs to 90%, finishes when everything is really ready */
  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => {
        if (allReady) return Math.min(100, p + 4);
        return p < 90 ? p + Math.max(0.3, (90 - p) * 0.025) : p;
      });
    }, 60);
    return () => clearInterval(id);
  }, [allReady]);

  useEffect(() => {
    if (progress >= 100 && phaseRef.current === "loading") {
      const t = setTimeout(() => setPhase("ready"), 350);
      return () => clearTimeout(t);
    }
  }, [progress]);

  /* lock page scroll while the intro is visible */
  useEffect(() => {
    document.body.style.overflow = phase === "done" ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  /* particle engine */
  useEffect(() => {
    const engine = createParticleIntro(canvasRef.current, { hold: HOLD });
    engineRef.current = engine;
    return () => engine.destroy();
  }, []);

  /* cursor light */
  useEffect(() => {
    const onMove = (e) => {
      const el = rootRef.current;
      if (!el) return;
      el.style.setProperty("--mx", e.clientX + "px");
      el.style.setProperty("--my", e.clientY + "px");
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const startExit = useCallback(
    (cb) => {
      if (phaseRef.current !== "ready") return;
      setPhase("exiting");
      engineRef.current && engineRef.current.explode();
      setTimeout(() => {
        setPhase("done");
        onFinish && onFinish();
        cb && cb();
      }, 1000);
    },
    [onFinish]
  );

  /* scroll / swipe / key to enter */
  useEffect(() => {
    const onWheel = (e) => e.deltaY > 8 && startExit();
    let ty = 0;
    const onTS = (e) => (ty = e.touches[0].clientY);
    const onTM = (e) => ty - e.touches[0].clientY > 40 && startExit();
    const onKey = (e) =>
      ["Enter", " ", "ArrowDown", "PageDown"].includes(e.key) && startExit();
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTS, { passive: true });
    window.addEventListener("touchmove", onTM, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTS);
      window.removeEventListener("touchmove", onTM);
      window.removeEventListener("keydown", onKey);
    };
  }, [startExit]);

  if (phase === "done") return null;
  const isReady = phase === "ready";
  const formed = word >= WORDS.length;

  return (
    <div
      ref={rootRef}
      className={`intro ${phase === "exiting" ? "intro--exit" : ""}`}
      role="dialog"
      aria-label="IGNITRON 2K26 introduction"
    >
      <div className="intro__aurora"><i /><i /><i /></div>
      <div className="intro__cursor" />
      <canvas ref={canvasRef} className="intro__canvas" />
      <div className="intro__vignette" />

      {/* kinetic typography */}
      {!formed && (
        <div className="intro__words" aria-hidden="true">
          <div key={word} className={`kword kword--${word % 3} ${word === 0 ? "kword--small" : ""}`}>
            {WORDS[word].split("").map((ch, i) => (
              <span key={i} style={{ animationDelay: `${i * 45}ms` }}>
                {ch === " " ? " " : ch}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="intro__bottom">
        {formed && (
          <>
            <p className="intro__type intro__type--a">NATIONAL LEVEL TECH FEST</p>
            <p className="intro__type intro__type--b">DECEMBER 03–05, 2026 · GMU CAMPUS</p>
            <p className="intro__pitch">
              Be the spark. <b>Your seat at Ignitron is waiting.</b>
            </p>
            <button
              className="intro__btn"
              disabled={!isReady}
              onClick={() => startExit(onRegister)}
            >
              Register Now →
            </button>
          </>
        )}

        {isReady ? (
          <div className="intro__hint">
            Scroll to enter
            <span className="intro__chev" />
          </div>
        ) : (
          <div className="intro__loader" aria-label="Loading">
            <div className="intro__bar">
              <i style={{ width: `${progress}%` }} />
            </div>
            <small>LOADING EXPERIENCE {Math.floor(progress)}%</small>
          </div>
        )}
      </div>
    </div>
  );
}
