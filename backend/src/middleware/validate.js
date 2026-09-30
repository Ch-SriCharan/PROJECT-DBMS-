export const validateRegister = (req, res, next) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields: name, email, phone, and password.',
    });
  }

  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    return res.status(422).json({
      success: false,
      message: 'Please provide a valid email address.',
    });
  }

  if (password.length < 6) {
    return res.status(422).json({
      success: false,
      message: 'Password must be at least 6 characters long.',
    });
  }

  if (role && !['PATIENT', 'DOCTOR', 'ADMIN'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user role provided.',
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password.',
    });
  }

  next();
};

export const validateAppointmentBooking = (req, res, next) => {
  const { doctorId, clinicId, date, startTime, endTime } = req.body;

  if (!doctorId || !clinicId || !date || !startTime || !endTime) {
    return res.status(400).json({
      success: false,
      message: 'Missing required appointment fields: doctorId, clinicId, date, startTime, endTime.',
    });
  }

  // Validate date format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(422).json({
      success: false,
      message: 'Date must be formatted as YYYY-MM-DD.',
    });
  }

  next();
};

export const validateAvailability = (req, res, next) => {
  const { date, startTime, endTime } = req.body;

  if (!date || !startTime || !endTime) {
    return res.status(400).json({
      success: false,
      message: 'Please provide date, startTime, and endTime for availability.',
    });
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(422).json({
      success: false,
      message: 'Date must be formatted as YYYY-MM-DD.',
    });
  }

  next();
};
