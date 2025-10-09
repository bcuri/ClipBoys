"use client";

import { useState, useRef, useEffect } from "react";
import { CheckCircle2, Play, ExternalLink } from "lucide-react";
import { fetchTranscript, requestClips, type GenerateClipsResponse } from "../lib/llm";
import { Vortex } from "../components/ui/vortex";
import MagicBentoBorder from "../components/ui/MagicBentoBorder";
import { WavyBackground } from "../components/ui/wavy-background";
import Typewriter from "../components/ui/Typewriter";
import CustomVideoPlayer from "../components/ui/CustomVideoPlayer";

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

				setVideoData({
					title,
					thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
					duration: "10:30",
					videoId
				});
				setVideoRecognized(true);
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

	return (
		<div className="min-h-screen overflow-x-hidden overflow-y-auto">
			{/* Vortex Hero Section */}
			<div className="relative min-h-screen pb-0 mb-0">
				<Vortex
					backgroundColor="black"
					className="flex items-start flex-col justify-start px-2 md:px-10 py-4 w-full h-full"
					particleCount={700}
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
								const currentScore = Number((c as any).score) || 0;
								const maxScore = Math.max(...clips.map(clip => Number((clip as any).score) || 0));
								const firstMaxIndex = clips.findIndex(clip => Number((clip as any).score) || 0 === maxScore);
								const isMVP = i === firstMaxIndex && currentScore === maxScore && currentScore > 0;
                            return (
                                <MagicBentoBorder 
									key={`${c.title}-${i}`} 
									className="rounded-2xl" 
									glowColor={isMVP ? "147, 51, 234" : "50, 227, 63"} 
									borderWidth={isMVP ? 3 : 2} 
									borderRadius={16} 
									enableTilt={true} 
									enableMagnetism={true}
								>
                                <div className="relative group bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 cursor-pointer" onClick={() => setActiveClipIndex(i)}>
                                    {/* Virality badge in top-right */}
                                    {typeof (c as any).score === 'number' && (() => {
                                        const s = Number((c as any).score) || 0;
                                        const currentScore = Number((c as any).score) || 0;
                                        const maxScore = Math.max(...clips.map(clip => Number((clip as any).score) || 0));
                                        const firstMaxIndex = clips.findIndex(clip => Number((clip as any).score) || 0 === maxScore);
                                        const isMVP = i === firstMaxIndex && currentScore === maxScore && currentScore > 0;
                                        
                                        let gradient, glow, text;
                                        if (isMVP) {
                                            gradient = 'linear-gradient(90deg, #8B5CF6, #A855F7, #C084FC)';
                                            glow = '0 0 25px rgba(139, 92, 246, 0.8)';
                                            text = `MVP ${s}%`;
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
                                                const tags: string[] = [];
                                                const s = Number((c as any).score) || 0;
                                                if ((c.hook || '').length > 0) tags.push('Strong Hook');
                                                if (c.description?.toLowerCase().includes('surpris')) tags.push('Surprise');
                                                if (c.description?.toLowerCase().includes('tip') || c.description?.toLowerCase().includes('how')) tags.push('Value');
                                                if (s >= 80) tags.push('High Virality');
                                                return (
                                                    <div className="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300">
                                                        <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
                                                        <div className="absolute inset-0 p-4 flex flex-col justify-between">
                                                            <div>
                                                                <p className="text-[10px] uppercase tracking-wider text-white/60">Why this clip hits</p>
                                                                <p className="mt-1 text-sm text-white/90 line-clamp-2">{(c as any).scoreReasons || c.description}</p>
                                                                <div className="mt-2 flex flex-wrap gap-1.5">
                                                                    {tags.map((t) => (
                                                                        <span key={t} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 border border-white/15">{t}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-between gap-2">
                                                                <a href={previewUrl} target="_blank" rel="noreferrer" className="pointer-events-auto inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold text-black" style={{ background: 'linear-gradient(90deg, #66CCFF, #22c83c)' }}>Preview</a>
                                                                <button className="pointer-events-auto inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold text-white/90 border border-white/20" onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(c.hook || ''); }}>Copy Hook</button>
                                                                <button className="pointer-events-auto inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold text-white/90 border border-white/20" onClick={(e) => { e.stopPropagation(); }}>Save Clip</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
								</div>
							)}
							
                                    <div className="space-y-3">
                                        <p className="text-white/80 text-sm">{c.description}</p>
                                        <p className="text-cyan-300 text-xs">Hook: {c.hook}</p>
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
		</div>
	);
}