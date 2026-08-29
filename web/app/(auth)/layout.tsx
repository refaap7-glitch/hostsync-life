export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-primary" />
          <span className="text-xl font-semibold text-foreground">HostSync Lite</span>
        </div>
        {children}
      </div>
    </div>
  );
}
