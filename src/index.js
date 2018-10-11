import express from 'express';
import http from 'http';
import mustacheExpress from 'mustache-express';
import bodyParser from 'body-parser';

import config from './config';
import routes from './routes';

const app = express();
app.server = http.createServer(app);

//serve favicon
app.use(express.static('public'));

//for form data
app.use(bodyParser.urlencoded({ extended: true }));

//parse json body but also keep rawbody for webhooks
app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

//template engine
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');

//register the routes
app.use(routes);

//start the app
app.server.listen(config.port, error => {
  if (!error) {
    console.info(`server started on port ${config.port}`);
  }
});
