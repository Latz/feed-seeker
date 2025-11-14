import { c as s } from "../checkFeed-DT9wDtY8.js";
function d(e) {
  return e && e.replace(/\s+/g, " ").trim();
}
async function k(e) {
  e.emit("start", { module: "metalinks", niceName: "Meta links" });
  let l = [];
  const o = e.options?.maxFeeds || 0, m = ["feed+json", "rss+xml", "atom+xml", "xml", "rdf+xml"];
  for (const r of m) {
    e.emit("log", { module: "metalinks", feedType: r });
    for (let i of e.document.querySelectorAll(`link[type="application/${r}"]`)) {
      const n = new URL(i.href, e.site).href;
      try {
        const t = await s(n);
        if (t && (l.push({
          url: n,
          // make relative path absolute
          title: d(i.title),
          type: t.type,
          // Use the type detected by checkFeed
          feedTitle: t.title
          // Include the feed's own title
        }), o > 0 && l.length >= o))
          return e.emit("log", {
            module: "metalinks",
            message: `Stopped due to reaching maximum feeds limit: ${l.length} feeds found (max ${o} allowed).`
          }), l;
      } catch (t) {
        e.emit("error", { module: "metalinks", error: t.message });
      }
    }
  }
  const f = e.document.querySelectorAll(
    'link[rel="alternate"][type*="rss"], link[rel="alternate"][type*="xml"], link[rel="alternate"][type*="atom"], link[rel="alternate"][type*="json"]'
  );
  for (let r of f) {
    const i = new URL(r.href, e.site).href;
    if (!l.some((t) => t.url === i))
      try {
        const t = await s(i);
        if (t && (l.push({
          url: i,
          title: d(r.title),
          type: t.type,
          // Use the type detected by checkFeed
          feedTitle: t.title
          // Include the feed's own title
        }), o > 0 && l.length >= o))
          return e.emit("log", {
            module: "metalinks",
            message: `Stopped due to reaching maximum feeds limit: ${l.length} feeds found (max ${o} allowed).`
          }), l;
      } catch (t) {
        e.emit("error", {
          module: "metalinks",
          error: t.message,
          explanation: "An error occurred while trying to fetch and validate a feed URL found in an alternate meta link. This could be due to network issues, server problems, or invalid feed content.",
          suggestion: "Check if the alternate link URL is accessible and returns valid feed content. The search will continue with other meta links."
        });
      }
  }
  const u = e.document.querySelectorAll('link[rel="alternate"]');
  for (let r of u) {
    const i = ["/rss", "/feed", "/atom", ".rss", ".atom", ".xml", ".json"];
    if (r.href && i.some((t) => r.href.toLowerCase().includes(t))) {
      const t = new URL(r.href, e.site).href;
      if (!l.some((a) => a.url === t))
        try {
          const a = await s(t);
          if (a && (l.push({
            url: t,
            title: d(r.title),
            type: a.type,
            // Use the type detected by checkFeed
            feedTitle: a.title
            // Include the feed's own title
          }), o > 0 && l.length >= o))
            return e.emit("log", {
              module: "metalinks",
              message: `Stopped due to reaching maximum feeds limit: ${l.length} feeds found (max ${o} allowed).`
            }), l;
        } catch (a) {
          e.emit("error", {
            module: "metalinks",
            error: a.message,
            explanation: "An error occurred while trying to fetch and validate a feed URL found in a meta link tag. This could be due to network issues, server problems, or invalid feed content.",
            suggestion: "Check if the meta link URL is accessible and returns valid feed content. The search will continue with other meta links."
          });
        }
    }
  }
  return e.emit("end", { module: "metalinks", feeds: l }), l;
}
export {
  k as default
};
