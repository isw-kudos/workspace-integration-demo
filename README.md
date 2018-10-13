## Watson Workspace Integration Examples

This repository contains commit by commit examples of a Hello World Node+express app being integrated with IBM Watson Workspace.

### Integration Points
It covers the following major integration points:

1. Authenticate as an app and use API
    - Get app details
    - Get connected spaces
    - Send a message as an app
    - Send message options - color, title, markdown, actor
2. User Authentication
    - OAuth dance to get access_token
    - Act on behalf of user
3. Listen to events via webhook
    - Webhook verification
    - Message Annotation events
    - Post a Welcome message
4. Slash Commands
5. Respond to Slash commands using targeted messages
6. 2 targeted message types
    - "Annotation" or Single view
    - "Attachments" or Cards view
    - Buttons with payload to make dialogs interactive
7. Other annotations
8. Add message focus manually on a message via API


### Prerequisites
- [Watson Workspace](workspace.ibm.com) with account
- Docker
- [ngrok](ngrok.io) for webhooks (you can also use [serveo](serveo.net))

### Run the app
1. Clone the app and install the npm deps
```
git clone https://github.com/isw-kudos/workspace-integration-examples
cd workspace-integration-examples
npm i
```
2. Create a new app in [Watson Work Services](developer.watsonwork.ibm.com)
3. Register an event listener using the ngrok or open
4. Register `/xkcd` and `/anonymize` actions
5. Create a `.env` file and enter the following details
```
APP_ID=<from step 2>
APP_SECRET=<from step 2>
WEBHOOK_SECRET=<from step 3>
REDIRECT_URI=http://localhost:3000/oauth/redirect
```
6. Run ngrok (or serveo) to start tunnelling web traffic to localhost
```
ngrok http -subdomain=<subdomain> localhost:3000
```
7. Run an instance of [relevant-xkcd](https://github.com/adtac/relevant-xkcd#installation) docker image locally
8. Start the app
```
npm run dev
```
9. Browse the commit history to find changes pertaining to particular integration points
