import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileOwner.css';
import './MyPets.css';
import logo from '../assets/logo.png';
import NotificationBell from '../components/NotificationBell';

const API = 'http://localhost:8096';

function MyPets() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  // รูป avatar topbar — ชี้ไปที่ React public/images/owners/
  const imageUrl = user.profileImage && user.profileImage !== 'default.png'
    ? `/images/owners/${user.profileImage}`
    : null;

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const res = await fetch(`${API}/api/pet/my-pets/${user.ownerID}`);
        const data = await res.json();
        setPets(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setPets([]);
      } finally {
        setLoading(false);
      }
    };
    if (user.ownerID) {
      fetchPets();
    } else {
      navigate('/');
    }
  }, []);

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
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
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

  const getPlaceholderClass = (petTypeName) => {
    if (!petTypeName) return 'default';
    if (petTypeName.includes('แมว') && !petTypeName.includes('สุนัข')) return 'cat';
    if (petTypeName.includes('สุนัข') && !petTypeName.includes('แมว')) return 'dog';
    return 'default';
  };

  const activePets = pets.filter(p => !p.isDeceased);
  const deceasedPets = pets.filter(p => p.isDeceased);

  const PetCard = ({ pet, isDeceased = false }) => {
    const typeName = pet.petType?.petTypeName || '';
    const emoji = getPetEmoji(typeName);
    const placeholderClass = getPlaceholderClass(typeName);

    return (
      <div className={`pet-card${isDeceased ? ' memorial' : ''}`}>
        <div className="pet-card-img-wrap">
          {pet.petImage && pet.petImage !== 'default.png'
            ? <img
                src={`/images/pets/${pet.petImage}`}
                alt={pet.petName}
                className="pet-card-img"
                style={isDeceased ? { filter: 'grayscale(40%)' } : {}}
              />
            : <div
                className={`pet-card-img-placeholder ${placeholderClass}`}
                style={isDeceased ? { filter: 'grayscale(40%)' } : {}}
              >
                {emoji}
              </div>
          }
          {isDeceased && <div className="memorial-badge-card">🌈 อยู่ในความทรงจำ</div>}
          <div className="pet-type-badge">{emoji} {typeName}</div>
          <div className="pet-card-overlay">
            <div className="pet-card-name-overlay">{pet.petName}</div>
          </div>
        </div>
        <div className="pet-card-body">
          <div className="pet-card-tags">
            {pet.breed && <span className="pet-tag pet-tag-breed">{pet.breed}</span>}
            <span className={`pet-tag ${pet.gender === 'เพศผู้' ? 'pet-tag-male' : 'pet-tag-female'}`}>
              {pet.gender === 'เพศผู้' ? '♂' : '♀'} {pet.gender}
            </span>
          </div>
          <div className="pet-card-age">
            วันเกิด <span>{formatDate(pet.birthDate)}</span>
            {' · '}อายุ <span>{calcAge(pet.birthDate)}</span>
            <span style={{ color: '#aaa', fontSize: 11 }}> (โดยประมาณ)</span>
          </div>
          <button
            className={`btn-detail${isDeceased ? ' memorial' : ''}`}
            onClick={() => navigate(`/pet-detail/${pet.petID}`)}
          >
            รายละเอียด
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="app-layout">
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
            <a className="menu-item" onClick={() => navigate('/active-jobs')}>
              <span className="menu-icon">⚡</span><span>งานที่มอบหมาย</span>
            </a>
          </div>
          <hr className="menu-divider" />
          <a className="menu-item menu-logout" onClick={handleLogout}>
            <span className="menu-icon">🚪</span><span>ออกจากระบบ</span>
          </a>
        </div>

        <div className="main-content">
          <div className="mypets-header">
            <div className="mypets-title">รายการสัตว์เลี้ยง</div>
          </div>

          {loading ? (
            <div className="mypets-loading">กำลังโหลดข้อมูล...</div>
          ) : (
            <>
              {activePets.length === 0 && deceasedPets.length === 0 ? (
                <div className="mypets-empty">
                  <div className="mypets-empty-icon">🐾</div>
                  <p>ยังไม่มีสัตว์เลี้ยง</p>
                  <p style={{ fontSize: 13, color: '#999', marginTop: 6 }}>
                    กดปุ่ม "เพิ่มสัตว์เลี้ยง" เพื่อเพิ่มสัตว์เลี้ยงของคุณได้เลยครับ
                  </p>
                  <button className="btn-add" style={{ marginTop: 16 }} onClick={() => navigate('/add-pet')}>
                    + เพิ่มสัตว์เลี้ยง
                  </button>
                </div>
              ) : (
                <>
                  <div className="mypets-section-label">สัตว์เลี้ยงของฉัน</div>
                  <div className="mypets-grid" style={{ marginBottom: 24 }}>
                    {activePets.map(pet => (
                      <PetCard key={pet.petID} pet={pet} isDeceased={false} />
                    ))}
                    <div className="pet-card-add" onClick={() => navigate('/add-pet')}>
                      <div className="pet-card-add-circle">+</div>
                      <div className="pet-card-add-text">เพิ่มสัตว์เลี้ยง</div>
                      <div className="pet-card-add-sub">กดเพื่อเพิ่มสัตว์เลี้ยงใหม่</div>
                    </div>
                  </div>
                  {deceasedPets.length > 0 && (
                    <>
                      <div className="mypets-divider" />
                      <div className="mypets-section-label memorial">🌈 อยู่ในความทรงจำ</div>
                      <div className="mypets-grid">
                        {deceasedPets.map(pet => (
                          <PetCard key={pet.petID} pet={pet} isDeceased={true} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default MyPets;
