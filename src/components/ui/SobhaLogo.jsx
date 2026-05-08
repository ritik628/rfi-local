import { Hexagon } from 'lucide-react';

export default function SobhaLogo({ size = 46 }) {
  const r = Math.round(size * 0.2);
  
  return (
    <div 
      style={{ width: size, height: size, borderRadius: r }} 
      className="bg-primary/20 shrink-0 overflow-hidden relative flex items-center justify-center border border-primary/30"
    >
      <Hexagon className="text-primary w-2/3 h-2/3" strokeWidth={2.5} />
    </div>
  );
}
