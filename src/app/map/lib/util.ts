export const decodeStrParam = (val: string | string[] | undefined): string | null => {
  if (!val) return null;
  if (Array.isArray(val)) return null;
  const decoded = decodeURIComponent(val);
  return decoded as string;
};

export const decodeNumParam = (val: string | string[] | undefined): number | null => {
  if (!val) return null;
  if (Array.isArray(val)) return null;
  const decoded = decodeURIComponent(val);
  const num = Number(decoded);
  if (isNaN(num)) return null;
  return num as number;
};

export const encodeStrParam = (val: string | null): string | null => {
  if (val === null) return null;
  return encodeURIComponent(val);
};

export const encodeNumParam = (val: number | null): string | null => {
  if (!val) return null;
  const str = val.toString();
  return decodeURIComponent(str);
};