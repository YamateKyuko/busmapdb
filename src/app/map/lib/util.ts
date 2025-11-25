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
