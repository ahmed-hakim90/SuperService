import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc, and, like, sql } from "drizzle-orm";
import * as schema from "@shared/schema";
import type { 
  User, InsertUser, 
  ServiceCenter, InsertServiceCenter,
  Customer, InsertCustomer,
  Category, InsertCategory,
  Product, InsertProduct,
  ServiceRequest, InsertServiceRequest,
  Warehouse, InsertWarehouse,
  SparePart, InsertSparePart,
  Inventory, InsertInventory,
  PartsTransfer, InsertPartsTransfer,
  ActivityLog, InsertActivityLog
} from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client, { schema });

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // Service Centers
  getAllServiceCenters(): Promise<ServiceCenter[]>;
  getServiceCenter(id: string): Promise<ServiceCenter | undefined>;
  createServiceCenter(center: InsertServiceCenter): Promise<ServiceCenter>;
  updateServiceCenter(id: string, center: Partial<InsertServiceCenter>): Promise<ServiceCenter>;
  deleteServiceCenter(id: string): Promise<void>;

  // Customers
  getAllCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: string): Promise<void>;

  // Categories
  getAllCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  // Products
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  // Service Requests
  getAllServiceRequests(): Promise<ServiceRequest[]>;
  getServiceRequest(id: string): Promise<ServiceRequest | undefined>;
  createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest>;
  updateServiceRequest(id: string, request: Partial<InsertServiceRequest>): Promise<ServiceRequest>;
  deleteServiceRequest(id: string): Promise<void>;

  // Dashboard Stats
  getDashboardStats(): Promise<any>;
  getRecentServiceRequests(): Promise<any[]>;
  getRecentActivities(): Promise<ActivityLog[]>;

  // Activity Logs
  logActivity(activity: InsertActivityLog): Promise<ActivityLog>;
}

export class PostgresStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(schema.users).orderBy(desc(schema.users.createdAt));
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    const result = await db.update(schema.users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(schema.users).where(eq(schema.users.id, id));
  }

  // Service Centers
  async getAllServiceCenters(): Promise<ServiceCenter[]> {
    return await db.select().from(schema.serviceCenters).orderBy(desc(schema.serviceCenters.createdAt));
  }

  async getServiceCenter(id: string): Promise<ServiceCenter | undefined> {
    const result = await db.select().from(schema.serviceCenters).where(eq(schema.serviceCenters.id, id)).limit(1);
    return result[0];
  }

  async createServiceCenter(center: InsertServiceCenter): Promise<ServiceCenter> {
    const result = await db.insert(schema.serviceCenters).values(center).returning();
    return result[0];
  }

  async updateServiceCenter(id: string, center: Partial<InsertServiceCenter>): Promise<ServiceCenter> {
    const result = await db.update(schema.serviceCenters)
      .set({ ...center, updatedAt: new Date() })
      .where(eq(schema.serviceCenters.id, id))
      .returning();
    return result[0];
  }

  async deleteServiceCenter(id: string): Promise<void> {
    await db.delete(schema.serviceCenters).where(eq(schema.serviceCenters.id, id));
  }

  // Customers
  async getAllCustomers(): Promise<Customer[]> {
    return await db.select().from(schema.customers).orderBy(desc(schema.customers.createdAt));
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const result = await db.select().from(schema.customers).where(eq(schema.customers.id, id)).limit(1);
    return result[0];
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const result = await db.insert(schema.customers).values(customer).returning();
    return result[0];
  }

  async updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer> {
    const result = await db.update(schema.customers)
      .set({ ...customer, updatedAt: new Date() })
      .where(eq(schema.customers.id, id))
      .returning();
    return result[0];
  }

  async deleteCustomer(id: string): Promise<void> {
    await db.delete(schema.customers).where(eq(schema.customers.id, id));
  }

  // Categories
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(schema.categories).orderBy(desc(schema.categories.createdAt));
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const result = await db.select().from(schema.categories).where(eq(schema.categories.id, id)).limit(1);
    return result[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(schema.categories).values(category).returning();
    return result[0];
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category> {
    const result = await db.update(schema.categories)
      .set(category)
      .where(eq(schema.categories.id, id))
      .returning();
    return result[0];
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(schema.categories).where(eq(schema.categories.id, id));
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(schema.products).orderBy(desc(schema.products.createdAt));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(schema.products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const result = await db.update(schema.products)
      .set(product)
      .where(eq(schema.products.id, id))
      .returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(schema.products).where(eq(schema.products.id, id));
  }

  // Service Requests
  async getAllServiceRequests(): Promise<ServiceRequest[]> {
    return await db.select().from(schema.serviceRequests).orderBy(desc(schema.serviceRequests.createdAt));
  }

  async getServiceRequest(id: string): Promise<ServiceRequest | undefined> {
    const result = await db.select().from(schema.serviceRequests).where(eq(schema.serviceRequests.id, id)).limit(1);
    return result[0];
  }

  async createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest> {
    const result = await db.insert(schema.serviceRequests).values(request).returning();
    return result[0];
  }

  async updateServiceRequest(id: string, request: Partial<InsertServiceRequest>): Promise<ServiceRequest> {
    const result = await db.update(schema.serviceRequests)
      .set({ ...request, updatedAt: new Date() })
      .where(eq(schema.serviceRequests.id, id))
      .returning();
    return result[0];
  }

  async deleteServiceRequest(id: string): Promise<void> {
    await db.delete(schema.serviceRequests).where(eq(schema.serviceRequests.id, id));
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<any> {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.users);
    const [requestCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.serviceRequests);
    const [centerCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.serviceCenters);
    
    return {
      totalUsers: userCount.count,
      serviceRequests: requestCount.count,
      serviceCenters: centerCount.count,
      revenue: 125490 // This would be calculated from actual revenue data
    };
  }

  async getRecentServiceRequests(): Promise<any[]> {
    const requests = await db.select()
      .from(schema.serviceRequests)
      .orderBy(desc(schema.serviceRequests.createdAt))
      .limit(5);
    
    return requests.map(request => ({
      ...request,
      customerName: "عميل",
      deviceName: request.deviceName,
      status: request.status
    }));
  }

  async getRecentActivities(): Promise<ActivityLog[]> {
    return await db.select()
      .from(schema.activityLogs)
      .orderBy(desc(schema.activityLogs.createdAt))
      .limit(10);
  }

  // Activity Logs
  async logActivity(activity: InsertActivityLog): Promise<ActivityLog> {
    const result = await db.insert(schema.activityLogs).values(activity).returning();
    return result[0];
  }
}

export const storage = new PostgresStorage();
