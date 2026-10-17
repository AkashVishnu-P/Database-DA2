export async function nextCode(
  prefix: string,
  digits: number,
  startFrom: number,
  exists: (code: string) => Promise<boolean>
): Promise<string> {
  const year = new Date().getFullYear();
  let n = startFrom + 1;
  for (let attempt = 0; attempt < 1000; attempt++) {
    const code = `${prefix}-${year}-${String(n).padStart(digits, "0")}`;
    if (!(await exists(code))) return code;
    n++;
  }
  return `${prefix}-${year}-${Date.now()}`;
}
