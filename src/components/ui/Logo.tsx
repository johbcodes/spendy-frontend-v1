export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src="/Spendy_1.png"
        alt="Spendy Logo"
        className="h-12 w-auto"
      />
    </div>
  );
}
