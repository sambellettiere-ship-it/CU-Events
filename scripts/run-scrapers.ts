#!/usr/bin/env node
/**
 * Run all scrapers manually:
 *   npx tsx scripts/run-scrapers.ts
 */
import { runAllScrapers } from '../src/scrapers/index'

console.log('Starting scraper run…')
runAllScrapers()
  .then(() => {
    console.log('All scrapers complete.')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Scraper run failed:', err)
    process.exit(1)
  })
