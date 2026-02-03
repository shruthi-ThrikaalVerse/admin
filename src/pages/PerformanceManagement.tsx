import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, TrendingUp, Calendar, AlertTriangle, Search,
  Star, Trophy, Award, Clock, Target, BarChart3,
  PieChart, Download, Filter, MoreVertical, ChevronRight,
  CheckCircle, XCircle, Clock as ClockIcon, UserCheck,
  TrendingDown, Eye, MessageSquare, Bell, Settings,
  ChevronLeft, ChevronRight as ChevronRightIcon, User, Briefcase,
  X, Activity, Zap, Target as TargetIcon, Award as AwardIcon,
  MessageCircle, FileText, TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon, MinusCircle
} from 'lucide-react';
import { useHRMS } from '../context/HRMSContext';

interface PerformanceData {
  id: string;
  name: string;
  role: string;
  department: string;
  performanceScore: number;
  kpiScore: number;
  taskCompletion: number;
  qualityScore: number;
  attendance: number;
  lastReview: string;
  status: 'exceeding' | 'meeting' | 'below' | 'needs-improvement';
  trend: 'up' | 'down' | 'stable';
  email: string;
  joinDate: string;
  manager: string;
  projects: number;
  achievements: string[];
  feedback: Array<{ date: string; comment: string; reviewer: string }>;
  goals: Array<{ title: string; progress: number; deadline: string }>;
}

interface DepartmentStats {
  name: string;
  employees: number;
  avgKPIScore: number;
  tasksCompleted: number;
  totalTasks: number;
  attendance: number;
  overallRating: number;
}

const EmployeePerformanceModal: React.FC<{
  employee: PerformanceData;
  onClose: () => void;
  onScheduleReview: (employeeName: string) => void;
}> = ({ employee, onClose, onScheduleReview }) => {
  const renderStars = (rating: number, maxStars = 5) => {
    const safeRating = Math.max(0, Math.min(maxStars, isNaN(rating) ? 0 : rating));
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 >= 0.5;
    const emptyStars = Math.max(0, maxStars - fullStars - (hasHalfStar ? 1 : 0));

    return (
      <div className="flex items-center">
        {Array.from({ length: Math.max(0, fullStars) }).map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 text-yellow-500 fill-current" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className="w-4 h-4 text-gray-300" />
            <div className="absolute left-0 top-0 overflow-hidden" style={{ width: '50%' }}>
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            </div>
          </div>
        )}
        {Array.from({ length: Math.max(0, emptyStars) }).map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-700">{safeRating.toFixed(1)}</span>
      </div>
    );
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 4.5) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (score >= 3.5) return 'text-blue-600 bg-blue-50 border-blue-100';
    if (score >= 2.5) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-rose-600 bg-rose-50 border-rose-100';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUpIcon className="w-4 h-4 text-emerald-500" />;
      case 'down': return <TrendingDownIcon className="w-4 h-4 text-rose-500" />;
      default: return <MinusCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {employee.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
              <p className="text-gray-600">{employee.role} • {employee.department}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Performance Score */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Performance Score</h3>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(employee.trend)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPerformanceColor(employee.performanceScore)}`}>
                      {employee.status.toUpperCase().replace('-', ' ')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <span className="text-4xl font-bold text-gray-900">{employee.performanceScore.toFixed(1)}</span>
                          <span className="text-gray-500">/5</span>
                          <div className="mt-2">
                            {renderStars(employee.performanceScore)}
                          </div>
                        </div>
                      </div>
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${(employee.performanceScore / 5) * 283} 283`}
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">KPI Score</p>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ width: `${employee.kpiScore}%` }}
                          />
                        </div>
                        <span className="text-lg font-bold text-gray-900">{employee.kpiScore}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Task Completion</p>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${employee.taskCompletion}%` }}
                          />
                        </div>
                        <span className="text-lg font-bold text-gray-900">{employee.taskCompletion}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Quality Score</p>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-amber-500 h-2 rounded-full"
                            style={{ width: `${employee.qualityScore}%` }}
                          />
                        </div>
                        <span className="text-lg font-bold text-gray-900">{employee.qualityScore}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Goals */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Current Goals</h3>
                {employee.goals.map((goal, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{goal.title}</h4>
                      <span className="text-sm text-gray-500">Due: {goal.deadline}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{goal.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Employee Details */}
            <div className="space-y-6">
              <div className="p-4 border border-gray-200 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{employee.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Join Date</p>
                    <p className="font-medium text-gray-900">{employee.joinDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Manager</p>
                    <p className="font-medium text-gray-900">{employee.manager}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Projects</p>
                    <p className="font-medium text-gray-900">{employee.projects}</p>
                  </div>
                </div>
              </div>

              {/* Attendance */}
              <div className="p-4 border border-gray-200 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance</h3>
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-3xl font-bold text-gray-900">{employee.attendance}%</span>
                      </div>
                    </div>
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${employee.attendance * 2.83} 283`}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">Current Month</p>
                </div>
              </div>

              {/* Achievements */}
              <div className="p-4 border border-gray-200 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
                <div className="space-y-2">
                  {employee.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <AwardIcon className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-gray-700">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
          >
            Close
          </button>
          <button
            onClick={() => {
              onScheduleReview(employee.name);
              onClose();
            }}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Schedule Review
          </button>
        </div>
      </div>
    </div>
  );
};

const EmployeePerformanceDashboard: React.FC = () => {
  const { employees, attendance, notify } = useHRMS();
  const [performanceDataState, setPerformanceData] = useState<PerformanceData[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentDate] = useState<string>(new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }));
  const [selectedEmployee, setSelectedEmployee] = useState<PerformanceData | null>(null);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState<boolean>(false);
  const [liveUpdates, setLiveUpdates] = useState<Array<{ message: string; time: string }>>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Convert real employees to performance data
  const loadPerformanceData = () => {
    if (employees.length === 0) return;

    // Map real employees to performance data
    const performanceDataList: PerformanceData[] = employees.map((emp, index) => {
      // Calculate performance score from employee data
      const leaveBalance = emp.leaveBalance || 0;
      const status = emp.status || 'active';

      // Base performance score
      let performanceScore = 4.0;

      // Adjust based on leave balance
      if (leaveBalance >= 15) performanceScore += 0.5;
      else if (leaveBalance <= 5) performanceScore -= 0.5;

      // Adjust based on status
      if (status === 'active') performanceScore += 0.2;
      else if (status === 'inactive') performanceScore -= 0.3;

      // Random variation for demo
      performanceScore += (Math.random() * 0.6) - 0.3;
      performanceScore = Math.max(1, Math.min(5, performanceScore));

      // Determine status
      const performanceStatus: 'exceeding' | 'meeting' | 'below' | 'needs-improvement' =
        performanceScore >= 4.5 ? 'exceeding' :
          performanceScore >= 3.5 ? 'meeting' :
            performanceScore >= 2.5 ? 'below' : 'needs-improvement';

      // Calculate attendance from actual attendance records
      const today = new Date().toISOString().split('T')[0];
      const empAttendance = attendance.filter(a =>
        a.employeeId === emp.employeeId || a.employeeId === emp.id
      );

      const attendanceCount = empAttendance.length;
      const presentCount = empAttendance.filter(a =>
        a.status === 'present' || a.status === 'late'
      ).length;

      const attendanceRate = attendanceCount > 0 ?
        Math.round((presentCount / attendanceCount) * 100) :
        85 + Math.random() * 15;

      return {
        id: emp.id || `emp-${index}`,
        name: emp.fullName,
        role: emp.designation || 'Employee',
        department: emp.department,
        performanceScore: parseFloat(performanceScore.toFixed(1)),
        kpiScore: Math.floor(60 + Math.random() * 40),
        taskCompletion: Math.floor(70 + Math.random() * 30),
        qualityScore: Math.floor(65 + Math.random() * 35),
        attendance: attendanceRate,
        lastReview: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: performanceStatus,
        trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down',
        email: emp.email,
        joinDate: emp.dateOfJoining || new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        manager: emp.reportingManager || 'Not Assigned',
        projects: Math.floor(1 + Math.random() * 10),
        achievements: [
          leaveBalance >= 20 ? 'Perfect Attendance Award' : null,
          performanceScore >= 4.5 ? 'High Performer' : null,
          'Team Contributor'
        ].filter(Boolean) as string[],
        feedback: [
          { date: '2024-03-15', comment: 'Good team player', reviewer: emp.reportingManager || 'Manager' },
          { date: '2024-02-28', comment: 'Meets expectations', reviewer: 'Supervisor' }
        ],
        goals: [
          { title: 'Complete Training', progress: Math.floor(Math.random() * 100), deadline: '2024-06-30' },
          { title: 'Improve Skills', progress: Math.floor(Math.random() * 100), deadline: '2024-08-15' }
        ]
      };
    });

    // Calculate department stats from real data
    const departments = [...new Set(employees.map(emp => emp.department))];
    const deptStats: DepartmentStats[] = departments.map(dept => {
      const deptEmployees = employees.filter(emp => emp.department === dept);
      const deptPerformance = performanceDataList.filter(p => p.department === dept);

      return {
        name: dept,
        employees: deptEmployees.length,
        avgKPIScore: deptPerformance.length > 0 ?
          Number((deptPerformance.reduce((sum, emp) => sum + emp.kpiScore, 0) / deptPerformance.length).toFixed(1)) : 75,
        tasksCompleted: Math.floor(deptEmployees.length * 45),
        totalTasks: Math.floor(deptEmployees.length * 50),
        attendance: deptPerformance.length > 0 ?
          Number((deptPerformance.reduce((sum, emp) => sum + emp.attendance, 0) / deptPerformance.length).toFixed(1)) : 85,
        overallRating: deptPerformance.length > 0 ?
          Number((deptPerformance.reduce((sum, emp) => sum + (emp.performanceScore / 5 * 100), 0) / deptPerformance.length).toFixed(1)) : 75
      };
    });

    setPerformanceData(performanceDataList);
    setDepartmentStats(deptStats);
    setLastUpdate(new Date());
  };

  // Initialize data
  useEffect(() => {
    loadPerformanceData();

    // Simulate live updates
    const interval = setInterval(() => {
      const updateMessages = [
        { message: 'Performance data updated', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { message: 'Attendance records synced', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { message: 'New performance reviews submitted', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ];

      setLiveUpdates(prev => [
        updateMessages[Math.floor(Math.random() * updateMessages.length)],
        ...prev.slice(0, 2)
      ]);
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [employees]);

  // Calculate overall stats from real data
  const totalEmployees = employees.length;
  const avgPerformance = performanceDataState.length > 0 ?
    parseFloat((performanceDataState.reduce((sum, emp) => sum + emp.performanceScore, 0) / performanceDataState.length).toFixed(1)) : 0;
  const avgAttendance = performanceDataState.length > 0 ?
    parseFloat((performanceDataState.reduce((sum, emp) => sum + emp.attendance, 0) / performanceDataState.length).toFixed(1)) : 0;
  const lowPerformers = performanceDataState.filter(emp => emp.performanceScore < 3).length;

  // Get top performers
  const topPerformers = [...performanceDataState]
    .filter(emp => emp.performanceScore >= 4.5)
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .slice(0, 3);

  // Get low performers
  const lowPerformersList = [...performanceDataState]
    .filter(emp => emp.performanceScore < 3)
    .sort((a, b) => a.performanceScore - b.performanceScore)
    .slice(0, 3);

  // Filter employees by search term
  const filteredPerformanceData = useMemo(() => {
    if (!searchTerm) return performanceDataState;

    return performanceDataState.filter(emp =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [performanceDataState, searchTerm]);

  // Filter by department
  const filteredByDepartment = useMemo(() => {
    if (selectedDepartment === 'All') return filteredPerformanceData;
    return filteredPerformanceData.filter(emp => emp.department === selectedDepartment);
  }, [filteredPerformanceData, selectedDepartment]);

  // Star rendering function
  const renderStars = (rating: number, maxStars = 5) => {
    const safeRating = Math.max(0, Math.min(maxStars, isNaN(rating) ? 0 : rating));
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 >= 0.5;
    const emptyStars = Math.max(0, maxStars - fullStars - (hasHalfStar ? 1 : 0));

    return (
      <div className="flex items-center">
        {Array.from({ length: Math.max(0, fullStars) }).map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 text-yellow-500 fill-current" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className="w-4 h-4 text-gray-300" />
            <div className="absolute left-0 top-0 overflow-hidden" style={{ width: '50%' }}>
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            </div>
          </div>
        )}
        {Array.from({ length: Math.max(0, emptyStars) }).map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-700">{safeRating.toFixed(1)}</span>
      </div>
    );
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 4.5) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (score >= 3.5) return 'text-blue-600 bg-blue-50 border-blue-100';
    if (score >= 2.5) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-rose-600 bg-rose-50 border-rose-100';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUpIcon className="w-4 h-4 text-emerald-500" />;
      case 'down': return <TrendingDownIcon className="w-4 h-4 text-rose-500" />;
      default: return <MinusCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleViewEmployee = (employee: PerformanceData) => {
    setSelectedEmployee(employee);
    setIsEmployeeModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEmployeeModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleScheduleReview = (employeeName: string) => {
    notify(`Performance review scheduled for ${employeeName}`, 'success');
  };

  const handleRefreshData = () => {
    loadPerformanceData();
    notify('Performance data refreshed', 'info');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Employee Performance Dashboard</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-gray-600">{currentDate}</p>
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                <Zap className="w-3 h-3" />
                <span>Live Data • {performanceDataState.length} Employees • Updated: {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm w-48 md:w-56"
              />
            </div>

            <button
              onClick={handleRefreshData}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Activity className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </button>

            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Live Updates */}
        {liveUpdates.length > 0 && (
          <div className="mb-4 p-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Live Updates</span>
            </div>
            <div className="flex items-center gap-4 overflow-x-auto">
              {liveUpdates.map((update, index) => (
                <div key={index} className="flex items-center gap-2 whitespace-nowrap">
                  <span className="text-xs text-gray-500">{update.time}</span>
                  <span className="text-xs text-gray-700">{update.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Total Employees */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Total Employees</h2>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalEmployees}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Avg Performance</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className="text-xl font-bold text-gray-900">{avgPerformance.toFixed(1)}</span>
                  <span className="text-gray-500">/ 5</span>
                </div>
                <div className="mt-1">
                  {renderStars(avgPerformance)}
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">Attendance</p>
                <div className="mt-1">
                  <span className="text-xl font-bold text-gray-900">{avgAttendance.toFixed(1)}%</span>
                </div>
                <div className="mt-1">
                  <div className="w-20 bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full"
                      style={{ width: `${avgAttendance}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">Low Performers</p>
                <div className="mt-1">
                  <span className="text-xl font-bold text-gray-900">{lowPerformers}</span>
                </div>
                <p className="text-xs text-rose-600 font-medium mt-0.5">Needs attention</p>
              </div>
            </div>
          </div>
        </div>

        {/* Department Performance & KPI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Department Performance */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Department-wise Performance</h2>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="All">All Departments</option>
                {departmentStats.map(dept => (
                  <option key={dept.name} value={dept.name}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Department</th>
                    <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Employees</th>
                    <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Avg KPI</th>
                    <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Tasks</th>
                    <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Attendance</th>
                    <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {departmentStats.map((dept) => (
                    <tr key={dept.name} className="hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded flex items-center justify-center ${dept.name === 'Sales' ? 'bg-blue-100 text-blue-600' :
                            dept.name === 'Development' ? 'bg-emerald-100 text-emerald-600' :
                              dept.name === 'Support' ? 'bg-amber-100 text-amber-600' :
                                dept.name === 'Marketing' ? 'bg-pink-100 text-pink-600' :
                                  'bg-purple-100 text-purple-600'
                            }`}>
                            <span className="text-xs font-bold">{dept.name.charAt(0)}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{dept.name}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-gray-900">{dept.employees}</span>
                      </td>
                      <td className="p-3">
                        <div className="w-20 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${dept.avgKPIScore}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-700 mt-1">{dept.avgKPIScore}%</span>
                      </td>
                      <td className="p-3">
                        {renderStars(dept.tasksCompleted / Math.max(dept.totalTasks, 1) * 5)}
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-gray-900">{dept.attendance}%</span>
                      </td>
                      <td className="p-3">
                        {renderStars(dept.overallRating / 20)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* KPI Categories */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">KPI Category</h2>
            <div className="space-y-4">
              {[
                { label: 'KPI Score', value: 80, color: 'bg-blue-500' },
                { label: 'Task Completion', value: 92, color: 'bg-emerald-500' },
                { label: 'Quality', value: 88, color: 'bg-amber-500' },
                { label: 'Attendance', value: 95, color: 'bg-purple-500' },
                { label: 'Teamwork', value: 85, color: 'bg-pink-500' }
              ].map((kpi, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">{kpi.label}</span>
                    <span className="text-sm font-medium text-gray-900">{kpi.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${kpi.value}%`,
                        backgroundColor: index === 0 ? '#3b82f6' :
                          index === 1 ? '#10b981' :
                            index === 2 ? '#f59e0b' :
                              index === 3 ? '#8b5cf6' : '#ec4899'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top & Low Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Top Performers</h2>
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>

            <div className="space-y-3">
              {topPerformers.map((emp, index) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-white rounded-lg border border-emerald-100 hover:border-emerald-200 cursor-pointer"
                  onClick={() => handleViewEmployee(emp)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <span className="text-base font-bold text-emerald-600">
                          {emp.name.charAt(0)}
                        </span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{index + 1}</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{emp.name}</p>
                      <p className="text-xs text-gray-600">{emp.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-lg font-bold text-gray-900">{emp.performanceScore.toFixed(1)}</span>
                      <Star className="w-4 h-4 text-amber-500 fill-current" />
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {getTrendIcon(emp.trend)}
                      <p className="text-xs text-emerald-600 font-medium">Exceeding</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Performers */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Low Performers</h2>
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>

            <div className="space-y-3">
              {lowPerformersList.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-rose-50 to-white rounded-lg border border-rose-100 hover:border-rose-200 cursor-pointer"
                  onClick={() => handleViewEmployee(emp)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                      <span className="text-base font-bold text-rose-600">
                        {emp.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{emp.name}</p>
                      <p className="text-xs text-gray-600">{emp.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-lg font-bold text-gray-900">{emp.performanceScore.toFixed(1)}</span>
                      <Star className="w-4 h-4 text-gray-300" />
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {getTrendIcon(emp.trend)}
                      <p className="text-xs text-rose-600 font-medium">Needs Improvement</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Employee List Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Employee Performance List</h2>
            <span className="text-sm text-gray-600">{filteredByDepartment.length} employees</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Employee</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Department</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Performance</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">KPI</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Attendance</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredByDepartment.slice(0, 10).map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{emp.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{emp.name}</p>
                          <p className="text-xs text-gray-600">{emp.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-gray-700">{emp.department}</span>
                    </td>
                    <td className="p-3">
                      {renderStars(emp.performanceScore)}
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-gray-900">{emp.kpiScore}%</span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-gray-900">{emp.attendance}%</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(emp.performanceScore)}`}>
                        {emp.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleViewEmployee(emp)}
                        className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded hover:bg-blue-100"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Employee Performance Modal */}
      {isEmployeeModalOpen && selectedEmployee && (
        <EmployeePerformanceModal
          employee={selectedEmployee}
          onClose={handleCloseModal}
          onScheduleReview={handleScheduleReview}
        />
      )}
    </div>
  );
};

export default EmployeePerformanceDashboard;