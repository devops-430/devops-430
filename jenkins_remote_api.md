### Trigger remote build

curl -X POST "https://openlabfreeci.servebeer.com/job/hello-world/build?token=11c4191056b74d9b50d47e6f3149de2daf" \
  -u your-username:your-api-token \
  -H "$(curl -s -u your-username:your-api-token https://openlabfreeci.servebeer.com/crumbIssuer/api/json | jq -r '"\(.crumbRequestField): \(.crumb)"')"

### Shell Script  to Trigger Jenkins Job with Parameters
```bash
#!/bin/bash

JENKINS_URL="https://openlabfreeci.servebeer.com"
USER="admin"
API_TOKEN="11c4191056b74d9b50d47e6f3149de2daf"
JOB_NAME="hello-world"
PARAMS="param1=value1&param2=value2"  # <-- Replace with your actual parameters

# Get crumb
CRUMB_JSON=$(curl -s -u "$USER:$API_TOKEN" "$JENKINS_URL/crumbIssuer/api/json")
CRUMB=$(echo "$CRUMB_JSON" | grep -oP '"crumb"\s*:\s*"\K[^"]+')
CRUMB_FIELD=$(echo "$CRUMB_JSON" | grep -oP '"crumbRequestField"\s*:\s*"\K[^"]+')

# Trigger build with parameters
curl -X POST "$JENKINS_URL/job/$JOB_NAME/buildWithParameters?token=$API_TOKEN&$PARAMS" \
     -u "$USER:$API_TOKEN" \
     -H "$CRUMB_FIELD: $CRUMB"
```
### Build with parameters
```bash
 curl -X POST \
  -u admin:11c4191056b74d9b50d47e6f3149de2daf \
  -H "$CRUMB" \
  -d "ENVIRONMENT=prod" \
  https://openlabfreeci.servebeer.com/job/hello-world/buildWithParameters
  ```

Multiple parameter
```bash
CRUMB=$(curl -s -u your-username:your-api-token https://openlabfreeci.servebeer.com/crumbIssuer/api/xml?xpath=concat\(//crumbRequestField,%22:%22,//crumb\))

curl -X POST \
  -u your-username:your-api-token \
  -H "$CRUMB" \
  -d "ENVIRONMENT=dev" \
  -d "REGION=us-east" \
  -d "VERSION=1.2.3" \
  https://openlabfreeci.servebeer.com/job/hello-world/buildWithParameters

```
### Simple URL method (if CSRF protection is disabled)
```bash
curl -X POST "https://openlabfreeci.servebeer.com/job/hello-world/buildWithParameters?token=your-api-token&ENVIRONMENT=dev&REGION=us-east&VERSION=1.2.3"
```
