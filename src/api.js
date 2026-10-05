const BASE = "https://api.fda.gov/drug/label.json";

const searchCache = new Map();
const idCache = new Map();

async function request(url, signal) {
  const res = await fetch(url, { signal });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  const data = await res.json();
  return data.results || [];
}

export async function searchMedicines(query, signal) {
  const key = query.toLowerCase();
  if (searchCache.has(key)) return searchCache.get(key);

  const safe = query.replace(/"/g, "");
  const url = `${BASE}?search=openfda.brand_name:"${encodeURIComponent(safe)}"&limit=20`;
  const results = await request(url, signal);

  searchCache.set(key, results);
  results.forEach((r) => idCache.set(r.id, r));
  return results;
}

export async function getMedicine(id, signal) {
  if (idCache.has(id)) return idCache.get(id);

  const results = await request(`${BASE}?search=id:"${encodeURIComponent(id)}"&limit=1`, signal);
  if (results[0]) idCache.set(id, results[0]);
  return results[0] || null;
}
