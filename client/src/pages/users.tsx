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
import { useAuth } from "../lib/auth";
import { canCreate, canUpdate, canDelete } from "../lib/permissions";
import type { User, InsertUser } from "@shared/schema";

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<InsertUser>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  // Check permissions
  const canCreateUsers = currentUser ? canCreate(currentUser.role, 'users') : false;
  const canUpdateUsers = currentUser ? canUpdate(currentUser.role, 'users') : false;
  const canDeleteUsers = currentUser ? canDelete(currentUser.role, 'users') : false;

  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/users'],
    queryFn: () => apiGet('/api/users'),
  });

  const createUserMutation = useMutation({
    mutationFn: (data: InsertUser) => apiPost('/api/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsAddDialogOpen(false);
      setFormData({});
      toast({ title: "تم إضافة المستخدم بنجاح" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "فشل في إضافة المستخدم" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertUser> }) => 
      apiPut(`/api/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setEditingUser(null);
      setFormData({});
      toast({ title: "تم تحديث المستخدم بنجاح" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "فشل في تحديث المستخدم" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: "تم حذف المستخدم بنجاح" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "فشل في حذف المستخدم" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data: formData });
    } else {
      createUserMutation.mutate(formData as InsertUser);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData(user);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      deleteUserMutation.mutate(id);
    }
  };

  const filteredUsers = users?.filter((user: User) => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">إدارة المستخدمين</h1>
          <p className="text-muted-foreground">إدارة حسابات المستخدمين وصلاحياتهم</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          {canCreateUsers && (
            <DialogTrigger asChild>
              <Button 
                className="flex items-center space-x-2 space-x-reverse"
                onClick={() => {
                  setEditingUser(null);
                  setFormData({});
                }}
                data-testid="button-add-user"
              >
                <i className="bi bi-plus-circle"></i>
                <span>إضافة مستخدم</span>
              </Button>
            </DialogTrigger>
          )}
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUser ? "تعديل مستخدم" : "إضافة مستخدم جديد"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>الاسم الكامل</Label>
                <Input
                  value={formData.fullName || ""}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="text-right"
                  data-testid="input-user-fullname"
                />
              </div>
              <div>
                <Label>البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="text-right"
                  data-testid="input-user-email"
                />
              </div>
              <div>
                <Label>رقم الهاتف</Label>
                <Input
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="text-right"
                  data-testid="input-user-phone"
                />
              </div>
              <div>
                <Label>الدور</Label>
                <Select value={formData.role || ""} onValueChange={(value) => setFormData({ ...formData, role: value as any })}>
                  <SelectTrigger data-testid="select-user-role">
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">مدير</SelectItem>
                    <SelectItem value="manager">مدير مركز</SelectItem>
                    <SelectItem value="technician">فني</SelectItem>
                    <SelectItem value="receptionist">موظف استقبال</SelectItem>
                    <SelectItem value="warehouse_manager">مدير مخزن</SelectItem>
                    <SelectItem value="customer">عميل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {!editingUser && (
                <div>
                  <Label>كلمة المرور</Label>
                  <Input
                    type="password"
                    value={formData.password || ""}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="text-right"
                    data-testid="input-user-password"
                  />
                </div>
              )}
              <Button type="submit" className="w-full" data-testid="button-save-user">
                {editingUser ? "تحديث" : "إضافة"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="block text-sm font-medium text-card-foreground mb-2">البحث</Label>
              <Input
                placeholder="البحث بالاسم أو البريد الإلكتروني..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-right"
                data-testid="input-search-users"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-card-foreground mb-2">الدور</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger data-testid="select-filter-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأدوار</SelectItem>
                  <SelectItem value="admin">مدير</SelectItem>
                  <SelectItem value="manager">مدير مركز</SelectItem>
                  <SelectItem value="technician">فني</SelectItem>
                  <SelectItem value="customer">عميل</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="pending">في الانتظار</SelectItem>
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
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الاسم</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">البريد الإلكتروني</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">رقم الهاتف</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الدور</th>
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
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    لا توجد مستخدمين
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user: User) => (
                  <tr key={user.id} className="hover:bg-muted/50" data-testid={`row-user-${user.id}`}>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {user.fullName?.charAt(0) || 'م'}
                          </span>
                        </div>
                        <span className="font-medium text-card-foreground">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-card-foreground">{user.email}</td>
                    <td className="py-4 px-4 text-card-foreground">{user.phone}</td>
                    <td className="py-4 px-4">
                      <span className="bg-chart-1/10 text-chart-1 px-2 py-1 rounded-full text-xs font-medium">
                        {user.role === 'admin' ? 'مدير' :
                         user.role === 'manager' ? 'مدير مركز' :
                         user.role === 'technician' ? 'فني' :
                         user.role === 'receptionist' ? 'موظف استقبال' :
                         user.role === 'warehouse_manager' ? 'مدير مخزن' : 'عميل'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`status-badge status-${user.status === 'active' ? 'completed' : user.status === 'pending' ? 'pending' : 'cancelled'}`}>
                        {user.status === 'active' ? 'نشط' : user.status === 'pending' ? 'في الانتظار' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        {canUpdateUsers && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            className="p-2 text-chart-1 hover:bg-chart-1/10"
                            data-testid={`button-edit-user-${user.id}`}
                          >
                            <i className="bi bi-pencil text-sm"></i>
                          </Button>
                        )}
                        {canDeleteUsers && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-destructive hover:bg-destructive/10"
                            data-testid={`button-delete-user-${user.id}`}
                          >
                            <i className="bi bi-trash text-sm"></i>
                          </Button>
                        )}
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
