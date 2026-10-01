import { fal } from "@fal-ai/client";
import { PRESETS } from "@/lib/presets";
// Verify the current model id in fal.ai's catalog before launch.
const MODEL = "fal-ai/kling-video/v1.6/standard/image-to-video";

export async function POST(req: Request) {
  const { image, prompt, presetId, duration } = await req.json();
  const preset = PRESETS.find((p) => p.id === presetId);
  if (!image || !preset) return Response.json({ error: "Missing image or move." }, { status: 400 });
  // No key set: tell the client to use the simulated render so the demo never dead-ends.
  if (!process.env.FAL_KEY) return Response.json({ mock: true });
  fal.config({ credentials: process.env.FAL_KEY });
  try {
    const { request_id } = await fal.queue.submit(MODEL, {
      input: { image_url: image, prompt: `${prompt || ""}. Camera: ${preset.model}.`, duration: String(duration) },
    });
    return Response.json({ id: request_id });
  } catch {
    return Response.json({ mock: true });
  }
}
