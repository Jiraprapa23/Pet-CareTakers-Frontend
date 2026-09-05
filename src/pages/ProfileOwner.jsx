import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Profileowner.css';
import logo from '../assets/logo.png';
import NotificationBell from '../components/NotificationBell';

import { API_BASE_URL as API } from '../config';

function ProfileOwner() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const id = user.ownerID || location.state?.ownerID;
        if (!id) { navigate('/'); return; }
        const res = await fetch(`${API}/api/auth/profile-owner/${id}`);
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const calcAge = (dateStr) => {
    if (!dateStr) return '';
    const birth = new Date(dateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) return (
    <div className="app-layout">
      <div className="loading-box">กำลังโหลดข้อมูล...</div>
    </div>
  );

  const imageUrl = profile?.profileImage && profile.profileImage !== 'default.png'
    ? `/images/owners/${profile.profileImage}`
    : null;

  return (
    <div className="app-layout">

      {/* =================== Topbar =================== */}
      <div className="topbar">
        <div className="topbar-left">
          <img src={logo} alt="logo" className="topbar-logo" />
          <div className="topbar-title">
            ระบบตามหาผู้ดูแลสัตว์เลี้ยง<br />ภายในจังหวัดเชียงใหม่
          </div>
        </div>
        <div className="topbar-user">
          <span>ยินดีต้อนรับ คุณ{profile?.firstname}</span>
          <NotificationBell userID={user.ownerID} userRole="OWNER" />
          <div className="topbar-avatar">
            {imageUrl
              ? <img src={imageUrl} alt="avatar" />
              : <span style={{ fontSize: 18 }}>👤</span>}
          </div>
        </div>
      </div>

      {/* =================== Body =================== */}
      <div className="body-row">

        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-menu">
            <a className="menu-item active" onClick={() => navigate('/profile-owner')}>
              <span className="menu-icon">👤</span>
              <span>โปรไฟล์ของฉัน</span>
            </a>
            <a className="menu-item" onClick={() => navigate('/my-pets')}>
              <span className="menu-icon">🐾</span>
              <span>รายการสัตว์เลี้ยง</span>
            </a>
            <a className="menu-item" onClick={() => navigate('/explore-sitters')}>
              <span className="menu-icon">🔍</span>
              <span>ค้นหาผู้ดูแล</span>
            </a>
            <a className="menu-item" onClick={() => navigate('/my-announcements')}>
              <span className="menu-icon">📢</span>
              <span>รายการประกาศ</span>
            </a>
          </div>
          <hr className="menu-divider" />
          <a className="menu-item menu-logout" onClick={handleLogout}>
            <span className="menu-icon">🚪</span>
            <span>ออกจากระบบ</span>
          </a>
        </div>

        {/* Main */}
        <div className="main-content">

          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-card-title">โปรไฟล์ของฉัน</div>

            <div className="profile-body">
              <div className="profile-avatar">
                {imageUrl
                  ? <img src={imageUrl} alt="profile" />
                  : <span className="profile-avatar-placeholder">👤</span>}
              </div>

              <div className="profile-info">
                <div className="info-section-title">ข้อมูลส่วนตัว</div>

                <div className="info-row">
                  <span className="info-label">ชื่อ-นามสกุล : </span>
                  {profile?.firstname} {profile?.lastname}
                  &nbsp;&nbsp;&nbsp;
                  <span className="info-label">เพศ : </span>
                  {profile?.gender}
                </div>

                <div className="info-row">
                  <span className="info-label">วันเกิด : </span>
                  {formatDate(profile?.birtdate)}
                  &nbsp;&nbsp; อายุ {calcAge(profile?.birtdate)} ปี
                </div>

                <div className="info-row">
                  <span className="info-label">หมายเลขโทรศัพท์ : </span>
                  {profile?.phoneNumber}
                </div>

                <div className="info-row">
                  <span className="info-label">อีเมล : </span>
                  {profile?.email}
                </div>

                <div className="info-row">
                  <span className="info-label">ที่อยู่ : </span>
                  บ้านเลขที่ {profile?.addressNo} ถนน/เขต {profile?.street}&nbsp;
                  ตำบล {profile?.subdistrict} อำเภอ {profile?.district}&nbsp;
                  จังหวัด {profile?.province} รหัสไปรษณีย์ {profile?.zipcode}
                </div>

                <div className="info-row">
                  <span className="info-label">ที่อยู่จากปักหมุด </span>
                  <span className="info-pin">📍</span>
                  <span>
                    บ้านเลขที่ {profile?.addressNo} ถนน/เขต {profile?.street}&nbsp;
                    ตำบล {profile?.subdistrict} อำเภอ {profile?.district}&nbsp;
                    จังหวัด {profile?.province} รหัสไปรษณีย์ {profile?.zipcode}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons — นอกกรอบ ชิดใต้ card */}
          <div className="btn-group">
            <button className="btn btn-edit" onClick={() => navigate('/edit-owner')}>
              ✏️ แก้ไข
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProfileOwner;
