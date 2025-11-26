const modules = import.meta.glob("./*.encrypted.ts", { eager: true }) as Record<
  string,
  { default: any[] }
>;

export const CP_MAP: Record<string, any[]> = {};

for (const path in modules) {
  // path 會是 "./SakuAtsu.encrypted.ts"
  const match = path.match(/\.\/(.+)\.encrypted\.ts$/);

  if (!match) continue; // 避免 TS 提示 null

  const name = match[1]; // => SakuAtsu

  CP_MAP[name] = modules[path].default; // 已經指定 default 型別，所以不會 unknown
}

export default CP_MAP;
