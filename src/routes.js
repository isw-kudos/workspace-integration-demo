import { Router } from 'express';

const router = new Router();

//index
router.route('/').get((req, res) => res.render('index'));

//any other route
router.use((req, res) =>
  res.render('error', { error: { status: 404, statusText: 'Not Found' } })
);

export default router;
