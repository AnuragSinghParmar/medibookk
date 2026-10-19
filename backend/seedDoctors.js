require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const DoctorProfile = require('./models/DoctorProfile');


const doctors = [
  {
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh@hospital.com',
    password: 'password123',
    role: 'doctor',
    phone: '9876543210',
    isApproved: true,
    profile: {
      specialization: 'Cardiology',
      experience: 15,
      bio: 'Expert in interventional cardiology and heart failure management with over 15 years of clinical practice.',
      consultationFee: 800,
      hospital: 'Apollo Hospitals, New Delhi',
      address: 'Sarita Vihar, Delhi-Mathura Road, New Delhi',
      rating: 4.8,
      totalRatings: 120
    }
  },
  {
    name: 'Dr. Sneha Sharma',
    email: 'sneha@hospital.com',
    password: 'password123',
    role: 'doctor',
    phone: '9876543211',
    isApproved: true,
    profile: {
      specialization: 'Neurology',
      experience: 10,
      bio: 'Renowned neurologist specializing in stroke, epilepsy, and movement disorders.',
      consultationFee: 1000,
      hospital: 'Fortis Escorts Heart Institute',
      address: 'Okhla Road, New Delhi',
      rating: 4.9,
      totalRatings: 85
    }
  },
  {
    name: 'Dr. Anil Desai',
    email: 'anil@hospital.com',
    password: 'password123',
    role: 'doctor',
    phone: '9876543212',
    isApproved: true,
    profile: {
      specialization: 'Orthopedics',
      experience: 12,
      bio: 'Specialist in joint replacement and sports injuries. Dedicated to patient recovery and mobility.',
      consultationFee: 700,
      hospital: 'Nanavati Super Speciality Hospital',
      address: 'SV Rd, Vile Parle West, Mumbai',
      rating: 4.7,
      totalRatings: 210
    }
  },
  {
    name: 'Dr. Priya Singh',
    email: 'priya@hospital.com',
    password: 'password123',
    role: 'doctor',
    phone: '9876543213',
    isApproved: true,
    profile: {
      specialization: 'Pediatrics',
      experience: 8,
      bio: 'Compassionate pediatrician focusing on child growth, nutrition, and early childhood care.',
      consultationFee: 600,
      hospital: 'Manipal Hospital, Bangalore',
      address: 'Old Airport Road, Bangalore',
      rating: 4.9,
      totalRatings: 340
    }
  },
  {
    name: 'Dr. Vikram Reddy',
    email: 'vikram@hospital.com',
    password: 'password123',
    role: 'doctor',
    phone: '9876543214',
    isApproved: true,
    profile: {
      specialization: 'Psychiatry',
      experience: 14,
      bio: 'Senior psychiatrist addressing adult mental health, anxiety, depression, and stress management.',
      consultationFee: 1200,
      hospital: 'Continental Hospitals, Hyderabad',
      address: 'Financial District, Nanakramguda, Hyderabad',
      rating: 4.6,
      totalRatings: 90
    }
  }
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const today = new Date();
    
    for (const docData of doctors) {
      const existingUser = await User.findOne({ email: docData.email });
      if (existingUser) {
        console.log(`Doctor ${docData.name} already exists.`);
        continue;
      }

      const { profile, ...userData } = docData;
      
      const user = await User.create(userData);
      
      const slots = [];
      const times = ['10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];
      for (let i = 0; i < 3; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(currentDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        for (const t of times) {
          slots.push({ date: dateStr, time: t, isBooked: false });
        }
      }

      await DoctorProfile.create({
        userId: user._id,
        ...profile,
        availableSlots: slots
      });

      console.log(`Created doctor: ${user.name} (${user.email})`);
    }
    
    console.log('Seeding completed.');
  } catch(e) {
    console.error(e);
  }
  process.exit();
});
