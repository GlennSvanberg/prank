import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

export const Route = createFileRoute('/victim/$id')({
  component: VictimDetail,
})

function VictimDetail() {
  const { id } = Route.useParams()
  const { data: victim } = useSuspenseQuery(
    convexQuery(api.victims.getById, { id: id as Id<"victims"> })
  )
  const { data: pranks } = useSuspenseQuery(convexQuery(api.pranks.get, {}))
  const togglePrank = useMutation(api.victims.togglePrank)

  if (!victim) {
    return <div className="p-24 text-center">Victim not found.</div>
  }

  const isOnline = Date.now() - victim.lastSeen < 30000;

  return (
    <main className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <header className="mb-16">
          <div className="mb-6">
            <Link to="/" className="text-sm font-bold border-b-2 border-black hover:text-gray-600 transition-colors">
              ← Back to victims
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">{victim.name}</h1>
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
          </div>
        </header>

        <div className="space-y-6">
          <h2 className="text-lg font-bold mb-4 border-b-2 border-black pb-2">Available Pranks</h2>
          {pranks?.map((prank) => {
            const isActive = victim.prankStates[prank.name] === true;
            return (
              <div 
                key={prank._id} 
                className="flex items-center justify-between p-6 border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white"
              >
                <div>
                  <h2 className="text-xl font-bold">{prank.displayName}</h2>
                  <p className="text-sm text-gray-600 mt-1">{prank.description}</p>
                </div>
                <button
                  onClick={() => togglePrank({ victimId: victim._id, prankName: prank.name, isActive: !isActive })}
                  className={`
                    relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                    transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 
                    focus-visible:ring-black focus-visible:ring-offset-2
                    ${isActive ? 'bg-black' : 'bg-gray-200'}
                  `}
                  role="switch"
                  aria-checked={isActive}
                >
                  <span className="sr-only">Toggle {prank.displayName}</span>
                  <span
                    aria-hidden="true"
                    className={`
                      pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 
                      transition duration-200 ease-in-out
                      ${isActive ? 'translate-x-6' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>
            )
          })}
          
          {(!pranks || pranks.length === 0) && (
            <div className="p-6 border-2 border-dashed border-gray-300 text-center text-gray-500">
              No pranks found. Run `npx convex run pranks:seed` to populate.
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
