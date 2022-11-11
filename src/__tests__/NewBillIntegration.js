/**
 * @jest-environment jsdom
 */

// import jest-dom matchers, screen and user events
import "@testing-library/jest-dom";
import {screen} from "@testing-library/dom";
import userEvent from '@testing-library/user-event';
// import routes
import {ROUTES} from "../constants/routes.js";
// import NewBills container and UI
import NewBill from "../containers/NewBill.js";
import NewBillUI from "../views/NewBillUI.js";
// import mocks ...
import mockStore from "../__mocks__/store.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

// !!! FIX [Ajout de tests unitaires et d'intégration] 15/07/2020 !!!
// - write integration tests to cover NewBills.js's statements ...
describe(`Given I am connected as an employee`, () => {

    let
        // store new bill object and form elements
        [ newbillz, expenseForm, expenseType, expenseName, expenseDate, expenseAmount, expenseVAT, expensePCT, expenseDetails, expenseFile, expenseSubmit ] = [ ,,,,,,,,,, ].fill(null);

    beforeAll(async() => {
        // mock browser's local storage ...
        Object.defineProperty(window, `localStorage`, {value: localStorageMock});
        // mock employee session ...
        window.localStorage.setItem(`user`, JSON.stringify({type: `Employee`}));
        // rendering the UI has to be done first there ...
        document.body.innerHTML = NewBillUI();
        // mock the store so it returns the bills ...
        jest.mock(`../app/Store`, () => mockStore);
        // create 'Bills' object ...
        newbillz = new NewBill({
            document,
            onNavigate: p => { document.body.innerHTML = ROUTES({pathname: p}); },
            store: await import(`../app/Store`),
            localStorage: window.localStorage
        });
    });

    // - add a test for viewing the form's elements ...
    describe(`When I navigate to the new bill page`, () => {
        test(`Then all the form elements should display`, async() => {
            [
                // use findBy queries to poll for element's presence in the DOM
                expenseForm,
                expenseType,
                expenseName,
                expenseDate,
                expenseAmount,
                expenseVAT,
                expensePCT,
                expenseDetails,
                expenseFile,
                expenseSubmit
            ] = await Promise.all([
                // retrieve relevant elements
                screen.findByTestId(`form-new-bill`),
                screen.findByTestId(`expense-type`),
                screen.findByTestId(`expense-name`),
                screen.findByTestId(`datepicker`),
                screen.findByTestId(`amount`),
                screen.findByTestId(`vat`),
                screen.findByTestId(`pct`),
                screen.findByTestId(`commentary`),
                screen.findByTestId(`file`),
                screen.findByRole(`button`)
            ]);

            // actual test
            [ expenseForm, expenseType, expenseName, expenseDate, expenseAmount, expenseVAT, expensePCT, expenseDetails, expenseFile, expenseSubmit ]
                .forEach(x => { expect(x).toBeVisible(); });
        });
    });

    // - add a test for filling out the fields ...
    describe(`When I fill out the fields`, () => {
        test(`Then no error should occur`, async() => {
            await Promise.all([
                // emulate inputs ...
                await userEvent.selectOptions(expenseType, `Restaurants et bars`),                
                await userEvent.type(expenseName, `Buffet froid`),
                await userEvent.type(expenseDate, `05/23/2022`),
                await userEvent.type(expenseAmount, `250`),
                await userEvent.type(expenseVAT, `17`),
                await userEvent.type(expensePCT, `20`),
                await userEvent.type(expenseDetails, `blablabla`)
            ]);

            // no need for a test here, this unit will fail if any of the above promises is rejected ...
        });
    });

    // - add a test for uploading a file ...
    describe(`When I upload a file`, () => {
        test(`Then the file should be uploaded`, async() => {
            const
                // retrieve ...
                {handleChangeFile} = newbillz,
                // mock 'upload file' function ...
                hcf = jest.fn(handleChangeFile),
                // create bogus file ...
                file = new File([ `(⌐□_□)` ], `chucknorris.png`, {type: `image/png`});

            // replace the change event listener with the mock ...
            expenseFile.addEventListener(`change`, hcf);

            // emulate upload ...
            await userEvent.upload(expenseFile, file);

            // aaaand perform tests ...
            expect(hcf).toHaveBeenCalled();
        });
    });

    // - add a test for submitting the form (POST) ...
    describe(`When I click on submit`, () => {
        test(`Then the form should be submitted`, async() => {
            const
                // retrieve ...
                {handleSubmit} = newbillz,
                // mock 'submit' function ...
                hs = jest.fn(handleSubmit);

            // replace the submit event listener with the mock ...
            expenseForm.addEventListener(`submit`, hs);

            // emulate upload ...
            await userEvent.click(expenseSubmit);

            // aaaand perform tests ...
            expect(hs).toHaveBeenCalled();
        });
    });
});