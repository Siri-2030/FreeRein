import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  ShieldCheck, ArrowRight, Phone, Heart, Scale,
  BookOpen, Users, Lock, ChevronRight, HeartHandshake
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  })
};

const features = [
  {
    icon: HeartHandshake,
    title: 'Confidential Support',
    desc: 'Connect with trained counsellors who understand your situation.',
    color: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-50',
  },
  {
    icon: Scale,
    title: 'Legal Guidance',
    desc: 'Know your rights and get expert legal advice tailored to your case.',
    color: 'from-indigo-500 to-violet-500',
    bg: 'bg-indigo-50',
  },
  {
    icon: ShieldCheck,
    title: 'Safety Planning',
    desc: 'Build a personalized safety plan to protect yourself and your family.',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
  },
  {
    icon: BookOpen,
    title: 'Resource Library',
    desc: 'Access comprehensive resources on health, housing, finances, and more.',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
  },
];

export default function Landing() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="absolute top-[42px] left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">FreeRein</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuth ? (
              <Link to={createPageUrl('Dashboard')}>
                <Button className="bg-white text-indigo-700 hover:bg-white/90 font-semibold">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-white/90 hover:text-white hover:bg-white/10"
                  onClick={() => base44.auth.redirectToLogin()}
                >
                  Sign In
                </Button>
                <Button
                  className="bg-white text-indigo-700 hover:bg-white/90 font-semibold"
                  onClick={() => base44.auth.redirectToLogin()}
                >
                  Get Help Now
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-400 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-400 rounded-full blur-[128px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-3xl">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-8"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-sm text-white/90 font-medium">Your privacy is our priority</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight"
            >
              You are not alone.
              <br />
              <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
                Help is here.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="mt-6 text-lg sm:text-xl text-white/70 leading-relaxed max-w-2xl"
            >
              FreeRein is a confidential platform connecting survivors of domestic violence 
              with resources, counsellors, and legal support — because everyone deserves to feel safe.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <Button 
                size="lg"
                className="bg-white text-indigo-700 hover:bg-white/90 font-semibold text-base px-8 h-13"
                onClick={() => base44.auth.redirectToLogin()}
              >
                Access Resources
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <a href="tel:181">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 font-semibold text-base px-8 h-13 w-full sm:w-auto"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call 181 Now
                </Button>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">How We Help</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3">
              Comprehensive support, every step of the way
            </h2>
            <p className="text-slate-500 mt-4 text-lg">
              From immediate crisis support to long-term recovery, we're here with the resources you need.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative bg-white rounded-2xl p-7 border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                  <ChevronRight className="w-4 h-4 text-slate-300 absolute top-7 right-6 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">Privacy & Safety</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3">
                Built with your safety in mind
              </h2>
              <p className="text-slate-500 mt-4 text-lg leading-relaxed">
                Every feature of FreeRein is designed with the understanding that safety is paramount. 
                Your data is encrypted, your visits can be hidden, and help is always one click away.
              </p>
              <div className="mt-8 space-y-5">
                {[
                  { icon: Lock, text: 'End-to-end data encryption' },
                  { icon: ShieldCheck, text: 'Quick exit button on every page' },
                  { icon: Users, text: 'Gender-responsive approach to support' },
                  { icon: Heart, text: 'Trauma-informed care from professionals' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <span className="text-slate-700 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-10 text-white"
            >
              <h3 className="text-2xl font-bold mb-4">Need immediate help?</h3>
              <p className="text-white/80 text-lg leading-relaxed mb-8">
                If you or someone you know is in danger, help is available 24/7. 
                Don't hesitate to reach out — trained advocates are ready to listen.
              </p>
              <div className="space-y-4">
                <a href="tel:181" className="flex items-center gap-4 bg-white/10 backdrop-blur rounded-xl p-4 hover:bg-white/20 transition-all">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Women Helpline</p>
                    <p className="text-white/70 text-sm">181 (24/7)</p>
                  </div>
                </a>
                <a href="tel:1091" className="flex items-center gap-4 bg-white/10 backdrop-blur rounded-xl p-4 hover:bg-white/20 transition-all">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Women in Distress</p>
                    <p className="text-white/70 text-sm">1091 (24/7)</p>
                  </div>
                </a>
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur rounded-xl p-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold">NCW Helpline</p>
                    <p className="text-white/70 text-sm">7827-170-170</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">FreeRein</span>
              </div>
              <p className="text-slate-400 text-sm max-w-sm">
                A gender-responsive platform providing resources, support, and safety planning 
                for those affected by domestic violence.
              </p>
            </div>
            <div className="text-sm text-slate-400">
              <p>© {new Date().getFullYear()} FreeRein. All rights reserved.</p>
              <p className="mt-1">If you are in danger, call 100 (Police) or 181 (Women Helpline) immediately.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}