/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as matches from "../matches.js";
import type * as media from "../media.js";
import type * as pbRegistration from "../pbRegistration.js";
import type * as settings from "../settings.js";
import type * as sports_badminton from "../sports/badminton.js";
import type * as sports_basketball from "../sports/basketball.js";
import type * as sports_futsal from "../sports/futsal.js";
import type * as sports_registry from "../sports/registry.js";
import type * as sports_soccer from "../sports/soccer.js";
import type * as sports_tennis from "../sports/tennis.js";
import type * as sports_types from "../sports/types.js";
import type * as sports_volleyball from "../sports/volleyball.js";
import type * as utils from "../utils.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  crons: typeof crons;
  matches: typeof matches;
  media: typeof media;
  pbRegistration: typeof pbRegistration;
  settings: typeof settings;
  "sports/badminton": typeof sports_badminton;
  "sports/basketball": typeof sports_basketball;
  "sports/futsal": typeof sports_futsal;
  "sports/registry": typeof sports_registry;
  "sports/soccer": typeof sports_soccer;
  "sports/tennis": typeof sports_tennis;
  "sports/types": typeof sports_types;
  "sports/volleyball": typeof sports_volleyball;
  utils: typeof utils;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
