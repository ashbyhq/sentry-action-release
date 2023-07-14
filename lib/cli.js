"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCLI = void 0;
const cli_1 = __importDefault(require("@sentry/cli"));
// @ts-ignore
const package_json_1 = require("../package.json");
/**
 * CLI Singleton
 *
 * When the `MOCK` environment variable is set, stub out network calls.
 */
let cli;
exports.getCLI = () => {
    // Set the User-Agent string.
    process.env['SENTRY_PIPELINE'] = `github-action-release/${package_json_1.version}`;
    if (!cli) {
        cli = new cli_1.default().releases;
        if (process.env['MOCK']) {
            // Set environment variables if they aren't already
            for (const variable of [
                'SENTRY_AUTH_TOKEN',
                'SENTRY_ORG',
                'SENTRY_PROJECT',
            ])
                !(variable in process.env) && (process.env[variable] = variable);
            cli.execute = (args, 
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            live) => __awaiter(void 0, void 0, void 0, function* () {
                return Promise.resolve(args.join(' '));
            });
        }
    }
    return cli;
};
