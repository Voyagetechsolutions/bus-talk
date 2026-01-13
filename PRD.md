# **Bus Talk – Detailed Product Requirements Document (PRD)**

---

## **1. Product Overview & Goals**

### 1.1 Vision

Bus Talk is a **community-driven platform for South African bus enthusiasts**, combining social networking, gamification, and real-time ratings. Users can:

* Spot buses, drivers, and routes
* Post sightings and news (verified spotters only)
* Rate trips and buses
* Engage in monthly and yearly awards
* View rankings for buses, drivers, companies, and spotters

**Primary Goals:**

1. Foster a fun, interactive community for bus enthusiasts
2. Maintain integrity via verified spotters and admin moderation
3. Enable dynamic, live-updating rankings and ratings
4. Make content visually appealing and fun, not corporate

---

### 1.2 KPIs / Success Metrics

* Active users per month / week
* Number of posts and sightings
* Ratings submitted per bus and driver
* Engagement on boosts / comments
* Accuracy and authenticity of verified spotter posts

---

### 1.3 Target Users

| User Type                     | Abilities                                                                          | Restrictions                                       |
| ----------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------- |
| Verified Spotter              | Create news posts, sightings, boost posts, vote in awards                          | Must be verified to post news, cannot abuse system |
| Regular User                  | Rate trips, post sightings, comment, vote in awards                                | Cannot create news posts, cannot boost             |
| Admin                         | Full moderation: approve spotters, manage posts, moderate ratings, view dashboards | None                                               |
| Company / Internal (optional) | View bus/driver performance analytics                                              | Cannot modify posts or votes                       |

---

## **2. User Flows & Journeys**

### 2.1 Rate a Trip

**Flow:**

1. User clicks "Rate this trip"
2. Form opens:
   * Select Bus (dropdown by company → fleet #)
   * Select Driver (auto-filled if known, else optional)
   * Rate attributes: Punctuality, Cleanliness, Comfort, Driver Behavior (1-5 stars)
   * Add optional comment
3. Submit → rating stored in DB → average recalculated → reflected in feed and rankings

**Integrity Measures:**

* Bus dropdown ensures ratings are tied to real bus
* Limit one rating per user per trip instance
* Realtime validation to prevent multiple votes/fake submissions

---

### 2.2 Post a Sighting

**Flow:**

1. User clicks "Spotted this bus"
2. Form opens:
   * Bus/Fleet Number
   * Location (text input / optional map)
   * Caption
   * Photo or video upload (max 10MB)
3. Submit → visible in live feed
4. Verified spotters can boost → post rises

---

### 2.3 Verified Spotter Workflow

1. User applies for verification
2. Admin receives request → evaluates (history, contributions)
3. Admin approves → user gets badge "Verified Spotter"
4. Verified spotters can post news and boost posts

---

### 2.4 Voting & Awards

**Monthly Awards Flow:**

1. Users see nominees (buses, drivers, companies, spotters)
2. Select vote per category
3. Weighting applied: Spotter 50%, User 30%, System Metrics 20%
4. Monthly winners published → reflected in Rankings page

---

## **3. Features & UI**

### 3.1 Pages

| Page              | Key Components                                        | Interaction Highlights                       |
| ----------------- | ----------------------------------------------------- | -------------------------------------------- |
| Home              | Hero post, live feed, top buses, quick actions        | Animated cards, pulse on boosts              |
| Companies         | Company card: rating, buses, routes, logo             | Hover shows mini-stats                       |
| Buses             | Bus profile: fleet #, route, type, last seen, ratings | Animated rating bars, image hover effect     |
| Drivers           | Driver cards: name, rating, experience, routes        | Badges for top performers, hover lift        |
| Spotter Posts     | Feed: featured/recent/popular                         | Boost animation, highlight verified spotters |
| Sightings         | Image-first feed                                      | Live feed slides in, boosted sightings rise  |
| Awards & Rankings | Monthly/yearly winners                                | Winner cards glow, momentum arrows animate   |
| Rate Trip         | Rating form                                           | Submit triggers instant rating update        |
| User Profile      | Posts, sightings, ratings, badges                     | Activity highlights, gamification points     |

---

### 3.2 Gamification & Community Features

* **Boosts:** only verified spotters; posts with boosts rise in feed
* **Post of the Week:** based on likes + boosts
* **Leaderboards:** Top buses, drivers, spotters, companies
* **Badges:** Verified, Senior, Rising Star, Veteran

---

### 3.3 UI / Design Principles

* Dark, fun, playful base (`#1E1E1E`)
* Accents: Yellow `#FFC700`, Cyan `#00D1FF`, Red `#FF4C4C`
* Cards: layered with shadows, hover lift, slight animations
* Typography: bold for headings, clear body text
* Motion: subtle feed slide-ins, boost pulse, animated ranking arrows

---

## **4. Technical Architecture & Data Models**

### 4.1 Frontend

* **Framework:** React + TypeScript
* **UI Library:** Tailwind CSS + custom animations
* **State Management:** Zustand
* **Routing:** React Router
* **Animations:** Framer Motion

---

### 4.2 Backend

* **Database:** Supabase (PostgreSQL)
* **Tables:**

**Users**
* id, username, email, role, spotter_status, badges, profile_pic

**Companies**
* id, name, logo, rating_avg, buses_count, routes_count

**Buses**
* id, company_id, fleet_number, route, type, year, rating_avg, last_seen

**Drivers**
* id, name, company_id, routes, experience_years, rating_avg

**Posts**
* id, user_id, type (news/sighting), title, content, media_urls, boosts_count, likes_count, timestamp

**Ratings**
* id, user_id, bus_id, driver_id, trip_date, punctuality, cleanliness, comfort, behavior

**Boosts**
* id, post_id, user_id, timestamp

**Awards**
* month, year, category, winner_id, votes_total, votes_weighted

---

### 4.3 Backend Functions & Logic

* Auto-calculate average ratings on new rating submission
* Update bus/driver/company momentum and rankings
* Apply vote weighting for awards
* Detect suspicious activity (fake boosts, multiple ratings per trip)

---

### 4.4 Media Storage

* Supabase Storage / AWS S3
* Max image/video size 10MB
* Lazy-load in feed
* Support PNG, JPG, MP4

---

### 4.5 Real-Time Features

* Supabase Realtime for:
  * Live feed updates
  * Ranking updates
  * Boost notifications

---

### 4.6 Security

* Role-based access:
  * Admin: full access
  * Verified Spotter: posts & boosts
  * User: ratings, sightings, voting
* Validate bus IDs and trip data to prevent fake ratings
* File upload validation

---

### 4.7 Deployment

* **Frontend:** Vercel / Netlify
* **Backend & Storage:** Supabase
* **CI/CD:** GitHub Actions
* **Monitoring:** Sentry / LogRocket

---

### ✅ Notes / Next Steps

1. Map **all flows visually** for Figma: feed, cards, ratings, boosts, awards
2. Build a **dashboard for admins** only
3. Implement **dynamic rankings and gamification** logic first
4. Keep **UI playful and fun**, avoid generic AI patterns

---

## **Implementation Priority**

### Phase 1 - Core Foundation
- [ ] Authentication system with role-based access
- [ ] Basic CRUD for buses, companies, drivers
- [ ] Rating system with real-time average calculation
- [ ] Basic feed with posts and sightings

### Phase 2 - Community Features
- [ ] Verified spotter system
- [ ] Boost functionality
- [ ] Image/video upload for sightings
- [ ] Real-time feed updates

### Phase 3 - Gamification
- [ ] Awards and voting system
- [ ] Rankings and leaderboards
- [ ] Badge system
- [ ] Advanced analytics

### Phase 4 - Polish & Scale
- [ ] Admin dashboard
- [ ] Advanced search and filtering
- [ ] Mobile optimization
- [ ] Performance monitoring