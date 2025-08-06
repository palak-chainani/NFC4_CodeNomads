import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
 // Assuming you have a Footer component

// Inside your component:

import {
  ShieldCheck,
  ClipboardList,
  BarChart2,
  Bell,
  Bot, // For AI agent
  Users, // For community/roles
  Upload, // For issue reporting
  MapPin, // For geotagging
  Star, // For feedback
  Globe, // For multilingual
  Accessibility, // For accessibility
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const features = [
    {
      icon: Upload,
      title: 'Effortless Issue Reporting',
      description: 'Residents can quickly report maintenance issues with photos, videos, and precise locations.',
    },
    {
      icon: ClipboardList,
      title: 'Real-time Status Dashboard',
      description: 'Track the status of every complaint from submission to resolution with full transparency.',
    },
    {
      icon: Bot,
      title: 'AI-Powered Coordination',
      description: 'Intelligent agents autonomously assign tasks, coordinate follow-ups, and streamline workflows.',
    },
    {
      icon: BarChart2,
      title: 'Actionable Analytics',
      description: 'Gain insights with heatmaps, recurring problem alerts, and maintenance cost analysis.',
    },
    {
      icon: Bell,
      title: 'Automated Alerts & Notifications',
      description: 'Receive instant updates via email, SMS, or push notifications on issue progress.',
    },
    {
      icon: Star,
      title: 'User Feedback & Ratings',
      description: 'Residents can rate the resolution quality, ensuring continuous service improvement.',
    },
    {
      icon: Globe,
      title: 'Multilingual Support',
      description: 'Accessible in multiple languages including Hindi and Marathi, with a simple UI for all users.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FEFAE0] text-[#0A400C] font-sans">
      {/* Header/Navbar */}
     

      {/* Hero Section */}
      <section className="bg-[#0A400C] text-[#FEFAE0] py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">
            SocietyTracker: <br className="md:hidden" /> Streamlining Community Management
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-[#B1AB86]">
            Your all-in-one digital platform to report, track, and resolve civic maintenance issues seamlessly, ensuring resident satisfaction and efficient society operations.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              className="bg-[#FEFAE0] text-[#0A400C] px-8 py-3 rounded-full font-semibold text-lg hover:bg-[#B1AB86] hover:text-[#FEFAE0] transition-colors shadow-lg"
              onClick={() => {
              let token = localStorage.getItem('token');
              if (token) {
                navigate('/filenewcomplaint');
              }
            else{
                navigate('/login');
              }
            }}
            >
              Report an Issue
            </button>
            <Link
              to="/login"
              className="border-2 border-[#FEFAE0] text-[#FEFAE0] px-8 py-3 rounded-full font-semibold text-lg hover:bg-[#B1AB86] hover:border-[#B1AB86] transition-colors shadow-lg"
            >
              Admin/Staff Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-[#0A400C]">
            Key Functionalities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-[#FEFAE0] p-6 rounded-xl shadow-md border border-[#B1AB86] flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300 justify-self-center" // Added justify-self-center
              >
                <feature.icon className="h-12 w-12 text-[#819067] mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-[#0A400C]">{feature.title}</h3>
                <p className="text-[#819067]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-[#819067] text-[#FEFAE0] py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">
            Benefits for Your Community
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-[#0A400C] shadow-md">
              <Users className="h-10 w-10 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Enhanced Resident Satisfaction</h3>
              <p className="text-[#B1AB86]">A transparent and efficient system leads to happier residents.</p>
            </div>
            <div className="p-6 rounded-xl bg-[#0A400C] shadow-md">
              <ShieldCheck className="h-10 w-10 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Improved Service Efficiency</h3>
              <p className="text-[#B1AB86]">Streamlined workflows mean faster issue resolution and better resource allocation.</p>
            </div>
            <div className="p-6 rounded-xl bg-[#0A400C] shadow-md">
              <BarChart2 className="h-10 w-10 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Data-Driven Decisions</h3>
              <p className="text-[#B1AB86]">Actionable insights help management make informed choices and track performance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4 text-center">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold mb-6 text-[#0A400C]">
            Ready to Transform Your Society?
          </h2>
          <p className="text-xl mb-8 text-[#819067]">
            Join SocietyTracker today and experience seamless community management.
          </p>
          <Link
            to="/signup"
            className="bg-[#0A400C] text-[#FEFAE0] px-10 py-4 rounded-full font-semibold text-xl hover:bg-[#819067] transition-colors shadow-lg"
          >
            Get Started Now
          </Link>
        </div>
      </section>
      
    </div>
  );
}