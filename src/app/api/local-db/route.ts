import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (process.env.USE_LOCAL_DB !== "true") {
    return NextResponse.json({ error: "Local DB not enabled" }, { status: 403 });
  }

  // Dynamic import to avoid loading SQLite in production
  const { createLocalClient } = await import("@/lib/local-db/client");
  const client = createLocalClient();

  const body = await request.json();
  const { action, table, data, filters, orderCol, orderAsc, limit } = body;

  const tableClient = client.from(table);

  if (action === "select") {
    let query = tableClient.select("*");
    if (filters) {
      for (const [key, val] of Object.entries(filters)) {
        if (key.endsWith("__in")) {
          query = query.in(key.replace("__in", ""), val as unknown[]);
        } else if (key.endsWith("__gte")) {
          query = query.gte(key.replace("__gte", ""), val);
        } else {
          query = query.eq(key, val);
        }
      }
    }
    if (orderCol) {
      query = query.order(orderCol, { ascending: orderAsc });
    }
    if (limit) {
      query = query.limit(limit);
    }

    if (limit === 1) {
      const result = await query.single();
      return NextResponse.json({ data: result.data ? [result.data] : [] });
    }

    // Use Promise wrapper since our QueryBuilder uses .then()
    const result = await new Promise<{ data: unknown[] }>((resolve) => {
      query.then((r: unknown) => resolve(r as { data: unknown[] }));
    });
    return NextResponse.json({ data: result.data || [] });
  }

  if (action === "insert") {
    const result = tableClient.insert(data).select().single();
    return NextResponse.json(result);
  }

  if (action === "update") {
    let query = tableClient.update(data);
    if (filters) {
      for (const [key, val] of Object.entries(filters)) {
        query = query.eq(key, val);
      }
    }
    const result = await new Promise<{ data: unknown; error: unknown }>(
      (resolve) => {
        query.then((r: unknown) => resolve(r as { data: unknown; error: unknown }));
      }
    );
    return NextResponse.json(result);
  }

  if (action === "delete") {
    let query = tableClient.delete();
    if (filters) {
      for (const [key, val] of Object.entries(filters)) {
        query = query.eq(key, val);
      }
    }
    await new Promise<void>((resolve) => {
      query.then(() => resolve());
    });
    return NextResponse.json({ error: null });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
