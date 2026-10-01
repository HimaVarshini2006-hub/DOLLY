import { fal } from "@fal-ai/client";
import { PRESETS } from "@/lib/presets";
// Verify the current model id in fal.ai's catalog before launch.
const MODEL = "fal-ai/kling-video/v1.6/standard/image-to-video";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Request body must be a JSON object." }, { status: 400 });
  }

  const { image, prompt, presetId, duration } = body as {
    image?: unknown;
    prompt?: unknown;
    presetId?: unknown;
    duration?: unknown;
  };
  const preset = PRESETS.find((p) => p.id === presetId);
  if (typeof image !== "string" || !image || !preset || (prompt !== undefined && typeof prompt !== "string") || (duration !== undefined && duration !== 5 && duration !== 10)) {
    return Response.json({ error: "Image, move, prompt, or duration is invalid." }, { status: 400 });
  }
  // No key set: tell the client to use the simulated render so the demo never dead-ends.
  if (!process.env.FAL_KEY) return Response.json({ mock: true });
  fal.config({ credentials: process.env.FAL_KEY });
  try {
    const { request_id } = await fal.queue.submit(MODEL, {
      input: {
        image_url: image,
        prompt: `${prompt || ""}. Camera: ${preset.model}.`,
        duration: (duration === 10 ? "10" : "5") as "5" | "10",
      },
    });
    return Response.json({ id: request_id });
  } catch {
    return Response.json({ error: "Video generation is temporarily unavailable." }, { status: 502 });
  }
}