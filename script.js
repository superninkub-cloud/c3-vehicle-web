// --- ข้อมูลพื้นฐานสำหรับแสดงผล (เผื่อกรณียังไม่ต่อเน็ต/ต่อฐานข้อมูล) ---
const vehicleChecklist = [
    "ตรวจบันทึกประวัติต่างๆ", "แผนการบำรุงรักษา", "การต่อทะเบียน/ป้าย", "ความสะอาดห้องเครื่อง",
    "รอยรั่วน้ำมันต่างๆ", "สายพาน หม้อน้ำ พัดลม", "ระดับน้ำมันเครื่อง", "เกียร์", "ครัช", "เบรก",
    "แสงสว่าง", "สัญญาณแตร/ไฟเลี้ยว", "ไฟท้าย/เบรก", "แบตเตอรี่", "ปัดน้ำฝน", "เครื่องปรับอากาศ",
    "ระยะฟรีพวงมาลัย", "การทำงานเบรคมือ", "ตัวถัง/สี", "กระบะบรรทุก", "เบาะนั่ง"
];

const craneChecklist = [
    "ระบบคอนโทรล", "เกียร์ฝาก (PTO)", "ปั๊มไฮดรอลิค", "สายไฮดรอลิค", "น้ำมันไฮดรอลิค",
    "กระบอกหมุนเครน", "เสาเครน/ลูกปืน", "กระบอกขาค้ำยัน", "กระบอกยกบูม", "กระบอกยืดหด",
    "ชุดวิ้นซ์-เบรควิ้นซ์", "ลวดสลิง", "รอก", "หัวเจาะ", "ฮุก/เซฟตี้ล็อค", "ไฟสัญญาณเตือน"
];

let masterCars = [];
let masterInspectors = [];

// --- การตั้งค่า Supabase ---
let supabase = null;
const SUPABASE_URL_KEY = 'C3_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'C3_SUPABASE_KEY';

function initSupabase() {
    // หากต้องการฝังค่าถาวร (Hardcode) เพื่อไม่ต้องกรอกทุกครั้ง สามารถใส่ค่าในเครื่องหมายคำพูดด้านล่างนี้ได้เลย
    const hardcodedUrl = "https://imxqmofvoklxgjwsgvvq.supabase.co"; 
    const hardcodedKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlteHFtb2Z2b2tseGdqd3NndnZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NDk4NTgsImV4cCI6MjEwMDEyNTg1OH0.BFs6cW9NqaSlujhWu5QJOZL_N8GycXQpiVsqp1lV0vM";

    const url = localStorage.getItem(SUPABASE_URL_KEY) || hardcodedUrl;
    const key = localStorage.getItem(SUPABASE_ANON_KEY) || hardcodedKey;

    if (url && key) {
        if (typeof window.supabase === 'undefined') {
            updateConnectionStatus(false);
            console.error("Supabase CDN not loaded.");
            return;
        }
        // ใช้ Supabase จาก CDN (โหลดใน HTML แล้ว)
        supabase = window.supabase.createClient(url, key);
        updateConnectionStatus(true);
        document.getElementById('supaUrl').value = url;
        document.getElementById('supaKey').value = key;

        // เมื่อเชื่อมต่อแล้ว ดึงข้อมูลตั้งต้นจากฐานข้อมูล
        fetchMasterData();
    } else {
        updateConnectionStatus(false);
    }
}

function updateConnectionStatus(isConnected) {
    const indicator = document.getElementById('statusIndicator');
    const text = document.getElementById('statusText');

    if (isConnected) {
        indicator.style.background = 'var(--success)';
        text.innerText = 'เชื่อมต่อฐานข้อมูล Supabase แล้ว (ออนไลน์)';
    } else {
        indicator.style.background = 'var(--warning)';
        text.innerText = 'ทำงานแบบออฟไลน์ (โปรดไปที่เมนูตั้งค่าฐานข้อมูล)';
    }
}

function saveSupabaseSettings(e) {
    e.preventDefault();
    const url = document.getElementById('supaUrl').value.trim();
    const key = document.getElementById('supaKey').value.trim();

    localStorage.setItem(SUPABASE_URL_KEY, url);
    localStorage.setItem(SUPABASE_ANON_KEY, key);

    initSupabase();

    Swal.fire({
        icon: 'success',
        title: 'บันทึกการตั้งค่าสำเร็จ',
        text: 'ระบบกำลังโหลดข้อมูลจาก Supabase...'
    }).then(() => {
        switchView('dashboard');
    });
}

// --- ดึงข้อมูลจากฐานข้อมูล ---
async function fetchMasterData() {
    if (!supabase) return;

    try {
        // ดึงรถ
        const { data: cars, error: err1 } = await supabase.from('vehicles').select('*');
        if (!err1 && cars) {
            masterCars = cars.map(c => ({ plate: c.plate_number, driver: c.default_driver }));
            if (!masterCars.find(c => c.plate === '90-1843 นฐ')) {
                masterCars.push({ plate: '90-1843 นฐ', driver: 'นายขวัญนคร ศรีจันทร์อินทร์' });
            }
            masterCars.sort((a, b) => a.plate.localeCompare(b.plate, 'th'));
        }

        // ดึงผู้ตรวจ
        const { data: insp, error: err2 } = await supabase.from('inspectors').select('*');
        if (!err2 && insp) {
            masterInspectors = insp.map(i => i.full_name);
            if (!masterInspectors.includes('นายขวัญนคร ศรีจันทร์อินทร์')) {
                masterInspectors.push('นายขวัญนคร ศรีจันทร์อินทร์');
            }
            masterInspectors.sort((a, b) => a.localeCompare(b, 'th'));
        }

        populateDropdowns();
        loadDashboard();
    } catch (error) {
        console.error("Error fetching master data:", error);
    }
}

// --- UI Logic ---
let Toast = null;
try {
    if (typeof Swal !== 'undefined') {
        Toast = Swal.mixin({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
            timerProgressBar: true, didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });
    }
} catch (e) {
    console.warn("SweetAlert not loaded.");
}

window.onload = () => {
    // โหลดตาราง
    renderChecklist('vehicleChecklistBody', vehicleChecklist, 'v');
    renderChecklist('craneChecklistBody', craneChecklist, 'c');

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('vCheckDate').value = today;
    document.getElementById('cCheckDate').value = today;
    document.getElementById('dashDate').value = today;

    setTimeout(() => setProgressRing(100), 500);

    initSupabase();
};

function populateDropdowns() {
    let plateHtml = '<option value="">-- เลือกทะเบียน --</option>';
    masterCars.forEach(car => plateHtml += `<option value="${car.plate}">${car.plate}</option>`);
    plateHtml += '<option value="อื่นๆ">อื่นๆ</option>';

    document.getElementById('vPlate').innerHTML = plateHtml;
    
    const noCranePlates = ["90-1844 นฐ", "89-5769 นฐ", "90-1845 นฐ", "90-1842 นฐ", "90-1843 นฐ"];
    let cranePlateHtml = '<option value="">-- เลือกทะเบียน --</option>';
    masterCars.forEach(car => {
        if (!noCranePlates.includes(car.plate) && !car.plate.includes("หาง")) {
            cranePlateHtml += `<option value="${car.plate}">${car.plate}</option>`;
        }
    });
    cranePlateHtml += '<option value="อื่นๆ">อื่นๆ</option>';

    document.getElementById('cPlate').innerHTML = cranePlateHtml;

    let inspHtml = '<option value="">-- เลือกผู้ตรวจ --</option>';
    masterInspectors.forEach(n => inspHtml += `<option value="${n}">${n}</option>`);

    document.getElementById('vInspector').innerHTML = inspHtml;
    document.getElementById('cInspector').innerHTML = inspHtml;
}

function switchView(viewId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    document.getElementById(viewId).classList.add('active');

    // Highlight the correct sidebar item based on viewId
    const navItems = document.querySelectorAll('.nav-item');
    if (viewId === 'dashboard') navItems[0].classList.add('active');
    if (viewId === 'vehicle-form') navItems[1].classList.add('active');
    if (viewId === 'crane-form') navItems[2].classList.add('active');
    if (viewId === 'summary') navItems[3].classList.add('active');
    if (viewId === 'settings') navItems[4].classList.add('active');

    let titleMap = {
        'dashboard': 'ภาพรวม (Dashboard)',
        'vehicle-form': 'ตรวจรถยนต์',
        'crane-form': 'ตรวจเครนไฮดรอลิค',
        'summary': 'สรุปส่งไลน์',
        'settings': 'ตั้งค่าระบบ'
    };
    document.getElementById('pageTitle').innerText = titleMap[viewId];

    if (window.innerWidth <= 992) toggleSidebar();
    if (viewId === 'summary') loadSummaryData();
    if (viewId === 'dashboard') loadDashboard();

    document.getElementById('contentArea').scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('show');
    document.getElementById('mobileOverlay').classList.toggle('show');
}

function renderChecklist(containerId, items, prefix) {
    const tbody = document.getElementById(containerId);
    let html = '';
    items.forEach((item, i) => {
        let idx = i + 1;
        html += `
            <tr>
                <td><div class="fw-medium text-dark">${idx}. ${item}</div></td>
                <td class="text-center">
                    <div class="segmented-control">
                        <input type="radio" name="status_${idx}" id="${prefix}_ok_${idx}" value="ปกติ" checked>
                        <label for="${prefix}_ok_${idx}"><i class="ph ph-check"></i> ปกติ</label>
                        
                        <input type="radio" name="status_${idx}" id="${prefix}_fix_${idx}" value="แก้ไข">
                        <label for="${prefix}_fix_${idx}"><i class="ph ph-wrench"></i> แก้ไข</label>
                    </div>
                </td>
                <td>
                    <input type="text" class="form-control" name="defect_${idx}" placeholder="ระบุอาการ..." style="background: white;">
                </td>
            </tr>`;
    });
    tbody.innerHTML = html;
}

// --- Submit Forms (Supabase) ---
async function submitForm(e, carType) {
    e.preventDefault();
    if (!supabase) {
        Swal.fire({ icon: 'warning', title: 'ยังไม่ได้เชื่อมต่อฐานข้อมูล', text: 'กรุณาไปที่เมนูตั้งค่าและใส่ข้อมูล Supabase ก่อน' });
        return;
    }

    const formId = carType === 'รถยนต์' ? 'vehicleChecklistForm' : 'craneChecklistForm';
    const btnId = carType === 'รถยนต์' ? 'btnSubmitVehicle' : 'btnSubmitCrane';
    const btn = document.getElementById(btnId);
    const originalText = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = '<i class="ph ph-spinner ph-spin fs-5"></i> กำลังบันทึกข้อมูล...';

    const formData = new FormData(document.getElementById(formId));
    const dataObj = Object.fromEntries(formData.entries());

    // ตรวจสอบความผิดปกติ
    let issues = [];
    let isDefective = false;
    for (let key in dataObj) {
        if (key.startsWith("status_") && dataObj[key] === "แก้ไข") {
            const index = key.split("_")[1];
            const defect = dataObj["defect_" + index] || "ไม่ระบุอาการ";
            issues.push(`ข้อ ${index}: ${defect}`);
            isDefective = true;
        }
    }

    const payload = {
        check_date: dataObj.checkDate,
        plate_number: dataObj.licensePlate,
        car_type: carType,
        inspector_name: dataObj.inspectorName,
        is_defective: isDefective,
        issues_list: issues.join(", "),
        raw_json: dataObj
    };

    try {
        const { error } = await supabase.from('inspections').insert([payload]);
        if (error) throw error;

        Toast.fire({ icon: 'success', title: 'บันทึกข้อมูลลงฐานข้อมูลเรียบร้อยแล้ว!' });
        document.getElementById(formId).reset();

        // Reset Date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById(carType === 'รถยนต์' ? 'vCheckDate' : 'cCheckDate').value = today;

    } catch (err) {
        Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: err.message });
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// --- Dashboard Logic ---
function setProgressRing(percent) {
    const circle = document.getElementById('dashProgress');
    const offset = 440 - (percent / 100) * 440;
    circle.style.strokeDashoffset = offset;

    if (percent === 100) {
        circle.style.stroke = 'var(--success)';
        document.querySelector('.ring-icon').className = 'ph-fill ph-check-circle ring-icon';
        document.querySelector('.ring-icon').style.color = 'var(--success)';
    } else if (percent > 50) {
        circle.style.stroke = 'var(--warning)';
        document.querySelector('.ring-icon').className = 'ph-fill ph-warning-circle ring-icon';
        document.querySelector('.ring-icon').style.color = 'var(--warning)';
    } else {
        circle.style.stroke = 'var(--danger)';
        document.querySelector('.ring-icon').className = 'ph-fill ph-x-circle ring-icon';
        document.querySelector('.ring-icon').style.color = 'var(--danger)';
    }
}

async function loadDashboard() {
    if (!supabase) return;

    const dateVal = document.getElementById('dashDate').value;
    const issueBody = document.getElementById('dashIssueBody');
    const missingList = document.getElementById('dashMissingList');

    issueBody.innerHTML = '<tr><td colspan="3" class="text-center py-4"><i class="ph ph-spinner ph-spin fs-4 text-primary"></i> กำลังโหลด...</td></tr>';
    missingList.innerHTML = '<div class="text-center py-4"><i class="ph ph-spinner ph-spin fs-4 text-warning"></i></div>';

    try {
        const { data: records, error } = await supabase
            .from('inspections')
            .select('*')
            .eq('check_date', dateVal);

        if (error) throw error;

        issueBody.innerHTML = ''; missingList.innerHTML = '';
        let inspectedPlates = [];

        records.forEach(record => {
            inspectedPlates.push(record.plate_number);
            if (record.is_defective) {
                issueBody.innerHTML += `
                    <tr>
                        <td>
                            <div class="fw-bold text-danger d-flex align-items-center gap-2">
                                <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--danger);"></div>
                                ${record.plate_number}
                            </div>
                        </td>
                        <td>${record.inspector_name}</td>
                        <td class="text-muted">${record.issues_list}</td>
                    </tr>`;
            }
        });

        let missingCount = 0;
        masterCars.forEach(car => {
            if (!inspectedPlates.includes(car.plate)) {
                missingCount++;
                missingList.innerHTML += `
                    <div class="dash-item">
                        <div class="d-flex flex-column">
                            <span class="fw-bold text-dark">${car.plate}</span>
                            <span class="text-muted" style="font-size: 13px">${car.driver || 'ไม่ระบุคนขับ'}</span>
                        </div>
                        <span class="badge" style="background: var(--warning-light); color: var(--warning); padding: 6px 10px; border-radius: 6px;">รอตรวจ</span>
                    </div>`;
            }
        });

        const totalCars = masterCars.length || 1;
        const inspectedCount = masterCars.length - missingCount;
        const percent = Math.round((inspectedCount / totalCars) * 100);
        setProgressRing(percent);

        if (issueBody.innerHTML === '') {
            issueBody.innerHTML = `
                <tr><td colspan="3" class="text-center py-5">
                    <div class="d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px; border-radius: 50%; background: var(--success-light); color: var(--success);">
                        <i class="ph-fill ph-check-circle fs-1"></i>
                    </div>
                    <h5 class="fw-bold text-dark">ปกติทุกคัน!</h5>
                    <p class="text-muted mb-0">ไม่มีรายงานรถชำรุดในวันนี้</p>
                </td></tr>`;
        }

        if (missingList.innerHTML === '') {
            missingList.innerHTML = `
                <div class="text-center py-5">
                    <div class="d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px; border-radius: 50%; background: var(--success-light); color: var(--success);">
                        <i class="ph-fill ph-clipboard-text fs-1"></i>
                    </div>
                    <h5 class="fw-bold text-dark">ตรวจครบ 100%</h5>
                    <p class="text-muted mb-0">ยอดเยี่ยมมาก!</p>
                </div>`;
        }
    } catch (err) {
        console.error("Dashboard Error:", err);
    }
}

// --- Line Summary Logic ---
let recentRecords = [];
async function loadSummaryData() {
    if (!supabase) return;

    document.getElementById('recordSelect').innerHTML = '<option value="">-- กำลังดึงข้อมูลล่าสุด... --</option>';
    try {
        const { data, error } = await supabase
            .from('inspections')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(30);

        if (error) throw error;
        recentRecords = data;

        let html = '<option value="">-- เลือกรถที่เพิ่งตรวจล่าสุด --</option>';
        data.forEach((r, i) => {
            let d = new Date(r.check_date);
            html += `<option value="${i}">🚗 ${r.plate_number} (ตรวจ ${d.getDate()}/${d.getMonth() + 1} - ${r.inspector_name})</option>`;
        });
        document.getElementById('recordSelect').innerHTML = html;
    } catch (err) {
        console.error("Summary Error:", err);
    }
}

function generateText() {
    const index = document.getElementById('recordSelect').value;
    if (!index) return document.getElementById('outputText').value = "";

    const r = recentRecords[index];
    let d = new Date(r.check_date);
    let thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

    document.getElementById('outputText').value = `วันที่ ${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}
ผกร.กรย.กฟก.3 ตรวจสอบยานพาหนะ
ทะเบียน ${r.plate_number} ก่อนออกปฏิบัติงาน 
เพื่อความปลอดภัย ได้ดำเนินการตรวจสอบ ดังนี้

✅ ระดับน้ำมันเครื่อง       ผลปกติ
✅ ระดับน้ำหล่อเย็น         ผลปกติ
✅ ระบบน้ำมันเกียร์         ผลปกติ
✅ ระดับน้ำมันหล่อลื่น      ผลปกติ
✅ สภาพยาง                  ผลปกติ
✅ แบตเตอรี่                  ผลปกติ
✅ ระบบไฟต่างๆ             ผลปกติ
✅ ถังดับเพลิง                ผลปกติ

โดย ${r.inspector_name}
(พขร.บ.) ผู้ตรวจสอบ`;
}

function copyToClipboard() {
    const txt = document.getElementById("outputText");
    if (!txt.value) {
        Swal.fire({ icon: 'warning', title: 'โปรดเลือกรายการ', text: 'กรุณาเลือกรถจาก Dropdown ก่อนคัดลอกครับ' });
        return;
    }
    txt.select();
    navigator.clipboard.writeText(txt.value).then(() => {
        Toast.fire({ icon: 'success', title: 'คัดลอกสำเร็จ!', text: 'นำไปวางในแชท LINE ได้เลย' });
    });
}
