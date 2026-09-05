import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ProfileOwner.css';
import './AnnouncementDetail.css';
import logo from '../assets/logo.png';
import NotificationBell from '../components/NotificationBell';

import { API_BASE_URL as API } from '../config';

function AnnouncementDetail() {
  const statusIcons = {
    'รับสมัคร': '📢',
    'รอพิจารณา': '⏳',
    'ได้รับผู้ดูแลแล้ว': '👤',
    'กำลังดูแล': '🐾',
    'งานเสร็จสิ้น': '✅',
    'หมดอายุ': '🚫',
  };
  const navigate = useNavigate();
  const { announceID } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [ann, setAnn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplicants, setShowApplicants] = useState(true);
  const [showReport, setShowReport] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ show: false, applyJobID: null, sitterName: '' });

  const imageUrl = user.profileImage && user.profileImage !== 'default.png'
    ? `/images/owners/${user.profileImage}` : null;

  const fetchDetail = async () => {
    try {
      const res = await fetch(`${API}/api/announcement/detail/${announceID}`);
      const data = await res.json();
      setAnn(data);

      // งานเสร็จสิ้น (ชำระเงินเรียบร้อยแล้ว) แต่เจ้าของยังไม่ได้รีวิว → เด้งเข้าหน้ารีวิวอัตโนมัติ
      if (data?.isPaymentConfirmed === 'ชำระเงินเรียบร้อยแล้ว' && user.ownerID) {
        const res2 = await fetch(`${API}/api/review/check/${announceID}/${user.ownerID}/OWNER`);
        const checkData = await res2.json();
        if (!checkData.reviewed) {
          navigate(`/review/${announceID}`);
          return;
        }
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
    const diff = new Date(end) - new Date(start);
    return Math.max(1, Math.round(diff / (1000*60*60*24)) + 1);
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
      navigate(`/payment/${announceID}`);
    } catch (err) { alert('เกิดข้อผิดพลาด'); }
  };


  const handleEdit = () => {
    navigate(`/edit-announcement/${announceID}`);
  };

  const hasApprovedSitter = ann?.applicants?.some(a => a.appStatus === 'ได้รับเลือก');
  const hasActiveApplicant = ann?.applicants?.some(a => a.appStatus === 'รอพิจารณา' || a.appStatus === 'ได้รับเลือก');
  const sitterAssigned = ['ได้รับผู้ดูแลแล้ว','กำลังดูแล','งานเสร็จสิ้น'].includes(ann?.status);
  const hideEditBtn = hasActiveApplicant || sitterAssigned;
  // คำนวณจำนวนรายงานที่ต้องส่งทั้งหมด — แยกตามวัน (วันแรกตัดช่วงเวลาที่หมดไปแล้วก่อนโพสต์ออก)
  const calcTotalSlots = () => {
    const slotDefs = [
      { key: 'careMorning', endHour: 10 },
      { key: 'careAfternoon', endHour: 15 },
      { key: 'careEvening', endHour: 20 },
      { key: 'careNight', endHour: 24 },
    ];
    const enabledSlots = slotDefs.filter(s => ann?.carePet?.[s.key]);
    if (enabledSlots.length === 0 || !ann?.startdate || !ann?.enddate) return 0;

    const numberOfDays = calcDays(ann.startdate, ann.enddate);
    let total = enabledSlots.length * numberOfDays;

    // ตัดช่วงเวลาที่หมดไปแล้วก่อนโพสต์ ออกจากวันแรก (เฉพาะกรณีโพสต์วันเดียวกับวันเริ่มดูแล)
    if (ann?.postdate) {
      const postDate = new Date(ann.postdate);
      const startDate = new Date(ann.startdate);
      const isSameDay = postDate.toDateString() === startDate.toDateString();
      if (isSameDay) {
        const postHour = postDate.getHours() + postDate.getMinutes() / 60;
        const expiredOnFirstDay = enabledSlots.filter(s => s.endHour <= postHour).length;
        total -= expiredOnFirstDay;
      }
    }
    return Math.max(0, total);
  };

  const totalSlots = calcTotalSlots();
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

  const getTimeRange = (timecare) => {
    const map = {
      'ช่วงเช้า': '06:00 - 10:00',
      'ช่วงกลางวัน': '11:00 - 15:00',
      'ช่วงเย็น': '16:00 - 20:00',
      'ช่วงดึก': '21:00 - 24:00',
    };
    return map[timecare] ? `${timecare} (${map[timecare]})` : timecare;
  };

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
          <div className="ad-card">
            <div className="ad-card-title-wrap">
              <div className="ad-card-title">รายละเอียดประกาศ</div>
              <div className="ad-postdate-center">โพสต์ {formatDate(ann?.postdate)}</div>
              <span className={`ad-status-badge ad-status-${ann?.status?.replace(/\s/g,'')} ad-status-float`}>
                {statusIcons[ann?.status] || ''} {ann?.status}
              </span>
            </div>

            <div className="ad-detail-body">

              {/* ========== ซ้าย: รูป + ที่อยู่ ========== */}
              <div className="ad-detail-left">
                <div className="ad-detail-photo">
                  {ann?.pet?.petImage && ann.pet.petImage !== 'default.png'
                    ? <img src={`/images/pets/${ann.pet.petImage}`} alt="pet" />
                    : <span style={{fontSize:60}}>🐾</span>}
                </div>

                <div className="ad-address-title">ที่อยู่</div>
                <div className="ad-address-text">
                  ที่อยู่ : {ann?.addressNo} {ann?.street && ann.street !== '-' ? `ถนน/หมู่ ${ann.street}` : ''}&nbsp;
                  ต.{ann?.subdistrict} อ.{ann?.district}&nbsp;
                  จ.{ann?.province} {ann?.zipcode}
                </div>

                {ann?.latitude && ann?.longitude ? (
                  <a href={`https://www.google.com/maps?q=${ann.latitude},${ann.longitude}`}
                    target="_blank" rel="noopener noreferrer" className="ad-address-link">
                    📍 ที่อยู่จากปักหมุด : {ann?.addressNo} {ann?.street && ann.street !== '-' ? `ถนน/หมู่ ${ann.street}` : ''}&nbsp;
                    ต.{ann?.subdistrict} อ.{ann?.district} จ.{ann?.province} {ann?.zipcode}
                  </a>
                ) : null}
              </div>

              {/* ========== ขวา: เนื้อหาไหลคอลัมน์เดียว ========== */}
              <div className="ad-detail-right">

                {/* ========== ข้อมูลสัตว์เลี้ยง ========== */}
                <div className="ad-section-title-lg first">ข้อมูลสัตว์เลี้ยง</div>

                <div className="ad-field-row">
                  <span>
                    <span className="ad-field-label">ชื่อสัตว์เลี้ยง </span>
                    <span className="ad-field-value">{ann?.pet?.petName}</span>
                  </span>
                  <span>
                    <span className="ad-field-label">สายพันธุ์ </span>
                    <span className="ad-field-value">{ann?.pet?.breed || '-'}</span>
                  </span>
                </div>

                <div className="ad-field-row">
                  <span>
                    <span className="ad-field-label">ประเภท </span>
                    <span className="ad-field-value">{ann?.pet?.petType}</span>
                  </span>
                  <span>
                    <span className="ad-field-label">เพศ </span>
                    <span className="ad-field-value">{ann?.pet?.gender}</span>
                  </span>
                </div>

                <div className="ad-field-row">
                  <span>
                    <span className="ad-field-label">วันเกิด </span>
                    <span className="ad-field-value">{formatDate(ann?.pet?.birthDate) || '-'}</span>
                  </span>
                  {ann?.pet?.birthDate && (
                    <span>
                      <span className="ad-field-label">อายุ </span>
                      <span className="ad-field-value">{calcAge(ann.pet.birthDate)}</span>
                      <span className="ad-note-sm"> (โดยประมาณ)</span>
                    </span>
                  )}
                  <span>
                    <span className="ad-field-label">น้ำหนัก </span>
                    <span className="ad-field-value">{ann?.currentweight || '-'}</span>
                  </span>
                </div>

                {/* ========== ข้อมูลสุขภาพสัตว์เลี้ยง ========== */}
                <div className="ad-section-title-lg">ข้อมูลสุขภาพสัตว์เลี้ยง</div>

                <div className="ad-cat-row2">
                  <div className="ad-cat-label2">วัคซีน</div>
                  <div className="ad-cat-content2">
                    {!ann?.pet?.vacRabiesDate && !ann?.pet?.vacDhppiDate && !ann?.pet?.vacFvrcpDate
                      ? <p className="ad-note-sm">ไม่มีข้อมูลวัคซีน</p>
                      : <>
                          {ann?.pet?.vacRabiesDate && (
                            <div className="ad-vaccine-line2">
                              <span>พิษสุนัขบ้า (Rabies)</span>
                              <span className="ad-vaccine-date2">[{formatDate(ann.pet.vacRabiesDate)}]</span>
                            </div>
                          )}
                          {ann?.pet?.vacDhppiDate && (
                            <div className="ad-vaccine-line2">
                              <span>วัคซีนรวมสุนัข (DHPPi) <span className="ad-vaccine-note2">(เฉพาะสุนัข)</span></span>
                              <span className="ad-vaccine-date2">[{formatDate(ann.pet.vacDhppiDate)}]</span>
                            </div>
                          )}
                          {ann?.pet?.vacFvrcpDate && (
                            <div className="ad-vaccine-line2">
                              <span>วัคซีนรวมแมว (FVRCP) <span className="ad-vaccine-note2">(เฉพาะแมว)</span></span>
                              <span className="ad-vaccine-date2">[{formatDate(ann.pet.vacFvrcpDate)}]</span>
                            </div>
                          )}
                        </>
                    }
                  </div>
                </div>

                <div className="ad-cat-row2">
                  <div className="ad-cat-label2">โรคประจำตัว</div>
                  <div className="ad-cat-content2">
                    {ann?.pet?.hasCongenitalDisease === 'มี'
                      ? <div className="ad-bullet2"><span className="ad-dot2">•</span>{ann.pet.congenitalDiseaseDetail}</div>
                      : <div className="ad-bullet2"><span className="ad-dot2">•</span>ไม่มีโรคประจำตัว</div>
                    }
                  </div>
                </div>

                {/* ========== ข้อมูลพฤติกรรม ========== */}
                <div className="ad-section-title-lg">ข้อมูลพฤติกรรม</div>

                {(ann?.pet?.behaviorStressAlone || ann?.pet?.behaviorFriendly || ann?.pet?.behaviorFearStranger) && (
                  <div className="ad-cat-row2">
                    <div className="ad-cat-label2">ปฏิสัมพันธ์กับคน</div>
                    <div className="ad-cat-content2">
                      {ann.pet.behaviorStressAlone && <div className="ad-bullet2"><span className="ad-dot2">•</span>เครียดเมื่อเจ้าของไม่อยู่</div>}
                      {ann.pet.behaviorFriendly && <div className="ad-bullet2"><span className="ad-dot2">•</span>เฟรนลี่ / ติดคน (ชอบคน เข้าหาคนตลอด)</div>}
                      {ann.pet.behaviorFearStranger && <div className="ad-bullet2"><span className="ad-dot2">•</span>กลัวคนแปลกหน้า (ต้องรอปรับตัวเล็กน้อย)</div>}
                    </div>
                  </div>
                )}

                {(ann?.pet?.behaviorFearLoudSound || ann?.pet?.behaviorBarkLoud) && (
                  <div className="ad-cat-row2">
                    <div className="ad-cat-label2">เสียงและการตอบสนองต่อสิ่งกระตุ้น</div>
                    <div className="ad-cat-content2">
                      {ann.pet.behaviorFearLoudSound && <div className="ad-bullet2"><span className="ad-dot2">•</span>กลัวเสียงดัง (ฟ้าร้อง / เครื่องใช้ไฟฟ้า)</div>}
                      {ann.pet.behaviorBarkLoud && <div className="ad-bullet2"><span className="ad-dot2">•</span>เห่า/ส่งเสียงดังเมื่อมีสิ่งกระตุ้น</div>}
                    </div>
                  </div>
                )}

                {(ann?.pet?.behaviorDislikeTouch || ann?.pet?.behaviorBiteScrath || ann?.pet?.behaviorEscapeExpert ||
                  ann?.pet?.behaviorHighEnergy || ann?.pet?.behaviorJumpOnPeople || ann?.pet?.behaviorHardControl) && (
                  <div className="ad-cat-row2">
                    <div className="ad-cat-label2">พฤติกรรมเสี่ยงต่อการบาดเจ็บ</div>
                    <div className="ad-cat-content2">
                      {ann.pet.behaviorDislikeTouch && <div className="ad-bullet2"><span className="ad-dot2">•</span>ไม่ชอบให้จับบางจุด (เช่น หู ท้อง ขา)</div>}
                      {ann.pet.behaviorBiteScrath && <div className="ad-bullet2"><span className="ad-dot2">•</span>กัดหรือข่วนเมื่อเครียด</div>}
                      {ann.pet.behaviorEscapeExpert && <div className="ad-bullet2"><span className="ad-dot2">•</span>หนีเก่งเมื่อเปิดประตู</div>}
                      {ann.pet.behaviorHighEnergy && <div className="ad-bullet2"><span className="ad-dot2">•</span>เล่นแรง / พลังงานสูง</div>}
                      {ann.pet.behaviorJumpOnPeople && <div className="ad-bullet2"><span className="ad-dot2">•</span>กระโดดใส่คนหรือสิ่งของ</div>}
                      {ann.pet.behaviorHardControl && <div className="ad-bullet2"><span className="ad-dot2">•</span>ควบคุมยากเมื่อเครียด</div>}
                    </div>
                  </div>
                )}

                {getBehaviors(ann?.pet).length === 0 && (
                  <p className="ad-note-sm">ไม่มีข้อมูลพฤติกรรมพิเศษ</p>
                )}

                {/* ========== รายละเอียดการดูแล ========== */}
                <div className="ad-section-title-lg">รายละเอียดการดูแล</div>

                <div className="ad-cat-row2">
                  <div className="ad-cat-label2">วันที่ดูแล</div>
                  <div className="ad-cat-content2">
                    <div className="ad-bullet2">
                      <span style={{color:'#F96320', fontWeight:600}}>{calcDays(ann?.startdate, ann?.enddate)} วัน</span>
                      <span style={{color:'#1a1a1a'}}>&nbsp;({formatDate(ann?.startdate)} - {formatDate(ann?.enddate)})</span>
                    </div>
                  </div>
                </div>

                <div className="ad-cat-row2">
                  <div className="ad-cat-label2">ช่วงเวลาการดูแล</div>
                  <div className="ad-cat-content2">
                    {ann?.carePet?.careMorning && <div className="ad-bullet2"><span className="ad-dot2">•</span>ช่วงเช้า : 06:00น. - 10:00น.</div>}
                    {ann?.carePet?.careAfternoon && <div className="ad-bullet2"><span className="ad-dot2">•</span>ช่วงกลางวัน : 11:00น. - 15:00น.</div>}
                    {ann?.carePet?.careEvening && <div className="ad-bullet2"><span className="ad-dot2">•</span>ช่วงเย็น : 16:00น. - 20:00น.</div>}
                    {ann?.carePet?.careNight && <div className="ad-bullet2"><span className="ad-dot2">•</span>ช่วงดึก : 21:00น. - 24:00น.</div>}
                  </div>
                </div>

                <div className="ad-cat-row2 ad-cat-row2-split">
                  <div className="ad-cat-pair">
                    <div className="ad-cat-label2">การให้อาหาร</div>
                    <div className="ad-cat-content2">
                      {ann?.carePet?.feedMorning && <div className="ad-bullet2"><span className="ad-dot2">•</span>ช่วงเช้า : 06:00น. - 10:00น.</div>}
                      {ann?.carePet?.feedAfternoon && <div className="ad-bullet2"><span className="ad-dot2">•</span>ช่วงกลางวัน : 11:00น. - 15:00น.</div>}
                      {ann?.carePet?.feedEvening && <div className="ad-bullet2"><span className="ad-dot2">•</span>ช่วงเย็น : 16:00น. - 20:00น.</div>}
                      {ann?.carePet?.feedNight && <div className="ad-bullet2"><span className="ad-dot2">•</span>ช่วงดึก : 21:00น. - 24:00น.</div>}
                    </div>
                  </div>
                  <div className="ad-cat-pair">
                    <div className="ad-cat-label2">ปริมาณอาหาร</div>
                    <div className="ad-cat-content2">
                      <div className="ad-bullet2"><span className="ad-dot2">•</span>{ann?.carePet?.isFoodPrepared ? 'จัดเตรียมไว้ให้แล้ว' : (ann?.carePet?.foodAmount || '-')}</div>
                    </div>
                  </div>
                </div>

                <div className="ad-cat-row2">
                  <div className="ad-cat-label2">บริการเสริม</div>
                  <div className="ad-cat-content2">
                    <div className="ad-bullet2"><span className="ad-dot2">•</span>{ann?.carePet?.medicineDetail ? `ป้อนยา: ${ann.carePet.medicineDetail}` : 'ไม่มีการป้อนยา'}</div>
                    {ann?.carePet?.isCleanService && <div className="ad-bullet2"><span className="ad-dot2">•</span>เก็บ ฉี่ อึ</div>}
                    {ann?.carePet?.isWalkService && <div className="ad-bullet2"><span className="ad-dot2">•</span>พาเดินเล่น</div>}
                  </div>
                </div>

                {ann?.totalAmount > 0 && (
                  <div className="ad-cat-row2">
                    <div className="ad-cat-label2">ค่าดูแลรวม</div>
                    <div className="ad-cat-content2">
                      <div style={{fontSize:16, fontWeight:700, color:'#16a34a'}}>
                        {ann.totalAmount?.toLocaleString()} บาท
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="ad-action-row">
            {!hideEditBtn && (
              <button className="ad-edit-btn" onClick={handleEdit}>✏️ แก้ไข</button>
            )}
          </div>

          <div className="ad-section-wrap">
            <div className="ad-section-header" onClick={() => setShowApplicants(!showApplicants)}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <span className="ad-section-title">รายชื่อผู้ส่งคำขอรับงาน</span>
                <span className="ad-count-badge">{ann?.applicantCount || 0} คน</span>
              </div>
              <span style={{fontSize:13, color:'#7FB3D9'}}>{showApplicants ? '▲ ย่อ' : '▼ เปิด'}</span>
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
                        <div className="ad-applicant-detail">🐾 รับดูแล {applicant.petAlowPet}</div>
                        <div className="ad-applicant-detail">💰 {applicant.pricePerDay} บาท/วัน</div>
                        <div className="ad-applicant-detail">📍 {applicant.subdistrict} ,{applicant.district} ,{applicant.province}</div>
                        {applicant.distance != null && (
                          <div className="ad-applicant-dist" style={{color: applicant.distance <= 5 ? '#7FB3D9' : applicant.distance <= 10 ? '#5C93BF' : '#2D5F86'}}>
                            🧭 {applicant.distance <= 5 ? 'ใกล้ที่สุด' : applicant.distance <= 10 ? 'ใกล้' : 'ไกล'} ห่างจากคุณ {applicant.distance} กม.
                          </div>
                        )}
                      </div>
                      <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6}}>
                        {applicant.appStatus === 'รอพิจารณา' && !hasApprovedSitter && (
                          <button className="ad-approve-btn" onClick={() => setConfirmModal({ show: true, applyJobID: applicant.applyJobID, sitterName: applicant.sitterName })}>
                            🤝 อนุมัติรับงาน
                          </button>
                        )}
                        {applicant.appStatus === 'ได้รับเลือก' && <span className="ad-selected-badge">✓ ได้รับเลือก</span>}
                        {applicant.appStatus === 'ไม่ได้รับเลือก' && <span className="ad-rejected-badge">❌ ไม่ได้รับเลือก</span>}
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
              <span style={{fontSize:13, color:'#7FB3D9'}}>{showReport ? '▲ ย่อ' : '▼ เปิด'}</span>
            </div>
            {showReport && (
              <div className="ad-section-body">
                {!ann?.reports || ann.reports.length === 0 ? (
                  <div className="ad-empty-text">ยังไม่มีรายงานการดูแล</div>
                ) : (
                  ann.reports.map((report, i) => (
                    <div key={i} style={{background:'#EBF4FA', border:'0.5px solid #d6e7f2', borderRadius:10, padding:12, marginBottom:10}}>
                      <div style={{fontSize:14, fontWeight:700, color:'#7FB3D9', marginBottom:10}}>
                        🕐 {getTimeRange(report.timecare)}
                      </div>
                      {report.image && (() => {
                        try {
                          const imgs = JSON.parse(report.image);
                          return imgs.length > 0 ? (
                            <div style={{marginBottom:12}}>
                              <div style={{fontSize:13, fontWeight:700, color:'#7FB3D9', marginBottom:6}}>📷 รูปภาพ ({imgs.length})</div>
                              <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                                {imgs.map((img, idx) => (
                                  <a key={idx} href={`/images/reports/${img}`} target="_blank" rel="noopener noreferrer">
                                    <img src={`/images/reports/${img}`} alt={`report-${idx}`}
                                      style={{width:150, height:150, objectFit:'cover', borderRadius:10, border:'1px solid #d6e7f2'}} />
                                  </a>
                                ))}
                              </div>
                            </div>
                          ) : null;
                        } catch { return null; }
                      })()}
                      {report.video && (
                        <div>
                          <div style={{fontSize:13, fontWeight:700, color:'#7FB3D9', marginBottom:6}}>🎬 วิดีโอ</div>
                          <video controls style={{width:'100%', maxWidth:320, borderRadius:8, border:'0.5px solid #d6e7f2'}}>
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

          <div className="btn-group ad-btn-group-split" style={{marginTop:8}}>
            <button className="btn btn-back" onClick={() => navigate('/my-announcements')}>ย้อนกลับ</button>
            <div style={{display:'flex', gap:8}}>
            {hasApprovedSitter && ann?.status !== 'งานเสร็จสิ้น' && (
              !allReported
                ? <div style={{fontSize:13, color:'#b45309', background:'#fef9ee', padding:'8px 14px', borderRadius:8, border:'0.5px solid #fde68a'}}>
                    ⏳ รอผู้ดูแลส่งรายงานให้ครบ {reportedCount}/{totalSlots} ช่วงเวลา
                  </div>
                : !ann?.workStatus
                  ? <button className="ad-complete-btn" onClick={handleComplete}>✅ งานเสร็จสมบูรณ์</button>
                  : <div style={{fontSize:13, color:'#b45309', background:'#fef9ee', padding:'8px 14px', borderRadius:8, border:'0.5px solid #fde68a'}}>
                      ⏳ รอผู้ดูแลยืนยันการรับเงิน
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
      </div>

      {confirmModal.show && (
        <div className="ad-modal-overlay">
          <div className="ad-modal ad-modal-approve">
            <div className="ad-modal-title">ยืนยันการอนุมัติ</div>
            <div className="ad-modal-body ad-modal-approve-body">
              คุณต้องการอนุมัติให้ <strong>{confirmModal.sitterName}</strong> รับผิดชอบงานดูแลสัตว์ ใช่หรือไม่?
            </div>
            <div className="ad-modal-footer">
              <button className="ad-modal-approve-cancel" onClick={() => setConfirmModal({ show: false, applyJobID: null, sitterName: '' })}>ยกเลิก</button>
              <button className="ad-modal-approve-confirm" onClick={handleApprove}>ยืนยัน</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnnouncementDetail;
