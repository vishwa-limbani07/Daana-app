# Daana — Razorpay-powered crowdfunding platform

> **Daana** (दान) is Sanskrit for *the act of giving* — a name that captures what this project enables.

A production-grade Kickstarter clone built with the MERN stack. Donors back fundraising campaigns through Razorpay, and campaign progress updates **live across every viewer** via WebSocket rooms.

> **Live demo:** _coming soon_ · **API:** _coming soon_

---

## Why this project

Payment integrations are interesting because they touch three hard problems at once: **cryptographic verification**, **idempotency**, and **race conditions** between synchronous callbacks and asynchronous webhooks. Daana solves all three with patterns you'd see in production code — not the happy-path tutorials.

If you're hiring and want to skip to the parts that show engineering judgment, jump to [the technical highlights](#technical-highlights).

---

## Features

### Core (MVP)
- JWT auth with bcrypt password hashing (`select: false` on password field)
- Campaign CRUD with Cloudinary-hosted cover images (streamed direct from request — never hits disk)
- Browse with category filters, debounced search, pagination
- Razorpay payments with HMAC SHA256 signature verification
- Webhook handler (raw body, separate signing secret)
- Live campaign progress via Socket.io rooms (room-per-campaign, not global broadcast)
- Transactional email receipts (Nodemailer + Gmail SMTP, fire-and-forget)
- Creator dashboard with computed stats

### Production-grade hardening
- **Idempotency keys** prevent double-charges if a user retries
- **Atomic state transitions** (`findOneAndUpdate` with status guard) make the donation flow race-safe between the checkout callback and the webhook
- **`crypto.timingSafeEqual`** for constant-time signature comparison
- **Per-IP rate limiting** on payment endpoints
- **Mass-assignment defense** — whitelisted editable fields on updates
- **Regex escape** on user search input to prevent injection / ReDoS

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 18 + Vite | Fast dev server, modern build, easy Vercel deploy |
| State | Redux Toolkit | Visible to recruiters, less boilerplate than vanilla Redux |
| Styling | TailwindCSS | Utility-first, consistent design tokens, zero CSS file maintenance |
| Backend | Node.js + Express | Boring, battle-tested, hireable |
| Database | MongoDB + Mongoose | Schema flexibility for varied campaign shapes |
| Payments | Razorpay | Works in India without business registration (unlike Stripe IN) |
| Images | Cloudinary | Hosted CDN + on-the-fly transforms, free tier covers portfolio scale |
| Realtime | Socket.io | Rooms primitive maps cleanly to per-campaign updates |
| Email | Nodemailer + Gmail SMTP | Zero-cost transactional email for personal projects |

---

## Architecture

```
┌─────────────────┐                  ┌───────────────────┐                  ┌─────────────┐
│   React + Vite  │  ─── HTTP ─────► │   Express API     │  ─── Mongoose ──►│  MongoDB    │
│   (Vercel)      │ ◄── Socket.io ── │   (Render)        │                  │  (Atlas)    │
└────────┬────────┘                  └────┬──────────────┘                  └─────────────┘
         │                                │
         │  Razorpay Checkout             │  Razorpay SDK + crypto.HMAC
         │  (browser SDK)                 ▼
         │                       ┌─────────────────┐
         └──────────────────────►│   Razorpay      │
                                 │   (orders +     │
                                 │    webhooks)    │
                                 └────────┬────────┘
                                          │ webhook (raw body, HMAC-signed)
                                          ▼
                                  (back to Express)
```

### Payment flow

```
1. User clicks "Donate ₹X" in the modal
2. Frontend generates a UUID idempotency key, posts to /api/donations/order
3. Backend creates a Razorpay order, saves a Donation row (status: pending)
4. Backend returns { orderId, donationId } to the client
5. Frontend opens Razorpay checkout with the orderId
6. User pays → Razorpay calls our handler with { payment_id, signature }
7. Frontend posts those to /api/donations/verify
8. Backend recomputes HMAC_SHA256(order_id|payment_id, RAZORPAY_KEY_SECRET)
   and compares with crypto.timingSafeEqual (constant-time)
9. If valid: atomic findOneAndUpdate transitions pending → success
10. The winning path (verify OR webhook) increments Campaign.raisedAmount
    via $inc, then emits 'donation:new' to the campaign's socket room
11. Everyone viewing that campaign sees the new total without a refresh
```

---

## Technical highlights

The three sections you'd want to walk through in an interview.

### 1. HMAC SHA256 signature verification
[`server/src/services/paymentService.js`](server/src/services/paymentService.js)

Razorpay signs the string `${order_id}|${payment_id}` with your secret key. The backend recomputes the same HMAC and compares with `crypto.timingSafeEqual`:

```js
const expected = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(`${orderId}|${paymentId}`)
  .digest('hex');
return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
```

`timingSafeEqual` always compares the full length — a naive `===` short-circuits on the first mismatched byte, leaking info via response timing. Same algorithm + same secret = mathematically certain Razorpay produced this signature.

### 2. Race-safe atomic state transitions
[`server/src/controllers/donationController.js`](server/src/controllers/donationController.js)

The synchronous `/verify` call and the asynchronous Razorpay webhook can both fire for the same payment. Without protection, both would increment `raisedAmount` — double-counting. The solution is to put the status check inside the update filter:

```js
const donation = await Donation.findOneAndUpdate(
  { razorpayOrderId, status: 'pending' },     // only match if still pending
  { status: 'success', ... },
  { new: true }
);
```

Mongo guarantees this is atomic at the document level. Whichever path wins flips `pending → success` and gets the document back. The other gets `null` and exits without incrementing. **Exactly-once campaign update, every time.**

### 3. Idempotency keys
[`server/src/controllers/donationController.js`](server/src/controllers/donationController.js) + [`client/src/components/campaign/DonateModal.jsx`](client/src/components/campaign/DonateModal.jsx)

The frontend generates a UUID per "Donate" click. On a retry (network blip, double-click, etc.) the same key is sent. The backend looks up by key and returns the existing order instead of creating a duplicate:

```js
if (idempotencyKey) {
  const existing = await Donation.findOne({ idempotencyKey });
  if (existing) return res.json({ orderId: existing.razorpayOrderId, ... });
}
```

One UI click = at most one Razorpay order = at most one charge.

---

## Local setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Razorpay account (test mode keys are free)
- Cloudinary account (free tier covers portfolio scale)
- (Optional) Gmail account with App Password for email receipts

### 1. Clone and install
```bash
git clone <your-repo-url> daana
cd daana

cd server && npm install
cd ../client && npm install
```

### 2. Configure environment
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Fill in `server/.env`:
- `MONGO_URI` — your Atlas connection string
- `JWT_SECRET` — generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` — from https://dashboard.razorpay.com/app/keys
- `CLOUDINARY_*` — from your Cloudinary dashboard
- `EMAIL_*` — optional; app runs without these (receipts just become no-ops)

Fill in `client/.env`:
- `VITE_RAZORPAY_KEY_ID` — must equal the server's `RAZORPAY_KEY_ID`

### 3. Run dev servers
```bash
# Terminal 1
cd server && npm run dev          # Express on :5000

# Terminal 2
cd client && npm run dev          # Vite on :5173
```

Open http://localhost:5173.

### 4. Test the payment flow

In the Razorpay checkout modal, use these test values:

| Field | Value |
|---|---|
| Card | `4111 1111 1111 1111` |
| Expiry | any future date |
| CVV | any 3 digits |
| OTP | `1111` |
| UPI ID | `success@razorpay` |

Full Razorpay test cards: https://razorpay.com/docs/payments/payments/test-card-details/

### 5. (Optional) Test webhooks locally with ngrok
```bash
brew install ngrok
ngrok http 5000
```

Use the public ngrok URL in the Razorpay dashboard webhook config. Set the same secret in `server/.env` as `RAZORPAY_WEBHOOK_SECRET`.

---

## Deployment

_Steps coming once deployed — Render (backend), Vercel (frontend), MongoDB Atlas (database)._

---

## Project layout

```
daana/
├── client/
│   └── src/
│       ├── api/             # axios clients (one per resource)
│       ├── components/      # common, campaign, layout
│       ├── pages/           # one per route
│       ├── store/           # Redux Toolkit slices
│       ├── hooks/           # useAuth, useRazorpay, useSocket
│       └── utils/           # formatCurrency, formatDate
└── server/
    └── src/
        ├── config/          # db, razorpay, cloudinary
        ├── models/          # User, Campaign, Donation, RewardTier
        ├── controllers/     # auth, campaign, donation, webhook
        ├── routes/          # Express routers
        ├── middleware/      # protect, errorHandler, rateLimiter, upload
        ├── services/        # paymentService, emailService, socketService
        └── utils/           # asyncHandler, hashPassword, generateToken
```

---

## License

MIT — feel free to use this as a learning reference.
