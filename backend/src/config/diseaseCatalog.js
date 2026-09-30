/**
 * Predefined Clinical Disease / Health Condition Catalog
 *
 * SAFETY PRINCIPLE:
 * This catalog helps patients identify relevant clinical specialties.
 * It is NOT an automated diagnosis or prescription engine.
 * Medication and certified diagnoses strictly originate from authorized doctors.
 */

export const DISEASE_CATALOG = [
  {
    id: 'migraine-headaches',
    name: 'Migraine & Chronic Headaches',
    category: 'Neurological',
    recommendedSpecialty: 'Neurology',
    commonSymptoms: ['Headache', 'Dizziness', 'Eye pain / vision problems', 'Fatigue'],
    description: 'Recurrent pulsating or throbbing head pain, frequently accompanied by sensitivity to light and sound.',
  },
  {
    id: 'hypertension',
    name: 'Hypertension (High Blood Pressure)',
    category: 'Cardiovascular',
    recommendedSpecialty: 'Cardiology',
    commonSymptoms: ['Chest pain', 'Headache', 'Dizziness', 'Fatigue', 'Shortness of breath'],
    description: 'Chronic elevation of arterial blood pressure requiring cardiovascular evaluation and lifestyle monitoring.',
  },
  {
    id: 'coronary-artery-disease',
    name: 'Coronary Artery Disease / Angina',
    category: 'Cardiovascular',
    recommendedSpecialty: 'Cardiology',
    commonSymptoms: ['Chest pain', 'Shortness of breath', 'Fatigue'],
    description: 'Reduced blood flow to the heart muscle causing chest tightness and exertional discomfort.',
    isEmergency: true,
  },
  {
    id: 'asthma-bronchitis',
    name: 'Bronchial Asthma & Chronic Bronchitis',
    category: 'Respiratory',
    recommendedSpecialty: 'Pulmonology',
    commonSymptoms: ['Shortness of breath', 'Cough', 'Chest pain', 'Fatigue'],
    description: 'Inflammatory airway disease leading to bronchospasms, coughing, and breathing difficulty.',
  },
  {
    id: 'eczema-dermatitis',
    name: 'Eczema & Allergic Dermatitis',
    category: 'Dermatological',
    recommendedSpecialty: 'Dermatology',
    commonSymptoms: ['Skin rash', 'Itching'],
    description: 'Chronic or acute inflammatory skin reactions causing itching, scaling, and erythematous patches.',
  },
  {
    id: 'gerd-gastritis',
    name: 'Acid Reflux (GERD) & Gastritis',
    category: 'Gastroenterological',
    recommendedSpecialty: 'Gastroenterology',
    commonSymptoms: ['Stomach pain', 'Vomiting', 'Sore throat'],
    description: 'Gastric acid regurgitation and mucosal irritation producing epigastric burning and indigestion.',
  },
  {
    id: 'osteoarthritis-joint-pain',
    name: 'Osteoarthritis & Joint Degeneration',
    category: 'Musculoskeletal',
    recommendedSpecialty: 'Orthopedics',
    commonSymptoms: ['Joint pain', 'Back pain', 'Fatigue'],
    description: 'Degenerative joint disease resulting in articular cartilage loss, stiffness, and restricted range of motion.',
  },
  {
    id: 'dental-caries-pulpitis',
    name: 'Dental Caries & Pulpitis (Tooth Infection)',
    category: 'Dental & Oral',
    recommendedSpecialty: 'Dentistry',
    commonSymptoms: ['Tooth pain', 'Ear pain', 'Headache'],
    description: 'Enamel demineralization and pulp inflammation causing localized dental throbbing and sensitivity.',
  },
  {
    id: 'cataract-refractive-errors',
    name: 'Cataract & Visual Refractive Errors',
    category: 'Ophthalmic',
    recommendedSpecialty: 'Ophthalmology',
    commonSymptoms: ['Eye pain / vision problems', 'Headache'],
    description: 'Clouding of the natural crystalline lens or corneal refraction changes leading to visual blurriness.',
  },
  {
    id: 'sinusitis-tonsillitis',
    name: 'Chronic Sinusitis & Tonsillitis',
    category: 'ENT & Throat',
    recommendedSpecialty: 'ENT Specialist',
    commonSymptoms: ['Ear pain', 'Sore throat', 'Headache', 'Fever', 'Cough'],
    description: 'Infection or inflammation of paranasal sinus cavities and palatine lymphoid tissue.',
  },
  {
    id: 'kidney-stones-uti',
    name: 'Kidney Stones (Nephrolithiasis) & UTI',
    category: 'Urological',
    recommendedSpecialty: 'Urology',
    commonSymptoms: ['Urinary problems', 'Back pain', 'Stomach pain', 'Fever'],
    description: 'Mineral crystal deposits in the urinary tract or bacterial infection of the bladder and kidneys.',
  },
  {
    id: 'pcos-pelvic-pain',
    name: 'PCOS / PCOD & Pelvic Pain Syndromes',
    category: 'Gynecological',
    recommendedSpecialty: 'Gynecology',
    commonSymptoms: ['Menstrual/pelvic pain', 'Fatigue', 'Acne/Skin rash'],
    description: 'Endocrine and reproductive disorder characterized by ovarian cysts, hormonal imbalance, and pelvic discomfort.',
  },
  {
    id: 'viral-fever-influenza',
    name: 'Acute Viral Fever & Influenza',
    category: 'General & Infectious',
    recommendedSpecialty: 'General Physician',
    commonSymptoms: ['Fever', 'Cough', 'Sore throat', 'Fatigue', 'Headache', 'Joint pain'],
    description: 'Acute systemic viral infection causing pyrexia, myalgia, respiratory congestion, and general malaise.',
  },
  {
    id: 'anxiety-panic-disorder',
    name: 'Generalized Anxiety & Panic Disorder',
    category: 'Psychiatric',
    recommendedSpecialty: 'Psychiatry',
    commonSymptoms: ['Anxiety/stress', 'Dizziness', 'Fatigue', 'Headache', 'Chest pain'],
    description: 'Persistent excessive worry, somatic panic symptoms, and nervous system hyperarousal.',
  },
];
