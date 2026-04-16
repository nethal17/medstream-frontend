import { useState, useEffect } from "react";
import {
  Calendar,
  Video,
  Brain,
  ShieldCheck,
  Bell,
  CreditCard,
  ChevronRight,
  Star,
  Clock,
  MapPin,
  Search,
  ArrowRight,
  Heart,
  Activity,
  Users,
  Award,
  Menu,
  X,
  Phone,
  Mail,
  Stethoscope,
  FileText,
  Zap,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";

/* ─────────────────── NAV ─────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-200 group-hover:shadow-teal-300 transition-shadow">
            <Activity className="w-4.5 h-4.5 text-white" size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            Med<span className="text-teal-600">Stream</span>
          </span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {["Services", "Doctors", "How It Works", "Pricing"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button className="text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors px-4 py-2">
            Sign In
          </button>
          <button className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-teal-200 active:scale-95">
            Get Started Free
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-4">
          {["Services", "Doctors", "How It Works", "Pricing"].map((item) => (
            <a key={item} href="#" className="text-sm font-medium text-slate-700 py-1">
              {item}
            </a>
          ))}
          <button className="bg-teal-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl w-full mt-2">
            Get Started Free
          </button>
        </div>
      )}
    </nav>
  );
}

/* ─────────────────── HERO ─────────────────── */
function Hero() {
  const [query, setQuery] = useState("");

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 py-32 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold px-4 py-2 rounded-full">
            <Zap size={12} className="text-teal-400" />
            AI-Powered Healthcare Platform
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
              Healthcare at
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                Your Fingertips
              </span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
              Book doctor appointments, attend secure video consultations, get AI-powered health
              insights, and manage your complete medical history — all in one platform.
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2 max-w-lg hover:border-teal-500/40 transition-colors">
            <Search size={18} className="text-slate-500 ml-3 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by doctor, specialty, or symptom..."
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none"
            />
            <button className="bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shrink-0">
              Search
            </button>
          </div>

          {/* Trust Row */}
          <div className="flex items-center gap-6">
            <div className="flex -space-x-2">
              {["bg-violet-400", "bg-teal-400", "bg-amber-400", "bg-rose-400"].map((c, i) => (
                <div
                  key={i}
                  className={`w-9 h-9 rounded-full ${c} border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold`}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-400">Trusted by <span className="text-white font-semibold">50,000+</span> patients</p>
            </div>
          </div>
        </div>

        {/* Right: Floating Cards */}
        <div className="hidden lg:block relative h-[520px]">
          {/* Main card */}
          <div className="absolute top-12 right-0 w-72 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                <Stethoscope size={22} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Dr. Ayesha Perera</p>
                <p className="text-slate-400 text-xs">Cardiologist · MBBS, MD</p>
              </div>
            </div>
            <div className="space-y-2 mb-5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Next Available</span>
                <span className="text-teal-400 font-medium">Today, 3:00 PM</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Consultation Fee</span>
                <span className="text-white font-medium">LKR 2,500</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Rating</span>
                <span className="text-white font-medium flex items-center gap-1">
                  <Star size={11} className="fill-amber-400 text-amber-400" /> 4.9 (312)
                </span>
              </div>
            </div>
            <button className="w-full bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold py-3 rounded-xl transition-colors">
              Book Appointment
            </button>
          </div>

          {/* Video call card */}
          <div className="absolute bottom-24 left-4 w-60 bg-gradient-to-br from-teal-600/20 to-cyan-600/20 backdrop-blur-xl border border-teal-500/20 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-semibold">Live Consultation</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
                <Video size={16} className="text-teal-400" />
              </div>
              <div>
                <p className="text-white text-xs font-medium">Video Session Active</p>
                <p className="text-slate-400 text-xs">14:32 elapsed</p>
              </div>
            </div>
          </div>

          {/* AI card */}
          <div className="absolute top-64 left-0 w-56 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} className="text-purple-400" />
              <span className="text-purple-300 text-xs font-semibold">AI Health Analysis</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Based on your symptoms, we recommend consulting a{" "}
              <span className="text-teal-400 font-medium">Pulmonologist</span>.
            </p>
            <div className="mt-2 bg-purple-500/10 border border-purple-500/20 rounded-lg p-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-purple-400" />
                <span className="text-purple-300 text-xs">98% confidence</span>
              </div>
            </div>
          </div>

          {/* Stats mini-card */}
          <div className="absolute bottom-4 right-4 bg-amber-500/10 border border-amber-500/20 backdrop-blur-xl rounded-2xl p-4 shadow-xl">
            <p className="text-amber-300 text-xs font-semibold mb-1">Appointment Confirmed</p>
            <p className="text-white text-sm font-bold">Tomorrow · 10:00 AM</p>
            <p className="text-slate-400 text-xs mt-1">Reminder set ✓</p>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" className="w-full text-slate-50" fill="currentColor">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  );
}

/* ─────────────────── STATS ─────────────────── */
function Stats() {
  const stats = [
    { icon: Users, value: "50,000+", label: "Registered Patients", color: "text-teal-600" },
    { icon: Stethoscope, value: "1,200+", label: "Certified Doctors", color: "text-cyan-600" },
    { icon: Calendar, value: "200k+", label: "Appointments Booked", color: "text-indigo-600" },
    { icon: Award, value: "4.9 / 5", label: "Average Patient Rating", color: "text-amber-600" },
  ];

  return (
    <section className="bg-slate-50 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(({ icon: Icon, value, label, color }) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className={`w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-3 ${color}`}>
                <Icon size={22} />
              </div>
              <p className={`text-2xl font-bold ${color} mb-1`}>{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── SERVICES ─────────────────── */
function Services() {
  const services = [
    {
      icon: Calendar,
      title: "Smart Appointment Booking",
      desc: "Search by specialty, real-time availability, and instant booking with automatic reminders.",
      color: "bg-teal-50 text-teal-600",
      border: "hover:border-teal-200",
    },
    {
      icon: Video,
      title: "Secure Video Consultations",
      desc: "HD telemedicine sessions with encrypted end-to-end video powered by Agora/Twilio.",
      color: "bg-cyan-50 text-cyan-600",
      border: "hover:border-cyan-200",
    },
    {
      icon: Brain,
      title: "AI Symptom Checker",
      desc: "Describe your symptoms and receive AI-driven health insights and specialist recommendations.",
      color: "bg-violet-50 text-violet-600",
      border: "hover:border-violet-200",
    },
    {
      icon: FileText,
      title: "Digital Prescriptions",
      desc: "Doctors issue secure digital prescriptions instantly accessible in your patient portal.",
      color: "bg-indigo-50 text-indigo-600",
      border: "hover:border-indigo-200",
    },
    {
      icon: CreditCard,
      title: "Secure Online Payments",
      desc: "Pay consultation fees via PayHere, Dialog Genie, Stripe, or PayPal in a safe environment.",
      color: "bg-emerald-50 text-emerald-600",
      border: "hover:border-emerald-200",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      desc: "Automated SMS & email alerts for appointment confirmations, reminders, and updates.",
      color: "bg-amber-50 text-amber-600",
      border: "hover:border-amber-200",
    },
  ];

  return (
    <section id="services" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-teal-600 tracking-widest uppercase mb-3 block">
            Our Services
          </span>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Everything You Need, <br /> In One Platform
          </h2>
          <p className="text-slate-500 leading-relaxed">
            MedStream brings together the full healthcare journey — from finding the right doctor to
            receiving your prescription — seamlessly and securely.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map(({ icon: Icon, title, desc, color, border }) => (
            <div
              key={title}
              className={`bg-white rounded-2xl p-6 border border-slate-100 ${border} hover:shadow-lg transition-all duration-200 group cursor-pointer`}
            >
              <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
                <Icon size={22} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors">
                {title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              <div className="mt-4 flex items-center gap-1 text-teal-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── HOW IT WORKS ─────────────────── */
function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: Search,
      title: "Find Your Doctor",
      desc: "Search by specialty, location, or symptom. Filter by availability and rating to find the perfect match.",
    },
    {
      step: "02",
      icon: Calendar,
      title: "Book an Appointment",
      desc: "Choose a convenient time slot, confirm payment securely, and get instant booking confirmation.",
    },
    {
      step: "03",
      icon: Video,
      title: "Attend Consultation",
      desc: "Join your video consultation from anywhere. Share reports and receive your digital prescription.",
    },
    {
      step: "04",
      icon: Heart,
      title: "Track Your Health",
      desc: "Access your full medical history, prescriptions, and AI health summaries in your patient portal.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-teal-600 tracking-widest uppercase mb-3 block">
            How It Works
          </span>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Get Care in 4 Simple Steps</h2>
          <p className="text-slate-500 leading-relaxed">
            From registration to receiving your prescription, the entire healthcare experience is
            designed to be fast, simple, and stress-free.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-14 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-teal-200 via-cyan-300 to-teal-200" />

          {steps.map(({ step, icon: Icon, title, desc }, i) => (
            <div key={step} className="relative text-center group">
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-200 group-hover:shadow-teal-300 transition-shadow relative z-10">
                  <Icon size={26} className="text-white" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center z-20">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── DOCTORS ─────────────────── */
const doctors = [
  {
    name: "Dr. Ayesha Perera",
    specialty: "Cardiologist",
    rating: 4.9,
    reviews: 312,
    experience: "12 yrs",
    fee: "2,500",
    available: "Today",
    initials: "AP",
    color: "from-teal-400 to-cyan-500",
  },
  {
    name: "Dr. Nimal Fernando",
    specialty: "Neurologist",
    rating: 4.8,
    reviews: 198,
    experience: "9 yrs",
    fee: "3,000",
    available: "Tomorrow",
    initials: "NF",
    color: "from-violet-400 to-purple-500",
  },
  {
    name: "Dr. Priya Seneviratne",
    specialty: "Pediatrician",
    rating: 4.9,
    reviews: 445,
    experience: "15 yrs",
    fee: "2,000",
    available: "Today",
    initials: "PS",
    color: "from-rose-400 to-pink-500",
  },
  {
    name: "Dr. Kamal Jayasuriya",
    specialty: "Dermatologist",
    rating: 4.7,
    reviews: 256,
    experience: "8 yrs",
    fee: "2,800",
    available: "Wed",
    initials: "KJ",
    color: "from-amber-400 to-orange-500",
  },
];

function Doctors() {
  return (
    <section id="doctors" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <span className="text-sm font-semibold text-teal-600 tracking-widest uppercase mb-3 block">
              Our Specialists
            </span>
            <h2 className="text-4xl font-bold text-slate-900">
              Meet Our Top <br /> Rated Doctors
            </h2>
          </div>
          <button className="inline-flex items-center gap-2 text-teal-600 font-semibold hover:gap-3 transition-all text-sm">
            View All Doctors <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {doctors.map((doc) => (
            <div
              key={doc.name}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              {/* Avatar area */}
              <div className={`h-32 bg-gradient-to-br ${doc.color} p-6 flex items-end`}>
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {doc.initials}
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-semibold text-slate-900 mb-0.5">{doc.name}</h3>
                <p className="text-sm text-teal-600 font-medium mb-3">{doc.specialty}</p>

                <div className="flex items-center gap-3 mb-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-slate-700">{doc.rating}</span>
                    <span>({doc.reviews})</span>
                  </span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span>{doc.experience} exp</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-400">Next Available</p>
                    <p className="text-sm font-semibold text-slate-800">{doc.available}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Consult Fee</p>
                    <p className="text-sm font-semibold text-slate-800">LKR {doc.fee}</p>
                  </div>
                </div>

                <button className="w-full border border-teal-200 text-teal-700 hover:bg-teal-600 hover:text-white hover:border-teal-600 text-sm font-semibold py-2.5 rounded-xl transition-all duration-200">
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── AI SECTION ─────────────────── */
function AISection() {
  const [symptom, setSymptom] = useState("");
  const [result, setResult] = useState(null);

  const mockCheck = () => {
    if (!symptom.trim()) return;
    setResult({
      recommendation: "Pulmonologist",
      confidence: 94,
      urgency: "Moderate",
      tips: ["Stay hydrated", "Avoid cold environments", "Monitor temperature"],
    });
  };

  return (
    <section className="py-24 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <Brain size={12} /> AI-Powered
            </span>
            <h2 className="text-4xl font-bold text-white mb-6">
              Check Your Symptoms <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                Get Smart Insights
              </span>
            </h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              Our AI symptom checker analyzes your symptoms and provides preliminary health
              suggestions and the most suitable medical specialist for your condition — instantly.
            </p>
            <div className="space-y-3">
              {[
                "Powered by advanced ML health models",
                "Recommends the right specialist",
                "Available 24/7, no wait time",
                "Always consult a real doctor for diagnosis",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2 size={16} className="text-teal-400 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Widget */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Brain size={20} className="text-violet-400" />
              </div>
              <div>
                <p className="text-white font-semibold">AI Symptom Checker</p>
                <p className="text-slate-400 text-xs">Describe what you're feeling</p>
              </div>
            </div>

            <textarea
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder="e.g. I have a persistent dry cough, shortness of breath, and mild chest tightness for the past 3 days..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-teal-500/50 transition-colors resize-none mb-4"
            />

            <button
              onClick={mockCheck}
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-sm font-semibold py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-teal-900/50 mb-4"
            >
              Analyze Symptoms
            </button>

            {result && (
              <div className="space-y-3 border-t border-white/10 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">AI Results</p>
                <div className="flex items-center justify-between bg-teal-500/10 border border-teal-500/20 rounded-xl p-3">
                  <span className="text-slate-300 text-sm">Recommended Specialist</span>
                  <span className="text-teal-400 font-semibold text-sm">{result.recommendation}</span>
                </div>
                <div className="flex items-center justify-between bg-violet-500/10 border border-violet-500/20 rounded-xl p-3">
                  <span className="text-slate-300 text-sm">Confidence Level</span>
                  <span className="text-violet-400 font-semibold text-sm">{result.confidence}%</span>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                  <p className="text-amber-300 text-xs font-semibold mb-1">Quick Tips</p>
                  <div className="space-y-1">
                    {result.tips.map((tip) => (
                      <p key={tip} className="text-slate-400 text-xs flex items-center gap-1.5">
                        <span className="w-1 h-1 bg-amber-400 rounded-full" /> {tip}
                      </p>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-500 italic text-center">
                  ⚠️ This is a preliminary suggestion. Consult a doctor for proper diagnosis.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── TESTIMONIALS ─────────────────── */
const testimonials = [
  {
    name: "Chamara Wickramasinghe",
    role: "Patient · Colombo",
    text: "MedStream made it incredibly easy to see a specialist without waiting weeks. The video consultation was crystal clear and the doctor was excellent.",
    rating: 5,
    initials: "CW",
    color: "bg-teal-500",
  },
  {
    name: "Sanduni Rathnayake",
    role: "Patient · Kandy",
    text: "The AI symptom checker pointed me to the right specialist right away. Booked an appointment the same day. Amazing service!",
    rating: 5,
    initials: "SR",
    color: "bg-violet-500",
  },
  {
    name: "Roshan De Silva",
    role: "Patient · Galle",
    text: "Having all my prescriptions and medical history in one place is a game changer. The notifications keep me on track with follow-ups.",
    rating: 5,
    initials: "RD",
    color: "bg-amber-500",
  },
];

function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-sm font-semibold text-teal-600 tracking-widest uppercase mb-3 block">
            Patient Stories
          </span>
          <h2 className="text-4xl font-bold text-slate-900">Loved by Thousands of Patients</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-bold`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── CTA ─────────────────── */
function CTA() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl shadow-teal-200">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Heart size={26} className="text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Start Your Health Journey Today
            </h2>
            <p className="text-teal-100 mb-8 max-w-xl mx-auto leading-relaxed">
              Join over 50,000 patients already experiencing smarter, faster, and more accessible
              healthcare with MedStream.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="bg-white text-teal-700 font-semibold px-8 py-3.5 rounded-xl hover:shadow-lg transition-all hover:scale-105">
                Create Free Account
              </button>
              <button className="border-2 border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <PlayCircle size={18} /> Watch Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── FOOTER ─────────────────── */
function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                <Activity size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg text-white">Med<span className="text-teal-400">Stream</span></span>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Connecting patients with world-class doctors through innovative telemedicine technology.
            </p>
            <div className="space-y-2">
              <a href="#" className="flex items-center gap-2 text-sm hover:text-teal-400 transition-colors">
                <Mail size={14} /> support@medstream.lk
              </a>
              <a href="#" className="flex items-center gap-2 text-sm hover:text-teal-400 transition-colors">
                <Phone size={14} /> +94 11 234 5678
              </a>
            </div>
          </div>

          {/* Links */}
          {[
            { title: "Services", links: ["Book Appointment", "Video Consultation", "AI Symptom Checker", "Digital Prescriptions", "Medical Records"] },
            { title: "Company", links: ["About Us", "Our Doctors", "Blog", "Careers", "Press"] },
            { title: "Support", links: ["Help Center", "Privacy Policy", "Terms of Service", "Cookie Policy", "Contact Us"] },
          ].map(({ title, links }) => (
            <div key={title}>
              <p className="text-white font-semibold text-sm mb-4">{title}</p>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm hover:text-teal-400 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © 2026 MedStream. Built for SE3020 – Distributed Systems Assignment.
          </p>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-teal-500" />
            <span className="text-xs text-slate-500">HIPAA Compliant · End-to-End Encrypted</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────── ROOT ─────────────────── */
export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Stats />
      <Services />
      <HowItWorks />
      <Doctors />
      <AISection />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}