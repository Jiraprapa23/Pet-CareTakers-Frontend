import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import './NotificationBell.css';

import { API_BASE_URL as API } from '../config';

function NotificationBell({ userID, userRole }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const ref = useRef(null);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API}/api/notification/${userID}/${userRole}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setNotifications(list);
      const unread = list.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (userID && userRole) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // ดึงทุก 30 วิ
      return () => clearInterval(interval);
    }
  }, [userID, userRole]);

  // ปิด dropdown เมื่อคลิกข้างนอก (เช็คทั้งปุ่มกระดิ่งและกล่อง dropdown ที่ portal ออกไปที่ body)
  useEffect(() => {
    const handleClick = (e) => {
      const clickedBell = ref.current && ref.current.contains(e.target);
      const clickedDropdown = dropdownRef.current && dropdownRef.current.contains(e.target);
      if (!clickedBell && !clickedDropdown) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ปิด dropdown ถ้ามีการ scroll หรือ resize หน้าจอ เพื่อไม่ให้ตำแหน่งเพี้ยน
  useEffect(() => {
    if (!open) return;
    const handleScrollResize = () => setOpen(false);
    window.addEventListener('resize', handleScrollResize);
    window.addEventListener('scroll', handleScrollResize, true);
    return () => {
      window.removeEventListener('resize', handleScrollResize);
      window.removeEventListener('scroll', handleScrollResize, true);
    };
  }, [open]);

  const handleOpen = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const dropdownWidth = 320;
      let left = rect.right - dropdownWidth;
      if (left < 8) left = 8; // กันไม่ให้หลุดขอบจอด้านซ้าย
      setCoords({ top: rect.bottom + 10, left });
      fetchNotifications();
    }
    setOpen(!open);
  };

  const handleRead = async (notifID, announceID) => {
    try {
      await fetch(`${API}/api/notification/read/${notifID}`, { method: 'PUT' });
      fetchNotifications();
      setOpen(false);
      if (announceID) {
        if (userRole === 'OWNER') navigate(`/announcement-detail/${announceID}`);
        else navigate(`/announcement-detail-sitter/${announceID}`);
      }
    } catch (err) { console.error(err); }
  };

  const handleReadAll = async () => {
    try {
      await fetch(`${API}/api/notification/read-all/${userID}/${userRole}`, { method: 'PUT' });
      fetchNotifications();
    } catch (err) { console.error(err); }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'เมื่อกี้';
    if (diff < 3600) return `${Math.floor(diff/60)} นาทีที่แล้ว`;
    if (diff < 86400) return `${Math.floor(diff/3600)} ชั่วโมงที่แล้ว`;
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  };

  return (
    <div className="notif-wrap" ref={ref}>
      <button className="notif-bell-btn" onClick={handleOpen}>
        🔔
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {open && createPortal(
        <div className="notif-dropdown" ref={dropdownRef} style={{ top: coords.top, left: coords.left }}>
          <div className="notif-dropdown-header">
            <span className="notif-dropdown-title">การแจ้งเตือน</span>
            {unreadCount > 0 && (
              <button className="notif-read-all-btn" onClick={handleReadAll}>อ่านทั้งหมด</button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">ไม่มีการแจ้งเตือนครับ</div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.notifID}
                  className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                  onClick={() => handleRead(n.notifID, n.announceID)}
                >
                  <div className="notif-msg">{n.message}</div>
                  <div className="notif-time">{formatTime(n.createdAt)}</div>
                  {!n.isRead && <div className="notif-dot" />}
                </div>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default NotificationBell;
