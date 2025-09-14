import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Search, 
  Users, 
  Grid3X3, 
  List, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown,
  X,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Building2,
  User,
  DollarSign
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EmployeeCard from "@/components/EmployeeCard";
import type { EmployeeDirectoryItem, DirectoryResponse, DirectoryFilters } from "@shared/schema";

export default function EmployeeDirectory() {
  const [, setLocation] = useLocation();
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"name" | "department" | "position" | "hireDate">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDirectoryItem | null>(null);
  
  const pageSize = 20;

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  useMemo(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build filters object
  const filters: DirectoryFilters = {
    query: debouncedQuery || undefined,
    department: selectedDepartment || undefined,
    role: selectedRole as any || undefined,
    status: selectedStatus as any,
    page: currentPage,
    limit: pageSize,
    sortBy,
    sortOrder,
  };

  // Fetch employees data
  const { 
    data: directoryData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['/api/hr/employees', filters],
    queryFn: async (): Promise<DirectoryResponse> => {
      const searchParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/hr/employees?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      return response.json();
    },
  });

  // Employee details query
  const { 
    data: selectedEmployeeDetails,
    isLoading: isLoadingDetails 
  } = useQuery({
    queryKey: ['/api/hr/employees', selectedEmployee?.id],
    queryFn: async (): Promise<EmployeeDirectoryItem> => {
      const response = await fetch(`/api/hr/employees/${selectedEmployee?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch employee details');
      }
      return response.json();
    },
    enabled: !!selectedEmployee?.id,
  });

  const handleViewEmployeeDetails = (id: string) => {
    const employee = directoryData?.employees.find(emp => emp.id === id);
    if (employee) {
      setSelectedEmployee(employee);
    }
  };

  const handleEditEmployee = (id: string) => {
    // TODO: Navigate to employee edit page
    alert(`Edit employee: ${id}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDepartment("");
    setSelectedRole("");
    setSelectedStatus("active");
    setCurrentPage(1);
    setSortBy("name");
    setSortOrder("asc");
  };

  const hasActiveFilters = debouncedQuery || selectedDepartment || selectedRole || selectedStatus !== "active";

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatSalary = (amount?: number) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load employee directory. Please try again.
            </AlertDescription>
          </Alert>
          <Button onClick={() => refetch()} className="mt-4" data-testid="button-retry">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Employee Directory</h1>
              <p className="text-muted-foreground">
                Find and connect with your colleagues
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setLocation("/staff/dashboard")}
              data-testid="button-back-dashboard"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="space-y-6">
          
          {/* Filters Bar */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <CardTitle className="text-lg">Filters</CardTitle>
                </div>
                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    data-testid="button-clear-filters"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="input-search"
                  />
                </div>

                {/* Department Filter */}
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger data-testid="select-department">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    {directoryData?.facets.departments.map(dept => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.value} ({dept.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Role Filter */}
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger data-testid="select-role">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Roles</SelectItem>
                    {directoryData?.facets.roles.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.value} ({role.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                    <SelectItem value="all">All Employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Results Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium" data-testid="text-result-count">
                  {isLoading ? "Loading..." : `${directoryData?.totalCount || 0} employees`}
                </span>
              </div>
              
              {hasActiveFilters && (
                <Badge variant="secondary" className="text-xs">
                  Filtered
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [newSortBy, newSortOrder] = value.split('-') as [typeof sortBy, typeof sortOrder];
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}>
                <SelectTrigger className="w-40" data-testid="select-sort">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                  <SelectItem value="department-asc">Department A-Z</SelectItem>
                  <SelectItem value="department-desc">Department Z-A</SelectItem>
                  <SelectItem value="position-asc">Position A-Z</SelectItem>
                  <SelectItem value="position-desc">Position Z-A</SelectItem>
                  <SelectItem value="hireDate-desc">Newest First</SelectItem>
                  <SelectItem value="hireDate-asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none border-r"
                  data-testid="button-view-grid"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                  data-testid="button-view-list"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="space-y-4">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-64 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              )}
            </div>
          ) : directoryData?.employees.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No employees found</h3>
                <p className="text-muted-foreground text-center">
                  Try adjusting your search criteria or clearing the filters
                </p>
                {hasActiveFilters && (
                  <Button 
                    variant="outline" 
                    onClick={clearFilters} 
                    className="mt-4"
                    data-testid="button-clear-no-results"
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="container-grid-results">
                  {directoryData?.employees.map((employee) => (
                    <EmployeeCard
                      key={employee.id}
                      id={employee.id}
                      fullName={employee.fullName}
                      position={employee.position}
                      department={employee.department}
                      email={employee.email}
                      phone={employee.phone}
                      hireDate={employee.hireDate}
                      salary={employee.salary}
                      isActive={employee.isActive}
                      onViewDetails={handleViewEmployeeDetails}
                      onEditEmployee={handleEditEmployee}
                    />
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <Card data-testid="container-list-results">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {directoryData?.employees.map((employee) => (
                        <TableRow key={employee.id} data-testid={`row-employee-${employee.id}`}>
                          <TableCell className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {getInitials(employee.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{employee.fullName}</div>
                              <div className="text-sm text-muted-foreground">{employee.employeeId}</div>
                            </div>
                          </TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell>{employee.position}</TableCell>
                          <TableCell>
                            <a href={`mailto:${employee.email}`} className="text-primary hover:underline">
                              {employee.email}
                            </a>
                          </TableCell>
                          <TableCell>
                            {employee.phone ? (
                              <a href={`tel:${employee.phone}`} className="text-primary hover:underline">
                                {employee.phone}
                              </a>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={employee.isActive ? "default" : "secondary"}>
                              {employee.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewEmployeeDetails(employee.id)}
                              data-testid={`button-view-${employee.id}`}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}

              {/* Pagination */}
              {directoryData && directoryData.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, directoryData.totalCount)} of {directoryData.totalCount} employees
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      data-testid="button-prev-page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <span className="text-sm font-medium px-3" data-testid="text-page-info">
                      Page {currentPage} of {directoryData.totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(directoryData.totalPages, prev + 1))}
                      disabled={currentPage === directoryData.totalPages}
                      data-testid="button-next-page"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Employee Details Dialog */}
      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="max-w-2xl" data-testid="dialog-employee-details">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          
          {isLoadingDetails ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : selectedEmployeeDetails ? (
            <div className="space-y-6 py-4">
              {/* Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {getInitials(selectedEmployeeDetails.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{selectedEmployeeDetails.fullName}</h2>
                  <p className="text-muted-foreground">{selectedEmployeeDetails.position}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={selectedEmployeeDetails.isActive ? "default" : "secondary"}>
                      {selectedEmployeeDetails.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">{selectedEmployeeDetails.role}</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2" data-testid="detail-email">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${selectedEmployeeDetails.email}`} className="text-primary hover:underline">
                      {selectedEmployeeDetails.email}
                    </a>
                  </div>
                  {selectedEmployeeDetails.phone && (
                    <div className="flex items-center gap-2" data-testid="detail-phone">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${selectedEmployeeDetails.phone}`} className="text-primary hover:underline">
                        {selectedEmployeeDetails.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Employment Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Employment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2" data-testid="detail-employee-id">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Employee ID: {selectedEmployeeDetails.employeeId}</span>
                  </div>
                  <div className="flex items-center gap-2" data-testid="detail-department">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Department: {selectedEmployeeDetails.department}</span>
                  </div>
                  <div className="flex items-center gap-2" data-testid="detail-hire-date">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Hire Date: {formatDate(selectedEmployeeDetails.hireDate)}</span>
                  </div>
                  {selectedEmployeeDetails.salary && (
                    <div className="flex items-center gap-2" data-testid="detail-salary">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Salary: {formatSalary(selectedEmployeeDetails.salary)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}