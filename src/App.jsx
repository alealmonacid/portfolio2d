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
          {/* Layer 5: Ground line (1.0x speed) */}
          {/* ponytail: distinct floor segments rendered side-by-side in layer-ground with corrected top: auto override */}
          <div className="layer layer-ground" ref={groundLayerRef}>
            <div className="ground-segment segment-0" style={{ left: '0vw' }}></div>
            <div className="ground-segment segment-1" style={{ left: '100vw' }}></div>
            <div className="ground-segment segment-2" style={{ left: '200vw' }}></div>
            <div className="ground-segment segment-3" style={{ left: '300vw' }}></div>
            <div className="ground-segment segment-4" style={{ left: '400vw' }}></div>
          </div>
        </div>

        {/* Character element walking on floor */}
        <Character isWalking={isWalking} direction={direction} level={activeLevel} />

        {/* 1:1 Content Layer Scrolling over the parallax backgrounds */}
        <div className="content-layer" ref={contentLayerRef}>
          
          {/* SECTION DIVIDER GATES (TRANSITION PORTALS BETWEEN SECTIONS) */}
          <div className="section-divider-gate divider-0-1">
            <div className="gate-header">MUNDO 02</div>
            <div className="gate-pillars-row" style={{ display: 'flex', width: '100%', justifyContent: 'space-between', height: 'calc(100% - 40px)' }}>
              <div className="gate-pillar"></div>
              <div className="gate-pillar"></div>
            </div>
          </div>
          <div className="section-divider-gate divider-1-2">
            <div className="gate-header">MUNDO 03</div>
            <div className="gate-pillars-row" style={{ display: 'flex', width: '100%', justifyContent: 'space-between', height: 'calc(100% - 40px)' }}>
              <div className="gate-pillar"></div>
              <div className="gate-pillar"></div>
            </div>
          </div>
          <div className="section-divider-gate divider-2-3">
            <div className="gate-header">MUNDO 04</div>
            <div className="gate-pillars-row" style={{ display: 'flex', width: '100%', justifyContent: 'space-between', height: 'calc(100% - 40px)' }}>
              <div className="gate-pillar"></div>
              <div className="gate-pillar"></div>
            </div>
          </div>
          <div className="section-divider-gate divider-3-4">
            <div className="gate-header">PORTAL FIN</div>
            <div className="gate-pillars-row" style={{ display: 'flex', width: '100%', justifyContent: 'space-between', height: 'calc(100% - 40px)' }}>
              <div className="gate-pillar"></div>
              <div className="gate-pillar"></div>
            </div>
          </div>

          {/* LEVEL 0: INICIO */}
          <section className="section level-0-section">
            {/* Local Parallax background layers clipped to Section 0 */}
            <div className="local-parallax">
              <div className="local-layer local-clouds" ref={el => cloudsRefs.current[0] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600">
                  <path d="M 120 150 C 150 120, 200 120, 230 150 C 260 130, 310 140, 330 170 C 350 200, 300 230, 230 220 C 180 230, 110 210, 120 150 Z" fill="#2d316a" />
                  <path d="M 550 200 C 580 170, 630 170, 660 200 C 690 180, 740 190, 760 220 C 780 250, 730 280, 660 270 L 550 270 Z" fill="#2d316a" />
                </svg>
              </div>
              <div className="local-layer local-back" ref={el => backRefs.current[0] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600" preserveAspectRatio="none">
                  <path d="M 0 600 L 0 440 L 140 310 L 280 450 L 460 270 L 680 490 L 820 290 L 1000 450 L 1000 600 Z" fill="#1b143c" />
                </svg>
              </div>
              <div className="local-layer local-mid" ref={el => midRefs.current[0] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600" preserveAspectRatio="none">
                  <polygon points="80,600 65,490 73,490 60,420 70,420 55,350 85,350 72,420 80,420 68,490 105,600" fill="#2d225c" />
                  <polygon points="850,600 830,510 838,510 825,440 833,440 820,370 850,370 837,440 845,440 832,510 870,600" fill="#2d225c" />
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
            {/* Local Parallax background layers clipped to Section 1 */}
            <div className="local-parallax">
              <div className="local-layer local-clouds" ref={el => cloudsRefs.current[1] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600">
                  <path d="M 200 180 C 250 150, 320 160, 350 200 C 400 180, 450 210, 430 250 C 410 290, 300 290, 250 270 C 180 270, 170 220, 200 180 Z" fill="#144d32" />
                </svg>
              </div>
              <div className="local-layer local-back" ref={el => backRefs.current[1] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600" preserveAspectRatio="none">
                  <path d="M 0 600 L 0 490 Q 180 380 340 470 Q 540 360 740 480 Q 880 400 1000 490 L 1000 600 Z" fill="#0b2315" />
                </svg>
              </div>
              <div className="local-layer local-mid" ref={el => midRefs.current[1] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600" preserveAspectRatio="none">
                  <polygon points="120,600 100,480 110,480 95,410 105,410 90,340 120,340 105,410 115,410 100,480 140,600" fill="#103e23" />
                  <polygon points="320,600 295,460 308,460 288,370 300,370 280,290 320,290 300,370 312,370 292,460 345,600" fill="#0a2a17" />
                  <polygon points="760,600 740,490 750,490 735,420 745,420 730,350 760,350 745,420 755,420 740,490 780,600" fill="#103e23" />
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
            {/* Local Parallax background layers clipped to Section 2 */}
            <div className="local-parallax">
              <div className="local-layer local-clouds" ref={el => cloudsRefs.current[2] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600">
                  <circle cx="500" cy="220" r="50" fill="#ffaa00" opacity="0.25" />
                </svg>
              </div>
              <div className="local-layer local-back" ref={el => backRefs.current[2] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600" preserveAspectRatio="none">
                  <path d="M 0 600 Q 250 400 520 500 Q 780 410 1000 510 L 1000 600 Z" fill="#4d240f" />
                  <path d="M 0 600 L 120 540 C 260 480 430 560 580 510 L 820 560 L 1000 530 L 1000 600 Z" fill="#3c1b0a" opacity="0.65" />
                </svg>
              </div>
              <div className="local-layer local-mid" ref={el => midRefs.current[2] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600" preserveAspectRatio="none">
                  <polygon points="100,600 280,340 460,600" fill="#582914" />
                  <rect x="780" y="360" width="25" height="240" fill="#421e0e" />
                  <polygon points="765,360 820,360 805,345 780,345" fill="#582914" />
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
            {/* Local Parallax background layers clipped to Section 3 */}
            <div className="local-parallax">
              <div className="local-layer local-clouds" ref={el => cloudsRefs.current[3] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600">
                  <line x1="0" y1="120" x2="1000" y2="120" stroke="#ff007f" strokeWidth="2" opacity="0.2" />
                  <line x1="0" y1="180" x2="1000" y2="180" stroke="#aa3bff" strokeWidth="1.5" opacity="0.2" />
                </svg>
              </div>
              <div className="local-layer local-back" ref={el => backRefs.current[3] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600" preserveAspectRatio="none">
                  <path d="M 0 600 L 0 350 L 60 350 L 60 420 L 130 420 L 130 290 L 200 290 L 200 460 L 300 460 L 300 230 L 380 230 L 380 370 L 480 370 L 480 260 L 560 260 L 560 430 L 680 430 L 680 300 L 760 300 L 760 390 L 860 390 L 860 270 L 1000 270 L 1000 600 Z" fill="#140c2a" />
                </svg>
              </div>
              <div className="local-layer local-mid" ref={el => midRefs.current[3] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600" preserveAspectRatio="none">
                  <rect x="0" y="300" width="1000" height="300" fill="#201344" />
                  <rect x="150" y="360" width="10" height="15" fill="#00f3ff" />
                  <rect x="210" y="330" width="12" height="20" fill="#ffaa00" />
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
            {/* Local Parallax background layers clipped to Section 4 */}
            <div className="local-parallax">
              <div className="local-layer local-clouds" ref={el => cloudsRefs.current[4] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600">
                  <path d="M 100 100 C 300 80, 600 200, 700 150 C 800 100, 900 300, 1000 250 L 1000 400 L 0 400 Z" fill="#1b0c3a" opacity="0.4" />
                </svg>
              </div>
              <div className="local-layer local-back" ref={el => backRefs.current[4] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600">
                  <ellipse cx="730" cy="140" rx="30" ry="22" fill="#150a30" stroke="#ffaa00" strokeWidth="1.5" />
                  <path d="M 670 148 Q 730 105 790 148 Q 730 175 670 148" stroke="#ffaa00" strokeWidth="3.5" fill="none" />
                </svg>
              </div>
              <div className="local-layer local-mid" ref={el => midRefs.current[4] = el}>
                <svg className="backdrop-svg" viewBox="0 0 1000 600">
                  <circle cx="220" cy="170" r="45" fill="#1b103e" stroke="#aa3bff" strokeWidth="2" />
                  <path d="M 178 156 C 185 180 220 215 262 184 A 45 45 0 0 1 178 156 Z" fill="#aa3bff" opacity="0.3" />
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
          <div className="hud-header">
            
            <div className="hud-left">
              {/* Hearts / HP Bar */}
              <div className="hud-bar-container">
                <span className="hud-label">HP</span>
                <div className="hud-hearts">
                  <svg className="heart" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  <svg className="heart" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  <svg className="heart" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </div>
              </div>
              
              {/* XP / Level Progress Bar */}
              <div className="hud-bar-container">
                <span className="hud-label">XP</span>
                <div className="hud-xp-bar">
                  <div className="hud-xp-fill" style={{ width: `${xpPercent}%` }}></div>
                </div>
              </div>
            </div>

            {/* Level Select navigation bar */}
            <nav className="hud-nav">
              <button className={`nav-btn ${activeLevel === 0 ? 'active' : ''}`} onClick={() => navigateToLevel(0)}>INICIO</button>
              <button className={`nav-btn ${activeLevel === 1 ? 'active' : ''}`} onClick={() => navigateToLevel(1)}>SOBRE MI</button>
              <button className={`nav-btn ${activeLevel === 2 ? 'active' : ''}`} onClick={() => navigateToLevel(2)}>EXPERIENCIA</button>
              <button className={`nav-btn ${activeLevel === 3 ? 'active' : ''}`} onClick={() => navigateToLevel(3)}>PROYECTOS</button>
              <button className={`nav-btn ${activeLevel === 4 ? 'active' : ''}`} onClick={() => navigateToLevel(4)}>CONTACTO</button>
            </nav>

            <div className="hud-right">
              {/* Level Indicator banner */}
              <div className="level-banner">
                MUNDO <span className="level-number">0{activeLevel + 1}</span>
              </div>
            </div>

          </div>
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
