import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AnalyzeContract from "./pages/AnalyzeContract";
import ContractHistory from "./pages/ContractHistory";
import ContractDetails from "./pages/ContractDetails";

import "./App.css";


function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
  path="/dashboard"
  element={<Dashboard />}
/>
     <Route
  path="/analyze"
  element={<AnalyzeContract />}

/>

<Route
  path="/contract/:id"
  element={<ContractDetails />}
/>

<Route
  path="/history"
  element={<ContractHistory />}
/>
    </Routes>
  );
}

export default App;