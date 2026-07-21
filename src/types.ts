export interface Product {
  id: string;
  title: string;
  description: string;
  longDescription?: string; // Additional details for the full page
  originalPrice?: string; // Pre-promo price (e.g., R$ 199,00)
  promoPrice: string;     // Actual active price (e.g., R$ 99,00)
  category: string;        // Category (e.g., "Informática", "Design", "idiomas")
  badge?: string;
  imageUrl: string;
  imageOrientation?: "horizontal" | "vertical" | "square"; // Image proportion
  buttonText: string;
  buttonLink: string;
  iconName?: string;
  priceLabel?: string;
}

export type ScreenState = "visitor" | "login" | "admin";

export interface SiteSettings {
  heroBannerUrl?: string;
  heroBannerType?: "image" | "video";
  logoUrl?: string;
  headerTitle?: string;
  adminTitle?: string;
  adminSubtitle?: string;
  footerText?: string;
  globalWhatsapp?: string;
  siteName?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroBadge?: string;
  seoTitle?: string;
  seoDescription?: string;
  faviconUrl?: string;
  aboutTitle?: string;
  aboutText?: string;
  aboutImageUrl?: string;
  catalogSubtitle?: string;
  approvalsTitle?: string;
  approvalsSubtitle?: string;
  primaryColor?: string;
  approvalsBadge?: string;
  faqTitle?: string;
  faqSubtitle?: string;
  heroImageUrl?: string;
  heroButtonText?: string;
  bgColor?: string;
  cardBgColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  titleFontSize?: string;
  sectionTitleFontSize?: string;
  buttonStyle?: string;
  priceLabel?: string;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
}