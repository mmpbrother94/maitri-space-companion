import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./launch.css";
import rocketSvg from "../../assets/rocket.svg";

type RocketLaunchProps = {
  timeout: number;
  onDone: () => void;
};

type Spark = {
  id: number;
  offset: number;
  drift: number;
  delay: number;
  duration: number;
};

const SPARK_COUNT = 20;

const RocketLaunch: React.FC<RocketLaunchProps> = ({ timeout, onDone }) => {
  const [active, setActive] = useState(false);
  const completedRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onDone();
  }, [onDone]);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (prefersReduced) {
      finish();
      return;
    }

    const frame = window.requestAnimationFrame(() => setActive(true));
    timerRef.current = window.setTimeout(() => {
      finish();
    }, timeout);

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finish();
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKey);
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timeout, finish]);

  const sparks = useMemo<Spark[]>(() => {
    return Array.from({ length: SPARK_COUNT }, (_, id) => ({
      id,
      offset: Math.random() * 80 - 40,
      drift: Math.random() * 44 - 22,
      delay: 360 + Math.random() * 520,
      duration: 640 + Math.random() * 520,
    }));
  }, []);

  return (
    <div
      className={`launch-overlay ${active ? "launch-active" : ""}`}
      aria-hidden="true"
    >
      <div className="launch-stage">
        <div className="launch-shockwave" />
        <div className="launch-bloom" />
        <div className="launch-rocket-wrapper">
          <div className="launch-rocket-body">
            <img src={rocketSvg} className="launch-rocket-img" alt="" />
            <div className="launch-flame" />
          </div>
          <div className="launch-particles">
            {sparks.map((spark) => {
              const style: CSSProperties = {
                left: `calc(50% + ${spark.offset.toFixed(1)}px)`,
                animationDelay: `${spark.delay.toFixed(0)}ms`,
                animationDuration: `${spark.duration.toFixed(0)}ms`,
                "--spark-drift": `${spark.drift.toFixed(1)}px`,
              };
              return <span key={spark.id} className="launch-spark" style={style} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RocketLaunch;
