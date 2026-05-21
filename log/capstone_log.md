# 2026 융합프로젝트(캡스톤디자인)

## Kick-Off

[안내](https://uhs.notion.site/2026-Kick-Off-35ed0220693480b28472ff693853d9bd)

일시 : 2026년 5월 12일 (화) 18:00

4팀 - 조아요조아요반도체가조아요


## 기획

일시 : 2026년 5월 18일 (화) 18:00

### 



## 프로젝트 아키텍처 설계 및 구조 개편

일시 : 2026년 5월 21일 (목)

### 1. MSA(Microservices Architecture) 전환
- 기존 단일 서버 구조에서 기능별 독립 서비스 구조로 전면 개편
- Polyglot 아키텍처 채택: 각 도메인에 최적화된 기술 스택 선정
    - **인증(Auth):** Spring Boot (Kotlin) - 보안 및 트랜잭션 관리
    - **분석(Analysis):** Python (FastAPI) - 데이터 분석 및 통계 알고리즘
    - **웹 프론트:** Node.js - 대시보드 및 정적 파일 서빙
    - **윈도우 앱 지원:** .NET (ASP.NET Core) - WinForm 앱 전용 API

### 2. 인프라 및 환경 설정 자동화
- `docker-compose.yml` 기반의 통합 서비스 오케스트레이션 구축
- Nginx Gateway 도입: 도메인 기반 라우팅 및 CORS 처리 완화
    - `localhost`: 메인 웹 서비스
    - `api.localhost`: 공통 API 엔드포인트
- 중앙 집중식 설정 관리: `.env.template` 및 `.env`를 통한 환경 변수 관리 체계 수립

### 3. 클라이언트 대응 전략 수립
- **3-Way Client Support:** 웹(Web), 모바일 앱(App), 윈도우 폼 앱(WinForm) 동시 대응 구조 설계
- JWT(JSON Web Token) 기반의 통합 인증 체계 확인 및 설계

### 4. 문서화 및 가이드라인 작성
- 신규 아키텍처에 맞춘 `README.md` 전면 수정 및 시각화(Mermaid) 추가
- 개발 환경 구축 가이드 및 설정 방법 기록

---

## 프로젝트 기획안 발표

일시 : 2026년 5월 26일 (화) 18:00

- ppt, 발표


