import OpenAI from "openai";
import { calcCosts, TRANSPORT_RATES } from "../utils/costUtils.js";

// ─── State-keyed place database ──────────────────────────────────────────────
// Each state has a curated list of real destinations with interest tags
const STATE_PLACES = {
  "Karnataka": [
    { name: "Hampi", location: "Vijayanagara, Karnataka", description: "A UNESCO World Heritage Site with surreal boulder-strewn landscape and magnificent ruins of the Vijayanagara Empire. A photographer's paradise.", baseCost: 1200, type: "Heritage", interests: ["Heritage", "Photography", "Backpacking"] },
    { name: "Mysore Palace", location: "Mysuru, Karnataka", description: "One of the most visited monuments in India, this opulent palace illuminated by 97,000 lights on Sunday evenings is a testament to royal grandeur.", baseCost: 1300, type: "Heritage", interests: ["Heritage", "City"] },
    { name: "Coorg (Kodagu)", location: "Madikeri, Karnataka", description: "Scotland of India — known for coffee plantations, dense forests, waterfalls, and the warm hospitality of the Kodava people.", baseCost: 1700, type: "Hill", interests: ["Mountains", "Nature", "Photography"] },
    { name: "Chikmagalur", location: "Chikkamagaluru, Karnataka", description: "The birthplace of coffee in India, surrounded by misty hills, dense forests, and sprawling coffee estates. Ideal for trekking and nature stays.", baseCost: 1500, type: "Hill", interests: ["Mountains", "Adventure", "Photography"] },
    { name: "Kabini Wildlife Sanctuary", location: "Kabini, Karnataka", description: "Famous for its exceptional leopard, elephant, and tiger sightings. The Kabini reservoir at sunset is one of the most photographed wildlife scenes in India.", baseCost: 3000, type: "Forest", interests: ["Wildlife", "Photography"] },
    { name: "Bangalore City", location: "Bengaluru, Karnataka", description: "Silicon Valley of India — Cubbon Park, Lalbagh, UB City, Vidhana Soudha, and a world-class food and nightlife scene.", baseCost: 1400, type: "City", interests: ["City", "Food"] },
    { name: "Gokarna Beach", location: "Gokarna, Karnataka", description: "A tranquil beach town with pristine unspoiled beaches — Om Beach, Kudle Beach, and Paradise Beach — away from the Goa crowds. Great for backpackers.", baseCost: 1100, type: "Beach", interests: ["Beach", "Spirituality", "Backpacking"] },
    { name: "Murudeshwar", location: "Uttara Kannada, Karnataka", description: "Home to the world's second tallest Shiva statue, perched on a rocky headland next to a beautiful beach. A unique blend of spirituality and scenery.", baseCost: 1000, type: "Heritage", interests: ["Spirituality", "Beach", "Photography"] },
    { name: "Badami Cave Temples", location: "Bagalkot, Karnataka", description: "Rock-cut cave temples carved in the 6th century CE by the Chalukya dynasty — a stunning showcase of ancient Dravidian architecture.", baseCost: 900, type: "Heritage", interests: ["Heritage", "Photography"] },
    { name: "Dudhsagar Falls", location: "Belagavi, Karnataka", description: "One of India's highest waterfalls at 310 metres, surrounded by dense Western Ghats jungle. Best visited during or after monsoon season.", baseCost: 1200, type: "Forest", interests: ["Adventure", "Photography", "Wildlife"] },
  ],
  "Kerala": [
    { name: "Alleppey Backwaters", location: "Alappuzha, Kerala", description: "Experience Kerala's iconic houseboat network through lush paddy fields and coconut groves — quintessential God's Own Country at its finest.", baseCost: 2500, type: "Beach", interests: ["Beach", "Photography", "Heritage"] },
    { name: "Munnar Tea Gardens", location: "Idukki, Kerala", description: "A misty highland retreat with rolling tea plantations, rare Neelakurinji flowers, and tranquil lakes. Perfect for nature and photography lovers.", baseCost: 1600, type: "Hill", interests: ["Mountains", "Photography"] },
    { name: "Kovalam Beach", location: "Thiruvananthapuram, Kerala", description: "A crescent-shaped beach with calm waters, lined with coconut palms. Known for Ayurvedic resorts, seafood, and spectacular sunsets.", baseCost: 2000, type: "Beach", interests: ["Beach", "Food", "Backpacking"] },
    { name: "Periyar Wildlife Sanctuary", location: "Thekkady, Kerala", description: "Elephant herds, tigers, and exotic birdlife around a serene lake in the Cardamom Hills. Boat safaris through misty forests are magical.", baseCost: 1800, type: "Forest", interests: ["Wildlife", "Photography"] },
    { name: "Varkala Cliff Beach", location: "Varkala, Kerala", description: "A unique cliffside beach with natural springs, red laterite cliffs, yoga retreats, and a laid-back backpacker vibe.", baseCost: 1200, type: "Beach", interests: ["Beach", "Spirituality", "Backpacking"] },
    { name: "Wayanad", location: "Wayanad, Kerala", description: "Lush hill district with dense rainforests, tribal villages, Edakkal Caves, and Banasura Sagar Dam. One of Kerala's best-kept secrets.", baseCost: 1500, type: "Forest", interests: ["Wildlife", "Adventure", "Photography"] },
    { name: "Fort Kochi", location: "Ernakulam, Kerala", description: "A charming blend of Portuguese, Dutch, and British colonial heritage. Famous for Chinese fishing nets, art galleries, cafes, and the Kerala Biennale.", baseCost: 1300, type: "Heritage", interests: ["Heritage", "Photography", "Food"] },
    { name: "Kumarakom Bird Sanctuary", location: "Kottayam, Kerala", description: "A paradise for birdwatchers — migratory birds from Siberia, egrets, herons, and kingfishers in a stunning backwater setting.", baseCost: 1400, type: "Forest", interests: ["Wildlife", "Photography"] },
    { name: "Sabarimala & Pathanamthitta", location: "Pathanamthitta, Kerala", description: "One of India's most important pilgrimage destinations, set in the forests of the Western Ghats. The spiritual journey through the jungle is unique.", baseCost: 1000, type: "Heritage", interests: ["Spirituality", "Adventure"] },
  ],
  "Goa": [
    { name: "North Goa Beaches", location: "Calangute, Goa", description: "Baga, Calangute, Anjuna — Goa's most vibrant stretch with beach shacks, water sports, flea markets, and electrifying nightlife.", baseCost: 2500, type: "Beach", interests: ["Beach", "Food", "Adventure"] },
    { name: "South Goa Beaches", location: "Palolem, Goa", description: "Palolem, Agonda, Cabo de Rama — quieter, more pristine beaches with turquoise water, dolphins, and a relaxed boho vibe.", baseCost: 2000, type: "Beach", interests: ["Beach", "Photography", "Backpacking"] },
    { name: "Old Goa Churches", location: "Panaji, Goa", description: "A UNESCO World Heritage Site — Basilica of Bom Jesus, Se Cathedral, and St. Francis of Assisi. The best-preserved Portuguese colonial architecture in Asia.", baseCost: 600, type: "Heritage", interests: ["Heritage", "Photography"] },
    { name: "Dudhsagar Falls (Goa)", location: "Sanguem, Goa", description: "Spectacular four-tiered waterfall on the Goa-Karnataka border. Best approached by jeep or train through lush rainforest.", baseCost: 1200, type: "Forest", interests: ["Adventure", "Photography", "Wildlife"] },
    { name: "Panaji & Latin Quarter", location: "Panaji, Goa", description: "Goa's charming capital with colourful Portuguese houses in Fontainhas, the State Museum, and lively Miramar Beach promenade.", baseCost: 800, type: "City", interests: ["Heritage", "City", "Photography"] },
    { name: "Bondla Wildlife Sanctuary", location: "North Goa, Goa", description: "Goa's smallest sanctuary, home to gaurs, deer, peacocks, and rare birds. Perfect for a quiet half-day nature escape.", baseCost: 700, type: "Forest", interests: ["Wildlife", "Photography"] },
    { name: "Goa Food & Spice Tours", location: "Ponda, Goa", description: "Visit spice plantations, sample Goan cuisine — vindaloo, xacuti, bebinca, feni — and explore the unique blend of Indian and Portuguese flavours.", baseCost: 1500, type: "City", interests: ["Food", "Heritage"] },
  ],
  "Tamil Nadu": [
    { name: "Meenakshi Amman Temple", location: "Madurai, Tamil Nadu", description: "A towering 17th-century Dravidian temple complex with 14 gopurams covered in thousands of coloured sculptures. One of India's greatest architectural wonders.", baseCost: 800, type: "Heritage", interests: ["Heritage", "Spirituality", "Photography"] },
    { name: "Ooty Nilgiri Hills", location: "Ooty, Tamil Nadu", description: "The Queen of Hill Stations — Nilgiri Mountain Railway (UNESCO), Botanical Gardens, Ooty Lake, and miles of tea and eucalyptus plantations.", baseCost: 1600, type: "Hill", interests: ["Mountains", "Photography"] },
    { name: "Kodaikanal", location: "Dindigul, Tamil Nadu", description: "Princess of Hill Stations — the star-shaped Kodai Lake, Coaker's Walk, Pillar Rocks, and endemic Kurinji flowers every 12 years.", baseCost: 1400, type: "Hill", interests: ["Mountains", "Photography", "Adventure"] },
    { name: "Marina Beach", location: "Chennai, Tamil Nadu", description: "The world's second longest beach at 13 km, fronting a vibrant city with museums, churches, and extraordinary street food culture.", baseCost: 600, type: "Beach", interests: ["Beach", "City", "Food"] },
    { name: "Mahabalipuram Shore Temple", location: "Chengalpattu, Tamil Nadu", description: "A UNESCO World Heritage Site with 7th-century rock-cut monuments overlooking the Bay of Bengal. The Shore Temple at sunset is unforgettable.", baseCost: 900, type: "Heritage", interests: ["Heritage", "Photography"] },
    { name: "Rameswaram Temple", location: "Ramanathapuram, Tamil Nadu", description: "One of the twelve Jyotirlinga shrines, connected to mainland India by the Pamban Bridge. Sacred, serene, and surrounded by the sea.", baseCost: 700, type: "Heritage", interests: ["Spirituality", "Heritage"] },
    { name: "Mudumalai Wildlife Sanctuary", location: "Nilgiris, Tamil Nadu", description: "Part of the Nilgiri Biosphere Reserve, home to elephants, tigers, leopards, and gaurs. Linked to Bandipur and Nagarhole for corridor wildlife.", baseCost: 2000, type: "Forest", interests: ["Wildlife", "Photography"] },
    { name: "Tranquebar (Tharangambadi)", location: "Nagapattinam, Tamil Nadu", description: "A forgotten Danish colonial port with the Dansborg Fort, an 1620 church, and a serene beach. Perfect for slow travel and history enthusiasts.", baseCost: 600, type: "Heritage", interests: ["Heritage", "Photography", "Backpacking"] },
  ],
  "Maharashtra": [
    { name: "Mumbai City Tour", location: "Mumbai, Maharashtra", description: "Gateway of India, Marine Drive, Dharavi, Bollywood studios, Elephanta Caves, and some of India's finest restaurants and street food.", baseCost: 1800, type: "City", interests: ["City", "Food", "Heritage"] },
    { name: "Ajanta & Ellora Caves", location: "Aurangabad, Maharashtra", description: "Two UNESCO World Heritage Sites — Ajanta's 2nd-century Buddhist paintings and Ellora's Hindu, Buddhist, and Jain rock-cut temples. A must-visit.", baseCost: 1500, type: "Heritage", interests: ["Heritage", "Photography"] },
    { name: "Lonavala & Khandala", location: "Pune, Maharashtra", description: "A popular hill station with the Lion's Point viewpoint, Bhushi Dam waterfalls, and scenic valley views — perfect for a monsoon escape.", baseCost: 1200, type: "Hill", interests: ["Mountains", "Adventure"] },
    { name: "Mahabaleshwar", location: "Satara, Maharashtra", description: "King of hill stations in Maharashtra — three river sources, Arthur's Seat cliff, Venna Lake, and famous strawberry farms.", baseCost: 1400, type: "Hill", interests: ["Mountains", "Photography"] },
    { name: "Konkan Coastline", location: "Ratnagiri, Maharashtra", description: "A stunning 720 km coastline with pristine beaches, Malgund's mango orchards, Ratnagiri Fort, and the exceptional Alphonso mango culture.", baseCost: 1300, type: "Beach", interests: ["Beach", "Food", "Photography"] },
    { name: "Shirdi Sai Baba Temple", location: "Ahmednagar, Maharashtra", description: "One of India's most visited pilgrimage sites, drawing devotees from all faiths. The atmosphere is deeply peaceful and spiritually charged.", baseCost: 600, type: "Heritage", interests: ["Spirituality"] },
    { name: "Tadoba Tiger Reserve", location: "Chandrapur, Maharashtra", description: "Maharashtra's oldest national park with the highest concentration of tigers. Excellent sighting rates make this Central India's best safari.", baseCost: 3000, type: "Forest", interests: ["Wildlife", "Photography"] },
    { name: "Pune Heritage", location: "Pune, Maharashtra", description: "Shaniwar Wada, Aga Khan Palace, Osho International Meditation Resort, vibrant Koregaon Park cafe culture, and the city's thriving food scene.", baseCost: 1200, type: "City", interests: ["Heritage", "City", "Food"] },
  ],
  "Rajasthan": [
    { name: "Jaipur (Pink City)", location: "Jaipur, Rajasthan", description: "The Pink City with Amber Fort, Hawa Mahal, Jantar Mantar (UNESCO), and one of India's best bazaars for textiles, jewellery, and handicrafts.", baseCost: 2000, type: "Heritage", interests: ["Heritage", "Photography", "City"] },
    { name: "Jodhpur (Blue City)", location: "Jodhpur, Rajasthan", description: "The Sun City — Mehrangarh Fort dominates a sea of blue-painted houses. Mandore Gardens, Umaid Bhawan Palace, and incredible Rajasthani cuisine.", baseCost: 1800, type: "Heritage", interests: ["Heritage", "Photography", "Food"] },
    { name: "Udaipur (City of Lakes)", location: "Udaipur, Rajasthan", description: "The most romantic city in India — Lake Pichola, City Palace, Jagmandir, and Fateh Sagar. A fairy-tale destination of palaces and gardens.", baseCost: 2200, type: "Heritage", interests: ["Heritage", "Photography"] },
    { name: "Jaisalmer (Golden City)", location: "Jaisalmer, Rajasthan", description: "A sandcastle city rising from the Thar Desert, with the living Jaisalmer Fort, intricately carved havelis, and magical camel safari sunsets.", baseCost: 2500, type: "Heritage", interests: ["Heritage", "Photography", "Adventure", "Backpacking"] },
    { name: "Ranthambore National Park", location: "Sawai Madhopur, Rajasthan", description: "Famous for tigers that boldly roam near ancient ruins. The dramatic landscape of forts and dense forests makes wildlife photography exceptional.", baseCost: 3000, type: "Forest", interests: ["Wildlife", "Photography"] },
    { name: "Pushkar", location: "Ajmer, Rajasthan", description: "A sacred lake town famous for the Camel Fair, vibrant bazaars, Brahma Temple (unique in India), and a laid-back backpacker culture.", baseCost: 900, type: "Heritage", interests: ["Spirituality", "Heritage", "Backpacking"] },
    { name: "Bikaner", location: "Bikaner, Rajasthan", description: "The Camel City — Junagarh Fort, Karni Mata rat temple, dalbaati churma, and some of the finest textile and embroidery work in Rajasthan.", baseCost: 1200, type: "Heritage", interests: ["Heritage", "Food", "Photography"] },
  ],
  "Himachal Pradesh": [
    { name: "Manali", location: "Kullu, Himachal Pradesh", description: "Gateway to Spiti and Leh — snow-capped Rohtang Pass, ancient Hadimba Temple, Old Manali cafes, and adventure sports on the Beas River.", baseCost: 2200, type: "Hill", interests: ["Mountains", "Adventure", "Photography"] },
    { name: "Mcleod Ganj & Dharamshala", location: "Kangra, Himachal Pradesh", description: "Home of the Dalai Lama — Tibetan culture, momos, dharamsalas, Triund trek, and the dramatic Dhauladhar range backdrop.", baseCost: 1300, type: "Hill", interests: ["Mountains", "Spirituality", "Backpacking", "Photography"] },
    { name: "Spiti Valley", location: "Lahaul & Spiti, Himachal Pradesh", description: "A remote cold desert valley with ancient monasteries (Key, Tabo, Dhankar), dramatic lunar landscapes, and some of the world's highest villages.", baseCost: 3000, type: "Hill", interests: ["Adventure", "Photography", "Spirituality", "Backpacking"] },
    { name: "Shimla", location: "Shimla, Himachal Pradesh", description: "Former summer capital of British India — The Mall Road, Christ Church, Viceregal Lodge, and the UNESCO Toy Train through the Shivalik Hills.", baseCost: 1800, type: "Hill", interests: ["Mountains", "Heritage", "City"] },
    { name: "Kasol & Kheerganga", location: "Kullu, Himachal Pradesh", description: "Backpacker haven on the Parvati River with stunning treks to Kheerganga hot springs, Malana village, and the magic of the Parvati Valley.", baseCost: 1200, type: "Hill", interests: ["Backpacking", "Adventure", "Photography"] },
    { name: "Dalhousie & Khajjiar", location: "Chamba, Himachal Pradesh", description: "A quiet colonial hill station paired with Khajjiar — India's own mini Switzerland, a circular meadow surrounded by deodar forests and Dhauladhars.", baseCost: 1500, type: "Hill", interests: ["Mountains", "Photography"] },
  ],
  "Uttarakhand": [
    { name: "Rishikesh", location: "Tehri Garhwal, Uttarakhand", description: "Adventure Capital of India — white water rafting, bungee jumping, zip-lining, yoga ashrams, and camping on the banks of the Ganga.", baseCost: 2000, type: "Hill", interests: ["Adventure", "Spirituality", "Backpacking"] },
    { name: "Haridwar", location: "Haridwar, Uttarakhand", description: "Gateway to Char Dham — the Har ki Pauri evening Ganga Aarti is one of the most spectacular spiritual experiences in India.", baseCost: 800, type: "Heritage", interests: ["Spirituality", "Photography"] },
    { name: "Nainital", location: "Nainital, Uttarakhand", description: "The Lake District of India — Naini Lake, Snow View Point, Naina Devi Temple, and the lively Mall Road surrounded by the Kumaon hills.", baseCost: 1600, type: "Hill", interests: ["Mountains", "City", "Photography"] },
    { name: "Valley of Flowers", location: "Chamoli, Uttarakhand", description: "A UNESCO World Heritage Site bursting with hundreds of alpine flower varieties in monsoon. The trek is one of India's most scenic.", baseCost: 2500, type: "Forest", interests: ["Mountains", "Photography", "Adventure"] },
    { name: "Jim Corbett National Park", location: "Nainital, Uttarakhand", description: "India's oldest national park — Bengal tiger, leopard, elephant, and over 600 bird species in dense sal and riverine forests.", baseCost: 2800, type: "Forest", interests: ["Wildlife", "Photography"] },
    { name: "Auli Ski Resort", location: "Chamoli, Uttarakhand", description: "India's best ski slopes with panoramic views of Nanda Devi and surrounding peaks. The cable car from Joshimath is the longest in Asia.", baseCost: 2500, type: "Hill", interests: ["Adventure", "Photography"] },
    { name: "Mussoorie", location: "Dehradun, Uttarakhand", description: "Queen of Hill Stations — Mall Road, Kempty Falls, Landour heritage walks, and cloud-level views of the Doon Valley.", baseCost: 1700, type: "Hill", interests: ["Mountains", "Heritage", "Photography"] },
  ],
  "Andhra Pradesh": [
    { name: "Tirupati Balaji Temple", location: "Tirupati, Andhra Pradesh", description: "One of the world's most visited pilgrimage sites — the Sri Venkateswara Temple on the Tirumala Hills draws millions of devotees annually.", baseCost: 1200, type: "Heritage", interests: ["Spirituality", "Heritage"] },
    { name: "Araku Valley", location: "Visakhapatnam, Andhra Pradesh", description: "A scenic tribal hill station with coffee plantations, tribal museums, Borra Caves, and the spectacular Kirandul railway journey.", baseCost: 1400, type: "Hill", interests: ["Mountains", "Photography", "Adventure"] },
    { name: "Visakhapatnam Beach", location: "Visakhapatnam, Andhra Pradesh", description: "City of Destiny — INS Kurusura submarine museum, Kailasagiri hilltop park, RK Beach, and a thriving seafood culture.", baseCost: 1100, type: "Beach", interests: ["Beach", "City", "Food"] },
    { name: "Lepakshi & Penukonda", location: "Anantapur, Andhra Pradesh", description: "The Veerabhadra Temple at Lepakshi has the country's largest Nandi monolith and stunning Vijayanagara murals. A hidden gem.", baseCost: 700, type: "Heritage", interests: ["Heritage", "Photography"] },
  ],
  "West Bengal": [
    { name: "Darjeeling Tea Country", location: "Darjeeling, West Bengal", description: "The Queen of Hills — UNESCO Toy Train, Happy Valley Tea Estate, Tiger Hill sunrise over Kanchenjunga, and some of the world's finest tea.", baseCost: 2000, type: "Hill", interests: ["Mountains", "Photography", "Food"] },
    { name: "Kolkata Heritage Walk", location: "Kolkata, West Bengal", description: "City of Joy — Victoria Memorial, Indian Museum, Howrah Bridge, Marble Palace, and one of India's richest food cultures from kathi rolls to mishti doi.", baseCost: 1200, type: "City", interests: ["Heritage", "City", "Food", "Photography"] },
    { name: "Sundarbans", location: "South 24 Parganas, West Bengal", description: "UNESCO mangrove forest and Bengal tiger habitat — boat safaris through tidal rivers, bird-rich mudflats, and a hauntingly beautiful landscape.", baseCost: 2500, type: "Forest", interests: ["Wildlife", "Photography", "Adventure"] },
    { name: "Murshidabad", location: "Murshidabad, West Bengal", description: "Former capital of Bengal's Nawabs — the Hazarduari Palace, Imambara, and riverine landscape make this one of India's most atmospheric heritage destinations.", baseCost: 900, type: "Heritage", interests: ["Heritage", "Photography"] },
  ],
  "Gujarat": [
    { name: "Rann of Kutch", location: "Bhuj, Gujarat", description: "The Great White Desert — a surreal moonscape during Rann Utsav festival, with extraordinary salt flats, tribal craft villages, and wild ass sanctuary.", baseCost: 2000, type: "Other", interests: ["Photography", "Heritage", "Wildlife"] },
    { name: "Ahmedabad Heritage", location: "Ahmedabad, Gujarat", description: "India's first UNESCO World Heritage City — Sabarmati Ashram, Sidi Saiyyed Mosque, Adalaj stepwell, and one of India's best street food cultures.", baseCost: 1300, type: "City", interests: ["Heritage", "Food", "City"] },
    { name: "Gir National Park", location: "Junagadh, Gujarat", description: "The last home of the Asiatic lion — India's most unique wildlife experience with guaranteed lion sightings in a dry deciduous forest.", baseCost: 2500, type: "Forest", interests: ["Wildlife", "Photography"] },
    { name: "Dwarka & Somnath", location: "Devbhoomi Dwarka, Gujarat", description: "Two of the twelve Jyotirlinga shrines on the Arabian Sea coast. Spiritually significant and visually spectacular at sunset.", baseCost: 1100, type: "Heritage", interests: ["Spirituality", "Heritage"] },
  ],
};

// Add generic fallback for states not in DB
const GENERIC_PLACES = [
  { name: "State Capital Heritage Walk", location: "Capital City", description: "Explore the cultural heart of the state — museums, historical monuments, art galleries, and local cuisine.", baseCost: 1200, type: "City", interests: ["Heritage", "City", "Food"] },
  { name: "Regional Wildlife Reserve", location: "Forest Area", description: "A protected wildlife area with endemic species, guided forest safaris, and nature trails through biodiverse landscapes.", baseCost: 2000, type: "Forest", interests: ["Wildlife", "Photography", "Adventure"] },
  { name: "Coastal or Hill Retreat", location: "Natural Area", description: "Scenic natural surroundings perfect for photography, trekking, and experiencing the authentic local way of life.", baseCost: 1500, type: "Hill", interests: ["Mountains", "Photography", "Backpacking"] },
];

// ─── State-specific tips and context ─────────────────────────────────────────
const STATE_CONTEXT = {
  "Karnataka": { bestTime: "Oct–Mar (pleasant weather across all regions)", language: "Kannada", currency: "₹ (UPI widely accepted)", food: "Bisi Bele Bath, Masala Dosa, Mysore Pak, Filter Coffee" },
  "Kerala": { bestTime: "Sep–Mar (post-monsoon lush & cool)", language: "Malayalam", currency: "₹ (UPI widely accepted)", food: "Appam & Stew, Sadya, Kerala Fish Curry, Puttu & Kadala" },
  "Goa": { bestTime: "Nov–Feb (dry, cool, beach-perfect)", language: "Konkani/English", currency: "₹", food: "Fish Curry Rice, Vindaloo, Bebinca, Xacuti, Goan Sausages, Feni" },
  "Tamil Nadu": { bestTime: "Nov–Feb (cool & dry)", language: "Tamil", currency: "₹", food: "Idli Sambar, Chettinad Chicken, Pongal, Filter Coffee, Appam" },
  "Maharashtra": { bestTime: "Oct–Mar (post-monsoon to winter)", language: "Marathi", currency: "₹", food: "Vada Pav, Misal Pav, Puran Poli, Bombil Fry, Shreekhand" },
  "Rajasthan": { bestTime: "Oct–Mar (pleasant desert winter)", language: "Hindi/Rajasthani", currency: "₹", food: "Dal Baati Churma, Laal Maas, Ghevar, Bajre ki Roti, Ker Sangri" },
  "Himachal Pradesh": { bestTime: "Apr–Jun & Sep–Nov (avoid monsoon landslides)", language: "Hindi/Pahari", currency: "₹", food: "Chha Gosht, Sidu, Aktori, Dham, Babru" },
  "Uttarakhand": { bestTime: "Mar–Jun & Sep–Nov (avoid monsoon for trekking)", language: "Hindi/Garhwali", currency: "₹", food: "Kafuli, Bhaang ki Chutney, Bal Mithai, Aloo ke Gutke" },
  "Andhra Pradesh": { bestTime: "Oct–Feb (pleasant)", language: "Telugu", currency: "₹", food: "Hyderabadi Biryani, Pesarattu, Gongura Mutton, Pulihora" },
  "West Bengal": { bestTime: "Oct–Feb (Durga Puja season and winter)", language: "Bengali", currency: "₹", food: "Rosogolla, Macher Jhol, Kathi Roll, Mishti Doi, Beguni" },
  "Gujarat": { bestTime: "Oct–Mar (Rann Utsav Nov–Feb)", language: "Gujarati", currency: "₹", food: "Dhokla, Undhiyu, Thepla, Khandvi, Fafda, Jalebi" },
};

const MEAL_TEMPLATES = {
  default: [
    ["Breakfast: Local dhaba breakfast with chai", "Lunch: Regional thali at a well-rated local restaurant", "Dinner: Street food exploration at the evening market"],
    ["Breakfast: South Indian breakfast or hotel buffet", "Lunch: Local speciality at a mid-range restaurant", "Dinner: Rooftop restaurant with regional cuisine"],
    ["Breakfast: Fresh fruits and chai from a local shop", "Lunch: Packed lunch or dhabha quickstop", "Dinner: Campfire/hotel dinner with local delicacies"],
  ],
};

const ACTIVITY_TEMPLATES = {
  morning: ["Morning: Early visit to the main attraction (beat the crowds)", "Morning: Guided heritage walk through the old quarter", "Morning: Sunrise viewpoint or nature trail", "Morning: Yoga session by the riverside or hilltop"],
  afternoon: ["Afternoon: Local market exploration and souvenir shopping", "Afternoon: Museum or cultural centre visit", "Afternoon: Relaxing at the hotel or scenic viewpoint", "Afternoon: Cooking class or local food tasting"],
  evening: ["Evening: Sunset viewpoint or lake promenade", "Evening: Cultural show or Light & Sound spectacle", "Evening: Local folk performance or temple ceremony", "Evening: Waterfront walk and street food hunt"],
};

const TIPS_POOL = [
  "Carry a reusable water bottle — most tourist spots have water refill stations.",
  "Book accommodations and popular attractions in advance during peak season.",
  "Download Google Translate with the local language for offline use.",
  "Negotiate at local markets — friendly bargaining is expected and welcomed.",
  "Use Ola or Rapido for transport — always safer and more reliable than flagging autos.",
  "Keep ₹10–₹50 notes handy for tips, chai stalls, and local transport.",
  "Eat where locals eat — small dhabas often serve the most authentic and affordable food.",
  "Respect local customs — dress modestly when visiting temples and religious sites.",
  "The best street food is found at morning and evening markets, not tourist areas.",
  "Keep photocopies of your ID separate from the originals.",
];

// ─── State-aware local plan generator ────────────────────────────────────────
function generateLocalPlan(budget, days, interests, state, fromLocation, transport, distance) {
  const stateName = state || "India";
  const from = fromLocation || "Your Location";

  // Get places for selected state (or generic)
  let statePlaces = STATE_PLACES[stateName] || GENERIC_PLACES;

  // Filter by interests (keep all if no match found)
  let matched = statePlaces.filter(p =>
    p.interests && interests.some(i => p.interests.includes(i))
  );
  if (matched.length < 2) matched = statePlaces; // fallback to all state places

  // Deduplicate by name
  const seen = new Set();
  const unique = matched.filter(p => {
    if (seen.has(p.name)) return false;
    seen.add(p.name);
    return true;
  });

  // Sort affordable first
  const sorted = unique.sort((a, b) => a.baseCost - b.baseCost);
  const selectedPlaces = sorted.slice(0, Math.min(6, Math.max(2, sorted.length)));

  const dailyBudget = Math.floor(budget / days);
  const placesPerDay = Math.min(3, Math.max(1, Math.ceil(selectedPlaces.length / days)));

  // Build itinerary
  const itinerary = [];
  for (let d = 1; d <= days; d++) {
    const groupIdx = (d - 1) % Math.ceil(selectedPlaces.length / placesPerDay);
    const dayPlaces = selectedPlaces
      .filter((_, i) => Math.floor(i / placesPerDay) === groupIdx)
      .slice(0, placesPerDay);

    const placeNames = dayPlaces.length > 0
      ? dayPlaces.map(p => p.name)
      : [selectedPlaces[0]?.name || `${stateName} Exploration`];

    const actIdx = (d - 1) % 4;
    const activities = [
      ACTIVITY_TEMPLATES.morning[actIdx % ACTIVITY_TEMPLATES.morning.length],
      `Afternoon: Visit ${placeNames[Math.min(1, placeNames.length - 1)]} — explore highlights`,
      ACTIVITY_TEMPLATES.evening[actIdx % ACTIVITY_TEMPLATES.evening.length],
    ];

    const mealIdx = (d - 1) % MEAL_TEMPLATES.default.length;
    const meals = MEAL_TEMPLATES.default[mealIdx];
    const estimatedDayCost = Math.min(
      dailyBudget,
      dayPlaces.reduce((sum, p) => sum + (p.baseCost || 1500), 0) + 600
    );

    itinerary.push({
      day: d,
      title: d === 1 ? `Arrival & ${placeNames[0]}` : d === days ? `${placeNames[0]} & Departure` : `Day ${d} — ${placeNames.join(" & ")}`,
      places: placeNames,
      activities,
      meals,
      estimatedDayCost,
    });
  }

  const totalEstimatedCost = Math.min(budget, itinerary.reduce((s, d) => s + d.estimatedDayCost, 0));
  const ctx = STATE_CONTEXT[stateName] || { bestTime: "October to March", food: "Local cuisine" };
  const tips = [
    ...TIPS_POOL.sort(() => Math.random() - 0.5).slice(0, 3),
    ctx.food ? `Must-try local food: ${ctx.food}` : null,
    ctx.language ? `Local language: ${ctx.language} — learn a few phrases for a warmer welcome!` : null,
  ].filter(Boolean);

  // ── Cost breakdown (same formula as booking system) ─────────
  const costs = calcCosts({
    places: selectedPlaces,
    days:      Number(days),
    persons:   1,           // per-person base — frontend multiplies by actual persons
    transport: transport || "",
    distance:  Number(distance) || 200,  // default 200 km if not provided
  });

  // ── Route order: fromLocation → places in visit order ────────
  const routeOrder = [
    from,
    ...selectedPlaces.map(p => p.name),
    from,  // return
  ];

  const places = selectedPlaces.map(p => ({
    name: p.name,
    type: p.type,
    location: p.location,
    description: p.description,
    estimatedCost: p.baseCost,
  }));

  return {
    title: `${days}-Day ${stateName} Trip — ${interests.slice(0, 2).join(" & ")}`,
    summary: `A curated ${days}-day itinerary across ${stateName} starting from ${from}, focused on ${interests.join(", ")}, crafted to fit your ₹${budget.toLocaleString()} budget.`,
    state: stateName,
    fromLocation: from,
    transport: transport || "",
    distance: Number(distance) || 200,
    routeOrder,
    placeCost:     costs.placeCost,
    transportCost: costs.transportCost,
    foodCost:      costs.foodCost,
    totalEstimatedCost: costs.totalCost,
    places,
    itinerary,
    tips,
    bestTimeToVisit: ctx.bestTime || "October to March",
  };
}

// ─── Lazy OpenAI client ──────────────────────────────────────────────────────
const getClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your-openai-api-key-here") return null;
  return new OpenAI({ apiKey });
};

// ─── POST /api/ai-trip ───────────────────────────────────────────────────────
export const generateTripPlan = async (req, res) => {
  try {
    const { budget, days, interests, state, fromLocation, transport, distance } = req.body;

    if (!budget || !days || !interests)
      return res.status(400).json({ msg: "budget, days, and interests are required" });
    if (!state)
      return res.status(400).json({ msg: "Please select an Indian state" });
    if (Number(days) < 1 || Number(days) > 30)
      return res.status(400).json({ msg: "Days must be between 1 and 30" });
    if (Number(budget) < 500)
      return res.status(400).json({ msg: "Minimum budget is ₹500" });

    const interestList = Array.isArray(interests) ? interests : [interests];
    const from = fromLocation || "Your Location";
    const km   = Number(distance) || 200;
    const rate  = TRANSPORT_RATES[transport] || 0;

    // ── Try OpenAI if key is configured ──────────────────────────────────────
    const openai = getClient();
    if (openai) {
      try {
        const transportNote = transport
          ? `The traveller uses ${transport} (₹${rate}/km). Distance from ${from} to ${state} ≈ ${km} km (one-way).`
          : `The traveller uses self-arranged transport.`;

        const prompt = `You are an expert Indian travel planner specializing in ${state}.
Create a detailed ${days}-day trip itinerary for someone travelling FROM ${from} TO places within ${state}.
Budget: ₹${budget} | Interests: ${interestList.join(", ")}.
${transportNote}

STRICT RULES:
1. ALL places MUST be within ${state} only.
2. Day 1 should start with arrival/travel from ${from}.
3. Suggest route order — places should be geographically logical (minimize back-tracking).
4. Last day should include departure back toward ${from}.

Respond ONLY with valid JSON matching this exact schema:
{
  "title": "Short title mentioning ${state}",
  "summary": "One sentence overview mentioning ${from} → ${state}",
  "state": "${state}",
  "fromLocation": "${from}",
  "transport": "${transport || ""}",
  "routeOrder": ["${from}", "Place 1", "Place 2", "...", "${from}"],
  "placeCost": 5000,
  "transportCost": ${rate * km * 2},
  "foodCost": ${Number(days) * 3 * 150},
  "totalEstimatedCost": 12000,
  "places": [
    { "name": "Place Name", "type": "Beach|Hill|City|Forest|Heritage", "location": "City, ${state}", "description": "2-3 sentences", "estimatedCost": 2000 }
  ],
  "itinerary": [
    { "day": 1, "title": "Travel from ${from} & Arrival", "places": ["Place 1"], "activities": ["Morning: Depart from ${from}", "Afternoon: ...", "Evening: ..."], "meals": ["Breakfast: ...", "Lunch: ...", "Dinner: ..."], "estimatedDayCost": 1500 }
  ],
  "tips": ["State-specific tip 1", "Tip 2", "Tip 3"],
  "bestTimeToVisit": "Month range"
}
Rules: Only real places in ${state}. Exactly ${days} days. Total within ₹${budget}.`;

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a travel assistant. Respond with valid JSON only. No markdown, no extra text." },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 2500,
        });

        const rawText = completion.choices[0]?.message?.content?.trim() || "";
        const cleaned = rawText.replace(/^```[a-z]*\n?/i, "").replace(/```$/i, "").trim();
        const plan = JSON.parse(cleaned);
        return res.json({ success: true, plan, source: "openai" });
      } catch (openaiErr) {
        if (openaiErr?.status === 401 || openaiErr?.status === 429) {
          return res.status(openaiErr.status).json({ msg: openaiErr.status === 401 ? "Invalid OpenAI API key." : "OpenAI rate limit. Try again later." });
        }
        console.warn("OpenAI failed, using local generator:", openaiErr?.message);
      }
    }

    // ── Local generator fallback ──────────────────────────────────────────────
    const plan = generateLocalPlan(Number(budget), Number(days), interestList, state, from, transport, km);
    res.json({ success: true, plan, source: "local" });

  } catch (err) {
    console.error("AI Trip Error:", err?.message || err);
    res.status(500).json({ msg: "Failed to generate trip plan. Please try again." });
  }
};
