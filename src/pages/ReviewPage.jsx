import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ProfileOwner.css';
import './ReviewPage.css';
import logo from '../assets/logo.png';
import NotificationBell from '../components/NotificationBell';

const API = 'http://localhost:8096';

function ReviewPage() {
  const navigate = useNavigate();
  const { announceID } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [ann, setAnn] = useState(null);
  const [sitter, setSitter] = useState(null);
  const [sitterApply, setSitterApply] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const imageUrl = user.profileImage && user.profileImage !== 'default.png'
    ? `${API}/api/auth/images/${user.profileImage}` : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API}/api/announcement/detail/${announceID}`);
        const data = await res.json();
        setAnn(data);
        const approved = data.applicants?.find(a => a.appStatus === 'ได้รับเลือก');
        if (approved) {
          setSitterApply(approved);
          const res2 = await fetch(`${API}/api/auth/profile-sitter/${approved.sitterID}`);
          const sitterData = await res2.json();
          setSitter(sitterData);

          // เช็คว่ารีวิวแล้วหรือยัง
          const res3 = await fetch(`${API}/api/review/check/${announceID}/${user.ownerID}/OWNER`);
          const checkData = await res3.json();
          if (checkData.reviewed) setSubmitted(true);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [announceID]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  };

  const calcDays = (start, end) => {
    if (!start || !end) return 1;
    return Math.max(1, Math.round((new Date(end) - new Date(start)) / (1000*60*60*24)));
  };

  const validate = () => {
    const errs = {};
    if (rating === 0) errs.rating = 'กรุณาให้คะแนนผู้ดูแลสัตว์เลี้ยง';
    if (!comment.trim()) errs.comment = 'กรุณาเขียนรีวิว';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const res = await fetch(`${API}/api/review/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announceID: parseInt(announceID),
          reviewerID: user.ownerID,
          reviewerRole: 'OWNER',
          targetID: sitterApply?.sitterID,
          targetRole: 'SITTER',
          rating,
          comment: comment.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      alert('ส่งรีวิวเรียบร้อยแล้ว');
      setSubmitted(true);
      navigate('/my-announcements');
    } catch (err) { alert('เกิดข้อผิดพลาด'); }
  };

  const handleLogout = () => { localStorage.removeItem('user'); navigate('/'); };

  const getPetEmoji = (typeName) => {
    if (!typeName) return '🐾';
    if (typeName.includes('สุนัข') && !typeName.includes('แมว')) return '🐶';
    if (typeName.includes('แมว') && !typeName.includes('สุนัข')) return '🐱';
    return '🐾';
  };

  if (loading) return (
    <div className="app-layout">
      <div style={{padding:60, textAlign:'center', color:'#8D6E63'}}>กำลังโหลดข้อมูล...</div>
    </div>
  );

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
            <a className="menu-item" onClick={() => navigate('/explore-sitters')}><span className="menu-icon">🔍</span><span>สำรวจผู้ดูแล</span></a>
            <a className="menu-item active" onClick={() => navigate('/my-announcements')}><span className="menu-icon">📢</span><span>รายการประกาศ</span></a>
            <a className="menu-item" onClick={() => navigate('/active-jobs')}><span className="menu-icon">⚡</span><span>งานที่กำลังทำ</span></a>
          </div>
          <hr className="menu-divider" />
          <a className="menu-item menu-logout" onClick={handleLogout}><span className="menu-icon">🚪</span><span>ออกจากระบบ</span></a>
        </div>

        <div className="main-content">
          <div className="rv-card">
            <div className="rv-card-title">ให้คะแนน และ รีวิว</div>

            {/* ชื่อเจ้าของ */}
            <div className="rv-owner-name">{user.firstname} {user.lastname}</div>

            {/* ข้อมูลผู้ดูแล */}
            {sitter && (
              <div className="rv-sitter-section">
                <div className="rv-sitter-img">
                  {sitter.sitterImage && sitter.sitterImage !== 'default.png'
                    ? <img src={`${API}/api/auth/images/${sitter.sitterImage}`} alt="sitter" />
                    : <span>👤</span>}
                </div>
                <div className="rv-sitter-info">
                  <div className="rv-sitter-name">{sitter.firstname} {sitter.lastname}</div>
                  <div className="rv-sitter-detail">
                    <span className="rv-dot">•</span> ประเภทสัตว์ที่รับดูแล {sitter.petAllowType} {getPetEmoji(sitter.petAllowType)}
                  </div>
                  <div className="rv-sitter-detail">
                    <span className="rv-dot">•</span> ขนาดของสัตว์ที่รับดูแล {sitter.acceptedPetSize}
                  </div>
                  {(ann?.carePet?.isCleanService || ann?.carePet?.isWalkService) && (
                    <div className="rv-sitter-detail">
                      <span className="rv-dot">•</span> บริการเสริม {[ann?.carePet?.isCleanService && 'เก็บ อึ อี', ann?.carePet?.isWalkService && 'พาเดินเล่น'].filter(Boolean).join(', ')}
                    </div>
                  )}
                  <div className="rv-sitter-dates">
                    วันที่ดูแล {formatDate(ann?.startdate)} - {formatDate(ann?.enddate)} &nbsp;
                    <span className="rv-days-badge">{calcDays(ann?.startdate, ann?.enddate)} วัน</span>
                  </div>
                </div>
              </div>
            )}

            <hr className="rv-divider" />

            {submitted ? (
              <div className="rv-submitted">
                ✅ คุณส่งรีวิวงานนี้แล้วครับ
              </div>
            ) : (
              <>
                {/* ดาว + รีวิว */}
                <div className="rv-bottom-section">
                  <div className="rv-write-label">เขียนรีวิว</div>
                  <div className="rv-stars">
                    {[1,2,3,4,5].map(star => (
                      <span
                        key={star}
                        className={`rv-star ${(hoverRating || rating) >= star ? 'active' : ''}`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                      >★</span>
                    ))}
                  </div>
                  {errors.rating && <p className="rv-error">{errors.rating}</p>}

                  <textarea
                    className="rv-textarea"
                    placeholder="เขียนรีวิวของคุณที่นี่..."
                    value={comment}
                    onChange={e => { setComment(e.target.value); setErrors(p => ({...p, comment:''})); }}
                    rows={4}
                  />
                  {errors.comment && <p className="rv-error">{errors.comment}</p>}
                </div>
              </>
            )}
          </div>

          <div className="btn-group" style={{marginTop:16}}>
            <button className="btn btn-back" onClick={() => navigate(`/announcement-detail/${announceID}`)}>ย้อนกลับ</button>
            {!submitted && (
              <button className="rv-submit-btn" onClick={handleSubmit}>ส่งรีวิว</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewPage;