import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function WaitingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="w-full max-w-md p-8 bg-card rounded-lg shadow-xl border border-border text-center">
        <div className="w-24 h-12 mx-auto mb-6 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-lg">Sokany</span>
        </div>
        
        <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
          <i className="bi bi-clock text-2xl text-primary"></i>
        </div>
        
        <h1 className="text-2xl font-bold text-card-foreground mb-4">في انتظار الموافقة</h1>
        
        <div className="p-4 bg-accent rounded-lg border border-border mb-6">
          <i className="bi bi-info-circle text-primary text-lg mb-2"></i>
          <p className="text-accent-foreground text-sm">
            سوف يتم التواصل معك في أقرب وقت
          </p>
        </div>
        
        <p className="text-muted-foreground mb-6">
          تم استلام طلب إنشاء حسابك بنجاح وسيتم مراجعته من قبل المسؤول
        </p>
        
        <Button 
          onClick={() => setLocation("/login")}
          variant="secondary"
          className="w-full"
          data-testid="button-back-to-login"
        >
          العودة إلى تسجيل الدخول
        </Button>
      </div>
    </div>
  );
}
