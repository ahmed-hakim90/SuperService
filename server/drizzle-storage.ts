import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from './db';
import { 
  users, 
  serviceCenters, 
  customers, 
  categories, 
  products, 
  serviceRequests, 
  serviceRequestFollowUps,
  warehouses,
  spareParts,
  inventory,
  productInventory,
  partsTransfers,
  activityLogs
} from '../shared/schema';
import type { 
  User, InsertUser,
  ServiceCenter, InsertServiceCenter,
  Customer, InsertCustomer,
  Category, InsertCategory,
  Product, InsertProduct,
  ServiceRequest, InsertServiceRequest,
  ServiceRequestFollowUp, InsertServiceRequestFollowUp,
  Warehouse, InsertWarehouse,
  SparePart, InsertSparePart,
  Inventory, InsertInventory,
  ProductInventory, InsertProductInventory,
  PartsTransfer, InsertPartsTransfer,
  ActivityLog, InsertActivityLog
} from '../shared/schema';
import type { IStorage } from './storage';

export class DrizzleStorage implements IStorage {
  
  // Users
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async createUser(userData: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return result[0];
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const result = await db.update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Service Centers
  async getAllServiceCenters(): Promise<ServiceCenter[]> {
    return await db.select().from(serviceCenters);
  }

  async getServiceCenter(id: string): Promise<ServiceCenter | undefined> {
    const result = await db.select().from(serviceCenters).where(eq(serviceCenters.id, id));
    return result[0];
  }

  async createServiceCenter(centerData: InsertServiceCenter): Promise<ServiceCenter> {
    const result = await db.insert(serviceCenters).values({
      ...centerData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return result[0];
  }

  async updateServiceCenter(id: string, centerData: Partial<InsertServiceCenter>): Promise<ServiceCenter> {
    const result = await db.update(serviceCenters)
      .set({ ...centerData, updatedAt: new Date() })
      .where(eq(serviceCenters.id, id))
      .returning();
    return result[0];
  }

  async deleteServiceCenter(id: string): Promise<void> {
    await db.delete(serviceCenters).where(eq(serviceCenters.id, id));
  }

  // Customers
  async getAllCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.id, id));
    return result[0];
  }

  async createCustomer(customerData: InsertCustomer): Promise<Customer> {
    const result = await db.insert(customers).values({
      ...customerData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return result[0];
  }

  async updateCustomer(id: string, customerData: Partial<InsertCustomer>): Promise<Customer> {
    const result = await db.update(customers)
      .set({ ...customerData, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return result[0];
  }

  async deleteCustomer(id: string): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  // Categories
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id));
    return result[0];
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values({
      ...categoryData,
      createdAt: new Date()
    }).returning();
    return result[0];
  }

  async updateCategory(id: string, categoryData: Partial<InsertCategory>): Promise<Category> {
    const result = await db.update(categories)
      .set(categoryData)
      .where(eq(categories.id, id))
      .returning();
    return result[0];
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values({
      ...productData,
      createdAt: new Date()
    }).returning();
    return result[0];
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<Product> {
    const result = await db.update(products)
      .set(productData)
      .where(eq(products.id, id))
      .returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Service Requests
  async getAllServiceRequests(): Promise<ServiceRequest[]> {
    return await db.select().from(serviceRequests).orderBy(desc(serviceRequests.createdAt));
  }

  async getServiceRequest(id: string): Promise<ServiceRequest | undefined> {
    const result = await db.select().from(serviceRequests).where(eq(serviceRequests.id, id));
    return result[0];
  }

  async createServiceRequest(requestData: InsertServiceRequest): Promise<ServiceRequest> {
    const result = await db.insert(serviceRequests).values({
      ...requestData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return result[0];
  }

  async updateServiceRequest(id: string, requestData: Partial<InsertServiceRequest>): Promise<ServiceRequest> {
    const result = await db.update(serviceRequests)
      .set({ ...requestData, updatedAt: new Date() })
      .where(eq(serviceRequests.id, id))
      .returning();
    return result[0];
  }

  async deleteServiceRequest(id: string): Promise<void> {
    await db.delete(serviceRequests).where(eq(serviceRequests.id, id));
  }

  // Service Request Follow-ups
  async getServiceRequestFollowUps(serviceRequestId: string): Promise<ServiceRequestFollowUp[]> {
    return await db.select().from(serviceRequestFollowUps)
      .where(eq(serviceRequestFollowUps.serviceRequestId, serviceRequestId))
      .orderBy(desc(serviceRequestFollowUps.createdAt));
  }

  async createServiceRequestFollowUp(followUpData: InsertServiceRequestFollowUp): Promise<ServiceRequestFollowUp> {
    const result = await db.insert(serviceRequestFollowUps).values({
      ...followUpData,
      createdAt: new Date()
    }).returning();
    return result[0];
  }

  // Warehouses
  async getAllWarehouses(): Promise<Warehouse[]> {
    return await db.select().from(warehouses);
  }

  async getWarehouse(id: string): Promise<Warehouse | undefined> {
    const result = await db.select().from(warehouses).where(eq(warehouses.id, id));
    return result[0];
  }

  async createWarehouse(warehouseData: InsertWarehouse): Promise<Warehouse> {
    const result = await db.insert(warehouses).values({
      ...warehouseData,
      createdAt: new Date()
    }).returning();
    return result[0];
  }

  async updateWarehouse(id: string, warehouseData: Partial<InsertWarehouse>): Promise<Warehouse> {
    const result = await db.update(warehouses)
      .set(warehouseData)
      .where(eq(warehouses.id, id))
      .returning();
    return result[0];
  }

  async deleteWarehouse(id: string): Promise<void> {
    await db.delete(warehouses).where(eq(warehouses.id, id));
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<any> {
    const [userCount] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(users);
    const [requestCount] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(serviceRequests);
    const [centerCount] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(serviceCenters);
    
    return {
      totalUsers: userCount.count,
      serviceRequests: requestCount.count,
      serviceCenters: centerCount.count,
      pendingRequests: 0,
      inProgressRequests: 0,
      completedRequests: 0
    };
  }

  async getRecentServiceRequests(): Promise<any[]> {
    return await db.select().from(serviceRequests)
      .orderBy(desc(serviceRequests.createdAt))
      .limit(10);
  }

  async getRecentActivities(): Promise<ActivityLog[]> {
    return await db.select().from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(20);
  }

  // Activity Logs
  async logActivity(activityData: InsertActivityLog): Promise<ActivityLog> {
    const result = await db.insert(activityLogs).values({
      ...activityData,
      createdAt: new Date()
    }).returning();
    return result[0];
  }

  // Product Inventory
  async getProductInventory(warehouseId: string): Promise<ProductInventory[]> {
    return await db.select().from(productInventory)
      .where(eq(productInventory.warehouseId, warehouseId));
  }

  async getProductInventoryByProduct(productId: string): Promise<ProductInventory[]> {
    return await db.select().from(productInventory)
      .where(eq(productInventory.productId, productId));
  }

  async getProductInventoryItem(warehouseId: string, productId: string): Promise<ProductInventory | undefined> {
    const result = await db.select().from(productInventory)
      .where(and(
        eq(productInventory.warehouseId, warehouseId),
        eq(productInventory.productId, productId)
      ));
    return result[0];
  }

  async createProductInventory(inventoryData: InsertProductInventory): Promise<ProductInventory> {
    const result = await db.insert(productInventory).values({
      ...inventoryData,
      updatedAt: new Date()
    }).returning();
    return result[0];
  }

  async updateProductInventory(id: string, inventoryData: Partial<InsertProductInventory>): Promise<ProductInventory> {
    const result = await db.update(productInventory)
      .set({ ...inventoryData, updatedAt: new Date() })
      .where(eq(productInventory.id, id))
      .returning();
    return result[0];
  }

  async deleteProductInventory(id: string): Promise<void> {
    await db.delete(productInventory).where(eq(productInventory.id, id));
  }
}

export const storage = new DrizzleStorage();