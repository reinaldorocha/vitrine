import React, { useState, useEffect } from "react";
import { 
  Plus, Edit2, Trash2, ArrowLeft, RotateCcw, Image as ImageIcon,
  Check, Link as LinkIcon, AlertTriangle, Sparkles, Tag, ShoppingCart, MessageSquare, LogOut,
  Settings, User, LayoutGrid, BookOpen, Eye, HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, SiteSettings, Faq } from "../types";
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
  onLogout?: () => void;
  approvals: { id: number; imageUrl: string }[];
  onAddApproval: (imageUrl: string) => void;
  onDeleteApproval: (id: number) => void;
  faqs: Faq[];
  onAddFaq: (question: string, answer: string) => void;
  onDeleteFaq: (id: number) => void;
  onUpdateFaq: (id: number, question: string, answer: string) => void;
  adminEmail?: string;
  onUpdateAdminCredentials?: (email: string, currentPassword: string, newPassword?: string) => Promise<{ success: boolean; error?: string }>;
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
  onBack,
  onLogout,
  approvals,
  onAddApproval,
  onDeleteApproval,
  faqs,
  onAddFaq,
  onDeleteFaq,
  onUpdateFaq,
  adminEmail = "",
  onUpdateAdminCredentials
}: AdminPanelProps) {
  // Navigation Tabs State
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "approvals" | "about" | "faq" | "settings">("dashboard");

  // Mode parameters for editing products
  const [isEditing, setIsEditing] = useState<string | null>(null); // Id of product or "new"
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");

  // Change credentials form state
  const [credEmail, setCredEmail] = useState(adminEmail);
  const [credCurrentPass, setCredCurrentPass] = useState("");
  const [credNewPass, setCredNewPass] = useState("");
  const [credConfirmPass, setCredConfirmPass] = useState("");
  const [credSaving, setCredSaving] = useState(false);
  const [credMessage, setCredMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sync email when prop changes
  useEffect(() => { setCredEmail(adminEmail); }, [adminEmail]);

  // Sync editing FAQ state
  useEffect(() => {
    if (editingFaq) {
      setFaqQuestion(editingFaq.question);
      setFaqAnswer(editingFaq.answer);
    } else {
      setFaqQuestion("");
      setFaqAnswer("");
    }
  }, [editingFaq]);
  
  // Local settings form state with unsaved change tracker
  const [settingsForm, setSettingsForm] = useState<SiteSettings>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync state with parent props on mount and update
  useEffect(() => {
    if (siteSettings) {
      setSettingsForm(siteSettings);
      setHasUnsavedChanges(false);
    }
  }, [siteSettings]);

  const updateSettingsField = (field: keyof SiteSettings, value: any) => {
    setSettingsForm((prev) => {
      const updated = { ...prev, [field]: value };
      // Deep comparison check
      setHasUnsavedChanges(JSON.stringify(updated) !== JSON.stringify(siteSettings));
      return updated;
    });
  };

  const handleSaveSettings = () => {
    onUpdateSiteSettings?.(settingsForm);
    setHasUnsavedChanges(false);
  };

  // Form fields state for courses
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
    iconName: "Sparkles",
    priceLabel: ""
  });

  const [formError, setFormError] = useState("");
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newApprovalUrl, setNewApprovalUrl] = useState("");

  const handleCredentialsSave = async () => {
    if (!credEmail.trim() || !credCurrentPass.trim()) {
      setCredMessage({ type: "error", text: "E-mail e senha atual são obrigatórios." });
      return;
    }
    if (credNewPass && credNewPass !== credConfirmPass) {
      setCredMessage({ type: "error", text: "A nova senha e a confirmação não coincidem." });
      return;
    }
    if (!onUpdateAdminCredentials) return;
    setCredSaving(true);
    setCredMessage(null);
    const result = await onUpdateAdminCredentials(credEmail, credCurrentPass, credNewPass || undefined);
    setCredSaving(false);
    if (result.success) {
      setCredCurrentPass("");
      setCredNewPass("");
      setCredConfirmPass("");
      setCredMessage({ type: "success", text: "Credenciais atualizadas com sucesso!" });
    } else {
      setCredMessage({ type: "error", text: result.error || "Erro ao salvar credenciais." });
    }
  };

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
      iconName: "Sparkles",
      priceLabel: ""
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
      iconName: p.iconName || "Sparkles",
      priceLabel: p.priceLabel || ""
    });
    setFormError("");
    setImagePreviewError(false);
    setIsEditing(p.id);
  };

  // Submit product form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.title.trim()) {
      setFormError("Informe o título do produto.");
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
      const textToConsultant = `Olá! Vi o produto "${formData.title}" na vitrine e gostaria de saber mais.`;
      const numericWpp = settingsForm?.globalWhatsapp || "5521998332541";
      finalBtLink = `https://wa.me/${numericWpp.replace(/\D/g, "")}?text=${encodeURIComponent(textToConsultant)}`;
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

  const handleAddCategoryCustom = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName("");
    }
  };

  const handleAddApprovalClick = () => {
    if (newApprovalUrl.trim()) {
      onAddApproval(newApprovalUrl.trim());
      setNewApprovalUrl("");
    }
  };

  return (
    <div id="admin-management-panel" className="min-h-screen bg-[#070707] text-[#e2e2e2] pt-24 pb-16 px-4 md:px-12 relative">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Top bar with logo branding */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-[#222]">
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
                {settingsForm?.adminTitle || "Gestão dos Cursos da Vitrine"}
              </h1>
              <p className="text-brand-gray-light/60 text-xs sm:text-xs mt-1">
                {settingsForm?.adminSubtitle || "Adicione novas matérias, altere preços de promoção e organize a vitrine pública."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
            <button
              id="btn-admin-go-back"
              onClick={onBack}
              className="px-5 py-2.5 rounded-full bg-[#181818] border border-[#2d2d2d] hover:bg-[#282828] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              <Eye size={14} className="text-brand-magenta" />
              Ver Vitrine Pública
            </button>

            {onLogout && (
              <button
                id="btn-admin-logout"
                onClick={onLogout}
                className="px-4 py-2.5 rounded-full bg-[#181818] border border-[#2d2d2d] hover:bg-red-950/20 hover:text-red-400 text-brand-gray-light/80 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
              >
                <LogOut size={14} />
                Sair
              </button>
            )}
            
            {resetConfirm ? (
              <div className="flex items-center gap-2 bg-red-950/40 border border-red-900/40 rounded-full px-4 py-2">
                 <span className="text-red-400 text-[10px] font-bold uppercase mr-1">Confirmar Reset?</span>
                 <button 
                  onClick={() => { onResetToDefault(); setResetConfirm(false); setIsEditing(null); }}
                  className="bg-red-500 hover:bg-red-400 text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                 >
                   Sim
                 </button>
                 <button 
                  onClick={() => setResetConfirm(false)}
                  className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                 >
                   Não
                 </button>
              </div>
            ) : (
              <button
                id="btn-admin-reset-default"
                onClick={() => setResetConfirm(true)}
                className="px-4 py-2.5 rounded-full bg-[#1c1c1c] border border-red-955 hover:bg-red-955/20 text-red-400 hover:border-red-900/50 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw size={14} />
                Resetar Banco
              </button>
            )}
          </div>
        </div>

        {/* Elegant Navigation Tabs */}
        {!isEditing && (
          <div className="flex border-b border-[#1c1c1c] mb-8 gap-1 md:gap-4 overflow-x-auto pb-1 scrollbar-none select-none">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-5 py-3 text-xs md:text-sm font-bold uppercase tracking-wider rounded-t-lg transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === "dashboard"
                  ? "border-brand-magenta text-white bg-[#121212]"
                  : "border-transparent text-brand-gray-light/60 hover:text-white"
              }`}
            >
              <LayoutGrid size={14} /> Painel ADM
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`px-5 py-3 text-xs md:text-sm font-bold uppercase tracking-wider rounded-t-lg transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === "products"
                  ? "border-brand-magenta text-white bg-[#121212]"
                  : "border-transparent text-brand-gray-light/60 hover:text-white"
              }`}
            >
              <BookOpen size={14} /> Produtos
            </button>
            <button
              onClick={() => setActiveTab("approvals")}
              className={`px-5 py-3 text-xs md:text-sm font-bold uppercase tracking-wider rounded-t-lg transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === "approvals"
                  ? "border-brand-magenta text-white bg-[#121212]"
                  : "border-transparent text-brand-gray-light/60 hover:text-white"
              }`}
            >
              <Sparkles size={14} /> Aprovações
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`px-5 py-3 text-xs md:text-sm font-bold uppercase tracking-wider rounded-t-lg transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === "about"
                  ? "border-brand-magenta text-white bg-[#121212]"
                  : "border-transparent text-brand-gray-light/60 hover:text-white"
              }`}
            >
              <User size={14} /> Quem Sou Eu
            </button>
            <button
              onClick={() => setActiveTab("faq")}
              className={`px-5 py-3 text-xs md:text-sm font-bold uppercase tracking-wider rounded-t-lg transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === "faq"
                  ? "border-brand-magenta text-white bg-[#121212]"
                  : "border-transparent text-brand-gray-light/60 hover:text-white"
              }`}
            >
              <HelpCircle size={14} /> Perguntas Frequentes (FAQ)
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-5 py-3 text-xs md:text-sm font-bold uppercase tracking-wider rounded-t-lg transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === "settings"
                  ? "border-brand-magenta text-white bg-[#121212]"
                  : "border-transparent text-brand-gray-light/60 hover:text-white"
              }`}
            >
              <Settings size={14} /> Site Geral
            </button>
          </div>
        )}

        {/* Dynamic section toggling between Editor Form and List View */}
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editor-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Left Form controls (7 columns) */}
              <div className="lg:col-span-7 bg-[#121212]/95 border border-brand-magenta/20 rounded-2xl p-6 md:p-8 relative">
                <button
                  onClick={() => setIsEditing(null)}
                  className="absolute top-4 right-4 flex items-center gap-1.5 text-xs text-brand-gray-light/60 hover:text-white border border-[#2d2d2d] bg-[#1a1a1a] hover:bg-[#222] px-2.5 py-1.5 rounded-lg transition-all animate-none"
                >
                  <ArrowLeft size={12} /> Voltar
                </button>

                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-brand-magenta/10 border border-brand-magenta/30 flex items-center justify-center text-brand-magenta font-black">
                    {isEditing === "new" ? "+" : "✎"}
                  </span>
                  {isEditing === "new" ? "Cadastrar Novo Produto" : "Editar Detalhes do Produto"}
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
                      Nome do Produto / Título *
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
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 flex items-center gap-1 block">
                        <Tag size={12} className="text-brand-magenta" /> Categoria do Produto *
                      </label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="Ex: Programação, Design, Idiomas..."
                        className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta rounded-lg px-4 py-3 text-sm text-white placeholder-brand-gray-light/30 outline-none transition-all"
                        list="categories-datalist"
                        required
                      />
                      <p className="text-[10px] text-brand-gray-light/50">
                        Digite o nome da categoria ou selecione na lista.
                      </p>
                      <datalist id="categories-datalist">
                        {categories.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/55">
                        Categorias Ativas (Clique para Usar)
                      </label>
                      <div className="flex flex-wrap gap-1.5 p-2.5 bg-[#181818] rounded-lg border border-[#2d2d2d] max-h-[85px] overflow-y-auto w-full">
                        {categories.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setFormData({ ...formData, category: c })}
                            className="bg-[#242424] hover:bg-[#2d2d2d] text-brand-gray-light/95 border border-[#383838] text-[10px] px-2.5 py-1 rounded transition-colors cursor-pointer"
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#161616] p-4 rounded-xl border border-white/5">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-gray-light/80">
                        Rótulo do Preço <span className="text-[10px] text-brand-gray-light/40 normal-case">(Opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.priceLabel || ""}
                        onChange={(e) => setFormData({ ...formData, priceLabel: e.target.value })}
                        placeholder="Ex: Plano de Acesso, Investimento..."
                        className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-brand-gray-light/30 outline-none transition-all"
                      />
                      <p className="text-[10px] text-brand-gray-light/40">Texto acima do preço (Padrão: Plano de Acesso)</p>
                    </div>

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
                      <p className="text-[10px] text-brand-gray-light/40">Fica cortado no layout (Ex: <span className="line-through">R$ 399</span>)</p>
                    </div>

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

                  {/* Summary Description */}
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

                  {/* Long Description */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-magenta">
                      Descrição Completa (Página Detalhada)
                    </label>
                    <RichTextEditor
                       value={formData.longDescription}
                       onChange={(val) => setFormData({ ...formData, longDescription: val })}
                       minHeight="150px"
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
                        placeholder="Ex: MAIS COMPLETO, NOVO, 50% OFF"
                        className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta rounded-lg px-4 py-3 text-sm text-white placeholder-brand-gray-light/30 outline-none transition-all"
                      />
                    </div>

                    {/* Button Text */}
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

                  {/* Image link */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80">
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

                    {/* Image Suggestions presets */}
                    <div className="bg-[#181818] p-3 rounded-lg border border-[#222] space-y-1.5">
                      <span className="text-[11px] font-bold text-brand-gray-light/70 flex items-center gap-1">
                        <Sparkles size={11} className="text-brand-magenta" /> Banco de Sugestões de Imagens:
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

                  {/* Redirection Link */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80">
                      Link de Redirecionamento Personalizado (Opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.buttonLink}
                      onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                      placeholder="Deixe em branco para auto-gerar link de WhatsApp!"
                      className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta rounded-lg px-4 py-3 text-sm text-white placeholder-brand-gray-light/35 outline-none transition-all"
                    />
                    <p className="text-[10px] text-brand-gray-light/45">
                      Dica: Se deixar vazio, usará o WhatsApp Geral configurado na aba "Site Geral" com uma mensagem específica para este curso.
                    </p>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-3 pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setIsEditing(null)}
                      className="flex-1 py-3 rounded-lg border border-[#2d2d2d] bg-[#1a1a1a] hover:bg-[#242424] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-lg bg-brand-magenta hover:bg-[#ff33ff] text-white text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(255,0,255,0.2)] cursor-pointer"
                    >
                      {isEditing === "new" ? "Cadastrar Curso" : "Salvar Alterações"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Live Preview Area (5 columns) */}
              <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
                <div className="text-xs font-bold uppercase tracking-wider text-brand-gray-light/60 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-magenta animate-pulse" />
                  Live Preview do Card
                </div>

                <div className="glass-card p-5 rounded-2xl flex flex-col justify-between min-h-[440px] relative">
                  {formData.badge && (
                    <div className="absolute top-3.5 right-3.5 z-10 bg-brand-magenta text-white font-extrabold text-[9px] uppercase px-2.5 py-1 rounded-full tracking-wider shadow-md">
                      {formData.badge}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className={`rounded-xl overflow-hidden bg-[#181818] border border-white/5 flex items-center justify-center relative ${
                      formData.imageOrientation === "vertical" ? "h-64" : formData.imageOrientation === "square" ? "h-48" : "h-40"
                    }`}>
                      {formData.imageUrl && !imagePreviewError ? (
                        <img 
                          src={formData.imageUrl} 
                          alt="Preview" 
                          referrerPolicy="no-referrer"
                          onError={() => setImagePreviewError(true)}
                          className={`w-full h-full ${formData.imageOrientation === "vertical" ? "object-contain" : "object-cover"}`}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6 text-center text-brand-gray-light/40 space-y-2">
                          <ImageIcon size={28} className="text-brand-magenta/40" />
                          <span className="text-[11px] font-medium text-brand-gray-light/40">Capa do Curso</span>
                        </div>
                      )}
                      <span className="absolute bottom-2.5 left-2.5 bg-black/85 border border-white/10 px-2 py-0.5 rounded text-[9px] font-bold text-brand-gray-light uppercase">
                        📁 {formData.category || "Geral"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-white tracking-tight truncate">
                        {formData.title || "Título Provisório do Curso"}
                      </h4>
                      <div className="text-xs text-brand-gray-light/60 line-clamp-3 leading-relaxed markdown-body">
                        {formData.description ? (
                          <div dangerouslySetInnerHTML={{ __html: formData.description }} />
                        ) : (
                          "O resumo digitado aparecerá neste bloco na página principal."
                        )}
                      </div>
                    </div>
                  </div>

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
                      <MessageSquare size={12} />
                      <span>{formData.buttonText || "Quero Começar Agora"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="tabs-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* TAB 1: PAINEL ADM (DASHBOARD SUMMARY) */}
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  {/* Greeting Box */}
                  <div className="bg-[#121212] border border-[#1c1c1c] p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand-magenta/5 blur-3xl pointer-events-none" />
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                      <Sparkles className="text-brand-magenta w-5 h-5" /> Bem-vindo ao Painel ADM
                    </h3>
                    <p className="text-brand-gray-light/75 text-sm max-w-xl leading-relaxed font-light">
                      Este painel permite que você configure toda a identidade visual da sua vitrine de cursos, a sua biografia na seção "Quem Sou Eu", os produtos do catálogo e otimizações de SEO para buscadores do Google.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button 
                        onClick={onBack}
                        className="px-4 py-2 bg-brand-magenta/10 border border-brand-magenta/30 hover:bg-brand-magenta/25 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Visualizar Vitrine Pública
                      </button>
                      <button 
                        onClick={() => setActiveTab("products")}
                        className="px-4 py-2 bg-[#1c1c1c] border border-[#2d2d2d] hover:bg-[#252525] text-brand-gray-light hover:text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Cadastrar/Editar Cursos
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Stats grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                    <div className="bg-[#121212] border border-[#1c1c1c] p-5 rounded-xl flex flex-col justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gray-light/50">Cursos Ativos</span>
                      <span className="text-3xl font-black text-white mt-2 flex items-baseline gap-1.5">
                        {products.length} <span className="text-xs font-normal text-brand-gray-light/45">produtos</span>
                      </span>
                    </div>

                    <div className="bg-[#121212] border border-[#1c1c1c] p-5 rounded-xl flex flex-col justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gray-light/50">Categorias Ativas</span>
                      <span className="text-3xl font-black text-brand-magenta mt-2 flex items-baseline gap-1.5">
                        {categories.length} <span className="text-xs font-normal text-brand-gray-light/45">filtros</span>
                      </span>
                    </div>

                    <div className="bg-[#121212] border border-[#1c1c1c] p-5 rounded-xl flex flex-col justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gray-light/50">Aprovações</span>
                      <span className="text-3xl font-black text-white mt-2 flex items-baseline gap-1.5">
                        {approvals.length} <span className="text-xs font-normal text-brand-gray-light/45">artes</span>
                      </span>
                    </div>

                    <div className="bg-[#121212] border border-[#1c1c1c] p-5 rounded-xl flex flex-col justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gray-light/50">WhatsApp</span>
                      <span className="text-base font-bold text-white truncate mt-3.5">
                        {settingsForm?.globalWhatsapp || "Não definido"}
                      </span>
                    </div>
                  </div>

                  {/* Quick Categories Badge Viewer */}
                  <div className="bg-[#121212] border border-[#1c1c1c] p-5 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">Tags de Categorias no Menu do Usuário</h4>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {categories.map((c) => (
                        <span 
                          key={c} 
                          className="bg-brand-magenta/10 border border-brand-magenta/25 text-brand-light-magenta text-[10px] font-semibold px-2.5 py-1 rounded"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Change Credentials Card */}
                  {onUpdateAdminCredentials && (
                    <div className="bg-[#121212] border border-[#1c1c1c] p-5 rounded-xl space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                        <User size={13} className="text-brand-magenta" /> Alterar E-mail e Senha do Administrador
                      </h4>

                      {credMessage && (
                        <div className={`text-xs font-medium px-3 py-2 rounded-lg ${credMessage.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                          {credMessage.text}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-brand-gray-light/50">Novo E-mail</label>
                          <input
                            type="email"
                            value={credEmail}
                            onChange={(e) => { setCredEmail(e.target.value); setCredMessage(null); }}
                            className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-3 py-2.5 text-xs text-white outline-none"
                            placeholder="admin@exemplo.com"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-brand-gray-light/50">Senha Atual <span className="text-red-400">*</span></label>
                          <input
                            type="password"
                            value={credCurrentPass}
                            onChange={(e) => { setCredCurrentPass(e.target.value); setCredMessage(null); }}
                            className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-3 py-2.5 text-xs text-white outline-none"
                            placeholder="Obrigatório para confirmar alterações"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-brand-gray-light/50">Nova Senha <span className="text-brand-gray-light/30">(opcional)</span></label>
                          <input
                            type="password"
                            value={credNewPass}
                            onChange={(e) => { setCredNewPass(e.target.value); setCredMessage(null); }}
                            className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-3 py-2.5 text-xs text-white outline-none"
                            placeholder="Deixe em branco para manter"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-brand-gray-light/50">Confirmar Nova Senha</label>
                          <input
                            type="password"
                            value={credConfirmPass}
                            onChange={(e) => { setCredConfirmPass(e.target.value); setCredMessage(null); }}
                            className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-3 py-2.5 text-xs text-white outline-none"
                            placeholder="Repita a nova senha"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={handleCredentialsSave}
                          disabled={credSaving}
                          className="px-6 py-2.5 rounded-lg bg-brand-magenta hover:bg-[#ff33ff] text-white text-xs font-black uppercase tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {credSaving ? "Salvando..." : "Salvar Credenciais"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PRODUTOS (PRODUCTS MANAGEMENT) */}
              {activeTab === "products" && (
                <div className="space-y-6">
                  {/* Category manager custom section */}
                  <div className="bg-[#121212] border border-[#1c1c1c] p-5 rounded-xl space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                      <Tag size={14} className="text-brand-magenta" /> Gerenciar Filtros de Categorias
                    </h4>
                    
                    <div className="flex flex-col sm:flex-row gap-2 max-w-lg">
                      <input 
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Nova categoria (Ex: Concursos, Mentoria)"
                        className="flex-grow bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-2.5 text-xs text-white placeholder-brand-gray-light/30 outline-none"
                      />
                      <button
                        onClick={handleAddCategoryCustom}
                        className="px-5 py-2.5 rounded-lg bg-brand-magenta hover:bg-[#ff33ff] text-white text-xs font-black uppercase tracking-wider cursor-pointer"
                      >
                        Criar Categoria
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-[#1c1c1c]">
                      {categories.map((c) => (
                        <div key={c} className="group flex items-center bg-[#1c1c1c] hover:bg-[#252525] rounded border border-[#2d2d2d] h-7 text-[11px]">
                          <span className="px-2.5 font-semibold text-brand-gray-light/90">{c}</span>
                          <button
                            onClick={() => onDeleteCategory(c)}
                            title="Apagar categoria do banco"
                            className="bg-red-950/20 hover:bg-red-500/20 text-red-400 px-2 h-full border-l border-[#2d2d2d] transition-all flex items-center cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Header counts with creation flow */}
                  <div className="flex flex-col sm:flex-row justify-between items-center bg-[#121212] p-5 rounded-xl border border-[#1c1c1c] gap-4">
                    <div className="text-xs sm:text-sm font-semibold text-brand-gray-light/80">
                      Cursos no Catálogo: <span className="text-brand-magenta font-bold">{products.length}</span>
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

                  {/* Product grids */}
                  {products.length === 0 ? (
                    <div className="text-center py-16 bg-[#121212] rounded-xl border border-[#1c1c1c] space-y-4">
                      <ImageIcon size={44} className="text-brand-magenta/30 mx-auto" />
                      <div className="text-lg font-bold text-white">Nenhum curso cadastrado</div>
                      <p className="text-brand-gray-light/50 text-xs max-w-[320px] mx-auto">
                        Crie seu primeiro curso ou produto utilizando o botão acima.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {products.map((p) => {
                        const isPromo = !!p.originalPrice;
                        return (
                          <div
                            key={p.id}
                            className="bg-[#121212] border border-[#1c1c1c] rounded-xl overflow-hidden p-4 flex gap-4 transition-all hover:border-brand-magenta/35"
                          >
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

                            <div className="flex-grow flex flex-col justify-between min-w-0">
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="text-sm font-bold text-white truncate">{p.title}</h4>
                                  <div className="flex gap-1 items-center">
                                    <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-brand-magenta/10 border border-brand-magenta/30 text-brand-light-magenta">
                                      {p.category}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-[11px] text-brand-gray-light/60 mt-1 line-clamp-2 leading-relaxed markdown-body">
                                  <div dangerouslySetInnerHTML={{ __html: p.description }} />
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2">
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
                                        className="bg-red-500 hover:bg-red-400 text-white text-[9px] font-bold px-2 py-1 rounded cursor-pointer"
                                      >
                                        Excluir!
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirmId(null)}
                                        className="bg-[#2a2a2a] hover:bg-[#333] text-brand-gray-light text-[9px] px-2 py-1 rounded cursor-pointer"
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => handleStartEdit(p)}
                                        className="w-8 h-8 rounded bg-[#1e1e1e] border border-[#2d2d2d] text-brand-gray-light/80 hover:text-white hover:border-brand-magenta transition-all flex items-center justify-center cursor-pointer"
                                      >
                                        <Edit2 size={12} />
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirmId(p.id)}
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
                </div>
              )}

              {/* TAB 3: APROVAÇÕES (TESTIMONIALS IMAGES) */}
              {activeTab === "approvals" && (
                <div className="space-y-6">
                  {/* Title Config card */}
                  <div className="bg-[#121212] border border-[#1c1c1c] p-6 rounded-2xl space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles size={18} className="text-brand-magenta" /> Configuração da Seção de Aprovações
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/85 mb-2">
                          Selo Superior (Tag) (Editável)
                        </label>
                        <input 
                          type="text"
                          value={settingsForm?.approvalsBadge || ""}
                          onChange={(e) => updateSettingsField("approvalsBadge", e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white placeholder-brand-gray-light/30 outline-none"
                          placeholder="Ex: Resultados Reais / Depoimentos"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/85 mb-2">
                          Título Principal da Seção (Editável)
                        </label>
                        <input 
                          type="text"
                          value={settingsForm?.approvalsTitle || ""}
                          onChange={(e) => updateSettingsField("approvalsTitle", e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white placeholder-brand-gray-light/30 outline-none"
                          placeholder="Ex: Nossos Aprovados / Feedbacks"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/85 mb-2">
                        Subtítulo / Descrição Exibida na Vitrine (Editável)
                      </label>
                      <textarea 
                        value={settingsForm?.approvalsSubtitle || ""}
                        onChange={(e) => updateSettingsField("approvalsSubtitle", e.target.value)}
                        rows={2}
                        className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white placeholder-brand-gray-light/30 outline-none resize-none"
                        placeholder="Ex: Confira o feedback e os banners dos nossos alunos aprovados..."
                      />
                    </div>
                    <div>
                      <button
                        onClick={handleSaveSettings}
                        className="px-5 py-2.5 rounded-lg bg-brand-magenta hover:bg-[#ff33ff] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_12px_rgba(255,0,255,0.15)]"
                      >
                        Salvar Configurações da Seção
                      </button>
                    </div>
                  </div>

                  {/* Add Approval Image */}
                  <div className="bg-[#121212] border border-[#1c1c1c] p-6 rounded-2xl space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Plus size={18} className="text-brand-magenta" /> Adicionar Arte de Aprovado / Feedback
                    </h3>
                    
                    <div className="flex flex-col sm:flex-row gap-2 items-end">
                      <div className="flex-grow space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80">
                          URL Direta da Imagem (Upload em Imgur, Postimages etc.)
                        </label>
                        <input 
                          type="url"
                          value={newApprovalUrl}
                          onChange={(e) => setNewApprovalUrl(e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-2.5 text-xs text-white placeholder-brand-gray-light/35 outline-none"
                          placeholder="https://i.ibb.co/... ou link direto de imagem"
                        />
                      </div>
                      <button
                        onClick={handleAddApprovalClick}
                        className="px-6 py-3 rounded-lg bg-brand-magenta hover:bg-[#ff33ff] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_12px_rgba(255,0,255,0.2)]"
                      >
                        Adicionar
                      </button>
                    </div>
                    <p className="text-[10px] text-brand-gray-light/45">
                      Suba o feedback dos aprovados em sites como imgur.com ou postimages.org e cole o link direto terminado em .png ou .jpg.
                    </p>
                  </div>

                  {/* Registered Images */}
                  <div className="bg-[#121212] border border-[#1c1c1c] p-6 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">Galeria de Imagens</h3>
                    
                    {approvals.length === 0 ? (
                      <p className="text-xs text-brand-gray-light/45 text-center py-8">Nenhum feedback de aprovado cadastrado.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {approvals.map((a) => (
                          <div key={a.id} className="relative group rounded-xl overflow-hidden border border-[#2d2d2d] bg-[#1a1a1a] flex flex-col justify-between">
                            <div className="w-full aspect-[4/5] bg-black overflow-hidden relative">
                              <img 
                                src={a.imageUrl} 
                                alt="Aprovação"
                                className="w-full h-full object-cover"
                                onError={(e) => (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=150"}
                              />
                              <button
                                onClick={() => onDeleteApproval(a.id)}
                                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-600/90 hover:bg-red-500 text-white flex items-center justify-center cursor-pointer shadow transition-all scale-90 group-hover:scale-100 opacity-90 group-hover:opacity-100"
                                title="Remover"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: QUEM SOU EU (ABOUT ME SECTION) */}
              {activeTab === "about" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Fields form */}
                  <div className="lg:col-span-7 bg-[#121212] border border-[#1c1c1c] p-6 rounded-2xl space-y-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <User size={18} className="text-brand-magenta" /> Biografia do Mentor
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/85 mb-2">
                          Título do Bloco
                        </label>
                        <input 
                          type="text"
                          value={settingsForm?.aboutTitle || ""}
                          onChange={(e) => updateSettingsField("aboutTitle", e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white placeholder-brand-gray-light/30 outline-none"
                          placeholder="Ex: Quem Sou Eu / Quem Somos"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/85 mb-2">
                          Foto de Perfil (URL)
                        </label>
                        <input 
                          type="url"
                          value={settingsForm?.aboutImageUrl || ""}
                          onChange={(e) => updateSettingsField("aboutImageUrl", e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white placeholder-brand-gray-light/30 outline-none"
                          placeholder="Ex: https://images.unsplash..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/85 mb-2">
                        História / Biografia (Suporta quebras de parágrafo)
                      </label>
                      <textarea 
                        value={settingsForm?.aboutText || ""}
                        onChange={(e) => updateSettingsField("aboutText", e.target.value)}
                        rows={8}
                        className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white outline-none"
                        placeholder="Conte sua experiência profissional, aprovações, objetivos..."
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleSaveSettings}
                        className="px-6 py-3 rounded-lg bg-brand-magenta hover:bg-[#ff33ff] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(255,0,255,0.2)]"
                      >
                        Salvar Biografia
                      </button>
                    </div>
                  </div>

                  {/* Profile Preview */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-brand-gray-light/60 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-magenta" /> Preview da Seção de Biografia
                    </div>

                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 rounded-2xl flex flex-col items-center text-center gap-4">
                      {settingsForm?.aboutImageUrl ? (
                        <div className="w-32 h-32 rounded-xl overflow-hidden border border-brand-magenta/30 bg-[#151515]">
                          <img 
                            src={settingsForm.aboutImageUrl} 
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=150"}
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-xl border border-dashed border-[#333] flex items-center justify-center text-brand-gray-light/30 text-xs">
                          Sem imagem
                        </div>
                      )}

                      <div>
                        <h4 className="text-lg font-black text-white">{settingsForm?.aboutTitle || "Quem Sou Eu"}</h4>
                        <span className="text-[9px] uppercase tracking-widest text-brand-magenta font-black">Mentor & Professor</span>
                      </div>

                      <div className="text-xs text-brand-gray-light/70 leading-relaxed font-light whitespace-pre-line text-left border-t border-[#1c1c1c] pt-4 w-full max-h-[220px] overflow-y-auto">
                        {settingsForm?.aboutText || "Biografia em branco."}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: PERGUNTAS FREQUENTES (FAQ) */}
              {activeTab === "faq" && (
                <div className="space-y-6">
                  {/* FAQ Settings */}
                  <div className="bg-[#121212] border border-[#1c1c1c] p-6 rounded-2xl space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles size={18} className="text-brand-magenta" /> Configuração da Seção FAQ
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/85 mb-2">
                          Título Principal da Seção (Editável)
                        </label>
                        <input 
                          type="text"
                          value={settingsForm?.faqTitle || ""}
                          onChange={(e) => updateSettingsField("faqTitle", e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white placeholder-brand-gray-light/30 outline-none"
                          placeholder="Ex: Perguntas Frequentes / Dúvidas"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/85 mb-2">
                          Subtítulo da Seção (Editável)
                        </label>
                        <input 
                          type="text"
                          value={settingsForm?.faqSubtitle || ""}
                          onChange={(e) => updateSettingsField("faqSubtitle", e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white placeholder-brand-gray-light/30 outline-none"
                          placeholder="Ex: Tire suas dúvidas..."
                        />
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={handleSaveSettings}
                        className="px-5 py-2.5 rounded-lg bg-brand-magenta hover:bg-[#ff33ff] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_12px_rgba(255,0,255,0.15)]"
                      >
                        Salvar Configurações da Seção
                      </button>
                    </div>
                  </div>

                  {/* Add/Edit FAQ Form */}
                  <div className="bg-[#121212] border border-[#1c1c1c] p-6 rounded-2xl space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {editingFaq ? (
                        <>
                          <Edit2 size={18} className="text-brand-magenta" /> Editar Pergunta Frequente
                        </>
                      ) : (
                        <>
                          <Plus size={18} className="text-brand-magenta" /> Adicionar Nova Pergunta Frequente
                        </>
                      )}
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-1.5">
                          Pergunta
                        </label>
                        <input 
                          type="text"
                          value={faqQuestion}
                          onChange={(e) => setFaqQuestion(e.target.value)}
                          placeholder="Ex: Como recebo o material?"
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta rounded-lg px-4 py-3 text-sm text-white placeholder-brand-gray-light/35 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-1.5">
                          Resposta
                        </label>
                        <textarea 
                          value={faqAnswer}
                          onChange={(e) => setFaqAnswer(e.target.value)}
                          rows={3}
                          placeholder="Ex: O material é enviado para o seu e-mail cadastrado logo após a compra..."
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta rounded-lg px-4 py-3 text-sm text-white placeholder-brand-gray-light/35 outline-none transition-all resize-none"
                        />
                      </div>
                      
                      <div className="pt-2 flex gap-3">
                        {editingFaq ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                if (faqQuestion.trim() && faqAnswer.trim()) {
                                  onUpdateFaq(editingFaq.id, faqQuestion.trim(), faqAnswer.trim());
                                  setEditingFaq(null);
                                }
                              }}
                              className="px-6 py-3 rounded-lg bg-brand-magenta hover:bg-[#ff33ff] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_12px_rgba(255,0,255,0.2)]"
                            >
                              Salvar Alterações
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingFaq(null)}
                              className="px-6 py-3 rounded-lg bg-[#2a2a2a] hover:bg-[#333] text-brand-gray-light text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (faqQuestion.trim() && faqAnswer.trim()) {
                                  onAddFaq(faqQuestion.trim(), faqAnswer.trim());
                                  setFaqQuestion("");
                                  setFaqAnswer("");
                              }
                            }}
                            className="px-6 py-3 rounded-lg bg-brand-magenta hover:bg-[#ff33ff] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_12px_rgba(255,0,255,0.2)]"
                          >
                            Adicionar Pergunta
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Registered FAQs list */}
                  <div className="bg-[#121212] border border-[#1c1c1c] p-6 rounded-2xl space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <HelpCircle size={18} className="text-brand-magenta" /> Perguntas Cadastradas ({faqs?.length || 0})
                    </h3>
                    
                    {(!faqs || faqs.length === 0) ? (
                      <div className="text-center py-8 text-brand-gray-light/30 text-xs">
                        Nenhuma pergunta frequente cadastrada.
                      </div>
                    ) : (
                      <div className="divide-y divide-[#1c1c1c]">
                        {faqs.map((faq) => (
                          <div key={faq.id} className="py-4 flex items-start justify-between gap-4 first:pt-0 last:pb-0">
                            <div className="space-y-1">
                              <h4 className="text-sm font-bold text-white">{faq.question}</h4>
                              <p className="text-xs text-brand-gray-light/60 leading-relaxed font-light">{faq.answer}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => setEditingFaq(faq)}
                                className="px-3 py-1.5 rounded bg-brand-magenta/10 border border-brand-magenta/30 text-brand-light-magenta hover:bg-brand-magenta hover:text-white text-[10px] font-bold uppercase transition-all cursor-pointer"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => onDeleteFaq(faq.id)}
                                className="px-3 py-1.5 rounded bg-red-950/20 border border-red-900/40 text-red-400 hover:text-red-300 hover:border-red-500 text-[10px] font-bold uppercase transition-all cursor-pointer"
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: SITE GERAL (GENERAL SETTINGS & SEO) */}
              {activeTab === "settings" && (
                <div className="space-y-6">
                  
                  {/* Identity settings grid */}
                  <div className="bg-[#121212] border border-[#1c1c1c] p-6 rounded-2xl space-y-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Settings size={18} className="text-brand-magenta" /> Configurações Visuais e Cabeçalhos
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                          Logo do Site (URL da Imagem)
                        </label>
                        <input
                          type="url"
                          value={settingsForm?.logoUrl || ""}
                          onChange={(e) => updateSettingsField("logoUrl", e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white placeholder-brand-gray-light/30 outline-none"
                          placeholder="Ex: https://..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                          Nome da Marca / Site
                        </label>
                        <input
                          type="text"
                          value={settingsForm?.siteName || ""}
                          onChange={(e) => updateSettingsField("siteName", e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white"
                          placeholder="Ex: Escola de Ministérios"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                          Título do Cabeçalho da Vitrine
                        </label>
                        <input
                          type="text"
                          value={settingsForm?.headerTitle || ""}
                          onChange={(e) => updateSettingsField("headerTitle", e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                          Favicon do Navegador (Ícone da Aba)
                        </label>
                        <input
                          type="url"
                          value={settingsForm?.faviconUrl || ""}
                          onChange={(e) => updateSettingsField("faviconUrl", e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white"
                          placeholder="Ex: https://.../favicon.ico"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                          Imagem Lateral do Hero (Vitrine)
                        </label>
                        <input
                          type="url"
                          value={settingsForm?.heroImageUrl || ""}
                          onChange={(e) => updateSettingsField("heroImageUrl", e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white placeholder-brand-gray-light/30 outline-none"
                          placeholder="Ex: https://..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                          Cor Primária / Identidade do Site (Hexadecimal)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={settingsForm?.primaryColor || "#ff00ff"}
                            onChange={(e) => updateSettingsField("primaryColor", e.target.value)}
                            className="w-12 h-12 bg-transparent border-0 cursor-pointer outline-none rounded shrink-0 self-center"
                          />
                          <input
                            type="text"
                            value={settingsForm?.primaryColor || "#ff00ff"}
                            onChange={(e) => updateSettingsField("primaryColor", e.target.value)}
                            className="flex-grow bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white outline-none"
                            placeholder="Ex: #ff00ff"
                          />
                        </div>
                        <p className="text-[10px] text-brand-gray-light/40 mt-1">Selecione no seletor de cores ou digite o código hex (ex: #3b82f6).</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                          Título da Seção de Aprovações
                        </label>
                        <input
                          type="text"
                          value={settingsForm?.approvalsTitle || ""}
                          onChange={(e) => updateSettingsField("approvalsTitle", e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white"
                          placeholder="Ex: Nossos Aprovados"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                        Subtítulo da Vitrine (Abaixo do Título de Cursos)
                      </label>
                      <textarea
                        value={settingsForm?.catalogSubtitle || ""}
                        onChange={(e) => updateSettingsField("catalogSubtitle", e.target.value)}
                        rows={2}
                        className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white outline-none resize-none"
                      />
                    </div>
                  </div>

                  {/* Personalização Estética & Tema do Site */}
                  <div className="bg-[#121212] border border-[#1c1c1c] p-6 rounded-2xl space-y-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles className="text-brand-magenta w-5 h-5" /> Personalização Estética (Cores, Fontes e Botões)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Cor de Fundo do Site */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                          Cor de Fundo Principal do Site
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={settingsForm?.bgColor || "#0a0a0a"}
                            onChange={(e) => updateSettingsField("bgColor", e.target.value)}
                            className="w-12 h-12 bg-transparent border-0 cursor-pointer outline-none rounded shrink-0 self-center"
                          />
                          <input
                            type="text"
                            value={settingsForm?.bgColor || "#0a0a0a"}
                            onChange={(e) => updateSettingsField("bgColor", e.target.value)}
                            className="flex-grow bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white outline-none"
                            placeholder="Ex: #0a0a0a"
                          />
                        </div>
                        <div className="flex gap-1.5 mt-2">
                          {[
                            { name: "Preto", hex: "#0a0a0a" },
                            { name: "Grafite", hex: "#121212" },
                            { name: "Azul Noite", hex: "#090d16" },
                            { name: "Roxo Noite", hex: "#11091c" }
                          ].map((preset) => (
                            <button
                              key={preset.hex}
                              type="button"
                              onClick={() => updateSettingsField("bgColor", preset.hex)}
                              className="text-[10px] font-semibold px-2 py-1 rounded bg-[#1c1c1c] hover:bg-[#282828] text-white border border-[#333] cursor-pointer"
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Cor de Fundo dos Cards */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                          Cor de Fundo dos Cards de Produtos
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={settingsForm?.cardBgColor || "#121212"}
                            onChange={(e) => updateSettingsField("cardBgColor", e.target.value)}
                            className="w-12 h-12 bg-transparent border-0 cursor-pointer outline-none rounded shrink-0 self-center"
                          />
                          <input
                            type="text"
                            value={settingsForm?.cardBgColor || "#121212"}
                            onChange={(e) => updateSettingsField("cardBgColor", e.target.value)}
                            className="flex-grow bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white outline-none"
                            placeholder="Ex: #121212"
                          />
                        </div>
                        <div className="flex gap-1.5 mt-2">
                          {[
                            { name: "Escuro", hex: "#121212" },
                            { name: "Preto", hex: "#070707" },
                            { name: "Azul", hex: "#111827" },
                            { name: "Roxo", hex: "#1c102a" }
                          ].map((preset) => (
                            <button
                              key={preset.hex}
                              type="button"
                              onClick={() => updateSettingsField("cardBgColor", preset.hex)}
                              className="text-[10px] font-semibold px-2 py-1 rounded bg-[#1c1c1c] hover:bg-[#282828] text-white border border-[#333] cursor-pointer"
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Cor dos Títulos */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                          Cor dos Títulos Principais
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={settingsForm?.titleColor || "#ffffff"}
                            onChange={(e) => updateSettingsField("titleColor", e.target.value)}
                            className="w-12 h-12 bg-transparent border-0 cursor-pointer outline-none rounded shrink-0 self-center"
                          />
                          <input
                            type="text"
                            value={settingsForm?.titleColor || "#ffffff"}
                            onChange={(e) => updateSettingsField("titleColor", e.target.value)}
                            className="flex-grow bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white outline-none"
                            placeholder="Ex: #ffffff"
                          />
                        </div>
                      </div>

                      {/* Cor dos Subtítulos */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                          Cor dos Subtítulos / Textos Secundários
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={settingsForm?.subtitleColor || "#a1a1aa"}
                            onChange={(e) => updateSettingsField("subtitleColor", e.target.value)}
                            className="w-12 h-12 bg-transparent border-0 cursor-pointer outline-none rounded shrink-0 self-center"
                          />
                          <input
                            type="text"
                            value={settingsForm?.subtitleColor || "#a1a1aa"}
                            onChange={(e) => updateSettingsField("subtitleColor", e.target.value)}
                            className="flex-grow bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white outline-none"
                            placeholder="Ex: #a1a1aa"
                          />
                        </div>
                      </div>

                      {/* Tamanho do Título do Hero */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                          Tamanho do Título Principal (Hero)
                        </label>
                        <select
                          value={settingsForm?.titleFontSize || "normal"}
                          onChange={(e) => updateSettingsField("titleFontSize", e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white outline-none"
                        >
                          <option value="normal">Médio (Padrão)</option>
                          <option value="large">Grande (+15%)</option>
                          <option value="xlarge">Extra Grande (+30%)</option>
                        </select>
                      </div>

                      {/* Tamanho dos Títulos de Seções */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                          Tamanho dos Títulos das Seções
                        </label>
                        <select
                          value={settingsForm?.sectionTitleFontSize || "normal"}
                          onChange={(e) => updateSettingsField("sectionTitleFontSize", e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white outline-none"
                        >
                          <option value="normal">Médio (Padrão)</option>
                          <option value="large">Grande (+15%)</option>
                          <option value="xlarge">Extra Grande (+30%)</option>
                        </select>
                      </div>

                      {/* Rótulo do Preço Padrão */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                          Rótulo do Preço Padrão dos Produtos
                        </label>
                        <input
                          type="text"
                          value={settingsForm?.priceLabel || ""}
                          onChange={(e) => updateSettingsField("priceLabel", e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white outline-none"
                          placeholder="Ex: Plano de Acesso, Investimento..."
                        />
                        <p className="text-[10px] text-brand-gray-light/40 mt-1">Texto padrão que aparece acima do valor dos produtos.</p>
                      </div>

                      {/* Estilo dos Botões */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                          Formato / Arredondamento dos Botões do Site
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: "pill", label: "Pílula (Arredondado Máximo)", style: "rounded-full" },
                            { id: "rounded", label: "Arredondado Médio", style: "rounded-xl" },
                            { id: "square", label: "Reto / Quadrado", style: "rounded-sm" }
                          ].map((bStyle) => (
                            <button
                              key={bStyle.id}
                              type="button"
                              onClick={() => updateSettingsField("buttonStyle", bStyle.id)}
                              className={`p-3 text-xs font-bold border transition-all cursor-pointer ${bStyle.style} ${
                                (settingsForm?.buttonStyle || "pill") === bStyle.id
                                  ? "bg-brand-magenta text-white border-brand-magenta shadow-[0_0_10px_rgba(255,0,255,0.3)]"
                                  : "bg-[#1c1c1c] text-brand-gray-light/60 border-[#2d2d2d] hover:border-white/20"
                              }`}
                            >
                              {bStyle.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section Top Hero */}
                  <div className="bg-[#121212] border border-[#1c1c1c] p-6 rounded-2xl space-y-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles className="text-brand-magenta w-5 h-5" /> Configurações da Seção Hero (Topo)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                          Selo Destaque do Hero
                        </label>
                        <input
                          type="text"
                          value={settingsForm?.heroBadge || ""}
                          onChange={(e) => updateSettingsField("heroBadge", e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                          Título Principal do Hero
                        </label>
                        <input
                          type="text"
                          value={settingsForm?.heroTitle || ""}
                          onChange={(e) => updateSettingsField("heroTitle", e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                          Texto do Botão do Hero (Conhecer Cursos)
                        </label>
                        <input
                          type="text"
                          value={settingsForm?.heroButtonText || ""}
                          onChange={(e) => updateSettingsField("heroButtonText", e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white"
                          placeholder="Deixe em branco para ocultar"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                        Subtítulo / Descrição do Hero
                      </label>
                      <textarea
                        value={settingsForm?.heroSubtitle || ""}
                        onChange={(e) => updateSettingsField("heroSubtitle", e.target.value)}
                        rows={2}
                        className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white outline-none resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4 border-t border-[#1c1c1c]">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                          Imagem ou Vídeo de Banner de Fundo (Opcional)
                        </label>
                        <input
                          type="url"
                          value={settingsForm?.heroBannerUrl || ""}
                          onChange={(e) => updateSettingsField("heroBannerUrl", e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white placeholder-brand-gray-light/30 outline-none"
                          placeholder="Link da imagem/vídeo..."
                        />
                      </div>

                      {settingsForm?.heroBannerUrl && (
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                            Tipo de Fundo
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateSettingsField("heroBannerType", "image")}
                              className={`flex-1 py-2 text-xs font-bold rounded-lg border uppercase cursor-pointer ${
                                (!settingsForm.heroBannerType || settingsForm.heroBannerType === "image")
                                  ? "bg-brand-magenta/15 border-brand-magenta text-white"
                                  : "bg-[#1c1c1c] border-[#222] text-brand-gray-light/40 hover:text-white"
                              }`}
                            >
                              Imagem
                            </button>
                            <button
                              onClick={() => updateSettingsField("heroBannerType", "video")}
                              className={`flex-1 py-2 text-xs font-bold rounded-lg border uppercase cursor-pointer ${
                                settingsForm.heroBannerType === "video"
                                  ? "bg-brand-magenta/15 border-brand-magenta text-white"
                                  : "bg-[#1c1c1c] border-[#222] text-brand-gray-light/40 hover:text-white"
                              }`}
                            >
                              Vídeo
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Panel Admin customization */}
                  <div className="bg-[#121212] border border-[#1c1c1c] p-6 rounded-2xl space-y-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Settings size={18} className="text-brand-magenta" /> Customização do Painel Admin
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                          Título Principal do Painel
                        </label>
                        <input
                          type="text"
                          value={settingsForm?.adminTitle || ""}
                          onChange={(e) => updateSettingsField("adminTitle", e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                          Subtítulo de Instruções
                        </label>
                        <textarea
                          value={settingsForm?.adminSubtitle || ""}
                          onChange={(e) => updateSettingsField("adminSubtitle", e.target.value)}
                          rows={2}
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white outline-none resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contacts and footer text */}
                  <div className="bg-[#121212] border border-[#1c1c1c] p-6 rounded-2xl space-y-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <MessageSquare size={18} className="text-brand-magenta" /> Contatos e Rodapé do Site
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                          WhatsApp de Atendimento (Apenas Números com DDD)
                        </label>
                        <input
                          type="text"
                          value={settingsForm?.globalWhatsapp || ""}
                          onChange={(e) => updateSettingsField("globalWhatsapp", e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white"
                          placeholder="Ex: 5521998332541"
                        />
                        <p className="text-[10px] text-brand-gray-light/40 mt-1">Dica: Inclua DDI (55) e DDD. Não coloque parênteses ou traços.</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                          Texto de Copyright do Rodapé
                        </label>
                        <input
                          type="text"
                          value={settingsForm?.footerText || ""}
                          onChange={(e) => updateSettingsField("footerText", e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SEO settings card */}
                  <div className="bg-[#121212] border border-[#1c1c1c] p-6 rounded-2xl space-y-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Settings size={18} className="text-brand-magenta" /> Indexação e SEO (Google)
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                          Título de SEO (Título de Aba)
                        </label>
                        <input
                          type="text"
                          value={settingsForm?.seoTitle || ""}
                          onChange={(e) => updateSettingsField("seoTitle", e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white"
                          placeholder="Ex: Escola de Concursos - Vitrine Oficial"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray-light/80 mb-2">
                          Descrição de SEO (Descrição de Busca)
                        </label>
                        <textarea
                          value={settingsForm?.seoDescription || ""}
                          onChange={(e) => updateSettingsField("seoDescription", e.target.value)}
                          rows={3}
                          className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus:border-brand-magenta rounded-lg px-4 py-3 text-sm text-white outline-none resize-none"
                          placeholder="Ex: Turbine sua preparação para concursos públicos com nossas mentorias exclusivas..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="pt-2">
                    <button
                      onClick={handleSaveSettings}
                      className="px-6 py-3.5 rounded-lg bg-brand-magenta hover:bg-[#ff33ff] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(255,0,255,0.25)]"
                    >
                      Salvar Todas as Configurações do Site
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Sticky Save Banner for unsaved changes */}
      <AnimatePresence>
        {hasUnsavedChanges && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-lg bg-[#141414]/95 border border-brand-magenta/40 shadow-[0_10px_30px_rgba(255,0,255,0.2)] rounded-2xl p-4 flex items-center justify-between gap-4 backdrop-blur-md"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex w-2 h-2 rounded-full bg-brand-magenta animate-ping shrink-0" />
              <span className="text-xs font-semibold text-white">Alterações pendentes de salvamento!</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSettingsForm(siteSettings || {});
                  setHasUnsavedChanges(false);
                }}
                className="px-3.5 py-2 rounded-lg bg-[#222] border border-[#333] hover:bg-[#2d2d2d] text-brand-gray-light text-[10px] font-bold uppercase transition-all cursor-pointer"
              >
                Descartar
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 rounded-lg bg-brand-magenta hover:bg-[#ff33ff] text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,0,255,0.3)] cursor-pointer"
              >
                Salvar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
