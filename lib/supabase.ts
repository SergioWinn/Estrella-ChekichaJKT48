type OrderDirection = "asc" | "desc";

interface SelectOptions {
  filters?: Record<string, string | number | boolean>;
  orderBy?: string;
  orderDirection?: OrderDirection;
}

function requiredEnv(name: string): string {
  const rawValue = process.env[name];
  const value = rawValue?.trim().replace(/^['"]|['"]$/g, "");
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function buildRestUrl(table: string, select: string, options: SelectOptions = {}): string {
  const url = new URL(`/rest/v1/${table}`, requiredEnv("NEXT_PUBLIC_SUPABASE_URL"));
  url.searchParams.set("select", select);

  if (options.orderBy) {
    url.searchParams.set("order", `${options.orderBy}.${options.orderDirection ?? "asc"}`);
  }

  for (const [key, value] of Object.entries(options.filters ?? {})) {
    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

export async function supabaseSelect<T>(table: string, select: string, options: SelectOptions = {}): Promise<T[]> {
  const apiKey = requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const response = await fetch(buildRestUrl(table, select, options), {
    cache: "no-store",
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed for ${table}: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T[];
}
