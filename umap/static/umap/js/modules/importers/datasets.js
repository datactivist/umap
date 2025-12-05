import { DomUtil } from '../../../vendors/leaflet/leaflet-src.esm.js'
import { translate } from '../i18n.js'
import { uMapAlert as Alert } from '../../components/alerts/alert.js'
import { BaseAjax, SingleMixin } from '../autocomplete.js'

class Autocomplete extends SingleMixin(BaseAjax) {
  handleResults(data) {
    return super.handleResults(data.features)
  }

  createResult(item) {
    const labels = [item.properties.name]
    if (item.properties.county) {
      labels.push(item.properties.county)
    }
    if (item.properties.state) {
      labels.push(item.properties.state)
    }
    if (item.properties.country) {
      labels.push(item.properties.country)
    }
    return super.createResult({
      // Overpass convention to get their id from an osm one.
      value: item.properties.osm_id + 3600000000,
      label: labels.join(', '),
    })
  }
}

export class Importer {
  constructor(map, options) {
    console.log("Datasets importer constructor")
    this.map = map
    this.name = options.name || 'Datasets'
    this.choices = options?.choices
    this.id = this.name.toLowerCase().replace(/\s+/g, '-')
    this.searchUrl =
      options?.searchUrl ||
      'https://photon.komoot.io/api?q={q}&layer=county&layer=city&layer=state'
  }

  async open(importer) {
    const container = DomUtil.create('div', 'formbox')
    DomUtil.element({ tagName: 'h3', textContent: this.name, parent: container })

    // --- Dataset selector ---
    const select = DomUtil.create('select', '', container)
    DomUtil.element({
      tagName: 'option',
      parent: select,
      value: '',
      textContent: translate('Choose a dataset'),
    })
    for (const dataset of this.choices) {
      const option = DomUtil.create('option', '', select)
      // If dataset provides an explicit URL use it, otherwise for OSM datasets
      // use the configured overpass base URL (fallback to public one).
      option.value = dataset.url || (dataset.format === 'osm' ? (this.map?.properties?.importers?.overpass?.url || 'https://overpass-api.de/api/interpreter') : '')
      option.textContent = dataset.label
      option.dataset.format = dataset.format || 'geojson'
      if (dataset.expression) option.dataset.expression = dataset.expression
    }

    // --- Add the "Search area" label at the end ---
    const label = DomUtil.element({ tagName: 'label', id: 'area', parent: container })
    DomUtil.element({ tagName: 'span', textContent: translate('Search area'), parent: label })

    // --- Optional: attach autocomplete like in Overpass importer ---
    this.autocomplete = new Autocomplete(label, {
      url: this.searchUrl,
      placeholder: translate('Type area name (optional)'),
      on_select: (choice) => {
        this.boundaryChoice = choice
      },
      on_unselect: () => {
        this.boundaryChoice = null
      },
    })
    // Hide the area label until an OSM dataset is selected
    label.style.display = 'none'

    // --- Overpass-specific controls (hidden until an OSM dataset is selected) ---
  const overpassContainer = DomUtil.create('div', 'overpass-form', container)
  overpassContainer.style.display = 'none'

  // Expression label + read-only input (hidden until OSM dataset selected)
  const exprLabel = DomUtil.element({ tagName: 'label', parent: overpassContainer })
  DomUtil.element({ tagName: 'span', textContent: translate('Expression'), parent: exprLabel })
  const tagsInput = DomUtil.element({ tagName: 'input', parent: exprLabel, type: 'text', name: 'tags', placeholder: 'amenity=drinking_water', readOnly: true })
  tagsInput.style.display = 'block'
  tagsInput.style.width = '100%'

  // Geometry mode label + select
  const geomLabel = DomUtil.element({ tagName: 'label', parent: overpassContainer })
  DomUtil.element({ tagName: 'span', textContent: translate('Geometry mode'), parent: geomLabel })
  const outSelect = DomUtil.element({ tagName: 'select', parent: geomLabel, name: 'out' })
  DomUtil.element({ tagName: 'option', parent: outSelect, value: 'geom', textContent: translate('Default'), selected: true })
  DomUtil.element({ tagName: 'option', parent: outSelect, value: 'center', textContent: translate('Only geometry centers') })

    // Show/hide controls depending on selected dataset format
    select.addEventListener('change', () => {
      const option = select.options[select.selectedIndex]
      const fmt = option && option.dataset ? option.dataset.format : null
      const expr = option && option.dataset ? option.dataset.expression : null
      // Only show Overpass controls when a real dataset is selected and its format is 'osm'
      if (fmt === 'osm' && select.value) {
        overpassContainer.style.display = ''
        // Make sure tags input is shown and area search is visible
        tagsInput.style.display = 'block'
        label.style.display = ''
        // Prefill expression if provided on the dataset (keep readonly)
        if (expr) tagsInput.value = expr.replace(/\[out:[^\]]*\];?/i, '')
      } else {
        overpassContainer.style.display = 'none'
        label.style.display = 'none'
        tagsInput.value = ''
      }
    })

    // --- Confirm action ---
    const confirm = () => {
      if (select.value) {
        const fmt = select.options[select.selectedIndex].dataset.format
        importer.layerName = select.options[select.selectedIndex].textContent

        if (fmt === 'osm') {
          // Delegate to Overpass importer to build the URL to keep behaviour consistent
          const option = select.options[select.selectedIndex]
          let expr = option && option.dataset ? option.dataset.expression : null
          if (!expr) expr = tagsInput.value || ''
          expr = expr.trim()
          if (!expr) {
            Alert && Alert.error && Alert.error(translate('Expression is empty'))
            return
          }

          // Clean expression from leading/trailing out: clauses
          expr = expr.replace(/^\s*\[out:[^\]]*\]\s*;?/i, '')
          expr = expr.replace(/;?\s*out\s+[^;]+;?\s*$/i, '')

          // If expression already contains element types or grouped queries,
          // build the full Overpass body here. Otherwise, delegate to Overpass importer
          // which expects a simple tag expression (e.g. amenity=drinking_water).
          const isElementExpr = /^\s*(?:nwr|node|way|relation|\()/i.test(expr)
          if (isElementExpr) {
            // Build body from expr and selected area
            let body = expr
            // Remove leading/trailing out directives
            body = body.replace(/^\s*\[out:[^\]]*\]\s*;?/i, '')
            body = body.replace(/;?\s*out\s+[^;]+;?\s*$/i, '')

            if (body.startsWith('(')) {
              // inject bbox placeholders after each element inside the group for compatibility
              const bbox = '{south},{west},{north},{east}'
              body = body.replace(/\b(nwr|node|way|relation)(\[[^\]]*\])?/ig, function (match, el, attrs) {
                return el + (attrs || '') + `(${bbox})`
              })
            } else if (/^\s*(?:nwr|node|way|relation)/i.test(body)) {
              const areaStr = this.boundaryChoice ? `area:${this.boundaryChoice.item.value}` : '{south},{west},{north},{east}'
              body = body.replace(/;?$/,'') + `(${areaStr})`
            }

            const query = `[out:json];${body};out ${outSelect.value};`
            importer.url = `${select.value}?data=${encodeURIComponent(query)}`
            importer.format = 'osm'
            if (this.boundaryChoice) {
              const baseName = select.options[select.selectedIndex].textContent || importer.layerName || ''
              importer.layerName = `${baseName} - ${this.boundaryChoice.item.label}`
            }
          } else {
            // simple tag expression -> delegate to overpass importer
            const params = {
              expression: expr,
              out: outSelect.value,
              autoConfirm: true,
            }
            if (this.boundaryChoice) params.area = this.boundaryChoice.item.value
            if (typeof importer.openHelper === 'function') {
              importer.openHelper('overpass', params)
            } else {
              // fallback: build as a simple nwr[tag](area)
              const area = this.boundaryChoice ? `area:${this.boundaryChoice.item.value}` : '{south},{west},{north},{east}'
              const tags = expr.startsWith('[') ? expr : `[${expr}]`
              const query = `[out:json];nwr${tags}(${area});out ${outSelect.value};`
              importer.url = `${select.value}?data=${encodeURIComponent(query)}`
              importer.format = 'osm'
              if (this.boundaryChoice) {
                const baseName = select.options[select.selectedIndex].textContent || importer.layerName || ''
                importer.layerName = `${baseName} - ${this.boundaryChoice.item.label}`
              }
            }
          }
        } else {
          importer.url = select.value
          importer.format = fmt
          if (this.boundaryChoice) {
            importer.area = this.boundaryChoice.item.label
          }
        }
      }
    }

    importer.dialog
      .open({
        template: container,
        className: `${this.id} importer dark`,
        accept: translate('Choose this dataset'),
        cancel: false,
      })
      .then(confirm)
  }
}
