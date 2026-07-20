-- 1. ลบตารางเดิมถ้ามี (เพื่อเริ่มใหม่)
DROP TABLE IF EXISTS inspections;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS inspectors;

-- 2. สร้างตารางเก็บรายชื่อรถ (vehicles)
CREATE TABLE vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plate_number TEXT NOT NULL UNIQUE,
    car_type TEXT NOT NULL, -- เช่น 'รถยนต์', 'เครนไฮดรอลิค'
    default_driver TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. สร้างตารางเก็บชื่อผู้ตรวจ (inspectors)
CREATE TABLE inspectors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. สร้างตารางประวัติการตรวจ (inspections)
CREATE TABLE inspections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    check_date DATE NOT NULL,
    plate_number TEXT NOT NULL,
    car_type TEXT NOT NULL,
    inspector_name TEXT NOT NULL,
    is_defective BOOLEAN DEFAULT FALSE,
    issues_list TEXT,
    raw_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. เพิ่มข้อมูลรถตั้งต้น (จากที่เคยให้มา)
INSERT INTO vehicles (plate_number, car_type, default_driver) VALUES
('55-0774 กทม.', 'รถยนต์', 'นายเสนาะ ดาวเรือง'),
('84-1643 นฐ', 'รถยนต์', 'นายณัฐพล พืชพันธ์'),
('86-4715 นฐ(หัวลาก)', 'รถยนต์', 'นายฉลองชัย ปานเรือง'),
('84-7657 นฐ (หาง)', 'รถยนต์', 'นายฉลองชัย ปานเรือง'),
('90-7312 นฐ', 'รถยนต์', 'นายขวัญเรือน มีถาวร'),
('90-2228 นฐ', 'รถยนต์', 'นายศุภวิชญ์ เกาะลอย'),
('90-1845 นฐ', 'รถยนต์', 'นายศุภวิชญ์ เกาะลอย'),
('90-7311 นฐ', 'รถยนต์', 'นายอินทพร สร้อยสังวาลย์'),
('90-3515 นฐ', 'รถยนต์', 'นายอนิวัติ จุลมูล'),
('90-2235 นฐ', 'รถยนต์', 'นายกิตติภัฏ กาฬษร'),
('89-5769 นฐ', 'รถยนต์', 'นายวีรพัฒน์ นาคลมัย'),
('85-3090 นฐ (หัว)', 'รถยนต์', 'นายธวัชชัย โต๊ะศรีสุข'),
('85-3091 นฐ (หาง)', 'รถยนต์', 'นายธวัชชัย โต๊ะศรีสุข'),
('90-2230 นฐ', 'รถยนต์', 'นายวิสูตร เสือคล้าย'),
('90-2952 นฐ', 'รถยนต์', 'นายศราวุฒิ เกิดสีเล็ก'),
('90-1844 นฐ', 'รถยนต์', 'นายศราวุฒิ เกิดสีเล็ก'),
('90-0423 นฐ', 'รถยนต์', 'นายโหนก แก้วบัวดี'),
('90-2951 นฐ', 'รถยนต์', 'นายไพฑูรย์ สุขสมบัติ'),
('90-7310 นฐ', 'รถยนต์', 'นายมานิตย์ ใจชื้น'),
('89-5774 นฐ', 'รถยนต์', 'นายอุเทน นามศร'),
('84-9636 นฐ', 'รถยนต์', 'นายอุเทน นามศร'),
('89-2131 นฐ', 'รถยนต์', 'นายพงษ์พันธ์ จุติโรจนปกรณ์'),
('89-6967 นฐ', 'รถยนต์', 'นายผดุงเกียรติ ศรีใส'),
('90-1842 นฐ', 'รถยนต์', 'นายอุดมศักดิ์ จันทร์กลิ่น');

-- 6. เพิ่มข้อมูลผู้ตรวจตั้งต้น
INSERT INTO inspectors (full_name) VALUES
('นายขวัญเรือน มีถาวร'), ('นายฉลองชัย ปานเรือง'), ('นายณัฐพล พืชพันธ์'), 
('นายธวัชชัย โต๊ะศรีสุข'), ('นายพงษ์พันธ์ จุติโรจนปกรณ์'), ('นายผดุงเกียรติ ศรีใส'), 
('นายไพฑูรย์ สุขสมบัติ'), ('นายมานิตย์ ใจชื้น'), ('นายศราวุฒิ เกิดสีเล็ก'), 
('นายเสนาะ ดาวเรือง'), ('นายโหนก แก้วบัวดี'), ('นายอุดมศักดิ์ จันทร์กลิ่น'), 
('นายอุเทน นามศร'), ('นายวิสูตร เสือคล้าย'), ('นายวีรพัฒน์ นาคลมัย'), 
('นายศุภวิชญ์ เกาะลอย'), ('นายอนิวัติ จุลมูล'), ('นายอินทพร สร้อยสังวาลย์'), 
('นายกิตติภัฏ กาฬษร');

-- 7. ตั้งค่าความปลอดภัยเบื้องต้น (Allow all access for MVP)
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write on inspections" ON inspections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read on vehicles" ON vehicles FOR SELECT USING (true);
CREATE POLICY "Allow public read on inspectors" ON inspectors FOR SELECT USING (true);
