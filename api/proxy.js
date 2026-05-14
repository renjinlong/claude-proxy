export const config = {
  runtime: "edge"
};

export default async function handler(req) {
  const targetHost = "api.anthropic.com";
  const url = new URL(req.url);
  const targetUrl = new URL(`https://${targetHost}${url.pathname}${url.search}`);

  const newHeaders = new Headers(req.headers);
  // 伪装请求指纹，降低风控
  newHeaders.set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15");
  newHeaders.set("Origin", "https://console.anthropic.com");
  newHeaders.set("Referer", "https://console.anthropic.com/");

  try {
    const res = await fetch(targetUrl, {
      method: req.method,
      headers: newHeaders,
      body: req.body,
      signal: AbortSignal.timeout(80000)
    });

    return new Response(res.body, {
      status: res.status,
      headers: res.headers
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "proxy error", msg: err.message }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
}