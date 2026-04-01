// Quick diagnostic — run with: node test-booking.js
// Logs in, then tries booking, shows exact error

const BASE = "http://localhost:5000/api";

async function run() {
  // 1. Login
  console.log("--- Logging in ---");
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@test.com", password: "123456" }),
  });
  const loginData = await loginRes.json();
  console.log("Login status:", loginRes.status, JSON.stringify(loginData).slice(0, 200));

  const token = loginData.token;
  if (!token) {
    console.error("No token received. Check credentials above.");
    return;
  }

  // 2. Try booking
  console.log("\n--- Booking trip ---");
  const places = [
    {
      name: "Hampi",
      state: "Karnataka",
      district: "Vijayanagara, Karnataka",
      location: "Vijayanagara, Karnataka",
      type: "Heritage",
      image: "",
      description: "UNESCO site",
      entryFee: 1200,
      transportCost: 0,
      price: 1200,
      rating: 0,
    },
  ];

  const bookBody = JSON.stringify({
    places,
    days: 2,
    persons: 1,
    startDate: "2026-05-01",
  });

  console.log("Sending body length:", bookBody.length);
  console.log("places[0] type:", typeof places[0]);

  const bookRes = await fetch(`${BASE}/trips`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: bookBody,
  });
  const bookData = await bookRes.json();
  console.log("Booking status:", bookRes.status);
  console.log("Booking response:", JSON.stringify(bookData, null, 2));
}

run().catch(console.error);
