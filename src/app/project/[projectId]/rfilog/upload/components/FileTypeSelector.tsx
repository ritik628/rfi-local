'use client';
import { CheckCircle2 } from 'lucide-react';

export default function FileTypeSelector({ fileTypes, selectedValue, onSelect }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <h2 className="text-xs font-heading font-medium text-foreground mb-4 uppercase tracking-wider">1. Select file type</h2>
      <div className="space-y-3">
        {fileTypes.map(ft => {
          const Icon = ft.icon;
          const isSelected = selectedValue === ft.value;
          return (
            <label 
              key={ft.value} 
              className={`group relative flex items-start gap-4 p-5 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                isSelected 
                  ? 'bg-primary/[0.03] border-primary shadow-md' 
                  : 'bg-card border-border hover:border-border/80 hover:bg-muted/30'
              }`}
            >
              <input 
                type="radio" 
                name="fileType" 
                className="sr-only"
                value={ft.value} 
                checked={isSelected} 
                onChange={() => onSelect(ft.value)} 
              />
              <div className={`shrink-0 p-3 rounded-xl transition-colors ${
                isSelected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground group-hover:text-foreground'
              }`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium tracking-tight ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {ft.label}
                    </span>
                    {ft.multi && (
                      <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-medium uppercase tracking-tighter">
                        Bulk
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <div className="bg-primary text-white rounded-full p-1 shadow-sm animate-in zoom-in duration-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <p className={`text-xs mt-1.5 leading-relaxed font-normal transition-colors ${
                  isSelected ? 'text-foreground/80' : 'text-muted-foreground'
                }`}>
                  {ft.desc}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
