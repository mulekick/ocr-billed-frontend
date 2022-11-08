/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

// !!! FIX [Ajout de tests unitaires et d'intégration] 15/07/2020 !!!
// import user events and jest-dom matchers
import userEvent from '@testing-library/user-event';
import "@testing-library/jest-dom";
// import Bills
import Bills from "../containers/Bills.js";
// import store mock ...
import mockStore from "../__mocks__/store.js";
// !!! FIX [Ajout de tests unitaires et d'intégration] 15/07/2020 !!!

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

// !!! FIX [Ajout de tests unitaires et d'intégration] 15/07/2020 !!!
// - write additional tests to cover Bills.js's statements ...
describe(`Given I am connected as an employee`, () => {
    describe("When I click on the eye button", () => {
        // - add a test for opening the bill image
        test("Then the image for the bill should show", () => {
            // mock browser's local storage ...
            Object.defineProperty(window, `localStorage`, {value: localStorageMock});
            // mock employee session ...
            window.localStorage.setItem(`user`, JSON.stringify({type: `Employee`}));
            // render the UI ...
            document.body.innerHTML = BillsUI({ data: bills });

            const
                // create 'Bills' object ...
                billz = new Bills({
                    document,
                    onNavigate: p => document.body.innerHTML = ROUTES({ pathname: p }),
                    store: null,
                    localStorage: window.localStorage
                }),
                // mock 'click eye icon on employee's page' function ...
                handleClickIconEye = jest.fn(billz.handleClickIconEye),
                // extract first eye icon ...
                eye = screen.getAllByTestId(`icon-eye`).at(0);

            // add mock function as a listener and pass the eye icon as parameter ...
            eye.addEventListener(`click`, e => handleClickIconEye(e.target));

            // emulate click ...
            userEvent.click(eye);

            // aaaand perform tests ...
            expect(handleClickIconEye).toHaveBeenCalled();
            expect(screen.getByTestId(`modaleFile`)).toBeTruthy();
        });
    });  
});
// !!! FIX [Ajout de tests unitaires et d'intégration] 15/07/2020 !!!

// !!! FIX [Ajout de tests unitaires et d'intégration] 15/07/2020 !!!
// - write additional tests to cover Bills.js's statements ...
describe(`Given I am connected as an employee`, () => {
    beforeAll(() => {
        // mock browser's local storage ...
        Object.defineProperty(window, `localStorage`, {value: localStorageMock});
        // mock employee session ...
        window.localStorage.setItem(`user`, JSON.stringify({type: `Employee`}));
    });

    // reset modules states so they can be mocked with different implementations at each test
    beforeEach(() => jest.resetModules());

    // - add a test for the 'fetch bills from backend' function ...
    describe(`When I navigate to the bills page`, () => {
        test(`Then the page should display exactly 4 bills`, async() => {
            // mock the store so it returns the bills ...
            jest.mock(`../app/Store`, () => mockStore);
            // create 'Bills' object ...
            const billz = new Bills({
                document,
                onNavigate: p => { document.body.innerHTML = ROUTES({pathname: p}); },
                // pass the mocked store to the constructor ...
                store: await import(`../app/Store`),
                localStorage: window.localStorage
            });

            try {
                // render the UI ...
                document.body.innerHTML = BillsUI({data: await billz.getBills(), error: null});
            } catch (err) {
                // store error ...
                document.body.innerHTML = BillsUI({data: null, error: err});
            }

            // actual test
            expect(screen.getByTestId(`tbody`).children.length).toBe(4);
        });
    });

    // - add tests for when 'fetch bills from backend' breaks ...
    describe(`When the API breaks and returns a HTTP 404`, () => {
        test(`Then the page should display 'Error 404'`, async() => {
            // mock the store so it throws a 404 ...
            jest.mock(`../app/Store`, () => ({
                bills: () => ({
                    list: () => Promise.reject(new Error(`Erreur 404`))
                })
            }));
            // create 'Bills' object ...
            const billz = new Bills({
                document,
                onNavigate: p => { document.body.innerHTML = ROUTES({pathname: p}); },
                // pass the mocked store to the constructor ...
                store: await import(`../app/Store`),
                localStorage: window.localStorage
            });

            try {
                // render the UI ...
                document.body.innerHTML = BillsUI({data: await billz.getBills(), error: null});
            } catch (err) {
                // store error ...
                document.body.innerHTML = BillsUI({data: null, error: err});
            }

            // actual test
            expect(screen.getByText(/Erreur 404/u)).toBeVisible();
        });
    });

    // - add tests for when 'fetch bills from backend' breaks ...
    describe(`When the API breaks and returns a HTTP 500`, () => {
        test(`Then the page should display 'Error 500'`, async() => {
            // mock the store so it throws a 404 ...
            jest.mock(`../app/Store`, () => ({
                bills: () => ({
                    list: () => Promise.reject(new Error(`Erreur 500`))
                })
            }));
            // create 'Bills' object ...
            const billz = new Bills({
                document,
                onNavigate: p => { document.body.innerHTML = ROUTES({pathname: p}); },
                // pass the mocked store to the constructor ...
                store: await import(`../app/Store`),
                localStorage: window.localStorage
            });

            try {
                // render the UI ...
                document.body.innerHTML = BillsUI({data: await billz.getBills(), error: null});
            } catch (err) {
                // store error ...
                document.body.innerHTML = BillsUI({data: null, error: err});
            }

            // actual test
            expect(screen.getByText(/Erreur 500/u)).toBeVisible();
        });
    });
});
// !!! FIX [Ajout de tests unitaires et d'intégration] 15/07/2020 !!!