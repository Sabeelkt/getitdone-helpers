"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'sonner';
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import Auth from '@/components/Auth';
import TaskBoard from '@/components/TaskBoard';
import HelperPortal from '@/components/HelperPortal';
import Messaging from '@/components/Messaging';
import AdminDashboard from '@/components/AdminDashboard';
import HelpCenter from '@/components/HelpCenter';
import LocalizationVoice from '@/components/LocalizationVoice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Plus,
  ListTodo,
  MessageSquare,
  HelpCircle,
  HandHelping,
  BarChart3,
  Shield,
  Home,
  ChevronDown,
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'helper' | 'admin';
  avatar?: string;
  verified: boolean;
}

export default function Page() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [activeView, setActiveView] = useState('home');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState('en');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [rightPanelContent, setRightPanelContent] = useState<'task-details' | 'chat' | 'profile' | null>(null);
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Task Accepted', content: 'Sarah accepted your cleaning task', read: false },
    { id: '2', title: 'New Helper Available', content: 'John is now available in your area', read: true },
  ]);

  // Convert session user to our UserData format
  const currentUser: UserData | null = session?.user ? {
    id: session.user.id,
    name: session.user.name || 'User',
    email: session.user.email,
    role: (session.user.role as 'user' | 'helper' | 'admin') || 'user',
    avatar: session.user.image || undefined,
    verified: session.user.emailVerified || false
  } : null;

  const isAuthenticated = !!session?.user;

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      setActiveView(getDefaultViewForRole(currentUser.role));
    }
  }, [isAuthenticated, currentUser]);

  const getDefaultViewForRole = (role: string) => {
    switch (role) {
      case 'helper':
        return 'helper-portal';
      case 'admin':
        return 'admin';
      default:
        return 'tasks';
    }
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      setActiveView('home');
      toast.success("Signed out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId);
    setRightPanelContent('task-details');
    setShowRightPanel(true);
  };

  const handleQuickChat = (taskId: string, helperId: string) => {
    setRightPanelContent('chat');
    setShowRightPanel(true);
  };

  const handleVoiceInput = (text: string, context: 'task' | 'chat') => {
    if (context === 'task' && text === '') {
      setActiveView('tasks');
    }
  };

  const getNavigationItems = () => {
    if (!currentUser) return [];

    const baseItems = [
      { id: 'tasks', label: 'My Tasks', icon: ListTodo, roles: ['user'] },
      { id: 'messages', label: 'Messages', icon: MessageSquare, roles: ['user', 'helper'] },
      { id: 'help', label: 'Help', icon: HelpCircle, roles: ['user', 'helper', 'admin'] },
    ];

    const roleSpecificItems: Record<string, any[]> = {
      helper: [
        { id: 'helper-portal', label: 'Helper Dashboard', icon: HandHelping },
      ],
      admin: [
        { id: 'admin', label: 'Admin Dashboard', icon: BarChart3 },
        { id: 'users', label: 'User Management', icon: Shield },
      ],
    };

    const items = [...baseItems.filter(item => item.roles.includes(currentUser.role))];
    
    if (roleSpecificItems[currentUser.role]) {
      items.unshift(...roleSpecificItems[currentUser.role]);
    }

    return items;
  };

  const renderMainContent = () => {
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <Auth />
          </div>
        </div>
      );
    }

    switch (activeView) {
      case 'tasks':
        return (
          <TaskBoard
            onTaskSelect={handleTaskSelect}
            onQuickChat={handleQuickChat}
            className="flex-1"
          />
        );
      case 'helper-portal':
        return <HelperPortal className="flex-1" />;
      case 'messages':
        return (
          <Messaging
            currentUserId={currentUser?.id || ''}
            currentUserRole={currentUser?.role || 'user'}
            className="flex-1"
          />
        );
      case 'admin':
        return <AdminDashboard />;
      case 'help':
        return (
          <HelpCenter
            userRole={currentUser?.role}
            currentTaskId={selectedTaskId || undefined}
            onOpenChat={() => {
              setRightPanelContent('chat');
              setShowRightPanel(true);
            }}
          />
        );
      default:
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Home className="h-16 w-16 mx-auto text-muted-foreground" />
              <h2 className="text-2xl font-semibold">Welcome to Get It Done</h2>
              <p className="text-muted-foreground">Choose a section from the navigation to get started</p>
            </div>
          </div>
        );
    }
  };

  const renderRightPanel = () => {
    if (!showRightPanel || !rightPanelContent) return null;

    switch (rightPanelContent) {
      case 'task-details':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Task Details</h3>
            <p className="text-muted-foreground">Task details would appear here...</p>
          </div>
        );
      case 'chat':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Chat</h3>
            <p className="text-muted-foreground">Chat interface would appear here...</p>
          </div>
        );
      case 'profile':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Profile Preview</h3>
            <p className="text-muted-foreground">Helper profile would appear here...</p>
          </div>
        );
      default:
        return null;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const navigationItems = getNavigationItems();

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-muted rounded w-48 mx-auto mb-4"></div>
          <div className="h-4 bg-muted rounded w-32 mx-auto"></div>
        </div>
        <Toaster position="top-right" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        {renderMainContent()}
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold">Get It Done</h2>
                  </div>
                  <nav className="flex-1 px-4 space-y-2">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.id}
                          variant={activeView === item.id ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            setActiveView(item.id);
                            setIsMobileNavOpen(false);
                          }}
                        >
                          <Icon className="h-4 w-4 mr-3" />
                          {item.label}
                        </Button>
                      );
                    })}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            {/* Brand */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push('/')}
                className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
              >
                Get It Done
              </button>
              {currentUser?.role && (
                <Badge variant="outline" className="capitalize">
                  {currentUser.role}
                </Badge>
              )}
            </div>
          </div>

          {/* Center Section - Search (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tasks, helpers, or get help..."
                className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Language & Voice */}
            <LocalizationVoice
              currentLocale={currentLocale}
              onLanguageChange={setCurrentLocale}
              onVoiceInput={handleVoiceInput}
              className="hidden sm:flex"
            />

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center p-0"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-3">
                  <h4 className="font-semibold">Notifications</h4>
                </div>
                <Separator />
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="p-3">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.content}</p>
                    </div>
                    {!notification.read && (
                      <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Quick Actions */}
            {currentUser?.role === 'user' && (
              <Button size="sm" onClick={() => setActiveView('tasks')}>
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">New Task</span>
              </Button>
            )}

            {/* Account Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser?.avatar} />
                    <AvatarFallback>
                      {currentUser?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex items-center gap-1">
                    <span className="text-sm font-medium">{currentUser?.name}</span>
                    <ChevronDown className="h-3 w-3" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2">
                  <p className="text-sm font-medium">{currentUser?.name}</p>
                  <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Left Navigation (Desktop) */}
        <nav className="hidden md:flex w-64 border-r bg-muted/30 flex-col">
          <div className="p-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeView === item.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveView(item.id)}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full p-6">
            {renderMainContent()}
          </div>
        </main>

        {/* Right Panel (Desktop) */}
        {showRightPanel && (
          <aside className="hidden lg:flex w-80 border-l bg-muted/30 flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">
                {rightPanelContent === 'task-details' && 'Task Details'}
                {rightPanelContent === 'chat' && 'Quick Chat'}
                {rightPanelContent === 'profile' && 'Helper Profile'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRightPanel(false)}
              >
                ×
              </Button>
            </div>
            <div className="flex-1 overflow-auto">
              {renderRightPanel()}
            </div>
          </aside>
        )}
      </div>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="grid grid-cols-4 h-16">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex flex-col items-center justify-center p-2 ${
                  activeView === item.id ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs mt-1">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <Toaster position="top-right" />
    </div>
  );
}