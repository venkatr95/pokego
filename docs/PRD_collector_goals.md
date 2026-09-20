PRD — Pokeuu Pokémon GO Collector & Goals

Product: Pokeuu
Feature: Pokémon GO Collector & Goals
Branch: collector-goals
Version: v1.0
Status: Proposed
Primary goal: Turn Pokeuu into a Pokémon GO Pokédex/collection-progress companion that tells a trainer what they have, what they're missing, what is unevolved, and what they can work toward next.

1. Product vision

Pokeuu should answer four questions immediately:

What do I have?
What am I missing?
What haven't I evolved?
What should I work on next?

The experience should feel like an enhanced Pokémon GO Pokédex rather than a spreadsheet.

The application should not require a Pokeuu database for the collector feature. User collection data should remain client-side where possible.

2. Goals
Primary goals
Display the complete Pokémon GO Pokédex.
Identify caught, seen and missing Pokémon.
Identify incomplete evolution families.
Identify Pokémon ready to evolve.
Identify Pokémon that are owned but not fully evolved.
Track forms and regional variants.
Track Shiny, Shadow, Purified, Lucky and Hundo status.
Track Mega/Primal, Dynamax and Gigantamax.
Track costumes.
Calculate collection completion.
Provide actionable "next goals."
Allow collection import/export.
Keep user collection data separate from Pokémon master data.
Avoid requiring a Pokeuu backend database for basic collection tracking.
Secondary goals
Make the tracker usable on desktop and mobile.
Reuse Pokeuu's existing Pokémon pages/data where possible.
Allow Pokémon GO master data to be updated independently of user progress.
Provide an architecture that can support an official Pokémon GO integration if one becomes available.
3. Non-goals

The first version will not:

Ask users for their Pokémon GO password.
Store Pokémon GO passwords.
Reverse-engineer or automate private Niantic authentication.
Circumvent Niantic authentication.
Claim that Trainer ID alone provides account access.
Store user inventory on a central database.
Attempt to modify a user's Pokémon GO account.
Transfer Pokémon or perform in-game actions.

A Trainer ID may identify a trainer, but it is not sufficient authentication for private account inventory.

4. User experience
Entry point

Add:

Pokémon GO

to Pokeuu's navigation.

Sub-navigation:

Pokémon GO
├── Pokédex
├── Collection
├── Goals
├── Evolutions
├── Forms
└── Missing
5. Pokédex screen

The primary screen.

┌─────────────────────────────────────────────────────────┐
│ Pokémon GO Pokédex                                      │
│                                                         │
│ 847 / 1,025                                             │
│ ███████████████████████░░░░ 82.6%                       │
│                                                         │
│ [All] [Missing] [Seen] [Caught] [Unevolved]            │
│ [Shiny] [Shadow] [Lucky] [Hundo]                       │
│                                                         │
│ Search Pokémon...       Generation ▾   Type ▾           │
└─────────────────────────────────────────────────────────┘

Each Pokémon card:

┌───────────────────────────────┐
│ #001                            │
│ Bulbasaur                      │
│                                │
│ ✓ Caught                       │
│ ✓ Shiny                        │
│ ✓ Shadow                       │
│ ✗ Lucky                        │
│ ✗ Hundo                        │
│                                │
│ Evolution: 1 / 3               │
│ ███████░░░░░                    │
│                                │
│ [Details]                      │
└───────────────────────────────┘
6. Pokédex status model

Every Pokémon/form should be capable of having:

type PokedexStatus =
  | "not_seen"
  | "seen"
  | "caught";
Not seen

No evidence that the trainer has encountered the Pokémon.

Seen

Trainer has encountered/seen it but does not own it.

Caught

Trainer has at least one instance.

7. Collection tracking

For every Pokémon/form, support:

interface CollectionStatus {
  caught: boolean;
  shiny: boolean;
  shadow: boolean;
  purified: boolean;
  lucky: boolean;
  hundo: boolean;

  male: boolean;
  female: boolean;

  mega: boolean;
  primal: boolean;

  dynamax: boolean;
  gigantamax: boolean;

  costume: boolean;
}

The implementation should remain extensible because Pokémon GO continues to introduce new collection categories.

8. Evolution tracker

This is a major feature.

The system should construct evolution families:

Bulbasaur
    ↓
Ivysaur
    ↓
Venusaur

and:

Eevee
 ├── Vaporeon
 ├── Jolteon
 ├── Flareon
 ├── Espeon
 ├── Umbreon
 ├── Leafeon
 ├── Glaceon
 └── Sylveon
Evolution status

Each evolution should be classified as:

complete
missing
ready
insufficient_candy
special_requirement
9. "Not Evolved" view

Create:

Goals → Unevolved

Example:

UNEvolved Pokémon

Charmander
├── Owned ✓
├── Charmeleon ✓
└── Charizard ✗

Progress
2 / 3

The view should identify:

Owned but unevolved

Trainer owns the base Pokémon but hasn't completed the evolution family.

Partially evolved

Example:

Bulbasaur ✓
Ivysaur ✓
Venusaur ✗
Completely evolved

Don't show these unless the user selects "Completed."

10. "Ready to evolve"

Dedicated page:

READY TO EVOLVE

17 Pokémon

┌─────────────┬─────────────┬─────────────┐
│ Pokémon     │ Evolution   │ Requirement │
├─────────────┼─────────────┼─────────────┤
│ Ivysaur     │ Venusaur    │ ✓ Ready     │
│ Kadabra     │ Alakazam    │ ✓ Trade     │
│ Haunter     │ Gengar      │ ✓ Trade     │
└─────────────┴─────────────┴─────────────┘

Where collection data contains Candy/requirements, use them.

11. Missing evolution view

Example:

MISSING EVOLUTIONS

27 missing

#003 Venusaur
Reason: 100 Candy

#065 Alakazam
Reason: Trade

#094 Gengar
Reason: Trade

If exact requirements aren't available, don't fabricate them.

Instead:

Evolution requirement:
See Pokémon GO
12. Evolution family dashboard

Every family gets a visual progress indicator:

CHARMANDER FAMILY

✓ Charmander
✓ Charmeleon
✗ Charizard

2 / 3
66%

For branching families:

EEVEE FAMILY

✓ Eevee
✓ Vaporeon
✓ Jolteon
✗ Flareon
✓ Espeon
✗ Umbreon
✓ Leafeon
✗ Glaceon
✗ Sylveon

5 / 9
13. Forms

Forms must be treated as separate collection entities.

Example:

Pikachu

Forms
├── Normal ✓
├── Libre ✓
├── Party Hat ✗
├── Santa Hat ✓
└── Detective ✗

Do not collapse these into a single Pokémon record.

The Pokémon GO master-data source provides separate form data, so the implementation should use a pokemonId + formId identity. WatWowMap Pokémon GO data API

14. Special collection categories

Dedicated filters:

All
Missing
Shiny
Shadow
Purified
Lucky
Hundo
Mega
Primal
Dynamax
Gigantamax
Costumes
Forms
Regional

Example:

Missing → Shiny

713 missing

Clicking opens the relevant Pokémon list.

15. Goals dashboard

This is the feature that differentiates Pokeuu from a normal Pokédex.

┌───────────────────────────────────────────────────────┐
│ YOUR GOALS                                             │
├───────────────────────────────────────────────────────┤
│                                                       │
│ 🔥 Ready to evolve                     17             │
│                                                       │
│ 🧬 Incomplete evolution families       27             │
│                                                       │
│ 📖 Missing Pokédex entries             178            │
│                                                       │
│ ✨ Missing shiny                       713            │
│                                                       │
│ 👻 Missing shadow                      604            │
│                                                       │
│ 🍀 Missing lucky                       762            │
│                                                       │
│ 💯 Missing hundo                       877            │
│                                                       │
│ 🧩 Missing forms                       126            │
│                                                       │
└───────────────────────────────────────────────────────┘
16. "Next goals"

The system should prioritize actionable goals.

Example:

NEXT GOALS

1. Evolve Ivysaur → Venusaur
   84 / 100 Candy

2. Evolve Machoke → Machamp
   Trade required

3. Complete Charmander family
   Charizard missing

4. Complete Eevee family
   4 evolutions missing

Goal ranking should be deterministic.

Suggested priority:

Ready now
↓
One requirement away
↓
Incomplete evolution
↓
Missing Pokédex
↓
Missing forms
↓
Special collection goals
17. Generation dashboard
Kanto       151 / 151   100%
Johto        94 / 100    94%
Hoenn       121 / 135    90%
Sinnoh       86 / 107    80%
Unova        72 / 156    46%
Kalos        38 / 72     53%
Alola        41 / 88     47%
Galar        31 / 89     35%
Hisui         5 / 7      71%
Paldea       18 / 120    15%

Clicking a generation filters the Pokédex.

18. Region/form view

Support:

Kanto
Johto
Hoenn
Sinnoh
Unova
Kalos
Alola
Galar
Hisui
Paldea

And regional variants where supported.

19. Search

Search must support:

name
Pokédex number
type
generation
form
status

Examples:

pikachu
#025
shiny
missing evolution
20. Data architecture

No database is required for v1.

                 Pokeuu
                    │
       ┌────────────┴────────────┐
       │                         │
 Pokémon GO master data     User collection
       │                         │
       ▼                         ▼
  Static/API data          IndexedDB/localStorage
       │                         │
       └────────────┬────────────┘
                    ▼
             Collector Engine
                    │
        ┌───────────┼────────────┐
        ▼           ▼            ▼
      Pokédex     Evolutions    Goals
21. Local storage

Use the existing Pokeuu client-side persistence architecture.

Prefer:

IndexedDB

for potentially large collection data.

Use localStorage for:

settings
filters
view preferences
22. Collection schema

Suggested structure:

interface PokemonGoCollection {
  trainer?: {
    trainerId?: string;
    nickname?: string;
  };

  importedAt: string;

  pokemon: PokemonGoInstance[];
}

Individual Pokémon:

interface PokemonGoInstance {
  speciesId: number;
  formId?: number;

  seen?: boolean;
  caught?: boolean;

  shiny?: boolean;
  shadow?: boolean;
  purified?: boolean;
  lucky?: boolean;

  cp?: number;

  iv?: {
    attack: number;
    defense: number;
    stamina: number;
  };

  gender?: "male" | "female" | "unknown";

  costumeId?: number;

  dynamax?: boolean;
  gigantamax?: boolean;
}
23. Hundo calculation

Don't require the user to manually mark Hundos.

If IV data is available:

const hundo =
  attack === 15 &&
  defense === 15 &&
  stamina === 15;

Then the UI derives:

💯 Hundo

automatically.

24. API architecture

Master data:

/api/pokemon-go/pokemon
/api/pokemon-go/forms
/api/pokemon-go/costumes

Collection:

IndexedDB

rather than:

/api/user/collection

for v1.

25. Data synchronization

Use the Pokémon GO master dataset as the source of truth for Pokémon/forms.

Recommended:

API
 ↓
Build/sync process
 ↓
Pokeuu static data
 ↓
Browser

Don't have every user's browser repeatedly fetch GitHub raw files.

The WatWowMap project provides the Pokémon GO data required for this approach. WatWowMap Pokémon GO data API

26. Account connection
Important product requirement

The UI must not imply:

Trainer ID = authentication

Instead:

Connect collection

can eventually support:

Official integration
Import file
Companion application

The provider interface should therefore be:

interface CollectionProvider {
  connect(): Promise<void>;
  getTrainer(): Promise<Trainer>;
  getCollection(): Promise<PokemonGoCollection>;
}

This allows an official integration to be added later without redesigning the collector.

27. Import/export

Add:

Import Collection
Export Collection

Supported initial formats:

JSON
CSV

Future:

Excel

Export example:

speciesId,formId,caught,shiny,shadow,lucky,hundo
1,0,true,true,false,true,false
2,0,true,false,false,false,false
3,0,false,false,false,false,false
28. Privacy

Because there is no Pokeuu database:

Collection data
       ↓
User browser

The site should explicitly communicate:

Your collection data is stored locally on this device unless you choose to export or sync it.

Never request Pokémon GO passwords.

Never send authentication credentials to Pokeuu.

29. Mobile UX

Pokémon GO users are primarily mobile users.

Cards should therefore work well at:

320px
375px
390px
430px

Desktop:

2–6 columns depending on width

Mobile:

2 columns

Avoid large tables on mobile.

30. Pokémon detail page

Add a Pokémon GO section to existing Pokémon pages.

Example:

Pikachu
────────────────────────

Pokédex #025

Your Collection

✓ Caught
✓ Shiny
✓ Lucky
✗ Hundo
✓ Shadow

Forms
──────────────
✓ Normal
✓ Libre
✗ Party Hat
✗ Santa

Evolution
──────────────
Raichu ✓

Mega
──────────────
None
31. Empty state

If no collection is connected:

Your Pokémon GO collection isn't connected yet.

Connect or import your collection
to see:

✓ Missing Pokémon
✓ Unevolved Pokémon
✓ Shiny progress
✓ Forms
✓ Hundo progress
✓ Evolution goals

[Connect Collection]
[Import Collection]
32. Error handling

If collection data cannot be read:

We couldn't read your collection.

Your existing tracker data is safe.

[Try Again]
[Import Collection]

If master data is unavailable:

Pokémon GO data is temporarily unavailable.

Your saved collection remains available.
33. Performance requirements

Target:

Initial tracker render: <2 seconds on typical desktop.
Mobile interaction: <100ms for filters where practical.
Search: instant/local.
Collection calculations: memoized.
Avoid re-rendering the entire Pokédex when one status changes.
Virtualize large lists if required.
34. Accessibility

Must support:

Keyboard navigation
Screen readers
Visible focus states
Accessible checkbox/status labels
Sufficient contrast
No information conveyed solely by color

Don't rely solely on:

🟢 = caught
🔴 = missing

Use text/icons as well.

35. Analytics

If Pokeuu already has analytics, track only product events such as:

pokemon_go_open
collection_import
collection_export
pokedex_filter
evolution_goal_open
missing_goal_open
pokemon_detail_open

Do not collect Pokémon GO passwords or private authentication data.

36. Acceptance criteria

The feature is considered complete when:

Pokédex
 All supported Pokémon are displayed.
 Search works.
 Generation filters work.
 Missing/caught/seen states work.
 Completion percentage is accurate.
Collection
 Collection can be imported.
 Collection persists locally.
 Collection can be exported.
 Refreshing master data doesn't destroy collection data.
Evolutions
 Evolution families are displayed.
 Incomplete families are identified.
 Unevolved Pokémon are identified.
 Ready-to-evolve Pokémon are identified when requirements/data permit.
 Branching evolution families work.
Forms
 Forms are separate entities.
 Regional variants work.
 Costumes can be tracked.
 Missing forms can be filtered.
Special collections
 Shiny
 Shadow
 Purified
 Lucky
 Hundo
 Mega
 Primal
 Dynamax
 Gigantamax
Goals
 Goals dashboard exists.
 Missing Pokédex goals work.
 Evolution goals work.
 Special collection goals work.
 "Next goals" are generated.
Privacy
 No Pokémon GO password collection.
 No unofficial credential harvesting.
 Collection remains client-side for v1.
 Trainer ID isn't treated as authentication.
37. Phase 2

After v1:

Trainer connection

Add an official authorization provider if Niantic exposes a suitable supported API.

Pokeuu
  ↓
Niantic authorization
  ↓
Authorized collection
  ↓
Pokeuu Collector
Cloud sync

Optional:

User
 ↓
Pokeuu account
 ↓
Encrypted/synchronized collection
Companion

If a legitimate collection-export mechanism is available:

Pokeuu Companion
       ↓
Collection JSON
       ↓
Pokeuu
38. Definition of success

The feature succeeds if a Pokémon GO player can open Pokeuu and, within seconds of providing/importing their collection, answer:

"What am I missing?"

and then drill into:

"What haven't I evolved?"

"What can I evolve now?"

"Which forms am I missing?"

"Which Shinies/Shadow/Lucky/Hundos am I missing?"

"What should I work on next?"

That should be the core product philosophy for collector-goals: not just a Pokédex, but a personal Pokémon GO completion planner.