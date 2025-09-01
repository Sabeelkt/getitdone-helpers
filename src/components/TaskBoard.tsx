"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  ListTodo, 
  SquareKanban, 
  Check, 
  ClockArrowUp, 
  SquareCheck, 
  FolderKanban, 
  SquareCheckBig, 
  CalendarCheck2, 
  StickyNote, 
  Timer 
} from 'lucide-react';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'draft' | 'posted' | 'matched' | 'in_progress' | 'completed' | 'cancelled';
  budget: {
    type: 'fixed' | 'range';
    min?: number;
    max?: number;
    amount?: number;
  };
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  scheduledDate?: Date;
  isRecurring: boolean;
  recurrencePattern?: string;
  requirements?: string[];
  minRating?: number;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
  offers?: number;
  matchedHelper?: {
    id: string;
    name: string;
    rating: number;
    avatar: string;
  };
}

interface TaskBoardProps {
  className?: string;
  onTaskSelect?: (task: Task) => void;
  onQuickChat?: (taskId: string, helperId: string) => void;
}

const TASK_CATEGORIES = [
  { value: 'cleaning', label: 'Cleaning & Maintenance' },
  { value: 'moving', label: 'Moving & Delivery' },
  { value: 'handyman', label: 'Handyman Services' },
  { value: 'gardening', label: 'Gardening & Landscaping' },
  { value: 'tech', label: 'Tech Support' },
  { value: 'tutoring', label: 'Tutoring & Lessons' },
  { value: 'events', label: 'Event Help' },
  { value: 'other', label: 'Other' }
];

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'One-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' }
];

export default function TaskBoard({ className, onTaskSelect, onQuickChat }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [isCreating, setIsCreating] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budgetType: 'fixed' as 'fixed' | 'range',
    budgetAmount: '',
    budgetMin: '',
    budgetMax: '',
    address: '',
    scheduledDate: undefined as Date | undefined,
    isRecurring: false,
    recurrencePattern: 'none',
    requirements: [] as string[],
    minRating: 0,
    attachments: [] as string[]
  });

  // Load tasks
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data for demo
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Deep Clean Apartment',
          description: 'Need a thorough cleaning of my 2-bedroom apartment including kitchen, bathrooms, and living areas.',
          category: 'cleaning',
          status: 'posted',
          budget: { type: 'fixed', amount: 150 },
          location: { address: '123 Main St, San Francisco, CA', lat: 37.7749, lng: -122.4194 },
          scheduledDate: new Date(Date.now() + 86400000),
          isRecurring: false,
          requirements: ['3+ years experience', 'Background check'],
          minRating: 4.5,
          createdAt: new Date(Date.now() - 3600000),
          updatedAt: new Date(Date.now() - 3600000),
          offers: 3
        },
        {
          id: '2',
          title: 'Move Furniture',
          description: 'Help move furniture from storage unit to new apartment. Heavy lifting required.',
          category: 'moving',
          status: 'matched',
          budget: { type: 'range', min: 100, max: 200 },
          location: { address: '456 Oak Ave, San Francisco, CA', lat: 37.7849, lng: -122.4094 },
          scheduledDate: new Date(Date.now() + 172800000),
          isRecurring: false,
          requirements: ['Physical strength'],
          matchedHelper: {
            id: 'h1',
            name: 'Mike Johnson',
            rating: 4.8,
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
          },
          createdAt: new Date(Date.now() - 7200000),
          updatedAt: new Date(Date.now() - 1800000),
          offers: 5
        }
      ];
      setTasks(mockTasks);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'active' && ['posted', 'matched', 'in_progress'].includes(task.status)) ||
      (activeTab === 'completed' && task.status === 'completed') ||
      (activeTab === 'cancelled' && task.status === 'cancelled');
    
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    
    return matchesTab && matchesSearch && matchesCategory;
  });

  const handleCreateTask = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      budgetType: 'fixed',
      budgetAmount: '',
      budgetMin: '',
      budgetMax: '',
      address: '',
      scheduledDate: undefined,
      isRecurring: false,
      recurrencePattern: 'none',
      requirements: [],
      minRating: 0,
      attachments: []
    });
    setIsCreating(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      category: task.category,
      budgetType: task.budget.type,
      budgetAmount: task.budget.amount?.toString() || '',
      budgetMin: task.budget.min?.toString() || '',
      budgetMax: task.budget.max?.toString() || '',
      address: task.location.address,
      scheduledDate: task.scheduledDate,
      isRecurring: task.isRecurring,
      recurrencePattern: task.recurrencePattern || 'none',
      requirements: task.requirements || [],
      minRating: task.minRating || 0,
      attachments: task.attachments || []
    });
    setIsCreating(true);
  };

  const handleSubmitTask = async () => {
    try {
      setIsSubmitting(true);
      
      // Validation
      if (!formData.title.trim()) {
        toast.error('Please enter a task title');
        return;
      }
      if (!formData.description.trim()) {
        toast.error('Please enter a task description');
        return;
      }
      if (!formData.category) {
        toast.error('Please select a category');
        return;
      }
      if (formData.budgetType === 'fixed' && !formData.budgetAmount) {
        toast.error('Please enter a budget amount');
        return;
      }
      if (formData.budgetType === 'range' && (!formData.budgetMin || !formData.budgetMax)) {
        toast.error('Please enter budget range');
        return;
      }
      if (!formData.address.trim()) {
        toast.error('Please enter a location');
        return;
      }

      const taskData: Partial<Task> = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        budget: formData.budgetType === 'fixed' 
          ? { type: 'fixed', amount: parseInt(formData.budgetAmount) }
          : { type: 'range', min: parseInt(formData.budgetMin), max: parseInt(formData.budgetMax) },
        location: { address: formData.address, lat: 0, lng: 0 }, // Would geocode in real app
        scheduledDate: formData.scheduledDate,
        isRecurring: formData.isRecurring,
        recurrencePattern: formData.recurrencePattern,
        requirements: formData.requirements,
        minRating: formData.minRating,
        attachments: formData.attachments
      };

      if (editingTask) {
        // Update existing task
        const updatedTask = { ...editingTask, ...taskData, updatedAt: new Date() };
        setTasks(prev => prev.map(t => t.id === editingTask.id ? updatedTask : t));
        toast.success('Task updated successfully');
      } else {
        // Create new task
        const newTask: Task = {
          id: Date.now().toString(),
          ...taskData as Task,
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
          offers: 0
        };
        setTasks(prev => [newTask, ...prev]);
        toast.success('Task created successfully');
      }

      setIsCreating(false);
      setEditingTask(null);
    } catch (error) {
      toast.error('Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: 'posted' as const, updatedAt: new Date() } : t
      ));
      
      toast.success('Task posted successfully');
    } catch (error) {
      toast.error('Failed to post task');
    }
  };

  const handleCancelTask = async (taskId: string) => {
    try {
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: 'cancelled' as const, updatedAt: new Date() } : t
      ));
      
      toast.success('Task cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel task');
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'draft': return <StickyNote className="h-4 w-4" />;
      case 'posted': return <ListTodo className="h-4 w-4" />;
      case 'matched': return <SquareCheck className="h-4 w-4" />;
      case 'in_progress': return <Timer className="h-4 w-4" />;
      case 'completed': return <SquareCheckBig className="h-4 w-4" />;
      case 'cancelled': return <ClockArrowUp className="h-4 w-4" />;
      default: return <ListTodo className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'posted': return 'bg-blue-100 text-blue-800';
      case 'matched': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatBudget = (budget: Task['budget']) => {
    if (budget.type === 'fixed') {
      return `$${budget.amount}`;
    } else {
      return `$${budget.min} - $${budget.max}`;
    }
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Tasks</h1>
            <p className="text-muted-foreground">Manage your tasks and track progress</p>
          </div>
          <Button onClick={handleCreateTask} className="w-full sm:w-auto">
            <ListTodo className="mr-2 h-4 w-4" />
            Create Task
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {TASK_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="updated">Updated</SelectItem>
                <SelectItem value="budget">Budget</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Task Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active ({tasks.filter(t => ['posted', 'matched', 'in_progress'].includes(t.status)).length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({tasks.filter(t => t.status === 'completed').length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({tasks.filter(t => t.status === 'cancelled').length})</TabsTrigger>
          <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-muted rounded w-full mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchQuery || selectedCategory !== 'all' 
                    ? 'Try adjusting your filters or search terms'
                    : 'Create your first task to get started'
                  }
                </p>
                {!searchQuery && selectedCategory === 'all' && (
                  <Button onClick={handleCreateTask}>
                    <ListTodo className="mr-2 h-4 w-4" />
                    Create Task
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredTasks.map(task => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className={getStatusColor(task.status)}>
                            {getStatusIcon(task.status)}
                            <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
                          </Badge>
                          <Badge variant="outline">
                            {TASK_CATEGORIES.find(c => c.value === task.category)?.label}
                          </Badge>
                          {task.offers && task.offers > 0 && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              {task.offers} offers
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {task.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {formatBudget(task.budget)}
                        </span>
                        <Separator orientation="vertical" className="hidden sm:block h-4" />
                        <span>{task.location.address}</span>
                        {task.scheduledDate && (
                          <>
                            <Separator orientation="vertical" className="hidden sm:block h-4" />
                            <span>{task.scheduledDate.toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {task.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => handlePostTask(task.id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Post Task
                          </Button>
                        )}
                        {task.status === 'matched' && task.matchedHelper && onQuickChat && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onQuickChat(task.id, task.matchedHelper!.id)}
                          >
                            Message Helper
                          </Button>
                        )}
                        {['draft', 'posted'].includes(task.status) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditTask(task)}
                          >
                            Edit
                          </Button>
                        )}
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedTask(task)}
                            >
                              View Details
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-full sm:max-w-lg">
                            <SheetHeader>
                              <SheetTitle>{task.title}</SheetTitle>
                              <SheetDescription>Task details and activity</SheetDescription>
                            </SheetHeader>
                            <ScrollArea className="h-full mt-6">
                              <div className="space-y-6">
                                <div>
                                  <Label className="text-sm font-medium">Status</Label>
                                  <div className="mt-1">
                                    <Badge className={getStatusColor(task.status)}>
                                      {getStatusIcon(task.status)}
                                      <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label className="text-sm font-medium">Description</Label>
                                  <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Budget</Label>
                                    <p className="mt-1 text-sm font-semibold">{formatBudget(task.budget)}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Category</Label>
                                    <p className="mt-1 text-sm">
                                      {TASK_CATEGORIES.find(c => c.value === task.category)?.label}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium">Location</Label>
                                  <p className="mt-1 text-sm text-muted-foreground">{task.location.address}</p>
                                </div>

                                {task.scheduledDate && (
                                  <div>
                                    <Label className="text-sm font-medium">Scheduled Date</Label>
                                    <p className="mt-1 text-sm">{task.scheduledDate.toLocaleDateString()}</p>
                                  </div>
                                )}

                                {task.matchedHelper && (
                                  <div>
                                    <Label className="text-sm font-medium">Matched Helper</Label>
                                    <div className="mt-2 flex items-center gap-3">
                                      <img
                                        src={task.matchedHelper.avatar}
                                        alt={task.matchedHelper.name}
                                        className="h-8 w-8 rounded-full"
                                      />
                                      <div>
                                        <p className="text-sm font-medium">{task.matchedHelper.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          Rating: {task.matchedHelper.rating}/5
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {task.requirements && task.requirements.length > 0 && (
                                  <div>
                                    <Label className="text-sm font-medium">Requirements</Label>
                                    <ul className="mt-1 text-sm text-muted-foreground space-y-1">
                                      {task.requirements.map((req, i) => (
                                        <li key={i}>• {req}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                <div className="flex gap-2">
                                  {['draft', 'posted'].includes(task.status) && (
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm">
                                          Cancel Task
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Cancel Task</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to cancel this task? This action cannot be undone.
                                            {task.status === 'posted' && ' Any matching fees will be refunded.'}
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Keep Task</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleCancelTask(task.id)}
                                            className="bg-destructive hover:bg-destructive/90"
                                          >
                                            Cancel Task
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  )}
                                </div>
                              </div>
                            </ScrollArea>
                          </SheetContent>
                        </Sheet>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Task Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            <DialogDescription>
              {editingTask ? 'Update your task details' : 'Fill in the details for your new task'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="What do you need help with?"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                {formData.title.length}/100 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide detailed information about your task..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/500 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Budget *</Label>
              <RadioGroup
                value={formData.budgetType}
                onValueChange={(value: 'fixed' | 'range') => setFormData(prev => ({ ...prev, budgetType: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fixed" id="fixed" />
                  <Label htmlFor="fixed">Fixed Amount</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="range" id="range" />
                  <Label htmlFor="range">Budget Range</Label>
                </div>
              </RadioGroup>
              
              {formData.budgetType === 'fixed' ? (
                <div className="space-y-2">
                  <Label htmlFor="budgetAmount">Amount ($)</Label>
                  <Input
                    id="budgetAmount"
                    type="number"
                    value={formData.budgetAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, budgetAmount: e.target.value }))}
                    placeholder="150"
                    min="10"
                    max="10000"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budgetMin">Min Amount ($)</Label>
                    <Input
                      id="budgetMin"
                      type="number"
                      value={formData.budgetMin}
                      onChange={(e) => setFormData(prev => ({ ...prev, budgetMin: e.target.value }))}
                      placeholder="100"
                      min="10"
                      max="10000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budgetMax">Max Amount ($)</Label>
                    <Input
                      id="budgetMax"
                      type="number"
                      value={formData.budgetMax}
                      onChange={(e) => setFormData(prev => ({ ...prev, budgetMax: e.target.value }))}
                      placeholder="200"
                      min="10"
                      max="10000"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Location *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter full address"
              />
            </div>

            <div className="space-y-2">
              <Label>Scheduling</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarCheck2 className="mr-2 h-4 w-4" />
                    {formData.scheduledDate ? formData.scheduledDate.toLocaleDateString() : 'Select date (optional)'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.scheduledDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, scheduledDate: date }))}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRecurring: checked }))}
                />
                <Label htmlFor="recurring">Recurring Task</Label>
              </div>
              
              {formData.isRecurring && (
                <div className="space-y-2">
                  <Label htmlFor="recurrence">Frequency</Label>
                  <Select value={formData.recurrencePattern} onValueChange={(value) => setFormData(prev => ({ ...prev, recurrencePattern: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {RECURRENCE_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitTask} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}