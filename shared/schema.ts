import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, uuid, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'manager', 'technician', 'receptionist', 'warehouse_manager', 'customer']);
export const userStatusEnum = pgEnum('user_status', ['active', 'inactive', 'pending']);
export const serviceRequestStatusEnum = pgEnum('service_request_status', ['pending', 'in_progress', 'completed', 'cancelled']);
export const transferStatusEnum = pgEnum('transfer_status', ['pending', 'approved', 'rejected', 'completed']);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  address: text("address"),
  role: userRoleEnum("role").notNull().default('customer'),
  status: userStatusEnum("status").notNull().default('pending'),
  centerId: uuid("center_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service Centers table
export const serviceCenters = pgTable("service_centers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  email: text("email"),
  managerId: uuid("manager_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customers table
export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product Categories table
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  model: text("model"),
  categoryId: uuid("category_id").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service Requests table
export const serviceRequests = pgTable("service_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  requestNumber: text("request_number").notNull().unique(),
  customerId: uuid("customer_id").notNull(),
  productId: uuid("product_id").notNull(),
  deviceName: text("device_name").notNull(),
  model: text("model"),
  issue: text("issue").notNull(),
  status: serviceRequestStatusEnum("status").notNull().default('pending'),
  centerId: uuid("center_id").notNull(),
  technicianId: uuid("technician_id"),
  estimatedCost: integer("estimated_cost"),
  actualCost: integer("actual_cost"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Warehouses table
export const warehouses = pgTable("warehouses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  location: text("location").notNull(),
  managerId: uuid("manager_id"),
  centerId: uuid("center_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Spare Parts table
export const spareParts = pgTable("spare_parts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  partNumber: text("part_number").notNull().unique(),
  categoryId: uuid("category_id"),
  price: integer("price"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Inventory table
export const inventory = pgTable("inventory", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  warehouseId: uuid("warehouse_id").notNull(),
  sparePartId: uuid("spare_part_id").notNull(),
  quantity: integer("quantity").notNull().default(0),
  minQuantity: integer("min_quantity").default(5),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Parts Transfers table
export const partsTransfers = pgTable("parts_transfers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  fromWarehouseId: uuid("from_warehouse_id").notNull(),
  toWarehouseId: uuid("to_warehouse_id").notNull(),
  sparePartId: uuid("spare_part_id").notNull(),
  quantity: integer("quantity").notNull(),
  status: transferStatusEnum("status").notNull().default('pending'),
  requestedBy: uuid("requested_by").notNull(),
  approvedBy: uuid("approved_by"),
  reason: text("reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity Logs table
export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id"),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas - Modified for MemStorage compatibility
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  centerId: z.string().nullable().optional(),
});

export const insertServiceCenterSchema = createInsertSchema(serviceCenters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  managerId: z.string().nullable().optional(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
}).extend({
  categoryId: z.string(),
});

export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
}).extend({
  customerId: z.string(),
  productId: z.string(),
  centerId: z.string(),
  technicianId: z.string().nullable().optional(),
});

export const insertWarehouseSchema = createInsertSchema(warehouses).omit({
  id: true,
  createdAt: true,
}).extend({
  managerId: z.string().nullable().optional(),
  centerId: z.string().nullable().optional(),
});

export const insertSparePartSchema = createInsertSchema(spareParts).omit({
  id: true,
  createdAt: true,
}).extend({
  categoryId: z.string().nullable().optional(),
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  updatedAt: true,
}).extend({
  warehouseId: z.string(),
  sparePartId: z.string(),
});

export const insertPartsTransferSchema = createInsertSchema(partsTransfers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  fromWarehouseId: z.string(),
  toWarehouseId: z.string(),
  sparePartId: z.string(),
  requestedBy: z.string(),
  approvedBy: z.string().nullable().optional(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
}).extend({
  userId: z.string(),
  entityId: z.string().nullable().optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertServiceCenter = z.infer<typeof insertServiceCenterSchema>;
export type ServiceCenter = typeof serviceCenters.$inferSelect;

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type ServiceRequest = typeof serviceRequests.$inferSelect;

export type InsertWarehouse = z.infer<typeof insertWarehouseSchema>;
export type Warehouse = typeof warehouses.$inferSelect;

export type InsertSparePart = z.infer<typeof insertSparePartSchema>;
export type SparePart = typeof spareParts.$inferSelect;

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

export type InsertPartsTransfer = z.infer<typeof insertPartsTransferSchema>;
export type PartsTransfer = typeof partsTransfers.$inferSelect;

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
