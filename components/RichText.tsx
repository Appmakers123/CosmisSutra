import React from 'react';

interface RichTextProps {
  text: string;
  className?: string;
}

const RichText: React.FC<RichTextProps> = ({ text, className = '' }) => {
  if (!text) return null;

  const lines = text.split('\n');
  const renderedLines: React.ReactNode[] = [];

  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = (keyPrefix: string) => {
      if (listItems.length > 0) {
          renderedLines.push(
              <ul key={`${keyPrefix}-list`} className="list-disc ml-5 mb-4 space-y-1 text-slate-300">
                  {listItems}
              </ul>
          );
          listItems = [];
          inList = false;
      }
  };

  const processInline = (str: string) => {
      // Parser for **bold** and *italic*
      const parts = str.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      return parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-bold text-amber-200">{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
              return <em key={i} className="text-purple-200 not-italic">{part.slice(1, -1)}</em>;
          }
          return part;
      });
  };

  lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Headers
      if (trimmed.startsWith('### ')) {
          flushList(`header-${index}`);
          renderedLines.push(<h4 key={`h4-${index}`} className="text-lg font-serif font-bold text-amber-100 mt-4 mb-2">{processInline(trimmed.slice(4))}</h4>);
          return;
      }
      if (trimmed.startsWith('## ')) {
          flushList(`header-${index}`);
          renderedLines.push(<h3 key={`h3-${index}`} className="text-xl font-serif font-bold text-amber-200 mt-5 mb-3">{processInline(trimmed.slice(3))}</h3>);
          return;
      }

      // List Items (Start with * or -)
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          inList = true;
          listItems.push(<li key={`li-${index}`}>{processInline(trimmed.slice(2))}</li>);
          return;
      }

      // Normal Text or Empty
      flushList(`text-${index}`);
      
      if (trimmed === '') {
         // Skip consecutive empty lines in some cases, or render spacer
      } else {
          renderedLines.push(<p key={`p-${index}`} className="mb-3 leading-relaxed text-slate-200">{processInline(trimmed)}</p>);
      }
  });

  flushList('end');

  return <div className={`text-sm md:text-base ${className}`}>{renderedLines}</div>;
};

export default RichText;