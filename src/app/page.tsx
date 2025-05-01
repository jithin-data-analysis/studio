import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Added CardDescription
import { Building, GraduationCap, Target } from 'lucide-react'; // Added Target icon

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-tl from-indigo-100 via-white to-teal-100 dark:from-indigo-900/30 dark:via-background dark:to-teal-900/30">
       {/* Added an introductory icon and text */}
       <Target className="h-16 w-16 text-primary mb-6 animate-pulse" />
       <h1 className="text-4xl font-bold text-primary mb-2">EduPulse</h1>
       <p className="text-lg text-muted-foreground mb-8 px-4 text-center max-w-xl">
         Your GenAI-Powered School Progress & Analytics Platform. Unlock insights, track growth, and empower learning.
       </p>
      <Card className="w-full max-w-md text-center shadow-xl dark:shadow-indigo-900/10 transition-shadow duration-300 hover:shadow-2xl border-t-4 border-primary rounded-xl overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="text-2xl font-semibold text-primary">
            Get Started
          </CardTitle>
           {/* Added CardDescription for more context */}
           <CardDescription className="text-muted-foreground pt-1">
            Choose your role to access the dashboard.
           </CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex flex-col gap-4">
          <Link href="/admin" passHref>
            <Button
                className="w-full transform transition-transform duration-200 hover:scale-105"
                size="lg"
                aria-label="Go to Admin Configuration"
            >
              <Building className="mr-2" /> Admin Configuration
            </Button>
          </Link>
          <Link href="/teacher" passHref>
            <Button
                className="w-full transform transition-transform duration-200 hover:scale-105"
                variant="secondary"
                size="lg"
                aria-label="Go to Teacher Dashboard"
            >
              <GraduationCap className="mr-2" /> Teacher Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
        <footer className="mt-12 text-center text-sm text-muted-foreground">
           © {new Date().getFullYear()} EduPulse. All rights reserved.
       </footer>
    </div>
  );
}
