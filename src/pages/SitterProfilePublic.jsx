import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './SitterProfilePublic.css';
import logo from '../assets/logo.png';

import { API_BASE_URL as API } from '../config';

function SitterProfilePublic() {
  const navigate = useNavigate();
  const { sitterID } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/api/sitter/profile-public/${sitterID}`);
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

  const getPetEmoji = (typeName) => {
    if (!typeName) return '🐾';
    if (typeName.includes('สุนัข') && !typeName.includes('แมว')) return '🐶';
    if (typeName.includes('แมว') && !typeName.includes('สุนัข')) return '🐱';
    return '🐾';
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

  const getServices = () => {
    if (!profile) return [];
    const s = [];
    if (profile.isFeedMedicine && profile.isFeedMedicine !== '-') s.push(profile.isFeedMedicine);
    if (profile.isCleanService && profile.isCleanService !== '-') s.push(profile.isCleanService);
    if (profile.isWalkService && profile.isWalkService !== '-') s.push(profile.isWalkService);
    return s;
  };

  if (loading) return (
    <div className="spp-wrap">
      <div className="spp-loading">กำลังโหลดข้อมูล...</div>
    </div>
  );

  const imageUrl = profile?.sitterImage && profile.sitterImage !== 'default.png'
    ? `/images/sitters/${profile.sitterImage}`
    : null;

  return (
    <div className="spp-wrap">
      <div className="spp-topbar">
        <div className="spp-topbar-left">
          <img src={logo} alt="logo" className="spp-logo" />
          <div className="spp-topbar-title">ระบบตามหาผู้ดูแลสัตว์เลี้ยง<br />ภายในจังหวัดเชียงใหม่</div>
        </div>
        <div className="spp-topbar-right">
          <button className="spp-btn-white" onClick={() => navigate('/login')}>เข้าสู่ระบบ</button>
          <button className="spp-btn-outline" onClick={() => navigate('/register')}>ลงทะเบียน</button>
        </div>
      </div>

      <div className="spp-content">
        <div className="spp-card">
          <div className="spp-card-title">ข้อมูลผู้ดูแล</div>
          <div className="spp-limited-badge">🔒 กำลังดูแบบตัวอย่าง — เข้าสู่ระบบเพื่อดูข้อมูลเต็ม</div>

          <div className="spp-body-row">
            <div className="spp-left-col">
              <div className="spp-avatar">
                {imageUrl ? <img src={imageUrl} alt="profile" /> : <span className="spp-avatar-placeholder">👤</span>}
              </div>
            </div>

            <div className="spp-right-col">
              <div className="spp-name">{profile?.firstname} {profile?.lastname}</div>
              <div className="spp-info-row">
                <span className="spp-lbl">เพศ</span><span>{profile?.gender}</span>
                <span className="spp-lbl" style={{marginLeft:16}}>ประสบการณ์</span><span>{profile?.experienceYear}</span>
              </div>
              <div className="spp-location">📍 {profile?.subdistrict}, {profile?.district}, {profile?.province}</div>

              <div className="spp-section-title">รายละเอียดการรับดูแล</div>
              <div className="spp-info-row">
                <span className="spp-lbl">ประเภทสัตว์ที่รับดูแล</span>
                <span>{profile?.petAlowPet} {getPetEmoji(profile?.petAlowPet)}</span>
              </div>
              <div className="spp-info-row">
                <span className="spp-lbl">ขนาดที่รับดูแล</span><span>{profile?.acceptedPetSize}</span>
              </div>
              {getTimeSlots().length > 0 && (
                <div className="spp-info-row">
                  <span className="spp-lbl">ช่วงเวลาที่รับดูแล</span><span>{getTimeSlots().join(', ')}</span>
                </div>
              )}
              {getServices().length > 0 && (
                <div className="spp-info-row">
                  <span className="spp-lbl">บริการเสริม</span><span>{getServices().join(', ')}</span>
                </div>
              )}
              <div className="spp-info-row">
                <span className="spp-lbl">ค่าดูแลต่อวัน</span>
                <span className="spp-price">{profile?.pricePerDay} บาท/วัน</span>
              </div>
            </div>
          </div>

          <div className="spp-section-title">รีวิวจากผู้ใช้บริการ ({profile?.reviewCount || 0})</div>
          {profile?.avgRating ? (
            <div className="spp-review-summary">
              <div className="spp-review-score">
                <div className="spp-review-number">{profile.avgRating.toFixed(1)}</div>
                <div className="spp-review-count">จาก {profile.reviewCount || 0} รีวิว</div>
              </div>
              <span className="spp-stars">{'★'.repeat(Math.round(profile.avgRating))}{'☆'.repeat(5 - Math.round(profile.avgRating))}</span>
            </div>
          ) : (
            <div className="spp-no-review">ยังไม่มีรีวิวจากผู้ใช้บริการ</div>
          )}

          <div className="spp-cta-box">
            <div className="spp-cta-text">เข้าสู่ระบบเพื่อดูข้อมูลติดต่อและที่อยู่ของผู้ดูแลคนนี้</div>
            <button className="spp-cta-btn" onClick={() => navigate('/login')}>เข้าสู่ระบบ</button>
          </div>
        </div>

        <div className="spp-btn-group">
          <button className="spp-btn-back" onClick={() => navigate(-1)}>ย้อนกลับ</button>
        </div>
      </div>
    </div>
  );
}

export default SitterProfilePublic;
