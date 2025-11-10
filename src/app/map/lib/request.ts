import jwt from 'jsonwebtoken';

type resType = Record<string, unknown>;

/*
 * APIからデータをリクエストするクラス。new時のジェネリクスが返り値に直結する雑設計。
  コンストラクタでAPIのエンドポイントとルートを指定する。
  getでリクエスト。パラメータはこの時指定。

*/
export class APIrequester<T extends resType | resType[] | resType[][]> {
  root: string = '';
  endpoint: string;
  private apiKey: string = '';

  constructor(
    endpoint: string,
    root: 'rt' | 'db'
  ) {
    this.endpoint = endpoint;
    switch (root) {
      case 'rt':
        this.root = process.env.VERCEL_API_URL || '';
        this.apiKey = process.env.API_KEY || '';
        break;
      case 'db':
        this.root = process.env.GTFSDB_API_URL || ''; // kari
        this.apiKey = process.env.GTFSDB_API_KEY || '';
        break;
      default:
        this.root = '';
        break;
    };
  };

  async get(requestObj: {[key: string]: string | number | string[]}): Promise<T | null> {
    try {
      const payload = {
        endpoint: this.endpoint,
        requestObj: requestObj
      };
      const token = jwt.sign(payload, this.apiKey);

      const response = await fetch(
        `${this.root}/api/${this.endpoint}`,
        {headers: {'Authorization': `Bearer ${token}`}}
      );


      const json = await response.json();
      if (!json) return null;

      return json;

    } catch(e) {
      console.log(e);
      return null;
    }
  };
};