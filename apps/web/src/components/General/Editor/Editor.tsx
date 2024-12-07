import useShiki from '$hooks/useShiki'
import type { FocusEventHandler, KeyboardEventHandler, MouseEventHandler } from 'react'
import SimpleCodeEditor from 'react-simple-code-editor'
import { theme } from 'twin.macro'

type EventHandlers = {
  onBlur?: FocusEventHandler<HTMLDivElement> & FocusEventHandler<HTMLTextAreaElement>
  onClick?: MouseEventHandler<HTMLDivElement> & MouseEventHandler<HTMLTextAreaElement>
  onFocus?: FocusEventHandler<HTMLDivElement> & FocusEventHandler<HTMLTextAreaElement>
  onKeyDown?: KeyboardEventHandler<HTMLDivElement> & KeyboardEventHandler<HTMLTextAreaElement>
  onKeyUp?: KeyboardEventHandler<HTMLDivElement> & KeyboardEventHandler<HTMLTextAreaElement>
}

export type EditorProps = EventHandlers & {
  name?: string
  value: string
  onChange: (value: string) => void
  minLines: number
  maxLines: number
  placeholder?: string
}

export default function Editor({
  name,
  value,
  onChange,
  onBlur,
  onFocus,
  onKeyUp,
  onKeyDown,
  placeholder,
  minLines,
  maxLines,
}: EditorProps) {
  const highlighter = useShiki({
    themes: ['one-dark-pro', 'one-light'],
    langs: ['json'],
  })

  return (
    <div
      className="editor overflow-y-auto"
      style={{
        minHeight: `${Number(theme`lineHeight.snug`) * minLines}rem`,
        maxHeight: `${Number(theme`lineHeight.snug`) * maxLines}rem`,
      }}
    >
      <SimpleCodeEditor
        name={name}
        onValueChange={onChange}
        value={value}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyUp={onKeyUp}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        highlight={(code) =>
          highlighter?.codeToHtml(code, {
            lang: 'json',
            themes: {
              light: 'one-light',
              dark: 'one-dark-pro',
            },
            defaultColor: false,
          }) || code
        }
        className="text-gray-800 dark:text-gray-200 font-mono text-sm leading-snug"
        style={{
          scrollBehavior: 'auto',
          minHeight: `${Number(theme`lineHeight.snug`) * minLines}rem`,
        }}
      />
    </div>
  )
}
