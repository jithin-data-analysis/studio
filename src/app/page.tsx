import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, GraduationCap } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-secondary via-background to-secondary">
      <Card className="w-full max-w-md text-center shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">
            Welcome to CampusAI
          </CardTitle>
          <p className="text-muted-foreground">
            Your AI-Powered School Progress Platform
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Link href="/admin" passHref>
            <Button className="w-full" size="lg">
              <Building className="mr-2" /> Admin Configuration
            </Button>
          </Link>
          <Link href="/teacher" passHref>
            <Button className="w-full" variant="secondary" size="lg">
              <GraduationCap className="mr-2" /> Teacher Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
