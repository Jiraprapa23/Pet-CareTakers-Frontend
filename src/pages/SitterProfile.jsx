import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ProfileOwner.css';
import './SitterProfile.css';
import logo from '../assets/logo.png';

const API = 'http://localhost:8096';

function SitterProfile() {
  const navigate = useNavigate();
  const { sitterID } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const imageUrl = user.profileImage && user.profileImage !== 'default.png'
    ? `${API}/api/auth/images/${user.profileImage}`
    : null;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/api/sitter/profile/${sitterID}`);
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [sitterID]);

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

  const renderStars = (rating, size = 'normal') => {
    if (!rating) return null;
    const full = Math.floor(rating);
    const empty = 5 - Math.ceil(rating);
    return (
      <span className={`sp-stars ${size}`}>
        {'⭐'.repeat(full)}{'☆'.repeat(empty)}
        <span className="sp-rating-score"> {rating}</span>
      </span>
    );
  };

  const getServices = () => {
    if (!profile) return [];
    const s = [];
    if (profile.isFeedMedicine && profile.isFeedMedicine !== '-') s.push(profile.isFeedMedicine);
    if (profile.isCleanService && profile.isCleanService !== '-') s.push(profile.isCleanService);
    if (profile.isWalkService && profile.isWalkService !== '-') s.push(profile.isWalkService);
    return s;
  };

  const getTimeSlots = () => {
    if (!profile) return [];
    const t = [];
    if (profile.isMorning && profile.isMorning !== '-') t.push(profile.isMorning);
    if (profile.isAfternoon && profile.isAfternoon !== '-') t.push(profile.isAfternoon);
    if (profile.isEvening && profile.isEvening !== '-') t.push(profile.isEvening);
    if (profile.isNight && profile.isNight !== '-') t.push(profile.isNight);
    return t;
  };

  if (loading) return (
    <div className="app-layout">
      <div className="loading-box">กำลังโหลดข้อมูล...</div>
    </div>
  );

  return (
    <div className="app-layout">
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-left">
          <img src={logo} alt="logo" className="topbar-logo" />
          <div className="topbar-title">ระบบตามหาผู้ดูแลสัตว์เลี้ยง ภายในจังหวัดเชียงใหม่</div>
        </div>
        <div className="topbar-user">
          <span>ยินดีต้อนรับ คุณ{user.firstname}</span>
          <div className="topbar-avatar">
            {imageUrl ? <img src={imageUrl} alt="avatar" /> : <span style={{ fontSize: 18 }}>👤</span>}
          </div>
        </div>
      </div>

      <div className="body-row">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-menu">
            <a className="menu-item" onClick={() => navigate('/profile-owner')}>
              <span className="menu-icon">👤</span><span>โปรไฟล์ของฉัน</span>
            </a>
            <a className="menu-item" onClick={() => navigate('/my-pets')}>
              <span className="menu-icon">🐾</span><span>รายการสัตว์เลี้ยง</span>
            </a>
            <a className="menu-item active" onClick={() => navigate('/explore-sitters')}>
              <span className="menu-icon">🔍</span><span>สำรวจผู้ดูแล</span>
            </a>
            <a className="menu-item" onClick={() => navigate('/my-announcements')}>
              <span className="menu-icon">📢</span><span>รายการประกาศ</span>
            </a>
          </div>
          <hr className="menu-divider" />
          <a className="menu-item menu-logout" onClick={handleLogout}>
            <span className="menu-icon">🚪</span><span>ออกจากระบบ</span>
          </a>
        </div>

        {/* Main */}
        <div className="main-content">

          {/* ข้อมูลส่วนตัว */}
          <div className="sp-card">
            <div className="sp-card-title">ข้อมูลส่วนตัว</div>
            <div className="sp-profile-body">
              <div className="sp-avatar-wrap">
                {profile?.sitterImage && profile.sitterImage !== 'default.png'
                  ? <img src={`${API}/api/auth/images/${profile.sitterImage}`} alt="profile" className="sp-avatar" />
                  : <div className="sp-avatar-placeholder">👤</div>
                }
              </div>
              <div className="sp-info">
                <div className="sp-info-row">
                  <span className="sp-label">ชื่อ-นามสกุล : </span>
                  {profile?.firstname} {profile?.lastname}
                  &nbsp;&nbsp;&nbsp;
                  <span className="sp-label">เพศ : </span>{profile?.gender}
                </div>
                <div className="sp-info-row">
                  <span className="sp-label">วันเกิด : </span>
                  {formatDate(profile?.birthdate)}
                  &nbsp;&nbsp; อายุ {calcAge(profile?.birthdate)} ปี
                </div>
                <div className="sp-info-row">
                  <span className="sp-label">หมายเลขโทรศัพท์ : </span>{profile?.phoneNumber}
                </div>
                <div className="sp-info-row">
                  <span className="sp-label">อีเมล : </span>{profile?.email}
                </div>
                <div className="sp-info-row">
                  <span className="sp-label">ที่อยู่ : </span>
                  บ้านเลขที่ {profile?.addressNo} ถนน/เขต {profile?.street}&nbsp;
                  ตำบล {profile?.subdistrict} อำเภอ {profile?.district}&nbsp;
                  จังหวัด {profile?.province} รหัสไปรษณีย์ {profile?.zipcode}
                </div>
                <div className="sp-info-row">
                  <span className="sp-label">ที่อยู่จากปักหมุด </span>
                  <span style={{ color: '#dc2626' }}>📍</span>
                  &nbsp;{profile?.addressNo} {profile?.street}&nbsp;
                  ตำบล {profile?.subdistrict} อำเภอ {profile?.district}&nbsp;
                  จังหวัด {profile?.province}
                </div>
              </div>
            </div>
          </div>

          {/* รายละเอียดการดูแล + รีวิว */}
          <div className="sp-bottom-grid">

            {/* รายละเอียดการดูแล */}
            <div className="sp-card">
              <div className="sp-section-title">รายละเอียดการดูแล</div>
              <div className="sp-detail-item">
                <span className="sp-dot">•</span>
                <span><span className="sp-label">ประเภทสัตว์ที่รับดูแล </span>{profile?.petAlowPet}</span>
              </div>
              <div className="sp-detail-item">
                <span className="sp-dot">•</span>
                <span><span className="sp-label">ขนาดของสัตว์ที่รับดูแล </span>{profile?.acceptedPetSize}</span>
              </div>
              <div className="sp-detail-item">
                <span className="sp-dot">•</span>
                <span><span className="sp-label">ช่วงเวลาที่รับดูแล </span>{getTimeSlots().join(', ')}</span>
              </div>
              <div className="sp-detail-item">
                <span className="sp-dot">•</span>
                <span><span className="sp-label">ประสบการณ์ </span>{profile?.experienceYear}</span>
              </div>
              <div className="sp-detail-item">
                <span className="sp-dot">•</span>
                <span><span className="sp-label">ค่าดูแลต่อวัน </span>{profile?.pricePerDay} บาท/วัน</span>
              </div>
              {getServices().length > 0 && (
                <div className="sp-detail-item">
                  <span className="sp-dot">•</span>
                  <span><span className="sp-label">บริการเสริม </span>{getServices().join(', ')}</span>
                </div>
              )}
            </div>

            {/* รีวิว */}
            <div className="sp-card">
              <div className="sp-review-header">
                <div className="sp-section-title">
                  รีวิว ({profile?.reviewCount || 0})
                </div>
                {profile?.avgRating && renderStars(profile.avgRating, 'large')}
              </div>

              {(!profile?.reviews || profile.reviews.length === 0) ? (
                <div className="sp-no-review">ยังไม่มีรีวิวจากผู้ใช้บริการ</div>
              ) : (
                <div className="sp-review-list">
                  {profile.reviews.map(review => (
                    <div key={review.reviewID} className="sp-review-item">
                      <div className="sp-review-header-row">
                        <div className="sp-reviewer-img-wrap">
                          {review.reviewerImage && review.reviewerImage !== 'default.png'
                            ? <img src={`${API}/api/auth/images/${review.reviewerImage}`} alt="reviewer" className="sp-reviewer-img" />
                            : <div className="sp-reviewer-img-placeholder">👤</div>
                          }
                        </div>
                        <div className="sp-reviewer-info">
                          <div className="sp-reviewer-name">{review.reviewerName || 'ผู้ใช้บริการ'}</div>
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      {review.comment && (
                        <div className="sp-review-comment">"{review.comment}"</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <button className="btn btn-back" onClick={() => navigate('/explore-sitters')}>ย้อนกลับ</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SitterProfile;
