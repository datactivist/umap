/* Simple tutorial / guided-tour component
   Usage:
     import Tutorial from './components/tutorial.js'
     // pass an optional tourId (e.g. 'home', 'map') to track per-tour ended state
     const tour = new Tutorial(steps, 'home')
     tour.start()

   Steps: [{ selector: '.my-button', title: 'Step 1', text: 'Click this button' }, ...]
*/

class Tutorial {
  // Accept optional tourId (string) to track per-tour ended state in localStorage
  constructor(steps = [], tourId = null) {
    this.steps = steps
    this.tourId = tourId
    this.index = 0
    this.overlay = null
    this.panel = null
    this.onKey = this.onKey.bind(this)
  }

  start() {
    if (!this.steps || !this.steps.length) return
  console.log('[Tutorial] starting with', this.steps.length, 'steps')
    this.createOverlay()
    this.showStep(0)
    document.addEventListener('keydown', this.onKey)
  }

  stop() {
    this.cleanup()
    document.removeEventListener('keydown', this.onKey)
  }

  next() {
    this.showStep(this.index + 1)
  }

  prev() {
    this.showStep(this.index - 1)
  }

  showStep(i) {
    if (i < 0) i = 0
    if (i >= this.steps.length) return this.end()
    this.index = i
    const step = this.steps[i]
  // allow steps that explicitly disable highlighting (noHighlight)
  const target = (step && step.noHighlight) ? null : (step.selector ? document.querySelector(step.selector) : null)
  console.log('[Tutorial] showing step', i, 'selector=', step.selector, 'target=', !!target, 'title=', step.title)

    // Clear previous highlight
    this.clearHighlight()

    if (target) {
      target.classList.add('tutorial-target')
      target.setAttribute('data-tutorial-step', i)
  console.log('[Tutorial] highlighting target', target)
  // ensure overlay visible when highlighting a target
  if (this.overlay) this.overlay.style.display = ''
  this.highlightTarget(target)
  console.log('[Tutorial] positioning panel near target')
  this.positionPanel(target, step)
    } else {
  console.log('[Tutorial] no target found or step.noHighlight; centering panel')
  // center panel if no target or when noHighlight is requested
  this.positionPanel(null, step)
    }
  }

  highlightTarget(target) {
    // ensure target is visible
  console.log('[Tutorial] scrolling to target')
  target.scrollIntoView({ block: 'center', behavior: 'smooth' })
  // add a focus ring
  target.classList.add('tutorial-highlight')
  console.log('[Tutorial] applied highlight class to target')

  // Create a click proxy so the highlighted element remains clickable
  // This proxy is positioned over the target and forwards pointer events.
  this._clickProxy && this._clickProxy.parentNode && this._clickProxy.parentNode.removeChild(this._clickProxy)
  try {
    // If the target contains interactive elements, avoid a full overlay
    // proxy which would block clicks on inner controls (buttons, links, inputs).
    const interactive = target.querySelector && target.querySelector('a, button, input, textarea, select, [role="button"]')
    if (interactive) {
      console.log('[Tutorial] target contains interactive children; skipping click proxy')
      // Allow clicks to pass through the overlay by disabling its pointer events
      if (this.overlay) this.overlay.style.pointerEvents = 'none'
      return
    }
    const rect = target.getBoundingClientRect()
    const proxy = document.createElement('a')
    proxy.className = 'tutorial-click-proxy'
    proxy.style.position = 'absolute'
    proxy.style.left = (rect.left + window.scrollX) + 'px'
    proxy.style.top = (rect.top + window.scrollY) + 'px'
    proxy.style.width = rect.width + 'px'
    proxy.style.height = rect.height + 'px'
    proxy.style.zIndex = 999999
    proxy.style.background = 'transparent'
    proxy.style.display = 'block'
    proxy.style.pointerEvents = 'auto'
    proxy.style.cursor = 'pointer'
    proxy.style.touchAction = 'manipulation'
    // forward click to the target
    proxy.addEventListener('click', function (e) {
      e.preventDefault()
      e.stopPropagation()
      // emulate a click on the underlying element
      try { target.click() } catch (err) { console.log('[Tutorial] proxy click failed', err) }
    })
    document.body.appendChild(proxy)
    this._clickProxy = proxy
  } catch (err) {
    console.log('[Tutorial] failed to create click proxy', err)
  }
  }

  positionPanel(target, step) {
    if (!this.panel) {
      // Use default labels; per-step labels will override when provided
      const prevLabel = (typeof gettext === 'function') ? gettext('Previous') : 'Previous'
      const nextLabel = (typeof gettext === 'function') ? gettext('Next') : 'Next'
      const doneLabel = (typeof gettext === 'function') ? gettext('Done') : 'Done'

  this.panel = document.createElement('div')
  // Create a simple tutorial panel; inner elements keep DSFR classes for styling
  this.panel.className = 'tutorial-panel'
      // lean DSFR modal body used directly to avoid large container padding
      this.panel.innerHTML = `
        <div class="fr-modal__body">
          <div class="fr-modal__header">
          </div>
          <div class="fr-modal__content">
            <h2 id="tutorial-title" class="fr-modal__title"></h2>
            <div class="fr-modal__text fr-text--sm"></div>
          </div>
          <div class="fr-modal__footer fr-btns-group">
            <div class="fr-btns-group__btn">
              <button class="fr-btn fr-btn--sm tutorial-prev">${prevLabel}</button>
            </div>
            <div class="fr-btns-group__btn">
              <button class="fr-btn fr-btn--sm tutorial-next">${nextLabel}</button>
            </div>
            <div class="fr-btns-group__btn">
              <button class="fr-btn fr-btn--secondary fr-btn--sm tutorial-done">${doneLabel}</button>
            </div>
          </div>
        </div>`
      document.body.appendChild(this.panel)
      // hook up buttons
      const nextBtnEl = this.panel.querySelector('.tutorial-next')
      const prevBtnEl = this.panel.querySelector('.tutorial-prev')
      const doneBtnEl = this.panel.querySelector('.tutorial-done')
      if (nextBtnEl) nextBtnEl.addEventListener('click', () => this.next())
      if (prevBtnEl) prevBtnEl.addEventListener('click', () => this.prev())
      // 'Done' / 'Skip' should explicitly clear the global flag
      if (doneBtnEl) doneBtnEl.addEventListener('click', () => this.skip())
      // close button in header
      const closeBtn = this.panel.querySelector('#tutorial-close-btn')
      if (closeBtn) closeBtn.addEventListener('click', () => this.skip())
    }

    // Apply per-step labels if provided
    const defaultPrev = (typeof gettext === 'function') ? gettext('Previous') : 'Précédent'
    const defaultNext = (typeof gettext === 'function') ? gettext('Next') : 'Suivant'
    const defaultDone = (typeof gettext === 'function') ? gettext('Done') : 'Passer le tutoriel'
    const prevBtn = this.panel.querySelector('.tutorial-prev')
    const nextBtn = this.panel.querySelector('.tutorial-next')
    const doneBtn = this.panel.querySelector('.tutorial-done')
    if (prevBtn) prevBtn.textContent = (step.prevLabel || defaultPrev)
    if (nextBtn) nextBtn.textContent = (step.nextLabel || defaultNext)
    if (doneBtn) doneBtn.textContent = (step.doneLabel || defaultDone)

  // Hide prev when first step, hide next when last step
  const isFirst = (this.index === 0)
  const isLast = (this.index === (this.steps.length - 1))
  const showPrev = (step && Object.prototype.hasOwnProperty.call(step, 'showPrev')) ? Boolean(step.showPrev) : !isFirst
  if (prevBtn) prevBtn.style.display = showPrev ? '' : 'none'
  // allow per-step override to show/hide the next button
  const showNext = (step && Object.prototype.hasOwnProperty.call(step, 'showNext')) ? Boolean(step.showNext) : !isLast
  if (nextBtn) nextBtn.style.display = showNext ? '' : 'none'
  // Done button should be visible on last step, otherwise optional
  if (doneBtn) doneBtn.style.display = isLast ? '' : ''

  // set content (use new DSFR-like structure selectors with fallbacks)
  const titleEl = this.panel.querySelector('#tutorial-title') || this.panel.querySelector('.fr-modal__title')
  const textEl = this.panel.querySelector('.fr-modal__text') || this.panel.querySelector('.fr-modal__content')
  if (titleEl) titleEl.textContent = step.title || ''
  if (textEl) textEl.innerHTML = step.text || ''

    // hide overlay when this step explicitly requests no highlight
    if (step && step.noHighlight && this.overlay) {
      this.overlay.style.display = 'none'
    } else if (this.overlay) {
      this.overlay.style.display = ''
    }

    // position near target if available, using anchor keywords
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    const panelRect = this.panel.getBoundingClientRect()
    const panelW = panelRect.width || 520
    const panelH = panelRect.height || 140
    const anchor = (step.anchor || 'right-top').toLowerCase()

    let left, top
    if (target) {
      const rect = target.getBoundingClientRect()
  console.log('[Tutorial] target rect', rect)

      switch (anchor) {
        case 'top-left':
          left = rect.left + window.scrollX - panelW - 10
          top = rect.top + window.scrollY - panelH - 10
          break
        case 'top-right':
          left = rect.right + window.scrollX + 10
          top = rect.top + window.scrollY - panelH - 10
          break
        case 'bottom-left':
          left = rect.left + window.scrollX - panelW - 10
          top = rect.bottom + window.scrollY + 10
          break
        case 'bottom-right':
          left = rect.right + window.scrollX + 10
          top = rect.bottom + window.scrollY + 10
          break
        case 'center-left':
          left = rect.left + window.scrollX - panelW - 10
          top = rect.top + window.scrollY + (rect.height - panelH) / 2
          break
        case 'center-right':
          left = rect.right + window.scrollX + 10
          top = rect.top + window.scrollY + (rect.height - panelH) / 2
          break
        case 'center-top':
          left = rect.left + window.scrollX + (rect.width - panelW) / 2
          top = rect.top + window.scrollY - panelH - 10
          break
        case 'center-bottom':
          left = rect.left + window.scrollX + (rect.width - panelW) / 2
          top = rect.bottom + window.scrollY + 10
          break
        case 'center':
          left = rect.left + window.scrollX + (rect.width - panelW) / 2
          top = rect.top + window.scrollY + (rect.height - panelH) / 2
          break
        case 'right-top':
        default:
          left = rect.right + window.scrollX + 10
          top = rect.top + window.scrollY
          break
      }
    } else {
      // center in viewport
      left = window.scrollX + (vw - panelW) / 2
      top = window.scrollY + (vh - panelH) / 2
    }

    // clamp to viewport with small padding
    const pad = 8
    left = Math.min(Math.max(left, window.scrollX + pad), window.scrollX + Math.max(vw - panelW - pad, pad))
    top = Math.min(Math.max(top, window.scrollY + pad), window.scrollY + Math.max(vh - panelH - pad, pad))

    this.panel.style.position = 'absolute'
    this.panel.style.left = Math.round(left) + 'px'
    this.panel.style.top = Math.round(top) + 'px'
    this.panel.style.transform = ''
    this.panel.style.zIndex = 99999
  console.log('[Tutorial] panel positioned at', this.panel.style.left, this.panel.style.top, 'anchor=', anchor)
    
  }

  end(explicitEnded = false) {
    console.log('[Tutorial] ending tour', { explicitEnded, tourId: this.tourId })
    try {
      if (window.localStorage && this.tourId) {
        // mark this specific tour as ended
        window.localStorage.setItem('umapTutorialEnded_' + this.tourId, '1')
      }
    } catch (err) { /* ignore storage errors */ }
    this.cleanup()
  }

  // Explicit skip action (marks only this tour as ended)
  skip() {
    this.end(true)
  }

  cleanup() {
    if (this.panel && this.panel.parentNode) {
      this.panel.parentNode.removeChild(this.panel)
      this.panel = null
    }
    this.clearHighlight()
    if (this.overlay && this.overlay.parentNode) {
  this.overlay.parentNode.removeChild(this.overlay)
      this.overlay = null
    }
  console.log('[Tutorial] cleaned up panel and overlay')
  }

  createOverlay() {
    if (this.overlay) return
  console.log('[Tutorial] creating overlay')
    this.overlay = document.createElement('div')
    this.overlay.className = 'tutorial-overlay'
    this.overlay.style.position = 'fixed'
    this.overlay.style.left = '0'
    this.overlay.style.top = '0'
    this.overlay.style.right = '0'
    this.overlay.style.bottom = '0'
    this.overlay.style.background = 'rgba(0,0,0,0.5)'
    this.overlay.style.zIndex = 99998
    document.body.appendChild(this.overlay)
  console.log('[Tutorial] overlay appended')
  }

  clearHighlight() {
    for (const el of document.querySelectorAll('.tutorial-highlight, .tutorial-target')) {
      el.classList.remove('tutorial-highlight')
      el.classList.remove('tutorial-target')
      el.removeAttribute('data-tutorial-step')
    }
    if (this._clickProxy && this._clickProxy.parentNode) {
      this._clickProxy.parentNode.removeChild(this._clickProxy)
      this._clickProxy = null
    }
  }

  onKey(e) {
    if (e.key === 'Escape') this.skip()
    if (e.key === 'ArrowRight') this.next()
    if (e.key === 'ArrowLeft') this.prev()
  }
}

// expose as default export
export default Tutorial
