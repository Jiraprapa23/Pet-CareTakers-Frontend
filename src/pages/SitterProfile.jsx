import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ProfileOwner.css';
import './SitterProfile.css';
import logo from '../assets/logo.png';

import { API_BASE_URL as API } from '../config';

function SitterProfile() {
  const navigate = useNavigate();
  const { sitterID } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const imageUrl = user.profileImage && user.profileImage !== 'default.png'
    ? `/images/owners/${user.profileImage}`
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

  const openMap = () => {
    if (profile?.latitude && profile?.longitude) {
      window.open(`https://www.google.com/maps?q=${profile.latitude},${profile.longitude}`, '_blank');
    }
  };

  const renderStars = (rating, size = 'normal') => {
    if (!rating) return null;
    return (
      <span className={`sp-stars ${size}`}>
        <span style={{color:'#f59e0b'}}>{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</span>
        <span className="sp-rating-score"> {rating.toFixed(1)}</span>
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
          <div className="topbar-title">ระบบตามหาผู้ดูแลสัตว์เลี้ยง<br />ภายในจังหวัดเชียงใหม่</div>
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

          {/* ข้อมูลส่วนตัว + รายละเอียดการดูแล — การ์ดเดียวไหลต่อกัน */}
          <div className="sp-card">
            <div className="sp-card-title">ข้อมูลส่วนตัว</div>
            <div className="sp-profile-body">
              <div className="sp-avatar-wrap">
                {profile?.sitterImage && profile.sitterImage !== 'default.png'
                  ? <img src={`/images/sitters/${profile.sitterImage}`} alt="profile" className="sp-avatar" />
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
                  <span className="map-link" onClick={openMap}>
                    &nbsp;{profile?.addressNo} {profile?.street}&nbsp;
                    ตำบล {profile?.subdistrict} อำเภอ {profile?.district}&nbsp;
                    จังหวัด {profile?.province}
                    &nbsp;(กดเพื่อนำทาง)
                  </span>
                </div>
              </div>
            </div>

            {/* รายละเอียดการดูแล — ต่อเนื่องในการ์ดเดียวกัน */}
            <hr className="sp-divider" />
            <div className="sp-section-title-center">รายละเอียดการดูแล</div>

            <div className="sp-indent">
              <div className="sp-simple-row">
                <span className="sp-simple-label">ประเภทสัตว์ที่รับดูแล</span>
                <span>{profile?.petAlowPet} {profile?.petAlowPet?.includes('แมว') && '🐱'}{profile?.petAlowPet?.includes('สุนัข') && '🐶'}</span>
              </div>
              <div className="sp-simple-row">
                <span className="sp-simple-label">ขนาดของสัตว์ที่รับดูแล</span>
                <span>{profile?.acceptedPetSize}</span>
              </div>

              {getTimeSlots().length > 0 && (
                <div className="sp-group-row">
                  <div className="sp-group-label">ช่วงเวลาที่รับดูแล</div>
                  <div className="sp-group-content">
                    {getTimeSlots().map((slot, i) => (
                      <div key={i} className="sp-group-bullet"><span className="sp-dot-inline">•</span>{slot}</div>
                    ))}
                  </div>
                </div>
              )}

              <div className="sp-simple-row">
                <span className="sp-simple-label">ประสบการณ์</span>
                <span>{profile?.experienceYear}</span>
              </div>
              <div className="sp-simple-row">
                <span className="sp-simple-label">ค่าดูแลต่อวัน</span>
                <span>{profile?.pricePerDay} บาท/วัน</span>
              </div>

              {getServices().length > 0 && (
                <div className="sp-group-row">
                  <div className="sp-group-label">บริการเสริม</div>
                  <div className="sp-group-content">
                    {getServices().map((service, i) => (
                      <div key={i} className="sp-group-bullet"><span className="sp-dot-inline">•</span>{service}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* รีวิว — แยกการ์ดต่างหาก */}
          <div className="sp-card">
            <div className="sp-section-title">
              รีวิวจากผู้ใช้บริการ ({profile?.reviewCount || 0})
            </div>

            {profile?.avgRating && (
              <div className="sp-rating-summary">
                <div className="sp-rating-summary-score">
                  <div className="sp-rating-summary-number">{profile.avgRating.toFixed(1)}</div>
                  <div className="sp-rating-summary-count">จาก {profile.reviewCount || 0} รีวิว</div>
                </div>
                <div className="sp-rating-summary-detail">
                  <span style={{color:'#f59e0b', fontSize:16}}>{'★'.repeat(Math.round(profile.avgRating))}{'☆'.repeat(5 - Math.round(profile.avgRating))}</span>
                  <div className="sp-rating-summary-text">ผู้ใช้บริการส่วนใหญ่พึงพอใจกับการดูแลของผู้ดูแลคนนี้</div>
                </div>
              </div>
            )}

            {(!profile?.reviews || profile.reviews.length === 0) ? (
              <div className="sp-no-review">ยังไม่มีรีวิวจากผู้ใช้บริการ</div>
            ) : (
              <div className="sp-review-list">
                {profile.reviews.map(review => (
                  <div key={review.reviewID} className="sp-review-item">
                    <div className="sp-review-rating-corner">{renderStars(review.rating)}</div>
                    <div className="sp-review-header-row">
                      <div className="sp-reviewer-img-wrap">
                        {review.reviewerImage && review.reviewerImage !== 'default.png'
                          ? <img src={`/images/owners/${review.reviewerImage}`} alt="reviewer" className="sp-reviewer-img" />
                          : <div className="sp-reviewer-img-placeholder">👤</div>
                        }
                      </div>
                      <div className="sp-reviewer-info">
                        <div className="sp-reviewer-name">{review.reviewerName || 'ผู้ใช้บริการ'}</div>
                      </div>
                    </div>
                    {review.comment && (
                      <div className="sp-review-comment">{review.comment}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
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
