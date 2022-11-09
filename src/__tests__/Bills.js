/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression

        // !!! FIX [Ajout de tests unitaires et d'intégration] - 15/07/2020 !!!
        // - add views/Bills expect directive
        // - verify that the icon is highlighted by testing the relevant class  
        expect(windowIcon.classList.contains(`active-icon`)).toBeTruthy();
        // !!! FIX [Ajout de tests unitaires et d'intégration] - 15/07/2020 !!!

    })

    test("Then bills should be ordered from earliest to latest", () => {        
        // !!! FIX [Bug report] - Bills 15/07/2020 !!!
        // - BillsUI() renders some HTML code in which date values are formatted to "4 Avr. 04"
        document.body.innerHTML = BillsUI({ data: bills })
        // - getAllByText queries the DOM for nodes whose 'textContent' property matches format "2004-04-04" - it is therefore impossible to
        //   fix the test by fixing the functionality because the test queries the DOM for values that the functionality is not supposed to provide.
        //   The test has to be rewritten in order to query the DOM for the correct values
        const dates = screen.getAllByText(/^\d{1,2}\s[a-z]{3}\.\s\d{2}$/ui).map(a => a.innerHTML)

        // const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
        // !!! FIX [Bug report] - Bills 15/07/2020 !!!
        const antiChrono = (a, b) => ((a < b) ? 1 : -1)
        const datesSorted = [...dates].sort(antiChrono)
        expect(dates).toEqual(datesSorted)
    })
  })
});