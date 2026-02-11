import { DomUtil } from '../../../vendors/leaflet/leaflet-src.esm.js'
import { uMapAlert as Alert } from '../../components/alerts/alert.js'
import { BaseAjax, SingleMixin } from '../autocomplete.js'
import { translate } from '../i18n.js'

const TEMPLATE = `
  <h3>Overpasss</h3>
  <div style="font-size: 0.85em; font-style: italic; color: #666; margin-top: 10px; margin-bottom: 10px; padding: 10px; background-color: #f5f5f5; border-left: 3px solid #ff9800;">
    <strong>Avertissement :</strong> OSM étant collaboratif, la qualité varie selon les régions. Les zones urbaines des pays développés sont généralement très bien cartographiées, tandis que certaines zones rurales ou moins fréquentées peuvent être incomplètes ou obsolètes. Il est prudent de vérifier la fraîcheur des données pour votre zone d'intérêt et de croiser avec d'autres sources pour des applications critiques.
  </div>
  <label>
    <span data-help="overpassImporter">${translate('Expression')}</span>
    <input type="text" placeholder="amenity=drinking_water" name="tags" />
  </label>
  <label>
    ${translate('Geometry mode')}
    <select name="out">
      <option value="geom" selected>${translate('Default')}</option>
      <option value="center">${translate('Only geometry centers')}</option>
    </select>
  </label>
  <label id="area"><span>${translate('Search area')}</span></label>
`

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
    this.map = map
    this.name = options.name || 'Overpass'
    this.baseUrl = options?.url || 'https://overpass-api.de/api/interpreter'
    this.searchUrl =
      options?.searchUrl ||
      'https://photon.komoot.io/api?q={q}&layer=county&layer=city&layer=state'
    this.id = 'overpass'
    this.boundaryChoice = null
    this.expression = null
  }

  async open(importer, params = {}) {
    const container = DomUtil.create('div')
    container.innerHTML = TEMPLATE
    // Prefill expression from previous use or from params
    const preExpr = params.expression || this.expression
    if (preExpr) {
      container.querySelector('[name=tags]').value = preExpr
    }
    this.autocomplete = new Autocomplete(container.querySelector('#area'), {
      url: this.searchUrl,
      placeholder: translate(
        'Type area name, or let empty to load data in current map view'
      ),
      on_select: (choice) => {
        this.boundaryChoice = choice
      },
      on_unselect: (choice) => {
        this.boundaryChoice = null
      },
    })
    if (this.boundaryChoice) {
      this.autocomplete.displaySelected(this.boundaryChoice)
    }
    this.map.help.parse(container)

    const confirm = (form) => {
      if (!form.tags) {
        Alert.error(translate('Expression is empty'))
        return
      }
      this.expression = form.tags
      let tags = form.tags
      if (!tags.startsWith('[')) tags = `[${tags}]`
      let area = '{south},{west},{north},{east}'
      if (this.boundaryChoice) area = `area:${this.boundaryChoice.item.value}`
      const query = `[out:json];nwr${tags}(${area});out ${form.out};`
      importer.url = `${this.baseUrl}?data=${query}`
      if (this.boundaryChoice) importer.layerName = this.boundaryChoice.item.label
      importer.format = 'osm'
    }

    // If caller provided params to immediately confirm, build URL and close
    if (params && params.autoConfirm) {
      // simulate form values
      const fakeForm = {
        tags: params.expression || container.querySelector('[name=tags]').value,
        out: params.out || container.querySelector('[name=out]').value,
      }
      // allow also passing an explicit area id (area:XXX) or bbox
      if (params.area) {
        this.boundaryChoice = { item: { value: params.area, label: params.area } }
      }
      confirm(fakeForm)
      return
    }

    importer.dialog
      .open({
        template: container,
        className: `${this.id} importer dark`,
        accept: translate('Choose this data'),
        cancel: false,
      })
      .then(confirm)
  }
}
