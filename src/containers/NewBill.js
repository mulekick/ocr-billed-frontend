import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }

    // !!! FIX [Bug Hunt] - Bills 19/07/2020 !!!
    // fix the functionality by rewriting the function ...
    
    handleChangeFile = async e => {
        try {
            
            e.preventDefault();

            const
                // - test the file extension against the correct formats 
                match = e.target.value.match(/^.+\\(?<file>.+\.(?:jpe?g|png))$/ui),
                {email} = JSON.parse(localStorage.getItem(`user`));

            if (match === null)
                // - block the upload if file extension does not match
                throw new Error(`please upload a jpg, jpeg or png image.`);

            const f = new FormData();  
            f.append(`file`, e.target.files.item(0));
            f.append(`email`, email);

            const {fileUrl, key} = await this.store.bills()
                .create({data: f, headers: {noContentType: true}});

            Object.assign(this, {
                billId: key,
                fileUrl: fileUrl,
                fileName: match.pop()
            });

        } catch (err) {
            // - log error message to console
            // console.error(`error occured: ${ err.message }`);
            // - reset file value
            e.target.value = ``;
        }
    }

    /*
  handleChangeFile = e => {
    e.preventDefault()
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    const filePath = e.target.value.split(/\\/g)
    const fileName = filePath[filePath.length-1]
    const formData = new FormData()
    const email = JSON.parse(localStorage.getItem("user")).email
    formData.append('file', file)
    formData.append('email', email)

    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({fileUrl, key}) => {
        console.log(fileUrl)
        this.billId = key
        this.fileUrl = fileUrl
        this.fileName = fileName
      }).catch(error => console.error(error))
  }
    */
    // !!! FIX [Bug Hunt] - Bills 19/07/2020 !!!

  handleSubmit = e => {
    e.preventDefault()
    // !!! remove debug leftovers !!!
    // console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    // !!! remove debug leftovers !!!
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.updateBill(bill)
    // !!! FIX [Ajout de tests unitaires et d'intégration] 15/07/2020 !!!
    // Note : the following line will execute and redirect user to the bills list
    // regardless of which HTTP code the api call returns - it is thus impossible to
    // write frontend tests in NewBills.js for when the API returns a 404 or a 500
    this.onNavigate(ROUTES_PATH['Bills'])
    // !!! FIX [Ajout de tests unitaires et d'intégration] 15/07/2020 !!!
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}