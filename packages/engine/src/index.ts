// Engine package — barrel exports
export { embedText, embedProduct, buildProductText, EMBEDDING_DIMENSION } from "./embedding";
export { indexProduct, indexAllProducts } from "./indexer";
export { semanticSearch, hybridSearch, filterSearch } from "./search";
export type { SearchOptions, SearchFilters, SearchResult } from "./search";
export { chatWithProducts, chatWithProductsSync } from "./chat";
export type { ChatMessage } from "./chat";
