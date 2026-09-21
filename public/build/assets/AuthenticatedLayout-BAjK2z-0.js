import{u as l,j as e,H as c,L as m}from"./app-CIRBz5MX.js";function x({auth:t,title:a,children:n}){const{post:s}=l(),r=o=>{o.preventDefault(),s(route("logout"))},i=t?.user?.role?t.user.role.toUpperCase():"EDITOR";return e.jsxs("div",{className:"bg-black text-white",style:{minHeight:"100vh",display:"flex",flexDirection:"column"},children:[e.jsx(c,{title:a?`${a} - CineReseñas`:"CineReseñas"}),e.jsx("style",{children:`
                #mainNav.navbar-shrink .dynamic-text {
                    color: #212529 !important;
                }
                #mainNav.navbar-shrink .btn-outline-dynamic {
                    color: #212529 !important;
                    border-color: #212529 !important;
                }
                #mainNav.navbar-shrink .btn-outline-dynamic:hover {
                    color: #fff !important;
                    background-color: #212529 !important;
                    border-color: #212529 !important;
                }
            `}),e.jsx("nav",{className:"navbar navbar-expand-lg navbar-light fixed-top",id:"mainNav",children:e.jsxs("div",{className:"container px-4 px-lg-5 d-flex justify-content-between align-items-center w-100",children:[e.jsx(m,{className:"navbar-brand text-uppercase fw-bold font-monospace",href:"/",children:"CineReseñas"}),e.jsxs("div",{className:"d-flex align-items-center gap-3",children:[e.jsxs("span",{className:"small d-none d-md-inline dynamic-text text-white",style:{opacity:.9},children:["Hola, ",e.jsx("strong",{className:"dynamic-text text-white",children:t?.user?.name||"Editor de Reseñas"}),e.jsx("span",{className:"badge bg-secondary ms-2 text-uppercase",style:{fontSize:"0.7rem"},children:i})]}),e.jsx("form",{onSubmit:r,className:"m-0",children:e.jsx("button",{type:"submit",className:"btn btn-sm btn-outline-light btn-outline-dynamic text-uppercase px-3 py-1 font-monospace",style:{fontSize:"0.75rem",letterSpacing:"1px"},children:"Cerrar Sesión"})})]})]})}),e.jsx("main",{className:"flex-grow-1 d-flex flex-column",children:n}),e.jsx("footer",{className:"footer bg-black small text-center text-white-50 py-4 border-top border-secondary",children:e.jsx("div",{className:"container px-4 px-lg-5",children:"Copyright © CineReseñas 2026"})})]})}export{x as A};
