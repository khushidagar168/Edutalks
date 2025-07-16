// client/src/components/Footer.jsx
import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = ({ siteSettings }) => {
  return (
    <footer className="bg-gradient-to-t from-white via-gray-50 to-gray-100 border-t mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12 grid sm:grid-cols-2 md:grid-cols-4 gap-10 text-sm text-gray-700">

        {/* EduTalks Info */}
        <div>
          <h3 className="text-2xl font-bold text-indigo-600 mb-2">EduTalks</h3>
          <p className="text-gray-600">
            Empowering learners and educators with interactive tools, courses, quizzes, and personalized learning journeys.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Quick Links</h4>
          <ul className="space-y-1">
            <li><a href="/courses" className="hover:text-indigo-600 transition">Courses</a></li>
            <li><a href="/quizzes" className="hover:text-indigo-600 transition">Quizzes</a></li>
            <li><a href="/daily-topics" className="hover:text-indigo-600 transition">Daily Topics</a></li>
            <li><a href="/subscriptions" className="hover:text-indigo-600 transition">Subscriptions</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Contact</h4>
          {siteSettings && (
            <ul className="space-y-1 text-gray-600">
              <li>Email: {siteSettings.email}</li>
              <li>Phone: {siteSettings.phone}</li>
              <li>Location: {siteSettings.location}</li>
            </ul>
          )}
        </div>

        {/* Social Links */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Follow Us</h4>
          <div className="flex gap-4 text-indigo-600 text-lg">
            {siteSettings?.facebook && (
              <a
                href={
                  siteSettings.facebook.startsWith('http')
                    ? siteSettings.facebook
                    : `https://${siteSettings.facebook}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebookF className="hover:text-indigo-800 transition" />
              </a>
            )}
            {siteSettings?.twitter && (
              <a
                href={
                  siteSettings.twitter.startsWith('http')
                    ? siteSettings.twitter
                    : `https://${siteSettings.twitter}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTwitter className="hover:text-indigo-800 transition" />
              </a>
            )}
            {siteSettings?.instagram && (
              <a
                href={
                  siteSettings.instagram.startsWith('http')
                    ? siteSettings.instagram
                    : `https://${siteSettings.instagram}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram className="hover:text-indigo-800 transition" />
              </a>
            )}
            {siteSettings?.linkedin && (
              <a
                href={
                  siteSettings.linkedin.startsWith('http')
                    ? siteSettings.linkedin
                    : `https://${siteSettings.linkedin}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLinkedinIn className="hover:text-indigo-800 transition" />
              </a>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Note */}
      <div className="text-center text-gray-500 text-xs py-4 border-t">
        © {new Date().getFullYear()} EduTalks. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
