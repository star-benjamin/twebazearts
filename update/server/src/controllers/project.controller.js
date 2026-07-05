const { supabaseAdmin } = require('../config/supabase');

const STAGES = ['INITIATION', 'SITE_ASSESSMENT', 'PROPOSAL_PHASE', 'EXECUTION', 'COMPLETED'];

// CREATE — admin promotes a commission into a formal project (FR-PRO-002, FR-PRO-003)
exports.create = async (req, res) => {
  const {
    commission_id, customer_id, title,
    site_address, architectural_dimensions, surface_characteristics,
  } = req.body;

  if (!title) return res.status(400).json({ error: 'title is required' });
  if (!customer_id) return res.status(400).json({ error: 'customer_id is required' });

  const { data, error } = await supabaseAdmin
    .from('projects')
    .insert({
      commission_id: commission_id || null, customer_id, title,
      site_address, architectural_dimensions, surface_characteristics,
      stage: 'INITIATION',
    })
    .select('*, customer:customers(*)')
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

exports.list = async (req, res) => {
  const { stage } = req.query;
  let query = supabaseAdmin
    .from('projects')
    .select('*, customer:customers(*), commission:commissions(id)')
    .order('created_at', { ascending: false });
  if (stage) query = query.eq('stage', stage);

  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

exports.detail = async (req, res) => {
  const { data: project, error } = await supabaseAdmin
    .from('projects').select('*, customer:customers(*), commission:commissions(*)').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ error: 'Not found' });

  const { data: payments } = await supabaseAdmin
    .from('payments').select('*').eq('related_type', 'PROJECT').eq('related_id', req.params.id);

  res.json({ ...project, payments: payments || [] });
};

// UPDATE — FR-PRO-003, FR-PRO-004, FR-PRO-005
exports.update = async (req, res) => {
  const {
    title, site_address, architectural_dimensions, surface_characteristics, assessment_logs,
    stage, execution_schedule, operational_costs, assigned_resources,
  } = req.body;

  if (stage && !STAGES.includes(stage)) {
    return res.status(400).json({ error: `stage must be one of: ${STAGES.join(', ')}` });
  }

  // BR-PRO-001: Safe Archival Lock — can't move to COMPLETED unless the
  // linked financial log balances (payments received >= operational costs).
  if (stage === 'COMPLETED') {
    const { data: project } = await supabaseAdmin
      .from('projects').select('operational_costs').eq('id', req.params.id).single();
    const targetCost = operational_costs ?? project?.operational_costs ?? 0;

    const { data: payments } = await supabaseAdmin
      .from('payments').select('amount').eq('related_type', 'PROJECT').eq('related_id', req.params.id);
    const totalPaid = (payments || []).reduce((sum, p) => sum + Number(p.amount), 0);

    if (totalPaid < targetCost) {
      return res.status(400).json({
        error: `Cannot mark Completed: recorded payments (UGX ${totalPaid.toLocaleString()}) don't cover operational costs (UGX ${targetCost.toLocaleString()}). Log the remaining payment first.`,
      });
    }
  }

  const update = {
    title, site_address, architectural_dimensions, surface_characteristics, assessment_logs,
    stage, execution_schedule, operational_costs, assigned_resources,
  };
  Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

  const { data, error } = await supabaseAdmin
    .from('projects').update(update).eq('id', req.params.id)
    .select('*, customer:customers(*)').single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};
