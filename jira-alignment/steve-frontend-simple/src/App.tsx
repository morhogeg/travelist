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
  SortDesc,
  Ticket,
  Plus,
  Trash2,
  Rocket,
  Users,
  Heart,
  CheckCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import './App.modern2.css';
import './App.darkmode-refined.css';
import './App.score-colors.css';
import './App.darkmode-final.css';
import './App.setup.css';

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
  quickSuggestion?: {
    action: string;
    text: string;
    type: string;
  };
  strategicComment?: string;
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
  const [expandedInsights, setExpandedInsights] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [showInitialSetup, setShowInitialSetup] = useState(true);
  const [setupStep, setSetupStep] = useState<'welcome' | 'vision' | 'agents' | 'ready'>('welcome');
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
  const [settingsTab, setSettingsTab] = useState<'vision' | 'agents'>('vision');
  const [productVision, setProductVision] = useState<any>(null);
  const [visionFormat, setVisionFormat] = useState<'yaml' | 'markdown'>('yaml');
  const [visionSaved, setVisionSaved] = useState(false);
  const [editingVision, setEditingVision] = useState(false);
  const [editedVision, setEditedVision] = useState<any>(null);
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
    
    // Check if user has completed initial setup
    const hasCompletedSetup = localStorage.getItem('steve-setup-completed');
    const hasAnalysisResult = localStorage.getItem('steve-last-analysis');
    
    if (hasCompletedSetup === 'true' || hasAnalysisResult) {
      setShowInitialSetup(false);
    }
  }, []);

  useEffect(() => {
    const savedSettings = localStorage.getItem('steve-agent-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      // Restore the icons based on agent IDs
      const restoredSettings = Object.entries(parsed).reduce((acc, [key, agent]: [string, any]) => {
        // Map icons back based on agent ID
        const iconMap: { [key: string]: React.ReactNode } = {
          ticketIngestor: <Database className="w-5 h-5" />,
          alignmentEvaluator: <Scale className="w-5 h-5" />,
          rewriteStrategist: <Edit3 className="w-5 h-5" />,
          themeSynthesizer: <Lightbulb className="w-5 h-5" />,
          founderVoice: <MessageSquare className="w-5 h-5" />
        };
        
        acc[key] = {
          ...agent,
          icon: iconMap[key] || <Settings className="w-5 h-5" />
        };
        return acc;
      }, {} as AgentSettings);
      
      setAgentSettings(restoredSettings);
    }
  }, []);

  useEffect(() => {
    // Load vision from API
    const loadVision = async () => {
      try {
        const response = await axios.get(`${API_URL}/vision`);
        console.log('Loaded vision:', response.data);
        setProductVision(response.data.vision);
        setVisionFormat(response.data.format || 'yaml');
      } catch (error) {
        console.error('Failed to load vision:', error);
        // Set default vision structure
        setProductVision({
          principles: [],
          thresholds: {
            core_value: 90,
            strategic_enabler: 60,
            drift: 40
          }
        });
      }
    };
    
    loadVision();
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
      // Create a clean version of agentSettings without React components
      const cleanAgentSettings = Object.entries(agentSettings).reduce((acc, [key, agent]) => {
        acc[key] = {
          id: agent.id,
          name: agent.name,
          description: agent.description,
          instructions: agent.instructions,
          enabled: agent.enabled,
          color: agent.color
          // Exclude icon field
        };
        return acc;
      }, {} as any);
      
      console.log('Sending analyze request with:', {
        mode,
        project: null,
        principles: [],
        agentSettings: cleanAgentSettings
      });
      
      const response = await axios.post(`${API_URL}/analyze`, {
        mode,
        project: null, // Let backend use the project from .env file
        principles: [],
        agentSettings: cleanAgentSettings
      });
      
      setResult(response.data);
      
      // Save that analysis has been completed
      localStorage.setItem('steve-last-analysis', new Date().toISOString());
    } catch (error: any) {
      console.error('Analysis failed:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      let errorMessage = 'Failed to analyze tickets. Please check your configuration and try again.';
      if (error.response?.data?.detail) {
        errorMessage = `Error: ${error.response.data.detail}`;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setResult({
        status: 'error',
        progress: 0,
        tickets: [],
        executiveSummary: '',
        timestamp: new Date().toISOString(),
        error: errorMessage
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const completeSetupAndAnalyze = async () => {
    // Mark setup as completed
    localStorage.setItem('steve-setup-completed', 'true');
    
    // Hide setup screen
    setShowInitialSetup(false);
    
    // Start analysis
    await handleAnalyze();
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
    
    // Create a serializable version without React components
    const settingsToSave = Object.entries(newSettings).reduce((acc, [key, agent]) => {
      acc[key] = {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        instructions: agent.instructions,
        enabled: agent.enabled,
        color: agent.color
        // Omit icon field as it contains React components
      };
      return acc;
    }, {} as any);
    
    try {
      localStorage.setItem('steve-agent-settings', JSON.stringify(settingsToSave));
    } catch (e) {
      console.error('Error saving agent settings:', e);
    }
  };

  const startEditingVision = () => {
    console.log('Starting edit vision, productVision:', productVision);
    if (!productVision) {
      console.error('Product vision is null!');
      return;
    }
    // Ensure productVision has the required structure
    const visionToEdit = {
      principles: productVision.principles || [],
      thresholds: productVision.thresholds || {
        core_value: 90,
        strategic_enabler: 60,
        drift: 40
      }
    };
    setEditingVision(true);
    try {
      setEditedVision(JSON.parse(JSON.stringify(visionToEdit))); // Deep copy
    } catch (e) {
      console.error('Error copying vision:', e);
      // Fallback to simple copy
      setEditedVision({ ...visionToEdit });
    }
  };

  const cancelEditingVision = () => {
    setEditingVision(false);
    setEditedVision(null);
  };

  const saveEditedVision = async () => {
    try {
      console.log('Saving edited vision:', editedVision);
      await axios.post(`${API_URL}/vision`, { 
        vision: editedVision, 
        format: 'yaml' 
      });
      
      setProductVision(editedVision);
      setEditingVision(false);
      setEditedVision(null);
      setVisionSaved(true);
      setTimeout(() => setVisionSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save vision:', error);
      alert('Failed to save vision. Please check the console for details.');
    }
  };

  const updatePrinciple = (index: number, field: string, value: any) => {
    const updated = { ...editedVision };
    updated.principles[index][field] = value;
    setEditedVision(updated);
  };

  const updatePrincipleKeywords = (index: number, value: string) => {
    const updated = { ...editedVision };
    // Only split if it's a string, otherwise keep as is
    if (typeof value === 'string') {
      updated.principles[index].keywords = value.split(',').map((k: string) => k.trim()).filter((k: string) => k);
    }
    setEditedVision(updated);
  };

  const addPrinciple = () => {
    if (!editedVision || !editedVision.principles) {
      console.error('EditedVision or principles is undefined');
      return;
    }
    const updated = { ...editedVision };
    updated.principles = [...updated.principles, {
      name: "New Principle",
      description: "Describe this principle",
      keywords: ["keyword1", "keyword2"],
      weight: 1.0
    }];
    setEditedVision(updated);
  };

  const removePrinciple = (index: number) => {
    if (!editedVision || !editedVision.principles) {
      console.error('EditedVision or principles is undefined');
      return;
    }
    const updated = { ...editedVision };
    updated.principles = updated.principles.filter((_, i) => i !== index);
    setEditedVision(updated);
  };

  const updateThreshold = (key: string, value: number) => {
    const updated = { ...editedVision };
    updated.thresholds[key] = value;
    setEditedVision(updated);
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
          
          {result && (
            <div className="header-nav">
              <a href="#metrics" className="nav-link" onClick={(e) => {
                e.preventDefault();
                document.getElementById('metrics')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                <BarChart3 style={{ width: 16, height: 16 }} />
                <span>Analytics</span>
              </a>
              <a href="#tickets" className="nav-link" onClick={(e) => {
                e.preventDefault();
                document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                <Ticket style={{ width: 16, height: 16 }} />
                <span>Tickets</span>
              </a>
              {result.executiveSummary && (
                <a href="#summary" className="nav-link" onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('summary')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  <FileText style={{ width: 16, height: 16 }} />
                  <span>Summary</span>
                </a>
              )}
            </div>
          )}
          
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
            
            {/* Reset Setup Button - Always visible */}
            <motion.button
              className="reset-setup-button"
              onClick={() => {
                localStorage.removeItem('steve-setup-completed');
                localStorage.removeItem('steve-last-analysis');
                setShowInitialSetup(true);
                setSetupStep('welcome');
                setResult(null);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Reset to initial setup"
            >
              <RefreshCw style={{ width: 16, height: 16 }} />
            </motion.button>
            
            
            {!showInitialSetup && (
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
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <AnimatePresence mode="wait">
          {showInitialSetup && !isAnalyzing && !result && (
            <motion.div
              className="setup-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Welcome Screen */}
              {setupStep === 'welcome' && (
                <motion.div
                  className="setup-welcome"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="setup-card glass">
                    <motion.div
                      className="welcome-icon"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      <Target style={{ width: 80, height: 80 }} />
                    </motion.div>
                    
                    <h1 className="welcome-title">Welcome to STEVE</h1>
                    <p className="welcome-subtitle">Strategic Ticket Evaluation & Vision Enforcer</p>
                    
                    <div className="welcome-features">
                      <motion.div 
                        className="feature-card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="feature-icon">
                          <Shield style={{ width: 24, height: 24 }} />
                        </div>
                        <div className="feature-content">
                          <h3>Define Your Vision</h3>
                          <p>Set strategic principles that guide your team's work</p>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="feature-card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="feature-icon">
                          <Users style={{ width: 24, height: 24 }} />
                        </div>
                        <div className="feature-content">
                          <h3>Configure AI Agents</h3>
                          <p>Customize how STEVE analyzes your tickets</p>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="feature-card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="feature-icon">
                          <BarChart3 style={{ width: 24, height: 24 }} />
                        </div>
                        <div className="feature-content">
                          <h3>Get Strategic Insights</h3>
                          <p>See how your work aligns with what matters most</p>
                        </div>
                      </motion.div>
                    </div>
                    
                    <motion.button
                      className="setup-primary-button"
                      onClick={() => setSetupStep('vision')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>Get Started</span>
                      <ArrowRight style={{ width: 20, height: 20 }} />
                    </motion.button>
                    
                    <button
                      className="skip-setup-button"
                      onClick={() => {
                        setShowInitialSetup(false);
                        localStorage.setItem('steve-setup-completed', 'true');
                      }}
                    >
                      Skip setup and use defaults
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Vision Setup */}
              {setupStep === 'vision' && (
                <motion.div
                  className="setup-vision"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                >
                  <div className="setup-card glass">
                    <div className="setup-header">
                      <h2>Define Your Product Vision</h2>
                      <p>What principles should guide your team's work?</p>
                    </div>
                    
                    <div className="vision-preview">
                      {productVision && productVision.principles?.length > 0 ? (
                        <div className="principles-preview-list">
                          {productVision.principles.map((principle: any, index: number) => (
                            <motion.div
                              key={index}
                              className="principle-preview-card"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className="principle-preview-header">
                                <div className="principle-preview-number">{index + 1}</div>
                                <h4>{principle.name}</h4>
                                <div className="principle-weight-badge">
                                  <Zap style={{ width: 14, height: 14 }} />
                                  <span>{principle.weight}</span>
                                </div>
                              </div>
                              <p className="principle-preview-description">{principle.description}</p>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-principles-message">
                          <AlertCircle style={{ width: 48, height: 48, opacity: 0.3 }} />
                          <p>No principles defined yet. Add your first principle to get started!</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="setup-actions">
                      <motion.button
                        className="setup-secondary-button"
                        onClick={() => {
                          setShowAgentSettings(true);
                          setSettingsTab('vision');
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Edit3 style={{ width: 16, height: 16 }} />
                        <span>Edit Vision</span>
                      </motion.button>
                      
                      <div className="setup-nav-buttons">
                        <button
                          className="setup-back-button"
                          onClick={() => setSetupStep('welcome')}
                        >
                          Back
                        </button>
                        <motion.button
                          className="setup-primary-button"
                          onClick={() => setSetupStep('agents')}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={!productVision || productVision.principles?.length === 0}
                        >
                          <span>Next: Configure Agents</span>
                          <ArrowRight style={{ width: 20, height: 20 }} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Agent Setup */}
              {setupStep === 'agents' && (
                <motion.div
                  className="setup-agents"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                >
                  <div className="setup-card glass">
                    <div className="setup-header">
                      <h2>Configure Your AI Agents</h2>
                      <p>Customize how STEVE analyzes your tickets</p>
                    </div>
                    
                    <div className="agents-preview-grid">
                      {Object.values(agentSettings).map((agent, index) => (
                        <motion.div
                          key={agent.id}
                          className={`agent-preview-card ${!agent.enabled ? 'disabled' : ''}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="agent-preview-header">
                            <div 
                              className="agent-preview-icon"
                              style={{ backgroundColor: `${agent.color}20`, color: agent.color }}
                            >
                              {agent.icon}
                            </div>
                            <div className="agent-preview-status">
                              {agent.enabled ? (
                                <CheckCircle style={{ width: 16, height: 16, color: '#10b981' }} />
                              ) : (
                                <XCircle style={{ width: 16, height: 16, color: '#ef4444' }} />
                              )}
                            </div>
                          </div>
                          <h4>{agent.name}</h4>
                          <p>{agent.description}</p>
                          {agent.instructions && agent.instructions !== agent.description && (
                            <div className="agent-custom-badge">
                              <Sparkles style={{ width: 12, height: 12 }} />
                              <span>Customized</span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="setup-actions">
                      <motion.button
                        className="setup-secondary-button"
                        onClick={() => {
                          setShowAgentSettings(true);
                          setSettingsTab('agents');
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Settings style={{ width: 16, height: 16 }} />
                        <span>Configure Agents</span>
                      </motion.button>
                      
                      <div className="setup-nav-buttons">
                        <button
                          className="setup-back-button"
                          onClick={() => setSetupStep('vision')}
                        >
                          Back
                        </button>
                        <motion.button
                          className="setup-primary-button"
                          onClick={() => setSetupStep('ready')}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span>Next: Review & Launch</span>
                          <ArrowRight style={{ width: 20, height: 20 }} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Ready to Analyze */}
              {setupStep === 'ready' && (
                <motion.div
                  className="setup-ready"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div className="setup-card glass ready-card">
                    <motion.div
                      className="ready-icon"
                      animate={{ 
                        scale: [1, 1.2, 1],
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      <Rocket style={{ width: 64, height: 64 }} />
                    </motion.div>
                    
                    <h2>You're All Set!</h2>
                    <p className="ready-subtitle">STEVE is ready to analyze your tickets</p>
                    
                    <div className="ready-summary">
                      <div className="summary-item">
                        <CheckCircle2 style={{ width: 20, height: 20, color: '#10b981' }} />
                        <span>{productVision?.principles?.length || 0} strategic principles configured</span>
                      </div>
                      <div className="summary-item">
                        <CheckCircle2 style={{ width: 20, height: 20, color: '#10b981' }} />
                        <span>{Object.values(agentSettings).filter(a => a.enabled).length} AI agents ready</span>
                      </div>
                      <div className="summary-item">
                        <CheckCircle2 style={{ width: 20, height: 20, color: '#10b981' }} />
                        <span>Analysis mode: {mode}</span>
                      </div>
                    </div>
                    
                    <motion.button
                      className="launch-analysis-button"
                      onClick={completeSetupAndAnalyze}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Sparkles style={{ width: 20, height: 20 }} />
                      <span>Start Strategic Analysis</span>
                    </motion.button>
                    
                    <button
                      className="setup-back-button"
                      onClick={() => setSetupStep('agents')}
                    >
                      Back to Agent Settings
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
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
              <div id="metrics" className="metrics-grid">
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
              <div id="charts" className="charts-grid">
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
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={getCategoryData(result.tickets)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
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
                id="tickets"
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

                {/* Group tickets by category */}
                {['core_value', 'strategic_enabler', 'drift', 'distraction'].map((category) => {
                  const categoryTickets = filteredTickets.filter(ticket => ticket.category === category);
                  if (categoryTickets.length === 0) return null;
                  
                  return (
                    <div key={category} className="category-section">
                      <div className="category-header">
                        <div className="category-title">
                          {getCategoryIcon(category)}
                          <span>{CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}</span>
                          <span className="category-count">({categoryTickets.length})</span>
                        </div>
                      </div>
                      <div className="tickets-grid">
                        <AnimatePresence mode="popLayout">
                        {categoryTickets.map((ticket, index) => (
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

                      {(ticket.suggestedSummary || ticket.strategicComment || expandedTickets.has(ticket.key)) && (
                        <button
                          className="expand-button chevron-only"
                          onClick={() => toggleTicketExpansion(ticket.key)}
                        >
                          {expandedTickets.has(ticket.key) ? (
                            <ChevronUp style={{ width: 20, height: 20 }} />
                          ) : (
                            <ChevronDown style={{ width: 20, height: 20 }} />
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
                            {ticket.strategicComment && (
                              <div className="strategic-comment-section">
                                <div className="detail-section">
                                  <h4>Current Description</h4>
                                  <p>{ticket.description || 'No description provided'}</p>
                                </div>
                                <div className="strategic-comment-content" dangerouslySetInnerHTML={{ 
                                  __html: ticket.strategicComment.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                                }} />
                              </div>
                            )}
                            
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
                    </div>
                  );
                })}
              </motion.div>

              {/* Executive Summary */}
              {result.executiveSummary && (
                <motion.div
                  id="summary"
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
                        // Numbers for key insights - check if it's under Key Insights and has ticket data
                        const isKeyInsight = currentSection === 'insights';
                        
                        // Extract ticket keys from [[...]] format
                        const ticketMatch = cleanText.match(/\[\[(.*?)\]\]/);
                        const ticketKeys = ticketMatch ? ticketMatch[1].split(', ').filter(key => key.trim()) : [];
                        const displayText = cleanText.replace(/\s*\[\[.*?\]\]\s*/, ''); // Remove [[...]] from display
                        
                        const isExpanded = expandedInsights.has(bulletIndex);
                        
                        return (
                          <div key={index}>
                            <motion.div 
                              className={`summary-bullet-item insight-item ${isKeyInsight && ticketKeys.length > 0 ? 'expandable' : ''}`}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 1.0 + index * 0.05 }}
                              onClick={() => {
                                if (isKeyInsight && ticketKeys.length > 0) {
                                  const newExpanded = new Set(expandedInsights);
                                  if (newExpanded.has(bulletIndex)) {
                                    newExpanded.delete(bulletIndex);
                                  } else {
                                    newExpanded.add(bulletIndex);
                                  }
                                  setExpandedInsights(newExpanded);
                                }
                              }}
                              style={{ cursor: isKeyInsight && ticketKeys.length > 0 ? 'pointer' : 'default' }}
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
                              <span className="bullet-text">{displayText}</span>
                              {isKeyInsight && ticketKeys.length > 0 && (
                                <ChevronDown 
                                  className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
                                  style={{ 
                                    width: 16, 
                                    height: 16, 
                                    marginLeft: 'auto',
                                    transition: 'transform 0.2s',
                                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                                  }} 
                                />
                              )}
                            </motion.div>
                            <AnimatePresence>
                              {isExpanded && ticketKeys.length > 0 && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="ticket-keys-container"
                                  style={{ 
                                    marginLeft: '2.5rem',
                                    marginTop: '0.5rem',
                                    marginBottom: '0.5rem',
                                    overflow: 'hidden'
                                  }}
                                >
                                  <div className="ticket-keys-list" style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '0.5rem',
                                    padding: '0.5rem',
                                    background: 'var(--surface-secondary)',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--border-color)'
                                  }}>
                                    {ticketKeys.map((key, keyIndex) => (
                                      <span 
                                        key={keyIndex}
                                        className="ticket-key-badge"
                                        style={{
                                          padding: '0.25rem 0.75rem',
                                          background: 'var(--primary-color)',
                                          color: 'white',
                                          borderRadius: '1rem',
                                          fontSize: '0.75rem',
                                          fontWeight: '500',
                                          fontFamily: 'monospace'
                                        }}
                                      >
                                        {key}
                                      </span>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
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
                  <h2>STEVE Configuration</h2>
                  <p>Configure product vision and agent instructions</p>
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
              
              <div className="settings-tabs">
                <motion.button
                  className={`settings-tab ${settingsTab === 'vision' ? 'active' : ''}`}
                  onClick={() => setSettingsTab('vision')}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Target style={{ width: 16, height: 16 }} />
                  <span>Product Vision</span>
                </motion.button>
                <motion.button
                  className={`settings-tab ${settingsTab === 'agents' ? 'active' : ''}`}
                  onClick={() => setSettingsTab('agents')}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Settings style={{ width: 16, height: 16 }} />
                  <span>Agent Instructions</span>
                </motion.button>
              </div>
              
              <div className={`settings-content ${settingsTab === 'agents' ? 'agents-view' : ''}`}>
                {(() => {
                  console.log('Render check - settingsTab:', settingsTab, 'productVision:', productVision, 'editingVision:', editingVision, 'editedVision:', editedVision);
                  return null;
                })()}
                {settingsTab === 'vision' && productVision ? (
                  editingVision && editedVision ? (
                    // Edit Mode
                    <div className="vision-editor edit-mode">
                      <div className="edit-header">
                        <h3>Edit Product Vision</h3>
                        <div className="edit-actions">
                          <motion.button
                            className="cancel-button"
                            onClick={cancelEditingVision}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <X style={{ width: 16, height: 16 }} />
                            <span>Cancel</span>
                          </motion.button>
                          <motion.button
                            className="save-button"
                            onClick={saveEditedVision}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {visionSaved ? (
                              <>
                                <Check style={{ width: 16, height: 16 }} />
                                <span>Saved!</span>
                              </>
                            ) : (
                              <>
                                <Save style={{ width: 16, height: 16 }} />
                                <span>Save Changes</span>
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>

                      <div className="edit-content">
                        <div className="edit-section">
                          <div className="section-header">
                            <h4>Principles</h4>
                            <motion.button
                              className="add-button"
                              onClick={addPrinciple}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Plus style={{ width: 16, height: 16 }} />
                              <span>Add Principle</span>
                            </motion.button>
                          </div>

                          {editedVision.principles?.map((principle: any, index: number) => (
                            <div key={index} className="edit-principle-card">
                              <div className="principle-number">{index + 1}</div>
                              <div className="edit-fields">
                                <input
                                  type="text"
                                  value={principle.name}
                                  onChange={(e) => updatePrinciple(index, 'name', e.target.value)}
                                  placeholder="Principle Name"
                                  className="principle-input"
                                />
                                <textarea
                                  value={principle.description}
                                  onChange={(e) => updatePrinciple(index, 'description', e.target.value)}
                                  placeholder="Description"
                                  className="principle-textarea"
                                  rows={2}
                                />
                                <input
                                  type="text"
                                  value={typeof principle.keywords === 'string' ? principle.keywords : principle.keywords?.join(', ')}
                                  onChange={(e) => updatePrinciple(index, 'keywords', e.target.value)}
                                  onBlur={(e) => updatePrincipleKeywords(index, e.target.value)}
                                  placeholder="Keywords (comma separated)"
                                  className="principle-input"
                                />
                                <div className="weight-input-group">
                                  <label>Weight:</label>
                                  <input
                                    type="number"
                                    value={principle.weight}
                                    onChange={(e) => updatePrinciple(index, 'weight', parseFloat(e.target.value))}
                                    step="0.1"
                                    min="0"
                                    max="2"
                                    className="weight-input"
                                  />
                                </div>
                              </div>
                              <motion.button
                                className="remove-button"
                                onClick={() => removePrinciple(index)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Trash2 style={{ width: 16, height: 16 }} />
                              </motion.button>
                            </div>
                          ))}
                        </div>

                        <div className="edit-section">
                          <h4>Alignment Thresholds</h4>
                          <div className="thresholds-edit">
                            <div className="threshold-input-group">
                              <label>Core Value:</label>
                              <input
                                type="number"
                                value={editedVision.thresholds?.core_value || 90}
                                onChange={(e) => updateThreshold('core_value', parseInt(e.target.value))}
                                min="0"
                                max="100"
                                className="threshold-input"
                              />
                            </div>
                            <div className="threshold-input-group">
                              <label>Strategic Enabler:</label>
                              <input
                                type="number"
                                value={editedVision.thresholds?.strategic_enabler || 60}
                                onChange={(e) => updateThreshold('strategic_enabler', parseInt(e.target.value))}
                                min="0"
                                max="100"
                                className="threshold-input"
                              />
                            </div>
                            <div className="threshold-input-group">
                              <label>Drift:</label>
                              <input
                                type="number"
                                value={editedVision.thresholds?.drift || 40}
                                onChange={(e) => updateThreshold('drift', parseInt(e.target.value))}
                                min="0"
                                max="100"
                                className="threshold-input"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                  <div className="vision-editor">
                    <div className="vision-header">
                      <h3>Product Vision & Strategic Principles</h3>
                      <p className="vision-subtitle">These principles guide how STEVE analyzes and categorizes your tickets</p>
                    </div>
                    
                    <div className="principles-list">
                      {productVision.principles?.map((principle: any, index: number) => (
                        <motion.div
                          key={index}
                          className="principle-card"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="principle-header">
                            <div className="principle-number">{index + 1}</div>
                            <div className="principle-content">
                              <h4>{principle.name}</h4>
                              <p>{principle.description}</p>
                            </div>
                            <div className="principle-weight">
                              <span className="weight-label">Weight</span>
                              <span className="weight-value">{principle.weight}</span>
                            </div>
                          </div>
                          
                          <div className="principle-keywords">
                            <span className="keywords-label">Keywords:</span>
                            <div className="keywords-list">
                              {(Array.isArray(principle.keywords) ? principle.keywords : []).map((keyword: string, kidx: number) => (
                                <span key={kidx} className="keyword-tag">{keyword}</span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="thresholds-section">
                      <h4>Alignment Thresholds</h4>
                      <div className="thresholds-grid">
                        <div className="threshold-item">
                          <div className="threshold-label">Core Value</div>
                          <div className="threshold-value">{productVision.thresholds?.core_value || 90}+</div>
                        </div>
                        <div className="threshold-item">
                          <div className="threshold-label">Strategic Enabler</div>
                          <div className="threshold-value">{productVision.thresholds?.strategic_enabler || 60}+</div>
                        </div>
                        <div className="threshold-item">
                          <div className="threshold-label">Drift</div>
                          <div className="threshold-value">{productVision.thresholds?.drift || 40}+</div>
                        </div>
                      </div>
                    </div>
                    
                    <motion.button
                      className="edit-vision-button"
                      onClick={startEditingVision}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Edit3 style={{ width: 16, height: 16 }} />
                      <span>Edit Vision</span>
                    </motion.button>
                  </div>
                  )
                ) : (
                  <>
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
                  </>
                )}
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