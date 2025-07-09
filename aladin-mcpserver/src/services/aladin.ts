import axios from 'axios';
import { 
  ItemSearchParams, 
  ItemLookUpParams, 
  ItemSearchResponse, 
  ItemLookUpResponse,
  ItemListParams,
  ItemListResponse,
  ItemOffStoreListParams,
  ItemOffStoreListResponse
} from '../types.js';

// 알라딘 API 클래스
export class AladinService {
  private baseSearchUrl = 'http://www.aladin.co.kr/ttb/api/ItemSearch.aspx';
  private baseLookUpUrl = 'http://www.aladin.co.kr/ttb/api/ItemLookUp.aspx';
  private baseListUrl = 'http://www.aladin.co.kr/ttb/api/ItemList.aspx';
  private baseOffStoreListUrl = 'http://www.aladin.co.kr/ttb/api/ItemOffStoreList.aspx';
  private ttbKey: string;

  constructor(ttbKey: string) {
    this.ttbKey = ttbKey;
  }

  // 상품 검색 API
  async searchItems(params: Omit<ItemSearchParams, 'TTBKey'>): Promise<ItemSearchResponse> {
    try {
      const response = await axios.get(this.baseSearchUrl, {
        params: {
          ...params,
          TTBKey: this.ttbKey,
          Output: 'JS',
          Version: '20131101'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Aladin API search error:', error);
      throw new Error('Error occurred during product search.');
    }
  }

  // 상품 조회 API
  async lookupItem(params: Omit<ItemLookUpParams, 'TTBKey'>): Promise<ItemLookUpResponse> {
    try {
      const response = await axios.get(this.baseLookUpUrl, {
        params: {
          ...params,
          TTBKey: this.ttbKey,
          Output: 'JS',
          Version: '20131101'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Aladin API lookup error:', error);
      throw new Error('Error occurred during product lookup.');
    }
  }

  // 상품 리스트 API
  async getItemList(params: Omit<ItemListParams, 'TTBKey'>): Promise<ItemListResponse> {
    try {
      const response = await axios.get(this.baseListUrl, {
        params: {
          ...params,
          TTBKey: this.ttbKey,
          Output: 'JS',
          Version: '20131101'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Aladin API item list error:', error);
      throw new Error('Error occurred while getting item list.');
    }
  }

  // 중고상품 보유 매장 검색 API
  async getOffStoreList(params: Omit<ItemOffStoreListParams, 'TTBKey'>): Promise<ItemOffStoreListResponse> {
    try {
      const response = await axios.get(this.baseOffStoreListUrl, {
        params: {
          ...params,
          TTBKey: this.ttbKey,
          Output: 'JS',
          Version: '20131101'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Aladin API off store list error:', error);
      throw new Error('Error occurred while getting off store list.');
    }
  }

  // ISBN으로 책 정보 조회
  async getBookByISBN(isbn: string): Promise<ItemLookUpResponse> {
    return this.lookupItem({
      ItemId: isbn,
      ItemIdType: isbn.length === 10 ? 'ISBN' : 'ISBN13',
      Cover: 'Big',
      OptResult: 'ebookList,usedList,reviewList'
    });
  }

  // 제목으로 책 검색 (개선된 필터링 기능)
  async searchBooksByTitle(
    title: string, 
    page: number = 1, 
    maxResults: number = 10,
    options?: {
      outOfStockFilter?: boolean,
      recentPublishFilter?: number, // 0-60 개월 이내 출간 도서만 검색
      categoryId?: number
    }
  ): Promise<ItemSearchResponse> {
    return this.searchItems({
      Query: title,
      QueryType: 'Title',
      MaxResults: maxResults,
      Start: page,
      SearchTarget: 'Book',
      Cover: 'Big',
      Sort: 'Accuracy',
      ...(options?.outOfStockFilter ? { outofStockfilter: 1 } : {}),
      ...(options?.recentPublishFilter ? { RecentPublishFilter: options.recentPublishFilter } : {}),
      ...(options?.categoryId ? { CategoryId: options.categoryId } : {})
    });
  }

  // 저자로 책 검색 (개선된 필터링 기능)
  async searchBooksByAuthor(
    author: string, 
    page: number = 1, 
    maxResults: number = 10,
    options?: {
      outOfStockFilter?: boolean,
      recentPublishFilter?: number, // 0-60 개월 이내 출간 도서만 검색
      categoryId?: number
    }
  ): Promise<ItemSearchResponse> {
    return this.searchItems({
      Query: author,
      QueryType: 'Author',
      MaxResults: maxResults,
      Start: page,
      SearchTarget: 'Book',
      Cover: 'Big',
      Sort: 'Accuracy',
      ...(options?.outOfStockFilter ? { outofStockfilter: 1 } : {}),
      ...(options?.recentPublishFilter ? { RecentPublishFilter: options.recentPublishFilter } : {}),
      ...(options?.categoryId ? { CategoryId: options.categoryId } : {})
    });
  }

  // 출판사로 책 검색 (개선된 필터링 기능)
  async searchBooksByPublisher(
    publisher: string, 
    page: number = 1, 
    maxResults: number = 10,
    options?: {
      outOfStockFilter?: boolean,
      recentPublishFilter?: number, // 0-60 개월 이내 출간 도서만 검색
      categoryId?: number
    }
  ): Promise<ItemSearchResponse> {
    return this.searchItems({
      Query: publisher,
      QueryType: 'Publisher',
      MaxResults: maxResults,
      Start: page,
      SearchTarget: 'Book',
      Cover: 'Big',
      Sort: 'Accuracy',
      ...(options?.outOfStockFilter ? { outofStockfilter: 1 } : {}),
      ...(options?.recentPublishFilter ? { RecentPublishFilter: options.recentPublishFilter } : {}),
      ...(options?.categoryId ? { CategoryId: options.categoryId } : {})
    });
  }

  // 카테고리별 책 검색
  async searchBooksByCategory(categoryId: number, page: number = 1, maxResults: number = 10): Promise<ItemSearchResponse> {
    return this.searchItems({
      Query: '',
      QueryType: 'Keyword',
      CategoryId: categoryId,
      MaxResults: maxResults,
      Start: page,
      SearchTarget: 'Book',
      Cover: 'Big',
      Sort: 'SalesPoint'
    });
  }

  // 베스트셀러 목록 조회
  async getBestsellers(page: number = 1, maxResults: number = 10, categoryId?: number): Promise<ItemListResponse> {
    return this.getItemList({
      QueryType: 'Bestseller',
      MaxResults: maxResults,
      Start: page,
      SearchTarget: 'Book',
      Cover: 'Big',
      ...(categoryId ? { CategoryId: categoryId } : {})
    });
  }

  // 신간 목록 조회
  async getNewBooks(page: number = 1, maxResults: number = 10, categoryId?: number): Promise<ItemListResponse> {
    return this.getItemList({
      QueryType: 'ItemNewAll',
      MaxResults: maxResults,
      Start: page,
      SearchTarget: 'Book',
      Cover: 'Big',
      ...(categoryId ? { CategoryId: categoryId } : {})
    });
  }

  // 편집자 추천 목록 조회
  async getEditorChoiceBooks(page: number = 1, maxResults: number = 10, categoryId?: number): Promise<ItemListResponse> {
    return this.getItemList({
      QueryType: 'ItemEditorChoice',
      MaxResults: maxResults,
      Start: page,
      SearchTarget: 'Book',
      Cover: 'Big',
      ...(categoryId ? { CategoryId: categoryId } : {})
    });
  }

  // 블로거 추천 목록 조회
  async getBloggerBooks(page: number = 1, maxResults: number = 10, categoryId?: number): Promise<ItemListResponse> {
    return this.getItemList({
      QueryType: 'BlogBest',
      MaxResults: maxResults,
      Start: page,
      SearchTarget: 'Book',
      Cover: 'Big',
      ...(categoryId ? { CategoryId: categoryId } : {})
    });
  }

  // 중고 매장 보유 정보 조회
  async getOffStoreListByISBN(isbn: string): Promise<ItemOffStoreListResponse> {
    return this.getOffStoreList({
      ItemId: isbn,
      ItemIdType: isbn.length === 10 ? 'ISBN' : 'ISBN13'
    });
  }
} 