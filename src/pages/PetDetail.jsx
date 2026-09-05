import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ProfileOwner.css';
import './PetDetail.css';
import logo from '../assets/logo.png';
import NotificationBell from '../components/NotificationBell';

import { API_BASE_URL as API } from '../config';

function PetDetail() {
  const navigate = useNavigate();
  const { petID } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // รูป avatar topbar
  const imageUrl = user.profileImage && user.profileImage !== 'default.png'
    ? `/images/owners/${user.profileImage}`
    : null;

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const res = await fetch(`${API}/api/pet/detail/${petID}`);
        const data = await res.json();
        setPet(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [petID]);

  const calcAge = (dateStr) => {
    if (!dateStr) return '';
    const birth = new Date(dateStr);
    const today = new Date();
    const totalMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    if (totalMonths < 0) return '';
    if (totalMonths < 12) return `${totalMonths} เดือน`;
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    return months > 0 ? `${years} ปี ${months} เดือน` : `${years} ปี`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  };

  const handleMarkDeceased = async () => {
    try {
      const res = await fetch(`${API}/api/pet/mark-deceased/${petID}`, {
        method: 'PUT',
      });
      const data = await res.json();
      setShowModal(false);
      alert(data.message);
      setPet(prev => ({ ...prev, isDeceased: true }));
    } catch (err) {
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const getPetEmoji = (petTypeName) => {
    if (!petTypeName) return '🐾';
    if (petTypeName.includes('สุนัข') && !petTypeName.includes('แมว')) return '🐶';
    if (petTypeName.includes('แมว') && !petTypeName.includes('สุนัข')) return '🐱';
    return '🐾';
  };

  if (loading) return (
    <div className="app-layout">
      <div className="loading-box">กำลังโหลดข้อมูล...</div>
    </div>
  );

  const petTypeName = pet?.petType?.petTypeName || '';
  const petEmoji = getPetEmoji(petTypeName);

  return (
    <div className="app-layout">

      {/* =================== Topbar =================== */}
      <div className="topbar">
        <div className="topbar-left">
          <img src={logo} alt="logo" className="topbar-logo" />
          <div className="topbar-title">ระบบตามหาผู้ดูแลสัตว์เลี้ยง<br />ภายในจังหวัดเชียงใหม่</div>
        </div>
        <div className="topbar-user">
          <span>ยินดีต้อนรับ คุณ{user.firstname}</span>
          <NotificationBell userID={user.ownerID} userRole="OWNER" />
          <div className="topbar-avatar">
            {imageUrl
              ? <img src={imageUrl} alt="avatar" />
              : <span style={{ fontSize: 18 }}>👤</span>}
          </div>
        </div>
      </div>

      <div className="body-row">

        {/* =================== Sidebar =================== */}
        <div className="sidebar">
          <div className="sidebar-menu">
            <a className="menu-item" onClick={() => navigate('/profile-owner')}>
              <span className="menu-icon">👤</span><span>โปรไฟล์ของฉัน</span>
            </a>
            <a className="menu-item active" onClick={() => navigate('/my-pets')}>
              <span className="menu-icon">🐾</span><span>รายการสัตว์เลี้ยง</span>
            </a>
            <a className="menu-item" onClick={() => navigate('/explore-sitters')}>
              <span className="menu-icon">🔍</span><span>ค้นหาผู้ดูแล</span>
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

        {/* =================== Main Content =================== */}
        <div className="main-content">
          <div className="petdetail-card">
            <div className="petdetail-card-title">รายละเอียดสัตว์เลี้ยง</div>

            <div className="pd-body">

              {/* ========== รูปสัตว์เลี้ยง ========== */}
              <div className="petdetail-img">
                {pet?.petImage && pet.petImage !== 'default.png'
                  ? <img src={`/images/pets/${pet.petImage}`} alt={pet.petName} />
                  : <span className="petdetail-img-placeholder">{petEmoji}</span>
                }
              </div>

              {/* ========== เนื้อหาทั้งหมด ไหลเป็นคอลัมน์เดียว ========== */}
              <div className="pd-content">

                {pet?.isDeceased && (
                  <div style={{ marginBottom: 10 }}>
                    <span className="deceased-badge">✨ อยู่ในความทรงจำ</span>
                  </div>
                )}

                {/* ========== ข้อมูลสัตว์เลี้ยง ========== */}
                <div className="pd-section-title pd-section-title-first">ข้อมูลสัตว์เลี้ยง</div>

                <div className="pd-info-row">
                  <span>
                    <span className="pd-field-label">ชื่อสัตว์เลี้ยง </span>
                    <span className="pd-field-value">{pet?.petName} {petEmoji}</span>
                  </span>
                  <span>
                    <span className="pd-field-label">สายพันธุ์ </span>
                    <span className="pd-field-value">{pet?.breed || '-'}</span>
                  </span>
                </div>

                <div className="pd-info-row">
                  <span>
                    <span className="pd-field-label">เพศ </span>
                    <span className="pd-field-value">{pet?.gender} {pet?.gender === 'เพศผู้' ? '♂' : '♀'}</span>
                  </span>
                </div>

                <div className="pd-info-row">
                  <span>
                    <span className="pd-field-label">วันเกิด </span>
                    <span className="pd-field-value">{formatDate(pet?.birthDate) || '-'}</span>
                  </span>
                  <span>
                    <span className="pd-field-label">อายุ </span>
                    <span className="pd-field-value">{calcAge(pet?.birthDate)}</span>
                    <span className="pd-note"> (โดยประมาณ)</span>
                  </span>
                </div>

                {/* ========== ข้อมูลสุขภาพสัตว์เลี้ยง ========== */}
                <div className="pd-section-title">ข้อมูลสุขภาพสัตว์เลี้ยง</div>

                <div className="pd-cat-row">
                  <div className="pd-cat-label">วัคซีน</div>
                  <div className="pd-cat-content">
                    {!pet?.vacRabiesDate && !pet?.vacDhppiDate && !pet?.vacFvrcpDate
                      ? <p className="no-vaccine">ไม่มีข้อมูลวัคซีน</p>
                      : <>
                          {pet?.vacRabiesDate && (
                            <div className="pd-vaccine-line">
                              <span>พิษสุนัขบ้า (Rabies)</span>
                              <span className="pd-vaccine-date">[{formatDate(pet.vacRabiesDate)}]</span>
                            </div>
                          )}
                          {pet?.vacDhppiDate && (
                            <div className="pd-vaccine-line">
                              <span>วัคซีนรวมสุนัข (DHPPi) <span className="pd-vaccine-note">(เฉพาะสุนัข)</span></span>
                              <span className="pd-vaccine-date">[{formatDate(pet.vacDhppiDate)}]</span>
                            </div>
                          )}
                          {pet?.vacFvrcpDate && (
                            <div className="pd-vaccine-line">
                              <span>วัคซีนรวมแมว (FVRCP) <span className="pd-vaccine-note">(เฉพาะแมว)</span></span>
                              <span className="pd-vaccine-date">[{formatDate(pet.vacFvrcpDate)}]</span>
                            </div>
                          )}
                        </>
                    }
                  </div>
                </div>

                <div className="pd-cat-row">
                  <div className="pd-cat-label">โรคประจำตัว</div>
                  <div className="pd-cat-content">
                    {pet?.hasCongenitalDisease === 'มี'
                      ? <>
                          <div className="pd-bullet"><span className="pd-dot">•</span>{pet.congenitalDiseaseDetail}</div>
                          {pet.emergencySymptoms && (
                            <div style={{ marginTop: 6 }}>
                              <div className="pd-subgroup-label">อาการที่ต้องรีบพาไปหาหมอ</div>
                              <div className="pd-bullet"><span className="pd-dot">•</span>{pet.emergencySymptoms}</div>
                            </div>
                          )}
                          {pet.emergencyContact && (
                            <div style={{ marginTop: 6 }}>
                              <div className="pd-subgroup-label">โรงพยาบาลสัตว์ / ติดต่อฉุกเฉิน</div>
                              <div className="pd-bullet"><span className="pd-dot">•</span>{pet.emergencyContact}</div>
                            </div>
                          )}
                        </>
                      : <div className="pd-bullet"><span className="pd-dot">•</span>ไม่มีโรคประจำตัว</div>
                    }
                  </div>
                </div>

                {/* ========== ข้อมูลพฤติกรรม ========== */}
                <div className="pd-section-title">ข้อมูลพฤติกรรม</div>

                {(pet?.behaviorStressAlone || pet?.behaviorFriendly || pet?.behaviorFearStranger) && (
                  <div className="pd-cat-row">
                    <div className="pd-cat-label">ปฏิสัมพันธ์กับคน</div>
                    <div className="pd-cat-content">
                      {pet.behaviorStressAlone && (
                        <div className="pd-bullet"><span className="pd-dot">•</span>เครียดเมื่อเจ้าของไม่อยู่</div>
                      )}
                      {pet.behaviorFriendly && (
                        <div className="pd-bullet"><span className="pd-dot">•</span>เฟรนลี่ / ติดคน (ชอบคน เข้าหาคนตลอด)</div>
                      )}
                      {pet.behaviorFearStranger && (
                        <div className="pd-bullet"><span className="pd-dot">•</span>กลัวคนแปลกหน้า (ต้องรอปรับตัวเล็กน้อย)</div>
                      )}
                    </div>
                  </div>
                )}

                {(pet?.behaviorFearLoudSound || pet?.behaviorBarkLoud) && (
                  <div className="pd-cat-row">
                    <div className="pd-cat-label">เสียงและการตอบสนองต่อสิ่งกระตุ้น</div>
                    <div className="pd-cat-content">
                      {pet.behaviorFearLoudSound && (
                        <div className="pd-bullet"><span className="pd-dot">•</span>กลัวเสียงดัง (ฟ้าร้อง / เครื่องใช้ไฟฟ้า)</div>
                      )}
                      {pet.behaviorBarkLoud && (
                        <div className="pd-bullet"><span className="pd-dot">•</span>เห่า/ส่งเสียงดังเมื่อมีสิ่งกระตุ้น</div>
                      )}
                    </div>
                  </div>
                )}

                {(pet?.behaviorDislikeTouch || pet?.behaviorBiteScrath || pet?.behaviorEscapeExpert ||
                  pet?.behaviorHighEnergy || pet?.behaviorJumpOnPeople || pet?.behaviorHardControl) && (
                  <div className="pd-cat-row">
                    <div className="pd-cat-label">พฤติกรรมเสี่ยงต่อการบาดเจ็บ</div>
                    <div className="pd-cat-content">
                      {pet.behaviorDislikeTouch && (
                        <div className="pd-bullet"><span className="pd-dot">•</span>ไม่ชอบให้จับบางจุด (เช่น หู ท้อง ขา)</div>
                      )}
                      {pet.behaviorBiteScrath && (
                        <div className="pd-bullet"><span className="pd-dot">•</span>กัดหรือข่วนเมื่อเครียด</div>
                      )}
                      {pet.behaviorEscapeExpert && (
                        <div className="pd-bullet"><span className="pd-dot">•</span>หนีเก่งเมื่อเปิดประตู</div>
                      )}
                      {pet.behaviorHighEnergy && (
                        <div className="pd-bullet"><span className="pd-dot">•</span>เล่นแรง / พลังงานสูง</div>
                      )}
                      {pet.behaviorJumpOnPeople && (
                        <div className="pd-bullet"><span className="pd-dot">•</span>กระโดดใส่คนหรือสิ่งของ</div>
                      )}
                      {pet.behaviorHardControl && (
                        <div className="pd-bullet"><span className="pd-dot">•</span>ควบคุมยากเมื่อเครียด</div>
                      )}
                    </div>
                  </div>
                )}

                {!pet?.behaviorStressAlone && !pet?.behaviorFriendly && !pet?.behaviorFearStranger &&
                 !pet?.behaviorFearLoudSound && !pet?.behaviorBarkLoud && !pet?.behaviorDislikeTouch &&
                 !pet?.behaviorBiteScrath && !pet?.behaviorEscapeExpert && !pet?.behaviorHighEnergy &&
                 !pet?.behaviorJumpOnPeople && !pet?.behaviorHardControl && (
                  <p className="no-behavior">ไม่มีข้อมูลพฤติกรรมพิเศษ</p>
                )}
              </div>
            </div>
          </div>

          {/* ปุ่ม */}
          <div className="petdetail-btn-row">
            {!pet?.isDeceased && (
              <div className="btn-deceased-wrap" onClick={() => setShowModal(true)}>
                <div className="btn-deceased-icon">🐾</div>
                <div className="btn-deceased-label">แจ้งการจากไป</div>
              </div>
            )}
            <button className="btn btn-edit" onClick={() => navigate(`/edit-pet/${petID}`)}>
              ✏️ แก้ไข
            </button>
          </div>
        </div>
      </div>

      {/* =================== Modal ยืนยัน =================== */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
        
            <div className="modal-title">ยืนยันสถานะการจากไปของสัตว์เลี้ยง</div>
            <div className="modal-desc">
              คุณต้องการเปลี่ยนสถานะของ <strong>{pet?.petName}</strong> เป็น 'อยู่ในความทรงจำ' ใช่หรือไม่?
            </div>
            <div className="modal-sub">
              (ข้อมูลนี้จะถูกย้ายออกจากรายการสัตว์เลี้ยงที่พร้อมรับงาน แต่ประวัติยังคงอยู่ในระบบของคุณ)
            </div>
            <div className="modal-btn-row">
              <button className="modal-btn-cancel" onClick={() => setShowModal(false)}>ยกเลิก</button>
              <button className="modal-btn-confirm" onClick={handleMarkDeceased}>ยืนยัน</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PetDetail;