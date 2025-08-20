// test-cache.js
const swapiService = require("./src/services/swapiService"); // adjust path if needed

async function testCache() {
  console.log("=== SWAPI Cache Test ===");

  // First fetch: should hit the API
  console.log("\nFetching character ID 1 (should be API call)...");
  let character = await swapiService.getCharacterById(1);
  console.log("Name:", character.result?.properties?.name || character.name);

  // Second fetch: should hit the cache
  console.log("\nFetching character ID 1 again (should be cache hit)...");
  character = await swapiService.getCharacterById(1);
  console.log("Name:", character.result?.properties?.name || character.name);

  // Search test
  console.log("\nSearching for 'Luke' (first time, API call)...");
  let searchResult = await swapiService.searchCharacters("Luke");
  console.log(
    "Results:",
    searchResult.results.map((r) => r.name || r.properties?.name)
  );

  console.log("\nSearching for 'Luke' again (should be cache hit)...");
  searchResult = await swapiService.searchCharacters("Luke");
  console.log(
    "Results:",
    searchResult.results.map((r) => r.name || r.properties?.name)
  );

  // Disable cache
  console.log(
    "\nDisabling cache and fetching character ID 1 (should call API again)..."
  );
  swapiService.disableCache();
  character = await swapiService.getCharacterById(1);
  console.log("Name:", character.result?.properties?.name || character.name);

  // Re-enable cache
  swapiService.enableCache();

  console.log("\nFlushing cache...");
  const { flush } = require("./src/utils/cache"); // adjust path
  flush();

  console.log(
    "\nFetching character ID 1 after flush (should call API again)..."
  );
  character = await swapiService.getCharacterById(1);
  console.log("Name:", character.result?.properties?.name || character.name);

  console.log("\n=== Cache Test Completed ===");
}

testCache().catch((err) => console.error(err));
