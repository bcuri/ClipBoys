"use client";

import { useState, useRef, useEffect } from "react";
import { CheckCircle2, Play, ExternalLink, Download, ListPlus, X, User, Video, Heart, CreditCard, Settings, TrendingUp, Clock, Star, ChevronRight, Zap, Shield, Bell } from "lucide-react";
import { fetchTranscript, requestClips, type GenerateClipsResponse } from "../lib/llm";
import { Vortex } from "../components/ui/vortex";
import MagicBentoBorder from "../components/ui/MagicBentoBorder";
import { WavyBackground } from "../components/ui/wavy-background";
import Typewriter from "../components/ui/Typewriter";
import CardNav from "../components/ui/CardNav";

export default function Page() {
	const [youtubeUrl, setYoutubeUrl] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);
	const [videoRecognized, setVideoRecognized] = useState(false);
	const [videoData, setVideoData] = useState<{
		title: string;
		thumbnail: string;
		duration: string;
		videoId: string;
	} | null>(null);
	const [clips, setClips] = useState<GenerateClipsResponse["clips"] | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [generationTime, setGenerationTime] = useState<number>(0);
    const [activeClipIndex, setActiveClipIndex] = useState<number | null>(null);
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [currentUserId] = useState("demo-user-123"); // For demo purposes

	// YouTube URL validation
	const isValidYouTubeUrl = (url: string) => {
		const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[\w-]+/;
		return youtubeRegex.test(url);
	};

	// Extract video ID from YouTube URL
	const extractVideoId = (url: string) => {
		const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
		const match = url.match(regex);
		return match ? match[1] : null;
	};

	// Helper function to make API calls with user ID
	const apiCall = async (endpoint: string, options: RequestInit = {}) => {
		const response = await fetch(endpoint, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				'x-whop-user-id': currentUserId,
				...options.headers,
			},
		});
		return response.json();
	};

	// Save video to database
	const saveVideo = async (videoId: string, title: string, thumbnailUrl: string) => {
		try {
			await apiCall('/api/videos', {
				method: 'POST',
				body: JSON.stringify({ videoId, title, thumbnailUrl }),
			});
		} catch (error) {
			console.error('Failed to save video:', error);
		}
	};

	// Save clips to database
	const saveClips = async (clips: any[]) => {
		try {
			const clipsToSave = clips.map((clip, index) => ({
				id: `clip-${Date.now()}-${index}`,
				videoId: videoData?.videoId || '',
				title: clip.title,
				description: clip.description,
				startSec: Math.floor(Number(clip.start) || 0),
				endSec: Math.floor(Number(clip.end) || 0),
				score: Number((clip as any).score) || 0,
				thumbnailUrl: `https://img.youtube.com/vi/${videoData?.videoId}/hqdefault.jpg`,
			}));
			
			await apiCall('/api/clips', {
				method: 'POST',
				body: JSON.stringify({ clips: clipsToSave }),
			});
		} catch (error) {
			console.error('Failed to save clips:', error);
		}
	};

	// Save a clip to favorites
	const saveClipToFavorites = async (clipId: string) => {
		try {
			await apiCall('/api/saved', {
				method: 'POST',
				body: JSON.stringify({ clipId }),
			});
		} catch (error) {
			console.error('Failed to save clip:', error);
		}
	};

	const handleProcessVideo = async () => {
		if (!isValidYouTubeUrl(youtubeUrl)) {
			alert("Please enter a valid YouTube URL");
			return;
		}
		
		setIsProcessing(true);
		
		try {
			const videoId = extractVideoId(youtubeUrl);
			let title = "Video";
			if (videoId) {
				try {
					const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
					if (res.ok) {
						const data = await res.json();
						title = data?.title || title;
					}
				} catch {}

				const videoInfo = {
					title,
					thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
					duration: "10:30",
					videoId
				};

				setVideoData(videoInfo);
				setVideoRecognized(true);

				// Save video to database
				await saveVideo(videoId, videoInfo.title, videoInfo.thumbnail);
			}
		} finally {
			setIsProcessing(false);
		}
	};

	const handleGenerateClips = () => {
		if (!videoData?.videoId) return;
		setIsGenerating(true);
		setClips(null);
		const startTime = Date.now();
		
		fetchTranscript(videoData.videoId)
			.then(async (t) => {
				const out = await requestClips(videoData.videoId, t.fullText || "");
				setClips(out.clips);
				
				// Save clips to database
				await saveClips(out.clips);
				
				const endTime = Date.now();
				setGenerationTime(Math.round((endTime - startTime) / 1000));
				// Scroll to the generated title so the text is readable
				setTimeout(() => {
					try {
						const el = document.getElementById("generated-title");
						el && el.scrollIntoView({ behavior: "smooth", block: "center" });
					} catch {}
				}, 50);
			})
			.catch(() => {
				alert("Unable to generate clips for this video.");
			})
			.finally(() => setIsGenerating(false));
	};

        // Account modal state and functions
        const [activeAccountTab, setActiveAccountTab] = useState("overview");
        const [userData, setUserData] = useState<any>(null);
        const [userVideos, setUserVideos] = useState<any[]>([]);
        const [savedClips, setSavedClips] = useState<any[]>([]);
        const [isLoadingAccount, setIsLoadingAccount] = useState(false);

        const accountTabs = [
            { id: "overview", label: "Overview", icon: User },
            { id: "videos", label: "My Videos", icon: Video },
            { id: "saved", label: "Saved Clips", icon: Heart },
            { id: "subscription", label: "Subscription", icon: CreditCard },
            { id: "settings", label: "Settings", icon: Settings },
        ];

        // Load user data from database
        const loadUserData = async () => {
            setIsLoadingAccount(true);
            try {
                const user = await apiCall('/api/me');
                setUserData(user.user);
            } catch (error) {
                console.error('Failed to load user data:', error);
            }
            setIsLoadingAccount(false);
        };

        // Load user videos
        const loadUserVideos = async () => {
            try {
                const response = await apiCall('/api/videos');
                setUserVideos(response.videos || []);
            } catch (error) {
                console.error('Failed to load videos:', error);
            }
        };

        // Load saved clips
        const loadSavedClips = async () => {
            try {
                const response = await apiCall('/api/clips?saved=1');
                setSavedClips(response.clips || []);
            } catch (error) {
                console.error('Failed to load saved clips:', error);
            }
        };

        // Load all account data when modal opens
        const loadAccountData = async () => {
            await Promise.all([
                loadUserData(),
                loadUserVideos(),
                loadSavedClips()
            ]);
        };

	// Handle keyboard escape for modals
	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setActiveClipIndex(null);
				setShowAccountModal(false);
			}
		};
		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, []);

	return (
		<div className="min-h-screen overflow-x-hidden overflow-y-auto">
			{/* Vortex Hero Section */}
			<div className="relative min-h-screen pb-0 mb-0">
				<Vortex
					backgroundColor="black"
					className="flex items-start flex-col justify-start px-2 md:px-10 py-4 w-full h-full"
					particleCount={200}
					baseHue={120}
				>
			{/* Top bar */}
					<div className="absolute top-0 left-0 right-0 mx-auto max-w-5xl px-4 pt-8 flex items-center justify-between z-20">
				<div className="flex items-center gap-3">
							<div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-white/10">
								<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
									<circle cx="12" cy="12" r="10" fill="url(#creditGradient)" stroke="currentColor" strokeWidth="1.5" className="text-cyan-400"/>
									<path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-300"/>
									<defs>
										<linearGradient id="creditGradient" x1="0%" y1="0%" x2="100%" y2="100%">
											<stop offset="0%" stopColor="#66CCFF"/>
											<stop offset="50%" stopColor="#22c83c"/>
											<stop offset="100%" stopColor="#06B6D4"/>
										</linearGradient>
									</defs>
								</svg>
								<span className="text-sm text-white">Credits: 5</span>
            </div>
							<span className="text-xs text-cyan-300/80 hidden sm:inline-flex items-center gap-1">
						<CheckCircle2 className="h-3.5 w-3.5" /> Live
					</span>
				</div>
				<div className="text-xs text-white/60">Powered by ClipBoy</div>
				</div>

				{/* Hero Section */}
				<div className="mx-auto max-w-6xl px-4 pt-20 pb-8 text-center">
					{/* Card Navigation */}
					<div className="mb-6">
						<CardNav
							logo=""
							items={[
								{ label: "Videos", links: [{ label: "All Videos", href: "#" }, { label: "My Clips", href: "#" }] },
								{ label: "Contact", links: [{ label: "Support", href: "#" }, { label: "Twitter", href: "#" }] },
								{ label: "My Account", links: [{ label: "Profile", href: "#" }, { label: "Billing", href: "#" }] }
							]}
							baseColor="#0b0b0b"
							menuColor="#fff"
							buttonBgColor="#66CCFF"
							buttonTextColor="#000"
							onAccountClick={() => {
								setShowAccountModal(true);
								loadAccountData();
							}}
						/>
					</div>
				<h1
					className="brand-body tracking-tight mb-8 animate-fade-in"
					style={{ fontSize: "56px", lineHeight: 1.1, display: "block", color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
				>
					Create high‑performing clips in seconds
				</h1>
				<p className="brand-body text-white/90 text-2xl md:text-3xl max-w-3xl mx-auto font-semibold leading-snug animate-fade-in mb-12">
					Experience the future of clipping
				</p>

					{/* YouTube URL Input Section */}
					<div className="max-w-2xl mx-auto">
						<MagicBentoBorder
							className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8"
							glowColor="50, 227, 63"
							borderWidth={2}
							borderRadius={16}
							enableTilt={true}
							enableMagnetism={true}
						>
							{!videoRecognized ? (
								<>
									<div className="flex items-center gap-3 mb-6">
										<Play className="h-6 w-6" style={{ background: 'linear-gradient(45deg, #66CCFF, #22c83c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
										<h2 className="text-xl font-semibold text-white">YouTube Video URL</h2>
					</div>

									<div className="space-y-4">
										<input
											type="url"
											id="youtube-url"
											name="youtube-url"
											value={youtubeUrl}
											onChange={(e) => setYoutubeUrl(e.target.value)}
											placeholder="https://www.youtube.com/watch?v=..."
											className="w-full px-4 py-4 rounded-xl border border-white/20 bg-black/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300"
							style={{
												fontSize: '16px',
												fontFamily: 'Inter, sans-serif'
											}}
											aria-label="YouTube video URL"
										/>
										
								<button
											onClick={handleProcessVideo}
											disabled={!youtubeUrl.trim() || isProcessing}
											className="w-full relative inline-flex items-center justify-center rounded-full px-8 py-4 text-lg font-semibold tracking-tight transition-all duration-300 hover:scale-105 hover:shadow-xl group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
									style={{
										fontFamily: 'Inter, sans-serif',
												background: isProcessing 
													? 'linear-gradient(90deg, #4A90E2 0%, #2E7D32 50%, #1565C0 100%)'
													: 'linear-gradient(90deg, #66CCFF 0%, #22c83c 50%, #06B6D4 100%)',
										color: '#000',
										border: '0',
												boxShadow: '0 14px 30px rgba(102, 204, 255, 0.25), 0.25rem 0.5rem 0 var(--brand-black)',
									}}
									onMouseEnter={(e) => {
												if (!isProcessing) {
												e.currentTarget.style.boxShadow = '0 18px 40px rgba(102, 204, 255, 0.35), 0.4rem 0.6rem 0 var(--brand-black)';
												e.currentTarget.style.background = 'linear-gradient(90deg, #7DD3FC 0%, #34D399 50%, #22D3EE 100%)';
												}
									}}
									onMouseLeave={(e) => {
												if (!isProcessing) {
												e.currentTarget.style.boxShadow = '0 14px 30px rgba(102, 204, 255, 0.25), 0.25rem 0.5rem 0 var(--brand-black)';
												e.currentTarget.style.background = 'linear-gradient(90deg, #66CCFF 0%, #22c83c 50%, #06B6D4 100%)';
												}
											}}
										>
											{isProcessing ? (
												<>
													<div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent mr-2"></div>
													Processing Video...
												</>
											) : (
												<>
													<ExternalLink className="h-5 w-5 mr-2" />
													Process YouTube Video
												</>
											)}
								</button>
									</div>
								</>
							) : (
								<>
									<div className="flex items-center gap-3 mb-6">
										<CheckCircle2 className="h-6 w-6" style={{ background: 'linear-gradient(45deg, #66CCFF, #22c83c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
										<h2 className="text-xl font-semibold text-white">Video Recognized!</h2>
									</div>
									
									{/* Video Preview */}
									<div className="mb-6">
										<div className="relative rounded-xl overflow-hidden bg-black/20 border border-white/10">
											<img 
												src={videoData?.thumbnail} 
												alt={videoData?.title}
												className="w-full h-48 object-cover"
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
											<div className="absolute bottom-4 left-4 right-4">
												<h3 className="text-white font-semibold text-lg mb-1 line-clamp-2">
													{videoData?.title}
												</h3>
												<div className="flex items-center gap-2 text-white/80 text-sm">
													<span>Duration: {videoData?.duration}</span>
													<span>•</span>
													<span>ID: {videoData?.videoId}</span>
									</div>
								</div>
							</div>
					</div>

									{/* Generate Clips Button */}
									<button
										onClick={handleGenerateClips}
										className="w-full relative inline-flex items-center justify-center rounded-full px-8 py-4 text-lg font-semibold tracking-tight transition-all duration-300 hover:scale-105 hover:shadow-xl group disabled:opacity-60"
										disabled={isGenerating}
										style={{
											fontFamily: 'Inter, sans-serif',
											background: 'linear-gradient(90deg, #66CCFF 0%, #22c83c 50%, #06B6D4 100%)',
											color: '#000',
											border: '0',
											boxShadow: '0 14px 30px rgba(102, 204, 255, 0.25), 0.25rem 0.5rem 0 var(--brand-black)',
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.boxShadow = '0 18px 40px rgba(102, 204, 255, 0.35), 0.4rem 0.6rem 0 var(--brand-black)';
											e.currentTarget.style.background = 'linear-gradient(90deg, #7DD3FC 0%, #34D399 50%, #22D3EE 100%)';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.boxShadow = '0 14px 30px rgba(102, 204, 255, 0.25), 0.25rem 0.5rem 0 var(--brand-black)';
											e.currentTarget.style.background = 'linear-gradient(90deg, #66CCFF 0%, #22c83c 50%, #06B6D4 100%)';
										}}
									>
							{isGenerating ? (
								<>
									<span className="loader mr-3" />
									Generating Clips...
								</>
							) : (
											<>
												<Play className="h-5 w-5 mr-2" style={{ color: '#000' }} />
												Generate Clips
											</>
										)}
                            </button>

                                    {/* clips grid moved outside of MagicBentoBorder for full-bleed layout */}

									{/* Back Button */}
                            <button
										onClick={() => {
											setVideoRecognized(false);
											setVideoData(null);
											setYoutubeUrl("");
										}}
										className="w-full mt-3 text-white/60 hover:text-white transition-colors duration-200 text-sm"
									>
										← Try a different video
                            </button>
								</>
							)}
                        </MagicBentoBorder>
					</div>
				</div>
			</Vortex>
                        </div>

			{/* Wavy Background Section for Clips */}
			{clips && clips.length > 0 && (
				<div className="relative min-h-screen w-full bg-black pt-0 mt-0">
					<WavyBackground
						className="max-w-7xl mx-auto px-4 py-20"
						containerClassName="min-h-screen w-full"
						colors={["#66CCFF", "#22c83c", "#06B6D4", "#34D399", "#22D3EE"]}
						backgroundFill="black"
						waveOpacity={0.3}
						blur={8}
						speed="fast"
					>
					<div id="generated-title" className="w-full flex items-center justify-center mb-12">
						<Typewriter
							text={`Generated ${clips?.length || 0} clips in ${generationTime} seconds`}
							speedMs={20}
							className="brand-body text-white font-bold text-center tracking-tight"
							style={{ fontSize: "56px", lineHeight: 1.1 }}
							replayKey={`${clips?.length || 0}-${generationTime}`}
						/>
                                                </div>
                    <div id="generated-clips" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {clips.map((c, i) => {
								const start = Math.max(0, Math.floor(Number(c.start) || 0));
								const end = Math.max(start + 1, Math.floor(Number(c.end) || start + 15));
								const currentScore = Number(c.score) || 0;
								const isMVP = c.isMVP || false;
								const displayScore = currentScore;
                            return (
                                <MagicBentoBorder 
									key={`${c.title}-${i}`} 
									className="rounded-2xl" 
									glowColor={isMVP ? "147, 51, 234" : "50, 227, 63"} 
									borderWidth={isMVP ? 3 : 2} 
									borderRadius={16} 
									enableTilt={true} 
									enableMagnetism={true}
									permanentBorder={isMVP}
								>
                                <div className="relative group bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 cursor-pointer" onClick={() => setActiveClipIndex(i)}>
                                        {/* Virality badge in top-right */}
                                        {typeof c.score === 'number' && (() => {
                                            const s = Number(c.score) || 0;
                                            
                                            let gradient, glow, text;
                                            if (isMVP) {
                                                gradient = 'linear-gradient(90deg, #8B5CF6, #A855F7, #C084FC)';
                                                glow = '0 0 25px rgba(139, 92, 246, 0.8)';
                                                text = `MVP ${displayScore}%`;
                                            } else {
                                                gradient = s >= 80
                                                  ? 'linear-gradient(90deg, #34D399, #10B981)'
                                                  : s >= 60
                                                  ? 'linear-gradient(90deg, #7DD3FC, #22D3EE)'
                                                  : s >= 40
                                                  ? 'linear-gradient(90deg, #FBBF24, #F59E0B)'
                                                  : 'linear-gradient(90deg, #F87171, #EF4444)';
                                                glow = s >= 80
                                                  ? '0 0 18px rgba(16,185,129,0.55)'
                                                  : s >= 60
                                                  ? '0 0 18px rgba(34,211,238,0.55)'
                                                  : s >= 40
                                                  ? '0 0 18px rgba(245,158,11,0.55)'
                                                  : '0 0 18px rgba(239,68,68,0.55)';
                                                text = `Virality ${s}%`;
                                            }
                                            
                                            return (
                                                <span className="absolute top-3 right-3 z-10 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-black" style={{ background: gradient, boxShadow: glow }}>
                                                    {text}
                                                </span>
                                            );
                                        })()}

                                    <div className="mb-4">
                                        <h3 className="text-white font-semibold text-lg mb-2">{c.title}</h3>
                                        <p className="text-cyan-400 text-sm mb-2">{start}s → {end}s</p>
                                            </div>
                                    {/* Thumbnail preview for the clip with contained hover overlay */}
                                    {videoData?.videoId && (
                                        <div className="relative w-full mb-4 overflow-hidden rounded-xl group/thumb" style={{ paddingBottom: '56.25%' }}>
                                            <img
                                                src={`https://img.youtube.com/vi/${videoData.videoId}/hqdefault.jpg`}
                                                alt={c.title}
                                                className="absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover/thumb:blur-sm"
                                            />
                                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />

                                                {/* Hover overlay confined to thumbnail */}
                                                {(() => {
                                                    const previewUrl = videoData?.videoId ? `https://www.youtube.com/watch?v=${videoData.videoId}&t=${start}s` : '#';
                                                    const tags: string[] = c.viralTags || [];
                                                    const s = Number(c.score) || 0;
                                                    if (isMVP) tags.unshift('MVP');
                                                    else if (s >= 80) tags.unshift('High Virality');
                                                return (
                                                    <div className="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300">
                                                        <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
                                                        <div className="absolute inset-0 p-4 flex flex-col justify-between">
                                                            <div>
                                                                <p className="text-[10px] uppercase tracking-wider text-white/60">Viral Tags</p>
                                                                <div className="mt-2 flex flex-wrap gap-1.5">
                                                                    {tags.slice(0, 6).map((t) => (
                                                                        <span key={t} className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/80 border border-white/15">{t}</span>
                                    ))}
                                </div>
                                                                <p className="mt-3 text-xs text-white/70 line-clamp-2">{c.description}</p>
                            </div>
                                                            <div className="flex items-center justify-between gap-2">
							<button
                                                                    className="pointer-events-auto inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold text-black transition-all" 
                                                                    style={{ background: 'linear-gradient(90deg, #66CCFF, #22c83c)' }}
                                                                    onClick={(e) => { 
                                                                        e.stopPropagation(); 
                                                                        const clipId = `clip-${Date.now()}-${i}`;
                                                                        saveClipToFavorites(clipId);
                                                                    }}
							>
                                                                    <ListPlus className="h-4 w-4 mr-2" /> Add to List
							</button>
                            <button
                                                                    className="pointer-events-auto inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold text-white/90 border border-white/20 hover:bg-white/10 transition-all" 
                                                                    onClick={(e) => { e.stopPropagation(); /* generate download */ }}
                                                                >
                                                                    <Download className="h-4 w-4 mr-2" /> Generate Download
                            </button>
                                                                <a href={previewUrl} target="_blank" rel="noreferrer" className="pointer-events-auto inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold text-black" style={{ background: 'linear-gradient(90deg, #06B6D4, #22c83c)' }}>Preview</a>
                                                            </div>
                        </div>
									</div>
                                                );
                                            })()}
								</div>
							)}
							
                                        <div className="space-y-3">
                                            <p className="text-white/80 text-sm">{c.description}</p>
                                        </div>

                                </div>
                                </MagicBentoBorder>
                            );
                        })}
								</div>
								
                    {/* Simple Modal Player */}
                    {activeClipIndex !== null && videoData?.videoId && (
                        (() => {
                            const c = clips[activeClipIndex]!;
                            const start = Math.max(0, Math.floor(Number(c.start) || 0));
                            const end = Math.max(start + 1, Math.floor(Number(c.end) || start + 15));
                            const vid = videoData.videoId;
                            const embedUrl = `https://www.youtube.com/embed/${vid}?start=${start}&end=${end}&autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&playsinline=1`;
                            return (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                                    <div className="relative w-full max-w-5xl mx-auto px-4">
                                        <button className="absolute -top-10 right-0 text-white/80 hover:text-white" onClick={() => setActiveClipIndex(null)} aria-label="Close">✕</button>
                                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                            <iframe
                                                className="absolute top-0 left-0 w-full h-full rounded-xl"
                                                src={embedUrl}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                title={c.title}
                                            />
                                        </div>
                                        <div className="mt-4 text-center">
                                            <h3 className="text-white text-lg font-semibold">{c.title}</h3>
                                            <p className="text-white/60 text-sm">{start}s → {end}s</p>
								</div>
					</div>
				</div>
                            );
                        })()
                    )}
					</WavyBackground>
				</div>
			)}

			{/* Account Modal */}
			{showAccountModal && (
				<div 
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
					onClick={(e) => {
						if (e.target === e.currentTarget) {
							setShowAccountModal(false);
						}
					}}
				>
					<div 
						className="relative w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden rounded-3xl"
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

						{/* Close Button */}
							<button
							onClick={() => setShowAccountModal(false)}
							className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
							>
							<X className="h-5 w-5 text-white" />
							</button>

						<div className="relative z-10 flex h-[90vh]">
							{/* Left Sidebar Navigation */}
							<div className="w-64 p-6 border-r border-white/10">
								<div className="mb-8">
									<h1 className="text-2xl font-bold text-white mb-1">My Account</h1>
									<p className="text-white/60 text-sm">Manage your content</p>
								</div>
								
								<nav className="space-y-2">
									{accountTabs.map((tab) => {
										const Icon = tab.icon;
										return (
							<button
												key={tab.id}
												onClick={() => setActiveAccountTab(tab.id)}
												className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
													activeAccountTab === tab.id
														? "text-white border border-white/20"
														: "text-white/70 hover:bg-white/10 hover:text-white"
												}`}
												style={activeAccountTab === tab.id ? {
													background: "linear-gradient(90deg, #66CCFF 0%, #22c83c 50%, #06B6D4 100%)",
													boxShadow: "0 4px 15px rgba(102, 204, 255, 0.25)"
												} : {}}
											>
												<Icon className="h-5 w-5" />
												{tab.label}
							</button>
										);
									})}
								</nav>
							</div>

							{/* Main Content Area */}
							<div className="flex-1 p-8 overflow-y-auto">
								<div className="max-w-4xl">
									{activeAccountTab === "overview" && (
										<div className="space-y-6">
											{/* Welcome Section */}
											<div className="text-center mb-8">
												<div className="h-20 w-20 rounded-full bg-gradient-to-br from-cyan-400 to-green-400 flex items-center justify-center mx-auto mb-4">
													<User className="h-10 w-10 text-black" />
												</div>
												<h2 className="text-3xl font-bold text-white mb-2">Welcome back, {userData?.name || 'User'}!</h2>
												<p className="text-white/60">{userData?.email || 'user@example.com'}</p>
											</div>

											{/* Stats Grid */}
											<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
												<div className="bg-white/5 rounded-xl p-6 border border-white/10">
													<div className="flex items-center justify-between mb-2">
														<Video className="h-6 w-6 text-cyan-400" />
														<span className="text-2xl font-bold text-white">{userVideos.length}</span>
													</div>
													<p className="text-white/60 text-sm">Videos Processed</p>
												</div>
												<div className="bg-white/5 rounded-xl p-6 border border-white/10">
													<div className="flex items-center justify-between mb-2">
														<TrendingUp className="h-6 w-6 text-green-400" />
														<span className="text-2xl font-bold text-white">{savedClips.length}</span>
													</div>
													<p className="text-white/60 text-sm">Clips Generated</p>
												</div>
												<div className="bg-white/5 rounded-xl p-6 border border-white/10">
													<div className="flex items-center justify-between mb-2">
														<Heart className="h-6 w-6 text-pink-400" />
														<span className="text-2xl font-bold text-white">{savedClips.length}</span>
													</div>
													<p className="text-white/60 text-sm">Saved Clips</p>
												</div>
											</div>

											{/* Recent Activity */}
											<div className="bg-white/5 rounded-xl p-6 border border-white/10">
												<h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
													<Clock className="h-5 w-5" />
													Recent Activity
												</h3>
												<div className="space-y-3">
													<div className="flex items-center justify-between py-2 border-b border-white/10">
														<div className="flex items-center gap-3">
															<div className="h-2 w-2 rounded-full bg-green-400"></div>
															<span className="text-white">Generated 5 clips from "React Tutorial"</span>
														</div>
														<span className="text-white/60 text-sm">2 hours ago</span>
													</div>
													<div className="flex items-center justify-between py-2 border-b border-white/10">
														<div className="flex items-center gap-3">
															<div className="h-2 w-2 rounded-full bg-blue-400"></div>
															<span className="text-white">Saved clip "JavaScript Tips"</span>
														</div>
														<span className="text-white/60 text-sm">1 day ago</span>
													</div>
													<div className="flex items-center justify-between py-2">
														<div className="flex items-center gap-3">
															<div className="h-2 w-2 rounded-full bg-purple-400"></div>
															<span className="text-white">Processed "CSS Grid Guide"</span>
														</div>
														<span className="text-white/60 text-sm">3 days ago</span>
													</div>
												</div>
											</div>
										</div>
									)}

									{activeAccountTab === "videos" && (
										<div className="space-y-6">
											<div className="flex items-center justify-between">
												<h2 className="text-2xl font-bold text-white">My Videos</h2>
												<button className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-green-400 text-black rounded-lg font-semibold hover:scale-105 transition-transform">
													Add New Video
												</button>
											</div>
											<div className="grid gap-4">
												{isLoadingAccount ? (
													<div className="text-center py-8">
														<div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400 border-t-transparent mx-auto mb-4"></div>
														<p className="text-white/60">Loading videos...</p>
													</div>
												) : userVideos.length === 0 ? (
													<div className="text-center py-8">
														<Video className="h-12 w-12 text-white/40 mx-auto mb-4" />
														<p className="text-white/60">No videos processed yet</p>
													</div>
												) : (
													userVideos.map((video) => (
														<div key={video.id} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
															<div className="flex items-center justify-between">
																<div className="flex-1">
																	<h3 className="text-lg font-semibold text-white mb-2">{video.title}</h3>
																	<div className="flex items-center gap-4 text-sm text-white/60">
																		<span className="flex items-center gap-1">
																			<Video className="h-4 w-4" />
																			YouTube Video
																		</span>
																		<span className="flex items-center gap-1">
																			<Clock className="h-4 w-4" />
																			{new Date(video.createdAt).toLocaleDateString()}
																		</span>
																	</div>
																</div>
																<div className="flex items-center gap-2">
																	<button className="px-3 py-1 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition-colors">
																		View Clips
																	</button>
																	<button className="px-3 py-1 bg-gradient-to-r from-cyan-400 to-green-400 text-black rounded-lg text-sm font-semibold hover:scale-105 transition-transform">
																		Regenerate
																	</button>
																</div>
															</div>
														</div>
													))
												)}
											</div>
										</div>
									)}

									{activeAccountTab === "saved" && (
										<div className="space-y-6">
											<div className="flex items-center justify-between">
												<h2 className="text-2xl font-bold text-white">Saved Clips</h2>
												<button className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-green-400 text-black rounded-lg font-semibold hover:scale-105 transition-transform">
													Export All
												</button>
											</div>
											<div className="grid gap-4">
												{isLoadingAccount ? (
													<div className="text-center py-8">
														<div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400 border-t-transparent mx-auto mb-4"></div>
														<p className="text-white/60">Loading saved clips...</p>
													</div>
												) : savedClips.length === 0 ? (
													<div className="text-center py-8">
														<Heart className="h-12 w-12 text-white/40 mx-auto mb-4" />
														<p className="text-white/60">No saved clips yet</p>
													</div>
												) : (
													savedClips.map((clip) => (
														<div key={clip.id} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
															<div className="flex items-center justify-between">
																<div className="flex-1">
																	<h3 className="text-lg font-semibold text-white mb-2">{clip.title}</h3>
																	<p className="text-white/60 text-sm mb-2">From: YouTube Video</p>
																	<div className="flex items-center gap-4 text-sm text-white/60">
																		<span className="flex items-center gap-1">
																			<TrendingUp className="h-4 w-4" />
																			Virality: {clip.score || 0}%
																		</span>
																		<span className="flex items-center gap-1">
																			<Clock className="h-4 w-4" />
																			{new Date(clip.createdAt).toLocaleDateString()}
																		</span>
																	</div>
																</div>
																<div className="flex items-center gap-2">
																	<button className="px-3 py-1 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition-colors">
																		<Download className="h-4 w-4" />
																	</button>
																	<button className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors">
																		Remove
																	</button>
																</div>
															</div>
														</div>
													))
												)}
											</div>
										</div>
									)}

									{activeAccountTab === "subscription" && (
										<div className="space-y-6">
											<div className="text-center mb-8">
												<h2 className="text-2xl font-bold text-white mb-4">Subscription Status</h2>
												<div className="bg-white/5 rounded-xl p-8 border border-white/10 max-w-md mx-auto">
													<div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-400 to-green-400 flex items-center justify-center mx-auto mb-4">
														<CreditCard className="h-8 w-8 text-black" />
													</div>
													<h3 className="text-xl font-semibold text-white mb-2">Free Plan</h3>
													<p className="text-white/60 mb-4">Member since {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Recently'}</p>
													<div className="bg-white/10 rounded-lg p-4 mb-6">
														<div className="flex items-center justify-between mb-2">
															<span className="text-white">Credits Remaining</span>
															<span className="text-2xl font-bold text-cyan-400">5</span>
														</div>
														<div className="w-full bg-white/20 rounded-full h-2">
															<div className="bg-gradient-to-r from-cyan-400 to-green-400 h-2 rounded-full" style={{ width: '50%' }}></div>
														</div>
													</div>
													<button className="w-full px-6 py-3 bg-gradient-to-r from-cyan-400 to-green-400 text-black rounded-lg font-semibold hover:scale-105 transition-transform">
														Upgrade to Pro
													</button>
												</div>
											</div>
										</div>
									)}

									{activeAccountTab === "settings" && (
										<div className="space-y-6">
											<h2 className="text-2xl font-bold text-white">Settings</h2>
											<div className="space-y-4">
												<div className="bg-white/5 rounded-xl p-6 border border-white/10">
													<h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
														<Bell className="h-5 w-5" />
														Notifications
													</h3>
													<div className="space-y-3">
														<label className="flex items-center justify-between">
															<span className="text-white">Email notifications</span>
															<input type="checkbox" className="rounded" defaultChecked />
														</label>
														<label className="flex items-center justify-between">
															<span className="text-white">Clip generation alerts</span>
															<input type="checkbox" className="rounded" defaultChecked />
														</label>
													</div>
												</div>
												<div className="bg-white/5 rounded-xl p-6 border border-white/10">
													<h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
														<Shield className="h-5 w-5" />
														Privacy & Security
													</h3>
													<div className="space-y-3">
														<button className="w-full text-left px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
															Change Password
														</button>
														<button className="w-full text-left px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
															Download My Data
														</button>
														<button className="w-full text-left px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
															Delete Account
														</button>
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}