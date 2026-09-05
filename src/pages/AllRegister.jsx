import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import './AllRegister.css';
import logo from '../assets/logo.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

import { API_BASE_URL as API } from '../config';

const amphoeData = {
  'เมืองเชียงใหม่': { 'ช้างม่อย':'50300','ช้างคลาน':'50100','วัดเกต':'50000','ช้างเผือก':'50300','สุเทพ':'50200','แม่เหียะ':'50100','ป่าแดด':'50100','หนองหอย':'50000','ท่าศาลา':'50000','หนองป่าครั่ง':'50000','ฟ้าฮ่าม':'50000','ป่าตัน':'50300','สันผีเสื้อ':'50300','ศรีภูมิ':'50200','พระสิงห์':'50200','หายยา':'50100' },
  'จอมทอง': { 'บ้านหลวง':'50160','ข่วงเปา':'50160','สบเตี๊ยะ':'50160','บ้านแปะ':'50240','ดอยแก้ว':'50160','แม่สอย':'50240' },
  'แม่แจ่ม': { 'ช่างเคิ่ง':'50270','ท่าผา':'50270','บ้านทับ':'50270','แม่ศึก':'50270','แม่นาจร':'50270','บ้านจันทร์':'58130','ปางหินฝน':'50270','กองแขก':'50270','แม่แดด':'58130','แจ่มหลวง':'58130' },
  'เชียงดาว': { 'เชียงดาว':'50170','เมืองนะ':'50170','เมืองงาย':'50170','แม่นะ':'50170','เมืองคอง':'50170','ปิงโค้ง':'50170','ทุ่งข้าวพวง':'50170' },
  'ดอยสะเก็ด': { 'เชิงดอย':'50220','สันปูเลย':'50220','ลวงเหนือ':'50220','ป่าป้อง':'50220','สง่าบ้าน':'50220','ป่าลาน':'50220','ตลาดขวัญ':'50220','สำราญราษฎร์':'50220','แม่คือ':'50220','ตลาดใหญ่':'50220','แม่ฮ้อยเงิน':'50220','แม่โป่ง':'50220','ป่าเมี่ยง':'50220','เทพเสด็จ':'50220' },
  'แม่แตง': { 'สันมหาพน':'50150','แม่แตง':'50150','ขี้เหล็ก':'50150','ช่อแล':'50150','แม่หอพระ':'50150','สบเปิง':'50150','บ้านเป้า':'50150','สันป่ายาง':'50330','ป่าแป๋':'50150','เมืองก๋าย':'50150','บ้านช้าง':'50150','กื้ดช้าง':'50150','อินทขิล':'50150','สมก๋าย':'50150' },
  'แม่ริม': { 'ริมใต้':'50180','ริมเหนือ':'50180','สันโป่ง':'50180','ขี้เหล็ก':'50180','สะลวง':'50330','ห้วยทราย':'50180','แม่แรม':'50180','โป่งแยง':'50180','แม่สา':'50180','ดอนแก้ว':'50180','เหมืองแก้ว':'50180' },
  'สะเมิง': { 'สะเมิงใต้':'50250','สะเมิงเหนือ':'50250','แม่สาบ':'50250','บ่อแก้ว':'50250','ยั้งเมิน':'50250' },
  'ฝาง': { 'เวียง':'50110','ม่อนปิ่น':'50110','แม่งอน':'50320','แม่สูน':'50110','สันทราย':'50110','แม่คะ':'50110','แม่ข่า':'50320','โป่งน้ำร้อน':'50110' },
  'แม่อาย': { 'แม่อาย':'50280','แม่สาว':'50280','สันต้นหมื้อ':'50280','แม่นาวาง':'50280','ท่าตอน':'50280','บ้านหลวง':'50280','มะลิกา':'50280' },
  'พร้าว': { 'เวียง':'50190','ทุ่งหลวง':'50190','ป่าตุ้ม':'50190','ป่าไหน่':'50190','สันทราย':'50190','บ้านโป่ง':'50190','น้ำแพร่':'50190','เขื่อนผาก':'50190','แม่แวน':'50190','แม่ปั๋ง':'50190','โหล่งขอด':'50190' },
  'สันป่าตอง': { 'ยุหว่า':'50120','สันกลาง':'50120','ท่าวังพร้าว':'50120','มะขามหลวง':'50120','แม่ก๊า':'50120','บ้านแม':'50120','บ้านกลาง':'50120','ทุ่งสะโตก':'50120','ทุ่งต้อม':'50120','น้ำบ่อหลวง':'50120','มะขุนหวาน':'50120' },
  'สันกำแพง': { 'สันกำแพง':'50130','ทรายมูล':'50130','ร้องวัวแดง':'50130','บวกค้าง':'50130','แช่ช้าง':'50130','ออนใต้':'50130','แม่ปูคา':'50130','ห้วยทราย':'50130','ต้นเปา':'50130','สันกลาง':'50130' },
  'สันทราย': { 'สันทรายหลวง':'50210','สันทรายน้อย':'50210','สันพระเนตร':'50210','สันนาเม็ง':'50210','สันป่าเปา':'50210','หนองแหย่ง':'50210','หนองจ๊อม':'50210','หนองหาร':'50290','แม่แฝก':'50290','แม่แฝกใหม่':'50290','เมืองเล็น':'50210','ป่าไผ่':'50210' },
  'หางดง': { 'หางดง':'50230','หนองแก๋ว':'50230','หารแก้ว':'50230','หนองตอง':'50340','ขุนคง':'50230','สบแม่ข่า':'50230','บ้านแหวน':'50230','สันผักหวาน':'50230','หนองควาย':'50230','บ้านปง':'50230','น้ำแพร่':'50230' },
  'ฮอด': { 'หางดง':'50240','ฮอด':'50240','บ้านตาล':'50240','บ่อหลวง':'50240','บ่อสลี':'50240','นาคอเรือ':'50240' },
  'ดอยเต่า': { 'ดอยเต่า':'50260','ท่าเดื่อ':'50260','มืดกา':'50260','บ้านแอ่น':'50260','บงตัน':'50260','โปงทุ่ง':'50260' },
  'อมก๋อย': { 'อมก๋อย':'50310','ยางเปียง':'50310','แม่ตื่น':'50310','ม่อนจอง':'50310','สบโขง':'50310','นาเกียน':'50310' },
  'สารภี': { 'ยางเนิ้ง':'50140','สารภี':'50140','ชมภู':'50140','ไชยสถาน':'50140','ขัวมุง':'50140','หนองแฝก':'50140','หนองผึ้ง':'50140','ท่ากว้าง':'50140','ดอนแก้ว':'50140','ท่าวังตาล':'50140','สันทราย':'50140','ป่าบง':'50140' },
  'เวียงแหง': { 'เมืองแหง':'50350','เปียงหลวง':'50350','แสนไห':'50350' },
  'ไชยปราการ': { 'ปงตำ':'50320','ศรีดงเย็น':'50320','แม่ทะลบ':'50320','หนองบัว':'50320' },
  'แม่วาง': { 'บ้านกาด':'50360','ทุ่งปี้':'50360','ทุ่งรวงทอง':'50360','แม่วิน':'50360','ดอนเปา':'50360' },
  'แม่ออน': { 'ออนเหนือ':'50130','ออนกลาง':'50130','บ้านสหกรณ์':'50130','ห้วยแก้ว':'50130','แม่ทา':'50130','ทาเหนือ':'50130' },
  'ดอยหล่อ': { 'ดอยหล่อ':'50160','สองแคว':'50160','ยางคราม':'50160','สันติสุข':'50160' },
};

function MapPicker({ position, setPosition, setLocationText }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=th`)
        .then(r => r.json()).then(d => setLocationText(d.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`))
        .catch(() => setLocationText(`${lat.toFixed(5)}, ${lng.toFixed(5)}`));
    },
  });
  return position ? <Marker position={position} /> : null;
}

// =================== ฟอร์มเจ้าของสัตว์เลี้ยง ===================
const OwnerForm = forwardRef(({ submitting, setSubmitting }, ref) => {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [profileImage, setProfileImage] = useState(null);
  const [profileFileName, setProfileFileName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [addressNo, setAddressNo] = useState('');
  const [street, setStreet] = useState('');
  const [amphoe, setAmphoe] = useState('');
  const [tambon, setTambon] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [mapPosition, setMapPosition] = useState(null);
  const [locationText, setLocationText] = useState('');
  const [errors, setErrors] = useState({});
  const [showPwHint, setShowPwHint] = useState(false);

  const maxBirthDate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  })();

  useEffect(() => {
    if (!birthDate) { setAge(''); return; }
    const t = new Date(), b = new Date(birthDate);
    let a = t.getFullYear() - b.getFullYear();
    const m = t.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
    setAge(a >= 0 ? a : '');
  }, [birthDate]);

  useEffect(() => { setTambon(''); setZipCode(''); }, [amphoe]);
  useEffect(() => {
    if (amphoe && tambon && amphoeData[amphoe]?.[tambon]) setZipCode(amphoeData[amphoe][tambon]);
  }, [amphoe, tambon]);

  const handleImage = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const allowed = ['image/png','image/jpeg','image/jpg'];
    if (!allowed.includes(file.type)) { setErrors(p => ({...p, profileImage:'รองรับเฉพาะไฟล์ .png .jpg .jpeg'})); return; }
    if (file.size > 3*1024*1024) { setErrors(p => ({...p, profileImage:'รูปต้องมีขนาดไม่เกิน 3MB'})); return; }
    setProfileImage(URL.createObjectURL(file));
    setProfileFileName(file.name);
    setErrors(p => ({...p, profileImage:''}));
  };

  const handleGPS = () => {
    if (!navigator.geolocation) { alert('เบราว์เซอร์ไม่รองรับ GPS'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setMapPosition([lat, lng]);
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=th`)
          .then(r => r.json()).then(d => setLocationText(d.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`))
          .catch(() => setLocationText(`${lat.toFixed(5)}, ${lng.toFixed(5)}`));
        setErrors(p => ({...p, map:''}));
      },
      () => alert('ไม่สามารถดึงตำแหน่งได้ กรุณาอนุญาตการเข้าถึง GPS')
    );
  };

  const validate = () => {
    const e = {};
    const thaiOnly = /^[\u0E00-\u0E7F]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passRegex = /^[a-zA-Z0-9!#_.]+$/;
    if (!fileRef.current?.files[0]) e.profileImage = 'กรุณาอัพโหลดรูปโปรไฟล์';
    if (!firstName.trim()) e.firstName = 'กรุณากรอกชื่อ';
    else if (!thaiOnly.test(firstName)) e.firstName = 'ชื่อต้องเป็นภาษาไทยเท่านั้น';
    else if (firstName.length < 2 || firstName.length > 16) e.firstName = 'ชื่อต้องมี 2-16 ตัวอักษร';
    if (!lastName.trim()) e.lastName = 'กรุณากรอกนามสกุล';
    else if (!thaiOnly.test(lastName)) e.lastName = 'นามสกุลต้องเป็นภาษาไทยเท่านั้น';
    else if (lastName.length < 2 || lastName.length > 16) e.lastName = 'นามสกุลต้องมี 2-16 ตัวอักษร';
    if (!gender) e.gender = 'กรุณาเลือกเพศ';
    if (!birthDate) e.birthDate = 'กรุณาเลือกวันเกิด';
    else if (age < 18) e.birthDate = 'ต้องมีอายุอย่างน้อย 18 ปี';
    if (!phone) e.phone = 'กรุณากรอกหมายเลขโทรศัพท์';
    else if (!/^\d{10}$/.test(phone)) e.phone = 'หมายเลขโทรศัพท์ต้องเป็นตัวเลข 10 หลัก';
    if (!email.trim()) e.email = 'กรุณากรอกอีเมล';
    else if (!emailRegex.test(email)) e.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    if (!password) e.password = 'กรุณากรอกรหัสผ่าน';
    else if (password.length < 8 || password.length > 15) e.password = 'รหัสผ่านต้องมี 8-15 ตัวอักษร';
    else if (!passRegex.test(password)) e.password = 'รูปแบบรหัสผ่านไม่ถูกต้อง';
    if (!confirmPassword) e.confirmPassword = 'กรุณายืนยันรหัสผ่าน';
    else if (confirmPassword !== password) e.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    if (!addressNo.trim()) e.addressNo = 'กรุณากรอกบ้านเลขที่';
    if (!amphoe) e.amphoe = 'กรุณาเลือกอำเภอ';
    if (!tambon) e.tambon = 'กรุณาเลือกตำบล';
    if (!mapPosition) e.map = 'กรุณาเลือกตำแหน่งจากแผนที่';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/auth/register-owner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstname: firstName, lastname: lastName, gender,
          birtdate: birthDate, phoneNumber: phone, email, password,
          addressNo, street: street || '-',
          subdistrict: tambon, district: amphoe, province: 'เชียงใหม่',
          zipcode: zipCode, latitude: mapPosition[0], longitude: mapPosition[1],
        }),
      });
      let data = {};
      try { data = await res.json(); } catch { data = {}; }
      if (!res.ok) { alert(data.message || 'ไม่สามารถลงทะเบียนได้'); return; }

      const form = new FormData();
      form.append('ownerID', data.ownerID);
      form.append('profileImage', fileRef.current.files[0]);
      const uploadRes = await fetch(`${API}/api/auth/upload-owner-image`, { method: 'POST', body: form });
      if (!uploadRes.ok) {
        console.error('อัปโหลดรูปภาพไม่สำเร็จ');
      }

      alert('ลงทะเบียนเรียบร้อยแล้ว กรุณาเข้าสู่ระบบเพื่อเริ่มใช้งาน');
      navigate('/login');
    } catch {
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally { setSubmitting(false); }
  };

  useImperativeHandle(ref, () => ({ submit: handleSubmit }));

  return (
    <div className="ar-form-wrapper">
      <div className="ar-form-title ar-owner">ลงทะเบียน เจ้าของสัตว์เลี้ยง</div>

      {/* รูปโปรไฟล์ + ข้อมูลส่วนตัว */}
      <div className="ar-profile-section">
        <div className="ar-profile-upload">
          <div className="ar-profile-preview" onClick={() => fileRef.current.click()}>
            {profileImage ? <img src={profileImage} alt="profile" /> : <span style={{fontSize:36,color:'#aaa'}}>👤</span>}
            <div className="ar-plus-icon ar-owner-plus">+</div>
          </div>
          <input type="file" ref={fileRef} style={{display:'none'}} accept=".png,.jpg,.jpeg" onChange={handleImage} />
          <button className="ar-upload-btn" onClick={() => fileRef.current.click()}>เลือกไฟล์</button>
          <p className="ar-file-hint">.png .jpg .jpeg / ไม่เกิน 3MB</p>
          {profileFileName && (
            <div className="ar-file-name-box">
              <span>{profileFileName}</span>
              <button className="ar-file-remove" onClick={() => { setProfileImage(null); setProfileFileName(''); fileRef.current.value = ''; }}>✕</button>
            </div>
          )}
          {errors.profileImage && <p className="ar-error">{errors.profileImage}</p>}
        </div>

        <div className="ar-info-grid">
          <div className="ar-section-label">ข้อมูลส่วนตัว</div>
          <div style={{display:'flex', gap:10, alignItems:'flex-start'}}>
            <div className="ar-field" style={{flex:1}}>
              <label>ชื่อ <span className="ar-req">*</span></label>
              <input type="text" value={firstName} placeholder="กรอกชื่อ" onChange={e => { setFirstName(e.target.value); setErrors(p => ({...p, firstName:''})); }} />
              {errors.firstName && <p className="ar-error">{errors.firstName}</p>}
            </div>
            <div className="ar-field" style={{flex:1}}>
              <label>นามสกุล <span className="ar-req">*</span></label>
              <input type="text" value={lastName} placeholder="กรอกนามสกุล" onChange={e => { setLastName(e.target.value); setErrors(p => ({...p, lastName:''})); }} />
              {errors.lastName && <p className="ar-error">{errors.lastName}</p>}
            </div>
            <div className="ar-field" style={{flexShrink:0}}>
              <label>เพศ <span className="ar-req">*</span></label>
              <select value={gender} style={{width:'auto'}} onChange={e => { setGender(e.target.value); setErrors(p => ({...p, gender:''})); }}>
                <option value="">-- เลือกเพศ --</option>
                <option value="ชาย">♂ เพศชาย</option>
                <option value="หญิง">♀ เพศหญิง</option>
              </select>
              {errors.gender && <p className="ar-error">{errors.gender}</p>}
            </div>
          </div>
          <div className="ar-row-3">
            <div className="ar-field">
              <label>วันเกิด <span className="ar-req">*</span></label>
              <input type="date" value={birthDate} max={maxBirthDate} onChange={e => { setBirthDate(e.target.value); setErrors(p => ({...p, birthDate:''})); }} />
              {age !== '' && <p style={{fontSize:11,color:'#7FB3D9',fontWeight:500,margin:'2px 0 0 0'}}>อายุ {age} ปี</p>}
              {errors.birthDate && <p className="ar-error">{errors.birthDate}</p>}
            </div>
            <div className="ar-field">
              <label>โทรศัพท์ <span className="ar-req">*</span></label>
              <input type="text" value={phone} placeholder="0xx-xxxxxxx" maxLength={10} onChange={e => { setPhone(e.target.value); setErrors(p => ({...p, phone:''})); }} />
              {errors.phone && <p className="ar-error">{errors.phone}</p>}
            </div>
            <div className="ar-field">
              <label>อีเมล <span className="ar-req">*</span></label>
              <input type="email" value={email} placeholder="email@example.com" onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email:''})); }} />
              {errors.email && <p className="ar-error">{errors.email}</p>}
            </div>
          </div>
          <div className="ar-row-2">
            <div className="ar-field" style={{position:'relative'}}>
              <label>รหัสผ่าน <span className="ar-req">*</span></label>
              <input type="password" value={password} placeholder="8-15 ตัวอักษร"
                onFocus={() => setShowPwHint(true)}
                onBlur={() => setShowPwHint(false)}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password:''})); }} />
              {showPwHint && (
                <div style={{position:'absolute',top:'100%',left:0,marginTop:4,background:'#fff',border:'0.5px solid #d6e7f2',borderRadius:8,padding:'8px 12px',fontSize:11,color:'#1a1a1a',boxShadow:'0 4px 12px rgba(0,0,0,0.1)',zIndex:10,whiteSpace:'nowrap',lineHeight:1.9}}>
                  ✅ ตัวอักษรภาษาอังกฤษหรือตัวเลข<br />
                  ✅ อักษรพิเศษ [! # _ .] ได้<br />
                  ✅ ความยาว 8-15 ตัวอักษร
                </div>
              )}
              {errors.password && <p className="ar-error">{errors.password}</p>}
            </div>
            <div className="ar-field">
              <label>ยืนยันรหัสผ่าน <span className="ar-req">*</span></label>
              <input type="password" value={confirmPassword} placeholder="กรอกอีกครั้ง" onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({...p, confirmPassword:''})); }} />
              {errors.confirmPassword && <p className="ar-error">{errors.confirmPassword}</p>}
            </div>
          </div>
        </div>
      </div>

      <hr className="ar-divider" />

      {/* ที่อยู่ */}
      <div className="ar-section-label">ที่อยู่</div>
      <div className="ar-address-section">
        <div className="ar-address-fields">
          <div className="ar-row-2">
            <div className="ar-field">
              <label>บ้านเลขที่ <span className="ar-req">*</span></label>
              <input type="text" value={addressNo} placeholder="เช่น 239/1" onChange={e => { setAddressNo(e.target.value); setErrors(p => ({...p, addressNo:''})); }} />
              {errors.addressNo && <p className="ar-error">{errors.addressNo}</p>}
            </div>
            <div className="ar-field">
              <label>ถนน/เขต <span style={{color:'#aaa',fontSize:11}}>(ไม่บังคับ)</span></label>
              <input type="text" value={street} placeholder="-" onChange={e => setStreet(e.target.value)} />
            </div>
          </div>
          <div className="ar-row-3">
            <div className="ar-field">
              <label>จังหวัด</label>
              <input type="text" value="เชียงใหม่" disabled style={{background:'#f5f5f5',color:'#999'}} />
            </div>
            <div className="ar-field">
              <label>อำเภอ <span className="ar-req">*</span></label>
              <select value={amphoe} onChange={e => { setAmphoe(e.target.value); setErrors(p => ({...p, amphoe:''})); }}>
                <option value="">-- เลือกอำเภอ --</option>
                {Object.keys(amphoeData).map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              {errors.amphoe && <p className="ar-error">{errors.amphoe}</p>}
            </div>
            <div className="ar-field">
              <label>ตำบล <span className="ar-req">*</span></label>
              <select value={tambon} onChange={e => { setTambon(e.target.value); setErrors(p => ({...p, tambon:''})); }} disabled={!amphoe}>
                <option value="">-- เลือกตำบล --</option>
                {amphoe && Object.keys(amphoeData[amphoe] || {}).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.tambon && <p className="ar-error">{errors.tambon}</p>}
            </div>
          </div>
          <div className="ar-field" style={{maxWidth:160}}>
            <label>รหัสไปรษณีย์</label>
            <input type="text" value={zipCode} disabled style={{background:'#f5f5f5',color:'#999'}} />
          </div>
        </div>

        <div className="ar-map-section">
          <div className="ar-map-label-row">
            <span>เลือกตำแหน่งจากแผนที่ <span className="ar-req">*</span></span>
            <button className="ar-gps-btn ar-owner-gps" onClick={handleGPS}>📍 ใช้ตำแหน่งปัจจุบัน</button>
          </div>
          <p className="ar-map-hint">กรุณากด GPS หรือปักหมุดให้ตรงที่อยู่ของคุณ</p>
          <div className="ar-map-box">
            <MapContainer center={mapPosition || [18.7883, 98.9853]} zoom={mapPosition ? 14 : 11} style={{width:'100%',height:'100%'}}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
              <MapPicker position={mapPosition} setPosition={(p) => { setMapPosition(p); setErrors(e => ({...e, map:''})); }} setLocationText={setLocationText} />
            </MapContainer>
          </div>
          {locationText && <p className="ar-location-text">📍 {locationText}</p>}
          {errors.map && <p className="ar-error">{errors.map}</p>}
        </div>
      </div>
    </div>
  );
});

// =================== ฟอร์มผู้ดูแลสัตว์เลี้ยง ===================
const SitterForm = forwardRef(({ submitting, setSubmitting }, ref) => {
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const qrRef = useRef(null);

  const [profileImage, setProfileImage] = useState(null);
  const [profileFileName, setProfileFileName] = useState('');
  const [profileFile, setProfileFile] = useState(null);
  const [qrImage, setQrImage] = useState(null);
  const [qrFileName, setQrFileName] = useState('');
  const [qrFile, setQrFile] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [addressNo, setAddressNo] = useState('');
  const [street, setStreet] = useState('');
  const [amphoe, setAmphoe] = useState('');
  const [tambon, setTambon] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [mapPosition, setMapPosition] = useState(null);
  const [locationText, setLocationText] = useState('');
  const [petType, setPetType] = useState('');
  const [petWeight, setPetWeight] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [experience, setExperience] = useState('');
  const [rate, setRate] = useState('');
  const [services, setServices] = useState([]);
  const [bank, setBank] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [accountName, setAccountName] = useState('');
  const [errors, setErrors] = useState({});
  const [showPwHint, setShowPwHint] = useState(false);

  const maxBirthDate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  })();

  useEffect(() => {
    if (!birthDate) { setAge(''); return; }
    const t = new Date(), b = new Date(birthDate);
    let a = t.getFullYear() - b.getFullYear();
    const m = t.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
    setAge(a >= 0 ? a : '');
  }, [birthDate]);

  useEffect(() => { setTambon(''); setZipCode(''); }, [amphoe]);
  useEffect(() => {
    if (amphoe && tambon && amphoeData[amphoe]?.[tambon]) setZipCode(amphoeData[amphoe][tambon]);
  }, [amphoe, tambon]);

  const handleProfileImage = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const allowed = ['image/png','image/jpeg','image/jpg'];
    if (!allowed.includes(file.type)) { setErrors(p => ({...p, profileImage:'รองรับเฉพาะไฟล์ .png .jpg .jpeg'})); return; }
    if (file.size > 3*1024*1024) { setErrors(p => ({...p, profileImage:'รูปต้องมีขนาดไม่เกิน 3MB'})); return; }
    setProfileImage(URL.createObjectURL(file)); setProfileFileName(file.name); setProfileFile(file);
    setErrors(p => ({...p, profileImage:''}));
  };

  const handleQrImage = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const allowed = ['image/png','image/jpeg','image/jpg'];
    if (!allowed.includes(file.type)) { setErrors(p => ({...p, qrImage:'รองรับเฉพาะไฟล์ .png .jpg .jpeg'})); return; }
    if (file.size > 5*1024*1024) { setErrors(p => ({...p, qrImage:'รูปต้องมีขนาดไม่เกิน 5MB'})); return; }
    setQrImage(URL.createObjectURL(file)); setQrFileName(file.name); setQrFile(file);
    setErrors(p => ({...p, qrImage:''}));
  };

  const handleGPS = () => {
    if (!navigator.geolocation) { alert('เบราว์เซอร์ไม่รองรับ GPS'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setMapPosition([lat, lng]);
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=th`)
          .then(r => r.json()).then(d => setLocationText(d.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`))
          .catch(() => setLocationText(`${lat.toFixed(5)}, ${lng.toFixed(5)}`));
        setErrors(p => ({...p, map:''}));
      },
      () => alert('ไม่สามารถดึงตำแหน่งได้ กรุณาอนุญาตการเข้าถึง GPS')
    );
  };

  const toggleTime = (val) => setTimeSlots(p => p.includes(val) ? p.filter(v => v !== val) : [...p, val]);
  const toggleService = (val) => setServices(p => p.includes(val) ? p.filter(v => v !== val) : [...p, val]);

  const validate = () => {
    const e = {};
    const thaiOnly = /^[\u0E00-\u0E7F]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passRegex = /^[a-zA-Z0-9!#_.]+$/;
    if (!profileFile) e.profileImage = 'กรุณาอัพโหลดรูปโปรไฟล์';
    if (!firstName.trim()) e.firstName = 'กรุณากรอกชื่อ';
    else if (!thaiOnly.test(firstName)) e.firstName = 'ชื่อต้องเป็นภาษาไทยเท่านั้น';
    if (!lastName.trim()) e.lastName = 'กรุณากรอกนามสกุล';
    else if (!thaiOnly.test(lastName)) e.lastName = 'นามสกุลต้องเป็นภาษาไทยเท่านั้น';
    if (!gender) e.gender = 'กรุณาเลือกเพศ';
    if (!birthDate) e.birthDate = 'กรุณาเลือกวันเกิด';
    else if (age < 18) e.birthDate = 'ต้องมีอายุอย่างน้อย 18 ปี';
    if (!phone) e.phone = 'กรุณากรอกหมายเลขโทรศัพท์';
    else if (!/^\d{10}$/.test(phone)) e.phone = 'หมายเลขโทรศัพท์ต้องเป็นตัวเลข 10 หลัก';
    if (!email.trim()) e.email = 'กรุณากรอกอีเมล';
    else if (!emailRegex.test(email)) e.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    if (!password) e.password = 'กรุณากรอกรหัสผ่าน';
    else if (password.length < 8 || password.length > 15) e.password = 'รหัสผ่านต้องมี 8-15 ตัวอักษร';
    else if (!passRegex.test(password)) e.password = 'รูปแบบรหัสผ่านไม่ถูกต้อง';
    if (!confirmPassword) e.confirmPassword = 'กรุณายืนยันรหัสผ่าน';
    else if (confirmPassword !== password) e.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    if (!addressNo.trim()) e.addressNo = 'กรุณากรอกบ้านเลขที่';
    if (!amphoe) e.amphoe = 'กรุณาเลือกอำเภอ';
    if (!tambon) e.tambon = 'กรุณาเลือกตำบล';
    if (!mapPosition) e.map = 'กรุณาเลือกตำแหน่งจากแผนที่';
    if (!petType) e.petType = 'กรุณาเลือกประเภทสัตว์';
    if (!petWeight) e.petWeight = 'กรุณาเลือกขนาดสัตว์';
    if (timeSlots.length === 0) e.timeSlots = 'กรุณาเลือกช่วงเวลาอย่างน้อย 1 ช่วง';
    if (!experience) e.experience = 'กรุณาเลือกประสบการณ์';
    if (!rate) e.rate = 'กรุณากรอกค่าดูแลต่อวัน';
    else if (isNaN(rate) || Number(rate) <= 0) e.rate = 'ค่าดูแลต้องมากกว่า 0';
    if (!bank) e.bank = 'กรุณาเลือกธนาคาร';
    if (!accountNo.trim()) e.accountNo = 'กรุณากรอกหมายเลขบัญชี';
    if (!accountName.trim()) e.accountName = 'กรุณากรอกชื่อบัญชี';
    if (!qrFile) e.qrImage = 'กรุณาอัพโหลดรูป QR Code';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/auth/register-sitter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstname: firstName, lastname: lastName, gender,
          birthdate: birthDate, phoneNumber: phone, email, password,
          addressNo, street: street || '-',
          subdistrict: tambon, district: amphoe, province: 'เชียงใหม่',
          zipcode: zipCode, latitude: mapPosition[0], longitude: mapPosition[1],
          petAllowType: petType, acceptedPetSize: petWeight, experienceYear: experience,
          pricePerDay: rate,
          isMorning: timeSlots.includes('เช้า') ? 'ดูแลช่วงเช้า' : '-',
          isAfternoon: timeSlots.includes('กลางวัน') ? 'ดูแลช่วงกลางวัน' : '-',
          isEvening: timeSlots.includes('เย็น') ? 'ดูแลช่วงเย็น' : '-',
          isNight: timeSlots.includes('ดึก') ? 'ดูแลช่วงดึก' : '-',
          isFeedMedicine: services.includes('ป้อนยา') ? 'ป้อนยา' : '-',
          isCleanService: services.includes('เก็บอึฉี่') ? 'เก็บอึฉี่' : '-',
          isWalkService: services.includes('พาเดินเล่น') ? 'พาเดินเล่น' : '-',
          bankName: bank, accountNo, accountName,
        }),
      });
      let data = {};
      try { data = await res.json(); } catch { data = {}; }
      if (!res.ok) { alert(data.message || 'ไม่สามารถลงทะเบียนได้'); return; }

      const form = new FormData();
      form.append('sitterID', data.sitterID);
      form.append('sitterImage', profileFile);
      form.append('qrCodeImage', qrFile);
      const uploadRes = await fetch(`${API}/api/auth/upload-sitter-image`, { method: 'POST', body: form });
      if (!uploadRes.ok) {
        console.error('อัปโหลดรูปภาพไม่สำเร็จ');
      }

      alert('ลงทะเบียนเรียบร้อยแล้ว กรุณาเข้าสู่ระบบเพื่อเริ่มใช้งาน');
      navigate('/login');
    } catch {
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally { setSubmitting(false); }
  };

  useImperativeHandle(ref, () => ({ submit: handleSubmit }));

  return (
    <div className="ar-form-wrapper">
      <div className="ar-form-title ar-sitter">ลงทะเบียน ผู้ดูแลสัตว์เลี้ยง</div>

      <div className="ar-two-col">
        {/* ====== คอลัมน์ซ้าย ====== */}
        <div>
          <div className="ar-section-box">
            <div className="ar-section-label ar-sitter-label">ข้อมูลส่วนตัว</div>
            <div className="ar-profile-row">
              <div className="ar-profile-upload">
                <div className="ar-profile-preview" onClick={() => profileRef.current.click()}>
                  {profileImage ? <img src={profileImage} alt="profile" /> : <span style={{fontSize:30,color:'#aaa'}}>👤</span>}
                  <div className="ar-plus-icon ar-sitter-plus">+</div>
                </div>
                <input type="file" ref={profileRef} style={{display:'none'}} accept=".png,.jpg,.jpeg" onChange={handleProfileImage} />
                <button className="ar-upload-btn" onClick={() => profileRef.current.click()}>เลือกไฟล์</button>
                <p className="ar-file-hint">.png .jpg .jpeg / ไม่เกิน 3MB</p>
                {profileFileName && ( 
                  <div className="ar-file-name-box">
                    <span>{profileFileName}</span>
                    <button className="ar-file-remove" onClick={() => { setProfileImage(null); setProfileFileName(''); setProfileFile(null); profileRef.current.value = ''; }}>✕</button>
                  </div>
                )}
                {errors.profileImage && <p className="ar-error">{errors.profileImage}</p>}
              </div>
              <div style={{flex:1,display:'flex',flexDirection:'column',gap:8}}>
                <div className="ar-row-2">
                  <div className="ar-field"><label>ชื่อ <span className="ar-req">*</span></label><input type="text" value={firstName} placeholder="ชื่อ" onChange={e => { setFirstName(e.target.value); setErrors(p => ({...p, firstName:''})); }} />{errors.firstName && <p className="ar-error">{errors.firstName}</p>}</div>
                  <div className="ar-field"><label>นามสกุล <span className="ar-req">*</span></label><input type="text" value={lastName} placeholder="นามสกุล" onChange={e => { setLastName(e.target.value); setErrors(p => ({...p, lastName:''})); }} />{errors.lastName && <p className="ar-error">{errors.lastName}</p>}</div>
                </div>
                <div style={{display:'flex', gap:10, alignItems:'flex-start'}}>
                  <div className="ar-field" style={{flexShrink:0}}><label>เพศ <span className="ar-req">*</span></label><select value={gender} style={{width:'auto'}} onChange={e => { setGender(e.target.value); setErrors(p => ({...p, gender:''})); }}><option value="">-- เลือก --</option><option value="ชาย">♂ ชาย</option><option value="หญิง">♀หญิง</option></select>{errors.gender && <p className="ar-error">{errors.gender}</p>}</div>
                  <div className="ar-field" style={{flex:1}}><label>โทรศัพท์ <span className="ar-req">*</span></label><input type="text" value={phone} placeholder="0621234567" maxLength={10} onChange={e => { setPhone(e.target.value); setErrors(p => ({...p, phone:''})); }} />{errors.phone && <p className="ar-error">{errors.phone}</p>}</div>
                </div>
                <div className="ar-row-2">
                  <div className="ar-field"><label>วันเกิด <span className="ar-req">*</span></label><input type="date" value={birthDate} max={maxBirthDate} onChange={e => { setBirthDate(e.target.value); setErrors(p => ({...p, birthDate:''})); }} />{age !== '' && <p style={{fontSize:11,color:'#1E4D6B',fontWeight:500,margin:'2px 0 0 0'}}>อายุ {age} ปี</p>}{errors.birthDate && <p className="ar-error">{errors.birthDate}</p>}</div>
                  <div className="ar-field"><label>อีเมล <span className="ar-req">*</span></label><input type="email" value={email} placeholder="email@example.com" onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email:''})); }} />{errors.email && <p className="ar-error">{errors.email}</p>}</div>
                </div>
              </div>
            </div>
            <div className="ar-row-2">
              <div className="ar-field" style={{position:'relative'}}><label>รหัสผ่าน <span className="ar-req">*</span></label><input type="password" value={password} placeholder="8-15 ตัวอักษร" onFocus={() => setShowPwHint(true)} onBlur={() => setShowPwHint(false)} onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password:''})); }} />{showPwHint && (<div style={{position:'absolute',top:'100%',left:0,marginTop:4,background:'#fff',border:'0.5px solid #d6e7f2',borderRadius:8,padding:'8px 12px',fontSize:11,color:'#1E4D6B',boxShadow:'0 4px 12px rgba(0,0,0,0.1)',zIndex:10,whiteSpace:'nowrap',lineHeight:1.9}}>✅ ตัวอักษรภาษาอังกฤษหรือตัวเลข<br />✅ อักษรพิเศษ [! # _ .] ได้<br />✅ ความยาว 8-15 ตัวอักษร</div>)}{errors.password && <p className="ar-error">{errors.password}</p>}</div>
              <div className="ar-field"><label>ยืนยันรหัสผ่าน <span className="ar-req">*</span></label><input type="password" value={confirmPassword} placeholder="กรอกอีกครั้ง" onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({...p, confirmPassword:''})); }} />{errors.confirmPassword && <p className="ar-error">{errors.confirmPassword}</p>}</div>
            </div>
          </div>

          <div className="ar-section-box">
            <div className="ar-section-label ar-sitter-label">ที่อยู่</div>
            <div className="ar-row-2">
              <div className="ar-field"><label>บ้านเลขที่ <span className="ar-req">*</span></label><input type="text" value={addressNo} placeholder="เช่น 411" onChange={e => { setAddressNo(e.target.value); setErrors(p => ({...p, addressNo:''})); }} />{errors.addressNo && <p className="ar-error">{errors.addressNo}</p>}</div>
              <div className="ar-field"><label>ถนน/เขต</label><input type="text" value={street} placeholder="-" onChange={e => setStreet(e.target.value)} /></div>
            </div>
            <div className="ar-row-2">
              <div className="ar-field"><label>จังหวัด</label><input type="text" value="เชียงใหม่" disabled style={{background:'#f5f5f5',color:'#999'}} /></div>
              <div className="ar-field"><label>อำเภอ <span className="ar-req">*</span></label><select value={amphoe} onChange={e => { setAmphoe(e.target.value); setErrors(p => ({...p, amphoe:''})); }}><option value="">-- เลือก --</option>{Object.keys(amphoeData).map(a => <option key={a} value={a}>{a}</option>)}</select>{errors.amphoe && <p className="ar-error">{errors.amphoe}</p>}</div>
            </div>
            <div className="ar-row-2">
              <div className="ar-field"><label>ตำบล <span className="ar-req">*</span></label><select value={tambon} onChange={e => { setTambon(e.target.value); setErrors(p => ({...p, tambon:''})); }} disabled={!amphoe}><option value="">-- เลือก --</option>{amphoe && Object.keys(amphoeData[amphoe] || {}).map(t => <option key={t} value={t}>{t}</option>)}</select>{errors.tambon && <p className="ar-error">{errors.tambon}</p>}</div>
              <div className="ar-field"><label>รหัสไปรษณีย์</label><input type="text" value={zipCode} disabled style={{background:'#f5f5f5',color:'#999'}} /></div>
            </div>
            <div className="ar-map-label-row">
              <span style={{fontSize:13,color:'#1a1a1a'}}>ตำแหน่งบนแผนที่ <span className="ar-req">*</span></span>
              <button className="ar-gps-btn ar-sitter-gps" onClick={handleGPS}>📍 ใช้ตำแหน่งปัจจุบัน</button>
            </div>
            <p className="ar-map-hint">กรุณากด GPS หรือปักหมุดให้ตรงที่อยู่ของคุณ</p>
            <div className="ar-map-box">
              <MapContainer center={mapPosition || [18.7883, 98.9853]} zoom={mapPosition ? 14 : 11} style={{width:'100%',height:'100%'}}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                <MapPicker position={mapPosition} setPosition={(p) => { setMapPosition(p); setErrors(e => ({...e, map:''})); }} setLocationText={setLocationText} />
              </MapContainer>
            </div>
            {locationText && <p className="ar-location-text">📍 {locationText}</p>}
            {errors.map && <p className="ar-error">{errors.map}</p>}
          </div>
        </div>

        {/* ====== คอลัมน์ขวา ====== */}
        <div>
          <div className="ar-section-box">
            <div className="ar-section-label ar-sitter-label">รายละเอียดการรับดูแล</div>
            <div className="ar-row-2">
              <div className="ar-field"><label>ประเภทสัตว์ <span className="ar-req">*</span></label><select value={petType} onChange={e => { setPetType(e.target.value); setErrors(p => ({...p, petType:''})); }}><option value="">-- เลือก --</option><option value="สุนัข">🐶 สุนัข</option><option value="แมว">🐱 แมว</option><option value="ทั้งหมด">🐾 ทั้งหมด</option></select>{errors.petType && <p className="ar-error">{errors.petType}</p>}</div>
              <div className="ar-field"><label>ขนาดสัตว์ <span className="ar-req">*</span></label><select value={petWeight} onChange={e => { setPetWeight(e.target.value); setErrors(p => ({...p, petWeight:''})); }}><option value="">-- เลือก --</option><option value="1-3กก.">1-3 กก.</option><option value="4-5กก.">4-5 กก.</option><option value="6-10กก.">6-10 กก.</option><option value="รับได้ทุกช่วงน้ำหนัก">รับได้ทุกช่วงน้ำหนัก</option></select>{errors.petWeight && <p className="ar-error">{errors.petWeight}</p>}</div>
            </div>
            <div className="ar-field">
              <label>ช่วงเวลาที่รับดูแล <span className="ar-req">*</span></label>
              <div className="ar-checkbox-group">
                {[{v:'เช้า',l:'🌅 ช่วงเช้า : 06:00น. – 10:00น.'},{v:'กลางวัน',l:'☀️ ช่วงกลางวัน : 11:00น. – 15:00น.'},{v:'เย็น',l:'🌆 ช่วงเย็น : 16:00น. – 20:00น.'},{v:'ดึก',l:'🌙 ช่วงดึก : 21:00น. – 24:00น.'}].map(({v,l}) => (
                  <label key={v} className="ar-checkbox-item"><input type="checkbox" checked={timeSlots.includes(v)} onChange={() => toggleTime(v)} />{l}</label>
                ))}
              </div>
              {errors.timeSlots && <p className="ar-error">{errors.timeSlots}</p>}
            </div>
            <div className="ar-row-2">
              <div className="ar-field"><label>ประสบการณ์ <span className="ar-req">*</span></label><select value={experience} onChange={e => { setExperience(e.target.value); setErrors(p => ({...p, experience:''})); }}><option value="">-- เลือก --</option><option value="น้อยกว่า 1 ปี">น้อยกว่า 1 ปี</option><option value="1-2 ปี">1-2 ปี</option><option value="มากกว่า 2 ปี">มากกว่า 2 ปี</option></select>{errors.experience && <p className="ar-error">{errors.experience}</p>}</div>
              <div className="ar-field"><label>ค่าดูแลต่อวัน (บาท) <span className="ar-req">*</span></label><input type="number" value={rate} placeholder="100" min="1" onChange={e => { setRate(e.target.value); setErrors(p => ({...p, rate:''})); }} />{errors.rate && <p className="ar-error">{errors.rate}</p>}</div>
            </div>
            <div className="ar-field">
              <label>บริการเสริม</label>
              <div className="ar-checkbox-group">
                {[{s:'ป้อนยา',e:'💊'},{s:'เก็บอึฉี่',e:'🧹'},{s:'พาเดินเล่น',e:'🦮'}].map(({s,e}) => (
                  <label key={s} className="ar-checkbox-item"><input type="checkbox" checked={services.includes(s)} onChange={() => toggleService(s)} />{e} {s}</label>
                ))}
              </div>
            </div>
          </div>

          <div className="ar-section-box">
            <div className="ar-section-label ar-sitter-label">รายละเอียดการเงิน</div>
            <div className="ar-row-2">
              <div className="ar-field"><label>ธนาคาร <span className="ar-req">*</span></label><select value={bank} onChange={e => { setBank(e.target.value); setErrors(p => ({...p, bank:''})); }}><option value="">-- เลือก --</option>{['กสิกรไทย','กรุงไทย','กรุงเทพ','ไทยพาณิชย์','ทหารไทยธนชาต','ออมสิน','อาคารสงเคราะห์','กรุงศรีอยุธยา'].map(b => <option key={b} value={b}>{b}</option>)}</select>{errors.bank && <p className="ar-error">{errors.bank}</p>}</div>
              <div className="ar-field"><label>หมายเลขบัญชี <span className="ar-req">*</span></label><input type="text" value={accountNo} placeholder="012-3-456789" onChange={e => { setAccountNo(e.target.value); setErrors(p => ({...p, accountNo:''})); }} />{errors.accountNo && <p className="ar-error">{errors.accountNo}</p>}</div>
            </div>
            <div className="ar-field"><label>ชื่อบัญชี <span className="ar-req">*</span></label><input type="text" value={accountName} placeholder="ชื่อ-นามสกุล" onChange={e => { setAccountName(e.target.value); setErrors(p => ({...p, accountName:''})); }} />{errors.accountName && <p className="ar-error">{errors.accountName}</p>}</div>
            <div className="ar-field">
              <label>อัพโหลดรูป QR Code <span className="ar-req">*</span></label>
              <div className="ar-qr-upload-box" onClick={() => qrRef.current.click()}>
                {qrImage ? <img src={qrImage} alt="QR" className="ar-qr-preview" /> : <><span style={{fontSize:32,color:'#7FB3D9'}}>☁️</span><p style={{fontSize:12,color:'#999',marginTop:4}}>คลิกเพื่ออัพโหลด QR Code</p></>}
              </div>
              <input type="file" ref={qrRef} style={{display:'none'}} accept=".png,.jpg,.jpeg" onChange={handleQrImage} />
              <button className="ar-upload-btn" style={{marginTop:6}} onClick={() => qrRef.current.click()}>เลือกไฟล์</button>
              <p className="ar-file-hint">.png .jpg .jpeg / ไม่เกิน 5MB</p>
              {qrFileName && (
                <div className="ar-file-name-box" style={{marginTop:6}}>
                  <span>{qrFileName}</span>
                  <button className="ar-file-remove" onClick={() => { setQrImage(null); setQrFileName(''); setQrFile(null); qrRef.current.value = ''; }}>✕</button>
                </div>
              )}
              {errors.qrImage && <p className="ar-error">{errors.qrImage}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// =================== AllRegister (หน้าหลัก) ===================
function AllRegister() {
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);

  return (
    <div>
      <div className="ar-navbar">
        <div className="ar-navbar-logo">
          <img src={logo} alt="logo" />
        </div>
        <div className="ar-navbar-title">
          ระบบตามหาผู้ดูแลสัตว์เลี้ยง<br />ภายในจังหวัดเชียงใหม่
        </div>
      </div>

      <div className="ar-page">
        <div className="ar-card">

          {/* Toggle */}
          <div className="ar-toggle-wrap">
            <div className={`ar-toggle-track ${isOwner ? 'ar-toggle-owner' : 'ar-toggle-sitter'}`} onClick={() => setIsOwner(!isOwner)}>
              <div className={`ar-toggle-pill ${isOwner ? 'ar-pill-left' : 'ar-pill-right'}`}></div>
              <div className="ar-toggle-option">
                <span className="ar-toggle-icon">🐾</span>
                <span className={`ar-toggle-label ${isOwner ? 'ar-active-label' : ''}`}>เจ้าของสัตว์เลี้ยง</span>
              </div>
              <div className="ar-toggle-option">
                <span className="ar-toggle-icon">🛡️</span>
                <span className={`ar-toggle-label ${!isOwner ? 'ar-active-label' : ''}`}>ผู้ดูแลสัตว์เลี้ยง</span>
              </div>
            </div>
          </div>

          {/* Form */}
          {isOwner ? <OwnerForm ref={formRef} submitting={submitting} setSubmitting={setSubmitting} /> : <SitterForm ref={formRef} submitting={submitting} setSubmitting={setSubmitting} />}

        </div>

        {/* ปุ่มย้อนกลับ/บันทึก — อยู่นอกกรอบการ์ด */}
        <div className="ar-btn-group">
          <button className="ar-btn-back" onClick={() => navigate('/')}>ย้อนกลับ</button>
          <button className={`ar-btn-submit ${isOwner ? 'ar-owner-btn' : 'ar-sitter-btn'}`} onClick={() => formRef.current?.submit()} disabled={submitting}>
            {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AllRegister;
