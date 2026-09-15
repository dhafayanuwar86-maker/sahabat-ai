import { AIChatBox, type Message } from "@/components/AIChatBox";
import { FeatureTools } from "@/components/FeatureTools";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Bot, Check, Clipboard, FileText, Lightbulb, MessageCircle, Moon, Paperclip, RotateCcw, Sparkles, Sun, Trash2, WandSparkles, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { domainKnowledge, type KnowledgeDomain } from "@shared/domainKnowledge";
import { retrieveSources, type RetrievableSource } from "@shared/retrieval";
import { useEffect, useRef, useState } from "react";

type Mode = "daily" | "business" | "marketing";
type KnowledgeSource = RetrievableSource;
const starterMessages: Message[] = [{ role: "system", content: "Anda sedang berbicara dengan Sahabat AI 1.0." }];
const modes: { id: Mode; label: string; description: string; icon: typeof Sparkles }[] = [
  { id: "daily", label: "Keseharian", description: "Belajar, rutinitas, keputusan", icon: Lightbulb },
  { id: "business", label: "Bisnis", description: "Strategi, operasi, angka", icon: Bot },
  { id: "marketing", label: "Marketing", description: "Konten, audiens, funnel", icon: WandSparkles },
];
const promptCards = [
  { icon: Lightbulb, text: "Bantu saya membuat rencana mingguan" },
  { icon: WandSparkles, text: "Buat strategi marketing untuk bisnis saya" },
  { icon: MessageCircle, text: "Analisis ide bisnis ini secara kritis" },
];

async function extractDocumentText(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (["txt", "md", "csv", "json", "log"].includes(extension ?? "")) return file.text();
  if (extension === "pdf") {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, 20); pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
    }
    return pages.join("\n\n");
  }
  if (extension === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.default.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return result.value;
  }
  if (extension === "xlsx") {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    return workbook.SheetNames.map((name) => `Sheet: ${name}\n${XLSX.utils.sheet_to_csv(workbook.Sheets[name])}`).join("\n\n");
  }
  throw new Error("Format dokumen belum didukung");
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>(starterMessages);
  const [mode, setMode] = useState<Mode>("daily");
  const [domain, setDomain] = useState<KnowledgeDomain>("general");
  const [modelPreference, setModelPreference] = useState<"auto" | "local" | "claude-opus-4-7" | "claude-opus-4-6" | "gpt-5-mini">("auto");
  const [memory, setMemory] = useState("");
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [documentName, setDocumentName] = useState("");
  const [documentBusy, setDocumentBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatMutation = trpc.ai.chat.useMutation();
  const { data: evaluation } = trpc.ai.evaluation.useQuery();

  useEffect(() => {
    const saved = localStorage.getItem("keiland-ai-memory");
    const savedMessages = localStorage.getItem("keiland-ai-messages");
    const savedSources = localStorage.getItem("keiland-ai-sources");
    if (saved) setMemory(saved);
    if (savedSources) {
      try { const parsed = JSON.parse(savedSources) as KnowledgeSource[]; if (Array.isArray(parsed)) setSources(parsed); } catch { localStorage.removeItem("keiland-ai-sources"); }
    }
    if (savedMessages) {
      try { const parsed = JSON.parse(savedMessages) as Message[]; if (Array.isArray(parsed) && parsed.length) setMessages(parsed); } catch { localStorage.removeItem("keiland-ai-messages"); }
    }
  }, []);
  useEffect(() => { if (messages.length > 1) localStorage.setItem("keiland-ai-messages", JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem("keiland-ai-memory", memory); }, [memory]);
  useEffect(() => { localStorage.setItem("keiland-ai-sources", JSON.stringify(sources)); }, [sources]);

  const handleSend = (content: string) => {
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    const relevantSources = retrieveSources(content, sources, 4);
    chatMutation.mutate({
      mode,
      domain,
      modelPreference,
      memory: memory.trim() || undefined,
      sources: relevantSources.length ? relevantSources : undefined,
      messages: next.filter((item) => item.role !== "system").map((item) => ({ role: item.role as "user" | "assistant", content: item.content })),
    }, { onSuccess: (response) => setMessages((current) => [...current, { role: "assistant", content: response.content, model: response.model }]) });
  };
  const resetChat = () => { setMessages(starterMessages); setDocumentName(""); localStorage.removeItem("keiland-ai-messages"); };
  const clearMemory = () => { setMemory(""); localStorage.removeItem("keiland-ai-memory"); };
  const copyLastAnswer = async () => { const answer = [...messages].reverse().find((item) => item.role === "assistant"); if (!answer) return; await navigator.clipboard.writeText(answer.content); setCopied(true); window.setTimeout(() => setCopied(false), 1600); };
  const handleFile = async (file?: File) => {
    if (!file) return;
    const supported = /\.(txt|md|csv|json|log|pdf|docx|xlsx)$/i.test(file.name);
    if (!supported) { setDocumentName("Format belum didukung — gunakan TXT, MD, CSV, JSON, LOG, PDF, DOCX, atau XLSX"); return; }
    setDocumentBusy(true);
    try {
      const text = (await extractDocumentText(file)).slice(0, 18000);
      const chunks = text.match(/[\s\S]{1,4500}/g) ?? [];
      const documentId = `${file.name}-${file.size}-${file.lastModified}`;
      const additions = chunks.slice(0, 8).map((excerpt, index) => ({ id: `${documentId}-${index + 1}`, documentId, name: file.name, excerpt, chunk: index + 1 }));
      setSources((current) => [...current.filter((source) => source.documentId !== documentId), ...additions]);
      setDocumentName(`${file.name} · ${additions.length} bagian`);
    } catch (error) {
      console.error("[Knowledge] Document extraction failed:", error);
      setDocumentName("Gagal membaca dokumen — periksa file dan coba lagi");
    } finally {
      setDocumentBusy(false);
    }
  };

  return <div className="min-h-screen overflow-hidden bg-[#f7f4ef] text-[#1d2633] transition-colors dark:bg-[#101a29] dark:text-[#f4f0e8]">
    <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col lg:flex-row">
      <aside className="relative flex w-full shrink-0 flex-col justify-between overflow-hidden bg-[#182536] px-6 py-7 text-white lg:w-[310px] lg:px-8 lg:py-9">
        <div className="absolute -right-20 -top-20 size-64 rounded-full bg-[#ef795f]/20 blur-3xl" />
        <div className="relative">
          <div className="mb-10 flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-2xl bg-[#ef795f]"><Sparkles className="size-5" /></div><div><p className="font-display text-lg font-semibold">Sahabat AI 1.0</p><p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Asisten serbaguna Anda</p></div></div>
          <div className="mb-8"><p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ef795f]">Workspace</p><h1 className="font-display max-w-[230px] text-3xl font-semibold leading-[1.08] tracking-[-0.04em]">AI yang mengenal cara kerja Anda.</h1><p className="mt-4 max-w-[240px] text-sm leading-6 text-white/60">Pilih mode, simpan konteks penting, dan ajak Sahabat AI bekerja lebih spesifik.</p></div>
          <div className="space-y-3"><div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><div className="mb-3 flex items-center gap-2 text-xs font-medium text-white/75"><Bot className="size-4 text-[#ef795f]" /> Model aktif</div><select value={modelPreference} onChange={(event) => setModelPreference(event.target.value as typeof modelPreference)} className="w-full rounded-lg border border-white/10 bg-[#182536] px-2 py-2 font-mono text-[11px] text-white/75 outline-none"><option value="auto">Auto · hemat</option><option value="local">Local · Ollama/vLLM</option><option value="claude-opus-4-7">Claude Opus 4.7</option><option value="claude-opus-4-6">Claude Opus 4.6</option><option value="gpt-5-mini">GPT-5 mini</option></select><div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-300"><span className="size-1.5 rounded-full bg-emerald-300" /> {modelPreference === "local" ? "Provider lokal" : "Katalog live"}</div></div>
            <button onClick={() => setMemoryOpen(!memoryOpen)} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-left text-xs leading-5 text-white/55 transition hover:bg-white/10"><p className="mb-1 font-medium text-white/80">Memory saya {memory ? "· aktif" : "· kosong"}</p><p>{memory ? "Sahabat AI memakai konteks yang Anda simpan." : "Tambahkan profil, tujuan, atau preferensi Anda."}</p></button>
            {memoryOpen && <div className="rounded-2xl border border-[#ef795f]/30 bg-[#ef795f]/10 p-3"><textarea value={memory} onChange={(e) => setMemory(e.target.value)} placeholder="Contoh: Saya menjalankan toko pakaian online..." className="min-h-24 w-full resize-none rounded-xl border border-white/10 bg-black/10 p-3 text-xs text-white outline-none placeholder:text-white/35" /><button onClick={clearMemory} className="mt-2 flex items-center gap-1 text-[11px] text-white/50 hover:text-white"><Trash2 className="size-3" /> Hapus memory</button></div>}</div>
        </div>
        <div className="relative mt-8 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-white/40"><span>Sahabat AI · 1.0</span><span className="rounded-full border border-white/10 px-2.5 py-1">Beta</span></div>
      </aside>
      <main className="flex min-h-[calc(100vh-1px)] min-w-0 flex-1 flex-col px-4 py-5 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
        <header className="mx-auto flex w-full max-w-5xl items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ef795f]">Sahabat AI 1.0</p><p className="mt-1 text-sm text-[#667181] dark:text-[#aab5c5]">Memory lokal · mode spesifik · dokumen kontekstual</p></div><div className="flex items-center gap-2"><Button variant="ghost" size="sm" onClick={toggleTheme} aria-label={theme === "dark" ? "Gunakan tema terang" : "Gunakan tema gelap"} className="gap-2 text-[#667181] hover:bg-[#ebe5dc] dark:text-[#c8d1df] dark:hover:bg-white/10"><span className="sr-only">{theme === "dark" ? "Tema terang" : "Tema gelap"}</span>{theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}<span className="hidden sm:inline">{theme === "dark" ? "Terang" : "Gelap"}</span></Button><Button variant="ghost" size="sm" onClick={copyLastAnswer} disabled={!messages.some((item) => item.role === "assistant")} className="hidden gap-2 text-[#667181] dark:text-[#c8d1df] sm:flex">{copied ? <Check className="size-4 text-emerald-600" /> : <Clipboard className="size-4" />}{copied ? "Tersalin" : "Salin jawaban"}</Button><Button variant="outline" size="sm" onClick={resetChat} className="gap-2 border-[#dcd5cb] bg-transparent text-[#667181] dark:border-white/15 dark:text-[#c8d1df] dark:hover:bg-white/10"><RotateCcw className="size-4" /><span className="hidden sm:inline">Percakapan baru</span><span className="sm:hidden">Baru</span></Button></div></header>
        <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col pt-7 sm:pt-9">
          <div className="mb-3 flex flex-wrap gap-2">{modes.map(({ id, label, description, icon: Icon }) => <button key={id} onClick={() => setMode(id)} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition ${mode === id ? "border-[#ef795f] bg-[#fff0eb] text-[#c95d47] dark:bg-[#3a2728] dark:text-[#ffad97]" : "border-[#e4ddd3] bg-white/70 text-[#667181] hover:bg-white dark:border-white/15 dark:bg-white/[0.05] dark:text-[#c8d1df] dark:hover:bg-white/10"}`}><Icon className="size-4" /><span><span className="block text-xs font-semibold">{label}</span><span className="hidden text-[10px] opacity-70 sm:block">{description}</span></span></button>)}<input ref={fileInputRef} type="file" accept=".txt,.md,.csv,.json,.log,.pdf,.docx,.xlsx" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} /><Button variant="outline" size="sm" disabled={documentBusy} onClick={() => fileInputRef.current?.click()} className="ml-auto gap-2 border-[#e4ddd3] bg-white/70 text-[#667181] dark:border-white/15 dark:bg-white/[0.05] dark:text-[#c8d1df] dark:hover:bg-white/10"><Paperclip className="size-4" /> {documentBusy ? "Membaca..." : "Dokumen"}</Button></div>
          <div className="mb-4 flex flex-wrap items-center gap-2"><span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9a938b] dark:text-[#8290a4]">Knowledge</span>{(Object.entries(domainKnowledge) as [KnowledgeDomain, typeof domainKnowledge[KnowledgeDomain]][]).map(([id, item]) => <button key={id} onClick={() => setDomain(id)} className={`rounded-full border px-3 py-1.5 text-xs transition ${domain === id ? "border-[#ef795f] bg-[#fff0eb] text-[#c95d47] dark:bg-[#3a2728] dark:text-[#ffad97]" : "border-[#e4ddd3] bg-white/60 text-[#667181] hover:bg-white dark:border-white/15 dark:bg-white/[0.04] dark:text-[#c8d1df] dark:hover:bg-white/10"}`}>{item.label}</button>)}<span className="ml-auto text-[10px] text-[#9a938b] dark:text-[#8290a4]">Hybrid retrieval · {evaluation ? `${evaluation.totalCases} evaluasi` : "evaluasi"}</span></div>
          {documentName && <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#e4ddd3] bg-white/70 px-3 py-2 text-xs text-[#667181] dark:border-white/15 dark:bg-white/[0.05] dark:text-[#c8d1df]"><FileText className="size-4 text-[#ef795f]" /><span className="min-w-0 flex-1 truncate">{documentName} · {new Set(sources.map((source) => source.name)).size} dokumen · {sources.length} potongan siap dicari</span><button onClick={() => { setDocumentName(""); setSources([]); localStorage.removeItem("keiland-ai-sources"); }}><X className="size-4" /></button></div>}
          <FeatureTools onAssistantMessage={(message) => setMessages((current) => [...current, message])} />
          {messages.length <= 1 && <div className="mb-6 grid gap-3 sm:grid-cols-3">{promptCards.map(({ icon: Icon, text }) => <button key={text} onClick={() => handleSend(text)} className="group flex items-center gap-3 rounded-2xl border border-[#e4ddd3] bg-white/70 p-4 text-left text-sm text-[#586373] shadow-sm transition hover:-translate-y-0.5 hover:border-[#ef795f]/50 hover:bg-white dark:border-white/15 dark:bg-white/[0.05] dark:text-[#c8d1df] dark:hover:bg-white/10"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#fff0eb] text-[#ef795f] group-hover:bg-[#ef795f] group-hover:text-white dark:bg-[#3a2728]"><Icon className="size-4" /></span><span className="leading-5">{text}</span></button>)}</div>}
          <AIChatBox messages={messages} onSendMessage={handleSend} isLoading={chatMutation.isPending} height="min(65vh, 630px)" placeholder={`Tulis pesan dalam mode ${modes.find((item) => item.id === mode)?.label}...`} emptyStateMessage="Sahabat AI siap membantu" suggestedPrompts={[]} className="min-h-[450px] rounded-[26px] border-[#e4ddd3] bg-white shadow-[0_18px_60px_rgba(56,43,28,0.08)] dark:border-white/15 dark:bg-[#192638] dark:shadow-[0_18px_60px_rgba(0,0,0,0.22)]" />
          {chatMutation.isError && <p className="mt-3 text-center text-xs text-red-600 dark:text-red-300">{chatMutation.error.message}</p>}<p className="mt-4 text-center text-[11px] text-[#9a938b] dark:text-[#8290a4]">Sahabat AI dapat membuat kesalahan. Periksa kembali informasi penting.</p>
        </section>
      </main>
    </div>
  </div>;
}
