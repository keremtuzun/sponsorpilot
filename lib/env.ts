// Env values set from Windows shells can arrive with a leading UTF-8 BOM
// (U+FEFF) or stray whitespace, which breaks HTTP header construction in the
// Gemini SDK. Always read env vars through this helper.
const BOM_OR_SPACE = new RegExp("^[\\uFEFF\\s]+|[\\uFEFF\\s]+$", "g");

export function env(name: string): string | undefined {
  const v = process.env[name];
  if (!v) return undefined;
  const clean = v.replace(BOM_OR_SPACE, "");
  return clean || undefined;
}
