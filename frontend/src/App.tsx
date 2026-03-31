import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import BookTrip from "./pages/BookTrip";
import MyTrips from "./pages/MyTrips";
import Register from "./pages/Register";



function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/book-trip" element={<BookTrip />} />
      <Route path="/my-trips" element={<MyTrips />} />
      <Route path="/register" element={<Register />} />


    </Routes>
  );
}

export default App;



