// 알라딘 API 요청 타입
export interface AladinApiRequestParams {
  TTBKey: string;
  // 공통 매개변수
  Output?: 'JS' | 'XML';
  Version?: string;
  Cover?: 'Big' | 'MidBig' | 'Mid' | 'Small' | 'Mini' | 'None';
  includeKey?: 0 | 1;
}

// 상품 검색 API 요청 타입
export interface ItemSearchParams extends AladinApiRequestParams {
  Query: string;
  QueryType?: 'Keyword' | 'Title' | 'Author' | 'Publisher';
  SearchTarget?: 'Book' | 'Foreign' | 'Music' | 'DVD' | 'Used' | 'eBook' | 'All';
  Start?: number;
  MaxResults?: number;
  Sort?: 'Accuracy' | 'PublishTime' | 'Title' | 'SalesPoint' | 'CustomerRating' | 'MyReviewCount';
  CategoryId?: number;
  outofStockfilter?: 0 | 1;
  RecentPublishFilter?: number;
  OptResult?: string;
}

// 상품 조회 API 요청 타입
export interface ItemLookUpParams extends AladinApiRequestParams {
  ItemId: string;
  ItemIdType?: 'ISBN' | 'ISBN13' | 'ItemId';
  OptResult?: string;
}

// 상품 리스트 API 요청 타입
export interface ItemListParams extends AladinApiRequestParams {
  QueryType: 'ItemNewAll' | 'ItemNewSpecial' | 'ItemEditorChoice' | 'Bestseller' | 'BlogBest';
  SearchTarget?: 'Book' | 'Foreign' | 'Music' | 'DVD' | 'Used' | 'eBook' | 'All';
  Start?: number;
  MaxResults?: number;
  CategoryId?: number;
  outofStockfilter?: 0 | 1;
  Year?: number;
  Month?: number;
  Week?: number;
  OptResult?: string;
}

// 중고상품 보유 매장 검색 API 요청 타입
export interface ItemOffStoreListParams extends AladinApiRequestParams {
  ItemId: string;
  ItemIdType?: 'ISBN' | 'ISBN13' | 'ItemId';
}

// 책 정보 타입
export interface BookItem {
  title: string;
  link: string;
  author: string;
  pubDate: string;
  description: string;
  isbn: string;
  isbn13: string;
  priceSales: number;
  priceStandard: number;
  mallType: string;
  stockStatus: string;
  mileage: number;
  cover: string;
  publisher: string;
  salesPoint: number;
  adult: boolean;
  fixedPrice: boolean;
  customerReviewRank: number;
  bestRank?: number;
  subInfo?: {
    subTitle?: string;
    originalTitle?: string;
    itemPage?: number;
    toc?: string;
    ratingInfo?: {
      ratingScore: number;
      ratingCount: number;
      commentReviewCount: number;
      myReviewCount: number;
    };
    authors?: Array<{
      authorId: number;
      authorName: string;
      authorType: string;
      authorTypeDesc: string;
      authorInfo: string;
      authorInfoLink: string;
    }>;
  };
}

// 상품 검색 API 응답 타입
export interface ItemSearchResponse {
  version: string;
  title: string;
  link: string;
  pubDate: string;
  totalResults: number;
  startIndex: number;
  itemsPerPage: number;
  query: string;
  searchCategoryId?: number;
  searchCategoryName?: string;
  item: BookItem[];
}

// 상품 조회 API 응답 타입
export interface ItemLookUpResponse {
  version: string;
  title: string;
  link: string;
  pubDate: string;
  item: BookItem[];
}

// 상품 리스트 API 응답 타입
export interface ItemListResponse {
  version: string;
  title: string;
  link: string;
  pubDate: string;
  totalResults: number;
  startIndex: number;
  itemsPerPage: number;
  searchCategoryId?: number;
  searchCategoryName?: string;
  item: BookItem[];
}

// 중고 매장 정보 타입
export interface OffStoreItem {
  offCode: string;
  offName: string;
  link: string;
  hasStock?: number;
  maxPrice?: number;
  minPrice?: number;
  location?: string;
}

// 중고상품 보유 매장 검색 API 응답 타입
export interface ItemOffStoreListResponse {
  version: string;
  link: string;
  pubDate: string;
  query: string;
  itemOffStoreList: OffStoreItem[];
}

// 설정 파일 타입
export interface Config {
  ttbkey: string;
  // 기타 설정이 필요한 경우 추가
} 