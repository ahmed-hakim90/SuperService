import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/db";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Transfer {
  id: string;
  transferNumber: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  sparePartId: string;
  quantity: number;
  reason: string;
  status: "pending" | "approved" | "in_transit" | "completed" | "cancelled";
  requestedBy: string;
  approvedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

interface InsertTransfer {
  transferNumber: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  sparePartId: string;
  quantity: number;
  reason: string;
  status?: "pending" | "approved" | "in_transit" | "completed" | "cancelled";
  requestedBy: string;
  notes?: string;
}

// Mock data for transfers
const mockTransfers: Transfer[] = [
  {
    id: "trans-1",
    transferNumber: "TR-2024-001",
    fromWarehouseId: "warehouse-1",
    toWarehouseId: "warehouse-2",
    sparePartId: "part-1",
    quantity: 5,
    reason: "نقص في المخزون",
    status: "pending",
    requestedBy: "user-1",
    notes: "نقل عاجل مطلوب",
    createdAt: new Date("2024-09-01"),
    updatedAt: new Date("2024-09-01")
  },
  {
    id: "trans-2", 
    transferNumber: "TR-2024-002",
    fromWarehouseId: "warehouse-2",
    toWarehouseId: "warehouse-1",
    sparePartId: "part-2",
    quantity: 3,
    reason: "طلب من فني",
    status: "completed",
    requestedBy: "user-2",
    approvedBy: "user-1",
    notes: "تم النقل بنجاح",
    createdAt: new Date("2024-08-28"),
    updatedAt: new Date("2024-09-02"),
    completedAt: new Date("2024-09-02")
  }
];

// Mock spare parts data
const mockSpareParts = [
  { id: "part-1", name: "محرك غسالة", partNumber: "MT-001" },
  { id: "part-2", name: "ضاغط ثلاجة", partNumber: "CP-002" },
  { id: "part-3", name: "مضخة مياه", partNumber: "WP-003" }
];

// Mock warehouses data
const mockWarehouses = [
  { id: "warehouse-1", name: "مخزن الرياض الرئيسي", location: "الرياض" },
  { id: "warehouse-2", name: "مخزن جدة", location: "جدة" },
  { id: "warehouse-3", name: "مخزن الدمام", location: "الدمام" }
];

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  approved: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300", 
  in_transit: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
};

const statusLabels = {
  pending: "في الانتظار",
  approved: "موافق عليه",
  in_transit: "في الطريق", 
  completed: "مكتمل",
  cancelled: "ملغي"
};

export default function Transfers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null);
  const [formData, setFormData] = useState<Partial<InsertTransfer>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock API calls - replace with real API calls
  const transfers = mockTransfers;
  const spareParts = mockSpareParts;
  const warehouses = mockWarehouses;

  const createTransferMutation = {
    mutate: (data: InsertTransfer) => {
      // Mock creation
      setIsAddDialogOpen(false);
      setFormData({});
      toast({ title: "تم إنشاء طلب التحويل بنجاح" });
    }
  };

  const updateTransferMutation = {
    mutate: ({ id, data }: { id: string; data: Partial<InsertTransfer> }) => {
      // Mock update
      setEditingTransfer(null);
      setFormData({});
      toast({ title: "تم تحديث طلب التحويل بنجاح" });
    }
  };

  const deleteTransferMutation = {
    mutate: (id: string) => {
      // Mock delete
      toast({ title: "تم حذف طلب التحويل بنجاح" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTransfer) {
      updateTransferMutation.mutate({ id: editingTransfer.id, data: formData });
    } else {
      const transferNumber = `TR-2024-${String(transfers.length + 1).padStart(3, '0')}`;
      createTransferMutation.mutate({
        ...formData,
        transferNumber,
        requestedBy: "current-user"
      } as InsertTransfer);
    }
  };

  const handleEdit = (transfer: Transfer) => {
    setEditingTransfer(transfer);
    setFormData({
      fromWarehouseId: transfer.fromWarehouseId,
      toWarehouseId: transfer.toWarehouseId,
      sparePartId: transfer.sparePartId,
      quantity: transfer.quantity,
      reason: transfer.reason,
      notes: transfer.notes
    });
  };

  const handleStatusChange = (transferId: string, newStatus: string) => {
    updateTransferMutation.mutate({ 
      id: transferId, 
      data: { status: newStatus as any } 
    });
  };

  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = transfer.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || transfer.status === statusFilter;
    const matchesWarehouse = warehouseFilter === "all" || 
                            transfer.fromWarehouseId === warehouseFilter || 
                            transfer.toWarehouseId === warehouseFilter;
    
    return matchesSearch && matchesStatus && matchesWarehouse;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">تحويل قطع الغيار</h1>
        <p className="text-muted-foreground">إدارة تحويل قطع الغيار بين المخازن</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="البحث برقم التحويل أو السبب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search-transfers"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-status-filter">
            <SelectValue placeholder="تصفية بالحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="pending">في الانتظار</SelectItem>
            <SelectItem value="approved">موافق عليه</SelectItem>
            <SelectItem value="in_transit">في الطريق</SelectItem>
            <SelectItem value="completed">مكتمل</SelectItem>
            <SelectItem value="cancelled">ملغي</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-warehouse-filter">
            <SelectValue placeholder="تصفية بالمخزن" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المخازن</SelectItem>
            {warehouses.map(warehouse => (
              <SelectItem key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-transfer">
              <i className="bi bi-plus-circle ml-2"></i>
              طلب تحويل جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTransfer ? "تعديل طلب التحويل" : "طلب تحويل جديد"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromWarehouse">من مخزن</Label>
                  <Select 
                    value={formData.fromWarehouseId || ""} 
                    onValueChange={(value) => setFormData({...formData, fromWarehouseId: value})}
                  >
                    <SelectTrigger data-testid="select-from-warehouse">
                      <SelectValue placeholder="اختر المخزن المرسل" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map(warehouse => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="toWarehouse">إلى مخزن</Label>
                  <Select 
                    value={formData.toWarehouseId || ""} 
                    onValueChange={(value) => setFormData({...formData, toWarehouseId: value})}
                  >
                    <SelectTrigger data-testid="select-to-warehouse">
                      <SelectValue placeholder="اختر المخزن المستقبل" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map(warehouse => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sparePart">قطعة الغيار</Label>
                  <Select 
                    value={formData.sparePartId || ""} 
                    onValueChange={(value) => setFormData({...formData, sparePartId: value})}
                  >
                    <SelectTrigger data-testid="select-spare-part">
                      <SelectValue placeholder="اختر قطعة الغيار" />
                    </SelectTrigger>
                    <SelectContent>
                      {spareParts.map(part => (
                        <SelectItem key={part.id} value={part.id}>
                          {part.name} ({part.partNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantity">الكمية</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity || ""}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                    placeholder="أدخل الكمية"
                    required
                    data-testid="input-quantity"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason">سبب التحويل</Label>
                <Input
                  id="reason"
                  value={formData.reason || ""}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="أدخل سبب التحويل"
                  required
                  data-testid="input-reason"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="ملاحظات إضافية (اختياري)"
                  rows={3}
                  data-testid="textarea-notes"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingTransfer(null);
                  setFormData({});
                }}>
                  إلغاء
                </Button>
                <Button type="submit" data-testid="button-submit-transfer">
                  {editingTransfer ? "تحديث" : "إنشاء"} طلب التحويل
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {filteredTransfers.length === 0 ? (
          <div className="text-center py-12">
            <i className="bi bi-arrow-left-right text-4xl text-muted-foreground mb-4"></i>
            <h3 className="text-lg font-medium text-foreground mb-2">لا توجد طلبات تحويل</h3>
            <p className="text-muted-foreground mb-4">لم يتم العثور على أي طلبات تحويل مطابقة للبحث</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              إنشاء طلب تحويل جديد
            </Button>
          </div>
        ) : (
          filteredTransfers.map((transfer) => (
            <Card key={transfer.id} className="hover-scale">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-lg" data-testid={`text-transfer-number-${transfer.id}`}>
                      {transfer.transferNumber}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(transfer.createdAt), "d MMMM yyyy", { locale: ar })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={statusColors[transfer.status]} 
                      data-testid={`badge-status-${transfer.id}`}
                    >
                      {statusLabels[transfer.status]}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">من مخزن</p>
                    <p className="font-medium" data-testid={`text-from-warehouse-${transfer.id}`}>
                      {warehouses.find(w => w.id === transfer.fromWarehouseId)?.name || "غير محدد"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">إلى مخزن</p>
                    <p className="font-medium" data-testid={`text-to-warehouse-${transfer.id}`}>
                      {warehouses.find(w => w.id === transfer.toWarehouseId)?.name || "غير محدد"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">قطعة الغيار</p>
                    <p className="font-medium" data-testid={`text-spare-part-${transfer.id}`}>
                      {spareParts.find(p => p.id === transfer.sparePartId)?.name || "غير محدد"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">الكمية</p>
                    <p className="font-medium" data-testid={`text-quantity-${transfer.id}`}>
                      {transfer.quantity}
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground">سبب التحويل</p>
                  <p className="text-foreground" data-testid={`text-reason-${transfer.id}`}>
                    {transfer.reason}
                  </p>
                </div>
                
                {transfer.notes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground">ملاحظات</p>
                    <p className="text-foreground" data-testid={`text-notes-${transfer.id}`}>
                      {transfer.notes}
                    </p>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(transfer)}
                    data-testid={`button-edit-${transfer.id}`}
                  >
                    <i className="bi bi-pencil ml-2"></i>
                    تعديل
                  </Button>
                  
                  {transfer.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(transfer.id, "approved")}
                      data-testid={`button-approve-${transfer.id}`}
                    >
                      <i className="bi bi-check-circle ml-2"></i>
                      موافقة
                    </Button>
                  )}
                  
                  {transfer.status === "approved" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(transfer.id, "in_transit")}
                      data-testid={`button-in-transit-${transfer.id}`}
                    >
                      <i className="bi bi-truck ml-2"></i>
                      في الطريق
                    </Button>
                  )}
                  
                  {transfer.status === "in_transit" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(transfer.id, "completed")}
                      data-testid={`button-complete-${transfer.id}`}
                    >
                      <i className="bi bi-check-square ml-2"></i>
                      إكمال
                    </Button>
                  )}
                  
                  {(transfer.status === "pending" || transfer.status === "approved") && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleStatusChange(transfer.id, "cancelled")}
                      data-testid={`button-cancel-${transfer.id}`}
                    >
                      <i className="bi bi-x-circle ml-2"></i>
                      إلغاء
                    </Button>
                  )}
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteTransferMutation.mutate(transfer.id)}
                    data-testid={`button-delete-${transfer.id}`}
                  >
                    <i className="bi bi-trash ml-2"></i>
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}