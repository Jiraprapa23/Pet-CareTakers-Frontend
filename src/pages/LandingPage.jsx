import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import './LandingPage.css';
import logo from '../assets/logo.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

import { API_BASE_URL as API } from '../config';

const amphoeData = {
  'เมืองเชียงใหม่':['ช้างม่อย','ช้างคลาน','วัดเกต','ช้างเผือก','สุเทพ','แม่เหียะ','ป่าแดด','หนองหอย','ท่าศาลา','หนองป่าครั่ง','ฟ้าฮ่าม','ป่าตัน','สันผีเสื้อ','ศรีภูมิ','พระสิงห์','หายยา'],
  'จอมทอง':['บ้านหลวง','ข่วงเปา','สบเตี๊ยะ','บ้านแปะ','ดอยแก้ว','แม่สอย'],
  'แม่แจ่ม':['ช่างเคิ่ง','ท่าผา','บ้านทับ','แม่ศึก','แม่นาจร','บ้านจันทร์','ปางหินฝน','กองแขก','แม่แดด','แจ่มหลวง'],
  'เชียงดาว':['เชียงดาว','เมืองนะ','เมืองงาย','แม่นะ','เมืองคอง','ปิงโค้ง','ทุ่งข้าวพวง'],
  'ดอยสะเก็ด':['เชิงดอย','สันปูเลย','ลวงเหนือ','ป่าป้อง','สง่าบ้าน','ป่าลาน','ตลาดขวัญ','สำราญราษฎร์','แม่คือ','ตลาดใหญ่','แม่ฮ้อยเงิน','แม่โป่ง','ป่าเมี่ยง','เทพเสด็จ'],
  'แม่แตง':['สันมหาพน','แม่แตง','ขี้เหล็ก','ช่อแล','แม่หอพระ','สบเปิง','บ้านเป้า','สันป่ายาง','ป่าแป๋','เมืองก๋าย','บ้านช้าง','กื้ดช้าง','อินทขิล','สมก๋าย'],
  'แม่ริม':['ริมใต้','ริมเหนือ','สันโป่ง','ขี้เหล็ก','สะลวง','ห้วยทราย','แม่แรม','โป่งแยง','แม่สา','ดอนแก้ว','เหมืองแก้ว'],
  'สะเมิง':['สะเมิงใต้','สะเมิงเหนือ','แม่สาบ','บ่อแก้ว','ยั้งเมิน'],
  'ฝาง':['เวียง','ม่อนปิ่น','แม่งอน','แม่สูน','สันทราย','แม่คะ','แม่ข่า','โป่งน้ำร้อน'],
  'แม่อาย':['แม่อาย','แม่สาว','สันต้นหมื้อ','แม่นาวาง','ท่าตอน','บ้านหลวง','มะลิกา'],
  'พร้าว':['เวียง','ทุ่งหลวง','ป่าตุ้ม','ป่าไหน่','สันทราย','บ้านโป่ง','น้ำแพร่','เขื่อนผาก','แม่แวน','แม่ปั๋ง','โหล่งขอด'],
  'สันป่าตอง':['ยุหว่า','สันกลาง','ท่าวังพร้าว','มะขามหลวง','แม่ก๊า','บ้านแม','บ้านกลาง','ทุ่งสะโตก','ทุ่งต้อม','น้ำบ่อหลวง','มะขุนหวาน'],
  'สันกำแพง':['สันกำแพง','ทรายมูล','ร้องวัวแดง','บวกค้าง','แช่ช้าง','ออนใต้','แม่ปูคา','ห้วยทราย','ต้นเปา','สันกลาง'],
  'สันทราย':['สันทรายหลวง','สันทรายน้อย','สันพระเนตร','สันนาเม็ง','สันป่าเปา','หนองแหย่ง','หนองจ๊อม','หนองหาร','แม่แฝก','แม่แฝกใหม่','เมืองเล็น','ป่าไผ่'],
  'หางดง':['หางดง','หนองแก๋ว','หารแก้ว','หนองตอง','ขุนคง','สบแม่ข่า','บ้านแหวน','สันผักหวาน','หนองควาย','บ้านปง','น้ำแพร่'],
  'ฮอด':['หางดง','ฮอด','บ้านตาล','บ่อหลวง','บ่อสลี','นาคอเรือ'],
  'ดอยเต่า':['ดอยเต่า','ท่าเดื่อ','มืดกา','บ้านแอ่น','บงตัน','โปงทุ่ง'],
  'อมก๋อย':['อมก๋อย','ยางเปียง','แม่ตื่น','ม่อนจอง','สบโขง','นาเกียน'],
  'สารภี':['ยางเนิ้ง','สารภี','ชมภู','ไชยสถาน','ขัวมุง','หนองแฝก','หนองผึ้ง','ท่ากว้าง','ดอนแก้ว','ท่าวังตาล','สันทราย','ป่าบง'],
  'เวียงแหง':['เมืองแหง','เปียงหลวง','แสนไห'],
  'ไชยปราการ':['ปงตำ','ศรีดงเย็น','แม่ทะลบ','หนองบัว'],
  'แม่วาง':['บ้านกาด','ทุ่งปี้','ทุ่งรวงทอง','แม่วิน','ดอนเปา'],
  'แม่ออน':['ออนเหนือ','ออนกลาง','บ้านสหกรณ์','ห้วยแก้ว','แม่ทา','ทาเหนือ'],
  'ดอยหล่อ':['ดอยหล่อ','สองแคว','ยางคราม','สันติสุข'],
};

function buildSuggestions(q) {
  if (!q) return [];
  const res = [];
  const amps = Object.keys(amphoeData).filter(a => a.includes(q));
  if (amps.length) res.push({ type: 'amphoe', items: amps.map(a => ({ label: a, sub: 'อำเภอ' })) });
  const tabs = [];
  Object.entries(amphoeData).forEach(([amp, ts]) => {
    ts.filter(t => t.includes(q)).forEach(t => tabs.push({ label: t, sub: amp }));
  });
  if (tabs.length) res.push({ type: 'tambon', items: tabs.slice(0, 8) });
  return res;
}

function MapPinPicker({ onSelect }) {
  useMapEvents({
    click(e) { onSelect(e.latlng); }
  });
  return null;
}

function LandingPage() {
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const [activeTab, setActiveTab] = useState('ann');
  const [announcements, setAnnouncements] = useState([]);
  const [sitters, setSitters] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [petType, setPetType] = useState('ทั้งหมด');

  // Map modal state
  const [showMapModal, setShowMapModal] = useState(false);
  const [pinPosition, setPinPosition] = useState(null);
  const [hasLocationSearch, setHasLocationSearch] = useState(false);

  // โหลดข้อมูลเริ่มต้น
  useEffect(() => {
    const fetchDefault = async () => {
      try {
        await fetchByLatLng(18.7883, 98.9853);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchDefault();
  }, []);

  const fetchByLatLng = async (lat, lng) => {
    setLoading(true);
    try {
      const ptParam = petType !== 'ทั้งหมด' ? `&petType=${petType}` : '';
      const [r1, r2] = await Promise.all([
        fetch(`${API}/api/sitter-job/search?lat=${lat}&lng=${lng}&radius=9999${ptParam}`),
        fetch(`${API}/api/sitter/search?lat=${lat}&lng=${lng}&radius=9999${ptParam}`),
      ]);
      const [d1, d2] = await Promise.all([r1.json(), r2.json()]);
      setAnnouncements(Array.isArray(d1) ? d1 : []);
      setSitters(Array.isArray(d2) ? d2 : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchByArea = async (keyword) => {
    setLoading(true);
    try {
      const ptParam = petType !== 'ทั้งหมด' ? `&petType=${petType}` : '';
      const [r1, r2] = await Promise.all([
        fetch(`${API}/api/announcement/search-by-area?keyword=${encodeURIComponent(keyword)}${ptParam}`),
        fetch(`${API}/api/sitter/search-by-area?keyword=${encodeURIComponent(keyword)}${ptParam}`),
      ]);
      const [d1, d2] = await Promise.all([r1.json(), r2.json()]);
      setAnnouncements(Array.isArray(d1) ? d1 : []);
      setSitters(Array.isArray(d2) ? d2 : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSearch = () => {
    setShowDropdown(false);
    setHasLocationSearch(true);
    if (searchText.trim()) {
      fetchByArea(searchText.trim());
    } else {
      fetchByLatLng(18.7883, 98.9853);
    }
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) { alert('เบราว์เซอร์ไม่รองรับ GPS'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setHasLocationSearch(true); fetchByLatLng(pos.coords.latitude, pos.coords.longitude); },
      () => alert('ไม่สามารถดึงตำแหน่งได้ กรุณาอนุญาต GPS')
    );
  };

  const handlePinSelect = (latlng) => {
    setPinPosition(latlng);
  };

  const handlePinConfirm = () => {
    if (!pinPosition) return;
    setShowMapModal(false);
    setHasLocationSearch(true);
    fetchByLatLng(pinPosition.lat, pinPosition.lng);
  };

  const handleSuggestionInput = (val) => {
    setSearchText(val);
    const s = buildSuggestions(val);
    setSuggestions(s);
    setShowDropdown(s.length > 0 && val.length > 0);
  };

  const selectSuggestion = (label) => {
    setSearchText(label);
    setShowDropdown(false);
    fetchByArea(label);
  };

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handler = (e) => { if (!searchRef.current?.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  };

  const calcDays = (start, end) => {
    if (!start || !end) return 1;
    return Math.max(1, Math.round((new Date(end) - new Date(start)) / (1000*60*60*24)) + 1);
  };

  const getDistanceBadge = (distance) => {
    if (distance == null) return null;
    if (distance <= 5) return { label: `🐾 ใกล้ที่สุด`, color: '#7FB3D9', glow: 'rgba(127,179,217,0.55)', glowSoft: 'rgba(127,179,217,0.4)', hoverGlow: 'rgba(127,179,217,1)', hoverGlowSoft: 'rgba(127,179,217,0.85)' };
    if (distance <= 10) return { label: `🐾🐾 ใกล้`, color: '#5C93BF', glow: 'rgba(92,147,191,0.7)', glowSoft: 'rgba(92,147,191,0.5)', hoverGlow: 'rgba(92,147,191,1)', hoverGlowSoft: 'rgba(92,147,191,0.9)' };
    return { label: `🐾🐾🐾 ไกล`, color: '#2D5F86', glow: 'rgba(45,95,134,0.85)', glowSoft: 'rgba(45,95,134,0.6)', hoverGlow: 'rgba(45,95,134,1)', hoverGlowSoft: 'rgba(45,95,134,0.95)' };
  };

  const getSitterDistanceBadge = (distance) => {
    if (distance == null) return null;
    if (distance <= 5) return { label: `🐾 ใกล้ที่สุด`, color: '#7FB3D9', glow: 'rgba(127,179,217,0.55)', glowSoft: 'rgba(127,179,217,0.4)', hoverGlow: 'rgba(127,179,217,1)', hoverGlowSoft: 'rgba(127,179,217,0.85)' };
    if (distance <= 10) return { label: `🐾🐾 ใกล้`, color: '#5C93BF', glow: 'rgba(92,147,191,0.7)', glowSoft: 'rgba(92,147,191,0.5)', hoverGlow: 'rgba(92,147,191,1)', hoverGlowSoft: 'rgba(92,147,191,0.9)' };
    return { label: `🐾🐾🐾 ไกล`, color: '#2D5F86', glow: 'rgba(45,95,134,0.85)', glowSoft: 'rgba(45,95,134,0.6)', hoverGlow: 'rgba(45,95,134,1)', hoverGlowSoft: 'rgba(45,95,134,0.95)' };
  };

  const getPetEmoji = (typeName) => {
    if (!typeName) return '🐾';
    if (typeName.includes('สุนัข') && !typeName.includes('แมว')) return '🐶';
    if (typeName.includes('แมว') && !typeName.includes('สุนัข')) return '🐱';
    return '🐾';
  };

  const statusIcons = {
    'รับสมัคร': '📢',
    'รอพิจารณา': '⏳',
    'ได้รับผู้ดูแลแล้ว': '👤',
    'กำลังดูแล': '🐾',
    'งานเสร็จสิ้น': '✅',
    'หมดอายุ': '🚫',
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'รับสมัคร': return { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
      case 'รอพิจารณา': return { bg: '#EDF4FB', color: '#1d4ed8', border: '#BFDBFE' };
      default: return { bg: '#EBF4FA', color: '#5C93BF', border: '#d6e7f2' };
    }
  };

  return (
    <div className="lp-wrap">
      {/* Topbar */}
      <div className="lp-topbar">
        <div className="lp-topbar-left">
          <img src={logo} alt="logo" className="lp-logo" />
          <div className="lp-sys-title">ระบบตามหาผู้ดูแลสัตว์เลี้ยง<br />ภายในจังหวัดเชียงใหม่</div>
        </div>
        <div className="lp-nav-menu">
          <span className="lp-nav-tab active">หน้าแรก</span>
          <span className="lp-nav-tab" onClick={() => setActiveTab('ann')}>ประกาศหาผู้ดูแล</span>
          <span className="lp-nav-tab" onClick={() => setActiveTab('sit')}>ผู้ดูแลสัตว์เลี้ยง</span>
        </div>
      </div>

      {/* Search Hero */}
      <div className="lp-hero">
        <div className="lp-hero-title">ค้นหาผู้ดูแลสัตว์เลี้ยงและประกาศ</div>
        <div className="lp-hero-sub">ในจังหวัดเชียงใหม่</div>

        <div className="lp-search-box">
          {/* แถวค้นหา */}
          <div className="lp-search-row" ref={searchRef}>
            <div className="lp-input-wrap">
              <span className="lp-search-icon">🔍</span>
              <input
                className="lp-search-input"
                placeholder="พิมพ์ชื่อตำบลหรืออำเภอ เช่น สันทราย..."
                value={searchText}
                onChange={e => handleSuggestionInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                autoComplete="off"
              />
              {showDropdown && suggestions.length > 0 && (
                <div className="lp-dropdown">
                  {suggestions.map(group => (
                    <div key={group.type}>
                      <div className="lp-dd-group">{group.type === 'amphoe' ? 'อำเภอ' : 'ตำบล'}</div>
                      {group.items.map(item => (
                        <div key={item.label} className="lp-dd-item" onClick={() => selectSuggestion(item.label)}>
                          📍 {item.label} <span className="lp-dd-sub">{item.sub}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="lp-btn-search" onClick={handleSearch}>ค้นหา</button>
          </div>

          {/* แถวปุ่ม */}
          <div className="lp-tools-row">
            <button className="lp-btn-pin" onClick={() => setShowMapModal(true)}>
              📌 ปักหมุดตำแหน่ง
            </button>
            <button className="lp-btn-near" onClick={handleNearMe}>
              📍 ใกล้ฉัน
            </button>
            <select
              className="lp-pet-select"
              value={petType}
              onChange={e => setPetType(e.target.value)}
            >
              <option value="ทั้งหมด">🐾 ทั้งหมด</option>
              <option value="สุนัข">🐶 สุนัข</option>
              <option value="แมว">🐱 แมว</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="lp-tabs">
        <div className={`lp-tab lp-tab-ann ${activeTab === 'ann' ? 'active' : ''}`} onClick={() => setActiveTab('ann')}>
          <span className="lp-tab-icon-circle lp-tab-icon-ann">📢</span>
          ประกาศหาผู้ดูแล
        </div>
        <div className={`lp-tab lp-tab-sit ${activeTab === 'sit' ? 'active' : ''}`} onClick={() => setActiveTab('sit')}>
          <span className="lp-tab-icon-circle lp-tab-icon-sit">👤</span>
          ผู้ดูแลสัตว์เลี้ยง
        </div>
      </div>

      {/* Content */}
      <div className="lp-content">
        {/* =============== ประกาศ =============== */}
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
                  const distInfo = hasLocationSearch ? getDistanceBadge(ann.distance) : null;
                  return (
                    <div
                      key={ann.announceID}
                      className="lp-ann-card"
                      style={distInfo ? {
                        boxShadow: `0 0 0 4px ${distInfo.glow}, 0 8px 20px ${distInfo.glowSoft}`,
                        '--hover-glow': distInfo.hoverGlow,
                        '--hover-glow-soft': distInfo.hoverGlowSoft,
                      } : {}}
                    >
                      <div className="lp-ann-header">
                        <span style={{fontSize:12, color:'#aaa'}}>โพสต์: {formatDate(ann.postdate)}</span>
                        <span className="lp-pet-name">{ann.petName}</span>
                        <span className="lp-status-pill" style={{background:statusStyle.bg, color:statusStyle.color, border:`0.5px solid ${statusStyle.border}`}}>
                          {statusIcons[ann.status] || ''} {ann.status}
                        </span>
                      </div>
                      <div className="lp-ann-img">
                        {ann.petImage && ann.petImage !== 'default.png'
                          ? <img src={`/images/pets/${ann.petImage}`} alt={ann.petName} />
                          : <span>{getPetEmoji(ann.petType)}</span>}
                      </div>
                      <div className="lp-ann-body">
                        <div className="lp-info-row">
                          <span className="lp-lbl">ประเภท</span>{ann.petType} {getPetEmoji(ann.petType)}
                          <span className="lp-lbl" style={{marginLeft:6}}>สายพันธุ์</span>{ann.breed || '-'}
                        </div>
                        <div className="lp-info-row">
                          <span style={{ fontSize: 13, background: ann.gender === 'เพศผู้' ? '#EDF4FB' : '#FDF2F8', color: ann.gender === 'เพศผู้' ? '#1d4ed8' : '#be185d', border: `0.5px solid ${ann.gender === 'เพศผู้' ? '#BFDBFE' : '#FBCFE8'}`, padding: '2px 8px', borderRadius: 20, fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {ann.gender === 'เพศผู้' ? '♂ เพศผู้' : '♀ เพศเมีย'}
                          </span>
                        </div>
                        <div className="lp-info-row">
                          <span className="lp-lbl">วันที่ดูแล</span>
                          <span style={{color:'#F96320', fontWeight:600}}>{calcDays(ann.startdate, ann.enddate)} วัน</span>
                          <span>({formatDate(ann.startdate)} - {formatDate(ann.enddate)})</span>
                        </div>
                        {ann.careSlots && ann.careSlots.length > 0 && (
                          <div className="lp-info-row">
                            <span className="lp-lbl">ช่วงเวลา</span>{ann.careSlots.join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="lp-ann-footer">
                        <div className="lp-ann-footer-text-group">
                          <span className="lp-loc">📍 {ann.subdistrict}, {ann.district}, {ann.province}</span>
                          {distInfo && (
                            <>
                              <span style={{fontSize:15, fontWeight:700, color:distInfo.color}}>{distInfo.label}</span>
                              <span style={{fontSize:13, fontWeight:500, color:distInfo.color}}>ห่างจากคุณ {ann.distance} กม.</span>
                            </>
                          )}
                        </div>
                        <button className="lp-detail-btn" onClick={() => setShowModal(true)}>รายละเอียด</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* =============== ผู้ดูแล =============== */}
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
                {sitters.map(sitter => {
                  const distInfo = hasLocationSearch ? getSitterDistanceBadge(sitter.distance) : null;
                  return (
                  <div
                    key={sitter.sitterID}
                    className="lp-sitter-card"
                    style={distInfo ? {
                      boxShadow: `0 0 0 4px ${distInfo.glow}, 0 8px 20px ${distInfo.glowSoft}`,
                      '--hover-glow': distInfo.hoverGlow,
                      '--hover-glow-soft': distInfo.hoverGlowSoft,
                    } : {}}
                  >
                    {sitter.avgRating ? (
                      <div className="lp-sitter-rating-corner">
                        <span style={{color:'#f59e0b', fontSize:12}}>{'★'.repeat(Math.round(sitter.avgRating))}{'☆'.repeat(5 - Math.round(sitter.avgRating))}</span>
                        <span style={{color:'#7FB3D9', fontWeight:600, fontSize:12}}> {sitter.avgRating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <div className="lp-sitter-rating-corner lp-new-badge">🆕 ผู้ดูแลใหม่</div>
                    )}
                    <div className="lp-sitter-av">
                      {sitter.sitterImage && sitter.sitterImage !== 'default.png'
                        ? <img src={`/images/sitters/${sitter.sitterImage}`} alt={sitter.firstname} />
                        : <span>👤</span>}
                    </div>
                    <div className="lp-sitter-name">{sitter.firstname} {sitter.lastname}</div>
                    <div className="lp-sitter-det">รับดูแล {sitter.petAlowPet} · {sitter.acceptedPetSize}</div>
                    <div className="lp-sitter-price">{sitter.pricePerDay} บาท/วัน</div>
                    <div className="lp-sitter-loc">📍 {sitter.subdistrict}, {sitter.district}, {sitter.province}</div>
                    {distInfo && (
                      <>
                        <div className="lp-sitter-distance-label" style={{ color: distInfo.color }}>
                          {distInfo.label}
                        </div>
                        <div className="lp-sitter-distance-km" style={{ color: distInfo.color }}>
                          ห่างจากคุณ {sitter.distance} กม.
                        </div>
                      </>
                    )}
                    <button className="lp-detail-btn" onClick={() => setShowModal(true)}>ดูโปรไฟล์</button>
                  </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer CTA */}
      <div className="lp-footer-cta">
        <div className="lp-footer-title">เริ่มต้นใช้งานได้เลย</div>
      
        <div className="lp-footer-btns">
          <button className="lp-btn-white" onClick={() => navigate('/login')}>เข้าสู่ระบบ</button>
          <button className="lp-btn-outline" onClick={() => navigate('/register')}>ลงทะเบียน</button>
        </div>
      </div>

      {/* Map Modal */}
      {showMapModal && (
        <div className="lp-modal-overlay">
          <div className="lp-modal" style={{width:500, maxWidth:'95vw'}}>
            <div className="lp-modal-title">📌 เลือกตำแหน่งที่ต้องการค้นหา</div>
            <div className="lp-modal-body" style={{marginBottom:10}}>กดบนแผนที่เพื่อปักหมุดตำแหน่ง</div>
            <div style={{width:'100%', height:300, borderRadius:10, overflow:'hidden', marginBottom:14, border:'0.5px solid #d6e7f2'}}>
              <MapContainer center={pinPosition ? [pinPosition.lat, pinPosition.lng] : [18.7883, 98.9853]} zoom={11} style={{width:'100%', height:'100%'}}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                <MapPinPicker onSelect={handlePinSelect} />
                {pinPosition && <Marker position={[pinPosition.lat, pinPosition.lng]} />}
              </MapContainer>
            </div>
            {pinPosition && <div style={{fontSize:12, color:'#5C93BF', marginBottom:10}}>📍 ตำแหน่งที่เลือก: {pinPosition.lat.toFixed(5)}, {pinPosition.lng.toFixed(5)}</div>}
            <div className="lp-modal-btns">
              <button className="lp-modal-btn-primary" onClick={handlePinConfirm} disabled={!pinPosition}>ค้นหาจากตำแหน่งนี้</button>
              <button className="lp-modal-btn-outline" onClick={() => setShowMapModal(false)}>ปิด</button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showModal && (
        <div className="lp-modal-overlay">
          <div className="lp-modal">
            <div className="lp-modal-icon">🔐</div>
            <div className="lp-modal-title">กรุณาเข้าสู่ระบบก่อน</div>
            <div className="lp-modal-body">
              คุณต้องเข้าสู่ระบบหรือลงทะเบียนก่อน<br/>เพื่อดูรายละเอียดเพิ่มเติมครับ
            </div>
            <div className="lp-modal-btns">
              <button className="lp-modal-btn-primary" onClick={() => navigate('/login')}>เข้าสู่ระบบ</button>
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
