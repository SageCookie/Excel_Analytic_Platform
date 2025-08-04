📊 Excel Analytics Dashboard
A full‑stack web application to upload Excel files, visualize data interactively (2D/3D charts), and manage your upload history.
Built with React, Node.js, Express, MongoDB, and uses Chart.js, SheetJS, html2canvas, jsPDF.

✨ Features
✅ Register/Login (email/password + Google OAuth)
✅ Upload Excel (.xlsx, .xls) files and parse data
✅ Choose columns for X and Y axes to build custom charts
✅ Visualize with Bar, Line, Pie charts (2D)
✅ Export charts as PNG or PDF
✅ View upload & analysis history (stored in MongoDB)
✅ Modern, responsive UI with Tailwind CSS
✅ Private routes, JWT-based authentication
✅ Modular React components & clean API structure

📦 Project Structure


├── backend
│   ├── controllers/           # Auth & history controllers
│   ├── models/                # Mongoose models (User, History)
│   ├── routes/                # Express routes (auth, history)
│   ├── server.js              # Entry point
│   └── package.json
└── frontend
    ├── src
    │   ├── components/        # Sidebar, charts, recent uploads etc.
    │   ├── pages/             # Login, Register, Dashboard
    │   ├── context/           # UserContext for auth state
    │   ├── App.js             # Routes & main structure
    │   └── index.js
    └── package.json
⚙️ Tech Stack
Frontend: React, Tailwind CSS, Chart.js, SheetJS, html2canvas, jsPDF

Backend: Node.js, Express, MongoDB (Mongoose)

Auth: JWT, Google OAuth (@react-oauth/google on frontend, google-auth-library on backend)

🔑 Environment Variables
Backend .env example:

MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id

✍️ Usage
Register / Login (supports Google)

Upload Excel file

Select X and Y axes from columns

Choose chart type (Bar, Line, Pie)

View and export chart

See your recent uploads and history

