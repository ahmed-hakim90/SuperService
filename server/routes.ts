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
  insertServiceRequestFollowUpSchema,
  insertWarehouseSchema,
  insertSparePartSchema,
  insertInventorySchema,
  insertPartsTransferSchema,
  insertActivityLogSchema,
  type User
} from "@shared/schema";

// Helper function to get current user from session
async function getCurrentUser(req: any): Promise<User | null> {
  if (!req.session?.user?.id) {
    return null;
  }
  return await storage.getUser(req.session.user.id) || null;
}

// Helper function to check if user can access data based on role and center
function canAccessData(user: User, resourceType: string, data?: any): boolean {
  if (user.role === 'admin') {
    return true; // Admin can access everything
  }
  
  // Manager can only access their center's data
  if (user.role === 'manager') {
    if (resourceType === 'user' && data?.centerId && data.centerId !== user.centerId) {
      return false;
    }
    if (resourceType === 'serviceRequest' && data?.centerId && data.centerId !== user.centerId) {
      return false;
    }
    if (resourceType === 'warehouse' && data?.centerId && data.centerId !== user.centerId) {
      return false;
    }
  }
  
  // Technician can only access their assigned service requests
  if (user.role === 'technician') {
    if (resourceType === 'serviceRequest' && data?.technicianId && data.technicianId !== user.id) {
      return false;
    }
  }
  
  // Warehouse manager can only access their warehouse data
  if (user.role === 'warehouse_manager') {
    if (resourceType === 'warehouse' && data?.managerId && data.managerId !== user.id) {
      return false;
    }
  }
  
  // Customer can only access their own data
  if (user.role === 'customer') {
    if (resourceType === 'serviceRequest' && data?.customerId && data.customerId !== user.id) {
      return false;
    }
  }
  
  return true;
}

// Helper function to filter data based on user role
function filterDataForUser(user: User, resourceType: string, data: any[]): any[] {
  if (user.role === 'admin') {
    return data; // Admin sees everything
  }
  
  return data.filter(item => canAccessData(user, resourceType, item));
}

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

      // Store user in session
      (req as any).session.user = user;

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
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
      }

      const allUsers = await storage.getAllUsers();
      let filteredUsers = allUsers;

      // Filter users based on role
      if (currentUser.role === 'manager') {
        // Manager can only see users in their center
        filteredUsers = allUsers.filter(user => user.centerId === currentUser.centerId);
      } else if (currentUser.role !== 'admin') {
        // Non-admin and non-manager roles cannot view other users
        return res.status(403).json({ message: "ليس لديك صلاحية لعرض المستخدمين" });
      }

      res.json(filteredUsers);
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
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
      }

      const allCustomers = await storage.getAllCustomers();
      let filteredCustomers = allCustomers;

      // Filter customers based on role
      if (currentUser.role === 'manager' || currentUser.role === 'receptionist') {
        // Manager and receptionist can see all customers (no center restriction on customers)
        // Since customers are not bound to specific centers
        filteredCustomers = allCustomers;
      } else if (currentUser.role === 'technician') {
        // Technician can see customers related to their service requests
        // For now, we'll allow them to see all customers (they might need for creating requests)
        filteredCustomers = allCustomers;
      } else if (currentUser.role === 'customer') {
        // Customer can only see their own data
        filteredCustomers = allCustomers.filter(customer => customer.id === currentUser.id);
      } else if (currentUser.role === 'warehouse_manager') {
        // Warehouse manager doesn't need customer access
        return res.status(403).json({ message: "ليس لديك صلاحية لعرض العملاء" });
      }

      res.json(filteredCustomers);
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

  // Service Request Follow-ups
  app.get("/api/service-requests/:id/follow-ups", async (req, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
      }

      // Check if user can access this service request
      const serviceRequest = await storage.getServiceRequest(req.params.id);
      if (!serviceRequest) {
        return res.status(404).json({ message: "طلب الصيانة غير موجود" });
      }

      // Check permissions
      if (!canAccessData(currentUser, 'serviceRequest', serviceRequest)) {
        return res.status(403).json({ message: "ليس لديك صلاحية لعرض متابعات هذا الطلب" });
      }

      const followUps = await storage.getServiceRequestFollowUps(req.params.id);
      res.json(followUps);
    } catch (error) {
      console.error("Get follow-ups error:", error);
      res.status(500).json({ message: "خطأ في جلب المتابعات" });
    }
  });

  app.post("/api/service-requests/:id/follow-ups", async (req, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
      }

      // Check if user can add follow-ups (only technicians)
      if (currentUser.role !== 'technician') {
        return res.status(403).json({ message: "فقط الفنيين يمكنهم إضافة متابعات" });
      }

      // Check if this service request exists and is assigned to the technician
      const serviceRequest = await storage.getServiceRequest(req.params.id);
      if (!serviceRequest) {
        return res.status(404).json({ message: "طلب الصيانة غير موجود" });
      }

      if (serviceRequest.technicianId !== currentUser.id) {
        return res.status(403).json({ message: "يمكنك إضافة متابعات فقط للطلبات المسندة إليك" });
      }

      const followUpData = insertServiceRequestFollowUpSchema.parse({
        serviceRequestId: req.params.id,
        technicianId: currentUser.id,
        followUpText: req.body.followUpText
      });

      const followUp = await storage.createServiceRequestFollowUp(followUpData);

      // Log activity
      await storage.logActivity({
        userId: currentUser.id,
        action: "create",
        entityType: "service_request_follow_up",
        entityId: followUp.id,
        description: `تم إضافة متابعة لطلب الصيانة: ${serviceRequest.requestNumber}`
      });

      res.status(201).json(followUp);
    } catch (error) {
      console.error("Create follow-up error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في إضافة المتابعة" });
    }
  });

  // Warehouses CRUD
  app.get("/api/warehouses", async (req, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
      }

      const allWarehouses = await storage.getAllWarehouses();
      let filteredWarehouses = allWarehouses;

      // Filter warehouses based on role
      if (currentUser.role === 'manager') {
        // Manager can only see warehouses in their center
        filteredWarehouses = allWarehouses.filter(warehouse => warehouse.centerId === currentUser.centerId);
      } else if (currentUser.role === 'warehouse_manager') {
        // Warehouse manager can only see warehouses they manage
        filteredWarehouses = allWarehouses.filter(warehouse => warehouse.managerId === currentUser.id);
      } else if (currentUser.role !== 'admin') {
        // Other roles cannot access warehouses
        return res.status(403).json({ message: "ليس لديك صلاحية لعرض المخازن" });
      }

      res.json(filteredWarehouses);
    } catch (error) {
      console.error("Get warehouses error:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات المخازن" });
    }
  });

  app.post("/api/warehouses", async (req, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
      }

      // Check permissions
      if (currentUser.role !== 'admin' && currentUser.role !== 'manager') {
        return res.status(403).json({ message: "ليس لديك صلاحية لإضافة مخازن" });
      }

      const warehouseData = insertWarehouseSchema.parse(req.body);
      
      // For managers, restrict to their center
      if (currentUser.role === 'manager') {
        warehouseData.centerId = currentUser.centerId;
      }
      
      const warehouse = await storage.createWarehouse(warehouseData);

      // Log activity
      await storage.logActivity({
        userId: currentUser.id,
        action: "create",
        entityType: "warehouse",
        entityId: warehouse.id,
        description: `تم إضافة مخزن جديد: ${warehouse.name}`
      });

      res.status(201).json(warehouse);
    } catch (error) {
      console.error("Create warehouse error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في إضافة المخزن" });
    }
  });

  app.put("/api/warehouses/:id", async (req, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
      }

      const warehouse = await storage.getWarehouse(req.params.id);
      if (!warehouse) {
        return res.status(404).json({ message: "المخزن غير موجود" });
      }

      // Check permissions
      if (currentUser.role === 'manager' && warehouse.centerId !== currentUser.centerId) {
        return res.status(403).json({ message: "ليس لديك صلاحية لتعديل هذا المخزن" });
      }
      if (currentUser.role === 'warehouse_manager' && warehouse.managerId !== currentUser.id) {
        return res.status(403).json({ message: "ليس لديك صلاحية لتعديل هذا المخزن" });
      }
      if (currentUser.role !== 'admin' && currentUser.role !== 'manager' && currentUser.role !== 'warehouse_manager') {
        return res.status(403).json({ message: "ليس لديك صلاحية لتعديل المخازن" });
      }

      const warehouseData = insertWarehouseSchema.partial().parse(req.body);
      const updatedWarehouse = await storage.updateWarehouse(req.params.id, warehouseData);

      // Log activity
      await storage.logActivity({
        userId: currentUser.id,
        action: "update",
        entityType: "warehouse",
        entityId: updatedWarehouse.id,
        description: `تم تحديث المخزن: ${updatedWarehouse.name}`
      });

      res.json(updatedWarehouse);
    } catch (error) {
      console.error("Update warehouse error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في تحديث المخزن" });
    }
  });

  app.delete("/api/warehouses/:id", async (req, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
      }

      const warehouse = await storage.getWarehouse(req.params.id);
      if (!warehouse) {
        return res.status(404).json({ message: "المخزن غير موجود" });
      }

      // Check permissions - only admin can delete warehouses
      if (currentUser.role !== 'admin') {
        return res.status(403).json({ message: "ليس لديك صلاحية لحذف المخازن" });
      }

      await storage.deleteWarehouse(req.params.id);

      // Log activity
      await storage.logActivity({
        userId: currentUser.id,
        action: "delete",
        entityType: "warehouse",
        entityId: req.params.id,
        description: `تم حذف المخزن: ${warehouse.name}`
      });

      res.json({ message: "تم حذف المخزن بنجاح" });
    } catch (error) {
      console.error("Delete warehouse error:", error);
      res.status(500).json({ message: "خطأ في حذف المخزن" });
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
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
      }

      const allRequests = await storage.getAllServiceRequests();
      let filteredRequests = allRequests;

      // Filter service requests based on role
      if (currentUser.role === 'manager') {
        // Manager can only see requests from their center
        filteredRequests = allRequests.filter(req => req.centerId === currentUser.centerId);
      } else if (currentUser.role === 'technician') {
        // Technician can only see requests assigned to them
        filteredRequests = allRequests.filter(req => req.technicianId === currentUser.id);
      } else if (currentUser.role === 'receptionist') {
        // Receptionist can see requests from their center
        filteredRequests = allRequests.filter(req => req.centerId === currentUser.centerId);
      } else if (currentUser.role === 'customer') {
        // Customer can only see their own requests
        filteredRequests = allRequests.filter(req => req.customerId === currentUser.id);
      } else if (currentUser.role === 'warehouse_manager') {
        // Warehouse manager cannot see service requests
        return res.status(403).json({ message: "ليس لديك صلاحية لعرض طلبات الصيانة" });
      }

      res.json(filteredRequests);
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
