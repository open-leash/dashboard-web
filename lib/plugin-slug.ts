const aliases: Record<string, string> = {
  "blast radius": "blast-radius",
  "prompt-compression": "token-saver",
  "prompt compression": "token-saver",
  "token-compression": "token-saver",
  "token compression": "token-saver",
  "token saver": "token-saver",
  dlp: "data-leakage-prevention"
};

export function canonicalPluginSlug(value: unknown, fallback = "openleash-core") {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  if (raw.toLowerCase() === "openleash.core") return "openleash-core";
  const slug = raw.replace(/^openleash\./i, "").toLowerCase();
  return aliases[slug] ?? slug.replace(/[\s_]+/g, "-");
}
