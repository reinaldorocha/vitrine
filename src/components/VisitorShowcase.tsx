import React, { useState } from "react";
import { MessageSquare, LogIn, ExternalLink, Sparkles, Filter, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, SiteSettings } from "../types";

interface VisitorShowcaseProps {
  products: Product[];
  siteSettings: SiteSettings;
  onNavigateToLogin: () => void;
}

export default function VisitorShowcase({ products, siteSettings, onNavigateToLogin }: VisitorShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Dynamically extract categories active in our products database
  const activeCategories = [
    "Todos",
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))
  ];

  const filteredProducts = selectedCategory === "Todos"
    ? products
    : products.filter((p) => p.category === selectedCategory);

  // Global School WhatsApp Contact
  const defaultWhatsapp = "5521998332541";
  const wppNumber = siteSettings?.globalWhatsapp || defaultWhatsapp;
  const globalWhatsappUrl = `https://wa.me/${wppNumber}?text=Olá!%20Achei%20sua%20escola%20pela%20vitrine%20e%20gostaria%20de%20mais%20informações%20sobre%20os%20cursos.`;

  const handleProductAction = (product: Product) => {
    // Open the directly assigned whatsapp link or general checkout
    if (product.buttonLink && product.buttonLink.startsWith("http")) {
      window.open(product.buttonLink, "_blank", "noopener,noreferrer");
    } else {
      // In case it's a relative placeholder, construct a helpful WhatsApp URL automatically!
      const encodedText = encodeURIComponent(`Olá! Tenho interesse no curso "${product.title}" que vi na vitrine. Como funciona a inscrição?`);
      const dynamicWaUrl = `https://wa.me/${wppNumber}?text=${encodedText}`;
      window.open(dynamicWaUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div id="visitor-storefront" className="bg-[#0a0a0a] text-[#e2e2e2] overflow-x-hidden min-h-screen">
      
      {/* Dynamic Glow Overlay matching color palette styling */}
      <div className="absolute top-0 w-full h-[700px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 right-10 w-[600px] h-[600px] bg-brand-magenta/10 blur-[130px] rounded-full" />
        <div className="absolute top-60 -left-10 w-[450px] h-[450px] bg-brand-magenta/5 blur-[120px] rounded-full" />
      </div>

      {/* Header featuring logo + WhatsApp overall contact button */}
      <header className="fixed top-0 w-full z-40 bg-[#0c0c0c]/90 backdrop-blur-xl border-b border-brand-magenta/10 shadow-[0_4px_30px_rgba(255,0,255,0.03)]">
        <nav className="flex justify-between items-center max-w-[1280px] mx-auto px-4 md:px-8 py-3">
          
          {/* Logo Substitution from i.ibb.co */}
          <div 
            onClick={(e) => {
              if (e.detail === 1) { // Single click
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            onDoubleClick={onNavigateToLogin}
            title="Dica: Dê um clique duplo para acessar o painel administrador"
            className="flex items-center gap-2 cursor-pointer transition-transform duration-200 hover:scale-[1.02] select-none"
          >
            <img 
              src={siteSettings?.logoUrl || "https://i.ibb.co/zj7h3M5/logo-ESCOLA-CURSOS.png"}
              alt="Logo ESCOLA CURSOS" 
              referrerPolicy="no-referrer"
              className="h-10 md:h-12 w-auto object-contain max-w-[180px]"
              onError={(e) => {
                // Friendly fallback text if the remote host experiences interruptions
                (e.target as HTMLElement).style.display = 'none';
                const el = document.getElementById('logo-fallback-text');
                if (el) el.style.display = 'block';
              }}
            />
            {/* Fallback school banner */}
            <span id="logo-fallback-text" className="hidden text-xl font-black text-white italic tracking-tight">
              ESCOLA<span className="text-brand-magenta">CURSOS</span>
            </span>
            <span className="text-white font-bold text-xs sm:text-sm tracking-wide hidden sm:block">
              ESCOLA DE MINISTÉRIOS MARCIO GONÇALVES
            </span>
          </div>

          {/* Main action buttons block */}
          <div className="flex items-center gap-2 md:gap-4">
            <a
              href="https://wa.me/5521998332541"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full border border-emerald-500 text-emerald-500 hover:bg-emerald-500/10 font-bold text-xs md:text-sm uppercase tracking-wide flex items-center gap-2 transition-all cursor-pointer"
            >
              <MessageSquare size={16} />
              <span className="hidden sm:inline">Contatos</span>
            </a>
          </div>
        </nav>
      </header>

      {/* HERO / PLATFORM APRESENTAÇÃO */}
      <section className={"relative px-6 max-w-[1280px] mx-auto " + (siteSettings?.heroBannerUrl ? "pt-24" : "pt-28")}>
        {siteSettings?.heroBannerUrl && (
          <div className="w-full mb-8 pt-6">
            {siteSettings.heroBannerType === "video" ? (
              <video 
                src={siteSettings.heroBannerUrl} 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-auto max-h-[500px] object-cover rounded-3xl shadow-[0_0_40px_rgba(255,0,255,0.15)] border border-brand-magenta/20"
              />
            ) : (
              <img 
                src={siteSettings.heroBannerUrl} 
                alt="Banner Hero"
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[500px] object-cover rounded-3xl shadow-[0_0_40px_rgba(255,0,255,0.15)] border border-brand-magenta/20"
              />
            )}
          </div>
        )}
        <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 mt-4">
          
          {/* Main Hero information for Cursos Digitais */}
          <div className="lg:w-3/5 space-y-5 text-center lg:text-left relative z-10">
            <span className="inline-block px-3.5 py-1 rounded-full bg-brand-dark-magenta/30 border border-brand-magenta/25 text-white/95 text-[10px] font-black tracking-widest uppercase">
              ✨ CURSOS MINISTERIAIS
            </span>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black leading-[1.1] text-white tracking-tight">
              CONHEÇA TODOS OS <br />
              NOSSOS <span className="gradient-text">RECURSOS</span>
            </h1>

            <p className="text-sm sm:text-base text-brand-gray-light/70 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              São diversos cursos e ferramentas para te ajudar a desenvolver seu ministério e crescimento pessoal.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={() => {
                  const el = document.getElementById("catalog-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="btn-magenta px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_15px_rgba(255,0,255,0.2)] cursor-pointer"
              >
                Conhecer Cursos
              </button>
            </div>
          </div>

          {/* Elegant Display Banner supporting the ESCOLA CURSOS logo */}
          <div className="lg:w-2/5 w-full relative">
            <motion.div
              initial={{ opacity: 0, rotate: 1, y: 10 }}
              animate={{ opacity: 1, rotate: 0, y: 0 }}
              transition={{ duration: 0.7 }}
              className="glass-card p-3 rounded-2xl shadow-2xl relative border-brand-magenta/15 overflow-hidden max-w-[420px] mx-auto"
            >
              <div className="relative rounded-xl overflow-hidden bg-[#121212] flex items-center justify-center p-6 min-h-[220px]">
                {/* Large responsive logo card visual */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,255,0.15)_0%,transparent_100%)] z-0" />
                <img
                  src="https://i.ibb.co/zj7h3M5/logo-ESCOLA-CURSOS.png"
                  alt="Escola Cursos Banner"
                  referrerPolicy="no-referrer"
                  className="w-auto h-24 object-contain relative z-10 transition-transform duration-500 hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=350&auto=format&fit=crop";
                  }}
                />
              </div>

              <div className="mt-4 p-3 rounded-lg bg-[#0e0e0e] border border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-brand-gray-light/40 font-mono tracking-wider">PLATAFORMA ATIVA</span>
                <span className="text-[10px] text-brand-magenta font-extrabold flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-magenta" /> INSCRIÇÕES ABERTAS
                </span>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* FILTER AND DYNAMIC CATALOGUE GRID */}
      <section 
        id="catalog-section"
        className="bg-[#070707] py-16 px-4 md:px-8 border-t border-[#121212] relative"
      >
        <div className="max-w-[1280px] mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Vitrine de Cursos e Ferramentas
            </h2>
            <p className="text-brand-gray-light/50 max-w-lg mx-auto text-xs sm:text-sm">
              Escolha seu foco, turbine sua qualificação e receba suporte dedicado. Filtre por categoria abaixo:
            </p>
          </div>

          {/* Highly Responsive Horizontal Category Pills/Filter Tabs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="text-xs font-bold text-brand-gray-light/40 flex items-center gap-1 uppercase tracking-wider shrink-0 mr-2">
              <Filter size={12} className="text-brand-magenta" /> Filtrar Por:
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-full overflow-x-auto pb-2 scrollbar-none">
              {activeCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer border ${
                    selectedCategory === cat
                      ? "bg-brand-magenta text-white border-brand-magenta shadow-[0_0_12px_rgba(255,0,255,0.25)]"
                      : "bg-[#121212] text-brand-gray-light/60 border-white/5 hover:border-brand-magenta/30 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Showcase grid container */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-[#0e0e0e] border border-white/5 rounded-2xl max-w-md mx-auto space-y-4">
              <Sparkles size={36} className="text-brand-magenta/30 mx-auto" />
              <h3 className="text-base font-bold text-white">Nenhum curso cadastrado nesta categoria</h3>
              <p className="text-brand-gray-light/50 text-xs px-6">
                Gerencie as turmas e opções no painel de controle do administrador usando o botão no topo ou rodapé.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const isPromo = !!product.originalPrice;
                
                return (
                  <div
                    key={product.id}
                    id={`product-card-${product.id}`}
                    onClick={() => setSelectedProduct(product)}
                    className="glass-card p-5 rounded-2xl flex flex-col justify-between relative group hover:-translate-y-1 cursor-pointer"
                  >
                    
                    {/* Corner badge overlay if exist */}
                    {product.badge && (
                      <div className="absolute top-3.5 right-3.5 z-10 bg-brand-magenta text-white font-extrabold text-[9px] uppercase px-2.5 py-1 rounded-full tracking-wider shadow-md">
                        {product.badge}
                      </div>
                    )}

                    <div className="space-y-4">
                      
                      {/* Image direct box template supporting exact HTML image links */}
                      <div className={`rounded-xl overflow-hidden bg-[#131313] relative flex items-center justify-center border border-white/5 ${product.imageOrientation === "vertical" ? "h-64" : product.imageOrientation === "square" ? "h-48" : "h-40"}`}>
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          referrerPolicy="no-referrer"
                          className={`w-full h-full transition-transform duration-500 group-hover:scale-105 ${product.imageOrientation === "vertical" ? "object-contain" : "object-cover"}`}
                          onError={(e) => {
                            // Fallback if pasted user link drops
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=250&auto=format&fit=crop";
                          }}
                        />
                        <span className="absolute bottom-2.5 left-2.5 bg-black/85 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded text-[9px] font-bold text-brand-gray-light uppercase tracking-wider">
                          📁 {product.category || "Geral"}
                        </span>
                      </div>

                      {/* Header and description info */}
                      <div className="space-y-1.5">
                        <h3 className="text-base font-bold text-white tracking-tight group-hover:text-brand-magenta transition-colors line-clamp-1">
                          {product.title}
                        </h3>
                        <div className="text-xs text-brand-gray-light/60 line-clamp-3 leading-relaxed min-h-[54px] markdown-body">
                          <div dangerouslySetInnerHTML={{ __html: product.description }} />
                        </div>
                      </div>

                    </div>

                    {/* Pricing section with exact "$" por "$" promotional styling requested */}
                    <div className="mt-5 pt-3.5 border-t border-white/5 space-y-4">
                      <div className="bg-[#121212]/50 p-2.5 rounded-lg border border-white/5 flex flex-col justify-between">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-brand-gray-light/40">Plano de Acesso</span>
                        
                        <div className="flex items-baseline gap-2 mt-1">
                          {isPromo ? (
                            <>
                              <span className="text-[11px] text-brand-gray-light/40 line-through font-medium">
                                {product.originalPrice}
                              </span>
                              <span className="text-brand-magenta font-black text-lg tracking-tight">
                                {product.promoPrice}
                              </span>
                            </>
                          ) : (
                            <span className="text-brand-magenta font-black text-lg tracking-tight">
                              {product.promoPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        id={`btn-contact-course-${product.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductAction(product);
                        }}
                        className="btn-magenta w-full py-3 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_2px_12px_rgba(255,0,255,0.1)]"
                      >
                        <MessageSquare size={13} className="text-white fill-white/10" />
                        <span>QUERO COMEÇAR AGORA</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* FOOTER & ADMINISTRATIVE LAUNCH PORTAL */}
      <footer className="bg-[#0a0a0a] py-12 border-t border-white/5 text-xs">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 md:gap-6 w-full md:w-auto">
            <img 
              src={siteSettings?.logoUrl || "https://i.ibb.co/zj7h3M5/logo-ESCOLA-CURSOS.png"}
              alt="Logo Cursos" 
              referrerPolicy="no-referrer"
              className="h-8 md:h-12 w-auto object-contain"
            />
            <p className="text-brand-gray-light/50 text-center md:text-left font-medium max-w-sm">
              {siteSettings?.footerText || "Vitrine Oficial da ESCOLA DE MINISTÉRIOS MG. Todos os direitos reservados."}
            </p>
          </div>

          {/* Links structure with Admin Restricted flow */}
          <div className="flex flex-wrap justify-center gap-6 text-brand-gray-light/50 font-semibold tracking-wider uppercase items-center">
            <a href={`https://wa.me/${wppNumber}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full border border-emerald-500 text-emerald-500 hover:bg-emerald-500/10 transition-all flex items-center gap-1.5 font-bold text-xs">
              <MessageSquare size={14} /> CONTATOS
            </a>
            <a href="#about" className="hover:text-brand-magenta transition-all">Quem somos</a>
            <a href="#help" className="hover:text-brand-magenta transition-all">Ajuda</a>
            
            {/* Private restrict access only button requested */}
            {/* Ocultado da interface pública a pedido */}
          </div>

        </div>
      </footer>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0f0f0f] border border-brand-magenta/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative my-auto mt-16 lg:mt-auto"
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-brand-magenta/80 transition-all z-10"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col md:flex-row">
                <div className={`w-full md:w-2/5 shrink-0 bg-[#070707] flex items-center justify-center border-r border-white/5 ${
                  selectedProduct.imageOrientation === "vertical" ? "h-auto p-4" : "h-64 md:h-auto"
                }`}>
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.title}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full ${selectedProduct.imageOrientation === "vertical" ? "object-contain max-h-[70vh]" : "object-cover"}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop";
                    }}
                  />
                </div>
                
                <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-brand-magenta/10 border border-brand-magenta/30 text-brand-light-magenta">
                        {selectedProduct.category}
                      </span>
                      {selectedProduct.badge && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-magenta text-white">
                          {selectedProduct.badge}
                        </span>
                      )}
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight mb-4">
                      {selectedProduct.title}
                    </h2>
                    
                    <div className="prose prose-invert max-w-none text-brand-gray-light/90 mb-6 font-light leading-relaxed markdown-body text-base">
                      {selectedProduct.longDescription ? (
                        <div dangerouslySetInnerHTML={{ __html: selectedProduct.longDescription }} />
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: selectedProduct.description }} />
                      )}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5">
                    <div className="bg-[#121212]/50 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                      
                      <div className="text-center sm:text-left">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-brand-gray-light/40 block mb-1">
                          Investimento
                        </span>
                        <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                          {selectedProduct.originalPrice ? (
                            <>
                              <span className="text-sm text-brand-gray-light/40 line-through font-medium">
                                {selectedProduct.originalPrice}
                              </span>
                              <span className="text-brand-magenta font-black text-2xl tracking-tight">
                                {selectedProduct.promoPrice}
                              </span>
                            </>
                          ) : (
                            <span className="text-brand-magenta font-black text-2xl tracking-tight">
                              {selectedProduct.promoPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleProductAction(selectedProduct)}
                        className="btn-magenta w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,0,255,0.25)] hover:scale-105 transition-all"
                      >
                        <MessageSquare size={16} className="text-white fill-white/10" />
                        <span>QUERO COMEÇAR AGORA</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
