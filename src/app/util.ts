import { NextResponse } from "next/server";

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

export class SearchParams {
  searchParams: URLSearchParams;
  constructor(urlString?: string) {
    if (!urlString) {
      this.searchParams = new URLSearchParams();
      return;
    }
    const url = new URL(urlString);
    const searchParams = new URLSearchParams(url.search);
    this.searchParams = searchParams;
  }
  getStrParam(key: string): string | null {
    const val = this.searchParams.get(key);
    return val;
  }
  getNumParam(key: string): number | null {
    const val = this.searchParams.get(key);
    if (!val) return null;
    const num = Number(val);
    if (isNaN(num)) return null;
    return num as number;
  }
  getStrArrParam(key: string): string[] {
    const vals = this.searchParams.getAll(key);
    return vals;
  }
  getNumArrParam(key: string): number[] {
    const vals = this.searchParams.getAll(key);
    const nums: number[] = [];
    vals.forEach((v) => {
      const num = Number(v);
      if (!isNaN(num)) {
        nums.push(num);
      }
    });
    return nums;
  }
  getParamStr(): string {
    return `?${this.searchParams.toString()}`;
  }

  setNumArrParam(key: string, vals: number[]) {
    this.searchParams.delete(key);
    vals.forEach((v) => {
      this.searchParams.append(key, v.toString());
    });
    return this;
  }
}

export const getNum = (v: string) => {
  const n = Number(v);
  if (isNaN(n)) return null;
  return n;
}

export const getZXY = async (params: Promise<{z: string, x: string, y: string}>): Promise<[number, number, number] | null> => {
  const {z: rz, x: rx, y: ry} = await params;
  const z = getNum(rz);
  const x = getNum(rx);
  const y = getNum(ry);
  if (z === null || x === null || y === null) return null;
  return [z, x, y];
}

// 500 server 400 client
export const getErrRes = (str: string, status: 500 | 400) => NextResponse.json({error: str}, {status: status});