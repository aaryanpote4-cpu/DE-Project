import { useNavigate } from 'react-router-dom';
import { Truck, Globe, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

export default function SplashView() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-2xl tracking-tight">
          <Truck size={32} />
          <span>LogisticsPro</span>
        </div>
        <button 
          onClick={() => navigate('/auth')} 
          className="font-medium text-slate-700 hover:text-blue-600 transition"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-24 text-center">
        <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-8">
          Intelligent Routing <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            for Modern Logistics
          </span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Optimize your supply chain with our advanced pathfinding algorithms. Reduce transit times, monitor active dispatches, and scale your fleet effortlessly.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate('/auth')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition shadow-lg shadow-blue-500/30"
          >
            Get Started <ArrowRight size={20} />
          </button>
          <a href="#features" className="text-slate-600 font-semibold px-8 py-4 rounded-full hover:bg-slate-100 transition">
            Learn More
          </a>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="bg-white py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why choose LogisticsPro?</h2>
            <p className="text-slate-500">Everything you need to run an efficient logistics network.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Live Tracking Map</h3>
              <p className="text-slate-600 leading-relaxed">View trucks moving across the network in real-time. Full visibility for managers and customers.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Shortest Path Engine</h3>
              <p className="text-slate-600 leading-relaxed">Powered by Dijkstra's algorithm, automatically selecting the most optimal dispatch routes instantly.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Secure Roles</h3>
              <p className="text-slate-600 leading-relaxed">Dedicated interfaces for Warehouse Managers and Customers. Role-based access built-in.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 text-center text-slate-400">
        <div className="flex items-center justify-center gap-2 mb-4 text-slate-300">
          <Truck size={24} />
          <span className="font-bold text-lg tracking-wide">LogisticsPro</span>
        </div>
        <p>© {new Date().getFullYear()} LogisticsPro Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
