"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkingDirectory = exports.getUrlPrefixOption = exports.getProjects = exports.checkEnvironmentVariables = exports.getSetCommitsOption = exports.getBooleanOption = exports.getDist = exports.getSourcemaps = exports.getStartedAt = exports.getEnvironment = exports.getVersion = void 0;
const core = __importStar(require("@actions/core"));
const cli_1 = require("./cli");
/**
 * Get the release version string from parameter or propose one.
 * @throws
 * @returns Promise<string>
 */
exports.getVersion = () => __awaiter(void 0, void 0, void 0, function* () {
    const versionOption = core.getInput('version');
    const versionPrefixOption = core.getInput('version_prefix');
    let version = '';
    if (versionOption) {
        // If the users passes in `${{github.ref}}, then it will have an unwanted prefix.
        version = versionOption.replace(/^(refs\/tags\/)/, '');
    }
    else {
        core.debug('Version not provided, proposing one...');
        version = yield cli_1.getCLI().proposeVersion();
    }
    if (versionPrefixOption) {
        version = `${versionPrefixOption}${version}`;
    }
    return version;
});
/**
 * Get `environment`, a required parameter.
 * @throws
 * @returns string
 */
exports.getEnvironment = () => {
    return core.getInput('environment');
};
/**
 * Optionally get a UNIX timestamp of when the deployment started.
 * Input timestamp may also be ISO 8601.
 *
 * @throws
 * @returns number
 */
exports.getStartedAt = () => {
    const startedAtOption = core.getInput('started_at');
    if (!startedAtOption) {
        return null;
    }
    // In sentry-cli, we parse integer first.
    const isStartedAtAnInteger = /^-?[\d]+$/.test(startedAtOption);
    const startedAtTimestamp = parseInt(startedAtOption);
    const startedAt8601 = Math.floor(Date.parse(startedAtOption) / 1000);
    let outputTimestamp;
    if (isStartedAtAnInteger && !isNaN(startedAtTimestamp)) {
        outputTimestamp = startedAtTimestamp;
    }
    else if (!isNaN(startedAt8601)) {
        outputTimestamp = startedAt8601;
    }
    if (!outputTimestamp || outputTimestamp < 0) {
        throw new Error('started_at not in valid format. Unix timestamp or ISO 8601 date expected');
    }
    return outputTimestamp;
};
/**
 * Source maps are optional, but there may be several as a space-separated list.
 * @returns string[]
 */
exports.getSourcemaps = () => {
    const sourcemapsOption = core.getInput('sourcemaps');
    if (!sourcemapsOption) {
        return [];
    }
    return sourcemapsOption.split(' ');
};
/**
 * Dist is optional, but should be a string when provided.
 * @returns string
 */
exports.getDist = () => {
    const distOption = core.getInput('dist');
    if (!distOption) {
        return undefined;
    }
    return distOption;
};
/**
 * Fetch boolean option from input. Throws error if option value is not a boolean.
 * @param input string
 * @param defaultValue boolean
 * @returns boolean
 */
exports.getBooleanOption = (input, defaultValue) => {
    const option = core.getInput(input);
    if (!option) {
        return defaultValue;
    }
    const value = option.trim().toLowerCase();
    switch (value) {
        case 'true':
        case '1':
            return true;
        case 'false':
        case '0':
            return false;
    }
    throw Error(`${input} is not a boolean`);
};
exports.getSetCommitsOption = () => {
    let setCommitOption = core.getInput('set_commits');
    // default to auto
    if (!setCommitOption) {
        return 'auto';
    }
    // convert to lower case
    setCommitOption = setCommitOption.toLowerCase();
    switch (setCommitOption) {
        case 'auto':
            return 'auto';
        case 'skip':
            return 'skip';
        default:
            throw Error('set_commits must be "auto" or "skip"');
    }
};
/**
 * Check for required environment variables.
 */
exports.checkEnvironmentVariables = () => {
    if (!process.env['SENTRY_ORG']) {
        throw Error('Environment variable SENTRY_ORG is missing an organization slug');
    }
    if (!process.env['SENTRY_AUTH_TOKEN']) {
        throw Error('Environment variable SENTRY_AUTH_TOKEN is missing an auth token');
    }
};
exports.getProjects = () => {
    const projectsOption = core.getInput('projects') || '';
    const projects = projectsOption
        .split(' ')
        .map(proj => proj.trim())
        .filter(proj => !!proj);
    if (projects.length > 0) {
        return projects;
    }
    const project = process.env['SENTRY_PROJECT'];
    if (!project) {
        throw Error('Environment variable SENTRY_PROJECT is missing a project slug and no projects are specified with the "projects" option');
    }
    return [project];
};
exports.getUrlPrefixOption = () => {
    return core.getInput('url_prefix');
};
exports.getWorkingDirectory = () => {
    return core.getInput('working_directory');
};
