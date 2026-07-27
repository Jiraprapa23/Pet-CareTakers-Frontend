import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ProfileOwner.css';
import './AnnouncementDetailSitter.css';
import logo from '../assets/logo.png';

const API = 'http://localhost:8096';

function AnnouncementDetailSitter() {
  const navigate = useNavigate();
  const { announceID } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [ann, setAnn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplicants, setShowApplicants] = useState(true);
  const [applyModal, setApplyModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);

  // ส่งรายงาน
  const [selectedSlot, setSelectedSlot] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoFileName, setVideoFileName] = useState('');
  const imageRef = useRef(null);
  const videoRef = useRef(null);

  const imageUrl = user.sitterImage && user.sitterImage !== 'default.png'
    ? `${API}/api/auth/images/${user.sitterImage}` : null;

    const fetchDetail = async () => {
      try {
        const res = await fetch(`${API}/api/sitter-job/detail/${announceID}/${user.sitterID}`);
        const data = await res.json();
        console.log('myStatus:', data.myStatus);
        setAnn(data);
      if (data.careSlots && data.careSlots.length > 0) setSelectedSlot(data.careSlots[0]);
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
    return Math.max(1, Math.round((new Date(end) - new Date(start)) / (1000*60*60*24)));
  };

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

  // ส่งคำขอรับงาน
  const handleApply = async () => {
    try {
      const res = await fetch(`${API}/api/sitter-job/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sitterID: user.sitterID, announceID: parseInt(announceID) }),
      });
      let data = {};
      try { data = await res.json(); } catch { data = {}; }
      alert(data.message || (res.ok ? 'ส่งคำขอรับงานเรียบร้อยแล้ว' : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'));
      setApplyModal(false);
      fetchDetail(); // รีเฟรชข้อมูลเสมอ ไม่ว่า request จะสำเร็จหรือไม่ เผื่อ backend บันทึกไปแล้วบางส่วน
    } catch (err) { alert('เกิดข้อผิดพลาด'); }
  };

  // ยกเลิกคำขอ
  const handleCancel = async () => {
    const myApply = ann?.applicants?.find(a => a.sitterID === user.sitterID);
    if (!myApply) return;
    try {
      const res = await fetch(`${API}/api/sitter-job/cancel-apply/${myApply.applyJobID}`, { method: 'PUT' });
      let data = {};
      try { data = await res.json(); } catch { data = {}; }
      alert(data.message || (res.ok ? 'ยกเลิกคำขอเรียบร้อยแล้ว' : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'));
      setCancelModal(false);
      fetchDetail();
    } catch (err) { alert('เกิดข้อผิดพลาด'); }
  };

  // เลือกรูปหลายรูป
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
    const valid = files.filter(f => allowed.includes(f.type));
    if (valid.length !== files.length) alert('รูปต้องเป็น .png .jpg .jpeg เท่านั้น');
    setImageFiles(prev => [...prev, ...valid]);
  };

  // เลือกวิดีโอ
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['video/mp4', 'video/quicktime'];
    if (!allowed.includes(file.type)) { alert('วิดีโอต้องเป็น .mp4 หรือ .mov เท่านั้น'); return; }
    setVideoFile(file);
    setVideoFileName(file.name);
  };

  // ส่งรายงาน
  const handleSubmitReport = async () => {
    if (imageFiles.length === 0 && !videoFile) {
      alert('กรุณาอัปโหลดรูปภาพและวิดีโอการดูแล');
      return;
    }
    if (ann?.reportedSlots?.includes(selectedSlot)) {
      alert('คุณส่งรายงานช่วงเวลานี้ไปแล้ว');
      return;
    }
    try {
      const form = new FormData();
      form.append('detailID', ann.detailID);
      form.append('timecare', selectedSlot);
      imageFiles.forEach(f => form.append('images', f));
      if (videoFile) form.append('video', videoFile);

      const res = await fetch(`${API}/api/sitter-job/submit-report`, { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      alert(data.message);
      setImageFiles([]);
      setVideoFile(null);
      setVideoFileName('');
      fetchDetail();
    } catch (err) { alert('เกิดข้อผิดพลาด'); }
  };

  // ยืนยันชำระเงิน
  const handleConfirmPayment = async () => {
    try {
      const res = await fetch(`${API}/api/sitter-job/confirm-payment/${ann.detailID}`, { method: 'PUT' });
      const data = await res.json();
      alert(data.message);
      fetchDetail();
    } catch (err) { alert('เกิดข้อผิดพลาด'); }
  };

  const handleLogout = () => { localStorage.removeItem('user'); navigate('/'); };

  const myStatus = ann?.myStatus;
  const hasApplied = myStatus != null && myStatus !== 'ถอนคำขอแล้ว';
  const isSelected = myStatus === 'ได้รับเลือก';
  const isWaiting = myStatus === 'รอพิจารณา';

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
            <a className="menu-item active" onClick={() => navigate('/explore-announcements')}><span className="menu-icon">📋</span><span>สำรวจประกาศ</span></a>
            <a className="menu-item" onClick={() => navigate('/my-applications')}><span className="menu-icon">📝</span><span>คำขอที่ส่งแล้ว</span></a>
          </div>
          <hr className="menu-divider" />
          <a className="menu-item menu-logout" onClick={handleLogout}><span className="menu-icon">🚪</span><span>ออกจากระบบ</span></a>
        </div>

        <div className="main-content">

          {/* =================== Card หลัก =================== */}
          <div className="ads-card">
            <div className="ads-card-top">
              <div>
                <div className="ads-card-title">รายละเอียด</div>
                <div className="ads-postdate">📅 {formatDate(ann?.postdate)}</div>
              </div>
              {myStatus && (
                <span className={`ads-my-status ads-status-${myStatus.replace(/\s/g,'')}`}>{myStatus}</span>
              )}
              {!myStatus && (
                <span className={`ads-status-badge ads-status-${ann?.status?.replace(/\s/g,'')}`}>{ann?.status}</span>
              )}
            </div>

            {/* แถวบน: เจ้าของ + สัตว์เลี้ยง */}
            <div className="ads-top-row">
              <div className="ads-sec-box">
                <div className="ads-sec-title">เจ้าของสัตว์เลี้ยง</div>
                <div className="ads-owner-row">
                  <div className="ads-avatar">
                    {ann?.owner?.profileImage && ann.owner.profileImage !== 'default.png'
                      ? <img src={`${API}/api/auth/images/${ann.owner.profileImage}`} alt="owner" />
                      : <span>👤</span>}
                  </div>
                  <div>
                    <div style={{fontSize:14, fontWeight:700, color:'#3d2b1f'}}>{ann?.owner?.firstname} {ann?.owner?.lastname}</div>
                    <div style={{fontSize:12, color:'#8D6E63'}}>{ann?.owner?.gender} · อายุ {calcAge(ann?.owner?.birthdate)} ปี</div>
                  </div>
                </div>
                <div className="ads-info-row"><span className="ads-lbl">โทร :</span> {ann?.owner?.phoneNumber}</div>
                <div className="ads-info-row"><span className="ads-lbl">อีเมล :</span> {ann?.owner?.email}</div>
              </div>

              <div className="ads-sec-box">
                <div className="ads-sec-title">ข้อมูลสัตว์เลี้ยง</div>
                <div className="ads-pet-row">
                  <div className="ads-pet-img">
                    {ann?.pet?.petImage && ann.pet.petImage !== 'default.png'
                      ? <img src={`${API}/api/auth/images/${ann.pet.petImage}`} alt="pet" />
                      : <span style={{fontSize:28}}>🐾</span>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14, fontWeight:700, color:'#3d2b1f', marginBottom:4}}>{ann?.pet?.petName}</div>
                    <div className="ads-info-row"><span className="ads-lbl">ประเภท :</span> {ann?.pet?.petType}</div>
                    <div className="ads-info-row"><span className="ads-lbl">เพศ :</span> {ann?.pet?.gender}</div>
                    <div className="ads-info-row"><span className="ads-lbl">น้ำหนัก :</span> {ann?.currentweight}</div>
                  </div>
                </div>
                <div className="ads-pet-sub-grid">
                  <div>
                    <div className="ads-sub-title">วัคซีน</div>
                    {ann?.pet?.vacRabiesDate && <div className="ads-dot-row"><span className="ads-dot">•</span>Rabies [{formatDate(ann.pet.vacRabiesDate)}]</div>}
                    {ann?.pet?.vacDhppiDate && <div className="ads-dot-row"><span className="ads-dot">•</span>DHPPi [{formatDate(ann.pet.vacDhppiDate)}]</div>}
                    {ann?.pet?.vacFvrcpDate && <div className="ads-dot-row"><span className="ads-dot">•</span>FVRCP [{formatDate(ann.pet.vacFvrcpDate)}]</div>}
                    {!ann?.pet?.vacRabiesDate && !ann?.pet?.vacDhppiDate && !ann?.pet?.vacFvrcpDate && <div style={{fontSize:12,color:'#aaa'}}>ไม่มีข้อมูลวัคซีน</div>}
                    <div className="ads-sub-title" style={{marginTop:6}}>โรคประจำตัว</div>
                    <div className="ads-dot-row"><span className="ads-dot">•</span>{ann?.pet?.hasCongenitalDisease === 'มี' ? ann.pet.congenitalDiseaseDetail : 'ไม่มีโรคประจำตัว'}</div>
                  </div>
                  <div>
                    <div className="ads-sub-title">พฤติกรรม</div>
                    {getBehaviors(ann?.pet).length > 0
                      ? getBehaviors(ann?.pet).map((b,i) => <div key={i} className="ads-dot-row"><span className="ads-dot">•</span>{b}</div>)
                      : <div style={{fontSize:12,color:'#aaa'}}>ไม่มีข้อมูล</div>}
                  </div>
                </div>
              </div>
            </div>

            {/* แถวล่าง: การดูแล + บริการ + ที่อยู่ */}
            <div className="ads-bottom-row">
              <div className="ads-sec-box">
                <div className="ads-sec-title">รายละเอียดการดูแล</div>
                <div style={{fontSize:13, fontWeight:700, color:'#3d2b1f', marginBottom:8}}>
                  {formatDate(ann?.startdate)} - {formatDate(ann?.enddate)}
                  <span className="ads-days-badge">{calcDays(ann?.startdate, ann?.enddate)} วัน</span>
                </div>
                <div className="ads-sub-title">ช่วงเวลาดูแล</div>
                {ann?.carePet?.careMorning && <div className="ads-dot-row"><span className="ads-dot">•</span>เช้า 06:00 - 10:00น.</div>}
                {ann?.carePet?.careAfternoon && <div className="ads-dot-row"><span className="ads-dot">•</span>กลางวัน 11:00 - 15:00น.</div>}
                {ann?.carePet?.careEvening && <div className="ads-dot-row"><span className="ads-dot">•</span>เย็น 16:00 - 20:00น.</div>}
                {ann?.carePet?.careNight && <div className="ads-dot-row"><span className="ads-dot">•</span>ดึก 21:00 - 24:00น.</div>}
                <div className="ads-sub-title" style={{marginTop:8}}>การให้อาหาร</div>
                {ann?.carePet?.feedMorning && <div className="ads-dot-row"><span className="ads-dot">•</span>เช้า 06:00 - 10:00น.</div>}
                {ann?.carePet?.feedAfternoon && <div className="ads-dot-row"><span className="ads-dot">•</span>กลางวัน 11:00 - 15:00น.</div>}
                {ann?.carePet?.feedEvening && <div className="ads-dot-row"><span className="ads-dot">•</span>เย็น 16:00 - 20:00น.</div>}
                {ann?.carePet?.feedNight && <div className="ads-dot-row"><span className="ads-dot">•</span>ดึก 21:00 - 24:00น.</div>}
                <div className="ads-sub-title" style={{marginTop:8}}>ปริมาณอาหาร</div>
                <div className="ads-dot-row"><span className="ads-dot">•</span>{ann?.carePet?.isFoodPrepared ? 'จัดเตรียมไว้แล้ว' : ann?.carePet?.foodAmount || '-'}</div>
              </div>

              <div className="ads-sec-box">
                <div className="ads-sec-title">บริการเสริม</div>
                {ann?.carePet?.medicineDetail ? <div className="ads-dot-row"><span className="ads-dot">•</span>ป้อนยา: {ann.carePet.medicineDetail}</div> : <div className="ads-dot-row"><span className="ads-dot">•</span>ไม่มีการป้อนยา</div>}
                {ann?.carePet?.isCleanService && <div className="ads-dot-row"><span className="ads-dot">•</span>เก็บ อึ อี</div>}
                {ann?.carePet?.isWalkService && <div className="ads-dot-row"><span className="ads-dot">•</span>พาเดินเล่น</div>}
              </div>

              <div className="ads-sec-box">
                <div className="ads-sec-title">ที่อยู่</div>
                <div className="ads-info-row" style={{marginBottom:6}}>{ann?.addressNo} {ann?.street && ann.street !== '-' ? `ถนน ${ann.street}` : ''} ต.{ann?.subdistrict} อ.{ann?.district} จ.{ann?.province} {ann?.zipcode}</div>
                <div style={{display:'flex', gap:4, alignItems:'flex-start'}}>
                  <span style={{color:'#dc2626'}}>📍</span>
                  <span style={{fontSize:12, color:'#666'}}>{ann?.addressNo} ต.{ann?.subdistrict} อ.{ann?.district} จ.{ann?.province}</span>
                </div>
                {ann?.latitude && ann?.longitude && (
                  <a href={`https://www.google.com/maps?q=${ann.latitude},${ann.longitude}`} target="_blank" rel="noopener noreferrer" className="ads-map-btn">
                    🗺️ นำทางด้วย Google Maps
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* ปุ่มส่ง/ยกเลิกคำขอ */}
          <div className="ads-action-row">
            {!hasApplied && (ann?.status === 'รับสมัคร' || ann?.status === 'รอพิจารณา') && (
              <button className="ads-apply-btn" onClick={() => setApplyModal(true)}>✅ ส่งคำขอรับงาน</button>
            )}
            {(isWaiting || isSelected) && (
              <button className="ads-cancel-btn" onClick={() => setCancelModal(true)}>❌ ยกเลิกคำขอ</button>
            )}
          </div>

          {/* รายชื่อผู้สมัคร */}
          <div className="ads-section-wrap">
            <div className="ads-section-header" onClick={() => setShowApplicants(!showApplicants)}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <span className="ads-section-title">รายชื่อผู้ส่งคำขอรับงาน</span>
                <span className="ads-count-badge">{ann?.applicantCount || 0} คน</span>
              </div>
              <span style={{fontSize:12, color:'#8D6E63'}}>{showApplicants ? '▲ ปิด' : '▼ เปิด'}</span>
            </div>
            {showApplicants && (
              <div className="ads-section-body">
                {!ann?.applicants || ann.applicants.length === 0 ? (
                  <div className="ads-empty-text">ยังไม่มีผู้สมัคร</div>
                ) : (
                  ann.applicants.map(applicant => (
                    <div key={applicant.applyJobID} className="ads-applicant-card">
                      <div className="ads-applicant-img">
                        {applicant.sitterImage && applicant.sitterImage !== 'default.png'
                          ? <img src={`${API}/api/auth/images/${applicant.sitterImage}`} alt="sitter" />
                          : <span>👤</span>}
                      </div>
                      <div className="ads-applicant-info">
                        <div className="ads-applicant-name">
                          {applicant.sitterName}
                          {applicant.sitterID === user.sitterID && <span className="ads-you-badge"> (คุณ)</span>}
                        </div>
                        <div className="ads-applicant-detail">💰 {applicant.pricePerDay} บาท/วัน · ต.{applicant.subdistrict}</div>
                        {applicant.distance && <div className="ads-applicant-dist">📍 ห่างจากประกาศ {applicant.distance} กม.</div>}
                      </div>
                      <span className={`ads-app-status ads-app-${applicant.appStatus?.replace(/\s/g,'')}`}>{applicant.appStatus}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* =================== ส่งรายงานการดูแล (เฉพาะ ได้รับเลือก) =================== */}
          {isSelected && (
            <div className="ads-report-box">
              <div className="ads-report-header">
                <span className="ads-report-tag">ส่งรายงานการดูแล</span>
                <select className="ads-report-select" value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)}>
                  {ann?.careSlots?.map(slot => (
                    <option key={slot} value={slot} disabled={ann?.reportedSlots?.includes(slot)}>
                      {slot} {ann?.reportedSlots?.includes(slot) ? '✓ ส่งแล้ว' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {ann?.reportedSlots?.includes(selectedSlot) ? (
                <div className="ads-reported-notice">✅ ส่งรายงานช่วงเวลานี้เรียบร้อยแล้ว</div>
              ) : (
                <>
                  <div className="ads-upload-grid">
                    {/* รูปภาพ */}
                    <div className="ads-upload-box" onClick={() => imageRef.current.click()}>
                      <div className="ads-upload-icon">📷</div>
                      <div className="ads-upload-label">อัพโหลดรูปภาพ</div>
                      <div style={{fontSize:11, color:'#aaa'}}>.png .jpg .jpeg (หลายรูปได้)</div>
                      <button className="ads-upload-btn" onClick={e => { e.stopPropagation(); imageRef.current.click(); }}>เลือกไฟล์</button>
                      <input type="file" ref={imageRef} style={{display:'none'}} accept=".png,.jpg,.jpeg" multiple onChange={handleImageChange} />
                      {imageFiles.map((f, i) => (
                        <div key={i} className="ads-file-name">
                          🖼️ {f.name}
                          <span style={{cursor:'pointer', color:'#dc2626', marginLeft:'auto'}} onClick={e => { e.stopPropagation(); setImageFiles(prev => prev.filter((_,idx) => idx !== i)); }}>✕</span>
                        </div>
                      ))}
                    </div>

                    {/* วิดีโอ */}
                    <div className="ads-upload-box" onClick={() => videoRef.current.click()}>
                      <div className="ads-upload-icon">🎥</div>
                      <div className="ads-upload-label">อัพโหลดวิดีโอ</div>
                      <div style={{fontSize:11, color:'#aaa'}}>.mp4 .mov (1 ไฟล์)</div>
                      <button className="ads-upload-btn" onClick={e => { e.stopPropagation(); videoRef.current.click(); }}>เลือกไฟล์</button>
                      <input type="file" ref={videoRef} style={{display:'none'}} accept=".mp4,.mov" onChange={handleVideoChange} />
                      {videoFileName && (
                        <div className="ads-file-name">
                          🎬 {videoFileName}
                          <span style={{cursor:'pointer', color:'#dc2626', marginLeft:'auto'}} onClick={e => { e.stopPropagation(); setVideoFile(null); setVideoFileName(''); videoRef.current.value = ''; }}>✕</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{display:'flex', justifyContent:'flex-end'}}>
                    <button className="ads-send-report-btn" onClick={handleSubmitReport}>ส่งรายงาน</button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* =================== สถานะการชำระเงิน (เฉพาะ ได้รับเลือก) =================== */}
          {isSelected && (
            <div className="ads-payment-box">
              <div className="ads-payment-header">
                <span className="ads-payment-tag">สถานะการชำระเงิน</span>
              </div>
              <div className="ads-payment-status">
                {ann?.isPaymentConfirmed === 'ชำระเงินเรียบร้อยแล้ว'
                  ? <span style={{color:'#16a34a', fontWeight:700}}>✅ ชำระเงินเรียบร้อยแล้ว</span>
                  : <span style={{color:'#b45309'}}>🟡 {ann?.workStatus || 'รอดำเนินการ'}</span>}
              </div>
              {ann?.totalAmount > 0 && (
                <div className="ads-payment-amount">ยอด: {ann.totalAmount?.toLocaleString()} บาท</div>
              )}
              {ann?.slipImage && (
                <div style={{marginBottom:8}}>
                  <a href={`${API}/api/auth/images/${ann.slipImage}`} target="_blank" rel="noopener noreferrer" className="ads-slip-btn">
                    🖼️ ดูหลักฐานการโอน
                  </a>
                </div>
              )}
              {ann?.isPaymentConfirmed !== 'ชำระเงินเรียบร้อยแล้ว' && ann?.slipImage && (
                <div style={{display:'flex', justifyContent:'flex-end'}}>
                  <button className="ads-confirm-pay-btn" onClick={handleConfirmPayment}>ยืนยันการชำระเงิน</button>
                </div>
              )}
            </div>
          )}

          <div className="btn-group" style={{marginTop:8}}>
            <button className="btn btn-back" onClick={() => navigate('/explore-announcements')}>ย้อนกลับ</button>
          </div>
        </div>
      </div>

      {/* Modal ส่งคำขอ */}
      {applyModal && (
        <div className="ads-modal-overlay">
          <div className="ads-modal">
            <div className="ads-modal-title">ยืนยันการส่งคำขอรับงาน?</div>
            <div className="ads-modal-body">
              "คุณต้องการส่งคำขอรับงานนี้ใช่หรือไม่?<br/>
              เมื่อส่งแล้ว คุณจะไม่สามารถแก้ไขรายละเอียดคำขอได้ จนกว่าจะมีการเปลี่ยนสถานะ"
            </div>
            <div className="ads-modal-footer">
              <button className="ads-modal-cancel" onClick={() => setApplyModal(false)}>ยกเลิก</button>
              <button className="ads-modal-confirm green" onClick={handleApply}>ยืนยัน</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ยกเลิกคำขอ */}
      {cancelModal && (
        <div className="ads-modal-overlay">
          <div className="ads-modal">
            <div className="ads-modal-title">ยืนยันการยกเลิกคำขอรับงาน?</div>
            <div className="ads-modal-body">
              "คุณต้องการยกเลิกคำขอรับงานนี้ใช่หรือไม่?<br/>
              หากยืนยัน เจ้าของสัตว์เลี้ยงจะไม่สามารถเลือกคุณสำหรับงานนี้ได้"
            </div>
            <div className="ads-modal-footer">
              <button className="ads-modal-cancel" onClick={() => setCancelModal(false)}>ยกเลิก</button>
              <button className="ads-modal-confirm red" onClick={handleCancel}>ยืนยัน</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnnouncementDetailSitter;
