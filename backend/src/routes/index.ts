import { Router } from "express";
import healthRouter from "./health.js";
import videosRouter from "./videos.js";
import categoriesRouter from "./categories.js";

const router = Router();

router.use(healthRouter);
router.use(videosRouter);
router.use(categoriesRouter);

export default router;
