#!/usr/bin/env node
import { MeasurementSender, SensorKeyRejectedError } from './src/MeasurementSender.mjs';
import { HELP_TEXT, OptionsError, readOptions } from './src/commandLineOptions.mjs';
import { runHistoryMode, runLiveMode } from './src/sendingModes.mjs';

const EXIT_CODE_FAILURE = 1;
const EXIT_CODE_INVALID_OPTIONS = 2;

function readOptionsOrExit() {
  try {
    const options = readOptions();
    if (!options) {
      console.log(HELP_TEXT);
      process.exit(0);
    }
    return options;
  } catch (error) {
    if (!(error instanceof OptionsError)) throw error;
    console.error(`Error: ${error.message}`);
    console.error('Run with --help to see the available options.');
    process.exit(EXIT_CODE_INVALID_OPTIONS);
  }
}

const options = readOptionsOrExit();
const sender = new MeasurementSender(options);

process.on('SIGINT', () => {
  sender.printSummary();
  process.exit(0);
});

try {
  const runMode = options.mode === 'history' ? runHistoryMode : runLiveMode;
  await runMode(options, sender);
  sender.printSummary();
  process.exit(sender.stats.failed ? EXIT_CODE_FAILURE : 0);
} catch (error) {
  console.error(error instanceof SensorKeyRejectedError ? error.message : `Error: ${error.message}`);
  if (error instanceof SensorKeyRejectedError) sender.printSummary();
  process.exit(EXIT_CODE_FAILURE);
}
