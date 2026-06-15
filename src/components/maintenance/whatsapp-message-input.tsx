'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Send, Paperclip, X, Image as ImageIcon, FileText, Smile, RotateCcw } from 'lucide-react'
import type { WhatsAppMessage } from './whatsapp-message-bubble'

const MAX_CHARS = 4096

interface WhatsAppMessageInputProps {
  onSend: (content: string, type: 'text' | 'image' | 'document' | 'video' | 'audio', file?: File) => void
  onTyping: () => void
  replyingTo?: WhatsAppMessage | null
  onCancelReply: () => void
  disabled?: boolean
  placeholder?: string
}

export function WhatsAppMessageInput({
  onSend,
  onTyping,
  replyingTo,
  onCancelReply,
  disabled = false,
  placeholder = 'Type a message…',
}: WhatsAppMessageInputProps) {
  const [text, setText] = useState('')
  const [showEmojiHint, setShowEmojiHint] = useState(false)
  const [attachedFile, setAttachedFile] = useState<{ file: File; preview?: string } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTypingEmit = useRef<number>(0)

  // টেক্সটএরিয়া স্বয়ংক্রিয়ভাবে আকার পরিবর্তন
  useEffect(() => {
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
    }
  }, [text])

  // উত্তর দেওয়ার সময় ফোকাস
  useEffect(() => {
    if (replyingTo) {
      textareaRef.current?.focus()
    }
  }, [replyingTo])

  const handleTyping = useCallback(() => {
    const now = Date.now()
    if (now - lastTypingEmit.current > 3000) {
      lastTypingEmit.current = now
      onTyping()
    }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
  }, [onTyping])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    if (val.length <= MAX_CHARS) {
      setText(val)
      handleTyping()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    if (attachedFile) {
      const ext = attachedFile.file.name.split('.').pop()?.toLowerCase() || ''
      const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']
      const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm']
      const audioExts = ['mp3', 'wav', 'ogg', 'aac', 'm4a']
      let type: 'image' | 'document' | 'video' | 'audio' | 'text' = 'document'
      if (imageExts.includes(ext)) type = 'image'
      else if (videoExts.includes(ext)) type = 'video'
      else if (audioExts.includes(ext)) type = 'audio'

      onSend(text || attachedFile.file.name, type, attachedFile.file)
      setAttachedFile(null)
    } else if (text.trim()) {
      onSend(text.trim(), 'text')
    }
    setText('')
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    textareaRef.current?.focus()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // সর্বোচ্চ 16MB
    if (file.size > 16 * 1024 * 1024) {
      return
    }

    let preview: string | undefined
    if (file.type.startsWith('image/')) {
      preview = URL.createObjectURL(file)
    }

    setAttachedFile({ file, preview })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeAttachment = () => {
    if (attachedFile?.preview) URL.revokeObjectURL(attachedFile.preview)
    setAttachedFile(null)
  }

  const charsLeft = MAX_CHARS - text.length
  const canSend = (text.trim().length > 0 || attachedFile !== null) && !disabled

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2">
      {/* উত্তর সূচক */}
      {replyingTo && (
        <div className="flex items-center gap-2 mb-2 ml-8 pl-2 border-l-2 border-emerald-500 py-1">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 truncate">
              Replying to {replyingTo.direction === 'outgoing' ? 'yourself' : (replyingTo.contactSender?.name || 'contact')}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {replyingTo.content || `[${replyingTo.messageType}]`}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCancelReply}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* ফাইল সংযুক্তি প্রিভিউ */}
      {attachedFile && (
        <div className="flex items-center gap-2 mb-2 ml-8 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {attachedFile.preview ? (
            <img src={attachedFile.preview} alt="Preview" className="h-10 w-10 rounded object-cover" />
          ) : (
            <div className="h-10 w-10 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <FileText className="h-5 w-5 text-gray-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{attachedFile.file.name}</p>
            <p className="text-xs text-gray-500">{(attachedFile.file.size / 1024).toFixed(1)} KB</p>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={removeAttachment}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* ইনপুট সারি */}
      <div className="flex items-end gap-1.5">
        {/* সংযুক্তি বাটন */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex-shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* টেক্সটএরিয়া + পাঠানো */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              'w-full resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800',
              'px-3 py-2 pr-10 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'max-h-[120px] transition-all'
            )}
          />
          {/* টেক্সটএরিয়ার ভেতরে পাঠানো বাটন */}
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              'absolute right-1.5 bottom-1 h-7 w-7 rounded-full transition-all',
              canSend
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
            )}
          >
            <Send className="h-3.5 w-3.5 ml-0.5" />
          </Button>
        </div>
      </div>

      {/* অক্ষর গণনা */}
      {text.length > MAX_CHARS * 0.8 && (
        <div className={cn(
          'text-[10px] mt-1 text-right',
          charsLeft <= 0 ? 'text-red-500 font-medium' : 'text-gray-400'
        )}>
          {charsLeft}/{MAX_CHARS}
        </div>
      )}
    </div>
  )
}