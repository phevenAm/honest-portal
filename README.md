# 🌿 MindfulSpace — Counselling Client Portal

A full-featured mental health counselling portal built in React, designed as a learning project scaffolded with Redux, React Router, and mock auth — ready for you to extend with a real backend.

---

## 🚀 Getting Started

```bash
cd mindful-portal
npm install
npm start
```

Then open [http://localhost:3000](http://localhost:3000)

### Demo credentials
| Role   | Email                        | Password   |
|--------|------------------------------|------------|
| Admin  | admin@mindfulspace.com       | admin123   |
| Client | sarah.chen@email.com         | client123  |
| Client | marcus.j@email.com           | client123  |

---

## 🗂 Project Structure

```
src/
├── App.jsx                    # Root: Provider, Router, ThemeWrapper, all Routes
├── index.js                   # ReactDOM.createRoot entry point
├── index.css                  # Design system (CSS custom properties, dark mode)
│
├── store/                     # 🔴 Redux
│   ├── index.js               # configureStore — wires all slices together
│   └── slices/
│       ├── authSlice.js       # Login/logout, thunk, selectors
│       ├── usersSlice.js      # Client list (add/remove)
│       ├── questionnairesSlice.js
│       ├── responsesSlice.js  # Client check-in submissions
│       ├── resourcesSlice.js  # Articles & videos
│       └── themeSlice.js      # Dark/light mode (persisted to localStorage)
│
├── data/
│   └── mockData.js            # All demo data — replace with API calls
│
├── components/
│   └── shared/
│       ├── Navbar.jsx         # Responsive, accessible nav (admin/client aware)
│       ├── ProtectedRoute.jsx # Route guard — redirects by auth + role
│       ├── ProgressChart.jsx  # Toggleable line graph ↔ heatmap (Recharts)
│       ├── Card.jsx           # Reusable card wrapper
│       ├── Button.jsx         # Button with variants: primary/secondary/ghost/danger
│       └── Avatar.jsx         # Initials avatar with colour theming
│
└── pages/
    ├── LoginPage.jsx          # Public login form
    ├── AdminDashboard.jsx     # Admin overview + quick actions
    ├── admin/
    │   ├── AdminClientsPage.jsx         # Add/remove clients, view progress, export PDF
    │   ├── AdminQuestionnairesPage.jsx  # Build and manage check-in forms
    │   └── AdminResourcesPage.jsx       # Create articles & add videos
    └── client/
        ├── ClientDashboard.jsx  # Progress stats + chart + assigned check-ins
        ├── CheckInPage.jsx      # Step-by-step questionnaire form
        └── ResourcesPage.jsx    # Browse published articles & videos
```

---

## 🧠 Architecture Explained

### Redux Flow
```
User interaction
    → dispatch(action)         (e.g. dispatch(loginUser(email, pw)))
    → reducer runs             (updates the slice's state)
    → component re-renders     (because useSelector detects the change)
```

**Key Redux concepts used here:**
- `createSlice` — bundles state + reducers + auto-generated action creators
- Thunks — async logic before dispatching (see `loginUser` in authSlice)
- Selectors — functions that extract shaped data from the store
- `useSelector` — subscribes a component to a slice of state
- `useDispatch` — lets a component fire actions

### Mock Auth Pattern
`authSlice.js` simulates what a JWT auth flow would look like. When you add a real backend:
1. Replace the `loginUser` thunk body with `await axios.post('/api/auth/login', ...)`
2. Store the returned token: `state.token = action.payload.token`
3. Add the token to an Axios interceptor for all subsequent requests

### React Router v6
- `<Routes>` + `<Route>` replace the old `<Switch>`
- `<Navigate>` replaces `<Redirect>`
- `useNavigate()` hook replaces `history.push()`
- `<ProtectedRoute>` wraps private routes and checks Redux auth state

### Dark Mode
Implemented entirely with CSS custom properties. The `themeSlice` stores the preference, `ThemeWrapper` in `App.jsx` applies `class="dark"` to `<html>`, and all colours flip automatically via the `.dark {}` block in `index.css`. Zero JS colour logic needed.

---

## 📋 Features

### Client Portal
- ✅ Progress dashboard with stats (latest score, weeks tracked, improvement)
- ✅ Toggleable line graph / heatmap (Recharts + custom CSS grid)
- ✅ Step-by-step check-in form with scale + free-text questions
- ✅ Resource library with articles (expandable) and video embeds
- ✅ Filter resources by type

### Admin Panel
- ✅ Overview dashboard with key metrics
- ✅ Client management: add by name/email, remove, search
- ✅ View any client's progress chart inline
- ✅ Export client data to PDF (jsPDF — generates in-browser)
- ✅ Questionnaire builder: add questions, set type (scale/text), frequency
- ✅ Pause/activate questionnaires
- ✅ Resource manager: create articles, add YouTube videos, publish/draft toggle

### UX & Accessibility
- ✅ Full dark/light mode (persisted to localStorage)
- ✅ Mobile-responsive with hamburger menu
- ✅ ARIA labels, roles, and `aria-live` regions throughout
- ✅ Skip-to-main-content link for keyboard users
- ✅ Focus-visible styles for keyboard navigation
- ✅ `prefers-reduced-motion` respected in CSS

---

## 🔮 Next Steps (your learning roadmap)

### Phase 1 — Solidify the frontend
- [ ] Add form validation with `react-hook-form` + `zod`
- [ ] Add loading skeletons with a library like `react-loading-skeleton`
- [ ] Add toast notifications with `react-hot-toast`
- [ ] Write unit tests with `@testing-library/react`

### Phase 2 — Add a real backend
- [ ] Set up Express.js or Next.js API routes
- [ ] Replace mock credentials with JWT auth (`jsonwebtoken`)
- [ ] Add a database (PostgreSQL + Prisma ORM is great for this)
- [ ] Replace `MOCK_RESPONSES` with API calls using `createAsyncThunk`

### Phase 3 — Production features
- [ ] Email notifications when a check-in is due
- [ ] Real-time updates with WebSockets (or Supabase Realtime)
- [ ] Richer PDF reports with charts rendered server-side
- [ ] Role-based questionnaire assignment (currently hardcoded)
- [ ] Session notes for the admin alongside each client

---

## 📦 Dependencies

| Package              | Why                                      |
|----------------------|------------------------------------------|
| react-router-dom v6  | Client-side routing                      |
| @reduxjs/toolkit     | Modern Redux (replaces legacy patterns)  |
| react-redux          | React bindings for Redux                 |
| recharts             | Line graph component                     |
| jspdf                | PDF generation in-browser                |

---

*Built with 🌿 care — a learning-first scaffold for junior frontend developers.*
