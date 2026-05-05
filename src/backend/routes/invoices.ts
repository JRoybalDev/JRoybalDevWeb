import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../../db/client";
import { invoices, projects } from "../../db/schema";
import { adminOnly } from "./middleware";

export const invoicesRoutes = new Hono();

function numberValue(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function recalculateProjectInvoices(projectId: number) {
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project) return;

  const projectInvoices = await db.select().from(invoices).where(eq(invoices.projectId, projectId));
  const amountInvoiced = projectInvoices
    .filter((invoice) => invoice.status !== "Cancelled")
    .reduce((sum, invoice) => sum + numberValue(invoice.amount), 0);
  const amountOutstanding = Math.max(0, numberValue(project.contractValue) - amountInvoiced);

  await db
    .update(projects)
    .set({
      amountInvoiced: amountInvoiced.toFixed(2),
      amountOutstanding: amountOutstanding.toFixed(2),
    })
    .where(eq(projects.id, projectId));
}

function parseInvoicePayload(body: Record<string, unknown>) {
  const projectId = Number(body.projectId);
  const amount = numberValue(body.amount);
  const dueDate = new Date(String(body.dueDate || ""));
  const paidAt = body.paidAt ? new Date(String(body.paidAt)) : null;

  return {
    projectId,
    amount,
    dueDate,
    paidAt,
    status: String(body.status || "Pending") as "Pending" | "Paid" | "Overdue" | "Cancelled",
    notes: body.notes === undefined || body.notes === null ? null : String(body.notes),
  };
}

invoicesRoutes.get("/", adminOnly, async (c) => {
  try {
    const allInvoices = await db.select().from(invoices);
    return c.json(allInvoices);
  } catch (err) {
    console.error("Get invoices error:", err);
    return c.json({ error: "Failed to fetch invoices" }, 500);
  }
});

invoicesRoutes.get("/project/:projectId", adminOnly, async (c) => {
  try {
    const projectId = Number(c.req.param("projectId"));
    if (Number.isNaN(projectId)) return c.json({ error: "Invalid project ID" }, 400);

    const projectInvoices = await db.select().from(invoices).where(eq(invoices.projectId, projectId));
    return c.json(projectInvoices);
  } catch (err) {
    console.error("Get project invoices error:", err);
    return c.json({ error: "Failed to fetch invoices" }, 500);
  }
});

invoicesRoutes.get("/:id", adminOnly, async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (Number.isNaN(id)) return c.json({ error: "Invalid invoice ID" }, 400);

    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
    if (!invoice) return c.json({ error: "Invoice not found" }, 404);

    return c.json(invoice);
  } catch (err) {
    console.error("Get invoice error:", err);
    return c.json({ error: "Failed to fetch invoice" }, 500);
  }
});

invoicesRoutes.post("/", adminOnly, async (c) => {
  try {
    const body = await c.req.json();
    const payload = parseInvoicePayload(body);

    if (Number.isNaN(payload.projectId)) return c.json({ error: "Invalid project ID" }, 400);
    if (payload.amount <= 0) return c.json({ error: "Amount must be a positive number" }, 400);
    if (Number.isNaN(payload.dueDate.getTime())) return c.json({ error: "Invalid due date" }, 400);

    const [project] = await db.select().from(projects).where(eq(projects.id, payload.projectId)).limit(1);
    if (!project) return c.json({ error: "Project not found" }, 404);

    const [newInvoice] = await db
      .insert(invoices)
      .values({
        projectId: payload.projectId,
        amount: payload.amount.toFixed(2),
        status: payload.status,
        dueDate: payload.dueDate,
        paidAt: payload.status === "Paid" ? payload.paidAt || new Date() : payload.paidAt,
        notes: payload.notes,
      })
      .returning();

    await recalculateProjectInvoices(payload.projectId);
    return c.json(newInvoice, 201);
  } catch (err) {
    console.error("Create invoice error:", err);
    return c.json({ error: "Failed to create invoice" }, 500);
  }
});

invoicesRoutes.put("/:id", adminOnly, async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (Number.isNaN(id)) return c.json({ error: "Invalid invoice ID" }, 400);

    const [existing] = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
    if (!existing) return c.json({ error: "Invoice not found" }, 404);

    const body = await c.req.json();
    const payload = parseInvoicePayload({ ...existing, ...body });
    if (Number.isNaN(payload.projectId)) return c.json({ error: "Invalid project ID" }, 400);
    if (payload.amount <= 0) return c.json({ error: "Amount must be a positive number" }, 400);
    if (Number.isNaN(payload.dueDate.getTime())) return c.json({ error: "Invalid due date" }, 400);

    const [updatedInvoice] = await db
      .update(invoices)
      .set({
        projectId: payload.projectId,
        amount: payload.amount.toFixed(2),
        status: payload.status,
        dueDate: payload.dueDate,
        paidAt: payload.status === "Paid" ? payload.paidAt || existing.paidAt || new Date() : payload.paidAt,
        notes: payload.notes,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, id))
      .returning();

    await recalculateProjectInvoices(existing.projectId);
    if (existing.projectId !== payload.projectId) await recalculateProjectInvoices(payload.projectId);

    return c.json(updatedInvoice);
  } catch (err) {
    console.error("Update invoice error:", err);
    return c.json({ error: "Failed to update invoice" }, 500);
  }
});

invoicesRoutes.patch("/:id/paid", adminOnly, async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (Number.isNaN(id)) return c.json({ error: "Invalid invoice ID" }, 400);

    const [existing] = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
    if (!existing) return c.json({ error: "Invoice not found" }, 404);

    const [updatedInvoice] = await db
      .update(invoices)
      .set({ status: "Paid", paidAt: existing.paidAt || new Date(), updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();

    await recalculateProjectInvoices(existing.projectId);
    return c.json(updatedInvoice);
  } catch (err) {
    console.error("Mark paid error:", err);
    return c.json({ error: "Failed to mark invoice as paid" }, 500);
  }
});

invoicesRoutes.delete("/:id", adminOnly, async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (Number.isNaN(id)) return c.json({ error: "Invalid invoice ID" }, 400);

    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
    if (!invoice) return c.json({ error: "Invoice not found" }, 404);

    await db.delete(invoices).where(eq(invoices.id, id));
    await recalculateProjectInvoices(invoice.projectId);

    return c.json({ success: true });
  } catch (err) {
    console.error("Delete invoice error:", err);
    return c.json({ error: "Failed to delete invoice" }, 500);
  }
});
