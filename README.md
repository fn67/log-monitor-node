# Log Monitor

A Node.js application that monitors job execution times from CSV log files and generates alerts for long-running processes.

## Features

- Parse CSV log files with START/END job entries
- Track job durations by matching PIDs
- Generate warnings for jobs > 5 minutes (yellow)
- Generate errors for jobs > 10 minutes (red)


## Requirements

- Node.js

## Usage

```bash
# Run the application
node logMonitor.js

# Or use npm script
npm start