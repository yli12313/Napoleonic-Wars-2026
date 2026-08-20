# Decisions

Every judgement call made while building this, and why. Where a call was close,
the reasoning is recorded so it can be argued with.

---

## 1. Scope: what counts as a battle Napoleon commanded

**The test applied:** Bonaparte was physically present on the field (or directing
the siege) *and* exercising command over the French force engaged.

That produces **71 engagements**, from Toulon (September 1793) to Waterloo
(June 1815) — 62 field battles and 9 sieges.

### Deliberately excluded

Actions fought by his marshals while he was elsewhere are not on the map, no
matter how famous:

| Excluded | Commander | Why |
| --- | --- | --- |
| Auerstedt, 1806 | Davout | Fought 13 miles from Jena; Napoleon was at Jena |
| Bailén, 1808 | Dupont | Napoleon was in France |
| Salamanca 1812, Vitoria 1813 | Marmont / Jourdan | Peninsular War; he was never there |
| Quatre Bras, 1815 | Ney | Same day as Ligny, different field |
| Wavre, 1815 | Grouchy | Same day as Waterloo, different field |
| Hohenlinden, 1800 | Moreau | Napoleon was First Consul in Paris |
| Defence of Paris, 1814 | Marmont / Mortier | He was marching from Saint-Dizier |
| The Nile, 1798 | Brueys (naval) | Napoleon was inland; also a fleet action |
| Trafalgar, 1805 | Villeneuve (naval) | Not present |
| Montebello, Dürenstein, Pultusk, Golymin, Vyazma, Katzbach, Grossbeeren, Kulm, Dennewitz, Bar-sur-Aube, Fère-Champenoise | various | Subordinate actions fought in his absence |

Where a marshal's action was fought on the **same day** as one of Napoleon's, it
is described inside that battle's summary rather than given its own marker:
Auerstedt appears in the **Jena** summary, Quatre Bras in **Ligny**, and Wavre in
**Waterloo**.

### Borderline cases, included

| Battle | The problem | Ruling |
| --- | --- | --- |
| **Toulon, 1793** | Dugommier held overall command | **In.** Explicitly requested. Bonaparte commanded the artillery, authored the winning plan and led the storming of Fort Mulgrave in person. The nuance is stated in the summary. |
| **13 Vendémiaire, 1795** | An internal insurrection, not a war; Barras was nominally in charge | **In.** Barras delegated the actual defence to Bonaparte, who sited the guns and fought the action. It is a battle he personally commanded, and it is the hinge of his career. Filed under First Coalition on date. |
| **Siege of Mantua, 1796–97** | Sérurier and Kilmaine ran the blockade day to day; Napoleon came and went | **In.** He directed it personally throughout, lifted and resumed it himself, and fought four field battles to protect it. |
| **Siege of Danzig, 1807** | Lefebvre commanded on the ground; Napoleon was at Finkenstein | **In**, on the brief's explicit instruction to include the Danzig-era operations he directed personally. He prescribed the parallels, batteries and timetable by daily order. This is the weakest "personally present" case in the dataset and the summary says so. |
| **Ceva, 1796** | Augereau and Sérurier did the fighting | **In.** Napoleon was with the army and ordered the turning movement that decided it. |
| **La Favorita, 1797** | Fought by Victor and Sérurier | **In.** Napoleon reached the siege lines and directed the concentration that trapped Provera. |
| **Czarnowo, 1806** | Davout's corps made the crossing | **In.** Napoleon came up to the Wkra and directed the night attack in person. |
| **Maloyaroslavets, 1812** | Eugène's IV Corps fought the battle; Napoleon arrived late in the day | **In.** He took command of the position, and the decision made there — to turn back onto the Smolensk road — was his alone. |
| **Znaim, 1809** | Marmont and Masséna began it; Napoleon arrived on the second day | **In.** He was directing the attack when he broke it off to accept the armistice. |
| **Ratisbon, 1809** | An assault on a walled town rather than a field battle | **In**, typed as a *siege* so the marker encoding reflects it. |
| **Capture of Malta, 1798** | Barely fought — the Order capitulated in two days | **In**, typed as a *siege*. It was a commanded operation with a garrison, a summons and a capitulation. |
| **Ulm, 1805** | An encirclement and capitulation more than a battle | **In**, typed as a *siege*, since it was an investment that ended in surrender. |

### Borderline cases, excluded

| Battle | Why it was left out |
| --- | --- |
| **Saorgio, 1794** | Bonaparte was artillery commander and plan author under Dumerbion, exactly as at Toulon — but unlike Toulon he did not lead an assault in person and the operation is not conventionally counted among his battles. Excluded to keep the bar consistent; a reasonable person could include it. |
| **Cairo revolt, October 1798** | A city riot suppressed by garrison troops, not an engagement against a field force. |
| **Valutino / Lubino, 1812** | Ney and Junot fought it while Napoleon remained at Smolensk. |
| **Benavente, 1808** | Lefebvre-Desnouettes commanded; Napoleon watched from the far bank but did not command the action. |
| **Elchingen, 1805** | Ney's action, fought within the Ulm operation; folded into the Ulm summary. |
| **Various minor Italian combats** (Fombio, Salò, Due Castelli, San Giorgio, Neumarkt, Tarvis) | Either fought by subordinates or too small and too poorly recorded to carry an honest data row. |

---

## 2. The three campaigns that do not sit on the coalition timeline

These are the categorisation calls the brief asked to be recorded.

### Egyptian & Syrian campaign (1798–1801) → `second-coalition`

The expedition sailed in May 1798 and the Battle of the Pyramids was fought on
21 July 1798; the Second Coalition was not formally constituted until December
1798. Filing Egypt under the Second Coalition anyway is the standard
historiographical treatment: the expedition is the *cause* of that coalition as
much as an episode within it — it brought the Ottoman Empire into the war and
gave Britain the Mediterranean campaign that drew in Russia and Austria. There
is no other category it could belong to, and inventing an eighth would break the
brief's seven-category rule.

**Consequence:** the Second Coalition's allowed span starts **1798-05-01**, not
December 1798.

### French invasion of Russia (1812) → `sixth-coalition`

The Russo-French war of 1812 is the opening theatre of the Sixth Coalition, not
a separate conflict. Russia, Britain, Sweden, Portugal and Spain were already
allied against France when the Grande Armée crossed the Niemen in June 1812, and
Prussia and Austria changed sides in early 1813 without any break in the
fighting. Treating 1812 as its own war would leave Borodino and the Berezina
orphaned from the campaign that ran directly into Lützen and Leipzig.

**Consequence:** the Sixth Coalition's allowed span starts **1812-06-01**.

### Napoleon's Spanish campaign (Nov 1808 – Jan 1809) → `fifth-coalition`

Somosierra, the capture of Madrid and the pursuit of Moore towards Astorga fall
in the gap between Tilsit (July 1807) and Austria's declaration of war (April
1809), so no coalition formally existed at the time. Both available answers are
imperfect; filing them **forward** into the Fifth is the better one:

- Britain, Spain and Portugal were continuously at war with France from 1808
  onward and became belligerents of the Fifth Coalition. The war Napoleon was
  fighting in November 1808 is the same war those powers carried into 1809.
- It was the Spanish rising, and the sight of a French army beaten at Bailén,
  that convinced Vienna the Empire was beatable. The Spanish campaign is
  causally upstream of the Fifth Coalition, not a coda to the Fourth.
- Filing it **backward** into the Fourth Coalition would attach it to a war that
  ended at Tilsit against Prussia and Russia — powers not involved in Spain at
  all — and sever it from the war it actually belongs to.

**Consequence:** the Fifth Coalition's allowed span starts **1808-11-01**, and
its filter row is labelled *1808–1809* rather than *1809*.

### Because of the above, date validation is per-category, not per-war

The validation script does **not** check a battle's date against the coalition's
headline years. It checks against an explicit allowed span declared per category
in `src/data/conflicts.ts`:

| Category | Headline years | Allowed span | Widened because |
| --- | --- | --- | --- |
| First Coalition | 1792–1797 | 1793-01-01 → 1797-10-31 | — |
| Second Coalition | 1798–1802 | **1798-05-01** → 1802-03-31 | Egypt sails before the coalition forms |
| Third Coalition | 1805 | 1805-08-01 → 1805-12-31 | — |
| Fourth Coalition | 1806–1807 | 1806-09-01 → 1807-07-31 | — |
| Fifth Coalition | 1808–1809 | **1808-11-01** → 1809-10-31 | Spanish campaign folded forward |
| Sixth Coalition | 1812–1814 | **1812-06-01** → 1814-04-30 | Russia 1812 folded in |
| Seventh Coalition | 1815 | 1815-06-01 → 1815-07-31 | — |

---

## 3. Data quality rules

- **Nothing is invented.** Coordinates are the modern location of the battlefield
  or the town it is named for. Where a scholarly range for strength or losses is
  too wide or too contested to compress into one number, the field is `null` and
  the popup shows an em dash rather than a guess.
- **Figures are rounded mid-range estimates** from standard reference works, not
  precise archival counts. Napoleonic casualty returns are unreliable by nature:
  Napoleon's own bulletins understated French losses as policy, and prisoner
  counts are frequently merged with killed and wounded. Treat every number as
  ±20% at best.
- **19 of 71 battles carry no casualty figures at all**, and 8 more carry figures
  for one side only. Six carry no strength figures either.

  | Missing | Battles |
  | --- | --- |
  | No casualty figures (19) | Millesimo, Ceva, Borghetto, Siege of Mantua, Lonato, Second Bassano, La Favorita, Tagliamento, Capture of Malta, Alexandria, Shubra Khit, Siege of Jaffa, Czarnowo, Siege of Danzig, Somosierra, Madrid, Landshut, Ratisbon, Znaim |
  | Casualties for one side only (8) | 13 Vendémiaire, Siege of Acre, Mount Tabor, Ulm, Krasnoi, Berezina, Mormant, Saint-Dizier |
  | No strength figures (6) | Millesimo, Ceva, Shubra Khit, Czarnowo, Madrid, Ratisbon |

  Most of these are the small Italian actions of 1796 and the early Egyptian
  operations, where the surviving returns are fragmentary or count only prisoners.
  The statistics panel reports how many of the filtered battles carry a figure, so
  the casualty total is never mistaken for a complete count.
- **Multi-day engagements use the start date** and carry an `endDate`.
- **Casualties are combined killed, wounded, missing and captured** where sources
  report them together, which is most of the time.

### Contested result calls

`result` is from the French perspective and must be exactly one of
victory / defeat / inconclusive, which forces some hard calls:

| Battle | Call | Reasoning |
| --- | --- | --- |
| **Eylau, 1807** | `inconclusive` | Both armies held the field; both claimed it. Casualty estimates range from 10,000 to 25,000 French. |
| **Heilsberg, 1807** | `inconclusive` | The Russians held their entrenchments and the French lost more men, but the position was abandoned two days later. A French tactical failure inside an operational success. |
| **Borodino, 1812** | `victory` | The French held the field and Moscow fell a week later. Recorded as a victory, with the summary making clear it decided nothing. |
| **Maloyaroslavets, 1812** | `inconclusive` | The French held the ruins; the Russians achieved their object of forcing the retreat back onto the devastated road. |
| **Krasnoi, 1812** | `defeat` | Napoleon extracted Davout, but the four-day running action cost some 30,000 men against 5,000 Russian. Calling it anything else would be dishonest. |
| **Berezina, 1812** | `victory` | The most arguable call in the dataset. The crossing was a tactical success — the fighting corps got across and both attacking Russian armies were held off — and it is conventionally scored a French tactical victory. The summary states plainly that the army which crossed was no longer an army. |
| **Znaim, 1809** | `inconclusive` | The battle was stopped mid-course by the armistice. |
| **Craonne, 1814** | `victory` | The ridge was taken, at a cost France could not sustain. |
| **Toulon, 1793** | `victory` | From the republican French perspective; the losing side included French royalists. |

---

## 4. Technical decisions

- **React 18, not 19.** The brief specified React 18, so `react-leaflet` is
  pinned to v4 (v5 requires React 19).
- **Clustering is hand-rolled on top of `leaflet.markercluster`** rather than
  using a React wrapper. Every marker is created once at mount; filtering
  computes a set difference and calls `addLayers` / `removeLayers`. Nothing
  re-mounts on a keystroke, and the filtered set is memoised.
- **Popups are HTML strings, not React portals.** They are built by
  `src/lib/markers.ts` with escaping, which keeps the marker layer fully
  imperative and avoids a portal per marker. Leaflet's popup chrome is
  completely overridden in CSS.
- **URL scheme is deliberately short** so a filtered view is a readable link:
  `?c=167&r=vd&y=1796-1814&k=Italian+Campaign&q=lannes`. Coalitions are digits
  1–7, results are `v`/`d`/`i`. Defaults are omitted, so an unfiltered view has a
  clean URL. State is written with `replaceState`, so typing in the search box
  does not fill the back stack, but `popstate` is honoured.
- **Colour encoding avoids red/green entirely.** Victory is antique gold, defeat
  is imperial blue, inconclusive is grey — distinguishable under all common forms
  of colour vision deficiency. Fill pattern carries the same information
  independently: victories are solid, defeats are hollow rings, inconclusive are
  filled and barred. Sieges are diamonds, field battles circles; significance
  drives size.
- **The casualty area chart uses linear interpolation, not monotone splines.**
  Monotone curves through sparse yearly data produced visible humps in years with
  no battles at all, which is a lie the chart should not tell.
- **Numerals are set in Inter, headings in Cormorant Garamond.** Cormorant's
  old-style figures render `1` as something close to a small capital I and `0`
  close to a lowercase o, which made "71" read as "7I" and "1.0M" as "I.oM".
  Display serif for names, sans for data.
- **No backend.** The dataset is a typed TypeScript module compiled into the
  bundle.
