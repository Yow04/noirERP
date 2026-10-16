import { app } from "../src/index";

export default (req: Request) => app.fetch(req);
