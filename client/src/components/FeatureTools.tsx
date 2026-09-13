import { trpc } from "@/lib/trpc";
import { Code2, ImagePlus, Newspaper } from "lucide-react";
import { useState } from "react";
import type { Message } from "./AIChatBox";

type Props = { onAssistantMessage: (message: Message) => void };

export function FeatureTools({ onAssistantMessage }: Props) {
  const [imagePrompt, setImagePrompt] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState<string>();
  const news = trpc.ai.newsBriefing.useMutation({ onSuccess: (result) => onAssistantMessage({ role: "assistant", content: `${result.content}\n\n*Sumber: ${result.headlines.map((item) => `[${item.source}](${item.link})`).join(", ")}*`, model: result.model }) });
  const image = trpc.ai.generateImage.useMutation({ onSuccess: (result) => setImageUrl(result.url) });
  const coding = trpc.ai.codeHelp.useMutation({ onSuccess: (result) => onAssistantMessage({ role: "assistant", content: result.content, model: result.model }) });

  return <div className="mb-4 grid gap-3 md:grid-cols-3">
    <div className="rounded-2xl border border-[#e4ddd3] bg-white/70 p-3 dark:border-white/15 dark:bg-white/[0.05]">
      <button onClick={() => news.mutate({})} disabled={news.isPending} className="flex w-full items-center gap-2 text-left text-sm font-semibold text-[#586373] dark:text-[#c8d1df]"><Newspaper className="size-4 text-[#ef795f]" /> {news.isPending ? "Mengambil berita..." : "Briefing berita besar"}</button>
      {news.error && <p className="mt-2 text-xs text-red-600">{news.error.message}</p>}
    </div>
    <div className="rounded-2xl border border-[#e4ddd3] bg-white/70 p-3 dark:border-white/15 dark:bg-white/[0.05]">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#586373] dark:text-[#c8d1df]"><ImagePlus className="size-4 text-[#ef795f]" /> Generate foto</div>
      <div className="flex gap-2"><input value={imagePrompt} onChange={(event) => setImagePrompt(event.target.value)} placeholder="Contoh: kota futuristik saat senja" className="min-w-0 flex-1 rounded-lg border border-[#e4ddd3] bg-white px-2 py-1.5 text-xs outline-none dark:border-white/15 dark:bg-white/10" /><button onClick={() => image.mutate({ prompt: imagePrompt })} disabled={image.isPending || imagePrompt.trim().length < 3} className="rounded-lg bg-[#ef795f] px-2 text-xs text-white disabled:opacity-50">{image.isPending ? "..." : "Buat"}</button></div>
      {image.error && <p className="mt-2 text-xs text-red-600">{image.error.message}</p>}
      {imageUrl && <a href={imageUrl} target="_blank" rel="noreferrer" className="mt-2 block text-xs text-[#c95d47] underline">Buka hasil foto</a>}
    </div>
    <div className="rounded-2xl border border-[#e4ddd3] bg-white/70 p-3 dark:border-white/15 dark:bg-white/[0.05]">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#586373] dark:text-[#c8d1df]"><Code2 className="size-4 text-[#ef795f]" /> Coding mentor</div>
      <textarea value={code} onChange={(event) => setCode(event.target.value)} placeholder="Tempel kode yang error" className="mb-2 h-12 w-full resize-none rounded-lg border border-[#e4ddd3] bg-white px-2 py-1.5 text-xs outline-none dark:border-white/15 dark:bg-white/10" />
      <div className="flex gap-2"><input value={error} onChange={(event) => setError(event.target.value)} placeholder="Pesan error" className="min-w-0 flex-1 rounded-lg border border-[#e4ddd3] bg-white px-2 py-1.5 text-xs outline-none dark:border-white/15 dark:bg-white/10" /><button onClick={() => coding.mutate({ language: "auto", code, error })} disabled={coding.isPending || !code.trim() || !error.trim()} className="rounded-lg bg-[#182536] px-2 text-xs text-white disabled:opacity-50">{coding.isPending ? "..." : "Analisis"}</button></div>
      {coding.error && <p className="mt-2 text-xs text-red-600">{coding.error.message}</p>}
    </div>
  </div>;
}
