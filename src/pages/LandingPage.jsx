import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import logo from '../assets/logo.png';

const API = 'http://localhost:8096';

function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ann');
  const [announcements, setAnnouncements] = useState([]);
  const [sitters, setSitters] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ดึงประกาศ (ใช้ GPS กรุงเทพ fallback)
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const res = await fetch(`${API}/api/sitter-job/search?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&radius=50`);
            const data = await res.json();
            setAnnouncements(Array.isArray(data) ? data.slice(0, 6) : []);
          },
          async () => {
            const res = await fetch(`${API}/api/sitter-job/search?lat=18.7883&lng=98.9853&radius=50`);
            const data = await res.json();
            setAnnouncements(Array.isArray(data) ? data.slice(0, 6) : []);
          }
        );

        // ดึงผู้ดูแล
        const res2 = await fetch(`${API}/api/sitter/search?lat=18.7883&lng=98.9853&radius=50`);
        const data2 = await res2.json();
        setSitters(Array.isArray(data2) ? data2.slice(0, 6) : []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
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

  const getStatusStyle = (status) => {
    switch (status) {
      case 'รับสมัคร': return { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
      case 'รอพิจารณา': return { bg: '#EDF4FB', color: '#1d4ed8', border: '#BFDBFE' };
      default: return { bg: '#f5f0ed', color: '#8D6E63', border: '#e0d6d0' };
    }
  };

  return (
    <div className="lp-wrap">
      {/* Topbar */}
      <div className="lp-topbar">
        <div className="lp-topbar-left">
          <img src={logo} alt="logo" className="lp-logo" />
          <div className="lp-sys-title">ระบบตามหาผู้ดูแลสัตว์เลี้ยง ภายในจังหวัดเชียงใหม่</div>
        </div>
        <div className="lp-nav-menu">
          <span className="lp-nav-tab active">หน้าแรก</span>
          <span className="lp-nav-tab" onClick={() => setActiveTab('ann')}>ประกาศหาผู้ดูแล</span>
          <span className="lp-nav-tab" onClick={() => setActiveTab('sit')}>ผู้ดูแลสัตว์เลี้ยง</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="lp-tabs">
        <div className={`lp-tab ${activeTab === 'ann' ? 'active' : ''}`} onClick={() => setActiveTab('ann')}>
          📢 ประกาศหาผู้ดูแล
        </div>
        <div className={`lp-tab ${activeTab === 'sit' ? 'active' : ''}`} onClick={() => setActiveTab('sit')}>
          👤 ผู้ดูแลสัตว์เลี้ยง
        </div>
      </div>

      {/* Content */}
      <div className="lp-content">
        {/* =================== ประกาศ =================== */}
        {activeTab === 'ann' && (
          <>
            <div className="lp-section-header">
              <span className="lp-section-title">ประกาศหาผู้ดูแลสัตว์เลี้ยง</span>
              <span className="lp-count-badge">{announcements.length} รายการ</span>
            </div>
            {loading ? (
              <div className="lp-loading">กำลังโหลดข้อมูล...</div>
            ) : announcements.length === 0 ? (
              <div className="lp-empty">😔 ไม่พบประกาศในขณะนี้</div>
            ) : (
              <div className="lp-grid">
                {announcements.map(ann => {
                  const statusStyle = getStatusStyle(ann.status);
                  return (
                    <div key={ann.announceID} className="lp-ann-card">
                      <div className="lp-ann-header">
                        <span className="lp-pet-name">{ann.petName}</span>
                        <span className="lp-status-pill" style={{background:statusStyle.bg, color:statusStyle.color, border:`0.5px solid ${statusStyle.border}`}}>
                          {ann.status}
                        </span>
                      </div>
                      <div className="lp-ann-img">
                        {ann.petImage && ann.petImage !== 'default.png'
                          ? <img src={`${API}/api/auth/images/${ann.petImage}`} alt={ann.petName} />
                          : <span>{getPetEmoji(ann.petType)}</span>}
                      </div>
                      <div className="lp-ann-body">
                        <div className="lp-info-row">
                          <span className="lp-lbl">ประเภท</span>{ann.petType} {getPetEmoji(ann.petType)}
                          <span className="lp-lbl" style={{marginLeft:6}}>สายพันธุ์</span>{ann.breed || '-'}
                        </div>
                        <div className="lp-info-row">{ann.gender === 'เพศผู้' ? '♂' : '♀'} {ann.gender}</div>
                        <div className="lp-info-row">
                          <span className="lp-lbl">วันที่ดูแล</span>
                          {formatDate(ann.startdate)} - {formatDate(ann.enddate)}
                          <span style={{color:'#8D6E63', fontWeight:600}}> {calcDays(ann.startdate, ann.enddate)} วัน</span>
                        </div>
                        {ann.careSlots && ann.careSlots.length > 0 && (
                          <div className="lp-info-row">
                            <span className="lp-lbl">ช่วงเวลา</span>{ann.careSlots.join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="lp-ann-footer">
                        <span className="lp-loc">📍 {ann.subdistrict}, {ann.district}</span>
                        <button className="lp-detail-btn" onClick={() => setShowModal(true)}>รายละเอียด</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* =================== ผู้ดูแล =================== */}
        {activeTab === 'sit' && (
          <>
            <div className="lp-section-header">
              <span className="lp-section-title">ผู้ดูแลสัตว์เลี้ยง</span>
              <span className="lp-count-badge">{sitters.length} คน</span>
            </div>
            {loading ? (
              <div className="lp-loading">กำลังโหลดข้อมูล...</div>
            ) : sitters.length === 0 ? (
              <div className="lp-empty">😔 ไม่พบผู้ดูแลในขณะนี้</div>
            ) : (
              <div className="lp-grid">
                {sitters.map(sitter => (
                  <div key={sitter.sitterID} className="lp-sitter-card">
                    <div className="lp-sitter-av">
                      {sitter.sitterImage && sitter.sitterImage !== 'default.png'
                        ? <img src={`${API}/api/auth/images/${sitter.sitterImage}`} alt={sitter.firstname} />
                        : <span>👤</span>}
                    </div>
                    <div className="lp-sitter-info">
                      <div className="lp-sitter-name">{sitter.firstname} {sitter.lastname}</div>
                      <div className="lp-sitter-det">รับดูแล {sitter.petAlowType} · {sitter.acceptedPetSize}</div>
                      <div className="lp-sitter-det">
                        <span style={{color:'#f59e0b'}}>{'★'.repeat(Math.round(sitter.avgRating || 0))}{'☆'.repeat(5 - Math.round(sitter.avgRating || 0))}</span>
                        {sitter.avgRating ? ` ${sitter.avgRating.toFixed(1)}` : ' ยังไม่มีรีวิว'}
                      </div>
                      <div className="lp-sitter-det">📍 {sitter.subdistrict}, {sitter.district}</div>
                      <div className="lp-sitter-price">{sitter.pricePerDay} บาท/วัน</div>
                      <button className="lp-detail-btn" style={{marginTop:8}} onClick={() => setShowModal(true)}>ดูโปรไฟล์</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer CTA */}
      <div className="lp-footer-cta">
        <div className="lp-footer-title">เริ่มต้นใช้งานได้เลย</div>
        <div className="lp-footer-sub">ลงทะเบียนฟรี ไม่มีค่าใช้จ่าย</div>
        <div className="lp-footer-btns">
          <button className="lp-btn-white" onClick={() => navigate('/login')}>เข้าสู่ระบบ</button>
          <button className="lp-btn-outline" onClick={() => navigate('/register')}>ลงทะเบียน</button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="lp-modal-overlay">
          <div className="lp-modal">
            <div className="lp-modal-icon">🔐</div>
            <div className="lp-modal-title">กรุณาเข้าสู่ระบบก่อน</div>
            <div className="lp-modal-body">
              คุณต้องเข้าสู่ระบบหรือลงทะเบียนก่อน<br/>เพื่อดูรายละเอียดเพิ่มเติมครับ
            </div>
            <div className="lp-modal-btns">
            <button className="lp-btn-white" onClick={() => navigate('/login')}>เข้าสู่ระบบ</button>
              <button className="lp-modal-btn-outline" onClick={() => navigate('/register')}>ลงทะเบียน</button>
            </div>
            <div className="lp-modal-cancel" onClick={() => setShowModal(false)}>ยกเลิก</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
