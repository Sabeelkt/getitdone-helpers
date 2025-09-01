"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient, useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, HandHelpingIcon, LogIn } from "lucide-react";
import { toast } from "sonner";

interface AuthProps {
  onAuthSuccess?: (user: any) => void;
  className?: string;
}

export default function Auth({ onAuthSuccess, className = "" }: AuthProps) {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user && onAuthSuccess) {
      onAuthSuccess({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: 'user', // Default role, can be customized
        emailVerified: session.user.emailVerified || false
      });
    }
  }, [session, onAuthSuccess]);

  const handleRoleSelection = (role: 'user' | 'helper') => {
    if (role === 'user') {
      router.push('/login/user');
    } else {
      router.push('/login/helper');
    }
  };

  if (isPending) {
    return (
      <div className={`w-full max-w-md mx-auto ${className}`}>
        <Card className="bg-card/80 backdrop-blur-sm border shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Get It Done</h1>
        <p className="text-muted-foreground">Choose how you'd like to get started</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card 
          className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 group"
          onClick={() => handleRoleSelection('user')}
        >
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">I Need Help</CardTitle>
            <CardDescription>Post tasks and get help from others</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                • Post tasks you need help with
              </li>
              <li className="flex items-center gap-2">
                • Browse and hire qualified helpers
              </li>
              <li className="flex items-center gap-2">
                • Track task progress
              </li>
              <li className="flex items-center gap-2">
                • Rate and review helpers
              </li>
            </ul>
            <Button className="w-full mt-4" variant="outline">
              <LogIn className="w-4 h-4 mr-2" />
              Continue as Task Poster
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 group"
          onClick={() => handleRoleSelection('helper')}
        >
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <HandHelpingIcon className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">I Want to Help</CardTitle>
            <CardDescription>Earn money by helping others</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                • Browse available tasks
              </li>
              <li className="flex items-center gap-2">
                • Set your own rates and schedule
              </li>
              <li className="flex items-center gap-2">
                • Build your reputation
              </li>
              <li className="flex items-center gap-2">
                • Get paid for completed tasks
              </li>
            </ul>
            <Button className="w-full mt-4" variant="outline">
              <LogIn className="w-4 h-4 mr-2" />
              Continue as Helper
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-muted-foreground">
          New to Get It Done?{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}