import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import './ProfileOwner.css';
import './ExploreSitters.css';
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
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

import { API_BASE_URL as API } from '../config';

function MapPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

function ExploreSitters() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const imageUrl = user.profileImage && user.profileImage !== 'default.png'
    ? `/images/owners/${user.profileImage}`
    : null;

  const getDistanceBadge = (distance) => {
    if (distance == null) return null;
    if (distance <= 5) return { label: `🐾 ใกล้ที่สุด`, color: '#7FB3D9', glow: 'rgba(127,179,217,0.55)', glowSoft: 'rgba(127,179,217,0.4)', hoverGlow: 'rgba(127,179,217,1)', hoverGlowSoft: 'rgba(127,179,217,0.85)' };
    if (distance <= 10) return { label: `🐾🐾 ใกล้`, color: '#5C93BF', glow: 'rgba(92,147,191,0.7)', glowSoft: 'rgba(92,147,191,0.5)', hoverGlow: 'rgba(92,147,191,1)', hoverGlowSoft: 'rgba(92,147,191,0.9)' };
    return { label: `🐾🐾🐾 ไกล`, color: '#2D5F86', glow: 'rgba(45,95,134,0.85)', glowSoft: 'rgba(45,95,134,0.6)', hoverGlow: 'rgba(45,95,134,1)', hoverGlowSoft: 'rgba(45,95,134,0.95)' };
  };

  const [sitters, setSitters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [petTypeFilter, setPetTypeFilter] = useState('ทั้งหมด');
  const [showMap, setShowMap] = useState(false);
  const [pinPosition, setPinPosition] = useState(null);
  const [searchPosition, setSearchPosition] = useState(null);
  const [searched, setSearched] = useState(false);
  const [searchText, setSearchText] = useState('');
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

  const fetchSittersByArea = async (keyword) => {
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

      const res = await fetch(`${API}/api/sitter/search-by-area?${params}`);
      const data = await res.json();
      setSitters(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const selectSuggestion = (label) => {
    setSearchText(label);
    setShowDropdown(false);
    fetchSittersByArea(label);
  };

  const handleSearchClick = () => {
    setShowDropdown(false);
    setHasLocationSearch(true);
    if (searchText.trim()) {
      fetchSittersByArea(searchText.trim());
    } else {
      fetchSitters(18.7883, 98.9853, petTypeFilter);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  // ใกล้ฉัน — GPS ปัจจุบัน
  const handleNearMe = () => {
    if (!navigator.geolocation) { alert('เบราว์เซอร์ไม่รองรับ GPS'); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setSearchPosition([latitude, longitude]);
        setHasLocationSearch(true);
        fetchSitters(latitude, longitude, petTypeFilter);
      },
      () => {
        setLoading(false);
        alert('ไม่สามารถดึงตำแหน่งได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง');
      }
    );
  };

  // ค้นหาจากตำแหน่งที่ปักหมุด
  const handleSearchByPin = () => {
    if (!pinPosition) { alert('กรุณาปักหมุดตำแหน่งบนแผนที่'); return; }
    setSearchPosition(pinPosition);
    setShowMap(false);
    setHasLocationSearch(true);
    fetchSitters(pinPosition[0], pinPosition[1], petTypeFilter);
  };

  const fetchSitters = async (lat, lng, petType) => {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ lat, lng, radius: 9999 });
      if (petType && petType !== 'ทั้งหมด') params.append('petType', petType);
      const res = await fetch(`${API}/api/sitter/search?${params}`);
      const data = await res.json();
      setSitters(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // กรองตามชื่อ
  const filteredSitters = sitters.filter(s => {
    const location = `${s.subdistrict} ${s.district}`.toLowerCase();
    return location.includes(searchText.toLowerCase());
  });

  const getPetTypeEmoji = (petType) => {
    if (!petType) return '';
    if (petType.includes('สุนัข') && petType.includes('แมว')) return 'สุนัข 🐶 แมว 🐱';
    if (petType.includes('สุนัข')) return 'สุนัข 🐶';
    if (petType.includes('แมว')) return 'แมว 🐱';
    return petType;
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    return (
      <span className="star-rating">
        <span style={{color:'#f59e0b'}}>{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</span>
        <span className="star-score"> {rating.toFixed(1)}</span>
      </span>
    );
  };

  return (
    <div className="app-layout">
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-left">
          <img src={logo} alt="logo" className="topbar-logo" />
          <div className="topbar-title">ระบบตามหาผู้ดูแลสัตว์เลี้ยง<br />ภายในจังหวัดเชียงใหม่</div>
        </div>
        <div className="topbar-user">
          <span>ยินดีต้อนรับ คุณ{user.firstname}</span>
          <NotificationBell userID={user.ownerID} userRole="OWNER" />
          <div className="topbar-avatar">
            {imageUrl ? <img src={imageUrl} alt="avatar" /> : <span style={{ fontSize: 18 }}>👤</span>}
          </div>
        </div>
      </div>

      <div className="body-row">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-menu">
            <a className="menu-item" onClick={() => navigate('/profile-owner')}>
              <span className="menu-icon">👤</span><span>โปรไฟล์ของฉัน</span>
            </a>
            <a className="menu-item" onClick={() => navigate('/my-pets')}>
              <span className="menu-icon">🐾</span><span>รายการสัตว์เลี้ยง</span>
            </a>
            <a className="menu-item active" onClick={() => navigate('/explore-sitters')}>
              <span className="menu-icon">🔍</span><span>ค้นหาผู้ดูแล</span>
            </a>
            <a className="menu-item" onClick={() => navigate('/my-announcements')}>
              <span className="menu-icon">📢</span><span>รายการประกาศ</span>
            </a>
          </div>
          <hr className="menu-divider" />
          <a className="menu-item menu-logout" onClick={handleLogout}>
            <span className="menu-icon">🚪</span><span>ออกจากระบบ</span>
          </a>
        </div>

        {/* Main */}
        <div className="main-content">

          {/* แถบค้นหา */}
          <div className="explore-search-panel">
            <div className="explore-search-row" ref={searchRef}>
              <div className="explore-search-input-wrap">
                <span className="explore-search-icon">🔍</span>
                <input
                  type="text"
                  className="explore-search-input"
                  placeholder="พิมพ์ชื่อตำบลหรืออำเภอ เช่น สันทราย..."
                  value={searchText}
                  onChange={e => handleSuggestionInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearchClick()}
                  autoComplete="off"
                />
                {showDropdown && suggestions.length > 0 && (
                  <div className="explore-suggestions-dropdown">
                    {suggestions.map(group => (
                      <div key={group.type}>
                        <div className="explore-dd-group">{group.type === 'amphoe' ? 'อำเภอ' : 'ตำบล'}</div>
                        {group.items.map(item => (
                          <div key={item.label} className="explore-suggestion-item" onClick={() => selectSuggestion(item.label)}>
                            📍 {item.label} <span className="explore-dd-sub">{item.sub}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button className="explore-search-btn" onClick={handleSearchClick}>ค้นหา</button>
            </div>
            <div className="explore-search-actions">
              <button className="explore-pin-pill" onClick={() => setShowMap(!showMap)}>📌 ปักหมุดตำแหน่ง</button>
              <button className="explore-near-pill" onClick={handleNearMe}>📍 ใกล้ฉัน</button>
              <select
                className="explore-type-pill"
                value={petTypeFilter}
                onChange={e => setPetTypeFilter(e.target.value)}
              >
                <option value="ทั้งหมด">🐾 ทั้งหมด</option>
                <option value="สุนัข">🐶 สุนัข</option>
                <option value="แมว">🐱 แมว</option>
              </select>
            </div>
          </div>

          {/* แผนที่ปักหมุด */}
          {showMap && (
            <div className="explore-map-wrap">
              <p className="explore-map-hint">📍 กดบนแผนที่เพื่อปักหมุดตำแหน่งที่ต้องการค้นหา</p>
              <div className="explore-map-box">
                <MapContainer center={pinPosition || [18.7883, 98.9853]} zoom={11} style={{ width: '100%', height: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                  <MapPicker position={pinPosition} setPosition={setPinPosition} />
                </MapContainer>
              </div>
              {pinPosition && (
                <p style={{ fontSize: 12, color: '#7FB3D9', marginTop: 6 }}>
                  📍 ตำแหน่งที่เลือก: {pinPosition[0].toFixed(5)}, {pinPosition[1].toFixed(5)}
                </p>
              )}
              <button className="explore-search-pin-btn" onClick={handleSearchByPin}>
                ค้นหาจากตำแหน่งนี้
              </button>
            </div>
          )}

          {/* ผลการค้นหา */}
          {loading ? (
            <div className="explore-loading">กำลังค้นหาผู้ดูแล...</div>
          ) : !searched ? (
            <div className="explore-empty">
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <p>กดปุ่ม "ใกล้ฉัน" หรือปักหมุดตำแหน่งเพื่อค้นหาผู้ดูแลใกล้คุณ</p>
            </div>
          ) : filteredSitters.length === 0 ? (
            <div className="explore-empty">
              <div style={{ fontSize: 48, marginBottom: 12 }}>😔</div>
              <p>ไม่พบผู้ดูแล</p>
            </div>
          ) : (
            <div className="explore-list">
              {filteredSitters.map(sitter => {
                const distInfo = hasLocationSearch ? getDistanceBadge(sitter.distance) : null;
                return (
                <div
                  key={sitter.sitterID}
                  className="explore-card"
                  style={distInfo ? {
                    boxShadow: `0 0 0 4px ${distInfo.glow}, 0 8px 20px ${distInfo.glowSoft}`,
                    '--hover-glow': distInfo.hoverGlow,
                    '--hover-glow-soft': distInfo.hoverGlowSoft,
                  } : {}}
                >
                  {sitter.avgRating ? (
                    <div className="explore-card-rating-corner">{renderStars(sitter.avgRating)}</div>
                  ) : (
                    <div className="explore-card-rating-corner explore-new-badge">🆕 ผู้ดูแลใหม่</div>
                  )}
                  <div className="explore-card-img-wrap">
                    {sitter.sitterImage && sitter.sitterImage !== 'default.png'
                      ? <img src={`/images/sitters/${sitter.sitterImage}`} alt={sitter.firstname} className="explore-card-img" />
                      : <div className="explore-card-img-placeholder">👤</div>
                    }
                  </div>
                  <div className="explore-card-name">
                    {sitter.firstname} {sitter.lastname}
                  </div>
                  <div className="explore-card-top-row">
                    <span style={{ fontSize: 12, background: sitter.gender === 'ชาย' ? '#EDF4FB' : '#FDF2F8', color: sitter.gender === 'ชาย' ? '#1d4ed8' : '#be185d', border: `0.5px solid ${sitter.gender === 'ชาย' ? '#BFDBFE' : '#FBCFE8'}`, padding: '2px 8px', borderRadius: 20, fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {sitter.gender === 'ชาย' ? '♂ ชาย' : '♀ หญิง'}
                    </span>
                  </div>
                  <div className="explore-card-pettype">
                    ประเภทสัตว์เลี้ยงที่รับดูแล &nbsp;
                    <span className="explore-card-pettype-val">{getPetTypeEmoji(sitter.petAlowPet)}</span>
                  </div>
                  <div className="explore-card-price">💰 {sitter.pricePerDay} บาท / วัน</div>
                  <div className="explore-card-location">📍 {sitter.subdistrict}, {sitter.district}, {sitter.province}</div>
                  {distInfo && (
                    <>
                      <div className="explore-card-distance-label" style={{ color: distInfo.color }}>
                        {distInfo.label}
                      </div>
                      <div className="explore-card-distance-km" style={{ color: distInfo.color }}>
                        ห่างจากคุณ {sitter.distance} กม.
                      </div>
                    </>
                  )}
                  <button className="explore-detail-btn" onClick={() => navigate(`/sitter-profile/${sitter.sitterID}`)}>
                    ดูโปรไฟล์
                  </button>
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

export default ExploreSitters;