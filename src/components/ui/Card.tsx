import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn("px-5 py-4 border-b border-zinc-800", className)} {...props} />;
}

function CardContent({ className, ...props }: CardProps) {
  return <div className={cn("p-5", className)} {...props} />;
}

function CardFooter({ className, ...props }: CardProps) {
  return (
    <div className={cn("px-5 py-4 border-t border-zinc-800", className)} {...props} />
  );
}

export { Card, CardHeader, CardContent, CardFooter };
