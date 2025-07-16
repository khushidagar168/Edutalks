// client/src/pages/LandingPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarLanding from '../components/NavbarLanding';
import Footer from '../components/Footer';
import AOS from 'aos';
import axios from '../services/axios';
import 'aos/dist/aos.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [siteSettings, setSiteSettings] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });

    const fetchSiteSettings = async () => {
      try {
        const res = await axios.get('/site-settings');
        setSiteSettings(res.data);
      } catch (error) {
        console.error('Error fetching site settings:', error);
      }
    };

    fetchSiteSettings();
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-white via-sky-50 to-slate-100">
      <NavbarLanding />

      <main className="flex flex-col items-center justify-center text-center px-6 py-20 relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute top-20 right-0 w-72 h-72 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>

        <h1
          data-aos="fade-up"
          className="text-5xl md:text-6xl font-extrabold leading-tight text-slate-800 mb-6 z-10"
        >
          Empower Your Learning Journey with EduTalks
        </h1>
        <p
          data-aos="fade-up"
          data-aos-delay="200"
          className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10 z-10"
        >
          Join a vibrant community of learners and educators. Explore diverse courses, skill-building quizzes, personalized practice, and community support — all in one platform.
        </p>

        <div className="space-x-4 z-10" data-aos="fade-up" data-aos-delay="400">
          <button
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold text-lg shadow-md transform hover:scale-105 transition"
          >
            Get Started 🚀
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="bg-white hover:bg-slate-100 text-indigo-600 px-6 py-3 rounded-lg font-semibold text-lg border border-indigo-600 shadow-sm transform hover:scale-105 transition"
          >
            Login / Register
          </button>
        </div>
      </main>

      {/* About Section */}
      <section id="about" className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-indigo-700 mb-6" data-aos="fade-up">👋 Welcome to EduTalks</h2>
        <p className="text-gray-600 text-lg" data-aos="fade-up" data-aos-delay="100">
          EduTalks is your personalized learning companion designed to help you grow through practical content, quizzes, and real-time progress tracking. Whether you're a student or a mentor, this platform is made for you.
        </p>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-indigo-700 mb-6" data-aos="fade-up">✨ Why Choose EduTalks?</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['📚 Skill-Based Learning', 'Engage in practical and curated topics across domains.'],
            ['🧠 Interactive Quizzes', 'Boost your retention with challenging, structured questions.'],
            ['🎤 Practice Tools', 'Train your voice and articulation with feedback-enabled tools.'],
            ['📈 Real-Time Progress', 'Visualize your improvement and learning journey clearly.'],
            ['🌍 Connect & Collaborate', 'Join study groups and grow with a thriving community.'],
            ['🔐 Private & Personalized', 'Your journey, your pace, with full privacy and control.'],
          ].map(([title, desc], index) => (
            <div key={index} data-aos="zoom-in" data-aos-delay={index * 100} className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-white py-16 px-6 text-center">
        <h2 className="text-3xl font-bold text-indigo-700 mb-6" data-aos="fade-up">📬 Get in Touch</h2>
        <p className="text-gray-600 text-lg mb-4" data-aos="fade-up" data-aos-delay="100">
          Have questions or suggestions? Reach out to us!
        </p>
        {siteSettings && (
          <div className="text-slate-600 space-y-1 text-sm">
            <p>Email: {siteSettings.email}</p>
            <p>Phone: {siteSettings.phone}</p>
            <p>Location: {siteSettings.location}</p>
          </div>
        )}
      </section>

      <Footer siteSettings={siteSettings} />
    </div>
  );
};

export default LandingPage;
