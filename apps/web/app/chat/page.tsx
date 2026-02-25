"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isIndexing, setIsIndexing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Auto-resize textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = "auto";
            inputRef.current.style.height =
                Math.min(inputRef.current.scrollHeight, 120) + "px";
        }
    }, [input]);

    const handleIndex = async () => {
        setIsIndexing(true);
        try {
            const res = await fetch("/api/products/index", { method: "POST" });
            const data = await res.json();
            if (data.error) {
                alert(`Hata: ${data.error}`);
            } else {
                alert(
                    `✅ ${data.indexed} ürün vektörlendi${data.errors?.length > 0 ? `\n⚠️ Hatalar: ${data.errors.join(", ")}` : ""}`
                );
            }
        } catch {
            alert("İndeksleme başarısız oldu");
        } finally {
            setIsIndexing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;

        const userMessage: Message = { role: "user", content: trimmed };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Add empty assistant message for streaming
        const assistantMessage: Message = { role: "assistant", content: "" };
        setMessages((prev) => [...prev, assistantMessage]);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: trimmed,
                    history: messages.slice(-10), // Last 10 messages for context
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Chat failed");
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error("No response stream");

            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Parse SSE events
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const data = line.slice(6);
                        if (data === "[DONE]") continue;

                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.text) {
                                setMessages((prev) => {
                                    const updated = [...prev];
                                    const last = updated[updated.length - 1];
                                    if (last.role === "assistant") {
                                        last.content += parsed.text;
                                    }
                                    return updated;
                                });
                            }
                        } catch {
                            // Skip malformed JSON
                        }
                    }
                }
            }
        } catch (error) {
            const msg =
                error instanceof Error ? error.message : "Bir hata oluştu";
            setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last.role === "assistant") {
                    last.content = `❌ Hata: ${msg}`;
                }
                return updated;
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="flex h-screen flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/50 px-6 py-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                        <span className="text-lg">🤖</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">
                            AI Ürün Asistanı
                        </h1>
                        <p className="text-xs text-gray-400">
                            KKD ürün önerisi ve teknik danışmanlık
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleIndex}
                    disabled={isIndexing}
                    className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-xs font-medium text-gray-300 transition-colors hover:border-emerald-600 hover:bg-gray-700 hover:text-white disabled:opacity-50"
                >
                    {isIndexing ? "⏳ İndeksleniyor..." : "🔄 Ürünleri İndeksle"}
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                {messages.length === 0 && (
                    <div className="mx-auto max-w-2xl py-16 text-center">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 shadow-xl">
                            <span className="text-4xl">🛡️</span>
                        </div>
                        <h2 className="mb-3 text-2xl font-bold text-white">
                            KKD Ürün Asistanına Hoş Geldiniz
                        </h2>
                        <p className="mb-8 text-gray-400">
                            İhtiyacınıza uygun kişisel koruyucu donanım önerisi
                            alın. Çalışma ortamınızı, sektörünüzü ve
                            gereksinimlerinizi anlatın.
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {[
                                "Elektrikçiler için en uygun güvenlik ayakkabısı hangisi?",
                                "İnşaat şantiyesi için ağır hizmet bot öner",
                                "Hafif ve vegan uyumlu ayakkabı seçenekleri neler?",
                                "Soğuk ortamda çalışmaya uygun güvenlik botu",
                            ].map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => {
                                        setInput(suggestion);
                                        inputRef.current?.focus();
                                    }}
                                    className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-4 text-left text-sm text-gray-300 transition-all hover:border-emerald-600/50 hover:bg-gray-800 hover:text-white"
                                >
                                    <span className="mb-1 block text-emerald-400">💬</span>
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mx-auto max-w-3xl space-y-6">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {msg.role === "assistant" && (
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-sm shadow-lg shadow-emerald-500/20">
                                    🤖
                                </div>
                            )}
                            <div
                                className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === "user"
                                        ? "bg-gradient-to-r from-brand-600 to-brand-700 text-white"
                                        : "border border-gray-700/50 bg-gray-800/80 text-gray-200"
                                    }`}
                            >
                                {msg.role === "assistant" ? (
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <FormattedMessage content={msg.content} />
                                    </div>
                                ) : (
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                        {msg.content}
                                    </p>
                                )}
                                {msg.role === "assistant" &&
                                    isLoading &&
                                    i === messages.length - 1 &&
                                    msg.content === "" && (
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <div className="flex gap-1">
                                                <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:0ms]" />
                                                <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:150ms]" />
                                                <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:300ms]" />
                                            </div>
                                            <span className="text-xs">
                                                Düşünüyor...
                                            </span>
                                        </div>
                                    )}
                            </div>
                            {msg.role === "user" && (
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-700 text-sm font-semibold text-gray-300">
                                    👤
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="border-t border-gray-800 bg-gray-900/80 p-4 backdrop-blur-sm">
                <form
                    onSubmit={handleSubmit}
                    className="mx-auto flex max-w-3xl items-end gap-3"
                >
                    <div className="relative flex-1">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="KKD ihtiyacınızı anlatın... (Shift+Enter: yeni satır)"
                            rows={1}
                            className="w-full resize-none rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/40 disabled:opacity-40 disabled:shadow-none"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-5 w-5"
                        >
                            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}

/**
 * Simple markdown-like text formatter for assistant messages.
 */
function FormattedMessage({ content }: { content: string }) {
    if (!content) return null;

    // Very basic markdown rendering
    const lines = content.split("\n");

    return (
        <>
            {lines.map((line, i) => {
                // Bold
                const formatted = line.replace(
                    /\*\*(.*?)\*\*/g,
                    '<strong class="text-white font-semibold">$1</strong>'
                );

                // Headers
                if (line.startsWith("### ")) {
                    return (
                        <h4
                            key={i}
                            className="mt-3 mb-1 text-sm font-bold text-emerald-400"
                        >
                            {line.slice(4)}
                        </h4>
                    );
                }
                if (line.startsWith("## ")) {
                    return (
                        <h3
                            key={i}
                            className="mt-4 mb-2 text-base font-bold text-white"
                        >
                            {line.slice(3)}
                        </h3>
                    );
                }
                // List items
                if (line.startsWith("- ") || line.startsWith("* ")) {
                    return (
                        <li
                            key={i}
                            className="ml-4 text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{
                                __html: formatted.slice(2),
                            }}
                        />
                    );
                }
                // Numbered lists
                if (/^\d+\.\s/.test(line)) {
                    return (
                        <li
                            key={i}
                            className="ml-4 list-decimal text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{
                                __html: formatted.replace(/^\d+\.\s/, ""),
                            }}
                        />
                    );
                }
                // Empty lines
                if (line.trim() === "") {
                    return <br key={i} />;
                }
                // Regular text
                return (
                    <p
                        key={i}
                        className="text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatted }}
                    />
                );
            })}
        </>
    );
}
