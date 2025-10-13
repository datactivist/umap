import { DomUtil } from '../../../vendors/leaflet/leaflet-src.esm.js'
import { translate } from '../i18n.js'
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
      option.value = dataset.url
      option.textContent = dataset.label
      option.dataset.format = dataset.format || 'geojson'
    }

    // --- Add the "Search area" label at the end ---
    const label = DomUtil.element({
      tagName: 'label',
      id: 'area',
      parent: container,
    })
    DomUtil.element({
      tagName: 'span',
      textContent: translate('Search area'),
      parent: label,
    })

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

    // --- Confirm action ---
    const confirm = () => {
      if (select.value) {
        importer.url = select.value
        importer.format = select.options[select.selectedIndex].dataset.format
        importer.layerName = select.options[select.selectedIndex].textContent

        if (this.boundaryChoice) {
          importer.area = this.boundaryChoice.item.label
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
