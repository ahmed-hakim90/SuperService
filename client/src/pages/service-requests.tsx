import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/db";
import { useAuth } from "../lib/auth";
import { canCreate, canUpdate, canDelete } from "../lib/permissions";
import type { ServiceRequest, InsertServiceRequest } from "@shared/schema";

export default function ServiceRequests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [centerFilter, setCenterFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<ServiceRequest | null>(null);
  const [formData, setFormData] = useState<Partial<InsertServiceRequest>>({});
  const [isFollowUpDialogOpen, setIsFollowUpDialogOpen] = useState(false);
  const [selectedRequestForFollowUp, setSelectedRequestForFollowUp] = useState<ServiceRequest | null>(null);
  const [followUpText, setFollowUpText] = useState("");
  const [newStatus, setNewStatus] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  // Check permissions
  const canCreateRequests = currentUser ? canCreate(currentUser.role, 'serviceRequests') : false;
  const canUpdateRequests = currentUser ? canUpdate(currentUser.role, 'serviceRequests') : false;
  const canDeleteRequests = currentUser ? canDelete(currentUser.role, 'serviceRequests') : false;

  const { data: serviceRequests, isLoading } = useQuery({
    queryKey: ['/api/service-requests'],
    queryFn: () => apiGet('/api/service-requests'),
  });

  const { data: customers } = useQuery({
    queryKey: ['/api/customers'],
    queryFn: () => apiGet('/api/customers'),
  });

  const { data: centers } = useQuery({
    queryKey: ['/api/service-centers'],
    queryFn: () => apiGet('/api/service-centers'),
  });

  const { data: products } = useQuery({
    queryKey: ['/api/products'],
    queryFn: () => apiGet('/api/products'),
  });

  const createRequestMutation = useMutation({
    mutationFn: (data: InsertServiceRequest) => apiPost('/api/service-requests', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-requests'] });
      setIsAddDialogOpen(false);
      setFormData({});
      toast({ title: "تم إضافة طلب الصيانة بنجاح" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "فشل في إضافة طلب الصيانة" });
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertServiceRequest> }) => 
      apiPut(`/api/service-requests/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-requests'] });
      setEditingRequest(null);
      setFormData({});
      toast({ title: "تم تحديث طلب الصيانة بنجاح" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "فشل في تحديث طلب الصيانة" });
    },
  });

  const deleteRequestMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/service-requests/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-requests'] });
      toast({ title: "تم حذف طلب الصيانة بنجاح" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "فشل في حذف طلب الصيانة" });
    },
  });

  const createFollowUpMutation = useMutation({
    mutationFn: ({ requestId, followUpText, newStatus }: { requestId: string; followUpText: string; newStatus?: string }) => 
      apiPost(`/api/service-requests/${requestId}/follow-ups`, { followUpText, newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-requests'] });
      setIsFollowUpDialogOpen(false);
      setFollowUpText("");
      setNewStatus("");
      setSelectedRequestForFollowUp(null);
      toast({ title: "تم إضافة المتابعة بنجاح" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "فشل في إضافة المتابعة" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRequest) {
      updateRequestMutation.mutate({ id: editingRequest.id, data: formData });
    } else {
      createRequestMutation.mutate(formData as InsertServiceRequest);
    }
  };

  const handleEdit = (request: ServiceRequest) => {
    setEditingRequest(request);
    setFormData(request);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الطلب؟")) {
      deleteRequestMutation.mutate(id);
    }
  };

  const handleAddFollowUp = (request: ServiceRequest) => {
    setSelectedRequestForFollowUp(request);
    setIsFollowUpDialogOpen(true);
  };

  const handleSubmitFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRequestForFollowUp && followUpText.trim()) {
      createFollowUpMutation.mutate({
        requestId: selectedRequestForFollowUp.id,
        followUpText: followUpText.trim(),
        newStatus: newStatus || undefined
      });
    }
  };

  const filteredRequests = serviceRequests?.filter((request: ServiceRequest) => {
    const matchesSearch = request.requestNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.deviceName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesCenter = centerFilter === "all" || request.centerId === centerFilter;
    return matchesSearch && matchesStatus && matchesCenter;
  }) || [];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">طلبات الصيانة</h1>
          <p className="text-muted-foreground">إدارة ومتابعة طلبات الصيانة</p>
        </div>
        {canCreateRequests && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="flex items-center space-x-2 space-x-reverse"
                onClick={() => {
                  setEditingRequest(null);
                  setFormData({});
                }}
                data-testid="button-add-service-request"
              >
                <i className="bi bi-plus-circle"></i>
                <span>طلب صيانة جديد</span>
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRequest ? "تعديل طلب الصيانة" : "إضافة طلب صيانة جديد"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>رقم الطلب</Label>
                <Input
                  value={formData.requestNumber || ""}
                  onChange={(e) => setFormData({ ...formData, requestNumber: e.target.value })}
                  required
                  className="text-right"
                  data-testid="input-request-number"
                />
              </div>
              <div>
                <Label>العميل</Label>
                <Select value={formData.customerId || ""} onValueChange={(value) => setFormData({ ...formData, customerId: value })}>
                  <SelectTrigger data-testid="select-customer">
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map((customer: any) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>المنتج</Label>
                <Select value={formData.productId || ""} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
                  <SelectTrigger data-testid="select-product">
                    <SelectValue placeholder="اختر المنتج" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product: any) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>اسم الجهاز</Label>
                <Input
                  value={formData.deviceName || ""}
                  onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                  required
                  className="text-right"
                  data-testid="input-device-name"
                />
              </div>
              <div>
                <Label>الموديل</Label>
                <Input
                  value={formData.model || ""}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="text-right"
                  data-testid="input-model"
                />
              </div>
              <div>
                <Label>وصف المشكلة</Label>
                <Textarea
                  value={formData.issue || ""}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  required
                  className="text-right"
                  data-testid="textarea-issue"
                />
              </div>
              <div>
                <Label>مركز الخدمة</Label>
                <Select value={formData.centerId || ""} onValueChange={(value) => setFormData({ ...formData, centerId: value })}>
                  <SelectTrigger data-testid="select-center">
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
              <div>
                <Label>الحالة</Label>
                <Select value={formData.status || ""} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">في الانتظار</SelectItem>
                    <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" data-testid="button-save-request">
                {editingRequest ? "تحديث" : "إضافة"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-chart-3/10 rounded-lg flex items-center justify-center">
              <i className="bi bi-clock text-chart-3"></i>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">في الانتظار</p>
              <p className="text-xl font-bold text-card-foreground">
                {serviceRequests?.filter((r: ServiceRequest) => r.status === 'pending').length || 0}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-chart-1/10 rounded-lg flex items-center justify-center">
              <i className="bi bi-gear text-chart-1"></i>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">قيد التنفيذ</p>
              <p className="text-xl font-bold text-card-foreground">
                {serviceRequests?.filter((r: ServiceRequest) => r.status === 'in_progress').length || 0}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-chart-2/10 rounded-lg flex items-center justify-center">
              <i className="bi bi-check-circle text-chart-2"></i>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">مكتملة</p>
              <p className="text-xl font-bold text-card-foreground">
                {serviceRequests?.filter((r: ServiceRequest) => r.status === 'completed').length || 0}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
              <i className="bi bi-x-circle text-destructive"></i>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ملغية</p>
              <p className="text-xl font-bold text-card-foreground">
                {serviceRequests?.filter((r: ServiceRequest) => r.status === 'cancelled').length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="block text-sm font-medium text-card-foreground mb-2">البحث</Label>
              <Input
                placeholder="رقم الطلب أو اسم الجهاز..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-right"
                data-testid="input-search-requests"
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
                  <SelectItem value="pending">في الانتظار</SelectItem>
                  <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
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
            <div>
              <Label className="block text-sm font-medium text-card-foreground mb-2">التاريخ</Label>
              <Input 
                type="date" 
                className="text-right"
                data-testid="input-filter-date"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">رقم الطلب</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الجهاز</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">المشكلة</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الحالة</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">التاريخ</th>
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
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    لا توجد طلبات صيانة
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request: ServiceRequest) => (
                  <tr key={request.id} className="hover:bg-muted/50" data-testid={`row-request-${request.id}`}>
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm text-primary font-medium">{request.requestNumber}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-card-foreground">{request.deviceName}</p>
                        <p className="text-sm text-muted-foreground">{request.model}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-card-foreground">{request.issue}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`status-badge status-${request.status === 'in_progress' ? 'in-progress' : request.status}`}>
                        {request.status === 'pending' ? 'في الانتظار' :
                         request.status === 'in_progress' ? 'قيد التنفيذ' :
                         request.status === 'completed' ? 'مكتمل' : 'ملغي'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-muted-foreground">
                        {request.createdAt ? new Date(request.createdAt).toLocaleDateString('ar-EG') : ''}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        {canUpdateRequests && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(request)}
                            className="p-2 text-chart-1 hover:bg-chart-1/10"
                            data-testid={`button-edit-request-${request.id}`}
                          >
                            <i className="bi bi-pencil text-sm"></i>
                          </Button>
                        )}
                        {canDeleteRequests && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(request.id)}
                            className="p-2 text-destructive hover:bg-destructive/10"
                            data-testid={`button-delete-request-${request.id}`}
                          >
                            <i className="bi bi-trash text-sm"></i>
                          </Button>
                        )}
                        {currentUser?.role === 'technician' && request.technicianId === currentUser.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddFollowUp(request)}
                            className="p-2 text-blue-600 hover:bg-blue-50"
                            data-testid={`button-add-followup-${request.id}`}
                          >
                            <i className="bi bi-chat-dots text-sm"></i>
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

      {/* Follow-up Dialog */}
      <Dialog open={isFollowUpDialogOpen} onOpenChange={setIsFollowUpDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة متابعة</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitFollowUp} className="space-y-4">
            <div>
              <Label>تفاصيل المتابعة</Label>
              <Textarea
                value={followUpText}
                onChange={(e) => setFollowUpText(e.target.value)}
                placeholder="اكتب تفاصيل المتابعة هنا..."
                required
                className="text-right min-h-[100px]"
                data-testid="textarea-followup-text"
              />
            </div>
            <div>
              <Label>تحديث حالة الطلب (اختياري)</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger data-testid="select-new-status">
                  <SelectValue placeholder="اختر حالة جديدة للطلب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">في الانتظار</SelectItem>
                  <SelectItem value="in_progress">قيد التقدم</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={createFollowUpMutation.isPending}
                data-testid="button-submit-followup"
              >
                {createFollowUpMutation.isPending ? "جارٍ الإضافة..." : "إضافة المتابعة"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsFollowUpDialogOpen(false)}
                data-testid="button-cancel-followup"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
