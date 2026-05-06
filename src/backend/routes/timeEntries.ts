import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../../db/client.ts";
import { projects, timeEntries } from "../../db/schema.ts";
import { adminOnly } from "./middleware.ts";

export const timeEntriesRoutes = new Hono();

function numberValue(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function recalculateProjectHours(projectId: number) {
  const entries = await db.select().from(timeEntries).where(eq(timeEntries.projectId, projectId));
  const loggedHours = entries.reduce((sum, entry) => sum + numberValue(entry.hours), 0);

  await db
    .update(projects)
    .set({ loggedHours: loggedHours.toFixed(2) })
    .where(eq(projects.id, projectId));
}

timeEntriesRoutes.get("/", adminOnly, async (c) => {
  try {
    const allTimeEntries = await db.select().from(timeEntries);
    return c.json(allTimeEntries);
  } catch (err) {
    console.error("Get time entries error:", err);
    return c.json({ error: "Failed to fetch time entries" }, 500);
  }
});

timeEntriesRoutes.get("/project/:projectId", adminOnly, async (c) => {
  try {
    const projectId = Number(c.req.param("projectId"));
    if (Number.isNaN(projectId)) return c.json({ error: "Invalid project ID" }, 400);

    const entries = await db.select().from(timeEntries).where(eq(timeEntries.projectId, projectId));
    return c.json(entries);
  } catch (err) {
    console.error("Get project time entries error:", err);
    return c.json({ error: "Failed to fetch time entries" }, 500);
  }
});

timeEntriesRoutes.get("/:id", adminOnly, async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (Number.isNaN(id)) return c.json({ error: "Invalid time entry ID" }, 400);

    const [entry] = await db.select().from(timeEntries).where(eq(timeEntries.id, id)).limit(1);
    if (!entry) return c.json({ error: "Time entry not found" }, 404);

    return c.json(entry);
  } catch (err) {
    console.error("Get time entry error:", err);
    return c.json({ error: "Failed to fetch time entry" }, 500);
  }
});

timeEntriesRoutes.post("/", adminOnly, async (c) => {
  try {
    const body = await c.req.json();
    const projectId = Number(body.projectId);
    const date = new Date(String(body.date || ""));
    const hours = numberValue(body.hours);
    const notes = body.notes === undefined || body.notes === null ? null : String(body.notes);

    if (Number.isNaN(projectId)) return c.json({ error: "Invalid project ID" }, 400);
    if (Number.isNaN(date.getTime())) return c.json({ error: "Invalid date" }, 400);
    if (hours <= 0) return c.json({ error: "Hours must be a positive number" }, 400);

    const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    if (!project) return c.json({ error: "Project not found" }, 404);

    const [newTimeEntry] = await db
      .insert(timeEntries)
      .values({
        projectId,
        date,
        hours: hours.toFixed(2),
        notes,
      })
      .returning();

    await recalculateProjectHours(projectId);
    return c.json(newTimeEntry, 201);
  } catch (err) {
    console.error("Create time entry error:", err);
    return c.json({ error: "Failed to create time entry" }, 500);
  }
});

timeEntriesRoutes.put("/:id", adminOnly, async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (Number.isNaN(id)) return c.json({ error: "Invalid time entry ID" }, 400);

    const [existing] = await db.select().from(timeEntries).where(eq(timeEntries.id, id)).limit(1);
    if (!existing) return c.json({ error: "Time entry not found" }, 404);

    const body = await c.req.json();
    const projectId = body.projectId === undefined ? existing.projectId : Number(body.projectId);
    const date = body.date === undefined ? existing.date : new Date(String(body.date));
    const hours = body.hours === undefined ? numberValue(existing.hours) : numberValue(body.hours);
    const notes = body.notes === undefined ? existing.notes : body.notes === null ? null : String(body.notes);

    if (Number.isNaN(projectId)) return c.json({ error: "Invalid project ID" }, 400);
    if (Number.isNaN(date.getTime())) return c.json({ error: "Invalid date" }, 400);
    if (hours <= 0) return c.json({ error: "Hours must be a positive number" }, 400);

    const [updatedEntry] = await db
      .update(timeEntries)
      .set({
        projectId,
        date,
        hours: hours.toFixed(2),
        notes,
        updatedAt: new Date(),
      })
      .where(eq(timeEntries.id, id))
      .returning();

    await recalculateProjectHours(existing.projectId);
    if (existing.projectId !== projectId) await recalculateProjectHours(projectId);

    return c.json(updatedEntry);
  } catch (err) {
    console.error("Update time entry error:", err);
    return c.json({ error: "Failed to update time entry" }, 500);
  }
});

timeEntriesRoutes.delete("/:id", adminOnly, async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (Number.isNaN(id)) return c.json({ error: "Invalid time entry ID" }, 400);

    const [entry] = await db.select().from(timeEntries).where(eq(timeEntries.id, id)).limit(1);
    if (!entry) return c.json({ error: "Time entry not found" }, 404);

    await db.delete(timeEntries).where(eq(timeEntries.id, id));
    await recalculateProjectHours(entry.projectId);

    return c.json({ success: true });
  } catch (err) {
    console.error("Delete time entry error:", err);
    return c.json({ error: "Failed to delete time entry" }, 500);
  }
});
