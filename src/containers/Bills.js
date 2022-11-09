import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)

    // !!! FIX [Ajout de tests unitaires et d'intégration] 15/07/2020 !!!
    // - have to do this for the tests to run properly, as it has been done in /src/containers/Dashboard.js too ... 
    if (typeof $('#modaleFile').modal === 'function') $('#modaleFile').modal('show')
    
    // $('#modaleFile').modal('show')
    // !!! FIX [Ajout de tests unitaires et d'intégration] 15/07/2020 !!!
  }

  getBills = () => {
    if (this.store) {
      return this.store
      .bills()
      .list()
      .then(snapshot => {
        const bills = snapshot        
          .map(doc => {
            try {
              return {
                ...doc,
                // !!! FIX [Bug report] - Bills 15/07/2020 !!!
                // fix the functionality :
                // - dates are formatted and become non-parseable a soon as the list() promise is resolved 
                // - we will format them at a later stage so they remain parseable
                date: doc.date,

                // date: formatDate(doc.date),
                // !!! FIX [Bug report] - Bills 15/07/2020 !!!
                status: formatStatus(doc.status)
              }
            } catch(e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              console.log(e,'for',doc)
              return {
                ...doc,
                date: doc.date,
                status: formatStatus(doc.status)
              }
            }
          })
          console.log('length', bills.length)
        return bills
      })
    }
  }
}
