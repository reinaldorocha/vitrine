import { Product, SiteSettings } from "../types";

// Helper to process response
async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Products API
  async getProducts(): Promise<Product[]> {
    const response = await fetch("/api/products");
    return handleResponse(response);
  },

  async addProduct(product: Omit<Product, "id"> & { id: string }): Promise<{ success: boolean; product: Product }> {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    return handleResponse(response);
  },

  async updateProduct(product: Product): Promise<{ success: boolean; product: Product }> {
    const response = await fetch(`/api/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    return handleResponse(response);
  },

  async deleteProduct(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },

  async resetProducts(): Promise<{ success: boolean }> {
    const response = await fetch("/api/products/reset", {
      method: "POST",
    });
    return handleResponse(response);
  },

  // Categories API
  async getCategories(): Promise<string[]> {
    const response = await fetch("/api/categories");
    return handleResponse(response);
  },

  async addCategory(name: string): Promise<{ success: boolean }> {
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    return handleResponse(response);
  },

  async deleteCategory(name: string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/categories/${encodeURIComponent(name)}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },

  // Settings API
  async getSettings(): Promise<SiteSettings> {
    const response = await fetch("/api/settings");
    return handleResponse(response);
  },

  async updateSettings(settings: SiteSettings): Promise<{ success: boolean; settings: SiteSettings }> {
    const response = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    return handleResponse(response);
  },

  // Auth API
  async login(email: string, password: string): Promise<{ success: boolean; user: { email: string } }> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  async logout(): Promise<{ success: boolean }> {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });
    return handleResponse(response);
  },

  async verifySession(): Promise<{ authenticated: boolean; user?: { email: string } }> {
    const response = await fetch("/api/auth/verify");
    return handleResponse(response);
  },

  // Approvals API
  async getApprovals(): Promise<{ id: number; imageUrl: string }[]> {
    const response = await fetch("/api/approvals");
    return handleResponse(response);
  },

  async addApproval(imageUrl: string): Promise<{ success: boolean; approval: { id: number; imageUrl: string } }> {
    const response = await fetch("/api/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl }),
    });
    return handleResponse(response);
  },

  async deleteApproval(id: number | string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/approvals/${id}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },

  // FAQs API
  async getFaqs(): Promise<{ id: number; question: string; answer: string }[]> {
    const response = await fetch("/api/faqs");
    return handleResponse(response);
  },

  async addFaq(question: string, answer: string): Promise<{ success: boolean; faq: { id: number; question: string; answer: string } }> {
    const response = await fetch("/api/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer }),
    });
    return handleResponse(response);
  },

  async deleteFaq(id: number | string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/faqs/${id}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },

  async updateFaq(id: number | string, question: string, answer: string): Promise<{ success: boolean; faq: { id: number; question: string; answer: string } }> {
    const response = await fetch(`/api/faqs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer }),
    });
    return handleResponse(response);
  },

  async changeCredentials(email: string, currentPassword: string, newPassword?: string): Promise<{ success: boolean; user: { email: string }; error?: string }> {
    const response = await fetch("/api/auth/change-credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, currentPassword, newPassword }),
    });
    return handleResponse(response);
  }
};
