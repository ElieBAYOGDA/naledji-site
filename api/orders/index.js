// Serverless handler for /api/orders (Vercel / Netlify compatible)
// Prototype: stores orders to an in-memory array and logs them. Replace with a real DB in production.

const crypto = require('crypto');

// In-memory store (for prototype only)
const orders = []; 

async function sendSmsPlaceholder(phone, message){
  // Placeholder: integrate Twilio or WhatsApp Business API in production.
  console.log('SMS placeholder ->', phone, message);
}

module.exports = async (req, res) => {
  if(req.method !== 'POST'){
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { product, name, phone, address, city, notes, payment } = req.body || {};
  if(!product || !name || !phone || !address || !city){
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  // Basic normalization
  const orderId = crypto.randomBytes(6).toString('hex');
  const order = {
    orderId,
    product,
    name,
    phone,
    address,
    city,
    notes: notes || '',
    payment: payment || 'cod',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // Store (in-memory) and log
  orders.push(order);
  console.log('New COD order received:', order);

  // Send confirmation SMS/WhatsApp (placeholder)
  try{
    await sendSmsPlaceholder(phone, `Votre commande ${orderId} a été reçue. Nous confirmerons bientôt.`);
  }catch(e){
    console.error('SMS send error', e);
  }

  // Return orderId to the frontend
  res.status(200).json({ orderId });
};