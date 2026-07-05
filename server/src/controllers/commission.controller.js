const { supabaseAdmin } = require('../config/supabase');

async function findOrCreateCustomer({ name, email, phone }) {
  const { data: existing } = await supabaseAdmin
    .from('customers').select('*').ilike('email', email).maybeSingle();
  if (existing) return existing;
  const { data, error } = await supabaseAdmin
    .from('customers').insert({ name, email, phone }).select().single();
  if (error) throw error;
  return data;
}

// CREATE — public commission request form (FR-PRO-001)
exports.create = async (req, res) => {
  const {
    name, email, phone,
    client_ideas, spatial_constraints, material_choices, target_deadline,
  } = req.body;

  if (!name || !email) return res.status(400).json({ error: 'name and email are required' });

  try {
    const customer = await findOrCreateCustomer({ name, email, phone });

    const { data, error } = await supabaseAdmin
      .from('commissions')
      .insert({
        customer_id: customer.id,
        client_ideas, spatial_constraints, material_choices, target_deadline: target_deadline || null,
      })
      .select('*, customer:customers(*)')
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// CONVERT AN INQUIRY -> COMMISSION — admin (FR-PRO-002)
exports.createFromInquiry = async (req, res) => {
  const { inquiry_id } = req.body;

  const { data: inquiry, error: fetchErr } = await supabaseAdmin
    .from('inquiries').select('*, customer:customers(*)').eq('id', inquiry_id).single();
  if (fetchErr || !inquiry) return res.status(404).json({ error: 'Inquiry not found' });

  const { data, error } = await supabaseAdmin
    .from('commissions')
    .insert({
      inquiry_id: inquiry.id,
      customer_id: inquiry.customer_id,
      client_ideas: inquiry.message,
    })
    .select('*, customer:customers(*)')
    .single();

  if (error) return res.status(400).json({ error: error.message });

  await supabaseAdmin.from('inquiries').update({ status: 'CONVERTED' }).eq('id', inquiry.id);

  res.status(201).json(data);
};

// LIST — admin
exports.list = async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from('commissions')
    .select('*, customer:customers(*), projects(id, title, stage)')
    .order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

exports.detail = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('commissions')
    .select('*, customer:customers(*), projects(*)')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: 'Not found' });
  res.json(data);
};

exports.update = async (req, res) => {
  const { client_ideas, spatial_constraints, material_choices, target_deadline } = req.body;
  const update = { client_ideas, spatial_constraints, material_choices, target_deadline };
  Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

  const { data, error } = await supabaseAdmin
    .from('commissions').update(update).eq('id', req.params.id)
    .select('*, customer:customers(*)').single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};
