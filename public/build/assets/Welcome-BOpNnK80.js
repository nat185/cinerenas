import{r as i,j as e,H as d,L as n}from"./app-BjV9yef7.js";function m({children:t}){const[l,o]=i.useState(!1);return i.useEffect(()=>{const r=()=>{o(window.scrollY>300)};return window.addEventListener("scroll",r),()=>window.removeEventListener("scroll",r)},[]),e.jsxs("div",{id:"page-top",style:{position:"relative"},children:[e.jsx("main",{children:t}),e.jsx("footer",{className:"footer bg-black py-4 border-top border-secondary border-opacity-25 small text-center text-white-50",children:e.jsxs("div",{className:"container px-4 px-lg-5",children:[e.jsx("div",{className:"mb-1",children:"Tu espacio cinematográfico"}),e.jsxs("div",{children:["Copyright © ",new Date().getFullYear()," — Todos los derechos reservados."]})]})})]})}const p=[{title:"The Dark Knight",rating:"4.9 ★",year:"2008",review:"Una obra maestra del género superhéroes. Heath Ledger entrega una actuación memorable e inolvidable como el Guasón.",img:"https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_FMjpg_UX1000_.jpg"},{title:"Interstellar",rating:"4.9 ★",year:"2014",review:"Un viaje emocional y visualmente asombroso a través del espacio y el tiempo con una banda sonora sublime de Hans Zimmer.",img:"https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg"},{title:"Blade Runner 2049",rating:"4.8 ★",year:"2017",review:"Fotografía impecable y una atmósfera ciberpunk envolvente que expande con maestría el universo del clásico de culto.",img:"https://m.media-amazon.com/images/M/MV5BNzA1Njg4NzYxOV5BMl5BanBnXkFtZTgwODk5NjU3MzI@._V1_FMjpg_UX1000_.jpg"},{title:"La La Land",rating:"4.7 ★",year:"2016",review:"Una carta de amor al cine clásico y al jazz. Química electrizante entre Ryan Gosling y Emma Stone.",img:"https://m.media-amazon.com/images/M/MV5BMzUzNDM2NzM2MV5BMl5BanBnXkFtZTgwNTM3NTg4OTE@._V1_FMjpg_UX1000_.jpg"},{title:"Inception",rating:"4.8 ★",year:"2010",review:"Un thriller sci-fi dinámico y complejo que desafía la percepción entre los sueños y la realidad.",img:"https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_FMjpg_UX1000_.jpg"},{title:"Oppenheimer",rating:"4.9 ★",year:"2023",review:"Retrato biográfico tenso e hipnótico sobre el nacimiento de la era atómica con una dirección magistral.",img:"https://m.media-amazon.com/images/M/MV5BNTFlZDI1YWQtMTVjNy00YWU1LTg2YjktMTlhYmRiYzQ3NTVhXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg"}],x=[{stars:"★★★★★",title:"Análisis Detallados",quote:'"Publica tus críticas minuciosas, califica tus películas favoritas y conecta con la comunidad."',author:"Carlos M., Crítico Principal",image:"https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",reverse:!1},{stars:"★★★★☆",title:"Comunidad Cinéfila",quote:'"Un espacio ideal para debatir finales alternativos, teorías y recomendaciones genuinas."',author:"Ana R., Miembro Activo",image:"https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200&auto=format&fit=crop",reverse:!0}];function f(){const t=i.useRef(null),[l,o]=i.useState(!1);i.useEffect(()=>{const a=setInterval(()=>{if(!l&&t.current){const s=t.current.scrollWidth-t.current.clientWidth;t.current.scrollLeft>=s-5?t.current.scrollTo({left:0,behavior:"smooth"}):t.current.scrollBy({left:240,behavior:"smooth"})}},3200);return()=>clearInterval(a)},[l]);const r=a=>{t.current&&t.current.scrollBy({left:a==="left"?-260:260,behavior:"smooth"})},c=()=>{window.scrollTo({top:0,behavior:"smooth"})};return e.jsxs(m,{children:[e.jsxs(d,{children:[e.jsx("title",{children:"CineReseñas - Inicio"}),e.jsx("link",{rel:"preconnect",href:"https://fonts.googleapis.com"}),e.jsx("link",{rel:"preconnect",href:"https://fonts.gstatic.com",crossOrigin:"true"}),e.jsx("link",{href:"https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Pacifico&display=swap",rel:"stylesheet"})]}),e.jsx("style",{children:`
                .font-cinema-sub {
                    font-family: 'Pacifico', cursive;
                    font-size: clamp(1.2rem, 2vw, 1.6rem);
                    color: #ffffff;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
                    display: block;
                    margin-bottom: 0px;
                }

                @keyframes cinemaAtmosphere {
                    0% {
                        filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.1));
                        opacity: 0.95;
                    }
                    50% {
                        filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
                        opacity: 1;
                    }
                    100% {
                        filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.1));
                        opacity: 0.95;
                    }
                }

                @keyframes fadeInHero {
                    from {
                        opacity: 0;
                        transform: scale(0.97) translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                .font-cinema-retro {
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: clamp(2.8rem, 5.5vw, 4rem);
                    line-height: 1.05;
                    letter-spacing: 3px;
                    color: #121212;
                    display: inline-block;
                    transform: skewX(-5deg) rotate(-2deg);
                    text-shadow: 
                        1px 1px 0px #e0e0e0,
                        2px 2px 0px #d6d6d6,
                        3px 3px 0px #cccccc,
                        4px 4px 0px #c2c2c2,
                        5px 5px 0px #b8b8b8,
                        6px 6px 8px rgba(0, 0, 0, 0.6),
                        10px 10px 15px rgba(0, 0, 0, 0.4);
                    animation: fadeInHero 0.8s ease-out forwards, cinemaAtmosphere 5s ease-in-out infinite 1s;
                }

                .carousel-container {
                    position: relative;
                    width: 100%;
                }

                .carousel-slider {
                    display: flex;
                    overflow-x: auto;
                    scroll-behavior: smooth;
                    scrollbar-width: none;
                    padding: 15px 5px;
                }
                .carousel-slider::-webkit-scrollbar {
                    display: none;
                }

                .movie-card {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }

                .movie-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.8);
                }

                .movie-review-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(10, 10, 12, 0.92);
                    backdrop-filter: blur(4px);
                    color: #fff;
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    z-index: 5;
                }

                .movie-card:hover .movie-review-overlay {
                    opacity: 1;
                }

                .carousel-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    z-index: 10;
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    background: rgba(0, 0, 0, 0.8);
                    color: #fff;
                    border: 1px solid rgba(255, 255, 255, 0.25);
                    opacity: 0;
                    transition: opacity 0.3s ease, background 0.3s ease, transform 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .carousel-container:hover .carousel-btn {
                    opacity: 1;
                }

                .carousel-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-50%) scale(1.05);
                }

                .carousel-btn.prev { left: 10px; }
                .carousel-btn.next { right: 10px; }

                .forest-transition-bg {
                    background: linear-gradient(
                        180deg, 
                        rgba(0, 0, 0, 0.88) 0%, 
                        #0c0f12 35%, 
                        #0c0f12 70%, 
                        #000000 100%
                    );
                    border: none !important;
                }

                .signup-section, footer, .border-no-line {
                    border: none !important;
                    outline: none !important;
                    box-shadow: none !important;
                }

                .btn-scroll-top {
                    background-color: #64a19d;
                    color: #ffffff;
                    border: none;
                    font-weight: 700;
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.3);
                    transition: all 0.3s ease-in-out;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .btn-scroll-top:hover {
                    background-color: #528985;
                    transform: translateY(-3px);
                    box-shadow: 0 0.8rem 1.5rem rgba(0, 0, 0, 0.5);
                    color: #ffffff;
                }
            `}),e.jsx("header",{className:"masthead py-5",style:{minHeight:"85vh",display:"flex",alignItems:"center"},children:e.jsx("div",{className:"container px-4 px-lg-5 d-flex align-items-center justify-content-center",children:e.jsxs("div",{className:"text-center py-4",children:[e.jsx("span",{className:"font-cinema-sub",children:"El Portal de"}),e.jsx("h1",{className:"mx-auto my-2 font-cinema-retro",children:"CINERESEÑAS"}),e.jsx("h2",{className:"text-white-50 mx-auto mt-3 mb-4",style:{fontSize:"1rem",fontWeight:300,maxWidth:"620px",letterSpacing:"0.3px",lineHeight:"1.6"},children:"Donde las voces se pierden en la bruma y solo permanece el veredicto de la pantalla. Un santuario silencioso para desentrañar historias, discutir teorías sin rostro y calificar el arte del cine."}),e.jsx(n,{className:"btn btn-primary text-uppercase px-4 py-2.5 rounded-pill fw-bold shadow",href:route("login"),style:{fontSize:"0.9rem"},children:"Comenzar Ahora"})]})})}),e.jsxs("section",{className:"py-5 forest-transition-bg text-white position-relative",id:"trending",children:[e.jsxs("div",{className:"container px-4 px-lg-5 mb-3 text-center",children:[e.jsx("h3",{className:"fw-bold text-white fs-4 mb-2",children:"Historias Guardadas en la Penumbra"}),e.jsx("p",{className:"text-white-50 mx-auto small",style:{maxWidth:"680px",lineHeight:"1.5"},children:"Desliza entre los archivos cinemáticos. Mantén el cursor sobre cualquier póster para revelar los fragmentos y notas dejadas por el grupo editorial."})]}),e.jsxs("div",{className:"container-fluid px-2 px-md-4 carousel-container",onMouseEnter:()=>o(!0),onMouseLeave:()=>o(!1),children:[e.jsx("button",{className:"carousel-btn prev",onClick:()=>r("left"),"aria-label":"Anterior",children:"❮"}),e.jsx("button",{className:"carousel-btn next",onClick:()=>r("right"),"aria-label":"Siguiente",children:"❯"}),e.jsx("div",{className:"carousel-slider",ref:t,children:p.map((a,s)=>e.jsx("div",{className:"pe-3 flex-shrink-0",style:{width:"220px"},children:e.jsxs("div",{className:"card movie-card bg-dark text-white rounded-3 overflow-hidden h-100 position-relative shadow-sm",children:[e.jsxs("div",{className:"movie-review-overlay",children:[e.jsx("span",{className:"badge bg-warning text-dark mb-2 px-2 py-1 fw-bold",style:{fontSize:"0.7rem"},children:"Fragmento Editorial"}),e.jsxs("p",{className:"fst-italic mb-2 text-white-50",style:{fontSize:"0.8rem",lineHeight:"1.35"},children:['"',a.review,'"']}),e.jsxs("span",{className:"fw-bold tracking-wide text-info",style:{fontSize:"0.75rem"},children:[a.year," • ",a.rating]})]}),e.jsx("div",{style:{height:"300px",overflow:"hidden"},children:e.jsx("img",{src:a.img,alt:a.title,className:"w-100 h-100 object-fit-cover"})}),e.jsxs("div",{className:"card-body p-2 bg-dark text-center",children:[e.jsx("h6",{className:"fw-bold mb-1 text-truncate small",children:a.title}),e.jsx("span",{className:"small text-warning fw-semibold",style:{fontSize:"0.8rem"},children:a.rating})]})]})},s))})]})]}),e.jsx("section",{className:"projects-section bg-light py-5",id:"projects",children:e.jsxs("div",{className:"container px-4 px-lg-5",children:[e.jsxs("div",{className:"text-center mb-4",children:[e.jsx("h2",{className:"text-dark fw-bold fs-3",children:"Análisis y Testimonios Recientes"}),e.jsx("p",{className:"text-muted small",children:"Ecos de quienes ya han compartido sus perspectivas."})]}),x.map((a,s)=>e.jsxs("div",{className:"row gx-0 mb-4 align-items-center bg-white rounded-4 shadow-sm p-3 border border-1 border-light",children:[e.jsx("div",{className:`col-xl-7 col-lg-7 ${a.reverse?"order-lg-2":""} mb-3 mb-lg-0`,children:e.jsx("div",{className:"overflow-hidden rounded-3 shadow-sm",children:e.jsx("img",{className:"img-fluid w-100",src:a.image,alt:a.title,style:{maxHeight:"240px",objectFit:"cover"}})})}),e.jsx("div",{className:`col-xl-5 col-lg-5 ${a.reverse?"order-lg-1 pe-lg-4":"ps-lg-4"}`,children:e.jsxs("div",{className:"text-center text-lg-start",children:[e.jsx("div",{className:"text-warning mb-1 fs-6",children:a.stars}),e.jsx("h3",{className:"text-dark fw-bold mb-2 fs-5",children:a.title}),e.jsx("p",{className:"text-secondary mb-3 fst-italic small",style:{fontFamily:"Georgia, serif",lineHeight:"1.6"},children:a.quote}),e.jsxs("span",{className:"text-dark fw-bold small text-uppercase",style:{letterSpacing:"0.8px",fontSize:"0.75rem"},children:["— ",a.author]})]})})]},s))]})}),e.jsx("section",{className:"signup-section py-5 bg-black border-no-line",id:"signup",children:e.jsx("div",{className:"container px-4 px-lg-5",children:e.jsx("div",{className:"row gx-4 gx-lg-5",children:e.jsxs("div",{className:"col-md-10 col-lg-8 mx-auto text-center",children:[e.jsx("h2",{className:"text-white mb-2 fw-bold fs-3",children:"Forma Parte del Refugio"}),e.jsx("p",{className:"text-white-50 mb-4 small",style:{fontWeight:300},children:"Crea tu identidad y comienza a calificar y escribir sobre el séptimo arte."}),e.jsx(n,{className:"btn btn-primary text-uppercase px-4 py-2.5 rounded-pill fw-bold shadow small",href:route("register"),children:"Registrarse Gratis"})]})})})}),e.jsx("footer",{className:"bg-black text-white-50 py-3 border-no-line position-relative",children:e.jsx("div",{className:"position-fixed bottom-0 end-0 p-3",style:{zIndex:100},children:e.jsx("button",{onClick:c,className:"btn-scroll-top rounded-circle shadow",style:{width:"44px",height:"44px",fontSize:"1.1rem"},"aria-label":"Volver arriba",children:"↑"})})})]})}export{f as default};
