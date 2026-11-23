
const WHATSAPP_NUMBER_LOCAL = '01874118508'
const WHATSAPP_NUMBER_INTL = '88' + WHATSAPP_NUMBER_LOCAL

export const profile = {
  // Display name. Replace with your full name when you want to.
  name: 'Roywick',
  // Short brand shown in the navbar, loading screen and footer ("Roywick.dev")
  brand: 'Roywick',

  // Typing animation in the hero
  roles: [
    'Full-Stack Web Developer',
    'React Developer',
    'Backend Developer',
    'Software Developer',
    'Web Application Developer',
    'Security Enthusiast',
  ],

  bio:
    "I'm a final-year Computer Science and Engineering student and full-stack web developer who enjoys building modern, responsive and practical web applications. I work across React, Node.js, Express.js and databases, and I also explore web security vulnerabilities and machine learning projects.",

  location: 'Merul Badda, Dhaka, Bangladesh',
  email: 'sowrovroy246@gmail.com',

  // WhatsApp / phone
  phone: WHATSAPP_NUMBER_LOCAL,
  whatsappUrl: `https://wa.me/${WHATSAPP_NUMBER_INTL}`,

  // Links
  github: 'https://github.com/Roywick',
  githubUsername: 'Roywick',
  // Add these later. While empty, the icons/links are hidden automatically.
  linkedin: '',
  medium: '',

  // Files inside /public
  resumeUrl: '/resume.pdf',
  photoUrl: '/profile.jpg',

  languages: [
    { name: 'Bangla', level: 'Native' },
    { name: 'English', level: 'Professional' },
    { name: 'German', level: 'Intermediate' },
  ],

  hobbies: [
    'Building Web Applications',
    'Problem Solving',
    'Exploring Web Security',
    'Learning New Technologies',
    'Software Development',
  ],
}

// Most recent first
export const education = [
  {
    degree: 'B.Sc. in Computer Science and Engineering (CSE)',
    institution: 'Daffodil International University',
    meta: 'Final Year / Final Semester',
    period: '2023 — 2026',
  },
  {
    degree: 'Higher Secondary Certificate (HSC)',
    institution: 'Madan Mohan College',
    meta: 'GPA 4.83',
    period: '2020',
  },
  {
    degree: 'Secondary School Certificate (SSC)',
    institution: 'Adarsha High School',
    meta: 'GPA 4.72',
    period: '2018',
  },
]

// Project-based experience only. No employment history is claimed.
export const experience = [
  {
    title: 'Full-Stack Developer',
    organization: 'Project-Based Development',
    description:
      'Developed and worked on full-stack web applications using React, Node.js, Express.js and databases. Worked on frontend development, backend API integration, database management and application functionality, building practical software solutions through independent and academic projects.',
  },
  {
    title: 'Backend Developer',
    organization: 'Backend & API Development',
    description:
      'Worked with Node.js and Express.js to develop backend functionality, REST APIs, database-driven features and application logic. Explored backend architecture, data handling and integration between frontend and backend systems through practical projects.',
  },
  // {
  //   title: 'Computer Vision & Machine Learning',
  //   organization: 'Academic and Project-Based Work',
  //   description:
  //     'Explored machine learning and computer vision through academic and practical projects, including model implementation, object detection, image/video processing and computer vision-based problem solving.',
  // },
  {
    title: 'Web Security Enthusiast',
    organization: 'Self-Learning & Security Exploration',
    description:
      'Exploring web application security concepts and common vulnerabilities, including IDOR, CSRF and business logic vulnerabilities. Interested in understanding vulnerability mechanisms, security testing methodologies and improving application security.',
  },
]

// The Certificates section is not shown on the page right now.
// Add real certificates here and add <Certificates /> to pages/Home.jsx.
export const certificates = []
