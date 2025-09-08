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
  PartsTransfer, InsertPartsTransfer,
  ActivityLog, InsertActivityLog
} from "@shared/schema";

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

  // Service Request Follow-ups
  getServiceRequestFollowUps(serviceRequestId: string): Promise<ServiceRequestFollowUp[]>;
  createServiceRequestFollowUp(followUp: InsertServiceRequestFollowUp): Promise<ServiceRequestFollowUp>;

  // Warehouses
  getAllWarehouses(): Promise<Warehouse[]>;
  getWarehouse(id: string): Promise<Warehouse | undefined>;
  createWarehouse(warehouse: InsertWarehouse): Promise<Warehouse>;
  updateWarehouse(id: string, warehouse: Partial<InsertWarehouse>): Promise<Warehouse>;
  deleteWarehouse(id: string): Promise<void>;

  // Dashboard Stats
  getDashboardStats(): Promise<any>;
  getRecentServiceRequests(): Promise<any[]>;
  getRecentActivities(): Promise<ActivityLog[]>;

  // Activity Logs
  logActivity(activity: InsertActivityLog): Promise<ActivityLog>;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private serviceCenters: Map<string, ServiceCenter> = new Map();
  private customers: Map<string, Customer> = new Map();
  private categories: Map<string, Category> = new Map();
  private products: Map<string, Product> = new Map();
  private serviceRequests: Map<string, ServiceRequest> = new Map();
  private serviceRequestFollowUps: Map<string, ServiceRequestFollowUp> = new Map();
  private warehouses: Map<string, Warehouse> = new Map();
  private activityLogs: Map<string, ActivityLog> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Sample Users
    const sampleUsers: User[] = [
      {
        id: "user-1",
        email: "admin@sokany.com",
        password: "hashed_password",
        fullName: "أحمد محمد",
        phone: "+966501234567",
        address: "الرياض، المملكة العربية السعودية",
        role: "admin",
        status: "active",
        centerId: null,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15")
      },
      {
        id: "user-2",
        email: "manager@sokany.com",
        password: "hashed_password",
        fullName: "سارة أحمد",
        phone: "+966502345678",
        address: "جدة، المملكة العربية السعودية",
        role: "manager",
        status: "active",
        centerId: "center-1",
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-02-01")
      },
      {
        id: "user-3",
        email: "tech@sokany.com",
        password: "hashed_password",
        fullName: "محمد علي",
        phone: "+966503456789",
        address: "الدمام، المملكة العربية السعودية",
        role: "technician",
        status: "active",
        centerId: "center-1",
        createdAt: new Date("2024-02-15"),
        updatedAt: new Date("2024-02-15")
      }
    ];

    // Sample Service Centers
    const sampleCenters: ServiceCenter[] = [
      {
        id: "center-1",
        name: "مركز الرياض الرئيسي",
        address: "شارع الملك فهد، الرياض 12345",
        phone: "+966114567890",
        email: "riyadh@sokany.com",
        managerId: "user-2",
        isActive: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01")
      },
      {
        id: "center-2",
        name: "مركز جدة",
        address: "طريق الملك عبدالعزيز، جدة 21441",
        phone: "+966122345678",
        email: "jeddah@sokany.com",
        managerId: null,
        isActive: true,
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-01-10")
      }
    ];

    // Sample Customers
    const sampleCustomers: Customer[] = [
      {
        id: "customer-1",
        fullName: "خالد السعيد",
        phone: "+966501111111",
        email: "khalid@gmail.com",
        address: "حي الملز، الرياض",
        centerId: "center-1",
        createdAt: new Date("2024-03-01"),
        updatedAt: new Date("2024-03-01")
      },
      {
        id: "customer-2",
        fullName: "فاطمة الزهراء",
        phone: "+966502222222",
        email: "fatima@hotmail.com",
        address: "حي الروضة، جدة",
        centerId: "center-2",
        createdAt: new Date("2024-03-05"),
        updatedAt: new Date("2024-03-05")
      }
    ];

    // Sample Categories
    const sampleCategories: Category[] = [
      {
        id: "cat-1",
        name: "أجهزة المنزل",
        description: "الأجهزة المنزلية الكهربائية",
        createdAt: new Date("2024-01-01")
      },
      {
        id: "cat-2",
        name: "أجهزة المطبخ",
        description: "أجهزة المطبخ الكهربائية",
        createdAt: new Date("2024-01-01")
      }
    ];

    // Sample Products
    const sampleProducts: Product[] = [
      {
        id: "prod-1",
        name: "غسالة أتوماتيك",
        model: "SW-8000",
        categoryId: "cat-1",
        description: "غسالة أتوماتيك 8 كيلو",
        createdAt: new Date("2024-01-01")
      },
      {
        id: "prod-2",
        name: "ثلاجة مزدوجة",
        model: "RF-500",
        categoryId: "cat-1",
        description: "ثلاجة مزدوجة الأبواب",
        createdAt: new Date("2024-01-01")
      }
    ];

    // Sample Warehouses
    const sampleWarehouses: Warehouse[] = [
      {
        id: "warehouse-1",
        name: "مخزن الرياض الرئيسي",
        location: "حي الملز، الرياض",
        managerId: "user-2",
        centerId: "center-1",
        createdAt: new Date("2024-01-20")
      },
      {
        id: "warehouse-2",
        name: "مخزن جدة الفرعي",
        location: "حي الروضة، جدة",
        managerId: null,
        centerId: "center-2",
        createdAt: new Date("2024-02-01")
      }
    ];

    // Sample Service Requests
    const sampleRequests: ServiceRequest[] = [
      {
        id: "req-1",
        requestNumber: "SR-2024-001",
        customerId: "customer-1",
        productId: "prod-1",
        deviceName: "غسالة أتوماتيك",
        model: "SW-8000",
        issue: "لا تعمل الغسالة عند الضغط على زر التشغيل",
        status: "pending",
        centerId: "center-1",
        technicianId: null,
        estimatedCost: 250,
        actualCost: null,
        notes: null,
        createdAt: new Date("2024-09-01"),
        updatedAt: new Date("2024-09-01"),
        completedAt: null
      },
      {
        id: "req-2",
        requestNumber: "SR-2024-002",
        customerId: "customer-2",
        productId: "prod-2",
        deviceName: "ثلاجة مزدوجة",
        model: "RF-500",
        issue: "الثلاجة لا تبرد بشكل جيد",
        status: "in_progress",
        centerId: "center-2",
        technicianId: null,
        estimatedCost: 400,
        actualCost: null,
        notes: "تم الكشف على الجهاز وتحديد المشكلة",
        createdAt: new Date("2024-08-28"),
        updatedAt: new Date("2024-09-02"),
        completedAt: null
      }
    ];

    // Sample Activity Logs
    const sampleActivities: ActivityLog[] = [
      {
        id: "activity-1",
        userId: "user-1",
        action: "create",
        entityType: "service_request",
        entityId: "req-1",
        description: "تم إنشاء طلب صيانة جديد للعميل خالد السعيد",
        createdAt: new Date("2024-09-01")
      },
      {
        id: "activity-2",
        userId: "user-2",
        action: "update",
        entityType: "service_request",
        entityId: "req-2",
        description: "تم تحديث حالة طلب الصيانة إلى قيد التقدم",
        createdAt: new Date("2024-09-02")
      }
    ];

    // Populate maps
    sampleUsers.forEach(user => this.users.set(user.id, user));
    sampleCenters.forEach(center => this.serviceCenters.set(center.id, center));
    sampleCustomers.forEach(customer => this.customers.set(customer.id, customer));
    sampleCategories.forEach(category => this.categories.set(category.id, category));
    sampleProducts.forEach(product => this.products.set(product.id, product));
    sampleWarehouses.forEach(warehouse => this.warehouses.set(warehouse.id, warehouse));
    sampleRequests.forEach(request => this.serviceRequests.set(request.id, request));
    sampleActivities.forEach(activity => this.activityLogs.set(activity.id, activity));
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user: User = {
      id: generateId(),
      ...userData,
      phone: userData.phone ?? null,
      address: userData.address ?? null,
      role: userData.role ?? "customer",
      status: userData.status ?? "pending",
      centerId: userData.centerId ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) throw new Error('User not found');
    
    const updatedUser: User = {
      ...existingUser,
      ...userData,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    this.users.delete(id);
  }

  // Service Centers
  async getAllServiceCenters(): Promise<ServiceCenter[]> {
    return Array.from(this.serviceCenters.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getServiceCenter(id: string): Promise<ServiceCenter | undefined> {
    return this.serviceCenters.get(id);
  }

  async createServiceCenter(centerData: InsertServiceCenter): Promise<ServiceCenter> {
    const center: ServiceCenter = {
      id: generateId(),
      ...centerData,
      phone: centerData.phone ?? null,
      email: centerData.email ?? null,
      managerId: centerData.managerId ?? null,
      isActive: centerData.isActive ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.serviceCenters.set(center.id, center);
    return center;
  }

  async updateServiceCenter(id: string, centerData: Partial<InsertServiceCenter>): Promise<ServiceCenter> {
    const existingCenter = this.serviceCenters.get(id);
    if (!existingCenter) throw new Error('Service center not found');
    
    const updatedCenter: ServiceCenter = {
      ...existingCenter,
      ...centerData,
      updatedAt: new Date()
    };
    this.serviceCenters.set(id, updatedCenter);
    return updatedCenter;
  }

  async deleteServiceCenter(id: string): Promise<void> {
    this.serviceCenters.delete(id);
  }

  // Customers
  async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(customerData: InsertCustomer): Promise<Customer> {
    const customer: Customer = {
      id: generateId(),
      ...customerData,
      email: customerData.email ?? null,
      address: customerData.address ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.customers.set(customer.id, customer);
    return customer;
  }

  async updateCustomer(id: string, customerData: Partial<InsertCustomer>): Promise<Customer> {
    const existingCustomer = this.customers.get(id);
    if (!existingCustomer) throw new Error('Customer not found');
    
    const updatedCustomer: Customer = {
      ...existingCustomer,
      ...customerData,
      updatedAt: new Date()
    };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async deleteCustomer(id: string): Promise<void> {
    this.customers.delete(id);
  }

  // Categories
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const category: Category = {
      id: generateId(),
      ...categoryData,
      description: categoryData.description ?? null,
      createdAt: new Date()
    };
    this.categories.set(category.id, category);
    return category;
  }

  async updateCategory(id: string, categoryData: Partial<InsertCategory>): Promise<Category> {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) throw new Error('Category not found');
    
    const updatedCategory: Category = {
      ...existingCategory,
      ...categoryData
    };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<void> {
    this.categories.delete(id);
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const product: Product = {
      id: generateId(),
      ...productData,
      model: productData.model ?? null,
      description: productData.description ?? null,
      createdAt: new Date()
    };
    this.products.set(product.id, product);
    return product;
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<Product> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) throw new Error('Product not found');
    
    const updatedProduct: Product = {
      ...existingProduct,
      ...productData
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    this.products.delete(id);
  }

  // Service Requests
  async getAllServiceRequests(): Promise<ServiceRequest[]> {
    return Array.from(this.serviceRequests.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getServiceRequest(id: string): Promise<ServiceRequest | undefined> {
    return this.serviceRequests.get(id);
  }

  async createServiceRequest(requestData: InsertServiceRequest): Promise<ServiceRequest> {
    const request: ServiceRequest = {
      id: generateId(),
      ...requestData,
      model: requestData.model ?? null,
      status: requestData.status ?? "pending",
      technicianId: requestData.technicianId ?? null,
      estimatedCost: requestData.estimatedCost ?? null,
      actualCost: requestData.actualCost ?? null,
      notes: requestData.notes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null
    };
    this.serviceRequests.set(request.id, request);
    return request;
  }

  async updateServiceRequest(id: string, requestData: Partial<InsertServiceRequest>): Promise<ServiceRequest> {
    const existingRequest = this.serviceRequests.get(id);
    if (!existingRequest) throw new Error('Service request not found');
    
    const updatedRequest: ServiceRequest = {
      ...existingRequest,
      ...requestData,
      updatedAt: new Date()
    };
    this.serviceRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async deleteServiceRequest(id: string): Promise<void> {
    this.serviceRequests.delete(id);
  }

  // Service Request Follow-ups
  async getServiceRequestFollowUps(serviceRequestId: string): Promise<ServiceRequestFollowUp[]> {
    return Array.from(this.serviceRequestFollowUps.values())
      .filter(followUp => followUp.serviceRequestId === serviceRequestId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createServiceRequestFollowUp(followUpData: InsertServiceRequestFollowUp): Promise<ServiceRequestFollowUp> {
    const followUp: ServiceRequestFollowUp = {
      id: generateId(),
      ...followUpData,
      createdAt: new Date()
    };
    this.serviceRequestFollowUps.set(followUp.id, followUp);
    return followUp;
  }

  // Warehouses CRUD
  async getAllWarehouses(): Promise<Warehouse[]> {
    return Array.from(this.warehouses.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getWarehouse(id: string): Promise<Warehouse | undefined> {
    return this.warehouses.get(id);
  }

  async createWarehouse(warehouseData: InsertWarehouse): Promise<Warehouse> {
    const warehouse: Warehouse = {
      id: generateId(),
      ...warehouseData,
      managerId: warehouseData.managerId ?? null,
      centerId: warehouseData.centerId ?? null,
      createdAt: new Date()
    };
    this.warehouses.set(warehouse.id, warehouse);
    return warehouse;
  }

  async updateWarehouse(id: string, warehouseData: Partial<InsertWarehouse>): Promise<Warehouse> {
    const existingWarehouse = this.warehouses.get(id);
    if (!existingWarehouse) throw new Error('Warehouse not found');
    
    const updatedWarehouse: Warehouse = {
      ...existingWarehouse,
      ...warehouseData
    };
    this.warehouses.set(id, updatedWarehouse);
    return updatedWarehouse;
  }

  async deleteWarehouse(id: string): Promise<void> {
    this.warehouses.delete(id);
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<any> {
    return {
      totalUsers: this.users.size,
      serviceRequests: this.serviceRequests.size,
      serviceCenters: this.serviceCenters.size,
      revenue: 125490
    };
  }

  async getRecentServiceRequests(): Promise<any[]> {
    const requests = Array.from(this.serviceRequests.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 5);
    
    return requests.map(request => {
      const customer = this.customers.get(request.customerId);
      return {
        ...request,
        customerName: customer?.fullName || "عميل غير محدد"
      };
    });
  }

  async getRecentActivities(): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 10);
  }

  // Activity Logs
  async logActivity(activityData: InsertActivityLog): Promise<ActivityLog> {
    const activity: ActivityLog = {
      id: generateId(),
      ...activityData,
      entityId: activityData.entityId ?? null,
      createdAt: new Date()
    };
    this.activityLogs.set(activity.id, activity);
    return activity;
  }
}

export const storage = new MemStorage();