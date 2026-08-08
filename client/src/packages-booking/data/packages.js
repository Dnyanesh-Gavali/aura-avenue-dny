import { images } from "./imageUrls";

const packages = [
  {
    id: 1,
    title: "Bali Escape",
    location: "Indonesia",
    country: "Indonesia",
    continent: "Asia",
    category: "International",
    type: "Beach",
    duration: "5 Days / 4 Nights",
    price: 34999,
    originalPrice: 42999,
    rating: 4.8,
    image: images.packages.bali,
    features: ["Hotel", "Breakfast", "Flight"],
    badge: "Bestseller",
    itinerary: [
      "Ubud Temple Tour",
      "Nusa Penida Island",
      "Tanah Lot Sunset"
    ]
  },

  {
    id: 2,
    title: "Swiss Alps",
    location: "Switzerland",
    country: "Switzerland",
    continent: "Europe",
    category: "International",
    type: "Mountains",
    duration: "7 Days / 6 Nights",
    price: 79999,
    originalPrice: 89999,
    rating: 4.9,
    image: images.packages.switzerland,
    features: ["Hotel", "Guide", "Meals"],
    badge: "Luxury",
    itinerary: [
      "Jungfraujoch Excursion",
      "Lucerne City Tour",
      "Mt. Titlis Cable Ride"
    ]
  },

  {
    id: 3,
    title: "Goa Beach",
    location: "Goa,India",
    country: "India",
    continent: "Asia",
    category: "India",
    type: "Beach",
    duration: "4 Days / 3 Nights",
    price: 18999,
    originalPrice: 22999,
    rating: 4.7,
    image: images.packages.goa,
    features: ["Resort", "Breakfast", "Pickup"],
    badge: "Popular",
    itinerary: [
      "Baga Beach",
      "Fort Aguada",
      "Mandovi River Cruise"
    ]
  },

  {
    id: 4,
    title: "Kashmir Paradise",
    location: "Jammu & Kashmir, India",
    country: "India",
    continent: "Asia",
    category: "India",
    type: "Mountains",
    duration: "6 Days / 5 Nights",
    price: 32999,
    originalPrice: 38999,
    rating: 4.9,
    image: images.packages.kashmir,
    features: ["Hotel", "Meals", "Guide"],
    badge: "Trending",
    itinerary: [
      "Dal Lake Shikara Ride",
      "Gulmarg Gondola",
      "Pahalgam Valley"
    ]

  },

  {
    id: 5,
    title: "Dubai Luxury Tour",
    location: "Dubai, UAE",
    country: "UAE",
    continent: "Asia",
    category: "International",
    type: "Luxury",
    duration: "5 Days / 4 Nights",
    price: 56999,
    originalPrice: 64999,
    rating: 4.8,
    image: images.packages.dubai,
    features: ["Hotel", "Flight", "Breakfast"],
    badge: "Luxury",
    itinerary: [
      "Burj Khalifa",
      "Desert Safari",
      "Dubai Marina Cruise"
    ]
  },

  {
    id: 6,
    title: "Maldives Honeymoon",
    location: "Maldives",
    country: "Maldives",
    continent: "Asia",
    category: "International",
    type: "Beach",
    duration: "5 Days / 4 Nights",
    price: 72999,
    originalPrice: 82999,
    rating: 5.0,
    image: images.packages.maldives,
    features: ["Resort", "Flight", "Meals"],
    badge: "Premium",
    itinerary: [
      "Water Villa Stay",
      "Snorkeling Adventure",
      "Sunset Dolphin Cruise"
    ]
  },

  {
  id: 7,
  title: "Kerala Backwaters",
  location: "Kerala, India",
  country: "India",
  continent: "Asia",
  category: "India",
  type: "Nature",
  duration: "5 Days / 4 Nights",
  price: 27999,
  originalPrice: 32999,
  rating: 4.8,
  image: images.packages.kerela,
  features: ["Houseboat", "Breakfast", "Hotel"],
  badge: "Bestseller",
  itinerary: [
    "Alleppey Houseboat Stay",
    "Munnar Tea Gardens",
    "Kochi Heritage Tour"
  ]
},

{
  id: 8,
  title: "Rajasthan Royal Tour",
  location: "Jaipur, Jodhpur & Udaipur",
  country: "India",
  continent: "Asia",
  category: "India",
  type: "Heritage",
  duration: "6 Days / 5 Nights",
  price: 31999,
  originalPrice: 37999,
  rating: 4.7,
  image: images.packages.rajasthan,
  features: ["Hotel", "Breakfast", "Guide"],
  badge: "Popular",
  itinerary: [
    "Amber Fort",
    "Mehrangarh Fort",
    "Lake Pichola Boat Ride"
  ]
},

{
  id: 9,
  title: "Ladakh Adventure",
  location: "Leh & Nubra Valley",
  country: "India",
  continent: "Asia",
  category: "India",
  type: "Adventure",
  duration: "7 Days / 6 Nights",
  price: 38999,
  originalPrice: 44999,
  rating: 4.9,
  image: images.packages.ladakh,
  features: ["Hotel", "Bike Ride", "Guide"],
  badge: "Trending",
  itinerary: [
    "Pangong Lake",
    "Khardung La Pass",
    "Nubra Valley Camp"
  ]
},

{
  id: 10,
  title: "Andaman Island Escape",
  location: "Port Blair & Havelock",
  country: "India",
  continent: "Asia",
  category: "India",
  type: "Beach",
  duration: "5 Days / 4 Nights",
  price: 34999,
  originalPrice: 40999,
  rating: 4.8,
  image: images.packages.andaman,
  features: ["Resort", "Breakfast", "Cruise"],
  badge: "Premium",
  itinerary: [
    "Radhanagar Beach",
    "Scuba Diving",
    "Cellular Jail Light Show"
  ]
},

{
  id: 11,
  title: "Shimla & Manali",
  location: "Himachal Pradesh",
  country: "India",
  continent: "Asia",
  category: "India",
  type: "Mountains",
  duration: "6 Days / 5 Nights",
  price: 24999,
  originalPrice: 29999,
  rating: 4.7,
  image: images.packages.shimla,
  features: ["Hotel", "Breakfast", "Sightseeing"],
  badge: "Bestseller",
  itinerary: [
    "Mall Road",
    "Solang Valley",
    "Rohtang Pass"
  ]
},

{
  id: 12,
  title: "Golden Triangle",
  location: "Delhi • Agra • Jaipur",
  country: "India",
  continent: "Asia",
  category: "India",
  type: "City",
  duration: "5 Days / 4 Nights",
  price: 29999,
  originalPrice: 35999,
  rating: 4.8,
  image: images.packages.goldentriangle,
  features: ["Hotel", "Guide", "Breakfast"],
  badge: "Popular",
  itinerary: [
    "India Gate",
    "Taj Mahal",
    "Hawa Mahal"
  ]
},

{
  id: 13,
  title: "Thailand Explorer",
  location: "Phuket & Krabi, Thailand",
  country: "Thailand",
  continent: "Asia",
  category: "International",
  type: "Beach",
  duration: "6 Days / 5 Nights",
  price: 39999,
  originalPrice: 46999,
  rating: 4.8,
  image: images.packages.thailand,
  features: ["Hotel", "Breakfast", "Flight"],
  badge: "Bestseller",
  itinerary: [
    "Phi Phi Islands",
    "Krabi Four Islands Tour",
    "Patong Beach"
  ]
},

{
  id: 14,
  title: "Singapore Discovery",
  location: "Singapore",
  country: "Singapore",
  continent: "Asia",
  category: "International",
  type: "City",
  duration: "5 Days / 4 Nights",
  price: 54999,
  originalPrice: 61999,
  rating: 4.9,
  image: images.packages.singapore,
  features: ["Hotel", "Breakfast", "UNI Studios"],
  badge: "Premium",
  itinerary: [
    "Marina Bay Sands",
    "Gardens by the Bay",
    "Sentosa Island"
  ]
},

{
  id: 15,
  title: "Japan Cherry Blossom",
  location: "Tokyo & Kyoto, Japan",
  country: "Japan",
  continent: "Asia",
  category: "International",
  type: "Luxury",
  duration: "7 Days / 6 Nights",
  price: 109999,
  originalPrice: 124999,
  rating: 5.0,
  image: images.packages.japan,
  features: ["Hotel", "Breakfast", "Bullet Train"],
  badge: "Luxury",
  itinerary: [
    "Mount Fuji",
    "Kyoto Temples",
    "Shibuya Crossing"
  ]
},

{
  id: 16,
  title: "Vietnam Adventure",
  location: "Hanoi & Ha Long Bay",
  country: "Vietnam",
  continent: "Asia",
  category: "International",
  type: "Adventure",
  duration: "6 Days / 5 Nights",
  price: 46999,
  originalPrice: 52999,
  rating: 4.8,
  image: images.packages.vietnam,
  features: ["Hotel", "Breakfast", "Cruise"],
  badge: "Popular",
  itinerary: [
    "Ha Long Bay Cruise",
    "Old Quarter Tour",
    "Ninh Binh Excursion"
  ]
},

{
  id: 17,
  title: "Malaysia Escape",
  location: "Kuala Lumpur & Langkawi",
  country: "Malaysia",
  continent: "Asia",
  category: "International",
  type: "City",
  duration: "5 Days / 4 Nights",
  price: 44999,
  originalPrice: 50999,
  rating: 4.7,
  image: images.packages.malayisa,
  features: ["Hotel", "Breakfast", "Flight"],
  badge: "Bestseller",
  itinerary: [
    "Petronas Twin Towers",
    "Langkawi Sky Bridge",
    "Batu Caves"
  ]
},

{
  id: 18,
  title: "Sri Lanka Serenity",
  location: "Colombo & Bentota",
  country: "Sri Lanka",
  continent: "Asia",
  category: "International",
  type: "Beach",
  duration: "5 Days / 4 Nights",
  price: 42999,
  originalPrice: 48999,
  rating: 4.8,
  image: images.packages.srilanka,
  features: ["Resort", "Breakfast", "Sightseeing"],
  badge: "Premium",
  itinerary: [
    "Bentota Beach",
    "Galle Fort",
    "Colombo City Tour"
  ]
},
{
  id: 19,
  title: "Paris Romance",
  location: "Paris, France",
  country: "France",
  continent: "Europe",
  category: "International",
  type: "Luxury",
  duration: "6 Days / 5 Nights",
  price: 129999,
  originalPrice: 144999,
  rating: 4.9,
  image: images.packages.paris,
  features: ["Hotel", "Breakfast", "Flight"],
  badge: "Luxury",
  itinerary: [
    "Eiffel Tower",
    "Louvre Museum",
    "Seine River Cruise"
  ]
},

{
  id: 20,
  title: "London Highlights",
  location: "London, United Kingdom",
  country: "United Kingdom",
  continent: "Europe",
  category: "International",
  type: "City",
  duration: "6 Days / 5 Nights",
  price: 124999,
  originalPrice: 139999,
  rating: 4.8,
  image: images.packages.london,
  features: ["Hotel", "Breakfast", "Sightseeing"],
  badge: "Bestseller",
  itinerary: [
    "Big Ben",
    "London Eye",
    "Buckingham Palace"
  ]
},

{
  id: 21,
  title: "Santorini Dreams",
  location: "Santorini, Greece",
  country: "Greece",
  continent: "Europe",
  category: "International",
  type: "Beach",
  duration: "6 Days / 5 Nights",
  price: 139999,
  originalPrice: 154999,
  rating: 5.0,
  image: images.packages.santorini,
  features: ["Luxury Resort", "Breakfast", "Cruise"],
  badge: "Premium",
  itinerary: [
    "Oia Sunset",
    "Red Beach",
    "Caldera Cruise"
  ]
},

{
  id: 22,
  title: "Turkey Wonders",
  location: "Istanbul & Cappadocia",
  country: "Turkey",
  continent: "Europe",
  category: "International",
  type: "Heritage",
  duration: "7 Days / 6 Nights",
  price: 89999,
  originalPrice: 99999,
  rating: 4.8,
  image: images.packages.turkey,
  features: ["Hotel", "Breakfast", "Guide"],
  badge: "Trending",
  itinerary: [
    "Blue Mosque",
    "Hot Air Balloon Ride",
    "Grand Bazaar"
  ]
},

{
  id: 23,
  title: "Sydney Explorer",
  location: "Sydney, Australia",
  country: "Australia",
  continent: "Australia",
  category: "International",
  type: "City",
  duration: "7 Days / 6 Nights",
  price: 149999,
  originalPrice: 164999,
  rating: 4.9,
  image: images.packages.sydney,
  features: ["Hotel", "Breakfast", "Flight"],
  badge: "Premium",
  itinerary: [
    "Sydney Opera House",
    "Bondi Beach",
    "Blue Mountains Tour"
  ]
},

{
  id: 24,
  title: "New York City Lights",
  location: "New York, USA",
  country: "United States",
  continent: "North America",
  category: "International",
  type: "City",
  duration: "6 Days / 5 Nights",
  price: 159999,
  originalPrice: 174999,
  rating: 4.9,
  image: images.packages.newyork,
  features: ["Hotel", "Breakfast", "City Pass"],
  badge: "Bestseller",
  itinerary: [
    "Statue of Liberty",
    "Times Square",
    "Central Park"
  ]
},
];

export default packages;