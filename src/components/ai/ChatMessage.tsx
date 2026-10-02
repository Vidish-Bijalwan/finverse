import { Bot } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

export interface ChatMsg {
  id: string;
  role: "user" | "ai";
  text: string;
  link?: { to: string; label: string };
}

export function ChatMessage({ msg }: { msg: ChatMsg }) {
  const isUser = msg.role === "user";

  return (
    <div className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <span
          aria-hidden
          className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10"
        >
          <Bot className="size-4 text-primary" />
        </span>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-6",
          isUser
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm border bg-card text-card-foreground",
        )}
      >
        <p className="whitespace-pre-wrap">{msg.text}</p>
        {msg.link && (
          <Link
            to={msg.link.to}
            className="mt-2 inline-flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            {msg.link.label} <span aria-hidden>→</span>
          </Link>
        )}
      </div>
    </div>
  );
}
