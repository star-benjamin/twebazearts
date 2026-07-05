const { supabaseAdmin } = require('../config/supabase');

const VALID_TYPES = ['INQUIRY', 'COMMISSION', 'PROJECT', 'BOOKING'];

// CREATE — admin logs a manual payment against an open invoice (FR-ADM-005)
exports.create = async (req, res) => {
  const { related_type, related_id, invoice_reference, payment_type, payment_date, amount, notes } = req.body;

  if (!VALID_TYPES.includes(related_type)) {
    return res.status(400).json({ error: `related_type must be one of: ${VALID_TYPES.join(', ')}` });
  }
  if (!related_id || !payment_type || !amount || amount <= 0) {
    return res.status(400).json({ error: 'related_id, payment_type, and a positive amount are required' });
  }

  const { data, error } = await supabaseAdmin
    .from('payments')
    .insert({ related_type, related_id, invoice_reference, payment_type, payment_date: payment_date || new Date().toISOString().slice(0, 10), amount, notes })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

// LIST — admin, optionally filtered to one related record
exports.list = async (req, res) => {
  const { related_type, related_id } = req.query;
  let query = supabaseAdmin.from('payments').select('*').order('payment_date', { ascending: false });
  if (related_type) query = query.eq('related_type', related_type);
  if (related_id) query = query.eq('related_id', related_id);

  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

exports.remove = async (req, res) => {
  const { error } = await supabaseAdmin.from('payments').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
};
