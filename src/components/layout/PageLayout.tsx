import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function PageLayout({
  children,
  withSidebar = true,
}: {
  children: React.ReactNode
  withSidebar?: boolean
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        {withSidebar && (
          <div className="hidden md:block">
            <Sidebar />
          </div>
        )}
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  )
}
