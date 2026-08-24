# Deal Room

A shared underwriting scorecard for a weekly real estate investment meeting.
Deals go in through a structured form, get scored against your team's buy box,
and come out as a ranked list with a Pursue / Watch / Pass verdict on each one.

Built for **multifamily / rentals** and **commercial / mixed-use**. Both hang off
the same NOI-driven engine; the criteria and thresholds differ per asset class
and are all editable.

---

## How access works

There are no user accounts. One passphrase opens the board, and it is a real
encryption key rather than a password check:

- PBKDF2 (250,000 iterations, SHA-256) turns the passphrase into **two**
  independent values — the Firestore document id, and an AES-256-GCM key.
- The board is encrypted in the browser before it is written. Firestore stores
  a ciphertext under an unguessable 64-hex-character id.
- The passphrase never leaves the browser. Neither does the plaintext.

So the project owner, Google, and anyone who scrapes the database sees nothing
readable, and someone without the passphrase cannot even work out which
document to ask for.

**The tradeoff:** there is no per-person revocation. Anyone with the passphrase
has full access. When someone leaves the team, open **Access → Change
passphrase** — the board is re-encrypted under the new one and the old document
is deleted, so the retired passphrase immediately opens nothing.

Choose something long. It is the only thing standing between the board and
anyone who wants it.

---

## Setup

You need a Firebase project. The free Spark plan is enough.

### 1. Create the project

[console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
Analytics is not needed.

### 2. Turn on anonymous sign-in

**Build → Authentication → Get started → Sign-in method → Anonymous → Enable.**

Firestore needs a signed-in caller before it will accept a request. Anonymous
auth gives every visitor a throwaway identity — it is not what protects the
data, the encryption is. Skip this and the app will tell you sign-in is being
rejected.

### 3. Create the database

**Build → Firestore Database → Create database.** Pick a region near your team.
Start in production mode; the rules in this repo replace whatever it starts with.

### 4. Register a web app and paste the config

**Project settings → General → Your apps → Web (`</>`).** Copy the
`firebaseConfig` object and paste the values into `public/config.js`.

These values are public by design — they identify the project, they do not grant
access.

### 5. Deploy

```sh
npm install -g firebase-tools
firebase login
firebase use --add          # pick the project you just created
firebase deploy
```

That publishes the page and the Firestore rules together. The URL comes back as
`https://YOUR-PROJECT.web.app`.

To push rule changes on their own later: `firebase deploy --only firestore:rules`.

### 6. Open it and create the board

Visit the URL, type your team's passphrase, confirm it, and the board is
created. Send teammates the URL and the passphrase over separate channels — a
link in email and a passphrase in Signal beats both in one message.

---

## Scoring

Each criterion has four anchors you set:

| Anchor | Score |
|---|---|
| `fail` | 0 |
| `min` | 50 |
| `target` | 80 |
| `stretch` | 100 |

Values in between interpolate linearly, so a deal just under target scores just
under 80 rather than falling off a cliff. The board score is the weighted
average across every criterion that could be computed.

**Gates** are hard requirements — DSCR is one by default. A deal that misses a
gate is marked **Pass** no matter how well it scores elsewhere, and the detail
view says which gate and by how much.

**Missing data is not a zero.** A criterion whose inputs are absent is dropped
and the remaining weights renormalize. The deal shows what is still needed and
what percentage of the buy box the score actually covers, so a half-entered deal
never looks better than a fully-underwritten one.

Defaults ship as a starting point, not a recommendation — open **Buy box** and
set them to your own. They are stored with the board, so the whole team scores
against the same numbers.

---

## What it computes

EGI, NOI, debt service, cash flow, cash-to-close and all-in basis, plus cap rate
(on price and on basis), cash-on-cash, DSCR, debt yield, GRM, expense ratio,
rent-to-price, break-even occupancy, price per unit and per square foot, and
cash flow per unit per month. Commercial deals add WALT, occupancy and largest
tenant share.

Financing supports amortizing or interest-only debt.

---

## Documents

Link to the offering memo, rent roll and T-12 where they already live — Drive,
Dropbox, the broker's portal. The board is a single Firestore document capped at
1 MiB, so binaries do not go in it.

If you want real uploads later, Firebase Storage is the right home for them,
but it requires the Blaze (pay-as-you-go) plan.

---

## Notes

- **Concurrent edits are last-write-wins.** Changes stream to everyone live via
  a Firestore listener, and a save you did not make announces itself. Two people
  editing the same deal in the same few seconds can still lose one of the edits,
  which is fine for a weekly meeting and would not be for a busy shared queue.
- An in-progress form is held outside the shared state, so a teammate's save
  never clobbers something you are typing.
- Everything is one self-contained `public/index.html` — no build step. The
  Firebase SDK loads from Google's CDN as an ES module.
