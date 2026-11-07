import { useEffect, useRef, useState, useCallback } from "react";
import "./IntroLoader.css";

/**
 * IntroLoader – kinetic typography intro for IGNITRON 2K26
 * Pure typography with elegant aurora backdrop (no small particles)
 *
 * Props:
 *  ready       boolean   -> true when 3D avatar has finished loading
 *  images      string[]  -> gallery image URLs to preload while the intro plays
 *  minTime     number    -> minimum ms the intro stays
 *  onFinish    fn        -> called after the intro has disappeared
 *  onRegister  fn        -> called when "Register Now" is clicked (after intro exits)
 */

const WORDS = ["WELCOME TO", "IGNITE", "COMPETE", "INNOVATE", "CONQUER"];
const WORD_MS = 750;

export default function IntroLoader({
  ready = true,
  images = [],
  minTime = 4600,
  onFinish,
  onRegister,
}) {
  const rootRef = useRef(null);
  const phaseRef = useRef("loading");
  const [phase, _setPhase] = useState("loading"); // loading | ready | exiting | done
  const [word, setWord] = useState(0); // index of the word on screen; WORDS.length = grand reveal
  const [progress, setProgress] = useState(0);
  const [minDone, setMinDone] = useState(false);
  const [imgsDone, setImgsDone] = useState(images.length === 0);

  const setPhase = (p) => {
    phaseRef.current = p;
    _setPhase(p);
  };

  /* kinetic typography sequence */
  useEffect(() => {
    const id = setInterval(() => {
      setWord((w) => (w < WORDS.length ? w + 1 : w));
    }, WORD_MS);
    return () => clearInterval(id);
  }, []);

  /* minimum display time */
  useEffect(() => {
    const t = setTimeout(() => setMinDone(true), minTime);
    return () => clearTimeout(t);
  }, [minTime]);

  /* preload gallery images in background */
  useEffect(() => {
    if (!images.length) return;
    let left = images.length;
    const done = () => --left <= 0 && setImgsDone(true);
    images.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = done;
      img.src = src;
    });
  }, [images]);

  const allReady = ready && imgsDone && minDone;

  /* smooth progress */
  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => {
        if (allReady) return Math.min(100, p + 4);
        return p < 92 ? p + Math.max(0.4, (92 - p) * 0.035) : p;
      });
    }, 50);
    return () => clearInterval(id);
  }, [allReady]);

  useEffect(() => {
    if (progress >= 100 && phaseRef.current === "loading") {
      const t = setTimeout(() => setPhase("ready"), 250);
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
      if (phaseRef.current === "exiting" || phaseRef.current === "done") return;
      setPhase("exiting");
      setTimeout(() => {
        setPhase("done");
        onFinish && onFinish();
        cb && cb();
      }, 700);
    },
    [onFinish]
  );

  /* scroll / swipe / key to enter */
  useEffect(() => {
    const onWheel = (e) => e.deltaY > 10 && startExit();
    let ty = 0;
    const onTS = (e) => (ty = e.touches[0].clientY);
    const onTM = (e) => ty - e.touches[0].clientY > 35 && startExit();
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
  const isReady = phase === "ready" || progress >= 95;
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
      <div className="intro__vignette" />

      {/* Skip button top right */}
      <button
        type="button"
        className="intro__skip"
        onClick={() => startExit()}
        title="Skip Intro"
      >
        SKIP [ESC]
      </button>

      {/* Kinetic Typography Sequence */}
      {!formed ? (
        <div className="intro__words" aria-hidden="true">
          <div key={word} className={`kword kword--${word % 3} ${word === 0 ? "kword--small" : ""}`}>
            {WORDS[word].split("").map((ch, i) => (
              <span key={i} style={{ animationDelay: `${i * 35}ms` }}>
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </div>
        </div>
      ) : (
        /* Grand Typography Climax: Clean, Sleek, Glowing IGNITRON 2K26 */
        <div className="intro__climax" aria-label="IGNITRON 2K26">
          <div className="climax__pill">
            <img src="/gmu_logo.png" alt="GMU" className="climax__gmu-icon" />
            <span>GM UNIVERSITY PRESENTS</span>
          </div>

          <h1 className="climax__title">
            <span>IGNITRON</span>
            <span className="climax__year"> 2K26</span>
          </h1>

          <p className="climax__tagline">
            NATIONAL LEVEL TECH FEST · DECEMBER 03–05, 2026
          </p>
        </div>
      )}

      {/* Bottom Actions & Loader */}
      <div className="intro__bottom">
        {formed && (
          <>
            <p className="intro__pitch">
              Be the spark. <b>Your seat at Ignitron is waiting.</b>
            </p>
            <div className="intro__actions">
              <button
                className="intro__btn"
                onClick={() => startExit(onRegister)}
              >
                Register Now →
              </button>
              <button
                className="intro__btn intro__btn--enter"
                onClick={() => startExit()}
              >
                Enter Festival ↓
              </button>
            </div>
          </>
        )}

        {isReady && formed ? (
          <div className="intro__hint" onClick={() => startExit()}>
            Scroll to enter
            <span className="intro__chev" />
          </div>
        ) : (
          <div className="intro__loader" aria-label="Loading">
            <div className="intro__bar">
              <i style={{ width: `${progress}%` }} />
            </div>
            <small>PRIMING ASSETS {Math.floor(progress)}%</small>
          </div>
        )}
      </div>
    </div>
  );
}
