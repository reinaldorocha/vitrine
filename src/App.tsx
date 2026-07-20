import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ScreenState, Product, SiteSettings, Faq } from "./types";
import { INITIAL_PRODUCTS } from "./data";
import VisitorShowcase from "./components/VisitorShowcase";
import LoginScreen from "./components/LoginScreen";
import AdminPanel from "./components/AdminPanel";
import { motion, AnimatePresence } from "motion/react";
import { api } from "./lib/api";

// Wrap in Auth flow for Admin (Defined below)

function VisitorRoute({ products, siteSettings, approvals, faqs }: { products: Product[], siteSettings: SiteSettings, approvals: { id: number; imageUrl: string }[], faqs: Faq[] }) {
  const navigate = useNavigate();
  return <VisitorShowcase products={products} siteSettings={siteSettings} approvals={approvals} faqs={faqs} onNavigateToLogin={() => navigate("/admin")} />;
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});
  const [approvals, setApprovals] = useState<{ id: number; imageUrl: string }[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Load all data from API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodList, catList, settings, approvalsList, faqsList] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
          api.getSettings(),
          api.getApprovals().catch(() => []),
          api.getFaqs().catch(() => [])
        ]);
        
        // Sort by ID descending (newest first)
        prodList.sort((a, b) => b.id.localeCompare(a.id));
        setProducts(prodList);
        setCategories(catList);
        setSiteSettings(settings);
        setApprovals(approvalsList);
        setFaqs(faqsList);
      } catch (error) {
        console.error("Failed to load data from API.", error);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Sincronizar dados de SEO (Título, Favicon, Descrição) e cores dinamicamente na aba
  useEffect(() => {
    if (siteSettings && Object.keys(siteSettings).length > 0) {
      // 1. Título da Aba (SEO Title)
      const tabTitle = siteSettings.seoTitle || siteSettings.siteName || siteSettings.headerTitle || "Escola Cursos";
      document.title = tabTitle;

      // 2. Meta Descrição SEO
      if (siteSettings.seoDescription) {
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.setAttribute('name', 'description');
          document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', siteSettings.seoDescription);
      }

      // 3. Favicon URL
      if (siteSettings.faviconUrl) {
        let favicon = document.querySelector('link[rel="icon"]');
        if (!favicon) {
          favicon = document.createElement('link');
          favicon.setAttribute('rel', 'icon');
          document.head.appendChild(favicon);
        }
        favicon.setAttribute('href', siteSettings.faviconUrl);
      }

      // 4. Custom Theme Color Customization
      const primaryHex = siteSettings.primaryColor || "#ff00ff";
      
      const parseHex = (hex: string) => {
        let clean = hex.replace("#", "");
        if (clean.length === 3) {
          clean = clean.split("").map(c => c + c).join("");
        }
        if (clean.length !== 6) return { r: 255, g: 0, b: 255 };
        const num = parseInt(clean, 16);
        return {
          r: (num >> 16) & 255,
          g: (num >> 8) & 255,
          b: num & 255
        };
      };

      const { r, g, b } = parseHex(primaryHex);
      
      // Calculate light variations
      const r_light = Math.round(r + (255 - r) * 0.65);
      const g_light = Math.round(g + (255 - g) * 0.65);
      const b_light = Math.round(b + (255 - b) * 0.65);

      // Calculate dark variations
      const r_dark = Math.round(r * 0.35);
      const g_dark = Math.round(g * 0.35);
      const b_dark = Math.round(b * 0.35);

      const root = document.documentElement;
      root.style.setProperty("--color-brand-magenta", `rgb(${r}, ${g}, ${b})`);
      root.style.setProperty("--color-brand-magenta-rgb", `${r}, ${g}, ${b}`);
      root.style.setProperty("--color-brand-light-magenta", `rgb(${r_light}, ${g_light}, ${b_light})`);
      root.style.setProperty("--color-brand-dark-magenta", `rgb(${r_dark}, ${g_dark}, ${b_dark})`);
    }
  }, [siteSettings]);

  const saveProducts = async (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
  };

  const handleAddApproval = async (imageUrl: string) => {
    try {
      const res = await api.addApproval(imageUrl);
      if (res.success) {
        setApprovals(prev => [res.approval, ...prev]);
      }
    } catch (e) {
      console.error("Failed to add approval", e);
    }
  };

  const handleDeleteApproval = async (id: number) => {
    try {
      const res = await api.deleteApproval(id);
      if (res.success) {
        setApprovals(prev => prev.filter(a => a.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete approval", e);
    }
  };

  const handleAddFaq = async (question: string, answer: string) => {
    try {
      const res = await api.addFaq(question, answer);
      if (res.success && res.faq) {
        setFaqs(prev => [...prev, res.faq]);
      }
    } catch (e) {
      console.error("Failed to add faq", e);
    }
  };

  const handleDeleteFaq = async (id: number) => {
    try {
      const res = await api.deleteFaq(id);
      if (res.success) {
        setFaqs(prev => prev.filter(f => f.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete faq", e);
    }
  };

  const handleUpdateFaq = async (id: number, question: string, answer: string) => {
    try {
      const res = await api.updateFaq(id, question, answer);
      if (res.success && res.faq) {
        setFaqs(prev => prev.map(f => f.id === id ? res.faq : f));
      }
    } catch (e) {
      console.error("Failed to update faq", e);
    }
  };

  if (hasError) {
    return (
      <div className="min-h-screen bg-[#070707] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-[#0f0f0f]/80 border border-white/5 rounded-3xl p-8 space-y-6 shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500">
            <svg className="w-8 h-8 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white uppercase tracking-tight">Falha de Conexão</h2>
            <p className="text-xs text-brand-gray-light/60 leading-relaxed font-light">
              Não foi possível carregar as configurações do sistema. Certifique-se de que o banco de dados SQLite e o servidor de backend estão ativos e tente novamente.
            </p>
          </div>
          <div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#1c1c1c] hover:bg-[#252525] border border-white/5 hover:border-white/10 text-white font-bold text-xs uppercase py-3.5 rounded-xl tracking-wider transition-all cursor-pointer"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#1c1c1c] border-t-brand-magenta rounded-full animate-spin" />
          <span className="text-xs font-mono tracking-widest text-brand-gray-light/30 uppercase">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#000000] text-[#e2e2e2] selection:bg-brand-magenta selection:text-white">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<VisitorRoute products={products} siteSettings={siteSettings} approvals={approvals} faqs={faqs} />} />
          <Route 
            path="/admin" 
            element={
              <AdminFlow 
                products={products} 
                categories={categories} 
                siteSettings={siteSettings} 
                saveProducts={saveProducts}
                setCategories={setCategories}
                setSiteSettings={setSiteSettings}
                approvals={approvals}
                onAddApproval={handleAddApproval}
                onDeleteApproval={handleDeleteApproval}
                faqs={faqs}
                onAddFaq={handleAddFaq}
                onDeleteFaq={handleDeleteFaq}
                onUpdateFaq={handleUpdateFaq}
              />
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

// Subcomponent Wrapper interface updates
interface AdminFlowProps {
  products: Product[];
  categories: string[];
  siteSettings: SiteSettings;
  saveProducts: (products: Product[]) => void;
  setCategories: (categories: string[]) => void;
  setSiteSettings: (settings: SiteSettings) => void;
  approvals: { id: number; imageUrl: string }[];
  onAddApproval: (imageUrl: string) => void;
  onDeleteApproval: (id: number) => void;
  faqs: Faq[];
  onAddFaq: (question: string, answer: string) => void;
  onDeleteFaq: (id: number) => void;
  onUpdateFaq: (id: number, question: string, answer: string) => void;
}

function AdminFlow({
  products,
  categories,
  siteSettings,
  saveProducts,
  setCategories,
  setSiteSettings,
  approvals,
  onAddApproval,
  onDeleteApproval,
  faqs,
  onAddFaq,
  onDeleteFaq,
  onUpdateFaq
}: AdminFlowProps) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.verifySession();
        setIsAuthenticated(res.authenticated);
        if (res.authenticated && res.user) {
          setAdminEmail(res.user.email);
        }
      } catch (e) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const handleUpdateSiteSettings = async (settings: SiteSettings) => {
    setSiteSettings(settings);
    try {
      await api.updateSettings(settings);
    } catch (e) {
      console.error("Failed to update site settings", e);
    }
  };

  const handleAddProduct = async (product: Omit<Product, "id">) => {
    try {
      const generatedId = "p" + (Date.now());
      const res = await api.addProduct({ id: generatedId, ...product });
      if (res.success) {
        saveProducts([res.product, ...products]);
      }
    } catch (e) {
      console.error("Failed to add product", e);
    }
  };

  const handleUpdateProduct = async (product: Product) => {
    try {
      const res = await api.updateProduct(product);
      if (res.success) {
        saveProducts(products.map(p => p.id === product.id ? res.product : p));
      }
    } catch (e) {
      console.error("Failed to update product", e);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await api.deleteProduct(id);
      if (res.success) {
        saveProducts(products.filter(p => p.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete product", e);
    }
  };

  const handleAddCategory = async (category: string) => {
    try {
      const res = await api.addCategory(category);
      if (res.success) {
        setCategories([...categories, category]);
      }
    } catch (e) {
      console.error("Failed to add category", e);
    }
  };

  const handleDeleteCategory = async (category: string) => {
    try {
      const res = await api.deleteCategory(category);
      if (res.success) {
        setCategories(categories.filter(c => c !== category));
      }
    } catch (e) {
      console.error("Failed to delete category", e);
    }
  };

  const handleResetToDefault = async () => {
    try {
      const res = await api.resetProducts();
      if (res.success) {
        // Reload all data
        const [prodList, catList, settings, approvalsList, faqsList] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
          api.getSettings(),
          api.getApprovals().catch(() => []),
          api.getFaqs().catch(() => [])
        ]);
        prodList.sort((a, b) => b.id.localeCompare(a.id));
        saveProducts(prodList);
        setCategories(catList);
        setSiteSettings(settings);
        setApprovals(approvalsList);
        setFaqs(faqsList);
      }
    } catch (e) {
      console.error("Failed to reset products", e);
    }
  };

  const handleUpdateAdminCredentials = async (email: string, currentPass: string, newPass?: string) => {
    try {
      const res = await api.changeCredentials(email, currentPass, newPass);
      if (res.success && res.user) {
        setAdminEmail(res.user.email);
        return { success: true };
      }
      return { success: false, error: res.error || "Chave de autenticação inválida ou senha incorreta." };
    } catch (e: any) {
      return { success: false, error: e.message || "Erro de conexão ao servidor." };
    }
  };

  const handleLogout = async () => {
    const res = await api.logout();
    if (res.success) {
      setIsAuthenticated(false);
    }
  };

  if (isAuthenticated === null) {
    return <div className="min-h-screen bg-[#000000] flex items-center justify-center text-brand-magenta">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return (
      <LoginScreen 
        onBack={() => navigate("/")} 
        onLoginSuccess={() => setIsAuthenticated(true)} 
      />
    );
  }

  return (
    <AdminPanel 
      products={products}
      categories={categories}
      siteSettings={siteSettings}
      onUpdateSiteSettings={handleUpdateSiteSettings}
      onAddProduct={handleAddProduct}
      onUpdateProduct={handleUpdateProduct}
      onDeleteProduct={handleDeleteProduct}
      onAddCategory={handleAddCategory}
      onDeleteCategory={handleDeleteCategory}
      onResetToDefault={handleResetToDefault}
      onBack={() => navigate("/")}
      onLogout={handleLogout}
      approvals={approvals}
      onAddApproval={onAddApproval}
      onDeleteApproval={onDeleteApproval}
      faqs={faqs}
      onAddFaq={onAddFaq}
      onDeleteFaq={onDeleteFaq}
      onUpdateFaq={onUpdateFaq}
      adminEmail={adminEmail}
      onUpdateAdminCredentials={handleUpdateAdminCredentials}
    />
  );
}
