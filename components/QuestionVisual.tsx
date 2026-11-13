import type { Visual } from "@/lib/quiz";

export function QuestionVisual({ visual }: { visual: Visual }) {
  switch (visual.kind) {
    case "emoji":
      return <div className={`q-emoji ${[...visual.text].length > 6 ? "many" : ""}`}>{visual.text}</div>;
    case "swatch":
      return <div className="q-swatch" style={{ background: visual.color }} />;
    case "clock":
      return <Clock hour={visual.hour} />;
    case "shape":
      return <Shape shape={visual.shape} />;
    case "numberline":
      return <NumberLine max={visual.max} mark={visual.mark} />;
  }
}

function Clock({ hour }: { hour: number }) {
  const angle = (hour % 12) * 30;
  return (
    <svg className="q-svg" viewBox="0 0 120 120" role="img" aria-label="Đồng hồ">
      <circle cx="60" cy="60" r="54" fill="#fff" stroke="var(--primary)" strokeWidth="6" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = ((i + 1) * 30 - 90) * (Math.PI / 180);
        return (
          <text key={i} x={60 + Math.cos(a) * 42} y={60 + Math.sin(a) * 42 + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#1f2937">
            {i + 1}
          </text>
        );
      })}
      <line x1="60" y1="60" x2="60" y2="20" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
      <line x1="60" y1="60" x2="60" y2="34" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" transform={`rotate(${angle} 60 60)`} />
      <circle cx="60" cy="60" r="4" fill="#1f2937" />
    </svg>
  );
}

function Shape({ shape }: { shape: "circle" | "square" | "triangle" | "rectangle" }) {
  const common = { fill: "var(--accent)", stroke: "var(--primary)", strokeWidth: 5 };
  return (
    <svg className="q-svg" viewBox="0 0 160 120" role="img" aria-label="Hình">
      {shape === "circle" && <circle cx="80" cy="60" r="48" {...common} />}
      {shape === "square" && <rect x="32" y="12" width="96" height="96" rx="4" {...common} />}
      {shape === "rectangle" && <rect x="12" y="28" width="136" height="64" rx="4" {...common} />}
      {shape === "triangle" && <polygon points="80,10 146,110 14,110" strokeLinejoin="round" {...common} />}
    </svg>
  );
}

function NumberLine({ max, mark }: { max: number; mark: number }) {
  const w = 300;
  const step = (w - 30) / max;
  return (
    <svg className="q-svg wide" viewBox={`0 0 ${w} 60`} role="img" aria-label="Tia số">
      <line x1="10" y1="30" x2={w - 10} y2="30" stroke="currentColor" strokeWidth="2" />
      {Array.from({ length: max + 1 }, (_, i) => (
        <g key={i}>
          <line x1={15 + i * step} y1="24" x2={15 + i * step} y2="36" stroke="currentColor" strokeWidth="2" />
          <text x={15 + i * step} y="52" textAnchor="middle" fontSize="11" fill="currentColor" fontWeight={i === mark ? 800 : 500}>
            {i}
          </text>
        </g>
      ))}
      <circle cx={15 + mark * step} cy="30" r="6" fill="var(--primary)" />
      <text x={15 + mark * step} y="14" textAnchor="middle" fontSize="12" fill="var(--primary)">
        ▼
      </text>
    </svg>
  );
}
