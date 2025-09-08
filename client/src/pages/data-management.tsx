import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, FileJson, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { queryClient } from "@/lib/queryClient";

export default function DataManagement() {
  const { toast } = useToast();
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<any>(null);

  const exportDataMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/export", {
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "فشل تصدير البيانات");
      }
      
      // Convert response to blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sokany-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "نجح التصدير",
        description: "تم تصدير البيانات بنجاح"
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في التصدير",
        description: error.message || "حدث خطأ أثناء تصدير البيانات",
        variant: "destructive"
      });
    }
  });

  const importDataMutation = useMutation({
    mutationFn: async (fileData: any) => {
      const response = await fetch("/api/import", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(fileData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "فشل استيراد البيانات");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setImportResults(data.imported);
      toast({
        title: "نجح الاستيراد",
        description: "تم استيراد البيانات بنجاح"
      });
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الاستيراد",
        description: error.message || "حدث خطأ أثناء استيراد البيانات",
        variant: "destructive"
      });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json') {
        toast({
          title: "نوع ملف غير صحيح",
          description: "يجب أن يكون الملف بصيغة JSON",
          variant: "destructive"
        });
        return;
      }
      setImportFile(file);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast({
        title: "لم يتم اختيار ملف",
        description: "الرجاء اختيار ملف للاستيراد",
        variant: "destructive"
      });
      return;
    }

    try {
      const fileContent = await importFile.text();
      const data = JSON.parse(fileContent);
      importDataMutation.mutate(data);
    } catch (error) {
      toast({
        title: "خطأ في قراءة الملف",
        description: "تأكد من أن الملف صحيح وبصيغة JSON",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <h1 className="text-3xl font-bold mb-6">إدارة البيانات</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              تصدير البيانات
            </CardTitle>
            <CardDescription>
              قم بتصدير جميع بيانات النظام كملف JSON للنسخ الاحتياطي
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>معلومة مهمة</AlertTitle>
              <AlertDescription>
                سيتم تصدير جميع البيانات بما في ذلك المستخدمين، مراكز الخدمة، العملاء، الفئات، المنتجات، المخازن، وطلبات الصيانة.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => exportDataMutation.mutate()}
              disabled={exportDataMutation.isPending}
              className="w-full"
            >
              <Download className="h-4 w-4 ml-2" />
              {exportDataMutation.isPending ? "جاري التصدير..." : "تصدير جميع البيانات"}
            </Button>
          </CardContent>
        </Card>

        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              استيراد البيانات
            </CardTitle>
            <CardDescription>
              قم باستيراد البيانات من ملف JSON سابق
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">تحذير</AlertTitle>
              <AlertDescription className="text-yellow-700">
                استيراد البيانات قد يؤدي إلى تكرار البيانات الموجودة. تأكد من أخذ نسخة احتياطية قبل الاستيراد.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <div>
                <Input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
                {importFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    الملف المحدد: {importFile.name}
                  </p>
                )}
              </div>
              
              <Button 
                onClick={handleImport}
                disabled={!importFile || importDataMutation.isPending}
                className="w-full"
              >
                <Upload className="h-4 w-4 ml-2" />
                {importDataMutation.isPending ? "جاري الاستيراد..." : "استيراد البيانات"}
              </Button>
            </div>

            {importResults && (
              <Card className="mt-4 bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800 text-lg">نتائج الاستيراد</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-green-700">
                    <li>المستخدمين: {importResults.users || 0}</li>
                    <li>مراكز الخدمة: {importResults.serviceCenters || 0}</li>
                    <li>العملاء: {importResults.customers || 0}</li>
                    <li>الفئات: {importResults.categories || 0}</li>
                    <li>المنتجات: {importResults.products || 0}</li>
                    <li>المخازن: {importResults.warehouses || 0}</li>
                    <li>طلبات الصيانة: {importResults.serviceRequests || 0}</li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            تعليمات الاستخدام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">للتصدير:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>اضغط على زر "تصدير جميع البيانات"</li>
                <li>سيتم تحميل ملف JSON يحتوي على جميع البيانات</li>
                <li>احتفظ بهذا الملف في مكان آمن كنسخة احتياطية</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold mb-2">للاستيراد:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>اختر ملف JSON الذي تم تصديره سابقاً</li>
                <li>اضغط على زر "استيراد البيانات"</li>
                <li>انتظر حتى تكتمل عملية الاستيراد</li>
                <li>ستظهر نتائج الاستيراد بعد الانتهاء</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}