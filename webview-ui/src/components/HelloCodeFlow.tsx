import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * HelloCodeFlow is a placeholder component demonstrating:
 * - VS Code theme integration
 * - shadcn/ui component usage (Card, Button, Badge)
 * - Tailwind CSS styling
 */
export function HelloCodeFlow() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Hello CodeFlow
            <Badge variant="secondary">v0.0.1</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Your PR management dashboard is loading...</p>
          <p className="text-sm text-muted-foreground">
            This webview automatically inherits your VS Code theme. Try switching between light and
            dark themes to see it in action!
          </p>
          <div className="flex gap-2">
            <Button variant="default">Primary Action</Button>
            <Button variant="secondary">Secondary</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>Ready</Badge>
            <Badge variant="secondary">In Progress</Badge>
            <Badge variant="outline">Review</Badge>
            <Badge variant="destructive">Blocked</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
