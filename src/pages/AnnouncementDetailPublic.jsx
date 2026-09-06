import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './AnnouncementDetailPublic.css';
import logo from '../assets/logo.png';

import { API_BASE_URL as API } from '../config';

function AnnouncementDetailPublic() {
  const navigate = useNavigate();
  const { announceID } = useParams();

  const [ann, setAnn] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`${API}/api/announcement/detail-public/${announceID}`);
        const data = await res.json();
        setAnn(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
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
    if (!start || !end) return 0;
    return Math.max(1, Math.round((new Date(end) - new Date(start)) / (1000*60*60*24)) + 1);
  };

  const getPetEmoji = (typeName) => {
    if (!typeName) return '🐾';
    if (typeName.includes('สุนัข') && !typeName.includes('แมว')) return '🐶';
    if (typeName.includes('แมว') && !typeName.includes('สุนัข')) return '🐱';
    return '🐾';
  };

  if (loading) return (
    <div className="adp-wrap">
      <div className="adp-loading">กำลังโหลดข้อมูล...</div>
    </div>
  );

  const petImageUrl = ann?.pet?.petImage && ann.pet.petImage !== 'default.png'
    ? `/images/pets/${ann.pet.petImage}` : null;

  return (
    <div className="adp-wrap">
      <div className="adp-topbar">
        <div className="adp-topbar-left">
          <img src={logo} alt="logo" className="adp-logo" />
          <div className="adp-topbar-title">ระบบตามหาผู้ดูแลสัตว์เลี้ยง<br />ภายในจังหวัดเชียงใหม่</div>
        </div>
        <div className="adp-topbar-right">
          <button className="adp-btn-white" onClick={() => navigate('/login')}>เข้าสู่ระบบ</button>
          <button className="adp-btn-outline" onClick={() => navigate('/register')}>ลงทะเบียน</button>
        </div>
      </div>

      <div className="adp-content">
        <div className="adp-card">
          <div className="adp-card-title">รายละเอียดประกาศ</div>
          <div className="adp-limited-badge">🔒 กำลังดูแบบตัวอย่าง — เข้าสู่ระบบเพื่อดูข้อมูลเต็ม</div>

          <div className="adp-body-row">
            <div className="adp-left-col">
              <div className="adp-photo">
                {petImageUrl ? <img src={petImageUrl} alt={ann?.pet?.petName} /> : <span>{getPetEmoji(ann?.pet?.petType)}</span>}
              </div>
              <div className="adp-location">📍 {ann?.subdistrict}, {ann?.district}, {ann?.province}</div>
            </div>

            <div className="adp-right-col">
              <div className="adp-section-title first">ข้อมูลสัตว์เลี้ยง</div>
              <div className="adp-info-row">
                <span className="adp-lbl">ชื่อสัตว์เลี้ยง</span><span>{ann?.pet?.petName}</span>
                <span className="adp-lbl" style={{marginLeft:16}}>สายพันธุ์</span><span>{ann?.pet?.breed || '-'}</span>
              </div>
              <div className="adp-info-row">
                <span className="adp-lbl">ประเภท</span><span>{ann?.pet?.petType} {getPetEmoji(ann?.pet?.petType)}</span>
                <span className="adp-lbl" style={{marginLeft:16}}>เพศ</span><span>{ann?.pet?.gender}</span>
              </div>
              <div className="adp-info-row">
                <span className="adp-lbl">วันเกิด</span><span>{formatDate(ann?.pet?.birthDate)}</span>
                <span style={{color:'#aaa', fontSize:12}}>&nbsp;(อายุ {calcAge(ann?.pet?.birthDate)} โดยประมาณ)</span>
              </div>

              <div className="adp-section-title">รายละเอียดการดูแล</div>
              <div className="adp-info-row">
                <span className="adp-lbl">วันที่ดูแล</span>
                <span style={{color:'#F96320', fontWeight:600}}>{calcDays(ann?.startdate, ann?.enddate)} วัน</span>
                <span>({formatDate(ann?.startdate)} - {formatDate(ann?.enddate)})</span>
              </div>
              {ann?.carePet && (
                <div className="adp-info-row">
                  <span className="adp-lbl">น้ำหนักปัจจุบัน</span><span>{ann?.currentweight}</span>
                </div>
              )}
            </div>
          </div>

          <div className="adp-cta-box">
            <div className="adp-cta-text">เข้าสู่ระบบเพื่อสมัครงานนี้ พร้อมดูรายละเอียดเพิ่มเติม</div>
            <button className="adp-cta-btn" onClick={() => navigate('/login')}>เข้าสู่ระบบเพื่อสมัครงาน</button>
          </div>
        </div>

        <div className="adp-btn-group">
          <button className="adp-btn-back" onClick={() => navigate(-1)}>ย้อนกลับ</button>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementDetailPublic;
