import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';

import Login from './pages/Login';
import AllRegister from './pages/AllRegister';


import RegisterOwner from './pages/RegisterOwner';
import ProfileOwner from './pages/ProfileOwner';
import EditOwner from './pages/EditOwner';

import RegisterSitter from './pages/RegisterSitter';
import ProfileSitter from './pages/ProfileSitter';
import EditSitter from './pages/EditSitter';

import AddPet from './pages/AddPet';
import MyPets from './pages/MyPets';
import PetDetail from './pages/PetDetail';
import EditPet from './pages/EditPet';

import ExploreSitters from './pages/ExploreSitters';
import SitterProfile from './pages/SitterProfile';

import AddAnnouncement from './pages/AddAnnouncement';
import MyAnnouncements from './pages/MyAnnouncements';
import AnnouncementDetail from './pages/AnnouncementDetail';
import EditAnnouncement from './pages/EditAnnouncement';

import ExploreAnnouncements from './pages/ExploreAnnouncements';
import AnnouncementDetailSitter from './pages/AnnouncementDetailSitter';
import MyApplications from './pages/MyApplications';
import PaymentPage from './pages/PaymentPage';
import ReviewPage from './pages/ReviewPage';
import ReviewPageSitter from './pages/ReviewPageSitter';
import ActiveJobsPage from './pages/ActiveJobsPage';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<LandingPage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<AllRegister />} />
        <Route path="/register-owner" element={<RegisterOwner />} />
        <Route path="/register-sitter" element={<RegisterSitter />} />
        <Route path="/profile-owner" element={<ProfileOwner />} />
        <Route path="/profile-sitter" element={<ProfileSitter />} />
        <Route path="/edit-owner" element={<EditOwner />} />
        <Route path="/edit-sitter" element={<EditSitter />} />
        <Route path="/add-pet" element={<AddPet />} />
        <Route path="/my-pets" element={<MyPets />} />
        <Route path="/pet-detail/:petID" element={<PetDetail />} />
        <Route path="/edit-pet/:petID" element={<EditPet />} />
        <Route path="/explore-sitters" element={<ExploreSitters />} />
        <Route path="/sitter-profile/:sitterID" element={<SitterProfile />} />
        <Route path="/add-announcement" element={<AddAnnouncement />} />
        <Route path="/my-announcements" element={<MyAnnouncements />} />
        <Route path="/announcement-detail/:announceID" element={<AnnouncementDetail />} />
        <Route path="/edit-announcement/:announceID" element={<EditAnnouncement />} />
        <Route path="/explore-announcements" element={<ExploreAnnouncements />} />
        <Route path="/announcement-detail-sitter/:announceID" element={<AnnouncementDetailSitter />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/payment/:announceID" element={<PaymentPage />} />
        <Route path="/review/:announceID" element={<ReviewPage />} />
        <Route path="/review-sitter/:announceID" element={<ReviewPageSitter />} />
        <Route path="/active-jobs" element={<ActiveJobsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;