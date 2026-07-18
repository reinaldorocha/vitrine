import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ScreenState, Product, SiteSettings } from "./types";
import { INITIAL_PRODUCTS } from "./data";
import VisitorShowcase from "./components/VisitorShowcase";
import LoginScreen from "./components/LoginScreen";
import AdminPanel from "./components/AdminPanel";
import { motion, AnimatePresence } from "motion/react";
import { db } from "./lib/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";

// Wrap in Auth flow for Admin
function AdminFlow({ products, categories, siteSettings, saveProducts }: { products: Product[], categories: string[], siteSettings: SiteSettings, saveProducts: (p: Product[]) => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handleAddProduct = async (newProductData: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...newProductData,
      id: "product_" + Date.now()
    };
    saveProducts([...products, newProduct]);
    try {
      await setDoc(doc(db, "products", newProduct.id), newProduct);
    } catch (e) {
      console.error("Failed to add product", e);
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    saveProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    try {
      await setDoc(doc(db, "products", updatedProduct.id), updatedProduct);
    } catch (e) {
      console.error("Failed to update product", e);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    saveProducts(products.filter(p => p.id !== id));
    try {
      await deleteDoc(doc(db, "products", id));
    } catch (e) {
      console.error("Failed to delete product", e);
    }
  };

  const handleResetToDefault = async () => {
    saveProducts(INITIAL_PRODUCTS);
    try {
      // First, get all current products and delete them
      const snapshot = products;
      for (const p of snapshot) {
        await deleteDoc(doc(db, "products", p.id));
      }
      // Repopulate
      for (const p of INITIAL_PRODUCTS) {
        await setDoc(doc(db, "products", p.id), p);
      }
    } catch (e) {
      console.error("Failed to reset products", e);
    }
  };

  const handleAddCategory = async (cat: string) => {
    if (!categories.includes(cat)) {
      await setDoc(doc(db, "settings", "categories"), { list: [...categories, cat] });
    }
  };

  const handleDeleteCategory = async (cat: string) => {
    const updated = categories.filter(c => c !== cat);
    // Remove the category from settings
    await setDoc(doc(db, "settings", "categories"), { list: updated });
  };

  const handleUpdateSiteSettings = async (settings: SiteSettings) => {
    try {
      await setDoc(doc(db, "settings", "site"), settings, { merge: true });
    } catch (e) {
      console.error("Failed to update site settings", e);
    }
  };

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
    />
  );
}

function VisitorRoute({ products, siteSettings }: { products: Product[], siteSettings: SiteSettings }) {
  const navigate = useNavigate();
  return <VisitorShowcase products={products} siteSettings={siteSettings} onNavigateToLogin={() => navigate("/admin")} />;
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);

  // Load products from Firestore
  useEffect(() => {
    const productsRef = collection(db, "products");
    const unsubscribe = onSnapshot(productsRef, (snapshot) => {
      if (snapshot.empty) {
        // If DB is empty, initialize with default products
        INITIAL_PRODUCTS.forEach(async (p) => {
          await setDoc(doc(db, "products", p.id), p);
        });
      } else {
        const loadedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        // Sort by ID descending (newest first based on timestamp id)
        loadedProducts.sort((a, b) => b.id.localeCompare(a.id));
        setProducts(loadedProducts);
      }
      setLoading(false);
    }, (error) => {
      console.error("Failed to load products from Firebase.", error);
      setProducts(INITIAL_PRODUCTS);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load categories from Firestore
  useEffect(() => {
    const categoriesRef = doc(db, "settings", "categories");
    const unsub = onSnapshot(categoriesRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCategories(data.list || []);
      } else {
        const defaultCats = ["Programação", "Idiomas", "Design", "Marketing", "Inovação", "Produtividade"];
        setDoc(categoriesRef, { list: defaultCats });
      }
    }, (error) => {
      console.error("Failed to load categories", error);
    });
    return () => unsub();
  }, []);

  // Load site settings
  useEffect(() => {
    const siteRef = doc(db, "settings", "site");
    const unsub = onSnapshot(siteRef, (docSnap) => {
      if (docSnap.exists()) {
        setSiteSettings(docSnap.data() as SiteSettings);
      }
    }, (error) => {
      console.error("Failed to load site settings", error);
    });
    return () => unsub();
  }, []);

  const saveProducts = async (updatedProducts: Product[]) => {
    // Optimistic fallback update if Firebase is slow/failing
    setProducts(updatedProducts);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#000000] flex items-center justify-center text-brand-magenta">Carregando...</div>;
  }

  return (
    <div className="relative min-h-screen bg-[#000000] text-[#e2e2e2] selection:bg-brand-magenta selection:text-white">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<VisitorRoute products={products} siteSettings={siteSettings} />} />
          <Route path="/admin" element={<AdminFlow products={products} categories={categories} siteSettings={siteSettings} saveProducts={saveProducts} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
