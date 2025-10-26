import React from "react";
import { Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import StatisticSection from "./components/StatisticSection";
import Features from "./components/Features";
import Contact from "./components/Contact";
import LoginPage from "./pages/LoginPage";
import ScrollToTop from "./components/ScrollToTop";
import DashboardPage from "./pages/DashboardPage";
import GroupDashboardPage from "./pages/GroupDashboardPage";
import DashboardNavbar from "./components/DashboardNavbar";
import SettingsPage from "./pages/SettingsPage";
import TransactionHistoryPage from "./pages/TransactionHistoryPage";
import StatsPage from "./pages/StatsPage";
import GroupMembersPage from "./pages/GroupMembersPage";
const HomePage = () => {
  return (
    <>
      <Header />
      <StatisticSection />
      <Features />
      <Contact />
    </>
  );
};

function App() {
  return (
    <div className="scroll-smooth">
      <ScrollToTop />
      <Routes>
        {/* Trang chủ, chỉ hiển thị Navbar của trang giới thiệu web */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <HomePage />
            </>
          }
        />
        {/* Trang đăng nhập */}
        <Route path="/login" element={<LoginPage />} />
        {/* Trang Dashboard, hiển thị DashboardNavbar */}
        <Route
          path="/dashboard"
          element={
            <>
              <DashboardNavbar />
              <DashboardPage />
            </>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <>
              <DashboardNavbar />
              <SettingsPage />
            </>
          }
        />
        {/* Trang Dashboar cho từng nhóm */}
        <Route
          path="/dashboard/:id"
          element={
            <>
              <DashboardNavbar />
              <GroupDashboardPage />
            </>
          }
        />
        {/* Các trang khác */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/transactions" element={<TransactionHistoryPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/groups/:id/members" element={<GroupMembersPage />} />
      </Routes>
    </div>
  );
}

export default App;
