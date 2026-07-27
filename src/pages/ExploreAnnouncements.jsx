import React, { useState, useEffect } from 'react';
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

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const API = 'http://localhost:8096';

function MapPicker({ position, setPosition }) {
  useMapEvents({ click(e) { setPosition([e.latlng.lat, e.latlng.lng]); } });
  return position ? <Marker position={position} /> : null;
}

function ExploreAnnouncements() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const imageUrl = user.sitterImage && user.sitterImage !== 'default.png'
    ? `${API}/api/auth/images/${user.sitterImage}` : null;

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [petTypeFilter, setPetTypeFilter] = useState('ทั้งหมด');
  const [showMap, setShowMap] = useState(false);
  const [pinPosition, setPinPosition] = useState(null);

  // โหลดอัตโนมัติตอนเปิดหน้า
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchAnnouncements(pos.coords.latitude, pos.coords.longitude, 'ทั้งหมด');
      },
      () => {}
    );
  }, []);

  const fetchAnnouncements = async (lat, lng, petType) => {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ lat, lng, radius: 5 });
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
      (pos) => fetchAnnouncements(pos.coords.latitude, pos.coords.longitude, petTypeFilter),
      () => alert('ไม่สามารถดึงตำแหน่งได้')
    );
  };

  const handleSearchByPin = () => {
    if (!pinPosition) { alert('กรุณาปักหมุดตำแหน่งบนแผนที่ก่อนครับ'); return; }
    setShowMap(false);
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
    return Math.max(1, Math.round(diff / (1000*60*60*24)));
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

  const handleLogout = () => { localStorage.removeItem('user'); navigate('/'); };

  return (
    <div className="app-layout">
      <div className="topbar">
        <div className="topbar-left">
          <img src={logo} alt="logo" className="topbar-logo" />
          <div className="topbar-title">ระบบตามหาผู้ดูแลสัตว์เลี้ยง ภายในจังหวัดเชียงใหม่</div>
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
            <a className="menu-item" onClick={() => navigate('/active-jobs')}><span className="menu-icon">⚡</span><span>งานที่กำลังทำ</span></a>
          </div>
          <hr className="menu-divider" />
          <a className="menu-item menu-logout" onClick={handleLogout}><span className="menu-icon">🚪</span><span>ออกจากระบบ</span></a>
        </div>

        <div className="main-content">

          {/* Search Bar */}
          <div className="ea-search-bar">
            <div className="ea-search-input-wrap">
              <span style={{fontSize:16, color:'#aaa'}}>🔍</span>
              <input
                type="text"
                className="ea-search-input"
                placeholder="ค้นหาจากตำบล หรืออำเภอ..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
              <button className="ea-pin-btn" onClick={() => setShowMap(!showMap)} title="ปักหมุดตำแหน่ง">📍</button>
            </div>
            <button className="ea-near-btn" onClick={handleNearMe}>ใกล้ฉัน</button>
            <select className="ea-type-select" value={petTypeFilter} onChange={e => setPetTypeFilter(e.target.value)}>
              <option value="ทั้งหมด">ประเภทสัตว์เลี้ยง</option>
              <option value="ทั้งหมด">ทั้งหมด</option>
              <option value="สุนัข">🐶 สุนัข</option>
              <option value="แมว">🐱 แมว</option>
            </select>
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
              {pinPosition && <p style={{fontSize:11,color:'#8D6E63',marginTop:4}}>📍 {pinPosition[0].toFixed(5)}, {pinPosition[1].toFixed(5)}</p>}
              <button className="ea-search-pin-btn" onClick={handleSearchByPin}>ค้นหาจากตำแหน่งนี้</button>
            </div>
          )}

          {/* ผลลัพธ์ */}
          {loading ? (
            <div className="ea-loading">กำลังค้นหาประกาศ...</div>
          ) : !searched ? (
            <div className="ea-empty">
              <div style={{fontSize:48, marginBottom:12}}>📋</div>
              <p>กดปุ่ม "ใกล้ฉัน" หรือปักหมุดตำแหน่งเพื่อค้นหาประกาศครับ</p>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="ea-empty">
              <div style={{fontSize:48, marginBottom:12}}>😔</div>
              <p>ไม่พบประกาศในรัศมี 5 กิโลเมตรครับ</p>
            </div>
          ) : (
            <div className="ea-grid">
              {filteredAnnouncements.map(ann => {
                const statusStyle = getStatusStyle(ann.status);
                return (
                  <div key={ann.announceID} className="ea-card">
                    <div className="ea-card-header">
                      <span className="ea-postdate">โพสต์: {formatDate(ann.postdate)}</span>
                      <span className="ea-pet-name">{ann.petName}</span>
                      <span className="ea-status-badge" style={{background:statusStyle.bg, color:statusStyle.color, border:`0.5px solid ${statusStyle.border}`}}>
                        {ann.status}
                      </span>
                    </div>
                    <div className="ea-card-img-wrap">
                      {ann.petImage && ann.petImage !== 'default.png'
                        ? <img src={`${API}/api/auth/images/${ann.petImage}`} alt={ann.petName} className="ea-card-img" />
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
                        <span>{ann.gender === 'เพศผู้' ? '♂' : '♀'} {ann.gender}</span>
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
                        <span>{formatDate(ann.startdate)} - {formatDate(ann.enddate)}</span>
                        <span style={{color:'#8D6E63',fontWeight:600}}>&nbsp;{calcDays(ann.startdate, ann.enddate)} วัน</span>
                      </div>
                      {ann.careSlots && ann.careSlots.length > 0 && (
                        <div className="ea-info-row">
                          <span className="ea-lbl">ช่วงเวลา</span>
                          <span>{ann.careSlots.join(', ')}</span>
                        </div>
                      )}
                    </div>
                    <div className="ea-card-footer">
                      <span className="ea-location">📍 {ann.subdistrict}, {ann.district}, {ann.province}</span>
                      <button className="ea-detail-btn" onClick={() => navigate(`/announcement-detail-sitter/${ann.announceID}`)}>
                        รายละเอียด
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{marginTop:16}}>
            <button className="btn btn-back" onClick={() => navigate('/profile-sitter')}>ย้อนกลับ</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExploreAnnouncements;
