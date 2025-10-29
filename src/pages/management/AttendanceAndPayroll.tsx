import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Calendar, DollarSign, Send } from "lucide-react";

const OfficerAttendanceTab = () => {
  const attendanceRecords = [
    {
      id: "1",
      officer: "Dr. Rajesh Kumar",
      date: "2024-02-10",
      checkIn: "09:00 AM",
      checkOut: "05:00 PM",
      hoursWorked: 8,
      status: "present" as const,
      sessionsCompleted: 2,
    },
    {
      id: "2",
      officer: "Ms. Priya Sharma",
      date: "2024-02-10",
      checkIn: "09:15 AM",
      checkOut: "04:45 PM",
      hoursWorked: 7.5,
      status: "present" as const,
      sessionsCompleted: 2,
    },
    {
      id: "3",
      officer: "Mr. Amit Patel",
      date: "2024-02-10",
      checkIn: "-",
      checkOut: "-",
      hoursWorked: 0,
      status: "absent" as const,
      sessionsCompleted: 0,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "absent":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      present: "default",
      absent: "destructive",
      leave: "secondary",
    } as const;
    return variants[status as keyof typeof variants] || "secondary";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Officer Attendance</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Select Date
          </Button>
          <Button variant="outline">Export</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-10 w-10 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Present Today</p>
                <p className="text-2xl font-bold">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <XCircle className="h-10 w-10 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Absent Today</p>
                <p className="text-2xl font-bold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Clock className="h-10 w-10 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Hours</p>
                <p className="text-2xl font-bold">7.8</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {attendanceRecords.map((record) => (
          <Card key={record.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {getStatusIcon(record.status)}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{record.officer}</h3>
                      <Badge variant={getStatusBadge(record.status)}>
                        {record.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Check In</p>
                        <p className="font-medium">{record.checkIn}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Check Out</p>
                        <p className="font-medium">{record.checkOut}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Hours Worked</p>
                        <p className="font-medium">{record.hoursWorked}h</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Sessions</p>
                        <p className="font-medium">{record.sessionsCompleted}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const PayrollReviewTab = () => {
  const payrollRecords = [
    {
      id: "1",
      officer: "Dr. Rajesh Kumar",
      month: "January 2024",
      hoursWorked: 160,
      sessionsCompleted: 24,
      ratePerHour: "₹500",
      totalAmount: "₹80,000",
      status: "pending_review" as const,
    },
    {
      id: "2",
      officer: "Ms. Priya Sharma",
      month: "January 2024",
      hoursWorked: 152,
      sessionsCompleted: 22,
      ratePerHour: "₹500",
      totalAmount: "₹76,000",
      status: "pending_review" as const,
    },
    {
      id: "3",
      officer: "Mr. Amit Patel",
      month: "December 2023",
      hoursWorked: 168,
      sessionsCompleted: 26,
      ratePerHour: "₹500",
      totalAmount: "₹84,000",
      status: "forwarded" as const,
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      pending_review: "secondary",
      forwarded: "default",
      approved: "outline",
    } as const;
    return variants[status as keyof typeof variants] || "secondary";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Payroll Review</h2>
        <Button>
          <Send className="h-4 w-4 mr-2" />
          Forward All to System Admin
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <DollarSign className="h-10 w-10 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Pending</p>
                <p className="text-2xl font-bold">₹1,56,000</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Clock className="h-10 w-10 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
                <p className="text-2xl font-bold">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-10 w-10 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Forwarded</p>
                <p className="text-2xl font-bold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {payrollRecords.map((record) => (
          <Card key={record.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{record.officer}</h3>
                    <Badge variant={getStatusBadge(record.status)}>
                      {record.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{record.month}</p>

                  <div className="grid grid-cols-5 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Hours Worked</p>
                      <p className="font-medium">{record.hoursWorked}h</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Sessions</p>
                      <p className="font-medium">{record.sessionsCompleted}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Rate/Hour</p>
                      <p className="font-medium">{record.ratePerHour}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-muted-foreground">Total Amount</p>
                      <p className="text-xl font-bold text-green-600">{record.totalAmount}</p>
                    </div>
                  </div>
                </div>

                {record.status === "pending_review" ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button size="sm">
                      <Send className="h-4 w-4 mr-1" />
                      Forward
                    </Button>
                  </div>
                ) : (
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

const AttendanceAndPayroll = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Attendance & Payroll</h1>
          <p className="text-muted-foreground">Verify officer attendance and review payrolls</p>
        </div>

        <Tabs defaultValue="attendance" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="attendance">Officer Attendance</TabsTrigger>
            <TabsTrigger value="payroll">Payroll Review</TabsTrigger>
          </TabsList>
          <TabsContent value="attendance" className="mt-6">
            <OfficerAttendanceTab />
          </TabsContent>
          <TabsContent value="payroll" className="mt-6">
            <PayrollReviewTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AttendanceAndPayroll;
