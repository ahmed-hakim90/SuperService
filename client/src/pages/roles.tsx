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

const roleNames = {
  admin: 'مدير النظام',
  manager: 'مدير مركز',
  technician: 'فني',
  receptionist: 'موظف استقبال',
  warehouse_manager: 'مدير مخزن',
  customer: 'عميل'
};

const permissions = [
  { key: 'users_view', name: 'عرض المستخدمين' },
  { key: 'users_create', name: 'إضافة مستخدم' },
  { key: 'users_edit', name: 'تعديل مستخدم' },
  { key: 'users_delete', name: 'حذف مستخدم' },
  { key: 'centers_view', name: 'عرض المراكز' },
  { key: 'centers_create', name: 'إضافة مركز' },
  { key: 'centers_edit', name: 'تعديل مركز' },
  { key: 'centers_delete', name: 'حذف مركز' },
  { key: 'requests_view', name: 'عرض طلبات الصيانة' },
  { key: 'requests_create', name: 'إضافة طلب صيانة' },
  { key: 'requests_edit', name: 'تعديل طلب صيانة' },
  { key: 'requests_delete', name: 'حذف طلب صيانة' },
  { key: 'warehouses_view', name: 'عرض المخازن' },
  { key: 'warehouses_create', name: 'إضافة مخزن' },
  { key: 'warehouses_edit', name: 'تعديل مخزن' },
  { key: 'warehouses_delete', name: 'حذف مخزن' },
  { key: 'customers_view', name: 'عرض العملاء' },
  { key: 'customers_create', name: 'إضافة عميل' },
  { key: 'customers_edit', name: 'تعديل عميل' },
  { key: 'customers_delete', name: 'حذف عميل' },
  { key: 'reports_view', name: 'عرض التقارير' },
  { key: 'activities_view', name: 'عرض سجل الأنشطة' },
  { key: 'settings_view', name: 'عرض الإعدادات' },
  { key: 'settings_edit', name: 'تعديل الإعدادات' }
];

const defaultRolePermissions = {
  admin: permissions.map(p => p.key),
  manager: [
    'users_view', 'users_create', 'users_edit',
    'centers_view', 'centers_edit',
    'requests_view', 'requests_create', 'requests_edit',
    'warehouses_view', 'warehouses_create', 'warehouses_edit',
    'customers_view', 'customers_create', 'customers_edit',
    'reports_view', 'activities_view'
  ],
  technician: [
    'requests_view', 'requests_edit',
    'customers_view', 'customers_edit'
  ],
  receptionist: [
    'requests_view', 'requests_create', 'requests_edit',
    'customers_view', 'customers_create', 'customers_edit'
  ],
  warehouse_manager: [
    'warehouses_view', 'warehouses_edit',
    'requests_view'
  ],
  customer: ['requests_view']
};

export default function Roles() {
  const [selectedRole, setSelectedRole] = useState<string>("admin");
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>(defaultRolePermissions);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
    queryFn: () => apiGet('/api/users'),
  });

  const updateRolePermissions = useMutation({
    mutationFn: ({ role, permissions }: { role: string; permissions: string[] }) =>
      apiPost('/api/roles/permissions', { role, permissions }),
    onSuccess: () => {
      toast({ title: "تم تحديث صلاحيات الدور بنجاح" });
      setIsEditingRole(false);
    },
    onError: () => {
      toast({ variant: "destructive", title: "فشل في تحديث صلاحيات الدور" });
    },
  });

  const handlePermissionToggle = (permissionKey: string, checked: boolean) => {
    setRolePermissions(prev => ({
      ...prev,
      [selectedRole]: checked
        ? [...(prev[selectedRole] || []), permissionKey]
        : (prev[selectedRole] || []).filter(p => p !== permissionKey)
    }));
  };

  const handleSavePermissions = () => {
    updateRolePermissions.mutate({
      role: selectedRole,
      permissions: rolePermissions[selectedRole] || []
    });
  };

  const filteredUsers = users?.filter((user: any) => 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const usersByRole = Object.entries(roleNames).reduce((acc, [role, name]) => {
    acc[role] = filteredUsers.filter((user: any) => user.role === role);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">الأدوار والصلاحيات</h1>
        <p className="text-muted-foreground">إدارة أدوار المستخدمين وصلاحياتهم في النظام</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Role Management */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>إدارة الصلاحيات</span>
                <div className="flex items-center space-x-4 space-x-reverse">
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-48" data-testid="select-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleNames).map(([role, name]) => (
                        <SelectItem key={role} value={role}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isEditingRole && (
                    <Button 
                      onClick={handleSavePermissions} 
                      size="sm"
                      data-testid="button-save-permissions"
                    >
                      حفظ التغييرات
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {permissions.map((permission) => {
                  const isChecked = rolePermissions[selectedRole]?.includes(permission.key) || false;
                  return (
                    <div key={permission.key} className="flex items-center justify-between p-3 rounded-lg border">
                      <Label className="text-sm">{permission.name}</Label>
                      <Switch
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          handlePermissionToggle(permission.key, checked);
                          setIsEditingRole(true);
                        }}
                        data-testid={`switch-permission-${permission.key}`}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Users by Role */}
          <Card>
            <CardHeader>
              <CardTitle>المستخدمون حسب الأدوار</CardTitle>
              <div className="flex items-center space-x-4 space-x-reverse">
                <Input
                  placeholder="البحث في المستخدمين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-right max-w-sm"
                  data-testid="input-search-users"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(roleNames).map(([role, roleName]) => (
                  <div key={role} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2 space-x-reverse">
                        <span>{roleName}</span>
                        <span className="text-sm text-muted-foreground">
                          ({usersByRole[role]?.length || 0})
                        </span>
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {usersByRole[role]?.length > 0 ? (
                        usersByRole[role].map((user: any) => (
                          <div 
                            key={user.id} 
                            className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            data-testid={`user-card-${user.id}`}
                          >
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {user.fullName?.charAt(0) || 'م'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-card-foreground truncate">
                                {user.fullName}
                              </p>
                              <p className="text-sm text-muted-foreground truncate">
                                {user.email}
                              </p>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.status === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : user.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            }`}>
                              {user.status === 'active' ? 'نشط' 
                               : user.status === 'pending' ? 'معلق'
                               : 'غير نشط'}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm col-span-full">
                          لا يوجد مستخدمون بهذا الدور
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role Statistics */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إحصائيات الأدوار</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(roleNames).map(([role, roleName], index) => {
                const count = usersByRole[role]?.length || 0;
                const chartColor = `chart-${(index % 5) + 1}`;
                
                return (
                  <div key={role} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className={`w-3 h-3 rounded-full bg-${chartColor}`}></div>
                      <span className="font-medium">{roleName}</span>
                    </div>
                    <span className="text-lg font-bold">{count}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الصلاحيات الحالية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm font-medium text-muted-foreground">
                  الدور المحدد: {roleNames[selectedRole as keyof typeof roleNames]}
                </div>
                <div className="space-y-2">
                  {rolePermissions[selectedRole]?.length > 0 ? (
                    rolePermissions[selectedRole].map(permissionKey => {
                      const permission = permissions.find(p => p.key === permissionKey);
                      return (
                        <div key={permissionKey} className="flex items-center space-x-2 space-x-reverse text-sm">
                          <i className="bi bi-check-circle text-green-500"></i>
                          <span>{permission?.name}</span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-muted-foreground text-sm">لا توجد صلاحيات محددة</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
