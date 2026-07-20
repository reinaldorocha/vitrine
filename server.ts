import express from "express";
import cookieParser from "cookie-parser";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "sua_chave_secreta_jwt_padrao";

let db: any;
let useFallback = false;

// Default initial data for database seeding or fallback
const INITIAL_CATEGORIES = ["Programação", "Idiomas", "Design", "Marketing", "Inovação", "Produtividade"];

const INITIAL_PRODUCTS = [
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

const fallbackDb = {
  users: [
    {
      email: "admin@admin.com",
      password_hash: hashPassword("admin123")
    }
  ],
  categories: [...INITIAL_CATEGORIES],
  siteSettings: {
    headerTitle: "Escola Cursos",
    adminTitle: "Plataforma Administrativa",
    adminSubtitle: "Gerencie seus cursos",
    footerText: "© 2026 Escola Cursos. Todos os direitos reservados.",
    siteName: "Escola de Ministérios Marcio Gonçalves",
    heroTitle: "CONHEÇA TODOS OS NOSSOS RECURSOS",
    heroSubtitle: "São diversos cursos e ferramentas para te ajudar a desenvolver seu ministério e crescimento pessoal.",
    heroBadge: "CURSOS MINISTERIAIS",
    seoTitle: "Escola de Ministérios Marcio Gonçalves - Vitrine de Cursos",
    seoDescription: "Vitrine de Cursos da Escola de Ministérios Marcio Gonçalves. Qualifique-se e turbine seu crescimento pessoal.",
    faviconUrl: "https://i.ibb.co/zj7h3M5/logo-ESCOLA-CURSOS.png",
    aboutTitle: "Quem Sou Eu",
    aboutText: `Sou Policial, e atuo como professor e mentor para concursos públicos.
Compartilhando a experiência de 6 anos no mundo dos concursos públicos, possuo formação como Bacharel em Direito e Especialista em Direito Penal e Processo Penal. Minha primeira aprovação veio logo aos 23 anos de idade para o cargo de Guarda Civil Municipal, e atualmente exerço o cargo de Policial Penal.

Comecei compartilhando aulas no YouTube, logo depois a pedido dos alunos, comecei a compartilhar conteúdo no Instagram e aos poucos as coisas foram acontecendo e hoje já contamos com diversos alunos. Uma grande família de concurseiros em busca da tão somhada aprovação!

A minha missão é levar conhecimento, organização, acompanhamento e facilidade para a vida dos concurseiros do Brasil que sonham por uma oportunidade. O meu objetivo é deixar sua aprovação cada vez mais próxima, quero poder ajudar pessoas comuns a se tornarem servidores públicos, assim como foi comigo!

Vem fazer parte do projeto mais completo do Norte e Nordeste, feito e pensado para você concurseiro.`,
    aboutImageUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=400&auto=format&fit=crop",
    catalogSubtitle: "Escolha seu foco, turbine sua qualificação e receba suporte dedicado. Filtre por categoria abaixo:",
    approvalsTitle: "Aprovações & Depoimentos",
    approvalsSubtitle: "Confira o feedback e os banners dos nossos alunos aprovados que alcançaram a estabilidade pública.",
    primaryColor: "#ff00ff",
    approvalsBadge: "Resultados Reais"
  },
  products: [...INITIAL_PRODUCTS],
  approvals: [
    { id: 1, imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=400&auto=format&fit=crop" },
    { id: 2, imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=400&auto=format&fit=crop" }
  ],
  faqs: [
    { id: 1, question: "Quais as formas de pagamento?", answer: "Você pode realizar o pagamento via Pix (liberação imediata), boleto bancário (compensação em até 72h) ou cartão de crédito em até 12x." },
    { id: 2, question: "Como recebo meu material?", answer: "O acesso é enviado automaticamente para o seu e-mail cadastrado logo após a confirmação do pagamento. Compras via Pix ou Cartão são liberadas em poucos minutos." },
    { id: 3, question: "Tem limite para realizar o download?", answer: "Não! Uma vez adquirido, o material é seu e você pode realizar o download ou acessar os materiais quantas vezes precisar, sem limite de tempo." },
    { id: 4, question: "Política de reembolso", answer: "Garantimos o seu direito de reembolso integral em até 7 dias após a compra, conforme o Código de Defesa do Consumidor, caso o material não atenda às suas expectativas." }
  ]
};

// Password hashing using node native crypto module
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === checkHash;
}

// Authentication middleware
function authenticateToken(req: any, res: any, next: any) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Acesso não autorizado. Por favor, faça login." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET) as { email: string };
    req.user = verified;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Sessão expirada ou inválida." });
  }
}

// Initialize SQLite database
// Initialize Database connection (MySQL or SQLite)
async function initDb() {
  try {
    const isMysql = !!process.env.DB_HOST;

    if (isMysql) {
      console.log("Conectando ao banco de dados MySQL...");
      // Connect without specifying database name first to create it if it doesn't exist
      const tempConnection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true
      });

      const dbName = process.env.DB_NAME || "vitrine_db";
      await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
      await tempConnection.end();

      // Reconnect with database selected
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: dbName,
        multipleStatements: true
      });

      db = {
        all: async (q, p) => {
          const [rows] = await connection.execute(q, p);
          return rows as any[];
        },
        get: async (q, p) => {
          const [rows] = await connection.execute(q, p);
          return (rows as any[])[0];
        },
        run: async (q, p) => {
          const [result] = await connection.execute(q, p);
          return { lastID: (result as any).insertId };
        },
        exec: async (q) => {
          await connection.query(q);
        }
      };
      console.log("Banco de dados MySQL conectado e pronto.");
    } else {
      console.log("Conectando ao banco de dados SQLite local...");
      const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "database.db");
      const sqliteDb = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      db = {
        all: (q, p) => sqliteDb.all(q, p),
        get: (q, p) => sqliteDb.get(q, p),
        run: async (q, p) => {
          const res = await sqliteDb.run(q, p);
          return { lastID: res.lastID };
        },
        exec: (q) => sqliteDb.exec(q)
      };
      console.log(`Banco de dados SQLite aberto com sucesso em: ${dbPath}`);
    }

    // Create schemas dialect-specifically
    if (isMysql) {
      await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash TEXT NOT NULL
        )
      `);
      await db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
          name VARCHAR(255) PRIMARY KEY
        )
      `);
      await db.exec(`
        CREATE TABLE IF NOT EXISTS site_settings (
          id INT PRIMARY KEY,
          heroBannerUrl TEXT,
          heroBannerType VARCHAR(50) DEFAULT 'image',
          logoUrl TEXT,
          headerTitle TEXT,
          adminTitle TEXT,
          adminSubtitle TEXT,
          footerText TEXT,
          globalWhatsapp VARCHAR(50),
          siteName TEXT,
          heroTitle TEXT,
          heroSubtitle TEXT,
          heroBadge VARCHAR(255),
          seoTitle TEXT,
          seoDescription TEXT,
          faviconUrl TEXT,
          aboutTitle TEXT,
          aboutText TEXT,
          aboutImageUrl TEXT,
          catalogSubtitle TEXT,
          approvalsTitle TEXT,
          approvalsSubtitle TEXT,
          primaryColor VARCHAR(50),
          approvalsBadge VARCHAR(255),
          faqTitle TEXT,
          faqSubtitle TEXT,
          heroImageUrl TEXT,
          heroButtonText VARCHAR(255)
        )
      `);
      await db.exec(`
        CREATE TABLE IF NOT EXISTS approvals (
          id INT AUTO_INCREMENT PRIMARY KEY,
          imageUrl TEXT NOT NULL
        )
      `);
      await db.exec(`
        CREATE TABLE IF NOT EXISTS faqs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          question TEXT NOT NULL,
          answer TEXT NOT NULL
        )
      `);
      await db.exec(`
        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          longDescription TEXT,
          originalPrice VARCHAR(50),
          promoPrice VARCHAR(50) NOT NULL,
          category VARCHAR(255) NOT NULL,
          badge VARCHAR(255),
          imageUrl TEXT NOT NULL,
          imageOrientation VARCHAR(50) DEFAULT 'square',
          buttonText VARCHAR(255) NOT NULL,
          buttonLink TEXT NOT NULL,
          iconName VARCHAR(255)
        )
      `);
    } else {
      await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL
        )
      `);
      await db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
          name TEXT PRIMARY KEY
        )
      `);
      await db.exec(`
        CREATE TABLE IF NOT EXISTS site_settings (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          heroBannerUrl TEXT,
          heroBannerType TEXT DEFAULT 'image',
          logoUrl TEXT,
          headerTitle TEXT,
          adminTitle TEXT,
          adminSubtitle TEXT,
          footerText TEXT,
          globalWhatsapp TEXT,
          siteName TEXT,
          heroTitle TEXT,
          heroSubtitle TEXT,
          heroBadge TEXT,
          seoTitle TEXT,
          seoDescription TEXT,
          faviconUrl TEXT,
          aboutTitle TEXT,
          aboutText TEXT,
          aboutImageUrl TEXT,
          catalogSubtitle TEXT,
          approvalsTitle TEXT,
          approvalsSubtitle TEXT,
          primaryColor TEXT,
          approvalsBadge TEXT,
          faqTitle TEXT,
          faqSubtitle TEXT,
          heroImageUrl TEXT,
          heroButtonText TEXT
        )
      `);
      await db.exec(`
        CREATE TABLE IF NOT EXISTS approvals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          imageUrl TEXT NOT NULL
        )
      `);
      await db.exec(`
        CREATE TABLE IF NOT EXISTS faqs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          question TEXT NOT NULL,
          answer TEXT NOT NULL
        )
      `);
      await db.exec(`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          longDescription TEXT,
          originalPrice TEXT,
          promoPrice TEXT NOT NULL,
          category TEXT NOT NULL,
          badge TEXT,
          imageUrl TEXT NOT NULL,
          imageOrientation TEXT DEFAULT 'square',
          buttonText TEXT NOT NULL,
          buttonLink TEXT NOT NULL,
          iconName TEXT
        )
      `);
    }

    // Dynamically alter site_settings to add new columns if upgrading from an existing database file
    const newColumns = [
      "siteName", "heroTitle", "heroSubtitle", "heroBadge", "seoTitle", "seoDescription", "faviconUrl",
      "aboutTitle", "aboutText", "aboutImageUrl", "catalogSubtitle", "approvalsTitle", "approvalsSubtitle", "primaryColor", "approvalsBadge", "faqTitle", "faqSubtitle", "heroImageUrl", "heroButtonText"
    ];
    for (const col of newColumns) {
      try {
        await db.exec(`ALTER TABLE site_settings ADD COLUMN ${col} TEXT`);
      } catch (e) {
        // Column probably already exists, safe to ignore
      }
    }

    // Seed Admin User
    const adminUser = await db.get("SELECT * FROM users LIMIT 1");
    if (!adminUser) {
      const email = process.env.ADMIN_EMAIL || "admin@admin.com";
      const pass = process.env.ADMIN_PASSWORD || "admin123";
      const hash = hashPassword(pass);
      await db.run("INSERT INTO users (email, password_hash) VALUES (?, ?)", [email, hash]);
      console.log(`Usuário administrador padrão criado: ${email}`);
    }

    const insertIgnoreKeyword = isMysql ? "INSERT IGNORE" : "INSERT OR IGNORE";

    // Seed Categories
    const categoriesCount = await db.get("SELECT COUNT(*) as count FROM categories");
    if (categoriesCount.count === 0) {
      for (const cat of INITIAL_CATEGORIES) {
        await db.run(`${insertIgnoreKeyword} INTO categories (name) VALUES (?)`, [cat]);
      }
      console.log("Categorias padrão inseridas no banco.");
    }

    // Seed Site Settings
    const settingsExist = await db.get("SELECT * FROM site_settings WHERE id = 1");
    if (!settingsExist) {
      await db.run(`
        ${insertIgnoreKeyword} INTO site_settings (id, headerTitle, adminTitle, adminSubtitle, footerText, siteName, heroTitle, heroSubtitle, heroBadge, seoTitle, seoDescription, faviconUrl, aboutTitle, aboutText, aboutImageUrl, catalogSubtitle, approvalsTitle, approvalsSubtitle, primaryColor, approvalsBadge, faqTitle, faqSubtitle, heroImageUrl, heroButtonText) 
        VALUES (1, 'Escola Cursos', 'Plataforma Administrativa', 'Gerencie seus cursos', '© 2026 Escola Cursos. Todos os direitos reservados.', 'Escola de Ministérios Marcio Gonçalves', 'CONHEÇA TODOS OS NOSSOS RECURSOS', 'São diversos cursos e ferramentas para te ajudar a desenvolver seu ministério e crescimento pessoal.', 'CURSOS MINISTERIAIS', 'Escola de Ministérios Marcio Gonçalves - Vitrine de Cursos', 'Vitrine de Cursos da Escola de Ministérios Marcio Gonçalves. Qualifique-se e turbine seu crescimento pessoal.', 'https://i.ibb.co/zj7h3M5/logo-ESCOLA-CURSOS.png', 'Quem Sou Eu', 'Sou Policial, e atuo como professor e mentor para concursos públicos.\nCompartilhando a experiência de 6 anos no mundo dos concursos públicos, possuo formação como Bacharel em Direito e Especialista em Direito Penal e Processo Penal. Minha primeira aprovação veio logo aos 23 anos de idade para o cargo de Guarda Civil Municipal, e atualmente exerço o cargo de Policial Penal.\n\nComecei compartilhando aulas no YouTube, logo depois a pedido dos alunos, comecei a compartilhar conteúdo no Instagram e aos poucos as coisas foram acontecendo e hoje já contamos com diversos alunos. Uma grande família de concurseiros em busca da tão somhada aprovação!\n\nA minha missão é levar conhecimento, organization, acompanhamento e facilidade para a vida dos concurseiros do Brasil que sonham por uma oportunidade. O meu objetivo é deixar sua aprovação cada vez mais próxima, quero poder ajudar pessoas comuns a se tornarem servidores públicos, assim como foi comigo!\n\nVem fazer parte do projeto mais completo do Norte e Nordeste, feito e pensado para você concurseiro.', 'https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=400&auto=format&fit=crop', 'Escolha seu foco, turbine sua qualificação e receba suporte dedicado. Filtre por categoria abaixo:', 'Aprovações & Depoimentos', 'Confira o feedback e os banners dos nossos alunos aprovados que alcançaram a estabilidade pública.', '#ff00ff', 'Resultados Reais', 'Perguntas Frequentes', 'Tire suas principais dúvidas sobre o acesso, pagamento e envio do material.', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop', 'Conhecer Cursos')
      `);
      console.log("Configurações padrão inseridas no banco.");
    } else {
      // Se a linha 1 já existe mas as novas colunas adicionadas estão nulas, inicializa-as
      const defaultAboutText = `Sou Policial, e atuo como professor e mentor para concursos públicos.
Compartilhando a experiência de 6 anos no mundo dos concursos públicos, possuo formação como Bacharel em Direito e Especialista em Direito Penal e Processo Penal. Minha primeira aprovação veio logo aos 23 anos de idade para o cargo de Guarda Civil Municipal, e atualmente exerço o cargo de Policial Penal.

Comecei compartilhando aulas no YouTube, logo depois a pedido dos alunos, comecei a compartilhar conteúdo no Instagram e aos poucos as coisas foram acontecendo e hoje já contamos com diversos alunos. Uma grande família de concurseiros em busca da tão somhada aprovação!

A minha missão é levar conhecimento, organização, acompanhamento e facilidade para a vida dos concurseiros do Brasil que sonham por uma oportunidade. O meu objetivo é deixar sua aprovação cada vez mais próxima, quero poder ajudar pessoas comuns a se tornarem servidores públicos, assim como foi comigo!

Vem fazer parte do projeto mais completo do Norte e Nordeste, feito e pensado para você concurseiro.`;

      if (!settingsExist.aboutTitle || !settingsExist.aboutText || !settingsExist.catalogSubtitle || !settingsExist.approvalsTitle || !settingsExist.approvalsSubtitle || !settingsExist.primaryColor || !settingsExist.approvalsBadge || !settingsExist.faqTitle || !settingsExist.faqSubtitle || !settingsExist.heroImageUrl || !settingsExist.heroButtonText) {
        await db.run(`
          UPDATE site_settings
          SET aboutTitle = COALESCE(aboutTitle, ?),
              aboutText = COALESCE(aboutText, ?),
              aboutImageUrl = COALESCE(aboutImageUrl, ?),
              catalogSubtitle = COALESCE(catalogSubtitle, ?),
              approvalsTitle = COALESCE(approvalsTitle, ?),
              approvalsSubtitle = COALESCE(approvalsSubtitle, ?),
              primaryColor = COALESCE(primaryColor, ?),
              approvalsBadge = COALESCE(approvalsBadge, ?),
              faqTitle = COALESCE(faqTitle, ?),
              faqSubtitle = COALESCE(faqSubtitle, ?),
              heroImageUrl = COALESCE(heroImageUrl, ?),
              heroButtonText = COALESCE(heroButtonText, ?)
          WHERE id = 1
        `, [
          'Quem Sou Eu',
          defaultAboutText,
          'https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=400&auto=format&fit=crop',
          'Escolha seu foco, turbine sua qualificação e receba suporte dedicado. Filtre por categoria abaixo:',
          'Aprovações & Depoimentos',
          'Confira o feedback e os banners dos nossos alunos aprovados que alcançaram a estabilidade pública.',
          '#ff00ff',
          'Resultados Reais',
          'Perguntas Frequentes',
          'Tire suas principais dúvidas sobre o acesso, pagamento e envio do material.',
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
          'Conhecer Cursos'
        ]);
        console.log("Colunas adicionais da tabela de configurações preenchidas com os valores default.");
      }
    }

    // Seed approvals if empty
    const approvalsCount = await db.get("SELECT COUNT(*) as count FROM approvals");
    if (approvalsCount.count === 0) {
      const initialApprovals = [
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=400&auto=format&fit=crop"
      ];
      for (const img of initialApprovals) {
        await db.run("INSERT INTO approvals (imageUrl) VALUES (?)", [img]);
      }
      console.log("Imagens de aprovações iniciais inseridas no banco SQLite.");
    }

    // Seed FAQs if empty
    const faqsCount = await db.get("SELECT COUNT(*) as count FROM faqs");
    if (faqsCount.count === 0) {
      const initialFaqs = [
        {
          question: "Quais as formas de pagamento?",
          answer: "Você pode realizar o pagamento via Pix (liberação imediata), boleto bancário (compensação em até 72h) ou cartão de crédito em até 12x."
        },
        {
          question: "Como recebo meu material?",
          answer: "O acesso é enviado automaticamente para o seu e-mail cadastrado logo após a confirmação do pagamento. Compras via Pix ou Cartão são liberadas em poucos minutos."
        },
        {
          question: "Tem limite para realizar o download?",
          answer: "Não! Uma vez adquirido, o material é seu e você pode realizar o download ou acessar os materiais quantas vezes precisar, sem limite de tempo."
        },
        {
          question: "Política de reembolso",
          answer: "Garantimos o seu direito de reembolso integral em até 7 dias após a compra, conforme o Código de Defesa do Consumidor, caso o material não atenda às suas expectativas."
        }
      ];
      for (const f of initialFaqs) {
        await db.run("INSERT INTO faqs (question, answer) VALUES (?, ?)", [f.question, f.answer]);
      }
      console.log("FAQ inicial inserida no banco SQLite.");
    }

    // Seed Products
    const productsCount = await db.get("SELECT COUNT(*) as count FROM products");
    if (productsCount.count === 0) {
      for (const p of INITIAL_PRODUCTS) {
        await db.run(`
          INSERT INTO products (id, title, description, longDescription, originalPrice, promoPrice, category, badge, imageUrl, imageOrientation, buttonText, buttonLink, iconName)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          p.id, p.title, p.description, p.longDescription || null, p.originalPrice || null, 
          p.promoPrice, p.category, p.badge || null, p.imageUrl, p.imageOrientation || "square", 
          p.buttonText, p.buttonLink, p.iconName || null
        ]);
      }
      console.log("Produtos iniciais inseridos no banco.");
    }

  } catch (err: any) {
    console.error("==========================================================================");
    console.error("AVISO: Falha ao inicializar o banco de dados (MySQL ou SQLite).");
    console.error(`Erro: ${err.message}`);
    console.error("O servidor continuará rodando no modo FALLBACK (em memória).");
    console.error("As alterações não serão salvas após reiniciar o servidor.");
    console.error("==========================================================================");
    useFallback = true;
  }
}

// REST API Endpoints

// Authentication
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
  }

  try {
    let passwordHash = "";
    if (useFallback) {
      const user = fallbackDb.users.find(u => u.email === email);
      if (user) passwordHash = user.password_hash;
    } else {
      const row = await db.get("SELECT password_hash FROM users WHERE email = ?", [email]);
      if (row) {
        passwordHash = row.password_hash;
      }
    }

    if (!passwordHash || !verifyPassword(password, passwordHash)) {
      return res.status(401).json({ error: "E-mail ou senha inválidos." });
    }

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1d" });
    
    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: "lax"
    });

    return res.json({ success: true, user: { email } });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ success: true });
});

app.post("/api/auth/change-credentials", authenticateToken, async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  if (!email || !currentPassword) {
    return res.status(400).json({ error: "E-mail e senha atual são obrigatórios." });
  }

  const currentEmail = (req as any).user.email;

  try {
    let currentUser: any = null;
    if (useFallback) {
      currentUser = fallbackDb.users.find(u => u.email === currentEmail);
    } else {
      currentUser = await db.get("SELECT * FROM users WHERE email = ?", [currentEmail]);
    }

    if (!currentUser || !verifyPassword(currentPassword, currentUser.password_hash)) {
      return res.status(401).json({ error: "Senha atual incorreta." });
    }

    let updatedHash = currentUser.password_hash;
    if (newPassword && newPassword.trim()) {
      updatedHash = hashPassword(newPassword);
    }

    if (useFallback) {
      currentUser.email = email;
      currentUser.password_hash = updatedHash;
    } else {
      await db.run("UPDATE users SET email = ?, password_hash = ? WHERE email = ?", [email, updatedHash, currentEmail]);
    }

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax"
    });

    return res.json({ success: true, user: { email } });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/auth/verify", (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ authenticated: false });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET) as { email: string };
    return res.json({ authenticated: true, user: { email: verified.email } });
  } catch (err) {
    return res.json({ authenticated: false });
  }
});

// Products
app.get("/api/products", async (req, res) => {
  try {
    if (useFallback) {
      return res.json(fallbackDb.products);
    }
    const rows = await db.all("SELECT * FROM products");
    return res.json(rows);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/products", authenticateToken, async (req, res) => {
  const p = req.body;
  if (!p.id || !p.title || !p.description || !p.promoPrice || !p.category || !p.imageUrl) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes." });
  }

  try {
    if (useFallback) {
      fallbackDb.products.push(p);
      return res.json({ success: true, product: p });
    }
    await db.run(`
      INSERT INTO products (id, title, description, longDescription, originalPrice, promoPrice, category, badge, imageUrl, imageOrientation, buttonText, buttonLink, iconName)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      p.id, p.title, p.description, p.longDescription || null, p.originalPrice || null, 
      p.promoPrice, p.category, p.badge || null, p.imageUrl, p.imageOrientation || "square", 
      p.buttonText, p.buttonLink, p.iconName || null
    ]);
    return res.json({ success: true, product: p });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.put("/api/products/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const p = req.body;

  try {
    if (useFallback) {
      const idx = fallbackDb.products.findIndex(prod => prod.id === id);
      if (idx !== -1) {
        fallbackDb.products[idx] = { ...fallbackDb.products[idx], ...p };
        return res.json({ success: true, product: fallbackDb.products[idx] });
      }
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    await db.run(`
      UPDATE products 
      SET title = ?, description = ?, longDescription = ?, originalPrice = ?, promoPrice = ?, 
          category = ?, badge = ?, imageUrl = ?, imageOrientation = ?, buttonText = ?, buttonLink = ?, iconName = ?
      WHERE id = ?
    `, [
      p.title, p.description, p.longDescription || null, p.originalPrice || null, 
      p.promoPrice, p.category, p.badge || null, p.imageUrl, p.imageOrientation || "square", 
      p.buttonText, p.buttonLink, p.iconName || null, id
    ]);
    return res.json({ success: true, product: p });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/products/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    if (useFallback) {
      fallbackDb.products = fallbackDb.products.filter(prod => prod.id !== id);
      return res.json({ success: true });
    }
    await db.run("DELETE FROM products WHERE id = ?", [id]);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/products/reset", authenticateToken, async (req, res) => {
  try {
    if (useFallback) {
      fallbackDb.products = [...INITIAL_PRODUCTS];
      return res.json({ success: true });
    }
    await db.run("DELETE FROM products");
    for (const p of INITIAL_PRODUCTS) {
      await db.run(`
        INSERT INTO products (id, title, description, longDescription, originalPrice, promoPrice, category, badge, imageUrl, imageOrientation, buttonText, buttonLink, iconName)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        p.id, p.title, p.description, p.longDescription || null, p.originalPrice || null, 
        p.promoPrice, p.category, p.badge || null, p.imageUrl, p.imageOrientation || "square", 
        p.buttonText, p.buttonLink, p.iconName || null
      ]);
    }
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Categories
app.get("/api/categories", async (req, res) => {
  try {
    if (useFallback) {
      return res.json(fallbackDb.categories);
    }
    const rows = await db.all("SELECT name FROM categories");
    return res.json(rows.map((r: any) => r.name));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/categories", authenticateToken, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Nome da categoria é obrigatório." });
  }

  try {
    if (useFallback) {
      if (!fallbackDb.categories.includes(name)) {
        fallbackDb.categories.push(name);
      }
      return res.json({ success: true });
    }
    await db.run("INSERT OR IGNORE INTO categories (name) VALUES (?)", [name]);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/categories/:name", authenticateToken, async (req, res) => {
  const { name } = req.params;

  try {
    if (useFallback) {
      fallbackDb.categories = fallbackDb.categories.filter(c => c !== name);
      return res.json({ success: true });
    }
    await db.run("DELETE FROM categories WHERE name = ?", [name]);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Settings
app.get("/api/settings", async (req, res) => {
  try {
    if (useFallback) {
      return res.json(fallbackDb.siteSettings);
    }
    const row = await db.get("SELECT * FROM site_settings WHERE id = 1");
    if (row) {
      return res.json(row);
    }
    return res.json({});
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/settings", authenticateToken, async (req, res) => {
  const s = req.body;

  try {
    if (useFallback) {
      fallbackDb.siteSettings = { ...fallbackDb.siteSettings, ...s };
      return res.json({ success: true, settings: fallbackDb.siteSettings });
    }
    
    await db.run(`
      UPDATE site_settings 
      SET heroBannerUrl = ?, heroBannerType = ?, logoUrl = ?, headerTitle = ?, 
          adminTitle = ?, adminSubtitle = ?, footerText = ?, globalWhatsapp = ?,
          siteName = ?, heroTitle = ?, heroSubtitle = ?, heroBadge = ?,
          seoTitle = ?, seoDescription = ?, faviconUrl = ?,
          aboutTitle = ?, aboutText = ?, aboutImageUrl = ?, catalogSubtitle = ?,
          approvalsTitle = ?, approvalsSubtitle = ?, primaryColor = ?, approvalsBadge = ?,
          faqTitle = ?, faqSubtitle = ?, heroImageUrl = ?, heroButtonText = ?
      WHERE id = 1
    `, [
      s.heroBannerUrl || null, s.heroBannerType || 'image', s.logoUrl || null, s.headerTitle || null,
      s.adminTitle || null, s.adminSubtitle || null, s.footerText || null, s.globalWhatsapp || null,
      s.siteName || null, s.heroTitle || null, s.heroSubtitle || null, s.heroBadge || null,
      s.seoTitle || null, s.seoDescription || null, s.faviconUrl || null,
      s.aboutTitle || null, s.aboutText || null, s.aboutImageUrl || null, s.catalogSubtitle || null,
      s.approvalsTitle || null, s.approvalsSubtitle || null, s.primaryColor || null, s.approvalsBadge || null,
      s.faqTitle || null, s.faqSubtitle || null, s.heroImageUrl || null, s.heroButtonText || null
    ]);
    
    return res.json({ success: true, settings: s });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Approvals API
app.get("/api/approvals", async (req, res) => {
  try {
    if (useFallback) {
      return res.json(fallbackDb.approvals);
    }
    const rows = await db.all("SELECT * FROM approvals ORDER BY id DESC");
    return res.json(rows);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/approvals", authenticateToken, async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ error: "URL da imagem é obrigatória." });
  }
  try {
    if (useFallback) {
      const newApp = { id: Date.now(), imageUrl };
      fallbackDb.approvals.unshift(newApp);
      return res.json({ success: true, approval: newApp });
    }
    const result = await db.run("INSERT INTO approvals (imageUrl) VALUES (?)", [imageUrl]);
    return res.json({ success: true, approval: { id: result.lastID, imageUrl } });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/approvals/:id", authenticateToken, async (req, res) => {
  const id = req.params.id;
  try {
    if (useFallback) {
      fallbackDb.approvals = fallbackDb.approvals.filter(a => String(a.id) !== id);
      return res.json({ success: true });
    }
    await db.run("DELETE FROM approvals WHERE id = ?", [id]);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// FAQs API
app.get("/api/faqs", async (req, res) => {
  try {
    if (useFallback) {
      return res.json(fallbackDb.faqs);
    }
    const rows = await db.all("SELECT * FROM faqs ORDER BY id ASC");
    return res.json(rows);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/faqs", authenticateToken, async (req, res) => {
  const { question, answer } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ error: "Pergunta e resposta são obrigatórias." });
  }
  try {
    if (useFallback) {
      const newFaq = { id: Date.now(), question, answer };
      fallbackDb.faqs.push(newFaq);
      return res.json({ success: true, faq: newFaq });
    }
    const result = await db.run("INSERT INTO faqs (question, answer) VALUES (?, ?)", [question, answer]);
    return res.json({ success: true, faq: { id: result.lastID, question, answer } });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/faqs/:id", authenticateToken, async (req, res) => {
  const id = req.params.id;
  try {
    if (useFallback) {
      fallbackDb.faqs = fallbackDb.faqs.filter(f => String(f.id) !== id);
      return res.json({ success: true });
    }
    await db.run("DELETE FROM faqs WHERE id = ?", [id]);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});app.put("/api/faqs/:id", authenticateToken, async (req, res) => {
  const id = req.params.id;
  const { question, answer } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ error: "Pergunta e resposta são obrigatórias." });
  }
  try {
    if (useFallback) {
      fallbackDb.faqs = fallbackDb.faqs.map(f => String(f.id) === id ? { ...f, question, answer } : f);
      return res.json({ success: true, faq: { id: Number(id), question, answer } });
    }
    await db.run("UPDATE faqs SET question = ?, answer = ? WHERE id = ?", [question, answer, id]);
    return res.json({ success: true, faq: { id: Number(id), question, answer } });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});


app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Start server
app.listen(PORT, async () => {
  await initDb();
  console.log(`Servidor rodando na porta ${PORT}`);
});
