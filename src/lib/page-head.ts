/** Leaf metadata is explicit so every demo page has its own identity. */
export function pageHead(page: string, description: string) {
  const title = `${page} · University Notice & Announcement Management System`;
  return { meta: [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] };
}