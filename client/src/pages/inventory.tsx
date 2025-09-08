import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/db";
import type { ProductInventory, InsertProductInventory, Product, Warehouse } from "@shared/schema";
import { Package, Plus, Edit, Trash2, AlertCircle } from "lucide-react";

export default function Inventory() {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<ProductInventory | null>(null);
  const [formData, setFormData] = useState<Partial<InsertProductInventory>>({
    quantity: 0,
    minQuantity: 5
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: warehouses, isLoading: warehousesLoading } = useQuery({
    queryKey: ['/api/warehouses'],
    queryFn: () => apiGet('/api/warehouses'),
  });

  const { data: products } = useQuery({
    queryKey: ['/api/products'],
    queryFn: () => apiGet('/api/products'),
  });

  const { data: inventory, isLoading: inventoryLoading } = useQuery({
    queryKey: ['/api/product-inventory', selectedWarehouse],
    queryFn: () => selectedWarehouse ? apiGet(`/api/product-inventory/${selectedWarehouse}`) : Promise.resolve([]),
    enabled: !!selectedWarehouse,
  });

  // Set first warehouse as default when warehouses load
  useEffect(() => {
    if (warehouses && warehouses.length > 0 && !selectedWarehouse) {
      setSelectedWarehouse(warehouses[0].id);
    }
  }, [warehouses, selectedWarehouse]);

  const createInventoryMutation = useMutation({
    mutationFn: (data: InsertProductInventory) => apiPost('/api/product-inventory', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-inventory', selectedWarehouse] });
      setIsAddDialogOpen(false);
      setFormData({ quantity: 0, minQuantity: 5 });
      toast({ title: "تم إضافة المخزون بنجاح" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "فشل في إضافة المخزون" });
    },
  });

  const updateInventoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertProductInventory> }) => 
      apiPut(`/api/product-inventory/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-inventory', selectedWarehouse] });
      setEditingInventory(null);
      setFormData({ quantity: 0, minQuantity: 5 });
      toast({ title: "تم تحديث المخزون بنجاح" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "فشل في تحديث المخزون" });
    },
  });

  const deleteInventoryMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/product-inventory/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-inventory', selectedWarehouse] });
      toast({ title: "تم حذف المخزون بنجاح" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "فشل في حذف المخزون" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInventory) {
      updateInventoryMutation.mutate({ id: editingInventory.id, data: formData });
    } else {
      createInventoryMutation.mutate({
        ...formData,
        warehouseId: selectedWarehouse,
      } as InsertProductInventory);
    }
  };

  const handleEdit = (item: ProductInventory) => {
    setEditingInventory(item);
    setFormData({
      productId: item.productId,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المخزون؟")) {
      deleteInventoryMutation.mutate(id);
    }
  };

  const getProductName = (productId: string) => {
    const product = products?.find((p: Product) => p.id === productId);
    return product?.name || "منتج غير معروف";
  };

  const getWarehouseName = (warehouseId: string) => {
    const warehouse = warehouses?.find((w: Warehouse) => w.id === warehouseId);
    return warehouse?.name || "مخزن غير معروف";
  };

  if (warehousesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

  if (!warehouses || warehouses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">لا توجد مخازن متاحة</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">إدارة المخزون</h1>
            <p className="text-muted-foreground">متابعة وإدارة مخزون المنتجات في المخازن</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="flex items-center space-x-2 space-x-reverse"
                onClick={() => {
                  setEditingInventory(null);
                  setFormData({ quantity: 0, minQuantity: 5 });
                }}
              >
                <Plus className="h-5 w-5" />
                <span>إضافة مخزون</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingInventory ? "تعديل المخزون" : "إضافة مخزون جديد"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="product">المنتج</Label>
                  <Select
                    value={formData.productId}
                    onValueChange={(value) => setFormData({ ...formData, productId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المنتج" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((product: Product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} {product.model && `(${product.model})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">الكمية المتوفرة</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="minQuantity">الحد الأدنى للكمية</Label>
                  <Input
                    id="minQuantity"
                    type="number"
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2 space-x-reverse">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit">
                    {editingInventory ? "تحديث" : "إضافة"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Warehouse selector */}
        <div className="mb-6">
          <Label htmlFor="warehouse">اختر المخزن</Label>
          <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
            <SelectTrigger className="w-full md:w-1/3">
              <SelectValue placeholder="اختر المخزن" />
            </SelectTrigger>
            <SelectContent>
              {warehouses?.map((warehouse: Warehouse) => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name} - {warehouse.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {inventoryLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">جاري تحميل المخزون...</div>
        </div>
      ) : (
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                مخزون {getWarehouseName(selectedWarehouse)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!inventory || inventory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا يوجد مخزون في هذا المخزن
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right pb-3">المنتج</th>
                        <th className="text-right pb-3">الكمية المتوفرة</th>
                        <th className="text-right pb-3">الحد الأدنى</th>
                        <th className="text-right pb-3">الحالة</th>
                        <th className="text-right pb-3">آخر تحديث</th>
                        <th className="text-right pb-3">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map((item: ProductInventory) => {
                        const isLowStock = item.quantity <= item.minQuantity;
                        const isOutOfStock = item.quantity === 0;
                        return (
                          <tr key={item.id} className="border-b">
                            <td className="py-3">{getProductName(item.productId)}</td>
                            <td className="py-3">{item.quantity}</td>
                            <td className="py-3">{item.minQuantity}</td>
                            <td className="py-3">
                              {isOutOfStock ? (
                                <Badge variant="destructive">نفذ المخزون</Badge>
                              ) : isLowStock ? (
                                <Badge variant="outline" className="text-orange-600 border-orange-600">
                                  مخزون منخفض
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  متوفر
                                </Badge>
                              )}
                            </td>
                            <td className="py-3">
                              {new Date(item.updatedAt!).toLocaleDateString('ar-SA')}
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEdit(item)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(item.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}