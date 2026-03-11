import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Link2,
  Youtube,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Video,
  Music,
  Sparkles,
  ArrowDown,
  ClipboardPaste,
  X,
  ExternalLink,
} from 'lucide-react';

type VideoInfo = {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
};

type Status = 'idle' | 'loading' | 'success' | 'error';

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

type DownloadService = {
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  getUrl: (videoId: string, youtubeUrl: string) => string;
};

const downloadServices: DownloadService[] = [
  {
    name: 'Cobalt Tools',
    icon: <Download size={20} />,
    description: 'En hızlı ve güvenilir — MP4 & MP3',
    color: 'from-blue-500 to-cyan-500',
    getUrl: (_id, url) => `https://cobalt.tools/?url=${encodeURIComponent(url)}`,
  },
  {
    name: 'SaveFrom',
    icon: <Video size={20} />,
    description: 'Çoklu kalite seçenekleri — HD',
    color: 'from-green-500 to-emerald-500',
    getUrl: (_id, url) => `https://en.savefrom.net/1-${encodeURIComponent(url)}`,
  },
  {
    name: 'Y2Mate',
    icon: <Music size={20} />,
    description: 'MP3 & MP4 hızlı indirme',
    color: 'from-red-500 to-orange-500',
    getUrl: (id) => `https://www.y2mate.com/youtube/${id}`,
  },
  {
    name: 'SSYoutube',
    icon: <ArrowDown size={20} />,
    description: 'Kolay ve hızlı video indirme',
    color: 'from-purple-500 to-pink-500',
    getUrl: (_id, url) => {
      const modified = url.replace('youtube.com', 'ssyoutube.com').replace('youtu.be/', 'ssyoutube.com/watch?v=');
      return modified;
    },
  },
  {
    name: '10Downloader',
    icon: <ExternalLink size={20} />,
    description: 'Alternatif indirme servisi',
    color: 'from-amber-500 to-yellow-500',
    getUrl: (_id, url) => `https://10downloader.com/download?v=${encodeURIComponent(url)}`,
  },
];

export default function App() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [clickedService, setClickedService] = useState<number | null>(null);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch {
      // clipboard permission denied
    }
  }, []);

  const handleClear = useCallback(() => {
    setUrl('');
    setStatus('idle');
    setVideoInfo(null);
    setErrorMsg('');
    setClickedService(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!url.trim()) {
      setErrorMsg('Lütfen bir YouTube linki girin.');
      setStatus('error');
      return;
    }

    const videoId = extractVideoId(url.trim());
    if (!videoId) {
      setErrorMsg('Geçersiz YouTube linki. Lütfen doğru bir link girin.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');
    setVideoInfo(null);
    setClickedService(null);

    const info: VideoInfo = {
      id: videoId,
      title: `YouTube Video`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      channel: '',
    };

    // Fetch video info from noembed
    try {
      const resp = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.title) info.title = data.title;
        if (data.author_name) info.channel = data.author_name;
      }
    } catch {
      // noembed failed, keep defaults
    }

    setVideoInfo(info);
    setStatus('success');
  }, [url]);

  const handleDownload = useCallback(
    (service: DownloadService, idx: number) => {
      if (!videoInfo) return;
      setClickedService(idx);

      const youtubeUrl = `https://www.youtube.com/watch?v=${videoInfo.id}`;
      const downloadUrl = service.getUrl(videoInfo.id, youtubeUrl);
      window.open(downloadUrl, '_blank');

      setTimeout(() => setClickedService(null), 3000);
    },
    [videoInfo]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 sm:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <Sparkles size={14} className="text-red-400" />
            <span className="text-xs text-red-300 font-medium">Hızlı & Ücretsiz</span>
          </motion.div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Youtube size={48} className="text-red-500" />
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Video İndirici
            </h1>
          </div>
          <p className="text-gray-400 text-base sm:text-lg max-w-md mx-auto">
            YouTube video linkini yapıştır, istediğin kalitede indir.
          </p>
        </motion.div>

        {/* URL Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-30 blur transition-opacity" />
            <div className="relative bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-700/50 ml-1 flex-shrink-0">
                  <Link2 size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                  placeholder="YouTube linkini buraya yapıştır..."
                  className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm sm:text-base py-2 min-w-0"
                />
                {url && (
                  <button
                    onClick={handleClear}
                    className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors flex-shrink-0"
                  >
                    <X size={16} className="text-gray-400" />
                  </button>
                )}
                <button
                  onClick={handlePaste}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-700/50 hover:bg-gray-600/50 transition-colors text-gray-300 text-xs sm:text-sm flex-shrink-0"
                >
                  <ClipboardPaste size={14} />
                  <span className="hidden sm:inline">Yapıştır</span>
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={status === 'loading'}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white font-medium text-sm sm:text-base flex-shrink-0 shadow-lg shadow-red-500/20"
                >
                  {status === 'loading' ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <ArrowDown size={18} />
                  )}
                  <span className="hidden sm:inline">
                    {status === 'loading' ? 'Analiz...' : 'Analiz Et'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 mt-3 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl"
              >
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <span className="text-red-300 text-sm">{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Loading State */}
        <AnimatePresence>
          {status === 'loading' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-4 py-16"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-gray-700" />
                <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-red-500 animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-gray-300 font-medium">Video analiz ediliyor...</p>
                <p className="text-gray-500 text-sm mt-1">Lütfen bekleyin</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video Info & Download Options */}
        <AnimatePresence>
          {status === 'success' && videoInfo && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5 }}
            >
              {/* Video Preview */}
              <div className="relative group mb-6">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    {/* Thumbnail */}
                    <div className="relative sm:w-72 flex-shrink-0">
                      <img
                        src={videoInfo.thumbnail}
                        alt={videoInfo.title}
                        className="w-full h-44 sm:h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoInfo.id}/hqdefault.jpg`;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm rounded-lg px-2.5 py-1">
                        <CheckCircle2 size={13} className="text-green-400" />
                        <span className="text-xs text-green-300 font-medium">Hazır</span>
                      </div>
                    </div>
                    {/* Info */}
                    <div className="flex-1 p-4 sm:p-5 flex flex-col justify-center">
                      <h3 className="text-white font-semibold text-base sm:text-lg leading-snug mb-2 line-clamp-2">
                        {videoInfo.title}
                      </h3>
                      {videoInfo.channel && (
                        <p className="text-gray-400 text-sm flex items-center gap-1.5">
                          <Youtube size={14} className="text-red-400" />
                          {videoInfo.channel}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs bg-gray-700/50 text-gray-300 px-2.5 py-1 rounded-lg">
                          ID: {videoInfo.id}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Title */}
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                <span className="text-gray-400 text-sm font-medium px-3">İndirme Servisi Seçin</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
              </div>

              {/* Download Services */}
              <div className="space-y-3">
                {downloadServices.map((service, idx) => {
                  const isClicked = clickedService === idx;
                  return (
                    <motion.div
                      key={service.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group relative"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/0 to-purple-500/0 group-hover:from-red-500/10 group-hover:to-purple-500/10 rounded-xl blur transition-all" />
                      <div
                        className="relative flex items-center justify-between bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 hover:border-gray-600/50 p-4 transition-all cursor-pointer"
                        onClick={() => handleDownload(service, idx)}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${service.color} text-white shadow-lg`}
                          >
                            {service.icon}
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm sm:text-base">{service.name}</p>
                            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                              {service.description}
                            </p>
                          </div>
                        </div>
                        <button
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            isClicked
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
                          }`}
                        >
                          {isClicked ? (
                            <>
                              <CheckCircle2 size={16} />
                              <span className="hidden sm:inline">Açıldı!</span>
                            </>
                          ) : (
                            <>
                              <ExternalLink size={16} />
                              <span className="hidden sm:inline">Aç & İndir</span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Info Box */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 bg-blue-500/5 border border-blue-500/10 rounded-xl p-4"
              >
                <p className="text-blue-300/70 text-xs leading-relaxed text-center">
                  💡 Bir indirme servisi seçin, yeni sekmede açılacaktır. Serviste istediğiniz
                  kaliteyi (1080p, 720p, MP3 vb.) seçip videoyu indirebilirsiniz. Bir servis
                  çalışmazsa diğerini deneyin.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Idle State - Features */}
        <AnimatePresence>
          {status === 'idle' && !videoInfo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
                {[
                  {
                    icon: <Download size={24} />,
                    title: 'Hızlı İndirme',
                    desc: 'Saniyeler içinde videoyu indirin',
                    color: 'red',
                  },
                  {
                    icon: <Video size={24} />,
                    title: 'Çoklu Format',
                    desc: 'MP4, MP3 ve daha fazlası',
                    color: 'purple',
                  },
                  {
                    icon: <Sparkles size={24} />,
                    title: 'Yüksek Kalite',
                    desc: '1080p HD kalitesine kadar',
                    color: 'blue',
                  },
                ].map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.15 }}
                    className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-5 text-center hover:border-gray-600/50 transition-all group"
                  >
                    <div
                      className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 transition-colors ${
                        feature.color === 'red'
                          ? 'bg-red-500/10 text-red-400 group-hover:bg-red-500/20'
                          : feature.color === 'purple'
                          ? 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20'
                          : 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20'
                      }`}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="text-white font-semibold text-sm mb-1">{feature.title}</h3>
                    <p className="text-gray-500 text-xs">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* How to use */}
              <div className="mt-12 text-center">
                <h3 className="text-gray-400 font-medium text-sm mb-6">Nasıl Kullanılır?</h3>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
                  {[
                    { step: '1', text: 'YouTube linkini kopyala' },
                    { step: '2', text: 'Linki buraya yapıştır' },
                    { step: '3', text: 'Servisi seç ve indir' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-red-500/20">
                        {item.step}
                      </span>
                      <span className="text-gray-300 text-sm">{item.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 text-center space-y-3"
        >
          <p className="text-gray-600 text-xs">
            Bu uygulama yalnızca kişisel kullanım içindir. Telif hakkıyla korunan içeriklerin
            indirilmesi yasal sorumluluğunuzdadır.
          </p>
          <p className="text-gray-400 text-sm font-medium tracking-wide">
            By{' '}
            <span className="bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent font-bold">
              hearsiff
            </span>
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
