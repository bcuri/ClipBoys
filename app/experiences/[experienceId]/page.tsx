"use client";

import { useState, useRef } from "react";
import { Upload, Zap, CheckCircle2, X, Move, Crop } from "lucide-react";

const platforms = ["TikTok", "YouTube Shorts", "Instagram Reels"] as const;

type Platform = (typeof platforms)[number];

type AspectRatio = "full" | "top-half" | "bottom-half";

interface CropData {
	x: number;
	y: number;
	width: number;
	height: number;
	aspectRatio: AspectRatio;
}

export default function Page() {
	const [files, setFiles] = useState<File[]>([]);
	const [platform, setPlatform] = useState<Platform>("TikTok");
	const [fastMode, setFastMode] = useState(true);
	const [requirements, setRequirements] = useState("");
	const [youtubeUrl, setYoutubeUrl] = useState('');
	const [startTime, setStartTime] = useState('');
	const [endTime, setEndTime] = useState('');
	const [cropperOpen, setCropperOpen] = useState(false);
	const [croppingFileIndex, setCroppingFileIndex] = useState<number | null>(null);
	const [cropData, setCropData] = useState<CropData>({
		x: 0,
		y: 0,
		width: 100,
		height: 100,
		aspectRatio: "full"
	});
	const [isDragging, setIsDragging] = useState(false);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const videoRef = useRef<HTMLVideoElement | null>(null);

	function onDrop(e: React.DragEvent<HTMLDivElement>) {
		e.preventDefault();
		const dropped = Array.from(e.dataTransfer.files || []) as File[];
		if (dropped.length) setFiles(dropped.slice(0, 5));
	}

	function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
		const chosen = Array.from(e.target.files || []) as File[];
		if (chosen.length) setFiles(chosen.slice(0, 5));
	}

	function addYouTubeVideo() {
		if (!youtubeUrl || files.length >= 5) return;
		
		// Extract video ID from YouTube URL
		const videoId = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
		if (!videoId) {
			alert('Please enter a valid YouTube URL');
			return;
		}

		// Create a mock file object for YouTube videos
		const youtubeFile = {
			name: `YouTube Video (${startTime || '0:00'} - ${endTime || 'full'})`,
			size: 0, // YouTube videos don't have a file size
			type: 'video/youtube',
			lastModified: Date.now(),
			webkitRelativePath: '',
			stream: () => new ReadableStream(),
			arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
			slice: () => new Blob(),
			text: () => Promise.resolve(''),
		} as File;

		// Add to files array
		setFiles(prev => [...prev, youtubeFile]);
		
		// Clear inputs
		setYoutubeUrl('');
		setStartTime('');
		setEndTime('');
	}

	function openCropper(fileIndex: number) {
		if (files[fileIndex]) {
			setCroppingFileIndex(fileIndex);
			setCropperOpen(true);
			// Reset crop data for new file
			setCropData({
				x: 0,
				y: 0,
				width: 100,
				height: 100,
				aspectRatio: "full"
			});
		}
	}

	function closeCropper() {
		setCropperOpen(false);
		setCroppingFileIndex(null);
		setIsDragging(false);
	}

	function handleAspectRatioChange(aspectRatio: AspectRatio) {
		setCropData(prev => {
			const newCrop = { ...prev, aspectRatio };
			
			if (aspectRatio === "full") {
				newCrop.x = 0;
				newCrop.y = 0;
				newCrop.width = 100;
				newCrop.height = 100;
			} else if (aspectRatio === "top-half") {
				newCrop.x = 0;
				newCrop.y = 0;
				newCrop.width = 100;
				newCrop.height = 50;
			} else if (aspectRatio === "bottom-half") {
				newCrop.x = 0;
				newCrop.y = 50;
				newCrop.width = 100;
				newCrop.height = 50;
			}
			
			return newCrop;
		});
	}

	function handleMouseDown(e: React.MouseEvent) {
		e.preventDefault();
		setIsDragging(true);
	}

	function handleMouseMove(e: React.MouseEvent) {
		if (!isDragging) return;
		
		const rect = e.currentTarget.getBoundingClientRect();
		const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
		const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
		
		setCropData(prev => ({
			...prev,
			x: Math.min(x, 100 - prev.width),
			y: Math.min(y, 100 - prev.height)
		}));
	}

	function handleMouseUp() {
		setIsDragging(false);
	}

	function applyCrop() {
		// Here you would apply the crop data to the video
		// For now, we'll just close the cropper
		console.log('Applying crop:', cropData);
		closeCropper();
	}

	return (
		<div className="min-h-screen scene-bg">
			{/* Top bar */}
			<div className="mx-auto max-w-5xl px-4 pt-8 flex items-center justify-between">
				<div className="flex items-center gap-3">
							<div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-white/10">
								<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
									<circle cx="12" cy="12" r="10" fill="url(#creditGradient)" stroke="currentColor" strokeWidth="1.5" className="text-green-400"/>
									<path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-300"/>
									<defs>
										<linearGradient id="creditGradient" x1="0%" y1="0%" x2="100%" y2="100%">
											<stop offset="0%" stopColor="#32E33F"/>
											<stop offset="100%" stopColor="#1BA82A"/>
										</linearGradient>
									</defs>
								</svg>
								<span className="text-sm text-white">Credits: 5</span>
							</div>
					<span className="text-xs text-emerald-300/80 hidden sm:inline-flex items-center gap-1">
						<CheckCircle2 className="h-3.5 w-3.5" /> Live
					</span>
				</div>
				<div className="text-xs text-white/60">Powered by ClipBoy</div>
			</div>

			{/* Hero */}
			<div className="mx-auto max-w-6xl px-4 pt-8 pb-8 text-center">
				<h1
					className="brand-body tracking-tight mb-8 animate-fade-in"
					style={{ fontSize: "56px", lineHeight: 1.1, display: "block", color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
				>
					Create high‑performing clips in seconds
			</h1>
				<p className="brand-body text-white/90 text-2xl md:text-3xl max-w-3xl mx-auto font-semibold leading-snug animate-fade-in">
					just paste your videos in and get started
				</p>
			</div>

			{/* Upload + Status Split */}
			<div className="mx-auto max-w-5xl px-4 pb-16">
				<div className="grid grid-cols-2 gap-6">
					{/* Left: Upload */}
					<div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8">
						<div
							className="relative rounded-xl border-2 border-dashed transition-all p-10 text-center"
							onDragOver={(e) => e.preventDefault()}
							onDrop={onDrop}
							style={{
								borderColor: 'rgba(50, 227, 63, 0.35)',
								background: 'linear-gradient(180deg, rgba(50,227,63,0.08) 0%, rgba(0,0,0,0) 40%)',
								boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset, 0 10px 40px rgba(0,0,0,0.35)',
							}}
						>
							<input
								ref={inputRef}
								id="video-upload-experience"
								name="video-upload-experience"
								type="file"
								accept="video/*"
								multiple
								onChange={onSelect}
								className="hidden"
								aria-label="Upload video files"
							/>
							<Upload className="mx-auto mb-5 h-14 w-14" style={{color: 'var(--brand-green)'}} />
							<p className="brand-body text-white text-xl md:text-2xl font-semibold">Click to upload or drag and drop</p>
							<p className="text-sm text-white/60 mt-2">MP4, MOV, AVI files supported</p>
							<div className="mt-6 flex items-center justify-center">
								<button
									onClick={() => inputRef.current?.click()}
									className="relative inline-flex items-center justify-center rounded-full px-8 py-4 text-lg font-semibold tracking-tight transition-all duration-300 hover:scale-105 hover:shadow-xl group"
									style={{
										fontFamily: 'Inter, sans-serif',
										background: 'linear-gradient(90deg, #32E33F 0%, #22c83c 50%, #1BA82A 100%)',
										color: '#000',
										border: '0',
										boxShadow: '0 14px 30px rgba(50, 227, 63, 0.25), 0.25rem 0.5rem 0 var(--brand-black)',
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.boxShadow = '0 18px 40px rgba(50, 227, 63, 0.35), 0.4rem 0.6rem 0 var(--brand-black)';
										e.currentTarget.style.background = 'linear-gradient(90deg, #36F045 0%, #26D93A 50%, #1FC832 100%)';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.boxShadow = '0 14px 30px rgba(50, 227, 63, 0.25), 0.25rem 0.5rem 0 var(--brand-black)';
										e.currentTarget.style.background = 'linear-gradient(90deg, #32E33F 0%, #22c83c 50%, #1BA82A 100%)';
									}}
								>
									<span className="group-hover:opacity-90">Start by choosing files</span>
								</button>
							</div>
						</div>

						{/* YouTube URL Input */}
						<div className="mt-4 rounded-lg border border-white/5 bg-white/[0.02] backdrop-blur-sm p-4">
							<div className="flex items-center gap-2 mb-3">
								<svg className="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
									<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
								</svg>
								<span className="text-white/80 text-sm font-medium">Or add from YouTube</span>
							</div>
							<div className="space-y-3">
								<input
									type="url"
									placeholder="https://www.youtube.com/watch?v=..."
									value={youtubeUrl}
									onChange={(e) => setYoutubeUrl(e.target.value)}
									className="w-full px-3 py-2 rounded-md bg-black/10 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-brand-green/30 text-sm"
									style={{ fontFamily: 'Inter, sans-serif' }}
								/>
								<div className="flex gap-2 items-center">
									<input
										type="text"
										placeholder="mm:ss"
										value={startTime}
										onChange={(e) => setStartTime(e.target.value)}
										className="w-20 px-2 py-2 rounded-md bg-black/10 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-brand-green/30 text-sm text-center"
										style={{ fontFamily: 'Inter, sans-serif' }}
									/>
									<span className="text-white/40 text-sm">-</span>
									<input
										type="text"
										placeholder="mm:ss"
										value={endTime}
										onChange={(e) => setEndTime(e.target.value)}
										className="w-20 px-2 py-2 rounded-md bg-black/10 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-brand-green/30 text-sm text-center"
										style={{ fontFamily: 'Inter, sans-serif' }}
									/>
									<button
										onClick={addYouTubeVideo}
										disabled={files.length >= 5}
										className="flex-1 px-6 py-2 bg-gradient-to-r from-brand-green to-brand-green/80 text-black font-bold rounded-lg hover:from-brand-green/90 hover:to-brand-green/70 hover:scale-105 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
										style={{ 
											fontFamily: 'Inter, sans-serif',
											boxShadow: '0 4px 12px rgba(50, 227, 63, 0.3)'
										}}
									>
										Add
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* Right: Slots */}
					<div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8">
						<h3 className="brand-body text-white mb-4 font-semibold">Clips (5 slots)</h3>
						<div className="grid grid-cols-1 gap-3">
							{Array.from({ length: 5 }).map((_, idx) => {
								const file = files[idx];
								return (
									<div 
										key={idx} 
										className={`flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-4 py-3 transition-all duration-200 ${
											file ? 'cursor-pointer hover:bg-black/40 hover:border-brand-green/30' : 'cursor-default'
										}`}
										onClick={() => file && openCropper(idx)}
									>
										<div className="flex items-center gap-3 min-w-0">
											<div className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold" style={{backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff'}}>{idx + 1}</div>
											<div className="min-w-0">
												<p className="text-white/90 text-sm font-medium truncate">{file ? file.name : `Clip ${idx + 1}`}</p>
												<p className="text-white/50 text-xs truncate">
													{file ? (
														file.type === 'video/youtube' 
															? 'YouTube Video' 
															: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
													) : 'No video added'}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											{file && (
												<Crop className="h-4 w-4 text-brand-green/60" />
											)}
											<span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${file ? 'bg-[rgba(50,227,63,0.15)] text-[var(--brand-green)]' : 'bg-white/10 text-white/60'}`}>{file ? 'Ready' : 'Empty'}</span>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>

				{/* Continue Button */}
				<div className="mx-auto max-w-5xl px-4 pt-8 pb-16">
					<div className="flex justify-center">
						<button
							disabled={files.length === 0}
							className={`px-12 py-4 text-lg font-semibold rounded-full transition-all duration-300 ${
								files.length > 0
									? 'bg-white text-black hover:bg-gray-100 hover:scale-105 shadow-lg'
									: 'bg-gray-600 text-gray-400 cursor-not-allowed'
							}`}
							style={{
								fontFamily: 'Inter, sans-serif',
							}}
						>
							{files.length > 0 ? 'Continue to Processing' : 'Upload videos to continue'}
						</button>
					</div>
				</div>
			</div>

			{/* Video Cropper Popup */}
			{cropperOpen && croppingFileIndex !== null && files[croppingFileIndex] && (
				<div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
					<div className="bg-black/90 border border-white/20 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden">
						{/* Header */}
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-3">
								<Crop className="h-6 w-6 text-brand-green" />
								<h2 className="text-xl font-semibold text-white">Crop Video</h2>
							</div>
							<button
								onClick={closeCropper}
								className="p-2 hover:bg-white/10 rounded-lg transition-colors"
							>
								<X className="h-5 w-5 text-white/60" />
							</button>
						</div>

						{/* Aspect Ratio Options */}
						<div className="flex gap-3 mb-6">
							<button
								onClick={() => handleAspectRatioChange("full")}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
									cropData.aspectRatio === "full"
										? 'bg-brand-green text-black'
										: 'bg-white/10 text-white/80 hover:bg-white/20'
								}`}
							>
								iPhone Full Screen
							</button>
							<button
								onClick={() => handleAspectRatioChange("top-half")}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
									cropData.aspectRatio === "top-half"
										? 'bg-brand-green text-black'
										: 'bg-white/10 text-white/80 hover:bg-white/20'
								}`}
							>
								Top Half
							</button>
							<button
								onClick={() => handleAspectRatioChange("bottom-half")}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
									cropData.aspectRatio === "bottom-half"
										? 'bg-brand-green text-black'
										: 'bg-white/10 text-white/80 hover:bg-white/20'
								}`}
							>
								Bottom Half
							</button>
						</div>

						{/* Video Preview Area */}
						<div className="relative bg-black/50 rounded-lg overflow-hidden mb-6" style={{ aspectRatio: '9/16', minHeight: '400px' }}>
							{files[croppingFileIndex]?.type === 'video/youtube' ? (
								<div className="flex items-center justify-center h-full text-white/60">
									<div className="text-center">
										<svg className="h-12 w-12 mx-auto mb-2 text-red-500" viewBox="0 0 24 24" fill="currentColor">
											<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
										</svg>
										<p>YouTube Video Preview</p>
										<p className="text-sm text-white/40">Crop settings will be applied</p>
									</div>
								</div>
							) : (
								<video
									ref={videoRef}
									src={URL.createObjectURL(files[croppingFileIndex])}
									className="w-full h-full object-cover"
									controls
									onLoadedMetadata={() => {
										if (videoRef.current) {
											videoRef.current.currentTime = 0;
										}
									}}
								/>
							)}
							
							{/* Crop Overlay */}
							<div 
								className="absolute inset-0 cursor-move"
								onMouseDown={handleMouseDown}
								onMouseMove={handleMouseMove}
								onMouseUp={handleMouseUp}
								onMouseLeave={handleMouseUp}
							>
								{/* Dark overlay */}
								<div className="absolute inset-0 bg-black/50" />
								
								{/* Crop area */}
								<div
									className="absolute border-2 border-brand-green bg-transparent shadow-lg"
									style={{
										left: `${cropData.x}%`,
										top: `${cropData.y}%`,
										width: `${cropData.width}%`,
										height: `${cropData.height}%`,
										boxShadow: '0 0 0 2px rgba(50, 227, 63, 0.3), inset 0 0 0 1px rgba(50, 227, 63, 0.5)'
									}}
								>
									{/* Crop handles */}
									<div className="absolute -top-1 -left-1 w-4 h-4 bg-brand-green rounded-full border-2 border-white shadow-lg" />
									<div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-green rounded-full border-2 border-white shadow-lg" />
									<div className="absolute -bottom-1 -left-1 w-4 h-4 bg-brand-green rounded-full border-2 border-white shadow-lg" />
									<div className="absolute -bottom-1 -right-1 w-4 h-4 bg-brand-green rounded-full border-2 border-white shadow-lg" />
									
									{/* Move handle */}
									<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
										<Move className="h-5 w-5 text-brand-green drop-shadow-lg" />
									</div>
								</div>
								
								{/* Instructions */}
								<div className="absolute top-4 left-4 text-white/80 text-sm">
									Drag to position • Use handles to resize
								</div>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex gap-3 justify-end">
							<button
								onClick={closeCropper}
								className="px-6 py-2 bg-white/10 text-white/80 rounded-lg hover:bg-white/20 transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={applyCrop}
								className="px-6 py-2 bg-gradient-to-r from-brand-green to-brand-green/80 text-black font-semibold rounded-lg hover:from-brand-green/90 hover:to-brand-green/70 transition-all duration-200"
							>
								Apply Crop
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}