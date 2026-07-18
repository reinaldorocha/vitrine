import { Product } from "./types";

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "Desenvolvimento Web Fullstack Completo",
    description: "Domine HTML5, CSS3, JavaScript, React, Node.js e bancos de dados do absoluto zero com projetos reais.",
    originalPrice: "R$ 497,00",
    promoPrice: "R$ 197,00",
    category: "Programação",
    badge: "MAIS VENDIDO",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop",
    iconName: "LayoutTemplate",
    buttonText: "Falar com Consultor",
    buttonLink: "https://wa.me/5521998332541?text=Olá,%20tenho%20interesse%20no%20Curso%20Web%20Fullstack!"
  },
  {
    id: "p2",
    title: "Inglês para Negócios e Carreira",
    description: "Aprenda a se comunicar em entrevistas de emprego, reuniões internacionais e escreva e-mails profissionais com desenvoltura.",
    originalPrice: "R$ 380,00",
    promoPrice: "R$ 149,00",
    category: "Idiomas",
    badge: "PROMOÇÃO",
    imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600&auto=format&fit=crop",
    iconName: "Sparkles",
    buttonText: "Falar com Consultor",
    buttonLink: "https://wa.me/5521998332541?text=Olá,%20quero%20saber%20mais%20sobre%20o%20Inglês%20para%20Negócios!"
  },
  {
    id: "p3",
    title: "Formação UI/UX Designer Profissional",
    description: "Crie interfaces modernas e experiências de usuário viciantes usando o Figma de forma profissional.",
    originalPrice: "R$ 449,00",
    promoPrice: "R$ 159,00",
    category: "Design",
    badge: "NOVO",
    imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=600&auto=format&fit=crop",
    iconName: "LayoutTemplate",
    buttonText: "Falar com Consultor",
    buttonLink: "https://wa.me/5521998332541?text=Olá,%20tenho%20interesse%20no%20Curso%20de%20UIUX%20Designer!"
  },
  {
    id: "p4",
    title: "Marketing Digital e Tráfego Pago",
    description: "Aprenda a criar anúncios de alta conversão no Facebook Ads, Instagram Ads e Google Ads para escalar qualquer negócio.",
    originalPrice: "R$ 399,00",
    promoPrice: "R$ 129,00",
    category: "Marketing",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop",
    iconName: "BarChart3",
    buttonText: "Falar com Consultor",
    buttonLink: "https://wa.me/5521998332541?text=Olá,%20tenho%20interesse%20no%20Curso%20de%20Marketing%20Digital!"
  },
  {
    id: "p5",
    title: "Inteligência Artificial aplicada a Negócios",
    description: "Aprenda a aplicar ChatGPT, Midjourney, Claude e ferramentas de automação na sua rotina para ganhar produtividade extrema.",
    originalPrice: "R$ 520,00",
    promoPrice: "R$ 199,00",
    category: "Inovação",
    badge: "LANÇAMENTO",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=600&auto=format&fit=crop",
    iconName: "BrainCircuit",
    buttonText: "Falar com Consultor",
    buttonLink: "https://wa.me/5521998332541?text=Olá,%20tenho%20interesse%20no%20Curso%20de%20Inteligência%20Artificial!"
  },
  {
    id: "p6",
    title: "Excel Avançado e Dashboards de Impacto",
    description: "Crie planilhas profissionais, fórmulas complexas, tabelas dinâmicas e painéis visuais impressionantes de forma prática.",
    originalPrice: "R$ 290,00",
    promoPrice: "R$ 89,00",
    category: "Produtividade",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop",
    iconName: "Database",
    buttonText: "Falar com Consultor",
    buttonLink: "https://wa.me/5521998332541?text=Olá,%20tenho%20interesse%20no%20Curso%20de%20Excel%20Avançado!"
  }
];

export const PRESET_IMAGES = [
  {
    label: "Programação e Código",
    url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop"
  },
  {
    label: "Inteligência Artificial",
    url: "https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=600&auto=format&fit=crop"
  },
  {
    label: "UI/UX e Design",
    url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=600&auto=format&fit=crop"
  },
  {
    label: "Estudos ou Negócios",
    url: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600&auto=format&fit=crop"
  },
  {
    label: "Gráficos e Marketing",
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop"
  },
  {
    label: "Estudantes em Grupo",
    url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop"
  }
];

export const INITIAL_CATEGORIES = [
  "Programação",
  "Idiomas",
  "Design",
  "Marketing",
  "Inovação",
  "Produtividade"
];
