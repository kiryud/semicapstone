#!/usr/bin/env node

import { performance } from "node:perf_hooks";

const DEFAULTS = Object.freeze({
  apiBaseUrl: process.env.API_BASE_URL ?? "http://127.0.0.1:5026",
  deviceId: "chamber_1",
  count: 50,
  intervalMs: 500,
  dryRun: false,
});

// 대시보드의 NORMAL 판정 범위 안에서 생성한다.
const RANGES = Object.freeze({
  co2: [650, 950],
  temperature: [21.5, 24.5],
  humidity: [50, 60],
  pm1_0: [10, 30],
  pm2_5: [12, 35],
  pm10: [15, 45],
  voc: [0, 10],
  fan_voltage: [4.98, 5.08],
  fan_current_mA: [40, 48],
});

function printHelp() {
  console.log(`사용법:
  node scripts/insert-random-sensor-data.mjs [옵션]

옵션:
  --count <횟수>          저장 횟수 (기본값: 50)
  --interval-ms <ms>      저장 간격 (기본값: 500)
  --device-id <id>        장치 ID (기본값: chamber_1)
  --api-base-url <url>    백엔드 주소 (기본값: http://127.0.0.1:5026)
  --dry-run               DB에 저장하지 않고 생성값만 출력
  --help                  도움말 출력`);
}

function parsePositiveInteger(value, optionName) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${optionName}은(는) 1 이상의 정수여야 합니다.`);
  }
  return parsed;
}

function parseArguments(argv) {
  const options = { ...DEFAULTS };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const nextValue = () => {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`${argument} 옵션의 값이 필요합니다.`);
      }
      index += 1;
      return value;
    };

    switch (argument) {
      case "--count":
        options.count = parsePositiveInteger(nextValue(), argument);
        break;
      case "--interval-ms":
        options.intervalMs = parsePositiveInteger(nextValue(), argument);
        break;
      case "--device-id":
        options.deviceId = nextValue();
        break;
      case "--api-base-url":
        options.apiBaseUrl = nextValue();
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--help":
        printHelp();
        process.exit(0);
        break;
      default:
        throw new Error(`알 수 없는 옵션입니다: ${argument}`);
    }
  }

  options.apiBaseUrl = options.apiBaseUrl.replace(/\/$/, "");
  return options;
}

function randomInteger([minimum, maximum]) {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

function randomDecimal([minimum, maximum], digits) {
  const value = minimum + Math.random() * (maximum - minimum);
  return Number(value.toFixed(digits));
}

function getAirQualityState(co2, pm2_5) {
  if (co2 >= 1500 || pm2_5 > 75) return "DANGER";
  if (co2 >= 1000 || pm2_5 > 35) return "CAUTION";
  return "NORMAL";
}

function createReading(deviceId, sequence) {
  const co2 = randomInteger(RANGES.co2);
  const pm2_5 = randomInteger(RANGES.pm2_5);
  const state = getAirQualityState(co2, pm2_5);
  const fanSpeed = { NORMAL: 40, CAUTION: 70, DANGER: 100 }[state];
  const fanVoltage = randomDecimal(RANGES.fan_voltage, 3);
  const fanCurrent = randomDecimal(RANGES.fan_current_mA, 1);
  const measuredAt = new Date().toISOString();

  return {
    device_id: deviceId,
    sequence,
    state,
    co2,
    temperature: randomDecimal(RANGES.temperature, 1),
    humidity: randomDecimal(RANGES.humidity, 1),
    pm1_0: randomInteger(RANGES.pm1_0),
    pm2_5,
    pm10: randomInteger(RANGES.pm10),
    voc: randomInteger(RANGES.voc),
    fan_speed: fanSpeed,
    fan_voltage: fanVoltage,
    fan_current_mA: fanCurrent,
    fan_power_W: Number(((fanVoltage * fanCurrent) / 1000).toFixed(3)),
    measured_at: measuredAt,
    received_at: measuredAt,
  };
}

async function requestJson(url, options) {
  let response;

  try {
    response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(5000),
    });
  } catch (error) {
    throw new Error(`백엔드에 연결할 수 없습니다: ${error.message}`);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HTTP ${response.status}: ${body || response.statusText}`);
  }

  const body = await response.text();
  return body ? JSON.parse(body) : null;
}

async function getLatestSequence(options) {
  const query = new URLSearchParams({ device_id: options.deviceId });
  const latest = await requestJson(
    `${options.apiBaseUrl}/api/dashboard?${query}`,
  );
  return Number(latest?.sequence ?? 0);
}

async function insertReading(options, reading) {
  await requestJson(`${options.apiBaseUrl}/api/sensor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reading),
  });
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const latestSequence = await getLatestSequence(options);
  const startedAt = performance.now();

  console.log(
    `${options.intervalMs}ms 간격으로 ${options.count}건을 ${
      options.dryRun ? "생성" : "저장"
    }합니다. 시작 시퀀스: ${latestSequence + 1}`,
  );

  for (let index = 0; index < options.count; index += 1) {
    if (index > 0) {
      const targetTime = startedAt + index * options.intervalMs;
      await wait(Math.max(0, targetTime - performance.now()));
    }

    const reading = createReading(
      options.deviceId,
      latestSequence + index + 1,
    );

    if (!options.dryRun) {
      await insertReading(options, reading);
    }

    console.log(
      `[${index + 1}/${options.count}] sequence=${reading.sequence} ` +
        `co2=${reading.co2} pm2_5=${reading.pm2_5} ` +
        `temperature=${reading.temperature} measured_at=${reading.measured_at}`,
    );
  }

  console.log(
    `${options.dryRun ? "생성" : "저장"} 완료: ${options.count}건`,
  );
}

main().catch((error) => {
  console.error(`실행 실패: ${error.message}`);
  process.exitCode = 1;
});
