import { fal } from "@fal-ai/client";
const MODEL = "fal-ai/kling-video/v1.6/standard/image-to-video";

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id || !process.env.FAL_KEY) return Response.json({ error: "Bad request" }, { status: 400 });
  fal.config({ credentials: process.env.FAL_KEY });
  const s = await fal.queue.status(MODEL, { requestId: id });
  if (s.status !== "COMPLETED") return Response.json({ status: s.status });
  const r: any = await fal.queue.result(MODEL, { requestId: id });
  return Response.json({ status: "COMPLETED", video: r.data?.video?.url });
}
