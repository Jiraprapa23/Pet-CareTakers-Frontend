import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ProfileOwner.css';
import './ReviewPage.css';
import logo from '../assets/logo.png';

const API = 'http://localhost:8096';

function ReviewPageSitter() {
  const navigate = useNavigate();
  const { announceID } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [ann, setAnn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const imageUrl = user.sitterImage && user.sitterImage !== 'default.png'
    ? `${API}/api/auth/images/${user.sitterImage}` : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API}/api/sitter-job/detail/${announceID}/${user.sitterID}`);
        const data = await res.json();
        setAnn(data);

        // เช็คว่ารีวิวแล้วหรือยัง
        const res2 = await fetch(`${API}/api/review/check/${announceID}/${user.sitterID}/SITTER`);
        const checkData = await res2.json();
        if (checkData.reviewed) setSubmitted(true);
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

  const calcAge = (dateStr) => {
    if (!dateStr) return '';
    const b = new Date(dateStr), t = new Date();
    const months = (t.getFullYear()-b.getFullYear())*12+(t.getMonth()-b.getMonth());
    if (months < 12) return `${months} เดือน`;
    const y = Math.floor(months/12), m = months%12;
    return m > 0 ? `${y} ปี ${m} เดือน` : `${y} ปี`;
  };

  const calcDays = (start, end) => {
    if (!start || !end) return 1;
    return Math.max(1, Math.round((new Date(end) - new Date(start)) / (1000*60*60*24)));
  };

  const getPetEmoji = (typeName) => {
    if (!typeName) return '🐾';
    if (typeName.includes('สุนัข') && !typeName.includes('แมว')) return '🐶';
    if (typeName.includes('แมว') && !typeName.includes('สุนัข')) return '🐱';
    return '🐾';
  };

  const validate = () => {
    const errs = {};
    if (rating === 0) errs.rating = 'กรุณาให้คะแนนเจ้าของสัตว์เลี้ยง';
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
          reviewerID: user.sitterID,
          reviewerRole: 'SITTER',
          targetID: ann?.owner?.ownerID,
          targetRole: 'OWNER',
          rating,
          comment: comment.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      alert('ส่งรีวิวเรียบร้อยแล้ว');
      setSubmitted(true);
      navigate('/my-applications');
    } catch (err) { alert('เกิดข้อผิดพลาด'); }
  };

  const handleSkip = () => {
    navigate('/my-applications');
  };

  const handleLogout = () => { localStorage.removeItem('user'); navigate('/'); };

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
          </div>
          <hr className="menu-divider" />
          <a className="menu-item menu-logout" onClick={handleLogout}><span className="menu-icon">🚪</span><span>ออกจากระบบ</span></a>
        </div>

        <div className="main-content">
          <div className="rv-card">
            <div className="rv-card-title">ให้คะแนน และ รีวิว</div>

            {/* ชื่อผู้ดูแล */}
            <div className="rv-owner-name">{user.firstname} {user.lastname}</div>

            {/* ข้อมูลสัตว์เลี้ยง + เจ้าของ */}
            <div className="rv-sitter-section">
              <div className="rv-sitter-img">
                {ann?.pet?.petImage && ann.pet.petImage !== 'default.png'
                  ? <img src={`${API}/api/auth/images/${ann.pet.petImage}`} alt="pet" />
                  : <span style={{fontSize:32}}>{getPetEmoji(ann?.pet?.petType)}</span>}
              </div>
              <div className="rv-sitter-info">
                <div className="rv-sitter-name">{ann?.pet?.petName}</div>
                <div className="rv-sitter-detail">
                  <span className="rv-dot">•</span>
                  <span>ประเภทสัตว์ {ann?.pet?.petType} {getPetEmoji(ann?.pet?.petType)}</span>
                  <span style={{marginLeft:16}}>สายพันธุ์ {ann?.pet?.breed || '-'}</span>
                </div>
                <div className="rv-sitter-detail">
                  <span className="rv-dot">•</span>
                  {ann?.pet?.gender === 'เพศผู้' ? '♂' : '♀'} {ann?.pet?.gender}
                </div>
                <div className="rv-sitter-detail">
                  <span className="rv-dot">•</span>
                  วันเกิด {formatDate(ann?.pet?.birthDate)} อายุ {calcAge(ann?.pet?.birthDate)}
                  <span style={{color:'#aaa', fontSize:12, marginLeft:4}}>(โดยประมาณ)</span>
                </div>
                <div className="rv-sitter-dates">
                  วันที่ดูแล {formatDate(ann?.startdate)} - {formatDate(ann?.enddate)} &nbsp;
                  <span className="rv-days-badge">{calcDays(ann?.startdate, ann?.enddate)} วัน</span>
                </div>
              </div>
            </div>

            <hr className="rv-divider" />

            {submitted ? (
              <div className="rv-submitted">✅ คุณส่งรีวิวงานนี้แล้วครับ</div>
            ) : (
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
                {errors.rating && <p className="rv-error" style={{clear:'both'}}>{errors.rating}</p>}

                <textarea
                  className="rv-textarea"
                  placeholder="เขียนรีวิวของคุณที่นี่..."
                  value={comment}
                  onChange={e => { setComment(e.target.value); setErrors(p => ({...p, comment:''})); }}
                  rows={4}
                />
                {errors.comment && <p className="rv-error">{errors.comment}</p>}
              </div>
            )}
          </div>

          <div className="btn-group" style={{marginTop:16}}>
            <button className="btn btn-back" onClick={() => navigate(`/announcement-detail-sitter/${announceID}`)}>ย้อนกลับ</button>
            {!submitted && (
              <>
                <button className="rv-skip-btn" onClick={handleSkip}>ข้ามไปก่อน</button>
                <button className="rv-submit-btn" onClick={handleSubmit}>ส่งรีวิว</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewPageSitter;
