import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
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
import { RouteProgressBar } from "./components/PageTransition";

function PageWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
      }}
    >
      {children}
    </div>
  );
}

function App() {
  return (
    <>
      <RouteProgressBar />
      <Routes>
        <Route path="/"                element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/admin-login"     element={<PageWrapper><AdminLogin /></PageWrapper>} />
        <Route path="/dashboard"       element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/admin-dashboard" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
        <Route path="/book-trip"       element={<PageWrapper><BookTrip /></PageWrapper>} />
        <Route path="/my-trips"        element={<PageWrapper><MyTrips /></PageWrapper>} />
        <Route path="/register"        element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/my-wishlist"     element={<PageWrapper><MyWishlist /></PageWrapper>} />
        <Route path="/explore"         element={<PageWrapper><ExplorePlaces /></PageWrapper>} />
        <Route path="/ai-trip"         element={<PageWrapper><AITripPlanner /></PageWrapper>} />
      </Routes>
    </>
  );
}

export default App;
