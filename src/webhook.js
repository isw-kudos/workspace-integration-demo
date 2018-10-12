import crypto from 'crypto';

const webhooks = [];

//hmac encode string with given secret
function hmac(string, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(string)
    .digest('hex');
}

export function handleWebhook(req, res, config, execute) {
  const { webhookSecret, appId } = config;
  const { headers, body, rawBody } = req;
  const { type, ...event } = body;
  const token = headers['x-outbound-token'];

  //check if webhook can be trusted
  //the token must equal the encoded rawBody with secret
  if (!rawBody || !token || token !== hmac(rawBody, webhookSecret)) {
    console.warn('workspace webhook auth failed!');
    return res.status(401).end();
  }

  //save webhook to history
  webhooks.push({
    type,
    received: new Date(),
    body: JSON.stringify(body),
    index: webhooks.length + 1,
  });

  switch (type) {
    //verification event fired when webhook is enabled
    case 'verification': {
      const reply = { response: event.challenge };
      //response header x-outbound-token with encoded "challenge" sent by the request
      return res
        .header('x-outbound-token', hmac(JSON.stringify(reply), webhookSecret))
        .status(200)
        .json(reply);
    }

    case 'space-members-added': {
      const { memberIds, spaceId } = event;
      if (memberIds.indexOf(appId) > -1) execute({ type: 'welcome', spaceId });
      break;
    }

    //event fired for slash commands, moments, focus
    case 'message-annotation-added': {
      const { annotationPayload } = event;
      const annotation = annotationPayload ? JSON.parse(annotationPayload) : {};
      execute({ ...annotation, ...event });
      break;
    }
  }

  //for all events other than verification
  //send 200 response straight away, otherwise we will get duplicate events
  res.status(200).end();
}

export function getWebhookHistory() {
  return webhooks;
}
