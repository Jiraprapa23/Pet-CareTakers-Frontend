import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ProfileOwner.css';
import './AnnouncementDetailSitter.css';
import logo from '../assets/logo.png';

import { API_BASE_URL as API } from '../config';

function AnnouncementDetailSitter() {
  const statusIcons = {
    'รับสมัคร': '📢',
    'รอพิจารณา': '⏳',
    'ได้รับผู้ดูแลแล้ว': '👤',
    'กำลังดูแล': '🐾',
    'งานเสร็จสิ้น': '✅',
    'หมดอายุ': '🚫',
  };
  const appStatusIcons = {
    'รอพิจารณา': '⏳',
    'ได้รับเลือก': '👤',
    'กำลังดูแล': '🐾',
    'ไม่ได้รับเลือก': '❌',
    'ถอนคำขอแล้ว': '↩️',
    'งานเสร็จสิ้น': '✅',
  };
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
    ? `/images/sitters/${user.sitterImage}` : null;

    const fetchDetail = async () => {
      try {
        const res = await fetch(`${API}/api/sitter-job/detail/${announceID}/${user.sitterID}`);
        const data = await res.json();
        console.log('myStatus:', data.myStatus);
        setAnn(data);
        if (data.careSlots && data.careSlots.length > 0) {
          const nextUnreported = data.careSlots.find(s => !data.reportedSlotsToday?.includes(s));
          setSelectedSlot(nextUnreported || data.careSlots[0]);
        }
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
    return Math.max(1, Math.round((new Date(end) - new Date(start)) / (1000*60*60*24)) + 1);
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
    if (ann?.reportedSlotsToday?.includes(selectedSlot)) {
      alert('คุณส่งรายงานช่วงเวลานี้ของวันนี้ไปแล้ว');
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
      <div style={{padding:60, textAlign:'center', color:'#7FB3D9'}}>กำลังโหลดข้อมูล...</div>
    </div>
  );

  return (
    <div className="app-layout">
      <div className="topbar">
        <div className="topbar-left">
          <img src={logo} alt="logo" className="topbar-logo" />
          <div className="topbar-title">ระบบตามหาผู้ดูแลสัตว์เลี้ยง<br />ภายในจังหวัดเชียงใหม่</div>
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
            <a className="menu-item" onClick={() => navigate('/my-applications')}><span className="menu-icon">📝</span><span>คำขอที่ส่งแล้ว</span></a>
          </div>
          <hr className="menu-divider" />
          <a className="menu-item menu-logout" onClick={handleLogout}><span className="menu-icon">🚪</span><span>ออกจากระบบ</span></a>
        </div>

        <div className="main-content">

          {/* =================== Card หลัก =================== */}
          <div className="ads-card">
            <div className="ads-card-title-wrap">
              <div className="ads-card-title">รายละเอียดประกาศ</div>
              <div className="ads-postdate-center">โพสต์ {formatDate(ann?.postdate)}</div>
              {myStatus && (
                <span className={`ads-my-status ads-status-${myStatus.replace(/\s/g,'')} ads-status-float`}>{appStatusIcons[myStatus] || ''} {myStatus}</span>
              )}
              {!myStatus && (
                <span className={`ads-status-badge ads-status-${ann?.status?.replace(/\s/g,'')} ads-status-float`}>{statusIcons[ann?.status] || ''} {ann?.status}</span>
              )}
            </div>

            {/* ========== เจ้าของสัตว์เลี้ยง ========== */}
            <div className="ads-owner-block">
              <div className="ads-owner-avatar">
                {ann?.owner?.profileImage && ann.owner.profileImage !== 'default.png'
                  ? <img src={`/images/owners/${ann.owner.profileImage}`} alt="owner" />
                  : <span style={{fontSize:48}}>👤</span>}
              </div>
              <div className="ads-owner-info">
                <div className="ads-section-title-lg first">เจ้าของสัตว์เลี้ยง</div>
                <div className="ads-field-row">
                  <span>
                    <span className="ads-field-label">ชื่อ-นามสกุล : </span>
                    <span className="ads-field-value">{ann?.owner?.firstname} {ann?.owner?.lastname}</span>
                  </span>
                </div>
                <div className="ads-field-row">
                  <span>
                    <span className="ads-field-label">หมายเลขโทรศัพท์ : </span>
                    <span className="ads-field-value">{ann?.owner?.phoneNumber}</span>
                  </span>
                </div>
                <div className="ads-field-row">
                  <span>
                    <span className="ads-field-label">อีเมล : </span>
                    <span className="ads-field-value">{ann?.owner?.email}</span>
                  </span>
                </div>
                <div className="ads-field-row">
                  <span className="ads-address-text" style={{margin:0}}>
                    <span className="ads-field-label">ที่อยู่ : </span>
                    บ้านเลขที่ {ann?.addressNo} ถนน/เขต {ann?.street && ann.street !== '-' ? ann.street : '-'}&nbsp;
                    ตำบล {ann?.subdistrict} อำเภอ {ann?.district}&nbsp;
                    จังหวัด {ann?.province} รหัสไปรษณีย์ {ann?.zipcode}
                  </span>
                </div>
                {ann?.latitude && ann?.longitude && (
                  <div className="ads-field-row">
                    <a href={`https://www.google.com/maps?q=${ann.latitude},${ann.longitude}`}
                      target="_blank" rel="noopener noreferrer" className="ads-address-link" style={{margin:0}}>
                      📍 ที่อยู่จากปักหมุด : บ้านเลขที่ {ann?.addressNo} ถนน/เขต {ann?.street && ann.street !== '-' ? ann.street : '-'}&nbsp;
                      ตำบล {ann?.subdistrict} อำเภอ {ann?.district}&nbsp;
                      จังหวัด {ann?.province} รหัสไปรษณีย์ {ann?.zipcode} (กดเพื่อนำทาง)
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="ads-detail-body">

              {/* ========== ซ้าย: รูปสัตว์เลี้ยง + ที่อยู่ ========== */}
              <div className="ads-detail-left">
                <div className="ads-detail-photo">
                  {ann?.pet?.petImage && ann.pet.petImage !== 'default.png'
                    ? <img src={`/images/pets/${ann.pet.petImage}`} alt="pet" />
                    : <span style={{fontSize:60}}>🐾</span>}
                </div>

                <div className="ads-address-title">ที่อยู่</div>
                <div className="ads-address-text">
                  ที่อยู่ : {ann?.addressNo} {ann?.street && ann.street !== '-' ? `ถนน/หมู่ ${ann.street}` : ''}&nbsp;
                  ต.{ann?.subdistrict} อ.{ann?.district}&nbsp;
                  จ.{ann?.province} {ann?.zipcode}
                </div>
                {ann?.latitude && ann?.longitude && (
                  <a href={`https://www.google.com/maps?q=${ann.latitude},${ann.longitude}`}
                    target="_blank" rel="noopener noreferrer" className="ads-address-link">
                    📍 ที่อยู่จากปักหมุด (กดเพื่อนำทาง)
                  </a>
                )}
              </div>

              {/* ========== ขวา: เนื้อหาไหลคอลัมน์เดียว ========== */}
              <div className="ads-detail-right">

                {/* ========== ข้อมูลสัตว์เลี้ยง ========== */}
                <div className="ads-section-title-lg first">ข้อมูลสัตว์เลี้ยง</div>

                <div className="ads-field-row">
                  <span>
                    <span className="ads-field-label">ชื่อสัตว์เลี้ยง </span>
                    <span className="ads-field-value">{ann?.pet?.petName}</span>
                  </span>
                  <span>
                    <span className="ads-field-label">สายพันธุ์ </span>
                    <span className="ads-field-value">{ann?.pet?.breed || '-'}</span>
                  </span>
                </div>

                <div className="ads-field-row">
                  <span>
                    <span className="ads-field-label">ประเภท </span>
                    <span className="ads-field-value">{ann?.pet?.petType}</span>
                  </span>
                  <span>
                    <span className="ads-field-label">เพศ </span>
                    <span className="ads-field-value">{ann?.pet?.gender}</span>
                  </span>
                </div>

                <div className="ads-field-row">
                  <span>
                    <span className="ads-field-label">วันเกิด </span>
                    <span className="ads-field-value">{formatDate(ann?.pet?.birthDate) || '-'}</span>
                  </span>
                  {ann?.pet?.birthDate && (
                    <span>
                      <span className="ads-field-label">อายุ </span>
                      <span className="ads-field-value">{calcAge(ann.pet.birthDate)}</span>
                      <span className="ads-note-sm"> (โดยประมาณ)</span>
                    </span>
                  )}
                  <span>
                    <span className="ads-field-label">น้ำหนัก </span>
                    <span className="ads-field-value">{ann?.currentweight || '-'}</span>
                  </span>
                </div>

                {/* ========== ข้อมูลสุขภาพสัตว์เลี้ยง ========== */}
                <div className="ads-section-title-lg">ข้อมูลสุขภาพสัตว์เลี้ยง</div>

                <div className="ads-cat-row2">
                  <div className="ads-cat-label2">วัคซีน</div>
                  <div className="ads-cat-content2">
                    {!ann?.pet?.vacRabiesDate && !ann?.pet?.vacDhppiDate && !ann?.pet?.vacFvrcpDate
                      ? <p className="ads-note-sm">ไม่มีข้อมูลวัคซีน</p>
                      : <>
                          {ann?.pet?.vacRabiesDate && (
                            <div className="ads-vaccine-line2">
                              <span>พิษสุนัขบ้า (Rabies)</span>
                              <span className="ads-vaccine-date2">[{formatDate(ann.pet.vacRabiesDate)}]</span>
                            </div>
                          )}
                          {ann?.pet?.vacDhppiDate && (
                            <div className="ads-vaccine-line2">
                              <span>วัคซีนรวมสุนัข (DHPPi) <span className="ads-vaccine-note2">(เฉพาะสุนัข)</span></span>
                              <span className="ads-vaccine-date2">[{formatDate(ann.pet.vacDhppiDate)}]</span>
                            </div>
                          )}
                          {ann?.pet?.vacFvrcpDate && (
                            <div className="ads-vaccine-line2">
                              <span>วัคซีนรวมแมว (FVRCP) <span className="ads-vaccine-note2">(เฉพาะแมว)</span></span>
                              <span className="ads-vaccine-date2">[{formatDate(ann.pet.vacFvrcpDate)}]</span>
                            </div>
                          )}
                        </>
                    }
                  </div>
                </div>

                <div className="ads-cat-row2">
                  <div className="ads-cat-label2">โรคประจำตัว</div>
                  <div className="ads-cat-content2">
                    {ann?.pet?.hasCongenitalDisease === 'มี'
                      ? <div className="ads-bullet2"><span className="ads-dot2">•</span>{ann.pet.congenitalDiseaseDetail}</div>
                      : <div className="ads-bullet2"><span className="ads-dot2">•</span>ไม่มีโรคประจำตัว</div>
                    }
                  </div>
                </div>

                {/* ========== ข้อมูลพฤติกรรม ========== */}
                <div className="ads-section-title-lg">ข้อมูลพฤติกรรม</div>

                {(ann?.pet?.behaviorStressAlone || ann?.pet?.behaviorFriendly || ann?.pet?.behaviorFearStranger) && (
                  <div className="ads-cat-row2">
                    <div className="ads-cat-label2">ปฏิสัมพันธ์กับคน</div>
                    <div className="ads-cat-content2">
                      {ann.pet.behaviorStressAlone && <div className="ads-bullet2"><span className="ads-dot2">•</span>เครียดเมื่อเจ้าของไม่อยู่</div>}
                      {ann.pet.behaviorFriendly && <div className="ads-bullet2"><span className="ads-dot2">•</span>เฟรนลี่ / ติดคน (ชอบคน เข้าหาคนตลอด)</div>}
                      {ann.pet.behaviorFearStranger && <div className="ads-bullet2"><span className="ads-dot2">•</span>กลัวคนแปลกหน้า (ต้องรอปรับตัวเล็กน้อย)</div>}
                    </div>
                  </div>
                )}

                {(ann?.pet?.behaviorFearLoudSound || ann?.pet?.behaviorBarkLoud) && (
                  <div className="ads-cat-row2">
                    <div className="ads-cat-label2">เสียงและการตอบสนองต่อสิ่งกระตุ้น</div>
                    <div className="ads-cat-content2">
                      {ann.pet.behaviorFearLoudSound && <div className="ads-bullet2"><span className="ads-dot2">•</span>กลัวเสียงดัง (ฟ้าร้อง / เครื่องใช้ไฟฟ้า)</div>}
                      {ann.pet.behaviorBarkLoud && <div className="ads-bullet2"><span className="ads-dot2">•</span>เห่า/ส่งเสียงดังเมื่อมีสิ่งกระตุ้น</div>}
                    </div>
                  </div>
                )}

                {(ann?.pet?.behaviorDislikeTouch || ann?.pet?.behaviorBiteScrath || ann?.pet?.behaviorEscapeExpert ||
                  ann?.pet?.behaviorHighEnergy || ann?.pet?.behaviorJumpOnPeople || ann?.pet?.behaviorHardControl) && (
                  <div className="ads-cat-row2">
                    <div className="ads-cat-label2">พฤติกรรมเสี่ยงต่อการบาดเจ็บ</div>
                    <div className="ads-cat-content2">
                      {ann.pet.behaviorDislikeTouch && <div className="ads-bullet2"><span className="ads-dot2">•</span>ไม่ชอบให้จับบางจุด (เช่น หู ท้อง ขา)</div>}
                      {ann.pet.behaviorBiteScrath && <div className="ads-bullet2"><span className="ads-dot2">•</span>กัดหรือข่วนเมื่อเครียด</div>}
                      {ann.pet.behaviorEscapeExpert && <div className="ads-bullet2"><span className="ads-dot2">•</span>หนีเก่งเมื่อเปิดประตู</div>}
                      {ann.pet.behaviorHighEnergy && <div className="ads-bullet2"><span className="ads-dot2">•</span>เล่นแรง / พลังงานสูง</div>}
                      {ann.pet.behaviorJumpOnPeople && <div className="ads-bullet2"><span className="ads-dot2">•</span>กระโดดใส่คนหรือสิ่งของ</div>}
                      {ann.pet.behaviorHardControl && <div className="ads-bullet2"><span className="ads-dot2">•</span>ควบคุมยากเมื่อเครียด</div>}
                    </div>
                  </div>
                )}

                {getBehaviors(ann?.pet).length === 0 && (
                  <p className="ads-note-sm">ไม่มีข้อมูลพฤติกรรมพิเศษ</p>
                )}

                {/* ========== รายละเอียดการดูแล ========== */}
                <div className="ads-section-title-lg">รายละเอียดการดูแล</div>

                <div className="ads-cat-row2">
                  <div className="ads-cat-label2">วันที่ดูแล</div>
                  <div className="ads-cat-content2">
                    <div className="ads-bullet2">
                      <span style={{color:'#F96320', fontWeight:600}}>{calcDays(ann?.startdate, ann?.enddate)} วัน</span>
                      <span style={{color:'#1a1a1a'}}>&nbsp;({formatDate(ann?.startdate)} - {formatDate(ann?.enddate)})</span>
                    </div>
                  </div>
                </div>

                <div className="ads-cat-row2">
                  <div className="ads-cat-label2">ช่วงเวลาการดูแล</div>
                  <div className="ads-cat-content2">
                    {ann?.carePet?.careMorning && <div className="ads-bullet2"><span className="ads-dot2">•</span>ช่วงเช้า : 06:00น. - 10:00น.</div>}
                    {ann?.carePet?.careAfternoon && <div className="ads-bullet2"><span className="ads-dot2">•</span>ช่วงกลางวัน : 11:00น. - 15:00น.</div>}
                    {ann?.carePet?.careEvening && <div className="ads-bullet2"><span className="ads-dot2">•</span>ช่วงเย็น : 16:00น. - 20:00น.</div>}
                    {ann?.carePet?.careNight && <div className="ads-bullet2"><span className="ads-dot2">•</span>ช่วงดึก : 21:00น. - 24:00น.</div>}
                  </div>
                </div>

                <div className="ads-cat-row2 ads-cat-row2-split">
                  <div className="ads-cat-pair">
                    <div className="ads-cat-label2">การให้อาหาร</div>
                    <div className="ads-cat-content2">
                      {ann?.carePet?.feedMorning && <div className="ads-bullet2"><span className="ads-dot2">•</span>ช่วงเช้า : 06:00น. - 10:00น.</div>}
                      {ann?.carePet?.feedAfternoon && <div className="ads-bullet2"><span className="ads-dot2">•</span>ช่วงกลางวัน : 11:00น. - 15:00น.</div>}
                      {ann?.carePet?.feedEvening && <div className="ads-bullet2"><span className="ads-dot2">•</span>ช่วงเย็น : 16:00น. - 20:00น.</div>}
                      {ann?.carePet?.feedNight && <div className="ads-bullet2"><span className="ads-dot2">•</span>ช่วงดึก : 21:00น. - 24:00น.</div>}
                    </div>
                  </div>
                  <div className="ads-cat-pair">
                    <div className="ads-cat-label2">ปริมาณอาหาร</div>
                    <div className="ads-cat-content2">
                      <div className="ads-bullet2"><span className="ads-dot2">•</span>{ann?.carePet?.isFoodPrepared ? 'จัดเตรียมไว้ให้แล้ว' : (ann?.carePet?.foodAmount || '-')}</div>
                    </div>
                  </div>
                </div>

                <div className="ads-cat-row2">
                  <div className="ads-cat-label2">บริการเสริม</div>
                  <div className="ads-cat-content2">
                    <div className="ads-bullet2"><span className="ads-dot2">•</span>{ann?.carePet?.medicineDetail ? `ป้อนยา: ${ann.carePet.medicineDetail}` : 'ไม่มีการป้อนยา'}</div>
                    {ann?.carePet?.isCleanService && <div className="ads-bullet2"><span className="ads-dot2">•</span>เก็บ ฉี่ อึ</div>}
                    {ann?.carePet?.isWalkService && <div className="ads-bullet2"><span className="ads-dot2">•</span>พาเดินเล่น</div>}
                  </div>
                </div>

                {ann?.totalAmount > 0 && (
                  <div className="ads-cat-row2">
                    <div className="ads-cat-label2">ค่าดูแลรวม</div>
                    <div className="ads-cat-content2">
                      <div style={{fontSize:16, fontWeight:700, color:'#16a34a'}}>
                        {ann.totalAmount?.toLocaleString()} บาท
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ปุ่มส่ง/ยกเลิกคำขอ */}
          <div className="ads-action-row">
            {!hasApplied && (ann?.status === 'รับสมัคร' || ann?.status === 'รอพิจารณา') && (
              <button className="ads-apply-btn" onClick={() => setApplyModal(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle', marginRight:6, marginBottom:2}}>
                  <path d="M22 2L11 13"></path>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
                </svg>
                ส่งคำขอรับงาน
              </button>
            )}
            {isWaiting && (
              <button className="ads-cancel-btn" onClick={() => setCancelModal(true)}>❌ ยกเลิกคำขอ</button>
            )}
          </div>

          {/* รายชื่อผู้สมัคร — ซ่อนเมื่อได้รับเลือกให้ดูแลงานแล้ว เพราะไม่เกี่ยวข้องอีกต่อไป */}
          {!isSelected && (
          <div className="ads-section-wrap">
            <div className="ads-section-header" onClick={() => setShowApplicants(!showApplicants)}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <span className="ads-section-title">รายชื่อผู้ส่งคำขอรับงาน</span>
                <span className="ads-count-badge">{ann?.applicantCount || 0} คน</span>
              </div>
              <span style={{fontSize:12, color:'#7FB3D9'}}>{showApplicants ? '▲ ปิด' : '▼ เปิด'}</span>
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
                          ? <img src={`/images/sitters/${applicant.sitterImage}`} alt="sitter" />
                          : <span>👤</span>}
                      </div>
                      <div className="ads-applicant-info">
                        <div className="ads-applicant-name">
                          {applicant.sitterName}
                          {applicant.sitterID === user.sitterID && <span className="ads-you-badge"> (คุณ)</span>}
                        </div>
                        <div className="ads-applicant-detail">🐾 รับดูแล {applicant.petAlowPet}</div>
                        <div className="ads-applicant-detail">💰 {applicant.pricePerDay} บาท/วัน</div>
                        <div className="ads-applicant-detail">📍 ต.{applicant.subdistrict} อ.{applicant.district} จ.{applicant.province}</div>
                        {applicant.distance != null && (
                          <div className="ads-applicant-dist" style={{color: applicant.distance <= 5 ? '#7FB3D9' : applicant.distance <= 10 ? '#5C93BF' : '#2D5F86'}}>
                            🧭 {applicant.distance <= 5 ? 'ใกล้ที่สุด' : applicant.distance <= 10 ? 'ใกล้' : 'ไกล'} ห่างจากคุณ {applicant.distance} กม.
                          </div>
                        )}
                      </div>
                      <div className="ads-applicant-actions">
                        <span className={`ads-app-status ads-app-${applicant.appStatus?.replace(/\s/g,'')}`}>
                          {appStatusIcons[applicant.appStatus] || ''} {applicant.appStatus}
                        </span>
                        <button className="ads-applicant-detail-btn" onClick={() => navigate(`/sitter-profile/${applicant.sitterID}`)}>รายละเอียด</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          )}

          {/* =================== ส่งรายงานการดูแล (เฉพาะ ได้รับเลือก) =================== */}
          {isSelected && (
            <div className="ads-report-box">
              <div className="ads-report-header">
                <span className="ads-report-tag">ส่งรายงานการดูแล</span>
                <select className="ads-report-select" value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)}>
                  {ann?.careSlots?.map(slot => (
                    <option key={slot} value={slot} disabled={ann?.reportedSlotsToday?.includes(slot)}>
                      {slot} {ann?.reportedSlotsToday?.includes(slot) ? '✓ ส่งแล้ว' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{fontSize:12, color:'#7FB3D9', marginBottom:12}}>
                📅 สำหรับวันที่ {formatDate(new Date().toISOString())} (วันนี้)
              </div>

              {ann?.reportedSlotsToday?.includes(selectedSlot) ? (
                <div className="ads-reported-notice">✅ ส่งรายงานช่วงเวลานี้ของวันนี้เรียบร้อยแล้ว</div>
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
                  <a href={`/images/slips/${ann.slipImage}`} target="_blank" rel="noopener noreferrer" className="ads-slip-btn">
                    🖼️ ดูหลักฐานการโอน
                  </a>
                </div>
              )}
              {ann?.isPaymentConfirmed !== 'ชำระเงินเรียบร้อยแล้ว' && ann?.slipImage && (
                <div style={{display:'flex', justifyContent:'flex-end'}}>
                  <button className="ads-confirm-pay-btn" onClick={handleConfirmPayment}>💰 ยอมรับการชำระเงิน</button>
                </div>
              )}
            </div>
          )}

          <div className="btn-group" style={{marginTop:8}}>
            <button className="btn btn-back" onClick={() => navigate('/explore-announcements')}>ย้อนกลับ</button>
            {ann?.isPaymentConfirmed === 'ชำระเงินเรียบร้อยแล้ว' && (
              <button className="ads-confirm-pay-btn" style={{background:'#f59e0b'}} onClick={() => navigate(`/review-sitter/${announceID}`)}>
                ⭐ รีวิวเจ้าของสัตว์เลี้ยง
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal ส่งคำขอ */}
      {applyModal && (
        <div className="ads-modal-overlay">
          <div className="ads-modal">
            <div className="ads-modal-title">ยืนยันการส่งคำขอรับงาน?</div>
            <div className="ads-modal-body">
              คุณต้องการส่งคำขอรับงานนี้ใช่หรือไม่?<br/>
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
              คุณต้องการยกเลิกคำขอรับงานนี้ใช่หรือไม่?<br/>
              หากยืนยัน เจ้าของสัตว์เลี้ยงจะไม่สามารถเลือกคุณสำหรับงานนี้ได้
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
