import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { InstitutionHeader } from "@/components/management/InstitutionHeader";

const StockOverviewTab = () => {
  const inventory = [
    { id: "1", name: "Arduino Uno Boards", category: "Microcontrollers", quantity: 45, minStock: 20, status: "sufficient" },
    { id: "2", name: "Raspberry Pi 4", category: "SBC", quantity: 12, minStock: 15, status: "low" },
    { id: "3", name: "Sensors Kit", category: "Components", quantity: 8, minStock: 10, status: "critical" },
    { id: "4", name: "3D Printer Filament", category: "Materials", quantity: 35, minStock: 20, status: "sufficient" },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      sufficient: "default",
      low: "secondary",
      critical: "destructive",
    } as const;
    return variants[status as keyof typeof variants] || "secondary";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Stock Overview</h2>
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4">
        {inventory.map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <Package className="h-10 w-10 text-blue-500" />
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <Badge variant={getStatusBadge(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current Stock: </span>
                        <span className="font-medium">{item.quantity} units</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Min Stock: </span>
                        <span className="font-medium">{item.minStock} units</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Update Stock
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const PurchaseRequestsTab = () => {
  const requests = [
    {
      id: "1",
      officer: "Dr. Rajesh Kumar",
      items: "10x Arduino Mega, 5x Motor Driver Shields",
      estimatedCost: "₹25,000",
      requestDate: "2024-02-08",
      status: "pending" as const,
      priority: "high",
    },
    {
      id: "2",
      officer: "Ms. Priya Sharma",
      items: "3x Raspberry Pi 4, Camera Modules",
      estimatedCost: "₹18,500",
      requestDate: "2024-02-07",
      status: "approved" as const,
      priority: "medium",
    },
    {
      id: "3",
      officer: "Mr. Amit Patel",
      items: "Various sensors, breadboards",
      estimatedCost: "₹12,000",
      requestDate: "2024-02-06",
      status: "rejected" as const,
      priority: "low",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    } as const;
    return variants[status as keyof typeof variants] || "secondary";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Purchase Requests</h2>
        <div className="flex gap-2">
          <Badge variant="secondary">3 Pending</Badge>
          <Badge variant="default">5 Approved</Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {getStatusIcon(request.status)}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{request.officer}</h3>
                      <Badge variant={getStatusBadge(request.status)}>
                        {request.status}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {request.priority} priority
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{request.items}</p>
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Estimated Cost: </span>
                        <span className="font-medium">{request.estimatedCost}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Requested: </span>
                        <span className="font-medium">{request.requestDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {request.status === "pending" && (
                  <div className="flex gap-2">
                    <Button variant="default" size="sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button variant="destructive" size="sm">
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
                {request.status !== "pending" && (
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const AuditReportsTab = () => {
  const auditReports = [
    {
      id: "1",
      month: "January 2024",
      totalItems: 156,
      itemsAdded: 23,
      itemsUsed: 45,
      discrepancies: 2,
      generatedDate: "2024-02-01",
      status: "completed",
    },
    {
      id: "2",
      month: "December 2023",
      totalItems: 178,
      itemsAdded: 15,
      itemsUsed: 37,
      discrepancies: 0,
      generatedDate: "2024-01-01",
      status: "completed",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Audit Reports</h2>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Generate New Report
        </Button>
      </div>

      <div className="grid gap-4">
        {auditReports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{report.month}</CardTitle>
                <Badge variant="default">{report.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{report.totalItems}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Items Added</p>
                  <p className="text-2xl font-bold text-green-500">+{report.itemsAdded}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Items Used</p>
                  <p className="text-2xl font-bold text-blue-500">-{report.itemsUsed}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Discrepancies</p>
                  <p className={`text-2xl font-bold ${report.discrepancies > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {report.discrepancies}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">Generated on {report.generatedDate}</p>
                <Button variant="outline" size="sm">
                  Download Report
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const InventoryAndPurchase = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <InstitutionHeader />
        
        <div>
          <h1 className="text-3xl font-bold">Inventory & Purchase</h1>
          <p className="text-muted-foreground">Manage lab inventory and purchase requisitions</p>
        </div>

        <Tabs defaultValue="stock" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="stock">Stock Overview</TabsTrigger>
            <TabsTrigger value="purchase">Purchase Requests</TabsTrigger>
            <TabsTrigger value="audit">Audit Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="stock" className="mt-6">
            <StockOverviewTab />
          </TabsContent>
          <TabsContent value="purchase" className="mt-6">
            <PurchaseRequestsTab />
          </TabsContent>
          <TabsContent value="audit" className="mt-6">
            <AuditReportsTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default InventoryAndPurchase;
