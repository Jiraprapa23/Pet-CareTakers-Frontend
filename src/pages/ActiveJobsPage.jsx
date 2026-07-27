import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileOwner.css';
import './ActiveJobsPage.css';
import logo from '../assets/logo.png';
import NotificationBell from '../components/NotificationBell';

const API = 'http://localhost:8096';

function ActiveJobsPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwner = user.role === 'OWNER';

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const imageUrl = isOwner
    ? (user.profileImage && user.profileImage !== 'default.png' ? `${API}/api/auth/images/${user.profileImage}` : null)
    : (user.sitterImage && user.sitterImage !== 'default.png' ? `${API}/api/auth/images/${user.sitterImage}` : null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        if (isOwner) {
          // ดึงประกาศที่กำลังดูแลอยู่
          const res = await fetch(`${API}/api/announcement/my-announcements/${user.ownerID}`);
          const data = await res.json();
          const active = data.filter(a =>
            ['รอพิจารณา', 'ได้รับผู้ดูแลแล้ว', 'กำลังดูแล'].includes(a.status)
          );
          setJobs(active);
        } else {
          // ดึงคำขอที่ได้รับเลือก
          const res = await fetch(`${API}/api/sitter-job/my-applications/${user.sitterID}`);
          const data = await res.json();
          const active = data.filter(a => a.appStatus === 'ได้รับเลือก');
          setJobs(active);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchJobs();
  }, []);

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
      case 'ได้รับผู้ดูแลแล้ว': return { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
      case 'กำลังดูแล': return { bg: '#fef9ee', color: '#b45309', border: '#fde68a' };
      case 'ได้รับเลือก': return { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
      default: return { bg: '#f5f0ed', color: '#8D6E63', border: '#e0d6d0' };
    }
  };

  const handleLogout = () => { localStorage.removeItem('user'); navigate('/'); };

  return (
    <div className="app-layout">
      <div className="topbar">
        <div className="topbar-left">
          <img src={logo} alt="logo" className="topbar-logo" />
          <div className="topbar-title">ระบบตามหาผู้ดูแลสัตว์เลี้ยง ภายในจังหวัดเชียงใหม่</div>
        </div>
        <div className="topbar-user">
          <span>ยินดีต้อนรับ คุณ{user.firstname}</span>
          <NotificationBell
            userID={isOwner ? user.ownerID : user.sitterID}
            userRole={isOwner ? 'OWNER' : 'SITTER'}
          />
          <div className="topbar-avatar">
            {imageUrl ? <img src={imageUrl} alt="avatar" /> : <span style={{fontSize:18}}>👤</span>}
          </div>
        </div>
      </div>

      <div className="body-row">
        <div className="sidebar">
          <div className="sidebar-menu">
            {isOwner ? (
              <>
                <a className="menu-item" onClick={() => navigate('/profile-owner')}><span className="menu-icon">👤</span><span>โปรไฟล์ของฉัน</span></a>
                <a className="menu-item" onClick={() => navigate('/my-pets')}><span className="menu-icon">🐾</span><span>รายการสัตว์เลี้ยง</span></a>
                <a className="menu-item" onClick={() => navigate('/explore-sitters')}><span className="menu-icon">🔍</span><span>สำรวจผู้ดูแล</span></a>
                <a className="menu-item" onClick={() => navigate('/my-announcements')}><span className="menu-icon">📢</span><span>รายการประกาศ</span></a>
                <a className="menu-item active" onClick={() => navigate('/active-jobs')}><span className="menu-icon">⚡</span><span>งานที่กำลังทำ</span></a>
              </>
            ) : (
              <>
                <a className="menu-item" onClick={() => navigate('/profile-sitter')}><span className="menu-icon">👤</span><span>โปรไฟล์ของฉัน</span></a>
                <a className="menu-item" onClick={() => navigate('/explore-announcements')}><span className="menu-icon">📋</span><span>สำรวจประกาศ</span></a>
                <a className="menu-item" onClick={() => navigate('/my-applications')}><span className="menu-icon">📝</span><span>คำขอที่ส่งแล้ว</span></a>
                <a className="menu-item active" onClick={() => navigate('/active-jobs')}><span className="menu-icon">⚡</span><span>งานที่กำลังทำ</span></a>
              </>
            )}
          </div>
          <hr className="menu-divider" />
          <a className="menu-item menu-logout" onClick={handleLogout}><span className="menu-icon">🚪</span><span>ออกจากระบบ</span></a>
        </div>

        <div className="main-content">
          <div className="aj-header">
            <div className="aj-title">⚡ งานที่กำลังทำ</div>
            <span className="aj-count">{jobs.length} งาน</span>
          </div>

          {loading ? (
            <div className="aj-loading">กำลังโหลดข้อมูล...</div>
          ) : jobs.length === 0 ? (
            <div className="aj-empty">
              <div style={{fontSize:52, marginBottom:12}}>⚡</div>
              <p>ยังไม่มีงานที่กำลังทำอยู่ครับ</p>
              <p style={{fontSize:13, color:'#999', marginTop:6}}>
                {isOwner ? 'สร้างประกาศเพื่อหาผู้ดูแลได้เลยครับ' : 'สำรวจประกาศเพื่อหางานได้เลยครับ'}
              </p>
              <button className="aj-action-btn" style={{marginTop:16}} onClick={() => navigate(isOwner ? '/add-announcement' : '/explore-announcements')}>
                {isOwner ? '+ สร้างประกาศ' : '📋 สำรวจประกาศ'}
              </button>
            </div>
          ) : (
            <div className="aj-grid">
              {jobs.map(job => {
                const statusStyle = getStatusStyle(job.status || job.appStatus);
                const status = job.status || job.appStatus;
                return (
                  <div key={job.announceID || job.applyJobID} className="aj-card">
                    {/* รูปสัตว์เลี้ยง */}
                    <div className="aj-card-img">
                      {job.petImage && job.petImage !== 'default.png'
                        ? <img src={`${API}/api/auth/images/${job.petImage}`} alt={job.petName} />
                        : <span>{getPetEmoji(job.petType)}</span>}
                    </div>

                    <div className="aj-card-body">
                      <div className="aj-card-top">
                        <span className="aj-pet-name">{job.petName}</span>
                        <span className="aj-status" style={{background:statusStyle.bg, color:statusStyle.color, border:`0.5px solid ${statusStyle.border}`}}>
                          {status}
                        </span>
                      </div>
                      <div className="aj-info-row">
                        <span className="aj-lbl">ประเภท</span>
                        <span>{job.petType} {getPetEmoji(job.petType)}</span>
                      </div>
                      <div className="aj-info-row">
                        <span className="aj-lbl">วันที่ดูแล</span>
                        <span>{formatDate(job.startdate)} - {formatDate(job.enddate)}</span>
                        <span style={{color:'#8D6E63', fontWeight:600}}> {calcDays(job.startdate, job.enddate)} วัน</span>
                      </div>
                      <div className="aj-info-row">
                        <span className="aj-lbl">พื้นที่</span>
                        <span>{job.subdistrict}, {job.district}</span>
                      </div>

                      {/* Action hint */}
                      {isOwner && status === 'รอพิจารณา' && (
                        <div className="aj-hint orange">⏳ รอพิจารณาผู้สมัคร</div>
                      )}
                      {isOwner && status === 'ได้รับผู้ดูแลแล้ว' && (
                        <div className="aj-hint green">✅ ได้รับผู้ดูแลแล้ว รอเริ่มงาน</div>
                      )}
                      {!isOwner && status === 'ได้รับเลือก' && (
                        <div className="aj-hint green">🎉 คุณได้รับเลือก! เตรียมตัวสำหรับงานดูแลครับ</div>
                      )}

                      <button
                        className="aj-detail-btn"
                        onClick={() => navigate(isOwner
                          ? `/announcement-detail/${job.announceID}`
                          : `/announcement-detail-sitter/${job.announceID}`
                        )}
                      >
                        รายละเอียด →
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

export default ActiveJobsPage;
