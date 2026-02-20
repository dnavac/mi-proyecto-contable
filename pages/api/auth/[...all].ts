import { auth } from "../../../lib/auth";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const baseUrl = process.env.BETTER_AUTH_URL || `http://localhost:3000`;
  const url = new URL(req.url!, baseUrl);

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }
  }

  const body =
    req.method !== "GET" && req.method !== "HEAD"
      ? JSON.stringify(req.body)
      : undefined;

  const request = new Request(url.toString(), {
    method: req.method,
    headers,
    body,
  });

  const response = await auth.handler(request);

  // Copy response headers
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  res.status(response.status);

  const text = await response.text();
  res.send(text);
}
