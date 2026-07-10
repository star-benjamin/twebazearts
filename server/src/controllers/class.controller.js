const { supabaseAdmin } = require('../config/supabase');

// CREATE — admin schedules a class (FR-CLS-001, BR-CLS-001)
exports.create = async (req, res) => {
  const { course_title, description, instructor, venue, session_datetime, capacity, registration_fee } = req.body;

  if (!course_title || !session_datetime || !capacity) {
    return res.status(400).json({ error: 'course_title, session_datetime, and capacity are required' });
  }
  if (new Date(session_datetime) < new Date()) {
    return res.status(400).json({ error: 'Cannot schedule a class in the past' }); // BR-CLS-001
  }

  const { data, error } = await supabaseAdmin
    .from('art_classes')
    .insert({
      course_title, description, instructor, venue: venue || 'National Theatre',
      session_datetime, capacity, registration_fee: registration_fee || 0,
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

// LIST — public schedule with live availability counts (FR-CLS-002)
exports.list = async (req, res) => {
  const upcomingOnly = req.query.upcoming !== '0';

  let query = supabaseAdmin
    .from('art_classes')
    .select('*, bookings(count)')
    .order('session_datetime', { ascending: true });

  if (upcomingOnly) query = query.gte('session_datetime', new Date().toISOString());

  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });

  const withAvailability = data.map((c) => ({
    ...c,
    seats_taken: c.bookings?.[0]?.count || 0,
    seats_available: c.capacity - (c.bookings?.[0]?.count || 0),
  }));
  res.json(withAvailability);
};

exports.detail = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('art_classes').select('*, bookings(count)').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ error: 'Not found' });
  res.json({
    ...data,
    seats_taken: data.bookings?.[0]?.count || 0,
    seats_available: data.capacity - (data.bookings?.[0]?.count || 0),
  });
};

exports.update = async (req, res) => {
  const { course_title, description, instructor, venue, session_datetime, capacity, registration_fee } = req.body;
  const update = { course_title, description, instructor, venue, session_datetime, capacity, registration_fee };
  Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

  const { data, error } = await supabaseAdmin
    .from('art_classes').update(update).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

exports.remove = async (req, res) => {
  const { error } = await supabaseAdmin.from('art_classes').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
};

// ---------------------------------------------------------------------------
// BOOKINGS — FR-CLS-003, FR-CLS-004, FR-CLS-005, VR-CLS-001
// ---------------------------------------------------------------------------

// CREATE — public booking request, blocked once a class is full (VR-CLS-001)
exports.book = async (req, res) => {
  const { student_name, contact_details } = req.body;
  const classId = req.params.id;

  if (!student_name || !contact_details) {
    return res.status(400).json({ error: 'student_name and contact_details are required' });
  }

  const { data: cls } = await supabaseAdmin.from('art_classes').select('capacity').eq('id', classId).single();
  if (!cls) return res.status(404).json({ error: 'Class not found' });

  const { count } = await supabaseAdmin
    .from('bookings').select('*', { count: 'exact', head: true }).eq('class_id', classId);

  if (count >= cls.capacity) {
    return res.status(409).json({ error: 'This class is fully booked' });
  }

  const { data, error } = await supabaseAdmin
    .from('bookings').insert({ class_id: classId, student_name, contact_details }).select().single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

// ROSTER — admin, sorted by registration date (FR-CLS-004)
exports.roster = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('bookings').select('*').eq('class_id', req.params.id).order('created_at', { ascending: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

// ATTENDANCE — admin check-box roster (FR-CLS-005)
exports.markAttendance = async (req, res) => {
  const { attended } = req.body;
  const { data, error } = await supabaseAdmin
    .from('bookings').update({ attended: !!attended }).eq('id', req.params.bookingId).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};
