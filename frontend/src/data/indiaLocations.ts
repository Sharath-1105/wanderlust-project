// ─── indiaLocations.ts ──────────────────────────────────────────────────────
// Complete mapping of Indian states → major districts/cities.
// Used by the searchable FromLocation dropdown in BookTrip and AITripPlanner.

export interface StateOption {
  value: string;
  label: string;
  flag: string;
}

export interface DistrictOption {
  value: string;
  label: string;
}

export const INDIA_STATES: StateOption[] = [
  { value: "Karnataka",        label: "Karnataka",        flag: "🌿" },
  { value: "Kerala",           label: "Kerala",           flag: "🌴" },
  { value: "Goa",              label: "Goa",              flag: "🏖️" },
  { value: "Tamil Nadu",       label: "Tamil Nadu",       flag: "🏛️" },
  { value: "Maharashtra",      label: "Maharashtra",      flag: "🌆" },
  { value: "Rajasthan",        label: "Rajasthan",        flag: "🏰" },
  { value: "Himachal Pradesh", label: "Himachal Pradesh", flag: "⛰️" },
  { value: "Uttarakhand",      label: "Uttarakhand",      flag: "🗻" },
  { value: "Andhra Pradesh",   label: "Andhra Pradesh",   flag: "🌊" },
  { value: "West Bengal",      label: "West Bengal",      flag: "🌸" },
  { value: "Gujarat",          label: "Gujarat",          flag: "🦁" },
  { value: "Madhya Pradesh",   label: "Madhya Pradesh",   flag: "🐯" },
  { value: "Punjab",           label: "Punjab",           flag: "🌾" },
  { value: "Bihar",            label: "Bihar",            flag: "🕌" },
  { value: "Odisha",           label: "Odisha",           flag: "🕍" },
  { value: "Assam",            label: "Assam",            flag: "🦏" },
  { value: "Meghalaya",        label: "Meghalaya",        flag: "🌧️" },
  { value: "Sikkim",           label: "Sikkim",           flag: "🏔️" },
  { value: "Jammu & Kashmir",  label: "Jammu & Kashmir",  flag: "❄️" },
  { value: "Ladakh",           label: "Ladakh",           flag: "🦅" },
  { value: "Telangana",        label: "Telangana",        flag: "🌾" },
  { value: "Jharkhand",        label: "Jharkhand",        flag: "🌳" },
  { value: "Chhattisgarh",     label: "Chhattisgarh",     flag: "🦋" },
  { value: "Manipur",          label: "Manipur",          flag: "🌺" },
  { value: "Nagaland",         label: "Nagaland",         flag: "🎭" },
  { value: "Uttar Pradesh",    label: "Uttar Pradesh",    flag: "🕌" },
  { value: "Haryana",          label: "Haryana",          flag: "🌾" },
  { value: "Delhi",            label: "Delhi",            flag: "🏙️" },
];

// State → major cities/districts for the dependent dropdown
export const STATE_DISTRICTS: Record<string, string[]> = {
  "Karnataka": [
    "Bangalore", "Mysore", "Mangalore", "Hubli", "Belgaum",
    "Shimoga", "Tumkur", "Davangere", "Bijapur", "Gulbarga",
    "Raichur", "Hassan", "Chikmagalur", "Kodagu", "Udupi",
  ],
  "Kerala": [
    "Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur", "Kannur",
    "Kollam", "Alappuzha", "Palakkad", "Kottayam", "Malappuram",
    "Idukki", "Wayanad", "Kasaragod", "Pathanamthitta",
  ],
  "Goa": [
    "Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda",
    "Calangute", "Candolim", "Anjuna", "Palolem",
  ],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
    "Tirunelveli", "Vellore", "Erode", "Thoothukudi", "Ooty",
    "Kodaikanal", "Thanjavur", "Kanchipuram", "Cuddalore",
  ],
  "Maharashtra": [
    "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad",
    "Solapur", "Thane", "Kolhapur", "Amravati", "Nanded",
    "Mahabaleshwar", "Lonavala", "Shirdi", "Ratnagiri", "Sindhudurg",
  ],
  "Rajasthan": [
    "Jaipur", "Jodhpur", "Udaipur", "Ajmer", "Jaisalmer",
    "Bikaner", "Kota", "Alwar", "Bharatpur", "Pushkar",
    "Sawai Madhopur", "Chittorgarh", "Sikar", "Dungarpur",
  ],
  "Himachal Pradesh": [
    "Shimla", "Manali", "Dharamsala", "Solan", "Mandi",
    "Kasol", "Dalhousie", "Chamba", "Kullu", "Spiti",
    "Kinnaur", "Bilaspur", "Hamirpur",
  ],
  "Uttarakhand": [
    "Dehradun", "Haridwar", "Rishikesh", "Nainital", "Mussoorie",
    "Roorkee", "Haldwani", "Almora", "Ranikhet", "Auli",
    "Kedarnath", "Badrinath", "Pithoragarh",
  ],
  "Andhra Pradesh": [
    "Visakhapatnam", "Vijayawada", "Tirupati", "Guntur", "Kakinada",
    "Rajahmundry", "Nellore", "Kurnool", "Anantapur", "Srikakulam",
    "Araku Valley", "Lepakshi",
  ],
  "West Bengal": [
    "Kolkata", "Darjeeling", "Siliguri", "Asansol", "Durgapur",
    "Howrah", "Malda", "Murshidabad", "Cooch Behar", "Bankura",
    "Sundarbans", "Shantiniketan",
  ],
  "Gujarat": [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar",
    "Jamnagar", "Gandhinagar", "Junagadh", "Bhuj", "Dwarka",
    "Somnath", "Rann of Kutch",
  ],
  "Madhya Pradesh": [
    "Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain",
    "Sagar", "Satna", "Rewa", "Khajuraho", "Pachmarhi",
    "Orchha", "Kanha", "Bandhavgarh",
  ],
  "Punjab": [
    "Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda",
    "Mohali", "Pathankot", "Gurdaspur", "Hoshiarpur", "Ferozepur",
  ],
  "Bihar": [
    "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga",
    "Nalanda", "Rajgir", "Bodh Gaya", "Vaishali", "Motihari",
  ],
  "Odisha": [
    "Bhubaneswar", "Cuttack", "Puri", "Rourkela", "Sambalpur",
    "Berhampur", "Konark", "Chilika", "Simlipal", "Koraput",
  ],
  "Assam": [
    "Guwahati", "Dibrugarh", "Jorhat", "Silchar", "Tezpur",
    "Nagaon", "Kaziranga", "Manas", "Majuli",
  ],
  "Meghalaya": [
    "Shillong", "Cherrapunji", "Tura", "Mawlynnong", "Dawki",
    "Jowai", "Nongstoin",
  ],
  "Sikkim": [
    "Gangtok", "Pelling", "Namchi", "Lachung", "Yuksom",
    "Ravangla", "Mangan",
  ],
  "Jammu & Kashmir": [
    "Srinagar", "Jammu", "Gulmarg", "Pahalgam", "Sonamarg",
    "Dachigam", "Patnitop", "Vaishno Devi",
  ],
  "Ladakh": [
    "Leh", "Kargil", "Nubra Valley", "Pangong", "Zanskar",
    "Diskit", "Hanle",
  ],
  "Telangana": [
    "Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam",
    "Medak", "Nagarjuna Sagar",
  ],
  "Jharkhand": [
    "Ranchi", "Jamshedpur", "Dhanbad", "Hazaribagh", "Deoghar",
    "Betla", "Rajrappa",
  ],
  "Chhattisgarh": [
    "Raipur", "Bilaspur", "Durg", "Korba", "Jagdalpur",
    "Chitrakote", "Bastar",
  ],
  "Manipur": [
    "Imphal", "Ukhrul", "Tamenglong", "Senapati", "Chandel",
  ],
  "Nagaland": [
    "Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha",
  ],
  "Uttar Pradesh": [
    "Lucknow", "Varanasi", "Agra", "Prayagraj", "Kanpur",
    "Mathura", "Vrindavan", "Ayodhya", "Noida", "Ghaziabad",
    "Meerut", "Bareilly", "Aligarh", "Gorakhpur",
  ],
  "Haryana": [
    "Gurugram", "Faridabad", "Panipat", "Ambala", "Hisar",
    "Rohtak", "Karnal", "Kurukshetra",
  ],
  "Delhi": [
    "New Delhi", "Connaught Place", "Dwarka", "Rohini", "Karol Bagh",
    "Saket", "Janakpuri", "Lajpat Nagar",
  ],
};

/**
 * Returns react-select options for the districts of the given state.
 */
export function getDistrictOptions(state: string): DistrictOption[] {
  const districts = STATE_DISTRICTS[state] || [];
  return districts.map((d) => ({ value: d, label: d }));
}

/**
 * Returns all state options formatted for react-select with flag prefix.
 */
export function getStateSelectOptions() {
  return INDIA_STATES.map((s) => ({
    value: s.value,
    label: `${s.flag} ${s.label}`,
  }));
}
