import React, { useState } from "react";
import { MessageSquare, LogIn, ExternalLink, Sparkles, Filter, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, SiteSettings, Faq } from "../types";

interface VisitorShowcaseProps {
  products: Product[];
  siteSettings: SiteSettings;
  onNavigateToLogin: () => void;
  approvals: { id: number; imageUrl: string }[];
  faqs: Faq[];
}

export default function VisitorShowcase({ products, siteSettings, onNavigateToLogin, approvals, faqs }: VisitorShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedApprovalImage, setSelectedApprovalImage] = useState<string | null>(null);
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(8);

  const PRODUCTS_PER_PAGE = 8;

  // Dynamically extract categories active in our products database
  const activeCategories = [
    "Todos",
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))
  ];

  const filteredProducts = selectedCategory === "Todos"
    ? products
    : products.filter((p) => p.category === selectedCategory);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setVisibleCount(PRODUCTS_PER_PAGE);
  };

  // Global School WhatsApp Contact
  const defaultWhatsapp = "5521998332541";
  const wppNumber = siteSettings?.globalWhatsapp || defaultWhatsapp;
  const globalWhatsappUrl = `https://wa.me/${wppNumber}?text=Olá!%20Achei%20sua%20loja%20pela%20vitrine%20e%20gostaria%20de%20mais%20informações%20sobre%20os%20produtos.`;

  const handleProductAction = (product: Product) => {
    // Open the directly assigned whatsapp link or general checkout
    if (product.buttonLink && product.buttonLink.startsWith("http")) {
      window.open(product.buttonLink, "_blank", "noopener,noreferrer");
    } else {
      // In case it's a relative placeholder, construct a helpful WhatsApp URL automatically!
      const encodedText = encodeURIComponent(`Olá! Tenho interesse no produto "${product.title}" que vi na vitrine. Como funciona a compra?`);
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
            {siteSettings?.logoUrl && (
              <img 
                src={siteSettings.logoUrl}
                alt="Logo ESCOLA CURSOS" 
                referrerPolicy="no-referrer"
                className="h-10 md:h-12 w-auto object-contain max-w-[180px]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  const el = document.getElementById('logo-fallback-text');
                  if (el) el.style.display = 'block';
                }}
              />
            )}
            {/* Fallback school banner */}
            <span id="logo-fallback-text" className="hidden text-xl font-black text-white italic tracking-tight">
              ESCOLA<span className="text-brand-magenta">CURSOS</span>
            </span>
            {siteSettings?.siteName && (
              <span className="text-white font-bold text-xs sm:text-sm tracking-wide hidden sm:block">
                {siteSettings.siteName}
              </span>
            )}
          </div>

          {/* Main action buttons block */}
          <div className="flex items-center gap-2 md:gap-4">
            {approvals && approvals.length > 0 && (
              <a
                href="#approvals"
                className="px-4 py-2 rounded-full border border-white/10 hover:border-brand-magenta/40 text-brand-gray-light hover:text-white font-bold text-xs md:text-sm uppercase tracking-wide transition-all cursor-pointer"
              >
                Aprovações
              </a>
            )}
            <a
              href="#about"
              className="px-4 py-2 rounded-full border border-white/10 hover:border-brand-magenta/40 text-brand-gray-light hover:text-white font-bold text-xs md:text-sm uppercase tracking-wide transition-all cursor-pointer"
            >
              Quem Sou Eu
            </a>
            <a
              href={globalWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full border border-emerald-500 text-emerald-500 hover:bg-emerald-500/10 font-bold text-xs md:text-sm uppercase tracking-wide flex items-center gap-2 transition-all cursor-pointer"
            >
              <MessageSquare size={16} />
              <span className="hidden sm:inline">Contato</span>
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
            {siteSettings?.heroBadge && (
              <span className="inline-block px-3.5 py-1 rounded-full bg-brand-dark-magenta/30 border border-brand-magenta/25 text-white/95 text-[10px] font-black tracking-widest uppercase">
                {siteSettings.heroBadge}
              </span>
            )}

            {siteSettings?.heroTitle && (
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black leading-[1.1] text-white tracking-tight">
                {(() => {
                  const title = siteSettings.heroTitle;
                  const words = title.split(" ");
                  if (words.length > 1) {
                    const lastWord = words.pop();
                    const initialText = words.join(" ");
                    return (
                      <>
                        {initialText} <span className="gradient-text">{lastWord}</span>
                      </>
                    );
                  }
                  return title;
                })()}
              </h1>
            )}

            {siteSettings?.heroSubtitle && (
              <p className="text-sm sm:text-base text-brand-gray-light/70 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                {siteSettings.heroSubtitle}
              </p>
            )}

            {siteSettings?.heroButtonText && (
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => {
                    const el = document.getElementById("catalog-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="btn-magenta px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_15px_rgba(255,0,255,0.2)] cursor-pointer"
                >
                  {siteSettings.heroButtonText}
                </button>
              </div>
            )}
          </div>

          {/* Elegant Display Banner supporting the Hero Image */}
          <div className="lg:w-2/5 w-full relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="relative overflow-hidden max-w-[420px] mx-auto rounded-3xl shadow-2xl border border-white/10 shadow-[0_0_50px_rgba(255,0,255,0.08)] group"
            >
              <img
                src={siteSettings?.heroImageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"}
                alt="Plataforma de Cursos"
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[380px] object-cover rounded-3xl transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop";
                }}
              />
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
          
          {(siteSettings?.headerTitle || siteSettings?.catalogSubtitle) && (
            <div className="text-center space-y-3">
              {siteSettings?.headerTitle && (
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {siteSettings.headerTitle}
                </h2>
              )}
              {siteSettings?.catalogSubtitle && (
                <p className="text-brand-gray-light/50 max-w-lg mx-auto text-xs sm:text-sm">
                  {siteSettings.catalogSubtitle}
                </p>
              )}
            </div>
          )}

          {/* Highly Responsive Horizontal Category Pills/Filter Tabs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="text-xs font-bold text-brand-gray-light/40 flex items-center gap-1 uppercase tracking-wider shrink-0 mr-2">
              <Filter size={12} className="text-brand-magenta" /> Filtrar Por:
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-full overflow-x-auto pb-2 scrollbar-none">
              {activeCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
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
              <h3 className="text-base font-bold text-white">Nenhum produto cadastrado nesta categoria</h3>
              <p className="text-brand-gray-light/50 text-xs px-6">
                Gerencie as turmas e opções no painel de controle do administrador usando o botão no topo ou rodapé.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visibleProducts.map((product) => {
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
                        <span>{product.buttonText || "QUERO COMEÇAR AGORA"}</span>
                      </button>
                    </div>

                  </div>
                );
                })}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex flex-col items-center gap-2 pt-4">
                  <p className="text-xs text-brand-gray-light/40">
                    Exibindo <span className="text-white font-bold">{visibleCount}</span> de <span className="text-white font-bold">{filteredProducts.length}</span> produtos
                  </p>
                  <button
                    onClick={() => setVisibleCount(v => v + PRODUCTS_PER_PAGE)}
                    className="group mt-1 px-8 py-3.5 rounded-full border border-brand-magenta/30 bg-brand-magenta/5 hover:bg-brand-magenta/15 hover:border-brand-magenta/60 text-white text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer flex items-center gap-2.5 shadow-[0_0_20px_rgba(255,0,255,0.05)] hover:shadow-[0_0_25px_rgba(255,0,255,0.15)]"
                  >
                    <span>Carregar Mais</span>
                    <svg className="w-4 h-4 text-brand-magenta group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}

              {!hasMore && filteredProducts.length > PRODUCTS_PER_PAGE && (
                <p className="text-center text-xs text-brand-gray-light/30 pt-2">
                  ✓ Todos os {filteredProducts.length} produtos exibidos
                </p>
              )}
            </>
          )}

        </div>
      </section>

      {/* SEÇÃO QUEM SOU EU / QUEM SOMOS */}
      {(siteSettings?.aboutText || siteSettings?.aboutTitle) && (
        <section 
          id="about" 
          className="bg-[#0a0a0a] py-20 px-4 md:px-8 border-t border-white/5 relative overflow-hidden"
        >
          {/* Decorative radial gradients */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-brand-magenta/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-[1000px] mx-auto relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-12">
              
              {/* Photo Box */}
              {siteSettings?.aboutImageUrl && (
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden bg-[#121212] border border-brand-magenta/20 shadow-[0_0_30px_rgba(255,0,255,0.08)] shrink-0 self-center md:self-start">
                  <img 
                    src={siteSettings.aboutImageUrl} 
                    alt={siteSettings?.aboutTitle || "Foto do Mentor"} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top hover:scale-[1.03] transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=400&auto=format&fit=crop";
                    }}
                  />
                </div>
              )}

              {/* Bio Content Box */}
              <div className="flex-grow space-y-5 text-center md:text-left">
                {(siteSettings?.aboutTitle || siteSettings?.aboutText) && (
                  <span className="inline-block px-3.5 py-1 rounded-full bg-brand-dark-magenta/30 border border-brand-magenta/25 text-white/95 text-[10px] font-black tracking-widest uppercase">
                    Conheça o Mentor
                  </span>
                )}
                
                {siteSettings?.aboutTitle && (
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    {siteSettings.aboutTitle}
                  </h2>
                )}

                {siteSettings?.aboutText && (
                  <div className="text-sm sm:text-base text-brand-gray-light/80 leading-relaxed font-light space-y-4 max-w-2xl mx-auto md:mx-0 whitespace-pre-line">
                    {siteSettings.aboutText}
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>
      )}

      {/* SEÇÃO DE APROVAÇÕES / FEEDBACKS */}
      {approvals && approvals.length > 0 && (
        <section id="approvals" className="bg-black py-20 px-4 md:px-8 border-t border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-brand-magenta/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="max-w-[1280px] mx-auto space-y-12 relative z-10">
            {(siteSettings?.approvalsBadge || siteSettings?.approvalsTitle || siteSettings?.approvalsSubtitle) && (
              <div className="text-center space-y-3">
                {siteSettings?.approvalsBadge && (
                  <span className="inline-block px-3.5 py-1 rounded-full bg-brand-dark-magenta/30 border border-brand-magenta/25 text-white/95 text-[10px] font-black tracking-widest uppercase">
                    {siteSettings.approvalsBadge}
                  </span>
                )}
                {siteSettings?.approvalsTitle && (
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
                    {siteSettings.approvalsTitle}
                  </h2>
                )}
                {siteSettings?.approvalsSubtitle && (
                  <p className="text-brand-gray-light/50 max-w-lg mx-auto text-xs sm:text-sm">
                    {siteSettings.approvalsSubtitle}
                  </p>
                )}
              </div>
            )}

            {/* Approvals Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {approvals.map((a) => (
                <div 
                  key={a.id}
                  onClick={() => setSelectedApprovalImage(a.imageUrl)}
                  className="rounded-2xl overflow-hidden border border-white/5 bg-[#0e0e0e] aspect-[4/5] relative group cursor-pointer hover:border-brand-magenta/40 hover:-translate-y-1 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                >
                  <img 
                    src={a.imageUrl} 
                    alt="Arte de Aprovado / Feedback" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=350";
                    }}
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-105 flex items-center justify-center transition-all duration-300">
                    <span className="bg-brand-magenta text-white font-bold text-xs uppercase px-4 py-2 rounded-full tracking-wider shadow-lg">
                      Visualizar
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lightbox Modal */}
          <AnimatePresence>
            {selectedApprovalImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedApprovalImage(null)}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm cursor-zoom-out"
              >
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  className="max-w-4xl max-h-[85vh] relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setSelectedApprovalImage(null)}
                    className="absolute -top-12 right-0 md:-right-12 text-white/70 hover:text-white p-2 text-sm uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    Fechar ×
                  </button>
                  <img 
                    src={selectedApprovalImage} 
                    alt="Depoimento Ampliado" 
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-[80vh] rounded-xl object-contain border border-white/10 shadow-2xl"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      {/* SEÇÃO DE PERGUNTAS FREQUENTES (FAQ) */}
      {faqs && faqs.length > 0 && (
        <section id="faq" className="bg-[#070707] py-20 px-4 md:px-8 border-t border-white/5 relative overflow-hidden">
          <div className="absolute bottom-0 left-1/4 w-[350px] h-[350px] bg-brand-magenta/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="max-w-[800px] mx-auto space-y-12 relative z-10">
            {(siteSettings?.faqTitle || siteSettings?.faqSubtitle) && (
              <div className="text-center space-y-3">
                <span className="inline-block px-3.5 py-1 rounded-full bg-brand-dark-magenta/30 border border-brand-magenta/25 text-white/95 text-[10px] font-black tracking-widest uppercase">
                  FAQ
                </span>
                {siteSettings?.faqTitle && (
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
                    {siteSettings.faqTitle}
                  </h2>
                )}
                {siteSettings?.faqSubtitle && (
                  <p className="text-brand-gray-light/50 max-w-lg mx-auto text-xs sm:text-sm">
                    {siteSettings.faqSubtitle}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-4">
              {faqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="bg-[#0f0f0f]/60 hover:bg-[#121212]/80 border border-white/5 transition-all duration-300 rounded-2xl p-5 cursor-pointer overflow-hidden group"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-bold text-white text-sm md:text-base pr-4 select-none group-hover:text-brand-light-magenta transition-colors">
                        {faq.question}
                      </h3>
                      <div className="shrink-0 w-8 h-8 rounded-full bg-[#181818] border border-white/5 flex items-center justify-center group-hover:border-brand-magenta/40 transition-colors">
                        <svg 
                          className={`w-4 h-4 text-brand-gray-light/60 group-hover:text-brand-light-magenta transition-transform duration-300 ${isOpen ? 'transform rotate-180 text-brand-magenta' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0, marginTop: 0 }}
                          animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                          exit={{ height: 0, opacity: 0, marginTop: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden border-t border-white/5 pt-4"
                        >
                          <p className="text-xs sm:text-sm text-brand-gray-light/70 leading-relaxed font-light whitespace-pre-line">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER & ADMINISTRATIVE LAUNCH PORTAL */}
      <footer className="bg-[#0a0a0a] py-12 border-t border-white/5 text-xs">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 md:gap-6 w-full md:w-auto">
            {siteSettings?.logoUrl && (
              <img 
                src={siteSettings.logoUrl}
                alt="Logo Cursos" 
                referrerPolicy="no-referrer"
                className="h-8 md:h-12 w-auto object-contain"
              />
            )}
            {siteSettings?.footerText && (
              <p className="text-brand-gray-light/50 text-center md:text-left font-medium max-w-sm">
                {siteSettings.footerText}
              </p>
            )}
          </div>

          {/* Links structure with Admin Restricted flow */}
          <div className="flex flex-wrap justify-center gap-6 text-brand-gray-light/50 font-semibold tracking-wider uppercase items-center">
            <a href={`https://wa.me/${wppNumber}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full border border-emerald-500 text-emerald-500 hover:bg-emerald-500/10 transition-all flex items-center gap-1.5 font-bold text-xs">
              <MessageSquare size={14} /> CONTATO
            </a>
            <a href="#about" className="hover:text-brand-magenta transition-all">Quem sou eu</a>
            {approvals && approvals.length > 0 && (
              <a href="#approvals" className="hover:text-brand-magenta transition-all">Aprovações</a>
            )}
            {faqs && faqs.length > 0 && (
              <a href="#faq" className="hover:text-brand-magenta transition-all">FAQ</a>
            )}
            
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
                        <span>{selectedProduct.buttonText || "QUERO COMEÇAR AGORA"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTÃO FLUTUANTE DO WHATSAPP */}
      <a
        href={globalWhatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#20ba5a] text-white p-4 rounded-full shadow-[0_4px_16px_rgba(37,211,102,0.35)] hover:shadow-[0_4px_24px_rgba(37,211,102,0.5)] hover:scale-110 transition-all duration-300 flex items-center justify-center cursor-pointer group"
        title="Fale conosco no WhatsApp"
      >
        <svg 
          className="w-6 h-6 fill-white" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.437 0 9.862-4.416 9.866-9.856.002-2.636-1.022-5.11-2.883-6.973C16.34 1.912 13.869.88 11.242.88 5.806.88 1.381 5.295 1.377 10.733c-.001 1.517.402 2.996 1.168 4.3l-.973 3.555 3.644-.955c1.282.7 2.658 1.07 4.041 1.071h.002zM17.47 15.22c-.298-.15-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        </svg>
        
        {/* Glowing pulse wave */}
        <span className="absolute inset-0 rounded-full border-2 border-[#25D366]/40 animate-ping pointer-events-none" />
      </a>

    </div>
  );
}
