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
const core = __importStar(require("@actions/core"));
const cli_1 = require("./cli");
const options = __importStar(require("./options"));
const process = __importStar(require("process"));
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cli = cli_1.getCLI();
        // Validate options first so we can fail early.
        options.checkEnvironmentVariables();
        const environment = options.getEnvironment();
        const sourcemaps = options.getSourcemaps();
        const dist = options.getDist();
        const shouldFinalize = options.getBooleanOption('finalize', true);
        const ignoreMissing = options.getBooleanOption('ignore_missing', false);
        const ignoreEmpty = options.getBooleanOption('ignore_empty', false);
        const deployStartedAtOption = options.getStartedAt();
        const setCommitsOption = options.getSetCommitsOption();
        const projects = options.getProjects();
        const urlPrefix = options.getUrlPrefixOption();
        const stripCommonPrefix = options.getBooleanOption('strip_common_prefix', false);
        const version = yield options.getVersion();
        const workingDirectory = options.getWorkingDirectory();
        core.debug(`Version is ${version}`);
        yield cli.new(version, { projects });
        const currentWorkingDirectory = process.cwd();
        if (workingDirectory !== null && workingDirectory.length > 0) {
            process.chdir(workingDirectory);
        }
        if (setCommitsOption !== 'skip') {
            core.debug(`Setting commits with option '${setCommitsOption}'`);
            yield cli.setCommits(version, {
                auto: true,
                ignoreMissing,
                ignoreEmpty,
            });
        }
        if (sourcemaps.length) {
            core.debug(`Adding sourcemaps`);
            yield Promise.all(projects.map((project) => __awaiter(void 0, void 0, void 0, function* () {
                // upload source maps can only do one project at a time
                const localProjects = [project];
                const sourceMapOptions = {
                    include: sourcemaps,
                    projects: localProjects,
                    dist,
                    urlPrefix,
                    stripCommonPrefix,
                };
                return cli.uploadSourceMaps(version, sourceMapOptions);
            })));
        }
        if (environment) {
            core.debug(`Adding deploy to release`);
            yield cli.newDeploy(version, Object.assign({ env: environment }, (deployStartedAtOption && { started: deployStartedAtOption })));
        }
        core.debug(`Finalizing the release`);
        if (shouldFinalize) {
            yield cli.finalize(version);
        }
        if (workingDirectory !== null && workingDirectory.length > 0) {
            process.chdir(currentWorkingDirectory);
        }
        core.debug(`Done`);
        core.setOutput('version', version);
    }
    catch (error) {
        core.setFailed(error.message);
    }
}))();
