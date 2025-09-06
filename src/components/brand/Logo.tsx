import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'glass' | 'flat' | 'mark';
  showWordmark?: boolean;
  size?: number;
  className?: string;
}

export const Logo = ({ 
  variant = 'glass', 
  showWordmark = true, 
  size = 32,
  className 
}: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src="/brand/manana-logo.png"
        alt="Manana Logo"
        width={size}
        height={size}
        className="object-contain"
      />
      {showWordmark && (
        <span className="font-bold text-xl text-foreground">
          Manana
        </span>
      )}
    </div>
  );
};