"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, HandHeart, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const handleUserLogin = () => {
    router.push("/login/user");
  };

  const handleHelperLogin = () => {
    router.push("/login/helper");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Branding */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Get It Done</h1>
          <p className="text-muted-foreground">Choose how you'd like to sign in</p>
        </div>

        {/* Login Options */}
        <div className="space-y-4">
          {/* Task Poster (User) Login */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={handleUserLogin}>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">Task Poster</CardTitle>
                  <CardDescription className="text-sm">
                    I need help with tasks
                  </CardDescription>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardHeader>
          </Card>

          {/* Helper Login */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={handleHelperLogin}>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-accent/50 rounded-lg group-hover:bg-accent transition-colors">
                  <HandHeart className="h-6 w-6 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">Helper</CardTitle>
                  <CardDescription className="text-sm">
                    I want to help others with tasks
                  </CardDescription>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Alternative Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={handleUserLogin} className="w-full">
            <User className="h-4 w-4 mr-2" />
            Task Poster
          </Button>
          <Button variant="outline" onClick={handleHelperLogin} className="w-full">
            <HandHeart className="h-4 w-4 mr-2" />
            Helper
          </Button>
        </div>

        {/* Register Links */}
        <div className="text-center space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Don't have an account?
              </span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 text-sm">
            <Link 
              href="/register/user" 
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Register as Task Poster
            </Link>
            <Link 
              href="/register/helper" 
              className="text-accent-foreground hover:text-accent-foreground/80 transition-colors font-medium"
            >
              Register as Helper
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}