import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { useChat } from "@/contexts/chat-context";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

async function invokeChatApi(message: string): Promise<{ reply?: string; error?: string }> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  const data = await res.json();
  if (res.ok) return { reply: data.reply };
  return { error: data.error ?? res.statusText };
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatWidget() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith("ar") ?? false;
  const { isOpen, close, toggle } = useChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0 && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setError(null);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const maxRetries = 2;
      let lastError: string | null = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const result = await invokeChatApi(text);
          if (result.error) throw new Error(result.error);
          const reply = result.reply ?? t("chat.errorNoReply");
          const assistantMsg: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: reply,
          };
          setMessages((prev) => [...prev, assistantMsg]);
          return;
        } catch (err) {
          lastError = err instanceof Error ? err.message : String(err);
          if (attempt < maxRetries) {
            await new Promise((r) => setTimeout(r, 800));
          }
        }
      }

      let msg = t("chat.errorGeneric");
      if (lastError?.includes("Failed to send a request to the Edge Function")) {
        msg = t("chat.errorEdgeFunction");
      } else if (lastError) {
        msg = lastError;
      }
      setError(msg);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("chat.errorGeneric");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating toggle button - visible when panel is closed */}
      {!isOpen && (
        <button
          onClick={toggle}
          className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 shadow-lg shadow-amber-500/40 transition-all hover:scale-105 hover:bg-amber-600"
          aria-label={t("chat.open")}
        >
          <MessageCircle className="h-7 w-7 text-white" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-4 z-50 flex flex-col rounded-xl border border-border bg-card shadow-xl",
            "h-[420px] w-[380px] max-w-[calc(100vw-2rem)]",
            isArabic ? "left-4" : "right-4"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-amber-500" />
              <span className="font-bold">{t("chat.title")}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={close}
              aria-label={t("chat.close")}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-3 min-h-0"
          >
            <div className="space-y-3 pb-2">
              {messages.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  {t("chat.placeholder")}
                </p>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm max-w-[90%]",
                    msg.role === "user"
                      ? "ml-auto bg-amber-500/20 text-foreground"
                      : "bg-muted/50 text-foreground"
                  )}
                  style={isArabic ? { marginLeft: 0, marginRight: "auto" } : {}}
                >
                  {msg.content}
                </div>
              ))}
              {loading && (
                <div
                  className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm"
                  style={isArabic ? { marginRight: "auto" } : {}}
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("chat.typing")}</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <p className="px-4 py-1 text-xs text-destructive">{error}</p>
          )}

          {/* Input */}
          <div className="flex gap-2 border-t border-border p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("chat.inputPlaceholder")}
              disabled={loading}
              className="flex-1"
            />
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
