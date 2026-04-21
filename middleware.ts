import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match everything except static files, api routes, dashboard and admin panels
  matcher: ["/((?!api|_next|_vercel|dashboard|admin|.*\\..*).*)"],
};
