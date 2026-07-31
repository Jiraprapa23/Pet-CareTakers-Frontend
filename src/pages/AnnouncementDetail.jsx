import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ProfileOwner.css';
import './AnnouncementDetail.css';
import logo from '../assets/logo.png';
import NotificationBell from '../components/NotificationBell';

const API = 'http://localhost:8096';

function AnnouncementDetail() {
  const navigate = useNavigate();
  const { announceID } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [ann, setAnn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplicants, setShowApplicants] = useState(true);
  const [showReport, setShowReport] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ show: false, applyJobID: null, sitterName: '' });
  const [completeModal, setCompleteModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const imageUrl = user.profileImage && user.profileImage !== 'default.png'
    ? `/images/owners/${user.profileImage}` : null;

  const fetchDetail = async () => {
    try {
      const res = await fetch(`${API}/api/announcement/detail/${announceID}`);
      const data = await res.json();
      setAnn(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDetail(); }, [announceID]);

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

  const handleApprove = async () => {
    try {
      const res = await fetch(`${API}/api/announcement/approve/${confirmModal.applyJobID}`, { method: 'PUT' });
      let data = {};
      try { data = await res.json(); } catch { data = {}; }
      if (!res.ok) { alert(data.message || 'เกิดข้อผิดพลาด'); return; }
      alert(data.message || 'อนุมัติเรียบร้อยแล้ว');
      setConfirmModal({ show: false, applyJobID: null, sitterName: '' });
      fetchDetail();
    } catch (err) { alert('เกิดข้อผิดพลาด'); }
  };

  const handleComplete = async () => {
    try {
      const res = await fetch(`${API}/api/announcement/complete/${announceID}`, { method: 'PUT' });
      const data = await res.json();
      alert(data.message);
      setCompleteModal(false);
      navigate(`/payment/${announceID}`);
    } catch (err) { alert('เกิดข้อผิดพลาด'); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${API}/api/announcement/delete/${announceID}`, { method: 'DELETE' });
      let data = {};
      try { data = await res.json(); } catch { data = {}; }
      if (!res.ok) { alert(data.message || 'ไม่สามารถลบประกาศได้'); setDeleteModal(false); return; }
      alert(data.message || 'ลบประกาศเรียบร้อยแล้ว');
      setDeleteModal(false);
      navigate('/my-announcements');
    } catch (err) { alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'); }
    finally { setDeleting(false); }
  };

  const handleEdit = () => {
    if (ann?.applicantCount > 0) {
      alert('ไม่สามารถแก้ไขประกาศได้ เนื่องจากมีผู้สมัครแล้ว');
      return;
    }
    navigate(`/edit-announcement/${announceID}`);
  };

  const hasApprovedSitter = ann?.applicants?.some(a => a.appStatus === 'ได้รับเลือก');
  const totalSlots = [
    ann?.carePet?.careMorning, ann?.carePet?.careAfternoon,
    ann?.carePet?.careEvening, ann?.carePet?.careNight
  ].filter(Boolean).length;
  const reportedCount = ann?.reports?.length || 0;
  const allReported = totalSlots > 0 && reportedCount >= totalSlots;

  const getBehaviors = (pet) => {
    const list = [];
    if (pet?.behaviorStressAlone) list.push('เครียดเมื่อเจ้าของไม่อยู่');
    if (pet?.behaviorFriendly) list.push('เฟรนลี่ / ติดคน');
    if (pet?.behaviorFearStranger) list.push('กลัวคนแปลกหน้า');
    if (pet?.behaviorFearLoudSound) list.push('กลัวเสียงดัง');
    if (pet?.behaviorBarkLoud) list.push('เห่า/ส่งเสียงดัง');
    if (pet?.behaviorDislikeTouch) list.push('ไม่ชอบให้จับบางจุด');
    if (pet?.behaviorBiteScrath) list.push('กัดหรือข่วนเมื่อเครียด');
    if (pet?.behaviorEscapeExpert) list.push('หนีเก่งเมื่อเปิดประตู');
    if (pet?.behaviorHighEnergy) list.push('เล่นแรง / พลังงานสูง');
    if (pet?.behaviorJumpOnPeople) list.push('กระโดดใส่คนหรือสิ่งของ');
    if (pet?.behaviorHardControl) list.push('ควบคุมยากเมื่อเครียด');
    return list;
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
          <div className="ad-card">
            <div className="ad-card-top">
              <div>
                <div className="ad-card-title">รายละเอียดประกาศ</div>
                <div className="ad-postdate">📅 โพสต์: {formatDate(ann?.postdate)}</div>
              </div>
              <span className={`ad-status-badge ad-status-${ann?.status?.replace(/\s/g,'')}`}>
                {ann?.status}
              </span>
            </div>

            <div className="ad-top-row">
              {/* เจ้าของ */}
              <div className="ad-sec-box">
                <div className="ad-sec-title">เจ้าของสัตว์เลี้ยง</div>
                <div className="ad-owner-row">
                  <div className="ad-avatar">
                    {ann?.owner?.profileImage && ann.owner.profileImage !== 'default.png'
                      ? <img src={`/images/owners/${ann.owner.profileImage}`} alt="owner" />
                      : <span>👤</span>}
                  </div>
                  <div>
                    <div style={{fontSize:14, fontWeight:700, color:'#3d2b1f'}}>{ann?.owner?.firstname} {ann?.owner?.lastname}</div>
                    <div style={{fontSize:12, color:'#8D6E63'}}>{ann?.owner?.gender} · อายุ {calcAge(ann?.owner?.birthdate)} ปี</div>
                  </div>
                </div>
                <div className="ad-info-row"><span className="ad-lbl">วันเกิด :</span> {formatDate(ann?.owner?.birthdate)}</div>
                <div className="ad-info-row"><span className="ad-lbl">โทรศัพท์ :</span> {ann?.owner?.phoneNumber}</div>
                <div className="ad-info-row"><span className="ad-lbl">อีเมล :</span> {ann?.owner?.email}</div>
              </div>

              {/* สัตว์เลี้ยง */}
              <div className="ad-sec-box">
                <div className="ad-sec-title">ข้อมูลสัตว์เลี้ยง</div>
                <div className="ad-pet-row">
                  <div className="ad-pet-img">
                    {ann?.pet?.petImage && ann.pet.petImage !== 'default.png'
                      ? <img src={`/images/pets/${ann.pet.petImage}`} alt="pet" />
                      : <span style={{fontSize:28}}>🐾</span>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14, fontWeight:700, color:'#3d2b1f', marginBottom:4}}>{ann?.pet?.petName}</div>
                    <div className="ad-info-row"><span className="ad-lbl">ประเภท :</span> {ann?.pet?.petType}</div>
                    <div className="ad-info-row"><span className="ad-lbl">เพศ :</span> {ann?.pet?.gender}</div>
                    <div className="ad-info-row"><span className="ad-lbl">น้ำหนัก :</span> {ann?.currentweight}</div>
                  </div>
                </div>
                <div className="ad-pet-sub-grid">
                  <div>
                    <div className="ad-sub-title">วัคซีน</div>
                    {ann?.pet?.vacRabiesDate && <div className="ad-dot-row"><span className="ad-dot">•</span>Rabies [{formatDate(ann.pet.vacRabiesDate)}]</div>}
                    {ann?.pet?.vacDhppiDate && <div className="ad-dot-row"><span className="ad-dot">•</span>DHPPi [{formatDate(ann.pet.vacDhppiDate)}]</div>}
                    {ann?.pet?.vacFvrcpDate && <div className="ad-dot-row"><span className="ad-dot">•</span>FVRCP [{formatDate(ann.pet.vacFvrcpDate)}]</div>}
                    {!ann?.pet?.vacRabiesDate && !ann?.pet?.vacDhppiDate && !ann?.pet?.vacFvrcpDate &&
                      <div style={{fontSize:12, color:'#aaa'}}>ไม่มีข้อมูลวัคซีน</div>}
                    <div style={{marginTop:6}}>
                      <div className="ad-sub-title">โรคประจำตัว</div>
                      <div className="ad-dot-row"><span className="ad-dot">•</span>
                        {ann?.pet?.hasCongenitalDisease === 'มี' ? ann.pet.congenitalDiseaseDetail : 'ไม่มีโรคประจำตัว'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="ad-sub-title">พฤติกรรม</div>
                    {getBehaviors(ann?.pet).length > 0
                      ? getBehaviors(ann?.pet).map((b, i) => <div key={i} className="ad-dot-row"><span className="ad-dot">•</span>{b}</div>)
                      : <div style={{fontSize:12, color:'#aaa'}}>ไม่มีข้อมูลพฤติกรรม</div>}
                  </div>
                </div>
              </div>
            </div>

            <div className="ad-bottom-row">
              <div className="ad-sec-box">
                <div className="ad-sec-title">รายละเอียดการดูแล</div>
                <div style={{fontSize:13, fontWeight:700, color:'#3d2b1f', marginBottom:8}}>
                  {formatDate(ann?.startdate)} - {formatDate(ann?.enddate)}
                  <span className="ad-days-badge">{calcDays(ann?.startdate, ann?.enddate)} วัน</span>
                </div>
                <div className="ad-sub-title">ช่วงเวลาดูแล</div>
                {ann?.carePet?.careMorning && <div className="ad-dot-row"><span className="ad-dot">•</span>เช้า 06:00 - 10:00น.</div>}
                {ann?.carePet?.careAfternoon && <div className="ad-dot-row"><span className="ad-dot">•</span>กลางวัน 11:00 - 15:00น.</div>}
                {ann?.carePet?.careEvening && <div className="ad-dot-row"><span className="ad-dot">•</span>เย็น 16:00 - 20:00น.</div>}
                {ann?.carePet?.careNight && <div className="ad-dot-row"><span className="ad-dot">•</span>ดึก 21:00 - 24:00น.</div>}
                <div className="ad-sub-title" style={{marginTop:8}}>การให้อาหาร</div>
                {ann?.carePet?.feedMorning && <div className="ad-dot-row"><span className="ad-dot">•</span>เช้า 06:00 - 10:00น.</div>}
                {ann?.carePet?.feedAfternoon && <div className="ad-dot-row"><span className="ad-dot">•</span>กลางวัน 11:00 - 15:00น.</div>}
                {ann?.carePet?.feedEvening && <div className="ad-dot-row"><span className="ad-dot">•</span>เย็น 16:00 - 20:00น.</div>}
                {ann?.carePet?.feedNight && <div className="ad-dot-row"><span className="ad-dot">•</span>ดึก 21:00 - 24:00น.</div>}
                <div className="ad-sub-title" style={{marginTop:8}}>ปริมาณอาหาร</div>
                <div className="ad-dot-row"><span className="ad-dot">•</span>
                  {ann?.carePet?.isFoodPrepared ? 'จัดเตรียมไว้ให้แล้ว' : ann?.carePet?.foodAmount || '-'}
                </div>
              </div>

              <div className="ad-sec-box">
                <div className="ad-sec-title">บริการเสริม</div>
                {ann?.carePet?.medicineDetail
                  ? <div className="ad-dot-row"><span className="ad-dot">•</span>ป้อนยา: {ann.carePet.medicineDetail}</div>
                  : <div className="ad-dot-row"><span className="ad-dot">•</span>ไม่มีการป้อนยา</div>}
                {ann?.carePet?.isCleanService && <div className="ad-dot-row"><span className="ad-dot">•</span>เก็บ อึ อี</div>}
                {ann?.carePet?.isWalkService && <div className="ad-dot-row"><span className="ad-dot">•</span>พาเดินเล่น</div>}
                {ann?.totalAmount > 0 && (
                  <div style={{marginTop:12, paddingTop:10, borderTop:'0.5px solid #f0e8e2'}}>
                    <div className="ad-sub-title">ค่าดูแลรวม</div>
                    <div style={{fontSize:16, fontWeight:700, color:'#16a34a'}}>
                      {ann.totalAmount?.toLocaleString()} บาท
                    </div>
                  </div>
                )}
              </div>

              <div className="ad-sec-box">
                <div className="ad-sec-title">ที่อยู่</div>
                <div className="ad-info-row" style={{marginBottom:6}}>
                  {ann?.addressNo} {ann?.street && ann.street !== '-' ? `ถนน ${ann.street}` : ''} ต.{ann?.subdistrict} อ.{ann?.district} จ.{ann?.province} {ann?.zipcode}
                </div>
                <div style={{display:'flex', alignItems:'flex-start', gap:4, marginTop:4}}>
                  <span style={{color:'#dc2626', fontSize:13}}>📍</span>
                  <span style={{fontSize:12, color:'#666', lineHeight:1.5}}>
                    {ann?.addressNo} ต.{ann?.subdistrict} อ.{ann?.district} จ.{ann?.province}
                  </span>
                </div>
                {ann?.latitude && ann?.longitude && (
                  <a href={`https://www.google.com/maps?q=${ann.latitude},${ann.longitude}`}
                    target="_blank" rel="noopener noreferrer" className="ad-map-btn">
                    🗺️ นำทางด้วย Google Maps
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="ad-action-row">
            <button className="ad-edit-btn" onClick={handleEdit}>✏️ แก้ไข</button>
            {(() => {
              const today = new Date(); today.setHours(0,0,0,0);
              const endPassed = ann?.enddate && new Date(ann.enddate) < today;
              const safeStatus = !['งานเสร็จสิ้น','ได้รับผู้ดูแลแล้ว','กำลังดูแล'].includes(ann?.status);
              const hasActiveApplicant = ann?.applicants?.some(a => a.appStatus === 'รอพิจารณา' || a.appStatus === 'ได้รับเลือก');
              const canDelete = endPassed && safeStatus && !hasActiveApplicant;
              return canDelete ? (
                <button className="ad-edit-btn"
                  style={{background:'#fef2f2', color:'#dc2626', border:'0.5px solid #fecaca'}}
                  onClick={() => setDeleteModal(true)}>
                  🗑️ ลบประกาศ
                </button>
              ) : null;
            })()}
          </div>

          <div className="ad-section-wrap">
            <div className="ad-section-header" onClick={() => setShowApplicants(!showApplicants)}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <span className="ad-section-title">รายชื่อผู้ส่งคำขอรับงาน</span>
                <span className="ad-count-badge">{ann?.applicantCount || 0} คน</span>
              </div>
              <span style={{fontSize:12, color:'#8D6E63'}}>{showApplicants ? '▲ ปิด' : '▼ เปิด'}</span>
            </div>
            {showApplicants && (
              <div className="ad-section-body">
                {!ann?.applicants || ann.applicants.length === 0 ? (
                  <div className="ad-empty-text">ยังไม่มีผู้สมัคร</div>
                ) : (
                  ann.applicants.map(applicant => (
                    <div key={applicant.applyJobID} className={`ad-applicant-card ${applicant.appStatus === 'ไม่ได้รับเลือก' ? 'rejected' : ''}`}>
                      <div className="ad-applicant-img">
                        {applicant.sitterImage && applicant.sitterImage !== 'default.png'
                          ? <img src={`/images/sitters/${applicant.sitterImage}`} alt="sitter" />
                          : <span>👤</span>}
                      </div>
                      <div className="ad-applicant-info">
                        <div className="ad-applicant-name">{applicant.sitterName}</div>
                        <div className="ad-applicant-detail">💰 {applicant.pricePerDay} บาท/วัน · ต.{applicant.subdistrict}, {applicant.province}</div>
                        <div className="ad-applicant-detail">รับดูแล {applicant.petAlowPet}</div>
                        {applicant.distance && <div className="ad-applicant-dist">📍 ห่างจากคุณ {applicant.distance} กม.</div>}
                      </div>
                      <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6}}>
                        {applicant.appStatus === 'รอพิจารณา' && !hasApprovedSitter && (
                          <button className="ad-approve-btn" onClick={() => setConfirmModal({ show: true, applyJobID: applicant.applyJobID, sitterName: applicant.sitterName })}>
                            อนุมัติ
                          </button>
                        )}
                        {applicant.appStatus === 'ได้รับเลือก' && <span className="ad-selected-badge">✓ ได้รับเลือก</span>}
                        {applicant.appStatus === 'ไม่ได้รับเลือก' && <span className="ad-rejected-badge">ไม่ได้รับเลือก</span>}
                        <button className="ad-sitter-detail-btn" onClick={() => navigate(`/sitter-profile/${applicant.sitterID}`)}>รายละเอียด</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="ad-section-wrap">
            <div className="ad-section-header" onClick={() => setShowReport(!showReport)}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <span className="ad-section-title">รายงานการดูแล</span>
                <span className="ad-count-badge">{ann?.reports?.length || 0} ช่วงเวลา</span>
              </div>
              <span style={{fontSize:12, color:'#8D6E63'}}>{showReport ? '▲ ปิด' : '▼ เปิด'}</span>
            </div>
            {showReport && (
              <div className="ad-section-body">
                {!ann?.reports || ann.reports.length === 0 ? (
                  <div className="ad-empty-text">ยังไม่มีรายงานการดูแล</div>
                ) : (
                  ann.reports.map((report, i) => (
                    <div key={i} style={{background:'#faf7f6', border:'0.5px solid #e8ddd6', borderRadius:10, padding:12, marginBottom:10}}>
                      <div style={{fontSize:13, fontWeight:700, color:'#8D6E63', marginBottom:8}}>
                        🕐 {report.timecare}
                      </div>
                      {report.image && (() => {
                        try {
                          const imgs = JSON.parse(report.image);
                          return imgs.length > 0 ? (
                            <div style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom:8}}>
                              {imgs.map((img, idx) => (
                                <a key={idx} href={`/images/reports/${img}`} target="_blank" rel="noopener noreferrer">
                                  <img src={`/images/reports/${img}`} alt={`report-${idx}`}
                                    style={{width:100, height:80, objectFit:'cover', borderRadius:8, border:'0.5px solid #e0d6d0'}} />
                                </a>
                              ))}
                            </div>
                          ) : null;
                        } catch { return null; }
                      })()}
                      {report.video && (
                        <div style={{marginTop:4}}>
                          <video controls style={{width:'100%', maxWidth:320, borderRadius:8, border:'0.5px solid #e0d6d0'}}>
                            <source src={`/images/reports/${report.video}`} type="video/mp4" />
                          </video>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="btn-group" style={{marginTop:8}}>
            <button className="btn btn-back" onClick={() => navigate('/my-announcements')}>ย้อนกลับ</button>
            {hasApprovedSitter && ann?.status !== 'งานเสร็จสิ้น' && (
              allReported
                ? <button className="ad-complete-btn" onClick={() => setCompleteModal(true)}>✅ งานเสร็จสมบูรณ์</button>
                : <div style={{fontSize:13, color:'#b45309', background:'#fef9ee', padding:'8px 14px', borderRadius:8, border:'0.5px solid #fde68a'}}>
                    ⏳ รอผู้ดูแลส่งรายงานให้ครบ {reportedCount}/{totalSlots} ช่วงเวลา
                  </div>
            )}
            {ann?.isPaymentConfirmed === 'ชำระเงินเรียบร้อยแล้ว' && (
              <button className="ad-complete-btn" style={{background:'#f59e0b'}} onClick={() => navigate(`/review/${announceID}`)}>
                ⭐ รีวิวผู้ดูแล
              </button>
            )}
          </div>
        </div>
      </div>

      {confirmModal.show && (
        <div className="ad-modal-overlay">
          <div className="ad-modal">
            <div className="ad-modal-title">ยืนยันการอนุมัติ</div>
            <div className="ad-modal-body">
              คุณต้องการอนุมัติให้ <strong>{confirmModal.sitterName}</strong> รับผิดชอบงานดูแลสัตว์ ใช่หรือไม่?
            </div>
            <div className="ad-modal-footer">
              <button className="ad-modal-cancel" onClick={() => setConfirmModal({ show: false, applyJobID: null, sitterName: '' })}>ยกเลิก</button>
              <button className="ad-modal-confirm" onClick={handleApprove}>ยืนยัน</button>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="ad-modal-overlay">
          <div className="ad-modal">
            <div className="ad-modal-title">ยืนยันการลบประกาศ</div>
            <div className="ad-modal-body">
              คุณต้องการลบประกาศนี้ใช่หรือไม่?<br/>
              <span style={{color:'#dc2626', fontSize:13}}>การลบจะไม่สามารถเรียกคืนได้</span>
            </div>
            <div className="ad-modal-footer">
              <button className="ad-modal-cancel" onClick={() => setDeleteModal(false)} disabled={deleting}>ยกเลิก</button>
              <button className="ad-modal-delete" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'กำลังลบ...' : 'ลบประกาศ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {completeModal && (
        <div className="ad-modal-overlay">
          <div className="ad-modal">
            <div className="ad-modal-title">ยืนยันการปิดงาน</div>
            <div className="ad-modal-body">
              คุณต้องการยืนยันว่างานเสร็จสมบูรณ์แล้วใช่หรือไม่?<br/>
              <span style={{color:'#8D6E63', fontSize:13}}>สถานะจะเปลี่ยนเป็น "งานเสร็จสิ้น"</span>
            </div>
            <div className="ad-modal-footer">
              <button className="ad-modal-cancel" onClick={() => setCompleteModal(false)}>ยกเลิก</button>
              <button className="ad-modal-confirm" onClick={handleComplete}>ยืนยัน</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnnouncementDetail;
