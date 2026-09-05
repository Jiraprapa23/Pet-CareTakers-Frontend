import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileOwner.css';
import './MyAnnouncements.css';
import logo from '../assets/logo.png';
import NotificationBell from '../components/NotificationBell';

import { API_BASE_URL as API } from '../config';

function MyAnnouncements() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ทั้งหมด');

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
    return Math.max(1, Math.round(diff / (1000*60*60*24)) + 1);
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
      case 'งานเสร็จสิ้น': return { bg: '#EBF4FA', color: '#7FB3D9', border: '#d6e7f2' };
      case 'หมดอายุ': return { bg: '#F1EFE8', color: '#5F5E5A', border: '#D3D1C7' };
      default: return { bg: '#EBF4FA', color: '#7FB3D9', border: '#d6e7f2' };
    }
  };

  const statusIcons = {
    'รับสมัคร': '📢',
    'รอพิจารณา': '⏳',
    'ได้รับผู้ดูแลแล้ว': '👤',
    'กำลังดูแล': '🐾',
    'งานเสร็จสิ้น': '✅',
    'หมดอายุ': '🚫',
  };

  const filterOptions = [
    { label: 'ทั้งหมด', icon: '📋' },
    { label: 'รับสมัคร', icon: statusIcons['รับสมัคร'] },
    { label: 'รอพิจารณา', icon: statusIcons['รอพิจารณา'] },
    { label: 'ได้รับผู้ดูแลแล้ว', icon: statusIcons['ได้รับผู้ดูแลแล้ว'] },
    { label: 'กำลังดูแล', icon: statusIcons['กำลังดูแล'] },
    { label: 'งานเสร็จสิ้น', icon: statusIcons['งานเสร็จสิ้น'] },
    { label: 'หมดอายุ', icon: statusIcons['หมดอายุ'] },
  ];
  const isFinished = (ann) => ann.status === 'งานเสร็จสิ้น';
  const filtered = filter === 'ทั้งหมด' ? announcements : announcements.filter(a => a.status === filter);

  return (
    <div className="app-layout">
      <div className="topbar">
        <div className="topbar-left">
          <img src={logo} alt="logo" className="topbar-logo" />
          <div className="topbar-title">ระบบตามหาผู้ดูแลสัตว์เลี้ยง<br />ภายในจังหวัดเชียงใหม่</div>
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
          </div>
          <hr className="menu-divider" />
          <a className="menu-item menu-logout" onClick={handleLogout}><span className="menu-icon">🚪</span><span>ออกจากระบบ</span></a>
        </div>

        <div className="main-content">
          <div className="myann-header">
            <div className="myann-title">รายการประกาศของฉัน</div>
            <button className="myann-create-btn" onClick={() => navigate('/add-announcement')}>
              + สร้างประกาศ
            </button>
          </div>

          {/* Filter tabs */}
          {!loading && announcements.length > 0 && (
            <div className="myann-filter-panel">
              <div className="myann-filter-tabs">
                {filterOptions.map(opt => (
                  <button
                    key={opt.label}
                    className={`myann-filter-tab ${filter === opt.label ? 'active' : ''}`}
                    onClick={() => setFilter(opt.label)}
                  >
                    <span className="myann-filter-icon">{opt.icon}</span>
                    {opt.label}
                    <span className="myann-filter-count">
                      {opt.label === 'ทั้งหมด' ? announcements.length : announcements.filter(a => a.status === opt.label).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="myann-loading">กำลังโหลดข้อมูล...</div>
          ) : announcements.length === 0 ? (
            <div className="myann-empty">
              <div style={{fontSize:52, marginBottom:12}}>📢</div>
              <p>ยังไม่มีประกาศ</p>
              <p style={{fontSize:13, color:'#999', marginTop:6}}>กดปุ่ม "สร้างประกาศ" เพื่อหาผู้ดูแลสัตว์เลี้ยงได้เลยครับ</p>
              <button className="myann-create-btn" style={{marginTop:16}} onClick={() => navigate('/add-announcement')}>
                + สร้างประกาศ
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="myann-empty">
              <div style={{fontSize:52, marginBottom:12}}>📢</div>
              <p>ไม่มีประกาศที่มีสถานะ "{filter}"</p>
            </div>
          ) : (
            <div className="myann-grid">
              {filtered.map(ann => {
                const statusStyle = getStatusStyle(ann.status);
                return (
                  <div key={ann.announceID} className="myann-card">
                    {/* Header */}
                    <div className="myann-card-header">
                      <span className="myann-postdate">โพสต์: {formatDate(ann.postdate)}</span>
                      <span className="myann-pet-name">{ann.petName}</span>
                      <span className="myann-status-badge" style={{background: statusStyle.bg, color: statusStyle.color, border: `0.5px solid ${statusStyle.border}`}}>
                        {statusIcons[ann.status] || ''} {ann.status}
                      </span>
                    </div>

                    {/* รูปสัตว์เลี้ยง + badge มุมขวาบน */}
                    <div className="myann-card-img-wrap" style={{position:'relative'}}>
                      {ann.petImage && ann.petImage !== 'default.png'
                        ? <img src={`/images/pets/${ann.petImage}`} alt={ann.petName} className="myann-card-img" style={isFinished(ann) ? {filter:'grayscale(35%)'} : {}} />
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
                        <span style={{ fontSize: 13, background: ann.gender === 'เพศผู้' ? '#EDF4FB' : '#FDF2F8', color: ann.gender === 'เพศผู้' ? '#1d4ed8' : '#be185d', border: `0.5px solid ${ann.gender === 'เพศผู้' ? '#BFDBFE' : '#FBCFE8'}`, padding: '2px 8px', borderRadius: 20, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {ann.gender === 'เพศผู้' ? '♂ เพศผู้' : '♀ เพศเมีย'}
                        </span>
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
                        <span style={{color:'#F96320', fontWeight:600}}>{calcDays(ann.startdate, ann.enddate)} วัน</span>
                        <span>({formatDate(ann.startdate)} - {formatDate(ann.enddate)})</span>
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

        </div>
      </div>
    </div>
  );
}

export default MyAnnouncements;
