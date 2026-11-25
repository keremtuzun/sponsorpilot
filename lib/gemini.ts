import { GoogleGenAI } from "@google/genai";
import { env } from "./env";

// Gemini under load either sheds with 503/429 (fails in ~1s) or goes very slow.
// Each attempt gets a hard timeout, then we move to the fallback model, so one
// degraded model can't eat the whole function budget.
const RETRYABLE = /503|UNAVAILABLE|429|RESOURCE_EXHAUSTED|overloaded|high demand|abort/i;
const ATTEMPT_TIMEOUT_MS = 50_000;

export async function generateResilient(
  ai: GoogleGenAI,
  params: { contents: string; config: Record<string, unknown> }
) {
  const primary = env("GEMINI_MODEL") || "gemini-3.5-flash";
  const fallback = env("GEMINI_FALLBACK_MODEL") || "gemini-2.5-flash";
  const plan = [primary, ...(fallback !== primary ? [fallback] : [primary])];

  let lastErr: unknown;
  for (let i = 0; i < plan.length; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS);
    try {
      return await ai.models.generateContent({
        model: plan[i],
        contents: params.contents,
        config: {
          ...params.config,
          ...(/2\.5/.test(plan[i]) ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
          abortSignal: controller.signal,
        },
      });
    } catch (e) {
      lastErr = e;
      if (!RETRYABLE.test(String(e))) throw e;
      console.warn(`[sponsorpilot:gemini] ${plan[i]} failed (attempt ${i + 1}/${plan.length}): ${String(e).slice(0, 120)}`);
      await new Promise((r) => setTimeout(r, 800));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr;
}
