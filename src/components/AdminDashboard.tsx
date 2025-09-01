"use client";

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  UserCheck, 
  UserCog, 
  Workflow, 
  PanelRight, 
  Grid2x2Check, 
  Users, 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Eye,
  Ban,
  Play,
  FileText,
  TrendingUp,
  DollarSign,
  Activity,
  MessageSquare,
  MoreVertical,
  Calendar,
  Shield,
  Camera,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface MetricCardData {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  avatar: string;
  type: 'identity' | 'business' | 'address';
  status: 'pending' | 'approved' | 'rejected';
  documents: string[];
  submittedAt: string;
  reviewedAt?: string;
}

interface Dispute {
  id: string;
  taskId: string;
  taskTitle: string;
  complainant: string;
  respondent: string;
  type: 'payment' | 'quality' | 'delivery' | 'behavior';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  amount?: number;
  description: string;
  createdAt: string;
  messages: number;
}

interface ActivityItem {
  id: string;
  type: 'user_signup' | 'task_created' | 'task_completed' | 'payment_processed' | 'verification_submitted' | 'dispute_opened';
  description: string;
  timestamp: string;
  userId?: string;
  metadata?: any;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'helper' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  joinedAt: string;
  lastActive: string;
  tasksCompleted: number;
  totalEarnings: number;
  verificationStatus: 'verified' | 'pending' | 'unverified';
}

const mockMetrics: MetricCardData[] = [
  {
    title: 'Active Tasks',
    value: 1247,
    change: '+12%',
    trend: 'up',
    icon: <Grid2x2Check className="h-6 w-6" />
  },
  {
    title: 'Completed Tasks',
    value: 8932,
    change: '+8%',
    trend: 'up',
    icon: <CheckCircle className="h-6 w-6" />
  },
  {
    title: 'GMV (30 days)',
    value: '$124,563',
    change: '+15%',
    trend: 'up',
    icon: <DollarSign className="h-6 w-6" />
  },
  {
    title: 'Daily Signups',
    value: 89,
    change: '-3%',
    trend: 'down',
    icon: <Users className="h-6 w-6" />
  }
];

const mockVerifications: VerificationRequest[] = [
  {
    id: '1',
    userId: 'user_123',
    userName: 'Sarah Johnson',
    userEmail: 'sarah.j@example.com',
    avatar: '',
    type: 'identity',
    status: 'pending',
    documents: ['drivers_license_front.jpg', 'drivers_license_back.jpg'],
    submittedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    userId: 'user_124',
    userName: 'Michael Chen',
    userEmail: 'michael.chen@example.com',
    avatar: '',
    type: 'business',
    status: 'pending',
    documents: ['business_license.pdf', 'tax_certificate.pdf'],
    submittedAt: '2024-01-15T09:15:00Z'
  },
  {
    id: '3',
    userId: 'user_125',
    userName: 'Emma Davis',
    userEmail: 'emma.davis@example.com',
    avatar: '',
    type: 'address',
    status: 'pending',
    documents: ['utility_bill.pdf', 'lease_agreement.pdf'],
    submittedAt: '2024-01-15T08:45:00Z'
  }
];

const mockDisputes: Dispute[] = [
  {
    id: 'dispute_1',
    taskId: 'task_456',
    taskTitle: 'Website Design Project',
    complainant: 'John Smith',
    respondent: 'Alice Cooper',
    type: 'quality',
    priority: 'high',
    status: 'open',
    amount: 500,
    description: 'Delivered work does not match the agreed specifications and requirements.',
    createdAt: '2024-01-15T14:30:00Z',
    messages: 3
  },
  {
    id: 'dispute_2',
    taskId: 'task_457',
    taskTitle: 'Content Writing Service',
    complainant: 'Bob Wilson',
    respondent: 'Carol Martinez',
    type: 'payment',
    priority: 'medium',
    status: 'investigating',
    amount: 150,
    description: 'Payment was not released despite task completion.',
    createdAt: '2024-01-15T12:00:00Z',
    messages: 7
  },
  {
    id: 'dispute_3',
    taskId: 'task_458',
    taskTitle: 'Mobile App Development',
    complainant: 'Diana Ross',
    respondent: 'Frank Miller',
    type: 'delivery',
    priority: 'critical',
    status: 'open',
    amount: 2500,
    description: 'Project was not delivered within the agreed timeline.',
    createdAt: '2024-01-15T11:15:00Z',
    messages: 12
  }
];

const mockActivity: ActivityItem[] = [
  {
    id: 'activity_1',
    type: 'user_signup',
    description: 'New user Sarah Johnson registered',
    timestamp: '2024-01-15T15:30:00Z',
    userId: 'user_123'
  },
  {
    id: 'activity_2',
    type: 'task_completed',
    description: 'Task "Logo Design" completed by Mike Chen',
    timestamp: '2024-01-15T15:15:00Z',
    userId: 'user_124'
  },
  {
    id: 'activity_3',
    type: 'payment_processed',
    description: 'Payment of $250 processed for Task #789',
    timestamp: '2024-01-15T15:00:00Z'
  },
  {
    id: 'activity_4',
    type: 'verification_submitted',
    description: 'Identity verification submitted by Emma Davis',
    timestamp: '2024-01-15T14:45:00Z',
    userId: 'user_125'
  },
  {
    id: 'activity_5',
    type: 'dispute_opened',
    description: 'New dispute opened for Task #456',
    timestamp: '2024-01-15T14:30:00Z'
  }
];

const mockUsers: User[] = [
  {
    id: 'user_123',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    avatar: '',
    role: 'user',
    status: 'active',
    joinedAt: '2024-01-01T00:00:00Z',
    lastActive: '2024-01-15T15:30:00Z',
    tasksCompleted: 12,
    totalEarnings: 1500,
    verificationStatus: 'pending'
  },
  {
    id: 'user_124',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    avatar: '',
    role: 'helper',
    status: 'active',
    joinedAt: '2023-12-15T00:00:00Z',
    lastActive: '2024-01-15T15:15:00Z',
    tasksCompleted: 45,
    totalEarnings: 8900,
    verificationStatus: 'verified'
  },
  {
    id: 'user_125',
    name: 'Emma Davis',
    email: 'emma.davis@example.com',
    avatar: '',
    role: 'user',
    status: 'suspended',
    joinedAt: '2024-01-10T00:00:00Z',
    lastActive: '2024-01-14T10:00:00Z',
    tasksCompleted: 3,
    totalEarnings: 200,
    verificationStatus: 'unverified'
  }
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [verifications, setVerifications] = useState<VerificationRequest[]>(mockVerifications);
  const [disputes, setDisputes] = useState<Dispute[]>(mockDisputes);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [activity, setActivity] = useState<ActivityItem[]>(mockActivity);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  const handleVerificationAction = async (verificationId: string, action: 'approve' | 'reject') => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setVerifications(prev => prev.map(v => 
        v.id === verificationId 
          ? { ...v, status: action === 'approve' ? 'approved' : 'rejected', reviewedAt: new Date().toISOString() }
          : v
      ));
      
      toast.success(`Verification ${action}d successfully`);
      setSelectedVerification(null);
    } catch (error) {
      toast.error('Failed to update verification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisputeResolve = async (disputeId: string, resolution: 'favor_complainant' | 'favor_respondent' | 'mediation') => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDisputes(prev => prev.map(d => 
        d.id === disputeId 
          ? { ...d, status: 'resolved' }
          : d
      ));
      
      toast.success('Dispute resolved successfully');
      setSelectedDispute(null);
    } catch (error) {
      toast.error('Failed to resolve dispute');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate') => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, status: action === 'suspend' ? 'suspended' : 'active' }
          : u
      ));
      
      toast.success(`User ${action}d successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    toast.success('Data export started. You will receive an email when ready.');
  };

  const filteredVerifications = verifications.filter(v => {
    const matchesSearch = v.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         v.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || v.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredDisputes = disputes.filter(d => {
    const matchesSearch = d.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         d.complainant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.respondent.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || d.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || u.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getVerificationIcon = (type: string) => {
    switch (type) {
      case 'identity': return <Shield className="h-4 w-4" />;
      case 'business': return <FileText className="h-4 w-4" />;
      case 'address': return <Camera className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getDisputeIcon = (type: string) => {
    switch (type) {
      case 'payment': return <CreditCard className="h-4 w-4" />;
      case 'quality': return <AlertTriangle className="h-4 w-4" />;
      case 'delivery': return <Clock className="h-4 w-4" />;
      case 'behavior': return <MessageSquare className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      open: 'bg-blue-100 text-blue-800',
      investigating: 'bg-orange-100 text-orange-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      verified: 'bg-green-100 text-green-800',
      unverified: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your task management platform</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:w-fit lg:grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="verifications" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Verifications</span>
            </TabsTrigger>
            <TabsTrigger value="disputes" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              <span className="hidden sm:inline">Disputes</span>
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              <span className="hidden sm:inline">Monitoring</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <PanelRight className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {mockMetrics.map((metric, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                    <div className="text-muted-foreground">{metric.icon}</div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    {metric.change && (
                      <p className={`text-xs ${
                        metric.trend === 'up' ? 'text-green-600' : 
                        metric.trend === 'down' ? 'text-red-600' : 
                        'text-muted-foreground'
                      }`}>
                        {metric.change} from last month
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" variant="outline">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Review Pending Verifications ({verifications.filter(v => v.status === 'pending').length})
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Handle Open Disputes ({disputes.filter(d => d.status === 'open').length})
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Analytics Data
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Manage User Accounts
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest platform activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      {activity.slice(0, 8).map((item) => (
                        <div key={item.id} className="flex items-start gap-3 text-sm">
                          <div className="mt-0.5">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="text-foreground">{item.description}</p>
                            <p className="text-muted-foreground text-xs">
                              {new Date(item.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="verifications" className="mt-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search verifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4">
              {filteredVerifications.map((verification) => (
                <Card key={verification.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={verification.avatar} />
                          <AvatarFallback>{verification.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getVerificationIcon(verification.type)}
                            <h3 className="font-semibold">{verification.userName}</h3>
                            <Badge className={getStatusBadge(verification.status)}>
                              {verification.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{verification.userEmail}</p>
                          <p className="text-sm">
                            <span className="font-medium">Type:</span> {verification.type} verification
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Documents:</span> {verification.documents.length} files
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Submitted {new Date(verification.submittedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {verification.status === 'pending' && (
                          <>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedVerification(verification)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Review Verification Request</DialogTitle>
                                  <DialogDescription>
                                    Review {selectedVerification?.userName}'s {selectedVerification?.type} verification
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedVerification && (
                                  <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium">User Name</label>
                                        <p className="text-sm">{selectedVerification.userName}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Email</label>
                                        <p className="text-sm">{selectedVerification.userEmail}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Verification Type</label>
                                        <p className="text-sm capitalize">{selectedVerification.type}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Status</label>
                                        <Badge className={getStatusBadge(selectedVerification.status)}>
                                          {selectedVerification.status}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Submitted Documents</label>
                                      <div className="mt-2 space-y-2">
                                        {selectedVerification.documents.map((doc, index) => (
                                          <div key={index} className="flex items-center gap-2 p-2 border rounded">
                                            <FileText className="h-4 w-4" />
                                            <span className="text-sm">{doc}</span>
                                            <Button variant="outline" size="sm" className="ml-auto">
                                              <Eye className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button 
                                        onClick={() => handleVerificationAction(selectedVerification.id, 'approve')}
                                        disabled={isLoading}
                                        className="flex-1"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                      </Button>
                                      <Button 
                                        variant="destructive"
                                        onClick={() => handleVerificationAction(selectedVerification.id, 'reject')}
                                        disabled={isLoading}
                                        className="flex-1"
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="disputes" className="mt-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search disputes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4">
              {filteredDisputes.map((dispute) => (
                <Card key={dispute.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getDisputeIcon(dispute.type)}
                          <h3 className="font-semibold">{dispute.taskTitle}</h3>
                          <Badge className={getStatusBadge(dispute.status)}>
                            {dispute.status}
                          </Badge>
                          <Badge className={getPriorityBadge(dispute.priority)}>
                            {dispute.priority}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <span className="text-sm font-medium">Complainant:</span> {dispute.complainant}
                          </div>
                          <div>
                            <span className="text-sm font-medium">Respondent:</span> {dispute.respondent}
                          </div>
                          <div>
                            <span className="text-sm font-medium">Type:</span> {dispute.type}
                          </div>
                          {dispute.amount && (
                            <div>
                              <span className="text-sm font-medium">Amount:</span> ${dispute.amount}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{dispute.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Created {new Date(dispute.createdAt).toLocaleString()}</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {dispute.messages} messages
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(dispute.status === 'open' || dispute.status === 'investigating') && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedDispute(dispute)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Resolve
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Resolve Dispute</DialogTitle>
                                <DialogDescription>
                                  Review and resolve the dispute for "{selectedDispute?.taskTitle}"
                                </DialogDescription>
                              </DialogHeader>
                              {selectedDispute && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Task</label>
                                      <p className="text-sm">{selectedDispute.taskTitle}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Amount</label>
                                      <p className="text-sm">${selectedDispute.amount}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Complainant</label>
                                      <p className="text-sm">{selectedDispute.complainant}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Respondent</label>
                                      <p className="text-sm">{selectedDispute.respondent}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Description</label>
                                    <p className="text-sm mt-1">{selectedDispute.description}</p>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <Button 
                                      onClick={() => handleDisputeResolve(selectedDispute.id, 'favor_complainant')}
                                      disabled={isLoading}
                                      variant="outline"
                                    >
                                      Favor Complainant
                                    </Button>
                                    <Button 
                                      onClick={() => handleDisputeResolve(selectedDispute.id, 'favor_respondent')}
                                      disabled={isLoading}
                                      variant="outline"
                                    >
                                      Favor Respondent
                                    </Button>
                                    <Button 
                                      onClick={() => handleDisputeResolve(selectedDispute.id, 'mediation')}
                                      disabled={isLoading}
                                    >
                                      Suggest Mediation
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Real-time Activity Stream</CardTitle>
                <CardDescription>Monitor platform activities as they happen</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {activity.map((item) => (
                      <div key={item.id} className="flex items-start gap-4 p-3 border rounded-lg">
                        <div className="mt-1">
                          <Activity className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.type.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {item.userId && (
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Task Completion Rate</span>
                    <span className="text-sm font-medium">94%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">User Satisfaction</span>
                    <span className="text-sm font-medium">4.8/5</span>
                  </div>
                  <Progress value={96} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Platform Uptime</span>
                    <span className="text-sm font-medium">99.9%</span>
                  </div>
                  <Progress value={99.9} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Revenue Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">$124,563</p>
                    <p className="text-sm text-muted-foreground">Total GMV (30 days)</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Commission Revenue</span>
                      <span className="text-sm font-medium">$12,456</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Processing Fees</span>
                      <span className="text-sm font-medium">$3,737</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Subscription Revenue</span>
                      <span className="text-sm font-medium">$2,890</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Export Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={handleExportData}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      User Data (CSV)
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={handleExportData}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Transaction Report (PDF)
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={handleExportData}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Analytics Data (JSON)
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={handleExportData}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Performance Metrics (XLSX)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Usage Trends</CardTitle>
                <CardDescription>Platform usage over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <p className="text-lg font-semibold">+23%</p>
                    <p className="text-sm text-muted-foreground">New Users</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Grid2x2Check className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-lg font-semibold">+18%</p>
                    <p className="text-sm text-muted-foreground">Task Creation</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <DollarSign className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                    <p className="text-lg font-semibold">+15%</p>
                    <p className="text-sm text-muted-foreground">Revenue Growth</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Activity className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                    <p className="text-lg font-semibold">99.2%</p>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{user.name}</h3>
                            <Badge className={getStatusBadge(user.status)}>
                              {user.status}
                            </Badge>
                            <Badge className={getStatusBadge(user.verificationStatus)}>
                              {user.verificationStatus}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Role:</span> {user.role}
                            </div>
                            <div>
                              <span className="font-medium">Tasks:</span> {user.tasksCompleted}
                            </div>
                            <div>
                              <span className="font-medium">Earnings:</span> ${user.totalEarnings}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Joined {new Date(user.joinedAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last active {new Date(user.lastActive).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.status === 'active' ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Ban className="h-4 w-4 mr-1" />
                                Suspend
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Suspend User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to suspend {user.name}? They will not be able to access the platform until reactivated.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleUserAction(user.id, 'suspend')}>
                                  Suspend User
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'activate')}
                            disabled={isLoading}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Activate
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}