import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileOwner.css';
import './MyAnnouncements.css';
import logo from '../assets/logo.png';
import NotificationBell from '../components/NotificationBell';

const API = 'http://localhost:8096';

function MyAnnouncements() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const imageUrl = user.profileImage && user.profileImage !== 'default.png'
    ? `/images/owners/${user.profileImage}` : null;

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`${API}/api/announcement/my-announcements/${user.ownerID}`);
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (user.ownerID) fetchAnnouncements();
    else navigate('/');
  }, []);

  const handleLogout = () => { localStorage.removeItem('user'); navigate('/'); };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  };

  const calcAge = (dateStr) => {
    if (!dateStr) return '';
    const b = new Date(dateStr), t = new Date();
    const months = (t.getFullYear()-b.getFullYear())*12+(t.getMonth()-b.getMonth());
    if (months < 12) return `${months} เดือน`;
    const y = Math.floor(months/12), m = months%12;
    return m > 0 ? `${y} ปี ${m} เดือน` : `${y} ปี`;
  };

  const calcDays = (start, end) => {
    if (!start || !end) return 0;
    const diff = new Date(end) - new Date(start);
    return Math.max(1, Math.round(diff / (1000*60*60*24)));
  };

  const getPetEmoji = (typeName) => {
    if (!typeName) return '🐾';
    if (typeName.includes('สุนัข') && !typeName.includes('แมว')) return '🐶';
    if (typeName.includes('แมว') && !typeName.includes('สุนัข')) return '🐱';
    return '🐾';
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'รับสมัคร': return { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
      case 'รอพิจารณา': return { bg: '#EDF4FB', color: '#1d4ed8', border: '#BFDBFE' };
      case 'ได้รับผู้ดูแลแล้ว': return { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
      case 'กำลังดูแล': return { bg: '#fef9ee', color: '#b45309', border: '#fde68a' };
      case 'งานเสร็จสิ้น': return { bg: '#f5f0ed', color: '#8D6E63', border: '#e0d6d0' };
      default: return { bg: '#f5f0ed', color: '#8D6E63', border: '#e0d6d0' };
    }
  };

  const isFinished = (ann) => ann.status === 'งานเสร็จสิ้น';

  const activeAnnouncements = announcements.filter(a => !isFinished(a));
  const historyAnnouncements = announcements.filter(a => isFinished(a));

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
            {imageUrl ? <img src={imageUrl} alt="avatar" /> : <span style={{fontSize:18}}>👤</span>}
          </div>
        </div>
      </div>

      <div className="body-row">
        <div className="sidebar">
          <div className="sidebar-menu">
            <a className="menu-item" onClick={() => navigate('/profile-owner')}><span className="menu-icon">👤</span><span>โปรไฟล์ของฉัน</span></a>
            <a className="menu-item" onClick={() => navigate('/my-pets')}><span className="menu-icon">🐾</span><span>รายการสัตว์เลี้ยง</span></a>
            <a className="menu-item" onClick={() => navigate('/explore-sitters')}><span className="menu-icon">🔍</span><span>ค้นหาผู้ดูแล</span></a>
            <a className="menu-item active" onClick={() => navigate('/my-announcements')}><span className="menu-icon">📢</span><span>รายการประกาศ</span></a>
            <a className="menu-item" onClick={() => navigate('/active-jobs')}><span className="menu-icon">⚡</span><span>งานที่มอบหมาย</span></a>
          </div>
          <hr className="menu-divider" />
          <a className="menu-item menu-logout" onClick={handleLogout}><span className="menu-icon">🚪</span><span>ออกจากระบบ</span></a>
        </div>

        <div className="main-content">
          <div className="myann-header">
            <div className="myann-title">รายการประกาศของฉัน</div>

          </div>

          {loading ? (
            <div className="myann-loading">กำลังโหลดข้อมูล...</div>
          ) : announcements.length === 0 ? (
            <div className="myann-empty">
              <div style={{fontSize:52, marginBottom:12}}>📢</div>
              <p>ยังไม่มีประกาศ</p>
              <p style={{fontSize:13, color:'#999', marginTop:6}}>กดปุ่ม "สร้างประกาศ" เพื่อหาผู้ดูแลสัตว์เลี้ยงได้เลยครับ</p>

            </div>
          ) : (
            <>
              {activeAnnouncements.length === 0 ? (
                <div className="myann-empty">
                  <div style={{fontSize:52, marginBottom:12}}>📢</div>
                  <p>ไม่มีประกาศที่กำลังดำเนินการอยู่</p>
                  <p style={{fontSize:13, color:'#999', marginTop:6}}>กดปุ่ม "สร้างประกาศ" เพื่อหาผู้ดูแลสัตว์เลี้ยงได้เลยครับ</p>
                </div>
              ) : (
                <div className="myann-grid">
                  {activeAnnouncements.map(ann => {
                    const statusStyle = getStatusStyle(ann.status);
                    return (
                      <div key={ann.announceID} className="myann-card">
                        {/* Header */}
                        <div className="myann-card-header">
                          <span className="myann-postdate">โพสต์: {formatDate(ann.postdate)}</span>
                          <span className="myann-pet-name">{ann.petName}</span>
                          <span className="myann-status-badge" style={{background: statusStyle.bg, color: statusStyle.color, border: `0.5px solid ${statusStyle.border}`}}>
                            {ann.status}
                          </span>
                        </div>

                        {/* รูปสัตว์เลี้ยง + badge มุมขวาบน */}
                        <div className="myann-card-img-wrap" style={{position:'relative'}}>
                          {ann.petImage && ann.petImage !== 'default.png'
                            ? <img src={`/images/pets/${ann.petImage}`} alt={ann.petName} className="myann-card-img" />
                            : <div className="myann-card-img-placeholder">{getPetEmoji(ann.petType)}</div>
                          }
                          {/* Badge จำนวนผู้สมัคร */}
                          <div className={`myann-applicant-badge ${ann.applicantCount > 0 ? 'has-applicant' : 'no-applicant'}`}>
                            👥 {ann.applicantCount > 0 ? `${ann.applicantCount} คน` : '0 คน'}
                          </div>
                        </div>

                        {/* ข้อมูล */}
                        <div className="myann-card-body">
                          <div className="myann-info-row">
                            <span className="myann-info-label">ประเภทสัตว์</span>
                            <span>{ann.petType} {getPetEmoji(ann.petType)}</span>
                            <span className="myann-info-label" style={{marginLeft:8}}>สายพันธุ์</span>
                            <span>{ann.breed || '-'}</span>
                          </div>
                          <div className="myann-info-row">
                            <span>{ann.gender === 'เพศผู้' ? '♂' : '♀'} {ann.gender}</span>
                          </div>
                          <div className="myann-info-row">
                            <span className="myann-info-label">วันเกิด</span>
                            <span>{formatDate(ann.birthDate)}</span>
                            <span style={{color:'#aaa', fontSize:11}}>&nbsp;อายุ {calcAge(ann.birthDate)} (โดยประมาณ)</span>
                          </div>
                          <div className="myann-info-row">
                            <span className="myann-info-label">น้ำหนัก</span>
                            <span>{ann.currentweight}</span>
                          </div>
                          <div className="myann-info-row">
                            <span className="myann-info-label">วันที่ดูแล</span>
                            <span>{formatDate(ann.startdate)} - {formatDate(ann.enddate)}</span>
                            <span style={{color:'#8D6E63', fontWeight:600}}>&nbsp;{calcDays(ann.startdate, ann.enddate)} วัน</span>
                          </div>
                        </div>

                        {/* ที่อยู่ + ปุ่ม */}
                        <div className="myann-card-footer">
                          <span className="myann-location">📍 {ann.subdistrict}, {ann.district}, {ann.province}</span>
                          <button className="myann-detail-btn" onClick={() => navigate(`/announcement-detail/${ann.announceID}`)}>
                            รายละเอียด
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ========== ประวัติ: ประกาศที่จบไปแล้ว ========== */}
              {historyAnnouncements.length > 0 && (
                <div style={{marginTop:28}}>
                  <div
                    onClick={() => setShowHistory(!showHistory)}
                    style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer', padding:'10px 14px', background:'#faf7f6', border:'0.5px solid #e8ddd6', borderRadius:10}}
                  >
                    <span style={{fontWeight:700, color:'#5D3A2E', fontSize:14}}>ประวัติประกาศที่จบแล้ว</span>
                    <span style={{fontSize:12, background:'#f0e8e2', color:'#8D6E63', padding:'2px 10px', borderRadius:12}}>
                      {historyAnnouncements.length} รายการ
                    </span>
                    <span style={{marginLeft:'auto', fontSize:12, color:'#8D6E63'}}>{showHistory ? '▲ ปิด' : '▼ เปิด'}</span>
                  </div>

                  {showHistory && (
                    <div className="myann-grid" style={{marginTop:14, opacity:0.85}}>
                      {historyAnnouncements.map(ann => {
                        const statusStyle = getStatusStyle(ann.status);
                        return (
                          <div key={ann.announceID} className="myann-card">
                            <div className="myann-card-header">
                              <span className="myann-postdate">โพสต์: {formatDate(ann.postdate)}</span>
                              <span className="myann-pet-name">{ann.petName}</span>
                              <span className="myann-status-badge" style={{background: statusStyle.bg, color: statusStyle.color, border: `0.5px solid ${statusStyle.border}`}}>
                                {ann.status}
                              </span>
                            </div>
                            <div className="myann-card-img-wrap" style={{position:'relative'}}>
                              {ann.petImage && ann.petImage !== 'default.png'
                                ? <img src={`/images/pets/${ann.petImage}`} alt={ann.petName} className="myann-card-img" style={{filter:'grayscale(35%)'}} />
                                : <div className="myann-card-img-placeholder">{getPetEmoji(ann.petType)}</div>
                              }
                            </div>
                            <div className="myann-card-body">
                              <div className="myann-info-row">
                                <span className="myann-info-label">ประเภทสัตว์</span>
                                <span>{ann.petType} {getPetEmoji(ann.petType)}</span>
                              </div>
                              <div className="myann-info-row">
                                <span className="myann-info-label">วันที่ดูแล</span>
                                <span>{formatDate(ann.startdate)} - {formatDate(ann.enddate)}</span>
                              </div>
                            </div>
                            <div className="myann-card-footer">
                              <span className="myann-location">📍 {ann.subdistrict}, {ann.district}, {ann.province}</span>
                              <button className="myann-detail-btn" onClick={() => navigate(`/announcement-detail/${ann.announceID}`)}>
                                รายละเอียด
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}


        </div>
      </div>
    </div>
  );
}

export default MyAnnouncements;
