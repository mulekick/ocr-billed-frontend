/**
 * @jest-environment jsdom
 */

// import jest-dom matchers, screen and user events
import "@testing-library/jest-dom";
import {screen} from "@testing-library/dom";
import userEvent from '@testing-library/user-event';
// import Bills container and UI
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
// import mocks ...
import mockStore from "../__mocks__/store.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

// !!! FIX [Ajout de tests unitaires et d'intégration] 15/07/2020 !!!
// - write integration tests to cover Bills.js's statements ...
describe(`Given I am connected as an employee`, () => {

    let
        // store 'bills' object
        billz = null;

    beforeAll(async() => {
        // mock browser's local storage ...
        Object.defineProperty(window, `localStorage`, {value: localStorageMock});
        // mock employee session ...
        window.localStorage.setItem(`user`, JSON.stringify({type: `Employee`}));
    });

    beforeEach(() => {
        // create 'Bills' object ... the 'store' property will be updated at each test
        billz = new Bills({
            document,
            onNavigate: p => { document.body.innerHTML = ROUTES({pathname: p}); },
            localStorage: window.localStorage
        });
        // reset modules states so they can be mocked with different implementations at each test
        jest.resetModules();
    });

    // - add a test for the 'fetch bills from backend' function ...
    describe(`When I navigate to the bills page`, () => {
        test(`Then the page should display exactly 4 bills`, async() => {
            // mock the store so it returns the bills ...
            jest.mock(`../app/Store`, () => mockStore);

            // import the mocked store into the bills object ...
            billz.store = await import(`../app/Store`);

            try {
                // render the UI ...
                document.body.innerHTML = BillsUI({data: await billz.getBills(), error: null});
            } catch (err) {
                // render the UI w/ error ...
                document.body.innerHTML = BillsUI({data: null, error: err});
            }

            // aaaand perform tests ...
            expect(screen.getByTestId(`tbody`).children.length).toBe(4);
        });
    });

    // - add a test for opening the bill image
    describe(`When I click on the eye button`, () => {
        test(`Then the image for the bill should show`, async() => {
            // mock the store so it returns the bills ...
            jest.mock(`../app/Store`, () => mockStore);

            // import the mocked store into the bills object ...
            billz.store = await import(`../app/Store`);

            try {
                // render the UI ...
                document.body.innerHTML = BillsUI({data: await billz.getBills(), error: null});
            } catch (err) {
                // render the UI w/ error ...
                document.body.innerHTML = BillsUI({data: null, error: err});
            }

            const
                // retrieve ...
                {handleClickIconEye} = billz,
                // mock 'click eye icon on employee's page' function ...
                hci = jest.fn(handleClickIconEye),
                // extract first eye icon ...
                eye = screen.getAllByTestId(`icon-eye`).at(0);

            // replace the click event listener with the mock ...
            eye.addEventListener(`click`, e => hci(e.target));

            // emulate click ...
            await userEvent.click(eye);

            // aaaand perform tests ...
            expect(hci).toHaveBeenCalled();
            expect(screen.getByTestId(`modaleFile`)).toBeTruthy();
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

            // import the mocked store into the bills object ...
            billz.store = await import(`../app/Store`);

            try {
                // render the UI ...
                document.body.innerHTML = BillsUI({data: await billz.getBills(), error: null});
            } catch (err) {
                // render the UI w/ error ...
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

            // import the mocked store into the bills object ...
            billz.store = await import(`../app/Store`);

            try {
                // render the UI ...
                document.body.innerHTML = BillsUI({data: await billz.getBills(), error: null});
            } catch (err) {
                // render the UI w/ error ...
                document.body.innerHTML = BillsUI({data: null, error: err});
            }

            // actual test
            expect(screen.getByText(/Erreur 500/u)).toBeVisible();
        });
    });

});
// !!! FIX [Ajout de tests unitaires et d'intégration] 15/07/2020 !!!