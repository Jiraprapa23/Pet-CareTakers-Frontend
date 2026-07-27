import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileOwner.css';
import './AddPet.css';
import logo from '../assets/logo.png';
import NotificationBell from '../components/NotificationBell';

const API = 'http://localhost:8096';

function AddPet() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // รูป avatar topbar
  const imageUrl = user.profileImage && user.profileImage !== 'default.png'
    ? `${API}/api/auth/images/${user.profileImage}`
    : null;

  // รูปภาพสัตว์เลี้ยง
  const [petImage, setPetImage] = useState(null);
  const [petImageFile, setPetImageFile] = useState(null);
  const [petFileName, setPetFileName] = useState('');

  // ประเภทสัตว์เลี้ยง (ดึงจาก DB)
  const [petTypes, setPetTypes] = useState([]);
  const [petTypeID, setPetTypeID] = useState('');

  // ข้อมูลพื้นฐาน
  const [petName, setPetName] = useState('');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState('');

  // วัคซีน
  const [vaccineRabies, setVaccineRabies] = useState(false);
  const [vacRabiesDate, setVacRabiesDate] = useState('');
  const [vaccineDHPPi, setVaccineDHPPi] = useState(false);
  const [vacDhppiDate, setVacDhppiDate] = useState('');
  const [vaccineFVRCP, setVaccineFVRCP] = useState(false);
  const [vacFvrcpDate, setVacFvrcpDate] = useState('');

  // โรคประจำตัว
  const [hasDisease, setHasDisease] = useState(false);
  const [diseaseDetail, setDiseaseDetail] = useState('');
  const [emergencySymptoms, setEmergencySymptoms] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // พฤติกรรม
  const [behaviorStressAlone, setBehaviorStressAlone] = useState(false);
  const [behaviorFriendly, setBehaviorFriendly] = useState(false);
  const [behaviorFearStranger, setBehaviorFearStranger] = useState(false);
  const [behaviorFearLoudSound, setBehaviorFearLoudSound] = useState(false);
  const [behaviorBarkLoud, setBehaviorBarkLoud] = useState(false);
  const [behaviorDislikeTouch, setBehaviorDislikeTouch] = useState(false);
  const [behaviorBiteScrath, setBehaviorBiteScrath] = useState(false);
  const [behaviorEscapeExpert, setBehaviorEscapeExpert] = useState(false);
  const [behaviorHighEnergy, setBehaviorHighEnergy] = useState(false);
  const [behaviorJumpOnPeople, setBehaviorJumpOnPeople] = useState(false);
  const [behaviorHardControl, setBehaviorHardControl] = useState(false);

  const [errors, setErrors] = useState({});
  const today = new Date().toISOString().split('T')[0];

  // ดึงประเภทสัตว์เลี้ยงจาก DB
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await fetch(`${API}/api/pet/types`);
        const data = await res.json();
        setPetTypes(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTypes();
  }, []);

  // คำนวณอายุ
  useEffect(() => {
    if (!birthDate) { setAge(''); return; }
    const t = new Date(), b = new Date(birthDate);
    const totalMonths = (t.getFullYear() - b.getFullYear()) * 12 + (t.getMonth() - b.getMonth());
    if (totalMonths < 0) { setAge(''); return; }
    if (totalMonths < 12) {
      setAge(`${totalMonths} เดือน`);
    } else {
      const years = Math.floor(totalMonths / 12);
      const months = totalMonths % 12;
      setAge(months > 0 ? `${years} ปี ${months} เดือน` : `${years} ปี`);
    }
  }, [birthDate]);

  // เลือกรูป
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      setErrors(p => ({ ...p, petImage: 'รูปต้องเป็น .png .jpg .jpeg เท่านั้น' }));
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setErrors(p => ({ ...p, petImage: 'รูปต้องมีขนาดไม่เกิน 3MB' }));
      return;
    }
    setPetImage(URL.createObjectURL(file));
    setPetImageFile(file);
    setPetFileName(file.name);
    setErrors(p => ({ ...p, petImage: '' }));
  };

  // Validate
  const validate = () => {
    const e = {};
    if (!petImage) e.petImage = 'กรุณาอัพโหลดรูปสัตว์เลี้ยง';
    if (!petName.trim()) e.petName = 'กรุณากรอกชื่อสัตว์เลี้ยง';
    if (!petTypeID) e.petTypeID = 'กรุณาเลือกประเภทสัตว์เลี้ยง';
    if (!gender) e.gender = 'กรุณาเลือกเพศสัตว์เลี้ยง';
    if (!birthDate) e.birthDate = 'กรุณาเลือกวันเกิดสัตว์เลี้ยง';
    if (vaccineRabies && !vacRabiesDate) e.vacRabiesDate = 'กรุณาระบุวันที่ฉีดวัคซีนพิษสุนัขบ้า';
    if (vaccineDHPPi && !vacDhppiDate) e.vacDhppiDate = 'กรุณาระบุวันที่ฉีดวัคซีน DHPPi';
    if (vaccineFVRCP && !vacFvrcpDate) e.vacFvrcpDate = 'กรุณาระบุวันที่ฉีดวัคซีน FVRCP';
    if (hasDisease && !diseaseDetail.trim()) e.diseaseDetail = 'กรุณากรอกรายละเอียดโรคประจำตัว';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // บันทึก
  const handleSave = async () => {
    if (!validate()) return;
    try {
      const jsonData = {
        ownerID: user.ownerID,
        petName: petName.trim(),
        petTypeID: parseInt(petTypeID),
        breed,
        gender,
        birthDate,
        vacRabiesDate: vaccineRabies ? vacRabiesDate : '',
        vacDhppiDate: vaccineDHPPi ? vacDhppiDate : '',
        vacFvrcpDate: vaccineFVRCP ? vacFvrcpDate : '',
        hasCongenitalDisease: hasDisease,
        congenitalDiseaseDetail: hasDisease ? diseaseDetail : '',
        emergencySymptoms: hasDisease ? emergencySymptoms : '',
        emergencyContact: hasDisease ? emergencyContact : '',
        behaviorStressAlone, behaviorFriendly, behaviorFearStranger,
        behaviorFearLoudSound, behaviorBarkLoud,
        behaviorDislikeTouch, behaviorBiteScrath, behaviorEscapeExpert,
        behaviorHighEnergy, behaviorJumpOnPeople, behaviorHardControl,
      };

      const res = await fetch(`${API}/api/pet/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
      });

      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }

      // อัพโหลดรูป
      const form = new FormData();
      form.append('petImage', petImageFile);
      await fetch(`${API}/api/pet/upload-image/${data.petID}`, {
        method: 'POST',
        body: form,
      });

      alert('เพิ่มสัตว์เลี้ยงสำเร็จ!');
      navigate('/my-pets');
    } catch (err) {
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="app-layout">

      {/* =================== Topbar =================== */}
      <div className="topbar">
        <div className="topbar-left">
          <img src={logo} alt="logo" className="topbar-logo" />
          <div className="topbar-title">ระบบตามหาผู้ดูแลสัตว์เลี้ยง ภายในจังหวัดเชียงใหม่</div>
        </div>
        <div className="topbar-user">
          <span>ยินดีต้อนรับ คุณ{user.firstname}</span>
          <NotificationBell userID={user.ownerID} userRole="OWNER" />
          <div className="topbar-avatar">
            {imageUrl
              ? <img src={imageUrl} alt="avatar" />
              : <span style={{ fontSize: 18 }}>👤</span>}
          </div>
        </div>
      </div>

      <div className="body-row">

        {/* =================== Sidebar =================== */}
        <div className="sidebar">
          <div className="sidebar-menu">
            <a className="menu-item" onClick={() => navigate('/profile-owner')}>
              <span className="menu-icon">👤</span><span>โปรไฟล์ของฉัน</span>
            </a>
            <a className="menu-item active" onClick={() => navigate('/my-pets')}>
              <span className="menu-icon">🐾</span><span>รายการสัตว์เลี้ยง</span>
            </a>
            <a className="menu-item" onClick={() => navigate('/explore-sitters')}>
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

        {/* =================== Main Content =================== */}
        <div className="main-content">
          <div className="addpet-title">เพิ่มสัตว์เลี้ยง</div>

          <div className="addpet-grid">

            {/* ========== คอลัมน์ 1: รูป + ข้อมูลพื้นฐาน ========== */}
            <div className="addpet-card">
              <div className="pet-photo-upload" onClick={() => fileRef.current.click()}>
                {petImage
                  ? <img src={petImage} alt="pet" className="pet-photo-img" />
                  : <span className="pet-photo-placeholder">🐾</span>}
                <div className="pet-photo-plus">+</div>
              </div>
              <input type="file" ref={fileRef} style={{ display: 'none' }} accept=".png,.jpg,.jpeg" onChange={handleImageChange} />
              <button className="addpet-upload-btn" onClick={() => fileRef.current.click()}>เลือกไฟล์</button>
              <p className="addpet-file-hint">.png .jpg .jpeg / ไม่เกิน 3MB</p>
              {petFileName && (
                <div className="addpet-filename">
                  <span>{petFileName}</span>
                  <button onClick={() => { setPetImage(null); setPetImageFile(null); setPetFileName(''); fileRef.current.value = ''; }}>✕</button>
                </div>
              )}
              {errors.petImage && <p className="error-msg">{errors.petImage}</p>}

              <div className="addpet-section-title">ข้อมูลสัตว์เลี้ยง</div>

              <div className="addpet-field-row">
                <div className="addpet-field">
                  <label>ชื่อสัตว์เลี้ยง</label>
                  <input type="text" value={petName} onChange={e => { setPetName(e.target.value); setErrors(p => ({ ...p, petName: '' })); }} placeholder="กรอกชื่อ" />
                  {errors.petName && <p className="error-msg">{errors.petName}</p>}
                </div>
                <div className="addpet-field">
                  <label>ประเภทสัตว์เลี้ยง</label>
                  <select value={petTypeID} onChange={e => { setPetTypeID(e.target.value); setErrors(p => ({ ...p, petTypeID: '' })); }}>
                    <option value="">-- เลือก --</option>
                    {petTypes.map(t => (
                      <option key={t.petTypeID} value={t.petTypeID}>
                        {t.petTypeID === 1 ? '🐶' : t.petTypeID === 2 ? '🐱' : '🐾'} {t.petTypeName}
                      </option>
                    ))}
                  </select>
                  {errors.petTypeID && <p className="error-msg">{errors.petTypeID}</p>}
                </div>
              </div>

              <div className="addpet-field-row">
                <div className="addpet-field">
                  <label>สายพันธุ์</label>
                  <input type="text" value={breed} onChange={e => setBreed(e.target.value)} placeholder="กรอกสายพันธุ์" />
                </div>
                <div className="addpet-field">
                  <label>เพศสัตว์เลี้ยง</label>
                  <select value={gender} onChange={e => { setGender(e.target.value); setErrors(p => ({ ...p, gender: '' })); }}>
                    <option value="">-- เลือก --</option>
                    <option value="เพศผู้">♂ เพศผู้</option>
                    <option value="เพศเมีย">♀ เพศเมีย</option>
                  </select>
                  {errors.gender && <p className="error-msg">{errors.gender}</p>}
                </div>
              </div>

              <div className="addpet-field">
                <label>วันเกิด (โดยประมาณ)</label>
                <input type="date" value={birthDate} max={today} onChange={e => { setBirthDate(e.target.value); setErrors(p => ({ ...p, birthDate: '' })); }} />
                {errors.birthDate && <p className="error-msg">{errors.birthDate}</p>}
              </div>
              {age !== '' && <p className="addpet-age">อายุ {age} (โดยประมาณ)</p>}
            </div>

            {/* ========== คอลัมน์ 2: ข้อมูลสุขภาพ ========== */}
            <div className="addpet-card">
              <div className="addpet-section-title">ข้อมูลสุขภาพ</div>

              <div className="addpet-field">
                <label>วัคซีน (ครั้งล่าสุดโดยประมาณ)</label>

                {/* Rabies */}
                <div className="addpet-vaccine-item">
                  <label className="addpet-checkbox-item">
                    <input type="checkbox" checked={vaccineRabies} onChange={e => { setVaccineRabies(e.target.checked); if (!e.target.checked) setVacRabiesDate(''); setErrors(p => ({ ...p, vacRabiesDate: '' })); }} />
                    พิษสุนัขบ้า (Rabies)
                  </label>
                  {vaccineRabies && (
                    <div className="addpet-vaccine-date">
                      <label>วันที่ฉีดครั้งล่าสุด</label>
                      <input type="date" value={vacRabiesDate} max={today} onChange={e => { setVacRabiesDate(e.target.value); setErrors(p => ({ ...p, vacRabiesDate: '' })); }} />
                      {errors.vacRabiesDate && <p className="error-msg">{errors.vacRabiesDate}</p>}
                    </div>
                  )}
                </div>

                {/* DHPPi */}
                <div className="addpet-vaccine-item">
                  <label className="addpet-checkbox-item">
                    <input type="checkbox" checked={vaccineDHPPi} onChange={e => { setVaccineDHPPi(e.target.checked); if (!e.target.checked) setVacDhppiDate(''); setErrors(p => ({ ...p, vacDhppiDate: '' })); }} />
                    <span>วัคซีนรวมสุนัข DHPPi <span style={{ color: '#8D6E63', fontSize: 11 }}>(เฉพาะสุนัข)</span></span>
                  </label>
                  {vaccineDHPPi && (
                    <div className="addpet-vaccine-date">
                      <label>วันที่ฉีดครั้งล่าสุด</label>
                      <input type="date" value={vacDhppiDate} max={today} onChange={e => { setVacDhppiDate(e.target.value); setErrors(p => ({ ...p, vacDhppiDate: '' })); }} />
                      {errors.vacDhppiDate && <p className="error-msg">{errors.vacDhppiDate}</p>}
                    </div>
                  )}
                </div>

                {/* FVRCP */}
                <div className="addpet-vaccine-item">
                  <label className="addpet-checkbox-item">
                    <input type="checkbox" checked={vaccineFVRCP} onChange={e => { setVaccineFVRCP(e.target.checked); if (!e.target.checked) setVacFvrcpDate(''); setErrors(p => ({ ...p, vacFvrcpDate: '' })); }} />
                    <span>วัคซีนรวมแมว FVRCP <span style={{ color: '#8D6E63', fontSize: 11 }}>(เฉพาะแมว)</span></span>
                  </label>
                  {vaccineFVRCP && (
                    <div className="addpet-vaccine-date">
                      <label>วันที่ฉีดครั้งล่าสุด</label>
                      <input type="date" value={vacFvrcpDate} max={today} onChange={e => { setVacFvrcpDate(e.target.value); setErrors(p => ({ ...p, vacFvrcpDate: '' })); }} />
                      {errors.vacFvrcpDate && <p className="error-msg">{errors.vacFvrcpDate}</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* โรคประจำตัว */}
              <div className="addpet-field" style={{ marginTop: 12 }}>
                <label>โรคประจำตัว</label>
                <label className="addpet-checkbox-item" style={{ marginBottom: 6 }}>
                  <input type="checkbox" checked={hasDisease} onChange={e => setHasDisease(e.target.checked)} />
                  มีโรคประจำตัว
                </label>
                {hasDisease && (
                  <div className="addpet-disease-box">
                    <div>
                      <label>รายละเอียดโรคประจำตัว <span style={{ color: '#dc2626' }}>*</span></label>
                      <input type="text" value={diseaseDetail} onChange={e => { setDiseaseDetail(e.target.value); setErrors(p => ({ ...p, diseaseDetail: '' })); }} placeholder="กรอกรายละเอียดโรคประจำตัว" />
                      {errors.diseaseDetail && <p className="error-msg">{errors.diseaseDetail}</p>}
                    </div>
                    <div>
                      <label>อาการที่ต้องรีบพาไปหาหมอ</label>
                      <textarea value={emergencySymptoms} onChange={e => setEmergencySymptoms(e.target.value)} placeholder="กรอกอาการที่ต้องรีบพาไปหาหมอ" style={{ height: 50 }} />
                    </div>
                    <div>
                      <label>โรงพยาบาลสัตว์ / ติดต่อฉุกเฉิน</label>
                      <textarea value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} placeholder="กรอกชื่อโรงพยาบาลหรือเบอร์ติดต่อ" style={{ height: 50 }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ========== คอลัมน์ 3: ข้อมูลพฤติกรรม ========== */}
            <div className="addpet-card">
              <div className="addpet-section-title">ข้อมูลพฤติกรรม</div>

              <div className="addpet-behavior-group">
                <div className="addpet-behavior-label">ปฏิสัมพันธ์กับคน</div>
                <div className="addpet-checkbox-list">
                  <label className="addpet-checkbox-item"><input type="checkbox" checked={behaviorStressAlone} onChange={e => setBehaviorStressAlone(e.target.checked)} />เครียดเมื่อเจ้าของไม่อยู่</label>
                  <label className="addpet-checkbox-item"><input type="checkbox" checked={behaviorFriendly} onChange={e => setBehaviorFriendly(e.target.checked)} />เฟรนลี่ / ติดคน (ชอบเข้าหาคนตลอด)</label>
                  <label className="addpet-checkbox-item"><input type="checkbox" checked={behaviorFearStranger} onChange={e => setBehaviorFearStranger(e.target.checked)} />กลัวคนแปลกหน้า (ต้องรอปรับตัวเล็กน้อย)</label>
                </div>
              </div>

              <div className="addpet-behavior-group">
                <div className="addpet-behavior-label">เสียงและการตอบสนองต่อสิ่งกระตุ้น</div>
                <div className="addpet-checkbox-list">
                  <label className="addpet-checkbox-item"><input type="checkbox" checked={behaviorFearLoudSound} onChange={e => setBehaviorFearLoudSound(e.target.checked)} />กลัวเสียงดัง (ฟ้าร้อง / เครื่องใช้ไฟฟ้า)</label>
                  <label className="addpet-checkbox-item"><input type="checkbox" checked={behaviorBarkLoud} onChange={e => setBehaviorBarkLoud(e.target.checked)} />เห่า/ส่งเสียงดังเมื่อมีสิ่งกระตุ้น</label>
                </div>
              </div>

              <div className="addpet-behavior-group">
                <div className="addpet-behavior-label">พฤติกรรมเสี่ยงต่อการบาดเจ็บ</div>
                <div className="addpet-checkbox-list">
                  <label className="addpet-checkbox-item"><input type="checkbox" checked={behaviorDislikeTouch} onChange={e => setBehaviorDislikeTouch(e.target.checked)} />ไม่ชอบให้จับบางจุด (เช่น หู ท้อง ขา)</label>
                  <label className="addpet-checkbox-item"><input type="checkbox" checked={behaviorBiteScrath} onChange={e => setBehaviorBiteScrath(e.target.checked)} />กัดหรือข่วนเมื่อเครียด</label>
                  <label className="addpet-checkbox-item"><input type="checkbox" checked={behaviorEscapeExpert} onChange={e => setBehaviorEscapeExpert(e.target.checked)} />หนีเก่งเมื่อเปิดประตู</label>
                  <label className="addpet-checkbox-item"><input type="checkbox" checked={behaviorHighEnergy} onChange={e => setBehaviorHighEnergy(e.target.checked)} />เล่นแรง / พลังงานสูง</label>
                  <label className="addpet-checkbox-item"><input type="checkbox" checked={behaviorJumpOnPeople} onChange={e => setBehaviorJumpOnPeople(e.target.checked)} />กระโดดใส่คนหรือสิ่งของ</label>
                  <label className="addpet-checkbox-item"><input type="checkbox" checked={behaviorHardControl} onChange={e => setBehaviorHardControl(e.target.checked)} />ควบคุมยากเมื่อเครียด</label>
                </div>
              </div>
            </div>

          </div>

          {/* ปุ่ม */}
          <div className="btn-group">
            <button className="btn btn-back" onClick={() => navigate('/my-pets')}>ย้อนกลับ</button>
            <button className="btn-save" onClick={handleSave}>บันทึก</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddPet;