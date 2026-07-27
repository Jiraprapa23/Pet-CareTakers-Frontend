import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import loginPhoto from '../assets/login-photo.jpg';
import logo from '../assets/logo.png';

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('owner'); // 'owner' หรือ 'sitter'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Validate แล้ว Login
  const handleLogin = async () => {
    let valid = true;

    // เคลียร์ error เก่า
    setEmailError('');
    setPasswordError('');

    // ตรวจสอบอีเมล
    if (!email) {
      setEmailError('กรุณากรอกอีเมล');
      valid = false;
    } else if (/\s/.test(email)) {
      setEmailError('รูปแบบอีเมลไม่ถูกต้อง');
      valid = false;
    } else if (email.length < 5 || email.length > 50) {
      setEmailError('รูปแบบอีเมลไม่ถูกต้อง');
      valid = false;
    } else if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setEmailError('รูปแบบอีเมลไม่ถูกต้อง');
      valid = false;
    }

    // ตรวจสอบรหัสผ่าน
    if (!password) {
      setPasswordError('กรุณากรอกรหัสผ่าน');
      valid = false;
    } else if (/\s/.test(password)) {
      setPasswordError('รูปแบบรหัสผ่านไม่ถูกต้อง');
      valid = false;
    } else if (password.length < 8 || password.length > 15) {
      setPasswordError('รูปแบบรหัสผ่านไม่ถูกต้อง');
      valid = false;
    }

    if (!valid) return;

    // TODO: เรียก API Spring Boot ตรงนี้
    // ตอนนี้จำลอง error ก่อน
    // เรียก API Spring Boot
const url = role === 'owner'
? 'http://localhost:8096/api/auth/login-owner'
: 'http://localhost:8096/api/auth/login-sitter';

try {
const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

const data = await response.json();

if (!response.ok) {
  setPasswordError(data.message);
  return;
}

// Login สำเร็จ เก็บข้อมูลไว้ใช้
localStorage.setItem('user', JSON.stringify(data));

// Redirect ไปหน้าหลัก
if (role === 'owner') {
  navigate('/profile-owner');
} else {
  navigate('/profile-sitter');
}

} catch (error) {
setPasswordError('อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณากรอกใหม่อีกครั้ง');
}
  };

  return (
    <div>
      {/* Navbar */}
      <div className="navbar">
        <div className="navbar-logo">
          <img src={logo} alt="PetSitter Finder Logo" />
          <span className="navbar-logo-text">PetSitter<br />Finder</span>
        </div>
        <div className="navbar-title">
          ระบบตามหาผู้ดูแลสัตว์เลี้ยง<br />ภายในจังหวัดเชียงใหม่
        </div>
      </div>

      {/* Content */}
      <div className="login-page">
        {/* รูปภาพซ้าย */}
        <img
          src={loginPhoto}
          alt="คนกับสัตว์เลี้ยง"
          className="login-image"
        />

        {/* ฟอร์ม Login ขวา */}
        <div className="login-card">
          <h2 className="login-title">เข้าสู่ระบบ</h2>

          {/* Tab สลับบทบาท */}
          <div className="tab-wrap">
            <button
              className={`tab-btn ${role === 'owner' ? 'active' : ''}`}
              onClick={() => setRole('owner')}
            >
              เจ้าของสัตว์เลี้ยง
            </button>
            <button
              className={`tab-btn ${role === 'sitter' ? 'active' : ''}`}
              onClick={() => setRole('sitter')}
            >
              ผู้ดูแลสัตว์เลี้ยง
            </button>
          </div>

          {/* ช่องอีเมล */}
          <div className="form-field">
            <label>อีเมล</label>
            <input
              type="text"
              placeholder="กรอกอีเมล"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
            />
            {emailError && <p className="error-msg">{emailError}</p>}
          </div>

          {/* ช่องรหัสผ่าน */}
          <div className="form-field">
            <label>รหัสผ่าน</label>
            <input
              type="password"
              placeholder="กรอกรหัสผ่าน"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
            />
            <p style={{ fontSize: '12px', color: '#8D6E63', marginTop: '4px' }}>
                ต้องเป็นตัวอักษรภาษาอังกฤษหรือตัวเลข รวมอักษรพิเศษ [! # _ .] และมีความยาว 8-15 ตัวอักษร
            </p>
            {passwordError && <p className="error-msg">{passwordError}</p>}
          </div>

          {/* ลิงก์สมัครสมาชิก */}
          <div className="register-link">
            <a onClick={() => navigate(role === 'owner' ? '/register-owner' : '/register-sitter')}>
              ยังไม่มีบัญชี ?
            </a>
          </div>

          {/* ปุ่ม Login */}
          <button className="btn-login" onClick={handleLogin}>
            เข้าสู่ระบบ
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
