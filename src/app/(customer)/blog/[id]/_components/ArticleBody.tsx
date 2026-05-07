"use client";

import { useMemo } from "react";

interface ArticleBodyProps {
  content: string;
}

const removeDangerousHtml = (html: string) => {
  if (!html.trim()) {
    return "";
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  doc.querySelectorAll("script, style, iframe, object, embed").forEach((node) => node.remove());

  doc.querySelectorAll("*").forEach((el) => {
    const style = (el.getAttribute("style") ?? "").toLowerCase();
    const className = (el.getAttribute("class") ?? "").toLowerCase();

    const hasOverlayClass = /(overlay|backdrop|modal)/.test(className);
    const hasFixedOrAbsolute = /position\s*:\s*(fixed|absolute)/.test(style);
    const hasViewportCover =
      /(inset\s*:\s*0|top\s*:\s*0|left\s*:\s*0)/.test(style) &&
      /(width\s*:\s*100(vw|%)|height\s*:\s*100(vh|%))/.test(style);
    const hasDarkBackground =
      /(background(-color)?\s*:\s*(#000|black|rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.[0-9]+\)))/.test(style);

    if (hasOverlayClass || (hasFixedOrAbsolute && (hasViewportCover || hasDarkBackground))) {
      el.remove();
      return;
    }

    if (style) {
      // Remove positional/z-index styles that can escape article content and cover the page.
      const cleaned = style
        .replace(/position\s*:[^;]+;?/g, "")
        .replace(/z-index\s*:[^;]+;?/g, "")
        .replace(/inset\s*:[^;]+;?/g, "")
        .replace(/top\s*:[^;]+;?/g, "")
        .replace(/left\s*:[^;]+;?/g, "")
        .replace(/right\s*:[^;]+;?/g, "")
        .replace(/bottom\s*:[^;]+;?/g, "");

      if (cleaned.trim()) {
        el.setAttribute("style", cleaned);
      } else {
        el.removeAttribute("style");
      }
    }
  });

  return doc.body.innerHTML;
};

export default function ArticleBody({ content }: ArticleBodyProps) {
  const safeContent = useMemo(() => removeDangerousHtml(content), [content]);

  return (
    <div className="relative z-0 flex flex-col gap-4">
      {safeContent.trim().length > 0 ? (
        <div
          className="ql-editor p-0 text-[#5a4136] leading-[1.8] text-[15px]"
          dangerouslySetInnerHTML={{ __html: safeContent }}
        />
      ) : (
        <p className="text-[#5a4136] leading-[1.8] text-[15px]">No content available.</p>
      )}
    </div>
  );
}
