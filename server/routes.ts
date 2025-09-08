import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertServiceCenterSchema,
  insertCustomerSchema,
  insertCategorySchema,
  insertProductSchema,
  insertServiceRequestSchema,
  insertWarehouseSchema,
  insertSparePartSchema,
  insertInventorySchema,
  insertPartsTransferSchema,
  insertActivityLogSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "البريد الإلكتروني وكلمة المرور مطلوبان" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
      }

      // In a real app, you would verify the password hash here
      // For demo purposes, we'll accept any password for existing users
      if (user.status !== 'active') {
        return res.status(401).json({ message: "الحساب غير مفعل، يرجى انتظار موافقة المسؤول" });
      }

      // Log activity
      await storage.logActivity({
        userId: user.id,
        action: "login",
        entityType: "user",
        entityId: user.id,
        description: `تم تسجيل الدخول للمستخدم ${user.fullName}`
      });

      res.json(user);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "المستخدم موجود بالفعل" });
      }

      // Create user with pending status
      const user = await storage.createUser({
        ...userData,
        status: 'pending'
      });

      // Log activity
      await storage.logActivity({
        userId: user.id,
        action: "register",
        entityType: "user",
        entityId: user.id,
        description: `تم تسجيل مستخدم جديد: ${user.fullName}`
      });

      res.status(201).json({ message: "تم إنشاء الحساب بنجاح، في انتظار الموافقة" });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Users CRUD
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات المستخدمين" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات المستخدم" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "المستخدم موجود بالفعل" });
      }

      const user = await storage.createUser(userData);

      // Log activity
      await storage.logActivity({
        userId: user.id,
        action: "create",
        entityType: "user",
        entityId: user.id,
        description: `تم إضافة مستخدم جديد: ${user.fullName}`
      });

      res.status(201).json(user);
    } catch (error) {
      console.error("Create user error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في إضافة المستخدم" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const userData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(req.params.id, userData);

      // Log activity
      await storage.logActivity({
        userId: user.id,
        action: "update",
        entityType: "user",
        entityId: user.id,
        description: `تم تحديث بيانات المستخدم: ${user.fullName}`
      });

      res.json(user);
    } catch (error) {
      console.error("Update user error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في تحديث المستخدم" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      await storage.deleteUser(req.params.id);

      // Log activity
      await storage.logActivity({
        userId: req.params.id,
        action: "delete",
        entityType: "user",
        entityId: req.params.id,
        description: `تم حذف المستخدم: ${user.fullName}`
      });

      res.json({ message: "تم حذف المستخدم بنجاح" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "خطأ في حذف المستخدم" });
    }
  });

  // Service Centers CRUD
  app.get("/api/service-centers", async (req, res) => {
    try {
      const centers = await storage.getAllServiceCenters();
      res.json(centers);
    } catch (error) {
      console.error("Get service centers error:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات مراكز الخدمة" });
    }
  });

  app.post("/api/service-centers", async (req, res) => {
    try {
      const centerData = insertServiceCenterSchema.parse(req.body);
      const center = await storage.createServiceCenter(centerData);

      // Log activity
      await storage.logActivity({
        userId: center.managerId || '',
        action: "create",
        entityType: "service_center",
        entityId: center.id,
        description: `تم إضافة مركز خدمة جديد: ${center.name}`
      });

      res.status(201).json(center);
    } catch (error) {
      console.error("Create service center error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في إضافة مركز الخدمة" });
    }
  });

  app.put("/api/service-centers/:id", async (req, res) => {
    try {
      const centerData = insertServiceCenterSchema.partial().parse(req.body);
      const center = await storage.updateServiceCenter(req.params.id, centerData);

      // Log activity
      await storage.logActivity({
        userId: center.managerId || '',
        action: "update",
        entityType: "service_center",
        entityId: center.id,
        description: `تم تحديث مركز الخدمة: ${center.name}`
      });

      res.json(center);
    } catch (error) {
      console.error("Update service center error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في تحديث مركز الخدمة" });
    }
  });

  app.delete("/api/service-centers/:id", async (req, res) => {
    try {
      const center = await storage.getServiceCenter(req.params.id);
      if (!center) {
        return res.status(404).json({ message: "مركز الخدمة غير موجود" });
      }

      await storage.deleteServiceCenter(req.params.id);

      // Log activity
      await storage.logActivity({
        userId: center.managerId || '',
        action: "delete",
        entityType: "service_center",
        entityId: req.params.id,
        description: `تم حذف مركز الخدمة: ${center.name}`
      });

      res.json({ message: "تم حذف مركز الخدمة بنجاح" });
    } catch (error) {
      console.error("Delete service center error:", error);
      res.status(500).json({ message: "خطأ في حذف مركز الخدمة" });
    }
  });

  // Customers CRUD
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Get customers error:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات العملاء" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);

      // Log activity
      await storage.logActivity({
        userId: '',
        action: "create",
        entityType: "customer",
        entityId: customer.id,
        description: `تم إضافة عميل جديد: ${customer.fullName}`
      });

      res.status(201).json(customer);
    } catch (error) {
      console.error("Create customer error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في إضافة العميل" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(req.params.id, customerData);

      // Log activity
      await storage.logActivity({
        userId: '',
        action: "update",
        entityType: "customer",
        entityId: customer.id,
        description: `تم تحديث بيانات العميل: ${customer.fullName}`
      });

      res.json(customer);
    } catch (error) {
      console.error("Update customer error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في تحديث العميل" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "العميل غير موجود" });
      }

      await storage.deleteCustomer(req.params.id);

      // Log activity
      await storage.logActivity({
        userId: '',
        action: "delete",
        entityType: "customer",
        entityId: req.params.id,
        description: `تم حذف العميل: ${customer.fullName}`
      });

      res.json({ message: "تم حذف العميل بنجاح" });
    } catch (error) {
      console.error("Delete customer error:", error);
      res.status(500).json({ message: "خطأ في حذف العميل" });
    }
  });

  // Categories CRUD
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات الفئات" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);

      // Log activity
      await storage.logActivity({
        userId: '',
        action: "create",
        entityType: "category",
        entityId: category.id,
        description: `تم إضافة فئة جديدة: ${category.name}`
      });

      res.status(201).json(category);
    } catch (error) {
      console.error("Create category error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في إضافة الفئة" });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(req.params.id, categoryData);

      // Log activity
      await storage.logActivity({
        userId: '',
        action: "update",
        entityType: "category",
        entityId: category.id,
        description: `تم تحديث الفئة: ${category.name}`
      });

      res.json(category);
    } catch (error) {
      console.error("Update category error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في تحديث الفئة" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "الفئة غير موجودة" });
      }

      await storage.deleteCategory(req.params.id);

      // Log activity
      await storage.logActivity({
        userId: '',
        action: "delete",
        entityType: "category",
        entityId: req.params.id,
        description: `تم حذف الفئة: ${category.name}`
      });

      res.json({ message: "تم حذف الفئة بنجاح" });
    } catch (error) {
      console.error("Delete category error:", error);
      res.status(500).json({ message: "خطأ في حذف الفئة" });
    }
  });

  // Products CRUD
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات المنتجات" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);

      // Log activity
      await storage.logActivity({
        userId: '',
        action: "create",
        entityType: "product",
        entityId: product.id,
        description: `تم إضافة منتج جديد: ${product.name}`
      });

      res.status(201).json(product);
    } catch (error) {
      console.error("Create product error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في إضافة المنتج" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, productData);

      // Log activity
      await storage.logActivity({
        userId: '',
        action: "update",
        entityType: "product",
        entityId: product.id,
        description: `تم تحديث المنتج: ${product.name}`
      });

      res.json(product);
    } catch (error) {
      console.error("Update product error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في تحديث المنتج" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "المنتج غير موجود" });
      }

      await storage.deleteProduct(req.params.id);

      // Log activity
      await storage.logActivity({
        userId: '',
        action: "delete",
        entityType: "product",
        entityId: req.params.id,
        description: `تم حذف المنتج: ${product.name}`
      });

      res.json({ message: "تم حذف المنتج بنجاح" });
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({ message: "خطأ في حذف المنتج" });
    }
  });

  // Service Requests CRUD
  app.get("/api/service-requests", async (req, res) => {
    try {
      const serviceRequests = await storage.getAllServiceRequests();
      res.json(serviceRequests);
    } catch (error) {
      console.error("Get service requests error:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات طلبات الصيانة" });
    }
  });

  app.post("/api/service-requests", async (req, res) => {
    try {
      const requestData = insertServiceRequestSchema.parse(req.body);
      const serviceRequest = await storage.createServiceRequest(requestData);

      // Log activity
      await storage.logActivity({
        userId: serviceRequest.technicianId || '',
        action: "create",
        entityType: "service_request",
        entityId: serviceRequest.id,
        description: `تم إضافة طلب صيانة جديد: ${serviceRequest.requestNumber}`
      });

      res.status(201).json(serviceRequest);
    } catch (error) {
      console.error("Create service request error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في إضافة طلب الصيانة" });
    }
  });

  app.put("/api/service-requests/:id", async (req, res) => {
    try {
      const requestData = insertServiceRequestSchema.partial().parse(req.body);
      const serviceRequest = await storage.updateServiceRequest(req.params.id, requestData);

      // Log activity
      await storage.logActivity({
        userId: serviceRequest.technicianId || '',
        action: "update",
        entityType: "service_request",
        entityId: serviceRequest.id,
        description: `تم تحديث طلب الصيانة: ${serviceRequest.requestNumber}`
      });

      res.json(serviceRequest);
    } catch (error) {
      console.error("Update service request error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في تحديث طلب الصيانة" });
    }
  });

  app.delete("/api/service-requests/:id", async (req, res) => {
    try {
      const serviceRequest = await storage.getServiceRequest(req.params.id);
      if (!serviceRequest) {
        return res.status(404).json({ message: "طلب الصيانة غير موجود" });
      }

      await storage.deleteServiceRequest(req.params.id);

      // Log activity
      await storage.logActivity({
        userId: serviceRequest.technicianId || '',
        action: "delete",
        entityType: "service_request",
        entityId: req.params.id,
        description: `تم حذف طلب الصيانة: ${serviceRequest.requestNumber}`
      });

      res.json({ message: "تم حذف طلب الصيانة بنجاح" });
    } catch (error) {
      console.error("Delete service request error:", error);
      res.status(500).json({ message: "خطأ في حذف طلب الصيانة" });
    }
  });

  // Dashboard endpoints
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ message: "خطأ في جلب إحصائيات لوحة التحكم" });
    }
  });

  app.get("/api/dashboard/recent-requests", async (req, res) => {
    try {
      const recentRequests = await storage.getRecentServiceRequests();
      res.json(recentRequests);
    } catch (error) {
      console.error("Get recent requests error:", error);
      res.status(500).json({ message: "خطأ في جلب أحدث طلبات الصيانة" });
    }
  });

  app.get("/api/dashboard/recent-activities", async (req, res) => {
    try {
      const recentActivities = await storage.getRecentActivities();
      res.json(recentActivities);
    } catch (error) {
      console.error("Get recent activities error:", error);
      res.status(500).json({ message: "خطأ في جلب أحدث الأنشطة" });
    }
  });

  // Activity logs
  app.get("/api/activities", async (req, res) => {
    try {
      const activities = await storage.getRecentActivities();
      res.json(activities);
    } catch (error) {
      console.error("Get activities error:", error);
      res.status(500).json({ message: "خطأ في جلب سجل الأنشطة" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
