import { useState, useEffect, useRef } from 'react';
import './App.css';

// Character Component (SVG Retro Avatar)
// ponytail: Single-file SVG character reacts to level theme and flips horizontally
function Character({ isWalking, direction, level }) {
  const isLeft = direction === 'left';
  const levelClass = `level-${level}-char`;

  return (
    <div 
      className={`character-container ${levelClass}`}
      style={{
        transform: `scaleX(${isLeft ? -1 : 1})`,
      }}
    >
      <svg 
        viewBox="0 0 80 120" 
        className={`character-svg ${isWalking ? 'walking' : ''}`}
      >
        {/* Backpack */}
        <rect x="15" y="45" width="16" height="32" rx="4" className="char-backpack" />
        
        {/* Left Arm */}
        <path d="M 22 48 L 12 70" strokeWidth="7" strokeLinecap="round" className="char-hoodie arm-l" />

        {/* Left Leg */}
        <path d="M 33 82 L 31 108" strokeWidth="8" strokeLinecap="round" className="character-jeans leg-l" />
        <rect x="25" y="104" width="10" height="7" rx="2" className="character-shoes" />

        {/* Right Leg */}
        <path d="M 45 82 L 47 108" strokeWidth="8" strokeLinecap="round" className="character-jeans leg-r" />
        <rect x="43" y="104" width="10" height="7" rx="2" className="character-shoes" />

        {/* Torso / Hoodie */}
        <rect x="23" y="42" width="32" height="42" rx="6" className="char-hoodie" />

        {/* Head */}
        <circle cx="39" cy="27" r="15" className="character-skin" />
        
        {/* Hair */}
        <path d="M 24 23 C 24 10, 54 10, 54 23 C 54 16, 50 14, 39 16 C 28 14, 24 16, 24 23 Z" className="character-hair" />
        <rect x="23" y="20" width="8" height="10" rx="2" className="character-hair" /> {/* Sideburn */}
        
        {/* Eyes / Glasses */}
        <circle cx="36" cy="26" r="3" className="character-eyes" />
        <circle cx="46" cy="26" r="3" className="character-eyes" />
        <line x1="39" y1="26" x2="43" y2="26" stroke="#000" strokeWidth="1" />
        
        {/* Visor (Cyberpunk) */}
        <rect x="28" y="21" width="24" height="10" rx="3" className="char-neon-visor" />

        {/* Astronaut Helmet */}
        <circle cx="39" cy="27" r="19" className="char-helmet" />

        {/* Right Arm */}
        <path d="M 53 48 L 63 70" strokeWidth="7" strokeLinecap="round" className="char-hoodie arm-r" />
      </svg>
    </div>
  );
}

function App() {
  const [activeLevel, setActiveLevel] = useState(0);
  const [isWalking, setIsWalking] = useState(false);
  const [direction, setDirection] = useState('right');
  const [showWinScreen, setShowWinScreen] = useState(false);

  // Mario HUD states
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [timeLeft, setTimeLeft] = useState(400);

  // Projects Slider and Detail Modal states
  const [sliderIndex, setSliderIndex] = useState(0);
  const [visibleCardsCount, setVisibleCardsCount] = useState(3);
  const [selectedProject, setSelectedProject] = useState(null);

  // Refs for main horizontal translations (moves 1:1 with scroll)
  const groundLayerRef = useRef(null);
  const contentLayerRef = useRef(null);

  // Refs arrays for the local parallax layers inside each of the 5 sections
  // ponytail: arrays of refs directly modified in scroll handler to clip scenery per world
  const cloudsRefs = useRef([]);
  const backRefs = useRef([]);
  const midRefs = useRef([]);

  const prevScrollY = useRef(0);
  const walkingTimeoutRef = useRef(null);

  // 6 Projects Dataset
  const projects = [
    {
      id: 1,
      title: "01. ARCADE WEB",
      shortDesc: "Plataforma de minijuegos retro multijugador en tiempo real con WebSockets.",
      fullDesc: "Una sala recreativa virtual completa desarrollada con Socket.io para la sincronización multijugador. Incluye juegos retro como Pong, Snake y combate por turnos 8-bit. Cuenta con un sistema de emparejamiento, salas privadas y un chat integrado de baja latencia.",
      tech: ["React", "Socket.io", "NodeJS", "Express"],
      icon: <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3-3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
    },
    {
      id: 2,
      title: "02. RETRO-COMMERCE",
      shortDesc: "E-commerce con estética retro y checkout simulado inspirado en RPGs.",
      fullDesc: "Tienda digital estructurada como una armería/tienda de un RPG medieval. Los usuarios eligen objetos (pociones de vida, espadas de código), los añaden al inventario y completan el pago integrando Stripe Elements con animaciones de transacciones estilo Game Boy.",
      tech: ["Vite", "CSS Grid", "Stripe API", "Redux Toolkit"],
      icon: <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
    },
    {
      id: 3,
      title: "03. STATS DASHBOARD",
      shortDesc: "Dashboard interactivo de métricas en tiempo real con widgets personalizables.",
      fullDesc: "Panel administrativo enfocado en la visualización rápida de datos del servidor y uso de memoria. Permite arrastrar, reorganizar y redimensionar los widgets. Las gráficas interactivas se actualizan mediante simulación de datos con transiciones de color dinámicas.",
      tech: ["NextJS", "Recharts", "TailwindCSS", "Framer Motion"],
      icon: <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
    },
    {
      id: 4,
      title: "04. QUEST BOARD",
      shortDesc: "Tablero Kanban colaborativo estilizado como misiones de un gremio RPG.",
      fullDesc: "Herramienta de gestión de tareas colaborativas inspirada en los tablones de misiones de juegos RPG. Permite organizar tareas por dificultad (D, C, B, A, S-Rank), asignar recompensas (puntos XP ficticios) e incluye drag and drop interactivo nativo del navegador.",
      tech: ["React DnD", "NodeJS", "Express", "MongoDB"],
      icon: <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zm0-8h14V7H7v2z"/>
    },
    {
      id: 5,
      title: "05. PIXEL EDITOR",
      shortDesc: "Editor de pixel-art y spritesheets interactivo optimizado para navegadores.",
      fullDesc: "Una aplicación de dibujo en lienzo (HTML5 Canvas) optimizada para crear sprites y animaciones pixeladas en cuadrículas de 16x16, 32x32 o 64x64. Cuenta con historial de deshacer/rehacer, paletas de colores clásicas, exportación a PNG y generación de spritesheets.",
      tech: ["HTML5 Canvas", "React Hooks", "CSS Modules"],
      icon: <path d="M3 3v18h18V3H3zm12 10H9v-2h6v2zm2-4H7V7h10v2z"/>
    },
    {
      id: 6,
      title: "06. CODE ARENA",
      shortDesc: "Compilador y juegos de batallas de algoritmos competitivos en tiempo real.",
      fullDesc: "Aplicación de desafíos de programación competitiva donde dos programadores compiten para resolver un algoritmo en el menor tiempo. Incluye la integración de un editor de código tipo VS Code (Monaco Editor) y ejecución de pruebas seguras basadas en contenedores aislados.",
      tech: ["React", "Monaco Editor", "Docker", "Node Runner"],
      icon: <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
    }
  ];

  // Recalculate slider visible cards count based on viewport size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 768) {
        setVisibleCardsCount(1);
      } else if (width <= 1024) {
        setVisibleCardsCount(2);
      } else {
        setVisibleCardsCount(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Live countdown timer for HUD
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? scrollY / maxScroll : 0;

      // 1. Determine direction
      const currentDirection = scrollY > prevScrollY.current ? 'right' : 'left';
      setDirection(currentDirection);

      // 2. Set walking animation
      setIsWalking(true);
      if (walkingTimeoutRef.current) clearTimeout(walkingTimeoutRef.current);
      walkingTimeoutRef.current = setTimeout(() => {
        setIsWalking(false);
      }, 150);

      // 3. Move main horizontal containers at 1.0x speed
      const totalTranslateVW = -progress * 400; // moves 0 to -400vw
      if (groundLayerRef.current) {
        groundLayerRef.current.style.transform = `translateX(${totalTranslateVW}vw)`;
      }
      if (contentLayerRef.current) {
        contentLayerRef.current.style.transform = `translateX(${totalTranslateVW}vw)`;
      }

      // 4. Move local clipped parallax layers inside each of the 5 sections
      // Formula: local_x = x_viewport * (s - 1.0)
      // where x_viewport = (i * 100) - (progress * 400)
      for (let i = 0; i < 5; i++) {
        const xViewport = (i * 100) - (progress * 400);

        // Clouds (s = 0.4) -> moves at 0.4x relative to viewport -> shift by x_viewport * -0.6
        const xClouds = xViewport * -0.6;
        if (cloudsRefs.current[i]) {
          cloudsRefs.current[i].style.transform = `translateX(${xClouds}vw)`;
        }

        // Mountains (s = 0.6) -> shift by x_viewport * -0.4
        const xBack = xViewport * -0.4;
        if (backRefs.current[i]) {
          backRefs.current[i].style.transform = `translateX(${xBack}vw)`;
        }

        // Trees (s = 0.8) -> shift by x_viewport * -0.2
        const xMid = xViewport * -0.2;
        if (midRefs.current[i]) {
          midRefs.current[i].style.transform = `translateX(${xMid}vw)`;
        }
      }

      // 5. Update Level Badge State (5 Sections => bounds: 0 to 4)
      const currentSectionIndex = Math.min(4, Math.max(0, Math.round(progress * 4)));
      if (currentSectionIndex !== activeLevel) {
        setActiveLevel(currentSectionIndex);
      }

      // 6. Update score and coins based on progress
      const nextScore = Math.floor(progress * 3000) * 100;
      const nextCoins = Math.floor(progress * 99);
      setScore(nextScore);
      setCoins(nextCoins);

      prevScrollY.current = scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (walkingTimeoutRef.current) clearTimeout(walkingTimeoutRef.current);
    };
  }, [activeLevel]);

  // Navigate to Level on Nav Click (Smooth scroll to proportional vertical location)
  const navigateToLevel = (index) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetScrollY = (index / 4) * maxScroll;
    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    });
  };

  // Slider navigation logic
  const nextSlide = () => {
    if (sliderIndex < (projects.length - visibleCardsCount)) {
      setSliderIndex(sliderIndex + 1);
    }
  };

  const prevSlide = () => {
    if (sliderIndex > 0) {
      setSliderIndex(sliderIndex - 1);
    }
  };

  // Calculate sliding percentage based on columns
  const slidingPercent = sliderIndex * (100 / visibleCardsCount);

  // Form submission handler (triggers victory popup modal)
  const handleContactSubmit = (e) => {
    e.preventDefault();
    setShowWinScreen(true);
  };

  const xpPercent = (activeLevel / 4) * 100;

  return (
    <div className="scroll-container">
      {/* Viewport covers the whole screen */}
      <div className={`viewport level-${activeLevel}`}>
        
        {/* Parallax layers background container */}
        <div className="parallax-container">
          {/* Background parallax base placeholder */}
        </div>

        {/* Ground Layer (1.0x speed) - Placed directly under viewport for z-index ordering override */}
        <div className="layer layer-ground" ref={groundLayerRef}>
          <div className="ground-segment segment-0" style={{ left: '0vw' }}></div>
          <div className="ground-segment segment-1" style={{ left: '100vw' }}></div>
          <div className="ground-segment segment-2" style={{ left: '200vw' }}></div>
          <div className="ground-segment segment-3" style={{ left: '300vw' }}></div>
          <div className="ground-segment segment-4" style={{ left: '400vw' }}></div>
        </div>

        {/* Character element walking on floor */}
        <Character isWalking={isWalking} direction={direction} level={activeLevel} />

        {/* 1:1 Content Layer Scrolling over the parallax backgrounds */}
        <div className="content-layer" ref={contentLayerRef}>
          
          {/* SECTION DIVIDER GATES (TRANSITION PORTALS BETWEEN SECTIONS) */}
          <div className="section-divider-gate divider-0-1">
            <div className="gate-header">MUNDO 1-2</div>
            <div className="gate-pillars-row" style={{ display: 'flex', width: '100%', justifyContent: 'space-between', height: 'calc(100% - 40px)' }}>
              <div className="gate-pillar"></div>
              <div className="gate-pillar"></div>
            </div>
          </div>
          <div className="section-divider-gate divider-1-2">
            <div className="gate-header">MUNDO 1-3</div>
            <div className="gate-pillars-row" style={{ display: 'flex', width: '100%', justifyContent: 'space-between', height: 'calc(100% - 40px)' }}>
              <div className="gate-pillar"></div>
              <div className="gate-pillar"></div>
            </div>
          </div>
          <div className="section-divider-gate divider-2-3">
            <div className="gate-header">MUNDO 1-4</div>
            <div className="gate-pillars-row" style={{ display: 'flex', width: '100%', justifyContent: 'space-between', height: 'calc(100% - 40px)' }}>
              <div className="gate-pillar"></div>
              <div className="gate-pillar"></div>
            </div>
          </div>
          <div className="section-divider-gate divider-3-4">
            <div className="gate-header">MUNDO 1-5</div>
            <div className="gate-pillars-row" style={{ display: 'flex', width: '100%', justifyContent: 'space-between', height: 'calc(100% - 40px)' }}>
              <div className="gate-pillar"></div>
              <div className="gate-pillar"></div>
            </div>
          </div>

          {/* LEVEL 0: INICIO (WORLD 1-1: OVERWORLD) */}
          <section className="section level-0-section">
            {/* Local Parallax background layers clipped to Section 0 */}
            <div className="local-parallax">
              <div className="local-layer local-clouds" ref={el => cloudsRefs.current[0] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600">
                  {/* Retro SMB1 Clouds */}
                  <g fill="#ffffff" stroke="#000000" strokeWidth="4">
                    {/* Cloud 1 */}
                    <rect x="150" y="80" width="120" height="35" rx="8" />
                    <rect x="175" y="60" width="70" height="55" rx="8" />
                    {/* Cloud 2 */}
                    <rect x="550" y="100" width="160" height="35" rx="8" />
                    <rect x="580" y="80" width="100" height="55" rx="8" />
                  </g>
                </svg>
              </div>
              <div className="local-layer local-back" ref={el => backRefs.current[0] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600">
                  {/* Retro SMB1 Green Hills */}
                  <g fill="#00a800" stroke="#000000" strokeWidth="4">
                    {/* Hill 1 */}
                    <path d="M 80 600 C 120 420, 240 420, 280 600 Z" />
                    <path d="M 180 435 L 180 600" stroke="#007000" strokeWidth="3" />
                    <path d="M 140 460 L 140 600" stroke="#007000" strokeWidth="3" />
                    <path d="M 220 460 L 220 600" stroke="#007000" strokeWidth="3" />
                    
                    {/* Hill 2 */}
                    <path d="M 680 600 C 720 450, 840 450, 880 600 Z" />
                    <path d="M 780 465 L 780 600" stroke="#007000" strokeWidth="3" />
                    <path d="M 740 490 L 740 600" stroke="#007000" strokeWidth="3" />
                    <path d="M 820 490 L 820 600" stroke="#007000" strokeWidth="3" />
                  </g>
                </svg>
              </div>
              <div className="local-layer local-mid" ref={el => midRefs.current[0] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600">
                  {/* SMB1 Pipes and Bushes */}
                  <g stroke="#000000" strokeWidth="4">
                    {/* Green Warp Pipe */}
                    <rect x="420" y="440" width="70" height="160" fill="#00a800" />
                    <rect x="410" y="400" width="90" height="40" fill="#00a800" />
                    <rect x="430" y="440" width="12" height="160" fill="#80d080" opacity="0.4" stroke="none" />
                    <rect x="420" y="400" width="12" height="40" fill="#80d080" opacity="0.4" stroke="none" />
                  </g>
                  <g fill="#00a800" stroke="#000000" strokeWidth="4">
                    {/* Bush 1 */}
                    <circle cx="120" cy="540" r="25" />
                    <circle cx="145" cy="530" r="30" />
                    <circle cx="170" cy="540" r="25" />
                    <rect x="110" y="530" width="60" height="30" fill="#00a800" stroke="none" />
                    
                    {/* Bush 2 */}
                    <circle cx="820" cy="540" r="25" />
                    <circle cx="845" cy="530" r="30" />
                    <circle cx="870" cy="540" r="25" />
                    <rect x="810" y="530" width="60" height="30" fill="#00a800" stroke="none" />
                  </g>
                </svg>
              </div>
            </div>

            <div className="intro-container">
              <h1 className="retro-title">Alejandro Pérez</h1>
              <p className="intro-subtitle">DESARROLLADOR FULL-STACK & ARTE INTERACTIVO</p>
              
              <div className="scroll-indicator" onClick={() => navigateToLevel(1)}>
                <div className="mouse-icon">
                  <div className="mouse-wheel"></div>
                </div>
                <span>SCROLL O HAZ CLICK</span>
                <span className="retro-prompt">HAZ SCROLL HACIA ABAJO</span>
              </div>
            </div>
          </section>

          {/* LEVEL 1: QUIEN SOY */}
          <section className="section level-1-section">
            {/* Local Parallax background layers clipped to Section 1 (WORLD 1-2: UNDERGROUND) */}
            <div className="local-parallax">
              <div className="local-layer local-clouds" ref={el => cloudsRefs.current[1] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600">
                  {/* Ceiling bricks in deep blue underground tone */}
                  <g fill="#0044ab" stroke="#000000" strokeWidth="4">
                    <rect x="0" y="0" width="1000" height="35" />
                    <line x1="125" y1="0" x2="125" y2="35" />
                    <line x1="250" y1="0" x2="250" y2="35" />
                    <line x1="375" y1="0" x2="375" y2="35" />
                    <line x1="500" y1="0" x2="500" y2="35" />
                    <line x1="625" y1="0" x2="625" y2="35" />
                    <line x1="750" y1="0" x2="750" y2="35" />
                    <line x1="875" y1="0" x2="875" y2="35" />
                  </g>
                </svg>
              </div>
              <div className="local-layer local-back" ref={el => backRefs.current[1] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600">
                  {/* Distant dark blue structures and brick pillars */}
                  <g fill="#002266" opacity="0.4">
                    <rect x="180" y="35" width="90" height="565" />
                    <rect x="720" y="35" width="90" height="565" />
                  </g>
                </svg>
              </div>
              <div className="local-layer local-mid" ref={el => midRefs.current[1] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600">
                  {/* Floating bricks & underground pipes */}
                  <g stroke="#000000" strokeWidth="4">
                    {/* Hanging pipe from ceiling */}
                    <rect x="300" y="35" width="60" height="120" fill="#00a800" />
                    <rect x="290" y="155" width="80" height="30" fill="#00a800" />
                    {/* Ground warp pipe */}
                    <rect x="620" y="440" width="70" height="160" fill="#00a800" />
                    <rect x="610" y="400" width="90" height="40" fill="#00a800" />
                  </g>
                  {/* Floating bricks */}
                  <g fill="#0044ab" stroke="#000000" strokeWidth="4">
                    <rect x="420" y="300" width="40" height="40" />
                    <rect x="460" y="300" width="40" height="40" fill="#fcb488" /> {/* Q-block */}
                    <rect x="500" y="300" width="40" height="40" />
                  </g>
                </svg>
              </div>
            </div>

            <div className="game-card">
              <div className="level-badge">NIVEL 01: QUIEN SOY</div>
              <h2 className="section-title">
                <svg className="project-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                PERFIL DEL HÉROE
              </h2>
              <div className="card-body">
                <div className="rpg-grid">
                  <div className="rpg-bio">
                    <div className="bio-header">
                      <div className="profile-avatar-container">
                        <img className="profile-avatar" src="/avatar.jpg" alt="Developer Avatar" />
                      </div>
                      <div className="bio-title-area">
                        <h3>ALEJANDRO PÉREZ</h3>
                        <p>Desarrollador Nivel 99</p>
                      </div>
                    </div>
                    
                    <p>
                      ¡Hola! Soy Alejandro, un desarrollador full-stack que ve el código como una aventura interactiva. Diseñé este sitio para demostrar cómo las animaciones del navegador y el desarrollo web moderno pueden fusionarse en una experiencia única.
                    </p>
                    <p>
                      Me dedico a transformar lógicas de back-end complejas y diseños visuales dinámicos en código limpio, escalable y optimizado para el usuario.
                    </p>
                    
                    {/* Tools and Skills Tags */}
                    <div className="skills-tags">
                      <span className="skill-tag">React</span>
                      <span className="skill-tag">JavaScript</span>
                      <span className="skill-tag">TypeScript</span>
                      <span className="skill-tag">NodeJS</span>
                      <span className="skill-tag">HTML5/CSS3</span>
                      <span className="skill-tag">Vite</span>
                      <span className="skill-tag">MongoDB</span>
                      <span className="skill-tag">PostgreSQL</span>
                      <span className="skill-tag">Git</span>
                      <span className="skill-tag">Docker</span>
                    </div>
                  </div>
                  
                  <div className="rpg-stats-panel">
                    <div className="rpg-stat">
                      <div className="stat-label-row">
                        <span>FRONT-END (REACT)</span>
                        <span className="stat-val">95 XP</span>
                      </div>
                      <div className="stat-bar">
                        <div className="stat-fill" style={{ width: '95%' }}></div>
                      </div>
                    </div>
                    <div className="rpg-stat">
                      <div className="stat-label-row">
                        <span>BACK-END (NODE/API)</span>
                        <span className="stat-val">88 XP</span>
                      </div>
                      <div className="stat-bar">
                        <div className="stat-fill" style={{ width: '88%' }}></div>
                      </div>
                    </div>
                    <div className="rpg-stat">
                      <div className="stat-label-row">
                        <span>DISEO DE INTERFAZ</span>
                        <span className="stat-val">82 XP</span>
                      </div>
                      <div className="stat-bar">
                        <div className="stat-fill" style={{ width: '82%' }}></div>
                      </div>
                    </div>
                    <div className="rpg-stat">
                      <div className="stat-label-row">
                        <span>OPTIMIZACIÓN (FPS)</span>
                        <span className="stat-val">90 XP</span>
                      </div>
                      <div className="stat-bar">
                        <div className="stat-fill" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* LEVEL 2: MI EXPERIENCIA */}
          <section className="section level-2-section">
            {/* Local Parallax background layers clipped to Section 2 (WORLD 1-3: ATHLETIC) */}
            <div className="local-parallax">
              <div className="local-layer local-clouds" ref={el => cloudsRefs.current[2] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600">
                  {/* Clouds high in the sky */}
                  <g fill="#ffffff" stroke="#000000" strokeWidth="4">
                    <rect x="250" y="60" width="120" height="35" rx="8" />
                    <rect x="275" y="40" width="70" height="55" rx="8" />
                    <rect x="700" y="80" width="140" height="35" rx="8" />
                    <rect x="725" y="60" width="90" height="55" rx="8" />
                  </g>
                </svg>
              </div>
              <div className="local-layer local-back" ref={el => backRefs.current[2] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600">
                  {/* Giant Mario Tree trunks/vines */}
                  <g stroke="#000000" strokeWidth="4">
                    <rect x="150" y="0" width="55" height="600" fill="#b06010" />
                    <rect x="800" y="0" width="60" height="600" fill="#b06010" />
                  </g>
                </svg>
              </div>
              <div className="local-layer local-mid" ref={el => midRefs.current[2] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600">
                  {/* Giant mushroom platforms */}
                  <g stroke="#000000" strokeWidth="4">
                    {/* Mushroom 1 */}
                    <rect x="460" y="320" width="50" height="280" fill="#fcb488" />
                    <path d="M 380 320 C 380 200, 590 200, 590 320 Z" fill="#d82800" />
                    <circle cx="430" cy="270" r="12" fill="#ffffff" stroke="none" />
                    <circle cx="500" cy="250" r="14" fill="#ffffff" stroke="none" />
                    <circle cx="540" cy="290" r="12" fill="#ffffff" stroke="none" />
                    
                    {/* Railings */}
                    <path d="M 0 450 L 1000 450" stroke="#fcb488" strokeWidth="6" strokeDasharray="25, 20" />
                  </g>
                </svg>
              </div>
            </div>

            <div className="game-card">
              <div className="level-badge">NIVEL 02: MI TRAYECTORIA</div>
              <h2 className="section-title">
                <svg className="project-icon" viewBox="0 0 24 24"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L16.41 17 11 11.59V6h2v4.83L17 15.59z"/></svg>
                REGISTRO DE MISIONES
              </h2>
              <div className="card-body">
                <div className="timeline-container">
                  <div className="timeline-item">
                    <div className="timeline-date">2024 - ACT</div>
                    <div className="timeline-content">
                      <h3>Desarrollador Full-Stack Senior</h3>
                      <div className="timeline-company">NeoTech Studios (Gremio Principal)</div>
                      <p className="timeline-desc">
                        Lidero el diseño técnico y desarrollo de múltiples portales SaaS interactivos. Implementé arquitecturas escalables basadas en React y APIs eficientes de Node.js, logrando reducir el tiempo de carga de las páginas principales en un 35%.
                      </p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-date">2022 - 2024</div>
                    <div className="timeline-content">
                      <h3>Desarrollador Web React</h3>
                      <div className="timeline-company">Pixel Craft Agency</div>
                      <p className="timeline-desc">
                        Responsable de la construcción de interfaces inmersivas y animadas a medida de clientes internacionales. Integración completa de gateways de pago (Stripe, Paypal) y optimización móvil con CSS Grid y Flexbox.
                      </p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-date">2020 - 2022</div>
                    <div className="timeline-content">
                      <h3>Desarrollador Front-End Junior</h3>
                      <div className="timeline-company">Startup Forge</div>
                      <p className="timeline-desc">
                        Desarrollo y mantenimiento de componentes interactivos reusables utilizando Vue y React. Limpieza de bases de código legadas y estructuración de maquetados responsivos compatibles con dispositivos antiguos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* LEVEL 3: PROYECTOS DESTACADOS */}
          <section className="section level-3-section">
            {/* Local Parallax background layers clipped to Section 3 (WORLD 1-4: CASTLE) */}
            <div className="local-parallax">
              <div className="local-layer local-clouds" ref={el => cloudsRefs.current[3] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600">
                  {/* Chains hanging in the castle */}
                  <g stroke="#000000" strokeWidth="4" fill="none">
                    <path d="M 120 0 L 120 220" strokeDasharray="14, 10" />
                    <path d="M 880 0 L 880 220" strokeDasharray="14, 10" />
                  </g>
                </svg>
              </div>
              <div className="local-layer local-back" ref={el => backRefs.current[3] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600">
                  {/* Castle wall masonry structures */}
                  <g fill="#333333" stroke="#000000" strokeWidth="4">
                    {/* Background columns */}
                    <rect x="200" y="0" width="70" height="600" />
                    <rect x="730" y="0" width="70" height="600" />
                    {/* Arch windows */}
                    <path d="M 450 180 C 450 130, 510 130, 510 180 L 510 260 L 450 260 Z" fill="#000" stroke="#000" />
                  </g>
                </svg>
              </div>
              <div className="local-layer local-mid" ref={el => midRefs.current[3] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600">
                  {/* Lava wave pool at the bottom */}
                  <g fill="#d82800" stroke="#fc9838" strokeWidth="3">
                    <path d="M 0 530 Q 30 500 60 530 T 120 530 T 180 530 T 240 530 T 300 530 T 360 530 T 420 530 T 480 530 T 540 530 T 600 530 T 660 530 T 720 530 T 780 530 T 840 530 T 900 530 T 960 530 T 1020 530 L 1020 600 L 0 600 Z" />
                  </g>
                  {/* Floating stone platforms */}
                  <g fill="#666666" stroke="#000000" strokeWidth="4">
                    <rect x="420" y="320" width="160" height="35" />
                    <line x1="420" y1="337" x2="580" y2="337" stroke="#000000" strokeWidth="2" />
                  </g>
                </svg>
              </div>
            </div>

            <div className="game-card">
              <div className="level-badge">NIVEL 03: MIS LOGROS</div>
              <h2 className="section-title">
                <svg className="project-icon" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                PROYECTOS COMPLETADOS
              </h2>
              
              <div className="card-body">
                <div className="projects-slider-wrapper">
                  
                  {/* Slider Arrows */}
                  <div className="slider-controls">
                    <button 
                      className="slider-arrow-btn" 
                      onClick={prevSlide}
                      disabled={sliderIndex === 0}
                    >
                      ◀
                    </button>
                    <button 
                      className="slider-arrow-btn" 
                      onClick={nextSlide}
                      disabled={sliderIndex >= (projects.length - visibleCardsCount)}
                    >
                      ▶
                    </button>
                  </div>

                  <div className="projects-viewport">
                    <div 
                      className="projects-track"
                      style={{
                        transform: `translateX(calc(-${slidingPercent}% - ${sliderIndex * 20}px / ${visibleCardsCount}))`,
                      }}
                    >
                      {projects.map((project) => (
                        <div 
                          key={project.id} 
                          className="project-card"
                          onClick={() => { setSelectedProject(project); }}
                        >
                          <div className="project-header">
                            <div className="project-img-placeholder">
                              <svg className="project-icon" viewBox="0 0 24 24">{project.icon}</svg>
                            </div>
                            <h4>{project.title}</h4>
                            <p className="project-desc">{project.shortDesc}</p>
                          </div>
                          <span className="project-link">VER MÁS ❯</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </section>

          {/* LEVEL 4: CONTACTO */}
          <section className="section level-4-section">
            {/* Local Parallax background layers clipped to Section 4 (WORLD 1-5: UNDERWATER) */}
            <div className="local-parallax">
              <div className="local-layer local-clouds" ref={el => cloudsRefs.current[4] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600">
                  {/* Floating water bubbles */}
                  <g fill="#ffffff" opacity="0.5">
                    <circle cx="180" cy="380" r="6" />
                    <circle cx="195" cy="330" r="9" />
                    <circle cx="188" cy="270" r="5" />
                    <circle cx="800" cy="350" r="8" />
                    <circle cx="785" cy="290" r="11" />
                  </g>
                </svg>
              </div>
              <div className="local-layer local-back" ref={el => backRefs.current[4] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600">
                  {/* Deep coral mounds */}
                  <g fill="#002d80" stroke="#000000" strokeWidth="4">
                    <path d="M 120 600 C 180 480, 260 480, 320 600 Z" />
                    <path d="M 680 600 C 740 460, 840 460, 900 600 Z" />
                  </g>
                </svg>
              </div>
              <div className="local-layer local-mid" ref={el => midRefs.current[4] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600">
                  {/* Wavy seaweed and red corals */}
                  <g fill="#00a800" stroke="#000000" strokeWidth="4">
                    {/* Seaweed 1 */}
                    <path d="M 220 600 Q 250 480 220 380 T 250 260 L 280 260 Q 250 380 280 480 T 250 600 Z" />
                    {/* Seaweed 2 */}
                    <path d="M 720 600 Q 690 490 720 390 T 690 280 L 720 280 Q 750 390 720 490 T 750 600 Z" />
                  </g>
                  {/* Red Corals */}
                  <g fill="#d82800" stroke="#000000" strokeWidth="4">
                    <path d="M 460 600 C 460 550, 440 520, 470 500 C 500 480, 520 520, 510 600 Z" />
                  </g>
                </svg>
              </div>
            </div>

            <div className="game-card">
              <div className="level-badge">NIVEL 04: BATALLA FINAL</div>
              <h2 className="section-title">
                <svg className="project-icon" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                ENVIAR MENSAJE
              </h2>
              
              <div className="card-body">
                <div className="contact-container">
                  <div className="contact-info">
                    <p className="contact-text">
                      Has llegado al final de este mapa de aventuras. Escríbeme un mensaje a través de esta terminal de comunicación para iniciar nuevos proyectos o consultarme cualquier duda.
                    </p>
                    <p className="contact-text">
                      ¡Conéctate conmigo a través de las redes oficiales!
                    </p>
                    <div className="social-links">
                      <a className="social-btn" href="https://github.com" target="_blank" rel="noreferrer">
                        <svg className="social-icon" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                      </a>
                      <a className="social-btn" href="https://linkedin.com" target="_blank" rel="noreferrer">
                        <svg className="social-icon" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                      </a>
                    </div>
                  </div>

                  <form className="contact-form" onSubmit={handleContactSubmit}>
                    <div className="form-group">
                      <label className="form-label">Nombre</label>
                      <input className="form-input" type="text" placeholder="Tu Nombre" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-input" type="email" placeholder="Tu Email" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mensaje</label>
                      <textarea className="form-textarea" placeholder="Escribe aquí..." required></textarea>
                    </div>
                    <button className="submit-btn" type="submit">Enviar Mensaje</button>
                  </form>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* HUD Navigation overlay */}
        <div className="hud-overlay">
          <div className="mario-hud">
            <div className="hud-col">
              <span className="hud-header-text">ALEJANDRO</span>
              <span className="hud-value-text">{String(score).padStart(6, '0')}</span>
            </div>
            <div className="hud-col">
              <span className="hud-header-text">COINS</span>
              <span className="hud-value-text">
                <span className="mario-coin-icon"></span>
                x{String(coins).padStart(2, '0')}
              </span>
            </div>
            <div className="hud-col">
              <span className="hud-header-text">WORLD</span>
              <span className="hud-value-text">1-{activeLevel + 1}</span>
            </div>
            <div className="hud-col">
              <span className="hud-header-text">TIME</span>
              <span className="hud-value-text">{String(timeLeft).padStart(3, '0')}</span>
            </div>
          </div>

          {/* Level Select navigation bar */}
          <nav className="hud-nav">
            <button className={`nav-btn ${activeLevel === 0 ? 'active' : ''}`} onClick={() => navigateToLevel(0)}>
              {activeLevel === 0 && <span className="nav-arrow">▶</span>} INICIO
            </button>
            <button className={`nav-btn ${activeLevel === 1 ? 'active' : ''}`} onClick={() => navigateToLevel(1)}>
              {activeLevel === 1 && <span className="nav-arrow">▶</span>} SOBRE MI
            </button>
            <button className={`nav-btn ${activeLevel === 2 ? 'active' : ''}`} onClick={() => navigateToLevel(2)}>
              {activeLevel === 2 && <span className="nav-arrow">▶</span>} EXPERIENCIA
            </button>
            <button className={`nav-btn ${activeLevel === 3 ? 'active' : ''}`} onClick={() => navigateToLevel(3)}>
              {activeLevel === 3 && <span className="nav-arrow">▶</span>} PROYECTOS
            </button>
            <button className={`nav-btn ${activeLevel === 4 ? 'active' : ''}`} onClick={() => navigateToLevel(4)}>
              {activeLevel === 4 && <span className="nav-arrow">▶</span>} CONTACTO
            </button>
          </nav>
        </div>

        {/* Project Detail Modal Overlay */}
        {selectedProject && (
          <div className="detail-modal-overlay">
            <div className="detail-modal-card">
              <div className="detail-modal-header">
                <h3 className="detail-modal-title">{selectedProject.title}</h3>
                <button className="modal-close-btn" onClick={() => { setSelectedProject(null); }}>✖</button>
              </div>
              <div className="modal-img-banner">
                <svg className="project-icon" style={{ width: '48px', height: '48px' }} viewBox="0 0 24 24">{selectedProject.icon}</svg>
              </div>
              <p className="modal-body-desc">{selectedProject.fullDesc}</p>
              
              <div className="modal-tech-box">
                <h5 className="modal-tech-label">HERRAMIENTAS UTILIZADAS:</h5>
                <div className="skills-tags">
                  {selectedProject.tech.map((t, idx) => (
                    <span key={idx} className="skill-tag">{t}</span>
                  ))}
                </div>
              </div>
              
              <div className="modal-buttons-row">
                <a className="modal-action-btn primary" href="#demo" onClick={(e) => { e.preventDefault(); }}>
                  JUGAR DEMO
                </a>
                <a className="modal-action-btn" href="#source" onClick={(e) => { e.preventDefault(); }}>
                  CODIGO FUENTE
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Victory Modal Popup (triggers on Contact Form submit) */}
        {showWinScreen && (
          <div className="game-win-popup">
            <div className="win-card">
              <h3 className="win-title">🏆 MISION CUMPLIDA!</h3>
              <p className="win-desc">
                El mensaje se ha enviado correctamente a la terminal de Alejandro. ¡Gracias por completar este nivel y jugar en mi portafolio interactivo!
              </p>
              <button className="win-close-btn" onClick={() => { setShowWinScreen(false); }}>
                VOLVER AL JUEGO
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
