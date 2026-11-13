/**
 * The Cache API key for a public-data request, scoped to the deployed Worker version.
 *
 * The key used to be the request URL alone, and a cached entry outlives the deploy that wrote it:
 * the Cache API lives in each data center and nothing purges it on deploy. On 2026-11-13 the ANP
 * fix (#38) was live from 20:11 UTC, yet the SP gasoline lookup kept answering the week of
 * 2026-10-04 from an entry the previous code had written at 19:36 UTC, due to expire 24 hours
 * later. With the version in the key, every deploy starts from an empty cache.
 */
export function edgeCacheKey(requestUrl: string, versionId: string): string {
  const url = new URL(requestUrl);
  // `set`, not `append`: a visitor who sends this parameter still gets the current version's key.
  url.searchParams.set("_version", versionId);
  return url.toString();
}
