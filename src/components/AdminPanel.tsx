import React, { useState } from "react";
import { 
  Plus, Edit2, Trash2, ArrowLeft, RotateCcw, Image as ImageIcon,
  Check, Link as LinkIcon, AlertTriangle, Sparkles, Tag, ShoppingCart, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, SiteSettings } from "../types";
import { PRESET_IMAGES } from "../data";
import RichTextEditor from "./RichTextEditor";

interface AdminPanelProps {
  products: Product[];
  categories: string[];
  siteSettings?: SiteSettings;
  onUpdateSiteSettings?: (settings: SiteSettings) => void;
  onAddProduct: (product: Omit<Product, "id">) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  onResetToDefault: () => void;
  onBack: () => void;
}

export default function AdminPanel({
  products,
  categories,
  siteSettings,
  onUpdateSiteSettings,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddCategory,
  onDeleteCategory,
  onResetToDefault,
  onBack
}: AdminPanelProps) {
  // Mode parameters
  const [isEditing, setIsEditing] = useState<string | null>(null); // Id of product or "new"
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  
  // Form fields state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    longDescription: "",
    originalPrice: "", // "De" price
    promoPrice: "",     // "Por" price
    category: "Programação",
    badge: "",
    imageUrl: "",
    imageOrientation: "horizontal" as "horizontal" | "vertical" | "square",
    buttonText: "Falar com Consultor",
    buttonLink: "",
    iconName: "Sparkles"
  });

  const [formError, setFormError] = useState("");
  const [imagePreviewError, setImagePreviewError] = useState(false);

  // Initiate product creation form
  const handleStartCreate = () => {
    setFormData({
      title: "",
      description: "",
      longDescription: "",
      originalPrice: "",
      promoPrice: "",
      category: categories.length > 0 ? categories[0] : "Programação",
      badge: "",
      imageUrl: "",
      imageOrientation: "horizontal",
      buttonText: "Falar com Consultor",
      buttonLink: "",
      iconName: "Sparkles"
    });
    setFormError("");
    setImagePreviewError(false);
    setIsEditing("new");
  };

  // Initiate edit form for current product
  const handleStartEdit = (p: Product) => {
    setFormData({
      title: p.title,
      description: p.description,
      longDescription: p.longDescription || "",
      originalPrice: p.originalPrice || "",
      promoPrice: p.promoPrice,
    category: p.category || "Programação",
      badge: p.badge || "",
      imageUrl: p.imageUrl,
      imageOrientation: p.imageOrientation || "horizontal",
      buttonText: p.buttonText || "Falar com Consultor",
      buttonLink: p.buttonLink || "",
      iconName: p.iconName || "Sparkles"
    });
    setFormError("");
    setImagePreviewError(false);
    setIsEditing(p.id);
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.title.trim()) {
      setFormError("Informe o título do curso/produto.");
      return;
    }
    if (!formData.description.trim()) {
      setFormError("Informe o resumo de conteúdo ou descrição.");
      return;
    }
    if (!formData.promoPrice.trim()) {
      setFormError("Informe o preço promocional (Por).");
      return;
    }
    if (!formData.category.trim()) {
      setFormError("Informe uma categoria.");
      return;
    }
    if (!formData.imageUrl.trim()) {
      setFormError("Insira uma URL de imagem válida.");
      return;
    }

    // Auto-generate dynamic WhatsApp message template if button link is empty
    let finalBtLink = formData.buttonLink.trim();
    if (!finalBtLink) {
      const textToConsultant = `Olá! Vi o curso "${formData.title}" na vitrine e gostaria de me matricular.`;
      finalBtLink = `https://wa.me/5521998332541?text=${encodeURIComponent(textToConsultant)}`;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      longDescription: formData.longDescription.trim() || "",
      originalPrice: formData.originalPrice.trim() || "",
      promoPrice: formData.promoPrice.trim(),
      category: formData.category.trim(),
      badge: formData.badge.trim() || "",
      imageUrl: formData.imageUrl.trim(),
      imageOrientation: formData.imageOrientation,
      buttonText: formData.buttonText.trim() || "Falar com Consultor",
      buttonLink: finalBtLink,
      iconName: formData.iconName
    };

    if (isEditing === "new") {
      onAddProduct(payload);
    } else if (isEditing) {
      onUpdateProduct({
        id: isEditing,
        ...payload
      });
    }

    if (payload.category) {
      onAddCategory(payload.category);
    }

    // Go back to list
    setIsEditing(null);
  };

  const selectPresetImage = (url: string) => {
    setFormData({ ...formData, imageUrl: url });
    setImagePreviewError(false);
  };

  return (
    <div id="admin-management-panel" className="min-h-screen bg-[#070707] text-[#e2e2e2] pt-24 pb-16 px-4 md:px-12">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Top bar with Escola de Cursos logo branding */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-[#222]">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <img 
                src={siteSettings?.logoUrl || "https://i.ibb.co/zj7h3M5/logo-ESCOLA-CURSOS.png"}
                alt="Logo Escola Cursos Admin" 
                referrerPolicy="no-referrer"
                className="h-9 w-auto object-contain"
              />
              <span className="text-xs h-6 font-bold text-brand-magenta uppercase tracking-widest bg-brand-magenta/10 border border-brand-magenta/30 rounded-md px-2 flex items-center justify-center">
                Painel Restrito
              </span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                {siteSettings?.adminTitle || "Gestão dos Cursos da Vitrine"}
              </h1>
              <p className="text-brand-gray-light/60 text-xs sm:text-xs mt-1">
                {siteSettings?.adminSubtitle || "Adicione novas matérias, altere preços de promoção (Ex: R$ 299 por R$ 149) e organize as categorias visíveis ao público em tempo real."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
            <button
              id="btn-admin-go-back"
              onClick={onBack}
              className="px-5 py-2.5 rounded-full bg-[#181818] border border-[#2d2d2d] hover:bg-[#282828] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft size={14} />
              Ver Vitrine Pública
            </button>
            
            {resetConfirm ? (
              <div className="flex items-center gap-2 bg-red-950/40 border border-red-900/40 rounded-full px-4 py-2 mt-2 md:mt-0">
                 <span className="text-red-400 text-[10px] font-bold uppercase mr-1">Confirmar Reset?</span>
                 <button 
                  onClick={() => { onResetToDefault(); setResetConfirm(false); setIsEditing(null); }}
                  className="bg-red-500 hover:bg-red-400 text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded-full transition-colors"
                 >
                   Sim
                 </button>
                 <button 
                  onClick={() => setResetConfirm(false)}
                  className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded-full transition-colors"
                 >
                   Não
                 </button>
              </div>
            ) : (
              <button
                id="btn-admin-reset-default"
                onClick={() => setResetConfirm(true)}
                className="px-4 py-2.5 rounded-full bg-red-950/20 border border-red-900/40 text-red-400 hover:bg-red-950/40 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
              >
                <RotateCcw size={14} />
                Resetar Cursos Padrão
              </button>
            )}
          </div>
        </div>

        {/* Dynamic section toggling between Editor Form and List View */}
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editor-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Left Form controls (7 columns) */}
              <div className="lg:col-span-7 bg-[#121212]/95 border border-brand-magenta/20 rounded-2xl p-6 md:p-8 relative">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-brand-magenta/10 border border-brand-magenta/30 flex items-center justify-center text-brand-magenta font-black">
                    {isEditing === "new" ? "+" : "✎"}
                  </span>
                  {isEditing === "new" ? "Cadastrar Novo Curso" : "Editar Detalhes do Curso"}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {formError && (
                    <div className="bg-red-950/50 border border-red-500/50 text-red-200 text-xs px-3 py-2.5 rounded-lg flex items-center gap-2 animate-pulse">
                      <AlertTriangle size={14} className="text-red-400 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Title */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80">
                      Nome do Cursos / Título *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Programação Web Completo, Inglês Avançado..."
                      className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta rounded-lg px-4 py-3 text-sm text-white placeholder-brand-gray-light/30 outline-none transition-all"
                      required
                    />
                  </div>

                  {/* Category select or create */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 flex items-center gap-1 block">
              <Tag size={12} className="text-brand-magenta" /> Categoria do Curso *
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Ex: Programação, Design, Teologia..."
              className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta rounded-lg px-4 py-3 text-sm text-white placeholder-brand-gray-light/30 outline-none transition-all"
              list="categories-datalist"
              required
            />
            <p className="text-[10px] text-brand-gray-light/50">
              Dica: Digite um nome para criar nova, ou selecione na lista.
            </p>
            <datalist id="categories-datalist">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          {/* Quick helper for selecting category */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/50">
              Categorias (Clique para usar ou apagar)
            </label>
            <div className="flex flex-wrap gap-2 p-2 bg-[#1a1a1a] rounded-lg border border-[#2d2d2d] max-h-[80px] overflow-y-auto w-full max-w-full">
              {categories.map((c) => (
                <div key={c} className="group flex items-center bg-[#242424] hover:bg-[#2d2d2d] rounded-md border border-[#3a3a3a] transition-colors relative h-7">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, category: c })}
                    className="text-[10px] text-brand-gray-light/80 font-semibold px-2 py-1 h-full flex items-center"
                    title="Usar estra categoria"
                  >
                    {c}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCategory(c)}
                    className="opacity-0 group-hover:opacity-100 bg-red-950/30 hover:bg-red-500/20 text-red-400 px-1.5 h-full rounded-r-md transition-all flex items-center border-l w-5 border-[#3a3a3a]"
                    title="Apagar Categoria"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

                  {/* Pricing elements implementing precise $ por $ original price vs. promo price */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#161616] p-4 rounded-xl border border-white/5">
                    
                    {/* Original pre-promotional price */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-gray-light/80">
                        Preço Original (De) <span className="text-[10px] text-brand-gray-light/40 normal-case">(Opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                        placeholder="Ex: R$ 399,00"
                        className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-brand-gray-light/30 outline-none transition-all"
                      />
                      <p className="text-[10px] text-brand-gray-light/40">Fica cortado no layout (Ex: <span className="line-through">R$ 399,00</span>)</p>
                    </div>

                    {/* Promo price */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-magenta">
                        Preço Promocional (Por) *
                      </label>
                      <input
                        type="text"
                        value={formData.promoPrice}
                        onChange={(e) => setFormData({ ...formData, promoPrice: e.target.value })}
                        placeholder="Ex: R$ 149,00"
                        className="w-full bg-[#1c1c1c] border border-brand-magenta/40 focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-brand-gray-light/30 outline-none transition-all"
                        required
                      />
                      <p className="text-[10px] text-brand-gray-light/40">Preço em destaque da matrícula ativa</p>
                    </div>

                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80">
                      Resumo (Card na Vitrine) *
                    </label>
                    <RichTextEditor
                      value={formData.description}
                      onChange={(val) => setFormData({ ...formData, description: val })}
                      minHeight="100px"
                    />
                  </div>

                  {/* Long Description for Details Page */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-magenta">
                      Descrição Completa (Página Inteira)
                    </label>
                    <RichTextEditor
                       value={formData.longDescription}
                       onChange={(val) => setFormData({ ...formData, longDescription: val })}
                       minHeight="160px"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Badge */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80">
                        Selo de Destaque (Badge)
                      </label>
                      <input
                        type="text"
                        value={formData.badge}
                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                        placeholder="Ex: ESGOTANDO, MAIS VENDIDO, NOVO"
                        className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta rounded-lg px-4 py-3 text-sm text-white placeholder-brand-gray-light/30 outline-none transition-all"
                      />
                    </div>

                    {/* Button text */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80">
                        Texto do Botão de Inscrição
                      </label>
                      <input
                        type="text"
                        value={formData.buttonText}
                        onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                        placeholder="Falar com Consultor"
                        className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta rounded-lg px-4 py-3 text-sm text-white placeholder-brand-gray-light/30 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Image input with focus helper */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 flex items-center justify-between">
                      Link Direto da Imagem de Capa *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gray-light/40">
                          <LinkIcon size={15} />
                        </div>
                        <input
                          type="url"
                          value={formData.imageUrl}
                          onChange={(e) => {
                            setFormData({ ...formData, imageUrl: e.target.value });
                            setImagePreviewError(false);
                          }}
                          placeholder="https://images... (.png ou .jpg)"
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-brand-gray-light/30 outline-none transition-all"
                          required
                        />
                      </div>
                      <div>
                        <select
                          value={formData.imageOrientation}
                          onChange={(e) => setFormData({ ...formData, imageOrientation: e.target.value as any })}
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta rounded-lg px-3 py-3 text-sm text-white outline-none"
                        >
                          <option value="horizontal">Horizontal (16:9)</option>
                          <option value="square">Quadrado (1:1)</option>
                          <option value="vertical">Vertical (9:16)</option>
                        </select>
                      </div>
                    </div>
                    <p className="text-[10px] text-brand-gray-light/50">
                      Sugerimos: <strong>Horizontal</strong> (1920x1080), <strong>Quadrado</strong> (1080x1080), <strong>Vertical</strong> (1080x1920).
                    </p>

                    {/* Presets finder */}
                    <div className="bg-[#181818] p-3 rounded-lg border border-[#222] space-y-1.5">
                      <span className="text-[11px] font-bold text-brand-gray-light/70 flex items-center gap-1">
                        <Sparkles size={11} className="text-brand-magenta" /> Preencha com imagens do nosso banco de sugestões:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {PRESET_IMAGES.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => selectPresetImage(preset.url)}
                            className="bg-[#222] hover:bg-[#2c2c2c] p-1.5 rounded border border-[#333] text-[10px] text-left truncate transition-colors flex items-center justify-between font-medium cursor-pointer"
                          >
                            <span className="truncate">{preset.label}</span>
                            {formData.imageUrl === preset.url && (
                              <Check size={10} className="text-brand-magenta ml-1 shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Button link customization */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80">
                      Link de Redirecionamento Personalizado (WhatsApp ou Checkout Link)
                    </label>
                    <input
                      type="text"
                      value={formData.buttonLink}
                      onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                      placeholder="Deixe em branco para auto-gerar link do WhatsApp!"
                      className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta rounded-lg px-4 py-3 text-sm text-white placeholder-brand-gray-light/35 outline-none transition-all"
                    />
                    <p className="text-[10px] text-brand-gray-light/45">
                      Dica: Se deixar vazio, criaremos um link para o WhatsApp oficial com mensagem pré-coletada baseada no título escolhido.
                    </p>
                  </div>

                  {/* Form actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#222]">
                    <button
                      type="button"
                      onClick={() => setIsEditing(null)}
                      className="px-5 py-3 rounded-lg bg-transparent hover:bg-white/5 text-brand-gray-light/80 text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-lg bg-brand-magenta hover:bg-[#ff33ff] text-white text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(255,0,255,0.2)]"
                    >
                      {isEditing === "new" ? "Cadastrar Curso" : "Salvar Alterações"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Live Preview Area (5 columns) */}
              <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
                <div className="text-xs font-bold uppercase tracking-wider text-brand-gray-light/60 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-magenta" />
                  Live Preview do Card do Curso
                </div>

                {/* Simulated rendering exactly as it appears in visitor showcase */}
                <div className="glass-card p-5 rounded-2xl flex flex-col justify-between min-h-[440px] relative">
                  
                  {formData.badge && (
                    <div className="absolute top-3.5 right-3.5 z-10 bg-brand-magenta text-white font-extrabold text-[9px] uppercase px-2.5 py-1 rounded-full tracking-wider shadow-md animate-pulse">
                      {formData.badge}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Simulated Image Box with direct HTML rendering */}
                    <div className={`rounded-xl overflow-hidden bg-[#181818] border border-white/5 flex items-center justify-center relative ${
                      formData.imageOrientation === "vertical" ? "h-64" : formData.imageOrientation === "square" ? "h-48" : "h-40"
                    }`}>
                      {formData.imageUrl && !imagePreviewError ? (
                        <img 
                          src={formData.imageUrl} 
                          alt="Live direct link preview" 
                          referrerPolicy="no-referrer"
                          onError={() => setImagePreviewError(true)}
                          className={`w-full h-full ${formData.imageOrientation === "vertical" ? "object-contain" : "object-cover"}`}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6 text-center text-brand-gray-light/40 space-y-2">
                          <ImageIcon size={28} className="text-brand-magenta/40" />
                          <span className="text-[11px] font-medium">Capas do Curso (PNG, JPG, etc.)</span>
                        </div>
                      )}
                      
                      <span className="absolute bottom-2.5 left-2.5 bg-black/85 border border-white/10 px-2 py-0.5 rounded text-[9px] font-bold text-brand-gray-light uppercase">
                        📁 {formData.category || "Geral"}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-white tracking-tight truncate">
                        {formData.title || "Curso Exemplo de Amostra"}
                      </h4>
                      <div className="text-xs text-brand-gray-light/60 line-clamp-3 leading-relaxed markdown-body">
                        {formData.description ? (
                          <div dangerouslySetInnerHTML={{ __html: formData.description }} />
                        ) : (
                          "As lições, módulos e conteúdo resumido do seu curso serão mostrados neste bloco."
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pricing dynamic layout De/Por */}
                  <div className="mt-5 pt-3 border-t border-white/5 space-y-4">
                    <div className="bg-[#121212]/50 p-2.5 rounded-lg border border-white/5 flex flex-col justify-between">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-brand-gray-light/40">Plano de Acesso</span>
                      
                      <div className="flex items-baseline gap-2 mt-1">
                        {formData.originalPrice ? (
                          <>
                            <span className="text-[11px] text-brand-gray-light/45 line-through font-medium">
                              {formData.originalPrice}
                            </span>
                            <span className="text-brand-magenta font-black text-lg tracking-tight">
                              {formData.promoPrice || "Grátis"}
                            </span>
                          </>
                        ) : (
                          <span className="text-brand-magenta font-black text-lg tracking-tight">
                            {formData.promoPrice || "R$ 0,00"}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled
                      className="btn-magenta w-full py-3 rounded-lg text-xs font-black uppercase tracking-widest opacity-85 flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare size={12} className="fill-white/10" />
                      <span>{formData.buttonText || "Garantir Vaga"}</span>
                    </button>
                  </div>

                </div>

                <div className="p-3.5 rounded-xl border border-brand-magenta/10 bg-brand-magenta/5 text-[11px] text-brand-gray-light/70 leading-relaxed">
                  💡 <strong>Informações do Canal de Vendas:</strong> Se o produto usar links de imagens vindas do Imgur, Unsplash ou qualquer servidor web próprio, os visitantes verão a imagem renderizada dinamicamente com as otimizações corretas.
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="bg-[#121212] border border-[#222] rounded-xl p-5 md:p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-brand-magenta/5 blur-3xl" />
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="text-brand-magenta w-5 h-5" /> Identidade Visual e Textos
                </h3>
                
                <div className="space-y-6 max-w-2xl">
                  {/* LOGO */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                      Logo (URL da Imagem)
                    </label>
                    <input
                      type="url"
                      value={siteSettings?.logoUrl || ""}
                      onChange={(e) => onUpdateSiteSettings?.({ ...siteSettings, logoUrl: e.target.value })}
                      className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta rounded-lg px-4 py-3 text-sm text-white placeholder-brand-gray-light/30 outline-none transition-all"
                      placeholder="Ex: https://i.ibb.co/zj7h3M5/logo-ESCOLA-CURSOS.png"
                    />
                  </div>

                  {/* ADMIN TEXTS */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                        Título do Painel Admin
                      </label>
                      <input
                        type="text"
                        value={siteSettings?.adminTitle || ""}
                        onChange={(e) => onUpdateSiteSettings?.({ ...siteSettings, adminTitle: e.target.value })}
                        className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta rounded-lg px-4 py-3 text-sm text-white placeholder-brand-gray-light/30 outline-none transition-all"
                        placeholder="Ex: Gestão dos Cursos da Vitrine"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                        Subtítulo do Painel Admin
                      </label>
                      <textarea
                        value={siteSettings?.adminSubtitle || ""}
                        onChange={(e) => onUpdateSiteSettings?.({ ...siteSettings, adminSubtitle: e.target.value })}
                        rows={2}
                        className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta rounded-lg px-4 py-3 text-sm text-white placeholder-brand-gray-light/30 outline-none transition-all resize-none"
                        placeholder="Ex: Adicione novas matérias..."
                      />
                    </div>
                  </div>

                  {/* FOOTER & WHATSAPP */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                        WhatsApp (Apenas Números)
                      </label>
                      <input
                        type="text"
                        value={siteSettings?.globalWhatsapp || ""}
                        onChange={(e) => onUpdateSiteSettings?.({ ...siteSettings, globalWhatsapp: e.target.value })}
                        className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta rounded-lg px-4 py-3 text-sm text-white placeholder-brand-gray-light/30 outline-none transition-all"
                        placeholder="Ex: 5521998332541"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                        Texto do Rodapé (Copyright)
                      </label>
                      <input
                        type="text"
                        value={siteSettings?.footerText || ""}
                        onChange={(e) => onUpdateSiteSettings?.({ ...siteSettings, footerText: e.target.value })}
                        className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta rounded-lg px-4 py-3 text-sm text-white placeholder-brand-gray-light/30 outline-none transition-all"
                        placeholder="Ex: Vitrine Oficial da ESCOLA..."
                      />
                    </div>
                  </div>

                  {/* HERO BANNER */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                      Banner da Vitrine (URL Imagem ou Vídeo)
                    </label>
                    <input
                      type="url"
                      value={siteSettings?.heroBannerUrl || ""}
                      onChange={(e) => onUpdateSiteSettings?.({ ...siteSettings, heroBannerUrl: e.target.value })}
                      className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta rounded-lg px-4 py-3 text-sm text-white placeholder-brand-gray-light/30 outline-none transition-all"
                      placeholder="Ex: https://..."
                    />
                    <p className="text-[10px] text-brand-gray-light/50 font-bold mt-1.5 uppercase">
                      Coloque a URL e defina o formato abaixo para aparecer um banner especial logo no topo, antes dos cursos. Deixe vazio para esconder.
                    </p>
                  </div>
                  
                  {siteSettings && siteSettings.heroBannerUrl && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                        Formato do Banner
                      </label>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => onUpdateSiteSettings?.({ ...siteSettings, heroBannerType: "image" })}
                          className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg border transition-all ${
                            (!siteSettings.heroBannerType || siteSettings.heroBannerType === "image") ? "bg-brand-magenta/10 border-brand-magenta text-white" : "bg-[#1c1c1c] border-[#222] text-brand-gray-light/40 hover:text-white"
                          }`}
                        >
                          Imagem
                        </button>
                        <button 
                          onClick={() => onUpdateSiteSettings?.({ ...siteSettings, heroBannerType: "video" })}
                          className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg border transition-all ${
                            siteSettings.heroBannerType === "video" ? "bg-brand-magenta/10 border-brand-magenta text-white" : "bg-[#1c1c1c] border-[#222] text-brand-gray-light/40 hover:text-white"
                          }`}
                        >
                           Vídeo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>


              {/* Header section detailing current counts */}
              <div className="flex flex-col sm:flex-row justify-between items-center bg-[#121212] p-5 rounded-xl border border-[#222] gap-4">
                <div className="text-xs sm:text-sm font-semibold text-brand-gray-light/80">
                  Total de cursos registrados no Catálogo: <span className="text-brand-magenta font-bold">{products.length}</span>
                </div>
                
                <button
                  id="btn-admin-add-new-trigger"
                  onClick={handleStartCreate}
                  className="px-5 py-3 rounded-full bg-brand-magenta hover:bg-[#ff33ff] text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(255,0,255,0.2)]"
                >
                  <Plus size={15} />
                  Cadastrar Novo Curso
                </button>
              </div>

              {/* Grid listings */}
              {products.length === 0 ? (
                <div className="text-center py-16 bg-[#121212] rounded-xl border border-[#222] space-y-4">
                  <ImageIcon size={44} className="text-brand-magenta/30 mx-auto" />
                  <div className="text-lg font-bold text-white">Nenhum curso na vitrine</div>
                  <p className="text-brand-gray-light/50 text-xs max-w-[320px] mx-auto">
                    Não existem cursos cadastrados. Use o botão acima para inserir cursos excelentes de programação, design ou idiomas.
                  </p>
                  <button
                    onClick={handleStartCreate}
                    className="btn-magenta px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider"
                  >
                    Criar Novo Curso
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((p) => {
                    const isPromo = !!p.originalPrice;
                    return (
                      <div
                        key={p.id}
                        className="bg-[#121212] border border-[#222] rounded-xl overflow-hidden p-4 flex gap-4 transition-all hover:border-brand-magenta/35"
                      >
                        {/* Thumbnail */}
                        <div className={`w-20 ${p.imageOrientation === 'vertical' ? 'h-28' : p.imageOrientation === 'square' ? 'h-20' : 'h-14'} rounded-lg bg-[#222] overflow-hidden shrink-0 border border-white/5 self-center`}>
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            referrerPolicy="no-referrer"
                            className={`w-full h-full ${p.imageOrientation === 'vertical' ? 'object-contain' : 'object-cover'}`}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=150&auto=format&fit=crop";
                            }}
                          />
                        </div>

                        {/* Metadata info */}
                        <div className="flex-grow flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-bold text-white truncate">{p.title}</h4>
                              <div className="flex gap-1 items-center">
                                <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-brand-magenta/10 border border-brand-magenta/30 text-brand-light-magenta">
                                  {p.category}
                                </span>
                                {p.badge && (
                                  <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-brand-magenta text-white">
                                    {p.badge}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-[11px] text-brand-gray-light/60 mt-1 line-clamp-2 leading-relaxed markdown-body">
                              <div dangerouslySetInnerHTML={{ __html: p.description }} />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2">
                            {/* promotional prices list rendering */}
                            <div className="flex items-center gap-1.5">
                              {isPromo ? (
                                <>
                                  <span className="text-[10px] text-brand-gray-light/40 line-through">
                                    {p.originalPrice}
                                  </span>
                                  <span className="text-xs font-black text-brand-magenta">
                                    {p.promoPrice}
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs font-black text-brand-magenta">
                                  {p.promoPrice}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {deleteConfirmId === p.id ? (
                                <div className="flex items-center bg-red-900/20 border border-red-500/30 rounded px-1 py-1 gap-1">
                                  <button
                                    onClick={() => { onDeleteProduct(p.id); setDeleteConfirmId(null); }}
                                    className="bg-red-500 hover:bg-red-400 text-white text-[9px] font-bold px-2 py-1 rounded"
                                  >
                                    Excluir curso!
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="bg-[#2a2a2a] hover:bg-[#333] text-brand-gray-light text-[9px] px-2 py-1 flex-1 rounded"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    id={`btn-edit-${p.id}`}
                                    onClick={() => handleStartEdit(p)}
                                    title="Editar"
                                    className="w-8 h-8 rounded bg-[#1e1e1e] border border-[#2d2d2d] text-brand-gray-light/80 hover:text-white hover:border-brand-magenta transition-all flex items-center justify-center cursor-pointer"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    id={`btn-delete-${p.id}`}
                                    onClick={() => setDeleteConfirmId(p.id)}
                                    title="Deletar"
                                    className="w-8 h-8 rounded bg-red-950/20 border border-red-900/40 text-red-400 hover:text-red-300 hover:border-red-500 transition-all flex items-center justify-center cursor-pointer"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
