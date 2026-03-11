import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { BDReportStats } from "@/components/customers/BDReportStats";
import { StatusOverviewStats } from "@/components/customers/StatusOverviewStats";
import { DomainSuccessChart } from "@/components/customers/DomainSuccessChart";
import { SalesCycleChart } from "@/components/customers/SalesCycleChart";
import { BDKPIRankings } from "@/components/customers/BDKPIRankings";
import { TopContractCustomers } from "@/components/customers/TopContractCustomers";
import { JobSourceChart } from "@/components/customers/JobSourceChart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockCustomers } from "@/data/mockData";
import { BarChart3, ArrowLeft, Trophy, Building2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CustomerStatsPage() {
  const navigate = useNavigate();
  const [customers] = useState(mockCustomers);
  const [statsViewMode, setStatsViewMode] = useState<"personal" | "team">("personal");

  // Giả sử BD đang đăng nhập có id = '1'
  const currentBdId = "1";

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 h-full">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
              <BarChart3 className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">CRM Statistic</h1>
              <p className="text-muted-foreground">Báo cáo tổng quan và phân tích chiến lược BD</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Tabs value={statsViewMode} onValueChange={(v) => setStatsViewMode(v as "personal" | "team")}>
              <TabsList>
                <TabsTrigger value="personal">Cá nhân</TabsTrigger>
                <TabsTrigger value="team">Toàn đội</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" onClick={() => navigate("/bd-crm/customers")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Danh sách
            </Button>
          </div>
        </div>

        {/* Row 1: BD Report & Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">BD Report</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <BDReportStats
                customers={customers}
                bdFilter={statsViewMode === "personal" ? currentBdId : "all"}
                compact
              />
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Thống kê theo Status</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <StatusOverviewStats
                customers={customers}
                bdFilter={statsViewMode === "personal" ? currentBdId : "all"}
              />
            </CardContent>
          </Card>
        </div>

        {/* Personal Mode Layout */}
        {statsViewMode === "personal" && (
          <>
            {/* Row 2: Domain Success & Sales Cycle - 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Tỉ lệ Deal theo Domain</CardTitle>
                  <p className="text-xs text-muted-foreground">Domain nào có khả năng thành công cao nhất</p>
                </CardHeader>
                <CardContent className="flex-1 min-h-[300px]">
                  <DomainSuccessChart customers={customers} bdFilter={currentBdId} />
                </CardContent>
              </Card>

              <Card className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Chu kỳ Sales trung bình</CardTitle>
                  <p className="text-xs text-muted-foreground">Thời gian từ tiếp cận đến ký hợp đồng</p>
                </CardHeader>
                <CardContent className="flex-1 min-h-[300px]">
                  <SalesCycleChart customers={customers} bdFilter={currentBdId} />
                </CardContent>
              </Card>
            </div>

            {/* Row 3: Personal Signed Customers - Full width */}
            <Card className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Khách hàng Thân thiết
                </CardTitle>
                <p className="text-xs text-muted-foreground">Danh sách khách hàng bạn đã ký hợp đồng thành công</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <TopContractCustomers customers={customers} bdFilter={currentBdId} />
              </CardContent>
            </Card>
          </>
        )}

        {/* Team Mode Layout */}
        {statsViewMode === "team" && (
          <>
            {/* Row 2: Analytics Charts - 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Tỉ lệ Deal theo Domain</CardTitle>
                  <p className="text-xs text-muted-foreground">Domain nào có khả năng thành công cao nhất</p>
                </CardHeader>
                <CardContent className="flex-1 min-h-[350px]">
                  <DomainSuccessChart customers={customers} bdFilter="all" />
                </CardContent>
              </Card>

              <Card className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Chu kỳ Sales trung bình</CardTitle>
                  <p className="text-xs text-muted-foreground">Thời gian từ tiếp cận đến ký hợp đồng</p>
                </CardHeader>
                <CardContent className="flex-1 min-h-[350px]">
                  <SalesCycleChart customers={customers} bdFilter="all" />
                </CardContent>
              </Card>
            </div>

            {/* BD KPI Rankings */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  Xếp hạng KPI BD
                </CardTitle>
                <p className="text-xs text-muted-foreground">Thống kê và xếp hạng năng suất làm việc của từng BD</p>
              </CardHeader>
              <CardContent>
                <BDKPIRankings customers={customers} />
              </CardContent>
            </Card>

            {/* Row 4: Top Customers and Job Sources - 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    Top khách hàng ký hợp đồng
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Công ty có số lượng vị trí tuyển dụng cao nhất</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <TopContractCustomers customers={customers} bdFilter="all" />
                </CardContent>
              </Card>

              <Card className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-info" />
                    Thống kê nguồn Job
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Nguồn job nào mang lại nhiều khách hàng nhất</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <JobSourceChart customers={customers} />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
