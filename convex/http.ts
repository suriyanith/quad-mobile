import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const KINDS = ["connected", "plan_confirmed", "proactive", "session_ready", "note"] as const;
type Kind = (typeof KINDS)[number];

const reply = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

const http = httpRouter();

/**
 * POST /quad/event — the Quad server pushes "what your agent did" into the app's live feed.
 * Header: x-quad-secret: <QUAD_EVENT_SECRET>
 * Body:   { type, studentId, title, body?, at? }
 */
http.route({
  path: "/quad/event",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const secret = process.env.QUAD_EVENT_SECRET;
    if (!secret) return reply(500, { ok: false, error: "QUAD_EVENT_SECRET is not set" });
    if (req.headers.get("x-quad-secret") !== secret) return reply(401, { ok: false, error: "unauthorized" });

    let payload: Record<string, unknown>;
    try {
      payload = (await req.json()) as Record<string, unknown>;
    } catch {
      return reply(400, { ok: false, error: "body must be JSON" });
    }
    const { type, studentId, title, body, at } = payload ?? {};
    if (typeof type !== "string" || !KINDS.includes(type as Kind)) {
      return reply(400, { ok: false, error: `type must be one of: ${KINDS.join(", ")}` });
    }
    if (typeof studentId !== "string" || !studentId) return reply(400, { ok: false, error: "studentId required" });
    if (typeof title !== "string" || !title) return reply(400, { ok: false, error: "title required" });
    if (body !== undefined && typeof body !== "string") return reply(400, { ok: false, error: "body must be a string" });

    // `at` may be epoch milliseconds or an ISO date string; defaults to now.
    let when = Date.now();
    if (typeof at === "number" && Number.isFinite(at)) when = at;
    else if (typeof at === "string" && !Number.isNaN(Date.parse(at))) when = Date.parse(at);
    else if (at !== undefined && at !== null) return reply(400, { ok: false, error: "at must be epoch ms or an ISO date" });

    const id = await ctx.runMutation(internal.activity.add, {
      studentId,
      kind: type as Kind,
      title: title.slice(0, 200),
      body: (body ?? "").slice(0, 2000),
      at: when,
    });
    return reply(200, { ok: true, id });
  }),
});

export default http;
