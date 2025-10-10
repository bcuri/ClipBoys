"use client";

import { useState } from "react";
import { 
  User, 
  Video, 
  Heart, 
  CreditCard, 
  Settings, 
  Download, 
  Share2, 
  Bell,
  Shield,
  Zap,
  TrendingUp,
  Clock,
  Star,
  ChevronRight
} from "lucide-react";
import { Vortex } from "../../components/ui/vortex";
import MagicBentoBorder from "../../components/ui/MagicBentoBorder";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "videos", label: "My Videos", icon: Video },
    { id: "saved", label: "Saved Clips", icon: Heart },
    { id: "subscription", label: "Subscription", icon: CreditCard },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const mockVideos = [
    { id: 1, title: "How to Build a SaaS in 2024", thumbnail: "/api/placeholder/300/200", views: "12.5K", date: "2 days ago", clips: 8 },
    { id: 2, title: "React vs Vue: The Ultimate Showdown", thumbnail: "/api/placeholder/300/200", views: "8.2K", date: "1 week ago", clips: 12 },
    { id: 3, title: "AI Tools That Will Change Everything", thumbnail: "/api/placeholder/300/200", views: "15.7K", date: "2 weeks ago", clips: 6 },
  ];

  const mockSavedClips = [
    { id: 1, title: "The Secret to Viral Content", source: "How to Build a SaaS in 2024", virality: 94, duration: "0:15" },
    { id: 2, title: "Why Most Startups Fail", source: "React vs Vue: The Ultimate Showdown", virality: 87, duration: "0:22" },
    { id: 3, title: "AI Will Replace These Jobs", source: "AI Tools That Will Change Everything", virality: 91, duration: "0:18" },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MagicBentoBorder className="rounded-xl" glowColor="50, 227, 63" borderWidth={2} borderRadius={12}>
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Videos</p>
                <p className="text-2xl font-bold text-white">24</p>
              </div>
              <Video className="h-8 w-8 text-cyan-400" />
            </div>
          </div>
        </MagicBentoBorder>

        <MagicBentoBorder className="rounded-xl" glowColor="50, 227, 63" borderWidth={2} borderRadius={12}>
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Saved Clips</p>
                <p className="text-2xl font-bold text-white">156</p>
              </div>
              <Heart className="h-8 w-8 text-pink-400" />
            </div>
          </div>
        </MagicBentoBorder>

        <MagicBentoBorder className="rounded-xl" glowColor="50, 227, 63" borderWidth={2} borderRadius={12}>
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Views</p>
                <p className="text-2xl font-bold text-white">2.1M</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </div>
        </MagicBentoBorder>
      </div>

      {/* Recent Activity */}
      <MagicBentoBorder className="rounded-xl" glowColor="50, 227, 63" borderWidth={2} borderRadius={12}>
        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <div className="flex-1">
                <p className="text-white text-sm">Generated 8 clips from "How to Build a SaaS"</p>
                <p className="text-white/60 text-xs">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <div className="flex-1">
                <p className="text-white text-sm">Saved clip "The Secret to Viral Content"</p>
                <p className="text-white/60 text-xs">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <div className="w-2 h-2 rounded-full bg-purple-400"></div>
              <div className="flex-1">
                <p className="text-white text-sm">Downloaded 5 clips as MP4</p>
                <p className="text-white/60 text-xs">3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </MagicBentoBorder>
    </div>
  );

  const renderVideos = () => (
    <div className="space-y-4">
      {mockVideos.map((video) => (
        <MagicBentoBorder key={video.id} className="rounded-xl" glowColor="50, 227, 63" borderWidth={2} borderRadius={12}>
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
            <div className="flex gap-4">
              <div className="w-32 h-20 bg-white/10 rounded-lg flex items-center justify-center">
                <Video className="h-8 w-8 text-white/40" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-2">{video.title}</h3>
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {video.views} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    {video.clips} clips
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {video.date}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <Share2 className="h-4 w-4 text-white" />
                </button>
                <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <Download className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </MagicBentoBorder>
      ))}
    </div>
  );

  const renderSavedClips = () => (
    <div className="space-y-4">
      {mockSavedClips.map((clip) => (
        <MagicBentoBorder key={clip.id} className="rounded-xl" glowColor="50, 227, 63" borderWidth={2} borderRadius={12}>
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">{clip.title}</h3>
                <p className="text-white/60 text-sm mb-2">From: {clip.source}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-green-400">
                    <Star className="h-4 w-4" />
                    {clip.virality}% virality
                  </span>
                  <span className="flex items-center gap-1 text-white/60">
                    <Clock className="h-4 w-4" />
                    {clip.duration}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <Download className="h-4 w-4 text-white" />
                </button>
                <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <Share2 className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </MagicBentoBorder>
      ))}
    </div>
  );

  const renderSubscription = () => (
    <div className="space-y-6">
      {/* Current Plan */}
      <MagicBentoBorder className="rounded-xl" glowColor="50, 227, 63" borderWidth={2} borderRadius={12}>
        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-white">Pro Plan</h3>
              <p className="text-white/60">$29/month • Billed monthly</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
              Active
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <span className="text-white text-sm">Unlimited clips</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-400" />
              <span className="text-white text-sm">HD downloads</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-400" />
              <span className="text-white text-sm">Priority support</span>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-cyan-400" />
              <span className="text-white text-sm">Real-time alerts</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 py-2 px-4 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white font-medium">
              Change Plan
            </button>
            <button className="flex-1 py-2 px-4 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors text-red-400 font-medium">
              Cancel
            </button>
          </div>
        </div>
      </MagicBentoBorder>

      {/* Usage Stats */}
      <MagicBentoBorder className="rounded-xl" glowColor="50, 227, 63" borderWidth={2} borderRadius={12}>
        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Usage This Month</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/60">Clips Generated</span>
                <span className="text-white">247 / 1000</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-cyan-400 to-green-400 h-2 rounded-full" style={{ width: '24.7%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/60">Downloads</span>
                <span className="text-white">89 / 500</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full" style={{ width: '17.8%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </MagicBentoBorder>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <MagicBentoBorder className="rounded-xl" glowColor="50, 227, 63" borderWidth={2} borderRadius={12}>
        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Account Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-white/60 text-sm">Get notified about new clips and updates</p>
              </div>
              <button className="w-12 h-6 bg-cyan-400 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Auto-download</p>
                <p className="text-white/60 text-sm">Automatically download high-virality clips</p>
              </div>
              <button className="w-12 h-6 bg-white/20 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Public Profile</p>
                <p className="text-white/60 text-sm">Allow others to see your public clips</p>
              </div>
              <button className="w-12 h-6 bg-cyan-400 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </button>
            </div>
          </div>
        </div>
      </MagicBentoBorder>

      <MagicBentoBorder className="rounded-xl" glowColor="50, 227, 63" borderWidth={2} borderRadius={12}>
        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Danger Zone</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors text-red-400">
              <span>Delete Account</span>
              <ChevronRight className="h-4 w-4" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 transition-colors text-orange-400">
              <span>Export Data</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </MagicBentoBorder>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return renderOverview();
      case "videos": return renderVideos();
      case "saved": return renderSavedClips();
      case "subscription": return renderSubscription();
      case "settings": return renderSettings();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Vortex
        backgroundColor="black"
        className="flex items-start flex-col justify-start px-2 md:px-10 py-4 w-full h-full"
        particleCount={500}
        baseHue={120}
      >
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
          {/* Main Container with Liquid Glass Effect */}
          <div 
            className="relative rounded-3xl overflow-hidden"
            style={{
              // Murky liquid glass background
              background:
                "radial-gradient(1200px 300px at 10% -20%, rgba(102,204,255,0.06), transparent), radial-gradient(1200px 300px at 110% 120%, rgba(34,200,60,0.06), transparent), linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.08), 0 10px 30px rgba(0,0,0,0.45)",
            }}
          >
            {/* Gradient border overlay */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-3xl z-0"
              style={{
                padding: 1,
                background:
                  "linear-gradient(120deg, rgba(102,204,255,0.45), rgba(6,182,212,0.35), rgba(34,200,60,0.45))",
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude" as any,
              }}
            />
            {/* Subtle noise for murky texture */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.12] z-0"
              style={{
                backgroundImage:
                  "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"120\" viewBox=\"0 0 120 120\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"2\" stitchTiles=\"stitch\"/></filter><rect width=\"120\" height=\"120\" filter=\"url(%23n)\" opacity=\"0.6\"/></svg>')",
                backgroundSize: "160px 160px",
              }}
            />

            <div className="relative z-10 flex min-h-[80vh]">
              {/* Left Sidebar Navigation */}
              <div className="w-64 p-6 border-r border-white/10">
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-white mb-1">My Account</h1>
                  <p className="text-white/60 text-sm">Manage your content</p>
                </div>
                
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                          activeTab === tab.id
                            ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30"
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 p-8">
                <div className="max-w-4xl">
                  {renderContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Vortex>
    </div>
  );
}
