# Pokémon GO Companion export contract

PokéYou accepts collection JSON from a **user-run companion** that exports the trainer’s own data. The companion must never send Pokémon GO passwords to PokéYou.

## Endpoint / handoff

1. **Paste / file upload** on `/pokemon-go/collection` (Companion card).
2. **Deep link:** navigate to `/pokemon-go/collection?companion=1` after writing JSON to `sessionStorage` key `pokeyou-go-companion-payload`.
3. **postMessage** (same origin):

```js
window.postMessage(
  { type: 'pokeyou-go-companion', payload: JSON.stringify(collection) },
  window.location.origin
);
```

## JSON schema

```json
{
  "trainer": {
    "trainerId": "optional-display-only",
    "nickname": "optional"
  },
  "importedAt": "2026-09-13T00:00:00.000Z",
  "pokemon": [
    {
      "speciesId": 1,
      "formId": 163,
      "caught": true,
      "seen": true,
      "shiny": false,
      "shadow": false,
      "purified": false,
      "lucky": false,
      "hundo": false,
      "candy": 25,
      "cp": 500,
      "iv": { "attack": 15, "defense": 14, "stamina": 15 },
      "gender": "male",
      "costumeId": 0,
      "mega": false,
      "primal": false,
      "dynamax": false,
      "gigantamax": false
    }
  ]
}
```

- `speciesId` is required.
- `formId` defaults to `0` when omitted (applied to the default form in the tracker).
- Hundo is derived automatically when IVs are `15/15/15`.
- CSV import remains available for simple spreadsheets (see Collection → Import file).

## Security rules

- Do not collect or transmit Pokémon GO account passwords.
- Do not automate unofficial Niantic authentication.
- Trainer ID is metadata for display only — not authentication.
