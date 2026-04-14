'use client'

import { useState } from 'react'

interface ScraperRun {
  id: number
  scraperName: string
  startedAt: string
  finishedAt: string | null
  status: string | null
  eventsFound: number | null
  eventsInserted: number | null
  eventsUpdated: number | null
  errorMessage: string | null
}

export default function ScraperControls({ runs: initialRuns }: { runs: ScraperRun[] }) {
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState('')

  async function triggerScrapers() {
    setRunning(true)
    setMessage('')
    try {
      const res = await fetch('/api/scrapers/run', { method: 'POST' })
      const data = await res.json()
      setMessage(data.message || (res.ok ? 'Scrapers started!' : 'Failed to start scrapers'))
    } catch {
      setMessage('Network error')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Trigger button */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-2">Manual Scraper Run</h2>
        <p className="text-sm text-gray-500 mb-4">
          Trigger all scrapers to pull fresh events from configured sources.
          Scrapers run automatically every 6 hours via the scheduler.
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={triggerScrapers}
            disabled={running}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            {running ? 'Starting…' : 'Run All Scrapers'}
          </button>
          {message && (
            <span className="text-sm text-green-700 font-medium">{message}</span>
          )}
        </div>
      </div>

      {/* Scraper sources */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Configured Sources</h2>
        <div className="space-y-2">
          {[
            { name: 'illini-union', label: 'Illini Union', url: 'union.illinois.edu' },
            { name: 'city-champaign', label: 'City of Champaign', url: 'champaignil.gov' },
            { name: 'visitchampaigncounty', label: 'Visit Champaign County', url: 'visitchampaigncounty.org' },
            { name: 'university-of-illinois', label: 'University of Illinois', url: 'calendars.illinois.edu' },
          ].map((source) => (
            <div key={source.name} className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="font-medium text-gray-900">{source.label}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500">{source.url}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Run history */}
      {initialRuns.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Run History</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {initialRuns.map((run) => (
              <div key={run.id} className="px-5 py-3 flex items-center gap-4">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                    run.status === 'success'
                      ? 'bg-green-100 text-green-700'
                      : run.status === 'error'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {run.status}
                </span>
                <span className="text-sm font-medium text-gray-900 w-40 flex-shrink-0">{run.scraperName}</span>
                <span className="text-xs text-gray-400">{run.startedAt}</span>
                <div className="ml-auto flex items-center gap-4 text-xs text-gray-500">
                  <span>Found: {run.eventsFound}</span>
                  <span>New: {run.eventsInserted}</span>
                  <span>Updated: {run.eventsUpdated}</span>
                </div>
                {run.errorMessage && (
                  <span className="text-xs text-red-500 truncate max-w-xs" title={run.errorMessage}>
                    ⚠ {run.errorMessage}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
