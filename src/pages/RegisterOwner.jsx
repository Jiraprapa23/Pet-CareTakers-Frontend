import React, { useState, useEffect, useRef } from 'react';
import './AllRegister.css';
import logo from '../assets/logo.png';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const amphoeData = {
  'เมืองเชียงใหม่': { 'ศรีภูมิ':'50200','พระสิงห์':'50200','หายยา':'50100','ช้างม่อย':'50300','ช้างคลาน':'50100','วัดเกต':'50000','ช้างเผือก':'50300','สุเทพ':'50200','แม่เหียะ':'50100','ป่าแดด':'50100','หนองหอย':'50000','ฟ้าฮ่าม':'50000','ป่าตัน':'50300','สันผีเสื้อ':'50300' },
  'จอมทอง': { 'บ้านหลวง':'50160','ข่วงเปา':'50160','สบเตี๊ยะ':'50160','บ้านแปะ':'50160','ดอยแก้ว':'50160','แม่สอย':'50160' },
  'แม่แจ่ม': { 'ช่างเคิ่ง':'50270','ท่าผา':'50270','บ้านทับ':'50270','แม่ศึก':'50270','ปางหินฝน':'50270','กองแขก':'50270' },
  'เชียงดาว': { 'เชียงดาว':'50170','เมืองนะ':'50170','เมืองงาย':'50170','แม่นะ':'50170','เมืองคอง':'50170','ปิงโค้ง':'50170','ทุ่งข้าวพวง':'50170' },
  'ดอยสะเก็ด': { 'เชิงดอย':'50220','สันปูเลย':'50220','ลวงเหนือ':'50220','ป่าป้อง':'50220','สง่าบ้าน':'50220','ตลาดขวัญ':'50220','สำราญราษฎร์':'50220','แม่คือ':'50220','ตลาดใหญ่':'50220','แม่ฮ้อยเงิน':'50220','แม่โป่ง':'50220','ป่าเมี่ยง':'50220' },
  'แม่แตง': { 'สันมหาพน':'50150','แม่แตง':'50150','ขี้เหล็ก':'50150','ช่อแล':'50150','แม่หอพระ':'50150','สบเปิง':'50150','บ้านเป้า':'50150','สันป่ายาง':'50150','ป่าแป๋':'50150','เมืองก๋าย':'50150','อินทขิล':'50150','กื้ดช้าง':'50150' },
  'แม่ริม': { 'ริมใต้':'50180','ริมเหนือ':'50180','สันโป่ง':'50180','ขี้เหล็ก':'50180','สะลวง':'50180','ห้วยทราย':'50180','แม่แรม':'50180','โป่งแยง':'50180','เหมืองแก้ว':'50180','ดอนแก้ว':'50180','แม่สา':'50180' },
  'สะเมิง': { 'สะเมิงใต้':'50250','สะเมิงเหนือ':'50250','แม่สาบ':'50250','บ่อแก้ว':'50250','ยั้งเมิน':'50250' },
  'ฝาง': { 'เวียง':'50110','ม่อนปิ่น':'50110','แม่งอน':'50110','แม่สูน':'50110','สันทราย':'50110','แม่คะ':'50110','โป่งน้ำร้อน':'50110','แม่ข่า':'50110' },
  'แม่อาย': { 'แม่อาย':'50280','แม่สาว':'50280','สันต้นหมื้อ':'50280','แม่นาวาง':'50280','ท่าตอน':'50280','บ้านหลวง':'50280','มะลิกา':'50280' },
  'พร้าว': { 'เวียง':'50190','ทุ่งหลวง':'50190','ป่าตุ้ม':'50190','น้ำแพร่':'50190','เขื่อนผาก':'50190','แม่แวน':'50190','แม่ปั๋ง':'50190','โหล่งขอด':'50190','สันทราย':'50190' },
  'สันป่าตอง': { 'ยุหว่า':'50120','สันกลาง':'50120','ท่าวังพร้าว':'50120','มะขามหลวง':'50120','แม่ก๊า':'50120','บ้านแม':'50120','บ้านกลาง':'50120','ทุ่งต้อม':'50120','น้ำบ่อหลวง':'50120','มะขุนหวาน':'50120' },
  'สันกำแพง': { 'สันกำแพง':'50130','ทรายมูล':'50130','ร้องวัวแดง':'50130','บวกค้าง':'50130','แช่ช้าง':'50130','ออนใต้':'50130','แม่ปูคา':'50130','ห้วยทราย':'50130','ต้นเปา':'50130','สันกลาง':'50130' },
  'สันทราย': { 'สันทรายน้อย':'50210','สันพระเนตร':'50210','สันนาเม็ง':'50210','สันป่าเปา':'50210','หนองจ๊อม':'50210','หนองหาร':'50210','แม่แฝก':'50210','แม่แฝกใหม่':'50210','เมืองเล็น':'50210','ป่าไผ่':'50210','หนองแหย่ง':'50210','สันทรายหลวง':'50210' },
  'หางดง': { 'หางดง':'50230','หนองแก๋ว':'50230','หารแก้ว':'50230','หนองตอง':'50230','ขุนคง':'50230','สบแม่ข่า':'50230','บ้านแหวน':'50230','สันผักหวาน':'50230','หนองควาย':'50230','บ้านปง':'50230','น้ำแพร่':'50230' },
  'ฮอด': { 'ฮอด':'50240','หางดง':'50240','บ้านตาล':'50240','บ่อหลวง':'50240','บ่อสลี':'50240','นาคอเรือ':'50240' },
  'ดอยเต่า': { 'ดอยเต่า':'50260','ท่าเดื่อ':'50260','มืดกา':'50260','บ้านแอ่น':'50260','บงตัน':'50260' },
  'อมก๋อย': { 'อมก๋อย':'50310','ยางเปียง':'50310','แม่ตื่น':'50310','ม่อนจอง':'50310','สบโขง':'50310','นาเกียน':'50310' },
  'สารภี': { 'ยางเนิ้ง':'50140','สารภี':'50140','ชมภู':'50140','ไชยสถาน':'50140','ขัวมุง':'50140','หนองแฝก':'50140','หนองผึ้ง':'50140','ท่ากว้าง':'50140','ดอนแก้ว':'50140','ท่าวังตาล':'50140','สันทราย':'50140','ป่าบง':'50140' },
  'เวียงแหง': { 'เวียง':'50350','เปียงหลวง':'50350','แสนไห':'50350' },
  'ไชยปราการ': { 'ปงตำ':'50320','ศรีดงเย็น':'50320','แม่ทะลบ':'50320','หนองบัว':'50320' },
  'แม่วาง': { 'บ้านกาด':'50360','ทุ่งรวงทอง':'50360','แม่วิน':'50360','ดอนเปา':'50360','ทุ่งปี๊':'50360' },
  'แม่ออน': { 'ออนเหนือ':'50130','ออนกลาง':'50130','บ้านสหกรณ์':'50130','ห้วยแก้ว':'50130','แม่ทา':'50130','ทาเหนือ':'50130' },
  'ดอยหล่อ': { 'ดอยหล่อ':'50160','สันติสุข':'50160','ยางคราม':'50160','สองแคว':'50160' },
  'กัลยาณิวัฒนา': { 'บ้านจันทร์':'50270','แม่แดด':'50270','แจ่มหลวง':'50270' },
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

function RegisterOwner() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

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
  const [showPwHint, setShowPwHint] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const allowed = ['image/png','image/jpeg','image/jpg'];
    if (!allowed.includes(file.type)) { setErrors(p => ({...p, profileImage:'รูปต้องเป็นนามสกุล .png .jpg .jpeg เท่านั้น'})); return; }
    if (file.size > 3*1024*1024) { setErrors(p => ({...p, profileImage:'รูปต้องมีขนาดไม่เกิน 3MB'})); return; }
    setProfileImage(URL.createObjectURL(file));
    setProfileFileName(file.name);
    setErrors(p => ({...p, profileImage:''}));
  };

  const handleRemoveImage = () => {
    setProfileImage(null); setProfileFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) { alert('เบราว์เซอร์ของคุณไม่รองรับ GPS'); return; }
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
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    const passRegex = /^[a-zA-Z0-9!#_.]+$/;
    const phoneRegex = /^\d{10}$/;
    const addressRegex = /^[0-9a-zA-Zก-๙/\s]+$/;

    if (!profileImage) e.profileImage = 'กรุณาเลือกรูปโปรไฟล์';
    if (!firstName) e.firstName = 'กรุณากรอกชื่อ';
    else if (!thaiOnly.test(firstName)) e.firstName = 'ชื่อต้องเป็นภาษาไทยเท่านั้น';
    else if (firstName.length < 2 || firstName.length > 16) e.firstName = 'ชื่อต้องมี 2-16 ตัวอักษร';
    if (!lastName) e.lastName = 'กรุณากรอกนามสกุล';
    else if (!thaiOnly.test(lastName)) e.lastName = 'นามสกุลต้องเป็นภาษาไทยเท่านั้น';
    else if (lastName.length < 2 || lastName.length > 16) e.lastName = 'นามสกุลต้องมี 2-16 ตัวอักษร';
    if (!gender) e.gender = 'กรุณาเลือกเพศ';
    if (!birthDate) e.birthDate = 'กรุณาเลือกวันเกิด';
    else if (age < 18) e.birthDate = 'ผู้ใช้งานต้องมีอายุอย่างน้อย 18 ปี';
    if (!phone) e.phone = 'กรุณากรอกหมายเลขโทรศัพท์';
    else if (!phoneRegex.test(phone)) e.phone = 'หมายเลขโทรศัพท์ต้องเป็นตัวเลข 10 หลัก';
    if (!email) e.email = 'กรุณากรอกอีเมล';
    else if (/\s/.test(email) || !emailRegex.test(email)) e.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    if (!password) e.password = 'กรุณากรอกรหัสผ่าน';
    else if (/\s/.test(password) || password.length < 8 || password.length > 15) e.password = 'รหัสผ่านต้องมี 8-15 ตัวอักษร';
    else if (!passRegex.test(password)) e.password = 'รูปแบบรหัสผ่านไม่ถูกต้อง';
    if (!confirmPassword) e.confirmPassword = 'กรุณากรอกยืนยันรหัสผ่าน';
    else if (confirmPassword !== password) e.confirmPassword = 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน';
    if (!addressNo) e.addressNo = 'กรุณากรอกบ้านเลขที่';
    else if (!addressRegex.test(addressNo)) e.addressNo = 'รูปแบบบ้านเลขที่ไม่ถูกต้อง';
    if (!amphoe) e.amphoe = 'กรุณาเลือกอำเภอ';
    if (!tambon) e.tambon = 'กรุณาเลือกตำบล';
    if (!mapPosition) e.map = 'กรุณาเลือกตำแหน่งจากแผนที่';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:8096/api/auth/register-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstname: firstName, lastname: lastName, gender,
          birtdate: birthDate, phoneNumber: phone, email, password,
          addressNo, street: street || '-',
          subdistrict: tambon, district: amphoe,
          province: 'เชียงใหม่', zipcode: zipCode,
          latitude: mapPosition[0], longitude: mapPosition[1],
        }),
      });
      const data = await response.json();
      if (!response.ok) { alert(data.message); return; }

      const imageForm = new FormData();
      imageForm.append('ownerID', data.ownerID);
      imageForm.append('profileImage', fileInputRef.current.files[0]);
      const imageResponse = await fetch('http://localhost:8096/api/auth/upload-owner-image', {
        method: 'POST', body: imageForm,
      });
      const imageData = await imageResponse.json();
      if (!imageResponse.ok) { alert(imageData.message); return; }

      alert('ลงทะเบียนสำเร็จ!');
      navigate('/login');
    } catch {
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="ar-navbar">
        <div className="ar-navbar-logo"><img src={logo} alt="logo" /></div>
        <div className="ar-navbar-title">ระบบตามหาผู้ดูแลสัตว์เลี้ยง<br />ภายในจังหวัดเชียงใหม่</div>
      </div>

      <div className="ar-page">
        <div className="ar-card">
          <div className="ar-form-title ar-owner">ลงทะเบียน เจ้าของสัตว์เลี้ยง</div>

          {/* ข้อมูลส่วนตัว */}
          <div className="ar-section-box">
            <div className="ar-section-label">ข้อมูลส่วนตัว</div>
            <div style={{display:'grid', gridTemplateColumns:'110px 1fr', gap:18, alignItems:'start'}}>

              {/* รูปโปรไฟล์ */}
              <div className="ar-profile-upload">
                <div className="ar-profile-preview" onClick={() => fileInputRef.current.click()}>
                  {profileImage ? <img src={profileImage} alt="profile" /> : <span style={{fontSize:36,color:'#aaa'}}>👤</span>}
                  <div className="ar-plus-icon ar-owner-plus">+</div>
                </div>
                <input type="file" ref={fileInputRef} style={{display:'none'}} accept=".png,.jpg,.jpeg" onChange={handleImageChange} />
                <button className="ar-upload-btn" onClick={() => fileInputRef.current.click()}>เลือกไฟล์</button>
                <p className="ar-file-hint">.png .jpg .jpeg / ไม่เกิน 3MB</p>
                {profileFileName && (
                  <div className="ar-file-name-box">
                    <span>{profileFileName}</span>
                    <button className="ar-file-remove" onClick={handleRemoveImage}>✕</button>
                  </div>
                )}
                {errors.profileImage && <p className="ar-error">{errors.profileImage}</p>}
              </div>

              {/* ฟอร์ม */}
              <div style={{display:'flex', flexDirection:'column', gap:10}}>

                {/* แถว 1: ชื่อ | นามสกุล | เพศ */}
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

                {/* แถว 2: วันเกิด | โทรศัพท์ | อีเมล */}
                <div className="ar-row-3">
                  <div className="ar-field">
                    <label>วันเกิด <span className="ar-req">*</span></label>
                    <input type="date" value={birthDate} max={maxBirthDate} onChange={e => { setBirthDate(e.target.value); setErrors(p => ({...p, birthDate:''})); }} />
                    {age !== '' && <p style={{fontSize:11,color:'#8D6E63',fontWeight:500,margin:'2px 0 0 0'}}>อายุ {age} ปี</p>}
                    {errors.birthDate && <p className="ar-error">{errors.birthDate}</p>}
                  </div>
                  <div className="ar-field">
                    <label>หมายเลขโทรศัพท์ <span className="ar-req">*</span></label>
                    <input type="text" value={phone} placeholder="0xx-xxxxxxx" maxLength={10} onChange={e => { setPhone(e.target.value); setErrors(p => ({...p, phone:''})); }} />
                    {errors.phone && <p className="ar-error">{errors.phone}</p>}
                  </div>
                  <div className="ar-field">
                    <label>อีเมล <span className="ar-req">*</span></label>
                    <input type="text" value={email} placeholder="กรอกอีเมล" onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email:''})); }} />
                    {errors.email && <p className="ar-error">{errors.email}</p>}
                  </div>
                </div>

                {/* แถว 3: รหัสผ่าน | ยืนยันรหัสผ่าน */}
                <div className="ar-row-2">
                  <div className="ar-field" style={{position:'relative'}}>
                    <label>รหัสผ่าน <span className="ar-req">*</span></label>
                    <input
                      type="password"
                      value={password}
                      placeholder="กรอกรหัสผ่าน"
                      onFocus={() => setShowPwHint(true)}
                      onBlur={() => setShowPwHint(false)}
                      onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password:''})); }}
                    />
                    {showPwHint && (
                      <div style={{
                        position:'absolute', top:'100%', left:0, marginTop:4,
                        background:'#fff', border:'0.5px solid #e0d6d0', borderRadius:8,
                        padding:'8px 12px', fontSize:11, color:'#5D3A2E',
                        boxShadow:'0 4px 12px rgba(0,0,0,0.1)', zIndex:10,
                        whiteSpace:'nowrap', lineHeight:1.9,
                      }}>
                        ✅ ตัวอักษรภาษาอังกฤษหรือตัวเลข<br />
                        ✅ อักษรพิเศษ [! # _ .] ได้<br />
                        ✅ ความยาว 8-15 ตัวอักษร
                      </div>
                    )}
                    {errors.password && <p className="ar-error">{errors.password}</p>}
                  </div>
                  <div className="ar-field">
                    <label>ยืนยันรหัสผ่าน <span className="ar-req">*</span></label>
                    <input type="password" value={confirmPassword} placeholder="กรอกยืนยันรหัสผ่าน" onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({...p, confirmPassword:''})); }} />
                    {errors.confirmPassword && <p className="ar-error">{errors.confirmPassword}</p>}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ที่อยู่ */}
          <div className="ar-section-box">
            <div className="ar-section-label">ที่อยู่</div>
            <div className="ar-row-2" style={{marginBottom:10}}>
              <div className="ar-field">
                <label>บ้านเลขที่และหมู่บ้าน <span className="ar-req">*</span></label>
                <input type="text" value={addressNo} placeholder="เช่น 239/1" onChange={e => { setAddressNo(e.target.value); setErrors(p => ({...p, addressNo:''})); }} />
                {errors.addressNo && <p className="ar-error">{errors.addressNo}</p>}
              </div>
              <div className="ar-field">
                <label>ถนน/เขต <span style={{color:'#aaa',fontSize:11}}>(ไม่บังคับ)</span></label>
                <input type="text" value={street} placeholder="กรอกถนน/เขต" onChange={e => setStreet(e.target.value)} />
              </div>
            </div>
            <div className="ar-row-3" style={{marginBottom:10}}>
              <div className="ar-field">
                <label>จังหวัด</label>
                <input type="text" value="เชียงใหม่" disabled style={{background:'#f5f0ed',color:'#999'}} />
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
            <div className="ar-field" style={{maxWidth:160,marginBottom:12}}>
              <label>รหัสไปรษณีย์</label>
              <input type="text" value={zipCode} disabled style={{background:'#f5f0ed',color:'#999'}} />
            </div>
            <div className="ar-map-label-row">
              <span>เลือกตำแหน่งจากแผนที่ <span className="ar-req">*</span></span>
              <button className="ar-gps-btn ar-owner-gps" onClick={handleGetLocation}>📍 ใช้ตำแหน่งปัจจุบัน</button>
            </div>
            <p className="ar-map-hint">กรุณากด GPS หรือปักหมุดให้ตรงที่อยู่ของคุณ</p>
            <div className="ar-map-box">
              <MapContainer center={mapPosition || [18.7883, 98.9853]} zoom={mapPosition ? 14 : 11} style={{width:'100%',height:'100%'}}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                <MapPicker
                  position={mapPosition}
                  setPosition={(p) => { setMapPosition(p); setErrors(e => ({...e, map:''})); }}
                  setLocationText={setLocationText}
                />
              </MapContainer>
            </div>
            {locationText && <p className="ar-location-text">📍 {locationText}</p>}
            {errors.map && <p className="ar-error">{errors.map}</p>}
          </div>

          {/* ปุ่ม */}
          <div className="ar-btn-group">
            <button className="ar-btn-back" onClick={() => window.history.back()}>ย้อนกลับ</button>
            <button className="ar-btn-submit ar-owner-btn" onClick={handleSave} disabled={submitting}>
              {submitting ? 'กำลังลงทะเบียน...' : 'บันทึก'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default RegisterOwner;
