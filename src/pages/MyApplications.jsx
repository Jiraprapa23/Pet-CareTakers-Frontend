import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileOwner.css';
import './MyApplications.css';
import logo from '../assets/logo.png';
import NotificationBell from '../components/NotificationBell';

const API = 'http://localhost:8096';

function MyApplications() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ทั้งหมด');

  const imageUrl = user.sitterImage && user.sitterImage !== 'default.png'
    ? `${API}/api/auth/images/${user.sitterImage}` : null;

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch(`${API}/api/sitter-job/my-applications/${user.sitterID}`);
        const data = await res.json();
        setApplications(Array.isArray(data) ? data : []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    if (user.sitterID) fetchApplications();
    else navigate('/');
  }, []);

  const handleLogout = () => { localStorage.removeItem('user'); navigate('/'); };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  };

  const calcDays = (start, end) => {
    if (!start || !end) return 0;
    return Math.max(1, Math.round((new Date(end) - new Date(start)) / (1000*60*60*24)));
  };

  const getPetEmoji = (typeName) => {
    if (!typeName) return '🐾';
    if (typeName.includes('สุนัข') && !typeName.includes('แมว')) return '🐶';
    if (typeName.includes('แมว') && !typeName.includes('สุนัข')) return '🐱';
    return '🐾';
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'รอพิจารณา': return { bg: '#EDF4FB', color: '#1d4ed8', border: '#BFDBFE' };
      case 'ได้รับเลือก': return { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
      case 'ไม่ได้รับเลือก': return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
      case 'ถอนคำขอแล้ว': return { bg: '#f5f0ed', color: '#8D6E63', border: '#e0d6d0' };
      default: return { bg: '#f5f0ed', color: '#8D6E63', border: '#e0d6d0' };
    }
  };

  const filterOptions = ['ทั้งหมด', 'รอพิจารณา', 'ได้รับเลือก', 'ไม่ได้รับเลือก', 'ถอนคำขอแล้ว', 'เสร็จสิ้น'];

  const filtered = filter === 'ทั้งหมด'
    ? applications
    : filter === 'เสร็จสิ้น'
      ? applications.filter(a => a.status === 'งานเสร็จสิ้น')
      : applications.filter(a => a.appStatus === filter);

  return (
    <div className="app-layout">
      <div className="topbar">
        <div className="topbar-left">
          <img src={logo} alt="logo" className="topbar-logo" />
          <div className="topbar-title">ระบบตามหาผู้ดูแลสัตว์เลี้ยง ภายในจังหวัดเชียงใหม่</div>
        </div>
        <div className="topbar-user">
          <span>ยินดีต้อนรับ คุณ{user.firstname}</span>
          <NotificationBell userID={user.sitterID} userRole="SITTER" />
          <div className="topbar-avatar">
            {imageUrl ? <img src={imageUrl} alt="avatar" /> : <span style={{fontSize:18}}>👤</span>}
          </div>
        </div>
      </div>

      <div className="body-row">
        <div className="sidebar">
          <div className="sidebar-menu">
            <a className="menu-item" onClick={() => navigate('/profile-sitter')}><span className="menu-icon">👤</span><span>โปรไฟล์ของฉัน</span></a>
            <a className="menu-item" onClick={() => navigate('/explore-announcements')}><span className="menu-icon">📋</span><span>สำรวจประกาศ</span></a>
            <a className="menu-item active" onClick={() => navigate('/my-applications')}><span className="menu-icon">📝</span><span>คำขอที่ส่งแล้ว</span></a>
            <a className="menu-item" onClick={() => navigate('/active-jobs')}><span className="menu-icon">⚡</span><span>งานที่กำลังทำ</span></a>
          </div>
          <hr className="menu-divider" />
          <a className="menu-item menu-logout" onClick={handleLogout}><span className="menu-icon">🚪</span><span>ออกจากระบบ</span></a>
        </div>

        <div className="main-content">
          <div className="ma-header">
            <div className="ma-title">รายการคำขอที่ส่งแล้ว</div>
          </div>

          {/* Filter tabs */}
          <div className="ma-filter-tabs">
            {filterOptions.map(opt => (
              <button
                key={opt}
                className={`ma-filter-tab ${filter === opt ? 'active' : ''}`}
                onClick={() => setFilter(opt)}
              >
                {opt}
                {opt !== 'ทั้งหมด' && (
                  <span className="ma-filter-count">
                    {opt === 'เสร็จสิ้น'
                      ? applications.filter(a => a.status === 'งานเสร็จสิ้น').length
                      : applications.filter(a => a.appStatus === opt).length}
                  </span>
                )}
                {opt === 'ทั้งหมด' && (
                  <span className="ma-filter-count">{applications.length}</span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="ma-loading">กำลังโหลดข้อมูล...</div>
          ) : filtered.length === 0 ? (
            <div className="ma-empty">
              <div style={{fontSize:52, marginBottom:12}}>📝</div>
              <p>{filter === 'ทั้งหมด' ? 'ยังไม่มีคำขอที่ส่งแล้ว' : `ไม่มีคำขอที่มีสถานะ "${filter}"`}</p>
              <p style={{fontSize:13, color:'#999', marginTop:6}}>กดปุ่ม "สำรวจประกาศ" เพื่อหางานได้เลยครับ</p>
              <button className="ma-explore-btn" style={{marginTop:16}} onClick={() => navigate('/explore-announcements')}>
                📋 สำรวจประกาศ
              </button>
            </div>
          ) : (
            <div className="ma-grid">
              {filtered.map(app => {
                const statusStyle = getStatusStyle(app.appStatus);
                return (
                  <div key={app.applyJobID} className="ma-card">
                    {/* Header */}
                    <div className="ma-card-header">
                      <span className="ma-pet-name">{app.petName}</span>
                      <span className="ma-status-badge" style={{background:statusStyle.bg, color:statusStyle.color, border:`0.5px solid ${statusStyle.border}`}}>
                        {app.appStatus}
                      </span>
                    </div>

                    {/* รูปสัตว์เลี้ยง */}
                    <div className="ma-card-img-wrap">
                      {app.petImage && app.petImage !== 'default.png'
                        ? <img src={`${API}/api/auth/images/${app.petImage}`} alt={app.petName} className="ma-card-img" />
                        : <div className="ma-card-img-placeholder">{getPetEmoji(app.petType)}</div>
                      }
                      {/* Badge ได้รับเลือก */}
                      {app.appStatus === 'ได้รับเลือก' && (
                        <div className="ma-selected-badge">🎉 ได้รับเลือก!</div>
                      )}
                    </div>

                    {/* ข้อมูล */}
                    <div className="ma-card-body">
                      <div className="ma-info-row">
                        <span className="ma-lbl">ประเภทสัตว์</span>
                        <span>{app.petType} {getPetEmoji(app.petType)}</span>
                      </div>
                      <div className="ma-info-row">
                        <span className="ma-lbl">วันที่ดูแล</span>
                        <span>{formatDate(app.startdate)} - {formatDate(app.enddate)}</span>
                        <span style={{color:'#8D6E63', fontWeight:600}}>&nbsp;{calcDays(app.startdate, app.enddate)} วัน</span>
                      </div>
                      <div className="ma-info-row">
                        <span className="ma-lbl">พื้นที่</span>
                        <span>{app.subdistrict}, {app.district}</span>
                      </div>

                      {/* แถบสถานะงาน */}
                      {app.appStatus === 'ได้รับเลือก' && (
                        <div className="ma-next-action">
                          🔔 คุณได้รับเลือก! กดรายละเอียดเพื่อส่งรายงานการดูแล
                        </div>
                      )}
                      {app.appStatus === 'รอพิจารณา' && (
                        <div className="ma-waiting-notice">
                          ⏳ รอเจ้าของสัตว์เลี้ยงพิจารณา
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="ma-card-footer">
                      <span className="ma-ann-status">สถานะประกาศ: <strong>{app.status}</strong></span>
                      <button
                        className={`ma-detail-btn ${app.appStatus === 'ได้รับเลือก' ? 'highlight' : ''}`}
                        onClick={() => navigate(`/announcement-detail-sitter/${app.announceID}`)}
                      >
                        รายละเอียด
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{marginTop:16}}>
            <button className="btn btn-back" onClick={() => navigate('/profile-sitter')}>ย้อนกลับ</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyApplications;
