import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  TrendingUp, 
  User, 
  AlertTriangle, 
  Mail, 
  Send, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  EyeOff, 
  BookOpen, 
  RefreshCw, 
  Layers, 
  Info, 
  Check, 
  FileText, 
  Building,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { ProfileType, GroupType, Reservation, ActionLog } from './types';
import { MOCK_RESERVATIONS } from './data';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white px-2.5 py-1.5 rounded-lg border border-slate-850 shadow-md text-[10px] font-sans">
        <p className="font-semibold text-slate-400">{label}</p>
        <p className="font-bold mt-0.5 text-xs text-white">
          Risco: <span className="text-indigo-300">{payload[0].value}%</span>
        </p>
      </div>
    );
  }
  return null;
};

const getRiskColorHex = (level: string) => {
  switch (level) {
    case 'ALTO':
      return '#ef4444';
    case 'MÉDIO':
      return '#f59e0b';
    default:
      return '#10b981';
  }
};

export default function App() {
  // Profiles and experimental groups state
  const [activeProfile, setActiveProfile] = useState<ProfileType>('REVENUE_MANAGER');
  const [activeGroup, setActiveGroup] = useState<GroupType>('TEST');
  const [selectedResId, setSelectedResId] = useState<string>('RES-84920');
  
  // Custom states for simulations
  const [logs, setLogs] = useState<ActionLog[]>([
    {
      id: "LOG-101",
      timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      profile: "REVENUE_MANAGER",
      group: "TEST",
      reservationId: "RES-71044",
      guestName: "Carlos Eduardo",
      actionTaken: "Ajuste Tarifário Preventivo",
      details: "Monitoramento de concorrência ativado para canais OTA."
    },
    {
      id: "LOG-102",
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      profile: "CRM_AGENT",
      group: "TEST",
      reservationId: "RES-20419",
      guestName: "Mariana Silva",
      actionTaken: "Confirmação de Mimos",
      details: "Pedidos especiais (berço e andar alto) confirmados via e-mail automático."
    }
  ]);

  // Current active reservation object
  const currentRes = MOCK_RESERVATIONS.find(r => r.id === selectedResId) || MOCK_RESERVATIONS[0];

  // Feedback states
  const [overbookingRooms, setOverbookingRooms] = useState<number>(1);
  const [crmMessageText, setCrmMessageText] = useState<string>("");
  const [crmSubject, setCrmSubject] = useState<string>("");
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  
  // Track actions per reservation in this session to display "authorized" tags
  const [authorizedOverbookings, setAuthorizedOverbookings] = useState<Record<string, number>>({});
  const [sentCrmEmails, setSentCrmEmails] = useState<Record<string, string>>({});
  const [confirmedReservations, setConfirmedReservations] = useState<Record<string, boolean>>({});

  // Synchronize email form state when active reservation changes
  useEffect(() => {
    setCrmMessageText(currentRes.crmTemplate.body);
    setCrmSubject(currentRes.crmTemplate.subject);
  }, [selectedResId]);

  // Trigger brief alert messages
  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // 1. Autorizar Overbooking Preventivo (Revenue Manager)
  const handleAuthorizeOverbooking = () => {
    const logId = `LOG-${Math.floor(100 + Math.random() * 900)}`;
    const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // Save state
    setAuthorizedOverbookings(prev => ({
      ...prev,
      [currentRes.id]: overbookingRooms
    }));

    // Add log
    const newLog: ActionLog = {
      id: logId,
      timestamp: nowStr,
      profile: 'REVENUE_MANAGER',
      group: activeGroup,
      reservationId: currentRes.id,
      guestName: currentRes.guestName,
      actionTaken: "Autorizar Overbooking Preventivo",
      details: `Autorizado overbooking de +${overbookingRooms} quarto(s) na categoria correspondente. Risco mitigado.`
    };
    
    setLogs(prev => [newLog, ...prev]);
    showToast(`Overbooking de +${overbookingRooms} quarto(s) autorizado com sucesso para a reserva de ${currentRes.guestName}!`, 'success');
  };

  // 2. Disparar Régua de Engajamento via CRM (CRM Agent)
  const handleSendCrmEmail = () => {
    const logId = `LOG-${Math.floor(100 + Math.random() * 900)}`;
    const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Save state
    setSentCrmEmails(prev => ({
      ...prev,
      [currentRes.id]: crmMessageText
    }));

    // Add log
    const newLog: ActionLog = {
      id: logId,
      timestamp: nowStr,
      profile: 'CRM_AGENT',
      group: activeGroup,
      reservationId: currentRes.id,
      guestName: currentRes.guestName,
      actionTaken: "Régua CRM Disparada",
      details: `E-mail de relacionamento enviado com assunto: "${crmSubject}".`
    };

    setLogs(prev => [newLog, ...prev]);
    showToast(`Régua de relacionamento disparada com sucesso para ${currentRes.guestName}!`, 'success');
  };

  // 3. Confirmar Reserva Standard (Control Group / Shadow Mode)
  const handleConfirmStandard = () => {
    const logId = `LOG-${Math.floor(100 + Math.random() * 900)}`;
    const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Save state
    setConfirmedReservations(prev => ({
      ...prev,
      [currentRes.id]: true
    }));

    // Add log
    const newLog: ActionLog = {
      id: logId,
      timestamp: nowStr,
      profile: activeProfile,
      group: 'CONTROL',
      reservationId: currentRes.id,
      guestName: currentRes.guestName,
      actionTaken: "Confirmação Standard Executada",
      details: `Reserva confirmada administrativamente via fluxo padrão (IA em Shadow Mode).`
    };

    setLogs(prev => [newLog, ...prev]);
    showToast(`Confirmação padrão registrada para a reserva de ${currentRes.guestName}.`, 'info');
  };

  // Reset current reservation simulated changes
  const handleResetCurrentResSim = () => {
    setAuthorizedOverbookings(prev => {
      const copy = { ...prev };
      delete copy[currentRes.id];
      return copy;
    });
    setSentCrmEmails(prev => {
      const copy = { ...prev };
      delete copy[currentRes.id];
      return copy;
    });
    setConfirmedReservations(prev => {
      const copy = { ...prev };
      delete copy[currentRes.id];
      return copy;
    });
    setCrmMessageText(currentRes.crmTemplate.body);
    setCrmSubject(currentRes.crmTemplate.subject);
    showToast(`Simulação limpa para a reserva ${currentRes.id}.`, 'info');
  };

  // Format currency
  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Risk coloring utility
  const getRiskColors = (level: string) => {
    switch (level) {
      case 'ALTO':
        return {
          border: 'border-l-red-500',
          text: 'text-red-600',
          bg: 'bg-red-50',
          ring: 'border-red-100',
          badge: 'bg-red-50 text-red-700 border-red-200/50'
        };
      case 'MÉDIO':
        return {
          border: 'border-l-amber-500',
          text: 'text-amber-600',
          bg: 'bg-amber-50',
          ring: 'border-amber-100',
          badge: 'bg-amber-50 text-amber-700 border-amber-200/50'
        };
      default:
        return {
          border: 'border-l-emerald-500',
          text: 'text-emerald-600',
          bg: 'bg-emerald-50',
          ring: 'border-emerald-100',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
        };
    }
  };

  const riskStyles = getRiskColors(currentRes.riskLevel);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Dynamic Toast System */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 backdrop-blur-md ${
              toast.type === 'success' 
                ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900' 
                : toast.type === 'warning'
                ? 'bg-amber-50/95 border-amber-200 text-amber-900'
                : 'bg-slate-900/95 border-slate-800 text-slate-100'
            }`}>
              <div className="mt-0.5">
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-600" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{toast.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Sleek Top Navigation Bar */}
        <nav id="app-nav" className="bg-white border border-slate-200 px-6 py-4 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 shadow-sm">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/25 shrink-0">
              <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-slate-800 font-display">
                  SmartCancel <span className="text-indigo-600">Shield</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md">
                  V1.4 PROTOTYPE
                </span>
              </div>
              <p className="text-xs text-slate-400">Decisões de Risco & Explicabilidade de IA para Hotelaria</p>
            </div>
          </div>

          {/* Profile Switcher (Requirement 1) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start lg:self-auto border border-slate-200/50">
            <button
              onClick={() => {
                setActiveProfile('REVENUE_MANAGER');
                showToast('Perfil alterado para: Analista de Revenue Management', 'info');
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeProfile === 'REVENUE_MANAGER'
                  ? 'bg-white shadow-sm text-indigo-600 font-bold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Revenue Manager
            </button>
            <button
              onClick={() => {
                setActiveProfile('CRM_AGENT');
                showToast('Perfil alterado para: Atendente de Reservas / CRM', 'info');
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeProfile === 'CRM_AGENT'
                  ? 'bg-white shadow-sm text-indigo-600 font-bold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Atendente CRM
            </button>
          </div>

          {/* Experiment Scenario Picker (Requirement 2) */}
          <div className="flex items-center gap-3 self-start lg:self-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Modo de Experimento:</span>
            <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-slate-50 p-0.5 shadow-sm">
              <button
                onClick={() => {
                  setActiveGroup('CONTROL');
                  showToast('Cenário de experimento: Grupo Controle (IA em Shadow Mode)', 'warning');
                }}
                className={`px-3 py-1.5 text-xs font-bold transition-all rounded-md ${
                  activeGroup === 'CONTROL'
                    ? 'bg-slate-200 text-slate-700 shadow-inner'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                CONTROLE (Shadow)
              </button>
              <button
                onClick={() => {
                  setActiveGroup('TEST');
                  showToast('Cenário de experimento: Grupo Teste (Exposição Ativa da IA)', 'success');
                }}
                className={`px-3 py-1.5 text-xs font-bold transition-all rounded-md ${
                  activeGroup === 'TEST'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                TESTE (Ativo)
              </button>
            </div>
          </div>
        </nav>

        {/* Dynamic Warning Notification / Selector of Reservations (Requirement 3) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono font-bold text-xs uppercase">
              RESERVA ATIVA
            </span>
            <span className="text-xs text-slate-500 font-medium">Troque de cadastro para ver diferentes cenários e severidades de risco de cancelamento:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {MOCK_RESERVATIONS.map(res => (
              <button
                key={res.id}
                onClick={() => {
                  setSelectedResId(res.id);
                  showToast(`Visualizando dados de: ${res.guestName}`, 'info');
                }}
                className={`px-3.5 py-1.5 rounded-xl border text-xs transition-all flex items-center gap-2 ${
                  selectedResId === res.id
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{res.guestName}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  res.riskLevel === 'ALTO' ? 'bg-red-50 text-red-600' : res.riskLevel === 'MÉDIO' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {res.riskScore}%
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* MAIN BODY GRID */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE: Reservation Details (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Card: Reservation Details (Requirement 3) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Ficha de Detalhes da Reserva</h2>
                </div>
                <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-lg font-bold font-mono border border-indigo-100">
                  #{currentRes.id}
                </span>
              </div>

              <div className="space-y-5">
                {/* Guest Profile and PMS State */}
                <div className="pb-4 border-b border-slate-100 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold font-display text-lg shadow-inner shrink-0">
                    {currentRes.guestName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 font-mono">Hóspede Titular</span>
                    <h3 className="text-lg font-bold text-slate-800 leading-tight">{currentRes.guestName}</h3>
                    <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      Status no PMS: <span className="text-emerald-600 font-bold">Garantida</span>
                    </span>
                  </div>
                </div>

                {/* Reservation grid values */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Lead Time</p>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{currentRes.leadTime} dias</p>
                    <span className="text-[10px] text-slate-400 leading-normal block">Antecedência da reserva</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Canal de Venda</p>
                    <p className="font-bold text-slate-800 text-sm mt-0.5 truncate" title={currentRes.channel}>
                      {currentRes.channel}
                    </p>
                    <span className="text-[10px] text-slate-400 leading-normal block">Canal de aquisição</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Tipo de Tarifa</p>
                    <p className="font-bold text-slate-800 text-sm mt-0.5 truncate">
                      {currentRes.rateType}
                    </p>
                    <span className="text-[10px] text-slate-400 leading-normal block">Política padrão</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Valor Total</p>
                    <p className="font-extrabold text-indigo-600 text-base mt-0.5">{formatBRL(currentRes.totalValue)}</p>
                    <span className="text-[10px] text-slate-400 leading-normal block">Receita prevista</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    Pedidos Especiais: <span className="text-slate-800 font-bold">{currentRes.specialRequests} solicitados</span>
                  </p>
                  {currentRes.specialRequests === 0 ? (
                    <p className="text-xs text-slate-400 italic mt-1">Nenhum pedido especial registrado para este hóspede.</p>
                  ) : (
                    <p className="text-xs text-slate-400 italic mt-1">Mimos e preferências adicionadas para aumentar engajamento.</p>
                  )}
                </div>

                {/* Line Chart: Risk History over the past 30 days */}
                <div className="pt-4 border-t border-slate-100" id="risk-score-history-chart">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      Histórico do Risco de Cancelamento
                    </p>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-mono font-bold">
                      Últimos 30 dias
                    </span>
                  </div>
                  
                  {currentRes.riskHistory && (
                    <div className="h-36 w-full" id="risk-chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={currentRes.riskHistory}
                          margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis 
                            dataKey="day" 
                            stroke="#94a3b8" 
                            fontSize={9} 
                            tickLine={false} 
                            axisLine={false}
                            interval={6}
                          />
                          <YAxis 
                            stroke="#94a3b8" 
                            fontSize={9} 
                            tickLine={false} 
                            axisLine={false}
                            domain={[0, 100]}
                            tickFormatter={(tick) => `${tick}%`}
                          />
                          <Tooltip 
                            content={<CustomTooltip />}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="score" 
                            stroke={getRiskColorHex(currentRes.riskLevel)} 
                            strokeWidth={2.5} 
                            dot={{ r: 2, strokeWidth: 1 }}
                            activeDot={{ r: 5, strokeWidth: 1 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-2.5 px-1">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                      <span>Média: <strong>{Math.round(currentRes.riskHistory ? currentRes.riskHistory.reduce((sum, item) => sum + item.score, 0) / currentRes.riskHistory.length : 0)}%</strong></span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <span>Tendência:</span>
                      <span className={`font-bold ${
                        currentRes.riskLevel === 'ALTO' ? 'text-red-600' : currentRes.riskLevel === 'MÉDIO' ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {currentRes.riskLevel === 'ALTO' ? 'Alta Recente ↗' : currentRes.riskLevel === 'MÉDIO' ? 'Flutuante ↔' : 'Queda Estável ↘'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Simulation actions feedback tags inside details */}
                {(confirmedReservations[currentRes.id] || authorizedOverbookings[currentRes.id] || sentCrmEmails[currentRes.id]) && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Decisões Registradas na Simulação:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {confirmedReservations[currentRes.id] && (
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-semibold">
                          Confirmada Standard
                        </span>
                      )}
                      {authorizedOverbookings[currentRes.id] && (
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-semibold">
                          Overbooking Preventivo (+{authorizedOverbookings[currentRes.id]})
                        </span>
                      )}
                      {sentCrmEmails[currentRes.id] && (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-semibold">
                          Régua CRM Disparada
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleResetCurrentResSim}
                      className="w-full mt-2 py-1 px-2.5 bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 rounded-lg text-[11px] transition-colors flex items-center justify-center gap-1 font-medium"
                    >
                      <RefreshCw className="w-3 h-3 text-slate-400" />
                      Limpar Decisões desta Reserva
                    </button>
                  </div>
                )}

              </div>
            </div>

            {/* Sleek Dark Status Card from the Design HTML */}
            <div className="bg-slate-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-xl pointer-events-none"></div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Monitoramento do Sistema</h3>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></div>
                <p className="text-sm font-semibold tracking-wide text-white">Análise Preditiva em Tempo Real</p>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                A IA do SmartCancel analisou 452 eventos de cancelamento similares na última hora para recalibrar o modelo preditivo para a data correspondente.
              </p>
            </div>

          </div>

          {/* RIGHT SIDE: Dynamic Experiment Panel (7 cols) */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              
              {activeGroup === 'CONTROL' ? (
                
                /* ==================== CONTROL GROUP: IA IN SHADOW MODE (Requirement 2) ==================== */
                <motion.div
                  key="control-panel"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[480px]"
                >
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6 border border-slate-200">
                    <EyeOff className="w-8 h-8 text-slate-400" />
                  </div>
                  
                  <span className="bg-amber-50 text-amber-700 border border-amber-200/50 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider mb-3">
                    Grupo Controle: IA em Shadow Mode
                  </span>
                  
                  <h2 className="text-2xl font-bold text-slate-800 mb-2 font-display">Operação Padrão</h2>
                  
                  <p className="text-slate-500 max-w-md mb-8 text-sm leading-relaxed">
                    A reserva segue o fluxo convencional de processamento. A inteligência preditiva está operando em modo sombra para análise comparativa retrospectiva. Fatores explicativos e scores estão ocultos.
                  </p>

                  <div className="w-full max-w-md bg-slate-50 p-4 rounded-xl border border-slate-100 text-left mb-6">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Ação Padrão PMS:</span>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Nenhuma ação de mitigação ativa de riscos está disponível. Execute a confirmação standard do cadastro.
                    </p>
                  </div>

                  {confirmedReservations[currentRes.id] ? (
                    <div className="w-full max-w-md py-3.5 px-6 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-500" />
                      Reserva Confirmada Administrativamente
                    </div>
                  ) : (
                    <button
                      onClick={handleConfirmStandard}
                      className="w-full max-w-md py-3.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all text-sm shadow flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Confirmar Processamento Standard
                    </button>
                  )}
                </motion.div>

              ) : (

                /* ==================== TEST GROUP: IA ACTIVE EXPOSURE (Requirement 2) ==================== */
                <motion.div
                  key="test-panel"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  
                  {/* Layer 1: Explicabilidade da IA (XAI) (Requirement 4) */}
                  <div className={`bg-white rounded-2xl border-l-4 ${riskStyles.border} border border-slate-200 p-6 shadow-md relative`}>
                    
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        
                        {/* Circular Score display matching design */}
                        <div className={`w-16 h-16 rounded-full border-4 ${riskStyles.ring} ${riskStyles.bg} flex items-center justify-center shrink-0`}>
                          <span className={`text-xl font-black ${riskStyles.text}`}>{currentRes.riskScore}%</span>
                        </div>
                        
                        <div>
                          <h2 className="text-lg font-bold text-slate-900 font-display">
                            {currentRes.riskLevel === 'ALTO' ? 'Alto Risco de Cancelamento' : currentRes.riskLevel === 'MÉDIO' ? 'Risco Médio de Cancelamento' : 'Baixo Risco de Cancelamento'}
                          </h2>
                          <p className={`text-xs font-bold uppercase tracking-wider ${riskStyles.text}`}>
                            Ação Recomendada {currentRes.riskLevel === 'ALTO' ? 'Crítica Imediata' : 'de Monitoramento'}
                          </p>
                        </div>

                      </div>

                      {/* Level Badge */}
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-extrabold border ${riskStyles.badge}`}>
                        PRIORIDADE {currentRes.riskLevel === 'ALTO' ? 'CRÍTICA' : currentRes.riskLevel === 'MÉDIO' ? 'MÉDIA' : 'BAIXA'}
                      </span>
                    </div>

                    {/* Explicabilidade Fatores (XAI) */}
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-indigo-600" />
                        Explicabilidade da IA (XAI) — Fatores de Atribuição
                      </h3>
                      
                      <ul className="space-y-4">
                        {currentRes.reasons.map((reason, idx) => (
                          <li key={idx} className="flex gap-3 text-sm items-start">
                            <span className="text-indigo-500 font-mono font-bold">0{idx + 1}.</span>
                            <div>
                              <p className="text-slate-700 leading-normal font-medium">{reason}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {idx === 0 && "Fator temporal correlacionado com flutuações sazonais de no-show corporativos."}
                                {idx === 1 && "Sensibilidade da agência parceira conforme histórico analítico de drop-off."}
                                {idx === 2 && "Ausência de sinalização ativa ou interações que caracterizam o engajamento do hóspede."}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  {/* Layer 2: Painel de Decisão Dinâmico "Human-In-The-Loop" (Requirement 5) */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    
                    {/* Header */}
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-600" />
                        <h3 className="font-display font-semibold text-slate-850 text-sm tracking-wide">
                          Ações Decisórias Ativas (Human-In-The-Loop)
                        </h3>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">
                        {activeProfile === 'REVENUE_MANAGER' ? 'Revenue Admin View' : 'CRM Agent View'}
                      </span>
                    </div>

                    <div className="p-6">
                      <AnimatePresence mode="wait">
                        {activeProfile === 'REVENUE_MANAGER' ? (
                          
                          /* ==================== REVENUE MANAGEMENT PROFILE ==================== */
                          <motion.div
                            key="revenue-action-box"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                          >
                            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
                              <p className="text-indigo-950 text-xs sm:text-sm leading-relaxed">
                                <strong>Recomendação de Revenue Management:</strong> A probabilidade de perda é de {currentRes.riskScore}%. Recomendamos autorizar o overbooking preventivo para garantir a ocupação total da categoria de inventário no dia correspondente.
                              </p>
                            </div>

                            {/* Overbooking Selector Widget */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500 font-medium">Quartos autorizados para compensação de risco:</span>
                                <span className="text-xs font-bold text-indigo-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                                  +{overbookingRooms} quarto(s)
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <input
                                  type="range"
                                  min="1"
                                  max="4"
                                  value={overbookingRooms}
                                  onChange={(e) => setOverbookingRooms(parseInt(e.target.value))}
                                  className="flex-1 accent-indigo-600 bg-slate-200 h-2 rounded-lg cursor-pointer"
                                />
                                <div className="flex gap-1.5 shrink-0">
                                  {[1, 2, 3, 4].map(n => (
                                    <button
                                      key={n}
                                      onClick={() => setOverbookingRooms(n)}
                                      className={`px-2 py-1 text-xs font-bold rounded ${
                                        overbookingRooms === n
                                          ? 'bg-indigo-600 text-white'
                                          : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-800'
                                      }`}
                                    >
                                      +{n}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Action Submission */}
                            {authorizedOverbookings[currentRes.id] ? (
                              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                  <span>Overbooking preventivo de +{authorizedOverbookings[currentRes.id]} quarto(s) registrado no PMS!</span>
                                </div>
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200/50 px-2 py-0.5 rounded-md uppercase font-bold">
                                  Sucesso
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={handleAuthorizeOverbooking}
                                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all text-sm flex items-center justify-center gap-2"
                              >
                                <TrendingUp className="w-4 h-4" />
                                [Autorizar Overbooking Preventivo (+{overbookingRooms})]
                              </button>
                            )}

                          </motion.div>

                        ) : (

                          /* ==================== CRM ATENDENTE PROFILE ==================== */
                          <motion.div
                            key="crm-action-box"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                          >
                            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                              <p className="text-emerald-900 text-xs sm:text-sm leading-relaxed">
                                <strong>Recomendação de CRM/Atendimentos:</strong> Hóspede com baixa atividade pré-estadia. Envie uma oferta personalizada de relacionamento (régua de engajamento) para obter confirmação ativa ou aumentar as penalidades de desistência via upgrades.
                              </p>
                            </div>

                            {/* Simulated Mail Editor */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                              <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs font-mono text-slate-500">
                                <div className="flex items-center gap-1.5">
                                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Minuta de Relacionamento (Visualização CRM)</span>
                                </div>
                                <span className="bg-white border border-slate-200 text-slate-500 text-[10px] font-bold px-1.5 py-0.2 rounded">
                                  Envio Imediato
                                </span>
                              </div>

                              <div className="p-4 space-y-2.5">
                                <div className="grid grid-cols-12 gap-1 text-xs border-b border-slate-200 pb-2">
                                  <div className="col-span-2 text-slate-400 font-mono">Para:</div>
                                  <div className="col-span-10 text-slate-700 font-semibold truncate">
                                    {currentRes.guestName.toLowerCase().replace(/\s+/g, '.')}@agenciab2b.com.br
                                  </div>
                                  <div className="col-span-2 text-slate-400 font-mono">Assunto:</div>
                                  <div className="col-span-10">
                                    <input 
                                      type="text"
                                      value={crmSubject}
                                      onChange={(e) => setCrmSubject(e.target.value)}
                                      className="w-full bg-transparent border-none text-slate-800 outline-none p-0 focus:ring-0 font-semibold text-xs"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <span className="text-[10px] text-slate-400 font-mono block mb-1">Conteúdo do E-mail / Mensagem:</span>
                                  <textarea
                                    value={crmMessageText}
                                    onChange={(e) => setCrmMessageText(e.target.value)}
                                    rows={6}
                                    className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-700 text-xs leading-relaxed focus:outline-none focus:border-indigo-500/50 resize-none font-sans"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Action Submit */}
                            {sentCrmEmails[currentRes.id] ? (
                              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold space-y-2">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                  <span>Régua de relacionamento disparada com sucesso!</span>
                                </div>
                                <p className="text-xs text-slate-500 italic bg-white p-2 rounded-lg border border-slate-200/60 max-h-24 overflow-y-auto">
                                  {sentCrmEmails[currentRes.id]}
                                </p>
                              </div>
                            ) : (
                              <button
                                onClick={handleSendCrmEmail}
                                className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all text-sm flex items-center justify-center gap-2"
                              >
                                <Send className="w-4 h-4" />
                                [Disparar Régua de Engajamento via CRM]
                              </button>
                            )}

                          </motion.div>

                        )}
                      </AnimatePresence>
                    </div>

                  </div>

                </motion.div>

              )}

            </AnimatePresence>
          </div>

        </main>

        {/* LOG HISTORY: Simulated audit trail and decision log */}
        <section id="logs-history" className="mt-12 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h3 className="font-display font-semibold text-slate-800 tracking-wide">
                Log de Decisões Executadas (Simulação de Auditoria)
              </h3>
            </div>
            
            <button
              onClick={() => {
                setLogs([
                  {
                    id: "LOG-101",
                    timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    profile: "REVENUE_MANAGER",
                    group: "TEST",
                    reservationId: "RES-71044",
                    guestName: "Carlos Eduardo",
                    actionTaken: "Ajuste Tarifário Preventivo",
                    details: "Monitoramento de concorrência ativado para canais OTA."
                  }
                ]);
                showToast("Histórico de auditoria reiniciado.", 'info');
              }}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1.5 font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              Limpar Auditoria
            </button>
          </div>

          <div className="p-6">
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Esta trilha de auditoria simula a gravação de decisões do operador humano ("Human-In-The-Loop"). Ela registra quais contatos ou contramedidas foram tomadas, servindo de base histórica para mensuração de ROI e calibração de modelos de aprendizado de máquina.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-mono font-medium">
                    <th className="pb-3 pr-2 font-semibold">LOG ID</th>
                    <th className="pb-3 px-2 font-semibold">HORÁRIO</th>
                    <th className="pb-3 px-2 font-semibold">PERFIL</th>
                    <th className="pb-3 px-2 font-semibold">GRUPO EXP.</th>
                    <th className="pb-3 px-2 font-semibold">RESERVA (HÓSPEDE)</th>
                    <th className="pb-3 px-2 font-semibold">DECISÃO / AÇÃO</th>
                    <th className="pb-3 pl-2 font-semibold">DETALHES DA OPERAÇÃO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence initial={false}>
                    {logs.map((log) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-3.5 pr-2 font-mono text-slate-400 font-semibold">{log.id}</td>
                        <td className="py-3.5 px-2 text-slate-500">{log.timestamp}</td>
                        <td className="py-3.5 px-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            log.profile === 'REVENUE_MANAGER'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100/60'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100/60'
                          }`}>
                            {log.profile === 'REVENUE_MANAGER' ? 'RM' : 'CRM'}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 font-mono">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.group === 'TEST'
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {log.group}
                          </span>
                        </td>
                        <td className="py-3.5 px-2">
                          <div className="font-bold text-slate-800">{log.guestName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{log.reservationId}</div>
                        </td>
                        <td className="py-3.5 px-2 font-semibold text-slate-800">
                          {log.actionTaken}
                        </td>
                        <td className="py-3.5 pl-2 text-slate-500 max-w-xs truncate" title={log.details}>
                          {log.details}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {logs.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs italic">
                Nenhuma decisão registrada ainda. Experimente interagir nos painéis para criar logs!
              </div>
            )}
          </div>
        </section>

      </div>

      {/* Corporate footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-xs text-slate-400 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 SmartCancel Shield Corporation. Todos os direitos reservados.</p>
          <p className="mt-1 text-[10px] text-slate-400">
            Protótipo conceitual de alta fidelidade calibrado com as diretrizes de experiência e explicabilidade de inteligência artificial de revenue management hoteleiro.
          </p>
        </div>
      </footer>

    </div>
  );
}
