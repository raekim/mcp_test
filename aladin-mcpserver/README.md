# 알라딘 책 API MCP 서버 ![NPM Version](https://img.shields.io/npm/v/aladin-mcp-server) ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

이 프로젝트는 알라딘 책 API를 Model Context Protocol(MCP) 서버로 제공합니다. MCP는 LLM(Large Language Model) 애플리케이션이 다양한 데이터 소스와 도구를 통합할 수 있는 표준 프로토콜입니다.

## 기능

- ISBN으로 책 정보 조회
- 제목, 저자, 출판사로 책 검색
- 카테고리별 책 검색
- 베스트셀러, 신간, 인기도서 목록 조회
- 편집자/블로거 추천 도서 목록 조회
- 중고 도서 보유 매장 검색
- 책 추천 프롬프트

## 설치

### 글로벌 설치

```bash
npm install -g aladin-mcp-server
```

### 프로젝트에 설치

```bash
npm install aladin-mcp-server
```

### 소스에서 설치

```bash
git clone https://github.com/tenacl/aladin-mcpserver.git
cd aladin-mcpserver
npm install
npm run build
```

## 설정

다음 두 가지 방법 중 하나로 알라딘 API 키를 설정할 수 있습니다:

### 1. 설정 파일 사용

`config/config.json` 파일을 생성하고 알라딘 API 키를 설정합니다:

```json
{
  "ttbkey": "your_aladin_ttbkey_here"
}
```

또는 다음 위치에 config.json 파일을 생성할 수 있습니다:
- `~/.config/aladinMCP/config.json` (사용자 홈 디렉토리)
- 현재 작업 디렉토리의 `config.json`

### 2. 환경 변수 사용

`ALADIN_TTB_KEY` 환경 변수에 API 키를 설정할 수 있습니다:

```bash
export ALADIN_TTB_KEY=your_aladin_ttbkey_here
```

알라딘 API 키는 [알라딘 개발자 센터](https://www.aladin.co.kr/ttb/apiguide.aspx)에서 발급받을 수 있습니다.

## 실행

### 글로벌 설치 후 실행

```bash
aladin-mcp-server
```

### 소스에서 실행

```bash
npm run build
npm start
```

## 개발

개발 모드로 실행하려면:

```bash
npm run dev
```

## Usage

### Claude Desktop과 함께 사용하기

Claude Desktop 앱에서 이 MCP 서버를 사용하는 가장 안정적인 방법은 로컬에서 소스 코드를 실행하는 것입니다:

```json
{
  "mcpServers": {
    "aladin": {
      "command": "node",
      "args": [
        "/절대/경로/aladin-mcpserver/dist/index.js"
      ],
      "env": {
        "ALADIN_TTB_KEY": "your_aladin_ttbkey_here"
      }
    }
  }
}
```

주의사항:
- `/절대/경로/aladin-mcpserver/dist/index.js`를 서버 파일의 실제 절대 경로로 변경하세요.
- Windows에서는 경로를 `C:\\경로\\aladin-mcpserver\\dist\\index.js` 형식으로 사용하세요.
- 환경 변수 대신 config.json 파일을 사용할 경우, 해당 파일이 이 README의 [설정](#설정) 섹션에 나열된 위치 중 하나에 생성되어 있는지 확인하세요.

**참고**: 다음 방법들도 시도해볼 수 있으나, 환경에 따라 작동하지 않을 수 있습니다.

1. 패키지를 전역으로 설치한 후 직접 실행:

```bash
npm install -g aladin-mcp-server
```

```json
{
  "mcpServers": {
    "aladin": {
      "command": "aladin-mcp-server",
      "env": {
        "ALADIN_TTB_KEY": "your_aladin_ttbkey_here"
      }
    }
  }
}
```

2. Node require 방식:

```json
{
  "mcpServers": {
    "aladin": {
      "command": "node",
      "args": [
        "-e",
        "require('aladin-mcp-server')"
      ],
      "env": {
        "ALADIN_TTB_KEY": "your_aladin_ttbkey_here"
      }
    }
  }
}
```

## MCP 리소스 및 도구

### 리소스

- `book://{isbn}` - ISBN으로 책 정보 조회

### 도구

- `search-books` - 책 검색
  - 매개변수:
    - `query`: 검색어
    - `searchType`: 검색 유형 (title, author, publisher)
    - `page`: 페이지 번호
    - `maxResults`: 페이지당 결과 개수
    - `excludeOutOfStock`: 품절/절판 상품 제외 여부 (true/false)
    - `recentMonths`: 최근 N개월 출간 도서로 제한 (0-60)
    - `categoryId`: 카테고리 ID로 제한

- `get-book-details` - ISBN으로 책 상세 정보 조회
  - 매개변수:
    - `isbn`: 국제 표준 도서 번호

- `search-books-by-publisher` - 출판사로 책 검색
  - 매개변수:
    - `publisher`: 출판사 이름
    - `page`: 페이지 번호
    - `maxResults`: 페이지당 결과 개수

- `search-books-by-category` - 카테고리로 책 검색
  - 매개변수:
    - `categoryId`: 카테고리 ID
    - `page`: 페이지 번호
    - `maxResults`: 페이지당 결과 개수

- `get-bestsellers` - 베스트셀러 목록 조회
  - 매개변수:
    - `categoryId`: (선택사항) 카테고리 ID
    - `page`: 페이지 번호
    - `maxResults`: 페이지당 결과 개수

- `get-new-books` - 신간 목록 조회
  - 매개변수:
    - `categoryId`: (선택사항) 카테고리 ID
    - `page`: 페이지 번호
    - `maxResults`: 페이지당 결과 개수

- `get-editor-choice-books` - 편집자 추천 도서 목록 조회
  - 매개변수:
    - `categoryId`: (선택사항) 카테고리 ID
    - `page`: 페이지 번호
    - `maxResults`: 페이지당 결과 개수

- `get-blogger-books` - 블로거 추천 도서 목록 조회
  - 매개변수:
    - `categoryId`: (선택사항) 카테고리 ID
    - `page`: 페이지 번호
    - `maxResults`: 페이지당 결과 개수

- `get-used-book-stores` - 중고 도서 보유 매장 검색
  - 매개변수:
    - `isbn`: 국제 표준 도서 번호

- `get-book-categories` - 책 카테고리 목록 조회
  - 매개변수:
    - `parentCategoryId`: (선택사항) 상위 카테고리 ID (지정하지 않으면 최상위 카테고리 목록 반환)

- `get-popular-books` - 판매지수 기준 인기 도서 검색
  - 매개변수:
    - `categoryId`: (선택사항) 카테고리 ID
    - `page`: 페이지 번호
    - `maxResults`: 페이지당 결과 개수

### 프롬프트

- `book-recommendation` - 책 추천 프롬프트

## API 문서

알라딘 API에 대한 자세한 정보는 [알라딘 API 가이드](https://www.aladin.co.kr/ttb/apiguide.aspx)를 참조하세요.

## 기여

이슈와 풀 리퀘스트는 [GitHub 저장소](https://github.com/tenacl/aladin-mcpserver)에서 환영합니다.

## 개발 환경

- Node.js (>=16.0.0)
- TypeScript
- Model Context Protocol SDK

## 라이센스

[MIT](LICENSE) 