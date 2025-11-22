const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized:false } : false });

module.exports = async (req, res) => {
  // Basic token protection via ADMIN_TOKEN env var
  const adminToken = process.env.ADMIN_TOKEN || '';
  const provided = req.headers['x-admin-token'] || req.query.token || '';
  if(!adminToken || provided !== adminToken) return res.status(401).json({ error: 'Unauthorized' });

  if(req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const client = await pool.connect();
  try{
    const result = await client.query('SELECT order_id, product, customer_name, phone, address, city, notes, payment_method, status, created_at FROM orders ORDER BY created_at DESC LIMIT 200');
    return res.status(200).json({ orders: result.rows });
  }catch(err){
    console.error('DB read error', err);
    return res.status(500).json({ error: 'Database error' });
  }finally{ client.release(); }
};
