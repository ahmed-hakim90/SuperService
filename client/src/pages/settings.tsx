import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [companySettings, setCompanySettings] = useState({
    name: "شركة سوكاني للأجهزة المنزلية",
    email: "info@sokany.com",
    phone: "+966112345678",
    address: "الرياض، المملكة العربية السعودية",
    website: "www.sokany.com",
    taxNumber: "1234567890"
  });

  const [systemSettings, setSystemSettings] = useState({
    language: "ar",
    timezone: "Asia/Riyadh",
    currency: "SAR",
    dateFormat: "dd/MM/yyyy",
    workingHours: "08:00-17:00"
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    newRequestAlert: true,
    completionAlert: true,
    inventoryAlert: true
  });

  const { toast } = useToast();

  const handleSaveCompany = () => {
    toast({ title: "تم حفظ إعدادات الشركة بنجاح" });
  };

  const handleSaveSystem = () => {
    toast({ title: "تم حفظ إعدادات النظام بنجاح" });
  };

  const handleSaveNotifications = () => {
    toast({ title: "تم حفظ إعدادات الإشعارات بنجاح" });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">الإعدادات</h1>
        <p className="text-muted-foreground">إدارة إعدادات النظام والشركة</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company">إعدادات الشركة</TabsTrigger>
          <TabsTrigger value="system">إعدادات النظام</TabsTrigger>
          <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="bi bi-building"></i>
                معلومات الشركة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">اسم الشركة</Label>
                  <Input
                    id="companyName"
                    value={companySettings.name}
                    onChange={(e) => setCompanySettings({...companySettings, name: e.target.value})}
                    data-testid="input-company-name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">البريد الإلكتروني</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
                    data-testid="input-company-email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">رقم الهاتف</Label>
                  <Input
                    id="companyPhone"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})}
                    data-testid="input-company-phone"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">الموقع الإلكتروني</Label>
                  <Input
                    id="companyWebsite"
                    value={companySettings.website}
                    onChange={(e) => setCompanySettings({...companySettings, website: e.target.value})}
                    data-testid="input-company-website"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="taxNumber">الرقم الضريبي</Label>
                  <Input
                    id="taxNumber"
                    value={companySettings.taxNumber}
                    onChange={(e) => setCompanySettings({...companySettings, taxNumber: e.target.value})}
                    data-testid="input-tax-number"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyAddress">العنوان</Label>
                <Textarea
                  id="companyAddress"
                  value={companySettings.address}
                  onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
                  rows={3}
                  data-testid="textarea-company-address"
                />
              </div>
              
              <Button onClick={handleSaveCompany} data-testid="button-save-company">
                <i className="bi bi-check-circle ml-2"></i>
                حفظ إعدادات الشركة
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="bi bi-gear"></i>
                إعدادات النظام العامة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">اللغة</Label>
                  <Select value={systemSettings.language} onValueChange={(value) => 
                    setSystemSettings({...systemSettings, language: value})}>
                    <SelectTrigger data-testid="select-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">المنطقة الزمنية</Label>
                  <Select value={systemSettings.timezone} onValueChange={(value) => 
                    setSystemSettings({...systemSettings, timezone: value})}>
                    <SelectTrigger data-testid="select-timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Riyadh">الرياض (GMT+3)</SelectItem>
                      <SelectItem value="Asia/Dubai">دبي (GMT+4)</SelectItem>
                      <SelectItem value="Asia/Kuwait">الكويت (GMT+3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">العملة</Label>
                  <Select value={systemSettings.currency} onValueChange={(value) => 
                    setSystemSettings({...systemSettings, currency: value})}>
                    <SelectTrigger data-testid="select-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                      <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                      <SelectItem value="KWD">دينار كويتي (KWD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">تنسيق التاريخ</Label>
                  <Select value={systemSettings.dateFormat} onValueChange={(value) => 
                    setSystemSettings({...systemSettings, dateFormat: value})}>
                    <SelectTrigger data-testid="select-date-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/MM/yyyy">يوم/شهر/سنة</SelectItem>
                      <SelectItem value="MM/dd/yyyy">شهر/يوم/سنة</SelectItem>
                      <SelectItem value="yyyy-MM-dd">سنة-شهر-يوم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="workingHours">ساعات العمل</Label>
                  <Input
                    id="workingHours"
                    value={systemSettings.workingHours}
                    onChange={(e) => setSystemSettings({...systemSettings, workingHours: e.target.value})}
                    placeholder="08:00-17:00"
                    data-testid="input-working-hours"
                  />
                </div>
              </div>
              
              <Button onClick={handleSaveSystem} data-testid="button-save-system">
                <i className="bi bi-check-circle ml-2"></i>
                حفظ إعدادات النظام
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="bi bi-bell"></i>
                إعدادات الإشعارات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium">الإشعارات بالبريد الإلكتروني</Label>
                    <p className="text-sm text-muted-foreground">استقبال إشعارات عبر البريد الإلكتروني</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                    data-testid="switch-email-notifications"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium">الإشعارات بالرسائل النصية</Label>
                    <p className="text-sm text-muted-foreground">استقبال إشعارات عبر الرسائل النصية</p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, smsNotifications: checked})}
                    data-testid="switch-sms-notifications"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium">تنبيه طلبات الصيانة الجديدة</Label>
                    <p className="text-sm text-muted-foreground">تنبيه عند وصول طلب صيانة جديد</p>
                  </div>
                  <Switch
                    checked={notificationSettings.newRequestAlert}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, newRequestAlert: checked})}
                    data-testid="switch-new-request-alert"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium">تنبيه إكمال الصيانة</Label>
                    <p className="text-sm text-muted-foreground">تنبيه عند اكتمال أعمال الصيانة</p>
                  </div>
                  <Switch
                    checked={notificationSettings.completionAlert}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, completionAlert: checked})}
                    data-testid="switch-completion-alert"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium">تنبيه المخزون</Label>
                    <p className="text-sm text-muted-foreground">تنبيه عند نفاد أو نقص المخزون</p>
                  </div>
                  <Switch
                    checked={notificationSettings.inventoryAlert}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, inventoryAlert: checked})}
                    data-testid="switch-inventory-alert"
                  />
                </div>
              </div>
              
              <Button onClick={handleSaveNotifications} data-testid="button-save-notifications">
                <i className="bi bi-check-circle ml-2"></i>
                حفظ إعدادات الإشعارات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="bi bi-shield-lock"></i>
                إعدادات الأمان
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">كلمة المرور</h3>
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="••••••••"
                      data-testid="input-current-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      data-testid="input-new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      data-testid="input-confirm-password"
                    />
                  </div>
                  <Button data-testid="button-change-password">
                    <i className="bi bi-key ml-2"></i>
                    تغيير كلمة المرور
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">إعدادات الجلسة</h3>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base font-medium">تسجيل الخروج التلقائي</Label>
                      <p className="text-sm text-muted-foreground">تسجيل الخروج بعد فترة عدم نشاط</p>
                    </div>
                    <Switch data-testid="switch-auto-logout" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base font-medium">التحقق بخطوتين</Label>
                      <p className="text-sm text-muted-foreground">تأمين إضافي للحساب</p>
                    </div>
                    <Switch data-testid="switch-two-factor" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">مدة الجلسة (بالدقائق)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      defaultValue="60"
                      min="15"
                      max="480"
                      data-testid="input-session-timeout"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}