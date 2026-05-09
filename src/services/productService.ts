/**
 * Product Service
 * Handles all product-related data operations using backend API
 */

import { Product } from '../types';
import { productAPI, Product as BackendProduct } from './backendAPI';

class ProductService {
  /**
   * Convert backend product to app product format
   */
  private convertToAppProduct(backendProduct: BackendProduct): Product {
    return {
      id: backendProduct.id,
      name: backendProduct.name,
      sku: backendProduct.sku || '',
      category: backendProduct.category || '',
      description: '',
      price: backendProduct.price,
      unitPrice: backendProduct.price, // Map price to unitPrice for invoice compatibility
      cost: backendProduct.cost || 0,
      stock: backendProduct.stock,
      unit: backendProduct.unit,
      status: backendProduct.status,
      isActive: backendProduct.status === 'Active',
      createdAt: backendProduct.createdAt,
      updatedAt: backendProduct.updatedAt,
      companyId: '',
      taxRate: 16 // Default VAT rate
    };
  }

  /**
   * Get all products from backend
   */
  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await productAPI.getAll();
      return response.data.map(p => this.convertToAppProduct(p));
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return [];
    }
  }

  /**
   * Get products for a specific company (handled by backend automatically via token)
   */
  async getCompanyProducts(companyId: string): Promise<Product[]> {
    return this.getAllProducts();
  }

  /**
   * Get product by ID
   */
  async getProductById(productId: string): Promise<Product | undefined> {
    try {
      const response = await productAPI.getById(productId);
      return this.convertToAppProduct(response.data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      return undefined;
    }
  }

  /**
   * Create a new product
   */
  async createProduct(product: Product): Promise<Product> {
    try {
      const response = await productAPI.create({
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        unit: product.unit
      });
      return this.convertToAppProduct(response.data);
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  }

  /**
   * Update a product
   */
  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product | null> {
    try {
      const response = await productAPI.update(productId, {
        name: updates.name,
        sku: updates.sku,
        category: updates.category,
        price: updates.price,
        cost: updates.cost,
        stock: updates.stock,
        unit: updates.unit
      });
      return this.convertToAppProduct(response.data);
    } catch (error) {
      console.error('Failed to update product:', error);
      return null;
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(productId: string): Promise<boolean> {
    try {
      await productAPI.delete(productId);
      return true;
    } catch (error) {
      console.error('Failed to delete product:', error);
      return false;
    }
  }

  /**
   * Save company products - Not needed with backend API
   */
  saveCompanyProducts(companyId: string, companyProducts: Product[]): void {
    console.warn('saveCompanyProducts is deprecated with backend API');
  }

  /**
   * Find product by name
   */
  async findProductByName(companyId: string, name: string): Promise<Product | undefined> {
    const products = await this.getAllProducts();
    return products.find(product =>
      product.name.toLowerCase() === name.toLowerCase()
    );
  }

  /**
   * Get active products
   */
  async getActiveProducts(companyId: string): Promise<Product[]> {
    const products = await this.getAllProducts();
    return products.filter(product => product.isActive);
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(companyId: string, category: string): Promise<Product[]> {
    const products = await this.getAllProducts();
    return products.filter(product => product.category === category);
  }

  /**
   * Toggle product active status
   */
  async toggleProductStatus(productId: string): Promise<Product | null> {
    const product = await this.getProductById(productId);
    if (!product) {
      return null;
    }

    return this.updateProduct(productId, {
      isActive: !product.isActive
    });
  }
}

export const productService = new ProductService();
