import { useState, useEffect, useRef } from 'react';
import './App.css';
import experienceData from './texts/experience.json';
import projectsData from './texts/projects.json';

// Character Component (Swaps standing images and walking gifs dynamically)
function Character({ characterRef }) {
  return (
    <div 
      ref={characterRef}
      className="character-container"
    >
      <img 
        src="/mario_stand_right.png" 
        className="character-img"
        alt="Hero Character"
      />
    </div>
  );
}

function App() {
  const [activeLevel, setActiveLevel] = useState(0);
  const [showWinScreen, setShowWinScreen] = useState(false);

  // Mario HUD states
  const [timeLeft, setTimeLeft] = useState(400);

  // Projects Slider and Detail Modal states
  const [sliderIndex, setSliderIndex] = useState(0);
  const [visibleCardsCount, setVisibleCardsCount] = useState(3);
  const [selectedProject, setSelectedProject] = useState(null);

  // Refs for main horizontal translations (moves 1:1 with scroll)
  const groundLayerRef = useRef(null);
  const contentLayerRef = useRef(null);
  const gatesLayerRef = useRef(null); // Added for transition gates layer
  const scrollAnimRef = useRef(null); // Added for custom smooth scroll transition animation
  const characterRef = useRef(null);

  // Refs arrays for the local parallax layers inside each of the 5 sections
  // ponytail: arrays of refs directly modified in scroll handler to clip scenery per world
  const cloudsRefs = useRef([]);
  const backRefs = useRef([]);
  const midRefs = useRef([]);

  const prevScrollY = useRef(0);
  const walkingTimeoutRef = useRef(null);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const renderAnimFrameRef = useRef(null);
  const activeLevelRef = useRef(0);
  const hudScoreRef = useRef(null);
  const hudCoinsRef = useRef(null);

  const maxScrollRef = useRef(0);
  const isMobileRef = useRef(false);
  const currentDirectionRef = useRef('right');

  // Projects data from JSON file (src/texts/projects.json)
  const defaultIcon = <path d="M3 3v18h18V3H3zm12 10H9v-2h6v2zm2-4H7V7h10v2z"/>;
  const projects = projectsData.map(p => ({
    id: p.id,
    title: p.title,
    shortDesc: p.short_description,
    fullDesc: p.description,
    tech: p.tags,
    tools: p.tools,
    year: p.year,
    company: p.company,
    link: p.link,
    featured: p.featured,
    icon: defaultIcon,
  }));

  // Recalculate slider visible cards count based on viewport size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      isMobileRef.current = width <= 768;
      
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      maxScrollRef.current = maxScroll;

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
    const updateRender = () => {
      const ease = 0.08; // Smooth inertial scrolling factor (lower = smoother/slower)
      const diff = targetProgressRef.current - currentProgressRef.current;

      if (Math.abs(diff) < 0.0001) {
        currentProgressRef.current = targetProgressRef.current;
        renderAnimFrameRef.current = null;
      } else {
        currentProgressRef.current += diff * ease;
        renderAnimFrameRef.current = requestAnimationFrame(updateRender);
      }

      const progress = currentProgressRef.current;

      // 3. Move main horizontal containers based on smooth progress
      const totalTranslateVW = -progress * 400; // moves 0 to -400vw
      if (groundLayerRef.current) {
        groundLayerRef.current.style.transform = `translateX(${totalTranslateVW}vw)`;
      }
      if (contentLayerRef.current) {
        contentLayerRef.current.style.transform = `translateX(${totalTranslateVW}vw)`;
      }
      if (gatesLayerRef.current) {
        gatesLayerRef.current.style.transform = `translateX(${totalTranslateVW}vw)`;
      }

      // Move character horizontally from left to right based on smooth progress
      const isMobile = isMobileRef.current;
      const startX = isMobile ? 6 : 10;
      const endX = isMobile ? 80 : 85;
      const characterX = startX + progress * (endX - startX);
      if (characterRef.current) {
        characterRef.current.style.left = `${characterX}vw`;
      }

      // 4. Move local clipped parallax layers based on smooth progress
      for (let i = 0; i < 5; i++) {
        const xViewport = (i * 100) - (progress * 400);

        // Clouds (s = 0.4)
        const xClouds = xViewport * -0.6;
        if (cloudsRefs.current[i]) {
          cloudsRefs.current[i].style.transform = `translateX(${xClouds}vw)`;
        }

        // Mountains (s = 0.6)
        const xBack = xViewport * -0.4;
        if (backRefs.current[i]) {
          backRefs.current[i].style.transform = `translateX(${xBack}vw)`;
        }

        // Trees (s = 0.8)
        const xMid = xViewport * -0.2;
        if (midRefs.current[i]) {
          midRefs.current[i].style.transform = `translateX(${xMid}vw)`;
        }
      }

      // 5. Update Level Badge State (5 Sections => bounds: 0 to 4)
      let nextLevel = 0;
      if (progress >= 0.9625) {
        nextLevel = 4;
      } else if (progress >= 0.7125) {
        nextLevel = 3;
      } else if (progress >= 0.4625) {
        nextLevel = 2;
      } else if (progress >= 0.2125) {
        nextLevel = 1;
      } else {
        nextLevel = 0;
      }

      if (nextLevel !== activeLevelRef.current) {
        activeLevelRef.current = nextLevel;
        setActiveLevel(nextLevel);
      }

      // 6. Update score and coins based on smooth progress (directly in the DOM to avoid 60 FPS React re-renders)
      const nextScore = Math.floor(progress * 3000) * 100;
      const nextCoins = Math.floor(progress * 99);
      if (hudScoreRef.current) {
        hudScoreRef.current.textContent = String(nextScore).padStart(6, '0');
      }
      if (hudCoinsRef.current) {
        hudCoinsRef.current.textContent = `x${String(nextCoins).padStart(2, '0')}`;
      }
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = maxScrollRef.current || (document.documentElement.scrollHeight - window.innerHeight);
      const progress = maxScroll > 0 ? scrollY / maxScroll : 0;

      // 1. Determine direction based on actual scroll position changes
      const currentDirection = scrollY > prevScrollY.current ? 'right' : 'left';
      currentDirectionRef.current = currentDirection;

      if (characterRef.current) {
        const img = characterRef.current.querySelector('.character-img');
        if (img) {
          const walkSrc = currentDirection === 'right' ? '/mario_walk_right.gif' : '/mario_walk_left.gif';
          if (img.getAttribute('src') !== walkSrc) {
            img.src = walkSrc;
          }
        }
      }

      if (walkingTimeoutRef.current) clearTimeout(walkingTimeoutRef.current);
      walkingTimeoutRef.current = setTimeout(() => {
        if (characterRef.current) {
          const img = characterRef.current.querySelector('.character-img');
          if (img) {
            const idleSrc = currentDirectionRef.current === 'right' ? '/mario_stand_right.png' : '/mario_stand_left.png';
            img.src = idleSrc;
          }
        }
      }, 150);

      prevScrollY.current = scrollY;
      targetProgressRef.current = progress;

      // Start rendering loop if not already running
      if (!renderAnimFrameRef.current) {
        renderAnimFrameRef.current = requestAnimationFrame(updateRender);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount to position everything correctly
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (walkingTimeoutRef.current) {
        clearTimeout(walkingTimeoutRef.current);
        walkingTimeoutRef.current = null;
      }
      if (renderAnimFrameRef.current) {
        cancelAnimationFrame(renderAnimFrameRef.current);
        renderAnimFrameRef.current = null;
      }
    };
  }, []);

  // Helper for custom smooth easing animation (simulates slow pan like in a platformer game)
  const customSmoothScrollTo = (targetY, duration) => {
    if (scrollAnimRef.current) {
      cancelAnimationFrame(scrollAnimRef.current);
    }

    const startY = window.scrollY;
    const difference = targetY - startY;
    const startTime = performance.now();

    const step = (currentTime) => {
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      // Easing: Ease-In-Out Cubic (very smooth panning)
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      window.scrollTo(0, startY + difference * ease);

      if (timeElapsed < duration) {
        scrollAnimRef.current = requestAnimationFrame(step);
      } else {
        scrollAnimRef.current = null;
      }
    };

    scrollAnimRef.current = requestAnimationFrame(step);
  };

  // Navigate to Level on Nav Click (Smooth scroll with custom slow game-like animation)
  const navigateToLevel = (index) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetScrollY = (index / 4) * maxScroll;

    // Calculate actual scroll distance in terms of level sections to maintain constant speed
    const currentProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    const targetProgress = index / 4;
    const progressDiff = Math.abs(targetProgress - currentProgress);
    const levelsToTravel = progressDiff * 4; // Number of sections to travel

    // Maintain a fixed speed: 3500ms per level section traversed
    const duration = Math.max(300, levelsToTravel * 3500);

    customSmoothScrollTo(targetScrollY, duration);
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

        {/* Gates Layer (1.0x speed) - Positioned at z-index 12 so that character passes behind divider walls */}
        <div className="gates-layer" ref={gatesLayerRef}>
          <div className="section-divider-gate divider-0-1">
            <div className="gate-header">MUNDO 1-2</div>
          </div>
          <div className="section-divider-gate divider-1-2">
            <div className="gate-header">MUNDO 1-3</div>
          </div>
          <div className="section-divider-gate divider-2-3">
            <div className="gate-header">MUNDO 1-4</div>
          </div>
          <div className="section-divider-gate divider-3-4">
            <div className="gate-header">MUNDO 1-5</div>
          </div>
        </div>

        {/* Character element walking on floor */}
        <Character characterRef={characterRef} />

        {/* 1:1 Content Layer Scrolling over the parallax backgrounds */}
        <div className="content-layer" ref={contentLayerRef}>

          {/* LEVEL 0: INICIO (WORLD 1-1: OVERWORLD) */}
          <section className="section level-0-section">
            {/* Local Parallax background layers clipped to Section 0 */}
            <div className="local-parallax">
              <div className="local-layer local-clouds" ref={el => cloudsRefs.current[0] = el}>
                <img src="/bg_mario_layer0.png" className="backdrop-img" alt="Mario Sky" />
              </div>
              <div className="local-layer local-back" ref={el => backRefs.current[0] = el}>
                <img src="/bg_mario_layer1.png" className="backdrop-img" alt="Mario Hills" />
              </div>
              <div className="local-layer local-mid" ref={el => midRefs.current[0] = el}>
                <img src="/bg_mario_layer2.png" className="backdrop-img" alt="Mario Blocks" />
              </div>
            </div>

            <div className="intro-container">
              <h1 className="retro-title">Alejandro Almonacid</h1>
              <p className="intro-subtitle">DESARROLLADOR FRONT END - VTEX IO SPECIALIST</p>
              
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
                <img src="/bg_hoth_layer0.png" className="backdrop-img" alt="Hoth Skies" />
              </div>
              <div className="local-layer local-back" ref={el => backRefs.current[1] = el}>
                <img src="/bg_hoth_layer1.png" className="backdrop-img" alt="Hoth Mountains" />
              </div>
              <div className="local-layer local-mid" ref={el => midRefs.current[1] = el}>
                <img src="/bg_hoth_layer2.png" className="backdrop-img" alt="Hoth Trenches" />
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
                        <h3>ALEJANDRO ALMONACID</h3>
                        <p>Desarrollador Nivel 99</p>
                      </div>
                    </div>
                    
                     <p>
                       {experienceData.find(e => e.type === 'fotografia')?.description}
                     </p>
                     <p>
                       {experienceData.find(e => e.type === 'diseno')?.description}
                     </p>
                    
                     {/* Tools and Skills Tags */}
                     <div className="skills-tags">
                       <span className="skill-tag">React</span>
                       <span className="skill-tag">JavaScript</span>
                       <span className="skill-tag">TypeScript</span>
                       <span className="skill-tag">NodeJS</span>
                       <span className="skill-tag">HTML5/CSS3</span>
                       <span className="skill-tag">VTEX IO</span>
                       <span className="skill-tag">SCSS</span>
                       <span className="skill-tag">Git</span>
                       <span className="skill-tag">Docker</span>
                       <span className="skill-tag">TCG / Streaming</span>
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
                <img src="/bg_dkc_layer0.png" className="backdrop-img" alt="DKC Sky" />
              </div>
              <div className="local-layer local-back" ref={el => backRefs.current[2] = el}>
                <img src="/bg_dkc_layer1.png" className="backdrop-img" alt="DKC Canopy" />
              </div>
              <div className="local-layer local-mid" ref={el => midRefs.current[2] = el}>
                <img src="/bg_dkc_layer2.png" className="backdrop-img" alt="DKC Jungle Ground" />
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
                  {experienceData.map((item) => (
                    <div className="timeline-item" key={item.id}>
                      <div className="timeline-date">{item.year}</div>
                      <div className="timeline-content">
                        <h3>{item.title}</h3>
                        {item.company && (
                          <div className="timeline-company">{item.company}</div>
                        )}
                        <p className="timeline-desc">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* LEVEL 3: PROYECTOS DESTACADOS */}
          <section className="section level-3-section">
            {/* Local Parallax background layers clipped to Section 3 (WORLD 1-4: CASTLE) */}
            <div className="local-parallax">
              <div className="local-layer local-clouds" ref={el => cloudsRefs.current[3] = el}>
                <img src="/bg_metroid_layer0.png" className="backdrop-img" alt="Metroid Depths" />
              </div>
              <div className="local-layer local-back" ref={el => backRefs.current[3] = el}>
                <img src="/bg_metroid_layer1.png" className="backdrop-img" alt="Metroid Columns" />
              </div>
              <div className="local-layer local-mid" ref={el => midRefs.current[3] = el}>
                <img src="/bg_metroid_layer2.png" className="backdrop-img" alt="Metroid Platforms" />
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
                <img src="/bg_metalslug_layer0.png" className="backdrop-img" alt="Metal Slug Sky" />
              </div>
              <div className="local-layer local-back" ref={el => backRefs.current[4] = el}>
                <img src="/bg_metalslug_layer1.png" className="backdrop-img" alt="Metal Slug Ruins" />
              </div>
              <div className="local-layer local-mid" ref={el => midRefs.current[4] = el}>
                <img src="/bg_metalslug_layer2.png" className="backdrop-img" alt="Metal Slug Ground" />
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
