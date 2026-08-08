# ***Aura Avenue***: `Escape. Explore. Experience. Repeat.`
#### AuraAvenue is a comprehensive travel and tourism platform designed to help users explore global destinations, book curated travel packages, and build custom day-by-day itineraries.
#### AuraAvenue combines beautiful UI with rich data, interactive maps, and seamless booking flows

# 🌟 Features

## 🗺️ Destination Exploration

-  **Smart Search** with live destination autocomplete.
-  **Wikipedia Integration** for rich destination insights.
-  **High-Quality Images** via Unsplash and Pexels.
-  **Real-Time Weather Forecasts** powered by Open-Meteo.
-  **Nearby Attractions & POIs** using Geoapify.
-  **Interactive Maps** for visual exploration.

---

## 🏖️ Travel Package Booking

-  Filter packages by budget, duration, destination, and travel style.
-  Interactive package location maps using React Leaflet.
-  Secure booking workflow with OTP verification.
-  Community reviews and ratings.
-  Dynamic rating calculations.

---

## 🗓️ Custom Itinerary Builder

- Create personalized day-by-day travel plans.
- Add accommodations, dining, and sightseeing activities.
- Set activity timings and schedules.
- Save itineraries to your profile.
- Export complete itineraries as PDF documents.


## 🛠️ Tech Stack

### Frontend (Client)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Leaflet (Maps)](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)

*   **Libraries:** React Leaflet (Maps), React Icons

### Backend (Server)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

*   **Integration:** Mongoose-style raw driver integration, Google Auth Library, Nodemailer (Automated Emails & OTPs)

### Third-Party APIs & Services
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google%20gemini&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=Cloudinary&logoColor=white)
![Unsplash API](https://img.shields.io/badge/Unsplash_API-000000?style=for-the-badge&logo=unsplash&logoColor=white)
![Pexels API](https://img.shields.io/badge/Pexels_API-05A081?style=for-the-badge&logo=pexels&logoColor=white)

![Wikipedia API](https://img.shields.io/badge/Wikipedia_API-000000?style=for-the-badge&logo=wikipedia&logoColor=white)
![Open-Meteo](https://img.shields.io/badge/Open--Meteo-0078D4?style=for-the-badge&logoColor=white)
![Geoapify](https://img.shields.io/badge/Geoapify-00A86B?style=for-the-badge&logoColor=white)
![Photon Geocoding](https://img.shields.io/badge/Photon_Geocoding-6A5ACD?style=for-the-badge&logoColor=white)

![Google Gemini API](https://img.shields.io/badge/Google_Gemini_API-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)


> [!IMPORTANT]
>
> - **Destination Discovery** powered by Wikipedia, Geoapify, Open-Meteo, Unsplash, and Pexels APIs.
> - **Interactive Travel Packages** with filtering, booking, reviews, and map integration.
> - **Custom Itinerary Builder** with PDF export support.
> - **OTP Authentication** using email verification.
> - **Smart Backend Caching** to reduce external API requests and improve performance.
> - **AI-Assisted Content Generation** using Google Gemini during backend seeding.


# 🚀 Setup & Installation

## Prerequisites

- Node.js (v16+ recommended)
- MongoDB Atlas Account or Local MongoDB
- API Keys for external services

---

## 1️⃣ Clone Repository

```bash
git clone <your-repository-url>
cd AuraAvenue
```

---

## 2️⃣ Backend Setup

```bash
cd Server

npm install
```

Create your `.env` file before running the server.

---

## 3️⃣ Seed Database (Optional)

Populate initial destinations and travel packages:

```bash
cd Server

node src/seed/seedPackages.js
```

You may also execute additional seed scripts located inside:

```bash
Server/src/seed/
```

---

## 4️⃣ Run Backend Server

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

---

## 5️⃣ Frontend Setup

Open a new terminal:

```bash
cd Client

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## 6️⃣ Access Application

Open your browser and visit:

```text
http://localhost:5173
```

---
