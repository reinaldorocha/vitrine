import React, { useRef, useEffect, useState } from "react";
import EmojiPicker, { Theme, EmojiClickData } from "emoji-picker-react";
import { Smile } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, minHeight = "120px" }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Sync value from prop to DOM (only initially or if deeply changed externally, to avoid cursor jumping)
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
    handleInput();
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    editorRef.current?.focus();
    execCommand('insertText', emojiData.emoji);
    setShowEmojiPicker(false);
  };


  return (
    <div className="w-full bg-[#1c1c1c] border border-[#2d2d2d] focus-within:border-brand-magenta focus-within:ring-1 focus-within:ring-brand-magenta rounded-lg transition-all">
      {/* Visual Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#121212] border-b border-[#2d2d2d] rounded-t-lg">
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('bold'); }} className="p-1.5 hover:bg-[#2d2d2d] rounded text-brand-gray-light/80 hover:text-white font-serif font-black" title="Negrito">
          N
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('italic'); }} className="p-1.5 hover:bg-[#2d2d2d] rounded text-brand-gray-light/80 hover:text-white font-serif italic" title="Itálico">
          I
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('underline'); }} className="p-1.5 hover:bg-[#2d2d2d] rounded text-brand-gray-light/80 hover:text-white font-serif underline" title="Sublinhado">
          S
        </button>
        
        <div className="w-px h-4 bg-[#3a3a3a] mx-1"></div>
        
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('formatBlock', 'H1'); }} className="px-2 py-1 hover:bg-[#2d2d2d] rounded text-brand-gray-light/80 hover:text-white text-[10px] font-black uppercase tracking-wider flex flex-col items-center leading-none" title="Tamanho: Texto Grande">
          <span className="text-sm">A</span>
          Grande
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('formatBlock', 'H2'); }} className="px-2 py-1 hover:bg-[#2d2d2d] rounded text-brand-gray-light/80 hover:text-white text-[10px] font-bold uppercase tracking-wider flex flex-col items-center leading-none" title="Tamanho: Texto Médio">
          <span className="text-xs">A</span>
          Médio
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('formatBlock', 'P'); }} className="px-2 py-1 hover:bg-[#2d2d2d] rounded text-brand-gray-light/80 hover:text-white text-[10px] uppercase tracking-wider flex flex-col items-center leading-none" title="Tamanho: Texto Pequeno/Normal">
          <span className="text-[10px]">A</span>
          Normal
        </button>
        
        <div className="w-px h-4 bg-[#3a3a3a] mx-1"></div>
        
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('insertUnorderedList'); }} className="p-1.5 hover:bg-[#2d2d2d] rounded text-brand-gray-light/80 hover:text-white text-xs font-bold" title="Lista Com Marcadores">
          • Lista
        </button>

        <div className="w-px h-4 bg-[#3a3a3a] mx-1"></div>

        <div className="relative">
          <button 
            type="button" 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
            className="p-1.5 hover:bg-[#2d2d2d] rounded text-brand-gray-light/80 hover:text-white flex items-center justify-center" 
            title="Inserir Emoji/Símbolo"
          >
            <Smile className="w-4 h-4" />
          </button>
          
          {showEmojiPicker && (
            <div className="absolute top-10 right-0 md:left-0 z-50 shadow-2xl border border-[#2d2d2d] rounded-xl overflow-hidden">
              <EmojiPicker 
                onEmojiClick={onEmojiClick} 
                theme={Theme.DARK} 
                searchDisabled={false}
                skinTonesDisabled
              />
            </div>
          )}
        </div>
      </div>

      {/* Editable Area */}
      <div 
        ref={editorRef}
        className="p-4 text-sm text-white outline-none markdown-body overflow-y-auto rounded-b-lg"
        style={{ minHeight }}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
      />
    </div>
  );
}
