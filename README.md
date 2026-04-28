# Enactus UTAS Member Verification System

A full-stack member verification system for Enactus UTAS. Admins manage members and generate QR codes; scanning a QR code opens a beautiful verification landing page showing full member details.

---

## Tech Stack

- **Frontend**: React 18 + React Router v6
- **Backend**: Node.js + Express
- **QR Generation**: `qrcode` npm package
- **Fonts**: Syne (headings) + DM Sans (body)

---

## Project Structure

```
enactus-verify/
├── server/
│   ├── index.js          ← Express API
│   └── package.json
└── client/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js                        ← Router
    │   ├── index.js / index.css          ← Entry + global styles
    │   ├── utils/api.js                  ← API utility
    │   ├── components/
    │   │   └── AdminLayout.js            ← Sidebar layout
    │   └── pages/
    │       ├── Dashboard.js              ← Admin dashboard
    │       ├── MembersList.js            ← Members table + QR modal
    │       ├── MemberForm.js             ← Add / edit member
    │       └── VerifyPage.js             ← Public verification page
    └── package.json
```

---

## Setup & Running

### 1. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Start the backend

```bash
cd server
npm start
# Runs on http://localhost:5000
```

### 3. Start the frontend

```bash
cd client
npm start
# Runs on http://localhost:3000
```

---

## Routes

| Route | Description |
|-------|-------------|
| `/admin` | Admin dashboard (stats + recent members) |
| `/admin/members` | Full members list with search, QR, edit, delete |
| `/admin/members/new` | Add new member form |
| `/admin/members/:id/edit` | Edit existing member |
| `/verify/:token` | **Public** verification page (what the QR code opens) |

---

## Member Fields

Each member record contains:
- Photo (Imgur/direct URL)
- Full name + Role/Position
- Department + Faculty
- Email + Phone
- Membership status (active/inactive)
- Membership ID (auto-generated)
- Verification token (auto-generated, e.g. `ENS-2024-7X2K`)
- Join date + Expiry date
- Projects & contributions (multiple, with impact summaries)
- President's overall remark

---

## QR Code Flow

1. Admin goes to **Members** → clicks **QR** button next to any member
2. A modal shows the QR code + the verification URL
3. Download the PNG and add it to certificates, ID cards, etc.
4. When anyone scans the QR code, they land on `/verify/:token`
5. The verification page shows full member details with animated reveal

---

## Production Notes

- Replace the in-memory `members` array in `server/index.js` with a real database (MongoDB, PostgreSQL, etc.)
- Set `REACT_APP_API_URL` in a `.env` file to your production API URL
- The QR code URL is generated based on the `baseUrl` query param — pass your production domain
- Consider adding an admin authentication layer before deploying publicly

---

## Customization

- **Colors**: Edit CSS variables in `client/src/index.css`
- **Logo**: Replace the `E` in `AdminLayout.js` and `VerifyPage.js` with an `<img>` tag
- **Faculties**: Update the `FACULTIES` array in `MemberForm.js`
- **Token format**: Modify `genToken()` in `server/index.js`
# enactusutasmembership
