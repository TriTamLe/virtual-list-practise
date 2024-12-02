import { useVirtualizer } from '@tanstack/react-virtual'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Row } from '../share/type'
import { useGetRows } from '../share/use-get-rows'
import { MemorizedVirtualItem } from '../share/virtual-item'

export const ReverseVirtualList = () => {
  const {
    status,
    data,
    error,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useGetRows({
    pagination: {
      pageSize: 5,
      pageIndex: 0,
    },
  })

  const [rows, setRows] = useState<Row[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const topRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const parentRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<{
    index: number
    align: 'start' | 'center' | 'end'
  } | null>(null)

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
  })

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    const res = await fetchNextPage()
    const resPages = res.data?.pages ? res.data.pages : []
    const newRows = resPages[resPages.length - 1].reverse()

    const concatenatedRows = [...newRows, ...rows]

    scrollRef.current = {
      index: concatenatedRows.length - rows.length,
      align: 'center',
    }

    setRows((prev) => {
      return [...newRows, ...prev]
    })
    setIsLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchNextPage])

  useEffect(() => {
    return () => {
      setIsLoaded(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded && data) {
      console.log('first render', data)
      setRows(data.pages.flatMap((d) => d).reverse())
      scrollRef.current = {
        index: !data ? 0 : data?.pages.flatMap((d) => d).length - 1,
        align: 'start',
      }

      setIsLoaded(true)
    }
  }, [data, isLoaded])

  useEffect(() => {
    if (rows.length && scrollRef.current) {
      const { index, align } = scrollRef.current
      rowVirtualizer.scrollToIndex(index, { align })
    }
  }, [rows.length, rowVirtualizer])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          console.log(isLoading, isLoaded)
          if (entry.target.id === 'top' && !isLoading && isLoaded) {
            fetchData()
          }
        }
      })
    })

    if (topRef.current) {
      observer.observe(topRef.current)
    }
    if (bottomRef.current) {
      observer.observe(bottomRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [hasNextPage, isLoading, isFetching, isLoaded, fetchData])

  return (
    <div className='p-10 w-full flex flex-col gap-5 justify-center items-center'>
      <h1>Virtual List</h1>
      <div className='w-full'>
        {status === 'pending' && <p>Loading...</p>}
        {status === 'error' && <p>Error: {error.message}</p>}
        {status === 'success' && (
          <div
            ref={parentRef}
            style={{
              height: `300px`,
              width: `100%`,
              overflow: 'auto',
            }}>
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}>
              <div id='top' ref={topRef} />
              {isLoading && <p>Loading...</p>}
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const isLoaderRow = virtualRow.index > rows.length - 1
                const row = rows[virtualRow.index]

                return (
                  <div
                    key={virtualRow.index}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}>
                    {isLoaderRow ? (
                      hasNextPage ? (
                        'Loading more...'
                      ) : (
                        'Nothing more to load'
                      )
                    ) : (
                      <MemorizedVirtualItem
                        row={row}
                        isOdd={virtualRow.index % 2 !== 0}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
        <div>
          {isFetching && !isFetchingNextPage ? 'Background Updating...' : null}
        </div>
      </div>
    </div>
  )
}
