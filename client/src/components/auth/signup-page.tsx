import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiPost } from "../../lib/db";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiPost('/api/auth/register', formData);
      toast({
        title: "تم إنشاء الحساب",
        description: "سيتم مراجعة طلبك قريباً",
      });
      setLocation("/waiting");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء الحساب",
        description: "حدث خطأ أثناء إنشاء الحساب، حاول مرة أخرى",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="w-full max-w-md p-8 bg-card rounded-lg shadow-xl border border-border">
        <div className="text-center mb-8">
          <div className="w-24 h-12 mx-auto mb-4 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">Sokany</span>
          </div>
          <h1 className="text-2xl font-bold text-card-foreground mb-2">إنشاء حساب جديد</h1>
          <p className="text-muted-foreground">انضم إلى شبكة مراكز الصيانة المعتمدة</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-card-foreground">الاسم بالكامل</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="أدخل اسمك الكامل"
              required
              data-testid="input-fullname"
              className="text-right"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-card-foreground">رقم الهاتف</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="01xxxxxxxxx"
              required
              data-testid="input-phone"
              className="text-right"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address" className="text-card-foreground">العنوان</Label>
            <Textarea
              id="address"
              name="address"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              placeholder="أدخل عنوانك بالتفصيل"
              data-testid="textarea-address"
              className="text-right resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-card-foreground">البريد الإلكتروني</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              required
              data-testid="input-email"
              className="text-right"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-card-foreground">كلمة المرور</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              data-testid="input-password"
              className="text-right"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
            data-testid="button-signup"
          >
            {isLoading ? "جاري الإنشاء..." : "إنشاء حساب"}
          </Button>
        </form>
        
        <p className="mt-6 text-center text-sm text-muted-foreground">
          لديك حساب بالفعل؟{" "}
          <Button 
            variant="link" 
            className="p-0 h-auto font-medium"
            onClick={() => setLocation("/login")}
            data-testid="link-login"
          >
            تسجيل الدخول
          </Button>
        </p>
      </div>
    </div>
  );
}
