import { memo } from 'react'
import { Row } from './type'

export const VirtualItem = ({ row, isOdd }: { row: Row; isOdd: boolean }) => {
  console.log(row.data)
  return (
    <div
      className='w-full flex justify-center items-center h-10'
      style={{
        backgroundColor: isOdd ? 'lightgray' : 'white',
      }}>
      {row.data}
    </div>
  )
}

export const MemorizedVirtualItem = memo(VirtualItem, (prev, next) => {
  return prev.row.data === next.row.data
})
