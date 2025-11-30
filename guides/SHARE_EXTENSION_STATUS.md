# Share Extension & Inbox Status (December 2025)

## What’s working
- Inbox feature exists in the app (page + navigation) and can be viewed when built with the current web bundle.
- Deep link share via `travelist://share?text=...` lands items in Inbox and creates cards.
- iOS Share Extension installs, shows in the share sheet, and logs saving shared text/URLs to the App Group (`group.com.travelist.shared`).

## What’s not working
- Items shared from Safari/Google Maps via the Share Extension do not appear in the Inbox after returning to the app.
- Automatic import from the App Group into the app Inbox is not happening when the app resumes.
- In some simulator builds, the Inbox tab disappears after building/running, even though the code defines it in the navbar.
