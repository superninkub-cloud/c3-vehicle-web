export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { plate_number, inspector_name, is_defective, issues_list, car_type } = req.body;
  const channelToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!channelToken) {
    return res.status(500).json({ message: 'Missing LINE token in environment variables' });
  }

  const statusText = is_defective ? ⚠️ พบข้อบกพร่อง\nรายละเอียด:  : '✅ ปกติพร้อมใช้งาน';

  const message = 🚨 [แจ้งเตือน] ส่งผลตรวจรถใหม่!
🚗 ทะเบียน:  ()
👤 ผู้ตรวจ: 
📊 สถานะ: ;

  try {
    const response = await fetch("https://api.line.me/v2/bot/message/broadcast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + channelToken
      },
      body: JSON.stringify({
        messages: [{ type: "text", text: message }]
      })
    });

    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("LINE Notify Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
