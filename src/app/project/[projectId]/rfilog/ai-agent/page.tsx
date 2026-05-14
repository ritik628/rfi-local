// "use client";

// import { useState, useRef, useEffect, useCallback } from "react";
// import { useParams } from "next/navigation";
// import { aiChat } from "@/lib/api/api";
// import toast from "react-hot-toast";
// import {
//   Send,
//   Mic,
//   MicOff,
//   Trash2,
//   Sparkles,
//   Zap,
//   BarChart3,
//   AlertCircle,
//   Search,
//   Lightbulb,
//   TrendingDown,
//   Bot,
//   User,
//   MoreHorizontal,
//   ChevronRight,
//   ChevronDown,
//   Info,
// } from "lucide-react";
// import SobhaLogo from "@/components/ui/SobhaLogo";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";

// const QUICK_PROMPTS = [
//   {
//     icon: BarChart3,
//     label: "Top Patterns",
//     text: "What are the top recurring design defect patterns? Which categories appear most frequently?",
//   },
//   {
//     icon: AlertCircle,
//     label: "Risk Priority",
//     text: "Which open RFIs pose the highest risk? Rank by severity, category, and urgency.",
//   },
//   {
//     icon: Search,
//     label: "Discipline Issues",
//     text: "Which discipline has the most unresolved RFIs? What are the common themes and root causes?",
//   },
//   {
//     icon: Lightbulb,
//     label: "Process Improvements",
//     text: "Based on the RFI patterns, what design process improvements would prevent the most common defect categories?",
//   },
//   {
//     icon: TrendingDown,
//     label: "Unclassified RFIs",
//     text: "Analyze the unclassified RFIs. What are likely reasons for extraction failure and what should I check in descriptions?",
//   },
// ];

// function AIAvatar() {
//   return (
//     <div className="w-8 h-8 rounded-xl bg-foreground flex items-center justify-center shrink-0 shadow-lg shadow-foreground/10 overflow-hidden ring-2 ring-background">
//       <SobhaLogo size={20} />
//     </div>
//   );
// }

// function UserAvatar() {
//   return (
//     <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/10 ring-2 ring-background text-white">
//       <User className="w-4 h-4" />
//     </div>
//   );
// }

// function MarkdownContent({ content, isUser }) {
//   return (
//     <ReactMarkdown
//       remarkPlugins={[remarkGfm]}
//       components={{
//         h1: ({ node, ...props }) => (
//           <h1
//             className={`text-[16px] font-bold mt-6 mb-3 border-b pb-1.5 border-current ${isUser ? "text-white" : "text-foreground/80"}`}
//             {...props}
//           />
//         ),
//         h2: ({ node, ...props }) => (
//           <h2
//             className={`text-[14px] font-semibold mt-5 mb-2.5 border-b pb-1 border-current ${isUser ? "text-white" : "text-foreground/80"}`}
//             {...props}
//           />
//         ),
//         h3: ({ node, ...props }) => (
//           <h3
//             className={`text-[13px] font-semibold mt-5 mb-2.5 flex items-center gap-2 ${isUser ? "text-inherit" : "text-foreground/80"}`}
//             {...props}
//           />
//         ),
//         p: ({ node, ...props }) => (
//           <p
//             className={`mb-3 last:mb-0 leading-relaxed ${isUser ? "text-white/90" : "text-foreground/70"}`}
//             {...props}
//           />
//         ),
//         ul: ({ node, ...props }) => (
//           <ul className="list-disc ml-5 mb-3 space-y-1" {...props} />
//         ),
//         ol: ({ node, ...props }) => (
//           <ol className="list-decimal ml-5 mb-3 space-y-1" {...props} />
//         ),
//         li: ({ node, ...props }) => <li className="pl-0.5" {...props} />,
//         blockquote: ({ node, ...props }) => (
//           <div
//             className={`my-4 p-3 border-l-3 rounded-r-lg text-[12px] italic leading-relaxed ${isUser ? "bg-white/10 border-white/30 text-white/80" : "bg-muted/40 border-primary/30 text-muted-foreground"}`}
//             {...props}
//           />
//         ),
//         table: ({ node, ...props }) => (
//           <div
//             className={`my-5 overflow-hidden rounded-lg border shadow-sm backdrop-blur-sm ${isUser ? "bg-white/5 border-white/20" : "bg-background/50 border-border"}`}
//           >
//             <div className="overflow-x-auto">
//               <table
//                 className="w-full border-collapse min-w-[400px]"
//                 {...props}
//               />
//             </div>
//           </div>
//         ),
//         thead: ({ node, ...props }) => (
//           <thead
//             className={isUser ? "bg-white/10" : "bg-muted/60"}
//             {...props}
//           />
//         ),
//         th: ({ node, ...props }) => (
//           <th
//             className={`px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider border ${isUser ? "text-white/70 border-white/10" : "text-muted-foreground border-border"}`}
//             {...props}
//           />
//         ),
//         td: ({ node, ...props }) => (
//           <td
//             className={`px-4 py-3 text-[11px] md:text-[12px] font-normal leading-relaxed border ${isUser ? "border-white/5 text-white/90" : "border-border/50 text-foreground/80"}`}
//             {...props}
//           />
//         ),
//         tr: ({ node, ...props }) => (
//           <tr
//             className={`transition-colors ${isUser ? "hover:bg-white/5" : "hover:bg-muted/10"}`}
//             {...props}
//           />
//         ),
//         code: ({ node, inline, ...props }) =>
//           inline ? (
//             <code
//               className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${isUser ? "bg-white/20 text-white" : "bg-muted text-primary"}`}
//               {...props}
//             />
//           ) : (
//             <div className="my-3 p-3 bg-neutral-900 rounded-lg overflow-x-auto">
//               <code
//                 className="text-[12px] font-mono text-neutral-100"
//                 {...props}
//               />
//             </div>
//           ),
//         strong: ({ node, ...props }) => (
//           <strong
//             className={`font-semibold ${isUser ? "text-white" : "text-foreground/90"}`}
//             {...props}
//           />
//         ),
//       }}
//     >
//       {content}
//     </ReactMarkdown>
//   );
// }

// const STORAGE_KEY = (pid) => `rfi_chat_${pid}`;

// const INIT_MSG = {
//   role: "assistant",
//   content:"",
// };

// import PageHeader from "@/components/blocks/PageHeader";

// export default function AIAgentPage() {
//   const { projectId } = useParams();
//   const storageKey = STORAGE_KEY(projectId);

//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [listening, setListening] = useState(false);
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [showPrompts, setShowPrompts] = useState(false);
//   const endRef = useRef(null);
//   const recognitionRef = useRef(null);
//   const promptRef = useRef(null);

//   // Initialize from sessionStorage
//   useEffect(() => {
//     try {
//       const saved = sessionStorage.getItem(storageKey);
//       setMessages(saved ? JSON.parse(saved) : [INIT_MSG]);
//     } catch {
//       setMessages([INIT_MSG]);
//     }
//     setIsLoaded(true);
//   }, [storageKey]);

//   // Click outside to close prompts
//   useEffect(() => {
//     const handle = (e) => {
//       if (promptRef.current && !promptRef.current.contains(e.target)) {
//         setShowPrompts(false);
//       }
//     };
//     document.addEventListener("mousedown", handle);
//     return () => document.removeEventListener("mousedown", handle);
//   }, []);

//   // Persist conversation
//   useEffect(() => {
//     if (isLoaded) {
//       try {
//         sessionStorage.setItem(storageKey, JSON.stringify(messages));
//       } catch {}
//     }
//   }, [messages, storageKey, isLoaded]);

//   useEffect(() => {
//     if (messages.length > 0) {
//       endRef.current?.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   const send = useCallback(
//     async (text) => {
//       const msg = (text || input).trim();
//       if (!msg || loading) return;

//       setInput("");
//       setShowPrompts(false);
//       const userMsg = { role: "user", content: msg };
//       const next = [...messages, userMsg];
//       setMessages(next);
//       setLoading(true);

//       try {
//         const res = await aiChat(projectId, next);
//         setMessages((prev) => [
//           ...prev,
//           { role: "assistant", content: res.reply },
//         ]);
//       } catch {
//         setMessages((prev) => [
//           ...prev,
//           {
//             role: "assistant",
//             content:
//               "⚠️ Connection error. Please verify the backend service is active and Azure AI credentials are configured.",
//           },
//         ]);
//         toast.error("Failed to connect to AI service");
//       } finally {
//         setLoading(false);
//       }
//     },
//     [input, loading, messages, projectId],
//   );

//   const clearHistory = () => {
//     if (confirm("Clear entire chat history?")) {
//       setMessages([INIT_MSG]);
//       try {
//         sessionStorage.removeItem(storageKey);
//       } catch {}
//       toast.success("Conversation cleared");
//     }
//   };

//   const toggleVoice = () => {
//     const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SR) return toast.error("Voice input is not supported in this browser");

//     if (listening) {
//       recognitionRef.current?.stop();
//       setListening(false);
//       return;
//     }

//     const rec = new SR();
//     rec.lang = "en-US";
//     rec.continuous = false;
//     rec.interimResults = false;
//     rec.onresult = (e) => {
//       const transcript = e.results[0][0].transcript;
//       setInput((prev) => prev + (prev ? " " : "") + transcript);
//     };
//     rec.onend = () => setListening(false);
//     rec.onerror = () => setListening(false);
//     rec.start();
//     recognitionRef.current = rec;
//     setListening(true);
//   };

//   const voiceSupported = !!(
//     typeof window !== "undefined" &&
//     (window.SpeechRecognition || window.webkitSpeechRecognition)
//   );

//   if (!isLoaded) return null;

//   return (
//     <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden relative">
//       <PageHeader
//         title="AI Agent"
//         subtitle="Design Defect Intelligence"
//         icon={<AIAvatar />}
//         badge={
//           <span className="text-[11px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
//             V5.4
//           </span>
//         }
//         actions={
//           <>
//             <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 md:px-4 md:py-1.5 rounded-full border border-emerald-100 text-[11px] font-semibold">
//               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
//               GPT-5.4 Active
//             </div>
//             <button
//               onClick={clearHistory}
//               className="flex items-center gap-2 bg-card border border-border px-3 py-2 rounded-xl text-sm font-semibold text-destructive hover:bg-destructive/5 transition-colors shadow-sm shrink-0"
//             >
//               <Trash2 className="w-3.5 h-3.5" />{" "}
//               <span className="hidden xs:inline">Clear</span>
//             </button>
//           </>
//         }
//       />

//       {/* Main Chat Area */}
//       <div className="flex-1 flex flex-col min-h-0 relative">
//         {/* Messages Scroll Area */}
//         <div className="flex-1 overflow-y-auto px-4 md:px-12 py-6 md:py-8 scrollbar-themed space-y-6 md:space-y-8">
//           <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
//             {messages.map((m, i) => (
//               <div
//                 key={i}
//                 className={`flex gap-3 md:gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
//               >
//                 <div className="shrink-0 scale-90 md:scale-100">
//                   {m.role === "assistant" ? <AIAvatar /> : <UserAvatar />}
//                 </div>
//                 <div
//                   className={`flex flex-col max-w-[88%] md:max-w-[85%] ${m.role === "user" ? "items-end" : "items-start"} min-w-0`}
//                 >
//                   <div
//                     className={`
//                     p-3 md:p-4 rounded-xl text-sm leading-relaxed shadow-sm w-full
//                     ${
//                       m.role === "user"
//                         ? "bg-foreground text-background font-medium rounded-tr-none"
//                         : "bg-card border border-border text-foreground rounded-tl-none"
//                     }
//                   `}
//                   >
//                     <div className="w-full overflow-hidden">
//                       <MarkdownContent
//                         content={m.content}
//                         isUser={m.role === "user"}
//                       />
//                     </div>
//                   </div>
//                   <span className="text-[11px] font-normal text-muted-foreground uppercase tracking-wider mt-1.5 px-1">
//                     {m.role === "user" ? "YOU" : "AI"} •{" "}
//                     {new Date().toLocaleTimeString([], {
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}
//                   </span>
//                 </div>
//               </div>
//             ))}

//             {loading && (
//               <div className="flex gap-4 md:gap-6 animate-pulse">
//                 <div className="shrink-0 scale-90 md:scale-100">
//                   <AIAvatar />
//                 </div>
//                 <div className="bg-card border border-border rounded-xl rounded-tl-none p-3 md:p-4 flex items-center gap-1.5">
//                   {[0, 1, 2].map((i) => (
//                     <div
//                       key={i}
//                       className="w-1.5 h-1.5 md:w-2 md:h-2 bg-muted-foreground/30 rounded-full animate-bounce"
//                       style={{ animationDelay: `${i * 0.15}s` }}
//                     />
//                   ))}
//                 </div>
//               </div>
//             )}
//             <div ref={endRef} />
//           </div>
//         </div>

//         {/* Input & Control Section */}
//         <div className="shrink-0 bg-background border-t border-border p-4 md:p-[24px_48px] pt-4 md:pt-6">
//           <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
//             {/* Quick Prompts - Responsive: Dropdown for Mobile, Buttons for Desktop */}
//             <div className="relative" ref={promptRef}>
//               {/* Mobile Trigger */}
//               <button
//                 onClick={() => setShowPrompts(!showPrompts)}
//                 className="md:hidden flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-lg text-[11px] font-bold text-foreground/70 hover:bg-muted transition-all group"
//               >
//                 <Sparkles className="w-3.5 h-3.5 text-primary" />
//                 <span>Quick Suggestions</span>
//                 <ChevronDown
//                   className={`w-3.5 h-3.5 transition-transform ${showPrompts ? "rotate-180" : ""}`}
//                 />
//               </button>

//               {/* Mobile Dropdown Menu */}
//               {showPrompts && (
//                 <div className="md:hidden absolute bottom-full left-0 mb-2 w-full sm:w-[400px] bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-20 animate-in slide-in-from-bottom-2 duration-200">
//                   <div className="bg-muted/30 px-3 py-2 border-b border-border text-[10px] font-black text-muted-foreground uppercase tracking-widest">
//                     Recommended Prompts
//                   </div>
//                   <div className="max-h-[300px] overflow-y-auto scrollbar-themed">
//                     {QUICK_PROMPTS.map((p) => {
//                       const Icon = p.icon;
//                       return (
//                         <button
//                           key={p.label}
//                           onClick={() => send(p.text)}
//                           className="w-full flex items-start gap-3 p-3 hover:bg-muted transition-colors text-left border-b border-border/50 last:border-0 group"
//                         >
//                           <div className="mt-0.5 w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
//                             <Icon className="w-3.5 h-3.5 text-primary opacity-60 group-hover:opacity-100" />
//                           </div>
//                           <div>
//                             <div className="text-[12px] font-bold text-foreground">
//                               {p.label}
//                             </div>
//                             <div className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
//                               {p.text}
//                             </div>
//                           </div>
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}

//               {/* Desktop Button Row */}
//               <div className="hidden md:flex flex-wrap gap-2 md:gap-2.5">
//                 {QUICK_PROMPTS.map((p) => {
//                   const Icon = p.icon;
//                   return (
//                     <button
//                       key={p.label}
//                       onClick={() => send(p.text)}
//                       className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-semibold text-foreground/70 hover:bg-muted hover:border-primary/20 hover:text-primary transition-all group"
//                     >
//                       <Icon className="w-3 h-3 md:w-3.5 md:h-3.5 opacity-50 group-hover:opacity-100" />
//                       {p.label}
//                       <ChevronRight className="w-2.5 h-2.5 md:w-3 md:h-3 opacity-0 group-hover:opacity-100 -ml-1 transition-all" />
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Chat Input Field */}
//             <div className="relative group">
//               <div className="absolute inset-0 bg-primary/5 blur-xl group-focus-within:bg-primary/10 transition-all rounded-3xl -z-10" />
//               <div className="bg-card border border-border group-focus-within:border-primary/40 rounded-xl p-1 md:p-1.5 flex items-center gap-2 md:gap-3 transition-all shadow-xl shadow-foreground/5">
//                 <input
//                   className="flex-1 bg-transparent border-none outline-none px-2.5 md:px-3 py-2 md:py-2.5 text-[13px] font-medium text-foreground placeholder:text-muted-foreground/60 min-w-0"
//                   placeholder="Ask about design defects..."
//                   value={input}
//                   onChange={(e) => setInput(e.target.value)}
//                   onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
//                   disabled={loading}
//                 />
//                 <div className="flex items-center gap-1.5 md:gap-2 pr-1 md:pr-1.5 shrink-0">
//                   {voiceSupported && (
//                     <button
//                       onClick={toggleVoice}
//                       className={`w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center transition-all ${
//                         listening
//                           ? "bg-destructive text-white animate-pulse"
//                           : "bg-muted text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground"
//                       }`}
//                     >
//                       {listening ? (
//                         <MicOff className="w-3.5 h-3.5 md:w-4 md:h-4" />
//                       ) : (
//                         <Mic className="w-3.5 h-3.5 md:w-4 md:h-4" />
//                       )}
//                     </button>
//                   )}
//                   <button
//                     onClick={() => send()}
//                     disabled={loading || !input.trim()}
//                     className="bg-primary text-white w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center hover:opacity-90 disabled:bg-muted disabled:text-muted-foreground transition-all"
//                   >
//                     <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Disclaimer */}
//             <div className="flex items-center justify-center gap-2 md:gap-4 text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-40">
//               <Zap className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" />
//               Context Aware AI
//               <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" />
//             </div>
//           </div>
//         </div>
//       </div>

//       <style jsx global>{`
//         .scrollbar-themed::-webkit-scrollbar {
//           width: 6px;
//           height: 6px;
//         }
//         .scrollbar-themed::-webkit-scrollbar-track {
//           background: transparent;
//         }
//         .scrollbar-themed::-webkit-scrollbar-thumb {
//           background: oklch(0.85 0 0);
//           border-radius: 10px;
//         }
//         .scrollbar-themed::-webkit-scrollbar-thumb:hover {
//           background: oklch(0.75 0 0);
//         }
//       `}</style>
//     </div>
//   );
// }
import ComingSoon from "@/components/blocks/ComingSoon";

export default function AI_AgentPage() {
  return <ComingSoon title="AI Agent" />;
}
