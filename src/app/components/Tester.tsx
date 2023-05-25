"use client";

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
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const _timings = useRef<number[]>([]);

  const more = searchParams.get("more");
  const url = searchParams.get("url");

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

  const sendRequest = async () => {
    const before = performance.now();
    try {
      await fetch(url ?? "http://localhost:3001", { cache: "no-store" }).then(
        (res) => res.json()
      );
    } catch (e: any) {
      setError(e.message);
    }
    const after = performance.now();
    _timings.current.push(after - before);
  };

  const handleOnClick = async () => {
    if (more) {
      await Promise.allSettled(Array.from({ length: +more }, sendRequest));
    } else {
      await sendRequest();
    }
    setTimings([..._timings.current]);
  };

  const data = {
    labels: timings.map((_, index) => index),
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
    <div className="w-[600px] mx-auto">
      <Line data={data} />

      <button
        className="px-4 py-2 mr-4 font-bold text-blue-500 border border-blue-500 rounded hover:text-white hover:bg-blue-500"
        onClick={() => {
          setTimings([]);
          _timings.current = [];
          setError("");
        }}
      >
        Reset
      </button>

      <button
        className="px-4 py-2 mr-4 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 active:bg-blue-900"
        onClick={handleOnClick}
      >
        {more ? `Send ${more} requests` : "Send request"}
        {loop ? " per second" : ""}
      </button>

      <input
        type="checkbox"
        checked={loop}
        onChange={() => {
          handleOnClick();
          setLoop(!loop);
        }}
      />
      <span className="ml-2">Loop</span>

      <p>Total requests sent: {timings.length}</p>

      {error && (
        <div className="mt-12">
          <span>Did we break it?</span>
          <pre className="text-red-500">{error}</pre>
        </div>
      )}
    </div>
  );
}
