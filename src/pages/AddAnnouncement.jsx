import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import './ProfileOwner.css';
import './AddAnnouncement.css';
import logo from '../assets/logo.png';
import NotificationBell from '../components/NotificationBell';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const API = 'http://localhost:8096';

// ข้อมูลอำเภอ-ตำบล-รหัสไปรษณีย์ เชียงใหม่
const CHIANGMAI_DATA = {
  "เมืองเชียงใหม่": { zip: "50000", subdistricts: ["ศรีภูมิ","พระสิงห์","หายยา","ช้างม่อย","ช้างคลาน","วัดเกต","ช้างเผือก","สุเทพ","แม่เหียะ","ป่าแดด","หนองหอย","ฟ้าฮ่าม","ป่าตัน","สันผีเสื้อ"], zips: {"ศรีภูมิ":"50200","พระสิงห์":"50200","หายยา":"50100","ช้างม่อย":"50300","ช้างคลาน":"50100","วัดเกต":"50000","ช้างเผือก":"50300","สุเทพ":"50200","แม่เหียะ":"50100","ป่าแดด":"50100","หนองหอย":"50000","ฟ้าฮ่าม":"50000","ป่าตัน":"50300","สันผีเสื้อ":"50300"} },
  "จอมทอง": { zip: "50160", subdistricts: ["บ้านหลวง","ข่วงเปา","สบเตี๊ยะ","บ้านแปะ","ดอยแก้ว","แม่สอย"] },
  "แม่แจ่ม": { zip: "50270", subdistricts: ["ช่างเคิ่ง","ท่าผา","บ้านทับ","แม่ศึก","ปางหินฝน","กองแขก"] },
  "เชียงดาว": { zip: "50170", subdistricts: ["เชียงดาว","เมืองนะ","เมืองงาย","แม่นะ","เมืองคอง","ปิงโค้ง","ทุ่งข้าวพวง"] },
  "ดอยสะเก็ด": { zip: "50220", subdistricts: ["เชิงดอย","สันปูเลย","ลวงเหนือ","ป่าป้อง","สง่าบ้าน","ตลาดขวัญ","สำราญราษฎร์","แม่คือ","ตลาดใหญ่","แม่ฮ้อยเงิน","แม่โป่ง","ป่าเมี่ยง"] },
  "แม่แตง": { zip: "50150", subdistricts: ["สันมหาพน","แม่แตง","ขี้เหล็ก","ช่อแล","แม่หอพระ","สบเปิง","บ้านเป้า","สันป่ายาง","ป่าแป๋","เมืองก๋าย","อินทขิล","กื้ดช้าง"] },
  "แม่ริม": { zip: "50180", subdistricts: ["ริมใต้","ริมเหนือ","สันโป่ง","ขี้เหล็ก","สะลวง","ห้วยทราย","แม่แรม","โป่งแยง","เหมืองแก้ว","ดอนแก้ว","แม่สา"] },
  "สะเมิง": { zip: "50250", subdistricts: ["สะเมิงใต้","สะเมิงเหนือ","แม่สาบ","บ่อแก้ว","ยั้งเมิน"] },
  "ฝาง": { zip: "50110", subdistricts: ["เวียง","ม่อนปิ่น","แม่งอน","แม่สูน","สันทราย","แม่คะ","โป่งน้ำร้อน","แม่ข่า"] },
  "แม่อาย": { zip: "50280", subdistricts: ["แม่อาย","แม่สาว","สันต้นหมื้อ","แม่นาวาง","ท่าตอน","บ้านหลวง","มะลิกา"] },
  "พร้าว": { zip: "50190", subdistricts: ["เวียง","ทุ่งหลวง","ป่าตุ้ม","น้ำแพร่","เขื่อนผาก","แม่แวน","แม่ปั๋ง","โหล่งขอด","สันทราย"] },
  "สันป่าตอง": { zip: "50120", subdistricts: ["ยุหว่า","สันกลาง","ท่าวังพร้าว","มะขามหลวง","แม่ก๊า","บ้านแม","บ้านกลาง","ทุ่งต้อม","น้ำบ่อหลวง","มะขุนหวาน"] },
  "สันกำแพง": { zip: "50130", subdistricts: ["สันกำแพง","ทรายมูล","ร้องวัวแดง","บวกค้าง","แช่ช้าง","ออนใต้","แม่ปูคา","ห้วยทราย","ต้นเปา","สันกลาง"] },
  "สันทราย": { zip: "50210", subdistricts: ["สันทรายน้อย","สันพระเนตร","สันนาเม็ง","สันป่าเปา","หนองจ๊อม","หนองหาร","แม่แฝก","แม่แฝกใหม่","เมืองเล็น","ป่าไผ่","หนองแหย่ง","สันทรายหลวง"] },
  "หางดง": { zip: "50230", subdistricts: ["หางดง","หนองแก๋ว","หารแก้ว","หนองตอง","ขุนคง","สบแม่ข่า","บ้านแหวน","สันผักหวาน","หนองควาย","บ้านปง","น้ำแพร่"] },
  "ฮอด": { zip: "50240", subdistricts: ["ฮอด","หางดง","บ้านตาล","บ่อหลวง","บ่อสลี","นาคอเรือ"] },
  "ดอยเต่า": { zip: "50260", subdistricts: ["ดอยเต่า","ท่าเดื่อ","มืดกา","บ้านแอ่น","บงตัน"] },
  "อมก๋อย": { zip: "50310", subdistricts: ["อมก๋อย","ยางเปียง","แม่ตื่น","ม่อนจอง","สบโขง","นาเกียน"] },
  "สารภี": { zip: "50140", subdistricts: ["ยางเนิ้ง","สารภี","ชมภู","ไชยสถาน","ขัวมุง","หนองแฝก","หนองผึ้ง","ท่ากว้าง","ดอนแก้ว","ท่าวังตาล","สันทราย","ป่าบง"] },
  "เวียงแหง": { zip: "50350", subdistricts: ["เวียง","เปียงหลวง","แสนไห"] },
  "ไชยปราการ": { zip: "50320", subdistricts: ["ปงตำ","ศรีดงเย็น","แม่ทะลบ","หนองบัว"] },
  "แม่วาง": { zip: "50360", subdistricts: ["บ้านกาด","ทุ่งรวงทอง","แม่วิน","ดอนเปา","ทุ่งปี๊"] },
  "แม่ออน": { zip: "50130", subdistricts: ["ออนเหนือ","ออนกลาง","บ้านสหกรณ์","ห้วยแก้ว","แม่ทา","ทาเหนือ"] },
  "ดอยหล่อ": { zip: "50160", subdistricts: ["ดอยหล่อ","สันติสุข","ยางคราม","สองแคว"] },
  "กัลยาณิวัฒนา": { zip: "50270", subdistricts: ["บ้านจันทร์","แม่แดด","แจ่มหลวง"] },
};

function MapPicker({ position, setPosition }) {
  useMapEvents({ click(e) { setPosition([e.latlng.lat, e.latlng.lng]); } });
  return position ? <Marker position={position} /> : null;
}

function AddAnnouncement() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const imageUrl = user.profileImage && user.profileImage !== 'default.png'
    ? `${API}/api/auth/images/${user.profileImage}` : null;

  // สัตว์เลี้ยง
  const [pets, setPets] = useState([]);
  const [selectedPetID, setSelectedPetID] = useState('');
  const [selectedPet, setSelectedPet] = useState(null);

  // ข้อมูลพื้นฐาน
  const [currentweight, setCurrentweight] = useState('');
  const [startdate, setStartdate] = useState('');
  const [enddate, setEnddate] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const postdate = new Date().toLocaleDateString('th-TH', { day:'2-digit', month:'2-digit', year:'numeric' });

  // ช่วงเวลาดูแล (default: เช้า กลางวัน เย็น)
  const [careMorning, setCareMorning] = useState(true);
  const [careAfternoon, setCareAfternoon] = useState(true);
  const [careEvening, setCareEvening] = useState(true);
  const [careNight, setCareNight] = useState(false);

  // การให้อาหาร (default: เช้า กลางวัน เย็น)
  const [feedMorning, setFeedMorning] = useState(true);
  const [feedAfternoon, setFeedAfternoon] = useState(true);
  const [feedEvening, setFeedEvening] = useState(true);
  const [feedNight, setFeedNight] = useState(false);

  // ปริมาณอาหาร
  const [isFoodPrepared, setIsFoodPrepared] = useState(false);
  const [foodAmount, setFoodAmount] = useState('');

  // บริการเสริม
  const [noMedicine, setNoMedicine] = useState(true);
  const [medicineDetail, setMedicineDetail] = useState('');
  const [isCleanService, setIsCleanService] = useState(false);
  const [isWalkService, setIsWalkService] = useState(false);

  // ที่อยู่
  const [useOwnerAddress, setUseOwnerAddress] = useState(false);
  const [addressNo, setAddressNo] = useState('');
  const [street, setStreet] = useState('');
  const [district, setDistrict] = useState('');
  const [subdistrict, setSubdistrict] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [subdistricts, setSubdistricts] = useState([]);

  // แผนที่
  const [mapPosition, setMapPosition] = useState(null);

  const [errors, setErrors] = useState({});

  // ดึงสัตว์เลี้ยงที่ยังมีชีวิต
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const res = await fetch(`${API}/api/pet/my-pets/${user.ownerID}`);
        const data = await res.json();
        setPets(data.filter(p => !p.isDeceased));
      } catch (err) { console.error(err); }
    };
    if (user.ownerID) fetchPets();
  }, []);

  // เมื่อเลือกสัตว์เลี้ยง
  useEffect(() => {
    if (!selectedPetID) { setSelectedPet(null); return; }
    const pet = pets.find(p => p.petID === parseInt(selectedPetID));
    setSelectedPet(pet || null);
  }, [selectedPetID, pets]);

  // อำเภอเปลี่ยน → โหลดตำบล + รหัสไปรษณีย์
  useEffect(() => {
    if (!district) { setSubdistricts([]); setSubdistrict(''); setZipcode(''); return; }
    const distData = CHIANGMAI_DATA[district];
    if (distData) {
      setSubdistricts(distData.subdistricts);
      setSubdistrict('');
      setZipcode(distData.zip);
    }
  }, [district]);

  // ตำบลเปลี่ยน → รหัสไปรษณีย์เฉพาะตำบล
  useEffect(() => {
    if (!district || !subdistrict) return;
    const distData = CHIANGMAI_DATA[district];
    if (distData?.zips?.[subdistrict]) setZipcode(distData.zips[subdistrict]);
    else if (distData?.zip) setZipcode(distData.zip);
  }, [subdistrict]);

  const calcAge = (dateStr) => {
    if (!dateStr) return '';
    const b = new Date(dateStr), t = new Date();
    const months = (t.getFullYear()-b.getFullYear())*12+(t.getMonth()-b.getMonth());
    if (months < 12) return `${months} เดือน`;
    const y = Math.floor(months/12), m = months%12;
    return m > 0 ? `${y} ปี ${m} เดือน` : `${y} ปี`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
  };

  const getPetEmoji = (typeName) => {
    if (!typeName) return '🐾';
    if (typeName.includes('สุนัข') && !typeName.includes('แมว')) return '🐶';
    if (typeName.includes('แมว') && !typeName.includes('สุนัข')) return '🐱';
    return '🐾';
  };

  // ใช้ที่อยู่เจ้าของ
  const handleUseOwnerAddress = (checked) => {
    setUseOwnerAddress(checked);
    if (checked) {
      setAddressNo(user.addressNo || '');
      setStreet(user.street || '');
      setDistrict(user.district || '');
      setZipcode(user.zipcode || '');
      setTimeout(() => setSubdistrict(user.subdistrict || ''), 150);
      if (user.latitude && user.longitude) {
        setMapPosition([parseFloat(user.latitude), parseFloat(user.longitude)]);
      }
    } else {
      setAddressNo('');
      setStreet('');
      setDistrict('');
      setSubdistrict('');
      setZipcode('');
      setMapPosition(null);
    }
  };

  const validate = () => {
    const e = {};
    const today = new Date().toISOString().split('T')[0];
    
    if (!selectedPetID) e.petID = 'กรุณาเลือกสัตว์เลี้ยง';
    if (!currentweight) e.currentweight = 'กรุณาเลือกน้ำหนักปัจจุบัน';
    if (!startdate) {
      e.startdate = 'กรุณาเลือกวันที่เริ่มดูแล';
    } else if (startdate < today) {
      e.startdate = 'วันที่เริ่มต้องไม่ย้อนหลัง';
    }
    if (!enddate) e.enddate = 'กรุณาเลือกวันที่สิ้นสุดดูแล';
    if (startdate && enddate && enddate < startdate) e.enddate = 'วันสิ้นสุดต้องไม่ก่อนวันเริ่มดูแล';
    if (!careMorning && !careAfternoon && !careEvening && !careNight) e.careTime = 'กรุณาเลือกช่วงเวลาดูแลอย่างน้อย 1 ช่วง';
    if (!isFoodPrepared && !foodAmount.trim()) e.foodAmount = 'กรุณากรอกปริมาณอาหาร';
    if (!noMedicine && !medicineDetail.trim()) e.medicineDetail = 'กรุณากรอกรายละเอียดยา';
    if (!addressNo.trim()) e.addressNo = 'กรุณากรอกบ้านเลขที่';
    if (!district) e.district = 'กรุณาเลือกอำเภอ';
    if (!subdistrict) e.subdistrict = 'กรุณาเลือกตำบล';
    if (!mapPosition) e.mapPosition = 'กรุณาเลือกตำแหน่งจากแผนที่';
    setErrors(e);
    return Object.keys(e).length === 0;
};

  

  const handleSave = async () => {
    if (!validate()) return;
    try {
      const finalAddress = useOwnerAddress ? {
        addressNo: user.addressNo || '',
        street: user.street || '',
        subdistrict: user.subdistrict || '',
        district: user.district || '',
        province: user.province || 'เชียงใหม่',
        zipcode: user.zipcode || '',
        latitude: parseFloat(user.latitude),
        longitude: parseFloat(user.longitude),
      } : {
        addressNo,
        street,
        subdistrict,
        district,
        province: 'เชียงใหม่',
        zipcode,
        latitude: mapPosition ? mapPosition[0] : null,
        longitude: mapPosition ? mapPosition[1] : null,
      };

      const jsonData = {
        ownerID: user.ownerID,
        petID: parseInt(selectedPetID),
        currentweight,
        startdate,
        enddate,
        careMorning, careAfternoon, careEvening, careNight,
        feedMorning, feedAfternoon, feedEvening, feedNight,
        isFoodPrepared,
        foodAmount: isFoodPrepared ? '' : foodAmount,
        medicineDetail: noMedicine ? '' : medicineDetail,
        isCleanService,
        isWalkService,
        ...finalAddress,
      };

      const res = await fetch(`${API}/api/announcement/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      alert('สร้างประกาศเรียบร้อยแล้ว');
      navigate('/my-announcements');
    } catch (err) {
      console.log('ERROR:', err);
      alert('ไม่สามารถสร้างประกาศได้ กรุณาลองใหม่อีกครั้ง');
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
            <a className="menu-item" onClick={() => navigate('/active-jobs')}><span className="menu-icon">⚡</span><span>งานที่กำลังทำ</span></a>
          </div>
          <hr className="menu-divider" />
          <a className="menu-item menu-logout" onClick={handleLogout}><span className="menu-icon">🚪</span><span>ออกจากระบบ</span></a>
        </div>

        <div className="main-content">
          <div className="ann-card">
            <div className="ann-page-title">การสร้างประกาศ</div>

            <div className="ann-grid">

              {/* ========== คอลัมน์ 1: ข้อมูลสัตว์เลี้ยง ========== */}
              <div className="ann-col">
                <div className="ann-sec-title">ข้อมูลสัตว์เลี้ยง</div>

                <div className="ann-field-row">
                  <div className="ann-field">
                    <label>เลือกสัตว์เลี้ยง</label>
                    <select value={selectedPetID} onChange={e => { setSelectedPetID(e.target.value); setErrors(p => ({...p, petID:''})); }}>
                      <option value="">-- เลือก --</option>
                      {pets.map(p => (
                        <option key={p.petID} value={p.petID}>
                          {getPetEmoji(p.petType?.petTypeName)} {p.petName}
                        </option>
                      ))}
                    </select>
                    {errors.petID && <p className="error-msg">{errors.petID}</p>}
                  </div>
                  <div className="ann-field">
                    <label>น้ำหนักปัจจุบัน</label>
                    <select value={currentweight} onChange={e => { setCurrentweight(e.target.value); setErrors(p => ({...p, currentweight:''})); }}>
                      <option value="">-- เลือก --</option>
                      <option value="1-3 กก.">1-3 กก.</option>
                      <option value="4-5 กก.">4-5 กก.</option>
                      <option value="6-10 กก.">6-10 กก.</option>
                      <option value="รับได้ทุกช่วงน้ำหนัก">รับได้ทุกช่วงน้ำหนัก</option>
                    </select>
                    <p className="ann-hint">(โดยประมาณครั้งล่าสุด)</p>
                    {errors.currentweight && <p className="error-msg">{errors.currentweight}</p>}
                  </div>
                </div>

                {/* Preview สัตว์เลี้ยง */}
                {selectedPet && (
                  <div className="ann-pet-preview">
                    <div className="ann-pet-preview-img">
                      {selectedPet.petImage && selectedPet.petImage !== 'default.png'
                        ? <img src={`${API}/api/auth/images/${selectedPet.petImage}`} alt={selectedPet.petName} />
                        : <span>{getPetEmoji(selectedPet.petType?.petTypeName)}</span>
                      }
                    </div>
                    <div className="ann-pet-preview-name">{selectedPet.petName}</div>
                    <div className="ann-pet-preview-info">
                      <span>ประเภทสัตว์ {selectedPet.petType?.petTypeName} {getPetEmoji(selectedPet.petType?.petTypeName)}</span>
                      <span>สายพันธุ์ {selectedPet.breed || '-'}</span>
                      <span>{selectedPet.gender === 'เพศผู้' ? '♂' : '♀'} {selectedPet.gender}</span>
                      <span>วันเกิด {formatDate(selectedPet.birthDate)}&nbsp; อายุ {calcAge(selectedPet.birthDate)} (โดยประมาณ)</span>
                    </div>
                    <button className="ann-pet-detail-btn" onClick={() => navigate(`/pet-detail/${selectedPet.petID}`)}>รายละเอียด</button>
                  </div>
                )}

                {/* วันที่สร้างประกาศ */}
                <div className="ann-postdate">
                  <span>📅</span>
                  <span className="ann-postdate-label">วันที่สร้างประกาศ</span>
                  <span className="ann-postdate-val">{postdate}</span>
                </div>
              </div>

              {/* ========== คอลัมน์ 2: รายละเอียดการดูแล ========== */}
              <div className="ann-col">
                <div className="ann-sec-title">รายละเอียดการดูแล</div>

                <div className="ann-field-row">
                  <div className="ann-field">
                    <label>วันที่เริ่มดูแล</label>
                    <input type="date" value={startdate} min={today} onChange={e => { setStartdate(e.target.value); setErrors(p => ({...p, startdate:''})); }} />
                    {errors.startdate && <p className="error-msg">{errors.startdate}</p>}
                  </div>
                  <div className="ann-field">
                    <label>วันที่สิ้นสุดดูแล</label>
                    <input type="date" value={enddate} min={startdate || today} onChange={e => { setEnddate(e.target.value); setErrors(p => ({...p, enddate:''})); }} />
                    {errors.enddate && <p className="error-msg">{errors.enddate}</p>}
                  </div>
                </div>

                {/* ช่วงเวลาดูแล */}
                <div className="ann-field">
                  <label>ช่วงเวลาการดูแล <span className="ann-sublabel">(เลือกได้มากกว่า 1 ช่วง)</span></label>
                  <div className="ann-cb-list">
                    <label className="ann-cb-item"><input type="checkbox" checked={careMorning} onChange={e => setCareMorning(e.target.checked)} />ช่วงเช้า : 06:00น. - 10:00น.</label>
                    <label className="ann-cb-item"><input type="checkbox" checked={careAfternoon} onChange={e => setCareAfternoon(e.target.checked)} />ช่วงกลางวัน : 11:00น. - 15:00น.</label>
                    <label className="ann-cb-item"><input type="checkbox" checked={careEvening} onChange={e => setCareEvening(e.target.checked)} />ช่วงเย็น : 16:00น. - 20:00น.</label>
                    <label className="ann-cb-item"><input type="checkbox" checked={careNight} onChange={e => setCareNight(e.target.checked)} />ช่วงดึก : 21:00น. - 24:00น.</label>
                  </div>
                  {errors.careTime && <p className="error-msg">{errors.careTime}</p>}
                </div>

                {/* การให้อาหาร */}
                <div className="ann-field">
                  <label>การให้อาหาร</label>
                  <div className="ann-cb-list">
                    <label className="ann-cb-item"><input type="checkbox" checked={feedMorning} onChange={e => setFeedMorning(e.target.checked)} />ช่วงเช้า : 06:00น. - 10:00น.</label>
                    <label className="ann-cb-item"><input type="checkbox" checked={feedAfternoon} onChange={e => setFeedAfternoon(e.target.checked)} />ช่วงกลางวัน : 11:00น. - 15:00น.</label>
                    <label className="ann-cb-item"><input type="checkbox" checked={feedEvening} onChange={e => setFeedEvening(e.target.checked)} />ช่วงเย็น : 16:00น. - 20:00น.</label>
                    <label className="ann-cb-item"><input type="checkbox" checked={feedNight} onChange={e => setFeedNight(e.target.checked)} />ช่วงดึก : 21:00น. - 24:00น.</label>
                  </div>
                </div>

                {/* ปริมาณอาหาร */}
                <div className="ann-field">
                  <label>ปริมาณอาหาร</label>
                  <label className="ann-cb-item" style={{marginBottom:6}}>
                    <input type="checkbox" checked={isFoodPrepared} onChange={e => { setIsFoodPrepared(e.target.checked); if(e.target.checked) setFoodAmount(''); }} />
                    จัดเตรียมไว้ให้แล้ว
                  </label>
                  {!isFoodPrepared && (
                    <div className="ann-sub-box">
                      <label>ปริมาณ ต่อมื้อ <span style={{color:'#dc2626'}}>*</span></label>
                      <input type="text" value={foodAmount} onChange={e => { setFoodAmount(e.target.value); setErrors(p => ({...p, foodAmount:''})); }} placeholder="กรอกปริมาณอาหาร" />
                      {errors.foodAmount && <p className="error-msg">{errors.foodAmount}</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* ========== คอลัมน์ 3: บริการเสริม + ที่อยู่ ========== */}
              <div className="ann-col">
                <div className="ann-sec-title">บริการเสริม</div>

                {/* การป้อนยา */}
                <div className="ann-field">
                  <label>การป้อนยา</label>
                  <label className="ann-cb-item" style={{marginBottom:6}}>
                    <input type="checkbox" checked={noMedicine} onChange={e => { setNoMedicine(e.target.checked); if(e.target.checked) setMedicineDetail(''); }} />
                    ไม่มีการป้อนยา
                  </label>
                  {!noMedicine && (
                    <div className="ann-sub-box">
                      <label>ระบุรายละเอียด <span style={{color:'#dc2626'}}>*</span></label>
                      <textarea value={medicineDetail} onChange={e => { setMedicineDetail(e.target.value); setErrors(p => ({...p, medicineDetail:''})); }} placeholder="กรอกรายละเอียดยาที่ต้องป้อน" />
                      {errors.medicineDetail && <p className="error-msg">{errors.medicineDetail}</p>}
                    </div>
                  )}
                </div>

                <div className="ann-field" style={{marginBottom:14}}>
                  <div className="ann-cb-list">
                    <label className="ann-cb-item"><input type="checkbox" checked={isCleanService} onChange={e => setIsCleanService(e.target.checked)} />เก็บ อึ อี</label>
                    <label className="ann-cb-item"><input type="checkbox" checked={isWalkService} onChange={e => setIsWalkService(e.target.checked)} />พาเดินเล่น</label>
                  </div>
                </div>

                <div className="ann-sec-title">ที่อยู่</div>

                {/* เลือกที่อยู่ */}
                <div className="ann-address-choice">
                  <label className="ann-cb-item">
                    <input
                      type="checkbox"
                      checked={useOwnerAddress}
                      onChange={e => handleUseOwnerAddress(e.target.checked)}
                    />
                    ใช้ที่อยู่ของฉัน (ที่อยู่จากโปรไฟล์)
                  </label>
                </div>

                {!useOwnerAddress && (
                  <>
                    <div className="ann-field-row">
                      <div className="ann-field">
                        <label>บ้านเลขที่</label>
                        <input type="text" value={addressNo} onChange={e => { setAddressNo(e.target.value); setErrors(p => ({...p, addressNo:''})); }} placeholder="เช่น 239/1" />
                        {errors.addressNo && <p className="error-msg">{errors.addressNo}</p>}
                      </div>
                      <div className="ann-field">
                        <label>ถนน/เขต</label>
                        <input type="text" value={street} onChange={e => setStreet(e.target.value)} placeholder="-" />
                      </div>
                    </div>

                    <div className="ann-field-row">
                      <div className="ann-field">
                        <label>จังหวัด</label>
                        <input type="text" value="เชียงใหม่" disabled style={{background:'#f5f5f5',color:'#999'}} />
                      </div>
                      <div className="ann-field">
                        <label>อำเภอ</label>
                        <select value={district} onChange={e => { setDistrict(e.target.value); setErrors(p => ({...p, district:''})); }}>
                          <option value="">-- เลือก --</option>
                          {Object.keys(CHIANGMAI_DATA).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        {errors.district && <p className="error-msg">{errors.district}</p>}
                      </div>
                    </div>

                    <div className="ann-field-row">
                      <div className="ann-field">
                        <label>ตำบล</label>
                        <select value={subdistrict} onChange={e => { setSubdistrict(e.target.value); setErrors(p => ({...p, subdistrict:''})); }} disabled={!district}>
                          <option value="">-- เลือก --</option>
                          {subdistricts.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {errors.subdistrict && <p className="error-msg">{errors.subdistrict}</p>}
                      </div>
                      <div className="ann-field">
                        <label>รหัสไปรษณีย์</label>
                        <input type="text" value={zipcode} disabled style={{background:'#f5f5f5',color:'#999'}} />
                      </div>
                    </div>

                    {/* แผนที่ */}
                    <div className="ann-field">
                      <label className="ann-map-label">
                        <span>📍</span> เลือกตำแหน่งจากแผนที่ <span style={{color:'#dc2626'}}>*</span>
                      </label>
                      <div className="ann-map-box">
                        <MapContainer center={[18.7883, 98.9853]} zoom={11} style={{width:'100%',height:'100%'}}>
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                          <MapPicker position={mapPosition} setPosition={(pos) => { setMapPosition(pos); setErrors(p => ({...p, mapPosition:''})); }} />
                        </MapContainer>
                      </div>
                      {mapPosition && (
                        <p className="ann-map-hint">📍 {mapPosition[0].toFixed(5)}, {mapPosition[1].toFixed(5)}</p>
                      )}
                      {errors.mapPosition && <p className="error-msg">{errors.mapPosition}</p>}
                    </div>
                  </>
                )}

                {/* แสดงที่อยู่ที่เลือกเมื่อติ๊กใช้ที่อยู่ของฉัน */}
                {useOwnerAddress && (
                  <div className="ann-owner-address-preview">
                    <div className="ann-owner-address-row">
                      <span className="ann-owner-address-label">บ้านเลขที่ : </span>
                      <span>{user.addressNo || '-'} {user.street ? `ถนน ${user.street}` : ''}</span>
                    </div>
                    <div className="ann-owner-address-row">
                      <span className="ann-owner-address-label">ตำบล : </span>
                      <span>{user.subdistrict} อำเภอ {user.district} จังหวัด {user.province} {user.zipcode}</span>
                    </div>
                    {user.latitude && user.longitude && (
                      <div className="ann-owner-address-row">
                        <span>📍 </span>
                        <span style={{color:'#8D6E63',fontSize:12}}>{parseFloat(user.latitude).toFixed(5)}, {parseFloat(user.longitude).toFixed(5)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ปุ่ม */}
            <div className="btn-group" style={{marginTop:16}}>
              <button className="btn btn-back" onClick={() => navigate('/my-announcements')}>ย้อนกลับ</button>
              <button className="btn-save" onClick={handleSave}>บันทึก</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddAnnouncement;