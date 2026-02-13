'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipForward,
  SkipBack,
  Loader2,
  Music
} from 'lucide-react';
import { Recording } from '@/Types/meeting.types';

interface AudioPlayerProps {
  recording: Recording;
  autoPlay?: boolean;
}

export default function AudioPlayer({ recording, autoPlay = false }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isBuffering, setIsBuffering] = useState(false);

  /* ------------------------------------------------------------------------ */
  /*                          PLAYBACK CONTROLS                               */
  /* ------------------------------------------------------------------------ */

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    }
  };

  const changePlaybackRate = (rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                          EVENT HANDLERS                                  */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /*                          FORMAT HELPERS                                  */
  /* ------------------------------------------------------------------------ */

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (currentTime / duration) * 100 || 0;

  /* ------------------------------------------------------------------------ */
  /*                          WAVEFORM VISUALIZATION                          */
  /* ------------------------------------------------------------------------ */

  const renderWaveform = () => {
    const bars = 60;
    return Array.from({ length: bars }).map((_, i) => {
      const height = Math.random() * 100;
      const isActive = (i / bars) * 100 < progressPercentage;
      
      return (
        <div
          key={i}
          className={`flex-1 rounded-full transition-all duration-300 ${
            isActive 
              ? 'bg-blue-500' 
              : 'bg-gray-600'
          } ${isPlaying && isActive ? 'animate-pulse' : ''}`}
          style={{ 
            height: `${height}%`,
            opacity: isActive ? 1 : 0.3
          }}
        />
      );
    });
  };

  /* ------------------------------------------------------------------------ */
  /*                          RENDER                                          */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={recording.url}
        autoPlay={autoPlay}
      />

      {/* Player Container */}
      <div className="p-6">
        {/* Album Art / Icon */}
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <div className={`bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 ${
              isPlaying ? 'animate-pulse' : ''
            }`}>
              <Music className="h-12 w-12 text-white" />
            </div>
            {isBuffering && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
            )}
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate mb-1">
              {recording.filename || 'Meeting Recording'}
            </h3>
            <p className="text-sm text-gray-400">
              Audio Recording
            </p>
          </div>
        </div>

        {/* Waveform Visualization */}
        <div className="mb-6 h-20 flex items-end gap-1 px-2">
          {renderWaveform()}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:h-3 transition-all"
            style={{
              background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${progressPercentage}%, #4B5563 ${progressPercentage}%, #4B5563 100%)`
            }}
          />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
            <span className="text-xs text-gray-400">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Skip Backward */}
            <button
              onClick={() => skip(-10)}
              className="text-gray-400 hover:text-white transition"
              title="Skip backward 10s"
            >
              <SkipBack className="h-5 w-5" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 transition-all hover:scale-110"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" />
              )}
            </button>

            {/* Skip Forward */}
            <button
              onClick={() => skip(10)}
              className="text-gray-400 hover:text-white transition"
              title="Skip forward 10s"
            >
              <SkipForward className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Playback Speed */}
            <select
              value={playbackRate}
              onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
              className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1">1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="1.75">1.75x</option>
              <option value="2">2x</option>
            </select>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-gray-400 hover:text-white transition"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}