import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/db";
import type { Warehouse, InsertWarehouse } from "@shared/schema";

export default function Warehouses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [centerFilter, setCenterFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState<Partial<InsertWarehouse>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: warehouses, isLoading } = useQuery({
    queryKey: ['/api/warehouses'],
    queryFn: () => apiGet('/api/warehouses'),
  });

  const { data: users } = useQuery({
    queryKey: ['/api/users'],
    queryFn: () => apiGet('/api/users'),
  });

  const { data: centers } = useQuery({
    queryKey: ['/api/service-centers'],
    queryFn: () => apiGet('/api/service-centers'),
  });

  const createWarehouseMutation = useMutation({
    mutationFn: (data: InsertWarehouse) => apiPost('/api/warehouses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/warehouses'] });
      setIsAddDialogOpen(false);
      setFormData({});
      toast({ title: "تم إضافة المخزن بنجاح" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "فشل في إضافة المخزن" });
    },
  });

  const updateWarehouseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertWarehouse> }) => 
      apiPut(`/api/warehouses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/warehouses'] });
      setEditingWarehouse(null);
      setFormData({});
      toast({ title: "تم تحديث المخزن بنجاح" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "فشل في تحديث المخزن" });
    },
  });

  const deleteWarehouseMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/warehouses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/warehouses'] });
      toast({ title: "تم حذف المخزن بنجاح" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "فشل في حذف المخزن" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWarehouse) {
      updateWarehouseMutation.mutate({ id: editingWarehouse.id, data: formData });
    } else {
      createWarehouseMutation.mutate(formData as InsertWarehouse);
    }
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData(warehouse);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المخزن؟")) {
      deleteWarehouseMutation.mutate(id);
    }
  };

  const filteredWarehouses = warehouses?.filter((warehouse: Warehouse) => {
    const matchesSearch = warehouse.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warehouse.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCenter = centerFilter === "all" || warehouse.centerId === centerFilter;
    return matchesSearch && matchesCenter;
  }) || [];

  const managers = users?.filter((user: any) => user.role === 'warehouse_manager') || [];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">المخازن</h1>
          <p className="text-muted-foreground">إدارة المخازن والمستودعات</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="flex items-center space-x-2 space-x-reverse"
              onClick={() => {
                setEditingWarehouse(null);
                setFormData({});
              }}
              data-testid="button-add-warehouse"
            >
              <i className="bi bi-plus-circle"></i>
              <span>إضافة مخزن</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingWarehouse ? "تعديل المخزن" : "إضافة مخزن جديد"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>اسم المخزن</Label>
                <Input
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="text-right"
                  data-testid="input-warehouse-name"
                />
              </div>
              <div>
                <Label>الموقع</Label>
                <Input
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  className="text-right"
                  data-testid="input-warehouse-location"
                />
              </div>
              <div>
                <Label>مدير المخزن</Label>
                <Select value={formData.managerId || ""} onValueChange={(value) => setFormData({ ...formData, managerId: value })}>
                  <SelectTrigger data-testid="select-warehouse-manager">
                    <SelectValue placeholder="اختر مدير المخزن" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map((manager: any) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>مركز الخدمة</Label>
                <Select value={formData.centerId || ""} onValueChange={(value) => setFormData({ ...formData, centerId: value })}>
                  <SelectTrigger data-testid="select-warehouse-center">
                    <SelectValue placeholder="اختر مركز الخدمة" />
                  </SelectTrigger>
                  <SelectContent>
                    {centers?.map((center: any) => (
                      <SelectItem key={center.id} value={center.id}>
                        {center.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" data-testid="button-save-warehouse">
                {editingWarehouse ? "تحديث" : "إضافة"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium text-card-foreground mb-2">البحث</Label>
              <Input
                placeholder="البحث بالاسم أو الموقع..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-right"
                data-testid="input-search-warehouses"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-card-foreground mb-2">مركز الخدمة</Label>
              <Select value={centerFilter} onValueChange={setCenterFilter}>
                <SelectTrigger data-testid="select-filter-center">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المراكز</SelectItem>
                  {centers?.map((center: any) => (
                    <SelectItem key={center.id} value={center.id}>
                      {center.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">اسم المخزن</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الموقع</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">المدير</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">مركز الخدمة</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <div className="loading-spinner mx-auto"></div>
                  </td>
                </tr>
              ) : filteredWarehouses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    لا توجد مخازن
                  </td>
                </tr>
              ) : (
                filteredWarehouses.map((warehouse: Warehouse) => (
                  <tr key={warehouse.id} className="hover:bg-muted/50" data-testid={`row-warehouse-${warehouse.id}`}>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-10 h-10 bg-chart-2/10 rounded-lg flex items-center justify-center">
                          <i className="bi bi-shop text-chart-2"></i>
                        </div>
                        <span className="font-medium text-card-foreground">{warehouse.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-card-foreground">{warehouse.location}</td>
                    <td className="py-4 px-4 text-card-foreground">
                      {managers.find((m: any) => m.id === warehouse.managerId)?.fullName || 'غير محدد'}
                    </td>
                    <td className="py-4 px-4 text-card-foreground">
                      {centers?.find((c: any) => c.id === warehouse.centerId)?.name || 'غير محدد'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(warehouse)}
                          className="p-2 text-chart-1 hover:bg-chart-1/10"
                          data-testid={`button-edit-warehouse-${warehouse.id}`}
                        >
                          <i className="bi bi-pencil text-sm"></i>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(warehouse.id)}
                          className="p-2 text-destructive hover:bg-destructive/10"
                          data-testid={`button-delete-warehouse-${warehouse.id}`}
                        >
                          <i className="bi bi-trash text-sm"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
