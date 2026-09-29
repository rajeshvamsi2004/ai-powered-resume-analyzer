import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  XCircle,
  Briefcase, 
  Sparkles, 
  Loader2, 
  Award,
  BarChart3,
  Trash2,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Download,
  User as UserIcon,
  LogOut,
  Lock,
  Mail,
  X
} from 'lucide-react';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
function App() {
  const [activeTab, setActiveTab] = useState('match'); // 'match' or 'audit'
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // --- AUTH STATES ---
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Check for saved user on load
  useEffect(() => {
    const savedUser = localStorage.getItem('user_info');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    try {
      if (authMode === 'register') {
        await axios.post(`${API_BASE_URL}/api/auth/register`, {
          name: authForm.name,
          email: authForm.email,
          password: authForm.password
        });
        setAuthSuccess("Account created successfully! Please sign in.");
        setAuthMode('login');
      } else {
        const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
          email: authForm.email,
          password: authForm.password
        });
        
        const userData = { email: authForm.email, token: res.data.token };
        localStorage.setItem('user_info', JSON.stringify(userData));
        localStorage.setItem('jwt_token', res.data.token);
        setUser(userData);
        setShowAuthModal(false);
        setAuthForm({ name: '', email: '', password: '' });
      }
    } catch (err) {
      setAuthError(err.response?.data?.error || err.response?.data || "Authentication failed.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_info');
    localStorage.removeItem('jwt_token');
    setUser(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== "application/pdf") {
        setError("Only PDF resumes are supported.");
        return;
      }
      setFile(selected);
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload your PDF resume first.");
      return;
    }

    if (activeTab === 'match' && !jobDescription.trim()) {
      setError("Please paste the job description to match against.");
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const endpoint = activeTab === 'match' 
        ? `${API_BASE_URL}/api/resume/match-job`
        : `${API_BASE_URL}/api/resume/analyze`;

      if (activeTab === 'match') {
        formData.append('jobDescription', jobDescription);
      }

      const response = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || "Connection error. Make sure your Spring Boot backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const score = result ? (result.matchScore || result.overallScore || 0) : 0;
  const getScoreColor = (val) => {
    if (val >= 80) return { stroke: '#10B981', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (val >= 60) return { stroke: '#F59E0B', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { stroke: '#EF4444', badge: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 p-0.5 shadow-lg shadow-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
                CareerMatch AI
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
                ATS Engine
              </span>
            </div>
          </div>

          {/* User Auth Bar */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-300 font-medium hidden sm:inline">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 border border-slate-700 text-xs font-semibold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setShowAuthModal(true); setAuthError(''); }}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Optimize Your Resume for Any Job Posting
          </h1>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            Upload your resume, paste target job requirements, and get an instant ATS-scored breakdown with actionable suggestions.
          </p>

          {/* Mode Switcher */}
          <div className="mt-6 inline-flex p-1 bg-slate-800/90 rounded-2xl border border-slate-700/70 shadow-inner">
            <button
              onClick={() => { setActiveTab('match'); setResult(null); setError(''); }}
              className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'match'
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Target Job Match</span>
            </button>
            <button
              onClick={() => { setActiveTab('audit'); setResult(null); setError(''); }}
              className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'audit'
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>General ATS Audit</span>
            </button>
          </div>
        </div>

        {/* Input Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Resume Upload Card (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700/60 p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-slate-200 text-sm">Resume (PDF)</h3>
              </div>
              {file && (
                <button 
                  onClick={() => setFile(null)}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            <label className={`flex-1 min-h-[220px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
              file 
                ? 'border-indigo-500/60 bg-indigo-500/5' 
                : 'border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/80 bg-slate-900/40'
            }`}>
              <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
              
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
                <UploadCloud className="w-7 h-7 text-indigo-400" />
              </div>

              {file ? (
                <div>
                  <p className="font-semibold text-sm text-slate-200">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-slate-300">Click to upload or drag & drop</p>
                  <p className="text-xs text-slate-500 mt-1">Standard ATS-readable PDF (Max 5MB)</p>
                </div>
              )}
            </label>
          </div>

          {/* Job Description Card (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700/60 p-6 shadow-xl">
            <div className="flex items-center space-x-2 mb-4">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              <h3 className="font-semibold text-slate-200 text-sm">
                {activeTab === 'match' ? 'Job Description (Required for matching)' : 'Audit Mode Settings'}
              </h3>
            </div>

            {activeTab === 'match' ? (
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job posting requirements here (e.g. 'Seeking a Java Developer with Spring Boot, MySQL, REST APIs, Docker, and AWS experience...')"
                className="w-full flex-1 min-h-[220px] bg-slate-900/60 border border-slate-700/70 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none font-mono"
              />
            ) : (
              <div className="flex-1 min-h-[220px] rounded-2xl border border-slate-700/40 bg-slate-900/30 p-6 flex flex-col justify-center items-center text-center">
                <Sparkles className="w-8 h-8 text-indigo-400 mb-2 opacity-80" />
                <h4 className="text-sm font-semibold text-slate-200">General ATS Evaluation</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Our system evaluates project depth, skill-to-experience ratios, formatting standards, and missing fundamentals.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-3 text-rose-300 text-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm tracking-wide bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Running Deep AI Analysis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>{activeTab === 'match' ? 'Calculate Match & Skill Gaps' : 'Run Full Resume Audit'}</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>

        {/* RESULTS DASHBOARD */}
        {result && (
          <div className="mt-14 space-y-6 animate-in fade-in duration-500 print:m-0 print:text-black">
            
            {/* Header with Print Button */}
            <div className="flex justify-between items-center bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
                Generated Analysis Report
              </span>
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save / Download PDF Report</span>
              </button>
            </div>

            {/* Top Stat Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Circular Score Gauge (4 Cols) */}
              <div className="md:col-span-4 bg-slate-800/60 backdrop-blur-md rounded-3xl border border-slate-700/60 p-6 flex flex-col items-center justify-center text-center shadow-xl">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">
                  {activeTab === 'match' ? 'Match Compatibility' : 'Overall ATS Score'}
                </span>
                
                {/* SVG Gauge */}
                <div className="relative w-36 h-36 flex items-center justify-center my-2">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" className="text-slate-800" fill="transparent" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke={getScoreColor(score).stroke}
                      strokeWidth="8"
                      strokeDasharray="264"
                      strokeDashoffset={264 - (264 * score) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-extrabold text-white tracking-tight">{score}%</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Score</span>
                  </div>
                </div>

                <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(score).badge}`}>
                  {score >= 80 ? 'High Match • Ready to Apply' : score >= 60 ? 'Moderate Match • Optimization Recommended' : 'Low Match • Skill Gaps Detected'}
                </div>
              </div>

              {/* Summary and Key Metrics (8 Cols) */}
              <div className="md:col-span-8 bg-slate-800/60 backdrop-blur-md rounded-3xl border border-slate-700/60 p-6 sm:p-8 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center space-x-2 text-indigo-400 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Executive Summary</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    {result.summary || "Candidate matches key criteria with room for targeted optimization."}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    Based on ATS parsing standards, your resume was scanned for hard skills, framework proficiency, and technical context matching the role requirements.
                  </p>
                </div>

                {/* Score Breakdown Bars (Audit Mode) */}
                {result.scoreBreakdown && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/60">
                    {Object.entries(result.scoreBreakdown).map(([cat, val]) => (
                      <div key={cat} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-400 capitalize">{cat.replace('Score', '')}</span>
                        <div className="text-lg font-bold text-white mt-0.5">{val}<span className="text-xs text-slate-500 font-normal">/25</span></div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(val / 25) * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Positive Matches */}
              <div className="bg-slate-800/60 backdrop-blur-md rounded-3xl border border-slate-700/60 p-6 shadow-xl">
                <div className="flex items-center space-x-2 text-emerald-400 mb-4">
                  <CheckCircle2 className="w-5 h-5" />
                  <h4 className="font-bold text-sm uppercase tracking-wider text-slate-200">
                    {activeTab === 'match' ? 'Matched Keywords & Skills' : 'Identified Core Strengths'}
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(result.strongMatches || result.technicalSkills || []).map((skill, i) => (
                    <span key={i} className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="bg-slate-800/60 backdrop-blur-md rounded-3xl border border-slate-700/60 p-6 shadow-xl">
                <div className="flex items-center space-x-2 text-rose-400 mb-4">
                  <XCircle className="w-5 h-5" />
                  <h4 className="font-bold text-sm uppercase tracking-wider text-slate-200">
                    {activeTab === 'match' ? 'Missing Keywords / Skills' : 'Identified Weaknesses'}
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(result.missingSkills || result.weaknesses || []).map((skill, i) => (
                    <span key={i} className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {(result.recommendations || result.suggestions) && (
              <div className="bg-slate-800/60 backdrop-blur-md rounded-3xl border border-slate-700/60 p-6 sm:p-8 shadow-xl">
                <div className="flex items-center space-x-2 text-indigo-400 mb-6">
                  <Award className="w-5 h-5" />
                  <h4 className="font-bold text-sm uppercase tracking-wider text-slate-200">
                    Step-by-Step Optimization Plan
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(result.recommendations || result.suggestions).map((tip, idx) => (
                    <div key={idx} className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="w-7 h-7 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-xs">
                          0{idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Action Item</span>
                      </div>
                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* --- AUTH MODAL (LOGIN & REGISTRATION) --- */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white text-center mb-1">
              {authMode === 'login' ? 'Sign In to CareerMatch' : 'Create an Account'}
            </h3>
            <p className="text-xs text-slate-400 text-center mb-6">
              {authMode === 'login' ? 'Enter your credentials to continue' : 'Register to track resume revisions'}
            </p>

            {authError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full bg-slate-800/70 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full bg-slate-800/70 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-800/70 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all"
              >
                {authMode === 'login' ? 'Sign In' : 'Register Account'}
              </button>
            </form>

            <div className="text-center mt-6 pt-4 border-t border-slate-800">
              {authMode === 'login' ? (
                <p className="text-xs text-slate-400">
                  Don't have an account?{' '}
                  <button 
                    onClick={() => { setAuthMode('register'); setAuthError(''); setAuthSuccess(''); }}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Register here
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-400">
                  Already have an account?{' '}
                  <button 
                    onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Sign In here
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;