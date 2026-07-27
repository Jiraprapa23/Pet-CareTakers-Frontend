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

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const API = 'http://localhost:8096';

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
    ? `${API}/api/auth/images/${user.profileImage}`
    : null;

  const [sitters, setSitters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [petTypeFilter, setPetTypeFilter] = useState('ทั้งหมด');
  const [showMap, setShowMap] = useState(false);
  const [pinPosition, setPinPosition] = useState(null);
  const [searchPosition, setSearchPosition] = useState(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setSearchPosition([latitude, longitude]);
        fetchSitters(latitude, longitude, 'ทั้งหมด');
      },
      () => {} // ถ้าไม่อนุญาต GPS ก็ไม่ทำอะไร
    );
  }, []);
  

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
    if (!pinPosition) { alert('กรุณาปักหมุดตำแหน่งบนแผนที่ก่อนครับ'); return; }
    setSearchPosition(pinPosition);
    setShowMap(false);
    fetchSitters(pinPosition[0], pinPosition[1], petTypeFilter);
  };

  const fetchSitters = async (lat, lng, petType) => {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ lat, lng, radius: 5 });
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
    return location.includes(searchName.toLowerCase());
  });

  const getPetTypeEmoji = (petType) => {
    if (!petType) return '';
    if (petType.includes('สุนัข') && petType.includes('แมว')) return '🐶 🐱';
    if (petType.includes('สุนัข')) return '🐶';
    if (petType.includes('แมว')) return '🐱';
    return petType;
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return (
      <span className="star-rating">
        {'⭐'.repeat(full)}{half ? '✨' : ''}
        <span className="star-score"> {rating}</span>
      </span>
    );
  };

  return (
    <div className="app-layout">
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-left">
          <img src={logo} alt="logo" className="topbar-logo" />
          <div className="topbar-title">ระบบตามหาผู้ดูแลสัตว์เลี้ยง ภายในจังหวัดเชียงใหม่</div>
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
              <span className="menu-icon">🔍</span><span>สำรวจผู้ดูแล</span>
            </a>
            <a className="menu-item" onClick={() => navigate('/my-announcements')}>
              <span className="menu-icon">📢</span><span>รายการประกาศ</span>
            </a>
            <a className="menu-item" onClick={() => navigate('/active-jobs')}>
              <span className="menu-icon">⚡</span><span>งานที่กำลังทำ</span>
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
          <div className="explore-search-bar">
            <div className="explore-search-input-wrap">
              <span className="explore-search-icon">🔍</span>
              <input
                type="text"
                className="explore-search-input"
                placeholder="ค้นหาจากชื่อตำบลหรืออำเภอ..."
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
              />
              <button className="explore-pin-btn" onClick={() => setShowMap(!showMap)} title="ปักหมุดตำแหน่ง">
                📍
              </button>
            </div>
            <button className="explore-nearbtn" onClick={handleNearMe}>ใกล้ฉัน</button>
            <select
              className="explore-type-select"
              value={petTypeFilter}
              onChange={e => setPetTypeFilter(e.target.value)}
            >
              <option value="ทั้งหมด">ประเภทสัตว์เลี้ยง</option>
              <option value="ทั้งหมด">ทั้งหมด</option>
              <option value="สุนัข">🐶 สุนัข</option>
              <option value="แมว">🐱 แมว</option>
            </select>
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
                <p style={{ fontSize: 12, color: '#8D6E63', marginTop: 6 }}>
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
              <p>กดปุ่ม "ใกล้ฉัน" หรือปักหมุดตำแหน่งเพื่อค้นหาผู้ดูแลใกล้คุณครับ</p>
            </div>
          ) : filteredSitters.length === 0 ? (
            <div className="explore-empty">
              <div style={{ fontSize: 48, marginBottom: 12 }}>😔</div>
              <p>ไม่พบผู้ดูแลในรัศมี 5 กิโลเมตรครับ</p>
            </div>
          ) : (
            <div className="explore-list">
              {filteredSitters.map(sitter => (
                <div key={sitter.sitterID} className="explore-card">
                  <div className="explore-card-img-wrap">
                    {sitter.sitterImage && sitter.sitterImage !== 'default.png'
                      ? <img src={`${API}/api/auth/images/${sitter.sitterImage}`} alt={sitter.firstname} className="explore-card-img" />
                      : <div className="explore-card-img-placeholder">👤</div>
                    }
                  </div>
                  <div className="explore-card-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
  <div className="explore-card-name">
    {sitter.firstname} {sitter.lastname}
    {sitter.avgRating && renderStars(sitter.avgRating)}
  </div>
  <span style={{ fontSize: 12, background: sitter.gender === 'ชาย' ? '#EDF4FB' : '#FDF2F8', color: sitter.gender === 'ชาย' ? '#1d4ed8' : '#be185d', border: `0.5px solid ${sitter.gender === 'ชาย' ? '#BFDBFE' : '#FBCFE8'}`, padding: '3px 10px', borderRadius: 20, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
    {sitter.gender === 'ชาย' ? '♂ ชาย' : '♀ หญิง'}
  </span>
</div>
                    <div className="explore-card-price">💰 {sitter.pricePerDay} บาท / วัน</div>
                    <div className="explore-card-location">📍 ตำบล{sitter.subdistrict}, {sitter.province}</div>
                    <div className="explore-card-pettype">
                      ประเภทสัตว์ที่รับดูแล &nbsp;
                      <span className="explore-card-pettype-val">{getPetTypeEmoji(sitter.petAlowPet)}</span>
                    </div>
                    <div className="explore-card-divider" />
                    <div className="explore-card-bottom">
                      <span className="explore-card-distance">📍 ห่างจากคุณ {sitter.distance} กิโลเมตร</span>
                      <button className="explore-detail-btn" onClick={() => navigate(`/sitter-profile/${sitter.sitterID}`)}>
                        รายละเอียด
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ปุ่มด้านล่าง */}
          <div className="btn-group" style={{ marginTop: 16 }}>
            <button className="btn btn-back" onClick={() => navigate('/my-pets')}>ย้อนกลับ</button>
            <button className="btn btn-add" onClick={() => navigate('/my-announcements')}>
              + สร้างประกาศ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExploreSitters;