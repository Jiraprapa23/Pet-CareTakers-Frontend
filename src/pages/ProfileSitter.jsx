import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ProfileSitter.css';
import logo from '../assets/logo.png';
import NotificationBell from '../components/NotificationBell';

import { API_BASE_URL as API } from '../config';

function ProfileSitter() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const id = user.sitterID || location.state?.sitterID;
        if (!id) { navigate('/'); return; }
        const res = await fetch(`${API}/api/auth/profile-sitter/${id}`);
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

  const openMap = () => {
    if (profile?.latitude && profile?.longitude) {
      window.open(`https://www.google.com/maps?q=${profile.latitude},${profile.longitude}`, '_blank');
    }
  };

  if (loading) return (
    <div className="app-layout">
      <div className="loading-box">กำลังโหลดข้อมูล...</div>
    </div>
  );

  const imageUrl = profile?.sitterImage && profile.sitterImage !== 'default.png'
    ? `/images/sitters/${profile.sitterImage}`
    : null;

  const qrUrl = profile?.qrCodeImage && profile.qrCodeImage !== 'default.png'
    ? `/images/qrcodes/${profile.qrCodeImage}`
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
          <NotificationBell userID={user.sitterID} userRole="SITTER" />
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
            <a className="menu-item active" onClick={() => navigate('/profile-sitter')}>
              <span className="menu-icon">👤</span>
              <span>โปรไฟล์ของฉัน</span>
            </a>
            <a className="menu-item" onClick={() => navigate('/explore-announcements')}>
              <span className="menu-icon">🔍</span>
              <span>ค้นหาประกาศ</span>
            </a>
            <a className="menu-item" onClick={() => navigate('/my-applications')}>
              <span className="menu-icon">📝</span>
              <span>คำขอที่ส่งแล้ว</span>
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

          {/* Profile Card — รวมทุกอย่างในการ์ดเดียว เหมือนฝั่งเจ้าของ */}
          <div className="profile-card">
            <div className="profile-card-title">ข้อมูลส่วนตัว</div>

            <div className="profile-body">
              <div className="profile-avatar">
                {imageUrl
                  ? <img src={imageUrl} alt="profile" />
                  : <span className="profile-avatar-placeholder">👤</span>}
              </div>

              <div className="profile-info">
                <div className="info-row">
                  <span className="info-label">ชื่อ-นามสกุล : </span>
                  {profile?.firstname} {profile?.lastname}
                  &nbsp;&nbsp;&nbsp;
                  <span className="info-label">เพศ : </span>
                  {profile?.gender}
                </div>

                <div className="info-row">
                  <span className="info-label">วันเกิด : </span>
                  {formatDate(profile?.birthdate)}
                  &nbsp;&nbsp; อายุ {calcAge(profile?.birthdate)} ปี
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
                  <span className="map-link" onClick={openMap}>
                    บ้านเลขที่ {profile?.addressNo} ถนน/เขต {profile?.street}&nbsp;
                    ตำบล {profile?.subdistrict} อำเภอ {profile?.district}&nbsp;
                    จังหวัด {profile?.province} รหัสไปรษณีย์ {profile?.zipcode}
                    &nbsp;(กดเพื่อนำทาง)
                  </span>
                </div>
              </div>
            </div>

            {/* รายละเอียดการดูแล — ต่อเนื่องในการ์ดเดียวกัน */}
            <hr className="sp2-divider" />
            <div className="sp2-section-title">รายละเอียดการดูแล</div>

            <div className="sp2-indent">
              <div className="sp2-simple-row">
                <span className="sp2-simple-label">ประเภทสัตว์ที่รับดูแล</span>
                <span>{profile?.petAllowType} {profile?.petAllowType?.includes('แมว') && '🐱'}{profile?.petAllowType?.includes('สุนัข') && '🐶'}</span>
              </div>
              <div className="sp2-simple-row">
                <span className="sp2-simple-label">ขนาดของสัตว์ที่รับดูแล</span>
                <span>{profile?.acceptedPetSize}</span>
              </div>

              <div className="sp2-group-row">
                <div className="sp2-group-label">ช่วงเวลาที่รับดูแล</div>
                <div className="sp2-group-content">
                  {profile?.isMorning && profile.isMorning !== '-' && (
                    <div className="sp2-group-bullet"><span className="detail-bullet">•</span>{profile.isMorning}</div>
                  )}
                  {profile?.isAfternoon && profile.isAfternoon !== '-' && (
                    <div className="sp2-group-bullet"><span className="detail-bullet">•</span>{profile.isAfternoon}</div>
                  )}
                  {profile?.isEvening && profile.isEvening !== '-' && (
                    <div className="sp2-group-bullet"><span className="detail-bullet">•</span>{profile.isEvening}</div>
                  )}
                  {profile?.isNight && profile.isNight !== '-' && (
                    <div className="sp2-group-bullet"><span className="detail-bullet">•</span>{profile.isNight}</div>
                  )}
                </div>
              </div>

              <div className="sp2-simple-row">
                <span className="sp2-simple-label">ค่าดูแลต่อวัน</span>
                <span>{profile?.pricePerDay} บาท/วัน</span>
              </div>
              <div className="sp2-simple-row">
                <span className="sp2-simple-label">ประสบการณ์</span>
                <span>{profile?.experienceYear}</span>
              </div>

              {(profile?.isFeedMedicine && profile.isFeedMedicine !== '-') ||
               (profile?.isCleanService && profile.isCleanService !== '-') ||
               (profile?.isWalkService && profile.isWalkService !== '-') ? (
                <div className="sp2-group-row">
                  <div className="sp2-group-label">บริการเสริม</div>
                  <div className="sp2-group-content">
                    {profile?.isFeedMedicine && profile.isFeedMedicine !== '-' && (
                      <div className="sp2-group-bullet"><span className="detail-bullet">•</span>{profile.isFeedMedicine}</div>
                    )}
                    {profile?.isCleanService && profile.isCleanService !== '-' && (
                      <div className="sp2-group-bullet"><span className="detail-bullet">•</span>{profile.isCleanService}</div>
                    )}
                    {profile?.isWalkService && profile.isWalkService !== '-' && (
                      <div className="sp2-group-bullet"><span className="detail-bullet">•</span>{profile.isWalkService}</div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* รายละเอียดการเงิน — ต่อเนื่องในการ์ดเดียวกัน */}
            <hr className="sp2-divider" />
            <div className="sp2-section-title">รายละเอียดการเงิน</div>

            <div className="sp2-indent">
              <div className="sp2-finance-row">
                <div className="sp2-finance-text">
                  <div className="info-row"><span className="info-label">ธนาคาร </span>{profile?.bankName}</div>
                  <div className="info-row"><span className="info-label">หมายเลขบัญชีธนาคาร </span>{profile?.accountNo}</div>
                  <div className="info-row"><span className="info-label">ชื่อบัญชีธนาคาร </span>{profile?.accountName}</div>
                </div>
                {qrUrl && (
                  <div className="qr-box sp2-qr-box">
                    <img src={qrUrl} alt="QR Code" />
                    <div className="qr-name">{profile?.accountName}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Buttons — นอกกรอบ */}
          <div className="btn-group">
            <button className="btn btn-edit" onClick={() => navigate('/edit-sitter')}>
              ✏️ แก้ไข
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProfileSitter;
