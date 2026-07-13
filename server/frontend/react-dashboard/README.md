# 공기질 모니터링 대시보드

단일 챔버의 센서값, 공기질 상태, 자동 환기 팬, 차트, 최근 활동과 환기 효과를 보여주는 React 대시보드입니다. 로그인은 항상 C# 백엔드를 사용하며, 대시보드 데이터는 Mock 또는 실제 API로 전환할 수 있습니다.

<a id="목차"></a>

## 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [실행 방법](#실행-방법)
- [폴더 구조](#폴더-구조)
- [데이터 흐름](#데이터-흐름)
- [백엔드 연동](#백엔드-연동)
- [API 계약](#api-계약)
- [백엔드 입장에서 우선으로 봐야할 파일](#백엔드-입장에서-우선으로-봐야할-파일)
- [백엔드 입장에서 우선으로 보지 않아도 되는 파일](#백엔드-입장에서-우선으로-보지-않아도-되는-파일)
- [공기질 판정 규칙](#공기질-판정-규칙)
- [검증 명령어](#검증-명령어)
- [현재 제약 사항](#현재-제약-사항)

<a id="주요-기능"></a>

## 주요 기능

- 로그인 성공 모달, `sessionStorage` 기반 보호 라우트와 로그아웃
- CO2, PM2.5, 온도, 습도, PM1.0, PM10, VOC 및 팬 운전 정보
- NORMAL·CAUTION·DANGER 상태와 자동 팬 속도 표시
- 최근 1분·10분·1시간 Chart.js 차트, 확대·이동·수동 일시정지
- 현재 표시 범위의 CSV 내보내기
- 최근 1시간 요약, 상태 변경·경고 통합 활동, 환기 효과 분석
- Mock 시나리오와 실제 API Provider 전환
- 모바일·태블릿·데스크톱 반응형 UI

<a id="기술-스택"></a>

## 기술 스택

| 기술                      | 용도                            |
| ------------------------- | ------------------------------- |
| React JavaScript, Vite    | UI와 개발·빌드 환경             |
| Tailwind CSS              | 반응형 스타일                   |
| react-router-dom          | 로그인·대시보드 라우팅          |
| TanStack Query            | API 조회, 캐시와 재시도         |
| Chart.js, react-chartjs-2 | 실시간·구간 차트                |
| annotation, zoom plugin   | 임계선, 확대와 이동             |
| Vitest                    | 유틸리티·정규화·컴포넌트 테스트 |
| npm                       | 패키지와 스크립트 관리          |

주요 라이브러리 설명 추가:

- **TanStack Query**: API 요청 결과의 캐시, 주기적 재조회, 로딩·오류 상태와 재시도를 관리합니다. API 경로나 응답 형식을 정의하는 라이브러리는 아니며, 실제 요청 코드는 `src/api/`, 조회 주기와 fallback은 `src/hooks/`에서 확인할 수 있습니다.
- **chartjs-plugin-annotation**: Chart.js에 기준선과 영역을 추가하는 플러그인입니다. 현재 CO2·PM2.5의 주의·위험 임계선을 표시하며 백엔드 API에는 영향을 주지 않습니다.
- **chartjs-plugin-zoom**: Chart.js에 마우스 휠·핀치 확대와 드래그 이동을 추가하는 플러그인입니다. 화면에 표시하거나 CSV로 내보낼 시간 범위를 선택하는 데 사용하며 백엔드 응답 구조를 변경하지 않습니다.

TypeScript는 사용하지 않습니다.

<a id="실행-방법"></a>

## 실행 방법

```bash
cd server/frontend/react-dashboard
npm install
cp .env.example .env
npm run dev
```

기본 프론트엔드 주소는 `http://localhost:5173`입니다. Mock 모드에서도 로그인은 실제 백엔드의 `POST /api/login`을 호출합니다.

```env
VITE_API_BASE_URL=http://localhost:5026
VITE_USE_MOCK=true
VITE_MOCK_SCENARIO=cycle
```

- `VITE_API_BASE_URL`: C# 백엔드 Origin. 경로(`/api`)는 붙이지 않습니다.
- `VITE_USE_MOCK`: `true`이면 Mock, `false`이면 실제 대시보드 API를 사용합니다.
- `VITE_MOCK_SCENARIO`: `normal`, `caution`, `danger`, `cycle`, `demo-cycle`, `stale`, `network-error`, `data-gap`, `sensor-error`, `fan-error` 중 하나입니다. 실제 API 모드에서는 무시됩니다.
- 환경 변수를 변경하면 Vite 개발 서버를 다시 시작해야 합니다.

<a id="폴더-구조"></a>

## 폴더 구조

```text
react-dashboard/
├── .env.example             환경 변수 예시
├── package.json             의존성과 실행 명령
├── vite.config.js           Vite·Vitest 설정
└── src/
    ├── api/                 HTTP 요청과 API 경로
    ├── providers/           Mock/API 선택과 기능 지원 여부
    ├── utils/               응답 정규화, 판정, 통계, CSV, 저장소
    ├── models/              UI가 사용하는 공통 평탄 모델
    ├── mocks/               가상 센서와 Mock Store
    ├── hooks/               TanStack Query와 Dashboard ViewModel
    ├── charts/              Chart.js 데이터·옵션 설정
    ├── components/          공통·대시보드·차트 UI
    ├── pages/               LoginPage, DashboardPage
    ├── routes/              보호·공개 전용 라우트
    ├── App.jsx              라우트 구성
    └── main.jsx             앱 진입점
```

같은 폴더의 `*.test.js`, `*.test.jsx`는 소스 파일과 짝을 이루는 자동 테스트입니다. 운영 코드나 API가 아니며 프로덕션 번들에 포함되지 않습니다.

<a id="데이터-흐름"></a>

## 데이터 흐름

```text
백엔드 또는 Mock → API/Provider → 정규화된 평탄 모델
                  → TanStack Query/ViewModel → UI
```

UI는 백엔드 원본 JSON을 직접 사용하지 않습니다. 응답 구조가 달라지면 컴포넌트가 아니라 `src/utils/normalize*.js`에서 변환해야 합니다. 최신 대시보드는 권장 평탄 응답과 기존 `chartValues.data` 중첩 응답을 모두 지원합니다.

<a id="백엔드-연동"></a>

## 백엔드 연동

### 로그인과 최신값만 연결

`.env`를 아래처럼 바꾸고 Vite를 재시작합니다.

```env
VITE_API_BASE_URL=http://localhost:5026
VITE_USE_MOCK=false
```

이 경우 `POST /api/login`, `GET /api/dashboard`는 실제 서버를 사용합니다. 차트·요약·상태 이벤트는 브라우저에 누적한 최신값으로 계산되며 최대 60개 포인트만 유지됩니다. 경고는 표시되지 않고 새로고침하면 브라우저 이력이 초기화됩니다.

### 전체 기능 연결

백엔드가 선택 API를 구현한 뒤 `src/providers/apiDashboardProvider.js`에서 구현된 항목만 `true`로 변경합니다.

```js
capabilities: {
  history: true,
  summary: true,
  events: true,
  alerts: true,
}
```

| capability | 호출 API                 | 비활성화 시                  |
| ---------- | ------------------------ | ---------------------------- |
| `history`  | `/api/dashboard/history` | 최근 최신값을 최대 60개 누적 |
| `summary`  | `/api/dashboard/summary` | 브라우저 이력으로 계산       |
| `events`   | `/api/dashboard/events`  | 브라우저 이력에서 추정       |
| `alerts`   | `/api/alerts`            | 경고를 표시하지 않음         |

구현되지 않은 API의 capability는 반드시 `false`로 둡니다. 환경 변수와 capability를 바꾼 뒤 Network 탭에서 선택한 요청의 HTTP 200, CORS, 갱신 시각을 확인합니다.

<a id="api-계약"></a>

## API 계약

| 메서드·경로                                                        | 용도               |     조회 주기 |
| ------------------------------------------------------------------ | ------------------ | ------------: |
| `POST /api/login`                                                  | 로그인             | 로그인 시 1회 |
| `GET /api/dashboard?device_id=chamber_1`                           | 최신 센서값        |           1초 |
| `GET /api/dashboard/history?device_id=chamber_1&range=1m\|10m\|1h` | 차트·CSV·환기 분석 |           1초 |
| `GET /api/dashboard/summary?device_id=chamber_1&range=1h`          | 최근 1시간 요약    |           1초 |
| `GET /api/dashboard/events?device_id=chamber_1&limit=20`           | 상태 변경          |           1초 |
| `GET /api/alerts?device_id=chamber_1&limit=10`                     | 장치 경고          |           5초 |

로그인 요청과 성공 응답:

```json
{
  "id": "admin",
  "password": "admin"
}
```

```json
{
  "message": "로그인 성공! 환영합니다.",
  "token": "서버가 생성한 토큰"
}
```

토큰은 `sessionStorage.access_token`에 저장하고 로그아웃 시 삭제합니다. 현재 계약상 대시보드 요청에는 `Authorization` 헤더를 보내지 않습니다.

권장 최신 대시보드 응답:

```json
{
  "device_id": "chamber_1",
  "sequence": 15280,
  "state": "CAUTION",
  "co2": 1120,
  "temperature": 23.7,
  "humidity": 65,
  "pm1_0": 18,
  "pm2_5": 42,
  "pm10": 55,
  "voc": 0,
  "fan_speed": 70,
  "fan_voltage": 5.02,
  "fan_current_mA": 90,
  "fan_power_W": 0.452,
  "measured_at": "2026-07-13T12:30:14.800Z",
  "received_at": "2026-07-13T12:30:15.020Z"
}
```

선택 API의 핵심 응답 형태:

이력:

```json
{
  "device_id": "chamber_1",
  "range": "10m",
  "total_points": 120,
  "resolution_seconds": 5,
  "data": [
    {
      "device_id": "chamber_1",
      "sequence": 15280,
      "state": "CAUTION",
      "co2": 1120,
      "pm2_5": 42,
      "fan_speed": 70,
      "measured_at": "2026-07-13T12:30:14.800Z",
      "received_at": "2026-07-13T12:30:15.020Z"
    }
  ]
}
```

요약:

```json
{
  "co2": {
    "average": 910,
    "delta": -120,
    "trend": "DOWN"
  },
  "pm2_5": {
    "average": 31.5,
    "delta": -18,
    "trend": "DOWN"
  },
  "current_state_duration_seconds": 420,
  "fan_energy_Wh": 0.38
}
```

이벤트:

```json
{
  "data": [
    {
      "event_id": "event-152",
      "device_id": "chamber_1",
      "from_state": "CAUTION",
      "to_state": "DANGER",
      "reason_message": "CO2가 위험 기준을 초과했습니다.",
      "co2": 1520,
      "pm2_5": 34,
      "started_at": "2026-07-13T12:24:10.000Z"
    }
  ]
}
```

경고:

```json
{
  "data": [
    {
      "alert_id": "alert-87",
      "related_event_id": "event-152",
      "device_id": "chamber_1",
      "severity": "DANGER",
      "type": "AIR_QUALITY_DANGER",
      "message": "CO2가 위험 기준을 초과했습니다.",
      "created_at": "2026-07-13T12:24:10.000Z",
      "acknowledged": false
    }
  ]
}
```

이력의 10분·1시간 버킷은 평균값과 선택적인 `co2_range`, `pm2_5_range`, `fan_current_mA_range` 최소·최대 배열을 사용할 수 있습니다. 권장 해상도는 1분 1초, 10분 5초, 1시간 30초입니다.

백엔드는 다음도 보장해야 합니다.

- 개발 Origin `http://localhost:5173`에 대한 CORS 허용
- 성공·실패 응답의 JSON 형식과 오류 시 `{ "message", "errorCode" }` 권장
- `measured_at`, `received_at`, 이벤트 시각을 UTC ISO 8601로 반환
- 데이터 없음은 HTTP 404, 서버 오류는 HTTP 500 이상으로 구분
- `device_id` 쿼리를 처리하고 센서 숫자를 가능하면 JSON number로 반환

<a id="백엔드-입장에서-우선으로-봐야할-파일"></a>

## 백엔드 입장에서 우선으로 봐야할 파일

| 우선순위 | 파일                                    | 확인할 내용                                |
| -------: | --------------------------------------- | ------------------------------------------ |
|        1 | `.env`, `.env.example`                  | 백엔드 주소와 Mock/API 모드                |
|        2 | `src/providers/apiDashboardProvider.js` | 구현된 선택 API capability 활성화          |
|        3 | `src/api/*.js`                          | 실제 경로, 쿼리, HTTP 요청 방식            |
|        4 | `src/utils/normalize*.js`               | 서버 응답을 프론트 공통 모델로 바꾸는 규칙 |
|        5 | `src/models/dashboardModels.js`         | 최신값·이벤트·경고의 내부 필드             |
|        6 | 브라우저 Network 탭                     | CORS, 상태 코드, 실제 JSON과 호출 주기     |

백엔드 응답 필드가 바뀌면 먼저 정규화 계층과 계약을 맞추고 관련 테스트를 갱신해야 합니다. 카드 JSX나 차트 옵션을 API 형식에 맞춰 직접 수정하면 안 됩니다.

<a id="백엔드-입장에서-우선으로-보지-않아도-되는-파일"></a>

## 백엔드 입장에서 우선으로 보지 않아도 되는 파일

- `*.test.js`, `*.test.jsx`: 프론트 자동 테스트입니다. API 구현 검토에는 필요 없지만 회귀 방지용이므로 삭제하지 않습니다.
- `src/components/`, `src/pages/`, `src/index.css`: 화면 배치와 스타일입니다.
- `src/charts/`: Chart.js 표시 옵션입니다. 이력 데이터 형태를 협의할 때만 참고합니다.
- `src/mocks/`: 실제 백엔드와 분리된 프론트 개발용 가상 데이터입니다. API 계약 예시로 간주하지 않습니다.
- `dist/`, `node_modules/`: 빌드 결과와 설치 패키지이므로 검토·수정 대상이 아닙니다.
- `server/backend/test`, `server/frontend/test`: 참고 전용 디렉터리이며 이 프로젝트 작업에서 수정하지 않습니다.

<a id="공기질-판정-규칙"></a>

## 공기질 판정 규칙

위험도가 높은 조건부터 판정합니다.

| 상태    | 조건                                            | 팬 속도 |
| ------- | ----------------------------------------------- | ------: |
| DANGER  | `CO2 >= 1500` 또는 `PM2.5 > 75`                 |    100% |
| CAUTION | DANGER가 아니며 `CO2 >= 1000` 또는 `PM2.5 > 35` |     70% |
| NORMAL  | 나머지                                          |     40% |

상태나 팬 속도가 없는 응답은 프론트가 이 규칙으로 보완합니다. 백엔드도 같은 경계값을 사용해야 화면과 서버 판정이 어긋나지 않습니다.

<a id="검증-명령어"></a>

## 검증 명령어

```bash
npm run lint
npm test
npm run build
```

테스트는 공기질 경계, 평탄·중첩 응답 정규화, sessionStorage, Provider fallback, 차트·CSV, Mock Store, 최근 활동과 환기 분석을 검증합니다.

<a id="현재-제약-사항"></a>

## 현재 제약 사항

- 기본 장치는 `chamber_1`이며 다중 장치 선택 기능은 없습니다.
- API 모드에서 이력 capability가 꺼져 있으면 브라우저 메모리의 최근 60개만 사용하고 새로고침 시 사라집니다.
- 인증 토큰의 만료·갱신·서명 검증과 대시보드 Authorization 헤더는 현재 계약에 없습니다.
- 환기 효과는 팬 운전 구간과 오염도 변화를 함께 보여주는 관찰 지표이며 인과관계를 증명하지 않습니다.
- 운영 환경에서는 1초 폴링 부하를 검토하고 필요하면 통합 API, SSE 또는 WebSocket으로 변경해야 합니다.
