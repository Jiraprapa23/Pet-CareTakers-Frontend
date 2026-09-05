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

import { API_BASE_URL as API } from '../config';

// ข้อมูลอำเภอ-ตำบล-รหัสไปรษณีย์ เชียงใหม่
const CHIANGMAI_DATA = {
  "เมืองเชียงใหม่": { zip: "50000", subdistricts: ["ช้างม่อย", "ช้างคลาน", "วัดเกต", "ช้างเผือก", "สุเทพ", "แม่เหียะ", "ป่าแดด", "หนองหอย", "ท่าศาลา", "หนองป่าครั่ง", "ฟ้าฮ่าม", "ป่าตัน", "สันผีเสื้อ", "ศรีภูมิ", "พระสิงห์", "หายยา"], zips: {"ช้างม่อย":"50300", "ช้างคลาน":"50100", "วัดเกต":"50000", "ช้างเผือก":"50300", "สุเทพ":"50200", "แม่เหียะ":"50100", "ป่าแดด":"50100", "หนองหอย":"50000", "ท่าศาลา":"50000", "หนองป่าครั่ง":"50000", "ฟ้าฮ่าม":"50000", "ป่าตัน":"50300", "สันผีเสื้อ":"50300", "ศรีภูมิ":"50200", "พระสิงห์":"50200", "หายยา":"50100"} },
  "จอมทอง": { zip: "50160", subdistricts: ["บ้านหลวง", "ข่วงเปา", "สบเตี๊ยะ", "บ้านแปะ", "ดอยแก้ว", "แม่สอย"], zips: {"บ้านหลวง":"50160", "ข่วงเปา":"50160", "สบเตี๊ยะ":"50160", "บ้านแปะ":"50240", "ดอยแก้ว":"50160", "แม่สอย":"50240"} },
  "แม่แจ่ม": { zip: "50270", subdistricts: ["ช่างเคิ่ง", "ท่าผา", "บ้านทับ", "แม่ศึก", "แม่นาจร", "บ้านจันทร์", "ปางหินฝน", "กองแขก", "แม่แดด", "แจ่มหลวง"], zips: {"ช่างเคิ่ง":"50270", "ท่าผา":"50270", "บ้านทับ":"50270", "แม่ศึก":"50270", "แม่นาจร":"50270", "บ้านจันทร์":"58130", "ปางหินฝน":"50270", "กองแขก":"50270", "แม่แดด":"58130", "แจ่มหลวง":"58130"} },
  "เชียงดาว": { zip: "50170", subdistricts: ["เชียงดาว", "เมืองนะ", "เมืองงาย", "แม่นะ", "เมืองคอง", "ปิงโค้ง", "ทุ่งข้าวพวง"], zips: {"เชียงดาว":"50170", "เมืองนะ":"50170", "เมืองงาย":"50170", "แม่นะ":"50170", "เมืองคอง":"50170", "ปิงโค้ง":"50170", "ทุ่งข้าวพวง":"50170"} },
  "ดอยสะเก็ด": { zip: "50220", subdistricts: ["เชิงดอย", "สันปูเลย", "ลวงเหนือ", "ป่าป้อง", "สง่าบ้าน", "ป่าลาน", "ตลาดขวัญ", "สำราญราษฎร์", "แม่คือ", "ตลาดใหญ่", "แม่ฮ้อยเงิน", "แม่โป่ง", "ป่าเมี่ยง", "เทพเสด็จ"], zips: {"เชิงดอย":"50220", "สันปูเลย":"50220", "ลวงเหนือ":"50220", "ป่าป้อง":"50220", "สง่าบ้าน":"50220", "ป่าลาน":"50220", "ตลาดขวัญ":"50220", "สำราญราษฎร์":"50220", "แม่คือ":"50220", "ตลาดใหญ่":"50220", "แม่ฮ้อยเงิน":"50220", "แม่โป่ง":"50220", "ป่าเมี่ยง":"50220", "เทพเสด็จ":"50220"} },
  "แม่แตง": { zip: "50150", subdistricts: ["สันมหาพน", "แม่แตง", "ขี้เหล็ก", "ช่อแล", "แม่หอพระ", "สบเปิง", "บ้านเป้า", "สันป่ายาง", "ป่าแป๋", "เมืองก๋าย", "บ้านช้าง", "กื้ดช้าง", "อินทขิล", "สมก๋าย"], zips: {"สันมหาพน":"50150", "แม่แตง":"50150", "ขี้เหล็ก":"50150", "ช่อแล":"50150", "แม่หอพระ":"50150", "สบเปิง":"50150", "บ้านเป้า":"50150", "สันป่ายาง":"50330", "ป่าแป๋":"50150", "เมืองก๋าย":"50150", "บ้านช้าง":"50150", "กื้ดช้าง":"50150", "อินทขิล":"50150", "สมก๋าย":"50150"} },
  "แม่ริม": { zip: "50180", subdistricts: ["ริมใต้", "ริมเหนือ", "สันโป่ง", "ขี้เหล็ก", "สะลวง", "ห้วยทราย", "แม่แรม", "โป่งแยง", "แม่สา", "ดอนแก้ว", "เหมืองแก้ว"], zips: {"ริมใต้":"50180", "ริมเหนือ":"50180", "สันโป่ง":"50180", "ขี้เหล็ก":"50180", "สะลวง":"50330", "ห้วยทราย":"50180", "แม่แรม":"50180", "โป่งแยง":"50180", "แม่สา":"50180", "ดอนแก้ว":"50180", "เหมืองแก้ว":"50180"} },
  "สะเมิง": { zip: "50250", subdistricts: ["สะเมิงใต้", "สะเมิงเหนือ", "แม่สาบ", "บ่อแก้ว", "ยั้งเมิน"], zips: {"สะเมิงใต้":"50250", "สะเมิงเหนือ":"50250", "แม่สาบ":"50250", "บ่อแก้ว":"50250", "ยั้งเมิน":"50250"} },
  "ฝาง": { zip: "50110", subdistricts: ["เวียง", "ม่อนปิ่น", "แม่งอน", "แม่สูน", "สันทราย", "แม่คะ", "แม่ข่า", "โป่งน้ำร้อน"], zips: {"เวียง":"50110", "ม่อนปิ่น":"50110", "แม่งอน":"50320", "แม่สูน":"50110", "สันทราย":"50110", "แม่คะ":"50110", "แม่ข่า":"50320", "โป่งน้ำร้อน":"50110"} },
  "แม่อาย": { zip: "50280", subdistricts: ["แม่อาย", "แม่สาว", "สันต้นหมื้อ", "แม่นาวาง", "ท่าตอน", "บ้านหลวง", "มะลิกา"], zips: {"แม่อาย":"50280", "แม่สาว":"50280", "สันต้นหมื้อ":"50280", "แม่นาวาง":"50280", "ท่าตอน":"50280", "บ้านหลวง":"50280", "มะลิกา":"50280"} },
  "พร้าว": { zip: "50190", subdistricts: ["เวียง", "ทุ่งหลวง", "ป่าตุ้ม", "ป่าไหน่", "สันทราย", "บ้านโป่ง", "น้ำแพร่", "เขื่อนผาก", "แม่แวน", "แม่ปั๋ง", "โหล่งขอด"], zips: {"เวียง":"50190", "ทุ่งหลวง":"50190", "ป่าตุ้ม":"50190", "ป่าไหน่":"50190", "สันทราย":"50190", "บ้านโป่ง":"50190", "น้ำแพร่":"50190", "เขื่อนผาก":"50190", "แม่แวน":"50190", "แม่ปั๋ง":"50190", "โหล่งขอด":"50190"} },
  "สันป่าตอง": { zip: "50120", subdistricts: ["ยุหว่า", "สันกลาง", "ท่าวังพร้าว", "มะขามหลวง", "แม่ก๊า", "บ้านแม", "บ้านกลาง", "ทุ่งสะโตก", "ทุ่งต้อม", "น้ำบ่อหลวง", "มะขุนหวาน"], zips: {"ยุหว่า":"50120", "สันกลาง":"50120", "ท่าวังพร้าว":"50120", "มะขามหลวง":"50120", "แม่ก๊า":"50120", "บ้านแม":"50120", "บ้านกลาง":"50120", "ทุ่งสะโตก":"50120", "ทุ่งต้อม":"50120", "น้ำบ่อหลวง":"50120", "มะขุนหวาน":"50120"} },
  "สันกำแพง": { zip: "50130", subdistricts: ["สันกำแพง", "ทรายมูล", "ร้องวัวแดง", "บวกค้าง", "แช่ช้าง", "ออนใต้", "แม่ปูคา", "ห้วยทราย", "ต้นเปา", "สันกลาง"], zips: {"สันกำแพง":"50130", "ทรายมูล":"50130", "ร้องวัวแดง":"50130", "บวกค้าง":"50130", "แช่ช้าง":"50130", "ออนใต้":"50130", "แม่ปูคา":"50130", "ห้วยทราย":"50130", "ต้นเปา":"50130", "สันกลาง":"50130"} },
  "สันทราย": { zip: "50210", subdistricts: ["สันทรายหลวง", "สันทรายน้อย", "สันพระเนตร", "สันนาเม็ง", "สันป่าเปา", "หนองแหย่ง", "หนองจ๊อม", "หนองหาร", "แม่แฝก", "แม่แฝกใหม่", "เมืองเล็น", "ป่าไผ่"], zips: {"สันทรายหลวง":"50210", "สันทรายน้อย":"50210", "สันพระเนตร":"50210", "สันนาเม็ง":"50210", "สันป่าเปา":"50210", "หนองแหย่ง":"50210", "หนองจ๊อม":"50210", "หนองหาร":"50290", "แม่แฝก":"50290", "แม่แฝกใหม่":"50290", "เมืองเล็น":"50210", "ป่าไผ่":"50210"} },
  "หางดง": { zip: "50230", subdistricts: ["หางดง", "หนองแก๋ว", "หารแก้ว", "หนองตอง", "ขุนคง", "สบแม่ข่า", "บ้านแหวน", "สันผักหวาน", "หนองควาย", "บ้านปง", "น้ำแพร่"], zips: {"หางดง":"50230", "หนองแก๋ว":"50230", "หารแก้ว":"50230", "หนองตอง":"50340", "ขุนคง":"50230", "สบแม่ข่า":"50230", "บ้านแหวน":"50230", "สันผักหวาน":"50230", "หนองควาย":"50230", "บ้านปง":"50230", "น้ำแพร่":"50230"} },
  "ฮอด": { zip: "50240", subdistricts: ["หางดง", "ฮอด", "บ้านตาล", "บ่อหลวง", "บ่อสลี", "นาคอเรือ"], zips: {"หางดง":"50240", "ฮอด":"50240", "บ้านตาล":"50240", "บ่อหลวง":"50240", "บ่อสลี":"50240", "นาคอเรือ":"50240"} },
  "ดอยเต่า": { zip: "50260", subdistricts: ["ดอยเต่า", "ท่าเดื่อ", "มืดกา", "บ้านแอ่น", "บงตัน", "โปงทุ่ง"], zips: {"ดอยเต่า":"50260", "ท่าเดื่อ":"50260", "มืดกา":"50260", "บ้านแอ่น":"50260", "บงตัน":"50260", "โปงทุ่ง":"50260"} },
  "อมก๋อย": { zip: "50310", subdistricts: ["อมก๋อย", "ยางเปียง", "แม่ตื่น", "ม่อนจอง", "สบโขง", "นาเกียน"], zips: {"อมก๋อย":"50310", "ยางเปียง":"50310", "แม่ตื่น":"50310", "ม่อนจอง":"50310", "สบโขง":"50310", "นาเกียน":"50310"} },
  "สารภี": { zip: "50140", subdistricts: ["ยางเนิ้ง", "สารภี", "ชมภู", "ไชยสถาน", "ขัวมุง", "หนองแฝก", "หนองผึ้ง", "ท่ากว้าง", "ดอนแก้ว", "ท่าวังตาล", "สันทราย", "ป่าบง"], zips: {"ยางเนิ้ง":"50140", "สารภี":"50140", "ชมภู":"50140", "ไชยสถาน":"50140", "ขัวมุง":"50140", "หนองแฝก":"50140", "หนองผึ้ง":"50140", "ท่ากว้าง":"50140", "ดอนแก้ว":"50140", "ท่าวังตาล":"50140", "สันทราย":"50140", "ป่าบง":"50140"} },
  "เวียงแหง": { zip: "50350", subdistricts: ["เมืองแหง", "เปียงหลวง", "แสนไห"], zips: {"เมืองแหง":"50350", "เปียงหลวง":"50350", "แสนไห":"50350"} },
  "ไชยปราการ": { zip: "50320", subdistricts: ["ปงตำ", "ศรีดงเย็น", "แม่ทะลบ", "หนองบัว"], zips: {"ปงตำ":"50320", "ศรีดงเย็น":"50320", "แม่ทะลบ":"50320", "หนองบัว":"50320"} },
  "แม่วาง": { zip: "50360", subdistricts: ["บ้านกาด", "ทุ่งปี้", "ทุ่งรวงทอง", "แม่วิน", "ดอนเปา"], zips: {"บ้านกาด":"50360", "ทุ่งปี้":"50360", "ทุ่งรวงทอง":"50360", "แม่วิน":"50360", "ดอนเปา":"50360"} },
  "แม่ออน": { zip: "50130", subdistricts: ["ออนเหนือ", "ออนกลาง", "บ้านสหกรณ์", "ห้วยแก้ว", "แม่ทา", "ทาเหนือ"], zips: {"ออนเหนือ":"50130", "ออนกลาง":"50130", "บ้านสหกรณ์":"50130", "ห้วยแก้ว":"50130", "แม่ทา":"50130", "ทาเหนือ":"50130"} },
  "ดอยหล่อ": { zip: "50160", subdistricts: ["ดอยหล่อ", "สองแคว", "ยางคราม", "สันติสุข"], zips: {"ดอยหล่อ":"50160", "สองแคว":"50160", "ยางคราม":"50160", "สันติสุข":"50160"} },
};

function MapPicker({ position, setPosition }) {
  useMapEvents({ click(e) { setPosition([e.latlng.lat, e.latlng.lng]); } });
  return position ? <Marker position={position} /> : null;
}

function AddAnnouncement() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const imageUrl = user.profileImage && user.profileImage !== 'default.png'
    ? `/images/owners/${user.profileImage}` : null;

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
      setSubdistrict(user.subdistrict || '');
      setZipcode(user.zipcode || '');
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
    if (useOwnerAddress) {
      if (!user.addressNo || !user.district || !user.subdistrict) {
        e.ownerAddress = 'โปรไฟล์ของคุณยังไม่มีที่อยู่ครบถ้วน กรุณาไปแก้ไขโปรไฟล์ก่อน';
      }
      if (!user.latitude || !user.longitude) {
        e.ownerAddress = 'โปรไฟล์ของคุณยังไม่ได้ปักหมุดตำแหน่ง กรุณาไปแก้ไขโปรไฟล์ก่อน';
      }
    } else {
      if (!addressNo.trim()) e.addressNo = 'กรุณากรอกบ้านเลขที่';
      if (!district) e.district = 'กรุณาเลือกอำเภอ';
      if (!subdistrict) e.subdistrict = 'กรุณาเลือกตำบล';
      if (!mapPosition) e.mapPosition = 'กรุณาเลือกตำแหน่งจากแผนที่';
    }
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
          <div className="topbar-title">ระบบตามหาผู้ดูแลสัตว์เลี้ยง<br />ภายในจังหวัดเชียงใหม่</div>
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
                    <label style={{color:'#7FB3D9'}}>เลือกสัตว์เลี้ยง</label>
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
                    <label style={{color:'#7FB3D9'}}>น้ำหนักปัจจุบัน</label>
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
                    <div className="ann-pet-preview-name">{selectedPet.petName}</div>
                    <div className="ann-pet-preview-photo">
                      {selectedPet.petImage && selectedPet.petImage !== 'default.png'
                        ? <img src={`/images/pets/${selectedPet.petImage}`} alt={selectedPet.petName} className="ann-pet-preview-img-el" />
                        : <div className="ann-pet-preview-placeholder">{getPetEmoji(selectedPet.petType?.petTypeName)}</div>
                      }
                    </div>
                    <div className="ann-pet-preview-body">
                      <div className="ann-pet-preview-row">
                        <b>ประเภทสัตว์</b> {selectedPet.petType?.petTypeName} {getPetEmoji(selectedPet.petType?.petTypeName)}
                        {selectedPet.breed && <>&nbsp;&nbsp;<b>สายพันธุ์</b> {selectedPet.breed}</>}
                      </div>
                      <div className={`ann-pet-preview-gender ${selectedPet.gender === 'เพศผู้' ? 'male' : 'female'}`}>
                        {selectedPet.gender === 'เพศผู้' ? '♂' : '♀'} {selectedPet.gender}
                      </div>
                      <div className="ann-pet-preview-age">
                        วันเกิด <span>{formatDate(selectedPet.birthDate)}</span>
                        {' · '}อายุ <span>{calcAge(selectedPet.birthDate)}</span>
                        <span style={{ color: '#aaa', fontSize: 10 }}> (โดยประมาณ)</span>
                      </div>
                      <button className="ann-pet-detail-btn" onClick={() => navigate(`/pet-detail/${selectedPet.petID}`)}>รายละเอียด</button>
                    </div>
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
                    <input type="date" value={startdate} min={today} onChange={e => { setStartdate(e.target.value); setEnddate(e.target.value); setErrors(p => ({...p, startdate:'', enddate:''})); }} />
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
                  <label style={{color:'#3023ED'}}>ช่วงเวลาการดูแล <span className="ann-sublabel">(เลือกได้มากกว่า 1 ช่วง)</span></label>
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
                  <label style={{color:'#3023ED'}}>การให้อาหาร</label>
                  <div className="ann-cb-list">
                    <label className="ann-cb-item"><input type="checkbox" checked={feedMorning} onChange={e => setFeedMorning(e.target.checked)} />ช่วงเช้า : 06:00น. - 10:00น.</label>
                    <label className="ann-cb-item"><input type="checkbox" checked={feedAfternoon} onChange={e => setFeedAfternoon(e.target.checked)} />ช่วงกลางวัน : 11:00น. - 15:00น.</label>
                    <label className="ann-cb-item"><input type="checkbox" checked={feedEvening} onChange={e => setFeedEvening(e.target.checked)} />ช่วงเย็น : 16:00น. - 20:00น.</label>
                    <label className="ann-cb-item"><input type="checkbox" checked={feedNight} onChange={e => setFeedNight(e.target.checked)} />ช่วงดึก : 21:00น. - 24:00น.</label>
                  </div>
                </div>

                {/* ปริมาณอาหาร */}
                <div className="ann-field">
                  <label style={{color:'#3023ED'}}>ปริมาณอาหาร</label>
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
                  <label style={{color:'#3023ED'}}>การป้อนยา</label>
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

                <div className="ann-sec-title" style={{color:'#3023ED'}}>ที่อยู่</div>

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
                        <label style={{color:'#7FB3D9'}}>บ้านเลขที่</label>
                        <input type="text" value={addressNo} onChange={e => { setAddressNo(e.target.value); setErrors(p => ({...p, addressNo:''})); }} placeholder="เช่น 239/1" />
                        {errors.addressNo && <p className="error-msg">{errors.addressNo}</p>}
                      </div>
                      <div className="ann-field">
                        <label style={{color:'#7FB3D9'}}>ถนน/เขต</label>
                        <input type="text" value={street} onChange={e => setStreet(e.target.value)} placeholder="-" />
                      </div>
                    </div>

                    <div className="ann-field-row">
                      <div className="ann-field">
                        <label style={{color:'#7FB3D9'}}>จังหวัด</label>
                        <input type="text" value="เชียงใหม่" disabled style={{background:'#f5f5f5',color:'#999'}} />
                      </div>
                      <div className="ann-field">
                        <label style={{color:'#7FB3D9'}}>อำเภอ</label>
                        <select value={district} onChange={e => { setDistrict(e.target.value); setErrors(p => ({...p, district:''})); }}>
                          <option value="">-- เลือก --</option>
                          {Object.keys(CHIANGMAI_DATA).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        {errors.district && <p className="error-msg">{errors.district}</p>}
                      </div>
                    </div>

                    <div className="ann-field-row">
                      <div className="ann-field">
                        <label style={{color:'#7FB3D9'}}>ตำบล</label>
                        <select value={subdistrict} onChange={e => { setSubdistrict(e.target.value); setErrors(p => ({...p, subdistrict:''})); }} disabled={!district}>
                          <option value="">-- เลือก --</option>
                          {subdistricts.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {errors.subdistrict && <p className="error-msg">{errors.subdistrict}</p>}
                      </div>
                      <div className="ann-field">
                        <label style={{color:'#7FB3D9'}}>รหัสไปรษณีย์</label>
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
                    {errors.ownerAddress && <p className="error-msg">{errors.ownerAddress}</p>}
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
                        <span style={{color:'#1a1a1a',fontSize:12}}>{parseFloat(user.latitude).toFixed(5)}, {parseFloat(user.longitude).toFixed(5)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ปุ่ม */}
            <div className="btn-group" style={{marginTop:16}}>
  
              <button className="btn-save" onClick={handleSave}>บันทึก</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddAnnouncement;