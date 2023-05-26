"use client";

import "client-only";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

export default function Tester() {
  const [timings, setTimings] = useState<number[]>([]);
  const [loop, setLoop] = useState(false);
  const [allowCache, setAllowCache] = useState(false);
  const [error, setError] = useState("");
  const [persecond, setPersecond] = useState(0);
  const searchParams = useSearchParams();
  const _timings = useRef<number[]>([]);
  const lastLength = useRef(0);

  const multiplier = Number(searchParams.get("multiplier")) || 1;
  const url = searchParams.get("url");
  const cache = searchParams.get("cache");

  useEffect(() => {
    const timer = setInterval(() => {
      if (loop) {
        handleOnClick();
      } else {
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [loop]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPersecond(_timings.current.length - lastLength.current);
      lastLength.current = _timings.current.length; // To calculate requests per second
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const sendRequest = async (message?: string) => {
    for (let i = 0; i < multiplier; i++) {
      const before = performance.now();
      try {
        const options: any = allowCache ? {} : { cache: "no-store" };
        await fetch(url ?? "http://37.251.53.160:3001", options);
      } catch (e: any) {
        setError(e.message);
        setLoop(false);
        console.error(e);
      }
      const after = performance.now();
      _timings.current.push(after - before);
    }
  };

  const handleOnClick = async () => {
    await sendRequest();
    setTimings([..._timings.current]);
  };

  const data = {
    labels: timings.map((_, index) => index + 1),
    datasets: [
      {
        label: "Timings",
        data: timings,
        fill: false,
        borderColor: "#0ab682",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className={`w-[800px] mx-auto`}>
      <Line className="mt-8 mb-8" data={data} />

      <button
        className="px-4 py-2 mr-4 font-bold text-blue-500 border border-blue-500 rounded hover:text-white hover:bg-blue-500"
        onClick={() => {
          setTimings([]);
          _timings.current = [];
          lastLength.current = 0;
          setError("");
          setPersecond(0);
          setLoop(false);
        }}
      >
        Reset
      </button>

      <button
        disabled={loop}
        className="px-4 py-2 mr-4 font-bold text-white bg-blue-500 rounded disabled:cursor-not-allowed hover:bg-blue-700 active:bg-blue-900 disabled:bg-gray-500 disabled:text-gray-300"
        onClick={handleOnClick}
      >
        Send
      </button>

      <input
        type="checkbox"
        checked={loop}
        onChange={() => {
          handleOnClick();
          setLoop(!loop);
        }}
      />
      <span className="ml-2 mr-4">Loop</span>

      {cache && (
        <>
          <input
            type="checkbox"
            checked={allowCache}
            onChange={() => {
              setAllowCache(!allowCache);
            }}
          />
          <span className="ml-2">Cache</span>
        </>
      )}

      <p className="mt-8">total requests: {timings.length}</p>
      <p>requests/sec: {persecond}</p>
      <p>
        avg response time:{" "}
        {Math.round(
          timings.reduce((total, val) => total + val, 0) / timings.length
        ) || 0}
        ms
      </p>

      {error && (
        <div className="mt-12">
          <span>Did we break it?</span>
          <pre className="text-red-500">{error}</pre>
        </div>
      )}
    </div>
  );
}
