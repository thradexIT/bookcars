import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const runId = String(process.env.GITHUB_RUN_ID || `local-${Date.now()}`)
const fixturePath = String(process.env.R3_FIXTURE_PATH || '/tmp/mitos-r3/browser-fixture.json')
const evidenceDir = String(process.env.R3_EVIDENCE_DIR || '/tmp/mitos-r3/evidence')
const frontendBase = String(process.env.R3_FRONTEND_BASE || 'http://localhost:3002')

const fixture = JSON.parse(await fs.readFile(fixturePath, 'utf8'))
await fs.mkdir(evidenceDir, { recursive: true })

const evidence = {
  runId,
  startedAt: new Date().toISOString(),
  branch: process.env.GITHUB_REF_NAME || 'cert/mitos-r3-browser-e2e',
  commit: process.env.GITHUB_SHA || 'local',
  mode: 'real-mitos-checkout-payment-brick-browser',
  fixture: {
    carName: fixture.carName,
    expectedAmount: fixture.expectedAmount,
    expectedCurrency: fixture.expectedCurrency,
  },
  steps: [],
  network: {
    checkout: null,
    quote: null,
    payment: null,
    apiResponses: [],
  },
  formDiagnostics: null,
  brick: {
    rendered: false,
    frames: [],
    inputMetadata: [],
  },
  screenshots: [],
  defects: [],
  result: 'running',
  completedAt: '',
  failure: '',
}

const record = (name, observed = {}, defect = '') => {
  evidence.steps.push({ name, timestamp: new Date().toISOString(), observed, ...(defect ? { defect } : {}) })
  if (defect) evidence.defects.push(defect)
  console.log(`[R3] ${name}${defect ? ` DEFECT=${defect}` : ''}`)
}

const screenshot = async (page, name) => {
  const file = path.join(evidenceDir, `${name}.png`)
  await page.screenshot({ path: file, fullPage: true })
  evidence.screenshots.push(path.basename(file))
}

const descriptorText = (frame, descriptor) => [
  frame.name(),
  frame.url(),
  descriptor.name,
  descriptor.id,
  descriptor.placeholder,
  descriptor.ariaLabel,
  descriptor.autocomplete,
].filter(Boolean).join(' ').toLowerCase()

const getInputMetadata = async (frame, scope = null) => {
  const locator = scope ? scope.locator('input') : frame.locator('input')
  const metadata = await locator.evaluateAll((nodes) => nodes.map((node, index) => ({
    index,
    type: node.getAttribute('type') || '',
    name: node.getAttribute('name') || '',
    id: node.getAttribute('id') || '',
    placeholder: node.getAttribute('placeholder') || '',
    ariaLabel: node.getAttribute('aria-label') || '',
    autocomplete: node.getAttribute('autocomplete') || '',
  })))
  return { locator, metadata }
}

const fillAcrossFrames = async (page, hints, value) => {
  for (const frame of page.frames()) {
    const { locator, metadata } = await getInputMetadata(frame)
    for (const descriptor of metadata) {
      const haystack = descriptorText(frame, descriptor)
      if (hints.some((hint) => haystack.includes(hint))) {
        const input = locator.nth(descriptor.index)
        if (await input.isVisible().catch(() => false)) {
          await input.fill(value)
          return { frame: frame.url(), descriptor: { ...descriptor, index: undefined } }
        }
      }
    }
  }
  return null
}

const fillWithinRoot = async (root, hints, value) => {
  const inputs = root.locator('input')
  const metadata = await inputs.evaluateAll((nodes) => nodes.map((node, index) => ({
    index,
    type: node.getAttribute('type') || '',
    name: node.getAttribute('name') || '',
    id: node.getAttribute('id') || '',
    placeholder: node.getAttribute('placeholder') || '',
    ariaLabel: node.getAttribute('aria-label') || '',
    autocomplete: node.getAttribute('autocomplete') || '',
  })))

  for (const descriptor of metadata) {
    const haystack = [descriptor.name, descriptor.id, descriptor.placeholder, descriptor.ariaLabel, descriptor.autocomplete]
      .filter(Boolean).join(' ').toLowerCase()
    if (hints.some((hint) => haystack.includes(hint))) {
      const input = inputs.nth(descriptor.index)
      if (await input.isVisible().catch(() => false)) {
        await input.fill(value)
        return { descriptor: { ...descriptor, index: undefined } }
      }
    }
  }
  return null
}

const clickPaymentMethodIfNeeded = async (root) => {
  const candidates = [
    /tarjeta de crédito/i,
    /tarjeta de credito/i,
    /credit card/i,
    /crédito/i,
    /credito/i,
  ]

  for (const candidate of candidates) {
    const locator = root.getByText(candidate).first()
    if (await locator.isVisible().catch(() => false)) {
      await locator.click()
      await new Promise((resolve) => setTimeout(resolve, 1200))
      return true
    }
  }
  return false
}

const clickPayButton = async (page, root) => {
  const hints = [/^pagar/i, /^pay$/i, /continuar/i, /confirmar/i]
  for (const hint of hints) {
    const button = root.getByRole('button', { name: hint }).last()
    if (await button.isVisible().catch(() => false)) {
      await button.click()
      return true
    }
  }

  for (const frame of page.frames()) {
    for (const hint of hints) {
      const button = frame.getByRole('button', { name: hint }).last()
      if (await button.isVisible().catch(() => false)) {
        await button.click()
        return true
      }
    }
  }
  return false
}

const collectFormDiagnostics = async (page) => {
  const fields = await page.locator('.driver-details-form input').evaluateAll((nodes) => nodes.map((node, index) => ({
    index,
    type: node.getAttribute('type') || '',
    name: node.getAttribute('name') || '',
    ariaInvalid: node.getAttribute('aria-invalid') || '',
    valuePresent: Boolean(node.value),
    checked: 'checked' in node ? Boolean(node.checked) : undefined,
    htmlValid: typeof node.checkValidity === 'function' ? node.checkValidity() : undefined,
  })))

  const visibleMessages = await page.locator('.MuiFormHelperText-root, [role="alert"], .error, .Mui-error')
    .evaluateAll((nodes) => nodes
      .filter((node) => {
        const style = window.getComputedStyle(node)
        const rect = node.getBoundingClientRect()
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0
      })
      .map((node) => (node.textContent || '').trim())
      .filter(Boolean)
      .filter((value, index, all) => all.indexOf(value) === index)
      .slice(0, 30))

  const birthDateInput = page.locator('.driver-details-form input').nth(3)
  return {
    fields,
    visibleMessages,
    birthDate: {
      valuePresent: await birthDateInput.inputValue().then((value) => Boolean(value)).catch(() => false),
      ariaInvalid: await birthDateInput.getAttribute('aria-invalid').catch(() => null),
    },
    tosChecked: await page.locator('input[type="checkbox"][name="tos"]').isChecked().catch(() => false),
    payInFullChecked: await page.locator('input[type="radio"][value="payInFull"]').isChecked().catch(() => false),
  }
}

const enterMuiSegment = async (segment, value) => {
  await segment.click()
  await segment.press('Control+A').catch(() => undefined)
  await segment.pressSequentially(value, { delay: 40 })
}

let browser
try {
  browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } })
  const page = await context.newPage()

  page.on('response', async (response) => {
    const url = response.url()
    try {
      if (url.includes('/api/')) {
        const parsed = new URL(url)
        evidence.network.apiResponses.push({
          method: response.request().method(),
          path: parsed.pathname,
          status: response.status(),
        })
      }
      if (url.includes('/api/checkout') && response.request().method() === 'POST') {
        const body = await response.json()
        evidence.network.checkout = { status: response.status(), bookingId: body?.bookingId || '' }
      } else if (url.includes('/api/mercadopago/quote/')) {
        const body = await response.json()
        evidence.network.quote = { status: response.status(), amount: body?.amount, currency: body?.currency }
      } else if (url.includes('/api/create-mercadopago-payment')) {
        const body = await response.json()
        evidence.network.payment = {
          status: response.status(),
          providerPaymentId: body?.id ? String(body.id) : '',
          paymentStatus: body?.status || '',
          bookingId: body?.bookingId || '',
          idempotentReplay: body?.idempotentReplay === true,
        }
      }
    } catch {
      // Sanitized evidence deliberately ignores non-JSON and third-party bodies.
    }
  })

  await page.goto(frontendBase, { waitUntil: 'domcontentloaded' })
  await page.evaluate((routeFixture) => {
    window.history.replaceState({
      usr: {
        carId: routeFixture.carId,
        pickupLocationId: routeFixture.pickupLocationId,
        dropOffLocationId: routeFixture.dropOffLocationId,
        from: new Date(routeFixture.from),
        to: new Date(routeFixture.to),
      },
      key: 'r3-browser',
      idx: 0,
    }, '', '/checkout')
  }, fixture)
  await page.reload({ waitUntil: 'domcontentloaded' })

  await page.locator('.checkout-form').waitFor({ state: 'visible', timeout: 30_000 })
  await page.locator('.car-list, .car').first().waitFor({ state: 'visible', timeout: 30_000 }).catch(() => undefined)
  record('real MitoS Checkout route rendered', { pathname: new URL(page.url()).pathname, carName: fixture.carName })
  await screenshot(page, '01-checkout-loaded')

  const driverForm = page.locator('.driver-details-form').first()
  const driverInputs = driverForm.locator('input')
  const count = await driverInputs.count()
  if (count < 4) throw new Error(`R3 expected at least four driver inputs; observed ${count}`)

  await driverInputs.nth(0).fill('MITOS R3 Browser Test')
  await driverInputs.nth(1).fill(`r3-browser-${runId}@example.test`)
  await driverInputs.nth(2).fill('+51987654321')

  // MUI X DatePicker v8 renders an aria-hidden input plus editable sections.
  // Drive the visible accessible sections exactly as a keyboard user would.
  const daySection = driverForm.getByRole('spinbutton', { name: /d[ií]a/i }).first()
  const monthSection = driverForm.getByRole('spinbutton', { name: /mes/i }).first()
  const yearSection = driverForm.getByRole('spinbutton', { name: /a[nñ]o/i }).first()
  if (!(await daySection.count()) || !(await monthSection.count()) || !(await yearSection.count())) {
    throw new Error('R3 could not locate MUI birth-date day/month/year sections')
  }
  await enterMuiSegment(daySection, '01')
  await enterMuiSegment(monthSection, '01')
  await enterMuiSegment(yearSection, '1990')
  await yearSection.press('Tab')

  const birthDateInput = driverInputs.nth(3)
  const birthDateValue = await birthDateInput.inputValue().catch(() => '')
  if (!birthDateValue) {
    evidence.formDiagnostics = await collectFormDiagnostics(page)
    record('MUI birth date interaction failed before reservation submit', {
      valuePresent: false,
      diagnostics: evidence.formDiagnostics,
    }, 'R3-HARNESS-BIRTH-DATE-INTERACTION')
    throw new Error('R3 browser harness could not populate the MUI segmented birth date field')
  }

  const tos = page.locator('input[type="checkbox"][name="tos"]')
  await tos.check()
  const payInFull = page.locator('input[type="radio"][value="payInFull"]')
  if (await payInFull.count()) await payInFull.check()
  record('guest reservation form completed with test identity', { tos: true, paymentChoice: 'payInFull', birthDatePresent: true })

  const checkoutButton = page.getByRole('button', { name: 'Checkout' })
  await checkoutButton.click()

  const paymentAreaReady = await page.waitForFunction(() => {
    const paymentArea = document.querySelector('.checkout-payment-buttons')
    return Boolean(paymentArea && (paymentArea.querySelector('iframe') || paymentArea.querySelector('input') || paymentArea.textContent?.trim()))
  }, null, { timeout: 12_000 }).then(() => true).catch(() => false)

  if (!paymentAreaReady) {
    evidence.formDiagnostics = await collectFormDiagnostics(page)
    await screenshot(page, '01b-after-reserve')
    record('reservation submit blocked before Mercado Pago Brick', {
      checkoutObserved: Boolean(evidence.network.checkout),
      quoteObserved: Boolean(evidence.network.quote),
      diagnostics: evidence.formDiagnostics,
      apiResponses: evidence.network.apiResponses,
    }, 'R3-PRE-BRICK-SUBMIT-BLOCKED')
    throw new Error('R3 reservation submit did not reach the Payment Brick; sanitized form diagnostics captured')
  }

  const paymentRoot = page.locator('.checkout-payment-buttons .payment-options-container').last()
  await paymentRoot.waitFor({ state: 'visible', timeout: 30_000 })
  evidence.brick.rendered = true
  evidence.brick.frames = page.frames().filter((frame) => frame !== page.mainFrame()).map((frame) => ({
    name: frame.name(),
    urlHost: (() => { try { return new URL(frame.url()).host } catch { return '' } })(),
  }))
  record('Mercado Pago Payment Brick rendered inside real Checkout', {
    childFrameCount: evidence.brick.frames.length,
    quote: evidence.network.quote,
  })
  await screenshot(page, '02-payment-brick-rendered')

  await clickPaymentMethodIfNeeded(paymentRoot)

  const cardNumber = await fillAcrossFrames(page, ['cardnumber', 'card_number', 'card-number', 'card number', 'numero de tarjeta', 'número de tarjeta', 'cc-number'], '4009175332806176')
  const expiration = await fillAcrossFrames(page, ['expiration', 'expiry', 'vencimiento', 'cc-exp'], '1130')
  const securityCode = await fillAcrossFrames(page, ['security', 'cvv', 'cvc', 'codigo de seguridad', 'código de seguridad', 'cc-csc'], '123')
  const holder = await fillWithinRoot(paymentRoot, ['cardholder', 'titular'], 'APRO')
    || await fillAcrossFrames(page, ['cardholder', 'titular'], 'APRO')
  const identification = await fillWithinRoot(paymentRoot, ['identification', 'document', 'dni'], '123456789')
    || await fillAcrossFrames(page, ['identification', 'document', 'dni'], '123456789')
  await fillWithinRoot(paymentRoot, ['email', 'correo'], `r3-browser-${runId}@example.test`)

  const metadata = []
  for (const frame of page.frames()) {
    const { metadata: inputs } = await getInputMetadata(frame)
    for (const input of inputs) {
      metadata.push({
        frameHost: (() => { try { return new URL(frame.url()).host } catch { return '' } })(),
        type: input.type,
        name: input.name,
        id: input.id,
        placeholder: input.placeholder,
        ariaLabel: input.ariaLabel,
        autocomplete: input.autocomplete,
      })
    }
  }
  evidence.brick.inputMetadata = metadata.slice(0, 80)

  if (!cardNumber || !expiration || !securityCode || !holder) {
    throw new Error(`R3 could not fill required Brick fields: card=${!!cardNumber} exp=${!!expiration} security=${!!securityCode} holder=${!!holder}`)
  }

  const selects = paymentRoot.locator('select')
  for (let i = 0; i < await selects.count(); i += 1) {
    const select = selects.nth(i)
    if (await select.isVisible().catch(() => false)) {
      const options = await select.locator('option').count()
      if (options > 1) await select.selectOption({ index: 1 }).catch(() => undefined)
    }
  }

  record('Mercado Pago TEST card entered through browser Brick', {
    cardNumberField: true,
    expirationField: true,
    securityCodeField: true,
    cardholderField: true,
    identificationField: Boolean(identification),
    persistedCardData: false,
  })

  const clicked = await clickPayButton(page, paymentRoot)
  if (!clicked) throw new Error('R3 could not locate the Payment Brick submit button')

  await page.locator('.checkout-status').waitFor({ state: 'visible', timeout: 60_000 })
  await screenshot(page, '03-payment-success')

  const quote = evidence.network.quote
  const payment = evidence.network.payment
  const checkout = evidence.network.checkout

  if (!checkout?.bookingId) evidence.defects.push('R3-BROWSER-BOOKING-ID-MISSING')
  if (!quote || Number(quote.amount) !== Number(fixture.expectedAmount) || String(quote.currency) !== fixture.expectedCurrency) {
    evidence.defects.push('R3-BROWSER-SERVER-QUOTE-MISMATCH')
  }
  if (!payment || payment.paymentStatus !== 'approved' || !payment.providerPaymentId) {
    evidence.defects.push('R3-BROWSER-PAYMENT-NOT-APPROVED')
  }
  if (payment?.bookingId && checkout?.bookingId && payment.bookingId !== checkout.bookingId) {
    evidence.defects.push('R3-BROWSER-BOOKING-BINDING-MISMATCH')
  }

  record('real browser payment completed and success UI rendered', {
    checkout,
    quote,
    payment,
    checkoutStatusVisible: true,
  })

  evidence.result = evidence.defects.length === 0 ? 'passed' : 'failed'
  if (evidence.defects.length) {
    evidence.failure = `R3 defects: ${evidence.defects.join(', ')}`
    process.exitCode = 1
  }
} catch (error) {
  evidence.result = 'failed'
  evidence.failure = error instanceof Error ? error.stack || error.message : String(error)
  console.error('[R3] BROWSER HARNESS FAILURE', error instanceof Error ? error.message : String(error))
  process.exitCode = 1
} finally {
  evidence.completedAt = new Date().toISOString()
  if (browser) await browser.close().catch(() => undefined)
  await fs.writeFile(path.join(evidenceDir, 'mitos-r3-browser-runtime.json'), `${JSON.stringify(evidence, null, 2)}\n`, 'utf8')
  console.log(`[R3] RESULT=${evidence.result} defects=${evidence.defects.join(',') || 'none'}`)
}
