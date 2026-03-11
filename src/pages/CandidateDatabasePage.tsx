import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { mockCandidates } from "@/data/candidateMockData";
import { Candidate } from "@/types/candidate";
import { CandidateTable } from "@/components/candidates/CandidateTable";
import { CandidateFilters } from "@/components/candidates/CandidateFilters";
import { AddCandidateDialog } from "@/components/candidates/AddCandidateDialog";
import { useToast } from "@/hooks/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 10;

export default function CandidateDatabasePage() {
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Get unique positions for filter
  const positions = useMemo(() => {
    const posSet = new Set<string>();
    candidates.forEach((c) => {
      if (c.positionApplied) posSet.add(c.positionApplied);
    });
    return Array.from(posSet).sort();
  }, [candidates]);

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        candidate.fullName.toLowerCase().includes(searchLower) ||
        candidate.email.toLowerCase().includes(searchLower) ||
        candidate.phone.includes(searchTerm);

      // Position filter
      const matchesPosition = positionFilter === "all" || candidate.positionApplied === positionFilter;

      // Category filter
      const matchesCategory = categoryFilter === "all" || candidate.category === categoryFilter;

      return matchesSearch && matchesPosition && matchesCategory;
    });
  }, [candidates, searchTerm, positionFilter, categoryFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCandidates.length / ITEMS_PER_PAGE);
  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCandidates.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCandidates, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleAddCandidate = (newCandidate: Omit<Candidate, "id" | "createdAt" | "updatedAt">) => {
    const candidate: Candidate = {
      ...newCandidate,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCandidates((prev) => [candidate, ...prev]);

    // Show toast notification
    toast({
      title: "Thêm ứng viên thành công",
      description: `${candidate.fullName} đã được thêm vào database.`,
    });

    // If Potential, show additional notification (simulating Discord notification)
    if (candidate.category === "Potential") {
      setTimeout(() => {
        toast({
          title: "🔔 Thông báo Potential CV",
          description: `CV tiềm năng "${candidate.fullName}" đã được gửi đến kênh potential-cv.`,
          variant: "default",
        });
      }, 500);
    }
  };

  const handleDeleteCandidate = (candidate: Candidate) => {
    setCandidates((prev) => prev.filter((c) => c.id !== candidate.id));
    toast({
      title: "Đã xóa ứng viên",
      description: `${candidate.fullName} đã được xóa khỏi database.`,
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Database Candidates</h1>
            <p className="text-sm text-muted-foreground">Danh sách tất cả ứng viên trong hệ thống</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm ứng viên
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <CandidateFilters
            searchTerm={searchTerm}
            onSearchChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
            positionFilter={positionFilter}
            onPositionChange={(value) => {
              setPositionFilter(value);
              setCurrentPage(1);
            }}
            categoryFilter={categoryFilter}
            onCategoryChange={(value) => {
              setCategoryFilter(value);
              setCurrentPage(1);
            }}
            positions={positions}
          />
          <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
            <Users className="h-4 w-4" />
            Tổng: <span className="font-semibold text-foreground">{filteredCandidates.length}</span> ứng viên
          </div>
        </div>

        {/* Table */}
        <CandidateTable candidates={paginatedCandidates} onDelete={handleDeleteCandidate} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Trang {currentPage} / {totalPages} ({filteredCandidates.length} kết quả)
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {getPageNumbers().map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Add Candidate Dialog */}
      <AddCandidateDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSubmit={handleAddCandidate} />
    </MainLayout>
  );
}
