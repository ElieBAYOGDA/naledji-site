const { Pool } = require('pg');
const crypto = require('crypto');

// Twilio is optional
let twilioClient;
try {
  const Twilio = require('twilio');
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
} catch (e) {
  // twilio not installed - SMS will be skipped
}

// Postgres pool (handles serverless env safely)
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized:false } : false });

async function sendSms(to, message){
  if(!twilioClient || !process.env.TWILIO_FROM) return;
  try{
    await twilioClient.messages.create({ from: process.env.TWILIO_FROM, to, body: message });
    console.log('SMS sent to', to);
  }catch(e){
    console.error('SMS error', e && e.message);
  }
}

module.exports = async (req, res) => {
  if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { product, name, phone, address, city, notes, payment } = req.body || {};
  if(!product || !name || !phone || !address || !city) return res.status(400).json({ error: 'Missing required fields' });

  const orderId = crypto.randomBytes(6).toString('hex');
  const createdAt = new Date();

  // product can be an id or an object; store as JSON
  const productData = (typeof product === 'string' || typeof product === 'number') ? { id: product } : product;

  const client = await pool.connect();
  try{
    const q = `INSERT INTO orders(order_id, product, customer_name, phone, address, city, notes, payment_method, status, created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`;
    await client.query(q, [orderId, JSON.stringify(productData), name, phone, address, city, notes || '', payment || 'cod', 'pending', createdAt]);
  }catch(err){
    console.error('DB insert error', err);
    return res.status(500).json({ error: 'Database error' });
  }finally{ client.release(); }

  // Send confirmation SMS to customer if configured
  try{
    await sendSms(phone, `Merci ${name}. Votre commande ${orderId} a bien été reçue. Nous confirmerons bientôt.`);
    if(process.env.ADMIN_PHONE) await sendSms(process.env.ADMIN_PHONE, `Nouvelle commande ${orderId} de ${name} (${phone}).`);
  }catch(e){ console.error('SMS flow error', e); }

  return res.status(200).json({ orderId });
};
