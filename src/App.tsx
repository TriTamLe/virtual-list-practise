import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { VirtualList } from './page/list/virtual-list'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <VirtualList />
    </QueryClientProvider>
  )
}

export default App
