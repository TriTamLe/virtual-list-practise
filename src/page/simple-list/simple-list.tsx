import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef, useState } from 'react'
import { v7 as uuidV7 } from 'uuid'
import './simple-list.scss'

type Item = {
  id: string
  number: number
}

function generateMore(): Item[] {
  return Array.from({ length: 10 }, () => {
    return {
      id: uuidV7(),
      number: Math.floor(Math.random() * 100000),
    }
  })
}

export const SimpleList = () => {
  const [list, setList] = useState<Item[]>(generateMore())
  const [isGenerating, setIsGenerating] = useState(false)

  const timer = useRef<number>()

  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: list.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  })

  useEffect(() => {
    if (isGenerating) {
      timer.current = setInterval(() => {
        setList((prev) => {
          return [...generateMore(), ...prev]
        })
      }, 500)
    } else {
      clearInterval(timer.current)
    }

    return () => {
      clearInterval(timer.current)
    }
  }, [isGenerating])

  return (
    <div className='w-full flex flex-col justify-center items-center py-10 gap-4'>
      <div className='flex flex-row gap-3'>
        <button
          className='bg-slate-900 p-2 rounded-lg aria-disabled:opacity-30 aria-disabled:cursor-not-allowed text-slate-50'
          aria-disabled={isGenerating}
          onClick={() => {
            if (!isGenerating) setIsGenerating(true)
          }}>
          Start generate
        </button>
        <button
          className='bg-slate-900 p-2 rounded-lg aria-disabled:opacity-30 aria-disabled:cursor-not-allowed text-slate-50'
          aria-disabled={!isGenerating}
          onClick={() => {
            if (isGenerating) setIsGenerating(false)
          }}>
          Stop generate
        </button>
        <button
          className='bg-slate-100 p-2 rounded-lg'
          onClick={() => {
            setList(generateMore())
          }}>
          Reset
        </button>
      </div>
      <div
        className=' h-[300px] w-[300px] overflow-auto border-[2px] border-solid border-black'
        ref={parentRef}>
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
            contain: 'strict',
          }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const item = list[virtualRow.index]

            return (
              <div
                key={item.id}
                aria-selected={virtualRow.index % 2 === 0}
                className='aria-selected:bg-yellow-900 aria-selected:text-white w-full flex items-center justify-center absolute top-0 left-0'
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}>
                {item.number}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
