#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { AladinService } from './services/aladin.js';
import { loadConfig } from './utils/config.js';
import { bookCategories } from './data/categories.js';

async function main() {
  try {
    // 설정 로드
    const config = loadConfig();

    // 알라딘 서비스 초기화
    const aladinService = new AladinService(config.ttbkey);

    // MCP 서버 생성
    const server = new McpServer({
      name: 'Aladin Book API',
      version: '1.0.0'
    });

    // ISBN으로 책 조회 리소스
    server.resource(
      'book-by-isbn',
      'book://{isbn}',
      async (uri) => {
        // URI에서 ISBN 파라미터 추출
        const parts = uri.href.split('/');
        const isbn = parts[parts.length - 1];

        const response = await aladinService.getBookByISBN(isbn);
        if (!response.item || response.item.length === 0) {
          throw new Error(`Book with ISBN ${isbn} not found.`);
        }

        const book = response.item[0];
        return {
          contents: [{
            uri: uri.href,
            text: `제목: ${book.title}
저자: ${book.author}
출판사: ${book.publisher}
출판일: ${book.pubDate}
ISBN: ${book.isbn13}
가격: ${book.priceSales}원 (정가: ${book.priceStandard}원)
설명: ${book.description}
${book.subInfo?.toc ? `\n목차:\n${book.subInfo.toc}` : ''}
알라딘 링크: ${book.link}`
          }]
        };
      }
    );

    // 책 검색 툴
    server.tool(
      'search-books',
      {
        query: z.string().min(1, '검색어를 입력해주세요.'),
        searchType: z.enum(['title', 'author', 'publisher']).default('title'),
        page: z.number().positive().default(1),
        maxResults: z.number().min(1).max(50).default(10),
        excludeOutOfStock: z.boolean().default(false),
        recentMonths: z.number().int().min(0).max(60).optional(),
        categoryId: z.number().int().positive().optional()
      },
      async ({ query, searchType, page, maxResults, excludeOutOfStock, recentMonths, categoryId }) => {
        let response;

        const options = {
          outOfStockFilter: excludeOutOfStock,
          recentPublishFilter: recentMonths,
          categoryId: categoryId
        };

        switch (searchType) {
          case 'title':
            response = await aladinService.searchBooksByTitle(query, page, maxResults, options);
            break;
          case 'author':
            response = await aladinService.searchBooksByAuthor(query, page, maxResults, options);
            break;
          case 'publisher':
            response = await aladinService.searchBooksByPublisher(query, page, maxResults, options);
            break;
          default:
            throw new Error('Unsupported search type.');
        }

        if (!response.item || response.item.length === 0) {
          return {
            content: [{
              type: 'text',
              text: `No search results for "${query}".`
            }]
          };
        }

        const resultText = response.item.map((book, idx) => {
          return `${idx + 1}. 제목: ${book.title}
   저자: ${book.author}
   출판사: ${book.publisher} | 출판일: ${book.pubDate}
   ISBN: ${book.isbn13}
   가격: ${book.priceSales}원 (정가: ${book.priceStandard}원)
   알라딘 링크: ${book.link}
`;
        }).join('\n');

        let infoText = `"${query}" 검색 결과`;

        if (categoryId && response.searchCategoryName) {
          infoText += ` (카테고리: ${response.searchCategoryName})`;
        }

        if (excludeOutOfStock) {
          infoText += ' (품절/절판 제외)';
        }

        if (recentMonths) {
          infoText += ` (최근 ${recentMonths}개월 출간)`;
        }

        infoText += ` (총 ${response.totalResults}개 중 ${page}페이지)`;

        return {
          content: [{
            type: 'text',
            text: `${infoText}\n\n${resultText}`
          }]
        };
      }
    );

    // ISBN으로 책 상세 정보 조회 툴
    server.tool(
      'get-book-details',
      {
        isbn: z.string().min(10, 'ISBN을 10자리 이상 입력해주세요.')
      },
      async ({ isbn }) => {
        const response = await aladinService.getBookByISBN(isbn);

        if (!response.item || response.item.length === 0) {
          return {
            content: [{
              type: 'text',
              text: `ISBN ${isbn}에 해당하는 책을 찾을 수 없습니다.`
            }],
            isError: true
          };
        }

        const book = response.item[0];
        const authors = book.subInfo?.authors?.map(a =>
          `${a.authorName} (${a.authorTypeDesc}): ${a.authorInfo}`
        ).join('\n') || '';

        let details = `# ${book.title}

## 기본 정보
- 저자: ${book.author}
- 출판사: ${book.publisher}
- 출판일: ${book.pubDate}
- ISBN: ${book.isbn13}
- 가격: ${book.priceSales}원 (정가: ${book.priceStandard}원)
- 판매지수: ${book.salesPoint || '정보 없음'}
- 별점: ${book.customerReviewRank ? (book.customerReviewRank / 2).toFixed(1) + '/5.0' : '정보 없음'}

## 설명
${book.description}
`;

        if (authors) {
          details += `\n## 저자 정보\n${authors}\n`;
        }

        if (book.subInfo?.toc) {
          details += `\n## 목차\n${book.subInfo.toc}\n`;
        }

        details += `\n알라딘 링크: ${book.link}`;

        return {
          content: [{ type: 'text', text: details }]
        };
      }
    );

    // 책 추천 프롬프트
    server.prompt(
      'book-recommendation',
      "책 추천 프롬프트",
      () => {
        const promptText = `저는 독서를 좋아하는 사용자입니다. 저의 취향과 상황에 맞는 책을 추천해주세요. 추천할 때는 제목, 저자, 간단한 설명을 포함해 주세요.`;

        return {
          messages: [{
            role: 'user',
            content: {
              type: 'text',
              text: promptText
            }
          }]
        };
      }
    );

    // 출판사 검색 도구
    server.tool(
      'search-books-by-publisher',
      {
        publisher: z.string().min(1, 'Publisher name is required.'),
        page: z.number().positive().default(1),
        maxResults: z.number().min(1).max(50).default(10)
      },
      async ({ publisher, page, maxResults }) => {
        const response = await aladinService.searchBooksByPublisher(publisher, page, maxResults);

        if (!response.item || response.item.length === 0) {
          return {
            content: [{
              type: 'text',
              text: `No books found for publisher "${publisher}".`
            }]
          };
        }

        const resultText = response.item.map((book, idx) => {
          return `${idx + 1}. Title: ${book.title}
   Author: ${book.author}
   Publisher: ${book.publisher} | Publication Date: ${book.pubDate}
   ISBN: ${book.isbn13}
   Price: ${book.priceSales}₩ (List Price: ${book.priceStandard}₩)
   Aladin Link: ${book.link}
`;
        }).join('\n');

        return {
          content: [{
            type: 'text',
            text: `Books from publisher "${publisher}" (Page ${page} of ${Math.ceil(response.totalResults / maxResults)}, Total: ${response.totalResults})\n\n${resultText}`
          }]
        };
      }
    );

    // 카테고리 검색 도구
    server.tool(
      'search-books-by-category',
      {
        categoryId: z.number().int().positive('Category ID must be positive.'),
        page: z.number().positive().default(1),
        maxResults: z.number().min(1).max(50).default(10)
      },
      async ({ categoryId, page, maxResults }) => {
        const response = await aladinService.searchBooksByCategory(categoryId, page, maxResults);

        if (!response.item || response.item.length === 0) {
          return {
            content: [{
              type: 'text',
              text: `No books found for category ID ${categoryId}.`
            }]
          };
        }

        const resultText = response.item.map((book, idx) => {
          return `${idx + 1}. Title: ${book.title}
   Author: ${book.author}
   Publisher: ${book.publisher} | Publication Date: ${book.pubDate}
   ISBN: ${book.isbn13}
   Price: ${book.priceSales}₩ (List Price: ${book.priceStandard}₩)
   Aladin Link: ${book.link}
`;
        }).join('\n');

        const categoryName = response.searchCategoryName || `ID ${categoryId}`;

        return {
          content: [{
            type: 'text',
            text: `Books in category "${categoryName}" (Page ${page} of ${Math.ceil(response.totalResults / maxResults)}, Total: ${response.totalResults})\n\n${resultText}`
          }]
        };
      }
    );

    // 베스트셀러 목록 조회 도구
    server.tool(
      'get-bestsellers',
      {
        categoryId: z.number().int().nonnegative().optional(),
        page: z.number().positive().default(1),
        maxResults: z.number().min(1).max(50).default(10)
      },
      async ({ categoryId, page, maxResults }) => {
        const response = await aladinService.getBestsellers(page, maxResults, categoryId);

        if (!response.item || response.item.length === 0) {
          return {
            content: [{
              type: 'text',
              text: categoryId
                ? `No bestsellers found for category ID ${categoryId}.`
                : 'No bestsellers found.'
            }]
          };
        }

        const resultText = response.item.map((book, idx) => {
          return `${idx + 1}. Title: ${book.title}
   Author: ${book.author}
   Publisher: ${book.publisher} | Publication Date: ${book.pubDate}
   ISBN: ${book.isbn13}
   Price: ${book.priceSales}₩ (List Price: ${book.priceStandard}₩)
   Aladin Link: ${book.link}
`;
        }).join('\n');

        const categoryText = response.searchCategoryName
          ? ` in category "${response.searchCategoryName}"`
          : '';

        return {
          content: [{
            type: 'text',
            text: `Bestsellers${categoryText} (Page ${page} of ${Math.ceil(response.totalResults / maxResults)}, Total: ${response.totalResults})\n\n${resultText}`
          }]
        };
      }
    );

    // 신간 목록 조회 도구
    server.tool(
      'get-new-books',
      {
        categoryId: z.number().int().nonnegative().optional(),
        page: z.number().positive().default(1),
        maxResults: z.number().min(1).max(50).default(10)
      },
      async ({ categoryId, page, maxResults }) => {
        const response = await aladinService.getNewBooks(page, maxResults, categoryId);

        if (!response.item || response.item.length === 0) {
          return {
            content: [{
              type: 'text',
              text: categoryId
                ? `No new books found for category ID ${categoryId}.`
                : 'No new books found.'
            }]
          };
        }

        const resultText = response.item.map((book, idx) => {
          return `${idx + 1}. Title: ${book.title}
   Author: ${book.author}
   Publisher: ${book.publisher} | Publication Date: ${book.pubDate}
   ISBN: ${book.isbn13}
   Price: ${book.priceSales}₩ (List Price: ${book.priceStandard}₩)
   Aladin Link: ${book.link}
`;
        }).join('\n');

        const categoryText = response.searchCategoryName
          ? ` in category "${response.searchCategoryName}"`
          : '';

        return {
          content: [{
            type: 'text',
            text: `New Books${categoryText} (Page ${page} of ${Math.ceil(response.totalResults / maxResults)}, Total: ${response.totalResults})\n\n${resultText}`
          }]
        };
      }
    );

    // 편집자 추천 목록 조회 도구
    server.tool(
      'get-editor-choice-books',
      {
        categoryId: z.number().int().nonnegative().optional(),
        page: z.number().positive().default(1),
        maxResults: z.number().min(1).max(50).default(10)
      },
      async ({ categoryId, page, maxResults }) => {
        const response = await aladinService.getEditorChoiceBooks(page, maxResults, categoryId);

        if (!response.item || response.item.length === 0) {
          return {
            content: [{
              type: 'text',
              text: categoryId
                ? `No editor's choice books found for category ID ${categoryId}.`
                : 'No editor\'s choice books found.'
            }]
          };
        }

        const resultText = response.item.map((book, idx) => {
          return `${idx + 1}. Title: ${book.title}
   Author: ${book.author}
   Publisher: ${book.publisher} | Publication Date: ${book.pubDate}
   ISBN: ${book.isbn13}
   Price: ${book.priceSales}₩ (List Price: ${book.priceStandard}₩)
   Aladin Link: ${book.link}
`;
        }).join('\n');

        const categoryText = response.searchCategoryName
          ? ` in category "${response.searchCategoryName}"`
          : '';

        return {
          content: [{
            type: 'text',
            text: `Editor's Choice Books${categoryText} (Page ${page} of ${Math.ceil(response.totalResults / maxResults)}, Total: ${response.totalResults})\n\n${resultText}`
          }]
        };
      }
    );

    // 중고상품 보유 매장 검색 도구
    server.tool(
      'get-used-book-stores',
      {
        isbn: z.string().min(10, 'ISBN must be at least 10 characters.')
      },
      async ({ isbn }) => {
        const response = await aladinService.getOffStoreListByISBN(isbn);

        if (!response.itemOffStoreList || response.itemOffStoreList.length === 0) {
          return {
            content: [{
              type: 'text',
              text: `No stores with used books found for ISBN ${isbn}.`
            }]
          };
        }

        const resultText = response.itemOffStoreList.map((store, idx) => {
          const hasStock = store.hasStock === 1 ? '✓' : '✗';
          const priceInfo = store.minPrice
            ? `Price: ${store.minPrice}₩${store.maxPrice && store.maxPrice !== store.minPrice ? ` ~ ${store.maxPrice}₩` : ''}`
            : 'Price: Not available';
          const location = store.location ? `Location: ${store.location}` : '';

          return `${idx + 1}. ${store.offName} [${hasStock}]
   ${priceInfo}
   ${location}
   Store Link: ${store.link}
`;
        }).join('\n');

        return {
          content: [{
            type: 'text',
            text: `Used Book Stores for ISBN ${isbn} (Total: ${response.itemOffStoreList.length})\n\n${resultText}`
          }]
        };
      }
    );

    // 블로거 추천 목록 조회 도구
    server.tool(
      'get-blogger-books',
      {
        categoryId: z.number().int().nonnegative().optional(),
        page: z.number().positive().default(1),
        maxResults: z.number().min(1).max(50).default(10)
      },
      async ({ categoryId, page, maxResults }) => {
        const response = await aladinService.getBloggerBooks(page, maxResults, categoryId);

        if (!response.item || response.item.length === 0) {
          return {
            content: [{
              type: 'text',
              text: categoryId
                ? `No blogger recommended books found for category ID ${categoryId}.`
                : 'No blogger recommended books found.'
            }]
          };
        }

        const resultText = response.item.map((book, idx) => {
          return `${idx + 1}. Title: ${book.title}
   Author: ${book.author}
   Publisher: ${book.publisher} | Publication Date: ${book.pubDate}
   ISBN: ${book.isbn13}
   Price: ${book.priceSales}₩ (List Price: ${book.priceStandard}₩)
   Aladin Link: ${book.link}
`;
        }).join('\n');

        const categoryText = response.searchCategoryName
          ? ` in category "${response.searchCategoryName}"`
          : '';

        return {
          content: [{
            type: 'text',
            text: `Blogger Recommended Books${categoryText} (Page ${page} of ${Math.ceil(response.totalResults / maxResults)}, Total: ${response.totalResults})\n\n${resultText}`
          }]
        };
      }
    );

    // 카테고리 목록 조회 도구
    server.tool(
      'get-book-categories',
      {
        parentCategoryId: z.number().int().nonnegative().optional()
      },
      async ({ parentCategoryId }) => {
        if (parentCategoryId === undefined) {
          // 최상위 카테고리 목록 반환
          const mainCategories = bookCategories.map(cat => ({
            id: cat.id,
            name: cat.name,
            hasSubCategories: !!cat.subCategories && cat.subCategories.length > 0
          }));

          return {
            content: [{
              type: 'text',
              text: `Book Categories:\n\n${mainCategories.map(c => 
                `- ${c.name} (ID: ${c.id})${c.hasSubCategories ? ' *' : ''}`
              ).join('\n')}\n\n* Has subcategories. Use the category ID to see subcategories.`
            }]
          };
        } else {
          // 해당 ID의 하위 카테고리 찾기
          const parentCategory = bookCategories.find(cat => cat.id === parentCategoryId);

          if (!parentCategory) {
            return {
              content: [{
                type: 'text',
                text: `Category with ID ${parentCategoryId} not found.`
              }],
              isError: true
            };
          }

          if (!parentCategory.subCategories || parentCategory.subCategories.length === 0) {
            return {
              content: [{
                type: 'text',
                text: `Category "${parentCategory.name}" has no subcategories.`
              }]
            };
          }

          return {
            content: [{
              type: 'text',
              text: `Subcategories of "${parentCategory.name}":\n\n${parentCategory.subCategories.map(c => 
                `- ${c.name} (ID: ${c.id})`
              ).join('\n')}`
            }]
          };
        }
      }
    );

    // 인기 도서 검색 도구 (판매지수 기준)
    server.tool(
      'get-popular-books',
      {
        categoryId: z.number().int().nonnegative().optional(),
        page: z.number().positive().default(1),
        maxResults: z.number().min(1).max(50).default(10)
      },
      async ({ categoryId, page, maxResults }) => {
        // 판매지수 기준으로 정렬된 책 검색
        const response = await aladinService.searchItems({
          Query: '',
          QueryType: 'Keyword',
          MaxResults: maxResults,
          Start: page,
          SearchTarget: 'Book',
          Cover: 'Big',
          Sort: 'SalesPoint', // 판매지수 기준 정렬
          ...(categoryId ? { CategoryId: categoryId } : {})
        });

        if (!response.item || response.item.length === 0) {
          return {
            content: [{
              type: 'text',
              text: categoryId
                ? `해당 카테고리(ID: ${categoryId})의 인기 도서를 찾을 수 없습니다.`
                : '인기 도서를 찾을 수 없습니다.'
            }]
          };
        }

        const resultText = response.item.map((book, idx) => {
          return `${idx + 1}. ${book.title}
   저자: ${book.author}
   출판사: ${book.publisher} | 출판일: ${book.pubDate}
   ISBN: ${book.isbn13}
   가격: ${book.priceSales}원 (정가: ${book.priceStandard}원)
   판매지수: ${book.salesPoint || '정보 없음'}
   별점: ${book.customerReviewRank ? (book.customerReviewRank / 2).toFixed(1) + '/5.0' : '정보 없음'}
   알라딘 링크: ${book.link}
`;
        }).join('\n');

        const categoryText = response.searchCategoryName
          ? ` (카테고리: ${response.searchCategoryName})`
          : '';

        return {
          content: [{
            type: 'text',
            text: `인기 도서${categoryText} - 판매지수 기준 정렬 (${page}페이지, 총 ${response.totalResults}개)\n\n${resultText}`
          }]
        };
      }
    );

    // 스타디오 트랜스포트로 연결
    const transport = new StdioServerTransport();
    console.error('Starting Aladin MCP server...');
    await server.connect(transport);

  } catch (error) {
    console.error('서버 시작 중 오류 발생:', error);
    process.exit(1);
  }
}

main();
