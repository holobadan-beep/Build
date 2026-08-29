export interface FileIconSpec {
  label: string; // short glyph shown inside the icon badge (2-3 chars max)
  color: string; // badge background color
}

const EXTENSION_MAP: Record<string, FileIconSpec> = {
  ".js": { label: "JS", color: "#f7df1e" },
  ".jsx": { label: "JSX", color: "#61dafb" },
  ".ts": { label: "TS", color: "#3178c6" },
  ".tsx": { label: "TSX", color: "#3178c6" },
  ".py": { label: "PY", color: "#3776ab" },
  ".java": { label: "JV", color: "#ea2d2e" },
  ".kt": { label: "KT", color: "#a97bff" },
  ".swift": { label: "SW", color: "#f05138" },
  ".go": { label: "GO", color: "#00add8" },
  ".rs": { label: "RS", color: "#dea584" },
  ".cpp": { label: "C++", color: "#00599c" },
  ".c": { label: "C", color: "#a8b9cc" },
  ".h": { label: "H", color: "#a8b9cc" },
  ".php": { label: "PHP", color: "#777bb4" },
  ".rb": { label: "RB", color: "#cc342d" },
  ".dart": { label: "DT", color: "#0175c2" },
  ".html": { label: "<>", color: "#e34c26" },
  ".css": { label: "CSS", color: "#264de4" },
  ".scss": { label: "SCS", color: "#cc6699" },
  ".json": { label: "{}", color: "#cbcb41" },
  ".xml": { label: "XML", color: "#e37933" },
  ".yaml": { label: "YML", color: "#cb171e" },
  ".yml": { label: "YML", color: "#cb171e" },
  ".md": { label: "MD", color: "#8a8a8a" },
  ".sql": { label: "SQL", color: "#e38c00" },
  ".sh": { label: "SH", color: "#4eaa25" },
  ".bash": { label: "SH", color: "#4eaa25" },
  ".ps1": { label: "PS", color: "#012456" },
  ".vue": { label: "VUE", color: "#41b883" },
  ".svelte": { label: "SV", color: "#ff3e00" }
};

const SPECIAL_FILES: Record<string, FileIconSpec> = {
  "package.json": { label: "PKG", color: "#cb3837" },
  "package-lock.json": { label: "PKG", color: "#cb3837" },
  "yarn.lock": { label: "YRN", color: "#2c8ebb" },
  "pnpm-lock.yaml": { label: "PNP", color: "#f69220" },
  Dockerfile: { label: "DKR", color: "#2496ed" },
  "docker-compose.yml": { label: "DKR", color: "#2496ed" },
  ".gitignore": { label: "GIT", color: "#f05032" },
  ".gitattributes": { label: "GIT", color: "#f05032" },
  ".env": { label: "ENV", color: "#ecd53f" },
  "README.md": { label: "MD", color: "#8a8a8a" },
  LICENSE: { label: "LIC", color: "#8a8a8a" },
  Makefile: { label: "MAK", color: "#8a8a8a" }
};

const FOLDER_ICON: FileIconSpec = { label: "DIR", color: "#dcb67a" };
const DEFAULT_ICON: FileIconSpec = { label: "TXT", color: "#8a8a8a" };

export function getFileIcon(fileName: string, isDirectory: boolean): FileIconSpec {
  if (isDirectory) return FOLDER_ICON;
  if (SPECIAL_FILES[fileName]) return SPECIAL_FILES[fileName];
  const ext = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")).toLowerCase() : "";
  return EXTENSION_MAP[ext] || DEFAULT_ICON;
}
