import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Use local SQLite DB for development
  if (process.env.NEXT_PUBLIC_USE_LOCAL_DB === "true") {
    // In local mode, all DB calls go through API routes (which use server-side local client).
    // The browser client is only used for auth + direct queries from client components.
    // We return a minimal mock that delegates to fetch-based API calls.
    return createLocalBrowserClient() as ReturnType<typeof createBrowserClient>;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function createLocalBrowserClient() {
  const LOCAL_USER = {
    id: "local-dev-user",
    email: "dev@pagecraft.local",
    user_metadata: { full_name: "Local Developer" },
  };

  return {
    auth: {
      getUser: async () => ({ data: { user: LOCAL_USER }, error: null }),
      signInWithPassword: async () => {
        window.location.href = "/dashboard";
        return { data: { user: LOCAL_USER }, error: null };
      },
      signUp: async () => {
        window.location.href = "/dashboard";
        return { data: { user: LOCAL_USER }, error: null };
      },
      signInWithOAuth: async () => {
        window.location.href = "/dashboard";
        return { data: { url: "/dashboard" }, error: null };
      },
      signOut: async () => {
        window.location.href = "/";
        return { error: null };
      },
    },
    from: (table: string) => createLocalTableProxy(table),
  };
}

// Proxy that makes fetch calls to /api/local-db for browser-side queries
function createLocalTableProxy(table: string) {
  const buildQuery = () => {
    let filters: Record<string, unknown> = {};
    let orderCol = "";
    let orderAsc = true;
    let limitN: number | undefined;

    const chain = {
      select: () => chain,
      eq: (col: string, val: unknown) => { filters[col] = val; return chain; },
      in: (col: string, vals: unknown[]) => { filters[`${col}__in`] = vals; return chain; },
      gte: (col: string, val: unknown) => { filters[`${col}__gte`] = val; return chain; },
      order: (col: string, opts?: { ascending?: boolean }) => {
        orderCol = col;
        orderAsc = opts?.ascending ?? true;
        return chain;
      },
      limit: (n: number) => { limitN = n; return chain; },
      single: async () => {
        const res = await fetch("/api/local-db", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "select", table, filters, orderCol, orderAsc, limit: 1 }),
        });
        const { data } = await res.json();
        return { data: data?.[0] || null, error: null };
      },
      then: async (resolve: (v: unknown) => void) => {
        const res = await fetch("/api/local-db", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "select", table, filters, orderCol, orderAsc, limit: limitN }),
        });
        const result = await res.json();
        resolve(result);
      },
    };
    return chain;
  };

  const mutate = (action: string) => (data: unknown) => {
    let filters: Record<string, unknown> = {};
    const chain = {
      select: () => chain,
      eq: (col: string, val: unknown) => { filters[col] = val; return chain; },
      single: async () => {
        const res = await fetch("/api/local-db", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, table, data, filters }),
        });
        return res.json();
      },
      then: async (resolve: (v: unknown) => void) => {
        const res = await fetch("/api/local-db", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, table, data, filters }),
        });
        resolve(await res.json());
      },
    };
    return chain;
  };

  return {
    select: buildQuery().select,
    insert: mutate("insert"),
    update: mutate("update"),
    delete: () => mutate("delete")(null),
    upsert: mutate("upsert"),
  };
}
