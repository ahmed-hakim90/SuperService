import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/db";
import type { ServiceCenter, InsertServiceCenter } from "@shared/schema";

export default function Centers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<ServiceCenter | null>(null);
  const [formData, setFormData] = useState<Partial<InsertServiceCenter>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: centers, isLoading } = useQuery({
    queryKey: ['/api/service-centers'],
    queryFn: () => apiGet('/api/service-centers'),
  });

  const { data: users } = useQuery({
    queryKey: ['/api/users'],
    queryFn: () => apiGet('/api/users'),
  });

  const createCenterMutation = useMutation({
    mutationFn: (data: InsertServiceCenter) => apiPost('/api/service-centers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-centers'] });
      setIsAddDialogOpen(false);
      setFormData({});
      toast({ title: "تم إضافة مركز الخدمة بنجاح" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "فشل في إضافة مركز الخدمة" });
    },
  });

  const updateCenterMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertServiceCenter> }) => 
      apiPut(`/api/service-centers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-centers'] });
      setEditingCenter(null);
      setFormData({});
      toast({ title: "تم تحديث مركز الخدمة بنجاح" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "فشل في تحديث مركز الخدمة" });
    },
  });

  const deleteCenterMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/service-centers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-centers'] });
      toast({ title: "تم حذف مركز الخدمة بنجاح" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "فشل في حذف مركز الخدمة" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCenter) {
      updateCenterMutation.mutate({ id: editingCenter.id, data: formData });
    } else {
      createCenterMutation.mutate(formData as InsertServiceCenter);
    }
  };

  const handleEdit = (center: ServiceCenter) => {
    setEditingCenter(center);
    setFormData(center);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المركز؟")) {
      deleteCenterMutation.mutate(id);
    }
  };

  const filteredCenters = centers?.filter((center: ServiceCenter) => {
    const matchesSearch = center.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         center.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && center.isActive) ||
                         (statusFilter === "inactive" && !center.isActive);
    return matchesSearch && matchesStatus;
  }) || [];

  const managers = users?.filter((user: any) => user.role === 'manager') || [];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">مراكز الخدمة</h1>
          <p className="text-muted-foreground">إدارة مراكز الخدمة والفروع</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="flex items-center space-x-2 space-x-reverse"
              onClick={() => {
                setEditingCenter(null);
                setFormData({});
              }}
              data-testid="button-add-center"
            >
              <i className="bi bi-plus-circle"></i>
              <span>إضافة مركز</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCenter ? "تعديل مركز الخدمة" : "إضافة مركز جديد"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>اسم المركز</Label>
                <Input
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="text-right"
                  data-testid="input-center-name"
                />
              </div>
              <div>
                <Label>العنوان</Label>
                <Input
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="text-right"
                  data-testid="input-center-address"
                />
              </div>
              <div>
                <Label>رقم الهاتف</Label>
                <Input
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="text-right"
                  data-testid="input-center-phone"
                />
              </div>
              <div>
                <Label>البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="text-right"
                  data-testid="input-center-email"
                />
              </div>
              <div>
                <Label>المدير</Label>
                <Select value={formData.managerId || ""} onValueChange={(value) => setFormData({ ...formData, managerId: value })}>
                  <SelectTrigger data-testid="select-center-manager">
                    <SelectValue placeholder="اختر المدير" />
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
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  checked={formData.isActive ?? true}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  data-testid="switch-center-active"
                />
                <Label>نشط</Label>
              </div>
              <Button type="submit" className="w-full" data-testid="button-save-center">
                {editingCenter ? "تحديث" : "إضافة"}
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
                placeholder="البحث بالاسم أو العنوان..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-right"
                data-testid="input-search-centers"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-card-foreground mb-2">الحالة</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-filter-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
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
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">اسم المركز</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">العنوان</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الهاتف</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">المدير</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الحالة</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="loading-spinner mx-auto"></div>
                  </td>
                </tr>
              ) : filteredCenters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    لا توجد مراكز خدمة
                  </td>
                </tr>
              ) : (
                filteredCenters.map((center: ServiceCenter) => (
                  <tr key={center.id} className="hover:bg-muted/50" data-testid={`row-center-${center.id}`}>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-10 h-10 bg-chart-1/10 rounded-lg flex items-center justify-center">
                          <i className="bi bi-building text-chart-1"></i>
                        </div>
                        <span className="font-medium text-card-foreground">{center.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-card-foreground">{center.address}</td>
                    <td className="py-4 px-4 text-card-foreground">{center.phone}</td>
                    <td className="py-4 px-4 text-card-foreground">
                      {managers.find((m: any) => m.id === center.managerId)?.fullName || 'غير محدد'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`status-badge ${center.isActive ? 'status-completed' : 'status-cancelled'}`}>
                        {center.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(center)}
                          className="p-2 text-chart-1 hover:bg-chart-1/10"
                          data-testid={`button-edit-center-${center.id}`}
                        >
                          <i className="bi bi-pencil text-sm"></i>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(center.id)}
                          className="p-2 text-destructive hover:bg-destructive/10"
                          data-testid={`button-delete-center-${center.id}`}
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
