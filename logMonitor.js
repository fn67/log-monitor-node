const fs = require("fs");

let activeJobs = new Map();

const WARNING_THRESHOLD = 5 * 60; // 5 minutes
const ERROR_THRESHOLD = 10 * 60; // 10 minutes

// parse time string to seconds
function parseTime(timeString) {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remaininSeconds = Math.floor(seconds % 60);
  return `${minutes}m ${remaininSeconds}s`;
}

// parse a log line
function parseLogLine(line) {
  const parts = line.split(",");
  if (parts.length !== 4) return null;

  return {
    timestamp: parts[0].trim(),
    jobDescription: parts[1].trim(),
    action: parts[2].trim(),
    pid: parts[3].trim(),
  };
}

// check if job duration exceeds thresholds and print
function checkThresholds(job) {
  if (job.duration > ERROR_THRESHOLD) {
    const msg = `\x1b[31mERROR\x1b[0m: ${job.jobDescription} (PID: ${job.pid}) took ${job.durationFormatted} (> 10 minutes)`;
    console.error(msg);
  } else if (job.duration > WARNING_THRESHOLD) {
    const msg = `\x1b[33mWARNING\x1b[0m: ${job.jobDescription} (PID: ${job.pid}) took ${job.durationFormatted} (> 5 minutes)`;
    console.warn(msg);
  }
}

// process a single log
function processLogEntry(entry) {
  const timestampMs = parseTime(entry.timestamp);

  if (entry.action === "START") {
    activeJobs.set(entry.pid, {
      jobDescription: entry.jobDescription,
      startTime: timestampMs,
      startTimestamp: entry.timestamp,
      pid: entry.pid,
    });
  } else if (entry.action === "END") {
    const startedJob = activeJobs.get(entry.pid);

    if (!startedJob) {
      console.warn(`END entry found for PID ${entry.pid} without START`);
      return;
    }

    const duration = timestampMs - startedJob.startTime;
    const completedJob = {
      ...startedJob,
      endTime: timestampMs,
      endTimestamp: entry.timestamp,
      duration: duration,
      durationFormatted: formatDuration(duration),
    };
    checkThresholds(completedJob);
  }
}

function processLogFile(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const lines = fileContent.split("\n").filter((line) => line.trim() !== "");
  console.log(`Processing ${lines.length} log entries...`);

  lines.forEach((line) => {
    const entry = parseLogLine(line);
    if (entry) {
      processLogEntry(entry);
    }
  });
}

processLogFile("logs.log");
