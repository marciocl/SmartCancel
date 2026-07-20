import { Reservation } from './types';

// Helper to generate 30 days of risk history with a specific trend and realistic daily noise
const generateRiskHistory = (currentScore: number, trend: 'up' | 'down' | 'stable'): { day: string; score: number }[] => {
  const history: { day: string; score: number }[] = [];
  
  for (let i = 30; i >= 0; i--) {
    let historicalScore = currentScore;
    
    // Generate trending scores with some wave/sine noise to look like a realistic ML prediction path
    if (trend === 'up') {
      // Historical risk was lower, increased over time
      const fraction = (30 - i) / 30;
      historicalScore = Math.round(52 + fraction * (currentScore - 52) + Math.sin(i / 2) * 4);
    } else if (trend === 'down') {
      // Historical risk was higher, decreased over time
      const fraction = (30 - i) / 30;
      historicalScore = Math.round(35 - fraction * (35 - currentScore) + Math.cos(i / 3) * 3);
    } else {
      // Fluctuating around medium risk
      historicalScore = Math.round(currentScore + Math.sin(i / 1.5) * 7 + (15 - i) * 0.2);
    }
    
    // Clamp score between 1 and 99
    historicalScore = Math.max(1, Math.min(99, historicalScore));
    
    // Ensure the final day matches currentScore exactly
    if (i === 0) {
      historicalScore = currentScore;
    }
    
    // Calculate the date
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayLabel = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
    
    history.push({
      day: dayLabel,
      score: historicalScore
    });
  }
  return history;
};

export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: "RES-84920",
    guestName: "Roberto Alencar",
    leadTime: 240,
    specialRequests: 0,
    channel: "B2B (Agência corporativa)",
    rateType: "Não-Reembolsável",
    totalValue: 2400.00,
    riskScore: 88,
    riskLevel: "ALTO",
    reasons: [
      "Janela de reserva muito longa (240 dias de antecedência)",
      "Histórico de alta volatilidade no canal B2B selecionado",
      "Ausência de interações ou pedidos especiais do hóspede"
    ],
    overbookingRec: "Recomendação de RM: Ativar overbooking preventivo de +1 quarto na categoria Standard para esta data (240 dias à frente). O histórico indica 85% de chance de reocupação se houver cancelamento precoce ou no-show, salvaguardando a receita de R$ 2.400,00.",
    crmRec: "Recomendação de CRM: Enviar fluxo automatizado de engajamento via WhatsApp Corporativo para Roberto Alencar. Confirmar dados de faturamento da agência e oferecer upgrade gratuito para Suíte Executiva (se disponível) para elevar o custo de oportunidade do cancelamento.",
    crmTemplate: {
      subject: "Confirmação Especial da sua Reserva - Hotel Transamérica",
      body: `Olá, Roberto Alencar!\n\nEstamos muito felizes em recebê-lo em breve no nosso hotel. \n\nPara tornar sua estadia corporativa ainda mais confortável, preparamos um benefício exclusivo para você: um upgrade de cortesia para nossa categoria Executiva, que inclui mesa de trabalho ergonômica, Wi-Fi de alta velocidade ultra-ráp-ido e acesso ao lounge VIP.\n\nSua tarifa é Não-Reembolsável de R$ 2.400,00. Gostaria de confirmar seu horário estimado de check-in para que possamos deixar tudo perfeitamente preparado? \n\nAtenciosamente,\nEquipe de Relacionamento SmartCancel Shield`
    },
    riskHistory: generateRiskHistory(88, 'up')
  },
  {
    id: "RES-20419",
    guestName: "Mariana Silva",
    leadTime: 12,
    specialRequests: 2,
    channel: "Direto (Site do Hotel)",
    rateType: "Flexível",
    totalValue: 1850.00,
    riskScore: 12,
    riskLevel: "BAIXO",
    reasons: [
      "Janela de reserva curta (12 dias para o check-in)",
      "Canal direto possui taxa de cancelamento histórica de apenas 4%",
      "Presença de múltiplos pedidos especiais (berço e andar alto) demonstra alto engajamento"
    ],
    overbookingRec: "Recomendação de RM: Manter status padrão. Nenhuma ação de overbooking é recomendada dada a baixíssima probabilidade de cancelamento.",
    crmRec: "Recomendação de CRM: Enviar confirmação padrão com as preferências solicitadas. Não há necessidade de incentivos agressivos.",
    crmTemplate: {
      subject: "Tudo pronto para sua chegada, Mariana!",
      body: `Olá, Mariana Silva!\n\nSeus pedidos especiais já foram processados:\n- Berço no quarto: Confirmado\n- Quarto em andar alto: Confirmado\n\nEstamos ansiosos para recebê-la em nosso hotel em apenas 12 dias!\n\nAbraços,\nEquipe de Reservas`
    },
    riskHistory: generateRiskHistory(12, 'down')
  },
  {
    id: "RES-71044",
    guestName: "Carlos Eduardo",
    leadTime: 85,
    specialRequests: 1,
    channel: "OTA (Booking.com)",
    rateType: "Flexível",
    totalValue: 4200.00,
    riskScore: 48,
    riskLevel: "MÉDIO",
    reasons: [
      "Lead time intermediário (85 dias)",
      "Canal de venda OTA tem média volatilidade histórica (32% cancelamento)",
      "Tarifa flexível permite cancelamento sem penalidade até 48 horas antes"
    ],
    overbookingRec: "Recomendação de RM: Monitorar tarifas concorrentes próximas. Ativar overbooking preventivo apenas se o inventário geral atingir 95% de ocupação.",
    crmRec: "Recomendação de CRM: Enviar régua de engajamento intermediária oferecendo 10% de desconto em serviços de SPA ou Jantar se confirmar com antecedência.",
    crmTemplate: {
      subject: "Preparamos algo especial para sua estadia, Carlos!",
      body: `Olá, Carlos Eduardo!\n\nSua viagem está se aproximando. Que tal relaxar no nosso Spa Urbano?\n\nConfirmando sua presença esta semana, oferecemos 10% de desconto exclusivo em qualquer massagem ou jantar temático no nosso restaurante.\n\nPodemos reservar para você?\n\nAtenciosamente,\nConcierge`
    },
    riskHistory: generateRiskHistory(48, 'stable')
  }
];
