import { readdirSync, statSync, rmSync } from "node:fs";
import { join, extname } from "node:path";

// =========================
// CONFIGURATION
// =========================

// Input & output directories
const SRC_DIR = "./resources" as const;
const OUT_DIR = "./static" as const;

// List of files or folders to ignore in source scan
const IGNORE_LIST = ["utils", "images", "test.ts", "draft.js"] as const;

// Allowed extensions for entrypoints
const ALLOWED_EXTENSIONS = [".ts", ".js"] as const;

// Items to keep when cleaning output
const CLEAN_IGNORE = ["lib", "css"] as const;

// =========================
// UTILITY FUNCTIONS
// =========================

/**
 * Recursively get all files except ignored ones.
 */
function getAllFiles(dir: string): string[] {
	const results: string[] = [];

	for (const file of readdirSync(dir)) {
		if ((IGNORE_LIST as readonly string[]).includes(file)) continue;

		const fullPath: string = join(dir, file);
		const stats = statSync(fullPath);

		if (stats.isDirectory()) {
			results.push(...getAllFiles(fullPath));
		} else {
			const ext = extname(fullPath) as
				| (typeof ALLOWED_EXTENSIONS)[number]
				| string;
			if ((ALLOWED_EXTENSIONS as readonly string[]).includes(ext)) {
				results.push(fullPath);
			}
		}
	}

	return results;
}

/**
 * Clean a directory but keep certain files/folders.
 */
function cleanDirExcept(dir: string, keepList: readonly string[]): void {
	for (const item of readdirSync(dir)) {
		if (keepList.includes(item)) continue; // skip items we want to keep

		rmSync(join(dir, item), { recursive: true, force: true });
	}
}

// =========================
// MAIN BUILD SCRIPT
// =========================

const init = async (): Promise<void> => {
	// 1. Clear output folder except ignored items
	try {
		cleanDirExcept(OUT_DIR, CLEAN_IGNORE);
	} catch {
		// Folder might not exist yet, that's fine
	}

	// 2. Auto-pick all resource files
	const entrypoints = getAllFiles(SRC_DIR);

	console.log("📦 Building files:", entrypoints);

	// 3. Build with Bun
	await Bun.build({
		entrypoints,
		naming: "[dir]/[name].min.[ext]",
		outdir: OUT_DIR,
		target: "browser",
		minify: true,
		sourcemap: "external",
	});

	console.log("✅ Build complete!");
};

init();
