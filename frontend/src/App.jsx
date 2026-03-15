import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Results from "./pages/Results";
import Wishlist from "./pages/Wishlist";
import Alerts from "./pages/Alerts";
import CompareView from "./pages/CompareView";
import CompareBar from "./components/CompareBar";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/results" element={<Results />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/compare" element={<CompareView />} />
      </Routes>
      <CompareBar />
    </BrowserRouter>
  );
}

export default App;
