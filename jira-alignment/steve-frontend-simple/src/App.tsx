import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BarChart3,
  Shield,
  Zap,
  AlertTriangle,
  ArrowRight,
  Activity,
  Moon,
  Sun,
  Search,
  Filter,
  Download,
  Share2,
  Copy,
  Check,
  FileText,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  Settings,
  Database,
  Scale,
  Edit3,
  Lightbulb,
  MessageSquare,
  Save,
  X,
  ChevronRight,
  ArrowUpDown,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import './App.modern2.css';
import './App.darkmode-refined.css';
import './App.score-colors.css';
import './App.darkmode-final.css';

const API_URL = 'http://localhost:8000';

interface Ticket {
  key: string;
  summary: string;
  description: string;
  alignmentScore: number;
  category: string;
  rationale: string;
  suggestedSummary?: string;
  suggestedDescription?: string;
}

interface AnalysisResult {
  status: string;
  progress: number;
  tickets: Ticket[];
  executiveSummary: string;
  timestamp: string;
  error?: string;
}

interface AgentConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  instructions: string;
  enabled: boolean;
  color: string;
}

interface AgentSettings {
  [key: string]: AgentConfig;
}

const CATEGORY_COLORS = {
  core_value: '#10b981',
  strategic_enabler: '#3b82f6',
  drift: '#f59e0b',
  distraction: '#ef4444'
};

const CATEGORY_LABELS = {
  core_value: 'Core Value',
  strategic_enabler: 'Strategic Enabler',
  drift: 'Drift',
  distraction: 'Distraction'
};

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [mode, setMode] = useState('execution');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTickets, setExpandedTickets] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [chartTooltip, setChartTooltip] = useState<{ visible: boolean; x: number; y: number; tickets: Ticket[]; title: string; persistent?: boolean }>({
    visible: false,
    x: 0,
    y: 0,
    tickets: [],
    title: '',
    persistent: false
  });
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [showAgentSettings, setShowAgentSettings] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('ticketIngestor');
  const [sortBy, setSortBy] = useState<'score' | 'key' | 'category'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [agentSettings, setAgentSettings] = useState<AgentSettings>({
    ticketIngestor: {
      id: 'ticketIngestor',
      name: 'Ticket Ingestor',
      description: 'Harvests and normalizes Jira tickets',
      icon: <Database className="w-5 h-5" />,
      instructions: 'Pull tickets using JQL based on review mode. Normalize Jira fields into consistent schema for analysis.',
      enabled: true,
      color: '#6366f1'
    },
    alignmentEvaluator: {
      id: 'alignmentEvaluator',
      name: 'Alignment Evaluator',
      description: 'Strategic gatekeeper for ticket alignment',
      icon: <Scale className="w-5 h-5" />,
      instructions: 'Compare each ticket against company principles. Calculate alignment score (0-100). Tag tickets based on score thresholds.',
      enabled: true,
      color: '#10b981'
    },
    rewriteStrategist: {
      id: 'rewriteStrategist',
      name: 'Rewrite Strategist',
      description: 'Fixes alignment for drift/distraction tickets',
      icon: <Edit3 className="w-5 h-5" />,
      instructions: 'Process drift/distraction tickets only. Create revised summary & description aligned to nearest principle.',
      enabled: true,
      color: '#f59e0b'
    },
    themeSynthesizer: {
      id: 'themeSynthesizer',
      name: 'Theme Synthesizer',
      description: 'Pattern detector across tickets',
      icon: <Lightbulb className="w-5 h-5" />,
      instructions: 'Aggregate alignment statistics. Identify over-indexed areas and neglected principles. Recommend focus shifts.',
      enabled: true,
      color: '#8b5cf6'
    },
    founderVoice: {
      id: 'founderVoice',
      name: 'Founder Voice',
      description: 'Executive narrator',
      icon: <MessageSquare className="w-5 h-5" />,
      instructions: 'Transform analysis into ~300-word Slack post. Tone: sharp, strategic, assertive. End with: "Are we building what matters?"',
      enabled: true,
      color: '#ef4444'
    }
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('steve-theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  useEffect(() => {
    const savedSettings = localStorage.getItem('steve-agent-settings');
    if (savedSettings) {
      setAgentSettings(JSON.parse(savedSettings));
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('steve-theme', newTheme);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setResult(null);
    
    try {
      const response = await axios.post(`${API_URL}/analyze`, {
        mode,
        project: null, // Let backend use the project from .env file
        principles: []
      });
      
      setResult(response.data);
    } catch (error) {
      console.error('Analysis failed:', error);
      setResult({
        status: 'error',
        progress: 0,
        tickets: [],
        executiveSummary: '',
        timestamp: new Date().toISOString(),
        error: 'Failed to analyze tickets. Please check your configuration and try again.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getHealthScore = (tickets: Ticket[]) => {
    if (tickets.length === 0) return 0;
    const avgScore = tickets.reduce((sum, t) => sum + t.alignmentScore, 0) / tickets.length;
    return Math.round(avgScore);
  };

  const getCategoryData = (tickets: Ticket[]) => {
    const counts = tickets.reduce((acc, ticket) => {
      acc[ticket.category] = (acc[ticket.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([category, count]) => ({
      name: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS],
      value: count,
      category
    }));
  };

  const getScoreDistribution = (tickets: Ticket[]) => {
    const ranges = [
      { range: '0-20', min: 0, max: 20, count: 0, tickets: [] as Ticket[] },
      { range: '21-40', min: 21, max: 40, count: 0, tickets: [] as Ticket[] },
      { range: '41-60', min: 41, max: 60, count: 0, tickets: [] as Ticket[] },
      { range: '61-80', min: 61, max: 80, count: 0, tickets: [] as Ticket[] },
      { range: '81-100', min: 81, max: 100, count: 0, tickets: [] as Ticket[] }
    ];

    tickets.forEach(ticket => {
      const range = ranges.find(r => ticket.alignmentScore >= r.min && ticket.alignmentScore <= r.max);
      if (range) {
        range.count++;
        range.tickets.push(ticket);
      }
    });

    return ranges;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core_value':
        return <Shield className="w-4 h-4" />;
      case 'strategic_enabler':
        return <Zap className="w-4 h-4" />;
      case 'drift':
        return <TrendingDown className="w-4 h-4" />;
      case 'distraction':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const toggleCategoryFilter = (category: string) => {
    const newCategories = new Set(selectedCategories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }
    setSelectedCategories(newCategories);
  };

  const toggleTicketExpansion = (ticketKey: string) => {
    const newExpanded = new Set(expandedTickets);
    if (newExpanded.has(ticketKey)) {
      newExpanded.delete(ticketKey);
    } else {
      newExpanded.add(ticketKey);
    }
    setExpandedTickets(newExpanded);
  };

  const copySummaryToClipboard = () => {
    if (result?.executiveSummary) {
      navigator.clipboard.writeText(result.executiveSummary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  const updateAgentSettings = (agentId: string, updates: Partial<AgentConfig>) => {
    const newSettings = {
      ...agentSettings,
      [agentId]: {
        ...agentSettings[agentId],
        ...updates
      }
    };
    setAgentSettings(newSettings);
    localStorage.setItem('steve-agent-settings', JSON.stringify(newSettings));
  };

  const sortTickets = (tickets: Ticket[]) => {
    const sorted = [...tickets].sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return sortOrder === 'desc' ? b.alignmentScore - a.alignmentScore : a.alignmentScore - b.alignmentScore;
        case 'key':
          return sortOrder === 'desc' ? b.key.localeCompare(a.key) : a.key.localeCompare(b.key);
        case 'category':
          const categoryOrder = ['core_value', 'strategic_enabler', 'drift', 'distraction'];
          const aIndex = categoryOrder.indexOf(a.category);
          const bIndex = categoryOrder.indexOf(b.category);
          return sortOrder === 'desc' ? bIndex - aIndex : aIndex - bIndex;
        default:
          return 0;
      }
    });
    return sorted;
  };

  const filteredTickets = result ? sortTickets(
    result.tickets.filter(ticket => {
      const matchesSearch = searchTerm === '' || 
        ticket.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.key.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategories.size === 0 || selectedCategories.has(ticket.category);
      
      return matchesSearch && matchesCategory;
    })
  ) : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (chartTooltip.visible) {
        const target = e.target as HTMLElement;
        if (!target.closest('.chart-tooltip') && !target.closest('.recharts-pie-sector')) {
          setChartTooltip({ ...chartTooltip, visible: false });
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [chartTooltip.visible]);

  return (
    <div className="app" data-theme={theme}>
      <header className="header glass">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              <Target />
            </div>
            <div className="logo-text-container">
              <h1 className="logo-text">STEVE</h1>
              <p className="logo-subtitle">Strategic Ticket Evaluation & Vision Enforcer</p>
            </div>
          </div>
          
          <div className="header-controls">
            <motion.button
              className="theme-toggle"
              onClick={toggleTheme}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {theme === 'light' ? <Moon /> : <Sun />}
            </motion.button>
            
            <motion.button
              className="settings-button"
              onClick={() => setShowAgentSettings(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings />
              <span className="settings-indicator" />
            </motion.button>
            
            
            <motion.button
              className="analyze-button"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <RefreshCw />
                  <span>Analyze Tickets</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <AnimatePresence mode="wait">
          {isAnalyzing && (
            <motion.div
              className="loading-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="loading-card glass">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Activity style={{ width: 64, height: 64, color: '#8b5cf6' }} />
                </motion.div>
                <h2>Analyzing Your Tickets</h2>
                <p>STEVE is evaluating strategic alignment...</p>
                
                <div className="loading-steps">
                  <motion.div 
                    className="loading-step active"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <CheckCircle2 />
                    <span>Fetching tickets from Jira</span>
                  </motion.div>
                  <motion.div 
                    className="loading-step"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Loader2 className="animate-spin" />
                    <span>Evaluating strategic alignment</span>
                  </motion.div>
                  <motion.div 
                    className="loading-step"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Sparkles />
                    <span>Generating insights</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div
              className="results-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {result.error && (
                <motion.div
                  className="error-banner"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <XCircle />
                  <span>{result.error}</span>
                </motion.div>
              )}

              {/* Key Metrics */}
              <div className="metrics-grid">
                <motion.div 
                  className="metric-card glass"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="metric-header">
                    <BarChart3 />
                    <span>Strategic Health</span>
                  </div>
                  <div className="metric-value">
                    <span className="metric-number">{getHealthScore(result.tickets)}</span>
                    <span className="metric-suffix">/100</span>
                  </div>
                  <div className="health-bar">
                    <motion.div 
                      className="health-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${getHealthScore(result.tickets)}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      style={{
                        background: getHealthScore(result.tickets) >= 80 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 
                                   getHealthScore(result.tickets) >= 60 ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 
                                   getHealthScore(result.tickets) >= 40 ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                      }}
                    />
                  </div>
                </motion.div>

                <motion.div 
                  className="metric-card glass"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="metric-header">
                    <Target />
                    <span>Total Tickets</span>
                  </div>
                  <div className="metric-value">
                    <span className="metric-number">{result.tickets.length}</span>
                  </div>
                </motion.div>

                <motion.div 
                  className="metric-card glass"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="metric-header">
                    <Shield style={{ color: '#10b981' }} />
                    <span>Core Value</span>
                  </div>
                  <div className="metric-value">
                    <span className="metric-number">
                      {result.tickets.filter(t => t.category === 'core_value').length}
                    </span>
                  </div>
                </motion.div>

                <motion.div 
                  className="metric-card glass"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="metric-header">
                    <AlertTriangle style={{ color: '#ef4444' }} />
                    <span>Needs Attention</span>
                  </div>
                  <div className="metric-value">
                    <span className="metric-number">
                      {result.tickets.filter(t => t.category === 'drift' || t.category === 'distraction').length}
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Charts Section */}
              <div className="charts-grid">
                <motion.div 
                  className="chart-card glass"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="chart-title">
                    <span>Category Distribution</span>
                    <div className="chart-actions">
                      <motion.button 
                        className="chart-action-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <PieChartIcon style={{ width: 16, height: 16 }} />
                      </motion.button>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie
                        data={getCategoryData(result.tickets)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={45}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getCategoryData(result.tickets).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS]}
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={(e) => {
                              setHoveredCategory(entry.category);
                              const categoryTickets = result.tickets.filter(t => t.category === entry.category);
                              const rect = (e.target as any).getBoundingClientRect();
                              setChartTooltip({
                                visible: true,
                                x: rect.right + 10,
                                y: rect.top,
                                tickets: categoryTickets.slice(0, 5),
                                title: `${entry.name} (${categoryTickets.length} tickets)`
                              });
                            }}
                            onMouseLeave={() => {
                              setHoveredCategory(null);
                              if (!chartTooltip.persistent) {
                                setChartTooltip({ ...chartTooltip, visible: false });
                              }
                            }}
                            onClick={(e) => {
                              const categoryTickets = result.tickets.filter(t => t.category === entry.category);
                              const rect = (e.target as any).getBoundingClientRect();
                              setChartTooltip({
                                visible: true,
                                x: rect.right + 10,
                                y: rect.top,
                                tickets: categoryTickets.slice(0, 8),
                                title: `${entry.name} (${categoryTickets.length} tickets)`,
                                persistent: true
                              });
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="chart-legend">
                    {getCategoryData(result.tickets).map((item) => (
                      <div 
                        key={item.category}
                        className={`legend-item ${hoveredCategory === item.category ? 'highlighted' : ''}`}
                        onMouseEnter={() => setHoveredCategory(item.category)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      >
                        <div 
                          className="legend-color" 
                          style={{ backgroundColor: CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS] }}
                        />
                        <span>{item.name}</span>
                        <span className="legend-value">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div 
                  className="chart-card glass"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="chart-title">
                    <span>Score Distribution</span>
                    <div className="chart-actions">
                      <motion.button 
                        className="chart-action-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <TrendingUpIcon style={{ width: 16, height: 16 }} />
                      </motion.button>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={getScoreDistribution(result.tickets)} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip content={({ active, payload }) => {
                        if (active && payload && payload[0]) {
                          const data = payload[0].payload;
                          if (data.tickets && data.tickets.length > 0) {
                            return (
                              <div className="chart-tooltip" style={{ position: 'fixed' }}>
                                <div className="chart-tooltip-header">
                                  Score Range {data.range} ({data.count} tickets)
                                </div>
                                <div className="chart-tooltip-tickets">
                                  {data.tickets.slice(0, 5).map((ticket: Ticket) => (
                                    <div key={ticket.key} className="tooltip-ticket">
                                      <div className="tooltip-ticket-key">{ticket.key}</div>
                                      <div className="tooltip-ticket-summary">{ticket.summary}</div>
                                    </div>
                                  ))}
                                  {data.tickets.length > 5 && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                                      +{data.tickets.length - 5} more tickets
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          }
                        }
                        return null;
                      }} />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]}>
                        {getScoreDistribution(result.tickets).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.min >= 80 ? '#10b981' : entry.min >= 60 ? '#3b82f6' : entry.min >= 40 ? '#f59e0b' : '#ef4444'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>

              {/* Ticket Analysis */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="tickets-header">
                  <h2>Ticket Analysis</h2>
                  <div className="tickets-controls">
                    <div className="search-box">
                      <Search className="search-icon" />
                      <input
                        type="text"
                        className="search-input glass"
                        placeholder="Search tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <div className="modern-select-wrapper">
                      <select 
                        className="modern-select"
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                          const [newSortBy, newSortOrder] = e.target.value.split('-') as ['score' | 'key' | 'category', 'asc' | 'desc'];
                          setSortBy(newSortBy);
                          setSortOrder(newSortOrder);
                        }}
                      >
                        <option value="score-desc">Score (High to Low)</option>
                        <option value="score-asc">Score (Low to High)</option>
                        <option value="key-asc">Key (A to Z)</option>
                        <option value="key-desc">Key (Z to A)</option>
                        <option value="category-desc">Category (Best First)</option>
                        <option value="category-asc">Category (Worst First)</option>
                      </select>
                      <ChevronDown className="select-arrow" />
                    </div>
                    
                    <motion.button
                      className="filter-button glass"
                      onClick={() => setShowFilters(!showFilters)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Filter />
                      {showFilters ? <ChevronUp /> : <ChevronDown />}
                    </motion.button>
                    
                    <div className="sort-icon">
                      {sortOrder === 'desc' ? 
                        <SortDesc style={{ width: 16, height: 16 }} /> : 
                        <SortAsc style={{ width: 16, height: 16 }} />
                      }
                    </div>
                  </div>
                  
                  <span className="ticket-count">{filteredTickets.length} of {result.tickets.length} tickets</span>
                </div>

                {/* Filter Panel */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      className="filter-panel glass"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: 'hidden', marginBottom: '1.5rem' }}
                    >
                      <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>Filter by Category</h4>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                            <motion.button
                              key={key}
                              className={`category-filter-btn ${selectedCategories.has(key) ? 'active' : ''}`}
                              onClick={() => toggleCategoryFilter(key)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: `1px solid ${selectedCategories.has(key) ? CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS] : 'var(--border-color)'}`,
                                background: selectedCategories.has(key) ? `${CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS]}20` : 'var(--bg-primary)',
                                color: selectedCategories.has(key) ? CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS] : 'var(--text-secondary)',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'var(--transition-base)'
                              }}
                            >
                              {label}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="tickets-grid">
                  <AnimatePresence mode="popLayout">
                  {filteredTickets.map((ticket, index) => (
                    <motion.div
                      key={ticket.key}
                      className={`ticket-card glass ${ticket.category}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + Math.min(index * 0.05, 0.3), type: "spring", stiffness: 200 }}
                      whileHover={{ y: -4 }}
                      layout
                    >
                      <div className="ticket-header">
                        <div className="ticket-meta">
                          <span className="ticket-key">{ticket.key}</span>
                          <motion.div 
                            className={`category-badge ${ticket.category}`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {getCategoryIcon(ticket.category)}
                            <span>{CATEGORY_LABELS[ticket.category as keyof typeof CATEGORY_LABELS]}</span>
                          </motion.div>
                        </div>
                        <div 
                          className="score-badge"
                          data-score-tier={
                            ticket.alignmentScore >= 80 ? 'high' :
                            ticket.alignmentScore >= 60 ? 'medium' :
                            ticket.alignmentScore >= 40 ? 'low' : 'critical'
                          }
                        >
                          <span className="score-value">{ticket.alignmentScore}</span>
                          <span className="score-label">score</span>
                        </div>
                      </div>

                      <h3 className="ticket-title">{ticket.summary}</h3>
                      <p className="ticket-rationale">{ticket.rationale}</p>

                      {(ticket.suggestedSummary || expandedTickets.has(ticket.key)) && (
                        <button
                          className="expand-button"
                          onClick={() => toggleTicketExpansion(ticket.key)}
                        >
                          {expandedTickets.has(ticket.key) ? (
                            <>
                              <ChevronUp style={{ width: 16, height: 16 }} />
                              <span>Hide details</span>
                            </>
                          ) : (
                            <>
                              <ArrowRight style={{ width: 16, height: 16 }} />
                              <span>View suggestion</span>
                            </>
                          )}
                        </button>
                      )}

                      <AnimatePresence>
                        {expandedTickets.has(ticket.key) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="ticket-details"
                          >
                            <div className="detail-section">
                              <h4>Current Description</h4>
                              <p>{ticket.description || 'No description provided'}</p>
                            </div>
                            
                            {ticket.suggestedSummary && (
                              <div className="suggestion-section">
                                <h4>
                                  <Sparkles style={{ width: 16, height: 16, color: '#8b5cf6' }} />
                                  Strategic Realignment
                                </h4>
                                <div className="suggestion-content">
                                  <div className="suggestion-item">
                                    <span className="suggestion-label">Summary:</span>
                                    <span className="suggestion-text">{ticket.suggestedSummary}</span>
                                  </div>
                                  {ticket.suggestedDescription && (
                                    <div className="suggestion-item">
                                      <span className="suggestion-label">Description:</span>
                                      <span className="suggestion-text">{ticket.suggestedDescription}</span>
                                    </div>
                                  )}
                                </div>
                                <motion.button
                                  className="apply-button"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <CheckCircle2 style={{ width: 16, height: 16 }} />
                                  <span>Apply to Jira</span>
                                </motion.button>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Executive Summary */}
              {result.executiveSummary && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  style={{ marginTop: '2rem' }}
                >
                <div className="tickets-header">
                  <h2>Executive Summary</h2>
                  <div className="summary-actions">
                    <motion.button 
                      className="summary-action-btn"
                      onClick={copySummaryToClipboard}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {copiedSummary ? <Check style={{ width: 16, height: 16 }} /> : <Copy style={{ width: 16, height: 16 }} />}
                    </motion.button>
                    <motion.button 
                      className="summary-action-btn"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Share2 style={{ width: 16, height: 16 }} />
                    </motion.button>
                    <motion.button 
                      className="summary-action-btn"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Download style={{ width: 16, height: 16 }} />
                    </motion.button>
                  </div>
                </div>
                
                <motion.div 
                  className="summary-card glass"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.95 }}
                >
                  <div className="summary-content">
                  {result.executiveSummary.split('\n').map((paragraph, index) => {
                    const trimmed = paragraph.trim();
                    
                    // Skip empty paragraphs
                    if (!trimmed) return null;
                    
                    // Handle bullet points
                    if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
                      const cleanText = trimmed.replace(/^[•-]\s*/, '').replace(/\*\*/g, '');
                      const lines = result.executiveSummary.split('\n');
                      
                      // Find which section this bullet belongs to
                      let currentSection = '';
                      let sectionStartIndex = 0;
                      for (let i = index - 1; i >= 0; i--) {
                        const lineContent = lines[i].trim().toLowerCase();
                        if (lineContent.includes('immediate recommendations') || lineContent.includes('recommendations:')) {
                          currentSection = 'recommendations';
                          sectionStartIndex = i + 1;
                          break;
                        }
                        if (lineContent.includes('performance highlights') || lineContent.includes('highlights:')) {
                          currentSection = 'performance';
                          sectionStartIndex = i + 1;
                          break;
                        }
                        if (lineContent.includes('key insights') || lineContent.includes('insights:')) {
                          currentSection = 'insights';
                          sectionStartIndex = i + 1;
                          break;
                        }
                      }
                      
                      // Calculate bullet index within the current section
                      let bulletIndex = 1;
                      for (let i = sectionStartIndex; i < index; i++) {
                        const line = lines[i].trim();
                        if (line.startsWith('•') || line.startsWith('-')) {
                          bulletIndex++;
                        }
                      }
                      
                      const isRecommendation = currentSection === 'recommendations';
                      
                      if (isRecommendation) {
                        // Checkbox for recommendations
                        const bulletId = `bullet-${index}`;
                        return (
                          <motion.div 
                            key={index} 
                            className="summary-bullet-item recommendation-item"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 1.0 + index * 0.05 }}
                          >
                            <label className="bullet-checkbox-wrapper">
                              <input 
                                type="checkbox" 
                                id={bulletId}
                                className="bullet-checkbox"
                              />
                              <div className="bullet-icon">
                                <CheckCircle2 className="check-icon" />
                              </div>
                            </label>
                            <span className="bullet-text">{cleanText}</span>
                          </motion.div>
                        );
                      } else {
                        // Numbers for key insights
                        return (
                          <motion.div 
                            key={index} 
                            className="summary-bullet-item insight-item"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 1.0 + index * 0.05 }}
                          >
                            <div className="bullet-icon numbered" style={{ 
                              color: 'white', 
                              opacity: 1, 
                              background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '0.875rem'
                            }}>{bulletIndex}</div>
                            <span className="bullet-text">{cleanText}</span>
                          </motion.div>
                        );
                      }
                    }
                    
                    // Handle markdown-style headers (##, **text**)
                    if (trimmed.startsWith('##') || (trimmed.startsWith('**') && trimmed.endsWith(':**'))) {
                      const cleanHeading = trimmed.replace(/^##\s*/, '').replace(/\*\*/g, '').replace(/:/g, ''); // Remove markdown and colons
                      return (
                        <motion.h3 
                          key={index} 
                          className="summary-heading"
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 1.0 + index * 0.05 }}
                        >
                          {cleanHeading}
                        </motion.h3>
                      );
                    }
                    
                    // Handle bold text (**text**)
                    if (trimmed.includes('**')) {
                      const parts = trimmed.split(/\*\*(.*?)\*\*/g);
                      return (
                        <motion.p 
                          key={index} 
                          className="summary-paragraph"
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 1.0 + index * 0.05 }}
                        >
                          {parts.map((part, partIndex) => 
                            partIndex % 2 === 1 ? (
                              <span key={partIndex} className="summary-bold">{part}</span>
                            ) : (
                              part
                            )
                          )}
                        </motion.p>
                      );
                    }
                    
                    // Skip "Are we building what matters?" line
                    if (trimmed.includes('Are we building what matters?')) {
                      return null;
                    }
                    
                    // Check if this is a special paragraph (Bottom Line or intro)
                    const cleanParagraph = trimmed.replace(/\*\*/g, '');
                    const isBottomLine = trimmed.toLowerCase().includes('bottom line');
                    const isHealthScore = trimmed.includes('Strategic Health Assessment');
                    const isIntro = (index === 0 && !isHealthScore) || (index === 1 && isHealthScore) || (index < 5 && !trimmed.includes(':') && !trimmed.startsWith('•') && !trimmed.startsWith('-') && !isHealthScore);
                    
                    // Handle Strategic Health Assessment combined with intro
                    if (isHealthScore) {
                      const scoreMatch = trimmed.match(/Strategic Health Assessment:?\s*(\d+)\/100/);
                      const score = scoreMatch ? scoreMatch[1] : '0';
                      
                      // Get the next paragraph (intro text)
                      let introText = '';
                      if (index + 1 < result.executiveSummary.split('\n').length) {
                        const nextLine = result.executiveSummary.split('\n')[index + 1].trim();
                        if (nextLine && !nextLine.includes(':') && !nextLine.startsWith('•') && !nextLine.startsWith('-')) {
                          introText = nextLine.replace(/\*\*/g, '');
                        }
                      }
                      
                      if (introText) {
                        return (
                          <motion.div 
                            key={index} 
                            className="summary-intro-combined"
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.0 + index * 0.05 }}
                          >
                            <div className="health-score-badge">
                              <span className="score-number">{score}</span>
                              <span className="score-label">/100</span>
                            </div>
                            <p>{introText}</p>
                          </motion.div>
                        );
                      } else {
                        // If no intro text found, just show the score as a heading
                        return (
                          <motion.h3 
                            key={index}
                            className="summary-heading"
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.0 + index * 0.05 }}
                          >
                            {cleanParagraph}
                          </motion.h3>
                        );
                      }
                    }
                    
                    // Skip the intro paragraph if it was already combined with health score
                    if (index > 0 && result.executiveSummary.split('\n')[index - 1].includes('Strategic Health Assessment')) {
                      const trimmedPrev = result.executiveSummary.split('\n')[index - 1].trim();
                      if (trimmedPrev.includes('Strategic Health Assessment') && isIntro) {
                        return null;
                      }
                    }
                    
                    if (isBottomLine) {
                      return (
                        <motion.div 
                          key={index} 
                          className="summary-bottom-line"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 1.0 + index * 0.05, type: "spring", stiffness: 100 }}
                          whileHover={{ scale: 1.01 }}
                        >
                          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                            <div className="bottom-line-icon">
                              <Target style={{ width: 24, height: 24, position: 'relative', zIndex: 1 }} />
                            </div>
                            <div className="bottom-line-content">
                              <h4>Bottom Line</h4>
                              <p>{cleanParagraph.replace('Bottom Line:', '').trim()}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    }
                    
                    if (isIntro && cleanParagraph.length > 50) {
                      return (
                        <motion.div 
                          key={index} 
                          className="summary-intro"
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 1.0 + index * 0.05 }}
                        >
                          <p>{cleanParagraph}</p>
                        </motion.div>
                      );
                    }
                    
                    // Regular paragraphs
                    return (
                      <motion.p 
                        key={index} 
                        className="summary-paragraph"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.0 + index * 0.05 }}
                      >
                        {cleanParagraph}
                      </motion.p>
                    );
                  })}
                  </div>
                </motion.div>
              </motion.div>
              )}
            </motion.div>
          )}
          </AnimatePresence>
      </main>
      
      {/* Agent Settings Panel */}
      <AnimatePresence>
        {showAgentSettings && (
          <>
            {/* Backdrop */}
            <motion.div
              className="settings-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAgentSettings(false)}
            />
            
            {/* Settings Panel */}
            <motion.div
              className="settings-panel glass"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <div className="settings-header">
                <div>
                  <h2>Agent Configuration</h2>
                  <p>Customize instructions for each STEVE agent</p>
                </div>
                <motion.button
                  onClick={() => setShowAgentSettings(false)}
                  className="close-button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X style={{ width: 20, height: 20 }} />
                </motion.button>
              </div>
              
              <div className="settings-content">
                <div className="agent-list">
                  {Object.values(agentSettings).map((agent) => (
                    <motion.div
                      key={agent.id}
                      className={`agent-item ${selectedAgent === agent.id ? 'selected' : ''}`}
                      onClick={() => setSelectedAgent(agent.id)}
                      whileHover={{ x: 4 }}
                    >
                      <div className="agent-icon" style={{ color: agent.color }}>
                        {agent.icon}
                      </div>
                      <div className="agent-info">
                        <h4>{agent.name}</h4>
                        <p>{agent.description}</p>
                      </div>
                      <ChevronRight className="agent-arrow" />
                    </motion.div>
                  ))}
                </div>
                
                <div className="agent-details">
                  {selectedAgent && (
                    <>
                      <div className="agent-details-header">
                        <div 
                          className="agent-icon-large"
                          style={{ 
                            backgroundColor: `${agentSettings[selectedAgent].color}20`,
                            color: agentSettings[selectedAgent].color
                          }}
                        >
                          {agentSettings[selectedAgent].icon}
                        </div>
                        <div>
                          <h3>{agentSettings[selectedAgent].name}</h3>
                          <p>{agentSettings[selectedAgent].description}</p>
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="instructions">Instructions</label>
                        <textarea
                          id="instructions"
                          value={agentSettings[selectedAgent].instructions}
                          onChange={(e) => updateAgentSettings(selectedAgent, { instructions: e.target.value })}
                          rows={6}
                          placeholder="Enter custom instructions for this agent..."
                        />
                        <span className="form-hint">These instructions guide how the agent processes tickets</span>
                      </div>
                      
                      <div className="form-group">
                        <label className="toggle-label" style={{ justifyContent: 'flex-start', gap: '1rem' }}>
                          <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Agent Enabled</span>
                          <input
                            type="checkbox"
                            checked={agentSettings[selectedAgent].enabled}
                            onChange={(e) => updateAgentSettings(selectedAgent, { enabled: e.target.checked })}
                          />
                          <span className="toggle-switch" />
                        </label>
                        <span className="form-hint">Disable to skip this agent during analysis</span>
                      </div>
                      
                      <motion.button
                        className="save-button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Save style={{ width: 16, height: 16 }} />
                        <span>Save Configuration</span>
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Chart Tooltip */}
      {chartTooltip.visible && (
        <motion.div
          className={`chart-tooltip ${chartTooltip.persistent ? 'persistent' : ''}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            position: 'fixed',
            left: Math.min(chartTooltip.x, window.innerWidth - 320),
            top: Math.min(chartTooltip.y, window.innerHeight - 400),
            pointerEvents: chartTooltip.persistent ? 'auto' : 'none'
          }}
        >
          <div className="chart-tooltip-header">
            {chartTooltip.title}
            {chartTooltip.persistent && (
              <motion.button
                className="tooltip-close-btn"
                onClick={() => setChartTooltip({ ...chartTooltip, visible: false, persistent: false })}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X style={{ width: 14, height: 14 }} />
              </motion.button>
            )}
          </div>
          <div className="chart-tooltip-tickets">
            {chartTooltip.tickets.map((ticket) => (
              <div key={ticket.key} className="tooltip-ticket">
                <div className="tooltip-ticket-key">{ticket.key}</div>
                <div className="tooltip-ticket-summary">{ticket.summary}</div>
              </div>
            ))}
            {chartTooltip.tickets.length >= 5 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                {chartTooltip.persistent ? 'Showing top 8 tickets' : 'Showing top 5 tickets'}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default App;