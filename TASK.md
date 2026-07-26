# Task

Read appropriate files to get up to speed on this project (README.md, AGENTS.md)

## 1 - Create a table of distances per region, per bicycle on cover page

This has been created, although it has bugs:

1. It is not adding all distances for the year: it appears to just be getting one value
2. It is not finding all bicycles (probably related to #1)
3. We need to find a way to determine what region the ride took place in (see task #2 below, which
   you will want to implement before tackling this task)

Also it should verify that:

It will recreate the table if there are new rows or columns that were not previously there

## 2 - When retrieving Strava data, auto detect region

Learn from the [info tool](/Users/jpravetz/dev/@epdoc/strava/packages/info/src/info.ts).

Here is sample output:

```txt
jpravetz[~/dev/@epdoc/strava/packages/strava]> deno run -A ./main.ts info -d202510
@epdoc/strava version 2.2.6
Authenticating Strava API ...
✓ Read ~/.config/epdoc/strava/user.creds.json
✓ Authorization will remain valid for about 6 hours
✓ Retrieved a list of 15 Strava activities from 2025/10/01 00:00:00 to 2025/10/31 23:59:59 (0.75s)

Activity Regions:
┌──────┬────────────────┬────────────┬──────────┬──────────────────────────────┬────────────┐
│ Code │ Name           │ Activities │ Distance │ Date Range                   │ Types      │
├──────┼────────────────┼────────────┼──────────┼──────────────────────────────┼────────────┤
│ CR   │ Costa Rica     │         11 │ 288.3 km │ 2025-10-01T08:53:20-06:00 t… │ EBikeRide  │
│ ON   │ Ontario/Quebec │          4 │  57.1 km │ 2025-10-10T10:45:34-04:00 t… │ Walk, Ride │
└──────┴────────────────┴────────────┴──────────┴──────────────────────────────┴────────────┘
```

If the region is not Costa Rica, set note1 field to `Away (${region})`. Task #1 should parse this
field to determine the region. By default the region is considered "Costa Rica"
