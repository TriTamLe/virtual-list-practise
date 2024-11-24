import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef } from 'react'
import { useGetRows } from './use-get-rows'
import { MemorizedVirtualItem } from './virtual-item'

export const VirtualList = () => {
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

  const allRows = data ? data.pages.flatMap((d) => d) : []

  const parentRef = useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allRows.length + 1 : allRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
  })

  const virtualItems = rowVirtualizer.getVirtualItems()

  useEffect(() => {
    const [lastItem] = [...virtualItems].reverse()

    if (!lastItem) {
      return
    }

    if (
      lastItem.index >= allRows.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage()
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allRows.length,
    isFetchingNextPage,
    virtualItems,
  ])

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
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const isLoaderRow = virtualRow.index > allRows.length - 1
                const row = allRows[virtualRow.index]

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
