// logger.ts
// Dependency-free console logger with colored, formatted output.
// Works in Node.js and Bun. Falls back to plain text when colors aren't supported.

type LogLevel = "trace" | "debug" | "info" | "success" | "warn" | "error" | "silent";

const LEVEL_ORDER: Record<LogLevel, number> = {
    trace: 10,
    debug: 20,
    info: 30,
    success: 35,
    warn: 40,
    error: 50,
    silent: 100,
};

export interface LoggerOptions {
    level?: LogLevel;
    forceColor?: boolean | null; // true = force colors, false = disable, null = auto-detect
    timeFormat?: "iso" | "locale" | "short";
    showLevel?: boolean;
    showTimestamp?: boolean;
}

const defaultOpts: Required<LoggerOptions> = {
    level: "debug",
    forceColor: null,
    timeFormat: "iso",
    showLevel: true,
    showTimestamp: true,
};

function supportsColorAuto(): boolean {
    // Basic color support detection without external libs.
    // Honours NO_COLOR and FORCE_COLOR, checks TTY and TERM.
    const env = process.env as Record<string, string | undefined>;

    if (env.NO_COLOR !== undefined) return false;
    if (env.FORCE_COLOR !== undefined) {
        const v = env.FORCE_COLOR;
        if (v === "0" || v.toLowerCase() === "false") return false;
        return true;
    }

    if (typeof (process.stdout as any).isTTY === "boolean" && !(process.stdout as any).isTTY) {
        // Not an interactive terminal; colors may be disabled in many CI environments.
        return false;
    }

    const term = env.TERM ?? "";
    const colorterm = env.COLORTERM ?? "";

    // Common TERM values that support colors
    if (/^xterm|^screen|^vt100|color|ansi|cygwin|linux/i.test(term)) return true;
    if (/^truecolor|^24bit|^yes/i.test(colorterm)) return true;

    // fallback: try to enable for most modern terminals
    return true;
}

// ANSI helpers
const ANSI = {
    reset: "\u001b[0m",
    bold: "\u001b[1m",
    dim: "\u001b[2m",
    italic: "\u001b[3m",
    underline: "\u001b[4m",
    // Foreground colors (nice readable palette)
    fg: {
        black: "\u001b[30m",
        red: "\u001b[31m",
        green: "\u001b[32m",
        yellow: "\u001b[33m",
        blue: "\u001b[34m",
        magenta: "\u001b[35m",
        cyan: "\u001b[36m",
        white: "\u001b[37m",
        brightBlack: "\u001b[90m",
        brightRed: "\u001b[91m",
        brightGreen: "\u001b[92m",
        brightYellow: "\u001b[93m",
        brightBlue: "\u001b[94m",
        brightMagenta: "\u001b[95m",
        brightCyan: "\u001b[96m",
        brightWhite: "\u001b[97m",
    },
};

function colorWrap(enabled: boolean, color: string, text: string): string {
    return enabled ? `${color}${text}${ANSI.reset}` : text;
}

function padRight(s: string, n: number) {
    return s.length >= n ? s : s + " ".repeat(n - s.length);
}

export class Logger {
    private opts: Required<LoggerOptions>;
    private colorEnabled: boolean;

    constructor(opts?: LoggerOptions) {
        this.opts = { ...defaultOpts, ...(opts ?? {}) };
        if (this.opts.forceColor === true) this.colorEnabled = true;
        else if (this.opts.forceColor === false) this.colorEnabled = false;
        else this.colorEnabled = supportsColorAuto();
    }

    setLevel(level: LogLevel) {
        this.opts.level = level;
    }

    enableColor(enable: boolean) {
        this.colorEnabled = enable;
    }

    private shouldLog(level: LogLevel) {
        return LEVEL_ORDER[level] >= LEVEL_ORDER[this.opts.level];
    }

    private timeString() {
        if (!this.opts.showTimestamp) return "";
        const now = new Date();
        switch (this.opts.timeFormat) {
            case "iso":
                return now.toISOString();
            case "locale":
                return now.toLocaleString();
            case "short":
                return now.toTimeString().split(" ")[0];
            default:
                return now.toISOString();
        }
    }

    private format(level: LogLevel, msg: string) {
        const ts = this.timeString();
        const showLevel = this.opts.showLevel;
        const parts: string[] = [];

        if (ts) parts.push(colorWrap(this.colorEnabled, ANSI.dim, `[${ts}]`));
        if (showLevel) {
            const label = padRight(level.toUpperCase(), 7);
            let coloredLabel = label;
            switch (level) {
                case "trace":
                    coloredLabel = colorWrap(this.colorEnabled, ANSI.fg.brightBlack, label);
                    break;
                case "debug":
                    coloredLabel = colorWrap(this.colorEnabled, ANSI.fg.cyan, label);
                    break;
                case "info":
                    coloredLabel = colorWrap(this.colorEnabled, ANSI.fg.blue, label);
                    break;
                case "success":
                    coloredLabel = colorWrap(this.colorEnabled, ANSI.fg.green, label);
                    break;
                case "warn":
                    coloredLabel = colorWrap(this.colorEnabled, ANSI.fg.yellow, label);
                    break;
                case "error":
                    coloredLabel = colorWrap(this.colorEnabled, ANSI.fg.red, label);
                    break;
            }
            parts.push(coloredLabel);
        }

        parts.push(msg);
        return parts.join(" ");
    }

    private output(level: LogLevel, ...args: any[]) {
        if (!this.shouldLog(level)) return;
        try {
            const text = args.map((a) => (typeof a === "string" ? a : safeInspect(a))).join(" ");
            const final = this.format(level, text);
            if (level === "error") {
                console.error(final);
            } else if (level === "warn") {
                console.warn(final);
            } else {
                console.log(final);
            }
        } catch (err) {
            // ensure logger never throws
            console.log(`[logger error] ${(err as Error).message}`);
        }
    }

    trace(...args: any[]) {
        this.output("trace", ...args);
    }
    debug(...args: any[]) {
        this.output("debug", ...args);
    }
    info(...args: any[]) {
        this.output("info", ...args);
    }
    success(...args: any[]) {
        this.output("success", ...args);
    }
    warn(...args: any[]) {
        this.output("warn", ...args);
    }
    error(...args: any[]) {
        this.output("error", ...args);
    }
}

// safe stringify/inspect for objects (without relying on util.inspect for portability)
function safeInspect(obj: any, depth = 2): string {
    try {
        if (obj === null) return "null";
        if (obj === undefined) return "undefined";
        if (typeof obj === "string") return obj;
        if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
        if (obj instanceof Error) {
            return `${obj.name}: ${obj.message}\n${obj.stack ?? ""}`;
        }
        // For structured data, try JSON.stringify with replacer to avoid cycles
        const seen = new WeakSet();
        const str = JSON.stringify(
            obj,
            (_, v) => {
                if (v && typeof v === "object") {
                    if (seen.has(v)) return "[Circular]";
                    seen.add(v);
                }
                return v;
            },
            2
        );
        return str ?? String(obj);
    } catch {
        try {
            return String(obj);
        } catch {
            return "[unserializable]";
        }
    }
}

// Export a default singleton logger configured from env (optional)
const logger = new Logger({
    level: (process.env.LOG_LEVEL as LogLevel) ?? defaultOpts.level,
    forceColor: process.env.FORCE_COLOR ? (process.env.FORCE_COLOR !== "0") : null,
    timeFormat: "iso",
    showLevel: true,
    showTimestamp: true,
});

export default logger;
