import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SimpleList } from './page/simple-list/simple-list'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SimpleList />
    </QueryClientProvider>
  )
}

export default App
