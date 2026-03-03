import React, { useState, useEffect } from 'react';
import { 
  Search, 
  BarChart3, 
  BookOpen, 
  MessageSquare, 
  FileText, 
  Zap, 
  TrendingUp, 
  Users, 
  Share2, 
  Heart,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Video, BrandBible, HookAnalysis, CreativeBrief, Comment, ContentIdea } from './types';
import * as gemini from './services/geminiService';

export default function App() {
  const [view, setView] = useState<'scraper' | 'analisis' | 'bible' | 'briefs' | 'comentarios'>('scraper');
  const [keyword, setKeyword] = useState('disciplina masculina');
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [bible, setBible] = useState<BrandBible | null>(null);
  const [status, setStatus] = useState('');

  // Initial Brand Bible
  useEffect(() => {
    const fetchInitialBible = async () => {
      try {
        const b = await gemini.generateBrandBible('disciplina masculina');
        setBible(b);
      } catch (e) {
        console.error("Error generating initial bible", e);
      }
    };
    fetchInitialBible();
  }, []);

  const runAgent = async () => {
    setLoading(true);
    setStatus('Iniciando Scraping...');
    
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, count: 6 })
      });
      const data = await response.json();
      const scrapedVideos: Video[] = data.videos;
      
      setStatus('Analizando Hooks con Gemini...');
      const analyzedVideos = await Promise.all(scrapedVideos.map(async (v) => {
        const analysis = await gemini.analyzeHook(v);
        return { ...v, hookAnalysis: analysis };
      }));

      setStatus('Generando Briefs Creativos...');
      const finalVideos = await Promise.all(analyzedVideos.map(async (v) => {
        // Analyze comments for each video
        const commentTexts = v.comments_data.map(c => c.text);
        const analyzedComments = await gemini.analyzeComments(commentTexts);
        const videoWithComments = { ...v, comments_data: analyzedComments };

        if (bible) {
          const brief = await gemini.generateBrief(videoWithComments, bible);
          return { ...videoWithComments, brief };
        }
        return videoWithComments;
      }));

      setVideos(finalVideos);
      setStatus('Pipeline completado.');
      setView('scraper');
    } catch (error) {
      console.error(error);
      setStatus('Error en el proceso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-cyber-black text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-cyber-dark border-r border-cyber-border flex flex-col fixed h-full z-20">
        <div className="p-6 border-bottom border-cyber-border">
          <div className="text-2xl font-bold bg-gradient-to-r from-tiktok-red to-tiktok-cyan bg-clip-text text-transparent italic">
            TT_AGENT_v1
          </div>
          <div className="text-[10px] text-muted-foreground font-mono mt-1 tracking-widest uppercase opacity-50">
            Intelligence v2.0
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavItem 
            active={view === 'scraper'} 
            onClick={() => setView('scraper')} 
            icon={<Search size={18} />} 
            label="Scraper" 
          />
          <NavItem 
            active={view === 'analisis'} 
            onClick={() => setView('analisis')} 
            icon={<BarChart3 size={18} />} 
            label="Análisis Hooks" 
          />
          <NavItem 
            active={view === 'bible'} 
            onClick={() => setView('bible')} 
            icon={<BookOpen size={18} />} 
            label="Brand Bible" 
          />
          <NavItem 
            active={view === 'briefs'} 
            onClick={() => setView('briefs')} 
            icon={<FileText size={18} />} 
            label="Briefs IA" 
          />
          <NavItem 
            active={view === 'comentarios'} 
            onClick={() => setView('comentarios')} 
            icon={<MessageSquare size={18} />} 
            label="Comentarios" 
          />
        </nav>

        <div className="p-6 border-t border-cyber-border">
          <div className="bg-gradient-to-br from-tiktok-red/10 to-tiktok-cyan/10 border border-cyber-border rounded-xl p-4">
            <div className="text-[10px] font-mono text-tiktok-cyan uppercase tracking-wider mb-2">Marca Activa</div>
            <div className="font-bold text-sm truncate">{bible?.name || 'Cargando...'}</div>
            <div className="flex gap-1 mt-2">
              {bible?.tone.slice(0, 2).map(t => (
                <span key={t} className="text-[8px] bg-tiktok-red/20 text-tiktok-red px-2 py-0.5 rounded border border-tiktok-red/30 uppercase font-bold">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 relative">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight uppercase font-mono">
              {view === 'scraper' && 'Dashboard de Scraping'}
              {view === 'analisis' && 'Análisis de Viralidad'}
              {view === 'bible' && 'Manual de Marca'}
              {view === 'briefs' && 'Briefs de Producción'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {status || 'Listo para ejecutar el agente inteligente.'}
            </p>
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <input 
                type="text" 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Keyword (ej. Estoicismo)"
                className="bg-cyber-card border border-cyber-border rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:border-tiktok-red transition-colors w-64"
              />
              <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
            </div>
            <button 
              onClick={runAgent}
              disabled={loading}
              className="bg-tiktok-red hover:bg-tiktok-red/90 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-tiktok-red/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
              EJECUTAR AGENTE
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'scraper' && <ScraperView videos={videos} loading={loading} onSelectVideo={(v) => { setSelectedVideo(v); setView('comentarios'); }} />}
            {view === 'analisis' && <AnalisisView videos={videos} loading={loading} onSelectVideo={(v) => { setSelectedVideo(v); setView('comentarios'); }} />}
            {view === 'bible' && <BibleView bible={bible} />}
            {view === 'briefs' && <BriefsView videos={videos} loading={loading} onSelectVideo={(v) => { setSelectedVideo(v); setView('comentarios'); }} />}
            {view === 'comentarios' && <CommentsView video={selectedVideo} videos={videos} bible={bible} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-tiktok-red/10 text-tiktok-red border-l-4 border-tiktok-red' 
          : 'text-muted-foreground hover:bg-white/5 hover:text-white'
      }`}
    >
      <span className={active ? 'text-tiktok-red' : 'text-muted-foreground'}>{icon}</span>
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

function ScraperView({ videos, loading, onSelectVideo }: { videos: Video[], loading: boolean, onSelectVideo: (v: Video) => void }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <VideoSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-30">
        <Search size={64} className="mb-4" />
        <p className="text-xl font-mono">Sin datos. Ejecuta el agente para empezar.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <motion.div 
          key={video.id}
          whileHover={{ y: -5 }}
          onClick={() => onSelectVideo(video)}
          className="bg-cyber-card border border-cyber-border rounded-2xl overflow-hidden group transition-all hover:border-tiktok-red/50 cursor-pointer"
        >
          <div className="relative aspect-[4/5] bg-cyber-dark overflow-hidden">
            <img src={video.thumbnail} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-transparent to-transparent" />
            
            <div className="absolute top-4 left-4">
              <div className="bg-cyber-black/80 backdrop-blur-md border border-tiktok-cyan/30 text-tiktok-cyan text-[10px] font-mono px-2 py-1 rounded">
                HOOK SCORE: {video.hookAnalysis?.score || '??'}/100
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-tiktok-red flex items-center justify-center text-[10px] font-bold">
                  {video.account[1].toUpperCase()}
                </div>
                <span className="text-xs font-mono text-white/80">{video.account}</span>
              </div>
              <h3 className="font-bold text-sm line-clamp-2 leading-tight">
                "{video.hook}"
              </h3>
            </div>
          </div>

          <div className="p-4 grid grid-cols-3 gap-2 border-t border-cyber-border">
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-mono">Vistas</div>
              <div className="text-xs font-bold">{formatNumber(video.views)}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-mono">Likes</div>
              <div className="text-xs font-bold">{formatNumber(video.likes)}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-mono">Eng.</div>
              <div className="text-xs font-bold text-tiktok-cyan">{video.engagement}%</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function VideoSkeleton() {
  return (
    <div className="bg-cyber-card border border-cyber-border rounded-2xl overflow-hidden relative">
      <div className="absolute inset-0 animate-shimmer z-10 pointer-events-none" />
      <div className="relative aspect-[4/5] bg-cyber-dark/50 flex flex-col justify-end p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-cyber-dark" />
          <div className="h-2 bg-cyber-dark rounded w-16" />
        </div>
        <div className="h-3 bg-cyber-dark rounded w-full mb-1" />
        <div className="h-3 bg-cyber-dark rounded w-2/3" />
      </div>
      <div className="p-4 grid grid-cols-3 gap-2 border-t border-cyber-border">
        <div className="h-8 bg-cyber-dark rounded" />
        <div className="h-8 bg-cyber-dark rounded" />
        <div className="h-8 bg-cyber-dark rounded" />
      </div>
    </div>
  );
}

function AnalisisView({ videos, loading, onSelectVideo }: { videos: Video[], loading: boolean, onSelectVideo: (v: Video) => void }) {
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-cyber-card border border-cyber-border rounded-2xl p-6 flex gap-6 animate-pulse">
            <div className="w-48 aspect-[4/5] rounded-xl bg-cyber-dark/50 flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-cyber-dark rounded w-1/2" />
              <div className="grid grid-cols-2 gap-6">
                <div className="h-16 bg-cyber-dark rounded" />
                <div className="h-16 bg-cyber-dark rounded" />
              </div>
              <div className="h-20 bg-cyber-dark rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) return <ScraperView videos={[]} loading={false} onSelectVideo={onSelectVideo} />;

  return (
    <div className="space-y-6">
      {videos.map((video) => (
        <div key={video.id} className="bg-cyber-card border border-cyber-border rounded-2xl p-6 flex gap-6">
          <div className="w-48 aspect-[4/5] rounded-xl overflow-hidden flex-shrink-0 border border-cyber-border">
            <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-mono text-tiktok-red uppercase tracking-widest">Análisis de Hook</span>
                <h3 className="text-xl font-bold mt-1">"{video.hook}"</h3>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-tiktok-cyan font-mono">{video.hookAnalysis?.score || '??'}</div>
                <div className="text-[10px] font-mono text-muted-foreground uppercase">Viral Score</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-cyber-dark rounded-xl p-4 border border-cyber-border">
                <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Tipo de Hook</div>
                <div className="text-tiktok-red font-bold">{video.hookAnalysis?.type || 'Analizando...'}</div>
              </div>
              <div className="bg-cyber-dark rounded-xl p-4 border border-cyber-border">
                <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Elemento Clave</div>
                <div className="text-tiktok-cyan font-bold">{video.hookAnalysis?.keyElement || 'Analizando...'}</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Explicación Técnica</div>
              <p className="text-sm text-white/80 leading-relaxed italic">
                {video.hookAnalysis?.explanation || 'El motor de IA está procesando la estructura narrativa del video...'}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BibleView({ bible }: { bible: BrandBible | null }) {
  const [activeTab, setActiveTab] = useState<'identidad' | 'avatar' | 'tono' | 'pilares'>('identidad');

  if (!bible) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-tiktok-red" size={48} /></div>;

  const tabs = [
    { id: 'identidad', label: 'Identidad', icon: <BookOpen size={16} /> },
    { id: 'avatar', label: 'Avatar', icon: <Users size={16} /> },
    { id: 'tono', label: 'Tono', icon: <Zap size={16} /> },
    { id: 'pilares', label: 'Pilares', icon: <BarChart3 size={16} /> },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2 p-1 bg-cyber-dark/50 border border-cyber-border rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-mono text-xs uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-tiktok-red text-white shadow-lg shadow-tiktok-red/20' 
                : 'text-muted-foreground hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="min-h-[400px]"
        >
          {activeTab === 'identidad' && (
            <div className="bg-cyber-card border border-cyber-border rounded-2xl p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-tiktok-red/5 blur-[100px] rounded-full -mr-32 -mt-32" />
              <div className="relative z-10">
                <div className="text-tiktok-red font-mono text-[10px] uppercase tracking-[0.4em] mb-4">Core Identity</div>
                <h3 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">{bible.name}</h3>
                <p className="text-tiktok-cyan font-mono text-lg italic mb-8">"{bible.tagline}"</p>
                <div className="pt-8 border-t border-cyber-border/50">
                  <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4">Nuestra Misión</h4>
                  <p className="text-xl text-white/90 leading-relaxed font-light">{bible.mission}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'avatar' && (
            <div className="bg-cyber-card border border-cyber-border rounded-2xl p-10">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-tiktok-red to-tiktok-cyan p-0.5">
                  <div className="w-full h-full rounded-2xl bg-cyber-card flex items-center justify-center">
                    <Users size={32} className="text-tiktok-cyan" />
                  </div>
                </div>
                <div>
                  <div className="text-tiktok-red font-mono text-[10px] uppercase tracking-[0.4em] mb-1">Target Audience</div>
                  <h3 className="text-3xl font-bold">Perfil del Avatar</h3>
                </div>
              </div>
              <div className="bg-cyber-dark/50 border border-cyber-border rounded-xl p-8">
                <p className="text-lg text-white/80 leading-relaxed italic">
                  {bible.avatar}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'tono' && (
            <div className="space-y-8">
              <div className="bg-cyber-card border border-cyber-border rounded-2xl p-10">
                <div className="text-tiktok-red font-mono text-[10px] uppercase tracking-[0.4em] mb-6">Brand Voice</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bible.tone.map((t, i) => (
                    <motion.div 
                      key={t}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-cyber-dark border border-cyber-border px-8 py-6 rounded-2xl font-bold text-lg text-center hover:border-tiktok-cyan hover:shadow-lg hover:shadow-tiktok-cyan/5 transition-all cursor-default group"
                    >
                      <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent group-hover:from-tiktok-cyan group-hover:to-white transition-all">
                        {t}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div className="bg-cyber-card border border-cyber-border rounded-2xl p-8">
                <div className="text-tiktok-red font-mono text-[10px] uppercase tracking-[0.4em] mb-4">Hashtags de Marca</div>
                <div className="flex flex-wrap gap-3">
                  {bible.hashtags.map(h => (
                    <span key={h} className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm font-mono text-tiktok-cyan">
                      #{h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pilares' && (
            <div className="bg-cyber-card border border-cyber-border rounded-2xl p-10">
              <div className="text-tiktok-red font-mono text-[10px] uppercase tracking-[0.4em] mb-8">Content Strategy</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bible.pillars.map((p, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-cyber-dark border border-cyber-border p-6 rounded-2xl flex items-start gap-6 group hover:border-tiktok-red transition-all"
                  >
                    <div className="text-4xl font-mono font-black text-tiktok-red/20 group-hover:text-tiktok-red/40 transition-colors">
                      0{i+1}
                    </div>
                    <div className="text-lg font-medium pt-2 leading-snug">{p}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function BriefsView({ videos, loading, onSelectVideo }: { videos: Video[], loading: boolean, onSelectVideo: (v: Video) => void }) {
  const videosWithBriefs = videos.filter(v => v.brief);
  
  if (loading) {
    return (
      <div className="space-y-12">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-cyber-card border border-cyber-border rounded-2xl overflow-hidden animate-pulse">
            <div className="h-20 bg-cyber-dark/50 border-b border-cyber-border" />
            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="h-32 bg-cyber-dark/50 rounded-2xl" />
                <div className="h-48 bg-cyber-dark/50 rounded-2xl" />
              </div>
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-cyber-dark/50 rounded-xl" />
                  <div className="h-24 bg-cyber-dark/50 rounded-xl" />
                </div>
                <div className="h-16 bg-cyber-dark/50 rounded-xl" />
                <div className="h-12 bg-cyber-dark/50 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (videosWithBriefs.length === 0) return <AnalisisView videos={videos} loading={false} onSelectVideo={onSelectVideo} />;

  return (
    <div className="space-y-12">
      {videosWithBriefs.map((video) => (
        <div key={video.id} className="bg-cyber-card border border-cyber-border rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-tiktok-red/20 to-tiktok-cyan/20 p-6 border-b border-cyber-border flex justify-between items-center">
            <div>
              <div className="text-[10px] font-mono text-white/50 uppercase mb-1">Basado en: {video.account}</div>
              <h3 className="text-xl font-bold">Brief: {video.brief?.concept}</h3>
            </div>
            <div className="bg-cyber-black/50 px-4 py-2 rounded-lg border border-white/10 text-xs font-mono">
              ID: {video.id.slice(0, 8)}
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={16} className="text-tiktok-red" />
                  <span className="text-xs font-mono uppercase tracking-widest">Hook Maestro</span>
                </div>
                <div className="bg-cyber-dark p-6 rounded-2xl border border-tiktok-red/30 text-xl font-bold italic">
                  "{video.brief?.hook}"
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare size={16} className="text-tiktok-cyan" />
                  <span className="text-xs font-mono uppercase tracking-widest">Guión de Locución</span>
                </div>
                <div className="bg-cyber-dark p-6 rounded-2xl border border-cyber-border text-sm leading-loose whitespace-pre-wrap font-mono text-white/80">
                  {video.brief?.script}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-cyber-dark p-4 rounded-xl border border-cyber-border">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Visuales</div>
                  <div className="text-xs leading-relaxed">{video.brief?.visuals}</div>
                </div>
                <div className="bg-cyber-dark p-4 rounded-xl border border-cyber-border">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Audio/Música</div>
                  <div className="text-xs leading-relaxed">{video.brief?.audio}</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono text-muted-foreground uppercase mb-4">Call to Action</div>
                <div className="bg-tiktok-cyan/10 border border-tiktok-cyan/30 p-4 rounded-xl text-tiktok-cyan font-bold text-center uppercase tracking-widest">
                  {video.brief?.cta}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono text-muted-foreground uppercase mb-4">Hashtags Estratégicos</div>
                <div className="flex flex-wrap gap-2">
                  {video.brief?.hashtags.map(h => (
                    <span key={h} className="text-[10px] bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/60">
                      #{h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CommentsView({ video, videos, bible }: { video: Video | null, videos: Video[], bible: BrandBible | null }) {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [generatingIdeas, setGeneratingIdeas] = useState(false);
  const [globalInsights, setGlobalInsights] = useState<{ topics: string[], summary: string } | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    if (!video && videos.length > 0 && !globalInsights) {
      const fetchGlobal = async () => {
        setLoadingInsights(true);
        try {
          const allComments = videos.flatMap(v => v.comments_data.map(c => c.text));
          const res = await gemini.generateGlobalInsights(allComments);
          setGlobalInsights(res);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingInsights(false);
        }
      };
      fetchGlobal();
    }
  }, [video, videos, globalInsights]);

  if (!video) {
    return (
      <div className="space-y-8">
        <header className="bg-gradient-to-r from-tiktok-red/20 to-tiktok-cyan/20 border border-cyber-border rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
            <Users className="text-tiktok-red" /> Inteligencia de Audiencia Global
          </h2>
          <p className="text-muted-foreground">Análisis agregado de todos los videos scrapeados para detectar tendencias macro.</p>
        </header>

        {loadingInsights ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-tiktok-red" size={48} /></div>
        ) : globalInsights ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-cyber-card border border-cyber-border rounded-2xl p-8">
              <h3 className="text-tiktok-cyan font-mono text-xs uppercase tracking-widest mb-6">Temas Recurrentes</h3>
              <div className="space-y-4">
                {globalInsights.topics.map((topic, i) => (
                  <div key={i} className="flex items-center gap-4 bg-cyber-dark p-4 rounded-xl border border-cyber-border group hover:border-tiktok-cyan transition-all">
                    <div className="w-8 h-8 rounded-full bg-tiktok-cyan/10 flex items-center justify-center text-tiktok-cyan font-bold text-xs">{i+1}</div>
                    <div className="text-sm font-medium">{topic}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-cyber-card border border-cyber-border rounded-2xl p-8">
              <h3 className="text-tiktok-red font-mono text-xs uppercase tracking-widest mb-6">Resumen de Audiencia</h3>
              <p className="text-white/80 leading-relaxed italic text-sm">
                {globalInsights.summary}
              </p>
              <div className="mt-8 pt-8 border-t border-cyber-border grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-tiktok-cyan">{videos.length}</div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">Videos Analizados</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-tiktok-red">{videos.reduce((acc, v) => acc + v.comments, 0)}</div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">Comentarios Totales</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <MessageSquare size={64} className="mb-4" />
            <p className="text-xl font-mono">Sin datos globales. Ejecuta el agente primero.</p>
          </div>
        )}
      </div>
    );
  }

  const questions = video.comments_data.filter(c => c.isQuestion);
  const sentiments = [
    { name: 'Positivo', value: video.comments_data.filter(c => c.sentiment === 'positive').length, color: '#25f4ee' },
    { name: 'Neutral', value: video.comments_data.filter(c => c.sentiment === 'neutral').length, color: '#ffffff60' },
    { name: 'Negativo', value: video.comments_data.filter(c => c.sentiment === 'negative').length, color: '#fe2c55' },
  ].filter(s => s.value > 0);

  const generateIdeas = async () => {
    if (!bible || questions.length === 0) return;
    setGeneratingIdeas(true);
    try {
      const qTexts = questions.map(q => q.text);
      const res = await gemini.generateVideoIdeas(qTexts, bible);
      setIdeas(res);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingIdeas(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-cyber-card border border-cyber-border rounded-2xl p-6 flex gap-6">
        <div className="w-32 aspect-[4/5] rounded-xl overflow-hidden flex-shrink-0 border border-cyber-border">
          <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold">"{video.hook}"</h3>
          <p className="text-muted-foreground text-sm mt-2">{video.account}</p>
          <div className="flex justify-between items-end mt-4">
            <div className="bg-cyber-dark px-4 py-2 rounded-lg border border-cyber-border">
              <div className="text-[10px] font-mono text-muted-foreground uppercase">Comentarios</div>
              <div className="font-bold">{video.comments}</div>
            </div>
            
            <button 
              onClick={generateIdeas}
              disabled={generatingIdeas || questions.length === 0}
              className="bg-tiktok-cyan hover:bg-tiktok-cyan/90 text-cyber-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 text-sm"
            >
              {generatingIdeas ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
              GENERAR IDEAS DE CONTENIDO
            </button>
          </div>
        </div>
      </div>

      {ideas.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gradient-to-r from-tiktok-cyan/10 to-transparent border border-tiktok-cyan/30 rounded-2xl p-6"
        >
          <h2 className="text-tiktok-cyan font-mono text-xs uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
            <Zap size={14} /> Ideas de Contenido Sugeridas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ideas.map((idea, i) => (
              <div key={i} className="bg-cyber-black/40 border border-tiktok-cyan/20 p-4 rounded-xl">
                <div className="font-bold text-sm mb-2 text-tiktok-cyan">{idea.title}</div>
                <div className="text-xs italic text-white/80 mb-3 leading-relaxed">"{idea.hook}"</div>
                <div className="text-[10px] text-muted-foreground leading-relaxed">{idea.reason}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-tiktok-red font-mono text-xs uppercase tracking-[0.3em]">Análisis de Sentimiento</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-cyber-card border border-cyber-border p-6 rounded-2xl h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentiments}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sentiments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111122', border: '1px solid #1a1a35', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {sentiments.map((s) => (
                <div key={s.name} className="bg-cyber-card border border-cyber-border p-4 rounded-xl flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-sm font-medium">{s.name}</span>
                  </div>
                  <span className="font-bold">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 space-y-3">
            <h2 className="text-tiktok-red font-mono text-xs uppercase tracking-[0.3em] mb-4">Comentarios Recientes</h2>
            {video.comments_data.map((comment, i) => (
              <div key={i} className="bg-cyber-card border border-cyber-border p-4 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                    comment.sentiment === 'positive' ? 'bg-tiktok-cyan/20 text-tiktok-cyan' :
                    comment.sentiment === 'negative' ? 'bg-tiktok-red/20 text-tiktok-red' :
                    'bg-white/10 text-white/60'
                  }`}>
                    {comment.sentiment}
                  </span>
                  {comment.isQuestion && <span className="text-[10px] font-mono text-tiktok-cyan flex items-center gap-1"><Zap size={10} /> Pregunta</span>}
                </div>
                <p className="text-sm">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-tiktok-red font-mono text-xs uppercase tracking-[0.3em] mb-4">Preguntas Clave</h2>
          <div className="space-y-3">
            {questions.length > 0 ? questions.map((q, i) => (
              <div key={i} className="bg-cyber-card border border-cyber-border p-4 rounded-xl border-l-4 border-l-tiktok-cyan">
                <p className="text-sm font-medium">"{q.text}"</p>
                <div className="mt-2 text-[10px] font-mono text-tiktok-cyan uppercase">Oportunidad de Contenido</div>
              </div>
            )) : (
              <div className="text-muted-foreground text-sm italic">No se detectaron preguntas relevantes.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SentimentCard({ label, count, color }: { label: string, count: number, color: string }) {
  return (
    <div className="bg-cyber-card border border-cyber-border p-4 rounded-xl text-center">
      <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{count}</div>
    </div>
  );
}

function formatNumber(num: number) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}
