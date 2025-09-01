"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  LifeBuoy, 
  MessageCircleQuestionMark, 
  Ticket, 
  TicketPlus, 
  MessagesSquare,
  CircleQuestionMark,
  TicketCheck,
  FileQuestionMark
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  steps?: string[];
  rating: number;
  views: number;
  language: string;
}

interface SupportTicket {
  id: string;
  title: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  referenceId: string;
}

interface HelpCenterProps {
  className?: string;
  userRole?: "user" | "helper" | "admin";
  currentTaskId?: string;
  onOpenChat?: () => void;
}

const faqCategories = [
  { id: "getting-started", label: "Getting Started", icon: CircleQuestionMark },
  { id: "payments", label: "Payments", icon: Ticket },
  { id: "verifications", label: "Verifications", icon: TicketCheck },
  { id: "safety", label: "Safety", icon: LifeBuoy }
];

const sampleArticles: Article[] = [
  {
    id: "1",
    title: "How to post your first task",
    category: "getting-started",
    content: "Learn how to create and post your first task on Get It Done...",
    steps: [
      "Click 'New Task' in the left navigation",
      "Fill in task title and description",
      "Set your budget and timeline",
      "Choose task category",
      "Review and publish"
    ],
    rating: 4.5,
    views: 1234,
    language: "en"
  },
  {
    id: "2", 
    title: "Payment methods and billing",
    category: "payments",
    content: "Understanding how payments work on Get It Done...",
    rating: 4.2,
    views: 892,
    language: "en"
  },
  {
    id: "3",
    title: "Identity verification process",
    category: "verifications", 
    content: "Steps to verify your identity and profile...",
    rating: 4.7,
    views: 756,
    language: "en"
  }
];

const sampleTickets: SupportTicket[] = [
  {
    id: "1",
    title: "Payment not processed",
    status: "in-progress",
    priority: "high",
    category: "payments",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T14:20:00Z", 
    description: "My payment for task #12345 hasn't been processed...",
    referenceId: "SUP-2024-001"
  }
];

export default function HelpCenter({ 
  className = "", 
  userRole = "user",
  currentTaskId,
  onOpenChat
}: HelpCenterProps) {
  const [activeTab, setActiveTab] = useState("faq");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [articles, setArticles] = useState<Article[]>(sampleArticles);
  const [tickets, setTickets] = useState<SupportTicket[]>(sampleTickets);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    title: "",
    category: "",
    priority: "medium" as const,
    description: ""
  });

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    const matchesLanguage = article.language === selectedLanguage;
    
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  const handleArticleRating = useCallback((articleId: string, rating: number) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { ...article, rating: (article.rating + rating) / 2 }
        : article
    ));
    toast.success("Thank you for your feedback!");
  }, []);

  const handleSubmitTicket = useCallback(async () => {
    if (!newTicket.title.trim() || !newTicket.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmittingTicket(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const ticket: SupportTicket = {
        id: Date.now().toString(),
        ...newTicket,
        status: "open",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        referenceId: `SUP-${new Date().getFullYear()}-${String(tickets.length + 1).padStart(3, '0')}`
      };
      
      setTickets(prev => [ticket, ...prev]);
      setNewTicket({
        title: "",
        category: "",
        priority: "medium",
        description: ""
      });
      
      toast.success(`Support ticket created! Reference: ${ticket.referenceId}`);
      setActiveTab("tickets");
    } catch (error) {
      toast.error("Failed to create support ticket. Please try again.");
    } finally {
      setIsSubmittingTicket(false);
    }
  }, [newTicket, tickets.length]);

  const getStatusColor = (status: SupportTicket["status"]) => {
    switch (status) {
      case "open": return "bg-blue-100 text-blue-800";
      case "in-progress": return "bg-yellow-100 text-yellow-800";
      case "resolved": return "bg-green-100 text-green-800";
      case "closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: SupportTicket["priority"]) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-blue-100 text-blue-800";
      case "low": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Help Center</h1>
          <p className="text-muted-foreground mt-1">
            Find answers, get support, and learn how to use Get It Done
          </p>
        </div>
        
        <div className="flex gap-3">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
            </SelectContent>
          </Select>
          
          {onOpenChat && (
            <Button onClick={onOpenChat} variant="outline" className="flex items-center gap-2">
              <MessagesSquare className="h-4 w-4" />
              Live Chat
            </Button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("faq")}>
          <CardContent className="p-6 text-center">
            <MessageCircleQuestionMark className="h-8 w-8 mx-auto text-primary mb-2" />
            <h3 className="font-semibold mb-1">Browse FAQs</h3>
            <p className="text-sm text-muted-foreground">Find quick answers</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("guides")}>
          <CardContent className="p-6 text-center">
            <FileQuestionMark className="h-8 w-8 mx-auto text-primary mb-2" />
            <h3 className="font-semibold mb-1">Step-by-Step Guides</h3>
            <p className="text-sm text-muted-foreground">Interactive tutorials</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("contact")}>
          <CardContent className="p-6 text-center">
            <TicketPlus className="h-8 w-8 mx-auto text-primary mb-2" />
            <h3 className="font-semibold mb-1">Contact Support</h3>
            <p className="text-sm text-muted-foreground">Create a support ticket</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("tickets")}>
          <CardContent className="p-6 text-center">
            <Ticket className="h-8 w-8 mx-auto text-primary mb-2" />
            <h3 className="font-semibold mb-1">My Tickets</h3>
            <p className="text-sm text-muted-foreground">Track support requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faq">FAQs & Articles</TabsTrigger>
          <TabsTrigger value="guides">Interactive Guides</TabsTrigger>
          <TabsTrigger value="contact">Contact Support</TabsTrigger>
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search articles and FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {faqCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {faqCategories.map(category => {
              const Icon = category.icon;
              const categoryArticles = articles.filter(a => a.category === category.id);
              
              return (
                <Card 
                  key={category.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedCategory === category.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent className="p-4 text-center">
                    <Icon className="h-6 w-6 mx-auto text-primary mb-2" />
                    <h4 className="font-medium text-sm">{category.label}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {categoryArticles.length} articles
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Articles */}
          <div className="space-y-4">
            {filteredArticles.map(article => (
              <Card key={article.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {faqCategories.find(c => c.id === article.category)?.label} • {article.views} views
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      ⭐ {article.rating.toFixed(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{article.content}</p>
                  
                  {article.steps && (
                    <Accordion type="single" collapsible className="mb-4">
                      <AccordionItem value="steps">
                        <AccordionTrigger>Step-by-Step Instructions</AccordionTrigger>
                        <AccordionContent>
                          <ol className="list-decimal list-inside space-y-2">
                            {article.steps.map((step, index) => (
                              <li key={index} className="text-sm">{step}</li>
                            ))}
                          </ol>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                  
                  <div className="flex items-center gap-4 pt-4 border-t">
                    <span className="text-sm text-muted-foreground">Was this helpful?</span>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleArticleRating(article.id, 5)}
                      >
                        👍 Yes
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleArticleRating(article.id, 1)}
                      >
                        👎 No
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="guides" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Guides</CardTitle>
              <CardDescription>
                Follow step-by-step walkthroughs for common tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium">How to post a task</h4>
                        <p className="text-sm text-muted-foreground">Create your first task in 5 minutes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Complete your first job</h4>
                        <p className="text-sm text-muted-foreground">Learn the workflow from start to finish</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Request a refund</h4>
                        <p className="text-sm text-muted-foreground">Understand the refund process</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Support Ticket</CardTitle>
              <CardDescription>
                Describe your issue and we'll help you resolve it quickly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="ticket-title">Title *</Label>
                  <Input
                    id="ticket-title"
                    placeholder="Brief description of your issue"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ticket-category">Category</Label>
                    <Select 
                      value={newTicket.category} 
                      onValueChange={(value) => setNewTicket(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="payments">Payments</SelectItem>
                        <SelectItem value="account">Account</SelectItem>
                        <SelectItem value="safety">Safety Concern</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="ticket-priority">Priority</Label>
                    <Select 
                      value={newTicket.priority} 
                      onValueChange={(value: "low" | "medium" | "high" | "urgent") => 
                        setNewTicket(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="ticket-description">Description *</Label>
                  <Textarea
                    id="ticket-description"
                    placeholder="Provide detailed information about your issue..."
                    className="min-h-[120px]"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                {currentTaskId && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      This ticket will be associated with task #{currentTaskId}
                    </p>
                  </div>
                )}
                
                <Button 
                  onClick={handleSubmitTicket}
                  disabled={isSubmittingTicket}
                  className="w-full"
                >
                  {isSubmittingTicket ? "Creating Ticket..." : "Create Support Ticket"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Support Tickets</h2>
            <Button onClick={() => setActiveTab("contact")} size="sm">
              <TicketPlus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </div>
          
          <div className="space-y-4">
            {tickets.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No support tickets yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create a support ticket when you need help
                  </p>
                  <Button onClick={() => setActiveTab("contact")}>
                    Create Ticket
                  </Button>
                </CardContent>
              </Card>
            ) : (
              tickets.map(ticket => (
                <Card key={ticket.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{ticket.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span>#{ticket.referenceId}</span>
                          <Separator orientation="vertical" className="h-4" />
                          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{ticket.description}</p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <span className="text-sm text-muted-foreground">
                        Updated {new Date(ticket.updatedAt).toLocaleDateString()}
                      </span>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}