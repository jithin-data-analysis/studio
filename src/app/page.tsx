'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Target, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Role = 'admin' | 'teacher' | 'student' | '';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Login attempt:', { username, role });

    // --- Mock Authentication ---
    // In a real app, verify credentials against backend/Supabase Auth
    setTimeout(() => {
      setIsLoading(false);
      if (!username || !password || !role) {
        toast({
          title: 'Login Failed',
          description: 'Please enter username, password, and select a role.',
          variant: 'destructive',
        });
        return;
      }

      // Mock successful login redirects
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else if (role === 'teacher') {
        router.push('/teacher/dashboard');
      } else if (role === 'student') {
        router.push('/student/dashboard');
      } else {
        toast({
          title: 'Login Failed',
          description: 'Invalid role selected.',
          variant: 'destructive',
        });
      }
    }, 1000); // Simulate network delay
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-tl from-indigo-100 via-white to-teal-100 dark:from-indigo-900/30 dark:via-background dark:to-teal-900/30">
      <Target className="h-16 w-16 text-primary mb-4" />
      <h1 className="text-4xl font-bold text-primary mb-2">SATS</h1>
      <p className="text-lg text-muted-foreground mb-8 px-4 text-center max-w-xl">
        Student Academic Tracking System
      </p>
      <Card className="w-full max-w-md shadow-xl dark:shadow-indigo-900/10 border-t-4 border-primary rounded-xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">
            Welcome Back!
          </CardTitle>
          <CardDescription className="text-center">
            Please log in to access your dashboard.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Select Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as Role)} required>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select your role..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              <LogIn className="mr-2 h-4 w-4" />
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} SATS. All rights reserved.
      </footer>
    </div>
  );
}
