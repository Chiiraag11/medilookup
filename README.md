# Medicine Search

Search medicines by brand name using the openFDA Drug Label API.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
```

Routes: `/` (search, query kept in `?q=`) and `/medicine/:id` (detail).

## What's where

- `src/api.js` – fetch + caches (by query, and by label id)
- `src/useDebounce.js` – 400 ms debounce hook
- `src/SearchPage.jsx` – search, loading / empty / error states
- `src/MedicineCard.jsx` – result card
- `src/DetailPage.jsx` – detail page

## Performance choices

- **Debounce (400 ms):** no request per keystroke.
- **Cancellation:** every search runs with an `AbortController`, aborted in the effect cleanup, so a slow old response can't overwrite a newer one.
- **Caching:** a module-level `Map` keyed by lower-cased query. Repeating a search or pressing back is instant with no request. Labels are also cached by id so the detail page opens without a fetch.
- **`React.memo` on the card only:** typing re-renders the page on every keystroke, and memo stops the 20 cards re-rendering with it.
- **No `useMemo`/`useCallback`:** nothing computed here is expensive enough to justify it.

## Behaviour notes

- openFDA returns **404 for no matches**, which is shown as "No results found". Any other failure shows an error with a Retry button.
- The detail page fetches by `id` if it isn't cached, so opening the URL directly or refreshing works.
- Back link returns to the previous page (keeping the query) when there is history, otherwise goes to `/`.
- `openfda` fields are arrays and often missing; missing rows are simply hidden.

## Trade-offs

- Cache is in memory only, so it is lost on refresh. Fine for this scope.
- No pagination (spec asks for limit=20).
- Detail page shows the first entry of each label section as plain text; long sections aren't truncated or collapsed.
- Brand names containing `"` have the quote stripped to keep the query valid.
- openFDA is rate limited without an API key; heavy use may hit 429, which shows the error state.
