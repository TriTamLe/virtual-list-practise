/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query'
import { DefaultPagination } from './constants'
import { Row, TQueryPagination } from './type'

export interface QueryParams {
  pagination?: TQueryPagination
}

export type QueryKey = ['row-list', QueryParams?]

export type TInfiniteOption = Omit<
  UseInfiniteQueryOptions<
    Row[],
    Error,
    InfiniteData<Row[]>,
    Row[],
    QueryKey,
    TQueryPagination
  >,
  | 'queryKey'
  | 'queryFn'
  | 'placeholderData'
  | 'initialPageParam'
  | 'getNextPageParam'
>

export const getRows = async ({
  queryKey,
  pageParam,
}: {
  queryKey: QueryKey
  pageParam?: TQueryPagination
}): Promise<Row[]> => {
  const [_list] = queryKey

  const pageNumber = pageParam?.pageIndex
    ? pageParam.pageIndex
    : DefaultPagination.pageIndex

  const pageSize = pageParam?.pageSize ?? DefaultPagination.pageSize

  const response = await new Promise<Row[]>((res) => {
    setTimeout(() => {
      const data = Array.from({
        length: pageSize,
      }).map((_, num) => {
        const row: Row = { data: `Row ${pageNumber * pageSize + (num + 1)}` }
        return row
      })

      if (pageNumber === 10) res([])
      res(data)
    }, 500)
  })

  return response
}

export const useGetRows = (
  queryParams?: QueryParams,
  options?: TInfiniteOption
) => {
  return useInfiniteQuery({
    queryKey: ['row-list', queryParams],
    initialPageParam: queryParams?.pagination ?? DefaultPagination,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.length < lastPageParam.pageSize) return undefined

      return {
        pageIndex: lastPageParam.pageIndex + 1,
        pageSize: lastPageParam.pageSize,
      }
    },
    queryFn: getRows,
    ...options,
  })
}
