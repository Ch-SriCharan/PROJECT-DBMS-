/**
 * Predefined Clinical Symptoms Catalog & Rule-Based Specialist Mapping
 */

export const SYMPTOMS_CATALOG = [
  {
    id: 'headache',
    name: 'Headache',
    category: 'Head & Neurological',
    description: 'Pain or throbbing sensation in the head, temples, or forehead.',
    isEmergency: false,
    bodyArea: 'Head',
    specialtyWeights: {
      'General Physician': 70,
      'Neurology': 90,
      'ENT Specialist': 40,
    },
  },
  {
    id: 'fever',
    name: 'Fever',
    category: 'General & Systemic',
    description: 'Elevated body temperature above normal range (98.6°F / 37°C).',
    isEmergency: false,
    bodyArea: 'Whole Body',
    specialtyWeights: {
      'General Physician': 95,
      'Pediatrics': 60,
      'Pulmonology': 40,
    },
  },
  {
    id: 'cough',
    name: 'Cough',
    category: 'Chest & Respiratory',
    description: 'Dry or productive coughing, throat clearing, or bronchial irritation.',
    isEmergency: false,
    bodyArea: 'Chest & Throat',
    specialtyWeights: {
      'General Physician': 80,
      'Pulmonology': 95,
      'ENT Specialist': 60,
    },
  },
  {
    id: 'sore-throat',
    name: 'Sore throat',
    category: 'Eyes, Ears & Throat',
    description: 'Pain, scratchiness, or irritation when swallowing or speaking.',
    isEmergency: false,
    bodyArea: 'Throat',
    specialtyWeights: {
      'ENT Specialist': 95,
      'General Physician': 75,
      'Pediatrics': 40,
    },
  },
  {
    id: 'chest-pain',
    name: 'Chest pain',
    category: 'Chest & Respiratory',
    description: 'Pressure, tightness, squeezing, or aching in the chest or sternum.',
    isEmergency: true,
    emergencyLevel: 'CRITICAL',
    emergencyAdvice: 'Chest pain can indicate a severe cardiovascular or pulmonary emergency. If you experience severe, radiating chest pressure or sudden crushing chest pain, seek immediate emergency medical services (call 112/911 or go to the nearest emergency room).',
    bodyArea: 'Chest',
    specialtyWeights: {
      'Cardiology': 100,
      'Pulmonology': 70,
      'General Physician': 50,
    },
  },
  {
    id: 'shortness-of-breath',
    name: 'Shortness of breath',
    category: 'Chest & Respiratory',
    description: 'Difficulty breathing, breathlessness upon minimal exertion, or air hunger.',
    isEmergency: true,
    emergencyLevel: 'CRITICAL',
    emergencyAdvice: 'Acute shortness of breath or sudden difficulty breathing requires urgent clinical evaluation. If severe or accompanied by blue lips, chest pain, or confusion, call emergency services immediately.',
    bodyArea: 'Chest & Lungs',
    specialtyWeights: {
      'Pulmonology': 95,
      'Cardiology': 90,
      'General Physician': 60,
    },
  },
  {
    id: 'stomach-pain',
    name: 'Stomach pain',
    category: 'Digestive & Abdominal',
    description: 'Abdominal cramps, upper epigastric discomfort, or lower gut aches.',
    isEmergency: false,
    bodyArea: 'Abdomen',
    specialtyWeights: {
      'Gastroenterology': 95,
      'General Physician': 70,
      'Gynecology': 45,
    },
  },
  {
    id: 'vomiting',
    name: 'Vomiting',
    category: 'Digestive & Abdominal',
    description: 'Nausea and involuntary expulsion of stomach contents.',
    isEmergency: false,
    bodyArea: 'Abdomen & Digestive',
    specialtyWeights: {
      'Gastroenterology': 90,
      'General Physician': 80,
      'Pediatrics': 50,
    },
  },
  {
    id: 'diarrhea',
    name: 'Diarrhea',
    category: 'Digestive & Abdominal',
    description: 'Frequent loose or watery bowel movements, intestinal cramping.',
    isEmergency: false,
    bodyArea: 'Abdomen & Bowel',
    specialtyWeights: {
      'Gastroenterology': 90,
      'General Physician': 75,
      'Pediatrics': 50,
    },
  },
  {
    id: 'skin-rash',
    name: 'Skin rash',
    category: 'Skin & Dermatological',
    description: 'Redness, hives, patches, blisters, or inflamed skin outbreaks.',
    isEmergency: false,
    bodyArea: 'Skin',
    specialtyWeights: {
      'Dermatology': 100,
      'General Physician': 40,
    },
  },
  {
    id: 'itching',
    name: 'Itching',
    category: 'Skin & Dermatological',
    description: 'Persistent prickling, pruritus, or allergic skin sensitivity.',
    isEmergency: false,
    bodyArea: 'Skin',
    specialtyWeights: {
      'Dermatology': 95,
      'General Physician': 45,
    },
  },
  {
    id: 'joint-pain',
    name: 'Joint pain',
    category: 'Musculoskeletal',
    description: 'Aching, stiffness, swelling, or reduced mobility in knees, hips, or shoulders.',
    isEmergency: false,
    bodyArea: 'Joints & Bones',
    specialtyWeights: {
      'Orthopedics': 95,
      'General Physician': 50,
    },
  },
  {
    id: 'back-pain',
    name: 'Back pain',
    category: 'Musculoskeletal',
    description: 'Lumbar, thoracic, or cervical spine discomfort, muscle spasms.',
    isEmergency: false,
    bodyArea: 'Spine & Back',
    specialtyWeights: {
      'Orthopedics': 95,
      'Neurology': 60,
      'General Physician': 45,
    },
  },
  {
    id: 'tooth-pain',
    name: 'Tooth pain',
    category: 'Dental & Oral',
    description: 'Sharp or throbbing pain in teeth, gums, jaw, or tooth sensitivity.',
    isEmergency: false,
    bodyArea: 'Mouth & Teeth',
    specialtyWeights: {
      'Dentistry': 100,
      'ENT Specialist': 30,
    },
  },
  {
    id: 'eye-pain-vision-problems',
    name: 'Eye pain / vision problems',
    category: 'Eyes & Vision',
    description: 'Blurry vision, eye strain, redness, dry eyes, or ocular discomfort.',
    isEmergency: false,
    bodyArea: 'Eyes',
    specialtyWeights: {
      'Ophthalmology': 100,
      'Neurology': 40,
      'General Physician': 30,
    },
  },
  {
    id: 'ear-pain',
    name: 'Ear pain',
    category: 'Eyes, Ears & Throat',
    description: 'Earache, ringing (tinnitus), blocked canal sensation, or hearing muffledness.',
    isEmergency: false,
    bodyArea: 'Ears',
    specialtyWeights: {
      'ENT Specialist': 100,
      'General Physician': 40,
    },
  },
  {
    id: 'fatigue',
    name: 'Fatigue',
    category: 'General & Systemic',
    description: 'Persistent unexplained tiredness, low energy, or general malaise.',
    isEmergency: false,
    bodyArea: 'Whole Body',
    specialtyWeights: {
      'General Physician': 90,
      'Cardiology': 40,
      'Neurology': 35,
    },
  },
  {
    id: 'dizziness',
    name: 'Dizziness',
    category: 'Head & Neurological',
    description: 'Lightheadedness, unsteadiness, vertigo, or room-spinning sensations.',
    isEmergency: false,
    bodyArea: 'Head & Balance',
    specialtyWeights: {
      'Neurology': 85,
      'ENT Specialist': 70,
      'Cardiology': 60,
      'General Physician': 70,
    },
  },
  {
    id: 'anxiety-stress',
    name: 'Anxiety/stress',
    category: 'Mental & Behavioral Health',
    description: 'Restlessness, racing thoughts, panic sensations, chronic stress, or sleep disruption.',
    isEmergency: false,
    bodyArea: 'Mind & Mood',
    specialtyWeights: {
      'Psychiatry': 95,
      'General Physician': 60,
      'Neurology': 40,
    },
  },
  {
    id: 'menstrual-pelvic-pain',
    name: 'Menstrual/pelvic pain',
    category: 'Reproductive & Pelvic',
    description: 'Pelvic cramping, dysmenorrhea, irregular cycles, or lower abdominal ache in females.',
    isEmergency: false,
    bodyArea: 'Pelvis',
    specialtyWeights: {
      'Gynecology': 100,
      'Gastroenterology': 40,
      'Urology': 30,
    },
  },
  {
    id: 'urinary-problems',
    name: 'Urinary problems',
    category: 'Urological & Renal',
    description: 'Painful urination, increased frequency, urgency, or bladder discomfort.',
    isEmergency: false,
    bodyArea: 'Urinary Tract',
    specialtyWeights: {
      'Urology': 100,
      'General Physician': 60,
      'Gynecology': 35,
    },
  },
  {
    id: 'loss-of-consciousness',
    name: 'Loss of consciousness / Fainting',
    category: 'Head & Neurological',
    description: 'Fainting spells, blacking out, syncope, or sudden loss of responsiveness.',
    isEmergency: true,
    emergencyLevel: 'CRITICAL',
    emergencyAdvice: 'Loss of consciousness or sudden syncope is a medical emergency that requires immediate hospital evaluation. Call emergency services (112/911) or proceed immediately to an Emergency Room.',
    bodyArea: 'Brain & Cardiovascular',
    specialtyWeights: {
      'Neurology': 90,
      'Cardiology': 90,
      'General Physician': 60,
    },
  },
];

export const SPECIALTY_INFO = {
  'Cardiology': {
    title: 'Cardiologist',
    department: 'Cardiology',
    description: 'Specializes in the heart, cardiovascular system, circulation, coronary health, and chest discomfort.',
    commonConditions: ['Chest tightness', 'Heart rhythm issues', 'High blood pressure', 'Shortness of breath with exertion'],
  },
  'Neurology': {
    title: 'Neurologist',
    department: 'Neurology',
    description: 'Specializes in brain and nervous system disorders, migraines, dizziness, nerve pain, and cognitive health.',
    commonConditions: ['Migraines & chronic headaches', 'Dizziness & vertigo', 'Numbness or tingling', 'Sleep & nerve disorders'],
  },
  'Pediatrics': {
    title: 'Pediatrician',
    department: 'Pediatrics',
    description: 'Specializes in medical care, developmental milestones, immunizations, and wellness for infants, children, and teens.',
    commonConditions: ['Childhood infections', 'Fever & viral illnesses', 'Growth tracking', 'Childhood allergies'],
  },
  'Dermatology': {
    title: 'Dermatologist',
    department: 'Dermatology',
    description: 'Specializes in the diagnosis and treatment of conditions affecting skin, hair, nails, rashes, and allergies.',
    commonConditions: ['Skin rashes & dermatitis', 'Itching & eczema', 'Acne & hives', 'Psoriasis & skin lesions'],
  },
  'Orthopedics': {
    title: 'Orthopedist / Orthopedic Surgeon',
    department: 'Orthopedics',
    description: 'Specializes in bones, joints, ligaments, tendons, spine, sports injuries, and musculoskeletal pain.',
    commonConditions: ['Joint pain & arthritis', 'Back & lumbar pain', 'Knee & shoulder stiffness', 'Sports injuries'],
  },
  'Dentistry': {
    title: 'Dentist / Dental Surgeon',
    department: 'Dentistry',
    description: 'Specializes in oral health, teeth, gums, jaw alignment, dental pain, and preventative oral hygiene.',
    commonConditions: ['Tooth pain & cavities', 'Gum swelling & sensitivity', 'Wisdom tooth pain', 'Jaw discomfort'],
  },
  'Ophthalmology': {
    title: 'Ophthalmologist',
    department: 'Ophthalmology',
    description: 'Specializes in comprehensive eye care, vision changes, ocular health, and eye strain or infections.',
    commonConditions: ['Eye pain & strain', 'Blurred or impaired vision', 'Dry eye syndrome', 'Eye irritation & redness'],
  },
  'Gastroenterology': {
    title: 'Gastroenterologist',
    department: 'Gastroenterology',
    description: 'Specializes in the digestive system, stomach, esophagus, intestines, liver, and abdominal pain.',
    commonConditions: ['Stomach pain & acid reflux', 'Persistent nausea & vomiting', 'Diarrhea & bowel irregularities', 'Bloating & indigestion'],
  },
  'ENT Specialist': {
    title: 'ENT Specialist (Otolaryngologist)',
    department: 'ENT / Otolaryngology',
    description: 'Specializes in ear, nose, throat, sinuses, hearing, swallowing, and balance disorders.',
    commonConditions: ['Ear pain & infections', 'Sore throat & tonsillitis', 'Sinus pressure', 'Tinnitus & inner ear dizziness'],
  },
  'Urology': {
    title: 'Urologist',
    department: 'Urology',
    description: 'Specializes in the urinary system, kidneys, bladder, and male reproductive health.',
    commonConditions: ['Painful urination', 'Frequent or urgent urination', 'Bladder discomfort', 'Kidney stone symptoms'],
  },
  'Gynecology': {
    title: 'Gynecologist / Obstetrician',
    department: 'Gynecology',
    description: 'Specializes in female reproductive health, menstrual cycles, pelvic pain, and hormonal wellness.',
    commonConditions: ['Pelvic & menstrual pain', 'Irregular menstrual cycles', 'Hormonal fluctuations', 'Reproductive wellness'],
  },
  'General Physician': {
    title: 'General Physician / Internal Medicine Specialist',
    department: 'General Medicine',
    description: 'Provides comprehensive primary care, diagnostic evaluations, acute illness management, and preventative health.',
    commonConditions: ['Fever & flu symptoms', 'Persistent cough & fatigue', 'General malaise & body aches', 'Routine health checkups'],
  },
  'Pulmonology': {
    title: 'Pulmonologist',
    department: 'Pulmonology',
    description: 'Specializes in the respiratory tract, lungs, airways, chronic cough, and breathing difficulties.',
    commonConditions: ['Shortness of breath', 'Chronic bronchitis & asthma', 'Persistent chest cough', 'Respiratory allergies'],
  },
  'Psychiatry': {
    title: 'Psychiatrist / Mental Health Specialist',
    department: 'Psychiatry',
    description: 'Specializes in mental health, emotional well-being, stress, anxiety management, and sleep wellness.',
    commonConditions: ['Anxiety & panic feelings', 'Chronic stress & burnout', 'Sleep disturbances', 'Mood imbalances'],
  },
};

/**
 * Calculates rule-based specialist recommendations based on selected symptom IDs or names.
 */
export const calculateSpecialistRecommendation = (selectedInput) => {
  if (!selectedInput || !Array.isArray(selectedInput) || selectedInput.length === 0) {
    return {
      hasSelection: false,
      recommendedSpecialty: null,
      recommendationText: '',
      specialtyDetails: null,
      secondarySpecialties: [],
      emergencyAlert: null,
      selectedSymptoms: [],
      disclaimer: 'This symptom assessment tool is an informational doctor discovery guide and does NOT provide a medical diagnosis or claim that you have any disease.',
    };
  }

  // Normalize inputs (support both IDs and names)
  const normalizedInputs = selectedInput.map((s) => s.toString().trim().toLowerCase());

  const matchedSymptoms = SYMPTOMS_CATALOG.filter((item) => {
    const idMatch = normalizedInputs.includes(item.id.toLowerCase());
    const nameMatch = normalizedInputs.includes(item.name.toLowerCase());
    return idMatch || nameMatch;
  });

  if (matchedSymptoms.length === 0) {
    return {
      hasSelection: false,
      recommendedSpecialty: null,
      recommendationText: '',
      specialtyDetails: null,
      secondarySpecialties: [],
      emergencyAlert: null,
      selectedSymptoms: [],
      disclaimer: 'This symptom assessment tool is an informational doctor discovery guide and does NOT provide a medical diagnosis or claim that you have any disease.',
    };
  }

  // 1. Check for Emergency Symptoms
  const emergencySymptoms = matchedSymptoms.filter((s) => s.isEmergency);
  let emergencyAlert = null;

  if (emergencySymptoms.length > 0) {
    emergencyAlert = {
      isEmergency: true,
      level: emergencySymptoms.some((s) => s.emergencyLevel === 'CRITICAL') ? 'CRITICAL' : 'HIGH',
      urgentSymptoms: emergencySymptoms.map((s) => s.name),
      title: 'Immediate Emergency Medical Attention May Be Required',
      message:
        'You have selected potentially urgent symptoms (such as severe chest pain, shortness of breath, or loss of consciousness). If you or the patient are experiencing severe, sudden, or worsening symptoms, please seek IMMEDIATE emergency medical care (dial 112 / 911 or proceed to the nearest emergency department) rather than waiting for a scheduled consultation.',
    };
  }

  // 2. Aggregate weighted specialty scores
  const specialtyScores = {};

  matchedSymptoms.forEach((symptom) => {
    Object.entries(symptom.specialtyWeights || {}).forEach(([specialty, weight]) => {
      specialtyScores[specialty] = (specialtyScores[specialty] || 0) + weight;
    });
  });

  // Sort specialties by aggregated score descending
  const sortedSpecialties = Object.entries(specialtyScores).sort((a, b) => b[1] - a[1]);

  const primarySpecialtyKey = sortedSpecialties.length > 0 ? sortedSpecialties[0][0] : 'General Physician';
  const primaryDetails = SPECIALTY_INFO[primarySpecialtyKey] || {
    title: primarySpecialtyKey,
    department: primarySpecialtyKey,
    description: `Clinical specialist in ${primarySpecialtyKey}.`,
    commonConditions: [],
  };

  // Secondary recommendations (if score is significant)
  const secondarySpecialties = sortedSpecialties
    .slice(1, 3)
    .filter(([_, score]) => score >= 35)
    .map(([specName, score]) => ({
      name: specName,
      title: SPECIALTY_INFO[specName]?.title || specName,
      department: SPECIALTY_INFO[specName]?.department || specName,
      score,
    }));

  const recommendedSpecialtyTitle = primaryDetails.title;

  return {
    hasSelection: true,
    recommendedSpecialty: primarySpecialtyKey,
    recommendedSpecialtyTitle,
    recommendationText: `Based on the symptoms you selected, you may consider consulting a ${recommendedSpecialtyTitle}.`,
    specialtyDetails: primaryDetails,
    secondarySpecialties,
    emergencyAlert,
    selectedSymptoms: matchedSymptoms.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      bodyArea: s.bodyArea,
      isEmergency: s.isEmergency,
    })),
    disclaimer:
      'This specialist recommendation is a discovery aid based on clinical guidelines to help you locate the appropriate medical department. It does NOT diagnose medical conditions, provide clinical evaluations, or claim that you have any disease. Always seek direct medical advice from a qualified healthcare provider.',
  };
};
