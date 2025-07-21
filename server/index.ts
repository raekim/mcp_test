import { Anthropic } from "@anthropic-ai/sdk";
import {
    MessageParam,
    Tool,
} from "@anthropic-ai/sdk/resources/messages/messages.mjs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import dotenv from "dotenv";
import express from 'express';
import cors from 'cors';

dotenv.config();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
}

class MCPClient {
    private mcp: Client;
    private anthropic: Anthropic;
    private transport: StdioClientTransport | null = null;
    private tools: Tool[] = [];

    constructor() {
        this.anthropic = new Anthropic({
            apiKey: ANTHROPIC_API_KEY,
        });
        this.mcp = new Client({ name: "aladin-mcpserver", version: "1.0.0" });
    }
    // methods will go here

    async connectToServer(serverScriptPath: string) {
        try {
            this.transport = new StdioClientTransport({
                command: process.execPath,
                args: [serverScriptPath],
            });
            await this.mcp.connect(this.transport);

            const toolsResult = await this.mcp.listTools();
            this.tools = toolsResult.tools.map((tool) => {
                return {
                    name: tool.name,
                    description: tool.description,
                    input_schema: tool.inputSchema,
                };
            });
            console.log(
                "Connected to server with tools:",
                this.tools.map(({ name }) => name)
            );
        } catch (e) {
            console.log("Failed to connect to MCP server: ", e);
            throw e;
        }
    }

    async processQuery(query: string) {
        const messages: MessageParam[] = [
            {
                role: "user",
                content: query,
            },
        ];

        const response = await this.anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1000,
            messages,
            tools: this.tools,
        });

        const finalText = [];

        for (const content of response.content) {
            if (content.type === "text") {
                finalText.push(content.text);
            } else if (content.type === "tool_use") {
                const toolName = content.name;
                const toolArgs = content.input as { [x: string]: unknown } | undefined;

                const result = await this.mcp.callTool({
                    name: toolName,
                    arguments: toolArgs,
                });
                finalText.push(
                    `[Calling tool ${toolName} with args ${JSON.stringify(toolArgs)}]`
                );

                messages.push({
                    role: "user",
                    content: result.content as string,
                });

                const response = await this.anthropic.messages.create({
                    model: "claude-3-5-sonnet-20241022",
                    max_tokens: 1000,
                    messages,
                });

                finalText.push(
                    response.content[0].type === "text" ? response.content[0].text : ""
                );
            }
        }

        return finalText.join("\n");
    }
}

function extractLastJSONArray(response: string) {
    const match = response.match(/\[\s*\{[\s\S]*\}\s*\]$/);

    if (match) {
        try {
            const json = JSON.parse(match[0]);
            console.log(json); // ✅ parsed array
            return json;
        } catch (e) {
            console.error('Invalid JSON array');
            return [];
        }
    }

    return [];
}

const app = express();
const PORT = process.env.SERVER_PORT;

const mcpClient = new MCPClient();
mcpClient.connectToServer(process.env.SERVER_SCRIPT_PATH || '')

app.use(cors());
app.get('/', (req: any, res: any) => {
    res.send('Hello, world! This is a response from your Express server.');
});
app.get('/books/dev', async (req: any, res: any) => {
    const response = await mcpClient.processQuery('컴퓨터 프로그래밍, 소프트웨어 개발에 대한 베스트셀러 추천해줘. 최대 10권까지, 책 리스트는 {\n' +
        '  id: number;\n' +
        '  title: string;\n' +
        '  author: string;\n' +
        '  price: string;\n' +
        '} 포맷으로 넘겨줘. 다른 설명이나 텍스트 없이 JSON 배열만 반환해. 없는 책 지어내지 말고 알라딘 api 에서 주는 정보만 알려줘' );
    const books = extractLastJSONArray(response);
    console.log(books);
    res.json({ data: books, });
});
app.get('/books/art', async (req: any, res: any) => {
    const response = await mcpClient.processQuery('아트, 디자이너 직군에 대한 베스트셀러 추천해줘. 최대 10권까지, 책 리스트는 {\n' +
        '  id: number;\n' +
        '  title: string;\n' +
        '  author: string;\n' +
        '  price: string;\n' +
        '} 포맷으로 넘겨줘. 다른 설명이나 텍스트 없이 JSON 배열만 반환해. 없는 책 지어내지 말고 알라딘 api 에서 주는 정보만 알려줘' );
    const books = extractLastJSONArray(response);
    console.log(books);
    res.json({ data: books, });
});
app.get('/books/design', async (req: any, res: any) => {
    const response = await mcpClient.processQuery('기획자, UX 에 대한 베스트셀러 추천해줘. 최대 10권까지, 책 리스트는 {\n' +
        '  id: number;\n' +
        '  title: string;\n' +
        '  author: string;\n' +
        '  price: string;\n' +
        '  img: string;\n' +
        '} 포맷으로 넘겨줘. 다른 설명이나 텍스트 없이 JSON 배열만 반환해. 없는 책 지어내지 말고 알라딘 api 에서 주는 정보만 알려줘.' );
    const books = extractLastJSONArray(response);
    console.log(books);
    res.json({ data: books, });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


// try {
//     mcpClient.connectToServer(process.env.SERVER_SCRIPT_PATH || '')
//     // const response = await mcpClient.processQuery('베스트셀러 추천해줘');
//     // console.log("\n" + response);
// } finally {
//     process.exit(0);
// }

