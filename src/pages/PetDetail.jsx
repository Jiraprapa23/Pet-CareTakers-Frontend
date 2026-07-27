import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ProfileOwner.css';
import './PetDetail.css';
import logo from '../assets/logo.png';
import NotificationBell from '../components/NotificationBell';

const API = 'http://localhost:8096';

function PetDetail() {
  const navigate = useNavigate();
  const { petID } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // รูป avatar topbar
  const imageUrl = user.profileImage && user.profileImage !== 'default.png'
    ? `${API}/api/auth/images/${user.profileImage}`
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
          <div className="topbar-title">ระบบตามหาผู้ดูแลสัตว์เลี้ยง ภายในจังหวัดเชียงใหม่</div>
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
              <span className="menu-icon">🔍</span><span>สำรวจผู้ดูแล</span>
            </a>
            <a className="menu-item" onClick={() => navigate('/my-announcements')}>
              <span className="menu-icon">📢</span><span>รายการประกาศ</span>
            </a>
            <a className="menu-item" onClick={() => navigate('/active-jobs')}>
              <span className="menu-icon">⚡</span><span>งานที่กำลังทำ</span>
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

            <div className="petdetail-layout">

              {/* ========== คอลัมน์ 1: รูป + ข้อมูลพื้นฐาน ========== */}
              <div className="pet-col1">
                <div className="petdetail-img">
                  {pet?.petImage && pet.petImage !== 'default.png'
                    ? <img src={`${API}/api/auth/images/${pet.petImage}`} alt={pet.petName} />
                    : <span className="petdetail-img-placeholder">{petEmoji}</span>
                  }
                </div>

                <div className="pet-basic-card">
                  {pet?.isDeceased && (
                    <div style={{ marginBottom: 8 }}>
                      <span className="deceased-badge">🌈 อยู่ในความทรงจำ</span>
                    </div>
                  )}
                  <div className="pet-basic-row">
                    <span className="pet-basic-label">ชื่อ : </span>{pet?.petName}
                  </div>
                  <div className="pet-basic-row">
                    <span className="pet-basic-label">ประเภท : </span>{petTypeName} {petEmoji}
                  </div>
                  <div className="pet-basic-row">
                    <span className="pet-basic-label">สายพันธุ์ : </span>{pet?.breed || '-'}
                  </div>
                  <div className="pet-basic-row">
                    <span className="pet-basic-label">เพศ : </span>
                    {pet?.gender === 'เพศผู้' ? '♂' : '♀'} {pet?.gender}
                  </div>
                  <div className="pet-basic-row">
                    <span className="pet-basic-label">วันเกิด : </span>
                    {formatDate(pet?.birthDate) || '-'}
                  </div>
                  <div className="pet-basic-row">
                    <span className="pet-basic-label">อายุ : </span>
                    {calcAge(pet?.birthDate)}
                    <span style={{ color: '#aaa', fontSize: 11 }}> (โดยประมาณ)</span>
                  </div>
                </div>
              </div>

              {/* ========== คอลัมน์ 2: ข้อมูลสุขภาพ ========== */}
              <div>
                <div className="detail-sec-title">ข้อมูลสุขภาพ</div>

                {/* วัคซีน */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#5D3A2E', marginBottom: 8 }}>
                    วัคซีน <span style={{ color: '#999', fontWeight: 400, fontSize: 11 }}>(ครั้งล่าสุดโดยประมาณ)</span>
                  </div>
                  {!pet?.vacRabiesDate && !pet?.vacDhppiDate && !pet?.vacFvrcpDate
                    ? <p className="no-vaccine">ไม่มีข้อมูลวัคซีน</p>
                    : <>
                        {pet?.vacRabiesDate && (
                          <div className="vaccine-row">
                            <span>พิษสุนัขบ้า (Rabies)</span>
                            <span className="vaccine-date">[{formatDate(pet.vacRabiesDate)}]</span>
                          </div>
                        )}
                        {pet?.vacDhppiDate && (
                          <div className="vaccine-row">
                            <span>วัคซีนรวมสุนัข DHPPi <span className="vaccine-sub">(เฉพาะสุนัข)</span></span>
                            <span className="vaccine-date">[{formatDate(pet.vacDhppiDate)}]</span>
                          </div>
                        )}
                        {pet?.vacFvrcpDate && (
                          <div className="vaccine-row">
                            <span>วัคซีนรวมแมว FVRCP <span className="vaccine-sub">(เฉพาะแมว)</span></span>
                            <span className="vaccine-date">[{formatDate(pet.vacFvrcpDate)}]</span>
                          </div>
                        )}
                      </>
                  }
                </div>

                {/* โรคประจำตัว */}
                <div className="detail-sec-title">โรคประจำตัว</div>
                {pet?.hasCongenitalDisease === 'มี'
                  ? <>
                      <div className="disease-row">
                        <span className="disease-dot">•</span>{pet.congenitalDiseaseDetail}
                      </div>
                      {pet.emergencySymptoms && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#5D3A2E', marginBottom: 4 }}>
                            อาการที่ต้องรีบพาไปหาหมอ
                          </div>
                          <div className="disease-row">
                            <span className="disease-dot">•</span>{pet.emergencySymptoms}
                          </div>
                        </div>
                      )}
                      {pet.emergencyContact && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#5D3A2E', marginBottom: 4 }}>
                            โรงพยาบาลสัตว์ / ติดต่อฉุกเฉิน
                          </div>
                          <div className="disease-row">
                            <span className="disease-dot">•</span>{pet.emergencyContact}
                          </div>
                        </div>
                      )}
                    </>
                  : <div className="disease-row">
                      <span className="disease-dot">•</span>ไม่มีโรคประจำตัว
                    </div>
                }
              </div>

              {/* ========== คอลัมน์ 3: ข้อมูลพฤติกรรม ========== */}
              <div>
                <div className="detail-sec-title">ข้อมูลพฤติกรรม</div>

                {/* ปฏิสัมพันธ์กับคน */}
                {(pet?.behaviorStressAlone || pet?.behaviorFriendly || pet?.behaviorFearStranger) && (
                  <div className="beh-group">
                    <div className="beh-group-label">ปฏิสัมพันธ์กับคน</div>
                    {pet.behaviorStressAlone && (
                      <div className="beh-item"><span className="disease-dot">•</span>เครียดเมื่อเจ้าของไม่อยู่</div>
                    )}
                    {pet.behaviorFriendly && (
                      <div className="beh-item"><span className="disease-dot">•</span>เฟรนลี่ / ติดคน (ชอบคน เข้าหาคนตลอด)</div>
                    )}
                    {pet.behaviorFearStranger && (
                      <div className="beh-item"><span className="disease-dot">•</span>กลัวคนแปลกหน้า (ต้องรอปรับตัวเล็กน้อย)</div>
                    )}
                  </div>
                )}

                {/* เสียงและการตอบสนอง */}
                {(pet?.behaviorFearLoudSound || pet?.behaviorBarkLoud) && (
                  <div className="beh-group">
                    <div className="beh-group-label">เสียงและการตอบสนองต่อสิ่งกระตุ้น</div>
                    {pet.behaviorFearLoudSound && (
                      <div className="beh-item"><span className="disease-dot">•</span>กลัวเสียงดัง (ฟ้าร้อง / เครื่องใช้ไฟฟ้า)</div>
                    )}
                    {pet.behaviorBarkLoud && (
                      <div className="beh-item"><span className="disease-dot">•</span>เห่า/ส่งเสียงดังเมื่อมีสิ่งกระตุ้น</div>
                    )}
                  </div>
                )}

                {/* เสี่ยงต่อการบาดเจ็บ */}
                {(pet?.behaviorDislikeTouch || pet?.behaviorBiteScrath || pet?.behaviorEscapeExpert ||
                  pet?.behaviorHighEnergy || pet?.behaviorJumpOnPeople || pet?.behaviorHardControl) && (
                  <div className="beh-group">
                    <div className="beh-group-label">พฤติกรรมเสี่ยงต่อการบาดเจ็บ</div>
                    {pet.behaviorDislikeTouch && (
                      <div className="beh-item"><span className="disease-dot">•</span>ไม่ชอบให้จับบางจุด (เช่น หู ท้อง ขา)</div>
                    )}
                    {pet.behaviorBiteScrath && (
                      <div className="beh-item"><span className="disease-dot">•</span>กัดหรือข่วนเมื่อเครียด</div>
                    )}
                    {pet.behaviorEscapeExpert && (
                      <div className="beh-item"><span className="disease-dot">•</span>หนีเก่งเมื่อเปิดประตู</div>
                    )}
                    {pet.behaviorHighEnergy && (
                      <div className="beh-item"><span className="disease-dot">•</span>เล่นแรง / พลังงานสูง</div>
                    )}
                    {pet.behaviorJumpOnPeople && (
                      <div className="beh-item"><span className="disease-dot">•</span>กระโดดใส่คนหรือสิ่งของ</div>
                    )}
                    {pet.behaviorHardControl && (
                      <div className="beh-item"><span className="disease-dot">•</span>ควบคุมยากเมื่อเครียด</div>
                    )}
                  </div>
                )}

                {/* ไม่มีพฤติกรรมพิเศษ */}
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
            <button className="btn btn-back" onClick={() => navigate('/my-pets')}>ย้อนกลับ</button>
            <div className="petdetail-btn-right">
              {!pet?.isDeceased && (
                <div className="btn-deceased-wrap" onClick={() => setShowModal(true)}>
                  <div className="btn-deceased-icon">🐾💫</div>
                  <div className="btn-deceased-label">แจ้งการจากไป</div>
                </div>
              )}
              <button className="btn btn-edit" onClick={() => navigate(`/edit-pet/${petID}`)}>
                ✏️ แก้ไข
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =================== Modal ยืนยัน =================== */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-icon">🌈</div>
            <div className="modal-title">ยืนยันการแจ้งการจากไปของสัตว์เลี้ยง</div>
            <div className="modal-desc">
              คุณต้องการเปลี่ยนสถานะของ <strong>{pet?.petName}</strong> เป็น "อยู่ในความทรงจำ" ใช่หรือไม่?
            </div>
            <div className="modal-sub">
              (ข้อมูลนี้จะถูกย้ายออกจากรายการสัตว์เลี้ยงที่พร้อมรับงาน แต่ประวัติจะยังคงอยู่ในระบบของคุณ)
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