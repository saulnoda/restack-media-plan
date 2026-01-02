import React, { useState, useMemo } from 'react';

// ============================================
// CONFIGURATION DATA
// ============================================

const PLATFORMS_CONFIG = {
  linkedin: {
    name: 'LinkedIn Ads',
    icon: '💼',
    color: '#0077b5',
    cplRange: [150, 250],
    minBudget: 800,
    recommendedBudget: 1000,
    channelType: 'outbound',
    defaultPercentage: 40,
    adTypes: [
      { id: 'lead_gen', name: 'Lead Gen Forms', forTest: true, cplRange: [120, 200], description: 'Formularios nativos sin salir de LinkedIn', strengths: ['Mayor tasa conversión 10-15%', 'Datos verificados', 'Menor fricción'] },
      { id: 'sponsored_content', name: 'Sponsored Content', forTest: false, cplRange: [150, 250], description: 'Posts promocionados en el feed' },
      { id: 'message_ads', name: 'Message Ads (InMail)', forTest: false, cplRange: [180, 300], description: 'Mensajes directos patrocinados' },
      { id: 'conversation_ads', name: 'Conversation Ads', forTest: false, cplRange: [200, 350], description: 'Chatbots en mensajes directos' }
    ]
  },
  google: {
    name: 'Google Ads',
    icon: '🔍',
    color: '#4285f4',
    cplRange: [80, 150],
    minBudget: 500,
    recommendedBudget: 700,
    channelType: 'inbound',
    defaultPercentage: 35,
    adTypes: [
      { id: 'search_intent', name: 'Search - Intent Keywords', forTest: true, cplRange: [60, 120], description: 'Búsquedas de alta intención comercial', keywords: ['"salesforce alternative"', '"custom crm"', '"saas migration"'], strengths: ['Demanda existente', 'Alto intent', 'ROI predecible'] },
      { id: 'search_competitor', name: 'Search - Competitor Terms', forTest: true, cplRange: [80, 150], description: 'Búsquedas de competidores', keywords: ['"salesforce pricing"', '"hubspot expensive"'], strengths: ['Usuarios insatisfechos', 'Awareness alternativas'] },
      { id: 'display_remarketing', name: 'Display Remarketing', forTest: false, cplRange: [30, 60], description: 'Retargeting visual a visitantes' },
      { id: 'pmax', name: 'Performance Max', forTest: false, cplRange: [100, 200], description: 'Campañas automatizadas multicanal' }
    ]
  },
  meta: {
    name: 'Meta Ads',
    icon: '📱',
    color: '#1877f2',
    cplRange: [50, 100],
    minBudget: 300,
    recommendedBudget: 500,
    channelType: 'outbound',
    defaultPercentage: 25,
    adTypes: [
      { id: 'lead_ads', name: 'Lead Ads (Formularios)', forTest: true, cplRange: [40, 80], description: 'Formularios nativos en Facebook/Instagram', strengths: ['Conversión sin salir de app', 'Pre-llenado automático', 'Bajo CPL'] },
      { id: 'conversion_landing', name: 'Conversions - Landing', forTest: false, cplRange: [60, 120], description: 'Tráfico optimizado para conversión en web' },
      { id: 'lookalike', name: 'Lookalike Audiences', forTest: false, cplRange: [50, 100], description: 'Audiencias similares a clientes' },
      { id: 'video_awareness', name: 'Video Awareness', forTest: false, cplRange: [80, 150], description: 'Campañas de vídeo para reconocimiento' }
    ]
  },
  youtube: {
    name: 'YouTube Ads',
    icon: '▶️',
    color: '#ff0000',
    cplRange: [40, 80],
    minBudget: 400,
    recommendedBudget: 600,
    channelType: 'outbound',
    defaultPercentage: 0,
    adTypes: [
      { id: 'instream_skippable', name: 'In-Stream Skippable', forTest: false, cplRange: [40, 80], description: 'Anuncios antes/durante vídeos' },
      { id: 'video_action', name: 'Video Action Campaigns', forTest: false, cplRange: [50, 100], description: 'Vídeos optimizados para conversión' },
      { id: 'discovery', name: 'Discovery Ads', forTest: false, cplRange: [60, 120], description: 'Anuncios en búsqueda de YouTube' }
    ]
  },
  outbound: {
    name: 'Outbound (SLG)',
    icon: '📤',
    color: '#8b5cf6',
    cplRange: [30, 80],
    minBudget: 180, // Coste stack: Apollo $49 + Instantly $37 + Sales Nav $79 + Calendly $12 ≈ €180
    recommendedBudget: 200,
    channelType: 'outbound',
    defaultPercentage: 0,
    isOptional: true,
    stackCosts: [
      { name: 'Apollo.io', cost: 49, use: 'Prospección + Data enrichment' },
      { name: 'Instantly.ai', cost: 37, use: 'Email automation + Warmup' },
      { name: 'Sales Navigator', cost: 79, use: 'LinkedIn targeting avanzado' },
      { name: 'Calendly', cost: 12, use: 'Booking de calls' }
    ],
    adTypes: [
      { id: 'cold_email', name: 'Cold Email (Apollo + Instantly)', forTest: true, cplRange: [20, 50], description: 'Secuencias de email automatizadas', tools: ['Apollo.io', 'Instantly.ai'], strengths: ['Coste muy bajo', 'Escalable', 'Personalizable'] },
      { id: 'linkedin_outreach', name: 'LinkedIn Outreach (Sales Nav)', forTest: true, cplRange: [40, 80], description: 'Conexiones y mensajes personalizados', tools: ['Sales Navigator'], strengths: ['Alto open rate', 'Contexto profesional'] },
      { id: 'abm_enterprise', name: 'Account-Based Marketing', forTest: false, cplRange: [100, 200], description: 'Campañas hiperpersonalizadas por cuenta' }
    ]
  }
};

const VERTICALS_DATA = {
  crm: { name: 'CRM', tier: 'PRIMARY', score: 23, market: '$165B+', icon: '🎯', description: 'Salesforce, HubSpot, Pipedrive users', enabled: true },
  pm: { name: 'Project Management', tier: 'SECONDARY', score: 22, market: '$20.5B', icon: '📊', description: 'Asana, Monday.com, Wrike users', enabled: false },
  accounting: { name: 'Accounting', tier: 'TERTIARY', score: 21, market: '$18.4B', icon: '📈', description: 'QuickBooks, Xero, NetSuite users', enabled: false }
};

const REGIONS_DATA = {
  northAmerica: { name: 'North America + UK', flag: '🇺🇸🇨🇦🇬🇧', language: 'English', minBudget: 2000, defaultWeight: 100, enabled: true },
  dach: { name: 'DACH', flag: '🇩🇪🇦🇹🇨🇭', language: 'German', minBudget: 1500, defaultWeight: 0, enabled: false },
  spain: { name: 'España', flag: '🇪🇸', language: 'Spanish', minBudget: 1000, defaultWeight: 0, enabled: false },
  brazil: { name: 'Brasil', flag: '🇧🇷', language: 'Portuguese', minBudget: 800, defaultWeight: 0, enabled: false }
};

const TACTICS_DATA = {
  leadMagnets: { name: 'Lead Magnets', icon: '🧲', description: '"SaaS Audit Checklist" PDF, "Migration Playbook" Guide, ROI Calculator interactivo', note: '* Los lead magnets aumentan la tasa de conversión de landing un 20-50% vs. formulario directo.', strategy: 'performance', forTest: true },
  retargeting: { name: 'Retargeting Multi-Layer', icon: '🔄', description: 'Layer 1: Homepage → Case Studies | Layer 2: Case Studies → ROI Calculator | Layer 3: Calculator → Demo Booking', note: '* El retargeting típicamente reduce CPL un 20-40% al impactar usuarios con intent previo.', strategy: 'performance', forTest: false },
  content: { name: 'Content Marketing', icon: '📝', description: 'TOFU: "Hidden costs of SaaS" articles | MOFU: Case studies, comparisons | BOFU: Migration guides, demos', strategy: 'awareness', forTest: false },
  webinars: { name: 'Webinars', icon: '🎥', description: 'Eventos online para generar autoridad y captar leads cualificados', strategy: 'awareness', forTest: false }
};

const OUTBOUND_SEQUENCE = [
  { day: 1, type: 'Email', icon: '✉️', subject: 'Pain point hook', description: 'Apertura con dolor específico del SaaS actual' },
  { day: 3, type: 'LinkedIn', icon: '💼', subject: 'Connection request', description: 'Conexión personalizada mencionando el email' },
  { day: 5, type: 'Email', icon: '✉️', subject: 'Case study/proof', description: 'Caso de éxito relevante para su industria' },
  { day: 8, type: 'Email', icon: '✉️', subject: 'Value add', description: 'Contenido útil: checklist, guía, o insight' },
  { day: 12, type: 'LinkedIn', icon: '💼', subject: 'Engagement', description: 'Comentar/reaccionar a su contenido' },
  { day: 15, type: 'Email', icon: '✉️', subject: 'Breakup + CTA', description: 'Último intento con propuesta clara de valor' }
];

const APOLLO_FILTERS = [
  { field: 'Job Titles', values: ['CEO', 'CTO', 'COO', 'VP Operations', 'VP Sales', 'RevOps Manager'] },
  { field: 'Company Size', values: ['20-50 employees', '51-100 employees'] },
  { field: 'Industries', values: ['Professional Services', 'Financial Services', 'Real Estate', 'Consulting'] },
  { field: 'Technologies', values: ['Salesforce', 'HubSpot', 'Pipedrive', 'Asana', 'Monday.com'] },
  { field: 'Location', values: ['United States', 'Canada', 'United Kingdom'] },
  { field: 'Revenue', values: ['$1M - $10M', '$10M - $50M'] }
];

const DEFAULT_CONFIG = {
  monthlyBudget: 2000,
  targetLeads: 13,
  conversionRate: 10,
  avgTicket: 6000, // $2,000/año x 3 años LTV
  platforms: { linkedin: { enabled: true }, google: { enabled: true }, meta: { enabled: true }, youtube: { enabled: false }, outbound: { enabled: false } },
  verticals: { crm: { enabled: true }, pm: { enabled: false }, accounting: { enabled: false } },
  regions: { northAmerica: { enabled: true }, dach: { enabled: false }, spain: { enabled: false }, brazil: { enabled: false } },
  tactics: { leadMagnets: { enabled: true }, retargeting: { enabled: false }, content: { enabled: false }, webinars: { enabled: false } }
};

// CPL estimado por escenario
const CPL_SCENARIOS = {
  conservative: 155, // +30% del base
  probable: 119,     // Base CPL ponderado
  optimistic: 95     // -20% del base
};

const NEXT_STEPS_TIMELINE = [
  { step: 1, title: 'Aceptación', icon: '✅', duration: '1-2 días', items: ['Confirmación por email', 'Firma de contrato', 'Fecha de inicio'] },
  { step: 2, title: 'Facturación', icon: '💳', duration: '1-3 días', items: ['Datos de facturación', 'Emisión de factura', 'Pago confirmado'] },
  { step: 3, title: 'Accesos', icon: '🔑', duration: '1-2 días', items: ['LinkedIn Campaign Manager', 'Google Ads MCC', 'Meta Business Manager', 'GA4 + CRM'] },
  { step: 4, title: 'Setup Técnico', icon: '⚙️', duration: '3-5 días', items: ['Píxeles y conversiones', 'UTMs y atribución', 'Audiencias y segmentos', 'Dashboards'] },
  { step: 5, title: 'Lanzamiento', icon: '🚀', duration: '1-2 días', items: ['Aprobación creativos', 'Activación campañas', 'Monitorización 48h'] }
];

const MEASUREMENT_METHODOLOGY = {
  kpis: [
    { name: 'CPL (Coste por Lead)', target: '<€120', frequency: 'Diario', action: 'Pausar si CPL >€180 después de €300 spend' },
    { name: 'CTR (Click-Through Rate)', target: '>1.5%', frequency: 'Diario', action: 'Revisar creativos si CTR <0.8%' },
    { name: 'Conversion Rate', target: '>5%', frequency: 'Semanal', action: 'Optimizar landing si CR <3%' },
    { name: 'Lead Quality Score', target: '>7/10', frequency: 'Semanal', action: 'Ajustar targeting si score <5' }
  ],
  optimization: [
    { trigger: 'CPL 30% above target', action: 'Revisar segmentación y creativos', timeline: '48h' },
    { trigger: 'CTR below 0.8%', action: 'A/B test nuevos headlines e imágenes', timeline: '72h' },
    { trigger: 'No conversions after €500', action: 'Pausar y analizar funnel completo', timeline: 'Inmediato' },
    { trigger: 'Lead quality <5/10', action: 'Refinar exclusiones y targeting', timeline: '1 semana' }
  ],
  reporting: [
    { type: 'Daily Check', content: 'Spend, CPL, leads, anomalías', format: 'WhatsApp/Email' },
    { type: 'Weekly Report', content: 'Métricas completas, insights, acciones', format: 'Dashboard + Call 15min' },
    { type: 'Monthly Review', content: 'Análisis profundo, learnings, plan siguiente mes', format: 'Documento + Call 45min' }
  ]
};

const PROFILE_PHOTO = 'https://media.licdn.com/dms/image/v2/D4D03AQGq3N1cHKxaZQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1728550566495?e=1741219200&v=beta&t=LhdKyuGFY3EyV8r7KrUNJGRYYHd0JQCpQMx6aw_j-uk';

// ============================================
// MAIN COMPONENT
// ============================================
export default function RestackMediaPlanFinal() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);
  
  // Calculator state
  const [monthlyBudget, setMonthlyBudget] = useState(DEFAULT_CONFIG.monthlyBudget);
  const [targetLeads, setTargetLeads] = useState(DEFAULT_CONFIG.targetLeads);
  const [conversionRate, setConversionRate] = useState(DEFAULT_CONFIG.conversionRate);
  const [avgTicket, setAvgTicket] = useState(DEFAULT_CONFIG.avgTicket);
  const [platforms, setPlatforms] = useState(DEFAULT_CONFIG.platforms);
  const [verticals, setVerticals] = useState(DEFAULT_CONFIG.verticals);
  const [regions, setRegions] = useState(DEFAULT_CONFIG.regions);
  const [tactics, setTactics] = useState(DEFAULT_CONFIG.tactics);

  // Budget and leads are interdependent via conservative CPL
  const handleBudgetChange = (newBudget) => {
    const budget = Math.max(2000, newBudget);
    setMonthlyBudget(budget);
    // Calculate leads based on conservative CPL
    const newLeads = Math.floor(budget / CPL_SCENARIOS.conservative);
    setTargetLeads(newLeads);
  };

  const handleLeadsChange = (newLeads) => {
    const leads = Math.max(1, newLeads);
    setTargetLeads(leads);
    // Calculate budget based on conservative CPL
    const newBudget = Math.max(2000, leads * CPL_SCENARIOS.conservative);
    setMonthlyBudget(newBudget);
  };

  const resetToRecommended = () => {
    setMonthlyBudget(DEFAULT_CONFIG.monthlyBudget);
    setTargetLeads(DEFAULT_CONFIG.targetLeads);
    setConversionRate(DEFAULT_CONFIG.conversionRate);
    setAvgTicket(DEFAULT_CONFIG.avgTicket);
    setPlatforms(DEFAULT_CONFIG.platforms);
    setVerticals(DEFAULT_CONFIG.verticals);
    setRegions(DEFAULT_CONFIG.regions);
    setTactics(DEFAULT_CONFIG.tactics);
  };

  // Calculate metrics based on current configuration
  const metrics = useMemo(() => {
    const enabledPlatforms = Object.entries(platforms).filter(([_, p]) => p.enabled);
    const totalWeight = enabledPlatforms.reduce((sum, [key, _]) => sum + PLATFORMS_CONFIG[key].defaultPercentage, 0);
    
    // Budget distribution
    const platformMetrics = {};
    let totalLeads = 0;
    
    enabledPlatforms.forEach(([key, _]) => {
      const config = PLATFORMS_CONFIG[key];
      const percentage = totalWeight > 0 ? (config.defaultPercentage / totalWeight) * 100 : 0;
      const budget = Math.round(monthlyBudget * (percentage / 100));
      const avgCPL = (config.cplRange[0] + config.cplRange[1]) / 2;
      const leads = budget > 0 ? Math.round(budget / avgCPL) : 0;
      
      platformMetrics[key] = { budget, percentage: Math.round(percentage), leads, cpl: Math.round(avgCPL) };
      totalLeads += leads;
    });

    // If no platforms enabled, use default
    if (totalLeads === 0) totalLeads = targetLeads;

    const customersPerMonth = totalLeads * (conversionRate / 100);
    const revenuePerMonth = customersPerMonth * avgTicket;
    const roas = monthlyBudget > 0 ? revenuePerMonth / monthlyBudget : 0;
    const activeTactics = Object.values(tactics).filter(t => t.enabled).length;
    const activeRegions = Object.values(regions).filter(r => r.enabled).length;

    // Scenarios based on CPL variation
    const scenarios = {
      conservative: { cpl: CPL_SCENARIOS.conservative, leads: Math.floor(monthlyBudget / CPL_SCENARIOS.conservative), clients: Math.floor(monthlyBudget / CPL_SCENARIOS.conservative) * (conversionRate / 100) },
      probable: { cpl: CPL_SCENARIOS.probable, leads: Math.floor(monthlyBudget / CPL_SCENARIOS.probable), clients: Math.floor(monthlyBudget / CPL_SCENARIOS.probable) * (conversionRate / 100) },
      optimistic: { cpl: CPL_SCENARIOS.optimistic, leads: Math.floor(monthlyBudget / CPL_SCENARIOS.optimistic), clients: Math.floor(monthlyBudget / CPL_SCENARIOS.optimistic) * (conversionRate / 100) }
    };
    scenarios.conservative.revenue = scenarios.conservative.clients * avgTicket;
    scenarios.probable.revenue = scenarios.probable.clients * avgTicket;
    scenarios.optimistic.revenue = scenarios.optimistic.clients * avgTicket;

    // Quarterly projections
    const quarterly = [
      { q: 'Q1 2026', leads: Math.round(totalLeads * 3), revenue: Math.round(revenuePerMonth * 3) },
      { q: 'Q2 2026', leads: Math.round(totalLeads * 3.5), revenue: Math.round(revenuePerMonth * 3.5) },
      { q: 'Q3 2026', leads: Math.round(totalLeads * 4), revenue: Math.round(revenuePerMonth * 4) },
      { q: 'Q4 2026', leads: Math.round(totalLeads * 4.5), revenue: Math.round(revenuePerMonth * 4.5) }
    ];

    // Funnel metrics
    const impressions = totalLeads * 150;
    const clicks = totalLeads * 25;
    const landing = totalLeads * 5;

    return {
      monthlyBudget,
      annualBudget: monthlyBudget * 12,
      leadsPerMonth: totalLeads,
      annualLeads: totalLeads * 12,
      cpl: totalLeads > 0 ? Math.round(monthlyBudget / totalLeads) : CPL_SCENARIOS.probable,
      customersPerMonth,
      annualCustomers: Math.round(customersPerMonth * 12),
      revenuePerMonth,
      annualRevenue: revenuePerMonth * 12,
      roas,
      cac: customersPerMonth > 0 ? Math.round(monthlyBudget / customersPerMonth) : 0,
      activeTactics,
      activeRegions,
      platformMetrics,
      scenarios,
      quarterly,
      impressions,
      clicks,
      landing
    };
  }, [monthlyBudget, targetLeads, conversionRate, avgTicket, platforms, tactics, regions]);

  const togglePlatform = (key) => setPlatforms(prev => ({ ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }));
  const toggleVertical = (key) => setVerticals(prev => ({ ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }));
  const toggleRegion = (key) => setRegions(prev => ({ ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }));
  const toggleTactic = (key) => setTactics(prev => ({ ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }));
  
  const formatCurrency = (value, currency = '€') => currency === '€' ? `€${new Intl.NumberFormat('de-DE').format(Math.round(value))}` : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  const formatNumber = (value) => new Intl.NumberFormat('es-ES').format(Math.round(value));
  const whatsappLink = `https://wa.me/34635746444?text=${encodeURIComponent('Hola Saúl, me gustaría hablar sobre la propuesta de Restack Media Plan.')}`;

  // ============================================
  // COMENZAR PAGE (Siguientes Pasos)
  // ============================================
  if (currentView === 'comenzar') {
    // Fee calculation
    const feeGestion = 800;
    const feeSetup = 500;
    const baseImponible = feeGestion + feeSetup;
    const irpf = Math.round(baseImponible * 0.15); // 15% IRPF
    const igic = Math.round(baseImponible * 0.07); // 7% IGIC
    const totalFee = baseImponible - irpf + igic;

    return (
      <div style={styles.container}>
        <nav style={styles.nav}>
          <div style={styles.navInner}>
            <button onClick={() => setCurrentView('home')} style={styles.backButton}>← Volver a Propuesta</button>
            <span style={styles.navLogo}>Restack</span>
            <span style={styles.navTitle}>Siguientes Pasos</span>
          </div>
        </nav>

        <header style={{...styles.hero, minHeight: '40vh'}}>
          <div style={styles.heroContent}>
            <div style={styles.heroBadge}><span style={styles.heroBadgeDot}></span>Fase de Implementación</div>
            <h1 style={styles.heroTitle}>Comenzar el Test</h1>
            <p style={styles.heroSubtitle}>Proceso completo para lanzar las campañas y comenzar a generar leads cualificados.</p>
          </div>
        </header>

        {/* Timeline Vertical de Pasos */}
        <section style={styles.section}>
          <div style={styles.sectionContainer}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNumber}>01</span>
              <h2 style={styles.sectionTitle}>Timeline de Implementación</h2>
              <p style={styles.sectionSubtitle}>Proceso de onboarding: ~10-15 días hábiles</p>
            </div>
            
            <div style={styles.timelineVertical}>
              {NEXT_STEPS_TIMELINE.map((step, index) => (
                <div key={step.step} style={styles.timelineItem}>
                  <div style={styles.timelineLeft}>
                    <div style={styles.timelineDuration}>{step.duration}</div>
                  </div>
                  <div style={styles.timelineCenter}>
                    <div style={styles.timelineNode}>{step.icon}</div>
                    {index < NEXT_STEPS_TIMELINE.length - 1 && <div style={styles.timelineLine}></div>}
                  </div>
                  <div style={styles.timelineRight}>
                    <div style={styles.timelineCard}>
                      <div style={styles.timelineStep}>Paso {step.step}</div>
                      <h3 style={styles.timelineTitle}>{step.title}</h3>
                      <ul style={styles.timelineList}>
                        {step.items.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fee de Gestión */}
        <section style={{...styles.section, background: '#0a0a0f'}}>
          <div style={styles.sectionContainer}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNumber}>02</span>
              <h2 style={styles.sectionTitle}>Fee de Gestión</h2>
              <p style={styles.sectionSubtitle}>Propuesta recomendada: 1 mercado, 3 plataformas, táctica Lead Magnets</p>
            </div>

            <div style={styles.invoiceCard}>
              <div style={styles.invoiceHeader}>
                <div>
                  <h3 style={styles.invoiceTitle}>Factura Proforma</h3>
                  <p style={styles.invoiceSubtitle}>Servicios de Gestión de Campañas Digitales</p>
                </div>
                <div style={styles.invoiceLogo}>SN</div>
              </div>

              <div style={styles.invoiceBody}>
                <div style={styles.invoiceRow}>
                  <div style={styles.invoiceDesc}>
                    <strong>Gestión Mensual de Campañas</strong>
                    <p>LinkedIn Ads + Google Ads + Meta Ads</p>
                    <p>• Configuración y optimización de campañas</p>
                    <p>• Monitorización diaria y ajustes</p>
                    <p>• Reporting semanal y mensual</p>
                  </div>
                  <div style={styles.invoiceAmount}>€800,00</div>
                </div>

                <div style={styles.invoiceRow}>
                  <div style={styles.invoiceDesc}>
                    <strong>Setup Técnico Inicial</strong>
                    <p>Implementación única</p>
                    <p>• Píxeles y tracking de conversiones</p>
                    <p>• Audiencias y segmentación</p>
                    <p>• Dashboard de métricas</p>
                  </div>
                  <div style={styles.invoiceAmount}>€500,00</div>
                </div>

                <div style={styles.invoiceDivider}></div>

                <div style={styles.invoiceTotals}>
                  <div style={styles.invoiceTotalRow}><span>Base Imponible</span><span>€{baseImponible.toLocaleString('de-DE')},00</span></div>
                  <div style={styles.invoiceTotalRow}><span>IRPF (-15%)</span><span style={{color: '#f87171'}}>-€{irpf.toLocaleString('de-DE')},00</span></div>
                  <div style={styles.invoiceTotalRow}><span>IGIC (7%)</span><span>€{igic.toLocaleString('de-DE')},00</span></div>
                  <div style={{...styles.invoiceTotalRow, ...styles.invoiceGrandTotal}}><span>TOTAL MES 1</span><span>€{totalFee.toLocaleString('de-DE')},00</span></div>
                </div>

                <div style={styles.invoiceNote}>
                  <p><strong>Meses siguientes:</strong> €800 + impuestos (solo gestión mensual)</p>
                </div>
              </div>

              <div style={styles.invoiceFooter}>
                <p><strong>⚠️ No incluido en esta propuesta:</strong></p>
                <ul>
                  <li>Creatividades (imágenes, vídeos) — a proporcionar por el cliente</li>
                  <li>Copywriting de anuncios — a proporcionar por el cliente</li>
                  <li>Desarrollo web, landing pages o integraciones no especificadas</li>
                  <li>Presupuesto de medios (se factura aparte directamente a plataformas o a través de nosotros)</li>
                </ul>
              </div>
            </div>

            <div style={styles.budgetReminder}>
              <h4>💰 Inversión en Medios (Aparte)</h4>
              <p>Presupuesto mínimo recomendado: <strong>€2.000/mes</strong> para el mercado North America + UK</p>
              <p style={{color: '#8b8b9e', fontSize: '0.85rem'}}>Este presupuesto se invierte directamente en las plataformas publicitarias.</p>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section style={styles.section}>
          <div style={styles.sectionContainer}>
            <div style={styles.ctaCard}>
              <h2 style={styles.ctaTitle}>¿Listo para comenzar?</h2>
              <p style={styles.ctaSubtitle}>El siguiente paso es confirmar la propuesta y enviarnos los datos de facturación.</p>
              <div style={styles.ctaButtonsRow}>
                <a href="mailto:hola@saulnoda.com?subject=Aceptación%20Propuesta%20Restack" style={styles.ctaPrimaryBtn}>✉️ Aceptar Propuesta por Email</a>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" style={styles.whatsappBtn}>💬 WhatsApp</a>
              </div>
            </div>
          </div>
        </section>

        <footer style={styles.footer}><div style={styles.footerBottom}><p>Diseñado por <a href="https://saulnoda.com" style={{color: '#22d3ee'}}>SaulNoda.com</a> • Enero 2026</p></div></footer>
      </div>
    );
  }

  // ============================================
  // PLATFORM DETAIL VIEW (v4 style)
  // ============================================
  if (currentView === 'platform-detail' && selectedPlatform) {
    const platform = PLATFORMS_CONFIG[selectedPlatform];
    const platformMetric = metrics.platformMetrics[selectedPlatform] || { budget: 0, leads: 0 };
    const isOutbound = selectedPlatform === 'outbound';

    return (
      <div style={styles.container}>
        <nav style={styles.nav}>
          <div style={styles.navInner}>
            <button onClick={() => setCurrentView('home')} style={styles.backButton}>← Volver al Plan</button>
            <span style={styles.navTitle}>{platform.icon} {platform.name} — Estrategia Completa</span>
          </div>
        </nav>

        <div style={styles.detailPage}>
          <header style={{...styles.detailHeader, background: `linear-gradient(135deg, ${platform.color}, ${platform.color}88)`}}>
            <div style={styles.detailHeaderContent}>
              <span style={styles.detailIcon}>{platform.icon}</span>
              <h1 style={styles.detailTitle}>{platform.name}</h1>
              <p style={styles.detailSubtitle}>
                {isOutbound ? 'Estrategia de prospección activa Sales-Led Growth' : 'Estrategia de implementación para test de captación'}
              </p>
              <div style={styles.detailBadge}>{platform.channelType === 'inbound' ? '🎯 INBOUND' : '📤 OUTBOUND'}</div>
              <div style={styles.detailStats}>
                <div style={styles.detailStat}><span style={styles.detailStatValue}>{formatCurrency(platformMetric.budget)}</span><span style={styles.detailStatLabel}>Budget Asignado</span></div>
                <div style={styles.detailStat}><span style={styles.detailStatValue}>{platformMetric.leads}</span><span style={styles.detailStatLabel}>Leads Estimados</span></div>
                <div style={styles.detailStat}><span style={styles.detailStatValue}>{formatCurrency(platform.minBudget)}</span><span style={styles.detailStatLabel}>Inversión Mínima</span></div>
              </div>
            </div>
          </header>

          <div style={styles.detailContent}>
            {/* Investment Requirements */}
            <section style={styles.detailSection}>
              <h2 style={styles.detailSectionTitle}>💰 Requisitos de Inversión</h2>
              <div style={styles.investmentGrid}>
                <div style={styles.investmentCard}>
                  <div style={styles.investmentLabel}>Inversión Mínima</div>
                  <div style={styles.investmentValue}>{formatCurrency(platform.minBudget)}/mes</div>
                  <p style={styles.investmentNote}>* Por debajo no hay volumen suficiente para optimización</p>
                </div>
                <div style={styles.investmentCard}>
                  <div style={styles.investmentLabel}>Inversión Recomendada</div>
                  <div style={{...styles.investmentValue, color: '#34d399'}}>{formatCurrency(platform.recommendedBudget)}/mes</div>
                  <p style={styles.investmentNote}>* Permite A/B testing y optimización adecuada</p>
                </div>
                <div style={styles.investmentCard}>
                  <div style={styles.investmentLabel}>CPL Esperado</div>
                  <div style={styles.investmentValue}>{formatCurrency(platform.cplRange[0])} - {formatCurrency(platform.cplRange[1])}</div>
                  <p style={styles.investmentNote}>* Basado en benchmarks B2B SaaS 2024</p>
                </div>
              </div>
            </section>

            {/* Ad Types */}
            <section style={styles.detailSection}>
              <h2 style={styles.detailSectionTitle}>{isOutbound ? '📋 Tácticas de Outbound' : '📋 Tipos de Anuncios'}</h2>
              
              <h3 style={styles.adTypeGroupTitle}>✓ Recomendados para el Test</h3>
              <div style={styles.adTypeGrid}>
                {platform.adTypes.filter(ad => ad.forTest).map(ad => (
                  <div key={ad.id} style={styles.adTypeCard}>
                    <div style={styles.adTypeBadge}>✓ TEST</div>
                    <h4 style={styles.adTypeName}>{ad.name}</h4>
                    <p style={styles.adTypeDesc}>{ad.description}</p>
                    {ad.keywords && <div style={styles.keywordsBox}><strong>Keywords:</strong><div style={styles.keywordTags}>{ad.keywords.map((kw, i) => <span key={i} style={styles.keywordTag}>{kw}</span>)}</div></div>}
                    {ad.tools && <div style={styles.toolsBox}><strong>Herramientas:</strong> {ad.tools.join(', ')}</div>}
                    {ad.strengths && <div style={styles.strengthsBox}><strong>Ventajas:</strong><ul>{ad.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul></div>}
                    <div style={styles.adTypeCPL}>CPL: {formatCurrency(ad.cplRange[0])} - {formatCurrency(ad.cplRange[1])}</div>
                  </div>
                ))}
              </div>

              {platform.adTypes.filter(ad => !ad.forTest).length > 0 && (
                <>
                  <h3 style={{...styles.adTypeGroupTitle, color: '#6b7280', marginTop: '2rem'}}>🔮 Para Fases Futuras</h3>
                  <div style={styles.adTypeGrid}>
                    {platform.adTypes.filter(ad => !ad.forTest).map(ad => (
                      <div key={ad.id} style={{...styles.adTypeCard, opacity: 0.5, borderStyle: 'dashed'}}>
                        <div style={{...styles.adTypeBadge, background: '#374151'}}>FUTURO</div>
                        <h4 style={styles.adTypeName}>{ad.name}</h4>
                        <p style={styles.adTypeDesc}>{ad.description}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>

            {/* Setup Guide */}
            <section style={styles.detailSection}>
              <h2 style={styles.detailSectionTitle}>🛠️ Setup Recomendado</h2>
              <div style={styles.setupGuide}>
                {selectedPlatform === 'linkedin' && (
                  <>
                    <div style={styles.setupStep}><span style={styles.stepNum}>1</span><div><strong>Targeting</strong><p>Job Titles: CEO, CTO, VP Ops, Sales Ops | Company Size: 20-100 | Industries: Professional Services, Financial</p></div></div>
                    <div style={styles.setupStep}><span style={styles.stepNum}>2</span><div><strong>Lead Gen Form Fields</strong><p>Nombre, Email, Empresa, Cargo (pre-filled). Custom: "¿Qué CRM usas actualmente?"</p></div></div>
                    <div style={styles.setupStep}><span style={styles.stepNum}>3</span><div><strong>Creative</strong><p>Single Image (1200x627) o Carousel. Copy &lt;150 chars. CTA: "Get Quote" o "Calculate Savings"</p></div></div>
                    <div style={styles.setupStep}><span style={styles.stepNum}>4</span><div><strong>Bidding</strong><p>Automated bidding con objetivo de leads. Daily budget mínimo €50/campaña para optimización.</p></div></div>
                  </>
                )}
                {selectedPlatform === 'google' && (
                  <>
                    <div style={styles.setupStep}><span style={styles.stepNum}>1</span><div><strong>Estructura de Cuenta</strong><p>1 Campaña por vertical (CRM) → Ad Groups por tipo de keyword (alternatives, pricing, problems)</p></div></div>
                    <div style={styles.setupStep}><span style={styles.stepNum}>2</span><div><strong>Keywords Strategy</strong><p>Phrase match + Exact match. Evitar broad match en test inicial. Negative keywords agresivas desde día 1.</p></div></div>
                    <div style={styles.setupStep}><span style={styles.stepNum}>3</span><div><strong>Bidding Strategy</strong><p>Iniciar con "Maximize Conversions". Cambiar a Target CPA después de 15-20 conversiones.</p></div></div>
                    <div style={styles.setupStep}><span style={styles.stepNum}>4</span><div><strong>Ad Copy Framework</strong><p>Headline 1: Pain point | Headline 2: Solución | Headline 3: CTA con urgencia</p></div></div>
                    <div style={styles.setupStep}><span style={styles.stepNum}>5</span><div><strong>Landing Page</strong><p>Página específica por campaña. Above the fold: headline + form. Social proof visible. Mobile-first.</p></div></div>
                  </>
                )}
                {selectedPlatform === 'meta' && (
                  <>
                    <div style={styles.setupStep}><span style={styles.stepNum}>1</span><div><strong>Audience Setup</strong><p>Intereses: Salesforce, Business software, Entrepreneurship | Behaviors: Business page admins, Small business owners</p></div></div>
                    <div style={styles.setupStep}><span style={styles.stepNum}>2</span><div><strong>Instant Form Config</strong><p>"More Volume" para test inicial. Campos: Email, Phone, Company. Pregunta custom para cualificar.</p></div></div>
                    <div style={styles.setupStep}><span style={styles.stepNum}>3</span><div><strong>Creative Strategy</strong><p>Carousels con pain points (coste, complejidad, lock-in). Video testimonials 15-30s. Static con antes/después de costes.</p></div></div>
                  </>
                )}
                {selectedPlatform === 'youtube' && (
                  <>
                    <div style={styles.setupStep}><span style={styles.stepNum}>1</span><div><strong>Video Creative</strong><p>Hook en primeros 5 segundos (antes del skip). Duración: 30-60s. CTA verbal + botón overlay.</p></div></div>
                    <div style={styles.setupStep}><span style={styles.stepNum}>2</span><div><strong>Targeting</strong><p>Custom Intent Audiences basadas en búsquedas. In-market: Business Services, Software.</p></div></div>
                    <div style={styles.setupStep}><span style={styles.stepNum}>3</span><div><strong>Placements</strong><p>Excluir apps móviles y gaming. Priorizar canales de negocio/productividad.</p></div></div>
                  </>
                )}
                {selectedPlatform === 'outbound' && (
                  <>
                    <h3 style={styles.setupSubtitle}>🎯 Filtros de Apollo.io para ICP</h3>
                    <div style={styles.apolloFilters}>
                      {APOLLO_FILTERS.map((filter, i) => (
                        <div key={i} style={styles.filterCard}><div style={styles.filterField}>{filter.field}</div><div style={styles.filterValues}>{filter.values.map((v, j) => <span key={j} style={styles.filterTag}>{v}</span>)}</div></div>
                      ))}
                    </div>
                    <p style={styles.filterNote}>* Con estos filtros puedes exportar listas de ~5,000-10,000 prospectos cualificados por región.</p>

                    <h3 style={{...styles.setupSubtitle, marginTop: '2rem'}}>📧 Secuencia de Email (15 días)</h3>
                    <div style={styles.sequenceTimeline}>
                      {OUTBOUND_SEQUENCE.map((step, i) => (
                        <div key={i} style={styles.sequenceStep}>
                          <div style={styles.sequenceDay}>Día {step.day}</div>
                          <div style={styles.sequenceIcon}>{step.icon}</div>
                          <div style={styles.sequenceContent}>
                            <div style={styles.sequenceType}>{step.type}: <span style={{color: '#22d3ee'}}>{step.subject}</span></div>
                            <div style={styles.sequenceDesc}>{step.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <h3 style={{...styles.setupSubtitle, marginTop: '2rem'}}>✍️ Plantilla Email (Día 1)</h3>
                    <div style={styles.emailTemplate}>
                      <div style={styles.emailSubject}><strong>Subject:</strong> {`{{firstName}}`}, ¿$247K/año en Salesforce es sostenible?</div>
                      <div style={styles.emailBody}>
                        <p>Hi {`{{firstName}}`},</p>
                        <p>I noticed {`{{company}}`} is using Salesforce. Quick question: are you using more than 20% of its features?</p>
                        <p>Most SMBs we talk to spend $200-300K/year on a CRM that's designed for enterprises 10x their size.</p>
                        <p>We help companies like {`{{company}}`} migrate to custom-built solutions that:</p>
                        <ul><li>Cost 1/3 of your current Salesforce bill</li><li>Include only the features you actually use</li><li>Pay for themselves in 12-18 months</li></ul>
                        <p>Would a 15-min call to see if this makes sense for {`{{company}}`} be worth your time?</p>
                        <p>Best,<br/>[Your name]</p>
                      </div>
                    </div>

                    <h3 style={{...styles.setupSubtitle, marginTop: '2rem'}}>🛠️ Stack de Herramientas</h3>
                    <div style={styles.toolsGrid}>
                      {PLATFORMS_CONFIG.outbound.stackCosts.map((tool, i) => (
                        <div key={i} style={styles.toolCard}><div style={styles.toolName}>{tool.name}</div><div style={styles.toolUse}>{tool.use}</div><div style={styles.toolPrice}>~€{tool.cost}/mes</div></div>
                      ))}
                    </div>
                    <p style={styles.stackTotal}>Coste total stack: ~€{PLATFORMS_CONFIG.outbound.stackCosts.reduce((sum, t) => sum + t.cost, 0)}/mes</p>
                  </>
                )}
              </div>
            </section>

            <div style={styles.backSection}>
              <button onClick={() => setCurrentView('home')} style={styles.backButtonLarge}>← Volver al Plan de Medios</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // HOME VIEW
  // ============================================
  return (
    <div style={styles.container}>
      <button style={styles.calculatorToggle} onClick={() => setShowCalculator(!showCalculator)}>{showCalculator ? '✕ Cerrar' : '⚙️ Personaliza tu Plan'}</button>
      
      {/* Calculator Panel */}
      {showCalculator && (
        <div style={styles.calculatorPanel}>
          <div style={styles.calculatorInner}>
            <div style={styles.calculatorHeader}>
              <h2 style={styles.calculatorTitle}>⚙️ Personaliza tu Plan</h2>
              <button style={styles.resetButton} onClick={resetToRecommended}>↺ Restaurar Recomendado</button>
            </div>
            
            <div style={styles.calculatorMainInputs}>
              <div style={styles.calcInputGroup}>
                <label style={styles.calcInputLabel}>💰 Inversión Mensual (mín. €2.000)</label>
                <input type="number" min="2000" step="100" value={monthlyBudget} onChange={(e) => handleBudgetChange(parseInt(e.target.value) || 2000)} style={styles.calcInput} />
                <input type="range" min="2000" max="10000" step="100" value={monthlyBudget} onChange={(e) => handleBudgetChange(parseInt(e.target.value))} style={styles.slider} />
              </div>
              <div style={styles.calcInputGroup}>
                <label style={styles.calcInputLabel}>🎯 Leads Objetivo (CPL conservador: €{CPL_SCENARIOS.conservative})</label>
                <input type="number" min="1" step="1" value={targetLeads} onChange={(e) => handleLeadsChange(parseInt(e.target.value) || 1)} style={styles.calcInput} />
                <input type="range" min="5" max="100" step="1" value={targetLeads} onChange={(e) => handleLeadsChange(parseInt(e.target.value))} style={styles.slider} />
              </div>
            </div>

            <div style={styles.calculatorGrid}>
              <div style={styles.calcSection}>
                <h3 style={styles.calcSectionTitle}>📈 Conversión</h3>
                <label style={styles.calcLabel}>Lead→Cliente: {conversionRate}%</label>
                <input type="range" min="5" max="20" step="1" value={conversionRate} onChange={(e) => setConversionRate(parseInt(e.target.value))} style={styles.slider} />
                <label style={styles.calcLabel}>LTV Cliente (3 años): {formatCurrency(avgTicket, '$')}</label>
                <input type="range" min="3000" max="15000" step="1000" value={avgTicket} onChange={(e) => setAvgTicket(parseInt(e.target.value))} style={styles.slider} />
              </div>
              <div style={styles.calcSection}>
                <h3 style={styles.calcSectionTitle}>📢 Plataformas</h3>
                {Object.entries(PLATFORMS_CONFIG).map(([key, config]) => (
                  <div key={key} style={styles.calcRow}>
                    <label style={styles.calcToggleLabel}>
                      <input type="checkbox" checked={platforms[key]?.enabled || false} onChange={() => togglePlatform(key)} style={styles.checkbox} disabled={key === 'youtube'} />
                      <span style={{opacity: platforms[key]?.enabled ? 1 : 0.4}}>
                        {config.icon} {config.name}
                        {config.isOptional && <span style={styles.optionalBadge}>OPCIONAL</span>}
                        {key === 'youtube' && <span style={styles.disabledLabel}>DESACTIVADO</span>}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
              <div style={styles.calcSection}>
                <h3 style={styles.calcSectionTitle}>🎯 Verticales</h3>
                {Object.entries(VERTICALS_DATA).map(([key, data]) => (
                  <div key={key} style={styles.calcRow}>
                    <label style={styles.calcToggleLabel}><input type="checkbox" checked={verticals[key]?.enabled || false} onChange={() => toggleVertical(key)} style={styles.checkbox} /><span style={{opacity: verticals[key]?.enabled ? 1 : 0.4}}>{data.icon} {data.name}</span></label>
                  </div>
                ))}
              </div>
              <div style={styles.calcSection}>
                <h3 style={styles.calcSectionTitle}>🌍 Mercados</h3>
                {Object.entries(REGIONS_DATA).map(([key, data]) => (
                  <div key={key} style={styles.calcRow}>
                    <label style={styles.calcToggleLabel}><input type="checkbox" checked={regions[key]?.enabled || false} onChange={() => toggleRegion(key)} style={styles.checkbox} /><span style={{opacity: regions[key]?.enabled ? 1 : 0.4}}>{data.flag} {data.name}</span></label>
                  </div>
                ))}
              </div>
              <div style={styles.calcSection}>
                <h3 style={styles.calcSectionTitle}>🔧 Tácticas</h3>
                {Object.entries(TACTICS_DATA).map(([key, data]) => (
                  <div key={key} style={styles.calcRow}>
                    <label style={styles.calcToggleLabel}><input type="checkbox" checked={tactics[key]?.enabled || false} onChange={() => toggleTactic(key)} style={styles.checkbox} /><span style={{opacity: tactics[key]?.enabled ? 1 : 0.4}}>{data.icon} {data.name}</span></label>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.livePreview}>
              <div style={styles.previewGrid}>
                <div style={styles.previewItem}><span style={styles.previewLabel}>Inversión</span><span style={styles.previewValueLarge}>{formatCurrency(monthlyBudget)}</span></div>
                <div style={styles.previewItem}><span style={styles.previewLabel}>Leads/Mes</span><span style={styles.previewValue}>{metrics.leadsPerMonth}</span></div>
                <div style={styles.previewItem}><span style={styles.previewLabel}>CPL Est.</span><span style={styles.previewValue}>{formatCurrency(metrics.cpl)}</span></div>
                <div style={styles.previewItem}><span style={styles.previewLabel}>Clientes**</span><span style={styles.previewValue}>{metrics.customersPerMonth.toFixed(1)}</span></div>
                <div style={styles.previewItem}><span style={styles.previewLabel}>ROAS**</span><span style={{...styles.previewValue, color: '#34d399'}}>{metrics.roas.toFixed(1)}x</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <span style={styles.navLogo}>Restack</span>
          <div style={styles.navLinks}>
            <a href="#summary" style={styles.navLink}>Summary</a>
            <a href="#strategy" style={styles.navLink}>Estrategia</a>
            <a href="#platforms" style={styles.navLink}>Plataformas</a>
            <a href="#kpis" style={styles.navLink}>KPIs</a>
            <a href="#methodology" style={styles.navLink}>Metodología</a>
            <a href="#contact" style={styles.navLink}>Contacto</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}><span style={styles.heroBadgeDot}></span>Plan de Medios Q1-Q4 2026</div>
          <h1 style={styles.heroTitle}>De SaaS Fatigue a Custom Freedom</h1>
          <p style={styles.heroSubtitle}>Plan estratégico de adquisición de clientes para servicios de migración SaaS → Custom Software. Diseñado para capturar el mercado de $165B+ en CRM, Project Management y Accounting.</p>
          <div style={styles.heroMetrics}>
            <div style={styles.heroMetricItem}><div style={styles.heroMetricValue}>{formatCurrency(monthlyBudget)}</div><div style={styles.heroMetricLabel}>INVERSIÓN TEST</div></div>
            <div style={styles.heroMetricItem}><div style={styles.heroMetricValue}>{metrics.scenarios.probable.leads}</div><div style={styles.heroMetricLabel}>LEADS PROYECTADOS</div></div>
            <div style={styles.heroMetricItem}><div style={styles.heroMetricValue}>{formatCurrency(metrics.scenarios.probable.revenue, '$')}</div><div style={styles.heroMetricLabel}>REVENUE POTENCIAL</div></div>
          </div>
        </div>
      </header>

      {/* 01 - EXECUTIVE SUMMARY */}
      <section id="summary" style={styles.section}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionNumber}>01</span>
            <h2 style={styles.sectionTitle}>Executive Summary — Test 1 Mes</h2>
            <p style={styles.sectionSubtitle}>Objetivo principal: validar captación de leads y calibrar CPL real</p>
          </div>

          <div style={styles.summaryGrid}>
            <div style={{...styles.summaryCard, ...styles.summaryCardHighlight}}>
              <span style={styles.summaryBadge}>🎯 OBJETIVO PRINCIPAL</span>
              <div style={styles.summaryIcon}>💼</div>
              <div style={styles.summaryLabel}>Leads a Captar</div>
              <div style={styles.summaryValueXL}>{metrics.scenarios.probable.leads}</div>
              <div style={styles.summarySub}>MQLs durante el mes de test</div>
              <p style={styles.summaryNote}>* Estimación basada en CPL probable de €{CPL_SCENARIOS.probable}. El objetivo del test es validar este CPL con datos reales.</p>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryIcon}>💰</div>
              <div style={styles.summaryLabel}>Inversión del Test</div>
              <div style={styles.summaryValue}>{formatCurrency(monthlyBudget)}</div>
              <div style={styles.summarySub}>Distribuida en 3 plataformas</div>
              <p style={styles.summaryNote}>* Budget recomendado para obtener volumen estadísticamente significativo y capacidad de optimización durante el test.</p>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryIcon}>📊</div>
              <div style={styles.summaryLabel}>CPL Objetivo</div>
              <div style={styles.summaryValue}>€{CPL_SCENARIOS.probable}</div>
              <div style={styles.summarySub}>Coste por Lead estimado</div>
              <p style={styles.summaryNote}>* Basado en benchmarks de LinkedIn Ads, Google Ads, Meta Ads. Rango esperado: ±30% según performance de creativos.</p>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryIcon}>🔄</div>
              <div style={styles.summaryLabel}>Clientes Potenciales**</div>
              <div style={styles.summaryValue}>{metrics.scenarios.probable.clients.toFixed(1)}</div>
              <div style={styles.summarySub}>Conversión estimada post-nurturing</div>
              <p style={styles.summaryNote}>** KPI secundario. El ciclo de venta B2B es de 3-6 meses. Estos cierres se materializarían después del periodo de test.</p>
            </div>
          </div>

          <div style={styles.objectivesBox}>
            <h3 style={styles.objectivesTitle}>🎯 Objetivos del Test de 1 Mes</h3>
            <div style={styles.objectivesGrid}>
              <div style={styles.objectiveItem}><span style={styles.objectiveNum}>1</span><div><strong>Validar CPL Real</strong><p>Confirmar que el CPL estimado de €{CPL_SCENARIOS.probable} es alcanzable con el ICP definido</p></div></div>
              <div style={styles.objectiveItem}><span style={styles.objectiveNum}>2</span><div><strong>Identificar Mejor Canal</strong><p>Determinar qué plataforma genera leads de mayor calidad para escalar post-test</p></div></div>
              <div style={styles.objectiveItem}><span style={styles.objectiveNum}>3</span><div><strong>Captar {metrics.scenarios.probable.leads}+ Leads</strong><p>Generar pipeline inicial para comenzar proceso de nurturing y cualificación</p></div></div>
              <div style={styles.objectiveItem}><span style={styles.objectiveNum}>4</span><div><strong>Validar Messaging</strong><p>Testear qué ángulos de dolor (coste, complejidad, lock-in) resuenan mejor</p></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* 02 - LA ESTRATEGIA */}
      <section id="strategy" style={{...styles.section, background: '#0a0a0f'}}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionNumber}>02</span>
            <h2 style={styles.sectionTitle}>La Estrategia</h2>
            <p style={styles.sectionSubtitle}>Capturamos demanda existente, no la creamos. Los pain points ya están ahí.</p>
          </div>

          <div style={styles.strategyIntro}>
            <p>El mercado SaaS está experimentando un fenómeno que llamamos <strong style={{color: '#22d3ee'}}>"SaaS Fatigue"</strong>: empresas que gastan $200K+ anuales en herramientas que usan al 20% de su capacidad, con soporte deficiente, vendor lock-in, y complejidad innecesaria.</p>
          </div>

          <p style={styles.strategyText}>Nuestra estrategia se basa en <strong style={{color: '#e8e8ed'}}>interceptar esta demanda latente</strong> en el momento exacto en que los decision-makers buscan alternativas, sienten frustración, o evalúan opciones.</p>

          {/* Funnel */}
          <div style={styles.funnelV1}>
            <div style={styles.funnelStageV1}><div style={{...styles.funnelBarV1, width: '100%', background: 'linear-gradient(90deg, #6366f1, #22d3ee)'}}><span style={styles.funnelTextV1}>AWARENESS — Ads + Content</span></div><div style={styles.funnelDataV1}><span style={styles.funnelValueV1}>{formatNumber(metrics.impressions)}</span><span style={styles.funnelLabelV1}>Impresiones/mes</span></div></div>
            <div style={styles.funnelStageV1}><div style={{...styles.funnelBarV1, width: '80%', background: 'linear-gradient(90deg, #22d3ee, #34d399)'}}><span style={styles.funnelTextV1}>INTEREST — Clicks + Engagement</span></div><div style={styles.funnelDataV1}><span style={styles.funnelValueV1}>{formatNumber(metrics.clicks)}</span><span style={styles.funnelLabelV1}>Clicks/mes (2% CTR)</span></div></div>
            <div style={styles.funnelStageV1}><div style={{...styles.funnelBarV1, width: '55%', background: 'linear-gradient(90deg, #34d399, #4ade80)'}}><span style={styles.funnelTextV1}>CONSIDERATION — Landing Page</span></div><div style={styles.funnelDataV1}><span style={styles.funnelValueV1}>{formatNumber(metrics.landing)}</span><span style={styles.funnelLabelV1}>Engaged visitors (10%)</span></div></div>
            <div style={styles.funnelStageV1}><div style={{...styles.funnelBarV1, width: '35%', background: 'linear-gradient(90deg, #4ade80, #86efac)'}}><span style={styles.funnelTextV1}>CONVERSION — Leads</span></div><div style={styles.funnelDataV1}><span style={styles.funnelValueV1}>{metrics.scenarios.conservative.leads}-{metrics.scenarios.optimistic.leads}</span><span style={styles.funnelLabelV1}>MQLs/mes (5-8%)</span></div></div>
            <div style={styles.funnelStageV1}><div style={{...styles.funnelBarV1, width: '20%', background: '#f87171'}}><span style={styles.funnelTextV1}>CLIENTE</span></div><div style={styles.funnelDataV1}><span style={styles.funnelValueV1}>{Math.round(metrics.scenarios.conservative.clients)}-{Math.round(metrics.scenarios.optimistic.clients)}</span><span style={styles.funnelLabelV1}>Clientes/mes (8-12%)</span></div></div>
          </div>
        </div>
      </section>

      {/* 03 - PLATAFORMAS */}
      <section id="platforms" style={styles.section}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionNumber}>03</span>
            <h2 style={styles.sectionTitle}>Plataformas</h2>
            <p style={styles.sectionSubtitle}>Haz clic en cada plataforma para ver la estrategia completa de implementación</p>
          </div>
          <div style={styles.platformsGrid}>
            {Object.entries(PLATFORMS_CONFIG).map(([key, config]) => {
              const isEnabled = platforms[key]?.enabled;
              const metric = metrics.platformMetrics[key] || { budget: 0, leads: 0, percentage: 0, cpl: config.cplRange[0] };
              const isYouTube = key === 'youtube';
              const isOptional = config.isOptional;
              
              return (
                <div key={key} style={{...styles.platformCardV4, opacity: isEnabled ? 1 : 0.4, cursor: isEnabled ? 'pointer' : 'default'}} onClick={() => isEnabled && (setSelectedPlatform(key), setCurrentView('platform-detail'))}>
                  <div style={{...styles.platformCardHeaderV4, background: isEnabled ? `linear-gradient(135deg, ${config.color}, ${config.color}99)` : '#2a2a3a'}}>
                    <span style={styles.platformCardIcon}>{config.icon}</span>
                    <span style={styles.platformCardName}>{config.name}</span>
                    {isYouTube && <span style={styles.disabledBadge}>DESACTIVADO</span>}
                    {isOptional && !isYouTube && <span style={styles.optionalBadgeCard}>OPCIONAL</span>}
                    {isEnabled && !isYouTube && !isOptional && <span style={{...styles.typeBadgeV4, background: config.channelType === 'inbound' ? '#22d3ee' : '#8b5cf6'}}>{config.channelType === 'inbound' ? 'INBOUND' : 'OUTBOUND'}</span>}
                  </div>
                  <div style={styles.platformCardBodyV4}>
                    <div style={styles.platformStatsV4}>
                      <div style={styles.platformStatV4}><span style={styles.statLabelV4}>BUDGET</span><span style={styles.statValueV4}>{formatCurrency(metric.budget)}</span></div>
                      <div style={styles.platformStatV4}><span style={styles.statLabelV4}>LEADS*</span><span style={{...styles.statValueV4, color: '#22d3ee'}}>{metric.leads}</span></div>
                      <div style={styles.platformStatV4}><span style={styles.statLabelV4}>CPL*</span><span style={styles.statValueV4}>{formatCurrency(metric.cpl)}</span></div>
                    </div>
                    <div style={styles.minInvestmentBox}>Inversión mínima: {formatCurrency(config.minBudget)}/mes</div>
                    <div style={styles.adTypesPreview}>
                      <strong>Tipos de Anuncios recomendados:</strong>
                      <ul style={styles.adTypesList}>{config.adTypes.filter(a => a.forTest).map(a => <li key={a.id}>{a.name}</li>)}</ul>
                    </div>
                    {isEnabled && <button style={styles.viewStrategyBtnV4}>Ver Estrategia Completa →</button>}
                    <p style={styles.cplNote}>* CPL basado en benchmarks B2B SaaS. Valores pueden variar ±30%.</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 04 - VERTICALES TARGET */}
      <section style={{...styles.section, background: '#0a0a0f'}}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionNumber}>04</span>
            <h2 style={styles.sectionTitle}>Verticales Target</h2>
            <p style={styles.sectionSubtitle}>Priorización basada en scoring del Market Analysis Report</p>
          </div>
          <div style={styles.verticalesGrid}>
            {Object.entries(VERTICALS_DATA).map(([key, data]) => (
              <div key={key} style={{...styles.verticalCard, opacity: data.enabled ? 1 : 0.5, border: data.enabled ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.05)'}}>
                {!data.enabled && <span style={styles.faseFuturaBadge}>FASE FUTURA</span>}
                <div style={styles.verticalIcon}>{data.icon}</div>
                <h3 style={styles.verticalName}>{data.name}</h3>
                <div style={styles.verticalTier}>{data.tier}</div>
                <div style={styles.verticalScore}>Score: {data.score}/25</div>
                <div style={styles.verticalMarket}>Mercado: {data.market}</div>
                <p style={styles.verticalDesc}>{data.description}</p>
              </div>
            ))}
          </div>
          <p style={styles.verticalNote}>* Scoring basado en: tamaño de mercado, nivel de insatisfacción, coste justificable, y facilidad de replicación (fuente: Market Analysis Report).</p>
        </div>
      </section>

      {/* 05 - PRESUPUESTO DEL TEST */}
      <section style={styles.section}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionNumber}>05</span>
            <h2 style={styles.sectionTitle}>Presupuesto del Test</h2>
            <p style={styles.sectionSubtitle}>Distribución de {formatCurrency(monthlyBudget)} para el mes de prueba</p>
          </div>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>PLATAFORMA</th>
                  <th style={styles.th}>BUDGET TEST</th>
                  <th style={styles.th}>% DEL TOTAL</th>
                  <th style={styles.th}>LEADS EST.*</th>
                  <th style={styles.th}>CPL EST.*</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(PLATFORMS_CONFIG).map(([key, config]) => {
                  const isEnabled = platforms[key]?.enabled;
                  const metric = metrics.platformMetrics[key] || { budget: 0, leads: 0, percentage: 0, cpl: config.cplRange[0] };
                  return (
                    <tr key={key} style={{...styles.tr, opacity: isEnabled ? 1 : 0.4}}>
                      <td style={styles.td}>{config.icon} {config.name} {config.isOptional && <span style={styles.optionalTag}>OPC</span>}</td>
                      <td style={{...styles.td, ...styles.tdCyan}}>{formatCurrency(metric.budget)}</td>
                      <td style={styles.td}>{metric.percentage}%</td>
                      <td style={{...styles.td, ...styles.tdCyan, fontWeight: 700}}>{metric.leads}</td>
                      <td style={{...styles.td, ...styles.tdCyan}}>{formatCurrency(metric.cpl)}</td>
                    </tr>
                  );
                })}
                <tr style={styles.totalRow}>
                  <td style={styles.td}><strong>TOTAL TEST (1 MES)</strong></td>
                  <td style={{...styles.td, ...styles.tdGreen}}>{formatCurrency(monthlyBudget)}</td>
                  <td style={styles.td}>100%</td>
                  <td style={{...styles.td, ...styles.tdGreen, fontWeight: 700}}>{metrics.leadsPerMonth}</td>
                  <td style={{...styles.td, ...styles.tdGreen}}>{formatCurrency(metrics.cpl)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={styles.tableNote}>* Estimaciones basadas en CPL promedio de benchmarks de industria. Los CPL reales pueden variar ±30% dependiendo de la calidad de creativos, segmentación y competencia en subasta. El objetivo del test es validar estos CPL con datos reales para calibrar proyecciones futuras.</p>
        </div>
      </section>

      {/* 06 - KPIs DEL TEST */}
      <section id="kpis" style={{...styles.section, background: '#0a0a0f'}}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionNumber}>06</span>
            <h2 style={styles.sectionTitle}>KPIs del Test</h2>
            <p style={styles.sectionSubtitle}>Métricas mensuales — Objetivo principal: captación de leads</p>
          </div>

          <h3 style={styles.kpiGroupTitle}>🎯 KPIs Primarios (Objetivo del Test)</h3>
          <div style={styles.kpiPrimaryGrid}>
            <div style={{...styles.kpiCardLarge, background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(34,211,238,0.05))', border: '1px solid rgba(34,211,238,0.3)'}}>
              <div style={styles.kpiLabelSmall}>LEADS A CAPTAR</div>
              <div style={styles.kpiValueHuge}>{metrics.scenarios.probable.leads}</div>
              <div style={styles.kpiSubtext}>MQLs durante el mes de test</div>
            </div>
            <div style={styles.kpiCardMedium}>
              <div style={styles.kpiLabelSmall}>CPL OBJETIVO</div>
              <div style={styles.kpiValueLarge}>€{CPL_SCENARIOS.probable}</div>
              <div style={styles.kpiSubtext}>Coste por Lead*</div>
            </div>
            <div style={styles.kpiCardMedium}>
              <div style={styles.kpiLabelSmall}>INVERSIÓN TEST</div>
              <div style={styles.kpiValueLarge}>{formatCurrency(monthlyBudget)}</div>
              <div style={styles.kpiSubtext}>Budget 1 mes</div>
            </div>
          </div>
          <p style={styles.kpiNote}>* El CPL es la métrica clave a validar. El test debe confirmar si el CPL estimado de €{CPL_SCENARIOS.probable} es alcanzable con el ICP y messaging definidos.</p>

          <h3 style={{...styles.kpiGroupTitle, marginTop: '3rem'}}>📊 KPIs Secundarios (Proyección Post-Test)</h3>
          <div style={styles.kpiSecondaryGrid}>
            <div style={styles.kpiCardSmall}><div style={styles.kpiLabelSmall}>CLIENTES POTENCIALES**</div><div style={styles.kpiValueMedium}>{metrics.scenarios.probable.clients.toFixed(1)}</div><div style={styles.kpiSubtext}>Conv. {conversionRate}% (3-6 meses)</div></div>
            <div style={styles.kpiCardSmall}><div style={styles.kpiLabelSmall}>REVENUE POTENCIAL**</div><div style={styles.kpiValueMedium}>{formatCurrency(metrics.scenarios.probable.revenue, '$')}</div><div style={styles.kpiSubtext}>LTV: ${avgTicket.toLocaleString()} (3 años)</div></div>
            <div style={styles.kpiCardSmall}><div style={styles.kpiLabelSmall}>CAC ESTIMADO**</div><div style={styles.kpiValueMedium}>{formatCurrency(metrics.cac)}</div><div style={styles.kpiSubtext}>Coste Adquisición Cliente</div></div>
            <div style={styles.kpiCardSmall}><div style={styles.kpiLabelSmall}>ROAS POTENCIAL**</div><div style={{...styles.kpiValueMedium, color: '#34d399'}}>{metrics.roas.toFixed(1)}x</div><div style={styles.kpiSubtext}>Return on Ad Spend</div></div>
          </div>
          <p style={styles.kpiNote}>** Estos KPIs son proyecciones a largo plazo. El ciclo de venta B2B para servicios de $30-100K es de 3-6 meses.</p>

          {/* Escenarios */}
          <div style={styles.scenariosBox}>
            <h3 style={styles.scenariosTitle}>Escenarios de Captación de Leads</h3>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ESCENARIO</th>
                    <th style={styles.th}>CPL</th>
                    <th style={styles.th}>LEADS/MES</th>
                    <th style={styles.th}>CLIENTES POTENCIALES**</th>
                    <th style={styles.th}>REVENUE POTENCIAL**</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={styles.tr}>
                    <td style={styles.td}><span style={{color: '#f87171'}}>🔴</span> Conservador (+30% CPL)</td>
                    <td style={{...styles.td, color: '#22d3ee'}}>€{metrics.scenarios.conservative.cpl}</td>
                    <td style={{...styles.td, color: '#22d3ee', fontWeight: 700}}>{metrics.scenarios.conservative.leads}</td>
                    <td style={styles.td}>{metrics.scenarios.conservative.clients.toFixed(1)}</td>
                    <td style={{...styles.td, color: '#22d3ee'}}>{formatCurrency(metrics.scenarios.conservative.revenue, '$')}</td>
                  </tr>
                  <tr style={styles.tr}>
                    <td style={styles.td}><span style={{color: '#fbbf24'}}>🟡</span> Probable (Base)</td>
                    <td style={{...styles.td, color: '#22d3ee'}}>€{metrics.scenarios.probable.cpl}</td>
                    <td style={{...styles.td, color: '#22d3ee', fontWeight: 700}}>{metrics.scenarios.probable.leads}</td>
                    <td style={styles.td}>{metrics.scenarios.probable.clients.toFixed(1)}</td>
                    <td style={{...styles.td, color: '#22d3ee'}}>{formatCurrency(metrics.scenarios.probable.revenue, '$')}</td>
                  </tr>
                  <tr style={styles.tr}>
                    <td style={styles.td}><span style={{color: '#34d399'}}>🟢</span> Optimista (-20% CPL)</td>
                    <td style={{...styles.td, color: '#22d3ee'}}>€{metrics.scenarios.optimistic.cpl}</td>
                    <td style={{...styles.td, color: '#22d3ee', fontWeight: 700}}>{metrics.scenarios.optimistic.leads}</td>
                    <td style={styles.td}>{metrics.scenarios.optimistic.clients.toFixed(1)}</td>
                    <td style={{...styles.td, color: '#22d3ee'}}>{formatCurrency(metrics.scenarios.optimistic.revenue, '$')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={styles.scenariosSourceNote}>📚 <strong>Fuentes CPL:</strong> Benchmarks basados en informes de industria B2B SaaS 2024: LinkedIn Ads (€150-250 CPL), Google Ads Search (€80-150 CPL), Meta Ads B2B (€50-100 CPL). Fuentes: Metadata.io "B2B Paid Social Benchmark Report", HubSpot "Marketing Statistics", WordStream "Google Ads Benchmarks". Los CPL reales pueden variar según creativos, segmentación y competencia en subasta.</p>
          </div>
        </div>
      </section>

      {/* 07 - DISTRIBUCIÓN REGIONAL */}
      <section style={styles.section}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionNumber}>07</span>
            <h2 style={styles.sectionTitle}>Distribución Regional</h2>
            <p style={styles.sectionSubtitle}>{metrics.activeRegions} región activa para el test</p>
          </div>
          <div style={styles.regionsGrid}>
            {Object.entries(REGIONS_DATA).map(([key, data]) => {
              const isEnabled = regions[key]?.enabled;
              return (
                <div key={key} style={{...styles.regionCardV4, opacity: isEnabled ? 1 : 0.5, border: isEnabled ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.05)'}}>
                  {!isEnabled && <span style={styles.faseFuturaBadge}>FASE FUTURA</span>}
                  <div style={styles.regionHeaderV4}>
                    <span style={styles.regionFlag}>{data.flag}</span>
                    <div>
                      <h3 style={styles.regionName}>{data.name}</h3>
                      <span style={styles.regionPct}>{isEnabled ? '100%' : '0%'} del presupuesto</span>
                    </div>
                  </div>
                  <div style={styles.regionBodyV4}>
                    <div style={styles.regionStatRow}><span>Budget Test</span><span style={styles.regionStatValue}>{isEnabled ? formatCurrency(monthlyBudget) : '€0'}</span></div>
                    <div style={{...styles.regionStatRow, ...styles.regionStatHighlight}}><span>Leads Est.*</span><span style={styles.regionStatValueLarge}>{isEnabled ? metrics.leadsPerMonth : '0'}</span></div>
                  </div>
                  <p style={styles.regionNote}>* Para un test de 1 mes, concentrar budget en menos regiones genera datos más significativos.</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 08 - TÁCTICAS ACTIVAS */}
      <section style={{...styles.section, background: '#0a0a0f'}}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionNumber}>08</span>
            <h2 style={styles.sectionTitle}>Tácticas Activas</h2>
            <p style={styles.sectionSubtitle}>Estrategias complementarias durante el test</p>
          </div>

          <h3 style={styles.tacticGroupTitle}>🎯 Estrategia Performance (Test)</h3>
          <div style={styles.tacticsGridV4}>
            {Object.entries(TACTICS_DATA).filter(([_, t]) => t.strategy === 'performance').map(([key, data]) => {
              const isEnabled = tactics[key]?.enabled;
              return (
                <div key={key} style={{...styles.tacticCardV4, opacity: isEnabled ? 1 : 0.5, border: isEnabled ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.05)'}}>
                  {!isEnabled && <span style={styles.disabledBadgeSmall}>DESACTIVADO</span>}
                  <div style={styles.tacticIconLarge}>{data.icon}</div>
                  <h4 style={styles.tacticName}>{data.name}</h4>
                  <p style={styles.tacticDesc}>{data.description}</p>
                  {data.note && <p style={styles.tacticNote}>{data.note}</p>}
                </div>
              );
            })}
          </div>

          <h3 style={{...styles.tacticGroupTitle, marginTop: '2.5rem'}}>📢 Estrategia Awareness (Fases Futuras)</h3>
          <div style={styles.tacticsGridV4}>
            {Object.entries(TACTICS_DATA).filter(([_, t]) => t.strategy === 'awareness').map(([key, data]) => (
              <div key={key} style={{...styles.tacticCardV4, opacity: 0.5, border: '1px solid rgba(255,255,255,0.05)'}}>
                <span style={styles.faseFuturaBadge}>FASE FUTURA</span>
                <div style={styles.tacticIconLarge}>{data.icon}</div>
                <h4 style={styles.tacticName}>{data.name}</h4>
                <p style={styles.tacticDesc}>{data.description}</p>
              </div>
            ))}
          </div>
          <p style={styles.tacticsNote}>* Las tácticas de awareness se recomiendan una vez establecidos los KPIs base del test inicial.</p>
        </div>
      </section>

      {/* 09 - METODOLOGÍA DE MEDICIÓN */}
      <section id="methodology" style={styles.section}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionNumber}>09</span>
            <h2 style={styles.sectionTitle}>Metodología de Medición</h2>
            <p style={styles.sectionSubtitle}>Cómo medimos, optimizamos y tomamos decisiones</p>
          </div>

          <h3 style={styles.subSectionTitle}>📊 KPIs y Targets</h3>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>KPI</th><th style={styles.th}>TARGET</th><th style={styles.th}>FRECUENCIA</th><th style={styles.th}>ACCIÓN SI NO SE CUMPLE</th></tr></thead>
              <tbody>
                {MEASUREMENT_METHODOLOGY.kpis.map((kpi, i) => (
                  <tr key={i} style={styles.tr}><td style={styles.td}>{kpi.name}</td><td style={{...styles.td, ...styles.tdCyan}}>{kpi.target}</td><td style={styles.td}>{kpi.frequency}</td><td style={styles.td}>{kpi.action}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 style={{...styles.subSectionTitle, marginTop: '3rem'}}>⚡ Protocolo de Optimización</h3>
          <div style={styles.optimizationGrid}>
            {MEASUREMENT_METHODOLOGY.optimization.map((opt, i) => (
              <div key={i} style={styles.optimizationCard}>
                <div style={styles.optimizationTrigger}>🚨 {opt.trigger}</div>
                <div style={styles.optimizationAction}>→ {opt.action}</div>
                <div style={styles.optimizationTimeline}>⏱️ {opt.timeline}</div>
              </div>
            ))}
          </div>

          <h3 style={{...styles.subSectionTitle, marginTop: '3rem'}}>📋 Reporting</h3>
          <div style={styles.reportingGrid}>
            {MEASUREMENT_METHODOLOGY.reporting.map((report, i) => (
              <div key={i} style={styles.reportingCard}>
                <h4 style={styles.reportingType}>{report.type}</h4>
                <p style={styles.reportingContent}>{report.content}</p>
                <p style={styles.reportingFormat}>📄 {report.format}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10 - CONTACTO */}
      <section id="contact" style={{...styles.section, background: '#0a0a0f'}}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionNumber}>10</span>
            <h2 style={styles.sectionTitle}>¿Preguntas sobre esta Propuesta?</h2>
          </div>
          <div style={styles.contactCardFinal}>
            <div style={styles.contactInfoFinal}>
              <div style={styles.contactAvatarFinal}>
                <img src={PROFILE_PHOTO} alt="Saúl Noda" style={styles.contactPhotoFinal} onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#6366f1,#22d3ee);color:#08080d;font-weight:700;font-size:1.5rem">SN</div>'; }} />
              </div>
              <div style={styles.contactDetailsFinal}>
                <h3 style={styles.contactNameFinal}>Saúl Noda</h3>
                <p style={styles.contactRoleFinal}>🚀 Impulsando negocios en la era digital.</p>
                <p style={styles.contactBioFinal}>Consultor en Transformación Digital, Publicidad y Marketing para Agencias y Anunciantes.</p>
              </div>
            </div>
            <div style={styles.contactLinksFinal}>
              <a href="https://saulnoda.com" target="_blank" rel="noopener noreferrer" style={styles.contactLinkFinal}>🌐 saulnoda.com</a>
              <a href="mailto:hola@saulnoda.com" style={styles.contactLinkFinal}>✉️ hola@saulnoda.com</a>
              <a href="https://linkedin.com/in/saulnoda" target="_blank" rel="noopener noreferrer" style={styles.contactLinkFinal}>💼 LinkedIn</a>
            </div>
            <div style={styles.contactCTAFinal}>
              <p style={styles.ctaTextFinal}>¿Listo para lanzar el test o necesitas ajustar algún parámetro?</p>
              <div style={styles.ctaButtonsRowFinal}>
                <button style={styles.ctaBtnFinal} onClick={() => setCurrentView('comenzar')}>Ver Siguientes Pasos →</button>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" style={styles.whatsappBtnSmall}>💬 WhatsApp</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        <div style={styles.footerBottom}>
          <p><strong>Test 1 Mes</strong> | {formatCurrency(monthlyBudget)} | {metrics.scenarios.probable.leads} Leads</p>
          <p style={{marginTop: '0.5rem', opacity: 0.7}}>Diseñado por <a href="https://saulnoda.com" style={{color: '#22d3ee'}}>SaulNoda.com</a> • Enero 2026</p>
        </div>
      </footer>
    </div>
  );
}

// ============================================
// STYLES
// ============================================
const styles = {
  container: { fontFamily: "'Inter', -apple-system, sans-serif", background: '#08080d', color: '#e8e8ed', minHeight: '100vh', lineHeight: 1.7, backgroundImage: 'linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)', backgroundSize: '50px 50px' },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0.75rem 2rem', background: 'rgba(8,8,13,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  navInner: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navLogo: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.4rem', fontWeight: 600 },
  navLinks: { display: 'flex', gap: '1.5rem' },
  navLink: { color: '#8b8b9e', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500 },
  navTitle: { fontSize: '0.9rem', color: '#8b8b9e' },
  backButton: { background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.35)', color: '#a5b4fc', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' },
  calculatorToggle: { position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 1000, background: 'linear-gradient(135deg, #6366f1, #22d3ee)', color: '#08080d', border: 'none', padding: '0.875rem 1.5rem', borderRadius: '100px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 8px 32px rgba(99,102,241,0.35)' },
  calculatorPanel: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, background: 'rgba(8,8,13,0.98)', backdropFilter: 'blur(20px)', overflow: 'auto', padding: '1.5rem' },
  calculatorInner: { maxWidth: '900px', margin: '0 auto' },
  calculatorHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  calculatorTitle: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.5rem', fontWeight: 500, background: 'linear-gradient(135deg, #e8e8ed, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  resetButton: { background: 'rgba(99,102,241,0.12)', border: '1px solid #6366f1', color: '#a5b4fc', padding: '0.6rem 1.25rem', borderRadius: '100px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 },
  calculatorMainInputs: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' },
  calcInputGroup: { background: '#111118', borderRadius: '14px', padding: '1.25rem', border: '1px solid rgba(99,102,241,0.2)' },
  calcInputLabel: { display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: '#e8e8ed' },
  calcInput: { width: '100%', background: '#08080d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.75rem', color: '#22d3ee', fontSize: '1.5rem', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, marginBottom: '0.5rem' },
  calculatorGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  calcSection: { background: '#111118', borderRadius: '14px', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)' },
  calcSectionTitle: { fontSize: '0.75rem', fontWeight: 600, color: '#22d3ee', marginBottom: '0.75rem', textTransform: 'uppercase' },
  slider: { width: '100%', marginBottom: '0.5rem', accentColor: '#6366f1' },
  calcRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  calcLabel: { fontSize: '0.8rem', color: '#8b8b9e', display: 'block', marginBottom: '0.25rem' },
  calcToggleLabel: { display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.75rem' },
  checkbox: { width: '14px', height: '14px', accentColor: '#6366f1' },
  optionalBadge: { marginLeft: '0.4rem', background: '#fbbf24', color: '#08080d', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.55rem', fontWeight: 700 },
  disabledLabel: { marginLeft: '0.4rem', color: '#6b7280', fontSize: '0.6rem' },
  livePreview: { background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(34,211,238,0.08))', borderRadius: '14px', padding: '1.25rem', border: '1px solid rgba(99,102,241,0.25)' },
  previewGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' },
  previewItem: { textAlign: 'center' },
  previewLabel: { display: 'block', fontSize: '0.6rem', color: '#8b8b9e', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 600 },
  previewValue: { fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 700, color: '#22d3ee' },
  previewValueLarge: { fontFamily: "'JetBrains Mono', monospace", fontSize: '1.25rem', fontWeight: 700, color: '#22d3ee' },
  // Hero
  hero: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.08) 0%, transparent 50%)', padding: '2rem' },
  heroContent: { textAlign: 'center', maxWidth: '900px' },
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(255,255,255,0.06)', padding: '0.5rem 1rem', borderRadius: '100px', fontSize: '0.8rem', color: '#8b8b9e', marginBottom: '1.5rem' },
  heroBadgeDot: { width: '8px', height: '8px', background: '#34d399', borderRadius: '50%' },
  heroTitle: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 400, marginBottom: '1.5rem', background: 'linear-gradient(135deg, #e8e8ed 0%, #22d3ee 50%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1, fontStyle: 'italic' },
  heroSubtitle: { fontSize: '1.1rem', color: '#8b8b9e', marginBottom: '3rem', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.8 },
  heroMetrics: { display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap' },
  heroMetricItem: { textAlign: 'center' },
  heroMetricValue: { fontFamily: "'JetBrains Mono', monospace", fontSize: '1.8rem', fontWeight: 700, color: '#22d3ee', marginBottom: '0.5rem' },
  heroMetricLabel: { fontSize: '0.7rem', color: '#5b5b6e', textTransform: 'uppercase', letterSpacing: '0.1em' },
  // Section
  section: { padding: '5rem 2rem' },
  sectionContainer: { maxWidth: '1100px', margin: '0 auto' },
  sectionHeader: { textAlign: 'center', marginBottom: '3rem' },
  sectionNumber: { fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: '#6366f1', display: 'block', marginBottom: '0.5rem', fontWeight: 600 },
  sectionTitle: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: '0.75rem', fontWeight: 400, fontStyle: 'italic' },
  sectionSubtitle: { color: '#8b8b9e', maxWidth: '600px', margin: '0 auto', fontSize: '1rem' },
  subSectionTitle: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', color: '#e8e8ed' },
  // Executive Summary
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' },
  summaryCard: { background: '#111118', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' },
  summaryCardHighlight: { background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(34,211,238,0.05))', border: '1px solid rgba(34,211,238,0.3)' },
  summaryBadge: { position: 'absolute', top: '-12px', left: '1rem', background: '#22d3ee', color: '#08080d', padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 700 },
  summaryIcon: { fontSize: '2rem', marginBottom: '0.75rem' },
  summaryLabel: { fontSize: '0.85rem', color: '#8b8b9e', marginBottom: '0.5rem' },
  summaryValue: { fontFamily: "'JetBrains Mono', monospace", fontSize: '1.75rem', fontWeight: 700, color: '#22d3ee', marginBottom: '0.25rem' },
  summaryValueXL: { fontFamily: "'JetBrains Mono', monospace", fontSize: '2.5rem', fontWeight: 700, color: '#22d3ee', marginBottom: '0.25rem' },
  summarySub: { fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.75rem' },
  summaryNote: { fontSize: '0.75rem', color: '#5b5b6e', fontStyle: 'italic', lineHeight: 1.5 },
  objectivesBox: { background: '#111118', borderRadius: '16px', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)' },
  objectivesTitle: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' },
  objectivesGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' },
  objectiveItem: { display: 'flex', gap: '0.75rem', alignItems: 'flex-start' },
  objectiveNum: { width: '28px', height: '28px', background: 'linear-gradient(135deg, #6366f1, #22d3ee)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0, color: '#08080d' },
  // Strategy
  strategyIntro: { fontSize: '1.05rem', color: '#a0a0b0', textAlign: 'center', maxWidth: '800px', margin: '0 auto 1.5rem', lineHeight: 1.8 },
  strategyText: { fontSize: '1.05rem', color: '#a0a0b0', textAlign: 'center', maxWidth: '800px', margin: '0 auto 3rem', lineHeight: 1.8 },
  // Funnel
  funnelV1: { maxWidth: '800px', margin: '0 auto' },
  funnelStageV1: { display: 'flex', alignItems: 'center', marginBottom: '0.5rem' },
  funnelBarV1: { height: '52px', borderRadius: '8px', display: 'flex', alignItems: 'center', paddingLeft: '1rem', transition: 'all 0.3s' },
  funnelTextV1: { color: '#08080d', fontWeight: 600, fontSize: '0.8rem' },
  funnelDataV1: { marginLeft: '1.5rem', textAlign: 'right', minWidth: '160px' },
  funnelValueV1: { fontFamily: "'JetBrains Mono', monospace", fontSize: '1.2rem', fontWeight: 700, color: '#e8e8ed', display: 'block' },
  funnelLabelV1: { fontSize: '0.75rem', color: '#6b7280' },
  // Platform Cards v4
  platformsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' },
  platformCardV4: { background: '#111118', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s' },
  platformCardHeaderV4: { padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'white', position: 'relative' },
  platformCardIcon: { fontSize: '1.3rem' },
  platformCardName: { fontWeight: 600, fontSize: '1rem' },
  disabledBadge: { position: 'absolute', right: '1rem', background: 'rgba(0,0,0,0.5)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 700 },
  optionalBadgeCard: { position: 'absolute', right: '1rem', background: '#fbbf24', color: '#08080d', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 700 },
  typeBadgeV4: { position: 'absolute', right: '1rem', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 700 },
  platformCardBodyV4: { padding: '1.25rem' },
  platformStatsV4: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem', background: '#08080d', borderRadius: '10px', padding: '0.75rem' },
  platformStatV4: { textAlign: 'center' },
  statLabelV4: { display: 'block', fontSize: '0.55rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 600 },
  statValueV4: { fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 700, color: '#e8e8ed' },
  minInvestmentBox: { background: '#0a0a0f', padding: '0.6rem', borderRadius: '8px', fontSize: '0.8rem', color: '#8b8b9e', marginBottom: '1rem', textAlign: 'center' },
  adTypesPreview: { fontSize: '0.85rem', marginBottom: '1rem' },
  adTypesList: { margin: '0.5rem 0 0 1.25rem', padding: 0, color: '#8b8b9e' },
  viewStrategyBtnV4: { width: '100%', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,211,238,0.1))', border: '1px solid rgba(99,102,241,0.35)', color: '#a5b4fc', padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' },
  cplNote: { fontSize: '0.7rem', color: '#5b5b6e', fontStyle: 'italic' },
  optionalTag: { marginLeft: '0.5rem', background: '#fbbf24', color: '#08080d', padding: '0.1rem 0.3rem', borderRadius: '3px', fontSize: '0.55rem', fontWeight: 700 },
  // Verticales
  verticalesGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' },
  verticalCard: { background: '#111118', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', position: 'relative' },
  verticalIcon: { fontSize: '2.5rem', marginBottom: '0.75rem' },
  verticalName: { fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.25rem' },
  verticalTier: { fontSize: '0.65rem', color: '#6366f1', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' },
  verticalScore: { fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', color: '#22d3ee', marginBottom: '0.25rem' },
  verticalMarket: { fontSize: '0.85rem', color: '#8b8b9e', marginBottom: '0.5rem' },
  verticalDesc: { fontSize: '0.8rem', color: '#6b7280' },
  verticalNote: { fontSize: '0.8rem', color: '#5b5b6e', fontStyle: 'italic', textAlign: 'center' },
  faseFuturaBadge: { position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 700, color: '#8b8b9e' },
  // Tables
  tableContainer: { overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', background: '#111118' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#0a0a0f', padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.65rem', color: '#8b8b9e', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 700 },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.04)' },
  td: { padding: '0.875rem 1.25rem', fontSize: '0.9rem' },
  tdCyan: { fontFamily: "'JetBrains Mono', monospace", color: '#22d3ee' },
  tdGreen: { fontFamily: "'JetBrains Mono', monospace", color: '#34d399' },
  totalRow: { background: '#0a0a0f' },
  tableNote: { fontSize: '0.8rem', color: '#5b5b6e', fontStyle: 'italic', textAlign: 'center', marginTop: '1.5rem' },
  // KPIs
  kpiGroupTitle: { fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: '#e8e8ed' },
  kpiPrimaryGrid: { display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' },
  kpiCardLarge: { background: '#111118', borderRadius: '16px', padding: '1.75rem', textAlign: 'center' },
  kpiCardMedium: { background: '#111118', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' },
  kpiLabelSmall: { fontSize: '0.65rem', color: '#8b8b9e', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 },
  kpiValueHuge: { fontFamily: "'JetBrains Mono', monospace", fontSize: '3rem', fontWeight: 700, color: '#22d3ee', marginBottom: '0.25rem' },
  kpiValueLarge: { fontFamily: "'JetBrains Mono', monospace", fontSize: '1.75rem', fontWeight: 700, color: '#e8e8ed' },
  kpiSubtext: { fontSize: '0.8rem', color: '#6b7280' },
  kpiNote: { fontSize: '0.8rem', color: '#5b5b6e', fontStyle: 'italic', textAlign: 'center', marginTop: '1rem' },
  kpiSecondaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' },
  kpiCardSmall: { background: '#111118', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' },
  kpiValueMedium: { fontFamily: "'JetBrains Mono', monospace", fontSize: '1.3rem', fontWeight: 700, color: '#e8e8ed' },
  scenariosBox: { background: '#111118', borderRadius: '16px', padding: '1.75rem', border: '1px solid rgba(255,255,255,0.05)', marginTop: '2.5rem' },
  scenariosTitle: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', textAlign: 'center' },
  scenariosSourceNote: { fontSize: '0.75rem', color: '#6b7280', marginTop: '1.25rem', lineHeight: 1.6, fontStyle: 'italic', background: 'rgba(99,102,241,0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.1)' },
  // Regions
  regionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' },
  regionCardV4: { background: '#111118', borderRadius: '16px', overflow: 'hidden', position: 'relative' },
  regionHeaderV4: { padding: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' },
  regionFlag: { fontSize: '1.75rem' },
  regionName: { fontSize: '1rem', fontWeight: 600, marginBottom: '0.15rem' },
  regionPct: { fontSize: '0.75rem', color: '#8b8b9e' },
  regionBodyV4: { padding: '0 1.25rem 1rem' },
  regionStatRow: { display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  regionStatValue: { fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: '#22d3ee' },
  regionStatValueLarge: { fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '1.25rem', color: '#22d3ee' },
  regionStatHighlight: { background: 'rgba(34,211,238,0.06)', borderRadius: '8px', padding: '0.6rem 0.75rem', marginTop: '0.5rem', border: 'none' },
  regionNote: { fontSize: '0.7rem', color: '#5b5b6e', fontStyle: 'italic', padding: '0 1.25rem 1rem' },
  // Tactics
  tacticGroupTitle: { fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: '#e8e8ed' },
  tacticsGridV4: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' },
  tacticCardV4: { background: '#111118', borderRadius: '16px', padding: '1.5rem', position: 'relative' },
  disabledBadgeSmall: { position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 700, color: '#8b8b9e' },
  tacticIconLarge: { fontSize: '2rem', marginBottom: '0.75rem' },
  tacticName: { fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem' },
  tacticDesc: { fontSize: '0.85rem', color: '#8b8b9e', lineHeight: 1.6, marginBottom: '0.75rem' },
  tacticNote: { fontSize: '0.75rem', color: '#5b5b6e', fontStyle: 'italic' },
  tacticsNote: { fontSize: '0.8rem', color: '#5b5b6e', fontStyle: 'italic', textAlign: 'center', marginTop: '1.5rem' },
  // Optimization
  optimizationGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' },
  optimizationCard: { background: '#111118', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' },
  optimizationTrigger: { color: '#f87171', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' },
  optimizationAction: { color: '#a0a0b0', marginBottom: '0.5rem', fontSize: '0.9rem' },
  optimizationTimeline: { color: '#22d3ee', fontSize: '0.85rem' },
  // Reporting
  reportingGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' },
  reportingCard: { background: '#111118', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' },
  reportingType: { fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' },
  reportingContent: { color: '#a0a0b0', fontSize: '0.85rem', marginBottom: '0.5rem' },
  reportingFormat: { color: '#8b8b9e', fontSize: '0.8rem' },
  // Contact
  contactCardFinal: { background: '#111118', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2.5rem', maxWidth: '700px', margin: '0 auto' },
  contactInfoFinal: { display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '1.5rem' },
  contactAvatarFinal: { width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(99,102,241,0.5)', flexShrink: 0 },
  contactPhotoFinal: { width: '100%', height: '100%', objectFit: 'cover' },
  contactDetailsFinal: { flex: 1 },
  contactNameFinal: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.4rem', marginBottom: '0.2rem' },
  contactRoleFinal: { color: '#22d3ee', marginBottom: '0.5rem', fontSize: '0.9rem' },
  contactBioFinal: { color: '#8b8b9e', fontSize: '0.85rem', lineHeight: 1.6 },
  contactLinksFinal: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  contactLinkFinal: { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#08080d', padding: '0.6rem 1rem', borderRadius: '100px', color: '#e8e8ed', textDecoration: 'none', fontSize: '0.85rem' },
  contactCTAFinal: { textAlign: 'center' },
  ctaTextFinal: { color: '#8b8b9e', marginBottom: '1rem', fontSize: '0.95rem' },
  ctaButtonsRowFinal: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' },
  ctaBtnFinal: { display: 'inline-block', background: 'linear-gradient(135deg, #6366f1, #22d3ee)', color: '#08080d', padding: '0.875rem 2rem', borderRadius: '100px', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', border: 'none', cursor: 'pointer' },
  whatsappBtnSmall: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#25D366', color: 'white', padding: '0.875rem 1.5rem', borderRadius: '100px', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' },
  // Footer
  footer: { background: '#0a0a0f', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '2rem' },
  footerBottom: { textAlign: 'center', color: '#8b8b9e', fontSize: '0.8rem' },
  // Detail page
  detailPage: { paddingTop: '60px' },
  detailHeader: { padding: '4rem 2rem' },
  detailHeaderContent: { maxWidth: '850px', margin: '0 auto', textAlign: 'center', color: 'white' },
  detailIcon: { fontSize: '3.5rem', marginBottom: '0.75rem', display: 'block' },
  detailTitle: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2.25rem', marginBottom: '0.5rem', fontStyle: 'italic' },
  detailSubtitle: { fontSize: '1rem', opacity: 0.9, marginBottom: '0.75rem' },
  detailBadge: { display: 'inline-block', marginTop: '0.5rem', padding: '0.3rem 0.8rem', borderRadius: '100px', background: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', fontWeight: 700 },
  detailStats: { display: 'flex', justifyContent: 'center', gap: '2.5rem', marginTop: '1.75rem' },
  detailStat: { textAlign: 'center' },
  detailStatValue: { display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: '1.4rem', fontWeight: 700 },
  detailStatLabel: { fontSize: '0.7rem', opacity: 0.8, textTransform: 'uppercase', fontWeight: 600 },
  detailContent: { maxWidth: '900px', margin: '0 auto', padding: '2.5rem 2rem' },
  detailSection: { marginBottom: '2.5rem' },
  detailSectionTitle: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.3rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.6rem', fontStyle: 'italic' },
  investmentGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' },
  investmentCard: { background: '#111118', borderRadius: '12px', padding: '1.25rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' },
  investmentLabel: { fontSize: '0.8rem', color: '#8b8b9e', marginBottom: '0.5rem' },
  investmentValue: { fontFamily: "'JetBrains Mono', monospace", fontSize: '1.4rem', fontWeight: 700, color: '#22d3ee', marginBottom: '0.5rem' },
  investmentNote: { fontSize: '0.75rem', color: '#5b5b6e', fontStyle: 'italic' },
  adTypeGroupTitle: { fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: '#34d399' },
  adTypeGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' },
  adTypeCard: { background: '#111118', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '1.25rem', position: 'relative' },
  adTypeBadge: { position: 'absolute', top: '1rem', right: '1rem', background: '#22c55e', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 700 },
  adTypeName: { fontSize: '1rem', fontWeight: 600, marginBottom: '0.4rem' },
  adTypeDesc: { color: '#8b8b9e', fontSize: '0.85rem', marginBottom: '0.75rem' },
  keywordsBox: { marginBottom: '0.75rem', fontSize: '0.85rem' },
  keywordTags: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' },
  keywordTag: { background: '#08080d', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontFamily: "'JetBrains Mono', monospace" },
  toolsBox: { fontSize: '0.85rem', marginBottom: '0.75rem', color: '#8b8b9e' },
  strengthsBox: { fontSize: '0.85rem', marginBottom: '0.75rem' },
  adTypeCPL: { fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: '#22d3ee', padding: '0.4rem 0.6rem', background: '#08080d', borderRadius: '6px', textAlign: 'center' },
  setupGuide: {},
  setupStep: { display: 'flex', gap: '1rem', marginBottom: '1rem', padding: '1rem', background: '#08080d', borderRadius: '10px' },
  stepNum: { width: '28px', height: '28px', background: 'linear-gradient(135deg, #6366f1, #22d3ee)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0, color: '#08080d' },
  setupSubtitle: { fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#22d3ee' },
  apolloFilters: { display: 'grid', gap: '0.75rem' },
  filterCard: { background: '#08080d', padding: '0.875rem', borderRadius: '10px' },
  filterField: { fontWeight: 600, marginBottom: '0.4rem', color: '#22d3ee', fontSize: '0.85rem' },
  filterValues: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem' },
  filterTag: { background: '#111118', padding: '0.2rem 0.6rem', borderRadius: '100px', fontSize: '0.75rem' },
  filterNote: { fontSize: '0.8rem', color: '#5b5b6e', fontStyle: 'italic', marginTop: '1rem' },
  sequenceTimeline: {},
  sequenceStep: { display: 'flex', alignItems: 'flex-start', gap: '0.875rem', marginBottom: '1rem', padding: '0.875rem', background: '#08080d', borderRadius: '10px' },
  sequenceDay: { fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#6366f1', minWidth: '55px', fontSize: '0.85rem' },
  sequenceIcon: { fontSize: '1.25rem' },
  sequenceContent: { flex: 1 },
  sequenceType: { fontWeight: 600, marginBottom: '0.15rem', fontSize: '0.9rem' },
  sequenceDesc: { color: '#8b8b9e', fontSize: '0.8rem' },
  emailTemplate: { background: '#08080d', borderRadius: '10px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' },
  emailSubject: { marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#22d3ee' },
  emailBody: { fontSize: '0.9rem', color: '#a0a0b0', lineHeight: 1.7 },
  toolsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' },
  toolCard: { background: '#08080d', padding: '1rem', borderRadius: '10px', textAlign: 'center' },
  toolName: { fontWeight: 600, marginBottom: '0.25rem', color: '#e8e8ed' },
  toolUse: { fontSize: '0.8rem', color: '#8b8b9e', marginBottom: '0.5rem' },
  toolPrice: { fontFamily: "'JetBrains Mono', monospace", color: '#22d3ee', fontSize: '0.9rem' },
  stackTotal: { textAlign: 'center', marginTop: '1rem', color: '#fbbf24', fontWeight: 600 },
  backSection: { textAlign: 'center', marginTop: '2.5rem', paddingTop: '1.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' },
  backButtonLarge: { background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.35)', color: '#a5b4fc', padding: '0.875rem 2rem', borderRadius: '100px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 },
  // Timeline vertical
  timelineVertical: { maxWidth: '800px', margin: '0 auto' },
  timelineItem: { display: 'flex', marginBottom: '0' },
  timelineLeft: { width: '100px', textAlign: 'right', paddingRight: '1.5rem', paddingTop: '0.5rem' },
  timelineDuration: { fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: '#22d3ee', fontWeight: 600 },
  timelineCenter: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' },
  timelineNode: { width: '44px', height: '44px', background: 'linear-gradient(135deg, #6366f1, #22d3ee)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 },
  timelineLine: { width: '2px', flex: 1, background: 'linear-gradient(to bottom, #6366f1, rgba(99,102,241,0.2))', minHeight: '60px' },
  timelineRight: { flex: 1, paddingLeft: '1.5rem', paddingBottom: '2rem' },
  timelineCard: { background: '#111118', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' },
  timelineStep: { fontSize: '0.7rem', color: '#6366f1', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' },
  timelineTitle: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' },
  timelineList: { listStyle: 'none', padding: 0, margin: 0 },
  // Invoice
  invoiceCard: { background: '#111118', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', maxWidth: '600px', margin: '0 auto 2rem' },
  invoiceHeader: { padding: '1.5rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(34,211,238,0.05))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  invoiceTitle: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.3rem', marginBottom: '0.25rem' },
  invoiceSubtitle: { fontSize: '0.85rem', color: '#8b8b9e' },
  invoiceLogo: { width: '50px', height: '50px', background: 'linear-gradient(135deg, #6366f1, #22d3ee)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem', color: '#08080d' },
  invoiceBody: { padding: '1.5rem' },
  invoiceRow: { display: 'flex', justifyContent: 'space-between', paddingBottom: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  invoiceDesc: { flex: 1 },
  invoiceAmount: { fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 700, color: '#22d3ee', marginLeft: '2rem' },
  invoiceDivider: { height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1rem 0' },
  invoiceTotals: { marginTop: '1rem' },
  invoiceTotalRow: { display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.9rem' },
  invoiceGrandTotal: { marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '2px solid #6366f1', fontWeight: 700, fontSize: '1.1rem' },
  invoiceNote: { background: '#0a0a0f', padding: '1rem', borderRadius: '8px', marginTop: '1rem', fontSize: '0.85rem', color: '#8b8b9e' },
  invoiceFooter: { padding: '1.5rem', background: '#0a0a0f', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: '#8b8b9e' },
  budgetReminder: { background: 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(251,191,36,0.05))', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '12px', padding: '1.5rem', maxWidth: '600px', margin: '0 auto' },
  // CTA
  ctaCard: { background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(34,211,238,0.05))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '20px', padding: '3rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' },
  ctaTitle: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.8rem', marginBottom: '0.75rem', fontStyle: 'italic' },
  ctaSubtitle: { color: '#8b8b9e', marginBottom: '1.5rem' },
  ctaButtonsRow: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' },
  ctaPrimaryBtn: { display: 'inline-block', background: 'linear-gradient(135deg, #6366f1, #22d3ee)', color: '#08080d', padding: '0.875rem 2rem', borderRadius: '100px', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' },
  whatsappBtn: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#25D366', color: 'white', padding: '0.875rem 1.5rem', borderRadius: '100px', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' },
};
