# **Bus Talk – Visual Sitemap & Page Hierarchy**

---

## **Site Architecture**

```
Bus Talk
├── 🏠 Homepage
├── 🏢 Companies
├── 🚌 Buses
├── 👨‍✈️ Drivers
├── 📰 Posts (Spotter News)
├── 📸 Sightings
├── 🏆 Awards & Rankings
├── ⭐ Rate Trip
├── 🔍 Search
├── 👤 Profile
├── ⚙️ Admin Dashboard
└── 📊 Analytics
```

---

## **Page Layout Hierarchy**

### **1. Homepage Layout**
```
┌─────────────────────────────────────────────────────────────┐
│ NAVBAR: Logo | Companies | Buses | Drivers | Posts | etc.   │
├─────────────────────────────────────────────────────────────┤
│ HERO SECTION                                                │
│ ┌─────────────────┐ ┌─────────────────────────────────────┐ │
│ │ Featured Post   │ │ Quick Actions                       │ │
│ │ - Title         │ │ [Rate Trip] [Post Sighting]        │ │
│ │ - Author Badge  │ │ [Browse Posts] [View Rankings]      │ │
│ │ - Boost Count   │ │                                     │ │
│ │ - Media         │ │ Community Stats                     │ │
│ └─────────────────┘ │ 🚌 1,234 Buses | ⭐ 5,678 Ratings  │ │
│                     │ 👥 234 Spotters | 🏢 56 Companies   │ │
│                     └─────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ LIVE ACTIVITY FEED                    │ TOP BUSES SIDEBAR   │
│ ┌─────────────────────────────────────┐ │ ┌─────────────────┐ │
│ │ 🔴 LIVE: John rated GA001 ⭐⭐⭐⭐⭐  │ │ │ #1 GA001        │ │
│ │ 📸 Sarah spotted MC101 at CBD      │ │ │ Route 1 - 4.8⭐  │ │
│ │ 🚀 Mike boosted "New BRT Routes"   │ │ │                 │ │
│ │ ⭐ Lisa rated IC500 ⭐⭐⭐⭐        │ │ │ #2 MC101        │ │
│ │ [Load More...]                     │ │ │ A01 - 4.7⭐      │ │
│ └─────────────────────────────────────┘ │ │                 │ │
│                                         │ │ #3 IC500        │ │
│                                         │ │ CPT-JHB - 4.6⭐  │ │
│                                         │ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### **2. Companies Page Layout**
```
┌─────────────────────────────────────────────────────────────┐
│ NAVBAR                                                      │
├─────────────────────────────────────────────────────────────┤
│ PAGE HEADER                                                 │
│ 🏢 Bus Companies                    [Suggest Company +]     │
├─────────────────────────────────────────────────────────────┤
│ COMPANY GRID                                                │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│ │ Golden Arrow│ │ MyCiTi      │ │ Intercape   │             │
│ │ 🏢 Logo     │ │ 🏢 Logo     │ │ 🏢 Logo     │             │
│ │ ⭐ 4.2/5    │ │ ⭐ 4.5/5    │ │ ⭐ 4.1/5    │             │
│ │ 🚌 45 buses │ │ 🚌 32 buses │ │ 🚌 28 buses │             │
│ │ 🛣️ 12 routes│ │ 🛣️ 8 routes │ │ 🛣️ 15 routes│             │
│ │ [View Buses]│ │ [View Buses]│ │ [View Buses]│             │
│ └─────────────┘ └─────────────┘ └─────────────┘             │
│                                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│ │ Greyhound   │ │ Translux    │ │ City to City│             │
│ │ [Similar layout...]                         │             │
│ └─────────────┘ └─────────────┘ └─────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### **3. Buses Page Layout**
```
┌─────────────────────────────────────────────────────────────┐
│ NAVBAR                                                      │
├─────────────────────────────────────────────────────────────┤
│ PAGE HEADER & FILTERS                                       │
│ 🚌 Buses                                                   │
│ [Search: Fleet #, Route, Company...] [Sort: Rating ▼]      │
│ [Filter: Company ▼] [Type ▼] [Route ▼]                     │
├─────────────────────────────────────────────────────────────┤
│ BUS GRID                                                    │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│ │ GA001       │ │ MC101       │ │ IC500       │             │
│ │ 🚌 Photo    │ │ 🚌 Photo    │ │ 🚌 Photo    │             │
│ │ Golden Arrow│ │ MyCiTi      │ │ Intercape   │             │
│ │ Route 1-CBD │ │ A01 Airport │ │ CPT-JHB     │             │
│ │ ⭐ 4.8 (234)│ │ ⭐ 4.7 (189)│ │ ⭐ 4.6 (156)│             │
│ │ 🕐 2h ago   │ │ 🕐 1h ago   │ │ 🕐 4h ago   │             │
│ │ [Rate] [📸] │ │ [Rate] [📸] │ │ [Rate] [📸] │             │
│ └─────────────┘ └─────────────┘ └─────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### **4. Rate Trip Form Layout**
```
┌─────────────────────────────────────────────────────────────┐
│ NAVBAR                                                      │
├─────────────────────────────────────────────────────────────┤
│ FORM HEADER                                                 │
│ ⭐ Rate Your Trip Experience                                │
├─────────────────────────────────────────────────────────────┤
│ FORM SECTIONS                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 1. SELECT BUS                                           │ │
│ │ Company: [Golden Arrow ▼]                              │ │
│ │ Bus: [GA001 - Route 1 ▼]                               │ │
│ │ Driver (Optional): [John Smith ▼]                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 2. RATE EXPERIENCE                                      │ │
│ │ Punctuality:    ⭐⭐⭐⭐⭐                              │ │
│ │ Cleanliness:    ⭐⭐⭐⭐☆                              │ │
│ │ Comfort:        ⭐⭐⭐☆☆                              │ │
│ │ Driver Behavior:⭐⭐⭐⭐⭐                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 3. ADDITIONAL FEEDBACK (Optional)                       │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Share your experience...                            │ │ │
│ │ │                                                     │ │ │
│ │ │                                                     │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ 📷 Add Photo/Video (Optional)                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                           [Submit Rating]                   │
└─────────────────────────────────────────────────────────────┘
```

### **5. Awards & Rankings Layout**
```
┌─────────────────────────────────────────────────────────────┐
│ NAVBAR                                                      │
├─────────────────────────────────────────────────────────────┤
│ PAGE HEADER                                                 │
│ 🏆 Awards & Rankings                                       │
│ [Live Rankings] [Monthly Awards] [Hall of Fame]            │
├─────────────────────────────────────────────────────────────┤
│ AWARDS SECTION                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🗳️ DECEMBER 2024 VOTING (Ends in 5 days)              │ │
│ │                                                         │ │
│ │ Best Bus                    Best Driver                 │ │
│ │ ┌─────────────┐            ┌─────────────┐             │ │
│ │ │ 🥇 GA001    │            │ 🥇 John S.  │             │ │
│ │ │ 45% votes   │            │ 38% votes   │             │ │
│ │ │ [Vote] ✓    │            │ [Vote]      │             │ │
│ │ └─────────────┘            └─────────────┘             │ │
│ │                                                         │ │
│ │ Best Company                Top Spotter                 │ │
│ │ ┌─────────────┐            ┌─────────────┐             │ │
│ │ │ 🥇 MyCiTi   │            │ 🥇 Sarah J. │             │ │
│ │ │ 52% votes   │            │ 41% votes   │             │ │
│ │ │ [Vote]      │            │ [Vote] ✓    │             │ │
│ │ └─────────────┘            └─────────────┘             │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ LIVE RANKINGS                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📊 Top Buses This Month                                 │ │
│ │ #1 GA001 - Route 1 (4.8⭐ from 234 ratings) ↗️         │ │
│ │ #2 MC101 - A01 (4.7⭐ from 189 ratings) ↘️             │ │
│ │ #3 IC500 - CPT-JHB (4.6⭐ from 156 ratings) ➡️         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### **6. Profile Page Layout**
```
┌─────────────────────────────────────────────────────────────┐
│ NAVBAR                                                      │
├─────────────────────────────────────────────────────────────┤
│ PROFILE HEADER                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 👤 Avatar    John Smith                                 │ │
│ │              ✓ Verified Spotter                         │ │
│ │              🏆 Rising Star 🎯 Veteran 📸 Shutterbug    │ │
│ │                                                         │ │
│ │ Stats: 📰 23 Posts | ⭐ 156 Ratings | 🚀 89 Boosts     │ │
│ │        📸 67 Sightings | 🏆 Rank #12                   │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ACTIVITY TABS                                               │
│ [Recent Activity] [My Posts] [My Ratings] [Achievements]   │
├─────────────────────────────────────────────────────────────┤
│ ACTIVITY FEED                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📰 Posted "New BRT Routes Coming" - 12 boosts          │ │
│ │ ⭐ Rated GA001 - 5 stars - 2 hours ago                 │ │
│ │ 📸 Spotted MC101 at Bellville - 1 day ago              │ │
│ │ 🚀 Boosted "Safety First" by Sarah - 2 days ago        │ │
│ │ 🏆 Earned "Rising Star" badge - 1 week ago             │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## **Component States & Interactions**

### **Card Hover States**
```
Normal State:     Hover State:        Active State:
┌─────────────┐   ┌─────────────┐     ┌─────────────┐
│ Bus Card    │   │ Bus Card    │     │ Bus Card    │
│ ⭐ 4.8      │ → │ ⭐ 4.8      │ →   │ ⭐ 4.8      │
│             │   │ ✨ Glow     │     │ 🔽 Pressed  │
└─────────────┘   └─────────────┘     └─────────────┘
```

### **Rating Input Animation**
```
Empty:           Hover:           Selected:
☆☆☆☆☆         → ⭐⭐⭐☆☆       → ⭐⭐⭐⭐⭐
                 (Preview)         (Confirmed)
```

### **Boost Button States**
```
Normal:          Hover:           Boosted:
[🚀 Boost 23]  → [🚀 Boost 23]  → [🚀 Boosted 24]
                 ✨ Glow           ✅ Confirmed
```

---

## **Responsive Breakpoints**

### **Desktop (1200px+)**
- Full sidebar layout
- 3-column grids
- Expanded navigation

### **Tablet (768px - 1199px)**
- 2-column grids
- Collapsible sidebar
- Touch-friendly buttons

### **Mobile (< 768px)**
- Single column
- Hamburger menu
- Bottom navigation tabs
- Swipe gestures

---

## **Animation Timing**

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Card Hover | Lift + Shadow | 200ms | ease-out |
| Button Press | Scale Down | 100ms | ease-in |
| Feed Item | Slide In | 300ms | ease-out |
| Rating Fill | Progress Bar | 500ms | ease-in-out |
| Boost Pulse | Scale + Glow | 400ms | bounce |
| Page Transition | Fade | 250ms | ease-in-out |

---

This visual hierarchy gives designers everything they need for Figma mockups and developers the exact component structure for implementation. Each section maps directly to React components with clear data requirements and interaction patterns.