"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { BadgeCheck, ListCheck, Check, CircleUser, IdCard, UserCheck, SquareUser, HandHelping, CheckCheck, ListChecks, SquareCheckBig, UserRoundCheck, Hand, HeartHandshake, Handshake, ClockIcon } from "lucide-react";

interface HelperPortalProps {
  className?: string;
}

interface HelperProfile {
  id?: string;
  photo?: string;
  headline?: string;
  bio?: string;
  skills: string[];
  categories: string[];
  pricingType: "hourly" | "fixed";
  hourlyRate?: number;
  fixedRates?: Record<string, number>;
  travelRadius: number;
  languages: string[];
  portfolio: string[];
}

interface VerificationStatus {
  status: "unverified" | "pending" | "verified" | "rejected";
  documents: {
    identity: boolean;
    certificates: string[];
    backgroundCheck: boolean;
  };
  feedback?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  budgetType: "hourly" | "fixed";
  location: string;
  distance: number;
  postedAt: string;
  urgency: "low" | "medium" | "high";
  requiredSkills: string[];
  clientRating: number;
  proposals: number;
}

interface Availability {
  [key: string]: {
    start: string;
    end: string;
    available: boolean;
  }[];
}

interface CompletedTask {
  id: string;
  title: string;
  client: string;
  completedAt: string;
  rating?: number;
  review?: string;
}

const SKILL_OPTIONS = [
  "Cleaning", "Handyman", "Moving", "Delivery", "Assembly", 
  "Gardening", "Painting", "Plumbing", "Electrical", "Tutoring",
  "Pet Care", "Cooking", "Photography", "Web Design", "Writing"
];

const CATEGORY_OPTIONS = [
  "Home Improvement", "Cleaning Services", "Moving & Delivery",
  "Assembly & Installation", "Outdoor Work", "Pet Services",
  "Creative Services", "Technology", "Education", "Personal Care"
];

const LANGUAGE_OPTIONS = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese",
  "Mandarin", "Japanese", "Korean", "Arabic", "Hindi", "Russian"
];

export default function HelperPortal({ className }: HelperPortalProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState<HelperProfile>({
    skills: [],
    categories: [],
    pricingType: "hourly",
    travelRadius: 10,
    languages: ["English"],
    portfolio: []
  });
  const [verification, setVerification] = useState<VerificationStatus>({
    status: "unverified",
    documents: {
      identity: false,
      certificates: [],
      backgroundCheck: false
    }
  });
  const [availability, setAvailability] = useState<Availability>({});
  const [availableNow, setAvailableNow] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskFilters, setTaskFilters] = useState({
    category: "",
    maxDistance: 25,
    minPay: 0,
    skills: [] as string[]
  });
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [profileProgress, setProfileProgress] = useState(0);

  // Calculate profile completion
  useEffect(() => {
    let completed = 0;
    const total = 8;
    
    if (profile.headline) completed++;
    if (profile.bio) completed++;
    if (profile.skills.length > 0) completed++;
    if (profile.categories.length > 0) completed++;
    if (profile.pricingType === "hourly" ? profile.hourlyRate : Object.keys(profile.fixedRates || {}).length > 0) completed++;
    if (profile.languages.length > 0) completed++;
    if (verification.status === "verified") completed++;
    if (availability && Object.keys(availability).length > 0) completed++;

    setProfileProgress((completed / total) * 100);
  }, [profile, verification, availability]);

  // Mock data loading
  useEffect(() => {
    // Load mock tasks
    const mockTasks: Task[] = [
      {
        id: "1",
        title: "Deep house cleaning needed",
        description: "3 bedroom house needs thorough cleaning including bathrooms, kitchen, and living areas.",
        category: "Cleaning Services",
        budget: 150,
        budgetType: "fixed",
        location: "Downtown",
        distance: 2.5,
        postedAt: "2 hours ago",
        urgency: "medium",
        requiredSkills: ["Cleaning"],
        clientRating: 4.8,
        proposals: 3
      },
      {
        id: "2",
        title: "Furniture assembly - IKEA wardrobe",
        description: "Need help assembling a large IKEA wardrobe. All tools provided.",
        category: "Assembly & Installation",
        budget: 25,
        budgetType: "hourly",
        location: "Midtown",
        distance: 5.2,
        postedAt: "4 hours ago",
        urgency: "low",
        requiredSkills: ["Assembly", "Handyman"],
        clientRating: 4.9,
        proposals: 1
      }
    ];
    setTasks(mockTasks);

    // Load mock completed tasks
    const mockCompletedTasks: CompletedTask[] = [
      {
        id: "c1",
        title: "House Cleaning",
        client: "Sarah M.",
        completedAt: "Jan 15, 2024",
        rating: 5,
        review: "Excellent work! Very thorough and professional."
      },
      {
        id: "c2",
        title: "Furniture Assembly",
        client: "John D.",
        completedAt: "Jan 12, 2024",
        rating: 4,
        review: "Quick and efficient assembly. Would hire again."
      }
    ];
    setCompletedTasks(mockCompletedTasks);
  }, []);

  const handleProfileUpdate = useCallback(async (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSaveProfile = useCallback(async () => {
    setIsSubmittingProfile(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSubmittingProfile(false);
    }
  }, []);

  const handleDocumentUpload = useCallback(async (type: string, file: File) => {
    try {
      // Mock upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (type === "identity") {
        setVerification(prev => ({
          ...prev,
          documents: {
            ...prev.documents,
            identity: true
          },
          status: "pending"
        }));
      }
      
      toast.success(`${type} document uploaded successfully!`);
    } catch (error) {
      toast.error("Upload failed. Please try again.");
    }
  }, []);

  const handleTaskAccept = useCallback(async (taskId: string) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Task accepted! You'll be notified when the client responds.");
      setShowAcceptDialog(false);
      setSelectedTask(null);
    } catch (error) {
      toast.error("Failed to accept task. Please try again.");
    }
  }, []);

  const handleAvailabilityToggle = useCallback((day: string, timeSlot: string, available: boolean) => {
    setAvailability(prev => ({
      ...prev,
      [day]: prev[day]?.map(slot => 
        slot.start === timeSlot ? { ...slot, available } : slot
      ) || []
    }));
  }, []);

  const filteredTasks = tasks.filter(task => {
    if (taskFilters.category && task.category !== taskFilters.category) return false;
    if (task.distance > taskFilters.maxDistance) return false;
    if (task.budget < taskFilters.minPay) return false;
    if (taskFilters.skills.length > 0 && !taskFilters.skills.some(skill => task.requiredSkills.includes(skill))) return false;
    return true;
  });

  return (
    <div className={`min-h-screen bg-background p-4 ${className || ""}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Helper Dashboard</h1>
            <p className="text-muted-foreground">Manage your profile, find tasks, and track your progress</p>
          </div>
          <div className="flex items-center gap-4">
            <Card className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${availableNow ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="text-sm font-medium">
                    {availableNow ? 'Available Now' : 'Offline'}
                  </span>
                </div>
                <Switch
                  checked={availableNow}
                  onCheckedChange={setAvailableNow}
                />
              </div>
            </Card>
            <Badge variant={verification.status === "verified" ? "default" : "secondary"} className="flex items-center gap-1">
              {verification.status === "verified" ? <BadgeCheck className="w-3 h-3" /> : <IdCard className="w-3 h-3" />}
              {verification.status === "verified" ? "Verified Helper" : "Verification Required"}
            </Badge>
          </div>
        </div>

        {/* Profile Progress */}
        {profileProgress < 100 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-800">Complete your profile to get more tasks</h3>
                  <p className="text-sm text-amber-700">A complete profile gets 3x more task invitations</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-amber-800">{Math.round(profileProgress)}%</div>
                  <Progress value={profileProgress} className="w-24 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <CircleUser className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Verification</span>
            </TabsTrigger>
            <TabsTrigger value="availability" className="flex items-center gap-2">
              <ListCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Availability</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <HandHelping className="w-4 h-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SquareUser className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={profile.photo} />
                      <AvatarFallback><CircleUser className="w-8 h-8" /></AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">
                      Upload Photo
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="headline">Professional Headline</Label>
                    <Input
                      id="headline"
                      placeholder="e.g., Experienced cleaner with 5+ years"
                      value={profile.headline || ""}
                      onChange={(e) => handleProfileUpdate("headline", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell clients about your experience, skills, and what makes you great..."
                      value={profile.bio || ""}
                      onChange={(e) => handleProfileUpdate("bio", e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Languages</Label>
                    <div className="flex flex-wrap gap-2">
                      {LANGUAGE_OPTIONS.map(lang => (
                        <Badge
                          key={lang}
                          variant={profile.languages.includes(lang) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const newLanguages = profile.languages.includes(lang)
                              ? profile.languages.filter(l => l !== lang)
                              : [...profile.languages, lang];
                            handleProfileUpdate("languages", newLanguages);
                          }}
                        >
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HandHelping className="w-5 h-5" />
                    Skills & Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Skills</Label>
                    <div className="flex flex-wrap gap-2">
                      {SKILL_OPTIONS.map(skill => (
                        <Badge
                          key={skill}
                          variant={profile.skills.includes(skill) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const newSkills = profile.skills.includes(skill)
                              ? profile.skills.filter(s => s !== skill)
                              : [...profile.skills, skill];
                            handleProfileUpdate("skills", newSkills);
                          }}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Service Categories</Label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_OPTIONS.map(category => (
                        <Badge
                          key={category}
                          variant={profile.categories.includes(category) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const newCategories = profile.categories.includes(category)
                              ? profile.categories.filter(c => c !== category)
                              : [...profile.categories, category];
                            handleProfileUpdate("categories", newCategories);
                          }}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Rate Information (Optional)</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="hourly"
                          name="pricingType"
                          checked={profile.pricingType === "hourly"}
                          onChange={() => handleProfileUpdate("pricingType", "hourly")}
                        />
                        <Label htmlFor="hourly">Hourly Rate</Label>
                      </div>
                      {profile.pricingType === "hourly" && (
                        <div className="ml-6">
                          <Input
                            type="number"
                            placeholder="25"
                            value={profile.hourlyRate || ""}
                            onChange={(e) => handleProfileUpdate("hourlyRate", parseFloat(e.target.value))}
                            className="w-32"
                          />
                          <span className="ml-2 text-sm text-muted-foreground">per hour</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="fixed"
                          name="pricingType"
                          checked={profile.pricingType === "fixed"}
                          onChange={() => handleProfileUpdate("pricingType", "fixed")}
                        />
                        <Label htmlFor="fixed">Fixed Rates by Service</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="radius">Travel Radius (miles)</Label>
                    <Select value={profile.travelRadius.toString()} onValueChange={(value) => handleProfileUpdate("travelRadius", parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 miles</SelectItem>
                        <SelectItem value="10">10 miles</SelectItem>
                        <SelectItem value="15">15 miles</SelectItem>
                        <SelectItem value="25">25 miles</SelectItem>
                        <SelectItem value="50">50 miles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleSaveProfile} 
                disabled={isSubmittingProfile}
                className="min-w-32"
              >
                {isSubmittingProfile ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserRoundCheck className="w-5 h-5" />
                  Verification Status
                  <Badge variant={verification.status === "verified" ? "default" : verification.status === "pending" ? "secondary" : "destructive"}>
                    {verification.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {verification.status === "rejected" && verification.feedback && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <h4 className="font-semibold text-destructive">Verification Rejected</h4>
                    <p className="text-sm text-destructive/80 mt-1">{verification.feedback}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <IdCard className="w-5 h-5" />
                      <div>
                        <h4 className="font-semibold">Identity Verification</h4>
                        <p className="text-sm text-muted-foreground">Government-issued ID required</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {verification.documents.identity ? (
                        <Badge variant="default" className="flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Uploaded
                        </Badge>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Mock file input
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*,.pdf';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleDocumentUpload("identity", file);
                            };
                            input.click();
                          }}
                        >
                          Upload ID
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <SquareCheckBig className="w-5 h-5" />
                      <div>
                        <h4 className="font-semibold">Background Check</h4>
                        <p className="text-sm text-muted-foreground">Optional but increases trust</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={verification.documents.backgroundCheck}
                        onCheckedChange={(checked) => {
                          setVerification(prev => ({
                            ...prev,
                            documents: {
                              ...prev.documents,
                              backgroundCheck: !!checked
                            }
                          }));
                        }}
                      />
                      <Label>Consent to check</Label>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <ListChecks className="w-5 h-5" />
                      <div>
                        <h4 className="font-semibold">Certificates & Licenses</h4>
                        <p className="text-sm text-muted-foreground">Upload relevant certifications</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Add Certificate
                    </Button>
                  </div>
                </div>

                {verification.status === "unverified" && verification.documents.identity && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800">Ready for Review</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Your documents will be reviewed within 24 hours. You'll receive an email notification once complete.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListCheck className="w-5 h-5" />
                  Weekly Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                    <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-20 font-semibold">{day}</div>
                      <div className="flex-1 grid grid-cols-4 gap-2">
                        {["9:00", "12:00", "15:00", "18:00"].map(time => (
                          <Button
                            key={time}
                            variant="outline"
                            size="sm"
                            className={`${availability[day]?.find(slot => slot.start === time)?.available ? 'bg-primary text-primary-foreground' : ''}`}
                            onClick={() => handleAvailabilityToggle(day, time, !availability[day]?.find(slot => slot.start === time)?.available)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HandHelping className="w-5 h-5" />
                  Available Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <Label>Category</Label>
                    <Select value={taskFilters.category} onValueChange={(value) => setTaskFilters(prev => ({...prev, category: value}))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All categories</SelectItem>
                        {CATEGORY_OPTIONS.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Max Distance</Label>
                    <Select value={taskFilters.maxDistance.toString()} onValueChange={(value) => setTaskFilters(prev => ({...prev, maxDistance: parseInt(value)}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 miles</SelectItem>
                        <SelectItem value="10">10 miles</SelectItem>
                        <SelectItem value="25">25 miles</SelectItem>
                        <SelectItem value="50">50 miles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Min Budget</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={taskFilters.minPay}
                      onChange={(e) => setTaskFilters(prev => ({...prev, minPay: parseInt(e.target.value) || 0}))}
                    />
                  </div>

                  <div className="flex items-end">
                    <Button variant="outline" onClick={() => setTaskFilters({category: "", maxDistance: 25, minPay: 0, skills: []})}>
                      Clear Filters
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {filteredTasks.map(task => (
                      <div key={task.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{task.title}</h4>
                            <p className="text-muted-foreground text-sm">{task.description}</p>
                          </div>
                          <Badge variant={task.urgency === "high" ? "destructive" : task.urgency === "medium" ? "secondary" : "outline"}>
                            {task.urgency} priority
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{task.location} • {task.distance}mi away</span>
                            <span>{task.postedAt}</span>
                            <span>{task.proposals} proposals</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="font-bold text-lg">
                                ${task.budget} {task.budgetType === "hourly" ? "/hr" : "fixed"}
                              </div>
                            </div>
                            
                            {verification.status === "verified" ? (
                              <Button
                                onClick={() => {
                                  setSelectedTask(task);
                                  setShowAcceptDialog(true);
                                }}
                              >
                                Accept Task
                              </Button>
                            ) : (
                              <Button variant="outline" disabled>
                                Verification Required
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-3">
                          {task.requiredSkills.map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCheck className="w-5 h-5" />
                    Tasks Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{completedTasks.length}</div>
                  <p className="text-sm text-muted-foreground mt-2">Total completed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Average Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {completedTasks.length > 0 
                      ? (completedTasks.reduce((sum, task) => sum + (task.rating || 0), 0) / completedTasks.length).toFixed(1)
                      : "N/A"
                    }
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Out of 5 stars</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {completedTasks.filter(task => 
                      new Date(task.completedAt).getMonth() === new Date().getMonth()
                    ).length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Tasks completed</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Completed Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedTasks.map(task => (
                    <div key={task.id} className="flex justify-between items-center p-3 border rounded">
                      <div className="flex-1">
                        <div className="font-semibold">{task.title} - {task.client}</div>
                        <div className="text-sm text-muted-foreground">Completed {task.completedAt}</div>
                        {task.review && (
                          <div className="text-sm text-muted-foreground italic mt-1">"{task.review}"</div>
                        )}
                      </div>
                      <div className="text-right">
                        {task.rating && (
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="font-semibold">{task.rating}/5</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full mt-4">
                  View All Completed Tasks
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Accept Task Dialog */}
      <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Task</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div>
                Are you sure you want to accept <strong>{selectedTask?.title}</strong>?
              </div>
              <div className="text-sm bg-muted p-3 rounded">
                <strong>Task Acceptance:</strong> Once accepted, you'll be connected with the client to coordinate details. 
                Make sure you can complete the task as described.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedTask && handleTaskAccept(selectedTask.id)}>
              Accept Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}