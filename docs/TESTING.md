# Testing
This document provides an overview of all testing in this project, how to run the testing, what the tests cover, and remaining steps in development for these test suites. The testing in this project covers unit testing, integration testing, end-to-end testing, performance testing, and accessibility testing.

In all of these test suites, combinations of Jest, Vitest, Playwright, k6, and axe-core are used.

## Unit Testing - `/client/`
Definitions for Unit Tests for the frontend webservice are contained in the directory `/client/src/__tests__/`. These have not been written as of June 2025, and as such, cannot be run.

These unit tests should cover:
- **Custom React Hooks** - Using `@testing-library/react-hooks`.
- **Redux Reducers** - The files you want to test are located in the directory `/client/src/redux/`
- **Utility Functions** - There is only one utility function file currently defined for API calls and it is `/client/src/utils/apiUtil.js`. You can use `vi.Mocked` or `jest.Mocked` to mock the REST API server responses.

## Unit Testing - `/core/`
Definition for the `/core/` unit tests are contained in the directories `/core/__tests__/app/models/` and `/core/__tests__/app/services/`.

They can be run with the command: `npm run test` while with `/core/` as the current working directory. Note that this also runs the Integration Unit Testing for `/core/`.

These tests cover:
- **Database models** - These tests ensure the database schema is properly defined in the actual database and ensure that database operations are performed as expected.
- **Services** - These are functions defined to share commonly used operations across the API endpoints to reduce repetition.

Test cases still to write:
- Remaining Services; only Question and User services are currently tested, none of the other Services.
- Utility functions covering Auth, JWT, passwords, string helpers, and validators. These files are located in `/core/lib/`. You should not test `mailer.js` in the unit tests.

## Unit Testing - `/socket/`
Definition for the websocket service's unit tests are contained in the directory `/socket/__tests__/`. These have not been written as of June 2025, and as such, cannot be run.

These unit tests should cover:
- Testing handler functions that process events and emit responses, usign mocked socket objects.

## Integration Testing - `/client/`
Definition for the frontend service's integration tests are contained in the directory `/client/serc/__testS__`. Thse have not been written as of June 2025, and as such, cannot be run.

These integration tests should cover:
- UI interactions with mocked REST API responses and Websocket events.
- The UI interactions should test every major component and page.

## Integration Testing - `/core/`
Definition for the REST API service's integration tests are cotnained in the directory `/core/__tests__/app/api/`. These test each API endpoint with a real database connection to the Testing database.

These tests can be run with the command `npm run test` while with `/core/` as the current working directory. Note that this also runs the Unit Testing for `/core/`.

These tests cover:
- Each API endpoint with a real databse connection (no mocked DB connection)

These test do not currently cover, but should:
- Test the `Courier` email API Service Integration located in `/core/lib/mailer.js`
- Test the `/core/lib/auth.js` with a real database connection (no mocked DB connection).

## Integration Testing - `/socket/`
Definition for the websocket service's integration tests are contained in the directory `/socket/__tests__/`. These tests have not been written as of June 2025, and as such, cannot be run.

These tests should cover:
- Testing `socket.on('join',...)` etc. with a real WebSocket connection

One thing to note is that much of the websocket logic is handled within the frontend service, so you may need to test funcitonality beyond just that defined in the `/socket/` service.

## End-to-end Testing
End-to-end testing is defined in the `/__tests__/e2e/` directory. These tests are written using Playwright and evaluate the entire application stack, including the frontend, REST API, and WebSocket service fpr enitre user flows.

These tests are not currently implenmented as of June 2025, and as such, cannot be run. However, when they are implemented in the `__tests__/e2e/` directory, they can be run with the command in the root directory:
```bash
npx playwright test ./__tests__/e2e/
```

These tests should cover:
- User registration and login flows
- Question creation, editing, and deletion flows
- Lecture creation, editing, and deletion flows
- Real-time collaboration features using WebSockets
- etc.

Realistically, any significant user flow that can be tested should be covered by these end-to-end tests.

Make use of the `/__tests__/shared/` directory to share common test utilities, such as fixtures to use as shorthands to navigate to certain pages. These fixtures are shared with the Accessibility tests.

## Accessibility Testing
Accessibility testing is defined in the `/__tests__/a11y/` directory. These tests are written using Playwright and axe-core, and evaluate the accessibility of frontend pages and components. To pass these tests, the pages must meet the WCAG 2.1 AA standards and have no accessibility violations detected by axe-core.

These tests can be run with the command in the root directory:
```bash
npx playwright test ./__tests__/a11y/a11y.spec.js
```

These tests cover every unique page and view (such as different tabs in the same page) in the frontend service, and ensure that they meet the WCAG 2.1 AA standards. Test results are reported in the terminal and outputed to the `/.artifacts/` directory in the root of the project. This is in addition to the HTML report generated by Playwright.

## Performance Testing
Performance testing is defined in the `/__tests__/` directory with the subdirectories `baseline/`, `load/`, `soak/`, `stress/`, and `profiling/`. These tests are written using k6 for load testing and profiling, and Playwright for end-to-end flows with the `profiling/` tests.

There is no centralized command to run all performance tests, but they can be run individually with the following commands in the root directory:
```bash
# Baseline Performance Testing
npx k6 run ./__tests__/baseline/baseline_frontend.js 
npx k6 run ./__tests__/baseline/baseline_rest_api.js 
npx k6 run ./__tests__/baseline/baseline_ws.js 

# Load Performance Testing
npx k6 run ./__tests__/load/load_frontend.js
npx k6 run ./__tests__/load/load_rest_api.js
npx k6 run ./__tests__/load/load_ws.js

# Soak Performance Testing
npx k6 run ./__tests__/soak/soak_frontend.js
npx k6 run ./__tests__/soak/soak_rest_api.js
npx k6 run ./__tests__/soak/soak_ws.js

# Stress Performance Testing
npx k6 run ./__tests__/stress/stress_frontend.js
npx k6 run ./__tests__/stress/stress_rest_api.js
npx k6 run ./__tests__/stress/stress_ws.js

# Profiling Performance Testing
TBD
```

Please note that these tests do not currently generate any reports, but they can be extended to do so in the future. It is highly recommended to do so to analyze the performance of the application under different load conditions after running the tests.

For baseline, load, soak, and performance testing, the endpoints for the REST API service are missing testing for the live lecture endpoints, as the tests were written before the live lecture feature was implemented. These tests should be added in the future to ensure that the live lecture feature is properly tested under load conditions.

### Baseline Performance Testing
Baseline performance testing is defined in the `/__tests__/baseline/` directory. These tests are written using k6 and evaluate the performance of the frontend, REST API, and WebSocket service under normal conditions. The make use of 1 virtual user (VU) to simulate a single user interacting with the application. This is used to establish a baseline for the performance of the application to compare against in the load, soak, and stress tests.

See above for the command to run these tests.

These tests do not cover every frontend page or REST API endpoint. This is intentional. These tetss cover the most critical parts of the application, such as the login and registration flows, question creation and editing, and lecture creation and editing. The goal is to establish a baseline for the most important user flows in the application.

The frontend tests only cover one page, as the production deployment of the frontend service is a single-page application (SPA) that loads all pages dynamically. After being built, the frontend service is served via NGINX in the Docker container.

The REST API tests cover the most important endpoints such as login, dashboard retrieval, question retrieval, and logout.

The WebSocket service tests cover the most important events such as joining a lecture, creating a question, and answering a question.

### Load Performance Testing
Load performance testing is defined in the `/__tests__/load/` directory. These tests are written using k6 and evaluate the performance of the frontend, REST API, and WebSocket service under load conditions. The tests simulate multiple virtual users (VUs) interacting with the application to measure how it performs under load.

These tests are functionally identical to the baseline performance tests, but they use multiple virtual users (VUs) to simulate a load on the application. The number of VUs can be adjusted in the test files to simulate different load conditions.

### Soak Performance Testing
Soak performance testing is defined in the `/__tests__/soak/` directory. These tests are written using k6 and evaluate the performance of the frontend, REST API, and WebSocket service under sustained load conditions. The tests simulate multiple virtual users (VUs) interacting with the application over an extended period of time to measure how it performs under sustained load. This period of time can be into the hours.

The tests shoudl be functionally identical to the load performance tests, but they run for an extended period of time to measure how the application performs under sustained load. The number of VUs can be adjusted in the test files to simulate different sustained load conditions.

Soak testing is useful to identify memory leaks, performance degradation over time, and other issues that may not be apparent in shorter load tests.

### Stress Performance Testing
Stress performance testing is defined in the `/__tests__/stress/` directory. These tests are written using k6 and evaluate the performance of the frontend, REST API, and WebSocket service under extreme load conditions. The tests simulate a large number of virtual users (VUs) interacting with the application to measure how it performs under stress.

These tests are functionally identical to the load performance tests, but they use a large number of virtual users (VUs) to simulate extreme load on the application. The number of VUs can be adjusted in the test files to simulate different stress conditions.

Stress testing is useful to identify the breaking point of the application, how it handles extreme load, and how it recovers from stress conditions.

It is important to note that we cannot use the tests in place like the earlier tests. Stress testing should evaluate the performance of the system as a whole, not just the frontend, REST API, and WebSocket services individually (though they still should be tested individually). This means that the tests should simulate a realistic user flow that involves multiple services interacting with each other, such as a user logging in, creating a lecture, and answering questions in real-time as an additional form of stress test, in addition to the individual stress tests on each service (this may require the use of Playwright, instead of k6 in isolation).

### Profiling Performance Testing
Profiling performance testing is defined in the `/__tests__/profiling/` directory. These tests are written using Playwright and evaluate the performance of the application under real-world scenarios. These tests are designed to measure the responsiveness between UI interactions, to ensure that users do not experience significant delays when interacting with the application. This is done by measuring the time it takes for the application to respond to user interactions, such as clicking buttons, submitting forms, and navigating between pages. I recommend using Playwright for this, as it provides a built-in way to measure the performance of the application under real-world scenarios. This should also be used in conjunction with the k6 performance tests to test responsiveness for the same UI interactions when each service is under load (i.e. use k6 to simulate the load, then run the same Playwright tests to measure the responsiveness of the application under load).

Please note that these tests are not currently implemented as of June 2025.

## Other
Not everything for this project testing is finished. Consider the following extensions:
- Produce robust coverage reports such as the one produced by the `/core/` testing for everything
- Define a `npm run` script to run all tests when in the root `/` directory.
- Add all tests except performance testing to the CI/CD workflow.

If Playwright tests are taking too long to run, consider running the tests for each browser in parallel, as well as multiple workers for each test file.
