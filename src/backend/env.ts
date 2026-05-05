type BunGlobal = typeof globalThis & {
  Bun?: {
    env?: Record<string, string | undefined>;
  };
};

export function getEnv(name: string) {
  return process.env[name] ?? (globalThis as BunGlobal).Bun?.env?.[name];
}
