async function r(c, o = 5e3) {
  const e = new AbortController(), a = e.signal, t = setTimeout(() => e.abort(), o), i = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Cache-Control": "max-age=0"
  };
  try {
    const n = await fetch(c, {
      signal: a,
      headers: i
    });
    return clearTimeout(t), n;
  } catch {
    return clearTimeout(t), null;
  }
}
export {
  r as default
};
