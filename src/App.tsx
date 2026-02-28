import { BrowserRouter, Routes, Route } from "react-router";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import PaymentPage from "@/pages/PaymentPage";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import ProfilePage from "@/components/ProfilePage";

import AdminLayout from "@/pages/admin/AdminLayout";
import CreateSubject from "@/pages/admin/CreateSubject";
import CreateMentor from "@/pages/admin/CreateMentor";
import ManageBooking from "@/pages/admin/ManageBooking";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={
            
            <SignedIn><AdminLayout /></SignedIn>
            
            }>

            
           
            <Route path="create-subject" element={<CreateSubject />} />
            <Route path="create-mentor" element={<CreateMentor />} />
            <Route path="bookings" element={<ManageBooking />} />
          </Route>
          <Route path="mentors/:mentorId" element={<ProfilePage />} />
          <Route
            path="/dashboard"
            element={
              <>
                <SignedIn>
                  <DashboardPage />


                </SignedIn>
                <SignedOut>
                  <LoginPage />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/payment/:sessionId"
            element={
              <>
                <SignedIn>
                  <PaymentPage />
                </SignedIn>
                <SignedOut>
                  <LoginPage />
                </SignedOut>
              </>
            }
          />
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
