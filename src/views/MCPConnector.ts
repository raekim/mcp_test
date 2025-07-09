import {Anthropic} from "@anthropic-ai/sdk";

interface Book {
    id: number;
    title: string;
    author: string;
    price: string;
    isbn?: string;
    category?: string;
    publishedYear?: number;
}

interface Avatar {
    id: number;
    name: string;
    image: string;
}

class MCPConnector {
    private baseUrl: string;
    private apiKey?: string;

    constructor(baseUrl: string, apiKey?: string) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    /**
     * Fetches books for a specific avatar/character
     * @param avatarName - The name of the avatar (e.g., "개발자", "기획자", "디자이너")
     * @returns Promise<Book[]> - Array of books for the character
     */
    async getBooksByAvatar(avatarName: string): Promise<Book[]> {
        try {
            // TODO: Implement API call to server
            // const response = await fetch(`${this.baseUrl}/books/${avatarName}`, {
            //   headers: {
            //     'Authorization': `Bearer ${this.apiKey}`,
            //     'Content-Type': 'application/json'
            //   }
            // });
            //
            // if (!response.ok) {
            //   throw new Error(`Failed to fetch books: ${response.statusText}`);
            // }
            //
            // const books: Book[] = await response.json();
            // return books;

            // Placeholder return for now
            return [];
        } catch (error) {
            console.error('Error fetching books:', error);
            throw error;
        }
    }

    /**
     * Searches books across all categories
     * @param query - Search query string
     * @returns Promise<Book[]> - Array of matching books
     */
    async searchBooks(query: string): Promise<Book[]> {
        try {
            // TODO: Implement API call to server
            // const response = await fetch(`${this.baseUrl}/books/search?q=${encodeURIComponent(query)}`, {
            //   headers: {
            //     'Authorization': `Bearer ${this.apiKey}`,
            //     'Content-Type': 'application/json'
            //   }
            // });
            //
            // if (!response.ok) {
            //   throw new Error(`Failed to search books: ${response.statusText}`);
            // }
            //
            // const books: Book[] = await response.json();
            // return books;

            // Placeholder return for now
            return [];
        } catch (error) {
            console.error('Error searching books:', error);
            throw error;
        }
    }

    /**
     * Updates the API configuration
     * @param baseUrl - New base URL for the API
     * @param apiKey - New API key (optional)
     */
    updateConfig(baseUrl: string, apiKey?: string): void {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    /**
     * Gets the current API configuration
     * @returns Object with current baseUrl and whether apiKey is set
     */
    getConfig(): { baseUrl: string; hasApiKey: boolean } {
        return {
            baseUrl: this.baseUrl,
            hasApiKey: !!this.apiKey
        };
    }
}

// Export singleton instance
export const mcpConnector = new MCPConnector(
    import.meta.env.VUE_APP_API_BASE_URL || 'http://localhost:3000/api',
    import.meta.env.VUE_APP_API_KEY
);

// Export class for creating custom instances
export { MCPConnector };
export type { Book, Avatar };
