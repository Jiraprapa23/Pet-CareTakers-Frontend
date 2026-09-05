import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ProfileOwner.css';
import './PaymentPage.css';
import logo from '../assets/logo.png';
import NotificationBell from '../components/NotificationBell';

import { API_BASE_URL as API } from '../config';

function PaymentPage() {
  const navigate = useNavigate();
  const { announceID } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [ann, setAnn] = useState(null);
  const [sitter, setSitter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slipFile, setSlipFile] = useState(null);
  const [slipFileName, setSlipFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const slipRef = useRef(null);

  const imageUrl = user.profileImage && user.profileImage !== 'default.png'
    ? `/images/owners/${user.profileImage}` : null;

  const fetchData = async () => {
    try {
      const res = await fetch(`${API}/api/announcement/detail/${announceID}`);
      const data = await res.json();
      setAnn(data);
      // ดึงข้อมูลผู้ดูแลที่ได้รับเลือก
      const approved = data.applicants?.find(a => a.appStatus === 'ได้รับเลือก');
      if (approved) {
        const res2 = await fetch(`${API}/api/auth/profile-sitter/${approved.sitterID}`);
        const sitterData = await res2.json();
        setSitter(sitterData);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [announceID]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  };

  const calcDays = (start, end) => {
    if (!start || !end) return 1;
    return Math.max(1, Math.round((new Date(end) - new Date(start)) / (1000*60*60*24)) + 1);
  };

  const handleSlipChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      alert('รองรับเฉพาะไฟล์ .png .jpg .jpeg เท่านั้น');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('ขนาดไฟล์ต้องไม่เกิน 5 MB');
      return;
    }
    setSlipFile(file);
    setSlipFileName(file.name);
  };

  const handleSubmit = async () => {
    if (!slipFile) {
      alert('กรุณาอัปโหลดสลิปการชำระเงิน');
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('slipImage', slipFile);
      const res = await fetch(`${API}/api/announcement/upload-slip/${announceID}`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      alert('ชำระเงินเรียบร้อยแล้ว กรุณารอผู้ดูแลยืนยันการรับเงิน');
      navigate(`/announcement-detail/${announceID}`);
    } catch (err) { alert('เกิดข้อผิดพลาด'); }
    finally { setUploading(false); }
  };

  const handleLogout = () => { localStorage.removeItem('user'); navigate('/'); };

  const days = calcDays(ann?.startdate, ann?.enddate);
  const total = ann?.totalAmount || (sitter?.pricePerDay ? sitter.pricePerDay * days : 0);

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
            <a className="menu-item" onClick={() => navigate('/explore-sitters')}><span className="menu-icon">🔍</span><span>สำรวจผู้ดูแล</span></a>
            <a className="menu-item active" onClick={() => navigate('/my-announcements')}><span className="menu-icon">📢</span><span>รายการประกาศ</span></a>
          </div>
          <hr className="menu-divider" />
          <a className="menu-item menu-logout" onClick={handleLogout}><span className="menu-icon">🚪</span><span>ออกจากระบบ</span></a>
        </div>

        <div className="main-content">
          <div className="pay-card">
            <div className="pay-card-title">ชำระเงิน</div>

            <div className="pay-grid">
              {/* ฝั่งซ้าย: บัญชีธนาคาร */}
              <div className="pay-section">
                <div className="pay-section-title">บัญชีธนาคาร</div>
                {sitter ? (
                  <>
                    <div className="pay-info-row"><span className="pay-lbl">ธนาคาร</span><span>{sitter.bankName || '-'}</span></div>
                    <div className="pay-info-row"><span className="pay-lbl">หมายเลขบัญชี</span><span>{sitter.accountNo || '-'}</span></div>
                    <div className="pay-info-row"><span className="pay-lbl">ชื่อบัญชี</span><span>{sitter.accountName || '-'}</span></div>
                    {sitter.qrCodeImage && sitter.qrCodeImage !== 'default.png' && (
                      <div className="pay-qr-wrap">
                        <img src={`/images/qrcodes/${sitter.qrCodeImage}`} alt="QR Code" className="pay-qr-img" />
                        <div style={{fontSize:12, color:'#7FB3D9', marginTop:6, textAlign:'center'}}>{sitter.firstname} {sitter.lastname}</div>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{color:'#aaa', fontSize:13}}>ไม่พบข้อมูลธนาคาร</div>
                )}
              </div>

              {/* ฝั่งขวา: รายละเอียดและการชำระ */}
              <div className="pay-section">
                <div className="pay-section-title">รายละเอียดและการชำระ</div>
                <div className="pay-info-row">
                  <span className="pay-lbl">วันที่จ้างงาน</span>
                  <span>
                    <span style={{color:'#F96320', fontWeight:600}}>{days} วัน</span>
                    <span style={{color:'#1a1a1a'}}>&nbsp;({formatDate(ann?.startdate)} - {formatDate(ann?.enddate)})</span>
                  </span>
                </div>
                <div className="pay-total">
                  ค่าดูแลรวมทั้งหมด <span className="pay-total-amount">{total?.toLocaleString()} บาท</span>
                </div>

                <div className="pay-upload-label">อัพโหลดรูปภาพการชำระเงิน</div>

                <div className="pay-upload-box" onClick={() => slipRef.current.click()}>
                  {slipFile ? (
                    <div className="pay-upload-preview">
                      <img src={URL.createObjectURL(slipFile)} alt="slip preview" className="pay-slip-preview" />
                    </div>
                  ) : (
                    <>
                      <div className="pay-upload-icon">☁️</div>
                      <div style={{fontSize:12, color:'#aaa', marginTop:4}}>คลิกเพื่อเลือกไฟล์</div>
                    </>
                  )}
                </div>
                <input type="file" ref={slipRef} style={{display:'none'}} accept=".png,.jpg,.jpeg" onChange={handleSlipChange} />
                <div style={{fontSize:11, color:'#aaa', marginBottom:8}}>รองรับไฟล์ .png .jpg .jpeg ขนาดไม่เกิน 5 MB</div>

                {slipFileName && (
                  <div className="pay-file-name">
                    🖼️ {slipFileName}
                    <span style={{cursor:'pointer', color:'#dc2626', marginLeft:'auto'}} onClick={() => { setSlipFile(null); setSlipFileName(''); slipRef.current.value = ''; }}>✕</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="btn-group pay-btn-group-split" style={{marginTop:16}}>
            <button className="btn btn-back" onClick={() => navigate(`/announcement-detail/${announceID}`)}>ย้อนกลับ</button>
            <button className="pay-confirm-btn" onClick={handleSubmit} disabled={uploading}>
              {uploading ? 'กำลังอัพโหลด...' : '💳 ยืนยันการชำระเงิน'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;