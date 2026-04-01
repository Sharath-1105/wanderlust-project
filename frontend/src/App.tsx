import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import BookTrip from "./pages/BookTrip";
import MyTrips from "./pages/MyTrips";
import Register from "./pages/Register";
import MyWishlist from "./pages/MyWishlist";
import ExplorePlaces from "./pages/ExplorePlaces";
import AdminDashboard from "./pages/AdminDashboard";
import AITripPlanner from "./pages/AITripPlanner";



function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/book-trip" element={<BookTrip />} />
      <Route path="/my-trips" element={<MyTrips />} />
      <Route path="/register" element={<Register />} />
      <Route path="/my-wishlist" element={<MyWishlist />} />
      <Route path="/explore" element={<ExplorePlaces />} />
      <Route path="/ai-trip" element={<AITripPlanner />} />


    </Routes>
  );
}

export default App;



