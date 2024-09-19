export const BASE_URL_HEAD = "https://api.sd-rtn.com/";
export const BASE_URL_TAIL = "/iot/link";
export const CREATE_ACCOUNT = "/open-api/v2/iot-core/secret-node/user/create";
export const ACTIVE_ACCOUNT = "/open-api/v2/iot-core/secret-node/user/activate";
export const HTTP_REQ_CONNECT = "/open-api/v2/connect/create";
const isProd = process.env.NODE_ENV === "production";
export enum Region {
  CN = "cn",
  NA = "na",
  AP = "ap",
  EU = "eu",
}

export class Response {
  code?: number;
  msg?: string;
  timestamp?: number;
  traceId?: string;
  success?: boolean;
  data?: any;
  constructor(
    props?: Partial<{
      code?: number;
      msg?: string;
      timestamp?: number;
      traceId?: string;
      success?: string;
      data?: any;
    }>,
  ) {
    Object.assign(this, props);
  }
}

function base64Encode(str: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  let binaryString = "";
  const len = data.byteLength;
  for (let i = 0; i < len; i++) {
    binaryString += String.fromCharCode(data[i]);
  }
  return btoa(binaryString);
}

export function generateBasicAuth(key: string, secret: string) {
  return base64Encode(key + ":" + secret);
}

export function fetchAPI(req: any): Promise<Response> {
  return new Promise((resolve, reject) => {
    const body = req.body;
    const options = {
      method: req.method || "post",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(body),
    };

    options.headers = { ...options.headers, ...req.headers };

    if (req.body) {
      const merged = { ...body, ...req.body };
      options.body = JSON.stringify(merged);
    }

    if (isProd) {
      req.url = BASE_URL_HEAD + req.url;
    }

    fetch(req.url, options)
      .then(response => response.json())
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
}
