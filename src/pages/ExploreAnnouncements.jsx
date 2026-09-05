import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import './ProfileOwner.css';
import './ExploreAnnouncements.css';
import logo from '../assets/logo.png';
import NotificationBell from '../components/NotificationBell';

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

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

import { API_BASE_URL as API } from '../config';

function MapPicker({ position, setPosition }) {
  useMapEvents({ click(e) { setPosition([e.latlng.lat, e.latlng.lng]); } });
  return position ? <Marker position={position} /> : null;
}

function ExploreAnnouncements() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const imageUrl = user.sitterImage && user.sitterImage !== 'default.png'
    ? `/images/sitters/${user.sitterImage}` : null;

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [petTypeFilter, setPetTypeFilter] = useState('ทั้งหมด');
  const [showMap, setShowMap] = useState(false);
  const [pinPosition, setPinPosition] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasLocationSearch, setHasLocationSearch] = useState(false);
  const searchRef = useRef(null);

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handler = (e) => { if (!searchRef.current?.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSuggestionInput = (val) => {
    setSearchText(val);
    const s = buildSuggestions(val);
    setSuggestions(s);
    setShowDropdown(s.length > 0 && val.length > 0);
  };

  const fetchAnnouncementsByArea = async (keyword) => {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ keyword });
      if (petTypeFilter && petTypeFilter !== 'ทั้งหมด') params.append('petType', petTypeFilter);

      // ขอตำแหน่งจริงของผู้ใช้ (ถ้าอนุญาต) เพื่อคำนวณระยะทางจริง
      const position = await new Promise((resolve) => {
        if (!navigator.geolocation) { resolve(null); return; }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos.coords),
          () => resolve(null)
        );
      });
      if (position) {
        params.append('lat', position.latitude);
        params.append('lng', position.longitude);
      }

      const res = await fetch(`${API}/api/announcement/search-by-area?${params}`);
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const selectSuggestion = (label) => {
    setSearchText(label);
    setShowDropdown(false);
    fetchAnnouncementsByArea(label);
  };

  const handleSearchClick = () => {
    setShowDropdown(false);
    setHasLocationSearch(true);
    if (searchText.trim()) {
      fetchAnnouncementsByArea(searchText.trim());
    } else {
      fetchAnnouncements(18.7883, 98.9853, petTypeFilter);
    }
  };

  const fetchAnnouncements = async (lat, lng, petType) => {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ lat, lng, radius: 9999 });
      if (petType && petType !== 'ทั้งหมด') params.append('petType', petType);
      const res = await fetch(`${API}/api/sitter-job/search?${params}`);
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) { alert('เบราว์เซอร์ไม่รองรับ GPS'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setHasLocationSearch(true); fetchAnnouncements(pos.coords.latitude, pos.coords.longitude, petTypeFilter); },
      () => alert('ไม่สามารถดึงตำแหน่งได้')
    );
  };

  const handleSearchByPin = () => {
    if (!pinPosition) { alert('กรุณาปักหมุดตำแหน่งบนแผนที่'); return; }
    setShowMap(false);
    setHasLocationSearch(true);
    fetchAnnouncements(pinPosition[0], pinPosition[1], petTypeFilter);
  };

  const filteredAnnouncements = announcements.filter(a => {
    const loc = `${a.subdistrict || ''} ${a.district || ''}`.toLowerCase();
    return loc.includes(searchText.toLowerCase());
  });

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

  const getDistanceBadge = (distance) => {
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
      default: return { bg: '#EBF4FA', color: '#7FB3D9', border: '#d6e7f2' };
    }
  };

  const handleLogout = () => { localStorage.removeItem('user'); navigate('/'); };

  return (
    <div className="app-layout">
      <div className="topbar">
        <div className="topbar-left">
          <img src={logo} alt="logo" className="topbar-logo" />
          <div className="topbar-title">ระบบตามหาผู้ดูแลสัตว์เลี้ยง<br />ภายในจังหวัดเชียงใหม่</div>
        </div>
        <div className="topbar-user">
          <span>ยินดีต้อนรับ คุณ{user.firstname}</span>
          <NotificationBell userID={user.sitterID} userRole="SITTER" />
          <div className="topbar-avatar">
            {imageUrl ? <img src={imageUrl} alt="avatar" /> : <span style={{fontSize:18}}>👤</span>}
          </div>
        </div>
      </div>

      <div className="body-row">
        <div className="sidebar">
          <div className="sidebar-menu">
            <a className="menu-item" onClick={() => navigate('/profile-sitter')}><span className="menu-icon">👤</span><span>โปรไฟล์ของฉัน</span></a>
            <a className="menu-item active" onClick={() => navigate('/explore-announcements')}><span className="menu-icon">🔍</span><span>ค้นหาประกาศ</span></a>
            <a className="menu-item" onClick={() => navigate('/my-applications')}><span className="menu-icon">📝</span><span>คำขอที่ส่งแล้ว</span></a>
          </div>
          <hr className="menu-divider" />
          <a className="menu-item menu-logout" onClick={handleLogout}><span className="menu-icon">🚪</span><span>ออกจากระบบ</span></a>
        </div>

        <div className="main-content">

          {/* Search Bar */}
          <div className="ea-search-panel">
            <div className="ea-search-row" ref={searchRef}>
              <div className="ea-search-input-wrap">
                <span className="ea-search-icon">🔍</span>
                <input
                  type="text"
                  className="ea-search-input"
                  placeholder="พิมพ์ชื่อตำบลหรืออำเภอ เช่น สันทราย..."
                  value={searchText}
                  onChange={e => handleSuggestionInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearchClick()}
                  autoComplete="off"
                />
                {showDropdown && suggestions.length > 0 && (
                  <div className="ea-suggestions-dropdown">
                    {suggestions.map(group => (
                      <div key={group.type}>
                        <div className="ea-dd-group">{group.type === 'amphoe' ? 'อำเภอ' : 'ตำบล'}</div>
                        {group.items.map(item => (
                          <div key={item.label} className="ea-suggestion-item" onClick={() => selectSuggestion(item.label)}>
                            📍 {item.label} <span className="ea-dd-sub">{item.sub}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button className="ea-search-btn" onClick={handleSearchClick}>ค้นหา</button>
            </div>
            <div className="ea-search-actions">
              <button className="ea-pin-pill" onClick={() => setShowMap(!showMap)}>📌 ปักหมุดตำแหน่ง</button>
              <button className="ea-near-pill" onClick={handleNearMe}>📍 ใกล้ฉัน</button>
              <select className="ea-type-pill" value={petTypeFilter} onChange={e => setPetTypeFilter(e.target.value)}>
                <option value="ทั้งหมด">🐾 ทั้งหมด</option>
                <option value="สุนัข">🐶 สุนัข</option>
                <option value="แมว">🐱 แมว</option>
              </select>
            </div>
          </div>

          {/* แผนที่ปักหมุด */}
          {showMap && (
            <div className="ea-map-wrap">
              <p className="ea-map-hint">📍 กดบนแผนที่เพื่อปักหมุดตำแหน่งที่ต้องการค้นหา</p>
              <div className="ea-map-box">
                <MapContainer center={pinPosition || [18.7883, 98.9853]} zoom={11} style={{width:'100%',height:'100%'}}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                  <MapPicker position={pinPosition} setPosition={setPinPosition} />
                </MapContainer>
              </div>
              {pinPosition && <p style={{fontSize:11,color:'#7FB3D9',marginTop:4}}>📍 {pinPosition[0].toFixed(5)}, {pinPosition[1].toFixed(5)}</p>}
              <button className="ea-search-pin-btn" onClick={handleSearchByPin}>ค้นหาจากตำแหน่งนี้</button>
            </div>
          )}

          {/* ผลลัพธ์ */}
          {loading ? (
            <div className="ea-loading">กำลังค้นหาประกาศ...</div>
          ) : !searched ? (
            <div className="ea-empty">
              <div style={{fontSize:48, marginBottom:12}}>📋</div>
              <p>กดปุ่ม "ใกล้ฉัน" หรือปักหมุดตำแหน่งเพื่อค้นหาประกาศ</p>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="ea-empty">
              <div style={{fontSize:48, marginBottom:12}}>😔</div>
              <p>ไม่พบประกาศ</p>
            </div>
          ) : (
            <div className="ea-list">
              {filteredAnnouncements.map(ann => {
                const statusStyle = getStatusStyle(ann.status);
                const distInfo = hasLocationSearch ? getDistanceBadge(ann.distance) : null;
                return (
                  <div
                    key={ann.announceID}
                    className="ea-card"
                    style={distInfo ? {
                      boxShadow: `0 0 0 4px ${distInfo.glow}, 0 8px 20px ${distInfo.glowSoft}`,
                      '--hover-glow': distInfo.hoverGlow,
                      '--hover-glow-soft': distInfo.hoverGlowSoft,
                    } : {}}
                  >
                    <div className="ea-card-header">
                      <span className="ea-postdate">โพสต์: {formatDate(ann.postdate)}</span>
                      <span className="ea-pet-name">{ann.petName}</span>
                      <span className="ea-status-badge" style={{background:statusStyle.bg, color:statusStyle.color, border:`0.5px solid ${statusStyle.border}`}}>
                        {statusIcons[ann.status] || ''} {ann.status}
                      </span>
                    </div>
                    <div className="ea-card-content">
                      <div className="ea-card-img-wrap">
                        {ann.petImage && ann.petImage !== 'default.png'
                          ? <img src={`/images/pets/${ann.petImage}`} alt={ann.petName} className="ea-card-img" />
                          : <div className="ea-card-img-placeholder">{getPetEmoji(ann.petType)}</div>
                        }
                      </div>
                      <div className="ea-card-body">
                        <div className="ea-info-row">
                          <span className="ea-lbl">ประเภทสัตว์</span>
                          <span>{ann.petType} {getPetEmoji(ann.petType)}</span>
                          <span className="ea-lbl" style={{marginLeft:6}}>สายพันธุ์</span>
                          <span>{ann.breed || '-'}</span>
                        </div>
                        <div className="ea-info-row">
                          <span style={{ fontSize: 13, background: ann.gender === 'เพศผู้' ? '#EDF4FB' : '#FDF2F8', color: ann.gender === 'เพศผู้' ? '#1d4ed8' : '#be185d', border: `0.5px solid ${ann.gender === 'เพศผู้' ? '#BFDBFE' : '#FBCFE8'}`, padding: '2px 8px', borderRadius: 20, fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {ann.gender === 'เพศผู้' ? '♂ เพศผู้' : '♀ เพศเมีย'}
                          </span>
                        </div>
                        <div className="ea-info-row">
                          <span className="ea-lbl">วันเกิด</span>
                          <span>{formatDate(ann.birthDate)}</span>
                          <span style={{color:'#aaa',fontSize:11}}>&nbsp;อายุ {calcAge(ann.birthDate)} (โดยประมาณ)</span>
                        </div>
                        <div className="ea-info-row">
                          <span className="ea-lbl">น้ำหนัก</span>
                          <span>{ann.currentweight}</span>
                        </div>
                        <div className="ea-info-row">
                          <span className="ea-lbl">วันที่ดูแล</span>
                          <span style={{color:'#F96320',fontWeight:600}}>{calcDays(ann.startdate, ann.enddate)} วัน</span>
                          <span>({formatDate(ann.startdate)} - {formatDate(ann.enddate)})</span>
                        </div>
                        {ann.careSlots && ann.careSlots.length > 0 && (
                          <div className="ea-info-row">
                            <span className="ea-lbl">ช่วงเวลา</span>
                            <span>{ann.careSlots.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ea-card-footer">
                      <div className="ea-footer-text-group">
                        <span className="ea-location">📍 {ann.subdistrict}, {ann.district}, {ann.province}</span>
                        {distInfo && (
                          <>
                            <span className="ea-distance-label" style={{ color: distInfo.color }}>
                              {distInfo.label}
                            </span>
                            <span className="ea-distance-km" style={{ color: distInfo.color }}>
                              ห่างจากคุณ {ann.distance} กม.
                            </span>
                          </>
                        )}
                      </div>
                      <button className="ea-detail-btn" onClick={() => navigate(`/announcement-detail-sitter/${ann.announceID}`)}>
                        รายละเอียด
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default ExploreAnnouncements;
