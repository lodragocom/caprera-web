import puppeteer from '@cloudflare/puppeteer'
import { createConnector } from './connector.mjs'

const connector=createConnector(puppeteer)
export const FantapazzSession=connector.Session
export default connector.worker
