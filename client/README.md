# MyClassroom Client
Welcome to the MyClassroom React.js Frontend Client! This README.md is dedicated to development guidance and information reguarding the client side of the application. For more information about contributing, or general user guides, please visit the [MyClassroom Wiki](https://github.com/OSU-MC/MyClassroom/wiki).

## Setup Application for Client Development
This guide is specifically for local development of the MyClassroom Client. You may prefer to use the main [README.md](../README.md) install/setup instructions for other deployments.

Install and configure the Application according to the steps in the main README.md but do not start the application. Then run the following from the root directory.

### Start Core and Client
Start the MyClassroom Core with Docker:
```
npm run start:core
```

Start the local development version of the MyClassroom Client:
```
npm run start -w=client
```

### Stop Core and Client
The MyClassroom Client can be stopped by pressing **Ctrl+C** while the process is running in the shell.

The MyClassroom Core can be stopped using the command:
```
npm run stop
```

## Update Client Configuration
Modify `/client/.env` to update the MyClassroom Client configuration. The `VITE_API_URL` environment variable should be set to the MyClassroom Core URL. For basic testing, the default values can be used.

## Tech Stack
- React / React Native
- Redux
- Javascript
![New Architecture](https://github.com/OSU-MC/MyClassroom/assets/25465133/633b6e2b-bbdd-4ff6-b986-f5d809c96a9b)

## Organization
```bash
./src
└── components                        # Independent components of react code such as Cards, Buttons, and Navigation
│   └── nav
│   └── questions
│   └── SingleCoursePageComponents
│   └── 2024
└── hooks                             # Reusable API Calls
└── pages                             # Full Application Pages Which App.js navigation links to
└── redux                             # Application State Storage
│   └── reducers
└── styles                            # CSS styling
└── utils                             # API utils
```

## Interacting With the Database
```
Database <- apiUtil <- Hooks -> Redux
                             -> Pages
```

- apiUtil: Interacts with the database
  - **_Input:_** Takes the api call type (CRUD), the endpoint/route for the api, reactOpts, any body, and any params
  - **_Ouput:_** CRUD response
- Hooks: Handles calls to apiUtil and updates the application state
  - **_Input:_** Takes no input other than url parameters
  - **_Ouput:_** Formated responses from the api, error states, messages, and loading states. Also dispatches any new info to the Redux
