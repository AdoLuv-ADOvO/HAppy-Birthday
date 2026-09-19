import React, { useRef, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
type P = { x: number; y: number };
type Color = "#000000" | "#2B7FFF" | "#123A7A";
type Hat = {
    x: number;
    y: number;
    scale: number;
    rotation: number;
    circle: Color;
    body: Color;
};
const S = 300,
    BRUSH = 7,
    CLOSE = 18,
    TOOTH_EPS = 2.5,
    FACE_EPS = 1,
    EPS = 1;
const L = {
    zh: {
        g: "說明",
        t: "牙齒",
        f: "表情&裝飾",
        h: "生日帽",
        s: "儲存",
        start: "開始繪畫",
        back: "上一步",
        next: "下一步",
        clear: "清除",
        black: "黑色",
        blue: "藍色",
        dark: "深藍色",
        left: "向左",
        up: "向上",
        down: "向下",
        right: "向右",
        gt: "畫出屬於你的牙齒！",
        gp: "依照步驟完成完成屬於你的牙齒吧！",
        th: "請畫出牙齒的外圍輪廓。",
        fh: "請畫出牙齒的表情及裝飾。",
        hh: "請調整生日帽的位置、大小與旋轉角度，並選擇整體顏色。",
        sh: "作品完成！請選擇儲存 SVG 並回到表單上傳，也可存為 PNG 自行保存。",
        need: "請先完成牙齒輪廓，再進入下一步。",
        bad: "無法建立有效輪廓，請重新描繪牙齒外圍。",
        noface: "請至少畫出一筆表情，再進入下一步。",
        saved: "已儲存作品！",
    },
    en: {
        g: "Guide",
        t: "Tooth",
        f: "Face & Decorations",
        h: "Birthday Hat",
        s: "Save",
        start: "Start Drawing",
        back: "Back",
        next: "Next",
        clear: "Clear",
        black: "Black",
        blue: "Blue",
        dark: "Dark blue",
        left: "Move Left",
        up: "Move Up",
        down: "Move Down",
        right: "Move Right",
        gt: "Draw your own tooth!",
        gp: "Follow the steps to complete your own tooth!",
        th: "Please draw the outer outline of the tooth.",
        fh: "Please draw the tooth's face and decorations..",
        hh: "Adjust the birthday hat's position, size, and rotation, then choose its overall color.",
        sh: "Your artwork is complete! Select SVG to save it, then return to the form and upload it. You can also save it as a PNG for your own use.",
        need: "Please complete the tooth outline before moving to the next step.",
        bad: "Unable to create a valid outline. Please redraw the outer edge of the tooth.",
        noface: "Please draw at least one face stroke before moving to the next step.",
        saved: "Artwork saved!",
    },
    ja: {
        g: "説明",
        t: "歯",
        f: "表情＆デコレーション",
        h: "誕生日帽",
        s: "保存",
        start: "描き始める",
        back: "戻る",
        next: "次へ",
        clear: "クリア",
        black: "黒",
        blue: "青",
        dark: "濃い青",
        left: "左へ移動",
        up: "上へ移動",
        down: "下へ移動",
        right: "右へ移動",
        gt: "自分だけの歯を描こう！",
        gp: "ステップに沿って、自分だけの歯を完成させよう！",
        th: "歯の外側の輪郭を描いてください。",
        fh: "歯の表情とデコレーションを描いてください。",
        hh: "誕生日帽の位置・大きさ・回転角度を調整し、全体の色を選択してください。",
        sh: "作品が完成しました！SVGを選択して保存し、フォームに戻ってアップロードしてください。PNGとして保存することもできます。",
        need: "まず歯の輪郭を完成させてから、次のステップへ進んでください。",
        bad: "有効な輪郭を作成できませんでした。歯の外側をもう一度描いてください。",
        noface: "次のステップへ進む前に、表情を1ストローク以上描いてください。",
        saved: "作品を保存しました！",
    },
};
function d(a: P, b: P) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}
function simp(a: P[], e = EPS): P[] {
    if (a.length < 3) return a.slice();
    let m = 0,
        k = 0,
        A = a[0],
        B = a[a.length - 1],
        dx = B.x - A.x,
        dy = B.y - A.y,
        n = Math.hypot(dx, dy) || 1;
    for (let i = 1; i < a.length - 1; i++) {
        let p = a[i],
            z = Math.abs(dy * p.x - dx * p.y + B.x * A.y - B.y * A.x) / n;
        if (z > m) {
            m = z;
            k = i;
        }
    }
    return m > e
        ? simp(a.slice(0, k + 1), e)
            .slice(0, -1)
            .concat(simp(a.slice(k), e))
        : [A, B];
}
function path(a: P[], closed = false) {
    if (a.length < 2) return "";
    if (closed) {
        let n = a.length,
            o = `M ${a[0].x.toFixed(2)} ${a[0].y.toFixed(2)}`;
        for (let i = 0; i < n; i++) {
            let p0 = a[(i - 1 + n) % n],
                p1 = a[i],
                p2 = a[(i + 1) % n],
                p3 = a[(i + 2) % n];
            o += ` C ${(p1.x + (p2.x - p0.x) / 6).toFixed(2)} ${(p1.y + (p2.y - p0.y) / 6).toFixed(2)}, ${(p2.x - (p3.x - p1.x) / 6).toFixed(2)} ${(p2.y - (p3.y - p1.y) / 6).toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
        }
        return o + " Z";
    }
    let p = [a[0], ...a, a[a.length - 1]],
        o = `M ${a[0].x.toFixed(2)} ${a[0].y.toFixed(2)}`;
    for (let i = 1; i < p.length - 2; i++) {
        let p0 = p[i - 1],
            p1 = p[i],
            p2 = p[i + 1],
            p3 = p[i + 2];
        o += ` C ${(p1.x + (p2.x - p0.x) / 6).toFixed(2)} ${(p1.y + (p2.y - p0.y) / 6).toFixed(2)}, ${(p2.x - (p3.x - p1.x) / 6).toFixed(2)} ${(p2.y - (p3.y - p1.y) / 6).toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }
    return o;
}
function cross(a: P, b: P, c: P) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}
function intersect(a: P, b: P, c: P, e: P) {
    let x1 = cross(a, b, c),
        x2 = cross(a, b, e),
        x3 = cross(c, e, a),
        x4 = cross(c, e, b);
    return (
        ((x1 > 0 && x2 < 0) || (x1 < 0 && x2 > 0)) &&
        ((x3 > 0 && x4 < 0) || (x3 < 0 && x4 > 0))
    );
}
function firstCross(a: P[]) {
    for (let i = 1; i < a.length - 2; i++)
        for (let j = 0; j < i - 1; j++)
            if (intersect(a[i], a[i + 1], a[j], a[j + 1])) return i;
    return -1;
}
function area(a: P[]) {
    return (
        a.reduce(
            (z, p, i) =>
                z + p.x * a[(i + 1) % a.length].y - a[(i + 1) % a.length].x * p.y,
            0,
        ) / 2
    );
}
function offset(a: P[], r: number) {
    let ccw = area(a) > 0;
    return a.map((p, i) => {
        let q = a[(i - 1 + a.length) % a.length],
            n = a[(i + 1) % a.length],
            x = n.x - q.x,
            y = n.y - q.y,
            l = Math.hypot(x, y) || 1;
        x /= l;
        y /= l;
        let nx = ccw ? y : -y,
            ny = ccw ? -x : x;
        return {
            x: Math.max(0, Math.min(300, p.x + nx * r)),
            y: Math.max(0, Math.min(300, p.y + ny * r)),
        };
    });
}
function Icon({ children }: { children: string }) {
    return <span className="material-symbols-outlined">{children}</span>;
}
export default function App() {
    const [lang, setLang] = useState<"zh" | "en" | "ja">("zh"),
        [step, setStep] = useState(0),
        [tooth, setTooth] = useState(""),
        [faces, setFaces] = useState<{ d: string; c: Color }[]>([]),
        [draft, setDraft] = useState<P[]>([]),
        [drawing, setDrawing] = useState(false),
        [color, setColor] = useState<Color>("#000000"),
        [hat, setHat] = useState<Hat>({
            x: 150,
            y: 55,
            scale: 1,
            rotation: 0,
            circle: "#2B7FFF",
            body: "#123A7A",
        }),
        [err, setErr] = useState("");
    const svg = useRef<SVGSVGElement>(null),
        t = L[lang];
    const point = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
        let r = svg.current!.getBoundingClientRect();
        return {
            x: Math.max(0, Math.min(300, ((e.clientX - r.left) * 300) / r.width)),
            y: Math.max(0, Math.min(300, ((e.clientY - r.top) * 300) / r.height)),
        };
    }, []);
    const down = (e: React.PointerEvent<SVGSVGElement>) => {
        if (step < 1 || step > 2) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        setDraft([point(e)]);
        setDrawing(true);
        setErr("");
    };
    const move = (e: React.PointerEvent<SVGSVGElement>) => {
        if (!drawing) return;
        e.preventDefault();
        let p = point(e);
        setDraft((a) =>
            !a.length || d(a[a.length - 1], p) >= 2.5 ? [...a, p] : a,
        );
    };
    const up = () => {
        if (!drawing) return;
        setDrawing(false);
        if (draft.length < 2) {
            setDraft([]);
            return;
        }
        let a = simp(draft, step === 1 ? TOOTH_EPS : FACE_EPS);
        if (step === 1) {
            let k = firstCross(a);
            if (k >= 0) a = a.slice(0, k + 1);
            if (a.length < 5 || d(a[0], a[a.length - 1]) > CLOSE) {
                setErr(t.bad);
                setDraft([]);
                return;
            }
            a = a.slice(0, -1);
            let b = offset(a, BRUSH / 2);
            setTooth(path(b, true));
            setDraft([]);
            let xs = a.map((p) => p.x),
                ys = a.map((p) => p.y);
            setHat((h) => ({
                ...h,
                x: (Math.min(...xs) + Math.max(...xs)) / 2,
                y: Math.max(18, Math.min(...ys) - 45),
            }));
        } else {
            setFaces((v) => [...v, { d: path(a), c: color }]);
            setDraft([]);
        }
    };
    const next = () => {
        setErr("");
        if (step === 0) setStep(1);
        else if (step === 1) {
            if (!tooth) setErr(t.need);
            else setStep(2);
        } else if (step === 2) {
            if (!faces.length) setErr(t.noface);
            else setStep(3);
        } else if (step === 3) setStep(4);
    };
    const clear = () => {
        setDraft([]);
        setErr("");
        if (step === 1) setTooth("");
        if (step === 2) setFaces([]);
        if (step === 3)
            setHat({
                x: 150,
                y: 55,
                scale: 1,
                rotation: 0,
                circle: "#2B7FFF",
                body: "#123A7A",
            });
    };
    const moveHat = (x: number, y: number) =>
        setHat((h) => ({
            ...h,
            x: Math.max(15, Math.min(285, h.x + x)),
            y: Math.max(15, Math.min(285, h.y + y)),
        }));
    const scaleHat = (v: number) =>
        setHat((h) => ({ ...h, scale: Math.max(0.5, Math.min(1.8, h.scale + v)) }));
    const back = () => {
        setErr("");
        setDraft([]);
        setStep(Math.max(0, step - 1));
    };
    const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="#000"/><path d="${tooth}" fill="#fff"/>${faces.map((x) => `<path d="${x.d}" fill="none" stroke="${x.c}" stroke-width="${BRUSH}" stroke-linecap="round" stroke-linejoin="round"/>`).join("")}<g transform="translate(${hat.x} ${hat.y}) rotate(${hat.rotation}) scale(${hat.scale})"><path d="M 0 0 L -27.57 66.52 A 72 72 0 0 0 27.57 66.52 Z" fill="${hat.body}"/><circle cx="0" cy="0" r="12" fill="${hat.circle}"/></g></svg>`;
    const dl = (b: Blob, n: string) => {
        let a = document.createElement("a");
        a.href = URL.createObjectURL(b);
        a.download = n;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };
    const saveSvg = () =>
        dl(new Blob([markup], { type: "image/svg+xml" }), "happy-birthday.svg");
    const savePng = () => {
        let u = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml" })),
            im = new Image();
        im.onload = () => {
            let c = document.createElement("canvas");
            c.width = c.height = 300;
            c.getContext("2d")!.drawImage(im, 0, 0, 300, 300);
            c.toBlob((b) => {
                if (b) dl(b, "happy-birthday.png");
                URL.revokeObjectURL(u);
            }, "image/png");
        };
        im.src = u;
    };
    return (
        <main>
            <header>
                <button onClick={() => setStep(0)}>HAppy Birthday!</button>
                <div>
                    {(["zh", "en", "ja"] as const).map((x) => (
                        <button
                            className={lang === x ? "active" : ""}
                            onClick={() => setLang(x)}
                            key={x}
                        >
                            {x === "zh" ? "中" : x.toUpperCase()}
                        </button>
                    ))}
                </div>
            </header>
            <nav>
                {[t.g, t.t, t.f, t.h, t.s].map((x, i) => (
                    <span key={x}>
                        <button
                            disabled={i > step}
                            className={i === step ? "now" : ""}
                            onClick={() => i <= step && setStep(i)}
                        >
                            {i + 1}. {x}
                        </button>
                        {i < 4 && <Icon>arrow_forward</Icon>}
                    </span>
                ))}
            </nav>
            {step === 0 ? (
                <section className="guide">
                    <h1>{t.gt}</h1>
                    <p>{t.gp}</p>
                    <button className="primary" onClick={next}>
                        {t.start}
                        <Icon>arrow_forward</Icon>
                    </button>
                </section>
            ) : (
                <section className="work">
                    <svg
                        ref={svg}
                        viewBox="0 0 300 300"
                        onPointerDown={down}
                        onPointerMove={move}
                        onPointerUp={up}
                        onPointerCancel={up}
                    >
                        <rect width="300" height="300" fill="#000" />
                        {tooth && <path d={tooth} fill="#fff" />}
                        {faces.map((x, i) => (
                            <path
                                key={i}
                                d={x.d}
                                fill="none"
                                stroke={x.c}
                                strokeWidth={BRUSH}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        ))}
                        {draft.length > 1 && (
                            <path
                                d={path(simp(draft))}
                                fill="none"
                                stroke={step === 1 ? "#fff" : color}
                                strokeWidth={BRUSH}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}
                        {step >= 3 && (
                            <g
                                transform={`translate(${hat.x} ${hat.y}) rotate(${hat.rotation}) scale(${hat.scale})`}
                            >
                                <path
                                    d="M 0 0 L -27.57 66.52 A 72 72 0 0 0 27.57 66.52 Z"
                                    fill={hat.body}
                                />
                                <circle cx="0" cy="0" r="12" fill={hat.circle} />
                            </g>
                        )}
                    </svg>
                    <p>
                        {step === 1 ? t.th : step === 2 ? t.fh : step === 3 ? t.hh : t.sh}
                    </p>
                    {step === 2 && (
                        <div className="colors">
                            {(["#000000", "#2B7FFF", "#123A7A"] as Color[]).map((c) => (
                                <button
                                    aria-label={c}
                                    className={color === c ? "sel" : ""}
                                    style={{ background: c }}
                                    onClick={() => setColor(c)}
                                    key={c}
                                />
                            ))}
                        </div>
                    )}
                    {step === 3 && (
                        <div className="hat-controls">
                            <div className="hat-palette">
                                <button
                                    aria-label="hat ball blue"
                                    className={hat.circle === "#2B7FFF" ? "sel" : ""}
                                    onClick={() => setHat((h) => ({ ...h, circle: "#2B7FFF" }))}
                                >
                                    <svg viewBox="-16 -16 32 32" aria-hidden="true">
                                        <circle cx="0" cy="0" r="12" fill="#2B7FFF" />
                                    </svg>
                                </button>
                                <button
                                    aria-label="hat ball dark blue"
                                    className={hat.circle === "#123A7A" ? "sel" : ""}
                                    onClick={() => setHat((h) => ({ ...h, circle: "#123A7A" }))}
                                >
                                    <svg viewBox="-16 -16 32 32" aria-hidden="true">
                                        <circle cx="0" cy="0" r="12" fill="#123A7A" />
                                    </svg>
                                </button>
                                <button
                                    aria-label="hat cone blue"
                                    className={hat.body === "#2B7FFF" ? "sel" : ""}
                                    onClick={() => setHat((h) => ({ ...h, body: "#2B7FFF" }))}
                                >
                                    <svg viewBox="-34 -8 68 82" aria-hidden="true">
                                        <path
                                            d="M 0 0 L -27.57 66.52 A 72 72 0 0 0 27.57 66.52 Z"
                                            fill="#2B7FFF"
                                        />
                                    </svg>
                                </button>
                                <button
                                    aria-label="hat cone dark blue"
                                    className={hat.body === "#123A7A" ? "sel" : ""}
                                    onClick={() => setHat((h) => ({ ...h, body: "#123A7A" }))}
                                >
                                    <svg viewBox="-34 -8 68 82" aria-hidden="true">
                                        <path
                                            d="M 0 0 L -27.57 66.52 A 72 72 0 0 0 27.57 66.52 Z"
                                            fill="#123A7A"
                                        />
                                    </svg>
                                </button>
                            </div>
                            <div className="hat-buttons">
                                <button aria-label={t.left} onClick={() => moveHat(-8, 0)}>
                                    <Icon>arrow_back</Icon>
                                </button>
                                <button aria-label={t.up} onClick={() => moveHat(0, -8)}>
                                    <Icon>arrow_upward</Icon>
                                </button>
                                <button aria-label={t.down} onClick={() => moveHat(0, 8)}>
                                    <Icon>arrow_downward</Icon>
                                </button>
                                <button aria-label={t.right} onClick={() => moveHat(8, 0)}>
                                    <Icon>arrow_forward</Icon>
                                </button>
                                <button aria-label="-" onClick={() => scaleHat(-0.1)}>
                                    <Icon>remove</Icon>
                                </button>
                                <button aria-label="+" onClick={() => scaleHat(0.1)}>
                                    <Icon>add</Icon>
                                </button>
                                <button
                                    aria-label="rotate left"
                                    onClick={() =>
                                        setHat((h) => ({ ...h, rotation: h.rotation - 15 }))
                                    }
                                >
                                    <Icon>rotate_left</Icon>
                                </button>
                                <button
                                    aria-label="rotate right"
                                    onClick={() =>
                                        setHat((h) => ({ ...h, rotation: h.rotation + 15 }))
                                    }
                                >
                                    <Icon>rotate_right</Icon>
                                </button>
                            </div>
                        </div>
                    )}
                    {step === 4 && (
                        <div className="save">
                            <button className="primary" onClick={saveSvg}>
                                <Icon>download</Icon>
                                {t.s}
                            </button>
                            <button onClick={savePng}>
                                <Icon>image</Icon>PNG
                            </button>
                        </div>
                    )}
                    <div className="controls">
                        <button onClick={back}>
                            <Icon>arrow_back</Icon>
                            {t.back}
                        </button>
                        {step < 4 && (
                            <button onClick={clear}>
                                <Icon>delete</Icon>
                                {t.clear}
                            </button>
                        )}
                        {step < 4 && (
                            <button className="primary" onClick={next}>
                                {t.next}
                                <Icon>arrow_forward</Icon>
                            </button>
                        )}
                    </div>
                    {err && <div className="error">{err}</div>}
                </section>
            )}
            <footer>\歯ッピーバースデー！/</footer>
        </main>
    );
}
