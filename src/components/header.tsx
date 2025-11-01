import { Bot } from 'lucide-react'

export function Header() {
  return (
    <header className='sticky top-0 z-40 w-full backdrop-blur bg-background/60'>
      <div className='container flex justify-between items-center h-16'>
        <div className='flex gap-2 items-center'>
          <div className='flex justify-center items-center w-8 h-8 rounded-full bg-primary text-primary-foreground'>
            <Bot className='size-4' />
          </div>
          <span className='text-xl font-[650]'>Untuit</span>
        </div>
      </div>
    </header>
  )
}
